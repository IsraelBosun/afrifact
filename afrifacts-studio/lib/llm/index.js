/**
 * Every model call in the studio goes through this file.
 *
 * CLAUDE.md §7: the provider is not fixed. This started on Gemini and
 * moved to DeepSeek by rewriting one function — the rest of the pipeline
 * only knows `complete()`, and no other file changed. That is why there
 * is no SDK here and why the prompts live as plain .txt beside this file
 * rather than as template literals wired into a client library.
 *
 * The API key is read from .env in this project only. It must never be
 * copied into afrifacts/ — anything bundled into the app can be pulled
 * back out of the APK.
 */

import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

import { ENV_PATH, PROMPTS_DIR } from '../paths.js';

/**
 * Which model to use for which job.
 *
 * Extraction wants a model that quotes tightly and cheaply — it runs over
 * every page. Enrichment writes prose a person will read, so it gets the
 * better model. Named rather than inlined so the choice is visible.
 */
export const MODELS = {
  extract: 'deepseek-chat',
  enrich: 'deepseek-chat',
  /**
   * Image matching reads short descriptions and picks from a list, which
   * is the cheapest job in the pipeline. It also has the lowest stakes:
   * the licence filter is code, and a person confirms every match.
   */
  pickImage: 'deepseek-chat',
  /**
   * Finding sources reads titles and snippets and answers with a list of
   * ids. It is the only model call a person waits on with a spinner, so
   * it is the one place latency is part of the choice, not just cost.
   */
  findSources: 'deepseek-chat',
};

/**
 * @typedef {object} CompleteOptions
 * @property {string} model
 * @property {string} prompt
 * @property {boolean} [json] Ask for JSON back. The pipeline always does.
 * @property {number} [temperature] 0 for extraction: we want the same
 *   passage every run, not variety.
 * @property {AbortSignal} [signal] Stops the request in flight. A stage
 *   run from the studio passes its job's signal, so pressing Stop does
 *   not sit through a model call that is already paid for but not yet
 *   answered.
 */

/**
 * Minimal .env reader.
 *
 * Node has --env-file, but this needs to work identically whether the
 * caller is a CLI script or a Next route handler, and a dependency in the
 * project that holds the keys is a dependency worth avoiding. Handles
 * KEY=value, comments, and surrounding quotes. Nothing else.
 *
 * @type {Record<string, string> | null}
 */
let envCache = null;

/** @returns {Promise<Record<string, string>>} */
async function readEnv() {
  if (envCache) return envCache;
  /** @type {Record<string, string>} */
  const out = {};
  try {
    const raw = await readFile(ENV_PATH, 'utf8');
    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (trimmed.length === 0 || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim();
      const quoted =
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"));
      if (quoted) value = value.slice(1, -1);
      if (key.length > 0) out[key] = value;
    }
  } catch {
    // No .env is a real state, not an error. apiKey() gives the message.
  }
  envCache = out;
  return out;
}

/**
 * Any value from the studio's `.env`, by the same reader.
 *
 * The image search needs Google credentials and this file already owns
 * the only `.env` parser in the project. A second one would be a second
 * place for a key to be read from, and keys live here or nowhere.
 *
 * @param {string} name
 * @returns {Promise<string>}
 */
export async function envValue(name) {
  const env = await readEnv();
  return String(process.env[name] ?? env[name] ?? '').trim();
}

/** @returns {Promise<string>} */
async function apiKey() {
  const env = await readEnv();
  const key = process.env.DEEPSEEK_API_KEY ?? env.DEEPSEEK_API_KEY ?? '';
  if (key.trim().length === 0) {
    throw new Error('No DEEPSEEK_API_KEY. Put it in afrifacts-studio/.env — never in afrifacts/.');
  }
  return key.trim();
}

/**
 * True if a key is configured, without throwing.
 *
 * The UI needs to say "no key" as a page state rather than a stack trace,
 * and it needs to say it before offering a button that spends money.
 *
 * @returns {Promise<boolean>}
 */
export async function hasApiKey() {
  try {
    await apiKey();
    return true;
  } catch {
    return false;
  }
}

/**
 * DeepSeek speaks the OpenAI chat-completions format.
 *
 * The whole point of this file is that a provider swap touches one
 * function. Moving from Gemini to DeepSeek changed the URL, the request
 * body and the response path, and nothing outside these lines.
 *
 * @param {CompleteOptions} opts
 * @returns {Promise<string>}
 */
async function callDeepSeek(opts) {
  const key = await apiKey();

  const res = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    signal: opts.signal,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: opts.model,
      messages: [{ role: 'user', content: opts.prompt }],
      temperature: opts.temperature ?? 0,
      // The extraction prompt sends a whole article and asks for every
      // fact in it, so the reply can be long. The default cap truncates
      // mid-JSON, which reads as a parse error rather than a short answer.
      max_tokens: 8000,
      ...(opts.json ? { response_format: { type: 'json_object' } } : {}),
    }),
  });

  const body = await res.json();
  if (!res.ok) {
    throw new Error(`${opts.model} returned ${res.status}: ${body?.error?.message ?? 'no message'}`);
  }

  const text = body?.choices?.[0]?.message?.content;
  if (typeof text !== 'string' || text.trim().length === 0) {
    throw new Error(`${opts.model} returned no text.`);
  }
  return text;
}

/**
 * Transient failures: the provider is busy or we are going too fast.
 *
 * A thirty-document run takes minutes and a 503 in the middle of it should
 * cost a pause, not the run. Anything else — a bad key, a bad model name,
 * a malformed request — is thrown immediately, since retrying it would
 * only be slower.
 */
const TRANSIENT = [429, 500, 502, 503, 504];

/** @param {unknown} error */
function isAbort(error) {
  return error?.name === 'AbortError' || error?.name === 'TimeoutError';
}

/** @param {unknown} error */
function isTransient(error) {
  const message = error instanceof Error ? error.message : String(error);
  return TRANSIENT.some((code) => message.includes(` returned ${code}:`));
}

/** @param {number} ms */
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Send a prompt, get text back. The whole provider surface.
 *
 * `onProgress` exists so a retry is visible in the browser as well as the
 * terminal. A run that looks frozen for 36 seconds is indistinguishable
 * from a run that has died, and the UI has no console to fall back on.
 *
 * @param {CompleteOptions} opts
 * @param {(line: string) => void} [onProgress]
 * @returns {Promise<string>}
 */
export async function complete(opts, onProgress) {
  const attempts = 4;
  for (let attempt = 1; ; attempt += 1) {
    try {
      return await callDeepSeek(opts);
    } catch (error) {
      // An abort must break out of the retry loop immediately. Retrying a
      // cancelled call would spend money answering a request nobody is
      // waiting for, three more times, over 52 seconds.
      if (isAbort(error) || opts.signal?.aborted) throw error;
      if (attempt >= attempts || !isTransient(error)) throw error;
      // 4s, 12s, 36s. Long enough for a demand spike to pass.
      const wait = 4000 * 3 ** (attempt - 1);
      const line = `${opts.model} busy, retrying in ${wait / 1000}s (${attempt}/${attempts - 1})`;
      if (onProgress) onProgress(line);
      else console.warn(`    ${line}`);
      await sleep(wait);
      // The wait is the longest window in a run — up to 36 seconds — and
      // a Stop pressed during it should not have to wait it out.
      if (opts.signal?.aborted) throw new Error('Stopped while waiting to retry.');
    }
  }
}

/**
 * Send a prompt, get parsed JSON back.
 *
 * The caller is responsible for checking the shape — a model returning
 * valid JSON of the wrong shape is the normal failure, not the rare one.
 *
 * @param {Omit<CompleteOptions, 'json'>} opts
 * @param {(line: string) => void} [onProgress]
 * @returns {Promise<any>}
 */
export async function completeJson(opts, onProgress) {
  const text = await complete({ ...opts, json: true }, onProgress);
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`${opts.model} returned unparseable JSON: ${text.slice(0, 200)}`);
  }
}

/**
 * Load a prompt from lib/llm/prompts/.
 *
 * Prompts are text files so they can be edited, diffed and reviewed
 * without touching code, and so no prompt is tied to an SDK's shape.
 * `{{name}}` is replaced with the matching value.
 *
 * @param {string} name
 * @param {Record<string, string>} [vars]
 * @returns {Promise<string>}
 */
export async function loadPrompt(name, vars = {}) {
  const raw = await readFile(join(PROMPTS_DIR, `${name}.txt`), 'utf8');
  return raw.replace(/\{\{(\w+)\}\}/g, (whole, key) => vars[key] ?? whole);
}

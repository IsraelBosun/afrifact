/**
 * Every model call in the factory goes through this file.
 *
 * CLAUDE.md §7: the provider is not fixed. This started on Gemini and
 * moved to DeepSeek by rewriting one function — the rest of the pipeline
 * only knows `complete()`, and no other file changed. That is why there is no SDK here and
 * why the prompts live as plain .txt beside this file rather than as
 * template literals wired into a client library.
 *
 * The API key is read from .env in this project only. It must never be
 * copied into afrifacts/ — anything bundled into the app can be pulled
 * back out of the APK.
 */

import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));

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
} as const;

export interface CompleteOptions {
  model: string;
  prompt: string;
  /** Ask for JSON back. The pipeline always does; kept explicit anyway. */
  json?: boolean;
  /** 0 for extraction: we want the same passage every run, not variety. */
  temperature?: number;
}

/**
 * Minimal .env reader.
 *
 * Node 22 has --env-file but tsx does not always pass it through, and a
 * dependency in the project that holds the keys is a dependency worth
 * avoiding. Handles KEY=value, comments, and surrounding quotes. Nothing else.
 */
let envCache: Record<string, string> | null = null;

async function readEnv(): Promise<Record<string, string>> {
  if (envCache) return envCache;
  const out: Record<string, string> = {};
  try {
    const raw = await readFile(join(here, '..', '..', '.env'), 'utf8');
    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (trimmed.length === 0 || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (key.length > 0) out[key] = value;
    }
  } catch {
    // No .env is a real state, not an error. apiKey() gives the message.
  }
  envCache = out;
  return out;
}

async function apiKey(): Promise<string> {
  const env = await readEnv();
  const key = process.env['DEEPSEEK_API_KEY'] ?? env['DEEPSEEK_API_KEY'] ?? '';
  if (key.trim().length === 0) {
    throw new Error(
      'No DEEPSEEK_API_KEY. Put it in afrifacts-factory/.env — never in afrifacts/.',
    );
  }
  return key.trim();
}

/**
 * DeepSeek speaks the OpenAI chat-completions format.
 *
 * The whole point of this file is that a provider swap touches one
 * function. Moving from Gemini to DeepSeek changed the URL, the request
 * body and the response path, and nothing outside these lines.
 */
interface ChatResponse {
  choices?: { message?: { content?: string } }[];
  error?: { message?: string };
}

async function callDeepSeek(opts: CompleteOptions): Promise<string> {
  const key = await apiKey();

  const res = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
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

  const body = (await res.json()) as ChatResponse;
  if (!res.ok) {
    throw new Error(`${opts.model} returned ${res.status}: ${body.error?.message ?? 'no message'}`);
  }

  const text = body.choices?.[0]?.message?.content;
  if (typeof text !== 'string' || text.trim().length === 0) {
    throw new Error(`${opts.model} returned no text.`);
  }
  return text;
}

/**
 * Transient failures: the provider is busy or we are going too fast.
 *
 * A thirty-document run takes minutes and a 503 in the middle of it should
 * cost a pause, not the run. Anything else - a bad key, a bad model name,
 * a malformed request - is thrown immediately, since retrying it would
 * only be slower.
 */
const TRANSIENT = [429, 500, 502, 503, 504];

function isTransient(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return TRANSIENT.some((code) => message.includes(` returned ${code}:`));
}

const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

/** Send a prompt, get text back. The whole provider surface. */
export async function complete(opts: CompleteOptions): Promise<string> {
  const attempts = 4;
  for (let attempt = 1; ; attempt += 1) {
    try {
      return await callDeepSeek(opts);
    } catch (error) {
      if (attempt >= attempts || !isTransient(error)) throw error;
      // 4s, 12s, 36s. Long enough for a demand spike to pass.
      const wait = 4000 * 3 ** (attempt - 1);
      console.warn(`    ${opts.model} busy, retrying in ${wait / 1000}s (${attempt}/${attempts - 1})`);
      await sleep(wait);
    }
  }
}

/**
 * Send a prompt, get parsed JSON back.
 *
 * The caller is responsible for checking the shape — a model returning
 * valid JSON of the wrong shape is the normal failure, not the rare one.
 */
export async function completeJson<T>(opts: Omit<CompleteOptions, 'json'>): Promise<T> {
  const text = await complete({ ...opts, json: true });
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(`${opts.model} returned unparseable JSON: ${text.slice(0, 200)}`);
  }
}

/**
 * Load a prompt from src/llm/prompts/.
 *
 * Prompts are text files so they can be edited, diffed and reviewed
 * without touching code, and so no prompt is tied to an SDK's shape.
 * `{{name}}` is replaced with the matching value.
 */
export async function loadPrompt(
  name: string,
  vars: Record<string, string> = {},
): Promise<string> {
  const raw = await readFile(join(here, 'prompts', `${name}.txt`), 'utf8');
  return raw.replace(/\{\{(\w+)\}\}/g, (whole, key: string) => vars[key] ?? whole);
}

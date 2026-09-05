/**
 * Supabase, over plain HTTP.
 *
 * No `@supabase/supabase-js`. This project holds every key in AfriFacts,
 * so its dependency list stays short on purpose — the same reasoning that
 * kept the review dashboard on Node's own http module. PostgREST is a
 * REST API; upserting rows is a POST with two headers, and the client
 * library's value here would be types this project does not use.
 *
 * THE SERVICE KEY BYPASSES ROW LEVEL SECURITY COMPLETELY.
 *
 * Everything in this file runs with full rights over the database. That
 * is correct for a writer and catastrophic in a mobile app, which is why
 * §2 puts the key here and nowhere else, and why nothing in this module
 * is reachable from anything the app imports.
 */

import { envValue } from '../llm/index.js';

/**
 * @typedef {object} SupabaseConfig
 * @property {string} url
 * @property {string} key
 * @property {string} schema
 */

/**
 * Credentials, or a message saying exactly what to add and where.
 *
 * The error names the file, because the near-miss this guards against is
 * real: the app's `.env` and this one both take a Supabase URL, and the
 * keys that go with them are opposites — one is designed to be public,
 * the other is a full database compromise.
 *
 * @returns {Promise<SupabaseConfig>}
 */
export async function supabaseConfig() {
  const url = (await envValue('SUPABASE_URL')).replace(/\/+$/, '');
  const key = await envValue('SUPABASE_SERVICE_ROLE_KEY');
  const schema = (await envValue('SUPABASE_SCHEMA')) || 'afrifacts';

  const missing = [];
  if (url.length === 0) missing.push('SUPABASE_URL');
  if (key.length === 0) missing.push('SUPABASE_SERVICE_ROLE_KEY');

  if (missing.length > 0) {
    throw new Error(
      `${missing.join(' and ')} missing from afrifacts-studio/.env. ` +
        'Both are in the Supabase dashboard under Settings -> API. ' +
        'Use the service_role / secret key here, not the anon key — and never put it in afrifacts/.',
    );
  }

  return { url, key, schema };
}

/** True if a push is even possible, without throwing. For UI. */
export async function hasSupabase() {
  try {
    await supabaseConfig();
    return true;
  } catch {
    return false;
  }
}

/**
 * @param {SupabaseConfig} config
 * @param {Record<string, string>} extra
 */
function headers(config, extra = {}) {
  return {
    apikey: config.key,
    Authorization: `Bearer ${config.key}`,
    'Content-Type': 'application/json',
    // Without this PostgREST reads and writes `public` whatever the URL
    // says, and the request succeeds against the wrong schema.
    'Content-Profile': config.schema,
    'Accept-Profile': config.schema,
    ...extra,
  };
}

/**
 * A readable message out of a PostgREST failure.
 *
 * Its errors are JSON with the useful part in `message` and the actually
 * useful part in `hint` or `details`. The raw body is a wall.
 *
 * @param {Response} res
 * @param {string} what
 */
async function fail(res, what) {
  const body = await res.text().catch(() => '');
  let detail = body.slice(0, 400);
  try {
    const parsed = JSON.parse(body);
    detail = [parsed.message, parsed.details, parsed.hint].filter(Boolean).join(' — ');
  } catch {
    /* not JSON; the raw body is what there is */
  }

  if (res.status === 404 && /schema|relation/i.test(detail)) {
    detail +=
      '  (Has the schema been created, and added to Settings -> API -> Exposed schemas?)';
  }

  throw new Error(`${what} failed: ${res.status} ${detail}`);
}

/**
 * How many rows go in one request.
 *
 * Large enough that 148 facts is two round trips, small enough that a
 * failure names a batch you can find rather than "the push".
 */
const BATCH = 200;

/**
 * Insert-or-update rows, keyed by the table's primary key.
 *
 * Upsert rather than insert because this stage is run repeatedly against
 * a database that already holds most of what it is sending. A push that
 * could only insert would be a push you could only run once.
 *
 * @param {SupabaseConfig} config
 * @param {string} table
 * @param {Record<string, unknown>[]} rows
 * @param {(line: string) => void} [say]
 * @param {AbortSignal} [signal]
 * @returns {Promise<number>} rows sent
 */
export async function upsert(config, table, rows, say, signal) {
  if (rows.length === 0) return 0;

  let sent = 0;
  for (let i = 0; i < rows.length; i += BATCH) {
    if (signal?.aborted) break;
    const batch = rows.slice(i, i + BATCH);

    const res = await fetch(`${config.url}/rest/v1/${table}`, {
      method: 'POST',
      headers: headers(config, {
        Prefer: 'resolution=merge-duplicates,return=minimal',
      }),
      body: JSON.stringify(batch),
      signal,
    });

    if (!res.ok) await fail(res, `${table} (rows ${i + 1}-${i + batch.length})`);
    sent += batch.length;
  }

  say?.(`${sent} -> ${table}`);
  return sent;
}

/**
 * One column of a whole table.
 *
 * Used to read back the primary keys the database holds, so a push can
 * work out what is up there that should not be.
 *
 * @param {SupabaseConfig} config
 * @param {string} table
 * @param {string} column
 * @returns {Promise<string[]>}
 */
export async function keys(config, table, column) {
  const res = await fetch(
    `${config.url}/rest/v1/${table}?select=${column}&limit=100000`,
    { headers: headers(config) },
  );
  if (!res.ok) await fail(res, `reading ${column} from ${table}`);
  const rows = await res.json();
  return rows.map((row) => String(row[column]));
}

/**
 * Delete rows by primary key.
 *
 * PostgREST deletes by filter, not by body, and a request with no filter
 * deletes the table. `in.(...)` with an explicit list is the whole
 * safety property here — there is deliberately no code path in this
 * module that issues an unfiltered DELETE.
 *
 * @param {SupabaseConfig} config
 * @param {string} table
 * @param {string} column
 * @param {string[]} values
 * @param {AbortSignal} [signal]
 * @returns {Promise<number>} rows deleted
 */
export async function remove(config, table, column, values, signal) {
  if (values.length === 0) return 0;

  let gone = 0;
  for (let i = 0; i < values.length; i += BATCH) {
    if (signal?.aborted) break;
    const batch = values.slice(i, i + BATCH);
    // Quoted: an id containing a comma or a bracket would otherwise end
    // the list early and delete a different set than the one asked for.
    const list = batch.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',');

    const res = await fetch(
      `${config.url}/rest/v1/${table}?${column}=in.(${encodeURIComponent(list)})`,
      { method: 'DELETE', headers: headers(config, { Prefer: 'return=minimal' }), signal },
    );
    if (!res.ok) await fail(res, `deleting from ${table}`);
    gone += batch.length;
  }
  return gone;
}

/**
 * How many rows a table holds. Used to report what actually landed
 * rather than what was sent.
 *
 * @param {SupabaseConfig} config
 * @param {string} table
 * @returns {Promise<number>}
 */
export async function count(config, table) {
  const res = await fetch(`${config.url}/rest/v1/${table}?select=*&limit=1`, {
    headers: headers(config, { Prefer: 'count=exact' }),
  });
  if (!res.ok) await fail(res, `counting ${table}`);
  // content-range comes back as '0-0/148'
  const range = res.headers.get('content-range') ?? '';
  const total = Number(range.split('/')[1]);
  return Number.isFinite(total) ? total : 0;
}

import { runPush } from '../pipeline/push-to-supabase.js';

/**
 * Push the corpus to the database, right after a decision changes it.
 *
 * Publishing is a pipeline stage with a Run button, and it stayed only
 * that for one release too long: approving a fact changed a file in
 * `data/` and nothing else, so the app kept showing the previous corpus
 * until somebody remembered to click the button. A gate whose result is
 * invisible until a second, unrelated action is a gate people stop
 * trusting.
 *
 * So every decision that can change what ships — approve, reject, edit,
 * retire, restore, an image swap — runs a push behind it. It calls no
 * model, and it is an upsert of a few hundred rows, so doing it every
 * time costs a round trip rather than money.
 *
 * Nothing about the standard is relaxed by that. `published` is set from
 * `isPublishable` and nothing else, so an edit that clears an approval
 * takes the fact straight back out of the app on the next read, which is
 * the point rather than a side effect.
 *
 * A failure here is reported, never thrown. The decision is already on
 * disk by the time this runs, and turning a good review into an HTTP 500
 * because the network blipped is the wrong trade: the studio's job is
 * the corpus, and publishing rides on top of it. The board shows the
 * database as stale when this fails, so a lost push is visible rather
 * than silent.
 *
 * @returns {Promise<{ ok: boolean, facts?: number, published?: number, error?: string }>}
 */
export async function publishToApp() {
  try {
    const summary = await runPush();
    return { ok: true, facts: summary.facts, published: summary.published };
  } catch (error) {
    return { ok: false, error: error?.message ?? String(error) };
  }
}

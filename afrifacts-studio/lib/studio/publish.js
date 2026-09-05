import { runExport } from '../pipeline/export-to-app.js';

/**
 * Push the approved corpus to the app, right after a decision changes it.
 *
 * Export is a pipeline stage with a Run button, and it stayed only that
 * for one release too long: approving a fact changed a file in `data/`
 * and nothing else, so the app kept showing the previous corpus until
 * somebody remembered to click Export. A gate whose result is invisible
 * until a second, unrelated action is a gate people stop trusting.
 *
 * So every decision that can change what ships — approve, reject, edit,
 * retire, restore, an image swap — runs the export behind it. It calls no
 * model and writes one file, so doing it every time costs milliseconds.
 *
 * Nothing about the standard is relaxed by that. The export publishes
 * `isPublishable` facts and only those, so an edit that clears an
 * approval takes the fact straight back out of the app, which is the
 * point rather than a side effect.
 *
 * A failure here is reported, never thrown. The decision is already on
 * disk by the time this runs, and turning a good review into an HTTP 500
 * because the app folder happens to be missing is the wrong trade: the
 * studio's job is the corpus, and the export rides on top of it.
 *
 * @returns {Promise<{ ok: boolean, facts?: number, path?: string, error?: string }>}
 */
export async function publishToApp() {
  try {
    const summary = await runExport();
    return { ok: true, facts: summary.facts, path: summary.path };
  } catch (error) {
    return { ok: false, error: error?.message ?? String(error) };
  }
}

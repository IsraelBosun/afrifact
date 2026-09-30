/**
 * Turn the agent's strong facts into real, reviewable drafts.
 *
 * The same three steps `runEnrich` ends with: enrich each candidate,
 * promote the facts into the store, promote the quiz. It is its own small
 * function rather than a call to `runEnrich` because that stage reads
 * `candidates.json` and the keep list, and the agent's facts were already
 * chosen by the judge. Routing them through the triage file would put
 * them where a later extract run can overwrite them.
 *
 * `promote()` approves on arrival, as it does for every pipeline fact, and
 * `validate()` still blocks anything with errors. The review stamp says
 * 'agent' rather than 'pipeline' so its facts can be told apart on
 * /review. Nothing here pushes: the app only changes at the next push.
 */

import { enrichOne } from '../pipeline/enrich.js';
import { keyOf } from '../pipeline/candidate-key.js';
import { loadFactStore, nextFactNumber, promote } from '../studio/facts.js';
import { promoteQuiz } from '../studio/quiz.js';

/** Same range enrich uses, so the two doors never mint the same id. */
const PIPELINE_ID_BASE = 1000;

/**
 * @param {{ candidate: import('../pipeline/extract.js').Candidate }[]} strong
 * @param {(line: string) => void} say
 * @param {AbortSignal} [signal]
 */
export async function deliver(strong, say, signal) {
  const store = await loadFactStore();
  let n = nextFactNumber(store, PIPELINE_ID_BASE);

  const results = [];
  const keys = new Map();
  for (const { candidate } of strong) {
    if (signal?.aborted) break;
    try {
      const enriched = await enrichOne(candidate, n, say, signal);
      if (!enriched) {
        say(`x unusable enrichment: ${candidate.fact.slice(0, 60)}`);
        continue;
      }
      results.push(enriched);
      keys.set(enriched.entry.fact.id, keyOf(candidate));
      say(`+ ${enriched.entry.fact.id}  ${candidate.fact.slice(0, 70)}`);
      n += 1;
    } catch (error) {
      if (signal?.aborted) break;
      say(`x ${candidate.fact.slice(0, 50)}: ${error instanceof Error ? error.message : error}`);
    }
  }

  if (results.length === 0) return { ids: [] };

  await promoteQuiz(results.flatMap((r) => r.quiz));
  const promotion = await promote(
    results.map((r) => r.entry),
    { by: 'agent', keyOf: (entry) => keys.get(entry.fact.id) },
  );
  return { ids: promotion.added };
}

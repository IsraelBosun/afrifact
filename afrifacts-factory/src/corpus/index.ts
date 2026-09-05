/**
 * The corpus. One file per category, plus the pipeline's output.
 *
 * This is the only place facts are defined. The app's dummy data is UI
 * scaffolding and is not part of the corpus — real facts reach the app
 * through the database, never by hand-editing the app project.
 *
 * Two doors, one standard. Hand-authored facts live in the category
 * files; pipeline facts arrive in `_enriched.ts`, generated. Both are
 * `SourcedFact`, both run through the same `validate()`, and both need a
 * named reviewer before they are publishable. What differs is who wrote
 * them, not what is asked of them.
 *
 * `_enriched.ts` is regenerated on every `npm run enrich`, so nothing may
 * be hand-edited there. Review decisions survive that: they are stored in
 * `reviews.json` keyed by fact id, never inside the corpus files.
 */

import type { SourcedFact } from '../types/provenance';
import { historyFacts } from './history';
import { cultureFacts } from './culture';
import { enrichedFacts } from '../../_enriched';

export const corpus: SourcedFact[] = [...historyFacts, ...cultureFacts, ...enrichedFacts];

export { historyFacts, cultureFacts, enrichedFacts };

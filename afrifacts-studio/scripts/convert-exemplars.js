/**
 * One-off: convert `calibration/exemplars.ts` to JavaScript.
 *
 * These are the founder's own 22 facts and they are the target the whole
 * pipeline is aimed at, so they are transformed mechanically rather than
 * retyped — a silently altered word here would change what the model is
 * shown and nobody would notice.
 *
 * The body is already valid JavaScript. All that has to go is the type
 * declarations and the two annotations, replaced by JSDoc saying the same
 * thing.
 *
 * Delete this script once the move is verified.
 */

import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import { ROOT } from '../lib/paths.js';

const SOURCE = join(ROOT, '..', 'afrifacts-factory', 'src', 'calibration', 'exemplars.ts');
const TARGET = join(ROOT, 'lib', 'calibration', 'exemplars.js');

const TYPEDEFS = `/**
 * How hard each exemplar will be to source.
 *
 * - \`documented\` — a public record, a published figure, a documented event.
 * - \`findable\`   — real but scattered: press, obituaries, interviews. Needs digging.
 * - \`contested\`  — oral tradition, folk etymology, or contested. Needs care and caveats.
 * - \`volatile\`   — rests on something that changes: an office holder, a record, a total.
 *
 * @typedef {'documented' | 'findable' | 'contested' | 'volatile'} SourcingDifficulty
 */

/**
 * @typedef {object} Exemplar
 * @property {number} n The founder's own numbering, kept so a fact can be
 *   talked about.
 * @property {string} title
 * @property {string} text
 * @property {import('../types/fact.js').Category} category
 * @property {string} works Why this one works. Used in the prompt to make
 *   the pattern explicit.
 * @property {SourcingDifficulty} sourcing
 */

/** @type {Exemplar[]} */
`;

async function main() {
  const text = await readFile(SOURCE, 'utf8');

  const typeStart = text.indexOf('export type SourcingDifficulty');
  const dataStart = text.indexOf('export const EXEMPLARS');
  if (typeStart === -1 || dataStart === -1) {
    throw new Error('exemplars.ts does not look like it did — convert it by hand.');
  }

  const header = text.slice(0, typeStart);
  let body = text.slice(dataStart);

  // The two annotations, and nothing else in the file, are TypeScript.
  body = body.replace('export const EXEMPLARS: Exemplar[] = [', 'export const EXEMPLARS = [');
  body = body.replace(
    'export function exemplarsForPrompt(limit = EXEMPLARS.length): string {',
    'export function exemplarsForPrompt(limit = EXEMPLARS.length) {',
  );

  if (body.includes(': Exemplar[]') || body.includes('): string {')) {
    throw new Error('An annotation survived the conversion. Check exemplars.ts by hand.');
  }

  await writeFile(TARGET, header + TYPEDEFS + body, 'utf8');
  console.log(`\n  -> ${TARGET}\n`);
}

await main();

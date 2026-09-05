/**
 * One-off: lift the generated corpus out of the old factory's `_enriched.ts`.
 *
 * That file was a TypeScript module so the corpus could `import` it. The
 * studio reads enriched facts as JSON instead, to keep a file the enrich
 * stage rewrites out of the Next dev server's module graph.
 *
 * The payload inside it is already literal JSON — the model wrote it and
 * `JSON.stringify` printed it — so this slices the two arrays out by
 * their markers rather than parsing TypeScript. The arrays are printed at
 * two-space indent, so a `];` at column zero is an array terminator and
 * nothing else.
 *
 * Delete this script once the move is verified.
 */

import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import { ENRICHED_PATH, GENERATED_DIR, ROOT, SOURCES_PATH, ensureDirs } from '../lib/paths.js';

const FACTORY = join(ROOT, '..', 'afrifacts-factory');
const SOURCE = join(FACTORY, '_enriched.ts');
const SOURCES_TS = join(FACTORY, 'src', 'pipeline', 'sources.ts');

/**
 * Slice one exported array out of the file.
 *
 * @param {string} text
 * @param {string} marker The whole `export const ... = ` line prefix.
 * @returns {unknown[]}
 */
function sliceArray(text, marker) {
  const at = text.indexOf(marker);
  if (at === -1) throw new Error(`Could not find '${marker}' in _enriched.ts`);

  // Find the assignment first. Looking for '[' straight after the marker
  // finds the one in the type annotation `SourcedFact[]`, not the array.
  const assign = text.indexOf(' = ', at + marker.length);
  if (assign === -1) throw new Error(`No assignment after '${marker}'`);

  const start = text.indexOf('[', assign);
  if (start === -1) throw new Error(`No array after '${marker}'`);

  const end = text.indexOf('\n];', start);
  if (end === -1) throw new Error(`Unterminated array after '${marker}'`);

  return JSON.parse(text.slice(start, end + 2));
}

/**
 * Lift the seed list out of `sources.ts`.
 *
 * The entries are uniform one-liners, so a regex reads them safely. The
 * `// People.` style comments above each block are curatorial notes about
 * why those pages were picked — JSON cannot hold a comment, so they
 * become a `group` field instead, which the sources editor can show.
 *
 * @param {string} text
 */
function parseSources(text) {
  const entry =
    /^\s*\{\s*slug:\s*'([^']+)'\s*,\s*title:\s*(?:'([^']*)'|"([^"]*)")\s*,\s*country:\s*'([^']+)'\s*,\s*tier:\s*'([^']+)'\s*\}/;

  const out = [];
  let group = '';
  let inComment = false;

  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();

    if (trimmed.startsWith('//')) {
      // Only the first line of a comment block is the label. The blocks
      // here run to two or three lines explaining the choice, and the
      // opening sentence is the one that names the group.
      // The label runs to the first full stop: one block opens with
      // "People." and then keeps explaining, and only the first word is
      // the group.
      if (!inComment) {
        group = trimmed
          .replace(/^\/\/\s*/, '')
          .split('.')[0]
          .replace(/:\s*$/, '')
          .trim();
      }
      inComment = true;
      continue;
    }
    inComment = false;

    const m = entry.exec(line);
    if (!m) continue;
    out.push({
      slug: m[1],
      title: m[2] ?? m[3],
      country: m[4],
      tier: m[5],
      group,
    });
  }
  return out;
}

async function main() {
  await ensureDirs();
  const text = await readFile(SOURCE, 'utf8');

  const facts = sliceArray(text, 'export const enrichedFacts');
  const quiz = sliceArray(text, 'export const enrichedQuiz');

  await writeFile(ENRICHED_PATH, `${JSON.stringify(facts, null, 2)}\n`, 'utf8');
  await writeFile(
    join(GENERATED_DIR, 'enriched-quiz.json'),
    `${JSON.stringify(quiz, null, 2)}\n`,
    'utf8',
  );

  const sources = parseSources(await readFile(SOURCES_TS, 'utf8'));
  await writeFile(SOURCES_PATH, `${JSON.stringify(sources, null, 2)}\n`, 'utf8');

  console.log(`\n  enriched facts: ${facts.length}`);
  console.log(`  quiz questions: ${quiz.length}`);
  console.log(`  seed articles:  ${sources.length}`);
  for (const g of [...new Set(sources.map((s) => s.group))]) {
    console.log(`    ${sources.filter((s) => s.group === g).length}  ${g || '(ungrouped)'}`);
  }
  console.log(`  -> ${ENRICHED_PATH}`);
  console.log(`  -> ${SOURCES_PATH}\n`);
}

await main();

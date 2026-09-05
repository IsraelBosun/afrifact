# afrifacts-factory

Turns sources into reviewed, publishable facts. Node, TypeScript, no UI.

The database is the only thing between this project and the app. The app
reads facts; the factory writes them. Nothing else crosses, and no key
that lives here ever goes near `afrifacts/`.

## Right now

There is no pipeline. There are types, a validator, and a corpus of
hand-written facts. That is deliberate: with ten facts there is nothing
to automate, and the ten exist to set the standard that the automation
will later be measured against.

```
src/
  types/fact.ts        what the app renders. Mirrors the app's copy exactly.
  types/provenance.ts  what proves a fact is true. The app never sees this.
  corpus/              the facts, one file per category.
  validate.ts          the standard, enforced.
  check.ts             npm run check
```

## The standard

Every fact must clear all of this before it ships.

**Extracted, never remembered.** A fact comes from a passage in a source,
and the passage is stored verbatim alongside it. No passage, no fact.
This is the rule everything else rests on — it is what makes a challenge
answerable in under a minute instead of a scramble.

**A stable locator.** A DOI, an ISBN with a page, or an archive
reference. A URL alone is a warning, because URLs rot and a dead link is
indistinguishable from no source at all.

**Three axes of surprise**, each scored 1–5, all needing 3 or better:

- `priorProbability` — would an educated Nigerian already know it? The
  harshest filter. Most candidates die here, and that is the point: facts
  people already know are why facts apps fail.
- `specificity` — a number, a name, a date, a place. "Nigeria is diverse"
  fails; "over 500 living languages" passes.
- `explicability` — can you say *why* in two sentences? This is what
  separates a fact from trivia, and what makes the deep dive possible.

**Corroboration for weak tiers.** Press and reference sources cannot
carry a fact alone. A newspaper archive is strong evidence that something
was *reported* and weaker evidence that it *happened* — the paper is
usually relaying a figure from somewhere else.

**A named reviewer.** Nothing goes live unreviewed, and an approval is
attributable to a person.

**A decay kind.** `permanent` for settled history, `volatile` for
anything resting on current economic or demographic data, which needs a
date to be checked again. Cheap now, painful to retrofit later.

Manually written facts and pipeline facts run through the same
`validate()`. Same standard, different door.

## Guarding against drift

The corpus in `src/corpus/` is also the calibration set. One reviewer
scoring several hundred facts over months will drift — the bar falls as
you get steeped in the material and everything starts to feel obvious.
Re-read the first ten periodically and check the new ones still clear the
same bar.

## Commands

```
npm run studio     the review dashboard, http://localhost:4321
npm run check      validate the corpus, exits non-zero on any error
npm run typecheck  tsc --noEmit
```

## Reviewing

`npm run studio` opens a local page listing every fact with what is
blocking it, the passage behind each source, and the surprise scores.
Approve, reject, or mark needs-work from there.

Two things it deliberately does not do. It does not write facts — those
are authored in `src/corpus/*.ts`, because a fact is a considered piece of
writing with comments and reasoning around it, not a form submission. And
it cannot approve a fact the validator blocks: the Approve button stays
off until `check` is clean, so the standard cannot be clicked past.

Decisions are saved to `reviews.json`, not back into the corpus files,
which keeps a clicked button from rewriting hand-authored source. `check`
reads that file too, so the dashboard and the command line agree.

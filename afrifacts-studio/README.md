# AfriFacts Studio

The content pipeline and review dashboard behind [AfriFacts](https://github.com/IsraelBosun), an app of surprising, verified facts about Africa.

The studio turns source documents into approved facts. The app reads them. The two share no code — only a database — and every secret in the project lives here, because anything bundled into a mobile app can be pulled back out of the APK.

## What it does

Eight stages, each runnable alone and each stoppable mid-run:

| Stage | Command | What it does |
|---|---|---|
| Sources | — | A hand-picked seed list. Never automated; see below. |
| Fetch | `npm run fetch` | Pulls article text into `_cache/`, keyed by revision |
| Extract | `npm run extract` | Asks the model for facts with verbatim passages, then verifies them |
| Enrich | `npm run enrich` | Deep dive, why-it-matters, three quiz questions |
| Quizzes | `npm run quizzes` | Quiz questions for facts that have none |
| Images | `npm run images` | Harvests licence-clean images from the fact's own article |
| Review | `npm run dev` | A human approves every fact |
| Export | `npm run export` | Writes the approved corpus into the app |

`npm run check` validates the whole corpus and exits non-zero on any error.

## The rules it enforces

These are the reason the project exists in this shape rather than as a prompt and a spreadsheet.

**Facts are extracted, never remembered.** Every fact keeps the passage it came from, quoted verbatim. No passage, no fact.

**There is no model in the verifier.** Asking a model whether a model hallucinated is asking the same faculty that produced the error to detect it. `verify.js` string-matches the passage against the cached document, then checks that every number and most content words in the fact also appear in that passage — which is what catches a real quote with the model's own knowledge welded onto it.

**There is no model in the licence filter either.** Image rights are decided by one field, `imagerepository: 'shared'`. Commons forbids non-free content by policy, so a file hosted there is free for commercial use; fair-use files — album covers, logos, the good photo of a living person, exactly the tempting ones — are hosted locally on en-wiki and fail that check.

**Every source carries a stable locator.** A DOI, an ISBN with a page, an archive reference, or a content hash. A URL alone is not enough: URLs rot, and a dead link is indistinguishable from no source.

**Press and reference sources cannot carry a fact alone.** A newspaper archive is strong evidence something was *reported* and weaker evidence that it *happened*.

**Nothing goes live unreviewed**, and approve is disabled while the validator reports an error, so the standard cannot be clicked past.

**Source acquisition is curatorial, not automated.** Choosing which documents to mine is judgment work with enormous leverage. Automate extraction from chosen sources; never automate the choosing.

## What the model is good and bad at

Measured on real runs, not assumed:

- **A good extractor.** Given a document and examples, it finds genuinely surprising material.
- **A bad judge.** It rates almost everything 4–5 on "would an educated Nigerian already know this", including page furniture. It scores *obscure* when the question is *surprising*. Its scores are shown in the triage UI as a hint and never as a gate.
- **Examples beat instructions.** Prose describing "make it interesting" failed twice. A file of 22 hand-written exemplars injected into the extraction prompt changed the output on the next run.

Expect roughly three keepers per document, and let a person do the filtering.

## Layout

```
app/            Next.js routes: the board, review, sources, triage, and the API
lib/pipeline/   the stages
lib/llm/        the only files that know which model provider is in use
lib/studio/     durable stores — facts, reviews, images, quiz
data/           decisions. Not reproducible. Never overwritten by a stage.
_cache/         fetched documents, keyed by revision. Evidence, not an optimisation.
_generated/     disposable stage output. Overwritten on every run.
corpus/         hand-authored facts
```

The `data/` and `_generated/` split is load-bearing. A stage may overwrite anything in `_generated/`; nothing in `data/` is regenerable, and the two have been confused before — quiz questions lived in `_generated/` for months and every run silently deleted the previous run's.

## Running it

Node 20+.

```bash
npm install
cp .env.example .env    # then fill it in
npm run dev             # http://127.0.0.1:3000
```

The dev server binds loopback only, on purpose.

`.env` holds the model key, the search key, and the database service key. It is git-ignored and must stay that way — the app project holds none of them.

## Provider independence

`lib/llm/index.js` is the only file that knows a provider, and that is proven rather than asserted: the pipeline was built on Gemini and moved to DeepSeek by rewriting one function. No other file changed. Prompts are plain `.txt` in `lib/llm/prompts/`, so they can be edited and diffed without touching code.

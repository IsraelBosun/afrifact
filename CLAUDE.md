# AfriFacts

## 1. What we are building

AfriFacts is a mobile app that serves surprising, verified facts about Africa, starting with Nigeria. It ships on the Google Play Store.

The product bet: facts apps normally die because they are static reference lists nobody reopens. AfriFacts is built like a social app instead. A full screen swipeable feed, a daily streak, quizzes injected into the feed, and share cards designed to travel through WhatsApp and X. An LLM layer lets one person produce depth that used to need a content team.

Three things drive the product:

- **Retention.** Streaks, daily facts, a personalised feed. If people do not come back on day 8, nothing else matters.
- **Virality.** Every fact and every quiz score exports as a branded image. Sharing is the growth engine, so the card design is the marketing.
- **Trust.** Every fact carries a real source and a verified badge. One viral screenshot of a fake fact would undo months of work.

Nigeria is the launch market. The app must be able to serve any African country later without a rewrite. Country is always a value in the data, never a structure in the code.

## 2. Repo map

Parent folder: `Afri_Facts/`

```
Afri_Facts/
  afrifacts/          React Native (Expo) mobile app. BUILDING NOW.
  afrifacts-studio/   Content pipeline and review dashboard. Next.js, JavaScript.
  afrifacts-factory/  Superseded by the studio. Kept until its deletion is confirmed.
```

Rules that hold across all folders:

- Each folder is its own project with its own dependencies. They share no code.
- The database is the only connection between them. The app reads facts. The studio writes facts. Nothing else crosses.
- **No secrets ever live in `afrifacts/`.** Anything bundled into a mobile app can be extracted from the APK. LLM API keys and database service keys belong to the studio only.
- The app is **TypeScript**. The fact shape in section 5 lives as a real type in `src/types/`, and every data-layer function is typed against it.

## 3. Phase 1 scope: UI first, dummy data

**We are building the app UI only. No database, no network calls, no authentication, no LLM calls.**

The app must look and feel complete while being entirely fake. Every screen renders from a local dummy data file.

The one architectural rule that makes this work:

> All data access goes through a single module, `src/data/index.ts`. Screens and components never import the dummy data file directly. They call functions like `getFeed()`, `getFactById()`, `getQuiz()`, `getUserStats()`.

Right now those functions return dummy arrays. In phase 2 they will call the database instead. Because every screen goes through this one module, that swap touches one file. Do not scatter data access through components.

Dummy data lives in `src/data/dummyFacts.ts` and is typed as `Fact[]`, so a shape mistake is a compile error rather than a runtime surprise.

## 4. The screens

Six screens. All designed and validated already. Build them as specified.

### 4.1 Home feed

The home screen IS the feed. The app opens directly into a full screen fact, zero clicks to value. No dashboard, no welcome screen.

- **Top bar:** logo mark and "AfriFacts" on the left, a country selector button and a streak flame pill on the right.
- **Category chips:** a horizontal scrolling row. "For You" is default and active. Then History, Business, Culture, Food, Sports. These are topic lanes, not countries.
- **The card:** fills the screen between chips and the tab bar. Two variants, mixed in the feed, roughly one third photo cards:
  - **Typographic card.** Solid pastel background in the category colour family, category pill, the fact in large serif, verified source line at the bottom.
  - **Photo card.** Image fills the top two thirds, a solid dark panel below it carries the fact text and actions. The panel colour comes from the image's dominant tones. Photo credit sits on the image.
- **Action rail:** bookmark, share, and a sparkle button. The sparkle opens the deep dive and is always the brightest element on the card. It appears on every fact.
- **Swipe:** vertical, TikTok style. Swipe up for the next fact, down for the previous. Tapping the card also advances.
- **Quiz injection:** every few facts, a quiz card appears in the feed instead of a fact. "You have seen 3 facts. Think you can score 3 for 3?" with a Play now button.
- **Bottom tab bar:** Home, Quiz, Saved, Profile. Four items, no more.

### 4.2 Deep dive

Opens when the sparkle button is tapped. The fact expands into a short article.

- Hero image at the top when the fact has one, with back and share buttons floating on it and the photo credit in the corner. When there is no image, the hero is the category colour block.
- A solid dark panel below the hero carries the category eyebrow, the fact as headline, verified line, and read time.
- The article body switches to a clean light reading surface. Deep colour is for covers, not paragraphs.
- A **"Why it matters"** callout block. This is the signature element of every deep dive. It connects the fact to something larger.
- Related facts as tappable rows at the bottom of the body.
- An **"Ask about this"** box pinned at the bottom: a text input with an AI generated suggested question as placeholder, a send button, and a "2 free questions left" quota pill. In phase 1 this is UI only. Tapping send does nothing yet.

### 4.3 Quiz

Three questions, under 30 seconds. Long packs come later.

- Header shows "Question 2 of 3" and a segmented progress bar that fills as you go.
- The question in large serif, four answer options as tappable cards.
- On answer: the correct option turns green, a wrong pick turns red, and a feedback block explains the fact behind the answer. Right or wrong, the user learns something.
- Auto advances after a short pause.

### 4.4 Score

- Large serif score, "3/3".
- A performance title that escalates with the score. A perfect run gets something like "Certified Naija scholar". Low scores get playful, never shaming. People do not share cards that embarrass them.
- Check marks showing the run.
- "Think you can beat me?" line. This is the viral mechanic in five words.
- One hero action: **Share your score.** "Back to feed" is the quiet secondary.

### 4.5 Profile

- Avatar, name, joined date.
- Four stat cards in a 2x2 grid: day streak, facts learned, saved, quiz accuracy. Each in a different category colour family.
- A "This week" row of seven day markers showing which days the streak was kept.
- A premium card at the bottom: unlimited AI questions, no ads, full quiz packs, offline mode. Presented as an invitation, never as a wall or an interruption.

### 4.6 Country picker

- Opens from the country button in the home top bar.
- A bottom sheet with a search field, "Africa (all)" pinned at the top, then a country list with flags.
- The user's detected country is default and pre-selected. Selecting one reloads the feed for that country.
- In phase 1 only Nigeria has content. Other countries can appear disabled or empty.

## 5. The fact shape

**These types are the contract.** They live in `src/types/fact.ts` and are the single definition the app, the dummy data, and phase 2's database rows all answer to. Widening one of them is a deliberate decision, not a convenience.

```ts
export type Category = 'History' | 'Business' | 'Culture' | 'Food' | 'Sports';

/** ISO 3166-1 alpha-2, or 'AFR' for pan-African. Never narrowed to 'NG'. */
export type CountryCode = string;

export interface Fact {
  id: string;                       // 'nf_0087'
  country: CountryCode;
  category: Category;
  fact: string;
  deepDive: DeepDive;
  source: Source;
  image: FactImage | null;          // null when the fact has no image
  factNumber: number;               // shown on share cards
  relatedIds: string[];
}

export interface DeepDive {
  body: string[];                   // one string per paragraph
  whyItMatters: string;
  readTime: number;                 // minutes
  suggestedQuestion: string;
}

export interface Source {
  name: string;
  url: string;
  verified: boolean;
}

export interface FactImage {
  url: string;
  credit: string;                   // 'Photo · Wikimedia Commons'
  license: string;                  // 'CC BY-SA 4.0'
  panelColor: string;               // dark panel tone for the photo card
}
```

Quiz questions reference a fact:

```ts
export interface QuizQuestion {
  id: string;                       // 'q_0210'
  factId: string;
  question: string;
  options: [string, string, string, string];   // always exactly four
  correctIndex: 0 | 1 | 2 | 3;
  explanation: string;
}
```

Two rules the types enforce on purpose: `image` is nullable rather than optional, so every card component has to decide which variant it renders; and `country` stays a plain string, so no type ever encodes the launch market.

Every fact must have a source. This applies to facts written by hand as much as facts produced by the pipeline. The verified badge does not distinguish between them, so the standard cannot either.

## 6. Design system

The look is editorial, colourful, and deliberately not templated Material Design. Every screen holds one colour family, and the family follows the category. The app feels vibrant because the colour changes as you swipe, not because any single screen is busy.

**Typography**

- Display and fact text: **Fraunces** (serif). Used for facts, headlines, big numbers.
- UI and body: **Sora** (sans). Used for chips, labels, buttons, article body.
- Two weights only, regular and medium. Sentence case everywhere, never title case, never all caps except small tracked eyebrow labels.

**Category colour families**

| Category | Light fill | Mid | Dark |
|---|---|---|---|
| Culture | `#9FE1CB` | `#0F6E56` | `#04342C` |
| History | `#F5C4B3` | `#993C1D` | `#4A1B0C` |
| Business | `#CECBF6` | `#534AB7` | `#26215C` |
| Food | `#F4C0D1` | `#993556` | `#4B1528` |
| Sports | `#B5D4F4` | `#185FA5` | `#042C53` |
| Streak / amber accent | `#FAC775` | `#854F0B` | `#633806` |

Brand green for the logo mark and active tab: `#1D9E75`.

**Rules**

- One colour family per screen, plus neutrals. Never mix five categories on one card.
- Text on a coloured fill uses the dark stop from the same family. Never black, never grey.
- No gradients, no drop shadows, no glow. Flat surfaces only.
- Motion matters more than decoration: smooth card transitions, light haptics on quiz answers, a streak animation on daily goal, confetti on a perfect score. These are what make it feel expensive.
- Dark mode from day one.

**Share cards**

Both card styles export at **1080 x 1350** (4:5), which displays uncropped on WhatsApp status, Instagram and X.

- The exported image is visually identical to the card the user saw in the app.
- Every share card carries the logo mark, the app name, and "Get it on Google Play" in the footer. Every share is an ad.
- Photo credits stay on the exported image. This is a licence requirement and a trust signal.
- Score cards carry the streak badge and the "Think you can beat me?" line.

In phase 2 these are generated with `react-native-view-shot` rendering the same components off screen. In phase 1, build the card components so they are reusable for that.

## 7. Content pipeline

Phases are gone: we build what the work needs, when it needs it. Content started early because it has the longest lead time and cannot be compressed at the end. An app with 40 facts is a demo; target several hundred approved facts before launch.

The pipeline turns raw sources into approved facts in the database, in eight stages: source collection, extraction, surprise filtering, deduplication, enrichment (deep dive, quiz questions, suggested question), image matching against open licence collections, human review, publish.

**What exists now** is the front of that: the fact contract, the provenance types, and a validator that enforces the standard. No extraction, no LLM calls, no scripts — with ten facts there is nothing to automate, and those ten exist to set the bar the automation is later measured against. See `afrifacts-factory/README.md`.

**Source acquisition is manual and curatorial, not automated.** Choosing which twenty monographs to mine is judgment work with enormous leverage, and it is where a person who knows the material beats any crawler. Automate extraction from chosen sources; never automate the choosing.

**Surprise is scored on three axes**, each 1–5, all needing 3 or better: prior probability (would an educated Nigerian already know this?), specificity (a number, a name, a date), and explicability (can you say why in two sentences?). "Is this surprising?" is too vague to apply consistently across several hundred facts by one reviewer over months. Most candidates die on prior probability, and that is the filter working.

**Sole-reviewer drift is the real risk.** The bar falls as the reviewer gets steeped in the material and everything starts to feel obvious. The first ten facts are the calibration set: re-read them periodically and check new facts still clear the same bar.

Non-negotiable rules, enforced by `validate()` in the factory:

- Facts are **extracted from sources**, never generated from a model's memory. Every fact keeps the passage it came from, quoted verbatim. No passage, no fact.
- Every source carries a **stable locator** — a DOI, an ISBN with a page, or an archive reference. A URL alone is not enough: URLs rot, and a dead link is indistinguishable from no source.
- **Press and reference sources cannot carry a fact alone.** A newspaper archive is strong evidence that something was *reported* and weaker evidence that it *happened* — the paper is usually relaying a figure from elsewhere.
- Facts **decay**. Anything resting on current economic or demographic data is marked volatile and carries a date to be checked again. Settled history does not.
- **Nothing goes live unreviewed.** A human approves every fact.
- The surprise filter is the point. Facts an educated Nigerian already knows get rejected. The corpus is the moat, and it is made of things people did not know.
- Manually written facts enter the same table, meet the same required fields, and pass the same review gate. Same standard, different door.
- The LLM provider is **not fixed**. All model calls go through one wrapper module so the provider can be swapped by changing a single file. Prompts are stored as plain text, not tied to any SDK.

## 8. Tech stack

- **App:** React Native with Expo (SDK 54). TypeScript, strict mode. **expo-router** for navigation, which is file-based routing on top of React Navigation. Reanimated for the swipe feed and transitions.
- **Styling:** whatever keeps the design system consistent, but colours and type must come from a single theme file, not hardcoded in components.
- **Studio:** Next.js, JavaScript with JSDoc types. One process serves the pipeline board, the review pages and the API routes that run the stages. The separate admin project is gone: the dashboard and the pipeline are the same app.
- **Database:** Supabase. Not wired up yet.
- **LLM:** provider agnostic, behind a wrapper. Not written yet.

Expo moves fast and its APIs change between SDKs. Read the versioned docs at https://docs.expo.dev/versions/v54.0.0/ before writing against an Expo module, rather than relying on remembered API shapes.

**Folder layout.** expo-router owns the `app/` directory: a file there is a route, and that is the only thing `app/` is for. Everything else lives under `src/`.

```
app/                      routes only, thin files
  _layout.tsx             root stack, fonts, theme provider
  (tabs)/_layout.tsx      the four tabs
  (tabs)/index.tsx        home feed
  (tabs)/quiz.tsx         quiz entry
  (tabs)/saved.tsx        bookmarks
  (tabs)/profile.tsx      profile
  fact/[id].tsx           deep dive
  quiz/play.tsx           quiz flow
  quiz/score.tsx          score
src/
  components/             presentational components
  data/                   the data layer, index.ts is the only entry
  theme/                  colours, type scale, spacing
  types/                  the fact contract
```

Conventions:

- A file in `app/` is a route and stays thin. It wires params and composes components from `src/`; screen logic and layout live in `src/components/`.
- One component per file, named the same as the file. `PascalCase.tsx` under `src/`, expo-router's lowercase route names under `app/`.
- Keep components presentational. Data shaping happens in the data layer.
- The `@/*` path alias is already configured in `tsconfig.json`, so import as `@/src/theme`.

## 9. Build order

**Phase 1, now: the app UI with dummy data**

1. Project setup: strip the Expo starter screens, theme file with the colour families and fonts, the fact types, navigation shell with the four tabs.
2. The data layer module returning dummy facts.
3. Home feed with both card variants and the swipe gesture.
4. Deep dive screen.
5. Quiz flow and score screen.
6. Profile, bookmarks, country picker.
7. Share card components, rendered but not yet exported.
8. Polish: animations, haptics, dark mode.

**Phase 2, later:** database, the content factory, the admin review dashboard, real share card export, the AI question feature, ads and premium.

Content work runs in parallel with phase 2 and has the longest lead time. An app with 40 facts is a demo. Target several hundred approved facts before launch.

## 10. Guardrails

Things that must never happen:

- **Never hardcode Nigeria.** Country is always a data value. No `if (country === 'NG')` branching in UI code.
- **Never put API keys or service keys in the app project.**
- **Never fabricate a fact.** If a fact has no source, it does not ship.
- **Never use AI generated images of real artifacts, people, or places.** An AI imagined Benin Bronze that is subtly wrong destroys the credibility the whole app rests on. AI imagery is acceptable only for abstract patterns and textures.
- **Never drop a photo credit** from a card or an export.
- **Never gate the first fact.** No signup wall, no country selection screen, no onboarding carousel before the user sees value. The app opens into a fact.
- **Never let the quiz shame a low score.** Playful, never mocking.

## 11. Status

### App (`afrifacts/`)

All six screens built against the design PDF and rendering from dummy data.

- Expo SDK 54, TypeScript strict, expo-router with typed routes.
- `src/theme/`: six colour families, amber, brand green, quiz feedback, light and dark neutrals, type scale, spacing, share-card geometry. `useTheme()` resolves the scheme so no component calls `useColorScheme()` directly.
- `src/data/index.ts` is the only data entry point, as section 3 requires. `getFeed()` injects a quiz card every 3 facts.
- Screens: home feed (both card variants, paged vertical swipe), deep dive, quiz, score, saved, profile, country picker.
- Share works end to end: `ShareCard` and `ScoreShareCard` render at 1080x1350, captured with `react-native-view-shot`, handed to the native sheet by `expo-sharing`. Needs a dev build — `npx expo run:android` — since Expo Go has no native module.
- Verified: `tsc --noEmit` and eslint clean, Android and web bundles compile.

**Divergence from section 6, deliberate:** the design PDF uses **Poppins**, not Sora, and leans on Bold where section 6 says "two weights only". The screens were treated as the source of truth. Section 6 has not been rewritten — decide which wins before more type work.

**Known bug:** images do not appear on the exported share card. Almost certainly the remote image has not decoded by capture time; the fix is to gate capture on `onLoadEnd` rather than a frame count.

**Placeholders:** four dummy facts carry `picsum.photos` images, marked as placeholders in both the credit and the licence field. Replace with open-licence photography before launch.

### Studio (`afrifacts-studio/`)

Started early — content has the longest lead time and cannot be compressed at the end. Next.js; the pipeline, the review gates and the run buttons are one app.

- `lib/types/fact.js` mirrors the app's contract field for field. The two are separate by design (section 2); change both in the same commit.
- `src/types/provenance.ts`: passage, stable locator, source tier, three-axis surprise score, named reviewer, decay kind. The app never reads any of it.
- `src/validate.ts` enforces the standard, including that a placeholder is not a value — `passage: 'TODO: ...'` is an error, not a pass.
- `npm run check` validates the corpus and exits non-zero on any error.
- `npm run studio` is the review dashboard: a local page on `localhost:4321` listing every fact with its blockers, passages, sources and surprise scores, and approve / reject / needs-work buttons. Node's `http` module and one HTML file, no framework and no dependencies — this project holds the LLM keys, so its dependency list stays short on purpose.
- Approve is disabled while `validate()` reports an error, so the standard cannot be clicked past.
- Decisions are written to `reviews.json`, never back into the corpus `.ts` files — a clicked button must not rewrite hand-authored source. `check` reads the same file, so the dashboard and the CLI cannot disagree. That file is what a Supabase `reviews` table replaces later.
- Facts are still authored by hand in `src/corpus/*.ts`. The studio reviews; it does not write.

**The pipeline exists and runs.** Five stages, each testable alone:

- `src/llm/index.ts` is the one file that knows a provider. This is proven, not asserted: the pipeline was built on Gemini and moved to **DeepSeek** (`deepseek-chat`, OpenAI-compatible) by rewriting one function. No other file changed. The Gemini free tier's 20 requests/day was the reason for the move. Prompts live as plain `.txt` in `src/llm/prompts/`, so they can be edited and diffed without touching code. Includes retry with backoff — a 503 mid-run costs a pause, not the run.
- `src/pipeline/sources.ts` is the hand-picked seed list, currently ten Wikipedia articles. Picked on one criterion: subjects whose *name* is widely known but whose *detail* is not. Never automate the choosing (§7).
- `npm run fetch` pulls full article plain text into `_cache/`, keyed by revision id, stripping the references section. The cache is not an optimisation — the verifier needs the exact bytes the model saw, and it lets the prompt be re-run for free.
- `npm run extract` asks the model for facts with verbatim passages, then gates every one of them through `src/pipeline/verify.ts`. **There is no model in the verifier**, deliberately: asking a model whether a model hallucinated is asking the same faculty that produced the error to detect it. It string-matches the passage against the cache, and checks that every number and most content words in the fact also appear in the passage — that second check is what catches a real quote with the model's own knowledge welded onto it.
- Survivors go to `_candidates.json`, failures to `_rejects.json` **with their reason**. Rejects are kept because the bar is not calibrated yet, and a filter that is silently too harsh looks identical to Nigeria being short of surprising facts.
- `localhost:4321/triage` is the candidate view: fact, passage, scores, Keep / Bin. Verdicts stay in the browser — a triage note is not a review decision, and nothing enters the corpus from that page.

**What the pipeline does not do well, measured not guessed.** On the first real page it returned 20 candidates of which roughly 3 were worth keeping. Two failures are consistent and prompt wording did not fix either:

- **Score inflation.** The model rates almost everything 4–5 on prior probability, including page furniture like a list of heritage organisations. It scores *obscure* when the question is *surprising*. The scores are shown in the triage UI as a flagged hint, never as a gate.
- **It cannot feel what is boring.** Explicit instructions not to name researchers, not to write facts about a discovery's significance, and not to state administrative trivia were all violated in the same run that obeyed the phrasing rules.

The conclusion those two point at: the model is a good extractor and a bad judge. Expect ~3 keepers per page and let the human do the filtering — which is what the Bin button is for, and what makes the kept/binned split the calibration data.

**What fixed the output was examples, not instructions.** `src/calibration/exemplars.ts` holds the founder's own 22 facts, and they are injected into every extraction prompt. Before them the pipeline returned pottery-fabric analysis; after them it returned Killmonger quoting Igbo Landing in *Black Panther*, and Babayaro playing 12 hours after his brother died. Prose describing "make it interesting" had already failed twice. The exemplars serve two roles: the target shape for the model, and candidates for the corpus in their own right — each still needs a source and a passage before it ships.

The pattern they encode, which ten kingdom-and-archaeology pages could never have produced: a **person** at the centre; the surprise often a **connection** between two things the reader already knows separately; **recognisable** life — a district, a band, a company in the news.

**One story, one fact.** A famous fraud is one story, not eight — the sum, the impersonation, the arrest and the bribe are angles on it. The prompt now asks the model to list the genuinely separate stories first and write each once, two variants at most. Measured on the same page: Nwude went 8 facts to 3, Babayaro 8 to 1, and the quality rose rather than fell. Dedupe still runs behind it (similarity 0.45, cap 6/document) but now culls almost nothing, which is the right order — fix it at the prompt, not the filter.

**Corpus: 132 entries, 131 publishable.** The pipeline's 131 enriched facts are approved and in the app; `nf_0087` (Benin earthworks) is a hand-authored worked template with its two sources identified and its passages still to be transcribed, and it fails `check` until they are, which is correct.

Pipeline ids start at `nf_1001` and hand-authored ids below it, because they once collided: the corpus held 132 entries under 131 ids, and a bulk approval marked the blocked hand-written fact approved because the pipeline fact sharing its id validated clean. `approve-all.ts` now refuses a duplicate id rather than guessing which fact was meant.

**Image matching runs.** `npm run images` is stage 6, and its premise is that there is no matching problem to solve: the article a fact came from already has images, chosen by human editors, carrying machine-readable licences. It harvests rather than searches.

- The licence filter is code, never the model — the same argument that keeps a model out of the verifier. The load-bearing check is one field: `imagerepository: 'shared'`. Commons forbids non-free content by policy, so a file hosted there is free for commercial use and derivatives, while fair-use files (album covers, logos, the good photo of a living person — exactly the tempting ones) are hosted locally on en-wiki and are filtered out by that field alone. NC is excluded from day one, not later, because the app plans ads and premium.
- The model's only job is to pick from the surviving list or decline, and the prompt makes declining the expected answer. Measured on the real corpus: **32 proposals from 131 facts, 173 licence-clean images pooled across 42 articles.** That is 24%, against §4.1's target of roughly one third photo cards — reached by taking only the honest matches, with no forcing.
- Decisions live in `images.json` keyed by fact id, and pools in the regenerable `_image-pool.json`. Same split as `reviews.json`: `_enriched.ts` is overwritten on every enrich run, so nothing precious may live there.
- Nothing is published unreviewed. Every match is `proposed` and waits at `localhost:4321/images`, where the reviewer can accept, reject, or swap in any other image from that article's pool. Accepting needs a name, and a file outside the licence-checked pool is refused.
- `panelColor` uses the category's dark stop rather than a tone sampled from the photo. §4.1 asks for the image's dominant tones and §6 asks for one colour family per screen; the category wins because a muddy sampled brown breaks the colour identity, and because sampling means decoding JPEGs in the project that holds the LLM keys. Swappable in `src/theme.ts` if the cards look detached.

**Runs are incremental, and stoppable.** Every paid stage used to redo everything on disk each time it was clicked. Extract sent all 46 cached documents to the model on every Run, rediscovering candidates already sitting in triage, then overwrote `candidates.json` with them — losing every earlier run's findings in the same act. Enrich was worse: it mints a new fact id per run, so re-enriching a promoted candidate did not update its fact, it created a second fact saying the same thing.

- `data/ledger.json` records what has been extracted, at which **revision** and with which **model**. A re-fetched article is a different document and reopens for extraction; an unchanged one is skipped. It is in `data/` because it is not reproducible — deleting it costs a full re-run at full price.
- Extract **merges** into `candidates.json` per slug. A document that was re-run replaces its own rows; every other document's rows are carried through untouched.
- `dedupeAgainstCorpus` culls candidates the corpus already has, by lineage first, then passage, then word overlap. Lineage is the `candidateKey` stored on every promoted fact, so a candidate that literally became a fact is recognised as such rather than judged for similarity. Measured on the real corpus: 137 candidates against 131 facts, 131 culled by lineage, 6 genuine survivors, 6ms.
- Enrich skips candidates already promoted, using that same key. Neither stage's skip can be reached by accident: `force` is a separate button that names what it will re-spend and asks first.
- Every Run button says how much work it will actually do, and refuses when the answer is none.
- Stages can be **stopped**. The job runner owns an `AbortController` and hands the stage its signal; a stop lands between documents, keeps what finished, and records it. Before this the only way to cancel a run that was spending money was to kill the dev server, which also lost the log. Ctrl-C does the same for the CLI scripts.

`npm run backfill` reconstructs both records for work done before they existed — the ledger from the pipeline's own output, the lineage by exact passage match. Idempotent.

### Next

- Review the 32 proposed images at `/images`. They are all still `proposed`, so the app currently ships 131 typographic cards and no photo cards. Some proposals are deliberately loose — a map for a fact about territory, a newspaper page for a televised event — and rejecting those is the point of the gate.
- Fix the share-card image capture before accepting many images. It is currently latent because no fact has an image, but a dropped photo credit on an export is a licence breach rather than a cosmetic bug. Gate capture on `expo-image`'s `onLoad` with a timeout fallback, not the two `requestAnimationFrame`s in `app/(tabs)/index.tsx`.
- The photo-card variant of `FactCard` still sets fact text at a fixed size. The typographic variant now steps 29 → 23 → 19 by length, because real facts run to a median of 124 characters against the design PDF's much shorter samples. The photo panel is shorter than the card and needs the same treatment before photo cards ship.
- Images are hotlinked to Commons thumbnails. That is fine for phase 1 and wrong for launch: re-host in Supabase Storage at 1080px wide, which serves both the in-app card and the 1080×1350 share card.
- Wikipedia is tier `reference`, which the validator warns on alone. Corroboration comes from each article's own footnotes; that stage is not built.
- Write the ten calibration facts: five History, five Culture, fully sourced with real passages. This sets the bar everything later is measured against.
- Some facts are sourced to a disambiguation page (`Darling`), which means the seed list picked up a redirect. Worth a pass over `data/sources.json`.
- Decide the Poppins/Sora divergence.
- Delete `afrifacts-factory/` and the two migration scripts. Not under git, so it needs a deliberate go-ahead.
- The edit / retire / AI-rewrite UI on `/review`. The store API is built and tested; nothing in the browser reaches it yet.
- Paste-a-fact and single-fact runs, manual image upload with a licence form, source suggestion behind a human gate, and the Supabase push.

Update this section as work lands so this file stays useful.

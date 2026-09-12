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
- **Category chips:** a horizontal scrolling row. "For You" is default and active. Then History, Business, Culture, Food, Sports, Records. These are topic lanes, not countries. The row is derived from the categories the corpus actually holds, so a lane with no facts grows no chip.
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
export type Category =
  | 'History' | 'Business' | 'Culture' | 'Food' | 'Sports' | 'Records' | 'Health';

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
| Records | `#D8E4A4` | `#4F6A11` | `#28350B` |
| Health | `#A7DCE3` | `#0E6273` | `#04313A` |
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

## 7.1 How a fact is written

The fact line is the product. It is what fills the card, what gets screenshotted, and what a friend reads in WhatsApp with no other context. Everything else in an entry supports it.

It took three rewrites of the Records set to get this written down, and both failures are worth keeping because each looked like a fix for the other.

**Failure one: the certificate.** Facts were written from Guinness record pages, which are 230 to 514 characters of one templated sentence. Every fact came out as that template rearranged, and the whole category read like a record book.

**Failure two: the clipping.** The fix for the first was to pull narrative from the news write-up, but the narrative was pasted in as the claim. The lines came out as paragraphs lifted mid-flow out of an article: "The rules gave Samson Ajao five minutes of rest after each hour...", "The lights went out three or four times during Symply Tacha's...". Each opens on a rule or an anecdote, and not one of them ever says what the record is. A fact that has to be inferred is not a fact.

### The rules

**1. State the thing. Do not allude to it.** The subject of the sentence is the claim, not the context around it. For a record, name the record.

> No: Symply Tacha did 144 makeovers in 24 hours.
> Yes: Symply Tacha holds the record for the most cosmetic makeovers in 24 hours, 144 of them.

**2. One claim, one tail.** The house corpus is short: "Adichie was the first woman to receive a chieftaincy title in her hometown of Abba." That is a whole fact. Stack a second and a third idea into the line and it stops being quotable. If a detail is fighting for room, it belongs in the deep dive.

**3. The number is the spine, the image hangs off it.** A figure alone is a certificate. A figure with one thing you can picture is a fact: 215 hours and never sleeping, 15.37 m and taller than the Hollywood sign is wide, 8,780 kg shared out as 16,600 portions.

**4. Vary the opening.** Person first ("Hilda Baci cooked the largest...") and claim first ("The longest handmade wig in the world runs 351.28 m...") both work. A whole category opening the same way reads like a database dump. Roughly a third opening on the claim is about right.

**5. Never lift a sentence from the source.** The `passage` field is verbatim and that is its job. The `fact` field is composed. The verifier permits a stray content-word ratio up to two thirds precisely so a fact can be written rather than copied, and a good rewrite shares fewer words with its source than a lazy one.

**6. Write inside the gate, not around it.** Every digit in the fact must appear in a passage the fact cites, so a figure is quoted exactly as the source states it. "12,381.02 m2" rather than "over 12,000 m2", because the second is a number the source never says.

### The deep dive

Three paragraphs, narrative, in the same order every time. Not an essay, and not commentary on the fact.

- **Set the scene.** Who, where, when, and the number. Give the reader the situation before the significance.
- **Develop it.** The rules, the difficulty, the things that went wrong, the detail the fact line had no room for.
- **Widen it.** What came before, what it connects to, what the person did next.

`whyItMatters` is two or three plain sentences on why the fact is more than trivia. It connects outward: to a history, a pattern, a person's reason. It does not restate the fact and it does not admire it.

The tell of a bad deep dive is a sentence that analyses rather than tells. "That the total carries seconds as well as hours is the tell of an adjudicated record" is writing about the fact. "He told NTA News he did not sleep in them at all" is the fact. The second is what people read.

Numbers above 100 in the deep dive must appear in the cached source document, so the prose is grounded by the same standard as the claim.

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

**The quiz is the part testers actually liked, so it was built out.** Two changes, both behind the same finding: friends who tried the app kept going back to the quiz and not to the feed.

**Nothing is asked twice while something is unasked.** `getQuiz()` drew three at random from a flat list with no memory of what had been served. That was fine at six questions and wrong at 480: a daily player starts meeting repeats inside a week, and a repeat is not a quiz, it is a recall test. `Progress` now carries `answeredQuestions`, and the dealer works in three tiers. Three different facts each handing over an unseen question is the normal run. When fewer than three facts still hold something unseen, the distinct-fact rule yields and one fact contributes twice, because never-repeat is the stronger promise and it is the one the quiz tab prints. Only a corpus of under three facts reaches the third tier and gets a genuine repeat. When everything has been answered the record clears and the cycle restarts, which is the honest end of a finite set.

Measured against the real 480 questions over 160 facts, ten playthroughs: every question asked exactly once, zero repeats before the corpus ran out, no short runs, at most one run taking two questions from one fact, and the cycle resetting exactly once. The first version of the dealer scored one repeat per playthrough, which is what put tier two in.

**A challenge is three question ids and a score, packed into eleven characters.** The score screen already asked "Think you can beat me?" and could not deliver on it: a fresh run draws at random and would never be the same three questions, so the friend who read the taunt had no way to take it. A challenge fixes the run, so both people answer the same thing and the comparison means something. The score screen shows the head to head on the way back, and losing is never rubbed in.

It travels twice in one message, as a link and as a code, and that is not redundancy. A custom scheme is not tappable everywhere: WhatsApp and X linkify http(s) and leave `afrifacts://` as plain text, so a share carrying only a deep link would be dead text in the app it was written for. The code is the fallback, and `decode` scans rather than anchors so it accepts a whole pasted message, which is what people actually paste. When AfriFacts has a domain and Android App Links, the link becomes the only path that matters and the code can go.

`src/quiz/challenge.ts` is pure string arithmetic with no imports, and `link.ts` holds the two values that need the environment. That split is the whole reason the codec could be round-tripped against all 480 real question ids in a bare Node process, 640 encode-decode pairs with zero failures: one `expo-constants` import would have made it exercisable only inside a running app. The packing leans on the studio emitting exactly one id shape, `q_nf_0101_2`, and `encode` returns null rather than guessing when it meets anything else, so the button hides instead of producing a code that resolves to the wrong questions.

**Divergence from section 4.4, deliberate:** the score screen now has two share actions, and the hero is "Challenge a friend" rather than "Share your score". §4.4 named one hero and picked the card, written when a card was the only thing a run could produce. A card is an advert; a challenge is an invitation with a reply. The card keeps its place directly underneath as an outlined secondary, so nothing was removed to make room. The two cannot be merged: `expo-sharing` sends a file and `Share.share` sends text, and Android's share intent carries one or the other.

**The feed no longer shows two facts in a row about the same thing.** Two separate problems wearing one symptom.

The first: `spreadByCategory` existed and worked, but only the shuffle button called it. The default deal, and the one a pull-to-refresh returned to, was chronological. Facts mined from one article are numbered consecutively, so that is the most clustered order there is and it was what every reader met on first open.

The second: category was the only thing being spaced, and it is too coarse. Six Abiola facts are split across Culture and History, so category spacing would happily put "Abiola edited the school magazine" next to "Abiola was detained for four years" and score it a success. To a reader that is the same card twice. `source.name` is the fix and it costs nothing, because it is the article a fact was mined from, so everything sharing a subject already shares it. The related ids catch the remainder.

Measured on the live 126-fact corpus, share of neighbours that match:

```
corpus order    category 59.2%   subject 60.8%   longest run 12
plain shuffle   category 29.6%   subject  1.6%   longest run 4
now             category  0.0%   subject  0.0%   longest run 1
```

Three in five neighbours were the same article, which is the number that says corpus order was wrong twice over rather than once.

Subject spacing rides on top of the category rule and never overrides it, which is what keeps the category result intact. It gets exactly two free choices: which of the top two categories to take when neither is forced, and which fact to take out of the chosen bucket. Both prefer a fact unlike the last one and both fall back rather than fail.

The default deal is now that spread on a **fixed seed**, not the clock. A refresh has to return to the same order or "Fact #1" would mean a different card on every pull; the shuffle button is where a reader gets a different arrangement, and only it seeds from the clock. Card numbering is untouched: it was always derived from the canonical sort in `index.ts`, never from the deal.

**The notification offer was redesigned.** It was a white box with a hairline border, a grey circle and two small lines of text, which read as a system alert rather than as part of the app. It now uses the amber family, which section 6 already reserves for streaks and daily-goal moments and which is the one family that cannot collide with the category card behind it. A solid fill also means it reads correctly in dark mode without a second palette, since the sheet brings its own ground instead of borrowing the screen's. The two times are pills with a sun and a moon rather than a clause in a sentence, because they are the entire substance of what is being agreed to. It springs up on entry, and the wrapper is still `box-none` with no scrim: section 10 forbids a wall in front of the first fact, and this stays an offer rather than a door.

**A quiz run can be 3, 10 or 20, and right and wrong now sound different.**

Length was hard-coded at three in `QUIZ_LENGTH` and read straight out of the constant by the dealer. It is a parameter now, persisted in `src/quiz/length.ts` because it is a preference rather than a property of a run, and re-asking on every visit to the tab is the kind of friction that makes a feature feel unfinished. The chips sit on the quiz card; three stays the default. The feed's injected quiz card still runs three and is deliberately not wired to the setting: it is an interruption in a feed rather than a session anybody chose to start.

Measured over a full pass of the 492 questions:

```
length  3   164 runs   492/492 seen   0 repeats   0 runs reusing a fact
length 10    50 runs   492/492 seen   8 repeats   0 runs reusing a fact
length 20    25 runs   492/492 seen   8 repeats   1 run reusing a fact
```

The eights are arithmetic rather than a regression: 50 runs of 10 is 500 slots against 492 questions, so the final run is eight short of fresh material either way. Nothing avoidable repeats.

Three things had a hard-coded three in them and would have broken at twenty. The segmented progress bar becomes a single continuous bar past eight questions, because twenty segments four pixels wide read as a dotted line rather than as progress. The check marks on the score screen and on the share card now shrink and wrap with the run length; at a fixed size, twenty of them ran off both edges of a phone and off the edge of the 1080-wide export. A challenge is the one thing that stays at three and cannot follow, since its code packs exactly three question ids; the score screen already hid that button when `encode` returned null, so a long run simply has no challenge to send.

**Sound.** The quiz had distinct haptics already, Success against Warning, and in the hand that is not enough: people read the colour before they read the buzz, which makes the haptic decoration rather than information. The two tones are synthesised sine waves generated into `assets/sounds/`, so nothing shipped in the APK carries a licence or a credit to lose. Correct rises, E5 into A5, over in a quarter second. Wrong is one low note easing downward, because §10 forbids the quiz shaming a low score and a buzzer is exactly that in audio. `expo-audio` plays them with `interruptionMode: 'mixWithOthers'`, the documented mode for short UI effects, so somebody listening to music while they answer keeps their music. Silent mode is respected: a quiz sound is not important enough to override a switch somebody deliberately flipped. Players are created imperatively rather than through `useAudioPlayer` because the clip has to seek to zero before each replay, or the second correct answer in a row is silent.

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

**Corpus: 122 entries, 119 publishable, all 119 pushed to Supabase.** `nf_0087` (Benin earthworks) is a hand-authored worked template with its two sources identified and its passages still to be transcribed, and it fails `check` until they are, which is correct. Two more are queued. Everything else is live in `afrifacts` on Supabase, with 360 quiz questions and 114 image decisions beside it.

Pipeline ids start at `nf_1001` and hand-authored ids below it, because they once collided: the corpus held 132 entries under 131 ids, and a bulk approval marked the blocked hand-written fact approved because the pipeline fact sharing its id validated clean. `approve-all.ts` now refuses a duplicate id rather than guessing which fact was meant.

**Image matching runs.** `npm run images` is stage 6, and its premise is that there is no matching problem to solve: the article a fact came from already has images, chosen by human editors, carrying machine-readable licences. It harvests rather than searches.

- The licence filter is code, never the model — the same argument that keeps a model out of the verifier. The load-bearing check is one field: `imagerepository: 'shared'`. Commons forbids non-free content by policy, so a file hosted there is free for commercial use and derivatives, while fair-use files (album covers, logos, the good photo of a living person — exactly the tempting ones) are hosted locally on en-wiki and are filtered out by that field alone. NC is excluded from day one, not later, because the app plans ads and premium.
- The model's only job is to pick from the surviving list or decline, and the prompt makes declining the expected answer. Measured on the real corpus: **32 proposals from 131 facts, 173 licence-clean images pooled across 42 articles.** That is 24%, against §4.1's target of roughly one third photo cards — reached by taking only the honest matches, with no forcing.
- Decisions live in `images.json` keyed by fact id, and pools in the regenerable `_image-pool.json`. Same split as `reviews.json`: `_enriched.ts` is overwritten on every enrich run, so nothing precious may live there.
- Nothing is published unreviewed. Every match is `proposed` and waits at `localhost:4321/images`, where the reviewer can accept, reject, or swap in any other image from that article's pool. Accepting needs a name, and a file outside the licence-checked pool is refused.
- `panelColor` uses the category's dark stop rather than a tone sampled from the photo. §4.1 asks for the image's dominant tones and §6 asks for one colour family per screen; the category wins because a muddy sampled brown breaks the colour identity, and because sampling means decoding JPEGs in the project that holds the LLM keys. Swappable in `src/theme.ts` if the cards look detached.

**A sixth category, Records, and adjudicated sources.** `Category` gained `Records` in both contracts, its colour family in both themes, and its lane in the extraction prompt. The lane is defined narrowly on purpose: a superlative somebody official keeps score of. If nobody adjudicates it, the fact belongs in its subject's own lane, and a fact about a footballer is `Records` only when the record itself is the point. The chip is derived from the corpus, so it appears the day the first Records fact lands and not before.

Guinness World Records needed no new fetcher. It is a `web` source like any other: cited by URL, located by content hash. What it needed was a different way of being cleaned and gated, because a record page is not an article. Measured: 647 characters, two sentences, and `fetchWebPage` refused it as a link list. That refusal is correct for what it was written to catch, so the gates were left alone and a stored `profile` field selects between them. `article` is the default and every one of the 41 existing sources normalises to it.

The `record` profile keeps complete sentences only, which drops the data widgets `readable` flattens into prose ('23 total number', a bare row of holder names), then names the site footer explicitly because it is made of real sentences and survives that rule. Leaving the footer in is worse than clutter: the model scores page furniture 4 to 5 on prior probability, so a registered-office address comes back as a candidate fact. The gate then asks for the one thing a record page must have, a sentence carrying a number. A GWR page that renders in JavaScript, or that has redirected to a listing, still fails.

GWR is tier `institutional`, not `reference`. On 'who holds this record' it is not relaying a figure from elsewhere, it is the body that issued it, which is the standing `nigerianstat.gov.ng` has on a population count. The limit is worth knowing: the same page also carries history and colour around the record, and on that material it is a reference work like any other. The tier is per host and cannot express the distinction. A reviewer can.

**Twelve Records facts, written from memory and then verified.** The working method is the reverse of the pipeline's: recall a record, find its page, quote it. That is not a weaker standard, because the gate is the same gate. What protects a fact is the passage matching the fetched bytes, not the order in which the fact and the passage were found. Where memory produced a record whose page would not fetch, or whose numbers did not match what came back, the candidate died. Two guessed slugs were refused by the record gate rather than quietly accepted, and the longest-drawing title turned out to be China's and was dropped.

They live in `corpus/records.js` as `origin: 'manual'`, the same door §7 gives any hand-written fact, and all twelve pass `passageInDocument`, `factGroundedInPassage` and `proseGroundedInDocument` against `_cache/`. `validate()` reports zero errors and zero warnings on them: `institutional` clears the corroboration warning honestly, which is the whole reason the tier judgment was made. They are approved, carry 36 quiz questions, and are live in Supabase.

**No free-licence photograph of a Nigerian record holder exists, and that is a measurement.** Commons returned zero licence-clean images for Hilda Baci, Tunde Onakoya and Natacha Akide. The reason is structural rather than incidental: a photo of a living person is normally fair-use and hosted on en-wiki rather than Commons, so `imagerepository: 'shared'` filters exactly the tempting ones out. The web-search path would return their faces and no licence at all, and §10 plus the licence make that unusable for publication, so it was not used. Four facts carry context images instead, all CC BY-SA 4.0 off Commons and all credited: Nigerian jollof on the rice record, Times Square on the chess record, an Abuja road on the walking record, and Lagos on the dance relay. That was 4 of 12.

**All twelve now carry an image, and the licence chain is intact.** On the instruction to find images anywhere, the search was widened rather than loosened: nine new Commons pools (Osogbo, Osun State, Rivers State, Abeokuta, Hollywood Sign, Sunderland, Cosmetics, Magic, Autism rights movement), 105 more licence-clean candidates, pools now 59. Every one of the eight new images is CC BY or CC BY-SA off Commons and carries its credit.

What was not done, and why: the web-search path returns the record holders' actual faces with no licence at all, and publishing those would be someone else's copyright on a commercial app that plans ads. `nf_0103` is the sharpest case, because the holder is 14, so it carries the neurodiversity infinity symbol that sits at the heart of his painting rather than any photograph of him.

**The matches were bad because the harvester searches by article, not by subject.** `fetchPool` pulls the images that happen to sit on a Wikipedia article, so harvesting for a wig record meant harvesting the Abeokuta article and getting a road. The fix was not a wider licence, it was a different query: Commons has a file search (`generator=search&gsrnamespace=6`) that finds images by what is in them, and it returns jollof rice for jollof rice, hairpieces for a wig record, a pencil portrait for a portrait marathon, Nigerian dancers for a dance relay, and a Chicken Republic in Abuja for the record that started at one. Same licence gate, same `licenceVerdict` and `Restrictions` checks, 240 more candidates, pools now 72. Six of the twelve were replaced on that basis.

Three rules came out of picking them. Prefer the subject over the place, because a road near where a thing was measured is not a picture of the thing. Never use a photograph of a different named person doing the same activity: a FIDE tournament photo under a chess record reads as a photo of Onakoya, which is why `nf_0106` carries an 1899 magic poster rather than a photograph of a magician. And keep the place shot where the fact names the place, which is why Times Square, the Hollywood sign and jollof rice stayed exactly where they were.

`nf_0107` is the one honest miss. A record for counting out loud on YouTube has no subject to photograph, and the obvious search terms return recording studios, which would imply a professional setup she did not have, or worse. It keeps a Rivers State market as place context.

Every one of the twelve is context rather than the record itself, and each decision says so in its own `reasoning` field.

**The record page is the wrong page to mine, and the first twelve facts proved it.** A GWR record page is 230 to 514 characters and the load-bearing part is one templated sentence: "The longest X is N and was achieved by Y in Z on DATE." Any fact written from it is that template rearranged, so all twelve read like a record book rather than like AfriFacts. This was not the verifier being strict. §11's exemplars work because a Wikipedia article carries narrative; a certificate carries none.

The story is on the same site, on the news write-up. Same record, 2,957 characters instead of 230, and it holds the things worth knowing: that Samson Ajao asked doctors beforehand which foods would minimise his toilet breaks, that the fast food record bans private transport so Nwana walked 25 km across Abuja, that the longest handmade wig is built on a bicycle helmet, and that there is a record for largest serving of Ghanaian style jollof rice which currently has no holder at all.

Seven facts were rewritten against news passages, with the record page kept as a second source for the certified number. That makes the provenance stronger rather than weaker: two independent institutional sources per fact, 19 source records across the twelve.

**Then all twelve were rewritten again, and that pass produced section 7.1.** Pulling in the narrative fixed the flatness and introduced a worse problem: the news sentences were pasted in as the claim, so the lines read as paragraphs clipped out of an article and none of them ever said what the record was. Section 7.1 is the rule set that came out of it, and the twelve are now written to it, fact line and deep dive both. The deep dives were rewritten from analysis into narrative to match the rest of the corpus.

The five that had no news write-up (`nf_0102`, `nf_0106`, `nf_0107`, `nf_0110`, `nf_0112`) are no longer the weak ones. Naming the record in the fact line is exactly what a certificate page is good for, so the thin sources stopped being a problem the moment the voice was right. That is worth remembering: it was a writing problem wearing the costume of a sourcing problem, and the first two attempts to fix it went after the sources.

Passages, sources and figures were not touched. All twelve re-verified against `_cache/`: 19 source records, zero failing on `passageInDocument`, `factGroundedInPassage` and `proseGroundedInDocument`. A fact citing two sources is checked against both passages joined, which is the same standard as a one-source fact rather than a softer one. The twelve approvals were re-recorded against the rewritten text rather than left standing from before it, and the 36 quiz questions were cleared and regenerated so only those twelve were re-billed.

**A hole worth knowing: editing a hand-authored corpus fact does not reset its approval.** `editFact` in the store drops a fact out of `approved` and re-runs the verifier when the claim or passage changes, which is what stops edit-after-approve being a hole through the review gate. Facts in `corpus/*.js` never pass through it, so their `reviews.json` entry survived a complete rewrite of every claim in this file. The rewritten text was re-verified by hand, but nothing forced that.

Two rules did visible work. Guinness scores below 3 on prior probability are errors rather than warnings, so the famous records could not be waved through: the jollof and chess entries are angled onto the 80% composition rule and the 473 games, which is §7's "name widely known, detail not" applied to a record instead of a monograph. One-story-one-fact cost two entries, since Helen Williams holds three wig titles and Symply Tacha's 8-hour record is the same attempt as her 24-hour one.

Two things follow from their `robots.txt`. `/_search/` and `/search-content/` are disallowed, so records cannot be discovered automatically, which is what §7 asks for anyway. And `/images/` and `/assets/` are disallowed, so stage 6 harvests nothing from GWR: these facts are typographic cards.

**Runs are incremental, and stoppable.** Every paid stage used to redo everything on disk each time it was clicked. Extract sent all 46 cached documents to the model on every Run, rediscovering candidates already sitting in triage, then overwrote `candidates.json` with them — losing every earlier run's findings in the same act. Enrich was worse: it mints a new fact id per run, so re-enriching a promoted candidate did not update its fact, it created a second fact saying the same thing.

- `data/ledger.json` records what has been extracted, at which **revision** and with which **model**. A re-fetched article is a different document and reopens for extraction; an unchanged one is skipped. It is in `data/` because it is not reproducible — deleting it costs a full re-run at full price.
- Extract **merges** into `candidates.json` per slug. A document that was re-run replaces its own rows; every other document's rows are carried through untouched.
- `dedupeAgainstCorpus` culls candidates the corpus already has, by lineage first, then passage, then word overlap. Lineage is the `candidateKey` stored on every promoted fact, so a candidate that literally became a fact is recognised as such rather than judged for similarity. Measured on the real corpus: 137 candidates against 131 facts, 131 culled by lineage, 6 genuine survivors, 6ms.
- Enrich skips candidates already promoted, using that same key. Neither stage's skip can be reached by accident: `force` is a separate button that names what it will re-spend and asks first.
- Every Run button says how much work it will actually do, and refuses when the answer is none.
- Stages can be **stopped**. The job runner owns an `AbortController` and hands the stage its signal; a stop lands between documents, keeps what finished, and records it. Before this the only way to cancel a run that was spending money was to kill the dev server, which also lost the log. Ctrl-C does the same for the CLI scripts.

`npm run backfill` reconstructs both records for work done before they existed — the ledger from the pipeline's own output, the lineage by exact passage match. Idempotent.

**A seventh category, Health, and four facts loaded from a shortlist.** Eight candidates came off `/triage` with the founder judging them good. They were all typed in by hand rather than extracted, which the rejects file shows plainly: in every one the `passage` was character-for-character the `fact`. That is why five of them read "Passage is not in the source document". The verifier was not wrong, there was no source.

What each of them actually needed was different, and the split is worth keeping:

- Two were fine on evidence and blocked only on the category. The sickle-cell passages really are in the cached Wikipedia article, one of them verbatim. `Health` was the missing lane, so it was added to both contracts, both themes, and the extraction prompt, the same path `Records` took. Its colour family is cyan-teal, which is the closest pair in the set to Culture's green-teal; one line in each theme if it reads too near.
- Two were true but pointed at the wrong document, and the right one was already in `_cache/`. "One in every six Africans is Nigerian" became a claim about the 17% the `Nigeria` article states, because 17% is what the source says and "54 countries" is not in it. Port Harcourt got better rather than worse: "a British colonial secretary who never set foot in it" is unsourceable, but Lugard's 1913 letter is on the Lewis Harcourt page, asking permission "in the absence of any convenient local name". The sourced version is the sharper one.
- One was a duplicate. `nf_1053` already carried the Dikko affair, so rather than add a second the existing claim was replaced with the Israeli-operative angle, which is the detail the story is actually remembered for, sourced to the `Dikko affair` article added as a second source.
- Two could not ship. The 1977 Lagos odd-and-even plate ban is not in the `Lagos` article, not in `Road space rationing`, and not in any Wikipedia search. The Lekki-from-Mr-Lecqi etymology is not in the `Lekki` article and a search returns nothing at all. Both are probably true and neither has a source, so neither ships.
- One was excluded on instruction: the Bamba people of Uganda, which is not a Nigerian fact.

The four that shipped are in `data/facts.json` rather than `corpus/*.js`, which is the first time a hand-written fact has gone into the store. That was the point: the store gives them `editFact`, and the corpus files do not.

**`editFact` does not have the hole section 11 previously recorded.** Editing `nf_1053` reported `resetApproval: false`, which looked like the bug and is not. The function consults `data/reviews.json` through `effectiveReview`, so it sees the real decision, and its rule is narrower than "any edit clears approval": an edit that keeps the fact verified and error-free re-stamps the approval in the editor's name instead. Only an edit that breaks verification clears it. The hole that remains is the one already written down, that `corpus/*.js` facts never pass through this function at all.

### Next

- The quiz tab prints a "never asked yet" count that falls to zero over about 160 runs. Nothing yet marks the moment it resets, and a reader who has been through the whole corpus deserves to be told rather than quietly started again.
- A challenge link only opens the app on a device that has it. The store link in the message is the fallback, and it stays a dead end until the listing is published and Android App Links replace the custom scheme.
- Still unbuilt from the same session's shortlist, in the order they were ranked: a real daily quiz, the same three questions for everyone, resetting at midnight, which is the item that gives a reason to open the app daily; a "play again" action on the score screen; lanes so a run can be Records only or Food only; and an answer streak with a per-question timer.
- Review the 32 proposed images at `/images`. They are all still `proposed`, so the app currently ships 131 typographic cards and no photo cards. Some proposals are deliberately loose — a map for a fact about territory, a newspaper page for a televised event — and rejecting those is the point of the gate.
- Fix the share-card image capture before accepting many images. It is currently latent because no fact has an image, but a dropped photo credit on an export is a licence breach rather than a cosmetic bug. Gate capture on `expo-image`'s `onLoad` with a timeout fallback, not the two `requestAnimationFrame`s in `app/(tabs)/index.tsx`.
- The photo-card variant of `FactCard` still sets fact text at a fixed size. The typographic variant now steps 29 → 23 → 19 by length, because real facts run to a median of 124 characters against the design PDF's much shorter samples. The photo panel is shorter than the card and needs the same treatment before photo cards ship.
- Images are hotlinked to Commons thumbnails. That is fine for phase 1 and wrong for launch: re-host in Supabase Storage at 1080px wide, which serves both the in-app card and the 1080×1350 share card.
- Wikipedia is tier `reference`, which the validator warns on alone. Corroboration comes from each article's own footnotes; that stage is not built.
- The twelve Records facts were approved under the founder's name on his instruction to ship them, not after he read each one. Re-read them on `/review`. All twelve images are context rather than the record itself, so they are the likeliest thing to want changing.
- Section 7.1 is written from the Records rewrite only. Read the 110 pipeline facts against it: they set the house voice, but nothing has checked whether they all actually hold to it.
- Every Records fact is volatile and carries `reviewBy: 2027-03-10`. The assistant's knowledge cutoff is May 2026 and the pages were fetched on 10 September 2026, so the fetch is the authority on who holds each title and the assistant is not. `nf_0112` (dance relay, 2019) is the likeliest of the twelve to be stale already.
- Make an edit to a `corpus/*.js` fact reset its approval the way `editFact` does for the store, or move hand-authored facts into the store so they get that behaviour for free.
- `gwr-widest-wig` is on the seed list and cached with no fact written from it, held back by one-story-one-fact. That is a normal outcome, not a gap to fill.
- Commons subject search is not wired into the studio. `npm run images` harvests by article and `/images` offers a SerpApi web search that carries no licence, so the middle option, a licence-clean search by what is in the picture, exists only as the ad-hoc query that produced these twelve. It belongs behind the same button.
- Nothing exposes `profile` on `/sources` yet. It is detected at add time and stored, so the only case that needs a human is a record page on a host the detector does not know.
- Two facts from the shortlist have no source and are not loaded: the 1977 Lagos odd-and-even number plate ban, and Lekki being named for a Portuguese trader called Lecqi. Both want a Nigerian newspaper archive or a book, which is the kind of source the seed list has none of yet.
- `Health` has two facts, so its chip is live in the app. Nothing has read the new colour family on a real device against Culture's.
- Write the ten calibration facts: five History, five Culture, fully sourced with real passages. This sets the bar everything later is measured against.
- Some facts are sourced to a disambiguation page (`Darling`), which means the seed list picked up a redirect. Worth a pass over `data/sources.json`.
- Decide the Poppins/Sora divergence.
- Delete `afrifacts-factory/` and the two migration scripts. Not under git, so it needs a deliberate go-ahead.
- The edit / retire / AI-rewrite UI on `/review`. The store API is built and tested; nothing in the browser reaches it yet.
- Paste-a-fact and single-fact runs, manual image upload with a licence form, source suggestion behind a human gate, and the Supabase push.

Update this section as work lands so this file stays useful.

# AfriFacts

A mobile app that serves surprising, verified facts about Africa, starting with Nigeria.

Facts apps normally die because they are static reference lists nobody reopens. AfriFacts is built like a social app instead: a full-screen swipeable feed, a daily streak, quizzes injected into the feed, and share cards designed to travel through WhatsApp and X. Every fact carries a real source and a verified badge, because one viral screenshot of a fake fact would undo months of work.

Nigeria is the launch market. Country is always a value in the data, never a structure in the code.

## The two projects

| Folder | What it is |
|---|---|
| [`afrifacts/`](afrifacts) | The mobile app. React Native, Expo SDK 54, TypeScript strict, expo-router. |
| [`afrifacts-studio/`](afrifacts-studio) | The content pipeline and review dashboard. Next.js. Holds every secret. |
| `afrifacts-factory/` | Superseded by the studio. Kept until its deletion is confirmed. |

They share no code. The database is the only thing that connects them: the studio writes facts, the app reads them.

**They live in one repository for one reason.** The fact contract exists twice — as TypeScript in `afrifacts/src/types/fact.ts` and as JSDoc in `afrifacts-studio/lib/types/fact.js` — and the two must never disagree. In one repository that is a single commit. In two it is two commits that drift.

## The rule that separates them

**No secrets ever live in `afrifacts/`.** Anything bundled into a mobile app can be extracted from the APK, so the model key, the search key and the database service key belong to the studio alone. The app ships a Supabase anon key, which is designed to be public and is gated by Row Level Security rather than by secrecy.

Each project has its own `.env.example` documenting exactly which values it is allowed to hold.

## Where things stand

The app is built: six screens, rendering 148 real sourced facts and 444 quiz questions from the pipeline, currently through a generated file rather than a database. The studio runs the whole pipeline — fetch, extract, verify, enrich, images, review, export — and holds the corpus.

Next is Supabase: the app reads from `facts` and `quiz_questions`, the studio writes everything, and the generated file goes away.

See [`CLAUDE.md`](CLAUDE.md) for the full specification, and [`afrifacts-studio/README.md`](afrifacts-studio/README.md) for how the pipeline works and why it refuses to let a model judge its own output.

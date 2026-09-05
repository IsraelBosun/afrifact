import { startJob } from '@/lib/jobs.js';
import { runEnrich } from '@/lib/pipeline/enrich.js';
import { runPush } from '@/lib/pipeline/push-to-supabase.js';
import { runExtract } from '@/lib/pipeline/extract.js';
import { runFetch } from '@/lib/pipeline/fetch.js';
import { runImages } from '@/lib/pipeline/harvest-images.js';
import { runQuizzes } from '@/lib/pipeline/quiz-backfill.js';
import { runCheck } from '@/lib/check.js';

export const dynamic = 'force-dynamic';

/**
 * The stages a button may start.
 *
 * A map rather than a lookup by name, so a request cannot name a function
 * that was never meant to be reachable from a browser. `costs` is carried
 * so the page can warn before spending money — the terminal made that
 * invisible until the bill.
 */
/*
  The automatic stages, in the only order they ever run in.

  Nothing chooses between them. Fetch feeds extract, extract feeds enrich,
  enrich feeds images, and the four were four buttons pressed in sequence
  with a wait between each — a board that made you the scheduler for a
  decision that has one answer.

  Push is the last link and not an optional one. Enrich and images write
  facts and pictures but neither publishes, so a run that stopped at
  images left the database behind the corpus. Running it here means the
  chain ends with the app actually holding what the run produced.

  This used to be `export`, which wrote a generated file into the app
  project. The app reads Supabase now, so that stage is gone rather than
  adapted — a stage that keeps writing a file nobody reads is worse than
  no stage, because someone eventually trusts it.
*/
const CHAIN = ['fetch', 'extract', 'enrich', 'images', 'push'];

const STAGES = {
  /*
    Every stage, once, in order.

    It stops at the first failure rather than pressing on: the stages are
    a pipeline, so a failed extract makes the enrich after it meaningless
    and paid for. A Stop lands between stages as well as inside one, so
    the finished stages keep what they wrote.
  */
  all: {
    costs: true,
    run: async (opts, say) => {
      const done = [];
      for (const key of CHAIN) {
        if (opts.signal?.aborted) {
          say(`— stopped before ${key}`);
          break;
        }
        say(`— ${key} —`);
        done.push({ stage: key, result: await STAGES[key].run(opts, say) });
      }
      return { stages: done };
    },
  },
  fetch: { costs: false, run: (opts, say) => runFetch(opts, say) },
  extract: { costs: true, run: (opts, say) => runExtract(opts, say) },
  enrich: { costs: true, run: (opts, say) => runEnrich(opts, say) },
  images: { costs: true, run: (opts, say) => runImages(opts, say) },
  /*
    Not in CHAIN, on purpose.

    Enrich already writes questions for the facts it creates, so a normal
    run never needs this. It is the repair for the 146 facts whose
    questions were overwritten before `data/quiz.json` existed, and it is
    a button you press once knowing what it spends — not something that
    should fire on every Run it through.
  */
  quizzes: { costs: true, run: (opts, say) => runQuizzes(opts, say) },
  /*
    Free — no model calls, one round trip. It upserts by primary key and
    removes what the corpus no longer has, so running it twice does the
    same as running it once.
  */
  push: { costs: false, run: (opts, say) => runPush(opts, say) },
  check: {
    costs: false,
    run: async (_opts, say) => {
      const result = await runCheck();
      say(`${result.total} facts, ${result.publishable} publishable`);
      say(`${result.errors.length} errors, ${result.warnings.length} warnings`);
      for (const [factId, list] of result.byFact) {
        for (const p of list.filter((x) => x.level === 'error')) {
          say(`ERROR ${factId} ${p.field}: ${p.message}`);
        }
      }
      return { total: result.total, publishable: result.publishable, ok: result.ok };
    },
  },
};

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const stage = typeof body?.stage === 'string' ? body.stage : '';
  const entry = STAGES[stage];

  if (!entry) {
    return Response.json({ error: `Unknown stage '${stage}'.` }, { status: 400 });
  }

  const options = {
    force: body?.force === true,
    all: body?.all === true,
    slugs: Array.isArray(body?.slugs) ? body.slugs.filter((s) => typeof s === 'string') : [],
  };

  // `signal` is added per job rather than per request: the request is long
  // gone by the time Stop is pressed, so the only thing that can carry a
  // cancel is the job the page is watching.
  const started = startJob(stage, (say, signal) => entry.run({ ...options, signal }, say));
  if (!started.ok) {
    // 409: not a bad request, just not now. The page says so rather than
    // silently queuing a second writer for the same files.
    return Response.json({ error: started.error }, { status: 409 });
  }

  return Response.json({ id: started.job.id, stage: started.job.stage });
}

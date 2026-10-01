/**
 * Backing a signed-in reader's progress up to their account.
 *
 * The phone is the source of truth. Nothing on screen ever waits for this
 * file: the streak, the saves and the stats are read from the device as
 * they always were, and sync runs behind them. With nobody signed in, every
 * entry point here returns without touching the network.
 *
 * WHEN IT RUNS
 *
 * - At launch, once the device's own progress is loaded, with a pull.
 * - On sign-in, with a pull, so the account's history arrives while the
 *   reader is still looking at the spinner.
 * - When the app comes back to the front, with a pull, at most every few
 *   minutes. This is what brings another phone's reading in.
 * - When the app goes to the background, which is the moment a reading
 *   session ends.
 * - After every finished quiz run.
 *
 * The background and quiz syncs only push. Every failure is swallowed and
 * retried by the next trigger, because no network must never break reading.
 *
 * WHAT GOES WHERE
 *
 * Seen facts, reading days and saves are sets; see `merge.ts` for how
 * they combine. Quiz accuracy is a log of runs, one row per run, because
 * totals kept on two phones would overwrite each other. The record of
 * which questions were asked stays on the phone: it deals this phone's
 * next run and is nobody's history.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState } from 'react-native';

import { supabase } from '@/src/auth/client';
import { getSession } from '@/src/auth/account';

import { replaceSaved, savedIds } from './bookmarks';
import {
  earliestDay,
  mergeSaved,
  quizTotals,
  savedChanges,
  stampSaves,
  union,
  unionDays,
  type RemoteSave,
} from './merge';
import { adoptAccountProgress, onQuizRun, progress, resetProgress } from './progress';

const KEY = 'afrifacts.sync.v1';

/** PostgREST returns at most this many rows per request, so longer reads page. */
const PAGE = 1000;

interface PendingRun {
  runId: string;
  correct: number;
  total: number;
  at: string;
}

interface SyncState {
  /** Names this install, so two phones on one account never share a run id. */
  deviceId: string;
  /** Whose progress this phone holds. Null until the first sign-in. */
  linkedUserId: string | null;
  /** The next sync must fetch the account before pushing. */
  needsPull: boolean;
  /** The account's saves after this phone's last sync. See `mergeSaved`. */
  baseSaved: string[];
  /** Finished quiz runs the account has not been sent yet. */
  pendingRuns: PendingRun[];
}

function randomId(): string {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
}

let state: SyncState = {
  deviceId: '',
  linkedUserId: null,
  needsPull: false,
  baseSaved: [],
  pendingRuns: [],
};

async function save(): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // The next successful write carries it. A pending run lost here is one
    // quiz missing from the account, not a broken app.
  }
}

const stateReady: Promise<void> = (async () => {
  // No client means no sync: an unconfigured build, or the web build's
  // server render, where there is no storage to read at all.
  if (supabase === null) return;
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (raw !== null) state = { ...state, ...(JSON.parse(raw) as Partial<SyncState>) };
  } catch {
    // Unreadable. Starting over means one extra pull, nothing worse.
  }
  if (state.deviceId.length === 0) {
    state = { ...state, deviceId: randomId() };
    await save();
  }
})();

/*
  Held until the root layout has loaded progress and saves off the device.

  A sync that ran first would merge the account into an empty record, and
  the load landing a moment later would overwrite the merge with the old
  file. So nothing here starts until `startSync` says the device is read.
*/
let markLocalReady: () => void = () => {};
const localReady = new Promise<void>((resolve) => {
  markLocalReady = resolve;
});

let started = false;

/**
 * Begin syncing. Called once by the root layout, after `loadProgress`.
 */
export function startSync(): void {
  if (started || supabase === null) return;
  started = true;
  markLocalReady();

  onQuizRun((correct, total) => {
    void (async () => {
      await stateReady;
      // Only queued for a phone that belongs to an account. Runs played
      // before signing in are already in the totals, and the first sync
      // sends those totals as one run of their own.
      if (state.linkedUserId === null) return;
      state = {
        ...state,
        pendingRuns: [
          ...state.pendingRuns,
          { runId: randomId(), correct, total, at: new Date().toISOString() },
        ],
      };
      await save();
      void syncNow();
    })();
  });

  /*
    Push when the reader leaves, pull when they come back.

    The pull on return is what makes a second phone current: a day read on
    one phone shows in the other's streak the next time it is opened, not
    only after signing in again. Throttled, because flicking between apps
    should not cost five requests each time.
  */
  AppState.addEventListener('change', (next) => {
    if (next === 'background') void syncNow();
    if (next === 'active' && Date.now() - lastPullAt > PULL_EVERY_MS) void syncNow({ pull: true });
  });

  void syncNow({ pull: true });
}

const PULL_EVERY_MS = 5 * 60 * 1000;
let lastPullAt = 0;

let inFlight: Promise<boolean> | null = null;

/**
 * One sync at a time. Resolves true when it ran to the end, false when
 * nobody is signed in, the phone is offline, or anything failed. Never
 * throws.
 */
export function syncNow(options: { pull?: boolean } = {}): Promise<boolean> {
  if (supabase === null) return Promise.resolve(false);
  if (inFlight === null) {
    inFlight = run(options.pull === true)
      .catch((error: unknown) => {
        console.warn('[sync] skipped:', error instanceof Error ? error.message : error);
        return false;
      })
      .finally(() => {
        inFlight = null;
      });
  }
  return inFlight;
}

/** Straight after signing in: merge the account into this phone, and this phone into it. */
export function adoptAccount(): Promise<boolean> {
  return syncNow({ pull: true });
}

/**
 * Hand the phone back empty, for the sign-out. The device id survives: it
 * names the install, not the person.
 */
export async function forgetAccount(): Promise<void> {
  await stateReady;
  state = { ...state, linkedUserId: null, needsPull: false, baseSaved: [], pendingRuns: [] };
  await save();
  resetProgress();
  replaceSaved([]);
}

/** True when this phone holds work the account has not been sent. */
export function hasUnsyncedRuns(): boolean {
  return state.pendingRuns.length > 0;
}

async function run(pull: boolean): Promise<boolean> {
  const db = supabase;
  if (db === null) return false;

  const session = await getSession();
  if (session === null) return false;
  await Promise.all([stateReady, localReady]);

  const userId = session.user.id;

  if (state.linkedUserId !== userId) {
    // Somebody else's progress is on this phone. It is already in their
    // account, and keeping it would credit their reading to whoever just
    // signed in.
    if (state.linkedUserId !== null) {
      resetProgress();
      replaceSaved([]);
    }

    // Quiz runs played before the account existed survive only as totals,
    // so they go up as one run. Its id is unique, so a retry of this sync
    // resends the same row rather than adding a second.
    const before = progress();
    const pendingRuns: PendingRun[] =
      before.quizAnswered > 0
        ? [
            {
              runId: `before-account-${randomId()}`,
              correct: before.quizCorrect,
              total: before.quizAnswered,
              at: new Date().toISOString(),
            },
          ]
        : [];

    state = { ...state, linkedUserId: userId, needsPull: true, baseSaved: [], pendingRuns };
    await save();
  }

  // 1. Quiz runs. Append-only and keyed by device and run, so a push that
  //    dies halfway is safe to repeat.
  const sending = state.pendingRuns;
  if (sending.length > 0) {
    const { error } = await db.from('quiz_runs').upsert(
      sending.map((r) => ({
        device_id: state.deviceId,
        run_id: r.runId,
        correct: r.correct,
        total: r.total,
        at: r.at,
      })),
      { onConflict: 'user_id,device_id,run_id', ignoreDuplicates: true },
    );
    if (error) throw error;
    const sent = new Set(sending.map((r) => r.runId));
    state = { ...state, pendingRuns: state.pendingRuns.filter((r) => !sent.has(r.runId)) };
    await save();
  }

  // 2. Pull, when this is the first sync for the account or one was asked for.
  let knownSaved: string[] = state.baseSaved;
  const firstForAccount = state.needsPull;
  const pulling = firstForAccount || pull;

  if (pulling) {
    const [profile, remoteSaved, remoteSeen, remoteDays, remoteRuns] = await Promise.all([
      db.from('profiles').select('display_name, joined_at').maybeSingle(),
      fetchAll<RemoteSave>('saved_facts', 'fact_id, saved_at', 'fact_id'),
      fetchAll<{ fact_id: string }>('seen_facts', 'fact_id', 'fact_id'),
      fetchAll<{ day: string }>('reading_days', 'day', 'day'),
      fetchAll<{ correct: number; total: number }>(
        'quiz_runs',
        'correct, total',
        'device_id,run_id',
      ),
    ]);
    if (profile.error) throw profile.error;

    /*
      Merged against the device as it is at this instant, read after every
      fetch has landed and written back in the same tick. A save or a
      swipe made while the requests were out is in the snapshot, not lost
      under it.
    */
    const local = progress();
    const remoteName = (profile.data?.display_name as string | null | undefined) ?? '';
    const remoteJoined = (profile.data?.joined_at as string | null | undefined) ?? '';

    adoptAccountProgress({
      seen: union(
        local.seen,
        remoteSeen.map((r) => r.fact_id),
      ),
      days: unionDays(
        local.days,
        remoteDays.map((r) => r.day),
      ),
      joinedAt: earliestDay(local.joinedAt, remoteJoined),
      /*
        On the first sync for an account, the account's name is who they
        are and the phone's only fills a gap. After that the phone's wins:
        a rename here that has not been sent yet must not be undone by
        the next routine pull.
      */
      name: firstForAccount
        ? remoteName.length > 0
          ? remoteName
          : local.name
        : local.name.length > 0
          ? local.name
          : remoteName,
      // Every run this phone ever played is in the log by now, since the
      // pending ones were sent in step 1, so the log's total is the total.
      ...quizTotals(remoteRuns),
    });

    replaceSaved(mergeSaved(savedIds(), remoteSaved, state.baseSaved));
    knownSaved = remoteSaved.map((r) => r.fact_id);
  }

  // 3. Push what the phone holds.
  const now = progress();
  const saved = [...savedIds()];

  if (now.seen.length > 0) {
    const { error } = await db.from('seen_facts').upsert(
      now.seen.map((fact_id) => ({ fact_id })),
      { onConflict: 'user_id,fact_id', ignoreDuplicates: true },
    );
    if (error) throw error;
  }

  if (now.days.length > 0) {
    const { error } = await db.from('reading_days').upsert(
      now.days.map((day) => ({ day })),
      { onConflict: 'user_id,day', ignoreDuplicates: true },
    );
    if (error) throw error;
  }

  const { add, remove } = savedChanges(saved, knownSaved);
  if (remove.length > 0) {
    const { error } = await db.from('saved_facts').delete().in('fact_id', remove);
    if (error) throw error;
  }
  if (add.length > 0) {
    // Stamped by position in the whole list, so the account's newest-first
    // matches the phone's.
    const adding = new Set(add);
    const stamped = stampSaves(saved, Date.now()).filter((row) => adding.has(row.fact_id));
    const { error } = await db
      .from('saved_facts')
      .upsert(stamped, { onConflict: 'user_id,fact_id', ignoreDuplicates: true });
    if (error) throw error;
  }

  /*
    The profile. The name is sent whenever there is one, so a rename on
    either phone wins the next time that phone syncs. The joined day only
    goes up after a pull, when it has been merged with the account's and
    is known to be the earlier one.
  */
  const profileRow: Record<string, string> = {};
  if (now.name.length > 0) profileRow.display_name = now.name;
  if (pulling && now.joinedAt.length > 0) profileRow.joined_at = now.joinedAt;
  if (Object.keys(profileRow).length > 0) {
    const { error } = await db
      .from('profiles')
      .upsert({ user_id: userId, ...profileRow }, { onConflict: 'user_id' });
    if (error) throw error;
  }

  state = { ...state, needsPull: false, baseSaved: saved };
  await save();
  if (pulling) lastPullAt = Date.now();
  return true;
}

/** A whole table's rows for the signed-in reader, a page at a time. */
async function fetchAll<T>(table: string, columns: string, orderBy: string): Promise<T[]> {
  const db = supabase;
  if (db === null) return [];
  const rows: T[] = [];
  for (let from = 0; ; from += PAGE) {
    let query = db.from(table).select(columns);
    for (const column of orderBy.split(',')) query = query.order(column, { ascending: true });
    const { data, error } = await query.range(from, from + PAGE - 1);
    if (error) throw error;
    const page = (data ?? []) as T[];
    rows.push(...page);
    if (page.length < PAGE) return rows;
  }
}

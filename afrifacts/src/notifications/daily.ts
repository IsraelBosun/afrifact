/**
 * A fact at 7am and a fact at 6pm, from the device.
 *
 * Entirely local: no FCM project, no service account, no server, no token.
 * The corpus is already on the phone (see `data/cache.ts`), so the phone
 * has everything it needs to post a fact at seven in the morning whether
 * or not it has a network.
 *
 * WHY THIS IS NOT A DAILY TRIGGER
 *
 * `SchedulableTriggerInputTypes.DAILY` is exactly two calls and repeats
 * forever, which is why it is the obvious answer and the wrong one: a
 * repeating trigger carries fixed content, so it would deliver the same
 * fact every morning until the app was opened again. What is wanted is a
 * different fact each time, and the only way to say that in advance is to
 * schedule each one separately with a date.
 *
 * So this books a rolling window — `DAYS_AHEAD` days of two slots, each
 * with its own fact — and tops it back up every launch. The cost is that
 * someone who does not open the app for two weeks stops being notified.
 * That is a fair trade and arguably the right behaviour: an app nobody has
 * opened in a fortnight has not earned the right to keep tapping them on
 * the shoulder.
 */

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { factForDay } from '@/src/data';
import type { Fact } from '@/src/types';

/** 7am and 6pm, local device time. */
export const MORNING_HOUR = 7;
export const EVENING_HOUR = 18;

/**
 * How far ahead the window is booked.
 *
 * Android caps an app's pending alarms in the low hundreds, so 14 days at
 * two a day — 28 — is nowhere near it, and two weeks is longer than the
 * gap that would make someone a lapsed user rather than a quiet one.
 */
const DAYS_AHEAD = 14;

const CHANNEL_ID = 'daily-facts';

/**
 * Shown even when the app is open.
 *
 * The alternative is that the seven o'clock fact silently does not appear
 * for the one person who happened to be reading at seven, which looks like
 * the feature failing rather than the feature deciding.
 */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

/**
 * The Android channel these are posted to.
 *
 * Named, because Android shows the channel name in the system settings and
 * "Daily facts" is something a person can decide about. `DEFAULT`
 * importance rather than `HIGH`: a fact is not urgent, and a heads-up
 * banner that interrupts what you are doing is how a pleasant thing
 * becomes an annoying one.
 */
async function ensureChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
    name: 'Daily facts',
    importance: Notifications.AndroidImportance.DEFAULT,
    sound: null,
    vibrationPattern: [0, 180],
    lightColor: '#1D9E75',
  });
}

/**
 * Ask, and report whether we may.
 *
 * Only ever called from the Settings toggle. §10 forbids gating the first
 * fact, and a permission sheet in front of the feed on first launch is
 * precisely that — so the reader asks us, rather than the other way round.
 */
export async function requestPermission(): Promise<boolean> {
  const existing = await Notifications.getPermissionsAsync();
  if (existing.granted) return true;
  // Android gives one prompt and a denial is permanent short of a trip to
  // Settings, so this is asked once and never retried in a loop.
  if (!existing.canAskAgain) return false;
  const asked = await Notifications.requestPermissionsAsync();
  return asked.granted;
}

/** Every slot from now to the end of the window, in order. */
function upcomingSlots(from: Date): Date[] {
  const slots: Date[] = [];
  for (let day = 0; day < DAYS_AHEAD; day++) {
    for (const hour of [MORNING_HOUR, EVENING_HOUR]) {
      const when = new Date(from);
      when.setDate(from.getDate() + day);
      when.setHours(hour, 0, 0, 0);
      // A minute of margin: booking a notification for the moment that has
      // just passed either fires immediately or is rejected, and both are
      // worse than waiting for tomorrow.
      if (when.getTime() > from.getTime() + 60_000) slots.push(when);
    }
  }
  return slots;
}

/**
 * Facts for the window, shuffled and without repeats until they run out.
 *
 * Drawing independently per slot would land the same fact twice in a week
 * often enough to be noticed, and a "daily fact" that repeats inside a
 * week reads as a broken feature rather than a coincidence.
 */
function pickFacts(pool: Fact[], count: number): Fact[] {
  const bag = [...pool];
  for (let i = bag.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [bag[i], bag[j]] = [bag[j], bag[i]];
  }
  const chosen: Fact[] = [];
  while (chosen.length < count && bag.length > 0) {
    chosen.push(...bag.slice(0, count - chosen.length));
  }
  return chosen;
}

/**
 * Rebook the whole window.
 *
 * Cancels first, always. These are dated one-shots, so scheduling without
 * cancelling would stack a second fortnight on top of the one already
 * booked, and the reader would get two facts a slot, then three.
 */
export async function scheduleDailyFacts(pool: Fact[]): Promise<number> {
  /*
    The empty pool is checked BEFORE anything is cancelled.

    It used to be checked after, which made a launch that could not read
    the corpus destructive: it wiped the fortnight already booked and then
    returned without putting anything back. The reader had done nothing,
    the toggle still said on, and the facts simply stopped arriving until
    some later launch happened to load the corpus and rebook. A stage that
    cannot do its work should leave the work already done alone.
  */
  if (pool.length === 0) return scheduledCount();

  await Notifications.cancelAllScheduledNotificationsAsync();
  await ensureChannel();

  const slots = upcomingSlots(new Date());
  const drawn = pickFacts(pool, slots.length);

  await Promise.all(
    slots.map((when, i) => {
      const morning = when.getHours() === MORNING_HOUR;
      /*
        The morning carries the day's fact — the same one the Today button
        opens, derived from the date rather than drawn.

        These used to disagree, because this drew at random. A reader who
        used both would have had two different "today's fact"es and no way
        to tell which the app meant. The evening keeps the random draw: it
        is the second fact of the day, not a competing first.
      */
      const fact = (morning ? factForDay(when, pool) : null) ?? drawn[i];
      return Notifications.scheduleNotificationAsync({
        content: {
          title: morning ? 'Your fact for today' : 'One for this evening',
          // The whole fact, not a trimmed one. Android collapses it to a
          // line and expands to the rest on a pull, so trimming here would
          // only remove the half that rewards the pull.
          body: fact.fact,
          // What the tap opens. `_layout.tsx` reads this back.
          data: { factId: fact.id },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: when,
          channelId: CHANNEL_ID,
        },
      });
    }),
  );

  return slots.length;
}

export async function cancelDailyFacts(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

/** How many are actually booked. Used by Settings to tell the truth. */
export async function scheduledCount(): Promise<number> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  return scheduled.length;
}

/** What is booked, and when the first of it lands. */
export interface Booking {
  count: number;
  next: Date | null;
}

/**
 * Read the OS back, rather than trusting what we think we scheduled.
 *
 * The whole feature is invisible until it fires, which is a bad property
 * for something that can fail in four different places: the setting off,
 * permission revoked, an empty pool, or the phone dropping the alarms.
 * Every one of those looks identical from the outside — no notification —
 * so Settings asks the system what it is actually holding and says so.
 */
export async function nextBooking(): Promise<Booking> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();

  let soonest: number | null = null;
  for (const item of scheduled) {
    // A DATE trigger comes back carrying the date it was given, as a
    // number on Android and occasionally a Date. Anything else is not one
    // of ours and is skipped rather than guessed at.
    const trigger = item.trigger as { date?: Date | number } | null;
    const raw = trigger?.date;
    const at = raw instanceof Date ? raw.getTime() : typeof raw === 'number' ? raw : null;
    if (at !== null && (soonest === null || at < soonest)) soonest = at;
  }

  return { count: scheduled.length, next: soonest === null ? null : new Date(soonest) };
}

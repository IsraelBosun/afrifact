/**
 * Whether the reader wants a fact at 7am and 6pm.
 *
 * Off until asked for. The permission prompt only ever fires from the
 * Settings toggle, so nobody meets a system dialog before they have met a
 * fact — §10 forbids gating the first fact, and a permission sheet in
 * front of the feed is a gate whatever else it is.
 *
 * Stored separately from the OS permission, because they answer different
 * questions. The OS knows whether we are allowed to post; this knows
 * whether the reader asked us to. Someone who turns the toggle on and then
 * revokes permission in Android settings should not silently come back to
 * a toggle that still reads on, which is why `syncNotifications` checks
 * both.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSyncExternalStore } from 'react';

import type { Fact } from '@/src/types';

import { cancelDailyFacts, requestPermission, scheduleDailyFacts } from './daily';
import { Notifications } from './module';

const KEY = 'afrifacts.dailyFacts.v1';

let enabled = false;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function persist() {
  AsyncStorage.setItem(KEY, enabled ? 'on' : 'off').catch(() => {
    // Kept for the session; asked again next launch.
  });
}

/** Read the stored choice. Called at launch, before anything is scheduled. */
export async function loadNotificationSetting(): Promise<void> {
  try {
    enabled = (await AsyncStorage.getItem(KEY)) === 'on';
  } catch {
    // Off, then.
  }
}

export function notificationsEnabled(): boolean {
  return enabled;
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useNotificationsEnabled(): boolean {
  return useSyncExternalStore(subscribe, notificationsEnabled, notificationsEnabled);
}

/**
 * Turn them on or off. Returns where it actually landed.
 *
 * Returning the resulting state rather than void is the point: asking for
 * permission can be refused, and a toggle that slides to on when the OS
 * said no is a lie the user will only discover at seven the next morning.
 */
export async function setNotificationsEnabled(next: boolean, pool: Fact[]): Promise<boolean> {
  if (!next) {
    enabled = false;
    emit();
    persist();
    await cancelDailyFacts();
    return false;
  }

  const granted = await requestPermission();
  if (!granted) {
    enabled = false;
    emit();
    persist();
    return false;
  }

  enabled = true;
  emit();
  persist();
  await scheduleDailyFacts(pool);
  return true;
}

/**
 * Top the window back up, once, at launch.
 *
 * This is what makes a fortnight of dated one-shots behave like something
 * that repeats: every launch rebooks from today, so the window only runs
 * dry for someone who has stopped opening the app.
 *
 * It also catches permission revoked from Android settings while the app
 * was closed — the toggle follows the OS rather than arguing with it.
 */
export async function syncNotifications(pool: Fact[]): Promise<void> {
  if (!enabled || !Notifications) return;

  const permission = await Notifications.getPermissionsAsync();
  if (!permission.granted) {
    enabled = false;
    emit();
    persist();
    await cancelDailyFacts();
    return;
  }

  await scheduleDailyFacts(pool);
}

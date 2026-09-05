/**
 * When to offer daily facts, and how not to burn the one chance to.
 *
 * WHY THIS IS NOT THE SYSTEM DIALOG
 *
 * Android grants an app exactly one notification prompt. Decline it and it
 * never appears again — `canAskAgain` goes false and the only route left
 * is the phone's own settings, which nobody visits. So "ask on first open,
 * and every fifth open after that" cannot be built out of the OS dialog:
 * the second ask would silently never appear, and the app would look like
 * it was asking while doing nothing.
 *
 * What is asked here is ours — a card, dismissible, costing nothing to
 * refuse. Only "Yes" spends the OS prompt. That is what makes asking again
 * on the fifth open honest rather than futile, and it is why the soft ask
 * exists in every app that gets this right.
 *
 * WHY IT DOES NOT GATE THE FIRST FACT
 *
 * §10: the app opens into a fact, with no wall in front of it. This shows
 * over a feed that is already running, after a beat, and swiping past it
 * is a valid answer. It is an offer, not a door.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';

const OPENS_KEY = 'afrifacts.opens.v1';

/** Ask on the first open, then every fifth. */
const ASK_EVERY = 5;

/** Long enough for the first card to be read, short enough to still be this visit. */
export const ASK_DELAY_MS = 3500;

let opens = 0;

/**
 * Count this launch. Called once, from the root layout.
 *
 * Counted even when we are not going to ask, so the fifth open is the
 * fifth open rather than the fifth time we happened to be eligible.
 */
export async function noteAppOpen(): Promise<void> {
  try {
    const raw = await AsyncStorage.getItem(OPENS_KEY);
    opens = Number(raw ?? 0) + 1;
    await AsyncStorage.setItem(OPENS_KEY, String(opens));
  } catch {
    // A launch we cannot count is a launch we do not ask on.
    opens = 0;
  }
}

/**
 * Whether to show the offer this launch.
 *
 * Four ways to be told no, and all of them are respected:
 *  - already granted: there is nothing to ask for
 *  - already refused at the OS level: asking again cannot work, so it
 *    would be theatre
 *  - not the first or a fifth open: they said not now, recently enough
 *  - the counter is unreadable: silence beats guessing
 */
export async function shouldOfferNotifications(): Promise<boolean> {
  if (opens !== 1 && (opens === 0 || opens % ASK_EVERY !== 0)) return false;

  try {
    const permission = await Notifications.getPermissionsAsync();
    if (permission.granted) return false;
    // `canAskAgain` false means the system dialog is spent. A card that
    // leads nowhere is worse than no card.
    return permission.canAskAgain;
  } catch {
    return false;
  }
}

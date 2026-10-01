/**
 * expo-notifications, or null where it cannot load.
 *
 * Expo Go on Android dropped notifications in SDK 53, and from SDK 57 the
 * import itself throws there. A throw at import is not contained to this
 * feature: every route that reaches it (the root layout, Settings, the
 * feed) fails to evaluate, the router sees routes with no default export,
 * and the app dies in expo-router before a single fact is drawn.
 *
 * So the module is required here, behind the one check that matters, and
 * every caller treats null as "this build has no notifications". A real
 * build, including the preview APK, always gets the module. Only Expo Go
 * on Android goes without, where the feature could never have worked.
 */

import Constants, { ExecutionEnvironment } from 'expo-constants';
import { Platform } from 'react-native';

type NotificationsModule = typeof import('expo-notifications');

const inExpoGoOnAndroid =
  Platform.OS === 'android' && Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

export const Notifications: NotificationsModule | null = inExpoGoOnAndroid
  ? null
  : // A static import would run, and throw, before this check could.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require('expo-notifications');

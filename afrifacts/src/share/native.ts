import { TurboModuleRegistry } from 'react-native';

type ShareModule = typeof import('react-native-share').default;

/**
 * react-native-share, or null where it is not compiled in.
 *
 * It is the only way on Android to send a picture and a caption in one
 * share: expo-sharing takes a file and nothing else, and React Native's
 * own Share takes text and nothing else. This one puts the text in
 * EXTRA_TEXT next to the image, which WhatsApp, X and the rest pick up as
 * the caption.
 *
 * Expo Go does not ship it, and importing it there throws, so it is only
 * required once the native half is known to exist. Expo Go falls back to
 * sharing the picture alone (see `useShareCard`).
 */
export const NativeShare: ShareModule | null = TurboModuleRegistry.get('RNShare')
  ? // eslint-disable-next-line @typescript-eslint/no-require-imports
    require('react-native-share').default
  : null;

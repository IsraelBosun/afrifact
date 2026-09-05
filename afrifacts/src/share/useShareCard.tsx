import * as Haptics from 'expo-haptics';
import * as Sharing from 'expo-sharing';
import { useCallback, useRef, useState, type ReactNode } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { captureRef, releaseCapture } from 'react-native-view-shot';

import { shareCard } from '@/src/theme';

/**
 * Renders a share card offscreen, captures it at 1080x1350, and opens the
 * native share sheet.
 *
 * The card is mounted for real rather than drawn twice, so the export is
 * the same component the user saw in the feed. It is positioned far off
 * the left edge instead of hidden, because a view with `display: none`
 * or zero opacity has nothing for the native layer to snapshot.
 *
 * Usage:
 *   const { shareView, share, sharing } = useShareCard();
 *   ...
 *   {shareView(<ShareCard fact={fact} />)}
 *   <Button onPress={() => share({ message: '...' })} />
 *
 * When the card's content loads asynchronously — a remote photograph —
 * call `prepare()` BEFORE changing what the card shows, then await it
 * before sharing. Otherwise the snapshot races the image:
 *
 *   const ready = prepare();
 *   setTarget(fact);
 *   await ready;
 *   await share();
 */
export function useShareCard() {
  const ref = useRef<View>(null);
  const [sharing, setSharing] = useState(false);
  const readyRef = useRef<(() => void) | null>(null);

  /**
   * Arm a one-shot wait for the card to say it has painted.
   *
   * Resolves on `markReady`, or on the timeout — a card whose photo never
   * arrives must still be shareable rather than leaving the button dead.
   * Falling back to a capture is the right failure: the worst case is the
   * old behaviour, and the common case is correct.
   */
  const prepare = useCallback((timeoutMs = 4000): Promise<void> => {
    return new Promise<void>((resolve) => {
      let settled = false;
      const finish = () => {
        if (settled) return;
        settled = true;
        if (readyRef.current === finish) readyRef.current = null;
        resolve();
      };
      readyRef.current = finish;
      setTimeout(finish, timeoutMs);
    });
  }, []);

  /** Passed to the card as `onReady`. */
  const markReady = useCallback(() => {
    readyRef.current?.();
  }, []);

  const share = useCallback(
    async ({ message, dialogTitle }: { message?: string; dialogTitle?: string } = {}) => {
      if (sharing) return;
      setSharing(true);

      let uri: string | undefined;
      try {
        if (Platform.OS !== 'web') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }

        if (!(await Sharing.isAvailableAsync())) {
          console.warn('Sharing is not available on this device.');
          return;
        }

        uri = await captureRef(ref, {
          format: 'png',
          quality: 1,
          // The card lays out at `layoutWidth`; capturing at the full
          // export size scales it up without re-laying anything out.
          width: shareCard.width,
          height: shareCard.height,
        });

        await Sharing.shareAsync(uri, {
          mimeType: 'image/png',
          UTI: 'public.png',
          dialogTitle: dialogTitle ?? message ?? 'Share this fact',
        });
      } catch (err) {
        // A cancelled share sheet is a normal outcome, not a failure worth
        // interrupting the user over.
        console.warn('Share failed', err);
      } finally {
        if (uri) releaseCapture(uri);
        setSharing(false);
      }
    },
    [sharing],
  );

  /**
   * Wrap the card in this to mount it offscreen. Render it once per
   * screen, near the root, so it is not remounted on every scroll.
   */
  const shareView = useCallback(
    (children: ReactNode) => (
      <View style={styles.offscreen} pointerEvents="none" collapsable={false}>
        <View ref={ref} collapsable={false}>
          {children}
        </View>
      </View>
    ),
    [],
  );

  return { shareView, share, sharing, prepare, markReady };
}

const styles = StyleSheet.create({
  // Offscreen but genuinely laid out and drawn, which is what the native
  // snapshot needs.
  offscreen: {
    position: 'absolute',
    left: -9999,
    top: 0,
    width: shareCard.layoutWidth,
    opacity: 0,
  },
});

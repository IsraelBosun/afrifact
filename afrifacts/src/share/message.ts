import { storeUrl } from '@/src/quiz/link';

/**
 * The caption that travels with a shared fact card.
 *
 * The card already carries the fact, so this does not repeat it. Its one
 * job is to turn "that's interesting" into an install, with the link on
 * its own line so chat apps render it as a tappable preview.
 */
export function factShareMessage(): string {
  return [
    'Found this on AfriFacts. There are hundreds more like it, and a new one every day.',
    '',
    `Download the app free and keep learning: ${storeUrl()}`,
  ].join('\n');
}

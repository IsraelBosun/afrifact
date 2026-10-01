/**
 * Does a picture load for a phone?
 *
 * A web search hands back links, and plenty of hosts refuse a picture to
 * anything that is not a browser on their own page: a 403, or an HTML
 * page where the image should be. Four of those went live as accepted
 * pictures and drew text-only cards on every phone, while the studio,
 * which never asked, believed they had photographs.
 *
 * So the question is asked the way the app asks it, with the app's own
 * User-Agent. Kept in step with IMAGE_HEADERS in the app's
 * `src/data/brokenImages.ts`.
 */

export const APP_UA = 'AfriFacts/1.0 (Android; https://bluehydralabs.com/)';
const TIMEOUT_MS = 15000;

/** @param {string} url */
async function fetchImage(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': APP_UA },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  // Only the status and type are wanted. Not reading the body would
  // leave the connection held open until it is collected.
  await res.body?.cancel();
  return res;
}

/**
 * @typedef {object} Reachability
 * @property {'ok' | 'refused' | 'unreachable' | 'rate-limited'} verdict
 *   'refused' is the host saying no, which a phone will hear too.
 *   'unreachable' is no answer at all, which on a managed network is as
 *   likely to be the proxy as the site. 'rate-limited' is this machine
 *   asking too fast, never a phone problem.
 * @property {string} detail What was seen, for a message.
 */

/**
 * @param {string} url
 * @returns {Promise<Reachability>}
 */
export async function checkImageUrl(url) {
  try {
    let res = await fetchImage(url);
    // Wikimedia rate-limits a burst. A phone asks for one picture at a
    // time and never sees this, so wait as told and ask again.
    for (let tries = 0; res.status === 429 && tries < 3; tries++) {
      const wait = Number(res.headers.get('retry-after')) || 2 ** tries * 2;
      await new Promise((resolve) => setTimeout(resolve, wait * 1000));
      res = await fetchImage(url);
    }
    const type = res.headers.get('content-type') ?? '';
    if (res.status === 429) return { verdict: 'rate-limited', detail: 'HTTP 429' };
    if (!res.ok) return { verdict: 'refused', detail: `HTTP ${res.status}` };
    if (!type.startsWith('image/')) return { verdict: 'refused', detail: type || 'no type' };
    return { verdict: 'ok', detail: type };
  } catch (error) {
    return { verdict: 'unreachable', detail: String(error?.cause?.code ?? error?.name ?? 'error') };
  }
}

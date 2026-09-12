/**
 * Head to head: three questions, packed into something you can send.
 *
 * The quiz is the part of the app people actually enjoy, and the score
 * screen already asks "Think you can beat me?" in five words. Until now
 * that was only a line of text: the friend who read it had no way to take
 * the challenge, because a fresh run draws three questions at random and
 * would never be the same three.
 *
 * A challenge fixes the run. It carries the exact question ids and the
 * score to beat, so both people answer the same thing and the comparison
 * means something.
 *
 * WHY A CODE AND NOT JUST A LINK
 *
 * The link is the good path, and `afrifacts://` opens straight into the
 * run. But a custom scheme is not always tappable: WhatsApp and X linkify
 * http(s) and leave unknown schemes as plain text. Until AfriFacts has a
 * domain and Android App Links to go with it, a share that only carried a
 * deep link would be dead text in exactly the app it was written for.
 *
 * So the same challenge travels twice in one message, as a link for the
 * phones that can use it and as eleven characters for the phones that
 * cannot. `decode` accepts either.
 */

/** Questions in a run. Kept here so the code length is derived, not guessed. */
export const CHALLENGE_LENGTH = 3;

/** Bumped if the packing below ever changes, so old codes fail loudly. */
const VERSION = '1';

/** Base36 characters per packed question id. */
const WIDTH = 3;

/**
 * Question ids per fact that a code can address.
 *
 * Enrich writes three. Eight is headroom that costs nothing here and
 * leaves fact numbers up to 5831 addressable in three base36 characters,
 * which is an order of magnitude past any launch corpus.
 */
const SEQ_SLOTS = 8;

const CODE_LENGTH = VERSION.length + WIDTH * CHALLENGE_LENGTH + 1;

/** The one id shape the studio emits: `q_nf_0101_2`. */
const QUESTION_ID = /^q_nf_(\d{4})_(\d{1,2})$/;

export interface Challenge {
  /** The exact questions, in the order they were answered. */
  questionIds: string[];
  /** The score to beat. */
  score: number;
  /** Who set it. Empty when the code was typed rather than followed. */
  name: string;
}

/** `q_nf_0101_2` becomes a small integer, or null if it is not that shape. */
function pack(id: string): number | null {
  const match = QUESTION_ID.exec(id);
  if (match === null) return null;

  const factNumber = Number(match[1]);
  const seq = Number(match[2]);
  if (seq < 1 || seq > SEQ_SLOTS) return null;

  const packed = factNumber * SEQ_SLOTS + (seq - 1);
  return packed < Math.pow(36, WIDTH) ? packed : null;
}

function unpack(packed: number): string {
  const factNumber = Math.floor(packed / SEQ_SLOTS);
  const seq = (packed % SEQ_SLOTS) + 1;
  return `q_nf_${String(factNumber).padStart(4, '0')}_${seq}`;
}

/**
 * A challenge as eleven characters, or null when it cannot be packed.
 *
 * Returning null rather than throwing is deliberate: the caller is a
 * button, and a button that cannot build a valid challenge should hide
 * rather than offer a code that resolves to the wrong questions.
 */
export function encode(questionIds: string[], score: number): string | null {
  if (questionIds.length !== CHALLENGE_LENGTH) return null;
  if (!Number.isInteger(score) || score < 0 || score > CHALLENGE_LENGTH) return null;

  let body = '';
  for (const id of questionIds) {
    const packed = pack(id);
    if (packed === null) return null;
    body += packed.toString(36).toUpperCase().padStart(WIDTH, '0');
  }

  return VERSION + body + score.toString(36).toUpperCase();
}

/**
 * Read a challenge out of a code, a deep link, or a whole pasted message.
 *
 * People paste the entire WhatsApp message, so this looks for the code
 * inside whatever it is handed rather than insisting on it alone.
 */
export function decode(input: string, name = ''): Challenge | null {
  const cleaned = input.toUpperCase().replace(/[^0-9A-Z]/g, '');
  if (cleaned.length < CODE_LENGTH) return null;

  // Scan rather than anchor: a pasted message has the link's own
  // characters around the code.
  for (let start = 0; start + CODE_LENGTH <= cleaned.length; start++) {
    const candidate = cleaned.slice(start, start + CODE_LENGTH);
    const parsed = readCode(candidate);
    if (parsed !== null) return { ...parsed, name: name.trim().slice(0, 40) };
  }
  return null;
}

function readCode(code: string): Omit<Challenge, 'name'> | null {
  if (code.slice(0, VERSION.length) !== VERSION) return null;

  const questionIds: string[] = [];
  let at = VERSION.length;
  for (let i = 0; i < CHALLENGE_LENGTH; i++) {
    const packed = parseInt(code.slice(at, at + WIDTH), 36);
    if (Number.isNaN(packed)) return null;
    questionIds.push(unpack(packed));
    at += WIDTH;
  }

  const score = parseInt(code.slice(at, at + 1), 36);
  if (Number.isNaN(score) || score > CHALLENGE_LENGTH) return null;

  // Three questions from three different facts is what `getQuiz` deals,
  // so a code that repeats one is a misread rather than a real challenge.
  if (new Set(questionIds).size !== questionIds.length) return null;

  return { questionIds, score };
}

/** `1AB2-C3D4-E5F`. Grouped for reading aloud and typing. */
export function format(code: string): string {
  return (code.match(/.{1,4}/g) ?? [code]).join('-');
}

/**
 * What actually gets sent.
 *
 * `link` and `storeUrl` are passed in rather than built here. Everything
 * above this line is arithmetic on strings, and keeping it that way means
 * the codec can be round-tripped in a bare Node process; the moment this
 * file imports `expo-constants` it can only be exercised inside a running
 * app. `link.ts` owns the two values that need the environment.
 */
export function message({
  code,
  link,
  storeUrl,
  score,
  total,
}: {
  code: string;
  link: string;
  storeUrl: string;
  score: number;
  total: number;
}): string {
  // First person throughout. The sender is the one typing send, and the
  // name travels in the link instead, for the receiver's screen to use.
  return [
    `I got ${score}/${total} on AfriFacts. Think you can beat me?`,
    '',
    `Same ${total} questions: ${link}`,
    `Or enter code ${format(code)} in the app.`,
    '',
    `Get AfriFacts: ${storeUrl}`,
  ].join('\n');
}

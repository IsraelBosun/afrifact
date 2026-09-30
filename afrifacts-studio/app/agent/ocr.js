/**
 * Text out of a pasted image, in the browser.
 *
 * DeepSeek, which runs everything else, cannot see images, and the
 * screenshots people paste are almost always text: a post, a tweet, a
 * graphic with a caption. So this is OCR, not a vision model: free, no
 * key, and nothing leaves the machine but the one-time download of the
 * recogniser. The text lands in the paste box, where you can see it and
 * fix a misread word, and from there it is checked like anything typed.
 *
 * One worker, created on first use and kept: starting one loads the
 * language data, which is the slow part.
 */

/** @type {Promise<any> | null} */
let workerPromise = null;

function worker() {
  workerPromise ??= import('tesseract.js').then(({ createWorker }) => createWorker('eng'));
  // A failed start (offline on first use) must not be cached forever.
  workerPromise.catch(() => {
    workerPromise = null;
  });
  return workerPromise;
}

/**
 * Lines read with less confidence than this are dropped. Measured on
 * phone screenshots: real text reads at 94 to 96, while a photo behind
 * the text reads as lines of gibberish at 6 to 50.
 */
const MIN_CONFIDENCE = 60;

/**
 * @param {Blob} image
 * @returns {Promise<string>} One line per paragraph, so a sentence the
 *   screenshot wrapped over four lines comes back as one.
 */
export async function readImage(image) {
  const w = await worker();
  const { data } = await w.recognize(image, {}, { blocks: true });
  const paragraphs = (data?.blocks ?? []).flatMap((b) => b.paragraphs ?? []);
  return paragraphs
    .map((p) =>
      (p.lines ?? [])
        .filter((l) => l.confidence >= MIN_CONFIDENCE)
        .map((l) => l.text.replace(/\s+/g, ' ').trim())
        .join(' ')
        .trim(),
    )
    .filter((text) => /[A-Za-z]{2,}/.test(text))
    .join('\n');
}

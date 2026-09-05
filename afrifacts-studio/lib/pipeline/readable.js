/**
 * Turning a web page into the plain text the pipeline can verify.
 *
 * Wikipedia hands over clean prose through an API. Every other site
 * hands over a document containing a navigation bar, a cookie banner, a
 * newsletter box, three related-article rails and, somewhere inside all
 * of it, the article. This file finds the article.
 *
 * WHY IT MATTERS MORE THAN IT LOOKS. The extractor is shown this text
 * and the verifier string-matches every quoted passage against it. Junk
 * that survives becomes quotable: a model handed a page whose text is
 * half menu items will happily return "Politics Business Sport Opinion
 * Subscribe" as a passage and it will verify, because it really is in
 * the document. Everything cut here is a passage that can never be
 * fabricated from, and every heading kept is a sentence that can.
 *
 * NO DEPENDENCY. Readability implementations exist and are better than
 * this at the long tail. This project holds the LLM keys and keeps its
 * dependency list short on purpose (CLAUDE.md §11), and the failure mode
 * of a crude extractor is a page that gets rejected for being too short,
 * which is visible and survivable. The failure mode of a supply-chain
 * compromise in the project that holds the keys is not.
 *
 * The trade is stated rather than hidden: this will do badly on
 * JavaScript-rendered pages, which return a shell with no prose. Those
 * fail the length check and are reported as such, which is the honest
 * outcome — better than extracting facts from a loading spinner.
 */

/**
 * Tags whose contents are never article text.
 *
 * `<form>` is NOT in this list, and its absence is deliberate. It was in
 * it, and it cost a real source: africa-confidential.com wraps its entire
 * page body in a single <form>, which many older CMSs do, so deleting the
 * element deleted the article — 8,975 characters of text down to 110, and
 * the page was then refused as "probably JavaScript-rendered". Any rule
 * that removes a whole container is only safe for containers that are
 * always small, and a form is not one of them.
 */
const STRIP_WHOLE =
  /<(script|style|noscript|svg|iframe|button|select|textarea|template|figcaption)\b[^>]*>[\s\S]*?<\/\1>/gi;

/**
 * The interactive parts of a form, without the form.
 *
 * This is what removing <form> was actually trying to achieve: search
 * boxes and their labels are not prose. Removing the controls does that
 * and cannot take the page with it.
 */
const STRIP_CONTROLS = /<(input|option)\b[^>]*>|<label\b[^>]*>[\s\S]*?<\/label>/gi;

/**
 * Page furniture, removed with its contents.
 *
 * Only used on the fallback path. These are the risky ones — a badly
 * built page can wrap its whole article in <aside>, and a non-greedy
 * match across nested <header> elements can cut from the first opening
 * tag to the wrong closing one. The paragraph harvest does not need any
 * of this: navigation and menus are not written in <p>, so they are
 * excluded by looking in the right place rather than by cutting.
 */
const STRIP_FURNITURE = /<(nav|header|footer|aside|menu)\b[^>]*>[\s\S]*?<\/\1>/gi;

/** Tags that end a line of prose. */
const BLOCK =
  /<\/?(p|div|section|article|main|br|hr|h[1-6]|li|ul|ol|tr|td|th|table|blockquote|pre|dd|dt|dl)\b[^>]*>/gi;

const ENTITIES = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', ndash: '–',
  mdash: '—', lsquo: '‘', rsquo: '’', ldquo: '“', rdquo: '”',
  hellip: '…', middot: '·', bull: '•', times: '×', deg: '°', pound: '£',
  euro: '€', copy: '©', reg: '®', trade: '™', eacute: 'é', egrave: 'è',
  agrave: 'à', ccedil: 'ç', ouml: 'ö', uuml: 'ü', auml: 'ä', szlig: 'ß',
  ntilde: 'ñ', oacute: 'ó', aacute: 'á', iacute: 'í', uacute: 'ú',
};

/** @param {string} text */
function decode(text) {
  return text
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => safeChar(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => safeChar(Number(dec)))
    .replace(/&([a-z]+);/gi, (whole, name) => ENTITIES[name.toLowerCase()] ?? whole);
}

/** @param {number} code */
function safeChar(code) {
  return Number.isFinite(code) && code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : '';
}

/**
 * How much actual text a fragment of HTML holds.
 *
 * Used to decide whether a strategy found an article, and it has to
 * ignore the markup: a nav bar of forty links is thousands of characters
 * of HTML and thirty characters of words.
 *
 * @param {string} html
 */
function plainLength(html) {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().length;
}

/** @param {string} html @param {RegExp} pattern */
function firstGroup(html, pattern) {
  const match = html.match(pattern);
  return match ? decode(match[1]).trim() : '';
}

/**
 * A meta tag's content, by name or property, whichever the page used.
 *
 * @param {string} html
 * @param {string} key
 */
function meta(html, key) {
  const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return (
    firstGroup(
      html,
      new RegExp(`<meta[^>]+(?:name|property)=["']${escaped}["'][^>]*content=["']([^"']*)["']`, 'i'),
    ) ||
    firstGroup(
      html,
      new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]*(?:name|property)=["']${escaped}["']`, 'i'),
    )
  );
}

/**
 * The paragraphs on the page, wherever they sit.
 *
 * THIS IS THE PRIMARY STRATEGY, and it replaced a container-based one
 * that failed on a real source. Finding the article by locating its
 * wrapper means reasoning about nesting, and a publisher nests: a
 * ThisDay article page wraps the story in <article> AND wraps each
 * sidebar teaser in <article> too. The result was 61 characters of text —
 * one teaser headline — from a page carrying fifty thousand characters
 * of the story that had been searched for. Worse, it failed silently:
 * the page fetched cleanly, returned a plausible title, and was refused
 * for being "probably JavaScript-rendered", which was false.
 *
 * Paragraphs sidestep the whole problem. Prose lives in <p>; navigation
 * and teasers live in headings and links. There is no container to
 * identify and no nesting to get wrong, because <p> cannot contain a <p>.
 *
 * @param {string} html
 * @returns {string}
 */
function paragraphs(html) {
  const parts = [];
  for (const match of html.matchAll(/<(p|blockquote|li|dd)\b[^>]*>([\s\S]*?)<\/\1>/gi)) {
    parts.push(match[2]);
  }
  return parts.join('\n');
}

/**
 * A container's contents, counting nesting properly.
 *
 * Only the fallback now — used when a page carries its prose in bare
 * <div>s with no paragraph tags at all. It walks opens and closes with a
 * depth counter rather than matching lazily to the first close tag,
 * which is the bug described above.
 *
 * @param {string} html
 * @param {string} tag
 * @returns {string[]}
 */
function blocksOf(html, tag) {
  const opener = new RegExp(`<${tag}\\b[^>]*>`, 'gi');
  const token = new RegExp(`<(\\/?)${tag}\\b[^>]*>`, 'gi');
  const out = [];

  let open;
  while ((open = opener.exec(html)) !== null) {
    token.lastIndex = open.index;
    let depth = 0;
    let end = -1;
    let step;
    while ((step = token.exec(html)) !== null) {
      depth += step[1] ? -1 : 1;
      if (depth === 0) {
        end = step.index;
        break;
      }
    }
    if (end <= open.index) break;
    out.push(html.slice(open.index + open[0].length, end));
    // Past the whole element, so a nested one is never reported as a
    // second top-level block.
    opener.lastIndex = end;
  }
  return out;
}

/**
 * The largest <article> or <main>, when the page has one.
 *
 * @param {string} html
 * @returns {string}
 */
function bestBlock(html) {
  let best = '';
  for (const tag of ['article', 'main']) {
    for (const block of blocksOf(html, tag)) {
      if (block.length > best.length) best = block;
    }
    // An <article> is a stronger signal than a <main>, so stop at the
    // first tag that found something substantial rather than letting a
    // page-wide <main> beat it on length.
    if (best.length > 1000) return best;
  }
  return best.length > 1000 ? best : '';
}

/**
 * Lines that are furniture wherever they appear.
 *
 * Applied after the tags are gone, because a cookie notice is a cookie
 * notice whether it sat in a <div> or a <section>. Short lines with no
 * sentence punctuation are almost always menu items; the length floor
 * keeps real short sentences like "He never returned." which do end in
 * punctuation and would survive anyway.
 */
const JUNK_LINE =
  /^(share|tweet|advertisement|advertise with us|sponsored|read more|related|related articles|related stories|most read|trending|newsletter|subscribe|sign in|log in|log out|menu|home|search|comments?|\d+ comments?|follow us|contact us|privacy policy|terms of use|cookie policy|all rights reserved|copyright.*|by continuing.*|we use cookies.*|accept( all)?( cookies)?|skip to (main )?content)$/i;

/** @param {string} line */
function isJunk(line) {
  if (JUNK_LINE.test(line)) return true;

  // No word in it at all: a stray count, a rating, a row of punctuation
  // left behind by a widget. Measured on a real page, which yielded the
  // lines '0' and '4' between paragraphs.
  if (!/[a-z]{3}/i.test(line)) return true;

  /*
    A short line that does not end like a sentence is a label.

    Sixty rather than forty-five, because the line this was measured
    against — 'library_add library_add_check Subscribe to Topic', the
    text of three icon buttons — is forty-seven characters and passed.
    The cost of the wider net is real short prose: a caption like 'The
    Oba's palace at Benin City' goes with it. That trade is the right way
    round. A lost caption is a passage that never existed; a kept menu is
    a passage the model can quote and the verifier will confirm, because
    it really is in the document.

    Digits are spared throughout: '1,200 were killed' is short, has no
    terminal punctuation in some layouts, and is exactly the kind of line
    a fact rests on.
  */
  if (line.length < 60 && !/[.!?:]$/.test(line) && !/\d/.test(line)) return true;

  return false;
}

/**
 * @typedef {object} Readable
 * @property {string} title
 * @property {string} siteName
 * @property {string} text
 * @property {string} doi Empty unless the page declares one.
 * @property {string} publishedAt ISO date, empty when the page does not say.
 */

/**
 * Extract the readable article from a page of HTML.
 *
 * @param {string} html
 * @param {string} url
 * @returns {Readable}
 */
export function readable(html, url) {
  const source = String(html ?? '');

  const title =
    meta(source, 'og:title') ||
    meta(source, 'citation_title') ||
    firstGroup(source, /<title[^>]*>([\s\S]*?)<\/title>/i) ||
    url;

  let siteName = meta(source, 'og:site_name');
  if (siteName.length === 0) {
    try {
      siteName = new URL(url).hostname.replace(/^www\./, '');
    } catch {
      siteName = '';
    }
  }

  /*
    A DOI, when the page volunteers one.

    CLAUDE.md §7 wants a stable locator on every source and says a URL
    alone is not enough. Academic publishers declare their DOI in a meta
    tag, so on exactly the sources that most deserve to be cited properly
    the strongest possible locator is free to collect. Not searched for
    in the body text: a DOI in a reference list belongs to a different
    paper, and citing it would attribute the fact to the wrong work.
  */
  const doi = (meta(source, 'citation_doi') || meta(source, 'DC.identifier') || '')
    .replace(/^(https?:\/\/(dx\.)?doi\.org\/|doi:)/i, '')
    .trim();

  const publishedAt = (
    meta(source, 'article:published_time') ||
    meta(source, 'citation_publication_date') ||
    meta(source, 'DC.date') ||
    meta(source, 'datePublished') ||
    ''
  ).slice(0, 10);

  // Comments first: an HTML comment can contain anything, including tags
  // that would otherwise confuse every pattern below it.
  const stripped = source
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(STRIP_WHOLE, ' ')
    .replace(STRIP_CONTROLS, ' ');

  /*
    Paragraphs first, containers second.

    The paragraph harvest is right for anything written this century, and
    it is the only path that removes nothing: it looks where prose lives
    instead of cutting away where it does not. Every bug this file has had
    came from cutting — an <article> that turned out to be a sidebar
    teaser, a <form> that turned out to be the whole page.

    The fallbacks are for pages that put prose in bare <div>s. Furniture
    stripping applies only there, where the damage it can do is bounded by
    already having failed to find paragraphs.
  */
  let working = paragraphs(stripped);
  if (plainLength(working) < 600) {
    const furnitureless = stripped.replace(STRIP_FURNITURE, ' ');
    const block = bestBlock(furnitureless);
    working = block.length > 0 ? block : furnitureless;
  }

  const text = decode(
    working
      .replace(BLOCK, '\n')
      .replace(/<[^>]+>/g, ' '),
  )
    .replace(/\r/g, '')
    .split('\n')
    .map((line) => line.replace(/[ \t ]+/g, ' ').trim())
    .filter((line) => line.length > 0 && !isJunk(line))
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return { title: title.slice(0, 300), siteName, text, doi: doi.slice(0, 120), publishedAt };
}

/**
 * How much a domain is worth as a source, decided in code.
 *
 * The search now reaches the open web, which means the studio is handed
 * results ranging from a university press monograph to a listicle that
 * paraphrased Wikipedia. Something has to sort them, and it is this file
 * rather than the model.
 *
 * WHY NOT THE MODEL. The same argument that keeps a model out of
 * `verify.js` and out of the image licence filter: a judgement that is
 * load-bearing for the standard should be one you can read, diff and
 * disagree with. A model asked "is this trustworthy" gives a fluent
 * answer that varies between runs and cannot be audited afterwards. A
 * hostname is a fact about a URL — matching it against a list is
 * deterministic, free, instant, and the list is right here to be argued
 * with. The model's job is relevance: is this document actually about
 * the subject. That is what it is good at.
 *
 * WHAT THE TIER MEANS. It is `SourceTier` from `lib/types/provenance.js`,
 * and it is not a quality score — it is the KIND of evidence. A careful
 * newspaper is still press, and press reports what was claimed as much
 * as what happened. `validate()` warns on any fact resting only on
 * `press` or `reference`, and that warning is the whole reason for
 * bothering: with everything sourced to Wikipedia every fact was
 * `reference` and the warning was noise on 150 facts at once. A corpus
 * that reaches journals and government statistics can actually clear it.
 *
 * WIKIPEDIA STAYS FIRST. Not because it is the strongest evidence — it
 * is explicitly the weakest tier — but because it is the only source the
 * pipeline can re-read byte for byte at a revision id, and because its
 * plain-text API gives clean prose instead of a page of navigation
 * furniture. It is the safest thing to extract from even when it is not
 * the best thing to cite, so it is ranked first and marked as such.
 */

/**
 * @typedef {object} TrustVerdict
 * @property {import('../types/provenance.js').SourceTier} tier
 * @property {number} rank Lower sorts first. 0 is Wikipedia.
 * @property {string} label What the row says about itself, in the UI.
 * @property {boolean} usable False means it can never be a source.
 * @property {string} [why] Set when unusable, or when the rank needs a word.
 */

/**
 * Places that cannot be a source, whatever they happen to say.
 *
 * Two different reasons, deliberately in one list because the outcome is
 * the same. Social and video sites have no stable prose to quote at all.
 * Wikipedia mirrors and scrapers have prose, which is worse: it would
 * pass every check in the pipeline while citing a copy of the one source
 * the corpus is already over-reliant on, laundered into looking
 * independent.
 */
const NEVER = [
  // No quotable prose.
  'facebook.com', 'instagram.com', 'twitter.com', 'x.com', 'tiktok.com',
  'youtube.com', 'youtu.be', 'pinterest.com', 'linkedin.com', 'threads.net',
  'reddit.com', 'quora.com', 'answers.com', 'wikihow.com',
  'amazon.com', 'ebay.com', 'etsy.com', 'aliexpress.com',
  // Wikipedia wearing a different hat.
  'wikiwand.com', 'dbpedia.org', 'alchetron.com', 'everipedia.org',
  'wikizero.com', 'revolvy.com', 'fandom.com', 'wikipedia.org.uk',
  // Uploads and scrapes with no provenance of their own.
  'scribd.com', 'coursehero.com', 'studocu.com', 'slideshare.net',
  'academia.edu', 'researchgate.net',
];

/**
 * Suffix rules, checked before the name lists.
 *
 * An institution's domain says more than any list could enumerate: there
 * are thousands of universities and this project will never name them
 * all. `.gov.ng` and `.edu` are the two that matter most for a Nigerian
 * corpus and neither is guessable from a hand-written list.
 *
 * @type {{ suffix: string, tier: import('../types/provenance.js').SourceTier, rank: number, label: string }[]}
 */
const SUFFIXES = [
  { suffix: '.edu', tier: 'peer-reviewed', rank: 1, label: 'university' },
  { suffix: '.ac.uk', tier: 'peer-reviewed', rank: 1, label: 'university' },
  { suffix: '.ac.za', tier: 'peer-reviewed', rank: 1, label: 'university' },
  { suffix: '.edu.ng', tier: 'peer-reviewed', rank: 1, label: 'university' },
  { suffix: '.edu.au', tier: 'peer-reviewed', rank: 1, label: 'university' },
  { suffix: '.gov', tier: 'institutional', rank: 2, label: 'government' },
  { suffix: '.gov.ng', tier: 'institutional', rank: 2, label: 'government' },
  { suffix: '.gov.uk', tier: 'institutional', rank: 2, label: 'government' },
  { suffix: '.gov.za', tier: 'institutional', rank: 2, label: 'government' },
  { suffix: '.int', tier: 'institutional', rank: 2, label: 'intergovernmental' },
  { suffix: '.mil', tier: 'institutional', rank: 2, label: 'government' },
];

/**
 * Named hosts, strongest kind first.
 *
 * Not exhaustive and not meant to be. Anything absent lands in the
 * unranked bucket, which is shown and addable — it is a lower position
 * in a list, never a refusal. Add hosts here as you meet them.
 *
 * @type {{ tier: import('../types/provenance.js').SourceTier, rank: number, label: string, hosts: string[] }[]}
 */
const NAMED = [
  {
    tier: 'peer-reviewed',
    rank: 1,
    label: 'journal',
    hosts: [
      'doi.org', 'jstor.org', 'muse.jhu.edu', 'cambridge.org', 'oup.com',
      'academic.oup.com', 'tandfonline.com', 'springer.com', 'link.springer.com',
      'sciencedirect.com', 'wiley.com', 'onlinelibrary.wiley.com', 'nature.com',
      'science.org', 'plos.org', 'pnas.org', 'sagepub.com', 'journals.sagepub.com',
      'brill.com', 'degruyter.com', 'ajol.info', 'scielo.org', 'ncbi.nlm.nih.gov',
      'pubmed.ncbi.nlm.nih.gov', 'jstor.com', 'africabib.org', 'erudit.org',
      'openedition.org', 'journals.openedition.org', 'persee.fr',
    ],
  },
  {
    tier: 'institutional',
    rank: 2,
    label: 'institution',
    hosts: [
      'un.org', 'unesco.org', 'who.int', 'worldbank.org', 'imf.org', 'undp.org',
      'unicef.org', 'fao.org', 'africanunion.org', 'au.int', 'afdb.org',
      'britishmuseum.org', 'si.edu', 'americanhistory.si.edu', 'metmuseum.org',
      'nationalarchives.gov.uk', 'loc.gov', 'bl.uk', 'rijksmuseum.nl',
      'nationalgeographic.com', 'smithsonianmag.com', 'unhcr.org', 'ilo.org',
      'cbn.gov.ng', 'nigerianstat.gov.ng', 'nnpcgroup.com', 'nbs.gov.ng',
      'archive.org', 'openlibrary.org', 'gutenberg.org', 'hathitrust.org',
      'worldhistory.org', 'britannica.com',
      /*
        Guinness World Records is institutional for the thing it
        adjudicates and nothing else. On 'who holds this record' it is
        not relaying a figure from elsewhere, it is the body that issued
        it, which is the same standing nigerianstat.gov.ng has on a
        population count. That is what lifts it above 'reference' and
        clears the corroboration warning honestly.

        The limit is worth knowing: a GWR page also carries history and
        colour around the record, and on that material it is a reference
        work like any other. The tier is per host, so it cannot express
        the distinction. A reviewer can.
      */
      'guinnessworldrecords.com',
    ],
  },
  {
    tier: 'press',
    rank: 3,
    label: 'press',
    hosts: [
      'bbc.com', 'bbc.co.uk', 'reuters.com', 'apnews.com', 'theguardian.com',
      'nytimes.com', 'washingtonpost.com', 'ft.com', 'economist.com',
      'aljazeera.com', 'cnn.com', 'npr.org', 'time.com', 'newyorker.com',
      'theatlantic.com', 'lemonde.fr', 'dw.com', 'france24.com',
      // Nigerian press. Deliberately generous: for a Nigerian corpus these
      // are the papers that actually covered the events, and a London desk
      // reporting Lagos is not a stronger source than a Lagos desk.
      'premiumtimesng.com', 'punchng.com', 'vanguardngr.com', 'thisdaylive.com',
      'dailytrust.com', 'thecable.ng', 'guardian.ng', 'businessday.ng',
      'channelstv.com', 'thenationonlineng.net', 'sunnewsonline.com',
      'tribuneonlineng.com', 'nairametrics.com', 'saharareporters.com',
      'africanews.com', 'theafricareport.com', 'mg.co.za', 'news24.com',
    ],
  },
];

/** @param {string} value */
export function hostOf(value) {
  try {
    return new URL(String(value)).hostname.toLowerCase().replace(/^www\./, '');
  } catch {
    return '';
  }
}

/** @param {string} host @param {string} name */
function isHost(host, name) {
  return host === name || host.endsWith(`.${name}`);
}

/**
 * Is this URL one adjudicated record rather than an article?
 *
 * Deliberately narrow. It matches the record pages of a record keeper,
 * not the whole host. guinnessworldrecords.com also publishes ordinary
 * news and feature articles, and those are articles in every sense that
 * matters here: long enough for the article gates, and full of the page
 * furniture the record profile is built to cut.
 *
 * The answer is stored on the source at the moment it is added, never
 * consulted again at fetch time. See the note in `addSource`.
 *
 * @param {string} url
 * @returns {boolean}
 */
export function isRecordPage(url) {
  const host = hostOf(url);
  if (host !== 'guinnessworldrecords.com') return false;
  try {
    return new URL(url).pathname.toLowerCase().startsWith('/world-records/');
  } catch {
    return false;
  }
}

/**
 * What this URL is worth, and whether it can be a source at all.
 *
 * @param {string} url
 * @returns {TrustVerdict}
 */
export function trustOf(url) {
  const host = hostOf(url);

  if (host.length === 0) {
    return { tier: 'reference', rank: 9, label: 'unreadable', usable: false, why: 'Not a URL.' };
  }

  if (isHost(host, 'en.wikipedia.org')) {
    return {
      tier: 'reference',
      rank: 0,
      label: 'Wikipedia',
      usable: true,
      // Said out loud because rank 0 and the weakest tier look like a
      // contradiction until you know why: it is ranked first for being
      // re-readable at a revision, not for being strong evidence.
      why: 'Re-readable at a fixed revision. Weakest tier; wants corroboration.',
    };
  }

  // Other-language Wikipedias and sister projects. Extractable in
  // principle, but the fetcher only speaks the English API and the
  // corpus is English, so they are ranked with the rest of the web
  // rather than given Wikipedia's place.
  if (isHost(host, 'wikipedia.org') || isHost(host, 'wikisource.org')) {
    return { tier: 'reference', rank: 4, label: 'Wikimedia', usable: true };
  }

  for (const blocked of NEVER) {
    if (isHost(host, blocked)) {
      return {
        tier: 'reference',
        rank: 9,
        label: host,
        usable: false,
        why: 'Nothing quotable, or a copy of Wikipedia wearing another name.',
      };
    }
  }

  for (const rule of SUFFIXES) {
    if (host.endsWith(rule.suffix)) {
      return { tier: rule.tier, rank: rule.rank, label: rule.label, usable: true };
    }
  }

  for (const group of NAMED) {
    for (const name of group.hosts) {
      if (isHost(host, name)) {
        return { tier: group.tier, rank: group.rank, label: group.label, usable: true };
      }
    }
  }

  /*
    Everything else.

    `reference` rather than `press`, because an unrecognised site is more
    likely to be aggregating than reporting, and because guessing upward
    is the expensive mistake: it would silence the corroboration warning
    on a fact that has not earned it. Still usable — the list above is a
    starting point, not a licence regime, and a good source nobody has
    added yet should be one click away, just further down the page.
  */
  return {
    tier: 'reference',
    rank: 5,
    label: host,
    usable: true,
    why: 'Not a site the studio knows. Read it before you mine it.',
  };
}

/**
 * Sort search hits into the order they should be offered in.
 *
 * Trust first, then whatever order the search engine gave — its ranking
 * is real signal about relevance and there is nothing better to break
 * ties with.
 *
 * @template {{ trust: TrustVerdict }} T
 * @param {T[]} rows
 * @returns {T[]}
 */
export function byTrust(rows) {
  return rows
    .map((row, index) => ({ row, index }))
    .sort((a, b) => a.row.trust.rank - b.row.trust.rank || a.index - b.index)
    .map((entry) => entry.row);
}

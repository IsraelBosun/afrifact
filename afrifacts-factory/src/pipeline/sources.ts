/**
 * The seed list: which documents the pipeline reads.
 *
 * Deliberately a hand-written file, not a crawler. CLAUDE.md §7: choosing
 * which sources to mine is judgment work with enormous leverage, and it is
 * where a person who knows the material beats any crawler. Automate the
 * extraction; never automate the choosing.
 *
 * These pages were picked on one criterion: subjects whose NAME is widely
 * known but whose DETAIL is not. That gap is where facts an educated
 * Nigerian does not already know actually live.
 */

export interface SourceDoc {
  /** Stable slug used for the cache filename and the fact id prefix. */
  slug: string;
  /** Wikipedia article title, exactly as it appears in the URL. */
  title: string;
  country: string;
  /**
   * Wikipedia is tier 'reference' — aggregation, weakest on its own. The
   * validator will warn on any fact resting only on this, which is
   * correct: the article's own footnotes are where corroboration comes
   * from, and that is a later stage.
   */
  tier: 'reference';
}

export const SOURCES: SourceDoc[] = [
  // People. The founder's own 22 exemplars are overwhelmingly about a
  // person doing something startling, and the first run — ten kingdom and
  // archaeology pages — could not have produced a single one of them.
  { slug: 'equiano', title: 'Olaudah Equiano', country: 'NG', tier: 'reference' },
  { slug: 'anini', title: 'Lawrence Anini', country: 'NG', tier: 'reference' },
  { slug: 'nwude', title: 'Emmanuel Nwude', country: 'NG', tier: 'reference' },
  { slug: 'dikko', title: 'Umaru Dikko', country: 'NG', tier: 'reference' },
  { slug: 'ogunlesi', title: 'Adebayo Ogunlesi', country: 'NG', tier: 'reference' },
  { slug: 'babayaro', title: 'Celestine Babayaro', country: 'NG', tier: 'reference' },
  { slug: 'soyinka', title: 'Wole Soyinka', country: 'NG', tier: 'reference' },
  { slug: 'fela', title: 'Fela Kuti', country: 'NG', tier: 'reference' },
  { slug: 'ransome-kuti', title: 'Funmilayo Ransome-Kuti', country: 'NG', tier: 'reference' },
  { slug: 'aliyu', title: 'Jelani Aliyu', country: 'NG', tier: 'reference' },
  { slug: 'abiola', title: 'Moshood Abiola', country: 'NG', tier: 'reference' },
  { slug: 'awolowo', title: 'Obafemi Awolowo', country: 'NG', tier: 'reference' },
  { slug: 'okoye', title: 'Christian Okoye', country: 'NG', tier: 'reference' },
  { slug: 'amusan', title: 'Tobi Amusan', country: 'NG', tier: 'reference' },
  { slug: 'adichie', title: 'Chimamanda Ngozi Adichie', country: 'NG', tier: 'reference' },
  { slug: 'burna', title: 'Burna Boy', country: 'NG', tier: 'reference' },

  // Events that read like fiction.
  { slug: 'igbo-landing', title: 'Igbo Landing', country: 'NG', tier: 'reference' },
  { slug: 'dikko-affair', title: 'Dikko Affair', country: 'NG', tier: 'reference' },
  { slug: 'biafra', title: 'Nigerian Civil War', country: 'NG', tier: 'reference' },
  { slug: 'ekpo', title: "Aba Women's Riots", country: 'NG', tier: 'reference' },
  { slug: 'bar-beach', title: 'Bar Beach, Lagos', country: 'NG', tier: 'reference' },
  { slug: 'apollo-77', title: 'FESTAC 77', country: 'NG', tier: 'reference' },

  // Places people live in and never wonder about.
  { slug: 'lekki', title: 'Lekki', country: 'NG', tier: 'reference' },
  { slug: 'port-harcourt', title: 'Port Harcourt', country: 'NG', tier: 'reference' },
  { slug: 'igbo-ora', title: 'Igbo-Ora', country: 'NG', tier: 'reference' },
  { slug: 'lagos', title: 'Lagos', country: 'NG', tier: 'reference' },
  { slug: 'calabar', title: 'Calabar', country: 'NG', tier: 'reference' },
  { slug: 'zuma-rock', title: 'Zuma Rock', country: 'NG', tier: 'reference' },

  // Things in daily life with a story behind them.
  { slug: 'jollof', title: 'Jollof rice', country: 'NG', tier: 'reference' },
  { slug: 'nollywood', title: 'Nollywood', country: 'NG', tier: 'reference' },
  { slug: 'afrobeats', title: 'Afrobeats', country: 'NG', tier: 'reference' },
  { slug: 'agbada', title: 'Agbada', country: 'NG', tier: 'reference' },
  { slug: 'sickle-cell', title: 'Sickle cell disease', country: 'NG', tier: 'reference' },
  { slug: 'nairaland', title: 'Nairaland', country: 'NG', tier: 'reference' },
  { slug: 'danfo', title: 'Danfo', country: 'NG', tier: 'reference' },
  { slug: 'super-eagles', title: 'Nigeria national football team', country: 'NG', tier: 'reference' },
];

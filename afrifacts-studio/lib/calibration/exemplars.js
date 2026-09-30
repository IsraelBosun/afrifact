/**
 * The 22 facts that define what AfriFacts is trying to find.
 *
 * Written by the founder, not by a model, and they are the target the
 * pipeline is aimed at. They do two jobs:
 *
 *   1. They go into the extraction prompt as examples. Describing "make
 *      it interesting" to a model does not work — that was measured, not
 *      guessed. Showing it twenty-two of the real thing works better.
 *   2. They are candidates for the corpus in their own right, which means
 *      each one still needs a source and a passage before it ships. Same
 *      standard, different door (README, "The standard").
 *
 * What they have in common, and what the archaeology-heavy first run
 * missed entirely:
 *
 *   - A PERSON is usually at the centre, doing something startling.
 *   - The surprise is often a CONNECTION between two things the reader
 *     already knows separately (Soyinka and Fela; Merlin and a Finance
 *     Minister). Neither half is a fact. The link is.
 *   - They touch RECOGNISABLE life — Lekki, Port Harcourt, Pentatonix,
 *     BlackRock — things a person passes weekly without wondering about.
 *   - They are allowed two or three sentences: setup, then the turn. The
 *     twist lands last.
 *
 * `sourcing` records how hard each will be to source. It is not a claim
 * about whether the fact is true — it is a warning about what will be
 * needed to prove it. Nothing here ships until `passage` is filled in.
 */

/**
 * How hard each exemplar will be to source.
 *
 * - `documented` — a public record, a published figure, a documented event.
 * - `findable`   — real but scattered: press, obituaries, interviews. Needs digging.
 * - `contested`  — oral tradition, folk etymology, or contested. Needs care and caveats.
 * - `volatile`   — rests on something that changes: an office holder, a record, a total.
 *
 * @typedef {'documented' | 'findable' | 'contested' | 'volatile'} SourcingDifficulty
 */

/**
 * @typedef {object} Exemplar
 * @property {number} n The founder's own numbering, kept so a fact can be
 *   talked about.
 * @property {string} title
 * @property {string} text
 * @property {import('../types/fact.js').Category} category
 * @property {string} works Why this one works. Used in the prompt to make
 *   the pattern explicit.
 * @property {SourcingDifficulty} sourcing
 */

/** @type {Exemplar[]} */
export const EXEMPLARS = [
  {
    n: 1,
    title: "Lawrence Anini, 'The Law'",
    text: "Lawrence Anini, a 26-year-old armed robber, terrorised the old Bendel State through the 1980s. His reign of terror became so serious that Nigeria's military government discussed him at its highest security levels.",
    category: 'History',
    works: 'A named person, an age that makes it worse, and an ending that shows the scale.',
    sourcing: 'documented',
  },
  {
    n: 2,
    title: 'Bruce Mayrock',
    text: 'Bruce Mayrock, a 20-year-old American student, set himself on fire outside the United Nations in 1969 to protest the world doing nothing about the Biafran war.',
    category: 'History',
    works: 'An outsider caring enough to die for it. The age carries the whole fact.',
    sourcing: 'documented',
  },
  {
    n: 3,
    title: 'Igbo Landing',
    text: 'There is a place in America called Igbo Landing. In 1803 a ship carrying Igbo captives was seized by the captives themselves, who killed their captors and then walked into the water and drowned rather than be taken again.',
    category: 'History',
    works: 'Opens as a place name, lands as a mass suicide. The setup earns the turn.',
    sourcing: 'documented',
  },
  {
    n: 4,
    title: 'Biafran War',
    text: 'The Biafran War is one of the deadliest civil conflicts in modern history. Between two and four million people died, most of them Biafrans.',
    category: 'History',
    works: 'A number most Nigerians have never actually seen written down.',
    sourcing: 'documented',
  },
  {
    n: 5,
    title: 'Jelani Aliyu',
    text: 'The Chevrolet Volt, General Motors’ first mass-market electric car, was designed by Jelani Aliyu, a Nigerian from Sokoto.',
    category: 'Business',
    works: 'A globally known object turns out to have a Nigerian behind it.',
    sourcing: 'documented',
  },
  {
    n: 6,
    title: 'Hugo Weaving',
    text: 'Hugo Weaving (Agent Smith in The Matrix, Elrond in The Lord of the Rings) was born in Nigeria, at University College Hospital, Ibadan.',
    category: 'Culture',
    works: 'A connection between two known things. Neither half is surprising; the link is.',
    sourcing: 'documented',
  },
  {
    n: 7,
    title: 'Soyinka and Fela',
    text: 'Wole Soyinka and Fela Kuti were first cousins. Soyinka’s mother came from the Ransome-Kuti family.',
    category: 'Culture',
    works: 'Two household names, one hidden link. Short, and it needs no explanation.',
    sourcing: 'documented',
  },
  {
    n: 8,
    title: 'Celestine Babayaro',
    text: 'Celestine Babayaro became one of the youngest players ever to appear in the UEFA Champions League, at 16 years and 87 days.',
    category: 'Sports',
    works: 'The precision of "87 days" is what makes it land.',
    sourcing: 'documented',
  },
  {
    n: 9,
    title: 'Emmanuel Nwude',
    text: 'Emmanuel Nwude sold a Brazilian bank an airport that did not exist, taking $242 million, one of the largest banking frauds in history.',
    category: 'Business',
    works: 'An absurd premise stated flatly. No adjectives needed.',
    sourcing: 'documented',
  },
  {
    n: 10,
    title: 'Kevin Olusola',
    text: 'Kevin Olusola of Pentatonix, the a cappella group with billions of streams, is half Nigerian on his father’s side.',
    category: 'Culture',
    works: 'Recognisable in daily life. A person the reader has already heard sing.',
    sourcing: 'findable',
  },
  {
    n: 11,
    title: 'Ada Priscilla Nzimiro',
    text: 'Ada Priscilla Nzimiro was the first Igbo woman to qualify as a medical doctor. She died a year after graduating, aged 27.',
    category: 'History',
    works: 'A first, immediately undercut. The second sentence is the fact.',
    sourcing: 'findable',
  },
  {
    n: 12,
    title: 'The Dikko Affair',
    text: 'In 1984 Nigerian agents, working with Israeli operatives, tried to kidnap the exiled former minister Umaru Dikko from a London street and fly him home inside a crate. Customs officers opened the crate at Stansted.',
    category: 'History',
    works: 'Reads like fiction. The crate is the detail people repeat.',
    sourcing: 'documented',
  },
  {
    n: 13,
    title: 'Adebayo Ogunlesi',
    text: 'Adebayo Ogunlesi, from Sagamu in Ogun State, built the firm that owned Gatwick, London City and Edinburgh airports, then sold it to BlackRock for $12.5 billion.',
    category: 'Business',
    works: 'Named places the reader knows, and a number with real weight.',
    sourcing: 'documented',
  },
  {
    n: 14,
    title: 'Eat the King',
    text: 'In old Oyo, the new Alaafin was said to be served a dish made from the heart of the dead king before taking the throne. The Yoruba phrase "je oba" (eat the king) is said to come from it.',
    category: 'Culture',
    works: 'A phrase people still use, with an origin nobody expects.',
    sourcing: 'contested',
  },
  {
    n: 15,
    title: 'Olaudah Equiano',
    text: 'Olaudah Equiano, born in what is now Nigeria, published his autobiography in 1789, making him arguably the first Nigerian author in print.',
    category: 'History',
    works: 'A date far earlier than most readers would guess.',
    sourcing: 'documented',
  },
  {
    n: 16,
    title: 'Port Harcourt',
    text: 'Port Harcourt is named after Lord Harcourt, a British colonial secretary who never set foot in it.',
    category: 'History',
    works: 'A city millions live in, and nobody asks where the name came from.',
    sourcing: 'findable',
  },
  {
    n: 17,
    title: 'The Odd-Even Rule',
    text: 'In 1977 Lagos banned cars from the road on alternate days depending on whether their plate ended in an odd or even number, to fight traffic. It did not last.',
    category: 'History',
    works: 'A policy so strange it sounds invented, in living memory.',
    sourcing: 'documented',
  },
  {
    n: 18,
    title: 'Twin Capital of the World',
    text: 'Igbo Ora, a town in Oyo State, has one of the highest rates of twin births anywhere on earth.',
    category: 'Culture',
    works: 'A specific small town holding a world record.',
    sourcing: 'findable',
  },
  {
    n: 19,
    title: 'One in Six',
    text: 'One in every six Africans is Nigerian, out of 54 countries.',
    category: 'Culture',
    works: 'Reframes a known thing (Nigeria is big) into a number that startles.',
    sourcing: 'volatile',
  },
  {
    n: 20,
    title: 'The Sickle Cell Paradox',
    text: 'Nigeria has one of the highest rates of sickle cell disease in the world, because carrying one copy of the gene protects against malaria. Inherit it from both parents and you get the disease instead.',
    category: 'Culture',
    works: 'Explains itself in two sentences and the explanation is the surprise.',
    sourcing: 'documented',
  },
  {
    n: 21,
    title: "Lekki's Portuguese Roots",
    text: 'The name Lekki is thought to come from a Portuguese trader, Mr Lecqi, who settled in the area centuries ago.',
    category: 'History',
    works: 'A place name millions say daily, with a hidden origin.',
    sourcing: 'contested',
  },
  {
    n: 22,
    title: 'Elyan Was Nigerian',
    text: 'Adetomiwa Edun, who played Elyan in the BBC series Merlin, is the son of Wale Edun, Nigeria’s finance minister.',
    category: 'Culture',
    works: 'A connection between a childhood TV show and the news. Pure link.',
    sourcing: 'volatile',
  },
];

/**
 * The exemplars formatted for a prompt.
 *
 * Only the text and the reason are included. Categories and sourcing
 * notes are internal bookkeeping and would only give the model more
 * fields to imitate rather than more of the pattern to absorb.
 */
export function exemplarsForPrompt(limit = EXEMPLARS.length) {
  return EXEMPLARS.slice(0, limit)
    .map((e) => `- ${e.text}\n  (why it works: ${e.works})`)
    .join('\n\n');
}

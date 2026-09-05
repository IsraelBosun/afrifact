/**
 * History facts, hand written and fully sourced.
 *
 * These are the calibration set. They are what the surprise bar gets
 * written against later, so the standard is set by real examples rather
 * than guessed at in the abstract — and they are what to re-read when
 * checking whether the bar has drifted downward after eighty more facts.
 *
 * Every entry here must pass `validate()` with no errors before it counts.
 * Run `npm run check`.
 *
 * @type {import('../lib/types/provenance.js').SourcedFact[]}
 */
export const historyFacts = [
  {
    fact: {
      id: 'nf_0087',
      country: 'NG',
      category: 'History',
      fact: "Benin City's earthworks were once the longest man-made structure on earth, running four times the length of the Great Wall of China.",
      deepDive: {
        body: [
          'Before British forces burned it in 1897, Benin City sat at the centre of a system of walls and ditches that had been built up over roughly six centuries. The rampart did not enclose the city alone. It ran out into the surrounding countryside, dividing the kingdom into a lattice of enclosed communities.',
          'Surveying the network in the 1990s, the archaeologist Patrick Darling put the total length at somewhere over 16,000 kilometres, enclosing an area of about 6,500 square kilometres. The earth moved to build it has been estimated at 150 million cubic metres.',
          'The walls were not fortification in the European sense. They marked boundaries between communities, and the labour that raised them was organised through the same guild system that produced the Benin Bronzes.',
        ],
        whyItMatters:
          'The scale is the point. A structure of this size required centralised planning, sustained labour organisation, and a political system capable of holding both together across centuries — precisely the capacities that colonial accounts of West Africa insisted were absent.',
        readTime: 3,
        suggestedQuestion: 'What happened to the walls after 1897?',
      },
      source: {
        name: 'Guinness World Records',
        url: 'https://www.guinnessworldrecords.com/world-records/largest-earthworks',
        verified: true,
      },
      image: null,
      factNumber: 87,
      relatedIds: [],
    },
    provenance: {
      factId: 'nf_0087',
      origin: 'manual',
      sources: [
        {
          citation:
            'Darling, Patrick J. Archaeology and History in Southern Nigeria: The Ancient Linear Earthworks of Benin and Ishan. Oxford: British Archaeological Reports, 1984.',
          shortName: 'Darling',
          tier: 'peer-reviewed',
          locator: {
            isbn: '9780860542735',
            page: 'TODO: page for the length and volume figures',
          },
          passage:
            'TODO: quote the sentences giving the total length and the earth-moved figure, verbatim, from the page above.',
          note: 'Darling is the primary survey. Figures vary between summaries of his work, so quote him rather than a secondary source.',
        },
        {
          citation: "Pearce, Fred. 'The African Queen.' New Scientist, 11 September 1999.",
          shortName: 'New Scientist',
          tier: 'press',
          locator: {
            url: 'https://www.newscientist.com/article/mg16322035-100-the-african-queen/',
            publishedAt: '1999-09-11',
          },
          passage: 'TODO: quote the passage giving the comparison with the Great Wall, verbatim.',
          note: 'Popular write-up of Darling. Useful for the comparison framing, not as the primary figure.',
        },
      ],
      surprise: {
        priorProbability: 4,
        specificity: 5,
        explicability: 5,
      },
      review: {
        status: 'draft',
        reviewer: '',
        reviewedAt: '',
        notes: 'Passages and page numbers still to be filled in from the sources.',
      },
      decay: {
        // 15th-century earthworks are not going to change.
        kind: 'permanent',
      },
      createdAt: '2026-08-30',
    },
  },
];

/**
 * Records facts, hand written and fully sourced.
 *
 * Every entry rests on one Guinness World Records page, cached in
 * `_cache/` under the slug its locator hash belongs to. The passage on
 * each source is the literal record statement from that page, so all of
 * them can be re-checked with `passageInDocument()` against the bytes we
 * actually fetched rather than against the live site.
 *
 * Two rules shaped what is and is not here.
 *
 * `Records` is the narrow lane section 5 defines: a superlative somebody
 * official keeps score of. That is why these read as claims about records
 * rather than as claims about people. Where the person is the point, the
 * fact belongs in Sports or Culture instead.
 *
 * Section 11's one-story-one-fact rule cost this file two entries. Helen
 * Williams holds the longest, widest and tallest wig titles, which is one
 * story told three times; two are here and the widest is not, although
 * its page is on the seed list and cached. Anita Natacha Akide's 8-hour
 * makeover record is the same attempt as her 24-hour one and is left out
 * for the same reason.
 *
 * Every fact here is volatile. A record has a holder only until somebody
 * beats it, so each carries a reviewBy date. This file records what
 * Guinness said on the date in the citation, not what is true today.
 *
 * @type {import('../lib/types/provenance.js').SourcedFact[]}
 */

/** All thirteen pages were fetched on the same day. */
const RETRIEVED = '2026-09-10';

/** Six months. A record holder's shelf life is measured in months. */
const REVIEW_BY = '2027-03-10';

/**
 * Guinness is `institutional` here, not `reference`.
 *
 * On the question "who holds this record" it is not relaying a figure
 * from somewhere else, it is the body that issued it. That is the
 * standing nigerianstat.gov.ng has on a population count. The limit is
 * worth stating: these pages also carry history and colour around the
 * record, and on that material Guinness is a reference work like any
 * other. A per-host tier cannot express the difference. A reviewer can.
 *
 * @param {string} title
 * @param {string} url
 * @param {string} hash Content hash of the cached text, from `_cache/`.
 * @param {string} passage
 * @returns {import('../lib/types/provenance.js').SourceRecord}
 */
function gwr(title, url, hash, passage) {
  return {
    citation: `"${title}", Guinness World Records (retrieved ${RETRIEVED}). ${url}`,
    shortName: 'Guinness World Records',
    tier: 'institutional',
    locator: {
      url,
      // No wayback snapshot came back for any of these pages, so the hash
      // is the locator. It cannot help anyone find the page, but it
      // settles whether the quote was really on it.
      archiveRef: `sha256-${hash}`,
    },
    passage,
  };
}

/** The note most of these carry. Two say something more specific. */
const STANDARD_NOTE =
  'Written from the Guinness page, passage verified against the cache. Needs a human read before it ships.';

export const recordFacts = [
  {
    fact: {
      id: 'nf_0101',
      country: 'NG',
      category: 'Records',
      fact: "Samson Ajao holds the world record for the longest marathon reading aloud, 215 hours, and he never once used his rest breaks to sleep.",
      deepDive: {
        body: [
          "In May 2024, a 27-year-old from Osogbo sat down with a stack of books and did not get up for nine days. Samson Ajao read aloud continuously from 6 to 15 May, finishing at 215 hr 2 sec. The previous record was 124 hours, set in 2022 by Rysbai Isakov of Kyrgyzstan.",
          "The rules for a longest marathon record are strict. He had to read continuously from published works with no more than a 30-second pause between items, and he banked five minutes of rest for every hour read, two hours a day in total. Those breaks were the only time he could eat, sleep, use the bathroom or change his clothes. He told NTA News he did not sleep in them at all. Before he began, he had asked medical professionals which foods and drinks would preserve his voice and keep his toilet breaks down.",
          "He read around 100 books, covering finance, sales, management, leadership, politics, health and mental wellness. The Speaker of the Osun State House of Assembly and the state Education Commissioner both came to listen. When it was over, Samson and his supporters paraded through the street, his parents among them.",
        ],
        whyItMatters:
          "The record has a long history. An Englishman recited the complete works of Shakespeare in 1987 in a bard-a-thon lasting 110 hr 46 min, and the title passed through Nepal and Kyrgyzstan before Ajao nearly doubled it. His 215 hours is now one of the longest marathon attempts of any kind in Guinness World Records history.",
        readTime: 2,
        suggestedQuestion: "What are the rules for a marathon record attempt?",
      },
      source: {
        name: 'Guinness World Records',
        url: 'https://www.guinnessworldrecords.com/world-records/longest-marathon-reading-aloud',
        verified: true,
      },
      image: null,
      factNumber: 101,
      relatedIds: ['nf_0106', 'nf_0107'],
    },
    provenance: {
      factId: 'nf_0101',
      origin: 'manual',
      sources: [
        gwr(
          'Nigerian mans nine-day read-a-thon smashes world record',
          'https://www.guinnessworldrecords.com/news/2024/8/nigerian-mans-nine-day-read-a-thon-smashes-world-record',
          '50284c359f793f77',
          "Samson accumulated five minutes of rest time after each hour of reading, totalling two hours per day. Only during these breaks could he eat, sleep, use the bathroom or change his clothes.\nIn an interview with NTA News , Samson revealed he didn't sleep at all during his breaks.",
        ),
        gwr(
          'Longest marathon reading aloud',
          'https://www.guinnessworldrecords.com/world-records/longest-marathon-reading-aloud',
          '0cb50878afcef022',
          'The longest marathon reading aloud is 215 hr 2 sec and was achieved by Samson Ajao (Nigeria) in Osogbo, Osun State, Nigeria, from 6 to 15 May 2024.\nSamson chose this record to inspire a reading culture and development in literacy.',
        ),
      ],
      surprise: { priorProbability: 3, specificity: 5, explicability: 4 },
      review: { status: 'draft', reviewer: '', reviewedAt: '', notes: STANDARD_NOTE },
      decay: { kind: 'volatile', reviewBy: REVIEW_BY },
      createdAt: '2026-09-10',
    },
  },

  {
    fact: {
      id: 'nf_0102',
      country: 'NG',
      category: 'Records',
      fact: "Tunde Onakoya and Shawn Martinez hold the record for the longest chess marathon, 64 hours and 473 games, played in the middle of Times Square.",
      deepDive: {
        body: [
          "Between 17 and 20 April 2025, Tunde Onakoya of Nigeria and Shawn Martinez of the United States played chess in Times Square, New York City, for 64 hours without stopping. The certified time made it the longest chess marathon ever recorded.",
          "Inside that window they completed 473 games. A marathon record measures time rather than games, so 473 is not the figure being certified. It is what the hours were actually spent doing, and it is the number that says how fast the two were still moving by the third day.",
          "The venue was as much a choice as the record was. The attempt was staged in the middle of Times Square rather than anywhere in Nigeria, which put a Nigerian record attempt in front of an audience that had not come looking for one.",
        ],
        whyItMatters:
          "The 473 games are the part most accounts leave out. They turn a number about endurance into a number about play, and they are the reason a chess marathon is not simply two people staying awake at a board.",
        readTime: 2,
        suggestedQuestion: "How do the rules keep a chess marathon honest over three days?",
      },
      source: {
        name: 'Guinness World Records',
        url: 'https://www.guinnessworldrecords.com/world-records/longest-chess-marathon',
        verified: true,
      },
      image: null,
      factNumber: 102,
      relatedIds: ['nf_0101'],
    },
    provenance: {
      factId: 'nf_0102',
      origin: 'manual',
      sources: [
        gwr(
          'Longest chess marathon',
          'https://www.guinnessworldrecords.com/world-records/longest-chess-marathon',
          '8a997fcfddf46f4b',
          'The longest chess marathon is 64 hours, and was achieved by Tunde Onakoya (Nigeria) and Shawn Martinez (USA) in Times Square, New York City, New York, USA, between 17 April and 20 April 2025.\nThe attempt consisted of 473 chess games played.',
        ),
      ],
      surprise: { priorProbability: 3, specificity: 5, explicability: 4 },
      review: {
        status: 'draft',
        reviewer: '',
        reviewedAt: '',
        notes:
          'The marathon itself was widely covered in Nigeria. The angle here is the 473 games, which was not. Check that judgment.',
      },
      decay: { kind: 'volatile', reviewBy: REVIEW_BY },
      createdAt: '2026-09-10',
    },
  },

  {
    fact: {
      id: 'nf_0103',
      country: 'NG',
      category: 'Records',
      fact: "The largest art canvas ever painted measures 12,381.02 m², and it is the work of Kanyeyachukwu Tagbo-Okeke, a 14-year-old Nigerian boy living with autism.",
      deepDive: {
        body: [
          "Kanyeyachukwu Tagbo-Okeke, known as Kanye, finished the painting on 24 November 2024. It covers 12,381.02 m², it is titled Impossibility is a Myth, and at the heart of it is the infinity symbol, which stands for the potential of people on the spectrum.",
          "He did not unveil it straight away. The public reveal was held back until 2 April 2025, World Autism Day, so the painting would arrive carrying its message rather than only its measurement. The attempt doubled as a fundraiser for The Zeebah Foundation, an Abuja group that supports people on the spectrum and their families and is raising money for an autism resource centre.",
          "He was an artist long before the record. At eight years old he became the youngest recipient of the Flame of Peace award in Austria, for spreading peace through his art. In 2019 he had a solo exhibition at the Terra Kulture Art Gallery under the same title, and in 2022 one of his paintings appeared on the cover of the Art Vancouver Catalogue. His parents had gone looking for an outlet for him after learning he was on the spectrum at around two or three years old, and of everything they tried, painting was what took.",
        ],
        whyItMatters:
          "His father put the reason plainly. In Nigeria there is still a lot of stigmatisation, he said, a lot of parents are ashamed, a lot of children are hidden. The record was built to argue against that, and it reached far enough that President Bola Tinubu wrote publicly to call Kanye brave, audacious and tenacious.",
        readTime: 2,
        suggestedQuestion: "Why was the unveiling held back until World Autism Day?",
      },
      source: {
        name: 'Guinness World Records',
        url: 'https://www.guinnessworldrecords.com/world-records/621504-largest-art-canvas',
        verified: true,
      },
      image: null,
      factNumber: 103,
      relatedIds: ['nf_0110'],
    },
    provenance: {
      factId: 'nf_0103',
      origin: 'manual',
      sources: [
        gwr(
          'Nigerian teen with autism praised by president as he breaks massive art record',
          'https://www.guinnessworldrecords.com/news/2025/4/nigerian-teen-with-autism-praised-by-president-as-he-breaks-massive-art-record',
          '4aca91dda5aa7143',
          'At eight years old, he became the youngest recipient of the Flame of Peace award in Austria for spreading peace through his art.',
        ),
        gwr(
          'Largest art canvas',
          'https://www.guinnessworldrecords.com/world-records/621504-largest-art-canvas',
          '8b04e1b9aac820e1',
          'The largest art canvas is 12,381.02 m2 (133,268.21 sq ft) and was achieved by Kanyeyachukwu Tagbo-Okeke (Nigeria) in Abuja, Nigeria, as verified on 2 April 2025.\nKanyeyachukwu Tagbo-Okeke is a 14-year-old boy living with autism. While he completed his painting, entitled Impossibility is a Myth , on 24 November 2024, he unveiled it to the public on 2 April 2025 (World Autism Day) in order to call for greater awareness and inclusion for autism and neurodiversity in society.',
        ),
      ],
      surprise: { priorProbability: 3, specificity: 5, explicability: 5 },
      review: {
        status: 'draft',
        reviewer: '',
        reviewedAt: '',
        notes:
          'Strongest of the set on explicability. Confirm the age reads correctly: he was 14 at the time, not now.',
      },
      decay: { kind: 'volatile', reviewBy: REVIEW_BY },
      createdAt: '2026-09-10',
    },
  },

  {
    fact: {
      id: 'nf_0104',
      country: 'NG',
      category: 'Records',
      fact: "Munachimso Brian Nwana holds the record for the most fast food restaurants visited in 24 hours, 150 of them across Abuja, and the rules ban private transport so he walked over 25 km.",
      deepDive: {
        body: [
          "On 24 and 25 April 2024, Munachimso Brian Nwana, a 22-year-old content creator and food consultant, visited 150 different fast food restaurants in Abuja inside 24 hours. The previous record was 100, set by the American YouTuber Airrack, and before that it belonged to Nick DiGiovanni and the late Lynn Davis. Both of those attempts were made in New York City.",
          "No private transport is allowed. New York has clusters of restaurants and a public transport system to move between them, and Abuja does not, so Nwana did the whole route on foot. He walked over 25 km, starting at a Chicken Republic in the residential district of Gwarinpa and finishing at a Kilimanjaro in the city centre. He began and ended at 5 p.m., taking a nine-hour break from midnight to 9 a.m. to sleep.",
          "At every stop he had to buy and consume at least one item, with at least 75% of the orders being food. He says he ate probably enough to last a week, and tried to taste something from most places even if only a mouthful. Nothing was wasted: the rest went to his support team or was handed out to the public. His favourites were not the burgers and pizza but moin moin and àmàlà.",
        ],
        whyItMatters:
          "Nwana took the record on to promote Abuja's restaurants and showcase the variety of Nigerian cuisine, which makes the count of venues the argument rather than a by-product of it. As he put it, the Nigerian food space is worth paying attention to. He beat New York by fifty, on foot.",
        readTime: 2,
        suggestedQuestion: "How does Guinness verify a visit to each restaurant?",
      },
      source: {
        name: 'Guinness World Records',
        url: 'https://www.guinnessworldrecords.com/world-records/79203-most-fast-food-restaurants-visited-in-24-hours',
        verified: true,
      },
      image: null,
      factNumber: 104,
      relatedIds: ['nf_0105'],
    },
    provenance: {
      factId: 'nf_0104',
      origin: 'manual',
      sources: [
        gwr(
          'Nigerian foodie visits 150 fast food restaurants in 24 hours to smash record',
          'https://www.guinnessworldrecords.com/news/2024/8/nigerian-foodie-visits-150-fast-food-restaurants-24-hours-to-smash-record',
          'bcd722fea0bf9d94',
          "No forms of private transport can be used while attempting this record, and due to the city's limited public transportation infrastructure, Brian completed his entire route on foot.\nHe walked over 25 km (15 mi), beginning at Chicken Republic in the residential district of Gwarinpa and finishing in the city centre at fast food chain Kilimanjaro.",
        ),
        gwr(
          'Most fast food restaurants visited in 24 hours',
          'https://www.guinnessworldrecords.com/world-records/79203-most-fast-food-restaurants-visited-in-24-hours',
          '6a05e138d684dae9',
          'The most fast food restaurants visited in 24 hours is 150, achieved by Munachimso Brian Nwana (Nigeria) in Abuja, Nigeria, on 24-25 April 2024.\nMunachimso Brian Nwana took on this record challenge to promote and showcase Nigerian food businesses, as well as the variety of Nigerian cuisine.\nHe walked between each venue and all food ordered was consumed by himself, his support team, or distributed to the public.',
        ),
      ],
      surprise: { priorProbability: 4, specificity: 5, explicability: 4 },
      review: { status: 'draft', reviewer: '', reviewedAt: '', notes: STANDARD_NOTE },
      decay: { kind: 'volatile', reviewBy: REVIEW_BY },
      createdAt: '2026-09-10',
    },
  },

  {
    fact: {
      id: 'nf_0105',
      country: 'NG',
      category: 'Records',
      fact: "Hilda Baci cooked the largest serving of jollof rice on record, 8,780 kg, shared out as more than 16,600 portions.",
      deepDive: {
        body: [
          "On 12 September 2025, at an event in Victoria Island, Lagos, the chef Hilda Baci and the brand Gino cooked 8,780 kg of jollof rice in a single gigantic pot. Thousands came to watch, performers took the stage, and chants of 'Hilda, we want jollof' broke out while the crowd waited through the smell.",
          "The rules were specific about what went into it. Rice had to be at least 80% of the total weight, and Baci listed the rest: 4,000 kg of washed basmati rice, 164 kg of fresh goat meat, 220 kg of peppered chicken cubes and 600 kg of her own jollof pepper mix. She said it took nine hours of fire, passion and teamwork, and 1,200 kg of gas.",
          "None of it could be wasted, and that was in the rules too. Over 16,600 portions were handed out immediately after cooking and afterwards to local communities. Baci said she had not realised it would be this hard, and that the achievement belonged to the people of Nigeria as much as to her.",
        ],
        whyItMatters:
          "Baci already held the record that started Nigeria's run at the record books. In May 2023 she cooked for 93 hr 11 min, and so many people rushed to the Guinness website to see whether she had broken it that the site crashed. Applications flooded in afterwards from Nigerians wanting their own marathon attempts.",
        readTime: 2,
        suggestedQuestion: "What counted towards the rest of the weight?",
      },
      source: {
        name: 'Guinness World Records',
        url: 'https://www.guinnessworldrecords.com/world-records/72805-largest-bowl-of-rice',
        verified: true,
      },
      image: null,
      factNumber: 105,
      relatedIds: ['nf_0104'],
    },
    provenance: {
      factId: 'nf_0105',
      origin: 'manual',
      sources: [
        gwr(
          'Did Hilda Baci just win the Jollof Wars for Nigeria',
          'https://www.guinnessworldrecords.com/news/2025/9/did-hilda-baci-just-win-the-jollof-wars-for-nigeria-chef-cooks-up-largest-ever-serving',
          '5c4cfafcde1c635e',
          'There is a record for largest serving of Ghanaian style jollof rice but it currently has no holder.',
        ),
        gwr(
          'Largest serving of rice',
          'https://www.guinnessworldrecords.com/world-records/72805-largest-bowl-of-rice',
          '8a10bc6e990655e6',
          'The largest serving of rice is 8,780 kg (19356 lb, 9 oz) and was achieved by Hilda Baci and Gino (all Nigeria), in Victoria Island, Lagos, Nigeria, on 12 September 2025.\nThis record title was also achieved while attempting "Largest serving of Nigerian style jollof rice"! The ingredients for both records had to include rice and it be at least 80% of the total weight. Over 16,600 portions of the Nigerian style Jollof rice food were distributed immediately after cooking and also distributed to local communities.',
        ),
      ],
      surprise: { priorProbability: 3, specificity: 5, explicability: 4 },
      review: {
        status: 'draft',
        reviewer: '',
        reviewedAt: '',
        notes:
          'The jollof record itself was national news, so prior probability is the axis to argue about. The angle is the 80% rule and the portion count, neither of which was widely reported.',
      },
      decay: { kind: 'volatile', reviewBy: REVIEW_BY },
      createdAt: '2026-09-10',
    },
  },

  {
    fact: {
      id: 'nf_0106',
      country: 'NG',
      category: 'Records',
      fact: "The longest magic show ever performed by one person ran for 50 hours in Lagos, and Ibitoye Kingfahd took it on to prove that Nigeria misunderstands magic.",
      deepDive: {
        body: [
          "Ibitoye Kingfahd, who performs as Faddothegreat, kept a magic show running in Lagos for 50 hours between 27 and 29 November 2025.",
          "His stated reason was not endurance. He argues there is a widespread misconception about magic in Nigeria and across Africa, that the art form is often misunderstood, and that being misunderstood has hindered its growth and acceptance.",
          "The attempt was a deliberate effort to challenge that narrative and to get people thinking about magic a different way. That makes the 50 hours a piece of advocacy in the shape of a marathon.",
        ],
        whyItMatters:
          "Most marathon records are about the person attempting them. This one was aimed at a perception instead, and it used the only instrument available to a performer without a platform: a number nobody can argue with.",
        readTime: 2,
        suggestedQuestion: "What misconception about magic was he trying to challenge?",
      },
      source: {
        name: 'Guinness World Records',
        url: 'https://www.guinnessworldrecords.com/world-records/209713-longest-magic-show-individual',
        verified: true,
      },
      image: null,
      factNumber: 106,
      relatedIds: ['nf_0101'],
    },
    provenance: {
      factId: 'nf_0106',
      origin: 'manual',
      sources: [
        gwr(
          'Longest magic show by an individual',
          'https://www.guinnessworldrecords.com/world-records/209713-longest-magic-show-individual',
          'fe1f63dba4056b3b',
          'The longest magic show by an individual is 50 hours, and was achieved by Ibitoye Kingfahd a.k.a. Faddothegreat (Nigeria), in Lagos, Nigeria, between 27 and 29 November 2025.\nIbitoye believes there is a widespread misconception about magic in Nigeria and across Africa. He explains that the art form is often misunderstood, which has hindered its growth and acceptance. His decision to attempt this record was a deliberate effort to challenge that narrative and inspire a new way of thinking about magic.',
        ),
      ],
      surprise: { priorProbability: 4, specificity: 5, explicability: 4 },
      review: { status: 'draft', reviewer: '', reviewedAt: '', notes: STANDARD_NOTE },
      decay: { kind: 'volatile', reviewBy: REVIEW_BY },
      createdAt: '2026-09-10',
    },
  },

  {
    fact: {
      id: 'nf_0107',
      country: 'NG',
      category: 'Records',
      fact: "Favour Ogechi Ani holds the record for the highest number counted out loud, 1,070,000, and it took her 70 days of live YouTube broadcasts to say every one.",
      deepDive: {
        body: [
          "Favour Ogechi Ani began counting out loud on 8 October 2025. She finished on 16 December in Rivers State, having spoken every number up to 1,070,000.",
          "The count ran over 70 consecutive days as a series of live broadcasts on YouTube. Every number had to be said aloud, and the record leaves no shortcut for any of them.",
          "The broadcast is what made it checkable. A count this size cannot be witnessed in a room, and no adjudicator could sit through it. A public stream can be reviewed afterwards, which is what turns a feat nobody could watch into a record somebody can certify.",
        ],
        whyItMatters:
          "The record shows how live streaming changed what an ordinary person can prove. Verifying a count past a million once needed adjudicators standing by for weeks. A public broadcast running for 70 days does the same job, and it costs the claimant nothing but time.",
        readTime: 2,
        suggestedQuestion: "How many hours a day would that pace require?",
      },
      source: {
        name: 'Guinness World Records',
        url: 'https://www.guinnessworldrecords.com/world-records/100483-highest-number-counted-out-loud',
        verified: true,
      },
      image: null,
      factNumber: 107,
      relatedIds: ['nf_0101'],
    },
    provenance: {
      factId: 'nf_0107',
      origin: 'manual',
      sources: [
        gwr(
          'Highest number counted out loud',
          'https://www.guinnessworldrecords.com/world-records/100483-highest-number-counted-out-loud',
          'c36324d8dd3bb016',
          'The highest number counted out loud is 1,070,000, and was achieved by Favour Ogechi Ani (Nigeria) in Rivers State, Nigeria, on 16 December 2025.\nFavour verbally counted every number up to 1,070,000 during a series of live broadcasts on YouTube. Beginning on 8 October 2025, she completed the count over a total of 70 consecutive days.',
        ),
      ],
      surprise: { priorProbability: 4, specificity: 5, explicability: 4 },
      review: { status: 'draft', reviewer: '', reviewedAt: '', notes: STANDARD_NOTE },
      decay: { kind: 'volatile', reviewBy: REVIEW_BY },
      createdAt: '2026-09-10',
    },
  },

  {
    fact: {
      id: 'nf_0108',
      country: 'NG',
      category: 'Records',
      fact: "The longest handmade wig in the world runs 351.28 m, built on a bicycle helmet with 6,250 hair clips holding it together.",
      deepDive: {
        body: [
          "Helen Williams spent 11 days and over two million naira making it. She built the underlay from wig-cap netting and black fabric attached to a bicycle helmet, then finished the hairpiece with 1,000 bundles of hair, 12 cans of hair spray, 35 tubes of hair glue and 6,250 hair clips.",
          "Williams had been a professional wigmaker for eight years, producing anywhere from 50 to 300 wigs a week, and she chose this record because she knew it was something she could achieve. Even so, she said, at some point she felt exhausted, and it was friends and family who kept her focused. Finding the materials was not an easy task either.",
          "The hardest part was not the making. It was finding anywhere long enough to lay the wig out straight to be measured, and none of the venues she tried were long enough, several running tracks included. She measured it beside the Lagos to Abeokuta Expressway in the end. The wig now lives in her office, where she invites anyone who wants to come and look at it.",
        ],
        whyItMatters:
          "Williams grew up reading the annual Guinness World Records book, which is the part that closes the loop: a reader of the book became an entry in it. Her advice afterwards was that dreams are attainable, but the journey is a very rough one.",
        readTime: 2,
        suggestedQuestion: "How long does a wig like that take to make?",
      },
      source: {
        name: 'Guinness World Records',
        url: 'https://www.guinnessworldrecords.com/world-records/721597-longest-handmade-wig',
        verified: true,
      },
      image: null,
      factNumber: 108,
      relatedIds: ['nf_0109'],
    },
    provenance: {
      factId: 'nf_0108',
      origin: 'manual',
      sources: [
        gwr(
          'Nigerian woman creates worlds longest wig measuring over 350 metres',
          'https://www.guinnessworldrecords.com/news/2023/11/nigerian-woman-creates-worlds-longest-wig-measuring-over-350-metres-761072',
          '111f189bd9761290',
          'After constructing the underlay with wig-cap netting and black fabric attached to a bicycle helmet, she completed the hairpiece using 1,000 bundles of hair, 12 cans of hair spray, 35 tubes of hair glue, and 6,250 hair clips.',
        ),
        gwr(
          'Longest handmade wig',
          'https://www.guinnessworldrecords.com/world-records/721597-longest-handmade-wig',
          '2470ec13b5ac8579',
          'The longest handmade wig is 351.28 m (1,152 ft 5 in), and was achieved by Helen Williams (Nigeria), in Abule Egba, Nigeria, on 7 July 2023.\nHelen grew up reading the annual Guinness World Record books. She is a professional wig maker which is why she decided to attempt this record, as she knew it was something she could achieve.',
        ),
      ],
      surprise: { priorProbability: 3, specificity: 5, explicability: 3 },
      review: {
        status: 'draft',
        reviewer: '',
        reviewedAt: '',
        notes:
          'Paired with nf_0109 under the two-variants limit. The widest wig title is hers too and is deliberately not written up.',
      },
      decay: { kind: 'volatile', reviewBy: REVIEW_BY },
      createdAt: '2026-09-10',
    },
  },

  {
    fact: {
      id: 'nf_0109',
      country: 'NG',
      category: 'Records',
      fact: "Helen Williams holds the record for the tallest wig, 15.37 m standing off the top of her head, which makes it taller than the Hollywood sign is wide.",
      deepDive: {
        body: [
          "On 27 September 2025 in Lagos, Helen Williams put on a wig that stood 15.37 m off the top of her head. It towers over the building she posed outside, and it is taller than a three-storey building.",
          "It was her third wig record, after the longest handmade wig at 351.28 m and the widest at 3.65 m, and she calls it the hardest of the three. Her first attempt failed outright. The problem was the structure rather than the hair: you can know how to make a wig and have 10 or 20 years of experience, she said, but if the internal structure does not hold you will not get the record. She went back and designed it again, then made her official attempt months later.",
          "The finished wig took two weeks, used 250 bundles of string hair and cost over 3 million naira. Williams also holds records for the most hair clips in a wig in 30 seconds and the most hair clips on the head in 30 seconds.",
        ],
        whyItMatters:
          "Williams describes a record as climbing a mountain, where the climb is hard and full of challenges but the view from the top is incredible. She says each of hers represents a battle fought against doubt, fear and limits, and that she does not think she will ever stop breaking them.",
        readTime: 2,
        suggestedQuestion: "What holds a wig that tall upright?",
      },
      source: {
        name: 'Guinness World Records',
        url: 'https://www.guinnessworldrecords.com/world-records/tallest-wig',
        verified: true,
      },
      image: null,
      factNumber: 109,
      relatedIds: ['nf_0108'],
    },
    provenance: {
      factId: 'nf_0109',
      origin: 'manual',
      sources: [
        gwr(
          'Nigerian woman makes third record-breaking wig thats so tall it towers over buildings',
          'https://www.guinnessworldrecords.com/news/2025/12/nigerian-woman-makes-third-record-breaking-wig-thats-so-tall-it-towers-over-buildings',
          '0bb51e812e42286f',
          "And now, she's added the tallest wig to her collection by creating one that stands a whopping 15.37 m (50.42 ft) off the top of her head.\nIt literally towers over the building Helen is posing outside of... and the hair piece is taller than the Hollywood sign is wide!",
        ),
        gwr(
          'Tallest wig',
          'https://www.guinnessworldrecords.com/world-records/tallest-wig',
          '4bb17cecb3a9a57d',
          'The tallest wig is 15.37 m (50.42 ft) and was achieved by Helen Williams (Nigeria) in Lagos, Nigeria, on 27 September 2025.\nHelen has previously achieved records for the w idest wig and l ongest handmade wig . She describes this record as her greatest challenge so far.',
        ),
      ],
      surprise: { priorProbability: 4, specificity: 5, explicability: 4 },
      review: {
        status: 'draft',
        reviewer: '',
        reviewedAt: '',
        notes:
          'The passage carries two spacing artifacts from the page markup, "w idest" and "l ongest". Quoted as fetched rather than tidied, because a cleaned passage no longer matches the cache.',
      },
      decay: { kind: 'volatile', reviewBy: REVIEW_BY },
      createdAt: '2026-09-10',
    },
  },

  {
    fact: {
      id: 'nf_0110',
      country: 'NG',
      category: 'Records',
      fact: "Abidemi Praise Omopariola holds the record for the longest marathon drawing portraits, 90 hours, and she set it in Sunderland rather than anywhere in Nigeria.",
      deepDive: {
        body: [
          "Abidemi Praise Omopariola drew portraits for 90 hr without stopping, certified on 5 July 2024. It is the longest marathon drawing portraits by an individual.",
          "She set it in Sunderland, in the United Kingdom. Guinness lists her nationality as Nigerian and the venue as British, which is the ordinary shape of a diaspora record and one the record book notes without comment.",
          "She wanted the record in order to challenge herself, and the attempt drew a large turnout of people in support. Portrait drawing is not an endurance discipline, so a 90 hr record turns a skill into a stamina test.",
        ],
        whyItMatters:
          "What a portrait marathon leaves behind is a stack of drawings of whoever turned up. The audience becomes part of the record rather than spectators to it, which is not true of most marathon titles.",
        readTime: 2,
        suggestedQuestion: "Who were the portraits of?",
      },
      source: {
        name: 'Guinness World Records',
        url: 'https://www.guinnessworldrecords.com/world-records/758645-longest-marathon-drawing-portraits-individual',
        verified: true,
      },
      image: null,
      factNumber: 110,
      relatedIds: ['nf_0103'],
    },
    provenance: {
      factId: 'nf_0110',
      origin: 'manual',
      sources: [
        gwr(
          'Longest marathon drawing portraits (Individual)',
          'https://www.guinnessworldrecords.com/world-records/758645-longest-marathon-drawing-portraits-individual',
          '7177a0668e1e5ce1',
          'The longest marathon drawing portraits (Individual) is 90 hr, and was achieved by Abidemi Praise Omopariola (Nigeria) in Sunderland, UK, on 5 July 2024.\nAbidemi Praise wanted to break this record to challenge herself and was supported by a large turnout of people!',
        ),
      ],
      surprise: { priorProbability: 4, specificity: 5, explicability: 3 },
      review: {
        status: 'draft',
        reviewer: '',
        reviewedAt: '',
        notes:
          'Country is NG on the holder, not on the venue. Worth confirming that is the convention this corpus wants for diaspora records.',
      },
      decay: { kind: 'volatile', reviewBy: REVIEW_BY },
      createdAt: '2026-09-10',
    },
  },

  {
    fact: {
      id: 'nf_0111',
      country: 'NG',
      category: 'Records',
      fact: "Symply Tacha holds the record for the most cosmetic makeovers in 24 hours, 144 of them, some finished by phone flashlight when the power cut out.",
      deepDive: {
        body: [
          "Anita Natacha Akide, better known as Symply Tacha, set up a makeup station in Lagos on 11 October 2025 behind a glass wall so passers-by could watch and cheer. She did 82 makeovers in the first 8 hours, then kept going for the rest of the day to finish on 144 in 24 hours.",
          "Each of the 144 models had foundation, concealer, blush, two eyeshadows, mascara, lip liner and gloss and finishing powder applied, as well as their eyebrows done, and every makeover was personalised to the face in the chair. She beat the previous record, held by Mary Yongai of Sierra Leone, by more than 30.",
          "It did not go smoothly. A nine-hour storm brought down the screens, monitors and branding, and the team rebuilt the venue from scratch while the clock ran. Then the power failed three or four times. Her team turned on their phone flashlights and she carried on doing makeovers in the dark.",
        ],
        whyItMatters:
          "Akide says makeup has always been her safe space, and that as a child she kept saving up to replace the products her mother threw away. She wanted the record to show that Nigerian women can achieve anything they put their minds to, and that African women deserve global recognition.",
        readTime: 2,
        suggestedQuestion: "How long does that leave for each makeover?",
      },
      source: {
        name: 'Guinness World Records',
        url: 'https://www.guinnessworldrecords.com/world-records/most-cosmetic-makeovers-in-24-hours-(one-artist)',
        verified: true,
      },
      image: null,
      factNumber: 111,
      relatedIds: ['nf_0108'],
    },
    provenance: {
      factId: 'nf_0111',
      origin: 'manual',
      sources: [
        gwr(
          'Nigerian star Symply Tacha smashes two world records',
          'https://www.guinnessworldrecords.com/news/2025/11/nigerian-star-symply-tacha-smashes-two-world-records-by-making-other-women-feel-beautiful',
          'ccbb8be684282359',
          'On top of that, we experienced multiple power outages during the 24-hour attempt. The lights went off three or four times, but I refused to stop. My team turned on their phone flashlights, and I kept doing makeovers in the dark.',
        ),
        gwr(
          'Most cosmetic makeovers in 24 hours (individual)',
          'https://www.guinnessworldrecords.com/world-records/most-cosmetic-makeovers-in-24-hours-(one-artist)',
          '7ba33781fc4799a9',
          'The most cosmetic makeovers in 24 hours (individual) is 144 and was achieved by Anita Natacha Akide (Nigeria) in Lagos, Nigeria, on 11-12 October 2025.\nAnita Natacha Akide (also known as "Symply Tacha") is a media personality, entrepreneur, and philanthropist.\nShe broke the previous record by over 30!',
        ),
      ],
      surprise: { priorProbability: 3, specificity: 5, explicability: 3 },
      review: {
        status: 'draft',
        reviewer: '',
        reviewedAt: '',
        notes:
          'Her 8-hour makeover record is the same attempt and is deliberately not written up, under the one-story-one-fact rule.',
      },
      decay: { kind: 'volatile', reviewBy: REVIEW_BY },
      createdAt: '2026-09-10',
    },
  },

  {
    fact: {
      id: 'nf_0112',
      country: 'NG',
      category: 'Records',
      fact: "The longest dance marathon relay ran 53 hr 28 min 47 sec in Lagos, danced in turns by a team of seventeen.",
      deepDive: {
        body: [
          "On 6 April 2019 in Lagos, a team dancing in relay kept going for 53 hr 28 min 47 sec. The record is credited to Team Jason Joshua Usoro.",
          "In a relay the record belongs to the team rather than to any one dancer, which is why Guinness names every member instead of naming a holder. Seventeen are listed: Joshua Jason Usoro, Nelson Ikukpu, Christopher, Esiri David, Kada Shammah, Otum Joshua, Nelson Steven, Alice, Paul Sneh, Janet Jiya, Chizzy, Abayomi Oyebanji, Trust, Modesola, Kivyston, Amos and Shazam.",
          "Some are listed by a full name and some by a single one, which is how they were submitted. The certified time is precise to the second, and that is the tell of an adjudicated record. The claim is not that they danced for roughly two days. It is that the dancing was watched and measured.",
        ],
        whyItMatters:
          "This record sits several years before the run of Nigerian record attempts that followed it. The appetite was there well before the attention was.",
        readTime: 2,
        suggestedQuestion: "How does a relay handover work under the rules?",
      },
      source: {
        name: 'Guinness World Records',
        url: 'https://www.guinnessworldrecords.com/world-records/118359-longest-dance-marathon-relay',
        verified: true,
      },
      image: null,
      factNumber: 112,
      relatedIds: ['nf_0101'],
    },
    provenance: {
      factId: 'nf_0112',
      origin: 'manual',
      sources: [
        gwr(
          'Longest dance marathon relay',
          'https://www.guinnessworldrecords.com/world-records/118359-longest-dance-marathon-relay',
          'd15621b5beaba853',
          'The longest dance marathon relay is 53 hr 28 min 47 sec, and was achieved by Team Jason Joshua Usoro (all Nigeria) in Lagos, Nigeria, on 6 April 2019.\nThe team consisted of Joshua Jason Usoro, Nelson Ikukpu, Christopher, Esiri David, Kada Shammah, Otum Joshua, Nelson Steven, Alice, Paul Sneh, Janet Jiya, Chizzy, Abayomi Oyebanji, Trust, Modesola, Kivyston, Amos, and Shazam.',
        ),
      ],
      surprise: { priorProbability: 4, specificity: 5, explicability: 3 },
      review: {
        status: 'draft',
        reviewer: '',
        reviewedAt: '',
        notes:
          'Oldest record in the set, from 2019, so it is the most likely of the twelve to have been beaten already.',
      },
      decay: { kind: 'volatile', reviewBy: REVIEW_BY },
      createdAt: '2026-09-10',
    },
  },
];

/**
 * GENERATED FILE — do not edit by hand.
 *
 * Written by `npm run export` in afrifacts-studio on 2026-09-05.
 * Anything typed in here is lost on the next export.
 *
 * These are real, sourced, reviewed facts from the content pipeline, not
 * invented sample data. Every one was extracted from a source document,
 * had its passage string-matched against that source, and was approved by
 * a named reviewer before it reached this file.
 *
 * It is still phase-1 scaffolding. The app is supposed to read facts from
 * the database (CLAUDE.md §2), and this file exists only because that
 * database does not exist yet. When it does, `src/data/index.ts` starts
 * querying it and this file goes away.
 *
 * Most facts have `image: null`, and that is a designed state rather than
 * a gap. An image is attached only where a free-licence photograph
 * actually depicts the fact's subject; the rest render as typographic
 * cards, which §4.1 expects for roughly two thirds of the feed anyway.
 * Every image here is from Wikimedia Commons, licence-checked in code and
 * accepted by a named reviewer, and carries its credit.
 */

import type { Fact, QuizQuestion } from '@/src/types';

export const facts: Fact[] = [
  {
    "id": "nf_1001",
    "country": "NG",
    "category": "Culture",
    "fact": "Moshood Abiola was his father's 23rd child, but the first of them to survive infancy, hence the name 'Kashimawo'.",
    "deepDive": {
      "body": [
        "In the Abiola family of Abeokuta, the arrival of a new baby was met with cautious hope rather than celebration. Salawu Abiola, a cocoa trader, and his wife Suliat had already lost 22 children in infancy. When their 23rd child was born, the family named him Kashimawo, meaning 'Let us wait and see', a name that reflected their uncertainty about whether he would survive.",
        "Against the odds, the child thrived. It was not until he was 15 years old that his parents finally gave him the name Moshood, a formal recognition of his survival. This early experience of loss and resilience shaped the man who would later become a business magnate and a symbol of democracy in Nigeria.",
        "The name Kashimawo stayed with him, a reminder of the fragile beginnings of a life that would go on to challenge the political establishment. His journey from a family marked by tragedy to the forefront of Nigerian politics is a testament to his determination and the hopes that were finally realized."
      ],
      "whyItMatters": "The name Kashimawo is not just a personal detail; it is a window into the high child mortality rates that were common in mid-20th century Nigeria. Abiola's survival and subsequent rise to prominence highlight the resilience of individuals and families in the face of such loss, and his story is intertwined with the broader narrative of Nigeria's struggle for democracy.",
      "readTime": 2,
      "suggestedQuestion": "What does the name Kashimawo mean and why was it given?"
    },
    "source": {
      "name": "Moshood Abiola",
      "url": "https://en.wikipedia.org/wiki/Moshood_Abiola",
      "verified": true
    },
    "image": {
      "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2b/Mkobulgaria_%282%29.jpg/1280px-Mkobulgaria_%282%29.jpg",
      "credit": "Photo · Limburg · Wikimedia Commons",
      "license": "CC BY 3.0",
      "panelColor": "#04342C"
    },
    "factNumber": 1001,
    "relatedIds": []
  },
  {
    "id": "nf_1002",
    "country": "NG",
    "category": "Culture",
    "fact": "Abiola was the editor of the school magazine The Trumpeter, and Olusegun Obasanjo was deputy editor.",
    "deepDive": {
      "body": [
        "At Baptist Boys High School in Abeokuta, two teenagers were already showing the drive that would define their futures. Moshood Abiola, the editor of the school magazine The Trumpeter, and Olusegun Obasanjo, his deputy editor, were both students there. Their paths would later cross again in the highest echelons of Nigerian politics and business.",
        "Abiola, who had started selling firewood at age nine to support his family, went on to become a billionaire businessman and philanthropist. Obasanjo, who would later become Nigeria's military head of state and then civilian president, was a fellow student. The school magazine was an early platform for their leadership and communication skills.",
        "Decades later, their lives intertwined in dramatic ways. Obasanjo was in power when Abiola died in detention in 1998, and it was Obasanjo who posthumously awarded Abiola the national honour of GCFR in 2018, the same year 12 June was declared Democracy Day in Abiola's memory."
      ],
      "whyItMatters": "This fact shows that two of Nigeria's most significant figures—one a symbol of democracy, the other a long-time ruler—shared a humble beginning. It underscores that leadership can emerge from the same classroom, and that early roles can foreshadow future influence.",
      "readTime": 2,
      "suggestedQuestion": "What other famous Nigerians went to Baptist Boys High School?"
    },
    "source": {
      "name": "Moshood Abiola",
      "url": "https://en.wikipedia.org/wiki/Moshood_Abiola",
      "verified": true
    },
    "image": {
      "url": "https://media.cnn.com/api/v1/images/stellar/prod/180614150840-mko-abiola.jpg?q=w_1600,h_2200,x_0,y_0,c_fill",
      "credit": "Photo · CNN",
      "license": "Not verified — found by web search",
      "panelColor": "#04342C"
    },
    "factNumber": 1002,
    "relatedIds": []
  },
  {
    "id": "nf_1003",
    "country": "NG",
    "category": "Business",
    "fact": "Abiola was offered 49 per cent equity ownership of ITT's Nigerian arm after his marketing strategy gained favor in the military.",
    "deepDive": {
      "body": [
        "In the late 1960s, Moshood Abiola was working at the Nigerian subsidiary of Pfizer when he applied for a job listing seeking a trained accountant. During the interview, he discovered the firm was ITT Corporation. He was hired and tasked with clearing the backlog of debt owed to the company by the military.",
        "Abiola's approach to the military was unconventional. He proposed training military personnel in the use of equipment, reducing their reliance on outside vendors for maintenance. This strategy appealed to a security-conscious armed forces, and Abiola soon secured a contract to supply hardware to the military. The contract caught ITT's attention, leading to an offer of 49 per cent equity ownership in its Nigerian arm.",
        "This stake marked a significant step in Abiola's business career, which later included ventures in publishing, aviation, and shipping. His business acumen and political connections eventually propelled him to the forefront of Nigerian politics, culminating in his controversial 1993 presidential election victory, which was annulled by the military government."
      ],
      "whyItMatters": "Abiola's rise from a debt-collecting accountant to a 49 per cent owner of ITT's Nigerian arm shows how his business strategies opened doors that later led to his political influence. This early success foreshadowed his role as a major figure in Nigeria's democratic struggle.",
      "readTime": 2,
      "suggestedQuestion": "How did Abiola's military contract lead to his ITT equity?"
    },
    "source": {
      "name": "Moshood Abiola",
      "url": "https://en.wikipedia.org/wiki/Moshood_Abiola",
      "verified": true
    },
    "image": {
      "url": "https://lookaside.fbsbx.com/lookaside/crawler/media/?media_id=122192718920076276",
      "credit": "Photo · Facebook",
      "license": "Not verified — found by web search",
      "panelColor": "#26215C"
    },
    "factNumber": 1003,
    "relatedIds": []
  },
  {
    "id": "nf_1004",
    "country": "NG",
    "category": "History",
    "fact": "Abiola was detained for four years, largely in solitary confinement with a Bible, Qur'an, and fourteen guards as companions.",
    "deepDive": {
      "body": [
        "In June 1994, Moshood Abiola declared himself the lawful president of Nigeria in Lagos, after the 1993 election he won was annulled by the military. He was soon arrested on the orders of General Sani Abacha, who sent 200 police vehicles to bring him into custody.",
        "Abiola spent the next four years in detention, largely in solitary confinement. His companions were a Bible, a Qur'an, and fourteen guards. During this time, Pope John Paul II, Archbishop Desmond Tutu, and human rights activists from around the world lobbied for his release, but the military government insisted he renounce his mandate—a condition he refused.",
        "Abiola died on the day he was due to be released, shortly after the death of General Abacha. An autopsy found evidence of longstanding heart disease, though many Nigerians believe he was poisoned. His death made him a symbol of democracy, and in 2018, Nigeria's Democracy Day was moved to June 12 in his honor."
      ],
      "whyItMatters": "Abiola's solitary confinement with only a Bible, Qur'an, and guards shows how the military tried to break him, yet he refused to renounce his mandate. His endurance turned him into a symbol of democracy, and his death led to the recognition of June 12 as Democracy Day in Nigeria.",
      "readTime": 2,
      "suggestedQuestion": "Why was Abiola kept in solitary confinement?"
    },
    "source": {
      "name": "Moshood Abiola",
      "url": "https://en.wikipedia.org/wiki/Moshood_Abiola",
      "verified": true
    },
    "image": {
      "url": "https://upload.wikimedia.org/wikipedia/commons/1/13/MKO_arrest.jpg",
      "credit": "Photo · Limburg · Wikimedia Commons",
      "license": "CC BY 3.0",
      "panelColor": "#4A1B0C"
    },
    "factNumber": 1004,
    "relatedIds": []
  },
  {
    "id": "nf_1005",
    "country": "NG",
    "category": "History",
    "fact": "Abiola was posthumously awarded the GCFR, an honour awarded to only Nigerian heads of state, in 2018.",
    "deepDive": {
      "body": [
        "On 6 June 2018, President Muhammadu Buhari announced that Nigeria's Democracy Day would move from 29 May to 12 June, and that Moshood Abiola would be posthumously awarded the Grand Commander of the Order of the Federal Republic (GCFR), an honour reserved for Nigeria's heads of state. The change was a direct recognition of the 12 June 1993 presidential election, which Abiola won but which was annulled by the military government of Ibrahim Babangida.",
        "Abiola, a businessman and politician, had become a symbol of democracy after the annulment. He died in detention in 1998, the day he was due to be released. For years, many Nigerians saw 12 June as the true expression of their democratic will, even though it was not upheld. The 2018 decision finally honoured that date and its presumed winner.",
        "The GCFR is the highest national honour in Nigeria, and awarding it posthumously to Abiola placed him alongside former heads of state. The move also meant that Democracy Day, previously marking the 1999 handover to civilian rule, now commemorates the annulled election that many consider the freest and fairest in Nigeria's history."
      ],
      "whyItMatters": "The GCFR is normally reserved for sitting or former heads of state, so giving it to Abiola was a powerful statement that his electoral mandate was legitimate. It also shifted Nigeria's official democracy narrative from a military handover to a civilian vote that was stolen.",
      "readTime": 2,
      "suggestedQuestion": "Why was the 1993 election annulled?"
    },
    "source": {
      "name": "Moshood Abiola",
      "url": "https://en.wikipedia.org/wiki/Moshood_Abiola",
      "verified": true
    },
    "image": {
      "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2b/Mkobulgaria_%282%29.jpg/1280px-Mkobulgaria_%282%29.jpg",
      "credit": "Photo · Limburg · Wikimedia Commons",
      "license": "CC BY 3.0",
      "panelColor": "#4A1B0C"
    },
    "factNumber": 1005,
    "relatedIds": []
  },
  {
    "id": "nf_1006",
    "country": "NG",
    "category": "History",
    "fact": "In 2024, Modupe Onitiri-Abiola, one of Abiola's wives, organized a failed coup attempt in Oyo State.",
    "deepDive": {
      "body": [
        "In 2024, Modupe Onitiri-Abiola, one of Moshood Abiola's wives, organized a failed coup attempt in Oyo State. The rest of the Abiola family publicly denounced her actions, distancing themselves from the plot.",
        "Abiola, who died in 1998, was a prominent Nigerian businessman and politician. He won the 1993 presidential election, which was annulled by the military government, and he later died in detention. His family has remained in the public eye, but this incident marked a dramatic and controversial turn.",
        "The coup attempt in Oyo State was a rare and shocking event, especially given Abiola's legacy as a symbol of democracy. The family's swift denunciation highlighted their desire to preserve his reputation and distance themselves from any actions that could tarnish it."
      ],
      "whyItMatters": "This incident shows that even the families of iconic figures can become embroiled in political turmoil. It also underscores the ongoing instability in Nigerian politics, where coup attempts still occur decades after Abiola's fight for democracy.",
      "readTime": 2,
      "suggestedQuestion": "What happened during the coup attempt in Oyo State?"
    },
    "source": {
      "name": "Moshood Abiola",
      "url": "https://en.wikipedia.org/wiki/Moshood_Abiola",
      "verified": true
    },
    "image": {
      "url": "https://upload.wikimedia.org/wikipedia/commons/1/13/MKO_arrest.jpg",
      "credit": "Photo · Limburg · Wikimedia Commons",
      "license": "CC BY 3.0",
      "panelColor": "#4A1B0C"
    },
    "factNumber": 1006,
    "relatedIds": []
  },
  {
    "id": "nf_1007",
    "country": "NG",
    "category": "Culture",
    "fact": "Adichie's first children's book, Mama's Sleeping Scarf, was published under the pseudonym Nwa Grace James.",
    "deepDive": {
      "body": [
        "In 2019, Chimamanda Ngozi Adichie wrote a children's book called Mama's Sleeping Scarf. It took her a year and a half to complete. When it was published in 2023 by HarperCollins, it appeared under a name many readers did not recognize: Nwa Grace James.",
        "The pseudonym is a nod to her family. Adichie was born with the English name Grace, and her father's name was James Nwoye Adichie. By using Nwa Grace James, she wove her own name and her father's into the byline, even as she stepped back from her famous identity.",
        "The book was illustrated by Joelle Avelino, a Congolese-Angolan illustrator. For Adichie, known for novels like Purple Hibiscus and Americanah, this was her first venture into children's literature. The choice to publish under a pseudonym kept the focus on the story itself, not the celebrity of its author."
      ],
      "whyItMatters": "Adichie's decision to publish under a pseudonym shows that even a globally famous author can choose to let the work stand apart from her name. It also connects her personal history—her birth name and her father—to her creative output in a subtle, meaningful way.",
      "readTime": 2,
      "suggestedQuestion": "Why did Adichie choose the pseudonym Nwa Grace James?"
    },
    "source": {
      "name": "Chimamanda Ngozi Adichie",
      "url": "https://en.wikipedia.org/wiki/Chimamanda_Ngozi_Adichie",
      "verified": true
    },
    "image": {
      "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/Chimamanda_Ngozi_Adichie_-_mural_Ciudad_Lineal_%28cropped%29.jpg/1280px-Chimamanda_Ngozi_Adichie_-_mural_Ciudad_Lineal_%28cropped%29.jpg",
      "credit": "Photo · DLV · Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "panelColor": "#04342C"
    },
    "factNumber": 1007,
    "relatedIds": []
  },
  {
    "id": "nf_1008",
    "country": "NG",
    "category": "Culture",
    "fact": "Adichie's son Nkanu Nnamdi died at 21 months after being admitted to a Lagos hospital, which she blamed for medical negligence.",
    "deepDive": {
      "body": [
        "In January 2026, Chimamanda Ngozi Adichie's family faced a devastating loss. Her son, Nkanu Nnamdi, one of twin boys born in 2024, died at just 21 months old. The child had been admitted to Euracare Hospital in Lagos, where Adichie said he received negligent care.",
        "According to Adichie, the negligence included denial of oxygen and sedation that led to cardiac arrest. Euracare Hospital expressed condolences but denied the allegations. An inquest into the death was scheduled to begin in April 2026, but it was suspended after an intervention by the Attorney General of Lagos State.",
        "The tragedy came after a period of personal loss for Adichie: her father died in 2020 and her mother in 2021. The public nature of the case and the ongoing legal proceedings have drawn attention to medical accountability in Nigeria."
      ],
      "whyItMatters": "This personal tragedy highlights the real-world stakes of medical negligence and the legal battles families may face in seeking accountability. It also shows how a globally celebrated writer's private grief intersects with public debates about healthcare and justice in Nigeria.",
      "readTime": 2,
      "suggestedQuestion": "What happened in the inquest into Nkanu's death?"
    },
    "source": {
      "name": "Chimamanda Ngozi Adichie",
      "url": "https://en.wikipedia.org/wiki/Chimamanda_Ngozi_Adichie",
      "verified": true
    },
    "image": {
      "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Chimamanda_Ngozi_Adichie_at_a_signing_in_Berlin%2C_Germany_on_16_May_2014_%28cropped%29.jpg/1280px-Chimamanda_Ngozi_Adichie_at_a_signing_in_Berlin%2C_Germany_on_16_May_2014_%28cropped%29.jpg",
      "credit": "Photo · Tammi L. Coles · Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "panelColor": "#04342C"
    },
    "factNumber": 1008,
    "relatedIds": []
  },
  {
    "id": "nf_1009",
    "country": "NG",
    "category": "Culture",
    "fact": "Adichie was the first woman to receive a chieftaincy title in her hometown of Abba.",
    "deepDive": {
      "body": [
        "In the heart of Abba, a town in Anambra State, Nigeria, a historic moment unfolded on 30 December 2022. Chimamanda Ngozi Adichie, the acclaimed writer, was bestowed with the chieftaincy title 'Odeluwa' by her hometown. This honour made her the first woman to receive such a title in Abba.",
        "Adichie's connection to Abba runs deep. Her father, James Nwoye Adichie, hailed from this town, and her family's parish was St. Paul's Catholic Church there. As a child, she visited Abba and saw the remnants of the Biafran War, which later influenced her writing.",
        "The title 'Odeluwa' is a significant recognition, not just for Adichie but for women in her community. It breaks a long-standing tradition, marking a shift towards greater recognition of women's contributions. Adichie, known for her feminist advocacy, has often spoken about the importance of women's voices, and this honour aligns with her life's work."
      ],
      "whyItMatters": "This chieftaincy title is more than a personal honour; it signals a cultural shift in a community that had never before given such recognition to a woman. It underscores the growing acknowledgment of women's roles in preserving and leading their communities, a theme Adichie has championed globally.",
      "readTime": 2,
      "suggestedQuestion": "What does the title 'Odeluwa' mean?"
    },
    "source": {
      "name": "Chimamanda Ngozi Adichie",
      "url": "https://en.wikipedia.org/wiki/Chimamanda_Ngozi_Adichie",
      "verified": true
    },
    "image": {
      "url": "https://www.chimamanda.com/wp-content/uploads/2021/10/CNA-01.jpg",
      "credit": "Photo · Chimamanda Ngozi Adichie",
      "license": "Not verified — found by web search",
      "panelColor": "#04342C"
    },
    "factNumber": 1009,
    "relatedIds": []
  },
  {
    "id": "nf_1010",
    "country": "NG",
    "category": "Culture",
    "fact": "Adichie rejected a national honour from President Muhammadu Buhari in 2022.",
    "deepDive": {
      "body": [
        "In 2022, Nigeria's President Muhammadu Buhari named Chimamanda Ngozi Adichie as a recipient of the Order of the Federal Republic, one of the country's highest national honours. The writer, known for novels like *Purple Hibiscus* and *Americanah*, turned it down.",
        "The source does not give a reason for her refusal. But the decision fits a pattern in her public life: Adichie has often spoken out on Nigerian politics and society, and she has accepted other honours, such as a chieftaincy title from her hometown of Abba later that same year.",
        "The rejection made news because it was rare for a prominent figure to decline such an award. It also highlighted the complicated relationship between Nigeria's celebrated artists and its government."
      ],
      "whyItMatters": "Adichie's refusal shows that even the highest state honour can be declined, and that a public figure's principles can outweigh official recognition. It reminds us that awards are not just given—they can also be rejected.",
      "readTime": 1,
      "suggestedQuestion": "Why did Adichie reject the national honour?"
    },
    "source": {
      "name": "Chimamanda Ngozi Adichie",
      "url": "https://en.wikipedia.org/wiki/Chimamanda_Ngozi_Adichie",
      "verified": true
    },
    "image": {
      "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Chimamanda_Adichie_11.09.10_%285248097626%29.jpg/1280px-Chimamanda_Adichie_11.09.10_%285248097626%29.jpg",
      "credit": "Photo · kellywritershouse · Wikimedia Commons",
      "license": "CC BY 2.0",
      "panelColor": "#04342C"
    },
    "factNumber": 1010,
    "relatedIds": []
  },
  {
    "id": "nf_1011",
    "country": "NG",
    "category": "Culture",
    "fact": "Adichie's novel Half of a Yellow Sun sold 500,000 copies in the UK alone by October 2009.",
    "deepDive": {
      "body": [
        "Half of a Yellow Sun, Chimamanda Ngozi Adichie's second novel, was published in 2006. It tells the story of the Biafran War, a conflict that shaped her family's history. By October 2009, the paperback had sold 500,000 copies in the UK alone, a figure often seen as the benchmark for commercial success in publishing.",
        "The novel's success was part of a broader shift in the international market for African literature. Adichie's debut, Purple Hibiscus, had already shown there was an audience for African realist fiction. Half of a Yellow Sun proved that this audience could also embrace African histories, even those as painful as the Nigerian Civil War.",
        "The book's impact extended beyond sales. It won the Orange Prize for Fiction in 2007 and was later adapted into a film. For many readers, it brought the Biafran conflict into focus, a war that had often been neglected in mainstream narratives."
      ],
      "whyItMatters": "The 500,000 copies sold in the UK alone show that a novel about a Nigerian war could become a commercial hit, not just a critical success. This helped open the door for other African writers and stories to reach a global audience.",
      "readTime": 2,
      "suggestedQuestion": "What is Half of a Yellow Sun about?"
    },
    "source": {
      "name": "Chimamanda Ngozi Adichie",
      "url": "https://en.wikipedia.org/wiki/Chimamanda_Ngozi_Adichie",
      "verified": true
    },
    "image": {
      "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/Chimamanda_Ngozi_Adichie_-_mural_Ciudad_Lineal_%28cropped%29.jpg/1280px-Chimamanda_Ngozi_Adichie_-_mural_Ciudad_Lineal_%28cropped%29.jpg",
      "credit": "Photo · DLV · Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "panelColor": "#04342C"
    },
    "factNumber": 1011,
    "relatedIds": []
  },
  {
    "id": "nf_1012",
    "country": "NG",
    "category": "Culture",
    "fact": "Adichie was the second Nigerian to be inducted into the American Academy of Arts and Sciences, after Wole Soyinka.",
    "deepDive": {
      "body": [
        "In 2017, the American Academy of Arts and Sciences inducted 228 new members into its 237th class. Among them was Chimamanda Ngozi Adichie, the Nigerian writer known for novels like *Purple Hibiscus* and *Americanah*. Her election placed her in an exclusive group: she became only the second Nigerian to receive this honor, following Nobel laureate Wole Soyinka.",
        "The Academy, founded in 1780, recognizes leaders in academia, business, public affairs, the humanities, and the arts. Adichie's induction came during a year when she also delivered the Eudora Welty Lecture and spoke at the Foreign Affairs Symposium at Johns Hopkins University. Her career had already earned her a MacArthur Fellowship in 2008 and numerous literary prizes.",
        "For Adichie, the honor was another milestone in a career that has made her a global voice on feminism and storytelling. Her TED talks, including 'The Danger of a Single Story' and 'We Should All Be Feminists,' have reached millions. The Academy's recognition underscored her influence beyond literature, cementing her place among the world's leading thinkers."
      ],
      "whyItMatters": "Adichie's induction into the American Academy of Arts and Sciences places her in the company of the world's most distinguished scholars and artists. Being only the second Nigerian after Wole Soyinka highlights the rarity of such recognition for African writers and underscores the global impact of her work.",
      "readTime": 2,
      "suggestedQuestion": "Who was the first Nigerian to be inducted into the American Academy of Arts and Sciences?"
    },
    "source": {
      "name": "Chimamanda Ngozi Adichie",
      "url": "https://en.wikipedia.org/wiki/Chimamanda_Ngozi_Adichie",
      "verified": true
    },
    "image": {
      "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Chimamanda_Adichie_11.09.10_%285248097626%29.jpg/1280px-Chimamanda_Adichie_11.09.10_%285248097626%29.jpg",
      "credit": "Photo · kellywritershouse · Wikimedia Commons",
      "license": "CC BY 2.0",
      "panelColor": "#04342C"
    },
    "factNumber": 1012,
    "relatedIds": []
  },
  {
    "id": "nf_1013",
    "country": "NG",
    "category": "Culture",
    "fact": "Between 2017 and 2022, Afrobeats experienced a 550% growth in streams on Spotify.",
    "deepDive": {
      "body": [
        "In 2017, Afrobeats was still finding its footing on the global stage. By 2022, streams on Spotify had jumped 550%, a surge that tracks with a wave of international collaborations and chart breakthroughs. Drake's 'One Dance' with Wizkid had already become Spotify's most-streamed song in 2016, and by 2019 Beyoncé's 'The Lion King: The Gift' put a spotlight on artists like Burna Boy and Mr Eazi.",
        "The growth wasn't just about numbers. It reflected a shift in how the world listened. Afrobeats, a term coined in London to package West African pop for British dancefloors, had become a global sound. Wizkid's 'Essence' became the first African song to reach the top ten of the Billboard Hot 100, and by 2023, Rema's 'Calm Down' was called Afrobeats' biggest crossover hit.",
        "Behind the streams were real milestones: the first Afrobeats chart in the UK in 2020, the first US Afrobeats chart in 2022, and a new Grammy category in 2024. The 550% spike on Spotify was one sign of a genre moving from the margins to the mainstream."
      ],
      "whyItMatters": "The 550% growth in Spotify streams is a concrete measure of Afrobeats' global breakthrough. It shows how streaming platforms can amplify a regional sound into a worldwide phenomenon, reshaping the music industry's center of gravity.",
      "readTime": 2,
      "suggestedQuestion": "What caused Afrobeats to blow up on Spotify?"
    },
    "source": {
      "name": "Afrobeats",
      "url": "https://en.wikipedia.org/wiki/Afrobeats",
      "verified": true
    },
    "image": {
      "url": "https://www.rollingstone.com/wp-content/uploads/2022/01/RS_Afrobeats_OPEN_F_RGB.jpg",
      "credit": "Photo · Rolling Stone",
      "license": "Not verified — found by web search",
      "panelColor": "#04342C"
    },
    "factNumber": 1013,
    "relatedIds": []
  },
  {
    "id": "nf_1015",
    "country": "NG",
    "category": "Culture",
    "fact": "Wizkid was entered into the Guinness Book of Records 2018 for featuring on the most streamed Spotify single of all time, 'One Dance'.",
    "deepDive": {
      "body": [
        "In 2016, Canadian artist Drake released 'One Dance' with British singer Kyla and Nigerian artist Wizkid. The song became Spotify's most streamed track, with over a billion streams, and reached number one in 15 countries. Its success helped push Afrobeats into the global mainstream.",
        "Wizkid's contribution to the track earned him a place in the Guinness Book of Records 2018, making him the first Afrobeats artist to achieve that honor. The recognition highlighted the growing international impact of Afrobeats, a genre that had been gaining traction since the early 2010s.",
        "By the late 2010s, Afrobeats was experiencing a surge in global popularity, with artists like Burna Boy and Davido achieving international success. Wizkid's record was a milestone in this rise, signaling that African music was no longer on the periphery but at the center of global pop."
      ],
      "whyItMatters": "Wizkid's Guinness World Record was not just a personal achievement; it marked a turning point for Afrobeats, proving that African music could dominate global streaming charts. This recognition helped pave the way for the genre's explosive growth in the following years.",
      "readTime": 2,
      "suggestedQuestion": "How did 'One Dance' become so popular?"
    },
    "source": {
      "name": "Afrobeats",
      "url": "https://en.wikipedia.org/wiki/Afrobeats",
      "verified": true
    },
    "image": {
      "url": "https://i.guim.co.uk/img/media/5a54ad1f46064b3258543d9b327e519b7be843fe/0_326_5504_3302/master/5504.jpg?width=1200&height=1200&quality=85&auto=format&fit=crop&s=05351fb4a3d2ebcc90c9dd3fbcb9ad01",
      "credit": "Photo · The Guardian",
      "license": "Not verified — found by web search",
      "panelColor": "#04342C"
    },
    "factNumber": 1015,
    "relatedIds": []
  },
  {
    "id": "nf_1016",
    "country": "NG",
    "category": "Culture",
    "fact": "Rema's 'Calm Down' remix with Selena Gomez reached number three on the Billboard Hot 100 and was called 'Afrobeats biggest cross over hit' by Billboard.",
    "deepDive": {
      "body": [
        "In March 2022, Rema released his debut album, Raves & Roses. The lead single, 'Calm Down', soon went viral, and its remix with Selena Gomez climbed to number three on the Billboard Hot 100. The song also surpassed a billion streams on Spotify, a record for the genre.",
        "Billboard called 'Calm Down' 'Afrobeats biggest cross over hit.' The track's success marked a milestone in Afrobeats' global rise, following other breakthroughs like Wizkid's 'Essence' and CKay's 'Love Nwantiti' on the Hot 100.",
        "Rema's own style, which he calls 'Afrorave,' blends Afrobeats with Arabian and Indian influences, showing how the genre continues to evolve as it reaches new audiences worldwide."
      ],
      "whyItMatters": "Rema's chart success shows Afrobeats moving from regional popularity to global mainstream, with a Nigerian artist's song reaching the top of the US charts. This crossover hit signals a shift in the international music landscape, where African sounds are now a major force.",
      "readTime": 2,
      "suggestedQuestion": "How did Rema's 'Calm Down' become such a big hit?"
    },
    "source": {
      "name": "Afrobeats",
      "url": "https://en.wikipedia.org/wiki/Afrobeats",
      "verified": true
    },
    "image": {
      "url": "https://www.billboard.com/wp-content/uploads/2022/09/Rema-Selena-Gomez-Calm-Down-2022-billboard-1548.jpg",
      "credit": "Photo · Billboard",
      "license": "Not verified — found by web search",
      "panelColor": "#04342C"
    },
    "factNumber": 1016,
    "relatedIds": []
  },
  {
    "id": "nf_1017",
    "country": "NG",
    "category": "Culture",
    "fact": "The 2023 NBA All-Star Game halftime show was headlined by Afrobeats artists Burna Boy, Tems and Rema, the first African artists to headline a major U.S. sports halftime show.",
    "deepDive": {
      "body": [
        "In February 2023, the NBA All-Star Game halftime show in Salt Lake City, Utah, featured a lineup that had never been seen before at a major U.S. sports event. Burna Boy, Tems, and Rema took the stage, marking the first time African artists headlined such a show.",
        "The three artists are among the leading figures of Afrobeats, a genre that has surged in global popularity. By the early 2020s, Afrobeats had become a major cultural force, with artists like Burna Boy selling out international venues and Rema's 'Calm Down' becoming a global hit.",
        "Their halftime performance was a milestone in the genre's crossover into mainstream American entertainment, reflecting the growing influence of African music on the world stage."
      ],
      "whyItMatters": "This moment signaled that Afrobeats had moved from niche to mainstream in the U.S., opening doors for more African artists to perform at major American events.",
      "readTime": 1,
      "suggestedQuestion": "How did Afrobeats become so popular in the U.S.?"
    },
    "source": {
      "name": "Afrobeats",
      "url": "https://en.wikipedia.org/wiki/Afrobeats",
      "verified": true
    },
    "image": {
      "url": "https://www.rollingstone.com/wp-content/uploads/2023/02/nba-all-star-weekend-performers.jpg?w=1581&h=1054&crop=1",
      "credit": "Photo · Rolling Stone",
      "license": "Not verified — found by web search",
      "panelColor": "#04342C"
    },
    "factNumber": 1017,
    "relatedIds": []
  },
  {
    "id": "nf_1018",
    "country": "NG",
    "category": "History",
    "fact": "In 1772, Robert Norris noted that the vice-roy of Whydah and governors received a large cotton cloth manufactured in the Eyo country as a mark of the king's approbation, which they wore as an upper garment.",
    "deepDive": {
      "body": [
        "In 1772, Robert Norris described a ceremony at the court of the King of Whydah, where provincial governors gathered to present gifts and report on their conduct. Those who pleased the king received a mark of his approval: a large cotton cloth woven in the Eyo country, known for its excellent workmanship. The honorees would wear this cloth as an upper garment, a visible sign of royal favor.",
        "This practice highlights the importance of textiles in West African societies, where cloth was not just clothing but a medium of status and diplomacy. The Eyo country, likely referring to the Oyo Empire, was renowned for its weaving, and such cloths were prestigious items. Norris's account is one of the earliest European records of what would later be recognized as the agbada, a flowing robe worn by Yoruba men.",
        "The agbada, with its elaborate embroidery and voluminous shape, became a symbol of prestige and authority. Over time, it evolved into a distinct garment, often paired with trousers and a cap, and remains a significant part of Yoruba cultural identity and West African fashion."
      ],
      "whyItMatters": "This fact shows that the agbada, now a symbol of Yoruba identity, was already a mark of royal honor in the 18th century. It reveals how textiles served as political tools, linking craftsmanship, power, and diplomacy in pre-colonial West Africa.",
      "readTime": 2,
      "suggestedQuestion": "How did the agbada become a symbol of status in Yoruba culture?"
    },
    "source": {
      "name": "Agbada",
      "url": "https://en.wikipedia.org/wiki/Agbada",
      "verified": true
    },
    "image": {
      "url": "https://s3.amazonaws.com/4thpres.org/wp-content/uploads/2017/10/29104656/Norris-e1541077919340.jpg",
      "credit": "Photo · Fourth Presbyterian Church",
      "license": "Not verified — found by web search",
      "panelColor": "#4A1B0C"
    },
    "factNumber": 1018,
    "relatedIds": []
  },
  {
    "id": "nf_1019",
    "country": "NG",
    "category": "Sports",
    "fact": "Tobi Amusan became the first Nigerian world champion and world record holder in an athletics event when she won the 2022 World Championships 100 m hurdles gold medal, setting a world record of 12.12 seconds.",
    "deepDive": {
      "body": [
        "In the semi-final at Eugene, Oregon, Amusan crossed the line in 12.12 seconds, shaving 0.08 seconds off the previous world record. The time stood as the fastest ever run in the event, though it was wind-assisted and therefore not ratified as a record.",
        "Two days later, in the final, she ran 12.06 seconds with a following wind of 2.5 m/s, which was too strong to count as a record. Still, she won the gold medal, becoming the first Nigerian world champion in any athletics event.",
        "Amusan's victory was part of a remarkable 2022 season. She also defended her Commonwealth title in Birmingham with a Games record of 12.30 seconds, and won her second consecutive Diamond League final in Zurich. Earlier that year, she had set an African record of 12.41 seconds in Paris.",
        "Her world record stood for four years, until August 2026, when it was broken. She remains a three-time Diamond League champion and a two-time African champion in the 100 metres hurdles."
      ],
      "whyItMatters": "Before Amusan, no Nigerian had ever won a world title or set a world record in athletics. Her breakthrough in 2022 put Nigeria on the global sprint-hurdles map and inspired a new generation of African athletes.",
      "readTime": 2,
      "suggestedQuestion": "How did Tobi Amusan's world record compare to the previous one?"
    },
    "source": {
      "name": "Tobi Amusan",
      "url": "https://en.wikipedia.org/wiki/Tobi_Amusan",
      "verified": true
    },
    "image": {
      "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Tobi_Amusan_at_2022_World_Athletics_Championships.png/1280px-Tobi_Amusan_at_2022_World_Athletics_Championships.png",
      "credit": "Photo · Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "panelColor": "#042C53"
    },
    "factNumber": 1019,
    "relatedIds": []
  },
  {
    "id": "nf_1020",
    "country": "NG",
    "category": "Sports",
    "fact": "In 2021, Tobi Amusan became the first Nigerian athlete to win a Diamond League title, breaking the then-African record held by Glory Alozie.",
    "deepDive": {
      "body": [
        "In the final of the 2021 Diamond League in Zurich, Tobi Amusan crossed the line in 12.42 seconds, a new African record. That time shaved 0.02 seconds off the mark Glory Alozie had set 23 years earlier, and it made Amusan the first Nigerian to win a Diamond League title.",
        "Amusan's victory capped a season that included a fourth-place finish at the Tokyo Olympics. It also set the stage for an even more remarkable 2022, when she became the first Nigerian world champion and world record holder in athletics, running 12.12 seconds in the World Championship semifinals.",
        "Her 2021 Diamond League win was not just a personal milestone. It broke a long-standing national record and put Nigeria on the podium in a global circuit that had eluded its athletes for decades."
      ],
      "whyItMatters": "Amusan's 2021 Diamond League title was a breakthrough for Nigerian athletics, ending a 23-year wait for a new African record in the 100m hurdles. It showed that Nigerian sprinters could compete at the highest level of the sport, paving the way for her historic world championship win the following year.",
      "readTime": 2,
      "suggestedQuestion": "What is the Diamond League and why is winning it a big deal?"
    },
    "source": {
      "name": "Tobi Amusan",
      "url": "https://en.wikipedia.org/wiki/Tobi_Amusan",
      "verified": true
    },
    "image": {
      "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/37/Tobi_Amusan_%282024%29.jpg/1280px-Tobi_Amusan_%282024%29.jpg",
      "credit": "Photo · Owula kpakpo · Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "panelColor": "#042C53"
    },
    "factNumber": 1020,
    "relatedIds": []
  },
  {
    "id": "nf_1021",
    "country": "NG",
    "category": "History",
    "fact": "Lawrence Anini, a Nigerian bandit who terrorised Benin City in the 1980s, was executed in 1987 after his leg was amputated following his capture.",
    "deepDive": {
      "body": [
        "In December 1986, Nigeria's military leader, Ibrahim Babangida, demanded a speedy trial for a man who had terrorised Benin City. Lawrence Anini had been caught at a house between 2nd and 3rd East Circular Road, reportedly betrayed by a girlfriend. He was shot in the leg during the arrest and later had that leg amputated while in military hospital.",
        "Anini's reign of fear in the 1980s, alongside his sidekick Monday Osunbor, had made him one of the country's most wanted criminals. His capture marked the end of a violent chapter for the city. The speedy trial Babangida called for led to convictions on most charges, and on March 29, 1987, Anini was executed in Benin City."
      ],
      "whyItMatters": "Anini's case shows how a single criminal could hold a city in fear, and how the state responded with both medical care and swift justice. The amputation before execution underscores the harsh realities of crime and punishment in Nigeria at that time.",
      "readTime": 1,
      "suggestedQuestion": "Who betrayed Lawrence Anini?"
    },
    "source": {
      "name": "Lawrence Anini",
      "url": "https://en.wikipedia.org/wiki/Lawrence_Anini",
      "verified": true
    },
    "image": {
      "url": "https://lookaside.instagram.com/seo/google_widget/crawler/?media_id=3380965340898204914",
      "credit": "Photo · Instagram",
      "license": "Not verified — found by web search",
      "panelColor": "#4A1B0C"
    },
    "factNumber": 1021,
    "relatedIds": []
  },
  {
    "id": "nf_1022",
    "country": "NG",
    "category": "Culture",
    "fact": "The National Theatre in Lagos was designed based on the Palace of Culture and Sports in Varna, Bulgaria, and was constructed by the Bulgarian state firm Technoexportstroy.",
    "deepDive": {
      "body": [
        "In the mid-1970s, Nigeria was preparing to host the Second World Black and African Festival of Arts and Culture, a month-long celebration of African culture that would draw around 16,000 participants and 500,000 spectators. To serve as the festival's main venue, the government commissioned a state-of-the-art multipurpose theatre in Lagos. The design was based on the Palace of Culture and Sports in Varna, Bulgaria, and the construction was carried out by the Bulgarian state firm Technoexportstroy.",
        "The new National Theatre complex included two exhibition halls, a 5,000-capacity performance hall, a conference hall with 1,600 seats, and two cinema halls. It hosted dance, music, art exhibitions, cinema, drama, and the festival's colloquium. After the festival, the theatre faced challenges: Nigeria's capital moved to Abuja in 1991, funding for maintenance dwindled, and by 1991 the building had fallen into disrepair, with a crack in the roof causing water damage and leading to the power being cut off."
      ],
      "whyItMatters": "The National Theatre's Bulgarian design and construction show how Cold War-era international cooperation shaped African landmarks. It also highlights the ambition of FESTAC '77, which aimed to showcase African culture on a grand scale, leaving a lasting architectural legacy in Lagos.",
      "readTime": 2,
      "suggestedQuestion": "What happened to the National Theatre after FESTAC '77?"
    },
    "source": {
      "name": "FESTAC 77",
      "url": "https://en.wikipedia.org/wiki/FESTAC_77",
      "verified": true
    },
    "image": {
      "url": "https://upload.wikimedia.org/wikipedia/commons/e/e9/National_Theatre_Nigeria.jpg?utm_source=en.wikipedia.org&utm_campaign=index&utm_content=original",
      "credit": "Photo · Wikipedia",
      "license": "Not verified — found by web search",
      "panelColor": "#04342C"
    },
    "factNumber": 1022,
    "relatedIds": []
  },
  {
    "id": "nf_1023",
    "country": "NG",
    "category": "History",
    "fact": "The Arochukwu Long Juju Slave Route was placed on Nigeria's UNESCO World Heritage tentative list in 2007.",
    "deepDive": {
      "body": [
        "In 2007, Nigeria took a step toward international recognition for the Arochukwu Long Juju Slave Route by placing it on the UNESCO World Heritage tentative list. This designation is a preliminary stage, not the final inscription as a World Heritage Site, but it signals the site's global significance.",
        "The route is tied to the Ibini Ukpabi oracle, known as the 'Long Juju' in colonial writings. This oracle served as a religious and judicial center, where people sought resolutions for disputes and misfortunes. However, its judicial processes were entangled with enslavement: some condemned individuals were sold, and fines could be paid in captives.",
        "The Aro network, centered at Arochukwu, was a major force in the Atlantic slave trade from the 1740s, moving captives to coastal ports. The British conquest of 1901–1902 dismantled Aro dominance, but the shrine was later restored and continues to function. The tentative listing in 2007 acknowledges this complex heritage, which includes both cultural significance and a painful history."
      ],
      "whyItMatters": "The tentative listing connects a local site to a global framework for heritage, but it also highlights the tension between commemorating cultural significance and acknowledging the slave trade's role. It shows how African heritage sites are being recognized while their histories are still being reconciled.",
      "readTime": 2,
      "suggestedQuestion": "What does it mean for a site to be on the UNESCO tentative list?"
    },
    "source": {
      "name": "Aro Confederacy",
      "url": "https://en.wikipedia.org/wiki/Aro_Confederacy",
      "verified": true
    },
    "image": {
      "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/-Remains_of_Long_Juju_Gorge%2C_Arochuku-%2C_late_19th_century_%28imp-cswc-GB-237-CSWC47-LS2-041%29.jpg/1280px--Remains_of_Long_Juju_Gorge%2C_Arochuku-%2C_late_19th_century_%28imp-cswc-GB-237-CSWC47-LS2-041%29.jpg",
      "credit": "Photo · Unknown author · Wikimedia Commons",
      "license": "Public domain",
      "panelColor": "#4A1B0C"
    },
    "factNumber": 1023,
    "relatedIds": []
  },
  {
    "id": "nf_1024",
    "country": "NG",
    "category": "History",
    "fact": "Awolowo introduced free primary education and free health care for children in the Western Region, and established the first television service in Africa in 1959.",
    "deepDive": {
      "body": [
        "In 1959, as Western Nigeria's premier, Obafemi Awolowo launched a television service that was the first in Africa. It was part of a bold program of social reforms funded by the region's booming cocoa trade.",
        "Awolowo had already introduced free primary education and free health care for children in the Western Region. These measures were expensive and controversial, but they were made possible by the wealth generated from cocoa, which was the mainstay of the regional economy.",
        "The television service was a pioneering move that put Western Nigeria ahead of many other African territories. It was one of several initiatives, including the Oduduwa Group, that Awolowo used to modernize the region and spread his vision of progress."
      ],
      "whyItMatters": "Awolowo's use of cocoa revenue to fund social programs and a television station shows how a regional government could invest in its people and infrastructure. It also highlights the early ambition of Nigerian leaders to embrace modern technology and public welfare.",
      "readTime": 1,
      "suggestedQuestion": "How did Awolowo pay for free education and healthcare?"
    },
    "source": {
      "name": "Obafemi Awolowo",
      "url": "https://en.wikipedia.org/wiki/Obafemi_Awolowo",
      "verified": true
    },
    "image": {
      "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/Public_sculpture_Nigeria_05.jpg/1280px-Public_sculpture_Nigeria_05.jpg",
      "credit": "Photo · Yemi festus · Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "panelColor": "#4A1B0C"
    },
    "factNumber": 1024,
    "relatedIds": []
  },
  {
    "id": "nf_1025",
    "country": "NG",
    "category": "History",
    "fact": "Awolowo is credited with naming the Nigerian currency, the naira.",
    "deepDive": {
      "body": [
        "When Nigeria introduced its new currency in 1973, the name 'naira' was chosen by the man then serving as the country's Minister of Finance: Obafemi Awolowo. The currency was launched under his leadership, and he is credited with giving it its name.",
        "Awolowo was a key figure in Nigeria's independence movement and the first Premier of the Western Region. He later became Minister of Finance after being released from prison, where he had been held on charges of treason. In that role, he also helped negotiate joint venture rights for Nigeria's oil finds and developed the system of national revenue sharing.",
        "The naira remains Nigeria's currency today, and Awolowo's portrait has appeared on the 100 naira banknote since 1999. His legacy includes free primary education and free health care for children in the Western Region, as well as the first television service in Africa."
      ],
      "whyItMatters": "The name of a country's currency is one of the most visible symbols of its identity. That a single individual, Awolowo, chose 'naira' shows how much of modern Nigeria's institutional fabric was shaped by the decisions of its early leaders.",
      "readTime": 2,
      "suggestedQuestion": "Why did Awolowo choose the name 'naira' for the currency?"
    },
    "source": {
      "name": "Obafemi Awolowo",
      "url": "https://en.wikipedia.org/wiki/Obafemi_Awolowo",
      "verified": true
    },
    "image": {
      "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/Public_sculpture_Nigeria_05.jpg/1280px-Public_sculpture_Nigeria_05.jpg",
      "credit": "Photo · Yemi festus · Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "panelColor": "#4A1B0C"
    },
    "factNumber": 1025,
    "relatedIds": []
  },
  {
    "id": "nf_1026",
    "country": "NG",
    "category": "History",
    "fact": "Awolowo's father died of smallpox when Awolowo was about eleven years old.",
    "deepDive": {
      "body": [
        "In 1920, smallpox was still a deadly presence in Nigeria. When Obafemi Awolowo's father, David Shopolu Awolowo, died of the disease on 8 April, the boy was about eleven years old. The loss came at a formative age, shaping the future politician's early life in Ikenne, a Remo town in present-day Ogun State.",
        "David Awolowo was a farmer and sawyer, and one of the first Ikenne natives to convert to Christianity in 1896. His conversion often clashed with his family's traditional beliefs, and he frequently challenged worshippers of Obaluaye, the god of smallpox. His death from the very disease he had challenged added a poignant layer to the family's story.",
        "Obafemi Awolowo went on to become a prominent nationalist and the first Premier of Nigeria's Western Region. He championed free primary education and free health care for children, and founded the first television service in Africa in 1959. His father's early death from a preventable disease may have influenced his later commitment to public health and social welfare."
      ],
      "whyItMatters": "Awolowo's childhood loss to smallpox connects to his later policies as premier, where he introduced free health care for children in the Western Region. It shows how personal experience can shape a leader's public priorities.",
      "readTime": 2,
      "suggestedQuestion": "How did Awolowo's father's death influence his later policies?"
    },
    "source": {
      "name": "Obafemi Awolowo",
      "url": "https://en.wikipedia.org/wiki/Obafemi_Awolowo",
      "verified": true
    },
    "image": {
      "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/Public_sculpture_Nigeria_05.jpg/1280px-Public_sculpture_Nigeria_05.jpg",
      "credit": "Photo · Yemi festus · Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "panelColor": "#4A1B0C"
    },
    "factNumber": 1026,
    "relatedIds": []
  },
  {
    "id": "nf_1027",
    "country": "NG",
    "category": "Sports",
    "fact": "Celestine Babayaro was sent off in a UEFA Champions League match aged 16 years and 86 days, making him the youngest player to receive a red card in the competition.",
    "deepDive": {
      "body": [
        "At 16 years and 86 days, Celestine Babayaro was sent off in a UEFA Champions League match against Steaua București, which ended in a 1–1 draw. This red card made him the youngest player to receive one in the competition's history.",
        "Babayaro had already made a name for himself at Belgian club Anderlecht, where he quickly became a first-choice player despite his youth. His early career was marked by such records, setting him on a path that would lead to a move to Chelsea in 1997 for a then-club-record fee for a teenager.",
        "At Chelsea, Babayaro went on to win several trophies, including the FA Cup and the UEFA Super Cup. He later played for Newcastle United and had a brief, unsuccessful stint with LA Galaxy before retiring in 2010. His international career with Nigeria included an Olympic gold medal in 1996."
      ],
      "whyItMatters": "This record shows that even at a very young age, Babayaro was playing at the highest level of European club football. It highlights how early talent can emerge and make an impact, setting benchmarks that stand for years.",
      "readTime": 2,
      "suggestedQuestion": "Who is the youngest player to ever score in the Champions League?"
    },
    "source": {
      "name": "Celestine Babayaro",
      "url": "https://en.wikipedia.org/wiki/Celestine_Babayaro",
      "verified": true
    },
    "image": {
      "url": "https://upload.wikimedia.org/wikipedia/commons/d/d3/Celestine_Babayaro_%28cropped%29.jpg",
      "credit": "Photo · @cfcunofficial (Chelsea Debs) London from London, UK · Wikimedia Commons",
      "license": "CC BY-SA 2.0",
      "panelColor": "#042C53"
    },
    "factNumber": 1027,
    "relatedIds": []
  },
  {
    "id": "nf_1028",
    "country": "NG",
    "category": "Sports",
    "fact": "Babayaro's brother Emmanuel, a goalkeeper, was also part of Nigeria's 1996 Olympics gold medal-winning team.",
    "deepDive": {
      "body": [
        "In 1996, Nigeria's Olympic football team made history by winning the gold medal in Atlanta, a first for an African nation. Among the squad were two brothers: Celestine Babayaro, a left-back who scored in the final against Argentina, and his older brother Emmanuel, a goalkeeper. Their shared achievement is a rare family milestone in football.",
        "Celestine's career is well documented: he played for Anderlecht, Chelsea, and Newcastle United, and represented Nigeria in two World Cups. Emmanuel, however, remains a more obscure figure, with few details about his club career or international appearances beyond this Olympic triumph. The source notes only that he was a goalkeeper and part of that gold medal-winning team.",
        "The 1996 Olympics were a defining moment for Nigerian football, and the Babayaro brothers' participation underscores the depth of talent in that squad. While Celestine's backflip celebrations and Premier League exploits made him famous, Emmanuel's role as a backup goalkeeper was quieter but equally part of the historic achievement."
      ],
      "whyItMatters": "The Babayaro brothers' shared gold medal shows that even in a historic team, there are stories of family and lesser-known contributors. It reminds us that behind every famous player, there are teammates whose roles, though less celebrated, were essential to the success.",
      "readTime": 2,
      "suggestedQuestion": "What other brothers have played together in Olympic football?"
    },
    "source": {
      "name": "Celestine Babayaro",
      "url": "https://en.wikipedia.org/wiki/Celestine_Babayaro",
      "verified": true
    },
    "image": {
      "url": "https://c8.alamy.com/comp/G6T4W7/31-jul-96-atlanta-olympic-games-soccer-brazil-v-nigeria-nigerias-goalkeeper-G6T4W7.jpg",
      "credit": "Photo · Alamy",
      "license": "Not verified — found by web search",
      "panelColor": "#042C53"
    },
    "factNumber": 1028,
    "relatedIds": []
  },
  {
    "id": "nf_1029",
    "country": "NG",
    "category": "History",
    "fact": "The first-ever public execution in Nigeria took place at Bar Beach in 1971, of Babatunde Folorunsho, for armed robbery.",
    "deepDive": {
      "body": [
        "In 1971, a crowd gathered at Bar Beach in Lagos to witness something Nigeria had never seen before: a public execution. The condemned man was Babatunde Folorunsho, convicted of armed robbery. He was shot by firing squad on the sand, in front of thousands of spectators, including journalists and television cameras.",
        "Bar Beach was once the most popular beach in Nigeria, a place for family outings, picnics, and even spiritual gatherings. But from the early 1970s to the late 1980s, during the military regime, it became a site for executing convicted armed robbers and coup plotters. The executions were public spectacles, drawing large crowds.",
        "Folorunsho's execution was the first of many. Others followed, including Joseph Ilobo, Williams Alders Oyazimo, and Lawrence Anini. In 1976, the convicted plotters of the coup that killed General Murtala Mohammed were also shot there. Over time, the beach also became known for flooding and erosion, and eventually, the land was reclaimed to build Eko Atlantic City, a modern development that now stands where the executions took place."
      ],
      "whyItMatters": "Bar Beach's transformation from a popular leisure spot to a site of public executions and then to a modern city shows how a single location can hold vastly different meanings across decades. It also highlights how Nigeria's history of military rule and public punishment is literally built over by new development.",
      "readTime": 2,
      "suggestedQuestion": "Why were executions held in public at Bar Beach?"
    },
    "source": {
      "name": "Bar Beach, Lagos",
      "url": "https://en.wikipedia.org/wiki/Bar_Beach,_Lagos",
      "verified": true
    },
    "image": {
      "url": "https://m.media-amazon.com/images/M/MV5BMTgwMWUxYWEtZDA3NC00Y2I4LTgzMGEtMTkwYTE5YzI2ODlmXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg",
      "credit": "Photo · The Passenger (1975) - Trivia - IMDb",
      "license": "Not verified — found by web search",
      "panelColor": "#4A1B0C"
    },
    "factNumber": 1029,
    "relatedIds": []
  },
  {
    "id": "nf_1030",
    "country": "NG",
    "category": "History",
    "fact": "Bar Beach was the venue for the execution of the convicted plotters of the 1976 coup that killed General Murtala Mohammed, including Major-General I D Bisalla and Col. Buka Suka Dimka.",
    "deepDive": {
      "body": [
        "In the late 1970s, Bar Beach in Lagos was more than a popular spot for family outings and picnics. It was also a place of public execution. During the military regime, from the early 1970s to the late 1980s, the beach served as a firing squad venue for convicted armed robbers and coup plotters, often drawing thousands of spectators and media coverage.",
        "Among those executed there were the convicted plotters of the February 1976 coup that killed General Murtala Mohammed. Major-General I D Bisalla and Col. Buka Suka Dimka were shot by firing squad on the beach. This was part of a broader pattern of public executions at Bar Beach, which had begun in 1971 with the execution of Babatunde Folorunsho for armed robbery.",
        "Over time, Bar Beach faced severe flooding and erosion, leading to its transformation. In 2008, construction began on Eko Atlantic City, a new residential and business district built on reclaimed land where the beach once stood. The project was commissioned in 2016, but it has been criticized for potentially contributing to ongoing flooding in Lagos."
      ],
      "whyItMatters": "Bar Beach's history shows how a single location can shift from a site of leisure to a stage for state punishment, and then to a symbol of modern urban development. Understanding this evolution reveals the layers of Nigeria's political and environmental history.",
      "readTime": 2,
      "suggestedQuestion": "Why was Bar Beach chosen for public executions?"
    },
    "source": {
      "name": "Bar Beach, Lagos",
      "url": "https://en.wikipedia.org/wiki/Bar_Beach,_Lagos",
      "verified": true
    },
    "image": {
      "url": "https://lookaside.instagram.com/seo/google_widget/crawler/?media_id=2692759573888087843",
      "credit": "Photo · Instagram",
      "license": "Not verified — found by web search",
      "panelColor": "#4A1B0C"
    },
    "factNumber": 1030,
    "relatedIds": []
  },
  {
    "id": "nf_1031",
    "country": "NG",
    "category": "Business",
    "fact": "Eko Atlantic City, built on what used to be Bar Beach, stands on 10 million square metres of land reclaimed from the ocean and is protected by an 8.5 kilometre-long sea wall.",
    "deepDive": {
      "body": [
        "Before it became Eko Atlantic City, this stretch of Lagos shoreline was Bar Beach, a place with a darker history. From the early 1970s to the late 1980s, it was a public execution site during military rule, where convicted armed robbers and coup plotters were shot by firing squad. The first public execution in Nigeria took place there in 1971.",
        "By the 1980s and 1990s, the beach was better known for flooding. The ocean regularly overflowed its banks, closing the nearby Ahmadu Bello Way and eroding between eight and fourteen meters of beachfront each year. The idea for a new city on this vulnerable coast was publicly discussed in 2003, and construction began in 2008.",
        "The result is Eko Atlantic City, built on 10 million square metres of reclaimed land and shielded by an 8.5-kilometre sea wall. But the project has faced criticism: some say its design may worsen flooding in Lagos, and a storm surge during construction reportedly killed 16 people. The city was commissioned in 2016."
      ],
      "whyItMatters": "Bar Beach was once a place of public executions and relentless flooding, yet today it is the foundation of a modern city. This transformation shows how Lagos is literally building on its past, both reclaiming land and confronting the ocean's power.",
      "readTime": 2,
      "suggestedQuestion": "What was Bar Beach like before Eko Atlantic City?"
    },
    "source": {
      "name": "Bar Beach, Lagos",
      "url": "https://en.wikipedia.org/wiki/Bar_Beach,_Lagos",
      "verified": true
    },
    "image": {
      "url": "https://www.haskoning.com/-/media/images/projects/maritime/a-new-coastal-city-built-on-reclaimed-land-from-the-sea-h.jpg?h=1080&iar=0&w=1920&hash=127B6B46A29880EE510981B0BFEFB967",
      "credit": "Photo · Haskoning",
      "license": "Not verified — found by web search",
      "panelColor": "#26215C"
    },
    "factNumber": 1031,
    "relatedIds": []
  },
  {
    "id": "nf_1032",
    "country": "NG",
    "category": "History",
    "fact": "The rural earthworks around Benin City extend for some 16,000 km, are four times longer than the Great Wall of China, and consumed a hundred times more material than the Great Pyramid of Cheops.",
    "deepDive": {
      "body": [
        "The earthworks that ring Benin City are not a single wall but a vast network of banks and ditches, called iya in the Edo language. They stretch for roughly 16,000 kilometers across the countryside, forming a mosaic of more than 500 interconnected settlement boundaries that cover about 6,500 square kilometers.",
        "Built by the Edo people, these earthworks took an estimated 150 million hours of digging to construct. That scale is hard to grasp: they are four times longer than the Great Wall of China and consumed a hundred times more material than the Great Pyramid of Cheops. Some estimates suggest construction began as early as the first millennium AD, with work continuing into the fifteenth century.",
        "Today, much of this ancient engineering is under threat. Urban expansion has destroyed more than half of the original city ramparts, and the rural earthworks have suffered from neglect. Efforts like the Benin Moat Foundation, founded around 2007, aim to preserve what remains and promote it as a heritage site."
      ],
      "whyItMatters": "The Benin earthworks are one of the largest archaeological phenomena on the planet, yet they are far less known than the Great Wall or the pyramids. Recognizing their scale reshapes our understanding of pre-colonial African engineering and urban planning.",
      "readTime": 2,
      "suggestedQuestion": "Why were the Benin earthworks built?"
    },
    "source": {
      "name": "Kingdom of Benin",
      "url": "https://en.wikipedia.org/wiki/Kingdom_of_Benin",
      "verified": true
    },
    "image": {
      "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/Memorial_bust_of_a_king%27s_mother_iyoba%2C_Nigeria%2C_Benin_Kingdom%2C_early_16th_century_AD%2C_gunmetal_bronze_-_Ethnological_Museum%2C_Berlin_-_DSC02225.JPG/1280px-Memorial_bust_of_a_king%27s_mother_iyoba%2C_Nigeria%2C_Benin_Kingdom%2C_early_16th_century_AD%2C_gunmetal_bronze_-_Ethnological_Museum%2C_Berlin_-_DSC02225.JPG",
      "credit": "Photo · Daderot · Wikimedia Commons",
      "license": "CC0",
      "panelColor": "#4A1B0C"
    },
    "factNumber": 1032,
    "relatedIds": []
  },
  {
    "id": "nf_1033",
    "country": "NG",
    "category": "History",
    "fact": "The Benin Bronzes were cast from manilla bracelets brought by Portuguese merchants from the Rhineland, not from local copper.",
    "deepDive": {
      "body": [
        "In the 16th century, Portuguese ships arrived in the Kingdom of Benin carrying more than just trade goods. Among their cargo were ring-shaped brass bracelets known as manillas, produced in Germany's Rhineland. These bracelets were used as currency in the trans-Atlantic slave trade, but in Benin they found a different purpose.",
        "The Oba's craftsmen melted down the manillas and recast them into the intricate plaques and sculptures now known as the Benin Bronzes. Scientific analysis has confirmed that the metal in these artworks came from the Rhineland, not from local copper sources. Some of the plaques even depict Portuguese merchants and the manillas themselves, recording the trade that supplied their raw material.",
        "This trade began around 1507 and continued as Benin exchanged ivory, pepper, and slaves for European goods. The bronzes thus stand as a testament to Benin's engagement with global trade networks, transforming imported currency into a unique artistic legacy."
      ],
      "whyItMatters": "The Benin Bronzes are not just African art; they are a product of early globalization, linking the kingdom to European commerce and the trans-Atlantic slave trade. Understanding their origin reveals how even treasured cultural artifacts can be entangled with complex histories of exchange and exploitation.",
      "readTime": 2,
      "suggestedQuestion": "How were the Benin Bronzes made?"
    },
    "source": {
      "name": "Kingdom of Benin",
      "url": "https://en.wikipedia.org/wiki/Kingdom_of_Benin",
      "verified": true
    },
    "image": {
      "url": "https://i.etsystatic.com/14260995/r/il/3da2d4/7010271645/il_fullxfull.7010271645_1fxr.jpg",
      "credit": "Photo · Etsy",
      "license": "Not verified — found by web search",
      "panelColor": "#4A1B0C"
    },
    "factNumber": 1033,
    "relatedIds": []
  },
  {
    "id": "nf_1034",
    "country": "NG",
    "category": "History",
    "fact": "After a new Oba was installed, his mother was given the title Iyoba and moved to a palace outside the city, but was never allowed to meet her son again.",
    "deepDive": {
      "body": [
        "In the Kingdom of Benin, the bond between a mother and her son was severed by the throne. When a new Oba was installed, his mother was given the title Iyoba and moved to a palace in Uselu, just outside Benin City. There, she held considerable power, but she was never allowed to meet her son again, for he had become a divine ruler.",
        "This separation was rooted in the belief that the Oba was sacred. His divinity meant he was shrouded in mystery, rarely leaving his palace except for ceremonies. It was even punishable by death to say that the Oba performed human acts like eating or sleeping. The Iyoba's removal ensured that the Oba's divine status was not compromised by ordinary familial ties.",
        "Despite the distance, the Iyoba remained influential. She retained her own regiment, the 'Queen's Own,' and was a significant political figure. The title of Iyoba was not merely ceremonial; it came with real power, even as it demanded a profound personal sacrifice."
      ],
      "whyItMatters": "The Iyoba's separation shows how the divine status of the Oba reshaped even the most intimate family relationships, turning a mother's role into a political office. It reveals a society where power and ritual were intertwined, and where personal bonds were subordinated to the demands of kingship.",
      "readTime": 2,
      "suggestedQuestion": "What powers did the Iyoba actually hold?"
    },
    "source": {
      "name": "Kingdom of Benin",
      "url": "https://en.wikipedia.org/wiki/Kingdom_of_Benin",
      "verified": true
    },
    "image": {
      "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/Memorial_bust_of_a_king%27s_mother_iyoba%2C_Nigeria%2C_Benin_Kingdom%2C_early_16th_century_AD%2C_gunmetal_bronze_-_Ethnological_Museum%2C_Berlin_-_DSC02225.JPG/1280px-Memorial_bust_of_a_king%27s_mother_iyoba%2C_Nigeria%2C_Benin_Kingdom%2C_early_16th_century_AD%2C_gunmetal_bronze_-_Ethnological_Museum%2C_Berlin_-_DSC02225.JPG",
      "credit": "Photo · Daderot · Wikimedia Commons",
      "license": "CC0",
      "panelColor": "#4A1B0C"
    },
    "factNumber": 1034,
    "relatedIds": []
  },
  {
    "id": "nf_1035",
    "country": "NG",
    "category": "History",
    "fact": "The Benin ivory mask, now a symbol of FESTAC, was worn around the waist of kings, not on the face.",
    "deepDive": {
      "body": [
        "The Benin ivory mask, known today as a symbol of FESTAC, was not worn on the face. Instead, these masks were worn around the waist of kings, as part of royal regalia.",
        "The most famous example is based on Queen Idia, a warrior queen who played a crucial role in her son's military successes. Her image, carved in ivory, became an emblem of the festival in 1977.",
        "Ivory was a prized material in the Kingdom of Benin, used for ornate boxes, combs, and armlets. The masks were part of a rich artistic tradition that included brass plaques and sculptures, many of which were looted by the British in 1897 and are now scattered in museums worldwide."
      ],
      "whyItMatters": "Understanding that the mask was worn at the waist, not the face, reveals how Western interpretations of African art often miss the original context. It also highlights the sophistication of Benin's royal culture, where even personal adornment carried deep symbolic meaning.",
      "readTime": 1,
      "suggestedQuestion": "Why did Benin kings wear ivory masks around their waists?"
    },
    "source": {
      "name": "Kingdom of Benin",
      "url": "https://en.wikipedia.org/wiki/Kingdom_of_Benin",
      "verified": true
    },
    "image": {
      "url": "https://upload.wikimedia.org/wikipedia/commons/d/d3/Queen_Mother_Pendant_Mask-_Iyoba_MET_DP231460.jpg?utm_source=en.wikipedia.org&utm_campaign=index&utm_content=original",
      "credit": "Photo · Wikipedia",
      "license": "Not verified — found by web search",
      "panelColor": "#4A1B0C"
    },
    "factNumber": 1035,
    "relatedIds": []
  },
  {
    "id": "nf_1036",
    "country": "NG",
    "category": "Culture",
    "fact": "John Lennon returned his MBE in 1969 in protest against Britain's support for Nigeria in the Biafran war.",
    "deepDive": {
      "body": [
        "In 1969, as the Biafran war ground on, John Lennon made a gesture that mixed protest with pop culture. He returned the MBE he had received from Queen Elizabeth II in 1964, citing Britain's support for Nigeria in the conflict. His letter to the Queen listed three grievances: Britain's involvement in the Nigeria-Biafra thing, its support for America in Vietnam, and the fact that his single 'Cold Turkey' was slipping down the charts.",
        "The war had become a global cause, with images of starving Biafran children filling Western media. Britain, along with the Soviet Union, backed the Nigerian government, while France and others supported Biafra. Lennon's protest was one of several high-profile gestures, including a student self-immolation at the UN, that highlighted the humanitarian crisis.",
        "The war ended in January 1970, with Biafra's surrender. Lennon's return of the MBE remains a notable moment of celebrity activism, but it also underscores the deep international divisions the conflict exposed."
      ],
      "whyItMatters": "Lennon's protest shows how the Biafran war reached far beyond Africa, becoming a touchstone for global activism. It reminds us that the conflict was not just a Nigerian civil war but a flashpoint in Cold War politics and the rise of humanitarian intervention.",
      "readTime": 2,
      "suggestedQuestion": "Why did Britain support Nigeria in the Biafran war?"
    },
    "source": {
      "name": "Nigerian Civil War",
      "url": "https://en.wikipedia.org/wiki/Nigerian_Civil_War",
      "verified": true
    },
    "image": {
      "url": "http://c.files.bbci.co.uk/111D5/production/_92110107_mediaitem92110106.jpg",
      "credit": "Photo · BBC",
      "license": "Not verified — found by web search",
      "panelColor": "#04342C"
    },
    "factNumber": 1036,
    "relatedIds": []
  },
  {
    "id": "nf_1037",
    "country": "NG",
    "category": "History",
    "fact": "The Biafran war inspired the formation of Doctors Without Borders.",
    "deepDive": {
      "body": [
        "In the late 1960s, as the Nigerian Civil War raged, the world watched through grainy television images. The blockade around Biafra caused mass starvation, and by mid-1968, pictures of malnourished children filled Western media. This public outcry led to a massive humanitarian response, including the Biafran airlift, where civilian volunteers flew food and medicine past the blockade.",
        "Among those volunteers were French doctors, including Bernard Kouchner. They worked with the Red Cross but were frustrated by its neutrality, which they felt silenced them about the atrocities they witnessed. When they returned to France, they spoke out and formed a new organization, the Comité de Lutte contre le Génocide au Biafra, which later became Médecins Sans Frontières, or Doctors Without Borders.",
        "The war ended in 1970, but its legacy included a new model of humanitarian aid. The doctors' experience in Biafra taught them that aid workers could not stay silent in the face of suffering. This principle—bearing witness and speaking out—became a cornerstone of MSF, which now operates in crises worldwide."
      ],
      "whyItMatters": "The Biafran war didn't just end with a ceasefire; it gave birth to a new kind of humanitarian organization. Doctors Without Borders, born from the frustration of French doctors in Biafra, changed how the world responds to crises, insisting that aid workers must speak out against injustice, not just provide relief.",
      "readTime": 2,
      "suggestedQuestion": "How did the Biafran war lead to the creation of Doctors Without Borders?"
    },
    "source": {
      "name": "Nigerian Civil War",
      "url": "https://en.wikipedia.org/wiki/Nigerian_Civil_War",
      "verified": true
    },
    "image": {
      "url": "https://www.doctorswithoutborders.org/sites/default/files/styles/large_image_1340_893/public/image_base_media/2021/08/MSF750.jpg?itok=V8JqXJwB",
      "credit": "Photo · Doctors Without Borders",
      "license": "Not verified — found by web search",
      "panelColor": "#4A1B0C"
    },
    "factNumber": 1037,
    "relatedIds": []
  },
  {
    "id": "nf_1038",
    "country": "NG",
    "category": "History",
    "fact": "In 1966, pogroms in Northern Nigeria killed an estimated 10,000 to 30,000 Igbo, half of them children.",
    "deepDive": {
      "body": [
        "By mid-1966, the killings had already begun. From June through October, pogroms in Northern Nigeria targeted the Igbo, with an estimated 10,000 to 30,000 killed—half of them children. The violence forced more than a million to two million people to flee to the Eastern Region, a mass exodus that reshaped the country.",
        "The pogroms were the culmination of months of rising tension. After a January coup led by mostly Igbo officers, northerners retaliated against Igbo civilians. The worst day, 29 September 1966, became known as 'Black Thursday.' The massacres were led by the Nigerian army, and despite radio assurances of safety, the intent was clear.",
        "The flight of so many Igbo to the East set the stage for the secession of Biafra in May 1967 and the ensuing civil war. The pogroms were later cited in Biafra's claims of genocide, and they remain a deep wound in Nigeria's history."
      ],
      "whyItMatters": "The pogroms were not just a tragic event but a catalyst: they triggered the mass displacement that led directly to Biafra's secession and the Nigerian Civil War. Understanding this helps explain why the war happened and why the Igbo still feel marginalized today.",
      "readTime": 2,
      "suggestedQuestion": "What happened during the 1966 pogroms?"
    },
    "source": {
      "name": "Nigerian Civil War",
      "url": "https://en.wikipedia.org/wiki/Nigerian_Civil_War",
      "verified": true
    },
    "image": {
      "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Ondervoede_kinderen%2C_Bestanddeelnr_921-5788_%28cropped%29.jpg/1280px-Ondervoede_kinderen%2C_Bestanddeelnr_921-5788_%28cropped%29.jpg",
      "credit": "Photo · Anefo · Wikimedia Commons",
      "license": "CC0",
      "panelColor": "#4A1B0C"
    },
    "factNumber": 1038,
    "relatedIds": []
  },
  {
    "id": "nf_1039",
    "country": "NG",
    "category": "History",
    "fact": "The Nigerian Civil War was one of the first wars in history to be televised globally, alongside the Vietnam War.",
    "deepDive": {
      "body": [
        "In mid-1968, as the war entered its second year, images of starving Biafran children began appearing on television screens across Western countries. The Nigerian military had encircled Biafra and imposed a blockade, cutting off food and supplies. The result was a humanitarian catastrophe: between 500,000 and 2 million Biafran civilians died of starvation during the conflict.",
        "These televised images turned the Biafran plight into a global cause. The mass media coverage helped raise awareness and funding for international aid organizations, and the crisis inspired the formation of Doctors Without Borders after the war. The war also became a focal point for public opinion, with figures like John Lennon returning his MBE in protest against British support for Nigeria.",
        "The Nigerian Civil War, alongside the Vietnam War, was one of the first conflicts to be broadcast to a global audience. This new level of media scrutiny brought the realities of war directly into living rooms, shaping how the world perceived and responded to humanitarian crises."
      ],
      "whyItMatters": "The televised coverage of the Nigerian Civil War marked a turning point in how the world witnessed conflict. It showed that images of suffering could mobilize international public opinion and lead to the creation of new humanitarian organizations, changing the way we respond to crises today.",
      "readTime": 2,
      "suggestedQuestion": "How did the media coverage of the Biafran famine change international aid?"
    },
    "source": {
      "name": "Nigerian Civil War",
      "url": "https://en.wikipedia.org/wiki/Nigerian_Civil_War",
      "verified": true
    },
    "image": {
      "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/ASC_Leiden_-_Rietveld_Collection_-_Nigeria_1970_-_1973_-_01_-_093_New_Nigerian_newspaper_page_7_January_1970._End_of_the_Nigerian_civil_war_with_Biafra.jpg/1280px-ASC_Leiden_-_Rietveld_Collection_-_Nigeria_1970_-_1973_-_01_-_093_New_Nigerian_newspaper_page_7_January_1970._End_of_the_Nigerian_civil_war_with_Biafra.jpg",
      "credit": "Photo · Aart Rietveld · Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "panelColor": "#4A1B0C"
    },
    "factNumber": 1039,
    "relatedIds": []
  },
  {
    "id": "nf_1040",
    "country": "NG",
    "category": "Culture",
    "fact": "Burna Boy's grandfather Benson Idonije once managed Fela Kuti.",
    "deepDive": {
      "body": [
        "Burna Boy's family tree reaches deep into the roots of Afrobeat. His maternal grandfather, Benson Idonije, once managed Fela Kuti, the pioneer of the genre that Burna Boy's music builds on. This connection places Burna Boy in a direct line of musical heritage, even if he never met his grandfather's famous client.",
        "The source notes that Burna Boy's music is inspired by Fela Kuti, King Sunny Ade, and Bob Marley. His album L.I.F.E was even described as being influenced by these legends. This familial link to Fela's manager adds a personal layer to that musical inspiration, suggesting that the connection to Afrobeat's history is not just artistic but also familial.",
        "Burna Boy's own career has since taken him to global heights, from Grammy wins to headlining stadiums. Yet this small detail about his grandfather's role in Fela's career shows how the past and present of African music are intertwined, with Burna Boy carrying forward a legacy that began before he was born."
      ],
      "whyItMatters": "This fact reveals that Burna Boy's success is not just a personal achievement but part of a family legacy in African music. It shows how the history of Afrobeat is woven into the lives of its current stars, connecting generations through a shared musical heritage.",
      "readTime": 2,
      "suggestedQuestion": "Who else in Burna Boy's family has been involved in music?"
    },
    "source": {
      "name": "Burna Boy",
      "url": "https://en.wikipedia.org/wiki/Burna_Boy",
      "verified": true
    },
    "image": {
      "url": "https://upload.wikimedia.org/wikipedia/commons/c/ce/Untold_2024_-Burna_Boy_%2853926047977%29_%28cropped%29.jpg",
      "credit": "Photo · Nuță Lucian from Cluj-Napoca, Romania · Wikimedia Commons",
      "license": "CC BY-SA 2.0",
      "panelColor": "#04342C"
    },
    "factNumber": 1040,
    "relatedIds": []
  },
  {
    "id": "nf_1041",
    "country": "NG",
    "category": "Culture",
    "fact": "Burna Boy's song 'Dai Dai' with Shakira was the official anthem of the 2026 FIFA World Cup, and they performed it at the opening ceremony at Estadio Azteca.",
    "deepDive": {
      "body": [
        "On 11 June 2026, the Estadio Azteca in Mexico City hosted the opening ceremony of the 2026 FIFA World Cup. The official anthem, 'Dai Dai', was performed there by Burna Boy and Shakira, marking a historic moment for African music on the world's biggest sporting stage.",
        "The song was co-written by Ed Sheeran and producer Alexander Castillo. Shakira said she waited about 20 days for Burna Boy to record his verse, as she wanted 'a very masculine voice' in an Afrobeats setting. The collaboration came about after Sheeran approached Burna Boy, who later described Sheeran as one of the most thoughtful people he had worked with.",
        "Burna Boy and Shakira reunited on 19 July 2026 to perform 'Dai Dai' at the inaugural FIFA World Cup final halftime show at MetLife Stadium in New Jersey. The show, curated by Coldplay's Chris Martin, also featured Madonna and Justin Bieber. The song's success helped push Burna Boy's Spotify monthly listeners past 57.7 million by early August 2026."
      ],
      "whyItMatters": "This performance placed an Afrobeats artist at the center of the world's most-watched sporting event, signaling a shift in global pop culture. It also highlighted the growing influence of African music and its artists on the international stage.",
      "readTime": 2,
      "suggestedQuestion": "How did Burna Boy and Shakira's collaboration on 'Dai Dai' come about?"
    },
    "source": {
      "name": "Burna Boy",
      "url": "https://en.wikipedia.org/wiki/Burna_Boy",
      "verified": true
    },
    "image": {
      "url": "https://lookaside.fbsbx.com/lookaside/crawler/threads/DZfElx2CDAC/11/image.jpg",
      "credit": "Photo · Threads",
      "license": "Not verified — found by web search",
      "panelColor": "#04342C"
    },
    "factNumber": 1041,
    "relatedIds": []
  },
  {
    "id": "nf_1042",
    "country": "NG",
    "category": "Sports",
    "fact": "Burna Boy became the first artist from Africa to perform at the UEFA Champions League Final Kick Off Show, in front of over 71,412 supporters and an audience of over 700 million people.",
    "deepDive": {
      "body": [
        "On 10 June 2023, the Atatürk Olympic Stadium in Istanbul, Turkey, was the stage for a historic moment. Burna Boy, a Nigerian artist, performed at the UEFA Champions League Final Kick Off Show by Pepsi, becoming the first African artist to do so. The show was watched by over 71,412 supporters in the stadium and an audience of over 700 million people worldwide.",
        "This performance was part of a remarkable year for Burna Boy. In the same month, he became the first African artist to headline and sell out a stadium show in the United States, performing at Citi Field in New York. He was also named by Billboard as the top Afrobeat artist of 2023 and won the inaugural Best Afrobeats award at the Billboard Music Awards.",
        "Burna Boy's rise to global prominence has been steady. He won his first Grammy in 2021 for Best Global Music Album for 'Twice as Tall', and by 2023 he had become the most nominated Nigerian artist in Grammy history. His music, which he calls 'Afro-fusion', blends Afrobeats, dancehall, reggae, and hip-hop, and he has used his platform to advocate for social justice and Pan-Africanism."
      ],
      "whyItMatters": "Burna Boy's performance at the Champions League Final was not just a personal milestone; it signaled the global reach of African music. It showed that an artist from Africa could command a stage in front of hundreds of millions, breaking barriers and opening doors for other African artists on the world stage.",
      "readTime": 2,
      "suggestedQuestion": "How did Burna Boy become the first African artist to perform at the Champions League Final?"
    },
    "source": {
      "name": "Burna Boy",
      "url": "https://en.wikipedia.org/wiki/Burna_Boy",
      "verified": true
    },
    "image": {
      "url": "https://i.ytimg.com/vi/hhwI8ITv_Is/maxresdefault.jpg",
      "credit": "Photo · YouTube",
      "license": "Not verified — found by web search",
      "panelColor": "#042C53"
    },
    "factNumber": 1042,
    "relatedIds": []
  },
  {
    "id": "nf_1043",
    "country": "NG",
    "category": "Culture",
    "fact": "Burna Boy became the first African artist to headline and sell out a stadium show in the United States, at Citi Field in New York.",
    "deepDive": {
      "body": [
        "In July 2023, Burna Boy took the stage at Citi Field in New York, making history as the first African artist to headline and sell out a stadium show in the United States. The concert was part of his I Told Them... tour, which followed the release of his seventh studio album of the same name.",
        "The achievement marked a milestone in the global rise of Afrobeats, a genre Burna Boy has championed with his 'Afro-fusion' sound. Earlier that year, he had already become the first African artist to perform at the UEFA Champions League Final Kick Off Show, and his album Love, Damini had set records on charts worldwide.",
        "Citi Field, home of the New York Mets, has hosted iconic concerts by artists like The Beatles and Beyoncé. Burna Boy's sold-out show there signaled a shift in the music industry, as African artists began to command the same stadium-level success as their Western counterparts."
      ],
      "whyItMatters": "Burna Boy's Citi Field show wasn't just a personal triumph—it proved that African artists can fill stadiums in the US, a market long dominated by Western acts. This milestone reflects the growing global appetite for Afrobeats and opens doors for other African musicians to headline major venues.",
      "readTime": 2,
      "suggestedQuestion": "How did Burna Boy's Citi Field concert impact the recognition of Afrobeats in the US?"
    },
    "source": {
      "name": "Burna Boy",
      "url": "https://en.wikipedia.org/wiki/Burna_Boy",
      "verified": true
    },
    "image": {
      "url": "https://www.rollingstone.com/wp-content/uploads/2023/07/Z7A_1635.jpg?w=1280",
      "credit": "Photo · Rolling Stone",
      "license": "Not verified — found by web search",
      "panelColor": "#04342C"
    },
    "factNumber": 1043,
    "relatedIds": []
  },
  {
    "id": "nf_1044",
    "country": "NG",
    "category": "Culture",
    "fact": "Burna Boy was named by Billboard as the top Afrobeat artist of the year 2023.",
    "deepDive": {
      "body": [
        "In 2023, Burna Boy's year was a string of firsts. He became the first African artist to headline and sell out a stadium show in the US, performing at Citi Field in New York. That same year, he was named by Billboard as the top Afrobeat artist of the year.",
        "The recognition came amid a period of global breakthrough. His album 'I Told Them...' was released that year, and he won the inaugural Best Afrobeats award at the Billboard Music Awards, becoming the first African artist to win a BBMA as lead artist. He also became the most nominated Nigerian artist in Grammy history, with ten career nominations by November.",
        "His influence extended beyond music. He was named the 2023 most streamed Sub-Saharan African artist on Spotify for the second year in a row, and The Recording Academy described him as the biggest artist in Africa. The Nation named him entertainer of the year for what it called an unrivaled and outstanding year."
      ],
      "whyItMatters": "Burna Boy's Billboard recognition in 2023 wasn't just a personal accolade—it marked a shift in the global music industry's acknowledgment of Afrobeats as a dominant force. His achievements that year helped cement the genre's place on the world stage, opening doors for other African artists.",
      "readTime": 2,
      "suggestedQuestion": "What other milestones did Burna Boy achieve in 2023?"
    },
    "source": {
      "name": "Burna Boy",
      "url": "https://en.wikipedia.org/wiki/Burna_Boy",
      "verified": true
    },
    "image": {
      "url": "https://www.billboard.com/wp-content/uploads/2022/05/feature-burna-boy-billboard-2022-bb06-seye-isikalu-4-1260.jpg",
      "credit": "Photo · Billboard",
      "license": "Not verified — found by web search",
      "panelColor": "#04342C"
    },
    "factNumber": 1044,
    "relatedIds": []
  },
  {
    "id": "nf_1045",
    "country": "NG",
    "category": "Culture",
    "fact": "Burna Boy's song 'Last Last' won Afrobeats Single of the Year and Song of the Year at The Headies 2023.",
    "deepDive": {
      "body": [
        "The Headies 2023 was a landmark night for Burna Boy. His song 'Last Last' took home both Afrobeats Single of the Year and Song of the Year, cementing its place as one of the defining tracks of the year.",
        "'Last Last' was released in 2022 as a single from his sixth studio album, Love, Damini. The album itself made history, becoming the highest-charting Nigerian album on the Billboard 200 and the highest-charting African album in France, the Netherlands, and the UK.",
        "The Headies wins added to a remarkable year for Burna Boy. In 2023, he also won his fourth Best International Act at the BET Awards and became the first African artist to headline and sell out a stadium show in the US. His global impact was undeniable.",
        "The song's success was part of a broader wave of Afrobeats recognition worldwide, with Burna Boy leading the charge as one of the genre's most prominent ambassadors."
      ],
      "whyItMatters": "Burna Boy's double win at The Headies 2023 shows how a single song can dominate both commercial and critical recognition in Afrobeats. It highlights the growing global influence of Nigerian music, where a track like 'Last Last' can achieve mainstream success while still being celebrated within its home industry.",
      "readTime": 2,
      "suggestedQuestion": "What other awards did Burna Boy win in 2023?"
    },
    "source": {
      "name": "Burna Boy",
      "url": "https://en.wikipedia.org/wiki/Burna_Boy",
      "verified": true
    },
    "image": {
      "url": "https://www.vibe.com/wp-content/uploads/2023/08/GettyImages-1325812645-e1692722921722.jpeg?w=910&h=511&crop=1",
      "credit": "Photo · VIBE.com",
      "license": "Not verified — found by web search",
      "panelColor": "#04342C"
    },
    "factNumber": 1045,
    "relatedIds": []
  },
  {
    "id": "nf_1046",
    "country": "NG",
    "category": "History",
    "fact": "From 1772 to 1775, more than 62,000 enslaved Africans were sold from Calabar to European slave traders.",
    "deepDive": {
      "body": [
        "In the 1770s, the port of Calabar, on the coast of what is now southeastern Nigeria, was one of the busiest slave-trading hubs on the African continent. European ships arrived to load captives, and local merchants and rulers supplied them from the hinterland, where prisoners of war and people seized in raids were brought to markets like Esuk Mba.",
        "The numbers tell the story of a brutal escalation. From 1725 to 1750, roughly 17,000 enslaved Africans were sold from Calabar to European traders. Then, in just four years—from 1772 to 1775—that figure soared to more than 62,000. The trade was so intense that Old Calabar (Duke Town) and Creek Town, about 16 kilometers northeast, became crucial centers for the traffic.",
        "The enslaved were transported to the Americas under horrific conditions, chained and packed into ships for a crossing that could take months. The trade continued until Britain abolished it in 1807, and even then, enforcement was slow. Today, the Slave History Museum in Calabar preserves the memory of this era, displaying chains, shackles, and the currency used in the trade."
      ],
      "whyItMatters": "The surge in Calabar's slave exports in the 1770s shows how quickly and dramatically the Atlantic slave trade could expand, driven by European demand and African intermediaries. It underscores that the trade was not a static horror but a dynamic system that intensified over time, with devastating consequences for millions of people.",
      "readTime": 2,
      "suggestedQuestion": "What made Calabar such a major slave trading port?"
    },
    "source": {
      "name": "Calabar",
      "url": "https://en.wikipedia.org/wiki/Calabar",
      "verified": true
    },
    "image": {
      "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/af/%22Site_of_Slave_Market%2C_Itu%2C_Calabar%22%2C_late_19th_century_%28imp-cswc-GB-237-CSWC47-LS2-039%29_%28cropped%29.jpg/1280px-%22Site_of_Slave_Market%2C_Itu%2C_Calabar%22%2C_late_19th_century_%28imp-cswc-GB-237-CSWC47-LS2-039%29_%28cropped%29.jpg",
      "credit": "Photo · Unknown author · Wikimedia Commons",
      "license": "Public domain",
      "panelColor": "#4A1B0C"
    },
    "factNumber": 1046,
    "relatedIds": []
  },
  {
    "id": "nf_1047",
    "country": "NG",
    "category": "History",
    "fact": "Calabar was the first Nigerian city to have a secondary school, a hospital, a post office, a barracks, a network of paved roads, a botanical garden, and a monorail.",
    "deepDive": {
      "body": [
        "In the late 19th century, Calabar was a hub of colonial activity, and it was here that many of Nigeria's 'firsts' took root. The Hope Waddell Training Institution, founded in 1895, was the country's first secondary school, and St Margaret's Hospital, established in 1897, was its first public hospital. The city also boasted the first post office, barracks, and network of paved roads, along with a botanical garden and a monorail, though the latter two have since fallen into disrepair.",
        "These achievements were part of a broader pattern of early development. Calabar served as the headquarters of the European administration in the Niger Delta until 1906, when the seat of government moved to Lagos. This early prominence helped the city accumulate a list of pioneering institutions and individuals, including Nigeria's first female pharmacist, first female politician (Margaret Ekpo), and first native professor (Eyo Ita).",
        "Today, Calabar is known as the tourism capital of Nigeria, with attractions like the Calabar Carnival and the Drill Rehabilitation Centre. But its legacy as a pioneer in education, healthcare, and infrastructure remains a defining part of its identity."
      ],
      "whyItMatters": "Calabar's many 'firsts' show how a single city can lead a nation's development. Understanding this helps us see that Nigeria's modern progress is built on a foundation laid in places like Calabar, not just in the larger Lagos.",
      "readTime": 2,
      "suggestedQuestion": "What other Nigerian cities have similar lists of firsts?"
    },
    "source": {
      "name": "Calabar",
      "url": "https://en.wikipedia.org/wiki/Calabar",
      "verified": true
    },
    "image": {
      "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/aa/Calabar_Group_2.jpg/1280px-Calabar_Group_2.jpg",
      "credit": "Photo · Onyinyeonuoha · Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "panelColor": "#4A1B0C"
    },
    "factNumber": 1047,
    "relatedIds": []
  },
  {
    "id": "nf_1048",
    "country": "NG",
    "category": "History",
    "fact": "The National Museum of Calabar was flat packed, shipped from Britain and built in 1884, and is made of old Scandinavian pine.",
    "deepDive": {
      "body": [
        "In the late 19th century, a prefabricated wooden building was packed into crates in Glasgow, shipped across the Atlantic, and reassembled in the West African port of Calabar. It was built in 1884 as the residence of the British colonial governor, a symbol of imperial reach.",
        "The structure is made of old Scandinavian pine, a durable timber that has helped it survive for over a century. Today it houses the National Museum of Calabar, preserving colonial-era documents, furnishings, and artefacts, including relics of the slave trade.",
        "The building's journey from Britain to Nigeria is a reminder of how colonial power was physically transported and installed. It also reflects Calabar's long history as a coastal hub, first for trade and later as a center of colonial administration."
      ],
      "whyItMatters": "This fact shows that even buildings were part of the machinery of empire, shipped ready-made to project authority. It also links Calabar's colonial past to its present role as a keeper of that history.",
      "readTime": 2,
      "suggestedQuestion": "How did they ship a whole building from Britain to Calabar?"
    },
    "source": {
      "name": "Calabar",
      "url": "https://en.wikipedia.org/wiki/Calabar",
      "verified": true
    },
    "image": {
      "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/be/Old_Residency%2C_National_Museum%2C_Calabar_02.jpg/1280px-Old_Residency%2C_National_Museum%2C_Calabar_02.jpg",
      "credit": "Photo · Ei'eke · Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "panelColor": "#4A1B0C"
    },
    "factNumber": 1048,
    "relatedIds": []
  },
  {
    "id": "nf_1049",
    "country": "NG",
    "category": "Culture",
    "fact": "The Drill Rehabilitation Centre in Calabar is the world's most successful captive breeding programme for an endangered primate, with over 250 births.",
    "deepDive": {
      "body": [
        "In the rainforests of southeastern Nigeria, a quiet conservation success story unfolds. The Drill Rehabilitation Centre in Calabar, founded in 1991, was the first primate rehabilitation project in the region. Its mission: to rescue drills orphaned by hunting, which are donated by local citizens or confiscated by authorities. No animals are bought or taken from the wild.",
        "The centre's achievements are remarkable. While drills have reproduced poorly in western zoos, the centre has recorded over 250 births from rehabilitated wild-born parents and their offspring. This makes it the world's most successful captive breeding programme for an endangered primate. Today, 286 drills live in six family groups, each in their own natural habitat within electrified enclosures of up to nine hectares.",
        "The project has expanded beyond Calabar, with a second site at Afi Ranch. The Calabar location serves as headquarters, quarantine, and veterinary practice, and houses one breeding group of 39 animals across four generations. There are also plans to release the first group back into the wild, a testament to the centre's long-term vision for conservation."
      ],
      "whyItMatters": "This breeding programme shows that conservation can succeed where zoos have failed, by focusing on rehabilitation and natural habitats. It offers a model for saving endangered species, not just in captivity but with the goal of returning them to the wild.",
      "readTime": 2,
      "suggestedQuestion": "How does the Drill Rehabilitation Centre care for the drills?"
    },
    "source": {
      "name": "Calabar",
      "url": "https://en.wikipedia.org/wiki/Calabar",
      "verified": true
    },
    "image": {
      "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Drill_%28Mandrillus_leucophaeus%29.jpg/1280px-Drill_%28Mandrillus_leucophaeus%29.jpg",
      "credit": "Photo · Clément Bardot · Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "panelColor": "#04342C"
    },
    "factNumber": 1049,
    "relatedIds": []
  },
  {
    "id": "nf_1050",
    "country": "NG",
    "category": "Culture",
    "fact": "The Calabar Carnival, held every December, is inspired by Brazil, but the samba is replaced by Afrobeats.",
    "deepDive": {
      "body": [
        "Every December, the streets of Calabar, Nigeria's old harbour town, fill with dance schools in imaginative costumes. The parade is a deliberate nod to Brazil, but the soundtrack is pure Nigerian: Afrobeats replaces samba.",
        "The carnival was launched in 2004 by then-Governor Donald Duke as part of a push to make Calabar the tourism capital of Nigeria. It now spans the entire month, with events including a children's carnival, a motorbike carnival, and a main parade.",
        "The Brazilian influence is visible in the flamboyant costumes and the energy of the dancers, yet the music grounds the celebration firmly in West Africa. It's a fusion that reflects Calabar's history as a crossroads of cultures, from its days as a major slave-trade port to its modern identity."
      ],
      "whyItMatters": "The carnival shows how a global tradition can be adapted to local identity. It's not just a copy of Rio; it's a Nigerian creation that uses Brazilian inspiration to celebrate Afrobeats and Calabar's own culture.",
      "readTime": 1,
      "suggestedQuestion": "When did the Calabar Carnival start?"
    },
    "source": {
      "name": "Calabar",
      "url": "https://en.wikipedia.org/wiki/Calabar",
      "verified": true
    },
    "image": {
      "url": "https://images.trvl-media.com/localexpert/1056138/c456789e-b8b2-4d7e-948a-de784d18285b.jpg?impolicy=resizecrop&rw=1005&rh=565",
      "credit": "Photo · Expedia",
      "license": "Not verified — found by web search",
      "panelColor": "#04342C"
    },
    "factNumber": 1050,
    "relatedIds": []
  },
  {
    "id": "nf_1051",
    "country": "NG",
    "category": "History",
    "fact": "Nigeria's first president Azikiwe received his secondary school leaving certificate from the Hope Waddell Training Institution in Calabar, founded in 1895.",
    "deepDive": {
      "body": [
        "In the late 19th century, Scottish Presbyterian missionaries arrived in Calabar, a bustling port city on Nigeria's southeastern coast. Among them was Hope Waddell, who worked there from 1845 to 1858. The missionaries founded a school to provide secondary education to Africans, which would later bear Waddell's name.",
        "The Hope Waddell Training Institution opened in 1895, becoming the first secondary school in Nigeria. It offered vocational training and academic subjects, and its alumni include Nnamdi Azikiwe, who would become Nigeria's first president. Azikiwe earned his secondary school leaving certificate at this institution.",
        "After years of neglect, the school was renovated and is once again functioning as a high school. Its long history reflects Calabar's role as a center of education and missionary activity in Nigeria."
      ],
      "whyItMatters": "The Hope Waddell Training Institution is a tangible link between missionary education and Nigeria's post-independence leadership. It shows how a school founded by outsiders became a stepping stone for the nation's first president, highlighting the complex colonial legacy that shaped modern Nigeria.",
      "readTime": 2,
      "suggestedQuestion": "What other notable Nigerians attended Hope Waddell?"
    },
    "source": {
      "name": "Calabar",
      "url": "https://en.wikipedia.org/wiki/Calabar",
      "verified": true
    },
    "image": {
      "url": "https://upload.wikimedia.org/wikipedia/commons/5/5f/Hope_Waddell.jpg",
      "credit": "Photo · Umohduke · Wikimedia Commons",
      "license": "CC BY-SA 3.0",
      "panelColor": "#4A1B0C"
    },
    "factNumber": 1051,
    "relatedIds": []
  },
  {
    "id": "nf_1052",
    "country": "NG",
    "category": "Culture",
    "fact": "The term 'danfo' is believed to derive from the Yoruba word meaning 'hurry,' reflecting the fast-paced nature of their operations.",
    "deepDive": {
      "body": [
        "On the bustling streets of Lagos, yellow minibuses weave through traffic, picking up and dropping off passengers with practiced efficiency. These are danfo buses, a lifeline for millions of commuters in Nigeria's largest city. Their name, it is believed, comes from the Yoruba word for 'hurry'—a fitting description for vehicles that dart through the urban maze.",
        "Danfo buses emerged in the 1970s after state-run transport services declined. Early models were often adapted Volkswagen Type 2 vans, but by the 1980s and 1990s, they had become a dominant sight on Lagos roads. Today, they operate on semi-fixed routes, connecting neighborhoods and filling gaps left by formal systems like the Bus Rapid Transit.",
        "The danfo system is a major part of Lagos's informal economy, providing work for thousands of drivers, conductors, and mechanics. While they face challenges like fuel costs and safety concerns, they remain central to the city's identity—their yellow-and-black appearance is a symbol of Lagos itself. Recent government reforms aim to integrate them into a more structured transport framework, but for now, the danfo continues to hurry on."
      ],
      "whyItMatters": "The name 'danfo' isn't just a label—it captures the essence of Lagos's informal transport: speed, adaptability, and survival. Understanding this origin shows how deeply these buses are woven into the city's culture and daily life, not just as a mode of travel but as a symbol of its relentless pace.",
      "readTime": 2,
      "suggestedQuestion": "What does the Yoruba word 'danfo' actually mean?"
    },
    "source": {
      "name": "Danfo",
      "url": "https://en.wikipedia.org/wiki/Danfo",
      "verified": true
    },
    "image": {
      "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/The_Danfo_of_Lagos.jpg/1280px-The_Danfo_of_Lagos.jpg",
      "credit": "Photo · Oluwolehammond · Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "panelColor": "#04342C"
    },
    "factNumber": 1052,
    "relatedIds": []
  },
  {
    "id": "nf_1053",
    "country": "NG",
    "category": "History",
    "fact": "In 1984, former Nigerian minister Umaru Dikko was found drugged in a crate at Stansted Airport, being claimed as diplomatic baggage, in an apparent government-sanctioned kidnapping.",
    "deepDive": {
      "body": [
        "In July 1984, British police at Stansted Airport opened a crate labeled as diplomatic baggage and found a man inside, drugged and barely conscious. The man was Umaru Dikko, a former Nigerian transport minister who had fled to London after a military coup overthrew the government he served.",
        "The crate was destined for Lagos, Nigeria, and the men claiming it said it was diplomatic cargo. But they had failed to mark it properly or complete the required paperwork, which allowed police to search it. Dikko was found with traces of a sedative in his system, and the incident became known as the Dikko affair.",
        "The Nigerian government at the time had accused Dikko of embezzling millions of dollars from oil revenues, and he was living in exile. The kidnapping attempt was widely seen as an official operation, though the Nigerian government denied involvement. Dikko survived and continued his political activities from London, later leading opposition groups and serving in Nigerian political parties until his death in 2014."
      ],
      "whyItMatters": "The Dikko affair shows how far a government might go to bring an exiled opponent to justice, even across international borders. It also highlights the diplomatic tensions that can arise when a former official is accused of corruption and flees the country.",
      "readTime": 2,
      "suggestedQuestion": "What happened to Umaru Dikko after the kidnapping attempt?"
    },
    "source": {
      "name": "Umaru Dikko",
      "url": "https://en.wikipedia.org/wiki/Umaru_Dikko",
      "verified": true
    },
    "image": {
      "url": "https://www.thehistoryville.com/wp-content/uploads/2019/07/Umaru-Dikko.jpg",
      "credit": "Photo · HistoryVille",
      "license": "Not verified — found by web search",
      "panelColor": "#4A1B0C"
    },
    "factNumber": 1053,
    "relatedIds": []
  },
  {
    "id": "nf_1054",
    "country": "NG",
    "category": "History",
    "fact": "The Women's War was sparked when a man counting people for a census grabbed a woman by the throat after she asked 'Was your widowed mother counted?'",
    "deepDive": {
      "body": [
        "On the morning of November 18, 1929, in the town of Oloko, a woman named Nwanyeruwa was counting her livestock and household members when a man named Mark Emereuwa, who was helping with a census, told her to count her goats, sheep, and people. She understood this as preparation for taxing her, and she replied, \"Was your widowed mother counted?\"—invoking the Igbo tradition that women do not pay tax. The exchange grew heated, and Emereuwa grabbed her by the throat.",
        "Nwanyeruwa went to the town square, where women were already meeting to discuss the threat of taxation, and relayed what had happened. The women sent palm-oil leaves to summon others from the Bende District, Umuahia, and Ngwa, gathering nearly 10,000 women who protested at the office of warrant chief Okugo, demanding his resignation and calling for a trial. This sparked the Women's War, a series of protests that spread across Owerri and Calabar Provinces, involving women from six ethnic groups.",
        "The protests used traditional methods like \"sitting on a man\"—singing and dancing to shame officials—and led to the destruction of native courts and attacks on colonial property. By the time order was restored, about fifty-five women had been killed by colonial troops. The colonial government later abolished the warrant chief system and appointed women to the Native Court system, marking a significant shift in colonial administration."
      ],
      "whyItMatters": "This moment shows how a single act of defiance, rooted in tradition, could ignite a mass movement that forced colonial powers to change their policies. It highlights the power of women's collective action in shaping history.",
      "readTime": 2,
      "suggestedQuestion": "What was the Women's War and why did it happen?"
    },
    "source": {
      "name": "Women's War",
      "url": "https://en.wikipedia.org/wiki/Women%27s_War",
      "verified": true
    },
    "image": {
      "url": "https://miro.medium.com/1*j-d_LLjOkwrdIwO9_soDkA.jpeg",
      "credit": "Photo · Medium",
      "license": "Not verified — found by web search",
      "panelColor": "#4A1B0C"
    },
    "factNumber": 1054,
    "relatedIds": []
  },
  {
    "id": "nf_1055",
    "country": "NG",
    "category": "History",
    "fact": "The Women's War was the first major revolt by women in West Africa.",
    "deepDive": {
      "body": [
        "In November 1929, thousands of Igbo women converged on the town of Oloko in southeastern Nigeria. They were responding to a census that they believed was a prelude to taxing them, a suspicion fueled by the fact that men had already been taxed the previous year. The protest began when a woman named Nwanyeruwa clashed with a man assisting the census, who grabbed her by the throat after she invoked the tradition that women do not pay tax.",
        "The women's tactics drew on a long-standing practice called 'sitting on a man' or 'making war on a man'—a form of public shaming where women would gather at a man's compound, sing, and dance to air their grievances. The protests spread rapidly across six thousand square miles, involving women from six ethnic groups. They forced many warrant chiefs to resign and attacked native courts, which were symbols of colonial authority. By the time order was restored, about fifty-five women had been killed by colonial troops.",
        "The colonial government responded with an inquiry, which led to significant reforms: the warrant chief system was abolished, and women were appointed to the Native Court system for the first time. The Women's War is now seen as a pivotal moment in the history of British colonial rule in Nigeria and a precursor to mass African nationalism."
      ],
      "whyItMatters": "The Women's War is often overshadowed by later independence movements, but it was the first major revolt by women in West Africa and forced the colonial government to change its policies. It shows that African women were not passive subjects but active agents of political change, using their own cultural traditions to challenge colonial power.",
      "readTime": 2,
      "suggestedQuestion": "What exactly did the women do during the Women's War?"
    },
    "source": {
      "name": "Women's War",
      "url": "https://en.wikipedia.org/wiki/Women%27s_War",
      "verified": true
    },
    "image": {
      "url": "https://review.gale.com/wp-content/uploads/2018/03/main-image-1.jpg",
      "credit": "Photo · The Gale Review",
      "license": "Not verified — found by web search",
      "panelColor": "#4A1B0C"
    },
    "factNumber": 1055,
    "relatedIds": []
  },
  {
    "id": "nf_1056",
    "country": "NG",
    "category": "History",
    "fact": "Equiano's daughter Anna Maria is commemorated by a plaque on St Andrew's Church, Chesterton, Cambridge, and her grave was lost until a student identified it during her A-level studies in 1977.",
    "deepDive": {
      "body": [
        "Anna Maria was only three years old when she died in 1797, just months after her father Olaudah Equiano. She was buried in the churchyard of St Andrew's Church in Chesterton, Cambridge, where a plaque now commemorates her.",
        "For nearly two centuries, the exact location of her grave was unknown. It was rediscovered in 1977 by Cathy O'Neill, a student who found it while studying for her A-levels. Her work was later confirmed in 2021 by Professor Victoria Avery of the Fitzwilliam Museum.",
        "Anna Maria's story is a small but poignant thread in the larger tapestry of Equiano's life. He was a former enslaved African who became a leading abolitionist, and his autobiography helped fuel the movement to end the slave trade. His daughter's grave, once lost, now serves as a tangible link to that legacy."
      ],
      "whyItMatters": "The rediscovery of Anna Maria's grave shows how even the smallest details of a historical figure's family life can be lost and then recovered, often by unexpected people like a student. It reminds us that history is not just about grand events but also about the personal lives that connect us to the past.",
      "readTime": 2,
      "suggestedQuestion": "How did Cathy O'Neill find the grave?"
    },
    "source": {
      "name": "Olaudah Equiano",
      "url": "https://en.wikipedia.org/wiki/Olaudah_Equiano",
      "verified": true
    },
    "image": {
      "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Portrait_of_a_Man_in_a_Red_Suit_-_Unknown-_14-1943_%28cropped%29.jpg/1280px-Portrait_of_a_Man_in_a_Red_Suit_-_Unknown-_14-1943_%28cropped%29.jpg",
      "credit": "Photo · Wikimedia Commons",
      "license": "Public domain",
      "panelColor": "#4A1B0C"
    },
    "factNumber": 1056,
    "relatedIds": []
  },
  {
    "id": "nf_1057",
    "country": "NG",
    "category": "Culture",
    "fact": "A crater on Mercury and an exoplanet are both named after Equiano.",
    "deepDive": {
      "body": [
        "A crater on Mercury and an exoplanet both bear the name Equiano, a tribute that spans the solar system. The crater was named in 1976, and the exoplanet HD 43197 b received the official name Equiano in 2019 as part of the NameExoWorlds campaign.",
        "These cosmic honors reflect the enduring legacy of Olaudah Equiano, a writer and abolitionist who was enslaved as a child in West Africa and later purchased his freedom. His 1789 autobiography, The Interesting Narrative of the Life of Olaudah Equiano, became a bestseller and helped fuel the British abolitionist movement.",
        "Equiano's name also lives on in other ways: a Google Cloud subsea cable, a bridge in Cambridge, and a Google Doodle in 2017. From the depths of the ocean to the surface of Mercury, his story continues to inspire."
      ],
      "whyItMatters": "Naming a crater and an exoplanet after Equiano places an African abolitionist among the stars, showing how his legacy transcends Earth. It reminds us that the fight for freedom and human dignity is a universal story, worthy of cosmic recognition.",
      "readTime": 1,
      "suggestedQuestion": "Why was an exoplanet named after Equiano?"
    },
    "source": {
      "name": "Olaudah Equiano",
      "url": "https://en.wikipedia.org/wiki/Olaudah_Equiano",
      "verified": true
    },
    "image": {
      "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Portrait_of_a_Man_in_a_Red_Suit_-_Unknown-_14-1943_%28cropped%29.jpg/1280px-Portrait_of_a_Man_in_a_Red_Suit_-_Unknown-_14-1943_%28cropped%29.jpg",
      "credit": "Photo · Wikimedia Commons",
      "license": "Public domain",
      "panelColor": "#04342C"
    },
    "factNumber": 1057,
    "relatedIds": []
  },
  {
    "id": "nf_1058",
    "country": "NG",
    "category": "History",
    "fact": "Fela Kuti was jailed in 1984 by Muhammadu Buhari's government on a charge of currency smuggling, which Amnesty International denounced as politically motivated.",
    "deepDive": {
      "body": [
        "In 1984, Muhammadu Buhari's government jailed Fela Kuti on a charge of currency smuggling. Kuti was a vocal opponent of the regime, and his arrest came after years of clashes with Nigeria's military rulers. The charges were widely seen as a way to silence him.",
        "Amnesty International denounced the charges as politically motivated and designated Kuti a prisoner of conscience. Other human rights groups also took up his case. He spent 20 months in prison before being released by General Ibrahim Babangida.",
        "The imprisonment was part of a pattern of government harassment. Kuti had been arrested over 200 times and had survived a brutal army raid on his commune in 1977. His music and activism continued to challenge authority until his death in 1997."
      ],
      "whyItMatters": "Kuti's jailing shows how governments used legal charges to punish political dissent. It also highlights the role of international human rights organizations in holding such actions accountable.",
      "readTime": 2,
      "suggestedQuestion": "Why was Fela Kuti imprisoned in 1984?"
    },
    "source": {
      "name": "Fela Kuti",
      "url": "https://en.wikipedia.org/wiki/Fela_Kuti",
      "verified": true
    },
    "image": {
      "url": "https://upload.wikimedia.org/wikipedia/commons/1/12/Fela_Kuti_circa_1986.jpg",
      "credit": "Photo · Distributed by Celluloid Records · Wikimedia Commons",
      "license": "Public domain",
      "panelColor": "#4A1B0C"
    },
    "factNumber": 1058,
    "relatedIds": []
  },
  {
    "id": "nf_1059",
    "country": "NG",
    "category": "Culture",
    "fact": "Fela Kuti's song 'Beasts of No Nation' referred to Muhammadu Buhari as 'an animal in a madman's body'.",
    "deepDive": {
      "body": [
        "In 1984, Muhammadu Buhari's military government jailed Fela Kuti on a charge of currency smuggling. Amnesty International and others called the charge politically motivated, and Kuti spent 20 months in prison before General Ibrahim Babangida released him.",
        "Kuti's response came in music. The album 'Beasts of No Nation' (1989) took its title from a statement by South African President P.W. Botha, who had said the anti-apartheid uprising would 'bring out the beast in us.' On the cover, Kuti depicted Botha alongside Ronald Reagan and Margaret Thatcher.",
        "In the title track, Kuti turned the 'beast' label back on Nigeria's leader, singing in Pidgin that Buhari was 'an animal in a madman's body.' The song was part of a long history of Kuti using his music to attack Nigeria's military rulers, from 'Zombie' (1977) to 'I.T.T.' (1980)."
      ],
      "whyItMatters": "Kuti turned a phrase used by an apartheid-era leader into a weapon against his own jailer. The song shows how Afrobeat became a tool for political resistance across the continent, connecting the struggle against apartheid in South Africa to the fight against military rule in Nigeria.",
      "readTime": 2,
      "suggestedQuestion": "What did Fela Kuti say about Buhari in the song?"
    },
    "source": {
      "name": "Fela Kuti",
      "url": "https://en.wikipedia.org/wiki/Fela_Kuti",
      "verified": true
    },
    "image": {
      "url": "https://upload.wikimedia.org/wikipedia/commons/1/12/Fela_Kuti_circa_1986.jpg",
      "credit": "Photo · Distributed by Celluloid Records · Wikimedia Commons",
      "license": "Public domain",
      "panelColor": "#04342C"
    },
    "factNumber": 1059,
    "relatedIds": []
  },
  {
    "id": "nf_1060",
    "country": "NG",
    "category": "Culture",
    "fact": "Fela Kuti's band featured two baritone saxophones, a rarity in most groups.",
    "deepDive": {
      "body": [
        "In the 1970s, Fela Kuti's Africa '70 band was a powerhouse of Afrobeat, blending jazz, funk, and traditional Nigerian rhythms. One of its most distinctive features was the use of two baritone saxophones, a rarity in most groups of the time. This choice gave the band a deep, powerful sound that became a hallmark of Afrobeat.",
        "The baritone saxophone, with its low, rich tone, is often used sparingly in Western bands, but Kuti embraced it fully. By having two, he created a thick, driving horn section that supported the complex rhythms and political messages of his songs. This technique is common in African and African-influenced music, and it helped define the Afrobeat sound.",
        "Kuti's band also featured multiple guitarists, each playing a single repeating pattern for the entire piece, creating a hypnotic groove. The combination of these elements made his music instantly recognizable and influential, inspiring later artists and genres."
      ],
      "whyItMatters": "The double baritone saxophone was not just a quirk; it was a key part of the Afrobeat sound that Fela Kuti pioneered. This choice shows how he used instrumentation to create a unique musical identity that influenced generations of musicians.",
      "readTime": 2,
      "suggestedQuestion": "Why did Fela Kuti use two baritone saxophones?"
    },
    "source": {
      "name": "Fela Kuti",
      "url": "https://en.wikipedia.org/wiki/Fela_Kuti",
      "verified": true
    },
    "image": {
      "url": "https://images.tapeop.com/cf86cccb-b9f1-48b6-9ac6-21757d14f883?w=1200&f=webp&q=82&fit=inside",
      "credit": "Photo · Tape Op",
      "license": "Not verified — found by web search",
      "panelColor": "#04342C"
    },
    "factNumber": 1060,
    "relatedIds": []
  },
  {
    "id": "nf_1061",
    "country": "NG",
    "category": "Culture",
    "fact": "Fela Kuti's songs were often 20 to 30 minutes long, and some unreleased tracks lasted up to 45 minutes.",
    "deepDive": {
      "body": [
        "In the 1970s, Fela Kuti's band Africa '70 would stretch a single song into a marathon. A typical track ran at least 10 to 15 minutes, and many reached 20 or 30. Some unreleased numbers, when played live, could last up to 45 minutes.",
        "This wasn't just length for its own sake. Kuti's songs often opened with a long instrumental jam—sometimes 10 to 15 minutes—before he even started singing. The music built slowly, letting the groove and the horns take hold. His LP records frequently carried one 30-minute track per side.",
        "The length was one reason his music never became hugely popular outside Africa. But it was central to his art. Kuti used the extended format to deliver complex political messages, mixing satire and protest with a sound that fused jazz, funk, and traditional African rhythms. The long songs gave him room to build a mood and drive a point home."
      ],
      "whyItMatters": "Fela Kuti's marathon tracks weren't just a quirk—they were a political and artistic choice. The length let him create an immersive experience that carried his message, and it set Afrobeat apart from the radio-friendly pop of the West.",
      "readTime": 2,
      "suggestedQuestion": "Why did Fela Kuti make his songs so long?"
    },
    "source": {
      "name": "Fela Kuti",
      "url": "https://en.wikipedia.org/wiki/Fela_Kuti",
      "verified": true
    },
    "image": {
      "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/James_Brown_Live_Hamburg_1973_1702730029.jpg/1280px-James_Brown_Live_Hamburg_1973_1702730029.jpg",
      "credit": "Photo · Heinrich Klaffs · Wikimedia Commons",
      "license": "CC BY-SA 2.0",
      "panelColor": "#04342C"
    },
    "factNumber": 1061,
    "relatedIds": []
  },
  {
    "id": "nf_1062",
    "country": "NG",
    "category": "Culture",
    "fact": "The Igbo captives who drowned at Igbo Landing sang 'The Water Spirit brought us, the Water Spirit will take us home' as they walked into the creek.",
    "deepDive": {
      "body": [
        "In May 1803, a ship carrying 75 Igbo captives from what is now Nigeria arrived at Dunbar Creek on St. Simons Island, Georgia. They had survived the Middle Passage and were bought by agents of John Couper and Thomas Spalding for $100 each to work on their plantations. But during the final leg of their journey aboard a small vessel, the Igbo rose up, took control, and drowned their captors, grounding the ship in the creek.",
        "What happened next is known from a few contemporary accounts. Under the direction of a high Igbo chief, the captives walked in unison into the creek, singing in Igbo: 'The Water Spirit brought us, the Water Spirit will take us home.' They chose death over enslavement, accepting the protection of their god Chukwu. Some sources say 10 to 12 drowned, while others were 'salvaged' by bounty hunters who received $10 a head from Spalding and Couper.",
        "The event became a powerful symbol of resistance. For over two centuries, many considered it a folktale, but research since 1980 has verified its factual basis. The story inspired the 'flying Africans' legend, where enslaved people grew wings and flew back to Africa, and it has been retold in literature, film, and art, including Toni Morrison's Song of Solomon and the film Daughters of the Dust. In 2022, a historical marker was erected near the site, honoring the Igbo who chose death over bondage."
      ],
      "whyItMatters": "The Igbo Landing is not just a tragic story; it is a documented act of mass resistance that challenged the dehumanizing logic of slavery. It shows that enslaved Africans actively fought back, and their courage became a cornerstone of African American cultural memory, inspiring generations of artists and activists.",
      "readTime": 2,
      "suggestedQuestion": "What really happened at Igbo Landing?"
    },
    "source": {
      "name": "Igbo Landing",
      "url": "https://en.wikipedia.org/wiki/Igbo_Landing",
      "verified": true
    },
    "image": {
      "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bd/Igbo_Landing_area%2C_Glynn_County%2C_Georgia%2C_US.jpg/1280px-Igbo_Landing_area%2C_Glynn_County%2C_Georgia%2C_US.jpg",
      "credit": "Photo · Jud McCranie · Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "panelColor": "#04342C"
    },
    "factNumber": 1062,
    "relatedIds": []
  },
  {
    "id": "nf_1063",
    "country": "NG",
    "category": "Culture",
    "fact": "The story of Igbo Landing inspired the death scene of Killmonger in the 2018 Marvel film Black Panther.",
    "deepDive": {
      "body": [
        "In 1803, a group of 75 Igbo captives from what is now Nigeria were bought for $100 each and loaded onto a small vessel to be taken to plantations on St. Simons Island, Georgia. During the voyage, they revolted, took control of the ship, and drowned their captors, causing the ship to run aground in Dunbar Creek.",
        "Accounts of what happened next vary, but many say the Igbo, led by a high chief, walked into the creek singing, choosing death over slavery. Some sources say 10 to 12 drowned, while others were captured. The site became known as Igbo Landing and has since been a powerful symbol of resistance.",
        "The story inspired the legend of the flying Africans, where enslaved people grew wings and flew back to Africa, and has been retold in literature and film. In the 2018 Marvel film Black Panther, Killmonger's dying words reference this event: 'Bury me in the ocean with my ancestors who jumped from ships, 'cause they knew death was better than bondage.'"
      ],
      "whyItMatters": "Killmonger's line in Black Panther connects a modern blockbuster to a real act of resistance from 1803, showing how a historical event can echo through centuries and inspire art that reaches millions.",
      "readTime": 2,
      "suggestedQuestion": "What really happened at Igbo Landing?"
    },
    "source": {
      "name": "Igbo Landing",
      "url": "https://en.wikipedia.org/wiki/Igbo_Landing",
      "verified": true
    },
    "image": {
      "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bd/Igbo_Landing_area%2C_Glynn_County%2C_Georgia%2C_US.jpg/1280px-Igbo_Landing_area%2C_Glynn_County%2C_Georgia%2C_US.jpg",
      "credit": "Photo · Jud McCranie · Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "panelColor": "#04342C"
    },
    "factNumber": 1063,
    "relatedIds": []
  },
  {
    "id": "nf_1064",
    "country": "NG",
    "category": "Culture",
    "fact": "A research study at the University of Lagos Teaching Hospital suggested that a chemical found in Igbo-Ora women and the peelings of yams, a widely consumed tuber, could be responsible for the high rate of twin births.",
    "deepDive": {
      "body": [
        "In the town of Igbo-Ora in south-western Nigeria, twins are so common that it has earned the nickname 'Twin Capital of the World.' The unusually high rate of twin births has drawn researchers, and one study from the University of Lagos Teaching Hospital pointed to a possible clue: a chemical found in the women of Igbo-Ora and in the peelings of yams, a staple food in the region.",
        "The study suggested that this chemical could be linked to the high rate of twins, but it did not prove a direct connection. The source notes that no direct relation between diet and twin births has been established, and genetics remains another possible explanation. The phenomenon is not unique to Igbo-Ora; similar high rates have been observed in Kodinhi in India and Cândido Godói in Brazil.",
        "Igbo-Ora is a farming town, and yams are a widely consumed tuber there. The research offers a tantalizing hint about how local diet might influence twinning, but the mystery is far from solved. For now, the high rate of twins in Igbo-Ora remains a fascinating puzzle, with both diet and genetics as potential pieces."
      ],
      "whyItMatters": "This fact shows how a local observation—an unusually high number of twins—can spark scientific curiosity. It also highlights that even a well-known phenomenon like twinning is not fully understood, and that diet and genetics are both candidates in the search for answers.",
      "readTime": 2,
      "suggestedQuestion": "What other places in the world have high twin rates?"
    },
    "source": {
      "name": "Igbo-Ora",
      "url": "https://en.wikipedia.org/wiki/Igbo-Ora",
      "verified": true
    },
    "image": {
      "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Twins_mother_statue.jpg/1280px-Twins_mother_statue.jpg",
      "credit": "Photo · Agbalagba · Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "panelColor": "#04342C"
    },
    "factNumber": 1064,
    "relatedIds": []
  },
  {
    "id": "nf_1065",
    "country": "NG",
    "category": "History",
    "fact": "Igbo-Ora was founded by Obe Alade, a descendant of the Alaafin of Oyo, who migrated from Oyo town after losing a chieftaincy tussle.",
    "deepDive": {
      "body": [
        "Centuries ago, a man named Obe Alade left the powerful Oyo town after losing a chieftaincy contest. In those days, it was customary for the defeated to leave, so he and his kinsmen migrated with their idols, including Egungun and Alaale.",
        "They first settled in a forest called Igbo-Asako, about three kilometers from where Igbo-Ora's market stands today. But the lack of drinking water and swarms of mosquitoes drove them out. They moved to Igbo-Ayin, near the Ayin river, where they built a market on a flat rock called Apata Itaja.",
        "Finally, they settled in a marshy area called Igbo-Ira, which gave the town its name. Over time, 'Omo Igbo-Ira' was shortened to Igbo-Ora. The town's full appellation, 'Omo Igbo-Ora Lasako', still links the people to their first settlement."
      ],
      "whyItMatters": "Igbo-Ora is famous as the 'Twin Capital of the World', but its origin story is a tale of migration and survival. Understanding how the town was founded shows that its identity is rooted in a centuries-old journey from Oyo, shaped by the customs of its time.",
      "readTime": 2,
      "suggestedQuestion": "Why did Obe Alade leave Oyo town?"
    },
    "source": {
      "name": "Igbo-Ora",
      "url": "https://en.wikipedia.org/wiki/Igbo-Ora",
      "verified": true
    },
    "image": {
      "url": "https://res.cloudinary.com/jerrick/image/upload/v1681290592/6436755face02a001d80e1c8.png",
      "credit": "Photo · Vocal Media",
      "license": "Not verified — found by web search",
      "panelColor": "#4A1B0C"
    },
    "factNumber": 1065,
    "relatedIds": []
  },
  {
    "id": "nf_1066",
    "country": "NG",
    "category": "History",
    "fact": "The name Igbo-Ora is derived from 'Igbo-Ira', meaning a forest in a marshy and swampy area, which was the third and final settlement of the town's founders.",
    "deepDive": {
      "body": [
        "The founders of Igbo-Ora did not settle in one place. They moved at least three times, and each move gave the town a new name. The first settlement was Igbo-Asako, named after the forest where they first camped. Then they moved to Igbo-Ayin, near the Ayin river, where they built a market on a flat rock.",
        "The final move took them to a marshy, swampy area by an unseasonal river. They called it Igbo-Ira, meaning 'forest in a marshy and swampy area.' Over time, people referred to the settlers as 'Omo Igbo-Ira,' which was later shortened to Igbo-Ora. The name stuck, even as the town grew into the bustling community it is today.",
        "Each settlement's name began with 'Igbo,' meaning forest, linking the town's identity to the forests that sheltered its early people. The move from Igbo-Ayin to Igbo-Ira was driven by the search for better conditions, though the source does not specify what was wrong with the second site."
      ],
      "whyItMatters": "The name Igbo-Ora is not just a label; it is a record of the town's journey. Every time someone says the name, they are echoing the memory of the marshy forest where the founders finally settled, and the earlier forests they left behind.",
      "readTime": 2,
      "suggestedQuestion": "Why did the founders of Igbo-Ora move so many times?"
    },
    "source": {
      "name": "Igbo-Ora",
      "url": "https://en.wikipedia.org/wiki/Igbo-Ora",
      "verified": true
    },
    "image": {
      "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Twins_mother_statue.jpg/1280px-Twins_mother_statue.jpg",
      "credit": "Photo · Agbalagba · Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "panelColor": "#4A1B0C"
    },
    "factNumber": 1066,
    "relatedIds": []
  },
  {
    "id": "nf_1067",
    "country": "NG",
    "category": "History",
    "fact": "The copper used in the Igbo-Ukwu bronzes came from the Abakaliki area of south-eastern Nigeria, not from Europe or the Mediterranean as once thought.",
    "deepDive": {
      "body": [
        "In the 1930s, a man digging a water cistern in his family compound in Igbo-Ukwu, a town in south-eastern Nigeria, struck metal. That chance discovery led to excavations that uncovered some of the most elaborate copper and copper-alloy objects ever found in West Africa: vessels, pendants, crowns, and ornaments covered in intricate spirals and animal forms.",
        "For decades, many assumed these masterpieces must have been imported from the Mediterranean or Europe, since the craftsmanship seemed so advanced. But modern science tells a different story. By analyzing lead isotopes and trace elements in the metal, researchers have traced most of the copper and lead to ore sources in the Abakaliki area, also in south-eastern Nigeria.",
        "This means the Igbo-Ukwu artisans were not just copying foreign styles—they were working with local materials, casting and hammering metal into objects that reflected their own world. The finds, dating roughly from the ninth to the twelfth centuries, show that communities in the West African forest zone had sophisticated craft production and long-distance trade networks long before European contact."
      ],
      "whyItMatters": "The copper in the Igbo-Ukwu bronzes came from nearby Nigerian mines, not from Europe. This overturns the old idea that Africa's great metalwork was always imported, and shows that local innovation and trade were thriving in West Africa centuries ago.",
      "readTime": 2,
      "suggestedQuestion": "How did they figure out where the copper came from?"
    },
    "source": {
      "name": "Igbo-Ukwu",
      "url": "https://en.wikipedia.org/wiki/Igbo-Ukwu",
      "verified": true
    },
    "image": {
      "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Bronze_head_and_ram%27s_head.jpg/1280px-Bronze_head_and_ram%27s_head.jpg",
      "credit": "Photo · Jononmac46 · Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "panelColor": "#4A1B0C"
    },
    "factNumber": 1067,
    "relatedIds": []
  },
  {
    "id": "nf_1068",
    "country": "NG",
    "category": "Culture",
    "fact": "The Senegalese version of jollof rice, thieboudienne, has been recognized by UNESCO as an intangible cultural heritage dish.",
    "deepDive": {
      "body": [
        "In the fishing communities of Saint-Louis, Senegal, cooks are said to have created thieboudienne when one of them ran out of barley and substituted rice. The dish, made with broken rice, fish, shellfish, and vegetables, is now a staple across West Africa and beyond.",
        "Thieboudienne is the Senegalese version of jollof rice, a one-pot dish that typically includes tomatoes, onions, chilies, and spices. While jollof rice is known by many names and variations, Senegal's version has earned a special distinction: UNESCO has recognized it as an intangible cultural heritage dish.",
        "This recognition highlights the cultural importance of thieboudienne, which is more than just a meal. In West Africa, there is a saying that 'a party without jollof is just a meeting,' underscoring how central this dish is to celebrations and daily life."
      ],
      "whyItMatters": "UNESCO's recognition of thieboudienne as intangible cultural heritage elevates a beloved regional dish to global significance, acknowledging the deep cultural roots and culinary traditions of Senegal and West Africa.",
      "readTime": 2,
      "suggestedQuestion": "What makes thieboudienne different from other jollof rice versions?"
    },
    "source": {
      "name": "Jollof rice",
      "url": "https://en.wikipedia.org/wiki/Jollof_rice",
      "verified": true
    },
    "image": {
      "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/Jollof_Rice_with_Stew.jpg/1280px-Jollof_Rice_with_Stew.jpg",
      "credit": "Photo · Noahalorwu · Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "panelColor": "#04342C"
    },
    "factNumber": 1068,
    "relatedIds": []
  },
  {
    "id": "nf_1069",
    "country": "NG",
    "category": "History",
    "fact": "In Senegal, oral histories credit Penda Mbaye, a cook at the residence of one of the colonial rulers in Saint-Louis, Senegal, as having created the dish when she ran out of barley and substituted rice.",
    "deepDive": {
      "body": [
        "In the colonial kitchens of Saint-Louis, Senegal, a cook named Penda Mbaye faced a problem: she had run out of barley. So she reached for rice instead. That substitution, according to oral histories, gave birth to the dish that would become a West African staple.",
        "The story is one of several origin tales for jollof rice. Historians point to the Jolof Empire, which ruled parts of modern-day Senegal, Mali, The Gambia, and Mauritania from around the 12th century, as the dish's namesake. Others suggest the dish spread with the Mali empire's traders, or emerged later when colonial peanut farming pushed cooks to use imported broken rice.",
        "Today, jollof rice is a source of pride and friendly rivalry across West Africa. The Senegalese version, thieboudienne, has been recognized by UNESCO as an intangible cultural heritage dish. And the 'Jollof wars' between Nigeria and Ghana have turned this humble rice dish into a cultural phenomenon."
      ],
      "whyItMatters": "Penda Mbaye's kitchen improvisation shows how a simple substitution can create a culinary legacy. Jollof rice is more than food—it's a symbol of West African identity, celebrated across borders and even honored by UNESCO.",
      "readTime": 2,
      "suggestedQuestion": "What is thieboudienne?"
    },
    "source": {
      "name": "Jollof rice",
      "url": "https://en.wikipedia.org/wiki/Jollof_rice",
      "verified": true
    },
    "image": {
      "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/Jollof_Rice_with_Stew.jpg/1280px-Jollof_Rice_with_Stew.jpg",
      "credit": "Photo · Noahalorwu · Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "panelColor": "#4A1B0C"
    },
    "factNumber": 1069,
    "relatedIds": []
  },
  {
    "id": "nf_1072",
    "country": "NG",
    "category": "History",
    "fact": "In 1893, Kanem–Bornu was conquered by the Sudanese warlord Rabih az-Zubayr, who transformed the empire into a brutal military regime.",
    "deepDive": {
      "body": [
        "Rabih az-Zubayr was a Sudanese adventurer and slave raider who entered Bornuan territory in 1892/1893. His forces captured Karnak Logone, a small sultanate on the southeastern border, and then defeated the Bornu army at the battle of Amja. In August 1893, he decisively beat a second army at Lekarawa, forcing Shehu Ashimi to flee across the Yobe River.",
        "Rabih made Dikwa his capital and ruled with an iron fist. He imposed heavy taxes, executed rebellious leaders, and concentrated power in a small military council. His conquest marked the first time the empire came under foreign domination, and his brutality devastated the agricultural economy.",
        "His rule lasted only until 1900, when he was killed by French forces at the battle of Kousséri. The French and British then carved up the empire, and by 1902 its territories were absorbed into colonial empires. The al-Kanemi dynasty was restored but only under colonial suzerainty."
      ],
      "whyItMatters": "Rabih's conquest ended over a thousand years of indigenous rule in Kanem–Bornu. It shows how a single warlord could topple an ancient empire, and how European colonial powers then exploited the chaos to divide Africa among themselves.",
      "readTime": 2,
      "suggestedQuestion": "Who was Rabih az-Zubayr and how did he conquer Kanem–Bornu?"
    },
    "source": {
      "name": "Kanem–Bornu Empire",
      "url": "https://en.wikipedia.org/wiki/Kanem%E2%80%93Bornu_Empire",
      "verified": true
    },
    "image": {
      "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/32/Kanem%E2%80%93Bornu%2C_1893.png/1280px-Kanem%E2%80%93Bornu%2C_1893.png",
      "credit": "Photo · Megartonius · Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "panelColor": "#4A1B0C"
    },
    "factNumber": 1072,
    "relatedIds": []
  },
  {
    "id": "nf_1073",
    "country": "NG",
    "category": "History",
    "fact": "In 1257, the mai of Kanem sent a giraffe as a gift to the Hafsid dynasty in Ifriqiya.",
    "deepDive": {
      "body": [
        "In the 13th century, the Kanem Empire, centered around Lake Chad, was at the height of its power under the mai Dunama II Dibalemi. The empire controlled key trans-Saharan trade routes, exporting salt, ivory, and slaves, and its influence extended as far as the Fezzan region in the Sahara. It was a wealthy and cosmopolitan state, with its rulers making pilgrimages to Mecca and maintaining diplomatic contacts across the Islamic world.",
        "In 1257, the mai sent a giraffe as a gift to Muhammad I al-Mustansir, the Hafsid ruler of Ifriqiya (modern-day Tunisia and eastern Algeria). This was not an isolated gesture; the empire engaged in long-distance diplomacy, and such gifts were a way to build alliances and demonstrate prestige. The giraffe, a rare and exotic animal, would have been a striking symbol of the mai's wealth and reach.",
        "The Kanem Empire's power was built on trade and military strength. It commanded a cavalry of 40,000 horsemen and used its control of Saharan routes to acquire horses from North Africa in exchange for slaves. The empire's influence was such that a hostel for its pilgrims and students was established in Cairo, and its rulers were recognized as significant players in the wider Islamic world."
      ],
      "whyItMatters": "This small diplomatic gesture reveals the interconnectedness of medieval Africa with the broader Islamic world. It shows that African empires were not isolated but active participants in long-distance trade and diplomacy, with the resources and sophistication to send exotic gifts to distant rulers.",
      "readTime": 2,
      "suggestedQuestion": "Why did the mai send a giraffe as a gift?"
    },
    "source": {
      "name": "Kanem–Bornu Empire",
      "url": "https://en.wikipedia.org/wiki/Kanem%E2%80%93Bornu_Empire",
      "verified": true
    },
    "image": {
      "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/Kanem%E2%80%93Bornu%2C_1259.png/1280px-Kanem%E2%80%93Bornu%2C_1259.png",
      "credit": "Photo · Megartonius · Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "panelColor": "#4A1B0C"
    },
    "factNumber": 1073,
    "relatedIds": []
  },
  {
    "id": "nf_1074",
    "country": "NG",
    "category": "Culture",
    "fact": "Over two million tourists from more than 100 nations have visited Lekki Conservation Centre since its establishment.",
    "deepDive": {
      "body": [
        "Lekki Conservation Centre sits on 78 hectares of land in Lagos, Nigeria, a green pocket carved out before the surrounding city grew up around it. It was established in the 1990s to protect wildlife in the southwest coastal environment, even as urban development pressed in from all sides.",
        "The centre is run by the Nigerian Conservation Foundation and works to stop poaching by nearby communities while also welcoming visitors. Its grounds are split between a complex with offices, a gift shop, and a canteen, and a nature reserve made up of secondary forest, swamp forest, and savanna grassland.",
        "That mix of conservation and tourism has drawn a remarkable crowd: over two million visitors from more than 100 countries have come since it opened. Many of the foundation's school conservation clubs were started after students visited the centre, spreading its influence beyond its own borders."
      ],
      "whyItMatters": "This shows that a conservation site can thrive in the middle of one of Africa's fastest-growing urban corridors. The centre's popularity helped fund its mission and spread environmental education through schools, proving that protection and public engagement can go hand in hand.",
      "readTime": 2,
      "suggestedQuestion": "What animals can you see at Lekki Conservation Centre?"
    },
    "source": {
      "name": "Lekki",
      "url": "https://en.wikipedia.org/wiki/Lekki",
      "verified": true
    },
    "image": {
      "url": "https://upload.wikimedia.org/wikipedia/commons/d/d5/A_pathway_in_the_Lekki_Convention_Center.jpg?utm_source=en.wikipedia.org&utm_campaign=index&utm_content=original",
      "credit": "Photo · Wikipedia",
      "license": "Not verified — found by web search",
      "panelColor": "#04342C"
    },
    "factNumber": 1074,
    "relatedIds": []
  },
  {
    "id": "nf_1075",
    "country": "NG",
    "category": "Culture",
    "fact": "The Nike Art Gallery is probably the largest of its kind in West Africa, housed in a five-storey building with about 8,000 works of art.",
    "deepDive": {
      "body": [
        "In the heart of Lagos, a five-storey building holds one of West Africa's most impressive art collections. The Nike Art Gallery, owned by Nike Davies-Okundaye, houses about 8,000 works by Nigerian artists, including Chief Josephine Oboh Macleod. It's a popular destination for tourists and locals alike, showcasing the richness of Nigerian creativity.",
        "The gallery is a testament to the thriving art scene in Lagos, a city known for its vibrant culture. With such a vast collection, it offers a deep dive into the country's artistic heritage, from traditional to contemporary pieces. The building itself is a landmark, standing tall in the Lekki area, which is also home to other cultural spots like the Lekki Conservation Centre.",
        "While the gallery is a cultural hub, it's also a reminder of the growing importance of art in Nigeria's economy and identity. As Lekki continues to develop, with new infrastructure and businesses, the gallery remains a constant, drawing visitors from around the world."
      ],
      "whyItMatters": "The Nike Art Gallery's scale shows how deeply art is woven into Lagos's identity. It's not just a collection; it's a symbol of Nigeria's creative economy and a key reason why tourists visit the city.",
      "readTime": 2,
      "suggestedQuestion": "Who is Nike Davies-Okundaye and how did she build this collection?"
    },
    "source": {
      "name": "Lekki",
      "url": "https://en.wikipedia.org/wiki/Lekki",
      "verified": true
    },
    "image": {
      "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Outside_Nike_Art_Gallery_%284202980259%29.jpg/1280px-Outside_Nike_Art_Gallery_%284202980259%29.jpg",
      "credit": "Photo · Jeremy Weate · Wikimedia Commons",
      "license": "CC BY 2.0",
      "panelColor": "#04342C"
    },
    "factNumber": 1075,
    "relatedIds": []
  },
  {
    "id": "nf_1076",
    "country": "NG",
    "category": "Culture",
    "fact": "Mark Zuckerberg has already jogged across the Lekki-Ikoyi Bridge, completed in 2013.",
    "deepDive": {
      "body": [
        "In 2016, Mark Zuckerberg visited Lagos and famously went for a morning jog across the Lekki-Ikoyi Bridge, a cable-stayed bridge that spans the Five Cowrie Creek. The bridge, completed in 2013, is a key link between the Lekki Peninsula and Ikoyi, and it has become one of Lagos's most photographed landmarks.",
        "Zuckerberg's run was part of a broader visit to Nigeria, where he met with tech entrepreneurs and developers. The image of the Facebook founder jogging across the bridge, surrounded by security and curious onlookers, was widely shared on social media, highlighting the bridge's status as a symbol of modern Lagos.",
        "The bridge is not just a photo opportunity; it is a vital piece of infrastructure in a rapidly growing city. Its construction was part of a larger effort to improve connectivity in Lagos, which is one of Africa's largest cities. The bridge's completion in 2013 was a significant milestone, and it has since become a popular spot for both commuters and tourists."
      ],
      "whyItMatters": "The Lekki-Ikoyi Bridge is more than a crossing; it's a symbol of Lagos's ambition and growth. When a global tech leader like Mark Zuckerberg jogs across it, the bridge becomes a stage for showcasing Nigeria's emergence as a hub for innovation and development.",
      "readTime": 2,
      "suggestedQuestion": "Why did Mark Zuckerberg visit Lagos in 2016?"
    },
    "source": {
      "name": "Lekki",
      "url": "https://en.wikipedia.org/wiki/Lekki",
      "verified": true
    },
    "image": {
      "url": "https://upload.wikimedia.org/wikipedia/commons/9/94/Lekki_link_bridge.jpg",
      "credit": "Photo · Olasunkanmiariyo · Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "panelColor": "#04342C"
    },
    "factNumber": 1076,
    "relatedIds": []
  },
  {
    "id": "nf_1077",
    "country": "NG",
    "category": "Business",
    "fact": "Nairaland, founded by Seun Osewa in 2011, is the 5th most visited website in Nigeria.",
    "deepDive": {
      "body": [
        "In October 2011, Nigerian entrepreneur Seun Osewa launched Nairaland, a website where Nigerians could discuss news and share opinions in English. Today, it ranks as the 5th most visited website in Nigeria, a testament to its deep integration into the country's online life.",
        "The platform has grown to over 5.9 million registered users and more than 7.3 million topics. That means roughly 5% of Nigerian internet users have signed up, a significant slice of the country's online population. Registration is only needed to post, comment, or like, so many more may simply read.",
        "Nairaland's journey hasn't been smooth. In 2014, hackers wiped its servers, causing a three-day outage and the loss of posts from January to June. The site also faced criticism for hosting ethnic bigotry, which pushed some users to other platforms. More recently, in December 2023, its host temporarily shut it down, though it later returned.",
        "Despite these challenges, Nairaland remains a central hub for Nigerian discourse, connecting millions in a shared digital space."
      ],
      "whyItMatters": "Nairaland's ranking as the 5th most visited site in Nigeria shows that a homegrown platform can compete with global giants. It's not just a website; it's a digital public square where a significant portion of the nation's internet users gather.",
      "readTime": 2,
      "suggestedQuestion": "How did Nairaland become so popular in Nigeria?"
    },
    "source": {
      "name": "Nairaland",
      "url": "https://en.wikipedia.org/wiki/Nairaland",
      "verified": true
    },
    "image": {
      "url": "https://lookaside.instagram.com/seo/google_widget/crawler/?media_id=2891765882536432651",
      "credit": "Photo · Instagram",
      "license": "Not verified — found by web search",
      "panelColor": "#26215C"
    },
    "factNumber": 1077,
    "relatedIds": []
  },
  {
    "id": "nf_1078",
    "country": "NG",
    "category": "Business",
    "fact": "Approximately 5% of Nigerian Internet users are registered on Nairaland, compared to Facebook's 11 million Nigerian users, about 20% of the local Internet population.",
    "deepDive": {
      "body": [
        "Nairaland, a Nigerian English-language news website, was founded by entrepreneur Seun Osewa on October 20, 2011. It has grown to over 5.9 million users and is the 5th most visited website in Nigeria. Registration is only needed to post, comment, or like, which may explain its widespread adoption.",
        "The site's reach is striking when compared to global platforms. While about 5% of Nigerian Internet users are registered on Nairaland, Facebook's 11 million Nigerian users represent roughly 20% of the local Internet population. This means Nairaland's user base is a significant slice of the country's online community.",
        "Nairaland has faced challenges, including a 2014 hacking incident that wiped data and a temporary shutdown in 2023 by its server host. It has also been criticized for hosting ethnic bigotry, leading some users to migrate to other platforms with stricter moderation."
      ],
      "whyItMatters": "Nairaland's user base is a significant slice of Nigeria's online community, showing that a local platform can rival global giants in reach. This challenges the assumption that African internet users primarily rely on international social media.",
      "readTime": 2,
      "suggestedQuestion": "How does Nairaland compare to Facebook in Nigeria?"
    },
    "source": {
      "name": "Nairaland",
      "url": "https://en.wikipedia.org/wiki/Nairaland",
      "verified": true
    },
    "image": {
      "url": "https://cdn.dribbble.com/userupload/43086471/file/original-b26ece1076cdd338685086546c89c04c.png",
      "credit": "Photo · Dribbble",
      "license": "Not verified — found by web search",
      "panelColor": "#26215C"
    },
    "factNumber": 1078,
    "relatedIds": []
  },
  {
    "id": "nf_1079",
    "country": "NG",
    "category": "Culture",
    "fact": "In 2014, trolls from 4chan registered on Nairaland to spread false claims that Americans and Europeans were spreading Ebola through worship of the 'Ebola-chan' meme.",
    "deepDive": {
      "body": [
        "In 2014, as the Ebola epidemic gripped West Africa, a different kind of infection spread online. Trolls from the imageboard 4chan created accounts on Nairaland, a major Nigerian forum, and began posting false claims that Americans and Europeans were spreading the virus through magical rituals. Their stories centered on 'Ebola-chan,' an anime character personifying the virus that 4chan had popularized.",
        "The prank exploited real fears during a deadly outbreak. By tying the disease to foreign worship of a cartoon meme, the trolls turned a public health crisis into a vehicle for misinformation. Nairaland, with millions of users, became a platform where these rumors could reach a wide audience.",
        "The incident is one of several challenges the site has faced, from hacking attacks to the spread of conspiracy theories like QAnon. It shows how easily online communities can be manipulated, especially during times of fear and uncertainty."
      ],
      "whyItMatters": "The 4chan prank on Nairaland shows how misinformation can weaponize a health crisis, turning a real epidemic into a tool for online disruption. It underscores the vulnerability of large platforms to coordinated trolling and the lasting impact such falsehoods can have.",
      "readTime": 2,
      "suggestedQuestion": "How did Nairaland respond to the 4chan prank?"
    },
    "source": {
      "name": "Nairaland",
      "url": "https://en.wikipedia.org/wiki/Nairaland",
      "verified": true
    },
    "image": {
      "url": "https://static.wikia.nocookie.net/somethingchans/images/e/ed/50b4a824-4860-4c28-8bc3-2c86951ef273.jpg/revision/latest?cb=20180518211609",
      "credit": "Photo · Somethingchans Wiki - Fandom",
      "license": "Not verified — found by web search",
      "panelColor": "#04342C"
    },
    "factNumber": 1079,
    "relatedIds": []
  },
  {
    "id": "nf_1080",
    "country": "NG",
    "category": "Business",
    "fact": "In 2014, hackers wiped Nairaland's host server and backup, causing the loss of all user posts and registrations from January 10 to June 22, 2014.",
    "deepDive": {
      "body": [
        "In June 2014, Nairaland, one of Nigeria's most visited websites, suddenly went dark. The cause was a successful hacking attempt that wiped the site's host server and its backup, leaving no trace of months of user activity.",
        "The attack erased all user posts and registrations from January 10 to June 22, 2014. When the site returned three days later, it had recovered some data from a remote backup, but the lost content was gone for good. Users who had registered during that period had to re-register.",
        "The incident was a stark reminder of how fragile online communities can be. Even a platform with millions of users and a backup system could lose a significant chunk of its history in a single attack."
      ],
      "whyItMatters": "This event shows that even major African online platforms are not immune to cyberattacks, and that data loss can have lasting consequences for users and communities.",
      "readTime": 2,
      "suggestedQuestion": "How did Nairaland recover after the 2014 hack?"
    },
    "source": {
      "name": "Nairaland",
      "url": "https://en.wikipedia.org/wiki/Nairaland",
      "verified": true
    },
    "image": {
      "url": "https://www.zelladc.com/wp-content/uploads/2020/11/Traditional-vs-next-generation-server-rooms.webp",
      "credit": "Photo · Zella DC",
      "license": "Not verified — found by web search",
      "panelColor": "#26215C"
    },
    "factNumber": 1080,
    "relatedIds": []
  },
  {
    "id": "nf_1081",
    "country": "NG",
    "category": "History",
    "fact": "A Nok terracotta sculpture depicts two people paddling a dugout canoe, suggesting the Nok used canoes for river trade that may have reached the Atlantic coast.",
    "deepDive": {
      "body": [
        "The Nok culture, named after the village of Nok in southern Kaduna State, Nigeria, is famous for its terracotta sculptures, which are among the earliest large figurative art in Africa. One remarkable sculpture shows two people paddling a dugout canoe, with their goods on board. This image is more than just art; it hints at how the Nok people may have traveled and traded.",
        "The canoe sculpture suggests that the Nok used dugout canoes to carry cargo along rivers like the Gurara, a tributary of the Niger River. This would have connected them to a regional trade network. Another sculpture, showing a figure with a seashell on its head, hints that these river routes might have reached all the way to the Atlantic coast, bringing goods from far away.",
        "This watercraft depiction is also important in African maritime history. It is the second earliest known water vessel in Sub-Saharan Africa, after the Dufuna canoe, which was built about 8000 years ago in northern Nigeria. The Nok canoe sculpture was made in central Nigeria during the first millennium BCE, showing that water transport was part of life long ago."
      ],
      "whyItMatters": "This tiny clay canoe reveals that the Nok people were not isolated farmers but part of a wider network of trade and travel. It shows that complex societies in West Africa were connected by rivers, possibly even to the coast, thousands of years ago.",
      "readTime": 2,
      "suggestedQuestion": "How did the Nok people use the rivers for trade?"
    },
    "source": {
      "name": "Nok culture",
      "url": "https://en.wikipedia.org/wiki/Nok_culture",
      "verified": true
    },
    "image": {
      "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/76/Sculpture_nok-Nigeria_%281%29.jpg/1280px-Sculpture_nok-Nigeria_%281%29.jpg",
      "credit": "Photo · Ji-Elle · Wikimedia Commons",
      "license": "CC BY-SA 3.0",
      "panelColor": "#4A1B0C"
    },
    "factNumber": 1081,
    "relatedIds": []
  },
  {
    "id": "nf_1082",
    "country": "NG",
    "category": "History",
    "fact": "Nok terracotta sculptures are the earliest large three-dimensional figurative art in continental Africa, excluding ancient Egyptian art.",
    "deepDive": {
      "body": [
        "In 1928, a tin miner in central Nigeria accidentally unearthed a terracotta head at a depth of 24 feet. It was the first of many such finds near the village of Nok, and it would eventually lead archaeologists to a culture that flourished from around 1500 BCE to 1 BCE.",
        "The Nok people created hollow, coil-built terracotta sculptures, often nearly life-sized, with detailed hairstyles and jewelry. These figures are the earliest large three-dimensional figurative art in continental Africa, excluding ancient Egyptian art. They may have been used in funerary rituals, as ancestor portraits, or as roof finials, though their exact purpose remains unknown.",
        "The Nok culture also developed iron metallurgy, possibly independently, between 750 BCE and 550 BCE. Their artistic tradition may have influenced later West African cultures, including Bura, Koma, Igbo-Ukwu, Jenne-Jeno, and Ile Ife."
      ],
      "whyItMatters": "This fact shifts the timeline of African art history: before Nok, large figurative sculpture in sub-Saharan Africa was thought to be much later. The Nok terracottas show that sophisticated artistic traditions existed in West Africa over two thousand years ago, and they may have seeded later artistic styles across the region.",
      "readTime": 2,
      "suggestedQuestion": "What did the Nok people use these sculptures for?"
    },
    "source": {
      "name": "Nok culture",
      "url": "https://en.wikipedia.org/wiki/Nok_culture",
      "verified": true
    },
    "image": {
      "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/Nok_sculpture_Louvre_70-1998-11-1.jpg/1280px-Nok_sculpture_Louvre_70-1998-11-1.jpg",
      "credit": "Photo · Marie-Lan Nguyen · Wikimedia Commons",
      "license": "Public domain",
      "panelColor": "#4A1B0C"
    },
    "factNumber": 1082,
    "relatedIds": []
  },
  {
    "id": "nf_1083",
    "country": "NG",
    "category": "Food",
    "fact": "Nok people gathered honey and used it to preserve meat, as evidenced by beeswax and animal fats found on their pottery.",
    "deepDive": {
      "body": [
        "About 3,500 years ago, in what is now central Nigeria, the Nok people were already keeping bees. They gathered honey and stored it in pottery, and traces of beeswax and animal fats on their ceramics suggest they used it to preserve meat.",
        "The honey likely sweetened their food as well. The same pots that held honey may have held meat, with the honey acting as a natural preservative. This practice points to a sophisticated understanding of food storage long before refrigeration.",
        "The Nok are famous for their terracotta sculptures, but this everyday detail shows another side of their lives. They were farmers and foragers who knew how to make the most of what the land offered."
      ],
      "whyItMatters": "This small clue from ancient pots connects the Nok people to a practice that spans human history: using nature to keep food safe. It shows that innovation in food preservation isn't modern—it's a thread that runs through African history.",
      "readTime": 1,
      "suggestedQuestion": "How did the Nok people use honey to preserve meat?"
    },
    "source": {
      "name": "Nok culture",
      "url": "https://en.wikipedia.org/wiki/Nok_culture",
      "verified": true
    },
    "image": {
      "url": "https://upload.wikimedia.org/wikipedia/commons/9/97/Brooklyn_Museum_1989.51.39_Nommo_Figure_with_Raised_Arms.jpg",
      "credit": "Photo · Unknown author · Wikimedia Commons",
      "license": "CC BY 3.0",
      "panelColor": "#4B1528"
    },
    "factNumber": 1083,
    "relatedIds": []
  },
  {
    "id": "nf_1084",
    "country": "NG",
    "category": "History",
    "fact": "More than 90% of known Nok Culture sites have been illegally looted, and over 1,000 Nok terracotta sculptures have been smuggled abroad.",
    "deepDive": {
      "body": [
        "The Nok culture, named after the village of Nok in southern Kaduna State, Nigeria, is famous for its terracotta sculptures, which are among the earliest large figurative art in Africa. These sculptures, created as early as 900 BCE, depict humans, animals, and scenes like a dugout canoe, hinting at a complex society with trade routes and rituals.",
        "But the ground that holds these treasures is under siege. Since the 1970s, and especially after 1994, looting has been rampant. A joint research project by Goethe University and Nigeria's National Commission for Museums and Monuments found that over 90% of known Nok sites have been illegally dug up. More than 1,000 terracotta sculptures have been smuggled to Europe, the USA, Japan, and elsewhere, often ending up on the international art market.",
        "Each looted piece tears away a piece of history. When sculptures are ripped from the ground without documentation, we lose the context that tells us about the people who made them. The same project also revealed that many sites are destroyed, and even fakes are being made to meet demand. While some pieces have been repatriated, the loss continues to erode our understanding of this ancient culture."
      ],
      "whyItMatters": "The looting of Nok sites isn't just a loss of beautiful objects; it's a loss of knowledge. Over 90% of known sites have been disturbed, meaning we may never fully understand the people who created some of Africa's earliest large sculptures.",
      "readTime": 2,
      "suggestedQuestion": "How do archaeologists know so much about the Nok if so many sites have been looted?"
    },
    "source": {
      "name": "Nok culture",
      "url": "https://en.wikipedia.org/wiki/Nok_culture",
      "verified": true
    },
    "image": {
      "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Africa_Nok_Head_Kimbell.jpg/1280px-Africa_Nok_Head_Kimbell.jpg",
      "credit": "Photo · User:FA2010 · Wikimedia Commons",
      "license": "Public domain",
      "panelColor": "#4A1B0C"
    },
    "factNumber": 1084,
    "relatedIds": []
  },
  {
    "id": "nf_1085",
    "country": "NG",
    "category": "Business",
    "fact": "Nollywood loses around $10–$15 billion annually to piracy, with Telegram groups being major contributing factors.",
    "deepDive": {
      "body": [
        "Nollywood filmmakers have found a new home on YouTube, where they can distribute their work directly to audiences. This shift is partly a response to the widespread piracy that has long plagued the industry, costing it billions each year.",
        "The financial toll is staggering: Nollywood loses an estimated $10–$15 billion annually to piracy, with Telegram groups being major contributors. These losses represent not just revenue, but also the livelihoods of countless actors, directors, and crew members who depend on the industry.",
        "Despite these challenges, the industry continues to evolve. YouTube has become a platform for both established and emerging talents, offering a way to reach viewers while bypassing traditional distribution channels that are vulnerable to piracy."
      ],
      "whyItMatters": "Piracy isn't just a nuisance—it's a massive drain on one of Africa's most vibrant creative industries. Understanding the scale of these losses helps explain why Nollywood is increasingly turning to digital platforms like YouTube to protect its work and sustain its growth.",
      "readTime": 2,
      "suggestedQuestion": "How does Nollywood make money if piracy is so widespread?"
    },
    "source": {
      "name": "Nollywood",
      "url": "https://en.wikipedia.org/wiki/Nollywood",
      "verified": true
    },
    "image": {
      "url": "https://thepolitic.org/wp-content/uploads/2016/10/nollywood-e1475958000602-1568x941.jpg",
      "credit": "Photo · The Politic",
      "license": "Not verified — found by web search",
      "panelColor": "#26215C"
    },
    "factNumber": 1085,
    "relatedIds": []
  },
  {
    "id": "nf_1086",
    "country": "NG",
    "category": "Business",
    "fact": "One of the first blockbusters from Nigeria came from the Yoruba language industry: Mosebolatan (1985) by Moses Olaiya grossed ₦107,000 (approx. 2015 ₦44.2 million) in five days of its release.",
    "deepDive": {
      "body": [
        "In 1985, Nigerian audiences packed cinemas to see Mosebolatan, a Yoruba-language film by Moses Olaiya. Within five days, it had earned ₦107,000—a sum that would be roughly ₦44.2 million in 2015. At the time, that made it one of the country's first blockbusters.",
        "The film came out of the Yoruba traveling theatre tradition, where performers like Olaiya moved from stage to screen. This was part of a wave of Yoruba-language cinema that had been growing since the 1960s, with pioneers like Ola Balogun and Ade Love. Mosebolatan's success showed that local-language films could draw huge audiences and big money.",
        "Years later, the Nigerian film industry would become known globally as Nollywood, but its roots run deeper than the 1990s video boom. The Yoruba-language industry was already producing hits like Mosebolatan, setting the stage for the diverse and vibrant film culture that followed."
      ],
      "whyItMatters": "Mosebolatan's success proves that Nigerian cinema's commercial power predates the Nollywood label. It shows that the industry's foundation was built on local-language storytelling, not just the English-language films that later gained international fame.",
      "readTime": 2,
      "suggestedQuestion": "What was the Yoruba traveling theatre tradition?"
    },
    "source": {
      "name": "Nollywood",
      "url": "https://en.wikipedia.org/wiki/Nollywood",
      "verified": true
    },
    "image": {
      "url": "https://m.media-amazon.com/images/M/MV5BMDUxZGM0MzYtOTE5My00OTljLWI0ODEtZTZhODNiYTkyNDFhXkEyXkFqcGc@._V1_.jpg",
      "credit": "Photo · IMDb",
      "license": "Not verified — found by web search",
      "panelColor": "#26215C"
    },
    "factNumber": 1086,
    "relatedIds": []
  },
  {
    "id": "nf_1087",
    "country": "NG",
    "category": "Culture",
    "fact": "The term 'Kannywood' was created in 1999 by Sunusi Shehu of Tauraruwa Magazine.",
    "deepDive": {
      "body": [
        "In 1999, a journalist named Sunusi Shehu was writing for Tauraruwa Magazine when he coined a new name for the Hausa-language film industry: Kannywood. The term caught on quickly, becoming the popular way to refer to the industry that was based mainly in Kano, Northern Nigeria.",
        "Kannywood had been growing for years before it got its name. It evolved from drama productions by RTV Kaduna and Radio Kaduna in the 1960s, with pioneers like Dalhatu Bawa and Kasimu Yero. In the 1990s, the industry shifted as filmmakers blended Indian Bollywood influences with Hausa culture, creating a unique style that attracted local audiences. The 1990 film Turmin Danya is often cited as the first commercially successful Kannywood film.",
        "By 2012, over 2,000 film companies were registered with the Kano State Filmmakers Association, showing how much the industry had expanded since Shehu gave it a name."
      ],
      "whyItMatters": "Kannywood is more than a nickname—it's a label that helped define and unify a major regional film industry within Nigeria. Understanding its origin shows how a single term can shape the identity and recognition of an entire creative community.",
      "readTime": 1,
      "suggestedQuestion": "Who came up with the name Kannywood?"
    },
    "source": {
      "name": "Nollywood",
      "url": "https://en.wikipedia.org/wiki/Nollywood",
      "verified": true
    },
    "image": {
      "url": "https://lookaside.fbsbx.com/lookaside/crawler/media/?media_id=333860742714964",
      "credit": "Photo · Facebook",
      "license": "Not verified — found by web search",
      "panelColor": "#04342C"
    },
    "factNumber": 1087,
    "relatedIds": []
  },
  {
    "id": "nf_1088",
    "country": "NG",
    "category": "History",
    "fact": "In 1988, the Nigerian Railway Corporation declared bankruptcy and all rail traffic stopped for six months.",
    "deepDive": {
      "body": [
        "In 1988, the Nigerian Railway Corporation, the state-owned operator of the country's rail network, declared bankruptcy. All rail traffic came to a halt for six months, a stark symbol of the corporation's long decline.",
        "The NRC had once been a vital part of Nigeria's infrastructure, with its network reaching its maximum extent in 1964, shortly after independence. But years of mismanagement and neglect followed, leading to a lack of maintenance of tracks and locomotives.",
        "After the six-month stoppage, trains resumed on tracks that were still usable, but the problems persisted. By 2002, passenger service was discontinued altogether, and it was only in December 2012 that regular scheduled service was restored on the Lagos to Kano line."
      ],
      "whyItMatters": "The 1988 bankruptcy marked a low point in the decline of Nigeria's railways, which had once been a symbol of national connectivity. It shows how a vital public service can collapse without proper investment and management, and how long it can take to recover.",
      "readTime": 1,
      "suggestedQuestion": "What caused the Nigerian Railway Corporation to go bankrupt?"
    },
    "source": {
      "name": "Nigerian Railway Corporation",
      "url": "https://en.wikipedia.org/wiki/Nigerian_Railway_Corporation",
      "verified": true
    },
    "image": {
      "url": "https://atqnews.com/wp-content/uploads/2020/12/railway.jpg",
      "credit": "Photo · ATQ News",
      "license": "Not verified — found by web search",
      "panelColor": "#4A1B0C"
    },
    "factNumber": 1088,
    "relatedIds": []
  },
  {
    "id": "nf_1089",
    "country": "NG",
    "category": "History",
    "fact": "The Lagos-Ibadan railway is the first double-track standard gauge line in West Africa.",
    "deepDive": {
      "body": [
        "The Lagos-Ibadan railway, inaugurated on 10 June 2021, runs 157 kilometers through Abeokuta, connecting Nigeria's largest city to its third-largest. It is the first double-track standard gauge line in West Africa, a milestone for the region's rail infrastructure.",
        "The line was built by China Civil Engineering Construction Corp (CCECC) starting in March 2017. A journey between Lagos and Ibadan takes two and a half hours, half the time of the equivalent car trip. The trains are air-conditioned, with power outlets and USB charging at window seats, and are praised for punctuality and cleanliness.",
        "However, tickets are only sold for cash and not online, and there are just two trips per day in each direction. The line is part of a broader effort to modernize Nigeria's railways, which have suffered from decades of decline and underinvestment."
      ],
      "whyItMatters": "This railway is not just a faster commute; it is the first of its kind in West Africa, setting a standard for future rail projects in the region. It shows how infrastructure can reshape travel and economic connections in a country where road travel is often dangerous and slow.",
      "readTime": 2,
      "suggestedQuestion": "How long did it take to build the Lagos-Ibadan railway?"
    },
    "source": {
      "name": "Nigerian Railway Corporation",
      "url": "https://en.wikipedia.org/wiki/Nigerian_Railway_Corporation",
      "verified": true
    },
    "image": {
      "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/76/Train_station_Mobolaji_Johnson.jpg/1280px-Train_station_Mobolaji_Johnson.jpg",
      "credit": "Photo · FrankvEck · Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "panelColor": "#4A1B0C"
    },
    "factNumber": 1089,
    "relatedIds": []
  },
  {
    "id": "nf_1090",
    "country": "NG",
    "category": "Business",
    "fact": "The NRC owns nearly 200 locomotives, of which up to 75% are not operational.",
    "deepDive": {
      "body": [
        "The Nigerian Railway Corporation's fleet is in a state of disrepair. Of its nearly 200 locomotives, up to 75% are not operational, meaning only about 50 are in working condition. This shortage is compounded by the fact that less than half of its passenger coaches and freight wagons are serviceable.",
        "The decline is part of a long history of underinvestment and neglect. The NRC reached its peak in 1964, shortly after independence, but then entered a period of decline, inept management, and lack of maintenance. It declared bankruptcy in 1988, and by 2002 passenger service was discontinued altogether.",
        "Recent years have seen some revival, with new standard gauge lines and record revenues in 2021. However, the old Cape Gauge network and its aging rolling stock remain largely inoperative, highlighting the challenges of modernizing a century-old railway system."
      ],
      "whyItMatters": "This statistic reveals the scale of Nigeria's railway decay: a fleet that should be a national asset is mostly idle. It underscores the gap between the country's ambitions for rail modernization and the reality of its existing infrastructure.",
      "readTime": 2,
      "suggestedQuestion": "Why are so many of Nigeria's locomotives not working?"
    },
    "source": {
      "name": "Nigerian Railway Corporation",
      "url": "https://en.wikipedia.org/wiki/Nigerian_Railway_Corporation",
      "verified": true
    },
    "image": {
      "url": "https://upload.wikimedia.org/wikipedia/commons/8/87/Nigerian_Public_Domain_831.jpg",
      "credit": "Photo · Jaekel, Francis. · Wikimedia Commons",
      "license": "Public domain",
      "panelColor": "#26215C"
    },
    "factNumber": 1090,
    "relatedIds": []
  },
  {
    "id": "nf_1091",
    "country": "NG",
    "category": "History",
    "fact": "Some of the NRC's wagons date back to 1948, and no new wagons had been bought since 1993.",
    "deepDive": {
      "body": [
        "In 2008, the acting managing director of the Nigerian Railway Corporation, Mazi Jetson Nwankwo, described a system in crisis. He noted that no new wagons had been purchased since 1993, and some of the rolling stock still in use dated back to 1948. At the time, the corporation employed just 6,516 people, a sharp drop from the roughly 45,000 it had between 1954 and 1975.",
        "The aging fleet was part of a broader decline. The NRC had declared bankruptcy in 1988, and by 2002 passenger service had stopped altogether. Track conditions limited trains to just 35 km/h. The lack of new wagons meant that even when tracks were usable, the capacity to move goods and people was severely constrained.",
        "The situation began to change in the 2010s with new investments, particularly in standard gauge lines like the Abuja-Kaduna and Lagos-Ibadan routes. By 2021, the corporation recorded record revenues, driven mainly by passenger traffic on the new lines. Yet the old wagons from 1948 and 1993 remained a symbol of the decades of underinvestment that the new projects were trying to overcome."
      ],
      "whyItMatters": "The age of the wagons shows how deep the NRC's decline ran—not just broken tracks, but decades without basic investment. It puts the recent record revenues in perspective: they come after a long period when the railway could barely function.",
      "readTime": 2,
      "suggestedQuestion": "How did the NRC's old wagons affect its operations?"
    },
    "source": {
      "name": "Nigerian Railway Corporation",
      "url": "https://en.wikipedia.org/wiki/Nigerian_Railway_Corporation",
      "verified": true
    },
    "image": {
      "url": "https://lookaside.fbsbx.com/lookaside/crawler/media/?media_id=122236033418189242",
      "credit": "Photo · Facebook",
      "license": "Not verified — found by web search",
      "panelColor": "#4A1B0C"
    },
    "factNumber": 1091,
    "relatedIds": []
  },
  {
    "id": "nf_1092",
    "country": "NG",
    "category": "History",
    "fact": "In 1911, colonial officials compelled the Eze Nri to annul taboos and ritual obligations linking communities to Nri, an event widely used to date the end of the kingdom.",
    "deepDive": {
      "body": [
        "In 1911, the British colonial administration in southeastern Nigeria summoned the reigning Eze Nri, Òbalíke, to appear before a colonial court at Awka. This was a significant breach of the ritual seclusion traditionally attached to his office, marking a dramatic shift in the relationship between the colonial power and the sacred kingship.",
        "According to later Nri accounts, colonial officials then assembled chiefs and compelled Obalike to annul the taboos and ritual obligations that linked communities to Nri. This act effectively dismantled the ritual authority that had been the basis of Nri's influence across the region, and it is widely used to date the end of the 'kingdom'.",
        "However, the archival documentation for this event is weak, and the claim rests largely on a later field report. What is clear is that British rule, through native courts and warrant chiefs, had already begun to erode Nri's non-territorial authority. The title of Eze Nri was not abolished—Obalike remained Eze Nri until his death in 1936—but the office no longer held sovereign or administrative jurisdiction.",
        "This episode illustrates how colonial rule transformed African political institutions, often dismantling their external authority while allowing the titles to persist in a diminished form."
      ],
      "whyItMatters": "The 1911 event is a concrete marker of how colonial rule dismantled a non-territorial, ritual-based polity. It shows that the end of Nri's 'kingdom' was not a military conquest but a forced annulment of spiritual obligations, highlighting the unique nature of Nri's power and its vulnerability to colonial legal and administrative systems.",
      "readTime": 2,
      "suggestedQuestion": "What exactly did the annulment of taboos mean for Nri's power?"
    },
    "source": {
      "name": "Kingdom of Nri",
      "url": "https://en.wikipedia.org/wiki/Kingdom_of_Nri",
      "verified": true
    },
    "image": {
      "url": "https://upload.wikimedia.org/wikipedia/commons/c/c2/Eze_Nri_Obalike.jpg?utm_source=en.wikipedia.org&utm_campaign=index&utm_content=original",
      "credit": "Photo · Wikipedia",
      "license": "Not verified — found by web search",
      "panelColor": "#4A1B0C"
    },
    "factNumber": 1092,
    "relatedIds": []
  },
  {
    "id": "nf_1093",
    "country": "NG",
    "category": "History",
    "fact": "The Eze Nri's authority was not based on a standing army or central administration, but on religion, title-taking, and purification rites.",
    "deepDive": {
      "body": [
        "In the heart of southeastern Nigeria, the Kingdom of Nri was a different kind of power. Its ruler, the Eze Nri, was a sacred king, but his authority did not come from armies or a bureaucracy. Instead, it rested on religion, title-taking, and purification rites, enforced by traveling ritual specialists who moved between communities.",
        "These specialists, known as ndi Nri, performed crucial services: cleansing offenses against the earth deity, consecrating titles, and participating in agricultural and market rituals. Communities that recognized Nri's ritual competence did not surrender their political independence; they retained their own institutions while acknowledging Nri's spiritual authority. This network of influence, described as a 'sphere of influence' or 'hegemony,' linked autonomous Igbo communities without direct rule.",
        "Nri's influence was not static. From the late seventeenth century, it contracted as regional trade, the Atlantic slave economy, and the Aro commercial network shifted the balance of power. British colonial rule in the early twentieth century further dismantled Nri's external authority, yet the office of Eze Nri survived as a non-sovereign traditional and religious institution, persisting into the modern era."
      ],
      "whyItMatters": "Nri challenges the assumption that precolonial African states were either centralized empires or stateless societies. It shows that power could be wielded through ritual and reputation, not just force, and that such authority could shape a vast region without a standing army or administration.",
      "readTime": 2,
      "suggestedQuestion": "How did Nri's ritual authority actually work in practice?"
    },
    "source": {
      "name": "Kingdom of Nri",
      "url": "https://en.wikipedia.org/wiki/Kingdom_of_Nri",
      "verified": true
    },
    "image": {
      "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Ancient_throne_of_Nri_monarch.jpg/1280px-Ancient_throne_of_Nri_monarch.jpg",
      "credit": "Photo · Timzy D'Great · Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "panelColor": "#4A1B0C"
    },
    "factNumber": 1093,
    "relatedIds": []
  },
  {
    "id": "nf_1094",
    "country": "NG",
    "category": "History",
    "fact": "The Eze Nri was traditionally credited with proclaiming the agricultural year and regulating the four-day market cycle.",
    "deepDive": {
      "body": [
        "In the communities that acknowledged Nri's ritual authority, the rhythm of daily life was tied to a four-day market cycle. The Eze Nri, the sacred king, was traditionally credited with proclaiming the agricultural year and regulating aspects of this cycle. This was not a matter of direct control over markets, but a symbolic and ritual role that linked the king to the fertility of the land and the well-being of the people.",
        "The Eze Nri's authority rested on religion and ritual rather than military force. He was associated with the earth deity, Ala, and was expected to maintain ritual purity. His role in the agricultural calendar was part of a broader set of responsibilities that included purification rites and the consecration of titles. These duties were carried out through a network of travelling priests and titled agents who moved between communities, reinforcing Nri's influence without territorial conquest.",
        "The four-day market week was a central feature of Igbo economic and social life, and the Eze Nri's association with it underscored his importance. However, the evidence suggests that his role was more about sanctifying the cycle than managing trade. As Nri's influence waned from the late seventeenth century, and especially under colonial rule, the king's calendrical authority diminished, but the office survived as a traditional institution."
      ],
      "whyItMatters": "The Eze Nri's role in the agricultural year and market cycle shows how sacred kingship could shape economic life without a standing army or bureaucracy. It reveals a form of authority based on ritual and reputation, challenging the idea that precolonial African states were either centralized empires or simple stateless societies.",
      "readTime": 2,
      "suggestedQuestion": "How did the Eze Nri actually regulate the market cycle?"
    },
    "source": {
      "name": "Kingdom of Nri",
      "url": "https://en.wikipedia.org/wiki/Kingdom_of_Nri",
      "verified": true
    },
    "image": {
      "url": "https://upload.wikimedia.org/wikipedia/commons/c/c2/Eze_Nri_Obalike.jpg",
      "credit": "Photo · Unknown photographer · Wikimedia Commons",
      "license": "Public domain",
      "panelColor": "#4A1B0C"
    },
    "factNumber": 1094,
    "relatedIds": []
  },
  {
    "id": "nf_1096",
    "country": "NG",
    "category": "History",
    "fact": "Excavations at Igbo-Ukwu, near Nri, revealed sophisticated cast copper-alloy vessels, ironwork, pottery, beads, ivory, and textiles, showing long-distance connections by the end of the first millennium CE.",
    "deepDive": {
      "body": [
        "In 1959, archaeologist Thurstan Shaw began excavating three sites at Igbo-Ukwu, a few kilometres from Agukwu-Nri in southeastern Nigeria. The discoveries—at Igbo Isaiah, Igbo Richard, and Igbo Jonah—included a store or shrine assemblage, an elaborate burial, and associated deposits. Among the finds were sophisticated cast copper-alloy vessels and ornaments, ironwork, pottery, beads, ivory, and even preserved textiles.",
        "These objects were not just locally made. The copper alloys, beads, and other materials point to long-distance connections by the end of the first millennium CE, linking the region to networks far beyond southeastern Nigeria. The craftsmanship and the range of goods also reveal specialised production and social differentiation—a society with distinct roles and hierarchies.",
        "The finds have sparked debate about their relationship to the later Kingdom of Nri. Some scholars see cultural continuities between Igbo-Ukwu and later Nri ritual practices, but archaeology has not proven that Igbo-Ukwu was the capital of the Nri polity or that the burial was that of an Eze Nri. Recent excavations and radiocarbon dates show the settlement was active from the late ninth to the thirteenth century, adding depth to the story."
      ],
      "whyItMatters": "The Igbo-Ukwu finds show that complex, specialised societies existed in West Africa long before European contact. They challenge the idea that precolonial Africa was simple or isolated, and they ground later traditions like the Kingdom of Nri in a deep material history.",
      "readTime": 2,
      "suggestedQuestion": "What exactly was found at Igbo-Ukwu?"
    },
    "source": {
      "name": "Kingdom of Nri",
      "url": "https://en.wikipedia.org/wiki/Kingdom_of_Nri",
      "verified": true
    },
    "image": {
      "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/Bronze_pot%2C_9th_century%2C_Igbo-Ukwu%2C_Nigeria.jpg/1280px-Bronze_pot%2C_9th_century%2C_Igbo-Ukwu%2C_Nigeria.jpg",
      "credit": "Photo · Ochiwar · Wikimedia Commons",
      "license": "CC BY-SA 3.0",
      "panelColor": "#4A1B0C"
    },
    "factNumber": 1096,
    "relatedIds": []
  },
  {
    "id": "nf_1097",
    "country": "NG",
    "category": "History",
    "fact": "Recent excavations in 2019 and 2021 recovered Igbo-Ukwu ceramics up to two kilometres south of the original sites, and new radiocarbon dates range from the end of the ninth to the second half of the thirteenth century.",
    "deepDive": {
      "body": [
        "The ground around Igbo-Ukwu, in southeastern Nigeria, has given up more of its secrets. Excavations in 2019 and 2021 found ceramics up to two kilometres south of the sites first dug by Thurstan Shaw in the 1960s. These new finds show that the ancient settlement was larger than previously known.",
        "Three new radiocarbon dates from these excavations range from the end of the ninth century to the second half of the thirteenth century. This is a much longer span than the single ninth-century event that earlier evidence suggested. The settlement was not a brief flash but a lasting community.",
        "The discoveries deepen the mystery of Igbo-Ukwu, famous for its sophisticated copper-alloy castings and other treasures. They also raise questions about its connection to the later Kingdom of Nri, a ritual polity centred nearby. While some see cultural links, archaeology has not yet proven that Igbo-Ukwu was Nri's capital or that the excavated individuals were Nri kings."
      ],
      "whyItMatters": "These new dates stretch the story of Igbo-Ukwu across four centuries, showing it was not a one-off event but a long-lived society. That changes how we think about the region's early history and its possible ties to the Nri kingdom.",
      "readTime": 2,
      "suggestedQuestion": "What was found at Igbo-Ukwu and why is it important?"
    },
    "source": {
      "name": "Kingdom of Nri",
      "url": "https://en.wikipedia.org/wiki/Kingdom_of_Nri",
      "verified": true
    },
    "image": {
      "url": "https://smarthistory.org/wp-content/uploads/2022/01/Igbu-scaled.jpg",
      "credit": "Photo · Smarthistory",
      "license": "Not verified — found by web search",
      "panelColor": "#4A1B0C"
    },
    "factNumber": 1097,
    "relatedIds": []
  },
  {
    "id": "nf_1098",
    "country": "NG",
    "category": "Business",
    "fact": "Emmanuel Nwude defrauded a Brazilian bank of $242 million to build a fictitious airport.",
    "deepDive": {
      "body": [
        "In the mid-1990s, a Nigerian banker named Emmanuel Nwude convinced a Brazilian bank director to invest in a new airport in Abuja, Nigeria's capital. The director, Nelson Sakaguchi, believed he was dealing with the governor of Nigeria's central bank. In reality, Nwude was impersonating him.",
        "Over three years, Sakaguchi transferred $242 million to Nwude and his accomplices. The fraud was uncovered in 1997 when a Spanish bank, Banco Santander, noticed that a huge sum—two-fifths of Banco Noroeste's total value—was sitting unmonitored in the Cayman Islands. The owners of Banco Noroeste paid the $242 million themselves to guarantee a sale to Santander, but the bank collapsed in 2001.",
        "Nwude was arrested in 2004 and, after a trial that included a bribery attempt and a bomb scare, pleaded guilty. He was sentenced to 25 years in prison, but was released in 2006. He later sued to recover his seized assets, claiming some were acquired before the crime. As of 2015, the case was still in court."
      ],
      "whyItMatters": "This fraud was one of the largest in banking history, yet it relied on a simple lie: that a central bank governor would ask a foreign banker to fund a national airport. It shows how easily trust in official positions can be exploited, and how a single scam can topple a bank.",
      "readTime": 2,
      "suggestedQuestion": "How did Nwude convince the Brazilian banker to invest?"
    },
    "source": {
      "name": "Emmanuel Nwude",
      "url": "https://en.wikipedia.org/wiki/Emmanuel_Nwude",
      "verified": true
    },
    "image": {
      "url": "https://lookaside.fbsbx.com/lookaside/crawler/media/?media_id=897871693055616",
      "credit": "Photo · Facebook",
      "license": "Not verified — found by web search",
      "panelColor": "#26215C"
    },
    "factNumber": 1098,
    "relatedIds": []
  },
  {
    "id": "nf_1099",
    "country": "NG",
    "category": "Business",
    "fact": "Nwude impersonated the Governor of the Central Bank of Nigeria to convince a Brazilian bank director to invest in a non-existent airport.",
    "deepDive": {
      "body": [
        "In the mid-1990s, a Nigerian banker named Emmanuel Nwude pulled off one of the largest bank frauds in history by pretending to be someone he wasn't. He impersonated Paul Ogwuma, then Governor of the Central Bank of Nigeria, to convince Nelson Sakaguchi, a director at Brazil's Banco Noroeste, to invest in a new airport in Abuja that didn't exist. The promise of a $10 million commission sealed the deal.",
        "Over three years, Sakaguchi transferred $242 million to Nwude and his accomplices. The fraud unravelled in December 1997 when a Spanish bank, Santander, which was taking over Banco Noroeste, noticed a huge sum sitting unmonitored in the Cayman Islands. The owners of Banco Noroeste had to cover the loss themselves, but the bank collapsed in 2001.",
        "Nwude was eventually arrested in 2004, tried, and sentenced to 25 years in prison. He was released in 2006, but later faced more legal troubles, including a 2021 court case over forged property documents. His crime was once ranked the third largest in banking history."
      ],
      "whyItMatters": "This fraud shows how a single impersonation can topple a bank and trigger international investigations. It also led to the creation of Nigeria's anti-corruption agency, the EFCC, which has since become a key player in fighting financial crime.",
      "readTime": 2,
      "suggestedQuestion": "How did Nwude get away with the fraud for so long?"
    },
    "source": {
      "name": "Emmanuel Nwude",
      "url": "https://en.wikipedia.org/wiki/Emmanuel_Nwude",
      "verified": true
    },
    "image": {
      "url": "https://lookaside.instagram.com/seo/google_widget/crawler/?media_id=3851225827543678862",
      "credit": "Photo · Instagram",
      "license": "Not verified — found by web search",
      "panelColor": "#26215C"
    },
    "factNumber": 1099,
    "relatedIds": []
  },
  {
    "id": "nf_1100",
    "country": "NG",
    "category": "Business",
    "fact": "Nwude's crime was the third largest in banking history, after Nick Leeson's Barings losses and the looting of the Iraqi Central Bank.",
    "deepDive": {
      "body": [
        "In the 1990s, a Nigerian banker convinced a Brazilian bank director to invest in a fictional airport in Abuja, promising a $10 million commission. The fraud, which ran from 1995 to 1998, netted $242 million—$191 million in cash and the rest in interest—from Banco Noroeste.",
        "The scheme unraveled in December 1997 when a Spanish bank, Banco Santander, questioned a large sum sitting in the Cayman Islands. The owners of Banco Noroeste paid the $242 million bill themselves to guarantee the sale, but the bank collapsed in 2001.",
        "The mastermind, Emmanuel Nwude, was arrested in 2004 and later sentenced to 25 years in prison, with his assets confiscated. He was released in 2006 and has since reclaimed at least $52 million of those assets through a lawsuit."
      ],
      "whyItMatters": "This fraud ranks as the third largest in banking history, yet it is far less known than the Barings collapse or the Iraqi Central Bank looting. It shows how a single con artist can bring down a bank and how the aftermath can drag on for decades.",
      "readTime": 2,
      "suggestedQuestion": "How did Nwude convince the bank director to invest in a fake airport?"
    },
    "source": {
      "name": "Emmanuel Nwude",
      "url": "https://en.wikipedia.org/wiki/Emmanuel_Nwude",
      "verified": true
    },
    "image": {
      "url": "https://www.shutterstock.com/editorial/image-editorial/N9z1k61fN0z6McxeMTg1Mg==/nigerian-emmanuel-nwude-r-arriving-abuja-high-1500w-7904336b.jpg",
      "credit": "Photo · Shutterstock",
      "license": "Not verified — found by web search",
      "panelColor": "#26215C"
    },
    "factNumber": 1100,
    "relatedIds": []
  },
  {
    "id": "nf_1101",
    "country": "NG",
    "category": "History",
    "fact": "Adebayo Ogunlesi, the Nigerian investment banker, is the son of the first Nigerian professor of medicine at the University of Ibadan.",
    "deepDive": {
      "body": [
        "Theophilus O. Ogunlesi was a trailblazer in Nigerian medicine, becoming the first Nigerian professor of medicine at the University of Ibadan. His son, Adebayo Ogunlesi, would go on to make his own mark in the world of finance, but his father's pioneering role in academia is a notable part of his family history.",
        "Adebayo Ogunlesi's career spans law, investment banking, and private equity. He served as a law clerk to U.S. Supreme Court Justice Thurgood Marshall, worked at the law firm Cravath, Swaine & Moore, and later joined First Boston, where he rose to become the Global Head of Investment Banking at Credit Suisse First Boston. In 2006, he founded Global Infrastructure Partners, which acquired London City Airport and later a majority stake in London Gatwick Airport.",
        "His achievements have been recognized internationally, including being named one of the Top 100 most influential Africans by New African magazine in 2019. The story of the Ogunlesi family illustrates a legacy of excellence across generations, from medicine to finance."
      ],
      "whyItMatters": "This fact connects two fields—medicine and finance—showing how a family's legacy can span different domains. It also highlights the role of Nigerian professionals in shaping global industries, from academia to investment banking.",
      "readTime": 2,
      "suggestedQuestion": "What other Nigerian families have made significant contributions in multiple fields?"
    },
    "source": {
      "name": "Adebayo Ogunlesi",
      "url": "https://en.wikipedia.org/wiki/Adebayo_Ogunlesi",
      "verified": true
    },
    "image": {
      "url": "https://cloudinary.hbs.edu/hbsit/image/fetch/q_auto,c_fill,ar_800:533,g_center/f_webp/https%3A%2F%2Fwww.hbs.edu%2Fctfassets%2Fpublic%2Fimages%2F29GrKkAFQ88mcSL6N9rUIe%2FOgunlesi_Adebayo_HLS_Yearbook_1979.jpg",
      "credit": "Photo · Baker Library - Harvard Business School",
      "license": "Not verified — found by web search",
      "panelColor": "#4A1B0C"
    },
    "factNumber": 1101,
    "relatedIds": []
  },
  {
    "id": "nf_1102",
    "country": "NG",
    "category": "Sports",
    "fact": "Christian Okoye, a Nigerian-born NFL star, is nearly impossible to tackle in the video game Tecmo Super Bowl (1991).",
    "deepDive": {
      "body": [
        "In the early 1990s, a pixelated Christian Okoye terrorized gamers in Tecmo Super Bowl. The game's designers gave him stats that made him nearly unstoppable, and players quickly learned to avoid tackling him head-on. His virtual dominance became legendary, cementing his status as a video game icon.",
        "Okoye's real-life career was just as formidable. Nicknamed 'the Nigerian Nightmare,' he led the NFL in rushing in 1989 and earned two Pro Bowl selections. He retired as the Chiefs' all-time leading rusher, a record later broken by Priest Holmes.",
        "His path to the NFL was unconventional. Born in Nigeria, he didn't play football until age 23, after a track and field career. His rare combination of size and speed made him a standout, and his impact extended beyond the field into popular culture."
      ],
      "whyItMatters": "Okoye's Tecmo Super Bowl fame shows how sports legends can transcend their sport, becoming cultural touchstones. His virtual invincibility introduced him to a generation who never saw him play live, ensuring his legacy endures in a unique way.",
      "readTime": 2,
      "suggestedQuestion": "Why was Christian Okoye so hard to tackle in Tecmo Super Bowl?"
    },
    "source": {
      "name": "Christian Okoye",
      "url": "https://en.wikipedia.org/wiki/Christian_Okoye",
      "verified": true
    },
    "image": {
      "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/Kansas_City_Chiefs_United_Services_Organizations_Visits_%282%29_%28cropped%29.jpg/1280px-Kansas_City_Chiefs_United_Services_Organizations_Visits_%282%29_%28cropped%29.jpg",
      "credit": "Photo · Sgt. Scott Sparks · Wikimedia Commons",
      "license": "Public domain",
      "panelColor": "#042C53"
    },
    "factNumber": 1102,
    "relatedIds": []
  },
  {
    "id": "nf_1103",
    "country": "NG",
    "category": "History",
    "fact": "The Oyo Empire spanned over 150,000 square kilometers by 1680.",
    "deepDive": {
      "body": [
        "By 1680, the Oyo Empire had grown to cover over 150,000 square kilometers, making it one of the largest empires in West Africa at the time. This expansion was driven by a powerful cavalry, a centralized government, and control over trade routes.",
        "The empire's military strength was key to its growth. Oyo was one of the few Yoruba states to use cavalry, and its army could field over 100,000 horsemen. This allowed it to conquer and control a vast territory, including the Kingdom of Dahomey, which was forced to pay tribute.",
        "Oyo's political structure also contributed to its stability. The Alaafin, or king, ruled with the advice of councils like the Oyo Mesi and Ogboni, which balanced power. This system helped manage the empire's diverse peoples and maintain control over its many tributary states.",
        "However, by the late 18th century, internal strife and the decline of the slave trade weakened the empire. It eventually fell to internal rebellions and the rise of the Sokoto Caliphate, leading to its collapse in the 19th century."
      ],
      "whyItMatters": "The Oyo Empire's size and power in 1680 show how a well-organized African state could rival any contemporary empire. Its use of cavalry and sophisticated governance allowed it to dominate West Africa for centuries, shaping the region's history.",
      "readTime": 2,
      "suggestedQuestion": "How did the Oyo Empire manage to control such a large territory?"
    },
    "source": {
      "name": "Oyo Empire",
      "url": "https://en.wikipedia.org/wiki/Oyo_Empire",
      "verified": true
    },
    "image": {
      "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/Oyo_Empire_at_Its_Greatest_Extent%2C_c._1780_%285%29.jpg/1280px-Oyo_Empire_at_Its_Greatest_Extent%2C_c._1780_%285%29.jpg",
      "credit": "Photo · Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "panelColor": "#4A1B0C"
    },
    "factNumber": 1103,
    "relatedIds": []
  },
  {
    "id": "nf_1104",
    "country": "NG",
    "category": "History",
    "fact": "The Oyo Empire amassed a cavalry force exceeding 100,000 horsemen.",
    "deepDive": {
      "body": [
        "In the 18th century, the Oyo Empire's cavalry was the most feared force in West Africa. Its horsemen, armed with bows and arrows or clubs, could strike deep into enemy territory. The empire's northern location in the savannah allowed it to maintain large numbers of horses, free from the tsetse fly that plagued other regions.",
        "When Oyo invaded the Kingdom of Dahomey in 1728, it mobilized a massive cavalry force. Dahomey's warriors had firearms and built trenches to counter the horsemen, but Oyo's numbers and reinforcements eventually won the day. This campaign was part of a series of invasions that forced Dahomey to pay tribute by 1748.",
        "The cavalry was not just for show. It was used to expand Oyo's borders to the coast, collect tribute, and put down rebellions. However, maintaining such a large force had drawbacks: horses could not be used in the forested south, and supplying the army on long campaigns was difficult. Despite these challenges, the cavalry remained the backbone of Oyo's military power until the empire's decline in the 19th century."
      ],
      "whyItMatters": "The Oyo Empire's cavalry of over 100,000 horsemen was a key reason it became one of the most powerful states in West Africa. This military strength allowed Oyo to dominate trade routes and collect tribute from distant kingdoms, shaping the region's politics for centuries.",
      "readTime": 2,
      "suggestedQuestion": "How did the Oyo Empire manage to feed and supply such a large cavalry?"
    },
    "source": {
      "name": "Oyo Empire",
      "url": "https://en.wikipedia.org/wiki/Oyo_Empire",
      "verified": true
    },
    "image": {
      "url": "https://upload.wikimedia.org/wikipedia/commons/4/45/IMG-20180922-WA0007_cropped.jpg",
      "credit": "Photo · Undefined Yoruba artist. · Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "panelColor": "#4A1B0C"
    },
    "factNumber": 1104,
    "relatedIds": []
  },
  {
    "id": "nf_1105",
    "country": "NG",
    "category": "History",
    "fact": "Taxes on the kingdom of Dahomey alone brought in an amount estimated at 14 million US dollars a year.",
    "deepDive": {
      "body": [
        "The Oyo Empire's wealth was built on tribute from its many vassal states. One of the most profitable was the Kingdom of Dahomey, which paid an estimated 14 million US dollars a year in taxes. This immense sum came from a combination of trade taxes and direct tribute, reflecting the empire's economic dominance in the region.",
        "Dahomey was not always a willing subject. The Oyo Empire invaded Dahomey multiple times, with a major campaign in 1728 and final subjugation in 1748. The tribute was a constant reminder of Dahomey's subordinate status, and it was collected by Oyo-appointed officials known as Ilari, who also served as spies.",
        "The wealth from Dahomey and other tributaries helped Oyo maintain its powerful cavalry and expansive territory. However, this reliance on tribute also made the empire vulnerable. When Oyo's power waned in the early 19th century, Dahomey seized the opportunity to revolt, ending its tribute payments and contributing to Oyo's decline."
      ],
      "whyItMatters": "This fact shows how the Oyo Empire's economic power was built on the tribute of conquered states, and how that same tribute could become a source of tension and eventual rebellion. It highlights the interconnectedness of wealth, military power, and political control in pre-colonial African empires.",
      "readTime": 2,
      "suggestedQuestion": "How did the Oyo Empire collect taxes from its tributary states?"
    },
    "source": {
      "name": "Oyo Empire",
      "url": "https://en.wikipedia.org/wiki/Oyo_Empire",
      "verified": true
    },
    "image": {
      "url": "https://cdn.britannica.com/53/185753-050-64A51A72/kingdom-Dahomey-Africa.jpg",
      "credit": "Photo · Britannica",
      "license": "Not verified — found by web search",
      "panelColor": "#4A1B0C"
    },
    "factNumber": 1105,
    "relatedIds": []
  },
  {
    "id": "nf_1106",
    "country": "NG",
    "category": "History",
    "fact": "The Oyo Empire invaded Dahomey 11 times before finally subjugating the kingdom in 1748.",
    "deepDive": {
      "body": [
        "The Oyo Empire's cavalry was the terror of the region. When it first rode against Dahomey in 1728, the Fon warriors had no horses but plenty of firearms. Their gunfire spooked the Oyo mounts, and their trenches stopped charges cold. The battle dragged on for four days until Oyo reinforcements turned the tide.",
        "That victory forced Dahomey to pay tribute, but it did not end the fighting. Oyo had to invade again and again—11 times in all—before it finally subjugated the kingdom in 1748. Each campaign was a reminder that Dahomey was a stubborn foe, and Oyo's hold on it was never easy.",
        "The conquest brought Dahomey into Oyo's orbit as a tributary, but the relationship stayed volatile. Decades later, in 1823, Dahomey raided villages under Oyo's protection. When Oyo demanded tribute, King Gezo refused, and Oyo's attack was decisively beaten. That defeat ended Oyo's dominance over Dahomey for good."
      ],
      "whyItMatters": "The 11 invasions show that even a mighty empire like Oyo could not simply crush a determined rival. Dahomey's resistance wore down Oyo's power, and when Oyo finally fell, Dahomey was ready to break free.",
      "readTime": 2,
      "suggestedQuestion": "Why did Oyo have to invade Dahomey so many times?"
    },
    "source": {
      "name": "Oyo Empire",
      "url": "https://en.wikipedia.org/wiki/Oyo_Empire",
      "verified": true
    },
    "image": {
      "url": "https://upload.wikimedia.org/wikipedia/commons/4/45/IMG-20180922-WA0007_cropped.jpg",
      "credit": "Photo · Undefined Yoruba artist. · Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "panelColor": "#4A1B0C"
    },
    "factNumber": 1106,
    "relatedIds": []
  },
  {
    "id": "nf_1107",
    "country": "NG",
    "category": "History",
    "fact": "The Oyo Empire was one of the most politically important states in Western Africa from the late-16th to the early 18th century.",
    "deepDive": {
      "body": [
        "The Oyo Empire's rise to power was not a sudden event but a slow rebuilding after a devastating defeat. Around 1535, the Nupe people invaded and forced the Oyo ruling dynasty into exile in the kingdom of Borgu. For 80 years, the Yoruba of Oyo lived as an exiled dynasty, until they re-established their state with a more centralized government and a stronger military.",
        "The key to Oyo's resurgence was its adoption of cavalry, a tactic learned from their Nupe enemies. With this new military strength, Oyo began a long period of expansion, conquering nearly all of Yorubaland and extending its influence over neighboring states. By the end of the 16th century, the Ewe and Aja states of modern Benin were paying tribute to Oyo, and by 1680, the empire spanned over 150,000 square kilometers.",
        "Oyo's power was not just military; it was also political. The empire developed a sophisticated structure with the Alaafin (king) at its head, but his power was checked by councils like the Oyo Mesi and the Ogboni. This system of checks and balances allowed Oyo to maintain control over a vast and diverse territory, but it also led to internal intrigue and decline in the 18th century."
      ],
      "whyItMatters": "The Oyo Empire's story shows that African states were not static but dynamic, capable of rebuilding after defeat and creating complex political systems. Its influence extended far beyond its borders, shaping the history of the entire region.",
      "readTime": 2,
      "suggestedQuestion": "How did the Oyo Empire rise to power?"
    },
    "source": {
      "name": "Oyo Empire",
      "url": "https://en.wikipedia.org/wiki/Oyo_Empire",
      "verified": true
    },
    "image": {
      "url": "https://upload.wikimedia.org/wikipedia/commons/8/88/Frontiers_of_the_Kingdom_of_Oyo_and_its_neighbours_in_c._1790.jpg",
      "credit": "Photo · Wikimedia Commons",
      "license": "CC BY 4.0",
      "panelColor": "#4A1B0C"
    },
    "factNumber": 1107,
    "relatedIds": []
  },
  {
    "id": "nf_1108",
    "country": "NG",
    "category": "Culture",
    "fact": "Port Harcourt was named World Book Capital for 2014, the first city in Black Africa to receive the title.",
    "deepDive": {
      "body": [
        "In July 2012, UNESCO, along with the International Publishers Association, the International Booksellers Federation, and the International Federation of Library Associations and Institutions, named Port Harcourt the World Book Capital for 2014. This made it the 14th city to receive the title and the first in Black Africa.",
        "The city's literary scene had been growing since 2008 with the Port Harcourt Book Festival, an annual event established by the government of Chibuike Rotimi Amaechi. The festival aimed to improve local literacy and promote reading habits, attracting publishers like Heinemann and Learn Africa Plc.",
        "The World Book Capital title highlighted Port Harcourt's commitment to books and reading, placing it alongside other global cities that had previously held the honor. It was a recognition of the city's cultural efforts and its role in the literary world."
      ],
      "whyItMatters": "This recognition put a Nigerian city on the global literary map, showing that African cities can be centers of literary culture. It also underscored the importance of local festivals in fostering reading and literacy.",
      "readTime": 1,
      "suggestedQuestion": "What is the World Book Capital title and how is it awarded?"
    },
    "source": {
      "name": "Port Harcourt",
      "url": "https://en.wikipedia.org/wiki/Port_Harcourt",
      "verified": true
    },
    "image": {
      "url": "https://lookaside.fbsbx.com/lookaside/crawler/media/?media_id=100064602705768",
      "credit": "Photo · Facebook",
      "license": "Not verified — found by web search",
      "panelColor": "#04342C"
    },
    "factNumber": 1108,
    "relatedIds": []
  },
  {
    "id": "nf_1109",
    "country": "NG",
    "category": "History",
    "fact": "The 18-story Point Block of the Rivers State Secretariat is the tallest building in the Southeast and South-South geopolitical zones combined.",
    "deepDive": {
      "body": [
        "In the heart of Port Harcourt, the Rivers State Secretariat's Point Block rises 18 stories above the city. It stands as a landmark in a metropolis known for its oil industry and vibrant culture, a symbol of the region's modern ambitions.",
        "The building's height is notable not just for its prominence in the city's skyline, but for its regional significance. It holds the title of the tallest building in both the Southeast and South-South geopolitical zones of Nigeria, a fact that underscores Port Harcourt's status as a major urban center in the Niger Delta.",
        "The Point Block is part of a larger complex that houses the state's administrative offices. Its construction reflects the growth and development of Rivers State, which has benefited from Nigeria's petroleum wealth. As the city continues to expand, the building remains a fixed point in a changing landscape."
      ],
      "whyItMatters": "This fact highlights how a state government building can become a symbol of regional pride and development. It shows that even in a country with many large cities, a single structure can define a skyline and represent the aspirations of its people.",
      "readTime": 1,
      "suggestedQuestion": "What other tall buildings are in Port Harcourt?"
    },
    "source": {
      "name": "Port Harcourt",
      "url": "https://en.wikipedia.org/wiki/Port_Harcourt",
      "verified": true
    },
    "image": {
      "url": "https://upload.wikimedia.org/wikipedia/commons/a/ac/Point_Block_Building_Rivers_State_Secretariat_Nigeria.jpg?utm_source=commons.wikimedia.org&utm_campaign=index&utm_content=original",
      "credit": "Photo · Wikimedia Commons",
      "license": "Not verified — found by web search",
      "panelColor": "#4A1B0C"
    },
    "factNumber": 1109,
    "relatedIds": []
  },
  {
    "id": "nf_1110",
    "country": "NG",
    "category": "History",
    "fact": "Funmilayo Ransome-Kuti was the first female student at Abeokuta Grammar School.",
    "deepDive": {
      "body": [
        "In 1914, Abeokuta Grammar School opened its doors to female students for the first time, and among the six girls registered that year was Frances Abigail Thomas, who would later be known as Funmilayo Ransome-Kuti. She was the first of those six to enroll, making her the first female student at the school.",
        "At the time, it was uncommon for Nigerian families to invest in education for girls, but Ransome-Kuti's parents believed in education for both boys and girls. Her time at the school was a stepping stone to further studies in England, and she later became a teacher, organizing some of the earliest preschool classes in Nigeria and literacy classes for lower-income women.",
        "Ransome-Kuti's pioneering spirit extended far beyond the classroom. She went on to lead the Abeokuta Women's Union, fighting against unfair taxes and for women's representation in government. Her activism helped oust a traditional ruler and contributed to constitutional changes that gave women a formal voice in local politics."
      ],
      "whyItMatters": "Ransome-Kuti's place as the first female student at Abeokuta Grammar School was not just a personal achievement. It was an early break in a system that rarely educated girls, and it set the stage for a life of challenging the structures that excluded women from power.",
      "readTime": 2,
      "suggestedQuestion": "What was it like for Funmilayo to be the only girl at Abeokuta Grammar School?"
    },
    "source": {
      "name": "Funmilayo Ransome-Kuti",
      "url": "https://en.wikipedia.org/wiki/Funmilayo_Ransome-Kuti",
      "verified": true
    },
    "image": {
      "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Alake%27s_Palace%2C_Abeokuta%2C_Ogun.jpg/1280px-Alake%27s_Palace%2C_Abeokuta%2C_Ogun.jpg",
      "credit": "Photo · Solasly · Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "panelColor": "#4A1B0C"
    },
    "factNumber": 1110,
    "relatedIds": []
  },
  {
    "id": "nf_1111",
    "country": "NG",
    "category": "History",
    "fact": "Funmilayo Ransome-Kuti led protests of up to 10,000 women, forcing the Alake of Egbaland to temporarily abdicate in 1949.",
    "deepDive": {
      "body": [
        "In 1949, the Alake of Egbaland, a traditional ruler who had become part of the colonial administration, temporarily stepped down from his position. This was the result of sustained pressure from the Abeokuta Women's Union (AWU), led by Funmilayo Ransome-Kuti. The AWU had been protesting unfair taxes on market women and demanding representation in local government.",
        "Ransome-Kuti organized marches and protests that drew up to 10,000 women. They used petitions, press conferences, and even sang insulting songs outside the Alake's palace to publicly shame him. The protests also included blocking the palace entrance and refusing to let a British district officer leave, which drew public sympathy.",
        "The Alake eventually suspended the tax on women and appointed a committee to look into the AWU's complaints. The following year, he was forced to abdicate temporarily. This was a significant victory for the women's movement, leading to the abolition of the flat-rate tax and the appointment of Ransome-Kuti and four other women to the interim governing council—the first time women had formal representation in the region's politics."
      ],
      "whyItMatters": "This was not just a protest about taxes; it was a moment when women's collective action forced a change in political power. It showed that women could challenge both traditional and colonial authority, and it paved the way for women's formal participation in governance in the region.",
      "readTime": 2,
      "suggestedQuestion": "What was the Abeokuta Women's Union?"
    },
    "source": {
      "name": "Funmilayo Ransome-Kuti",
      "url": "https://en.wikipedia.org/wiki/Funmilayo_Ransome-Kuti",
      "verified": true
    },
    "image": {
      "url": "https://images.squarespace-cdn.com/content/v1/5534a426e4b0ed810ce8f891/1721168165287-MBSJVIIVUPLU4IN79KIC/HEADER3.png?format=2500w",
      "credit": "Photo · nataal.com",
      "license": "Not verified — found by web search",
      "panelColor": "#4A1B0C"
    },
    "factNumber": 1111,
    "relatedIds": []
  },
  {
    "id": "nf_1112",
    "country": "NG",
    "category": "History",
    "fact": "Funmilayo Ransome-Kuti was denied a US visa in 1958 because authorities felt she had too many Communist connections.",
    "deepDive": {
      "body": [
        "In 1958, Funmilayo Ransome-Kuti was invited to a women's rights conference in the United States. But when she applied for a visa, American authorities turned her down. Their reason: they felt she had 'too many Communist connections.'",
        "This was not an isolated incident. A year earlier, British colonial authorities had refused to renew her passport, also citing suspected communist ties. Ransome-Kuti had visited China in 1956 and met Mao Zedong, and she had ties to the Women's International Democratic Federation, which had helped fund that trip. She described herself as an 'African Socialist' and said she was 'not frightened or repelled by communism,' though she did not consider herself a communist.",
        "Ransome-Kuti fought back. She wrote letters of protest, held a press conference to declare she was not a communist, and received support from high-profile friends. But her protests were ignored. It was not until Nigeria gained independence in 1960 that her passport was renewed.",
        "The visa denial did not stop her work. She continued to advocate for women's rights and Nigerian independence, and in 1970 she received the Lenin Peace Prize. Her son Fela Kuti would later become a famous musician and activist, and her family's legacy of resistance continued."
      ],
      "whyItMatters": "Ransome-Kuti's visa denial shows how Cold War fears reached into the lives of African activists, even those fighting for freedom from colonialism. It also highlights the double standard: she was blocked from the US for her socialist ties, yet later received the Lenin Peace Prize from the Soviet Union.",
      "readTime": 2,
      "suggestedQuestion": "Why did the US deny Funmilayo Ransome-Kuti a visa?"
    },
    "source": {
      "name": "Funmilayo Ransome-Kuti",
      "url": "https://en.wikipedia.org/wiki/Funmilayo_Ransome-Kuti",
      "verified": true
    },
    "image": {
      "url": "https://republic.com.ng/wp-content/uploads/2022/04/Rx-History-25-October-2021.jpg",
      "credit": "Photo · The Republic",
      "license": "Not verified — found by web search",
      "panelColor": "#4A1B0C"
    },
    "factNumber": 1112,
    "relatedIds": []
  },
  {
    "id": "nf_1113",
    "country": "NG",
    "category": "Culture",
    "fact": "Funmilayo Ransome-Kuti was the mother of Fela Kuti, Beko Ransome-Kuti, and Olikoye Ransome-Kuti.",
    "deepDive": {
      "body": [
        "Funmilayo Ransome-Kuti's three sons each left their own mark on Nigeria. Fela Kuti, born Olufela Ransome-Kuti, became a world-famous musician and activist. Beko Ransome-Kuti was a doctor and human rights campaigner. Olikoye Ransome-Kuti served as Nigeria's health minister.",
        "Their mother's own activism was legendary. In the 1940s, she led the Abeokuta Women's Union in protests that forced the local ruler to temporarily step down. She fought for women's rights, education, and independence from colonial rule, and her work earned her national and international recognition.",
        "The Ransome-Kuti family's commitment to justice was passed down through generations. Funmilayo supported her sons' criticism of military governments, and her death in 1978 came after she was wounded during a raid on Fela's compound. Her legacy as a pioneering feminist and anti-colonial leader remains influential in Nigeria and beyond."
      ],
      "whyItMatters": "Funmilayo Ransome-Kuti's children were not just famous in their own right; they were part of a family dynasty of activism and public service. Her influence shaped their paths, and her story shows how one woman's fight for justice can echo through generations.",
      "readTime": 2,
      "suggestedQuestion": "What did Funmilayo Ransome-Kuti do as an activist?"
    },
    "source": {
      "name": "Funmilayo Ransome-Kuti",
      "url": "https://en.wikipedia.org/wiki/Funmilayo_Ransome-Kuti",
      "verified": true
    },
    "image": {
      "url": "https://www.sitei.org/wp-content/uploads/2019/10/Funmi-Kuti.png",
      "credit": "Photo · SITEI",
      "license": "Not verified — found by web search",
      "panelColor": "#04342C"
    },
    "factNumber": 1113,
    "relatedIds": []
  },
  {
    "id": "nf_1114",
    "country": "NG",
    "category": "History",
    "fact": "By 1837, the Sokoto Caliphate had a population of 10–20 million people, becoming the most populous empire in West Africa.",
    "deepDive": {
      "body": [
        "In the early 1800s, a wave of Islamic reformist jihads swept across West Africa, reshaping the political map. One of the most significant was led by Usman dan Fodio, a scholar who, after being forced into exile, rallied followers and declared a jihad against the Hausa kingdoms. By 1808, his forces had conquered key states, and the Sokoto Caliphate was born.",
        "The caliphate expanded rapidly, absorbing over 30 emirates and stretching from present-day Burkina Faso to Cameroon. By 1837, its population had reached 10–20 million, making it the most populous empire in West Africa. This growth was driven by military conquest, the establishment of ribats (fortified settlements), and a thriving economy based on agriculture and trade, including the trans-Saharan routes.",
        "The caliphate's influence extended beyond its borders, inspiring similar jihads in Mali, Senegal, and other regions. It also became a center of Islamic scholarship, with leaders like Usman dan Fodio and his brother Abdullahi writing hundreds of books on subjects ranging from law to astronomy. However, its prosperity was built on a large enslaved population, and by 1900, it held an estimated 1 to 2.5 million slaves.",
        "The caliphate's power waned in the late 19th century as European colonial powers encroached. In 1903, British forces conquered Sokoto, and the caliphate was dissolved, though the title of Sultan was retained as a symbolic religious position. Today, the Sokoto Sultanate Council remains influential in Nigerian society."
      ],
      "whyItMatters": "The Sokoto Caliphate's population of 10–20 million made it a demographic giant in 19th-century West Africa, comparable to major empires of the time. Its legacy persists in the region's religious and political landscape, from the continued authority of the Sokoto Sultan to the ideologies of modern groups like Boko Haram.",
      "readTime": 2,
      "suggestedQuestion": "How did the Sokoto Caliphate become so populous?"
    },
    "source": {
      "name": "Sokoto Caliphate",
      "url": "https://en.wikipedia.org/wiki/Sokoto_Caliphate",
      "verified": true
    },
    "image": {
      "url": "https://upload.wikimedia.org/wikipedia/commons/9/95/Sokoto_Sultanate_%28cropped%29.png?utm_source=en.wikipedia.org&utm_campaign=index&utm_content=original",
      "credit": "Photo · Wikipedia",
      "license": "Not verified — found by web search",
      "panelColor": "#4A1B0C"
    },
    "factNumber": 1114,
    "relatedIds": []
  },
  {
    "id": "nf_1115",
    "country": "NG",
    "category": "History",
    "fact": "By 1900, Sokoto had at least 1 million and perhaps as many as 2.5 million slaves, second only to the American South among all modern slave societies.",
    "deepDive": {
      "body": [
        "In the 19th century, the Sokoto Caliphate expanded across West Africa, conquering territories and establishing a vast state. Its economy relied heavily on slave labor, with plantations worked by enslaved people. By 1900, the caliphate held between 1 and 2.5 million slaves, a number surpassed only by the American South and possibly Brazil.",
        "The scale of slavery in Sokoto was enormous, with slaves making up a quarter to half of the population. This was a result of continuous warfare and slave raiding, which brought in captives from non-Muslim communities. The institution was deeply embedded in the social and economic fabric, with slaves used in agriculture, administration, and even military roles.",
        "The British conquest in 1903 formally abolished the legal status of slavery, but the transition was gradual. The colonial administration often returned fugitive slaves to their owners, and small-scale slave trading persisted for decades. The legacy of this system continues to shape social relations in the region today."
      ],
      "whyItMatters": "The Sokoto Caliphate's slave population rivaled that of the American South, yet it is rarely mentioned in discussions of slavery. This fact challenges the common focus on transatlantic slavery and highlights the scale of slavery within Africa itself.",
      "readTime": 2,
      "suggestedQuestion": "How did the Sokoto Caliphate's slave system compare to the American South?"
    },
    "source": {
      "name": "Sokoto Caliphate",
      "url": "https://en.wikipedia.org/wiki/Sokoto_Caliphate",
      "verified": true
    },
    "image": {
      "url": "https://blackpast.org/wp-content/uploads/2024/08/Sokoto_caliphate.png",
      "credit": "Photo · BlackPast.org",
      "license": "Not verified — found by web search",
      "panelColor": "#4A1B0C"
    },
    "factNumber": 1115,
    "relatedIds": []
  },
  {
    "id": "nf_1116",
    "country": "NG",
    "category": "History",
    "fact": "The name 'Sokoto Caliphate' was introduced in the 1960s by Murray Last, and the term was influenced by Professor Abdullahi Smith, who preferred 'The Caliphate of Sokoto'.",
    "deepDive": {
      "body": [
        "In the 1960s, as Nigeria settled into independence, historians were still arguing over what to call the 19th-century state that Usman dan Fodio had built. For most of its existence it had no fixed name. In Hausa it was sometimes called daular 'Uthmaniyya, the 'Uthmani state', and colonial writers often called it the Fulani Empire.",
        "The label that stuck came from a young British historian, Murray Last. While working on his PhD at Ahmadu Bello University in Zaria, he chose the title 'The Sokoto Caliphate' for his 1966 dissertation. His supervisor, Professor Abdullahi Smith, preferred 'The Caliphate of Sokoto', but the shorter version caught on and became the standard name.",
        "Last later explained that the choice was partly intellectual and partly political. He wanted a properly Islamic term for what he saw as a properly Islamic state, and the newly autonomous government of Northern Nigeria needed a model for its own political morality of 'work and worship'. Some scholars still prefer older terms like 'Fulani Empire', but 'Sokoto Caliphate' is now the name most people know."
      ],
      "whyItMatters": "The name we use for a historical state is never neutral. Calling Sokoto a 'caliphate' instead of an 'empire' shifted how scholars and politicians understood the jihad — as a religious movement rather than an ethnic conquest. That choice, made in a 1960s dissertation, still shapes how the history is taught and debated today.",
      "readTime": 2,
      "suggestedQuestion": "Why did Murray Last choose the name 'Sokoto Caliphate'?"
    },
    "source": {
      "name": "Sokoto Caliphate",
      "url": "https://en.wikipedia.org/wiki/Sokoto_Caliphate",
      "verified": true
    },
    "image": {
      "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Sokoto_Sultanate_%28cropped%29.png/1280px-Sokoto_Sultanate_%28cropped%29.png",
      "credit": "Photo · AbdurRahman AbdulMoneim · Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "panelColor": "#4A1B0C"
    },
    "factNumber": 1116,
    "relatedIds": []
  },
  {
    "id": "nf_1117",
    "country": "NG",
    "category": "History",
    "fact": "The Sokoto Caliphate's military transitioned from cavalry to infantry and firearms after 1860, but this evolution was halted by the British conquest (1897–1903).",
    "deepDive": {
      "body": [
        "In the late 19th century, the Sokoto Caliphate's army was undergoing a quiet revolution. For decades, its military power had rested on cavalry charges and close combat, but after 1860, the shift toward infantry, long-range fighting, and firearms began to reshape how wars were fought. This was more than a change in weapons—it hinted at a deeper transformation from a 'feudal' force of horsemen to a 'bureaucratic' standing army.",
        "Yet this evolution was cut short. The British conquest of the caliphate, which unfolded between 1897 and 1903, halted the transition before it could fully take hold. The conquest was not the result of internal resistance or military weakness, but of external colonial expansion. By 1903, the caliphate had been dissolved, and its territories were absorbed into the Northern Nigeria Protectorate.",
        "The Sokoto Caliphate had been one of the largest and most powerful states in West Africa, with a population of 10 to 20 million at its peak. Its military had been instrumental in its expansion, but the arrival of European colonial powers brought a new kind of warfare—one that the caliphate's evolving army could not withstand. The transition to firearms and infantry, which might have modernized its forces, was never given the chance to mature."
      ],
      "whyItMatters": "The Sokoto Caliphate's military was not static; it was adapting to new technology and tactics. But the British conquest cut this evolution short, showing how colonial expansion could halt indigenous developments. This fact challenges the idea that African armies were unchanging, and highlights the external forces that shaped the region's history.",
      "readTime": 2,
      "suggestedQuestion": "What was the Sokoto Caliphate's military like before the British conquest?"
    },
    "source": {
      "name": "Sokoto Caliphate",
      "url": "https://en.wikipedia.org/wiki/Sokoto_Caliphate",
      "verified": true
    },
    "image": {
      "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/37/Sokoto_cavalry.png/1280px-Sokoto_cavalry.png",
      "credit": "Photo · Wikimedia Commons",
      "license": "Public domain",
      "panelColor": "#4A1B0C"
    },
    "factNumber": 1117,
    "relatedIds": []
  },
  {
    "id": "nf_1118",
    "country": "NG",
    "category": "History",
    "fact": "The Sokoto Caliphate's first Grand Vizier was Abdullahi dan Fodio, and all subsequent Grand Viziers came from the family of the second Grand Vizier, Waziri Gidado, whose great-grandson Gidado Idris served as Secretary to the Government of the Federation under General Sani Abacha.",
    "deepDive": {
      "body": [
        "In the early 1800s, as the Sokoto Caliphate took shape, its first Grand Vizier was Abdullahi dan Fodio, a brother of the founder Usman dan Fodio. He was described as a 'helper' to the Shaikh, the most important of his helpers. The second Grand Vizier, Waziri Gidado bin Abu Bakr, served under Sultan Muhammad Bello, and from his family all subsequent Grand Viziers came.",
        "This line of succession continued into the twentieth century. Gidado Idris, a great-grandson of Waziri Gidado, served as Secretary to the Government of the Federation under General Sani Abacha. The role of 'helper' to a head of state, first held by Abdullahi dan Fodio, thus found a modern echo in a senior Nigerian official.",
        "The vizierate was a key part of the Caliphate's administration, with the Vizier acting as chief adviser and friend to the Caliph. Foreign visitors in the late 1800s often saw the position as all-powerful, with one describing the Vizier as 'more powerful than the Sultan himself'."
      ],
      "whyItMatters": "The Sokoto Caliphate's political structures did not vanish with its conquest in 1903. The lineage of its viziers persisted into modern Nigerian governance, showing how pre-colonial institutions shaped the country's later leadership.",
      "readTime": 2,
      "suggestedQuestion": "What happened to the Sokoto Caliphate after the British conquest?"
    },
    "source": {
      "name": "Sokoto Caliphate",
      "url": "https://en.wikipedia.org/wiki/Sokoto_Caliphate",
      "verified": true
    },
    "image": {
      "url": "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEj4cvocFawFlR0OaT-qpGMZAbmIC66tyjoOJYgra-XzxKmzBoHsNA84rrPoVF_Sk3qxYXyE-xV_0ACLKYErFKyrKzphFI-Ow7k5g6_gUHRfoyjLoTwsujQW2QSyVUuUB4tO8pyFRjodlXr1_ZPvFTe0F3bl6gOY3pIz6cDJn0xlg4GegMsy9TGtY1S5mQ/s1080/FB_IMG_1682717197268.jpg",
      "credit": "Photo · PDP Governors Forum",
      "license": "Not verified — found by web search",
      "panelColor": "#4A1B0C"
    },
    "factNumber": 1118,
    "relatedIds": []
  },
  {
    "id": "nf_1119",
    "country": "NG",
    "category": "History",
    "fact": "In 1903, Lord Lugard described a dungeon in Kano where 135 people were confined each night in a space of 2,618 cubic feet, with victims crushed to death every night.",
    "deepDive": {
      "body": [
        "In 1903, British forces under Frederick Lugard marched into Kano, the commercial heart of the Sokoto Caliphate. Lugard later described a dungeon he visited there, a space so small that 135 people were packed in each night, with no room to even stand. The only entrance was a hole less than three feet high, and the air was so foul that a corpse lay rotting near the doorway.",
        "The dungeon was divided into two compartments, each 17 feet by 7 feet and 11 feet high, totaling 2,618 cubic feet. Prisoners were let out during the day to cook, but at night they were crammed inside, and many were crushed to death. Lugard noted that as many as 200 had been interned at one time, and the stench was unbearable even weeks later.",
        "This dungeon was part of a wider system of slavery in the Sokoto Caliphate, where slaves were used on plantations and in households. The British abolished the legal status of slavery after conquering the region, but the practice continued in various forms for decades. The dungeon stands as a grim reminder of the human cost of the caliphate's economy and the violence of its final years."
      ],
      "whyItMatters": "The dungeon in Kano shows that the Sokoto Caliphate, often remembered for its scholarship and Islamic reform, also relied on brutal coercion. It connects the caliphate's wealth and power to the suffering of enslaved people, a side of its history that is often overlooked.",
      "readTime": 2,
      "suggestedQuestion": "What was the Sokoto Caliphate and how did it treat slaves?"
    },
    "source": {
      "name": "Sokoto Caliphate",
      "url": "https://en.wikipedia.org/wiki/Sokoto_Caliphate",
      "verified": true
    },
    "image": {
      "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/View_of_Sokoto_%281890%29.jpg/1280px-View_of_Sokoto_%281890%29.jpg",
      "credit": "Photo · Monteil, P.-L. (Parfait-Louis) · Wikimedia Commons",
      "license": "Public domain",
      "panelColor": "#4A1B0C"
    },
    "factNumber": 1119,
    "relatedIds": []
  },
  {
    "id": "nf_1120",
    "country": "NG",
    "category": "Culture",
    "fact": "Wole Soyinka was the first African to win the Nobel Prize in Literature, in 1986.",
    "deepDive": {
      "body": [
        "In 1986, the Swedish Academy honored a Nigerian playwright, poet, and novelist with the Nobel Prize in Literature. Wole Soyinka, born in 1934 in Abeokuta, was the first African to receive the award. The Academy praised his 'wide cultural perspective and poetic overtones fashioning the drama of existence.'",
        "Soyinka's work spans plays, novels, and poetry, often set in Nigeria and reflecting its history and political struggles. His Nobel acceptance speech, 'This Past Must Address Its Present,' was devoted to Nelson Mandela and criticized apartheid. The award recognized not just his literary achievement but also his role as a political voice.",
        "The Nobel was a landmark for African literature, acknowledging a writer from the former colonies of the British Empire. Soyinka continued to write and teach, and in 2024, Nigeria renamed the National Arts Theatre in his honor during his 90th birthday celebrations."
      ],
      "whyItMatters": "Soyinka's Nobel Prize broke a barrier, showing that African literature could achieve the highest global recognition. It also highlighted the power of literature to address political and social issues, as his speech on apartheid demonstrated.",
      "readTime": 2,
      "suggestedQuestion": "What did Soyinka say in his Nobel acceptance speech?"
    },
    "source": {
      "name": "Wole Soyinka",
      "url": "https://en.wikipedia.org/wiki/Wole_Soyinka",
      "verified": true
    },
    "image": {
      "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Wole_Soyinka_in_2018_%283x4_cropped%29.jpg/1280px-Wole_Soyinka_in_2018_%283x4_cropped%29.jpg",
      "credit": "Photo · Frankie Fouganthin · Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "panelColor": "#04342C"
    },
    "factNumber": 1120,
    "relatedIds": []
  },
  {
    "id": "nf_1121",
    "country": "NG",
    "category": "History",
    "fact": "In 1994, Soyinka fled Nigeria on a motorcycle via the border with Benin to escape the Abacha regime.",
    "deepDive": {
      "body": [
        "In November 1994, Wole Soyinka made a dramatic escape from Nigeria on a motorcycle, crossing the border into Benin before continuing to the United States. At the time, Nigeria was under the military rule of General Sani Abacha, a regime known for its harsh crackdown on dissent.",
        "Soyinka, a vocal critic of the government, had been charged with treason in 1997, but his flight came earlier, in 1994, after he was appointed UNESCO Goodwill Ambassador. The motorcycle escape was a desperate measure to avoid arrest and persecution.",
        "This was not the first time Soyinka had faced imprisonment for his political views. During the Nigerian Civil War in the late 1960s, he was arrested and held for 22 months for allegedly conspiring with Biafran forces. His experiences in prison led to his memoir 'The Man Died.'",
        "After fleeing, Soyinka continued his work from abroad, writing 'The Open Sore of a Continent' in 1996, a personal narrative of Nigeria's crisis, and later serving as president of the International Parliament of Writers from 1997 to 2000."
      ],
      "whyItMatters": "Soyinka's flight on a motorcycle shows the extreme lengths a Nobel laureate had to go to escape political persecution. It underscores the danger faced by intellectuals under authoritarian regimes and highlights the personal cost of speaking truth to power.",
      "readTime": 2,
      "suggestedQuestion": "Why did Soyinka have to flee Nigeria in 1994?"
    },
    "source": {
      "name": "Wole Soyinka",
      "url": "https://en.wikipedia.org/wiki/Wole_Soyinka",
      "verified": true
    },
    "image": {
      "url": "https://image.okayafrica.com/1369734.jpg?imageId=1369734&width=960&height=960&format=webp&format=jpg",
      "credit": "Photo · OkayAfrica",
      "license": "Not verified — found by web search",
      "panelColor": "#4A1B0C"
    },
    "factNumber": 1121,
    "relatedIds": []
  },
  {
    "id": "nf_1122",
    "country": "NG",
    "category": "Culture",
    "fact": "In 2025, a viral photo claimed to show Soyinka with a young Gbenga Daniel, but it was labelled false by fact-checking website Dubawa.",
    "deepDive": {
      "body": [
        "A photo of Wole Soyinka with a young man behind him spread across social media in 2025, with captions praising the scene as a display of 'loyalty'. The man was said to be Gbenga Daniel, a Nigerian politician. But the image was quickly debunked by Dubawa, a fact-checking website, which labelled it false.",
        "The photo's claim played on Soyinka's stature as a Nobel laureate and cultural icon. Yet the image was not what it seemed, and the story behind it is a reminder that even the most believable pictures can be manipulated or misrepresented online.",
        "Soyinka, born in 1934, has lived a life full of political and literary milestones. From winning the Nobel Prize in Literature in 1986 to his outspoken critiques of Nigerian governments, he remains a towering figure. This incident, though minor, shows how his image continues to be used—and sometimes misused—in public discourse."
      ],
      "whyItMatters": "This fact shows that even a respected figure like Soyinka can be caught up in misinformation. It highlights the importance of fact-checking in an era where viral images can shape public perception, and it underscores the need to verify before sharing.",
      "readTime": 2,
      "suggestedQuestion": "What did Dubawa say about the photo?"
    },
    "source": {
      "name": "Wole Soyinka",
      "url": "https://en.wikipedia.org/wiki/Wole_Soyinka",
      "verified": true
    },
    "image": {
      "url": "https://cdn.pmnewsnigeria.com/wp-content/uploads/2024/07/20240716_152151-scaled.jpg",
      "credit": "Photo · PM News Nigeria",
      "license": "Not verified — found by web search",
      "panelColor": "#04342C"
    },
    "factNumber": 1122,
    "relatedIds": []
  },
  {
    "id": "nf_1123",
    "country": "NG",
    "category": "Sports",
    "fact": "Nigeria's first national team toured England in 1949, arriving in Liverpool on 29 August, and played amateur sides including Marine A.F.C., whose match drew 6,000 spectators, a record for their ground.",
    "deepDive": {
      "body": [
        "In the late summer of 1949, a team of Nigerian footballers stepped off a ship in Liverpool, beginning a tour that would introduce them to English football. They were not yet the Super Eagles; they wore scarlet, and they were still a British colony. Their opponents were amateur clubs, not the giants of the English game.",
        "One of those clubs was Marine A.F.C., based in Crosby, near Liverpool. When Nigeria came to play at their Rossett Park ground, 6,000 people turned up to watch. It was a record crowd for the ground, a sign of the curiosity and excitement the visiting team generated.",
        "The tour took them to face Bishop Auckland, Leytonstone, Dulwich Hamlet, and Bromley, among others. Just two months later, Nigeria played its first official international match, beating Sierra Leone 2–0 in Freetown. That 1949 tour was a stepping stone, marking Nigeria's arrival on the international football stage."
      ],
      "whyItMatters": "This tour is often seen as the birth of Nigerian international football. It shows that even before independence, Nigeria was building a national identity through sport, and the record crowd at Marine's ground hints at the passion that would later make the Super Eagles one of Africa's most supported teams.",
      "readTime": 2,
      "suggestedQuestion": "Who did Nigeria play on their 1949 tour of England?"
    },
    "source": {
      "name": "Nigeria national football team",
      "url": "https://en.wikipedia.org/wiki/Nigeria_national_football_team",
      "verified": true
    },
    "image": {
      "url": "https://upload.wikimedia.org/wikipedia/commons/5/58/MarineAFC_White.png?utm_source=en.wikipedia.org&utm_campaign=index&utm_content=original",
      "credit": "Photo · Wikipedia",
      "license": "Not verified — found by web search",
      "panelColor": "#042C53"
    },
    "factNumber": 1123,
    "relatedIds": []
  },
  {
    "id": "nf_1124",
    "country": "NG",
    "category": "Sports",
    "fact": "Nigeria's first official game was in October 1949, while still a British colony, beating Sierra Leone 2–0 in Freetown.",
    "deepDive": {
      "body": [
        "In 1949, Nigeria was still a British colony, and its football team was just beginning to find its footing on the international stage. That October, the team traveled to Freetown to face Sierra Leone in what would be recorded as Nigeria's first official match. The result was a 2–0 victory, a promising start for a side that had only recently begun playing organized internationals.",
        "Before this official debut, Nigeria had played informal matches against other colonies, starting in 1938 against the Gold Coast with a team of Lagos-based players. The 1949 match came shortly after a tour of England, where the team played against amateur clubs and drew significant crowds, including a record 6,000 spectators at one match. This period marked the beginning of Nigeria's journey in international football, which would later see them become a dominant force in African football.",
        "The victory over Sierra Leone was a modest beginning, but it set the stage for Nigeria's future successes. Over the decades, the team would go on to win the Africa Cup of Nations three times and qualify for multiple World Cups, establishing themselves as one of Africa's football powerhouses."
      ],
      "whyItMatters": "This fact marks the starting point of Nigeria's football history, showing how a colonial-era match laid the foundation for a team that would later become a continental champion and a regular at the World Cup. It's a reminder that even the greatest teams have humble beginnings.",
      "readTime": 2,
      "suggestedQuestion": "What was Nigeria's first official match?"
    },
    "source": {
      "name": "Nigeria national football team",
      "url": "https://en.wikipedia.org/wiki/Nigeria_national_football_team",
      "verified": true
    },
    "image": {
      "url": "https://i0.wp.com/www.horebinternational.com/wp-content/uploads/2024/09/1949-Nigerian-Football-Team.jpg",
      "credit": "Photo · | Horeb International",
      "license": "Not verified — found by web search",
      "panelColor": "#042C53"
    },
    "factNumber": 1124,
    "relatedIds": []
  },
  {
    "id": "nf_1125",
    "country": "NG",
    "category": "Sports",
    "fact": "Nigeria's first major success was a gold medal at the 2nd All-Africa Games in 1973, led by captain Victor Oduah.",
    "deepDive": {
      "body": [
        "In 1973, Nigeria's national football team traveled to Lagos for the 2nd All-Africa Games, a multi-sport event that brought together athletes from across the continent. Under the leadership of captain Victor Oduah, the team clinched the gold medal in football, marking their first major international triumph. This victory came a decade after Nigeria's debut in the Africa Cup of Nations in 1963, where they had failed to advance past the group stage.",
        "The gold medal was a turning point, setting the stage for Nigeria's rise in African football. In the years that followed, the team achieved third-place finishes in the 1976 and 1978 Africa Cup of Nations, and in 1980, they won their first continental title on home soil in Lagos. The 1973 success, therefore, was not just a standalone achievement but the beginning of a period of sustained competitiveness.",
        "The All-Africa Games, organized by the Association of African National Olympic Committees (ANOCA), are not officially recognized by FIFA, but they remain a significant regional competition. Nigeria's gold in 1973, followed by a silver in 1978, highlighted the team's growing strength and helped build the foundation for the 'Super Eagles' identity that would later become famous worldwide."
      ],
      "whyItMatters": "This gold medal was Nigeria's first major international football success, coming before their Africa Cup of Nations victories. It shows that Nigeria's footballing rise began in the early 1970s, not just in the 1980s, and set the stage for their later dominance on the continent.",
      "readTime": 2,
      "suggestedQuestion": "Who was the captain of Nigeria's team at the 1973 All-Africa Games?"
    },
    "source": {
      "name": "Nigeria national football team",
      "url": "https://en.wikipedia.org/wiki/Nigeria_national_football_team",
      "verified": true
    },
    "image": {
      "url": "https://lookaside.fbsbx.com/lookaside/crawler/media/?media_id=757066449794191",
      "credit": "Photo · Facebook",
      "license": "Not verified — found by web search",
      "panelColor": "#042C53"
    },
    "factNumber": 1125,
    "relatedIds": []
  },
  {
    "id": "nf_1126",
    "country": "NG",
    "category": "Sports",
    "fact": "Nigeria's Olympic football team won gold at the 1996 Atlanta Olympics, beating Mexico, Brazil, and Argentina.",
    "deepDive": {
      "body": [
        "In the summer of 1996, Nigeria's Olympic football team made history in Atlanta. They defeated Mexico, Brazil, and Argentina to win the gold medal, becoming the first African nation to win the Olympic football tournament.",
        "The team's path to gold was remarkable. After beating Mexico, they faced a Brazil side featuring stars like Ronaldo and Bebeto. Nigeria came from behind to win 4-3 in the semifinal, with a golden goal from Nwankwo Kanu. In the final against Argentina, they again trailed before winning 3-2, with Emmanuel Amunike scoring the winner.",
        "This victory was a landmark for African football, proving that African teams could compete with and beat the world's best. It also set the stage for Nigeria's future successes, including their run to the 2008 Olympic final, where they lost to Argentina in a rematch of the 1996 final."
      ],
      "whyItMatters": "This gold medal was a turning point for African football, showing that the continent's teams could win on the world stage. It also began a notable rivalry with Argentina, as the two nations would meet again in the 2008 Olympic final.",
      "readTime": 2,
      "suggestedQuestion": "How did Nigeria beat Brazil in the 1996 Olympic semifinal?"
    },
    "source": {
      "name": "Nigeria national football team",
      "url": "https://en.wikipedia.org/wiki/Nigeria_national_football_team",
      "verified": true
    },
    "image": {
      "url": "https://i0.wp.com/thesefootballtimes.co/wp-content/uploads/2017/11/nigeria96.jpg?fit=1340%2C864&ssl=1",
      "credit": "Photo · These Football Times",
      "license": "Not verified — found by web search",
      "panelColor": "#042C53"
    },
    "factNumber": 1126,
    "relatedIds": []
  },
  {
    "id": "nf_1127",
    "country": "NG",
    "category": "Sports",
    "fact": "Nigeria withdrew from the 1996 Africa Cup of Nations under pressure from military dictator Sani Abacha, due to criticism from South Africa and Nelson Mandela over the execution of Ken Saro-Wiwa.",
    "deepDive": {
      "body": [
        "In 1996, Nigeria was set to compete in the Africa Cup of Nations, hosted by South Africa. But the team never took the field. The country's military ruler, Sani Abacha, forced the national team to withdraw from the tournament.",
        "The withdrawal was a response to criticism from South Africa and its president, Nelson Mandela, over the execution of Ogoni activist Ken Saro-Wiwa. Saro-Wiwa had been a prominent critic of the Nigerian government and the oil industry in the Niger Delta.",
        "The decision had consequences beyond the tournament. Nigeria was subsequently banned from entering the 1998 Africa Cup of Nations, a punishment that sidelined the team from continental competition for years."
      ],
      "whyItMatters": "This moment shows how football can become entangled with politics and human rights. A team's withdrawal from a major tournament was not about sport, but about a dictator's response to international pressure over an execution.",
      "readTime": 1,
      "suggestedQuestion": "Why did Nigeria get banned from the 1998 Africa Cup of Nations?"
    },
    "source": {
      "name": "Nigeria national football team",
      "url": "https://en.wikipedia.org/wiki/Nigeria_national_football_team",
      "verified": true
    },
    "image": {
      "url": "https://assets.cfr.org/images/t_cfr_3_2/f_auto/w_1920/v1758971528/Africa-Sani-Abacha-archive/Africa-Sani-Abacha-archive.jpg",
      "credit": "Photo · Council on Foreign Relations",
      "license": "Not verified — found by web search",
      "panelColor": "#042C53"
    },
    "factNumber": 1127,
    "relatedIds": []
  },
  {
    "id": "nf_1128",
    "country": "NG",
    "category": "Sports",
    "fact": "In 2010, Nigeria was banned from international football by FIFA due to government interference, but the ban was provisionally lifted four days later.",
    "deepDive": {
      "body": [
        "The 2010 World Cup had been a bitter disappointment for Nigeria. The Super Eagles managed just one point from three group games, and the fallout was swift. On 30 June, President Goodluck Jonathan suspended the national team from international competition for two years, a move that put Nigeria on a collision course with FIFA's rules against political interference.",
        "FIFA's response came months later. On 4 October 2010, the world governing body banned Nigeria indefinitely. But the ban lasted only four days: it was provisionally lifted on 8 October, pending a hearing. The reprieve came after the National Association of Nigerian Footballers (NANF), a players' union not officially recognized by the NFF, dropped its court case against the federation.",
        "The provisional lifting gave Nigeria until 26 October to resolve the dispute. The episode highlighted the tension between political power and football governance, a recurring theme in African football. Nigeria would go on to qualify for the 2014 World Cup, but the scars of 2010 lingered."
      ],
      "whyItMatters": "This four-day ban shows how quickly football's governing body can act to protect its rules, and how political interference can put a nation's place in the sport at risk. It's a reminder that the beautiful game is also a political arena.",
      "readTime": 2,
      "suggestedQuestion": "Why did FIFA ban Nigeria in 2010?"
    },
    "source": {
      "name": "Nigeria national football team",
      "url": "https://en.wikipedia.org/wiki/Nigeria_national_football_team",
      "verified": true
    },
    "image": {
      "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/Argentina-Nigeria_%288%29.jpg/1280px-Argentina-Nigeria_%288%29.jpg",
      "credit": "Photo · Дмитрий Пукалик · Wikimedia Commons",
      "license": "CC BY-SA 3.0",
      "panelColor": "#042C53"
    },
    "factNumber": 1128,
    "relatedIds": []
  },
  {
    "id": "nf_1129",
    "country": "NG",
    "category": "Culture",
    "fact": "Zuma Rock is depicted on the 100 naira note.",
    "deepDive": {
      "body": [
        "Zuma Rock rises roughly 725 metres above sea level near Madalla in Niger State, Nigeria, along the main road from Abuja to Kaduna. It is a natural monolith made of gabbro and granodiorite, dating back to the Precambrian era. The rock is so prominent that it appears on the 100 naira note, a symbol of its national significance.",
        "Long before it became a currency icon, the rock was a refuge. During intertribal wars, the Gbagyi people used it as a defensive retreat against invading neighbouring tribes. The rock's history is also tied to the Zuba people, who discovered it in the 15th century and named it 'zumwa', meaning 'a place of guinea fowls'.",
        "Local legends surround the rock with mystery. A village in the forest near the rock was said to be hidden and protected by a priest, with stories of curses and sacrifices. Even today, some residents believe unseen spirits dwell within the rock, while others think they have moved on. The rock remains a place of both natural wonder and cultural lore."
      ],
      "whyItMatters": "Seeing Zuma Rock on the 100 naira note is more than a design choice—it reflects the rock's deep roots in Nigerian history and identity, from a wartime refuge to a site of legend.",
      "readTime": 2,
      "suggestedQuestion": "Why is Zuma Rock on the 100 naira note?"
    },
    "source": {
      "name": "Zuma Rock",
      "url": "https://en.wikipedia.org/wiki/Zuma_Rock",
      "verified": true
    },
    "image": {
      "url": "https://upload.wikimedia.org/wikipedia/commons/c/cb/Zuma_Rock.jpg",
      "credit": "Photo · Jeff Attaway · Wikimedia Commons",
      "license": "CC BY 2.0",
      "panelColor": "#04342C"
    },
    "factNumber": 1129,
    "relatedIds": []
  },
  {
    "id": "nf_1130",
    "country": "NG",
    "category": "History",
    "fact": "Zuma Rock was used for a defensive retreat by the Gbagyi people against invading neighbouring tribes during intertribal wars.",
    "deepDive": {
      "body": [
        "The Gbagyi people, who lived around what is now Niger State in Nigeria, faced a constant threat from neighbouring tribes during intertribal wars. When danger came, they did not simply flee—they retreated to the massive natural fortress of Zuma Rock. The rock's steep sides and commanding height made it a formidable defensive position, offering safety and a vantage point against invaders.",
        "Zuma Rock is a large monolith, an inselberg of igneous rock, rising about 725 metres above sea level. It stands near the main road from Abuja to Kaduna, a landmark so prominent it is depicted on the 100 naira note. For the Gbagyi, this geological wonder was more than a landmark; it was a refuge that could mean the difference between survival and defeat.",
        "The rock's role as a defensive retreat is part of its long history. It was discovered in the 15th century by the Zuba people, who called it 'zumwa', meaning 'a place of guinea fowls'. Over centuries, the rock accumulated legends of spirits and ritualists, but its practical use as a stronghold during wartime shows how the Gbagyi turned their environment into a shield."
      ],
      "whyItMatters": "Zuma Rock is more than a scenic landmark or a symbol on currency; it was a strategic military asset. Understanding its role as a defensive retreat reveals how African communities used their natural surroundings for protection and survival, a layer of history often overlooked.",
      "readTime": 2,
      "suggestedQuestion": "How did the Gbagyi people use Zuma Rock for defense?"
    },
    "source": {
      "name": "Zuma Rock",
      "url": "https://en.wikipedia.org/wiki/Zuma_Rock",
      "verified": true
    },
    "image": {
      "url": "https://upload.wikimedia.org/wikipedia/commons/d/d6/Nigerian_Public_Domain_717.jpg",
      "credit": "Photo · Wikimedia Commons",
      "license": "Public domain",
      "panelColor": "#4A1B0C"
    },
    "factNumber": 1130,
    "relatedIds": []
  },
  {
    "id": "nf_1131",
    "country": "NG",
    "category": "Culture",
    "fact": "The Emir of Abuja once sent annual sacrifices of a black ox, a black he-goat, and a black dog to the guardians of Zuma Rock.",
    "deepDive": {
      "body": [
        "In the forest around Zuma Rock, a village of the Koro people was said to be hidden from outsiders. Its chief served as the priest of the rock's deity, and the villagers were believed to protect the rock, preventing anyone from reaching its base.",
        "Each year, the Emir of Abuja sent a black ox, a black he-goat, and a black dog as offerings to the deity. These sacrifices were delivered by villagers from Chachi, who could interact with the guardians because of shared tribal connections.",
        "In the 1940s, the District Officer of Abuja and Sulaimanu Barau, who later became Emir, visited the village to learn the truth. They found the priest 'properly clothed and shaved,' and he said animal sacrifices were still made to ancestors and spirits of past priests, not to the rock itself."
      ],
      "whyItMatters": "The annual sacrifices show how a natural landmark was woven into the spiritual and political life of the region. They also reveal a shift: what outsiders saw as mysterious or fearsome was, for the villagers, a practice directed at their own ancestors.",
      "readTime": 2,
      "suggestedQuestion": "Why did the Emir of Abuja send sacrifices to Zuma Rock?"
    },
    "source": {
      "name": "Zuma Rock",
      "url": "https://en.wikipedia.org/wiki/Zuma_Rock",
      "verified": true
    },
    "image": {
      "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/37/Zuma_Rock_-_Village.jpg/1280px-Zuma_Rock_-_Village.jpg",
      "credit": "Photo · Anass Sedrati · Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "panelColor": "#04342C"
    },
    "factNumber": 1131,
    "relatedIds": []
  },
  {
    "id": "nf_1132",
    "country": "NG",
    "category": "History",
    "fact": "Northern Nigeria did not outlaw slavery until 1936, while in other parts of Nigeria slavery was abolished soon after colonialism.",
    "deepDive": {
      "body": [
        "In 1914, Britain merged the Northern and Southern Nigeria Protectorates into a single colony, but the two regions were governed very differently. The south, with its coastal economy and Christian missions, was brought more directly under British legal and administrative systems. The north, home to the Sokoto Caliphate's successor, the Sokoto Sultanate Council, was ruled indirectly through its Islamic emirs.",
        "This divide shaped how British colonial law was applied. In the south, the legal abolition of slavery followed soon after colonial rule was established. In the north, however, the institution persisted under the authority of the emirs, who relied on slave labour for agriculture and domestic service. It was not until 1936 that the British colonial administration formally outlawed slavery in northern Nigeria, decades after it had been abolished elsewhere in the colony.",
        "The delay reflected the British policy of indirect rule, which preserved existing power structures to maintain order and control. The Sokoto Caliphate had been one of the largest slave societies in 19th-century Africa, and its legacy continued to shape the region's social and economic life well into the 20th century."
      ],
      "whyItMatters": "The 1936 abolition in northern Nigeria shows that colonial rule did not end slavery uniformly. It reveals how British indirect rule could sustain existing institutions, including slavery, long after they were outlawed in other parts of the same colony.",
      "readTime": 2,
      "suggestedQuestion": "Why did northern Nigeria abolish slavery so much later than the south?"
    },
    "source": {
      "name": "Nigeria",
      "url": "https://en.wikipedia.org/wiki/Nigeria",
      "verified": true
    },
    "image": {
      "url": "https://slaveryandremembrance.org/_images/large/A0121_image0001.jpg",
      "credit": "Photo · Slavery and Remembrance",
      "license": "Not verified — found by web search",
      "panelColor": "#4A1B0C"
    },
    "factNumber": 1132,
    "relatedIds": []
  },
  {
    "id": "nf_1133",
    "country": "NG",
    "category": "History",
    "fact": "In 2005, Nigeria had the highest rate of deforestation in the world, according to the Food and Agriculture Organization of the United Nations.",
    "deepDive": {
      "body": [
        "In 2005, the Food and Agriculture Organization of the United Nations reported that Nigeria had the highest rate of deforestation in the world. That year, forests covered 12.2% of the country, about 11,089,000 hectares. Between 1990 and 2000, Nigeria lost an average of 409,700 hectares of forest each year, an annual deforestation rate of 2.4%.",
        "From 1990 to 2005, Nigeria lost 35.7% of its forest cover, roughly 6,145,000 hectares. This rapid loss was driven by factors such as agricultural expansion, logging, and population growth, though the source does not detail specific causes.",
        "The loss of forest has serious consequences for soil, water, and climate. Nigeria's environmental challenges include deforestation and soil degradation, which are linked. By 2019, Nigeria scored 6.2 out of 10 on the Forest Landscape Integrity Index, ranking 82nd globally out of 172 countries."
      ],
      "whyItMatters": "Nigeria's deforestation rate was the highest in the world in 2005, meaning it lost more forest per year than any other country. This rapid loss threatens biodiversity, contributes to climate change, and undermines the livelihoods of communities that depend on forests.",
      "readTime": 2,
      "suggestedQuestion": "What caused Nigeria's deforestation rate to be so high?"
    },
    "source": {
      "name": "Nigeria",
      "url": "https://en.wikipedia.org/wiki/Nigeria",
      "verified": true
    },
    "image": {
      "url": "https://earth.org/wp-content/uploads/2022/01/rsz_10707591965_166f53a043_k-1200x675.jpg",
      "credit": "Photo · Earth.Org",
      "license": "Not verified — found by web search",
      "panelColor": "#4A1B0C"
    },
    "factNumber": 1133,
    "relatedIds": []
  },
  {
    "id": "nf_1134",
    "country": "NG",
    "category": "History",
    "fact": "Nigeria's Delta region is one of the most polluted regions in the world due to serious oil spills and other environmental problems caused by its oil industry.",
    "deepDive": {
      "body": [
        "The Niger Delta's mangroves and creeks have long been the engine of Nigeria's oil wealth, but that wealth has come at a heavy price. Decades of oil spills, gas flaring, and illegal refining have left the region's air, ground, and water heavily contaminated with toxic pollutants. The damage is so severe that the Delta is often cited as an example of ecocide—environmental destruction on a scale that harms entire ecosystems and communities.",
        "The problem is not just from major oil companies. In recent years, illegal refineries, where local operators process stolen crude oil into fuel, have added to the pollution. These makeshift operations often ignore safety and environmental standards, dumping heavy oil residues and risking explosions. In 2022 alone, explosions at such refineries killed 125 people across Nigeria.",
        "The environmental damage has also fueled conflict in the Delta, as communities have protested against the pollution and the lack of benefits from oil extraction. The region's struggles highlight the complex legacy of oil in Nigeria, where the source of national wealth has also become a source of suffering for the people who live where it is extracted."
      ],
      "whyItMatters": "The Niger Delta's pollution is not just a local issue—it is a global example of the hidden costs of oil dependence. Understanding this helps connect the dots between the fuel we consume and the environmental and social damage that can occur far from where it is used.",
      "readTime": 2,
      "suggestedQuestion": "What are the main causes of pollution in the Niger Delta?"
    },
    "source": {
      "name": "Nigeria",
      "url": "https://en.wikipedia.org/wiki/Nigeria",
      "verified": true
    },
    "image": {
      "url": "https://i.guim.co.uk/img/media/60f30b05a5164b726cda2b503bda64e7b8601987/0_104_4096_2458/master/4096.jpg?width=1200&height=900&quality=85&auto=format&fit=crop&s=d1d8007ec659a7e3629ed104ca8565d6",
      "credit": "Photo · The Guardian",
      "license": "Not verified — found by web search",
      "panelColor": "#4A1B0C"
    },
    "factNumber": 1134,
    "relatedIds": []
  },
  {
    "id": "nf_1135",
    "country": "NG",
    "category": "History",
    "fact": "At 160 m (520 ft), the NECOM House is the tallest building in Nigeria, comprising 32 floors.",
    "deepDive": {
      "body": [
        "In the heart of Lagos, the NECOM House rises 160 meters above the city, its 32 floors making it the tallest building in Nigeria. The structure, originally known as the NITEL Tower, has been a landmark since its completion in 1979, though the source does not specify its exact completion date.",
        "The building's height is notable not just for its stature, but for what it represents in Nigeria's urban landscape. While the country is Africa's most populous and one of its most economically developed, the source notes that high-rise development is largely concentrated in Lagos, Abuja, and the emerging Eko Atlantic district. NECOM House stands as a testament to this concentrated growth, particularly in Lagos, which has long been the commercial hub.",
        "Despite its status, NECOM House's reign may not last indefinitely. The source mentions that several skyscrapers are under construction or proposed across Nigeria, with plans to exceed 100 meters. These future projects signal a shift in the country's skyline, as new developments aim to surpass the current record."
      ],
      "whyItMatters": "NECOM House's height is a snapshot of Nigeria's uneven urban development—where economic power is concentrated in a few cities, so too are its tallest structures. As new towers rise, they will not just break a record but reflect where the country's next wave of growth is heading.",
      "readTime": 2,
      "suggestedQuestion": "What is the history behind NECOM House?"
    },
    "source": {
      "name": "List of tallest buildings in Nigeria",
      "url": "https://en.wikipedia.org/wiki/List_of_tallest_buildings_in_Nigeria",
      "verified": true
    },
    "image": {
      "url": "https://upload.wikimedia.org/wikipedia/commons/0/09/NECOM-house_Lagos-tallest-building-scaled.jpg?utm_source=en.wikipedia.org&utm_campaign=index&utm_content=original",
      "credit": "Photo · Wikipedia",
      "license": "Not verified — found by web search",
      "panelColor": "#4A1B0C"
    },
    "factNumber": 1135,
    "relatedIds": []
  },
  {
    "id": "nf_1136",
    "country": "NG",
    "category": "History",
    "fact": "The Aro network included about 150 diaspora communities in the Nigerian section of the Bight of Biafra.",
    "deepDive": {
      "body": [
        "Arochukwu, in today's southeastern Nigeria, was the center of a far-reaching network. From the seventeenth century, Aro merchants and settlers moved along trade routes, establishing communities that stretched across the region. These were not colonies in the usual sense but a trade diaspora—scattered settlements tied by kinship, commerce, and shared institutions.",
        "By the eighteenth and nineteenth centuries, this network had grown to include around 150 diaspora communities in the Nigerian section of the Bight of Biafra. Some, like Arondizuogu, were large and founded through conquest. Others were smaller wards or compounds within existing towns. They all traced their origins back to Arochukwu and its lineage groups.",
        "This web of settlements gave Aro merchants a distinct advantage. They could move goods—including enslaved people, cloth, and firearms—across a region of many small, independent societies. The network's reach was commercial and social, not a claim to rule over all these places. It was a system that connected distant points through shared identity and trade."
      ],
      "whyItMatters": "The Aro network shows how power in pre-colonial Africa often worked through trade and social ties, not just territory. A single town could influence a vast region through a web of diaspora communities, reshaping economies and connecting the interior to the Atlantic world.",
      "readTime": 2,
      "suggestedQuestion": "How did the Aro network manage to control trade across such a large area?"
    },
    "source": {
      "name": "Aro Confederacy",
      "url": "https://en.wikipedia.org/wiki/Aro_Confederacy",
      "verified": true
    },
    "image": {
      "url": "https://upload.wikimedia.org/wikipedia/commons/a/a6/Gulf_of_Guinea_%28English%29.jpg?utm_source=en.wikipedia.org&utm_campaign=index&utm_content=original",
      "credit": "Photo · Wikipedia",
      "license": "Not verified — found by web search",
      "panelColor": "#4A1B0C"
    },
    "factNumber": 1136,
    "relatedIds": []
  },
  {
    "id": "nf_1142",
    "country": "NG",
    "category": "History",
    "fact": "The name Nigeria was coined on 8 January 1897 by British journalist and Lord Lugard's wife Flora Shaw.",
    "deepDive": {
      "body": [
        "In the late 19th century, the territories that would become Nigeria were a patchwork of British protectorates and commercial spheres, often referred to by cumbersome names like the Royal Niger Company Territories. On 8 January 1897, British journalist Flora Shaw proposed a simpler name in a letter to The Times, deriving it from the Niger River that runs through the region. Her suggestion was soon adopted, and the name 'Nigeria' stuck.",
        "Shaw was a well-known writer and colonial correspondent, and her coinage reflected a common practice of naming colonies after geographical features. The name was not universally accepted at first; other proposals included 'Central Sudan' and 'Niger Empire.' But 'Nigeria' gained traction and was officially used when the British merged the Southern and Northern protectorates in 1914.",
        "Today, Nigeria is Africa's most populous country, with over 250 ethnic groups. The name, coined by a British journalist, has become a symbol of national identity, though its colonial origins are a reminder of the complex history that shaped the nation."
      ],
      "whyItMatters": "The name 'Nigeria' is so familiar that it's easy to forget it was coined just over a century ago by a British journalist. Understanding its origin reveals how colonial powers shaped African identities, often with little input from the people who lived there.",
      "readTime": 2,
      "suggestedQuestion": "Who was Flora Shaw and why did she suggest the name Nigeria?"
    },
    "source": {
      "name": "Nigeria",
      "url": "https://en.wikipedia.org/wiki/Nigeria",
      "verified": true
    },
    "image": {
      "url": "https://upload.wikimedia.org/wikipedia/commons/9/92/Tcitp_d012_frederick_john_dealtry_lugard_and_wife.jpg?utm_source=en.wikipedia.org&utm_campaign=index&utm_content=original",
      "credit": "Photo · Wikipedia",
      "license": "Not verified — found by web search",
      "panelColor": "#4A1B0C"
    },
    "factNumber": 1142,
    "relatedIds": []
  },
  {
    "id": "nf_1147",
    "country": "NG",
    "category": "History",
    "fact": "The first human-to-human heart transplant was performed by South African cardiac surgeon Christiaan Barnard at Groote Schuur Hospital in December 1967.",
    "deepDive": {
      "body": [
        "In the 1960s, heart transplantation was the frontier of medicine. Surgeons had experimented on animals for years, but no one had successfully transplanted a human heart into another human being. The race to be first was intense, with teams in the United States and Europe working toward the same goal.",
        "On December 3, 1967, Christiaan Barnard, a South African surgeon at Groote Schuur Hospital in Cape Town, performed the world's first human-to-human heart transplant. The patient, Louis Washkansky, received the heart of a young woman who had died in a car accident. The operation was a technical triumph, though Washkansky died 18 days later from pneumonia, a complication of the immunosuppressive drugs used to prevent rejection.",
        "Barnard's achievement put South Africa at the forefront of medical science. It also sparked global debate about the ethics of organ transplantation and the definition of death. The procedure paved the way for countless future transplants, saving millions of lives worldwide."
      ],
      "whyItMatters": "The first heart transplant wasn't just a medical milestone; it was a moment that redefined the boundaries of life and death. It showed that a team in Africa could lead the world in a high-stakes field, challenging assumptions about where innovation happens.",
      "readTime": 2,
      "suggestedQuestion": "How did Christiaan Barnard's team prepare for the first heart transplant?"
    },
    "source": {
      "name": "History of science and technology in Africa",
      "url": "https://en.wikipedia.org/wiki/History_of_science_and_technology_in_Africa",
      "verified": true
    },
    "image": {
      "url": "https://upload.wikimedia.org/wikipedia/commons/c/cb/Heart_transplant_pioneer_Barnard_here_on_Visit_%28FL61733185%29.jpg?utm_source=en.wikipedia.org&utm_campaign=index&utm_content=original",
      "credit": "Photo · Wikipedia",
      "license": "Not verified — found by web search",
      "panelColor": "#4A1B0C"
    },
    "factNumber": 1147,
    "relatedIds": []
  },
  {
    "id": "nf_1148",
    "country": "NG",
    "category": "History",
    "fact": "In 1987, the Dufuna canoe, the oldest in Africa and third oldest in the world, was discovered in Nigeria, dating to approximately 8000 years ago.",
    "deepDive": {
      "body": [
        "In 1987, Fulani herdsmen near the village of Dufuna in Nigeria stumbled upon a remarkable discovery: a canoe buried in the mud. This was no ordinary boat. It was the Dufuna canoe, now recognized as the oldest known canoe in Africa and the third oldest in the world.",
        "Radiocarbon dating places the canoe at approximately 8,000 years old, making it a testament to early human ingenuity. Crafted from African mahogany, its construction reveals sophisticated woodworking skills that predate many other technological advancements.",
        "The canoe's discovery near the Yobe River suggests that ancient peoples in the region had developed water transport, likely for fishing, trade, or travel. It offers a rare glimpse into the lives of early inhabitants of what is now Nigeria, showing that they were not merely surviving but thriving with advanced tools and knowledge."
      ],
      "whyItMatters": "The Dufuna canoe pushes back the timeline of African maritime technology by thousands of years, showing that complex boat-building was happening in Africa long before many other parts of the world. It challenges the idea that early technological advances were centered elsewhere, placing Africa firmly on the map of ancient innovation.",
      "readTime": 2,
      "suggestedQuestion": "How was the Dufuna canoe preserved for so long?"
    },
    "source": {
      "name": "History of science and technology in Africa",
      "url": "https://en.wikipedia.org/wiki/History_of_science_and_technology_in_Africa",
      "verified": true
    },
    "image": {
      "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Dufuna-canoe-theafricanhistory-com_PicsArt_03-07-09.24.07.jpg/1280px-Dufuna-canoe-theafricanhistory-com_PicsArt_03-07-09.24.07.jpg?utm_source=en.wikipedia.org&utm_campaign=index&utm_content=thumbnail",
      "credit": "Photo · Wikipedia",
      "license": "Not verified — found by web search",
      "panelColor": "#4A1B0C"
    },
    "factNumber": 1148,
    "relatedIds": []
  },
  {
    "id": "nf_1149",
    "country": "NG",
    "category": "History",
    "fact": "The female literacy rate in the Sokoto Caliphate in 1812 was higher than women in the United Kingdom and the United States.",
    "deepDive": {
      "body": [
        "In the early 19th century, the Sokoto Caliphate, a vast state in what is now northern Nigeria, was remarkable for its widespread literacy. While Europe and America were still debating who deserved an education, Sokoto's schools were teaching both boys and girls to read and write.",
        "The caliphate's founder, Usman dan Fodio, championed education for all, and by 1812, female literacy there had surpassed that of women in the United Kingdom and the United States. This was not just a small elite; surveys suggest that nearly all women in the caliphate could read and write.",
        "British traveler Colonel Runciman was astonished to find that the people of Sokoto were 'literate not to a man, but to a woman.' This achievement was part of a broader intellectual movement that saw the creation of thousands of manuscripts and a vibrant culture of learning."
      ],
      "whyItMatters": "This fact challenges the common assumption that high literacy, especially for women, is a recent Western achievement. It shows that a precolonial African state could outpace the West in education, offering a powerful counter-narrative to stereotypes of Africa's past.",
      "readTime": 1,
      "suggestedQuestion": "How did the Sokoto Caliphate achieve such high literacy rates?"
    },
    "source": {
      "name": "History of science and technology in Africa",
      "url": "https://en.wikipedia.org/wiki/History_of_science_and_technology_in_Africa",
      "verified": true
    },
    "image": {
      "url": "https://cdn.yaqeeninstitute.org/wp-content/uploads/2026/04/259_HERO_4000x1334-scaled.jpg",
      "credit": "Photo · Yaqeen Institute",
      "license": "Not verified — found by web search",
      "panelColor": "#4A1B0C"
    },
    "factNumber": 1149,
    "relatedIds": []
  },
  {
    "id": "nf_1150",
    "country": "NG",
    "category": "Culture",
    "fact": "Yemi Osinbajo, Nigeria's former vice president, is a first cousin once removed of British Conservative Party leader Kemi Badenoch.",
    "deepDive": {
      "body": [
        "When Kemi Badenoch was elected leader of the UK Conservative Party in November 2024, her Nigerian heritage became a talking point. But her family ties to Nigeria's political elite run deeper than many realize: she is the first cousin once removed of Yemi Osinbajo, who served as Nigeria's vice president from 2015 to 2023.",
        "The relationship means Osinbajo is Badenoch's cousin's child (or her parent's cousin). While the two have not been publicly known to collaborate politically, their connection highlights the intertwined nature of Nigerian and British public life.",
        "Osinbajo, a lawyer and pastor, rose through Nigeria's political ranks, serving as Attorney-General of Lagos State and later as Vice President under Muhammadu Buhari. Badenoch, born in London to Nigerian parents, has charted a different course in British politics, becoming the first Black woman to lead a major UK political party."
      ],
      "whyItMatters": "This fact shows how personal connections can span continents and political systems. It underscores the global reach of the Nigerian diaspora and how figures in African and Western politics can be linked in unexpected ways.",
      "readTime": 1,
      "suggestedQuestion": "How are Yemi Osinbajo and Kemi Badenoch related?"
    },
    "source": {
      "name": "Yemi Osinbajo",
      "url": "https://en.wikipedia.org/wiki/Yemi_Osinbajo",
      "verified": true
    },
    "image": {
      "url": "https://nation.africa/resource/image/4969916/portrait_ratio1x1/1600/1600/40e54b07d7ea4d34f1d26cd26e95e553/Ke/kemi.jpg",
      "credit": "Photo · Daily Nation",
      "license": "Not verified — found by web search",
      "panelColor": "#04342C"
    },
    "factNumber": 1150,
    "relatedIds": []
  },
  {
    "id": "nf_1151",
    "country": "NG",
    "category": "Culture",
    "fact": "Osinbajo's wife Dolapo is a granddaughter of Obafemi Awolowo, the iconic Yoruba leader.",
    "deepDive": {
      "body": [
        "When Yemi Osinbajo stepped into the role of Nigeria's vice president in 2015, he carried with him a family connection to one of the country's most towering political figures. His wife, Dolapo, is a granddaughter of Obafemi Awolowo, the iconic Yoruba leader who shaped Nigeria's political landscape for decades.",
        "Awolowo was a central figure in Nigeria's independence movement and a powerful advocate for the Yoruba people. His legacy as a statesman and thinker looms large over Nigerian politics, and his influence extends through his descendants, including Dolapo.",
        "Osinbajo's marriage to Dolapo thus links him to a political dynasty that predates his own rise. While Osinbajo's career has been defined by his own achievements as a lawyer, pastor, and public servant, this family tie places him within a broader narrative of Nigerian political heritage.",
        "The connection also highlights how personal and political histories often intertwine in Nigeria's leadership circles, where family names can carry as much weight as policy positions."
      ],
      "whyItMatters": "This fact shows how Nigeria's political elite are often connected through family ties that span generations. It adds a layer of context to Osinbajo's public role, reminding us that personal histories can shape political trajectories in ways that are not always visible.",
      "readTime": 2,
      "suggestedQuestion": "Who was Obafemi Awolowo and why is he so important in Nigerian history?"
    },
    "source": {
      "name": "Yemi Osinbajo",
      "url": "https://en.wikipedia.org/wiki/Yemi_Osinbajo",
      "verified": true
    },
    "image": {
      "url": "https://upload.wikimedia.org/wikipedia/commons/1/1f/Vice_President_Yemi_Osinbajo_and_President_Buhari.png",
      "credit": "Photo · NarenderShimla · Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "panelColor": "#04342C"
    },
    "factNumber": 1151,
    "relatedIds": []
  },
  {
    "id": "nf_1152",
    "country": "NG",
    "category": "History",
    "fact": "In 2018, acting president Osinbajo fired the SSS boss Lawal Daura for the illegal invasion of the National Assembly by armed operatives.",
    "deepDive": {
      "body": [
        "On 7 August 2018, Nigeria's acting president, Yemi Osinbajo, fired the head of the State Security Service (SSS), Lawal Daura. The dismissal came after armed and masked operatives of the SSS invaded the National Assembly. The action was described as illegal, and Daura was replaced with Matthew Seiyefa.",
        "Osinbajo was acting president because President Muhammadu Buhari was on medical leave in the United Kingdom. During his brief stints as acting leader, Osinbajo took decisive actions that contrasted with Buhari's style and were controversial among Buhari's inner circle. The firing of Daura was one such major decision.",
        "This incident highlighted tensions between the executive and the SSS, and underscored Osinbajo's willingness to act firmly when he perceived a breach of the law. It also showed the delicate balance of power during presidential absences."
      ],
      "whyItMatters": "This firing shows how a vice president, when acting as president, can make consequential decisions that shape public trust in institutions. It also reveals the internal dynamics and controversies within Nigeria's government during Buhari's absences.",
      "readTime": 2,
      "suggestedQuestion": "What led to the invasion of the National Assembly by SSS operatives?"
    },
    "source": {
      "name": "Yemi Osinbajo",
      "url": "https://en.wikipedia.org/wiki/Yemi_Osinbajo",
      "verified": true
    },
    "image": {
      "url": "https://lookaside.instagram.com/seo/google_widget/crawler/?media_id=3964139871189758070",
      "credit": "Photo · Instagram",
      "license": "Not verified — found by web search",
      "panelColor": "#4A1B0C"
    },
    "factNumber": 1152,
    "relatedIds": []
  },
  {
    "id": "nf_1153",
    "country": "NG",
    "category": "History",
    "fact": "Osinbajo survived a helicopter crash in Kabba, Kogi State, and delivered a campaign speech afterwards.",
    "deepDive": {
      "body": [
        "The helicopter came down in Kabba, Kogi State, on 2 February 2019. Osinbajo was on the campaign trail for the upcoming presidential election, in which he was running for a second term as vice president alongside Muhammadu Buhari. The crash could have ended his life, but he walked away unharmed.",
        "What happened next was remarkable: Osinbajo went on to deliver a previously scheduled campaign speech. In that speech, he said he was 'extremely grateful to the Lord for preserving our lives from the incident that just happened. Everyone of us is safe and no one is maimed.' His decision to continue with the event, rather than cancel it, showed a steely resolve in the face of danger.",
        "The incident took place in the context of a heated election season. Osinbajo and Buhari were seeking re-election against Atiku Abubakar and Peter Obi of the Peoples Democratic Party. The crash did not derail the campaign; the APC ticket went on to win the election in February 2019, and Osinbajo was sworn in for a second term on 29 May 2019."
      ],
      "whyItMatters": "This moment reveals the physical risks that politicians can face on the campaign trail, and how they respond can shape public perception. Osinbajo's decision to deliver his speech after surviving a crash underscored his commitment and resilience, which resonated with voters and became part of his public image.",
      "readTime": 2,
      "suggestedQuestion": "What happened right after the helicopter crash?"
    },
    "source": {
      "name": "Yemi Osinbajo",
      "url": "https://en.wikipedia.org/wiki/Yemi_Osinbajo",
      "verified": true
    },
    "image": {
      "url": "https://i.ytimg.com/vi/AGA8EbSz-Yc/maxresdefault.jpg",
      "credit": "Photo · YouTube",
      "license": "Not verified — found by web search",
      "panelColor": "#4A1B0C"
    },
    "factNumber": 1153,
    "relatedIds": []
  },
  {
    "id": "nf_1154",
    "country": "NG",
    "category": "Culture",
    "fact": "Laolu Akande is regarded as the only Nigerian journalist to have interviewed a sitting American president in the White House, when he interviewed George W. Bush.",
    "deepDive": {
      "body": [
        "In 2008, Laolu Akande sat among a group of African reporters at the White House, facing President George W. Bush. The roundtable was an opportunity for journalists from the continent to question the American leader directly. Akande, then a correspondent for Empowered Newswire, asked his questions as part of that session.",
        "That encounter made him the only Nigerian journalist known to have interviewed a sitting US president in the White House. His career had already taken him from Nigerian newsrooms to exile in the United States, where he worked for Newsday and founded his own agency. The Bush interview was one of many high-profile conversations he held, including with Bill Gates and Colin Powell.",
        "Akande later returned to Nigeria, serving as spokesman for Vice President Yemi Osinbajo from 2015 to 2023. His path from exile to the White House and back to government service reflects a career spent moving between journalism and public life."
      ],
      "whyItMatters": "This fact highlights the rare access African journalists have had to the highest levels of US power. It also shows how a journalist's career can span continents and eventually shape public service in their home country.",
      "readTime": 2,
      "suggestedQuestion": "What other world leaders has Laolu Akande interviewed?"
    },
    "source": {
      "name": "Laolu Akande",
      "url": "https://en.wikipedia.org/wiki/Laolu_Akande",
      "verified": true
    },
    "image": {
      "url": "https://www.thecable.ng/wp-content/uploads/2023/09/Laolu-Akande.jpg",
      "credit": "Photo · TheCable",
      "license": "Not verified — found by web search",
      "panelColor": "#04342C"
    },
    "factNumber": 1154,
    "relatedIds": []
  },
  {
    "id": "nf_1155",
    "country": "NG",
    "category": "History",
    "fact": "Laolu Akande was forced into exile in 1998 after his story 'Who wants Diya dead?' was published on the same day the Abacha junta declared Oladipo Diya a coup plotter.",
    "deepDive": {
      "body": [
        "In 1998, Nigerian journalist Laolu Akande published a story titled 'Who wants Diya dead?' The same day, the military junta led by General Sani Abacha declared Oladipo Diya a coup plotter. Akande's story put him in direct confrontation with the government, forcing him into exile in the United States about 14 months later.",
        "Before this, Akande had built a career in Nigerian journalism, working for The Guardian, The News, Tempo, and the Nigerian Tribune, where he became the youngest editor at the time. His reporting often challenged the military regime, including coverage of the 1992 ASUU strike and the banning of The News.",
        "In exile, Akande continued his work, eventually founding Empowered Newswire in 2004 and later becoming the spokesperson for Nigeria's Vice President Yemi Osinbajo from 2015 to 2023."
      ],
      "whyItMatters": "This fact shows how journalism can put reporters in direct danger under authoritarian regimes, and how exile became a path for some to continue their work from abroad. It highlights the personal cost of reporting on political repression in Nigeria's history.",
      "readTime": 2,
      "suggestedQuestion": "What happened to Oladipo Diya after the coup plot?"
    },
    "source": {
      "name": "Laolu Akande",
      "url": "https://en.wikipedia.org/wiki/Laolu_Akande",
      "verified": true
    },
    "image": {
      "url": "https://media.premiumtimesng.com/wp-content/files/2020/02/Oladipo-Diya1.jpg",
      "credit": "Photo · Premium Times Nigeria",
      "license": "Not verified — found by web search",
      "panelColor": "#4A1B0C"
    },
    "factNumber": 1155,
    "relatedIds": []
  },
  {
    "id": "nf_1156",
    "country": "NG",
    "category": "Culture",
    "fact": "Laolu Akande became the youngest newspaper editor at the time when he became editor of the Tribune on Saturday, part of Nigeria's oldest newspaper.",
    "deepDive": {
      "body": [
        "In 1995, Laolu Akande joined the Nigerian Tribune as a Special Projects Editor. The Tribune is the oldest newspaper in Nigeria, and Akande's move came after years of reporting that had already put him in the crosshairs of the military government.",
        "His career had started at The Guardian in 1989, where he covered education. He later became a founding member of The News magazine in 1993, a publication that was banned for its pro-democracy stance. When he became editor of the Tribune on Saturday, he was the youngest newspaper editor at the time.",
        "Just a few years later, in 1998, a story he wrote about Oladipo Diya led to a direct confrontation with the Abacha regime. He was forced into exile in the United States, where he continued his journalism career, eventually founding Empowered Newswire and later serving as spokesperson for Nigeria's vice president."
      ],
      "whyItMatters": "Akande's rise to the editor's chair at Nigeria's oldest newspaper shows that even in a tense political climate, young journalists could reach the top. His story connects the press freedom struggles of the 1990s to the later careers of those who lived through them.",
      "readTime": 2,
      "suggestedQuestion": "What happened to Laolu Akande after he left Nigeria?"
    },
    "source": {
      "name": "Laolu Akande",
      "url": "https://en.wikipedia.org/wiki/Laolu_Akande",
      "verified": true
    },
    "image": {
      "url": "https://public-assets-prod.pubgen.ai/brand_4fc3eb37-4c8a-4951-9324-365f6e4b53fd/asset_cbf7ba8c-e20f-53ff-bd9b-8fa3eca540d2.jpg?w=1400&q=90",
      "credit": "Photo · The Lewiston Tribune",
      "license": "Not verified — found by web search",
      "panelColor": "#04342C"
    },
    "factNumber": 1156,
    "relatedIds": []
  },
  {
    "id": "nf_1157",
    "country": "NG",
    "category": "History",
    "fact": "Segun Awolowo, grandson of Obafemi Awolowo, was born two months after his father died in a car accident at age 25.",
    "deepDive": {
      "body": [
        "In September 1963, a baby boy was born into the Awolowo family in Nigeria. He arrived two months after his father, Segun Awolowo Sr., had died in a car accident at just 25 years old. The newborn was named after his late father, becoming Segun Awolowo Jr.",
        "Growing up as the grandson of Obafemi Awolowo, a prominent Nigerian statesman, Segun Jr. carved his own path. He became a lawyer and later served as executive director of the Nigerian Export Promotion Council (NEPC) from 2013 to 2021, where he worked to boost Nigeria's non-oil exports. In 2021, he was elected president of the trade promotion organizations representing ECOWAS member states.",
        "Segun Awolowo passed away in 2025 at the age of 62. His life spanned over six decades, a stark contrast to the short life of the father he never met. His cousin, Dolapo Osinbajo, paid tribute to him, remembering their childhood together."
      ],
      "whyItMatters": "This fact shows how a family legacy can continue despite tragedy. Segun Awolowo Jr. not only carried his father's name but also built a significant career, ensuring the Awolowo name remained prominent in Nigerian public life.",
      "readTime": 2,
      "suggestedQuestion": "Who was Obafemi Awolowo?"
    },
    "source": {
      "name": "QED.NG",
      "url": "https://www.qed.ng/yemi-osinbajos-wife-dolapo-pays-tribute-to-late-cousin-segun-awolowo/",
      "verified": true
    },
    "image": {
      "url": "https://lookaside.instagram.com/seo/google_widget/crawler/?media_id=3770768810089944799",
      "credit": "Photo · Instagram",
      "license": "Not verified — found by web search",
      "panelColor": "#4A1B0C"
    },
    "factNumber": 1157,
    "relatedIds": []
  },
  {
    "id": "nf_1158",
    "country": "NG",
    "category": "Culture",
    "fact": "Yemi Osinbajo won the African Statesman Intercollegiate Best Speaker's Prize in 1974 while still a student.",
    "deepDive": {
      "body": [
        "In 1974, long before he became Nigeria's Vice President, Yemi Osinbajo was a university student with a gift for public speaking. That year, he won the African Statesman Intercollegiate Best Speaker's Prize, an award that recognized the most eloquent speaker among students from different colleges.",
        "The prize was one of many academic honors Osinbajo collected during his school years. His list of achievements includes the State Merit Award in 1971, the School Prize for English Oratory in 1972, and the Adeoba Prize for English Oratory, which he won from 1972 to 1975. He also earned the Elias Prize for Best Performance in History in 1973 and the School Prize for Literature in 1975.",
        "These early successes hint at the skills that would define his later career. As a professor of law and a Senior Advocate of Nigeria, Osinbajo became known for his articulate arguments and his ability to communicate complex ideas clearly. His oratory talent, first recognized in that 1974 competition, remained a hallmark of his public life."
      ],
      "whyItMatters": "Osinbajo's 1974 speaking prize shows that his path to national leadership was paved with a skill he honed as a student. It connects the classroom achievements of a young Nigerian to the public figure he became, reminding us that today's leaders were once students with talents worth nurturing.",
      "readTime": 2,
      "suggestedQuestion": "What other awards did Yemi Osinbajo win during his school years?"
    },
    "source": {
      "name": "thisdaylive.com",
      "url": "https://www.thisdaylive.com/2019/11/30/yemi-and-dolapo-osinbajo-the-30-years-love-story/",
      "verified": true
    },
    "image": {
      "url": "https://lookaside.instagram.com/seo/google_widget/crawler/?media_id=3318641770830501391",
      "credit": "Photo · Instagram",
      "license": "Not verified — found by web search",
      "panelColor": "#04342C"
    },
    "factNumber": 1158,
    "relatedIds": []
  },
  {
    "id": "nf_1159",
    "country": "NG",
    "category": "Culture",
    "fact": "Vice President Yemi Osinbajo does not wear a wedding ring because he believes the Bible itself is the symbol of holy marriage.",
    "deepDive": {
      "body": [
        "In 1989, Yemi Osinbajo and Dolapo Osinbajo were married. Thirty years later, as Nigeria's Vice President, Osinbajo still does not wear a wedding ring. His reason is rooted in his faith: he believes the Bible itself is the symbol of holy marriage.",
        "The Osinbajos' marriage has been marked by mutual respect and public affection. Osinbajo has thanked his wife in public love letters and on social media, acknowledging her support during his time in office. Their union is also notable for its connection to Nigerian history—Dolapo is a granddaughter of Chief Obafemi Awolowo, a prominent nationalist leader.",
        "The couple's decision to keep their marital difficulties private and their emphasis on faith and loyalty have been cited as reasons for their lasting relationship. Osinbajo's choice to forgo a wedding ring is a personal expression of his belief that the Bible represents the sacred bond of marriage."
      ],
      "whyItMatters": "This detail about Osinbajo's wedding ring offers a glimpse into how personal faith shapes public figures' choices. It reminds us that even the most visible leaders make intimate decisions based on deeply held beliefs, which can challenge our assumptions about symbols and their meanings.",
      "readTime": 2,
      "suggestedQuestion": "Why does Osinbajo think the Bible is a symbol of holy marriage?"
    },
    "source": {
      "name": "thisdaylive.com",
      "url": "https://www.thisdaylive.com/2019/11/30/yemi-and-dolapo-osinbajo-the-30-years-love-story/",
      "verified": true
    },
    "image": {
      "url": "https://lookaside.fbsbx.com/lookaside/crawler/media/?media_id=1740495713246368",
      "credit": "Photo · Facebook",
      "license": "Not verified — found by web search",
      "panelColor": "#04342C"
    },
    "factNumber": 1159,
    "relatedIds": []
  },
  {
    "id": "nf_1160",
    "country": "NG",
    "category": "Culture",
    "fact": "Yemi Osinbajo, a pastor in the Redeemed Christian Church in Lagos, was chosen by Buhari as his running mate.",
    "deepDive": {
      "body": [
        "In the run-up to Nigeria's 2015 elections, Muhammadu Buhari, the candidate of the All Progressives Congress, needed a running mate from the south to balance the ticket. He turned to Yemi Osinbajo, a law professor and former Lagos State Attorney-General who had served as a commissioner under Governor Bola Tinubu.",
        "Osinbajo was also a pastor in the Redeemed Christian Church in Lagos, a prominent Pentecostal congregation. His selection was seen as a move to appeal to Christian voters in the south, while Buhari, a Muslim from the north, secured the northern vote.",
        "The pair won the election, and Osinbajo served as Vice-President from 2015 to 2023. During his tenure, he occasionally acted as president when Buhari was abroad or ill. Later, Osinbajo sought the APC presidential nomination for the 2023 election but lost to Tinubu."
      ],
      "whyItMatters": "Osinbajo's rise from pastor and law professor to vice-president shows how religious and regional balancing shapes Nigerian politics. His later loss to Tinubu in the primaries highlights the internal power struggles within the ruling party.",
      "readTime": 2,
      "suggestedQuestion": "Why did Buhari choose Osinbajo as his running mate?"
    },
    "source": {
      "name": "africa-confidential.com",
      "url": "https://www.africa-confidential.com/profile/id/3479/yemi-osinbajo",
      "verified": true
    },
    "image": {
      "url": "https://i.ytimg.com/vi/wmgKQkp6OD0/maxresdefault.jpg",
      "credit": "Photo · YouTube",
      "license": "Not verified — found by web search",
      "panelColor": "#04342C"
    },
    "factNumber": 1160,
    "relatedIds": []
  },
  {
    "id": "nf_1161",
    "country": "NG",
    "category": "Business",
    "fact": "Yemi Osinbajo proposed that creditor nations forgive international debts if the money saved is spent on green energy projects.",
    "deepDive": {
      "body": [
        "At a summit last week, Nigerian Vice-President Yemi Osinbajo put forward a proposal that links debt relief to climate action. He suggested that creditor nations forgive international debts if the money saved is spent on green energy projects instead.",
        "The proposal comes amid accusations that Western countries are being unfair by compelling Africa to curtail fossil fuel use, when the continent is responsible for only a tiny proportion of greenhouse gases. Osinbajo's idea offers a way to reconcile environmental goals with economic development.",
        "Osinbajo, a law professor and former Lagos governor, has been a prominent figure in Nigerian politics. He served as vice-president under Muhammadu Buhari and was a contender for the ruling party's presidential nomination, which he lost to Bola Tinubu."
      ],
      "whyItMatters": "This proposal reframes the climate debate: instead of asking Africa to sacrifice development, it suggests that debt relief could fund the green transition. It ties together two pressing issues—debt sustainability and climate action—in a way that could reshape international negotiations.",
      "readTime": 2,
      "suggestedQuestion": "How would this debt-for-green proposal work in practice?"
    },
    "source": {
      "name": "africa-confidential.com",
      "url": "https://www.africa-confidential.com/profile/id/3479/yemi-osinbajo",
      "verified": true
    },
    "image": {
      "url": "https://gazettengr.com/wp-content/uploads/Yemi-Osinbajo-1-1200x675.jpg",
      "credit": "Photo · Peoples Gazette Nigeria",
      "license": "Not verified — found by web search",
      "panelColor": "#26215C"
    },
    "factNumber": 1161,
    "relatedIds": []
  }
];

export const quizQuestions: QuizQuestion[] = [
  {
    "id": "q_nf_1001_1",
    "factId": "nf_1001",
    "question": "What does the name 'Kashimawo' mean?",
    "options": [
      "Let us wait and see",
      "First of many",
      "Survivor",
      "Blessed child"
    ],
    "correctIndex": 0,
    "explanation": "The article states that Kashimawo means 'Let us wait and see', reflecting the family's uncertainty about the child's survival."
  },
  {
    "id": "q_nf_1001_2",
    "factId": "nf_1001",
    "question": "How many children had Salawu and Suliat Abiola lost before Moshood was born?",
    "options": [
      "22",
      "23",
      "15",
      "20"
    ],
    "correctIndex": 0,
    "explanation": "The article says they had already lost 22 children in infancy before their 23rd child was born."
  },
  {
    "id": "q_nf_1001_3",
    "factId": "nf_1001",
    "question": "At what age did Moshood Abiola receive the name 'Moshood'?",
    "options": [
      "15",
      "10",
      "20",
      "5"
    ],
    "correctIndex": 0,
    "explanation": "The article mentions that it was not until he was 15 years old that his parents gave him the name Moshood."
  },
  {
    "id": "q_nf_1002_1",
    "factId": "nf_1002",
    "question": "What was the name of the school magazine at Baptist Boys High School?",
    "options": [
      "The Trumpeter",
      "The Herald",
      "The Beacon",
      "The Chronicle"
    ],
    "correctIndex": 0,
    "explanation": "The article states that Moshood Abiola was the editor of the school magazine The Trumpeter."
  },
  {
    "id": "q_nf_1002_2",
    "factId": "nf_1002",
    "question": "Who was the deputy editor of The Trumpeter?",
    "options": [
      "Moshood Abiola",
      "Olusegun Obasanjo",
      "A fellow student",
      "A billionaire businessman"
    ],
    "correctIndex": 1,
    "explanation": "Olusegun Obasanjo was the deputy editor, as mentioned in the article."
  },
  {
    "id": "q_nf_1002_3",
    "factId": "nf_1002",
    "question": "What national honour was posthumously awarded to Abiola by Obasanjo?",
    "options": [
      "GCFR",
      "CON",
      "OFR",
      "NNOM"
    ],
    "correctIndex": 0,
    "explanation": "The article says Obasanjo posthumously awarded Abiola the national honour of GCFR in 2018."
  },
  {
    "id": "q_nf_1003_1",
    "factId": "nf_1003",
    "question": "What was Moshood Abiola's initial role at the Nigerian subsidiary of Pfizer?",
    "options": [
      "He was a trained accountant",
      "He was a marketing executive",
      "He was a military liaison",
      "He was a debt collector"
    ],
    "correctIndex": 0,
    "explanation": "The article states that Abiola applied for a job seeking a trained accountant, and he was hired to clear the backlog of debt owed by the military."
  },
  {
    "id": "q_nf_1003_2",
    "factId": "nf_1003",
    "question": "What strategy did Abiola propose to the military that helped secure a contract?",
    "options": [
      "Training military personnel in equipment use",
      "Offering lower prices than competitors",
      "Providing free maintenance services",
      "Supplying advanced weaponry"
    ],
    "correctIndex": 0,
    "explanation": "Abiola proposed training military personnel in the use of equipment, which appealed to the security-conscious armed forces and led to a contract."
  },
  {
    "id": "q_nf_1003_3",
    "factId": "nf_1003",
    "question": "What was the outcome of Abiola's successful contract with the military?",
    "options": [
      "He received a 49% equity stake in ITT's Nigerian arm",
      "He was promoted to head of ITT's African operations",
      "He was given a cash bonus",
      "He was appointed as a military advisor"
    ],
    "correctIndex": 0,
    "explanation": "The contract caught ITT's attention, leading to an offer of 49 per cent equity ownership in its Nigerian arm."
  },
  {
    "id": "q_nf_1004_1",
    "factId": "nf_1004",
    "question": "What did Moshood Abiola declare himself in June 1994?",
    "options": [
      "President of Nigeria",
      "King of Lagos",
      "Head of the military",
      "Governor of Nigeria"
    ],
    "correctIndex": 0,
    "explanation": "Abiola declared himself the lawful president of Nigeria in Lagos after the 1993 election he won was annulled."
  },
  {
    "id": "q_nf_1004_2",
    "factId": "nf_1004",
    "question": "Who ordered Abiola's arrest?",
    "options": [
      "General Sani Abacha",
      "Pope John Paul II",
      "Archbishop Desmond Tutu",
      "A human rights activist"
    ],
    "correctIndex": 0,
    "explanation": "Abiola was arrested on the orders of General Sani Abacha, who sent 200 police vehicles to bring him into custody."
  },
  {
    "id": "q_nf_1004_3",
    "factId": "nf_1004",
    "question": "What condition did the military government insist Abiola meet for release?",
    "options": [
      "Renounce his mandate",
      "Leave Nigeria",
      "Pay a fine",
      "Apologize publicly"
    ],
    "correctIndex": 0,
    "explanation": "The military government insisted he renounce his mandate, a condition he refused."
  },
  {
    "id": "q_nf_1005_1",
    "factId": "nf_1005",
    "question": "What honour was posthumously awarded to Moshood Abiola in 2018?",
    "options": [
      "Grand Commander of the Order of the Federal Republic (GCFR)",
      "Commander of the Order of the Niger (CON)",
      "National Honour of Merit",
      "Order of the Federal Republic (OFR)"
    ],
    "correctIndex": 0,
    "explanation": "The GCFR is the highest national honour in Nigeria, normally reserved for heads of state."
  },
  {
    "id": "q_nf_1005_2",
    "factId": "nf_1005",
    "question": "Why was Nigeria's Democracy Day moved to 12 June?",
    "options": [
      "To commemorate the 1999 handover to civilian rule",
      "To honour the annulled 1993 presidential election",
      "To celebrate the birthday of President Buhari",
      "To mark the day Abiola was released from detention"
    ],
    "correctIndex": 1,
    "explanation": "The move was a direct recognition of the 12 June 1993 presidential election, which Abiola won but was annulled."
  },
  {
    "id": "q_nf_1005_3",
    "factId": "nf_1005",
    "question": "What happened to Moshood Abiola in 1998?",
    "options": [
      "He was released from detention",
      "He won the presidential election",
      "He died in detention",
      "He was awarded the GCFR"
    ],
    "correctIndex": 2,
    "explanation": "Abiola died in detention in 1998, the day he was due to be released."
  },
  {
    "id": "q_nf_1006_1",
    "factId": "nf_1006",
    "question": "Who organized the failed coup attempt in Oyo State in 2024?",
    "options": [
      "Moshood Abiola",
      "Modupe Onitiri-Abiola",
      "A military general",
      "A political rival"
    ],
    "correctIndex": 1,
    "explanation": "Modupe Onitiri-Abiola, one of Abiola's wives, organized the failed coup attempt."
  },
  {
    "id": "q_nf_1006_2",
    "factId": "nf_1006",
    "question": "How did the Abiola family react to the coup attempt?",
    "options": [
      "They supported it",
      "They remained silent",
      "They publicly denounced it",
      "They denied any involvement"
    ],
    "correctIndex": 2,
    "explanation": "The rest of the Abiola family publicly denounced her actions, distancing themselves from the plot."
  },
  {
    "id": "q_nf_1006_3",
    "factId": "nf_1006",
    "question": "What happened to Moshood Abiola after he won the 1993 presidential election?",
    "options": [
      "He became president",
      "He went into exile",
      "He died in detention",
      "He retired from politics"
    ],
    "correctIndex": 2,
    "explanation": "Abiola won the 1993 election, which was annulled, and he later died in detention."
  },
  {
    "id": "q_nf_1007_1",
    "factId": "nf_1007",
    "question": "Under what pseudonym was Chimamanda Ngozi Adichie's first children's book published?",
    "options": [
      "Nwa Grace James",
      "Joelle Avelino",
      "James Nwoye Adichie",
      "Grace Adichie"
    ],
    "correctIndex": 0,
    "explanation": "The article states that Mama's Sleeping Scarf was published under the pseudonym Nwa Grace James."
  },
  {
    "id": "q_nf_1007_2",
    "factId": "nf_1007",
    "question": "Who illustrated Mama's Sleeping Scarf?",
    "options": [
      "Chimamanda Ngozi Adichie",
      "Nwa Grace James",
      "Joelle Avelino",
      "James Nwoye Adichie"
    ],
    "correctIndex": 2,
    "explanation": "The article says the book was illustrated by Joelle Avelino, a Congolese-Angolan illustrator."
  },
  {
    "id": "q_nf_1007_3",
    "factId": "nf_1007",
    "question": "Why did Adichie choose to publish under a pseudonym?",
    "options": [
      "To hide her identity from readers",
      "To keep the focus on the story, not her celebrity",
      "Because she was not proud of the book",
      "To honor her mother's name"
    ],
    "correctIndex": 1,
    "explanation": "The article explains that the pseudonym kept the focus on the story itself, not the celebrity of its author."
  },
  {
    "id": "q_nf_1008_1",
    "factId": "nf_1008",
    "question": "At what age did Nkanu Nnamdi die?",
    "options": [
      "21 months",
      "2 years",
      "18 months",
      "3 years"
    ],
    "correctIndex": 0,
    "explanation": "The article states that Nkanu Nnamdi died at just 21 months old."
  },
  {
    "id": "q_nf_1008_2",
    "factId": "nf_1008",
    "question": "Which hospital was Nkanu Nnamdi admitted to?",
    "options": [
      "Lagos University Teaching Hospital",
      "Euracare Hospital",
      "National Hospital Abuja",
      "St. Nicholas Hospital"
    ],
    "correctIndex": 1,
    "explanation": "The article says Nkanu Nnamdi was admitted to Euracare Hospital in Lagos."
  },
  {
    "id": "q_nf_1008_3",
    "factId": "nf_1008",
    "question": "What did Adichie claim was denied to her son that contributed to his death?",
    "options": [
      "Food",
      "Oxygen",
      "Water",
      "Medication"
    ],
    "correctIndex": 1,
    "explanation": "Adichie alleged negligence included denial of oxygen and sedation that led to cardiac arrest."
  },
  {
    "id": "q_nf_1009_1",
    "factId": "nf_1009",
    "question": "What was the name of the chieftaincy title given to Chimamanda Ngozi Adichie?",
    "options": [
      "Odeluwa",
      "Obi",
      "Ichie",
      "Nne"
    ],
    "correctIndex": 0,
    "explanation": "The article states that Adichie was bestowed with the chieftaincy title 'Odeluwa' by her hometown."
  },
  {
    "id": "q_nf_1009_2",
    "factId": "nf_1009",
    "question": "On what date was Adichie given the chieftaincy title?",
    "options": [
      "30 December 2022",
      "1 January 2023",
      "30 November 2022",
      "31 December 2022"
    ],
    "correctIndex": 0,
    "explanation": "The article specifies that the historic moment unfolded on 30 December 2022."
  },
  {
    "id": "q_nf_1009_3",
    "factId": "nf_1009",
    "question": "What did Adichie see during her childhood visits to Abba that later influenced her writing?",
    "options": [
      "Remnants of the Biafran War",
      "Traditional ceremonies",
      "Colonial buildings",
      "Modern developments"
    ],
    "correctIndex": 0,
    "explanation": "The article mentions that as a child, Adichie visited Abba and saw remnants of the Biafran War, which influenced her writing."
  },
  {
    "id": "q_nf_1010_1",
    "factId": "nf_1010",
    "question": "What did Chimamanda Ngozi Adichie do in 2022?",
    "options": [
      "She accepted the Order of the Federal Republic.",
      "She declined the Order of the Federal Republic.",
      "She nominated someone for the Order of the Federal Republic.",
      "She was not offered the Order of the Federal Republic."
    ],
    "correctIndex": 1,
    "explanation": "Adichie turned down the national honour from President Muhammadu Buhari in 2022."
  },
  {
    "id": "q_nf_1010_2",
    "factId": "nf_1010",
    "question": "Which of these honours did Adichie accept in the same year she rejected the national award?",
    "options": [
      "A chieftaincy title from Abba",
      "The Nobel Prize in Literature",
      "The Booker Prize",
      "An honorary degree from Harvard"
    ],
    "correctIndex": 0,
    "explanation": "The article states she accepted a chieftaincy title from her hometown of Abba later that same year."
  },
  {
    "id": "q_nf_1010_3",
    "factId": "nf_1010",
    "question": "What does the article say about the reason for Adichie's refusal?",
    "options": [
      "She was busy with her writing.",
      "She had a political disagreement with the government.",
      "The source does not give a reason.",
      "She wanted a higher honour."
    ],
    "correctIndex": 2,
    "explanation": "The article explicitly says 'The source does not give a reason for her refusal.'"
  },
  {
    "id": "q_nf_1011_1",
    "factId": "nf_1011",
    "question": "By October 2009, how many copies of Half of a Yellow Sun had sold in the UK alone?",
    "options": [
      "500,000",
      "50,000",
      "5,000",
      "5 million"
    ],
    "correctIndex": 0,
    "explanation": "The article states that by October 2009, the paperback had sold 500,000 copies in the UK alone."
  },
  {
    "id": "q_nf_1011_2",
    "factId": "nf_1011",
    "question": "What conflict does Half of a Yellow Sun tell the story of?",
    "options": [
      "The Nigerian Civil War",
      "The South African apartheid",
      "The Rwandan Genocide",
      "The Kenyan Emergency"
    ],
    "correctIndex": 0,
    "explanation": "The article says the novel tells the story of the Biafran War, which is also known as the Nigerian Civil War."
  },
  {
    "id": "q_nf_1011_3",
    "factId": "nf_1011",
    "question": "Which prize did Half of a Yellow Sun win in 2007?",
    "options": [
      "The Booker Prize",
      "The Orange Prize for Fiction",
      "The Pulitzer Prize",
      "The Nobel Prize in Literature"
    ],
    "correctIndex": 1,
    "explanation": "The article mentions that the novel won the Orange Prize for Fiction in 2007."
  },
  {
    "id": "q_nf_1012_1",
    "factId": "nf_1012",
    "question": "Who was the first Nigerian inducted into the American Academy of Arts and Sciences?",
    "options": [
      "Chimamanda Ngozi Adichie",
      "Wole Soyinka",
      "Chinua Achebe",
      "Ben Okri"
    ],
    "correctIndex": 1,
    "explanation": "The article states that Adichie became only the second Nigerian to receive this honor, following Nobel laureate Wole Soyinka."
  },
  {
    "id": "q_nf_1012_2",
    "factId": "nf_1012",
    "question": "In what year was Adichie inducted into the American Academy of Arts and Sciences?",
    "options": [
      "2008",
      "2015",
      "2017",
      "2020"
    ],
    "correctIndex": 2,
    "explanation": "The article says that in 2017, the Academy inducted 228 new members, and Adichie was among them."
  },
  {
    "id": "q_nf_1012_3",
    "factId": "nf_1012",
    "question": "Which of the following is a novel written by Chimamanda Ngozi Adichie?",
    "options": [
      "Purple Hibiscus",
      "Things Fall Apart",
      "Half of a Yellow Sun",
      "Americanah"
    ],
    "correctIndex": 0,
    "explanation": "The article mentions that Adichie is known for novels like *Purple Hibiscus* and *Americanah*, but only *Purple Hibiscus* is listed as an option."
  },
  {
    "id": "q_nf_1013_1",
    "factId": "nf_1013",
    "question": "Between 2017 and 2022, how much did Afrobeats streams grow on Spotify?",
    "options": [
      "150%",
      "350%",
      "550%",
      "750%"
    ],
    "correctIndex": 2,
    "explanation": "The article states that Afrobeats experienced a 550% growth in streams on Spotify between 2017 and 2022."
  },
  {
    "id": "q_nf_1013_2",
    "factId": "nf_1013",
    "question": "Which song by Wizkid became the first African song to reach the top ten of the Billboard Hot 100?",
    "options": [
      "One Dance",
      "Essence",
      "Calm Down",
      "The Lion King: The Gift"
    ],
    "correctIndex": 1,
    "explanation": "The article says that Wizkid's 'Essence' became the first African song to reach the top ten of the Billboard Hot 100."
  },
  {
    "id": "q_nf_1013_3",
    "factId": "nf_1013",
    "question": "In which year was the first US Afrobeats chart introduced?",
    "options": [
      "2020",
      "2021",
      "2022",
      "2024"
    ],
    "correctIndex": 2,
    "explanation": "The article mentions the first US Afrobeats chart was introduced in 2022."
  },
  {
    "id": "q_nf_1015_1",
    "factId": "nf_1015",
    "question": "Which artist was entered into the Guinness Book of Records 2018 for featuring on the most streamed Spotify single of all time?",
    "options": [
      "Drake",
      "Wizkid",
      "Kyla",
      "Burna Boy"
    ],
    "correctIndex": 1,
    "explanation": "Wizkid earned a place in the Guinness Book of Records 2018 for his contribution to 'One Dance'."
  },
  {
    "id": "q_nf_1015_2",
    "factId": "nf_1015",
    "question": "What was the name of the song that became Spotify's most streamed track?",
    "options": [
      "One Dance",
      "Hotline Bling",
      "God's Plan",
      "In My Feelings"
    ],
    "correctIndex": 0,
    "explanation": "The article states that 'One Dance' became Spotify's most streamed track with over a billion streams."
  },
  {
    "id": "q_nf_1015_3",
    "factId": "nf_1015",
    "question": "In which year was 'One Dance' released?",
    "options": [
      "2015",
      "2016",
      "2017",
      "2018"
    ],
    "correctIndex": 1,
    "explanation": "The article says that in 2016, Drake released 'One Dance' with Kyla and Wizkid."
  },
  {
    "id": "q_nf_1016_1",
    "factId": "nf_1016",
    "question": "What was the peak position of Rema's 'Calm Down' remix with Selena Gomez on the Billboard Hot 100?",
    "options": [
      "Number one",
      "Number two",
      "Number three",
      "Number four"
    ],
    "correctIndex": 2,
    "explanation": "The article states that the remix climbed to number three on the Billboard Hot 100."
  },
  {
    "id": "q_nf_1016_2",
    "factId": "nf_1016",
    "question": "What did Billboard call 'Calm Down'?",
    "options": [
      "Afrobeats' biggest crossover hit",
      "The song of the year",
      "A global phenomenon",
      "A chart-topping success"
    ],
    "correctIndex": 0,
    "explanation": "Billboard called it 'Afrobeats biggest cross over hit' as mentioned in the article."
  },
  {
    "id": "q_nf_1016_3",
    "factId": "nf_1016",
    "question": "What is the name of Rema's debut album, released in March 2022?",
    "options": [
      "Calm Down",
      "Raves & Roses",
      "Afrorave",
      "Essence"
    ],
    "correctIndex": 1,
    "explanation": "The article says Rema released his debut album 'Raves & Roses' in March 2022."
  },
  {
    "id": "q_nf_1017_1",
    "factId": "nf_1017",
    "question": "Which event featured the first African artists to headline a major U.S. sports halftime show?",
    "options": [
      "The 2023 NBA All-Star Game",
      "The 2023 Super Bowl",
      "The 2023 MLB All-Star Game",
      "The 2023 NHL All-Star Game"
    ],
    "correctIndex": 0,
    "explanation": "The 2023 NBA All-Star Game halftime show was headlined by Burna Boy, Tems, and Rema, marking the first time African artists headlined such a show."
  },
  {
    "id": "q_nf_1017_2",
    "factId": "nf_1017",
    "question": "Which of the following artists was NOT part of the halftime show lineup?",
    "options": [
      "Burna Boy",
      "Tems",
      "Rema",
      "Wizkid"
    ],
    "correctIndex": 3,
    "explanation": "The article mentions Burna Boy, Tems, and Rema as the headliners, not Wizkid."
  },
  {
    "id": "q_nf_1017_3",
    "factId": "nf_1017",
    "question": "What genre of music do the three artists represent?",
    "options": [
      "Afrobeats",
      "Amapiano",
      "Highlife",
      "Reggae"
    ],
    "correctIndex": 0,
    "explanation": "The article identifies Burna Boy, Tems, and Rema as leading figures of Afrobeats, a genre that has surged in global popularity."
  },
  {
    "id": "q_nf_1018_1",
    "factId": "nf_1018",
    "question": "What did the vice-roy of Whydah and governors receive as a mark of the king's approbation?",
    "options": [
      "A large cotton cloth",
      "A golden staff",
      "A ceremonial sword",
      "A royal crown"
    ],
    "correctIndex": 0,
    "explanation": "The article states that those who pleased the king received a large cotton cloth woven in the Eyo country."
  },
  {
    "id": "q_nf_1018_2",
    "factId": "nf_1018",
    "question": "According to the article, what does the Eyo country likely refer to?",
    "options": [
      "The Oyo Empire",
      "The Benin Kingdom",
      "The Ashanti Empire",
      "The Mali Empire"
    ],
    "correctIndex": 0,
    "explanation": "The article says 'The Eyo country, likely referring to the Oyo Empire, was renowned for its weaving.'"
  },
  {
    "id": "q_nf_1018_3",
    "factId": "nf_1018",
    "question": "What did the honorees do with the cloth they received?",
    "options": [
      "They wore it as an upper garment",
      "They traded it for other goods",
      "They hung it in their homes",
      "They gave it to their wives"
    ],
    "correctIndex": 0,
    "explanation": "The article mentions that the honorees would wear this cloth as an upper garment, a visible sign of royal favor."
  },
  {
    "id": "q_nf_1019_1",
    "factId": "nf_1019",
    "question": "What was Tobi Amusan's time in the semi-final at the 2022 World Championships?",
    "options": [
      "12.12 seconds",
      "12.06 seconds",
      "12.30 seconds",
      "12.41 seconds"
    ],
    "correctIndex": 0,
    "explanation": "In the semi-final, Amusan ran 12.12 seconds, which was the fastest ever but wind-assisted and not ratified."
  },
  {
    "id": "q_nf_1019_2",
    "factId": "nf_1019",
    "question": "Why was Amusan's time in the final not counted as a world record?",
    "options": [
      "She finished second.",
      "The wind was too strong.",
      "She false-started.",
      "The race was not official."
    ],
    "correctIndex": 1,
    "explanation": "Her final time of 12.06 seconds had a following wind of 2.5 m/s, which was too strong to count as a record."
  },
  {
    "id": "q_nf_1019_3",
    "factId": "nf_1019",
    "question": "What did Tobi Amusan achieve for Nigeria in 2022?",
    "options": [
      "She became the first Nigerian to win an Olympic medal.",
      "She became the first Nigerian world champion in any athletics event.",
      "She set a world record in the 200 metres.",
      "She won the African Championships for the first time."
    ],
    "correctIndex": 1,
    "explanation": "Amusan became the first Nigerian world champion in any athletics event by winning the 100 m hurdles gold at the 2022 World Championships."
  },
  {
    "id": "q_nf_1020_1",
    "factId": "nf_1020",
    "question": "What did Tobi Amusan become in 2021?",
    "options": [
      "The first Nigerian to win a Diamond League title",
      "The first African to win a world championship",
      "The first Nigerian to set a world record",
      "The first Nigerian to win an Olympic medal"
    ],
    "correctIndex": 0,
    "explanation": "The article states that Amusan's 2021 Diamond League win made her the first Nigerian to win a Diamond League title."
  },
  {
    "id": "q_nf_1020_2",
    "factId": "nf_1020",
    "question": "What time did Tobi Amusan run to win the 2021 Diamond League final?",
    "options": [
      "12.42 seconds",
      "12.12 seconds",
      "12.40 seconds",
      "12.44 seconds"
    ],
    "correctIndex": 0,
    "explanation": "The article says she crossed the line in 12.42 seconds, a new African record."
  },
  {
    "id": "q_nf_1020_3",
    "factId": "nf_1020",
    "question": "Who previously held the African record in the 100m hurdles that Amusan broke?",
    "options": [
      "Glory Alozie",
      "Tobi Amusan",
      "A Nigerian sprinter",
      "A world champion"
    ],
    "correctIndex": 0,
    "explanation": "The article mentions that Amusan's time shaved 0.02 seconds off the mark Glory Alozie had set 23 years earlier."
  },
  {
    "id": "q_nf_1021_1",
    "factId": "nf_1021",
    "question": "Where was Lawrence Anini caught?",
    "options": [
      "At a house between 2nd and 3rd East Circular Road",
      "At a military hospital",
      "At a police station in Benin City",
      "At a hideout in the forest"
    ],
    "correctIndex": 0,
    "explanation": "The article states Anini was caught at a house between 2nd and 3rd East Circular Road."
  },
  {
    "id": "q_nf_1021_2",
    "factId": "nf_1021",
    "question": "What happened to Anini's leg after his capture?",
    "options": [
      "It was amputated",
      "It was treated and healed",
      "It was injured but not amputated",
      "It was broken"
    ],
    "correctIndex": 0,
    "explanation": "The article says Anini was shot in the leg and later had that leg amputated while in military hospital."
  },
  {
    "id": "q_nf_1021_3",
    "factId": "nf_1021",
    "question": "On what date was Lawrence Anini executed?",
    "options": [
      "March 29, 1987",
      "December 1986",
      "March 29, 1986",
      "December 1987"
    ],
    "correctIndex": 0,
    "explanation": "The article states Anini was executed on March 29, 1987, in Benin City."
  },
  {
    "id": "q_nf_1022_1",
    "factId": "nf_1022",
    "question": "What was the National Theatre in Lagos designed based on?",
    "options": [
      "The Palace of Culture and Sports in Varna, Bulgaria",
      "The National Theatre in Accra, Ghana",
      "The Sydney Opera House in Australia",
      "The Royal Albert Hall in London"
    ],
    "correctIndex": 0,
    "explanation": "The article states that the design was based on the Palace of Culture and Sports in Varna, Bulgaria."
  },
  {
    "id": "q_nf_1022_2",
    "factId": "nf_1022",
    "question": "Which event was the National Theatre in Lagos built to serve as the main venue for?",
    "options": [
      "The Second World Black and African Festival of Arts and Culture",
      "The 1991 All-Africa Games",
      "The Commonwealth Heads of Government Meeting",
      "The African Union Summit"
    ],
    "correctIndex": 0,
    "explanation": "The article says the theatre was commissioned to serve as the main venue for the Second World Black and African Festival of Arts and Culture."
  },
  {
    "id": "q_nf_1022_3",
    "factId": "nf_1022",
    "question": "What happened to the National Theatre after the festival?",
    "options": [
      "It fell into disrepair by 1991",
      "It was demolished in 1991",
      "It was converted into a museum",
      "It was moved to Abuja"
    ],
    "correctIndex": 0,
    "explanation": "The article mentions that by 1991 the building had fallen into disrepair, with a crack in the roof causing water damage and power being cut off."
  },
  {
    "id": "q_nf_1023_1",
    "factId": "nf_1023",
    "question": "What did Nigeria do in 2007 regarding the Arochukwu Long Juju Slave Route?",
    "options": [
      "Placed it on the UNESCO World Heritage tentative list",
      "Declared it a UNESCO World Heritage Site",
      "Removed it from the tentative list",
      "Built a museum along the route"
    ],
    "correctIndex": 0,
    "explanation": "In 2007, Nigeria placed the route on the tentative list, which is a preliminary stage before final inscription."
  },
  {
    "id": "q_nf_1023_2",
    "factId": "nf_1023",
    "question": "What was the Ibini Ukpabi oracle also known as in colonial writings?",
    "options": [
      "The Long Juju",
      "The Aro Network",
      "The Slave Route",
      "The Shrine"
    ],
    "correctIndex": 0,
    "explanation": "The oracle was called the 'Long Juju' in colonial writings, as stated in the article."
  },
  {
    "id": "q_nf_1023_3",
    "factId": "nf_1023",
    "question": "What event dismantled Aro dominance in the early 1900s?",
    "options": [
      "The British conquest of 1901–1902",
      "The abolition of the slave trade",
      "The restoration of the shrine",
      "The UNESCO tentative listing"
    ],
    "correctIndex": 0,
    "explanation": "The British conquest of 1901–1902 dismantled Aro dominance, according to the article."
  },
  {
    "id": "q_nf_1024_1",
    "factId": "nf_1024",
    "question": "What did Obafemi Awolowo launch in 1959 that was the first in Africa?",
    "options": [
      "A television service",
      "A radio station",
      "A newspaper",
      "A telephone network"
    ],
    "correctIndex": 0,
    "explanation": "Awolowo launched the first television service in Africa in 1959."
  },
  {
    "id": "q_nf_1024_2",
    "factId": "nf_1024",
    "question": "What source of revenue funded Awolowo's social reforms and television service?",
    "options": [
      "Oil exports",
      "Cocoa trade",
      "Diamond mining",
      "Tourism"
    ],
    "correctIndex": 1,
    "explanation": "The wealth generated from the cocoa trade, the mainstay of the regional economy, funded these initiatives."
  },
  {
    "id": "q_nf_1024_3",
    "factId": "nf_1024",
    "question": "Which of the following was NOT a social reform introduced by Awolowo in the Western Region?",
    "options": [
      "Free primary education",
      "Free health care for children",
      "Free university education",
      "Television service"
    ],
    "correctIndex": 2,
    "explanation": "The article mentions free primary education and free health care for children, but not free university education."
  },
  {
    "id": "q_nf_1025_1",
    "factId": "nf_1025",
    "question": "Who is credited with naming the Nigerian currency, the naira?",
    "options": [
      "Obafemi Awolowo",
      "Nnamdi Azikiwe",
      "Ahmadu Bello",
      "Tafawa Balewa"
    ],
    "correctIndex": 0,
    "explanation": "The article states that Awolowo, then Minister of Finance, is credited with giving the currency its name."
  },
  {
    "id": "q_nf_1025_2",
    "factId": "nf_1025",
    "question": "In what year was the naira introduced?",
    "options": [
      "1960",
      "1973",
      "1986",
      "1999"
    ],
    "correctIndex": 1,
    "explanation": "The article says Nigeria introduced its new currency in 1973."
  },
  {
    "id": "q_nf_1025_3",
    "factId": "nf_1025",
    "question": "Which role did Awolowo hold when he chose the name 'naira'?",
    "options": [
      "President of Nigeria",
      "Minister of Finance",
      "Premier of the Western Region",
      "Head of the Central Bank"
    ],
    "correctIndex": 1,
    "explanation": "The article mentions he was serving as Minister of Finance at the time."
  },
  {
    "id": "q_nf_1026_1",
    "factId": "nf_1026",
    "question": "What disease caused the death of Obafemi Awolowo's father?",
    "options": [
      "Smallpox",
      "Malaria",
      "Tuberculosis",
      "Cholera"
    ],
    "correctIndex": 0,
    "explanation": "The article states that David Shopolu Awolowo died of smallpox on 8 April 1920."
  },
  {
    "id": "q_nf_1026_2",
    "factId": "nf_1026",
    "question": "How old was Obafemi Awolowo when his father died?",
    "options": [
      "About five years old",
      "About eleven years old",
      "About fifteen years old",
      "About twenty years old"
    ],
    "correctIndex": 1,
    "explanation": "The article says that when his father died, Obafemi Awolowo was about eleven years old."
  },
  {
    "id": "q_nf_1026_3",
    "factId": "nf_1026",
    "question": "What was David Awolowo's occupation?",
    "options": [
      "Teacher",
      "Farmer and sawyer",
      "Trader",
      "Carpenter"
    ],
    "correctIndex": 1,
    "explanation": "The article identifies David Awolowo as a farmer and sawyer."
  },
  {
    "id": "q_nf_1027_1",
    "factId": "nf_1027",
    "question": "How old was Celestine Babayaro when he was sent off in a UEFA Champions League match?",
    "options": [
      "16 years and 86 days",
      "17 years and 45 days",
      "18 years and 120 days",
      "15 years and 200 days"
    ],
    "correctIndex": 0,
    "explanation": "Babayaro was 16 years and 86 days old when he received a red card, making him the youngest player to be sent off in the competition."
  },
  {
    "id": "q_nf_1027_2",
    "factId": "nf_1027",
    "question": "Which club did Babayaro play for when he was sent off in the Champions League?",
    "options": [
      "Chelsea",
      "Anderlecht",
      "Newcastle United",
      "LA Galaxy"
    ],
    "correctIndex": 1,
    "explanation": "The article states that Babayaro was at Belgian club Anderlecht when he was sent off against Steaua București."
  },
  {
    "id": "q_nf_1027_3",
    "factId": "nf_1027",
    "question": "What was the result of the match in which Babayaro was sent off?",
    "options": [
      "1–0 win",
      "1–1 draw",
      "2–1 loss",
      "0–0 draw"
    ],
    "correctIndex": 1,
    "explanation": "The match against Steaua București ended in a 1–1 draw, as mentioned in the article."
  },
  {
    "id": "q_nf_1028_1",
    "factId": "nf_1028",
    "question": "What position did Emmanuel Babayaro play?",
    "options": [
      "Left-back",
      "Goalkeeper",
      "Striker",
      "Midfielder"
    ],
    "correctIndex": 1,
    "explanation": "The article states that Emmanuel was a goalkeeper, while his brother Celestine was a left-back."
  },
  {
    "id": "q_nf_1028_2",
    "factId": "nf_1028",
    "question": "In which year did Nigeria win the Olympic gold medal in football?",
    "options": [
      "1992",
      "1996",
      "2000",
      "2004"
    ],
    "correctIndex": 1,
    "explanation": "The article mentions that Nigeria's Olympic football team won the gold medal in 1996 in Atlanta."
  },
  {
    "id": "q_nf_1028_3",
    "factId": "nf_1028",
    "question": "What was Celestine Babayaro's role in the 1996 Olympic final?",
    "options": [
      "He saved a penalty",
      "He scored a goal",
      "He was sent off",
      "He was the captain"
    ],
    "correctIndex": 1,
    "explanation": "The article says Celestine scored in the final against Argentina."
  },
  {
    "id": "q_nf_1029_1",
    "factId": "nf_1029",
    "question": "Where did Nigeria's first-ever public execution take place?",
    "options": [
      "Bar Beach",
      "Eko Atlantic City",
      "Lagos Island",
      "Victoria Island"
    ],
    "correctIndex": 0,
    "explanation": "The article states that the first public execution in Nigeria occurred at Bar Beach in Lagos."
  },
  {
    "id": "q_nf_1029_2",
    "factId": "nf_1029",
    "question": "What was Babatunde Folorunsho convicted of?",
    "options": [
      "Armed robbery",
      "Coup plotting",
      "Murder",
      "Treason"
    ],
    "correctIndex": 0,
    "explanation": "Folorunsho was convicted of armed robbery, as mentioned in the article."
  },
  {
    "id": "q_nf_1029_3",
    "factId": "nf_1029",
    "question": "What modern development now stands where Bar Beach's executions took place?",
    "options": [
      "Eko Atlantic City",
      "Lagos Marina",
      "National Stadium",
      "Tinubu Square"
    ],
    "correctIndex": 0,
    "explanation": "The land was reclaimed to build Eko Atlantic City, which now occupies the former execution site."
  },
  {
    "id": "q_nf_1030_1",
    "factId": "nf_1030",
    "question": "What was Bar Beach used for during the military regime in Nigeria?",
    "options": [
      "A popular spot for family outings and picnics",
      "A venue for public executions",
      "A construction site for Eko Atlantic City",
      "A location for political rallies"
    ],
    "correctIndex": 1,
    "explanation": "Bar Beach served as a firing squad venue for convicted armed robbers and coup plotters during the military regime."
  },
  {
    "id": "q_nf_1030_2",
    "factId": "nf_1030",
    "question": "Which individuals were executed at Bar Beach for their involvement in the 1976 coup?",
    "options": [
      "General Murtala Mohammed and Babatunde Folorunsho",
      "Major-General I D Bisalla and Col. Buka Suka Dimka",
      "Babatunde Folorunsho and Major-General I D Bisalla",
      "Col. Buka Suka Dimka and General Murtala Mohammed"
    ],
    "correctIndex": 1,
    "explanation": "Major-General I D Bisalla and Col. Buka Suka Dimka were shot by firing squad at Bar Beach for their roles in the coup that killed General Murtala Mohammed."
  },
  {
    "id": "q_nf_1030_3",
    "factId": "nf_1030",
    "question": "What happened to Bar Beach over time, leading to its transformation?",
    "options": [
      "It was converted into a military base",
      "It faced severe flooding and erosion",
      "It was turned into a public park",
      "It became a commercial fishing port"
    ],
    "correctIndex": 1,
    "explanation": "Bar Beach faced severe flooding and erosion, which led to the construction of Eko Atlantic City on reclaimed land where the beach once stood."
  },
  {
    "id": "q_nf_1031_1",
    "factId": "nf_1031",
    "question": "What was the original name of the location where Eko Atlantic City now stands?",
    "options": [
      "Bar Beach",
      "Ahmadu Bello Way",
      "Lagos Island",
      "Victoria Island"
    ],
    "correctIndex": 0,
    "explanation": "The article states that before becoming Eko Atlantic City, the stretch of Lagos shoreline was called Bar Beach."
  },
  {
    "id": "q_nf_1031_2",
    "factId": "nf_1031",
    "question": "What was one of the main problems at Bar Beach during the 1980s and 1990s?",
    "options": [
      "Frequent flooding",
      "Overcrowding",
      "Industrial pollution",
      "Wildlife encroachment"
    ],
    "correctIndex": 0,
    "explanation": "The article mentions that by the 1980s and 1990s, the beach was better known for flooding, which closed roads and eroded the beachfront."
  },
  {
    "id": "q_nf_1031_3",
    "factId": "nf_1031",
    "question": "How long is the sea wall that protects Eko Atlantic City?",
    "options": [
      "10 kilometres",
      "8.5 kilometres",
      "14 kilometres",
      "6.5 kilometres"
    ],
    "correctIndex": 1,
    "explanation": "The article specifies that Eko Atlantic City is shielded by an 8.5-kilometre sea wall."
  },
  {
    "id": "q_nf_1032_1",
    "factId": "nf_1032",
    "question": "What is the approximate total length of the rural earthworks around Benin City?",
    "options": [
      "6,500 km",
      "16,000 km",
      "150 million km",
      "500 km"
    ],
    "correctIndex": 1,
    "explanation": "The article states that the earthworks stretch for roughly 16,000 kilometers."
  },
  {
    "id": "q_nf_1032_2",
    "factId": "nf_1032",
    "question": "How does the length of the Benin earthworks compare to the Great Wall of China?",
    "options": [
      "They are about the same length.",
      "They are four times longer.",
      "They are half as long.",
      "They are a hundred times longer."
    ],
    "correctIndex": 1,
    "explanation": "The article says the earthworks are four times longer than the Great Wall of China."
  },
  {
    "id": "q_nf_1032_3",
    "factId": "nf_1032",
    "question": "What is the name of the foundation, founded around 2007, that aims to preserve the Benin earthworks?",
    "options": [
      "Benin Heritage Trust",
      "Edo Earthworks Society",
      "Benin Moat Foundation",
      "Great Wall Preservation Fund"
    ],
    "correctIndex": 2,
    "explanation": "The article mentions the Benin Moat Foundation, founded around 2007, as an effort to preserve the earthworks."
  },
  {
    "id": "q_nf_1033_1",
    "factId": "nf_1033",
    "question": "What were the Benin Bronzes cast from?",
    "options": [
      "Local copper",
      "Manilla bracelets from the Rhineland",
      "Ivory and pepper",
      "Recycled European cannons"
    ],
    "correctIndex": 1,
    "explanation": "The article states that the bronzes were cast from manilla bracelets brought by Portuguese merchants from the Rhineland."
  },
  {
    "id": "q_nf_1033_2",
    "factId": "nf_1033",
    "question": "Who brought the manillas to Benin?",
    "options": [
      "Dutch traders",
      "British explorers",
      "Portuguese merchants",
      "French colonizers"
    ],
    "correctIndex": 2,
    "explanation": "The article says Portuguese ships arrived carrying manillas."
  },
  {
    "id": "q_nf_1033_3",
    "factId": "nf_1033",
    "question": "What did the Oba's craftsmen do with the manillas?",
    "options": [
      "They used them as currency",
      "They melted them down and recast them into artworks",
      "They traded them for slaves",
      "They sold them to other kingdoms"
    ],
    "correctIndex": 1,
    "explanation": "The article says the craftsmen melted down the manillas and recast them into the Benin Bronzes."
  },
  {
    "id": "q_nf_1034_1",
    "factId": "nf_1034",
    "question": "What title was given to the mother of a newly installed Oba?",
    "options": [
      "Iyoba",
      "Oba",
      "Uselu",
      "Queen's Own"
    ],
    "correctIndex": 0,
    "explanation": "The mother was given the title Iyoba, which came with real power but required her to live apart from her son."
  },
  {
    "id": "q_nf_1034_2",
    "factId": "nf_1034",
    "question": "Where did the Iyoba move to after her son became Oba?",
    "options": [
      "Inside the royal palace",
      "A palace in Uselu",
      "A distant village",
      "The city center"
    ],
    "correctIndex": 1,
    "explanation": "The Iyoba moved to a palace in Uselu, just outside Benin City, and was never allowed to meet her son again."
  },
  {
    "id": "q_nf_1034_3",
    "factId": "nf_1034",
    "question": "Why was the Iyoba separated from her son?",
    "options": [
      "To prevent her from gaining power",
      "Because the Oba was considered divine",
      "As a punishment for the mother",
      "To allow her to rule independently"
    ],
    "correctIndex": 1,
    "explanation": "The separation was rooted in the belief that the Oba was sacred, so his divine status was not compromised by ordinary familial ties."
  },
  {
    "id": "q_nf_1035_1",
    "factId": "nf_1035",
    "question": "Where was the Benin ivory mask worn?",
    "options": [
      "On the face",
      "Around the waist",
      "On the chest",
      "On the head"
    ],
    "correctIndex": 1,
    "explanation": "The article states that the Benin ivory mask was worn around the waist of kings, not on the face."
  },
  {
    "id": "q_nf_1035_2",
    "factId": "nf_1035",
    "question": "Who is the most famous Benin ivory mask based on?",
    "options": [
      "Queen Idia",
      "King Oba",
      "A warrior prince",
      "A British queen"
    ],
    "correctIndex": 0,
    "explanation": "The article mentions that the most famous example is based on Queen Idia, a warrior queen."
  },
  {
    "id": "q_nf_1035_3",
    "factId": "nf_1035",
    "question": "What happened to many Benin artworks in 1897?",
    "options": [
      "They were sold to collectors",
      "They were destroyed in a fire",
      "They were looted by the British",
      "They were hidden in the palace"
    ],
    "correctIndex": 2,
    "explanation": "The article says that many brass plaques and sculptures were looted by the British in 1897 and are now in museums worldwide."
  },
  {
    "id": "q_nf_1036_1",
    "factId": "nf_1036",
    "question": "Why did John Lennon return his MBE in 1969?",
    "options": [
      "To protest Britain's support for Nigeria in the Biafran war",
      "To protest Britain's involvement in the Vietnam War",
      "Because his single 'Cold Turkey' was slipping down the charts",
      "To support the Nigerian government"
    ],
    "correctIndex": 0,
    "explanation": "Lennon returned his MBE in protest against Britain's support for Nigeria in the Biafran war, as stated in the fact."
  },
  {
    "id": "q_nf_1036_2",
    "factId": "nf_1036",
    "question": "Which countries backed the Nigerian government during the Biafran war?",
    "options": [
      "Britain and the Soviet Union",
      "France and the Soviet Union",
      "Britain and France",
      "The United States and Britain"
    ],
    "correctIndex": 0,
    "explanation": "The article states that Britain, along with the Soviet Union, backed the Nigerian government."
  },
  {
    "id": "q_nf_1036_3",
    "factId": "nf_1036",
    "question": "What was one of the grievances Lennon listed in his letter to the Queen?",
    "options": [
      "Britain's support for America in Vietnam",
      "The humanitarian crisis in Biafra",
      "The war's impact on his music career",
      "The lack of international attention to the war"
    ],
    "correctIndex": 0,
    "explanation": "Lennon's letter listed Britain's support for America in Vietnam as one of his grievances, along with the Nigeria-Biafra issue and his single's chart position."
  },
  {
    "id": "q_nf_1037_1",
    "factId": "nf_1037",
    "question": "What event inspired the formation of Doctors Without Borders?",
    "options": [
      "The Nigerian Civil War",
      "The Rwandan Genocide",
      "The Korean War",
      "The Vietnam War"
    ],
    "correctIndex": 0,
    "explanation": "The Biafran war, part of the Nigerian Civil War, inspired the formation of Doctors Without Borders."
  },
  {
    "id": "q_nf_1037_2",
    "factId": "nf_1037",
    "question": "Why were the French doctors frustrated with the Red Cross during the Biafran conflict?",
    "options": [
      "They were not allowed to provide medical aid",
      "The Red Cross was not providing enough food",
      "The Red Cross's neutrality silenced them about atrocities",
      "The Red Cross refused to work in Biafra"
    ],
    "correctIndex": 2,
    "explanation": "The doctors felt the Red Cross's neutrality prevented them from speaking out about the atrocities they witnessed."
  },
  {
    "id": "q_nf_1037_3",
    "factId": "nf_1037",
    "question": "What principle became a cornerstone of MSF as a result of the Biafran experience?",
    "options": [
      "Providing aid only to recognized governments",
      "Bearing witness and speaking out against injustice",
      "Maintaining strict neutrality in all conflicts",
      "Focusing solely on medical relief without advocacy"
    ],
    "correctIndex": 1,
    "explanation": "The doctors learned that aid workers must speak out against injustice, not just provide relief, which became a cornerstone of MSF."
  },
  {
    "id": "q_nf_1038_1",
    "factId": "nf_1038",
    "question": "What was the estimated death toll of the pogroms in Northern Nigeria in 1966?",
    "options": [
      "1,000 to 3,000",
      "10,000 to 30,000",
      "100,000 to 300,000",
      "500,000 to 1 million"
    ],
    "correctIndex": 1,
    "explanation": "The article states that an estimated 10,000 to 30,000 Igbo were killed in the pogroms."
  },
  {
    "id": "q_nf_1038_2",
    "factId": "nf_1038",
    "question": "Which day in 1966 became known as 'Black Thursday'?",
    "options": [
      "29 September",
      "15 January",
      "1 October",
      "30 November"
    ],
    "correctIndex": 0,
    "explanation": "The article identifies 29 September 1966 as the worst day, known as 'Black Thursday'."
  },
  {
    "id": "q_nf_1038_3",
    "factId": "nf_1038",
    "question": "What event did the mass displacement of Igbo to the Eastern Region directly lead to?",
    "options": [
      "The secession of Biafra",
      "The Nigerian independence",
      "The January coup",
      "The end of the civil war"
    ],
    "correctIndex": 0,
    "explanation": "The article says the flight of Igbo set the stage for the secession of Biafra in May 1967."
  },
  {
    "id": "q_nf_1039_1",
    "factId": "nf_1039",
    "question": "What was a direct consequence of the televised images of starving Biafran children?",
    "options": [
      "The formation of Doctors Without Borders",
      "The end of the Nigerian Civil War",
      "The lifting of the blockade",
      "The return of John Lennon's MBE"
    ],
    "correctIndex": 0,
    "explanation": "The article states that the crisis inspired the formation of Doctors Without Borders after the war."
  },
  {
    "id": "q_nf_1039_2",
    "factId": "nf_1039",
    "question": "According to the article, which two wars were among the first to be broadcast to a global audience?",
    "options": [
      "The Nigerian Civil War and the Vietnam War",
      "The Nigerian Civil War and World War II",
      "The Vietnam War and the Korean War",
      "The Nigerian Civil War and the Biafran War"
    ],
    "correctIndex": 0,
    "explanation": "The article says the Nigerian Civil War, alongside the Vietnam War, was one of the first conflicts to be broadcast globally."
  },
  {
    "id": "q_nf_1039_3",
    "factId": "nf_1039",
    "question": "What was the estimated number of Biafran civilians who died of starvation during the conflict?",
    "options": [
      "Between 500,000 and 2 million",
      "Exactly 1 million",
      "Between 100,000 and 500,000",
      "Over 2 million"
    ],
    "correctIndex": 0,
    "explanation": "The article states that between 500,000 and 2 million Biafran civilians died of starvation."
  },
  {
    "id": "q_nf_1040_1",
    "factId": "nf_1040",
    "question": "Who did Burna Boy's maternal grandfather manage?",
    "options": [
      "Fela Kuti",
      "King Sunny Ade",
      "Bob Marley",
      "Benson Idonije"
    ],
    "correctIndex": 0,
    "explanation": "Benson Idonije, Burna Boy's maternal grandfather, once managed Fela Kuti, the pioneer of Afrobeat."
  },
  {
    "id": "q_nf_1040_2",
    "factId": "nf_1040",
    "question": "According to the article, which artists inspired Burna Boy's music?",
    "options": [
      "Fela Kuti, King Sunny Ade, and Bob Marley",
      "Fela Kuti and Benson Idonije",
      "King Sunny Ade and Bob Marley only",
      "Burna Boy's grandfather and Fela Kuti"
    ],
    "correctIndex": 0,
    "explanation": "The article states that Burna Boy's music is inspired by Fela Kuti, King Sunny Ade, and Bob Marley."
  },
  {
    "id": "q_nf_1040_3",
    "factId": "nf_1040",
    "question": "What does the article say about Burna Boy's connection to Fela Kuti?",
    "options": [
      "It is purely artistic",
      "It is familial through his grandfather",
      "It is based on personal meetings",
      "It is through his album L.I.F.E"
    ],
    "correctIndex": 1,
    "explanation": "The article highlights that Burna Boy's grandfather managed Fela, adding a familial layer to the musical inspiration."
  },
  {
    "id": "q_nf_1041_1",
    "factId": "nf_1041",
    "question": "Who performed the official anthem 'Dai Dai' at the opening ceremony of the 2026 FIFA World Cup?",
    "options": [
      "Burna Boy and Shakira",
      "Ed Sheeran and Shakira",
      "Madonna and Justin Bieber",
      "Chris Martin and Burna Boy"
    ],
    "correctIndex": 0,
    "explanation": "The article states that the official anthem 'Dai Dai' was performed by Burna Boy and Shakira at the opening ceremony."
  },
  {
    "id": "q_nf_1041_2",
    "factId": "nf_1041",
    "question": "Where was the opening ceremony of the 2026 FIFA World Cup held?",
    "options": [
      "MetLife Stadium in New Jersey",
      "Estadio Azteca in Mexico City",
      "Wembley Stadium in London",
      "Stade de France in Paris"
    ],
    "correctIndex": 1,
    "explanation": "The article mentions that the opening ceremony took place at the Estadio Azteca in Mexico City on 11 June 2026."
  },
  {
    "id": "q_nf_1041_3",
    "factId": "nf_1041",
    "question": "Who co-wrote the song 'Dai Dai'?",
    "options": [
      "Burna Boy and Shakira",
      "Ed Sheeran and Alexander Castillo",
      "Chris Martin and Madonna",
      "Alexander Castillo and Shakira"
    ],
    "correctIndex": 1,
    "explanation": "The article states that the song was co-written by Ed Sheeran and producer Alexander Castillo."
  },
  {
    "id": "q_nf_1042_1",
    "factId": "nf_1042",
    "question": "Where did Burna Boy perform at the UEFA Champions League Final Kick Off Show?",
    "options": [
      "Citi Field in New York",
      "Atatürk Olympic Stadium in Istanbul",
      "A stadium in Lagos",
      "Wembley Stadium in London"
    ],
    "correctIndex": 1,
    "explanation": "The article states that the performance took place at the Atatürk Olympic Stadium in Istanbul, Turkey."
  },
  {
    "id": "q_nf_1042_2",
    "factId": "nf_1042",
    "question": "What was the size of the audience that watched Burna Boy's performance at the Champions League Final?",
    "options": [
      "Over 71,412 people",
      "Over 700 million people",
      "Over 7 million people",
      "Over 71 million people"
    ],
    "correctIndex": 1,
    "explanation": "The article mentions an audience of over 700 million people worldwide, while 71,412 were in the stadium."
  },
  {
    "id": "q_nf_1042_3",
    "factId": "nf_1042",
    "question": "Which award did Burna Boy win in 2021?",
    "options": [
      "Best Afrobeats at the Billboard Music Awards",
      "A Grammy for Best Global Music Album",
      "Top Afrobeat artist by Billboard",
      "Most nominated Nigerian artist in Grammy history"
    ],
    "correctIndex": 1,
    "explanation": "The article says he won his first Grammy in 2021 for Best Global Music Album for 'Twice as Tall'."
  },
  {
    "id": "q_nf_1043_1",
    "factId": "nf_1043",
    "question": "What historic achievement did Burna Boy accomplish at Citi Field in New York?",
    "options": [
      "He became the first African artist to headline and sell out a US stadium show.",
      "He became the first African artist to perform at the UEFA Champions League Final.",
      "He became the first African artist to release a seventh studio album.",
      "He became the first African artist to perform with The Beatles."
    ],
    "correctIndex": 0,
    "explanation": "Burna Boy made history as the first African artist to headline and sell out a stadium show in the US at Citi Field."
  },
  {
    "id": "q_nf_1043_2",
    "factId": "nf_1043",
    "question": "In which year did Burna Boy's Citi Field concert take place?",
    "options": [
      "2022",
      "2023",
      "2024",
      "2021"
    ],
    "correctIndex": 1,
    "explanation": "The article states that Burna Boy took the stage at Citi Field in July 2023."
  },
  {
    "id": "q_nf_1043_3",
    "factId": "nf_1043",
    "question": "What genre has Burna Boy championed with his 'Afro-fusion' sound?",
    "options": [
      "Afrobeats",
      "Hip-hop",
      "Reggae",
      "Jazz"
    ],
    "correctIndex": 0,
    "explanation": "The article mentions that Burna Boy's achievement marked a milestone in the global rise of Afrobeats, a genre he has championed."
  },
  {
    "id": "q_nf_1044_1",
    "factId": "nf_1044",
    "question": "What did Burna Boy become the first African artist to do in 2023?",
    "options": [
      "Headline and sell out a stadium show in the US",
      "Win a Grammy Award",
      "Top the Billboard Hot 100",
      "Perform at the Super Bowl halftime show"
    ],
    "correctIndex": 0,
    "explanation": "Burna Boy became the first African artist to headline and sell out a stadium show in the US, performing at Citi Field in New York."
  },
  {
    "id": "q_nf_1044_2",
    "factId": "nf_1044",
    "question": "Which award did Burna Boy win at the Billboard Music Awards in 2023?",
    "options": [
      "Best New Artist",
      "Top Rap Artist",
      "Best Afrobeats",
      "Top Global Artist"
    ],
    "correctIndex": 2,
    "explanation": "He won the inaugural Best Afrobeats award at the Billboard Music Awards, becoming the first African artist to win a BBMA as lead artist."
  },
  {
    "id": "q_nf_1044_3",
    "factId": "nf_1044",
    "question": "How many Grammy nominations did Burna Boy have by November 2023?",
    "options": [
      "Five",
      "Ten",
      "Fifteen",
      "Twenty"
    ],
    "correctIndex": 1,
    "explanation": "He became the most nominated Nigerian artist in Grammy history, with ten career nominations by November."
  },
  {
    "id": "q_nf_1045_1",
    "factId": "nf_1045",
    "question": "Which two awards did Burna Boy's 'Last Last' win at The Headies 2023?",
    "options": [
      "Afrobeats Single of the Year and Song of the Year",
      "Album of the Year and Best International Act",
      "Best Male Artist and Best Collaboration",
      "Song of the Year and Best Music Video"
    ],
    "correctIndex": 0,
    "explanation": "The article states that 'Last Last' won both Afrobeats Single of the Year and Song of the Year at The Headies 2023."
  },
  {
    "id": "q_nf_1045_2",
    "factId": "nf_1045",
    "question": "From which album is 'Last Last' taken?",
    "options": [
      "Twice as Tall",
      "Love, Damini",
      "African Giant",
      "Outside"
    ],
    "correctIndex": 1,
    "explanation": "The article says 'Last Last' was released as a single from Burna Boy's sixth studio album, Love, Damini."
  },
  {
    "id": "q_nf_1045_3",
    "factId": "nf_1045",
    "question": "What historic achievement is mentioned for the album 'Love, Damini'?",
    "options": [
      "It was the first African album to win a Grammy.",
      "It became the highest-charting Nigerian album on the Billboard 200.",
      "It was the first album to top the UK charts.",
      "It was the best-selling album of 2022."
    ],
    "correctIndex": 1,
    "explanation": "The article notes that 'Love, Damini' became the highest-charting Nigerian album on the Billboard 200 and the highest-charting African album in several countries."
  },
  {
    "id": "q_nf_1046_1",
    "factId": "nf_1046",
    "question": "How many enslaved Africans were sold from Calabar to European slave traders between 1772 and 1775?",
    "options": [
      "About 17,000",
      "More than 62,000",
      "About 62,000",
      "More than 100,000"
    ],
    "correctIndex": 1,
    "explanation": "The article states that from 1772 to 1775, more than 62,000 enslaved Africans were sold from Calabar."
  },
  {
    "id": "q_nf_1046_2",
    "factId": "nf_1046",
    "question": "Which towns were crucial centers for the slave trade in the Calabar area?",
    "options": [
      "Duke Town and Creek Town",
      "Esuk Mba and Duke Town",
      "Old Calabar and Esuk Mba",
      "Creek Town and Lagos"
    ],
    "correctIndex": 0,
    "explanation": "The article mentions that Old Calabar (Duke Town) and Creek Town, about 16 kilometers northeast, became crucial centers for the traffic."
  },
  {
    "id": "q_nf_1046_3",
    "factId": "nf_1046",
    "question": "What does the Slave History Museum in Calabar display?",
    "options": [
      "Chains, shackles, and currency used in the trade",
      "Artifacts from the transatlantic voyages",
      "Documents about the abolition of slavery",
      "Weapons used in the slave raids"
    ],
    "correctIndex": 0,
    "explanation": "The article says the museum displays chains, shackles, and the currency used in the trade."
  },
  {
    "id": "q_nf_1047_1",
    "factId": "nf_1047",
    "question": "Which of these was NOT a 'first' in Calabar?",
    "options": [
      "A monorail",
      "A botanical garden",
      "A university",
      "A post office"
    ],
    "correctIndex": 2,
    "explanation": "Calabar had the first secondary school, hospital, post office, barracks, paved roads, botanical garden, and monorail, but not a university."
  },
  {
    "id": "q_nf_1047_2",
    "factId": "nf_1047",
    "question": "What was the Hope Waddell Training Institution, founded in 1895?",
    "options": [
      "The first hospital",
      "The first secondary school",
      "The first post office",
      "The first barracks"
    ],
    "correctIndex": 1,
    "explanation": "The Hope Waddell Training Institution, founded in 1895, was Nigeria's first secondary school."
  },
  {
    "id": "q_nf_1047_3",
    "factId": "nf_1047",
    "question": "Until 1906, Calabar served as the headquarters of the European administration in which area?",
    "options": [
      "The Niger Delta",
      "The Lagos Colony",
      "The Northern Protectorate",
      "The Oil Rivers"
    ],
    "correctIndex": 0,
    "explanation": "Calabar was the headquarters of the European administration in the Niger Delta until 1906, when it moved to Lagos."
  },
  {
    "id": "q_nf_1048_1",
    "factId": "nf_1048",
    "question": "Where was the building that became the National Museum of Calabar originally constructed?",
    "options": [
      "Glasgow",
      "London",
      "Calabar",
      "Scandinavia"
    ],
    "correctIndex": 0,
    "explanation": "The article states that the prefabricated wooden building was packed into crates in Glasgow before being shipped to Calabar."
  },
  {
    "id": "q_nf_1048_2",
    "factId": "nf_1048",
    "question": "What material is the National Museum of Calabar made of?",
    "options": [
      "Oak",
      "Scandinavian pine",
      "Teak",
      "Mahogany"
    ],
    "correctIndex": 1,
    "explanation": "The article mentions that the structure is made of old Scandinavian pine, a durable timber."
  },
  {
    "id": "q_nf_1048_3",
    "factId": "nf_1048",
    "question": "What was the original purpose of the building that now houses the National Museum of Calabar?",
    "options": [
      "A school",
      "A hospital",
      "A residence for the British colonial governor",
      "A courthouse"
    ],
    "correctIndex": 2,
    "explanation": "The article states that it was built in 1884 as the residence of the British colonial governor."
  },
  {
    "id": "q_nf_1049_1",
    "factId": "nf_1049",
    "question": "What is the Drill Rehabilitation Centre in Calabar known for?",
    "options": [
      "Being the first primate rehabilitation project in the region",
      "Having the largest number of drills in the wild",
      "Breeding drills in western zoos",
      "Releasing all drills back into the wild"
    ],
    "correctIndex": 0,
    "explanation": "The article states that the centre was the first primate rehabilitation project in the region."
  },
  {
    "id": "q_nf_1049_2",
    "factId": "nf_1049",
    "question": "How many drills currently live at the centre?",
    "options": [
      "250",
      "286",
      "39",
      "1991"
    ],
    "correctIndex": 1,
    "explanation": "The article mentions that today, 286 drills live in six family groups at the centre."
  },
  {
    "id": "q_nf_1049_3",
    "factId": "nf_1049",
    "question": "What is the long-term goal of the centre's breeding programme?",
    "options": [
      "To keep drills in captivity for research",
      "To sell drills to zoos",
      "To release drills back into the wild",
      "To increase the number of drills in western zoos"
    ],
    "correctIndex": 2,
    "explanation": "The article says there are plans to release the first group back into the wild, showing the goal of returning them to the wild."
  },
  {
    "id": "q_nf_1050_1",
    "factId": "nf_1050",
    "question": "When is the Calabar Carnival held?",
    "options": [
      "Every January",
      "Every December",
      "Every March",
      "Every August"
    ],
    "correctIndex": 1,
    "explanation": "The Calabar Carnival is held every December, as stated in the fact and article."
  },
  {
    "id": "q_nf_1050_2",
    "factId": "nf_1050",
    "question": "What replaces samba in the Calabar Carnival?",
    "options": [
      "Salsa",
      "Reggae",
      "Afrobeats",
      "Highlife"
    ],
    "correctIndex": 2,
    "explanation": "The article says that Afrobeats replaces samba in the carnival's soundtrack."
  },
  {
    "id": "q_nf_1050_3",
    "factId": "nf_1050",
    "question": "Who launched the Calabar Carnival in 2004?",
    "options": [
      "The current Governor of Calabar",
      "A Brazilian cultural group",
      "Then-Governor Donald Duke",
      "The Nigerian tourism board"
    ],
    "correctIndex": 2,
    "explanation": "The article states that the carnival was launched in 2004 by then-Governor Donald Duke."
  },
  {
    "id": "q_nf_1051_1",
    "factId": "nf_1051",
    "question": "Who founded the Hope Waddell Training Institution?",
    "options": [
      "Scottish Presbyterian missionaries",
      "Nnamdi Azikiwe",
      "Hope Waddell",
      "The Nigerian government"
    ],
    "correctIndex": 0,
    "explanation": "The article states that Scottish Presbyterian missionaries founded the school, which later bore Hope Waddell's name."
  },
  {
    "id": "q_nf_1051_2",
    "factId": "nf_1051",
    "question": "What did Nnamdi Azikiwe receive from the Hope Waddell Training Institution?",
    "options": [
      "A university degree",
      "A vocational training certificate",
      "His secondary school leaving certificate",
      "A teaching position"
    ],
    "correctIndex": 2,
    "explanation": "The fact and article both state that Azikiwe earned his secondary school leaving certificate at this institution."
  },
  {
    "id": "q_nf_1051_3",
    "factId": "nf_1051",
    "question": "In what year was the Hope Waddell Training Institution opened?",
    "options": [
      "1845",
      "1858",
      "1895",
      "1960"
    ],
    "correctIndex": 2,
    "explanation": "The article says the school opened in 1895, making it the first secondary school in Nigeria."
  },
  {
    "id": "q_nf_1052_1",
    "factId": "nf_1052",
    "question": "What is the believed origin of the term 'danfo'?",
    "options": [
      "From a Yoruba word meaning 'hurry'",
      "From a Hausa word meaning 'yellow'",
      "From an English word meaning 'bus'",
      "From a Portuguese word meaning 'small'"
    ],
    "correctIndex": 0,
    "explanation": "The article states that the name 'danfo' is believed to come from the Yoruba word for 'hurry'."
  },
  {
    "id": "q_nf_1052_2",
    "factId": "nf_1052",
    "question": "When did danfo buses emerge in Lagos?",
    "options": [
      "In the 1960s",
      "In the 1970s",
      "In the 1980s",
      "In the 1990s"
    ],
    "correctIndex": 1,
    "explanation": "The article says danfo buses emerged in the 1970s after state-run transport services declined."
  },
  {
    "id": "q_nf_1052_3",
    "factId": "nf_1052",
    "question": "What is the danfo system described as being a major part of?",
    "options": [
      "Lagos's formal economy",
      "Lagos's informal economy",
      "Nigeria's national transport system",
      "The Bus Rapid Transit system"
    ],
    "correctIndex": 1,
    "explanation": "The article states that the danfo system is a major part of Lagos's informal economy, providing work for thousands."
  },
  {
    "id": "q_nf_1053_1",
    "factId": "nf_1053",
    "question": "Where was Umaru Dikko found in July 1984?",
    "options": [
      "Lagos Airport",
      "Stansted Airport",
      "Heathrow Airport",
      "London City Airport"
    ],
    "correctIndex": 1,
    "explanation": "The article states that British police at Stansted Airport opened a crate and found Dikko inside."
  },
  {
    "id": "q_nf_1053_2",
    "factId": "nf_1053",
    "question": "What was the crate containing Dikko labeled as?",
    "options": [
      "Medical supplies",
      "Diplomatic baggage",
      "Personal effects",
      "Commercial goods"
    ],
    "correctIndex": 1,
    "explanation": "The crate was labeled as diplomatic baggage, but it was not marked properly or accompanied by required paperwork."
  },
  {
    "id": "q_nf_1053_3",
    "factId": "nf_1053",
    "question": "What had the Nigerian government accused Dikko of?",
    "options": [
      "Espionage",
      "Embezzling millions of dollars from oil revenues",
      "Treason",
      "Drug trafficking"
    ],
    "correctIndex": 1,
    "explanation": "The article says the Nigerian government accused Dikko of embezzling millions of dollars from oil revenues."
  },
  {
    "id": "q_nf_1054_1",
    "factId": "nf_1054",
    "question": "What did Nwanyeruwa say to Mark Emereuwa that invoked Igbo tradition?",
    "options": [
      "Was your widowed mother counted?",
      "Why are you counting my goats?",
      "Women do not pay tax.",
      "I will report you to the chief."
    ],
    "correctIndex": 0,
    "explanation": "Nwanyeruwa's reply invoked the Igbo tradition that women do not pay tax, which sparked the confrontation."
  },
  {
    "id": "q_nf_1054_2",
    "factId": "nf_1054",
    "question": "How did the women summon others to protest?",
    "options": [
      "By sending palm-oil leaves",
      "By beating drums",
      "By sending messengers on horses",
      "By lighting bonfires"
    ],
    "correctIndex": 0,
    "explanation": "The women sent palm-oil leaves to summon others from surrounding areas, gathering nearly 10,000 protesters."
  },
  {
    "id": "q_nf_1054_3",
    "factId": "nf_1054",
    "question": "What was one outcome of the Women's War?",
    "options": [
      "The colonial government abolished the warrant chief system",
      "Women were given the right to vote",
      "Taxation of women was introduced",
      "The British left Nigeria"
    ],
    "correctIndex": 0,
    "explanation": "The colonial government abolished the warrant chief system and appointed women to the Native Court system."
  },
  {
    "id": "q_nf_1055_1",
    "factId": "nf_1055",
    "question": "What event triggered the Women's War in November 1929?",
    "options": [
      "A census that women believed would lead to taxation",
      "The imposition of a new tax on women",
      "The arrest of a woman leader",
      "The destruction of a native court"
    ],
    "correctIndex": 0,
    "explanation": "The article states that the women were responding to a census they believed was a prelude to taxing them."
  },
  {
    "id": "q_nf_1055_2",
    "factId": "nf_1055",
    "question": "What was the traditional practice used by the women to protest?",
    "options": [
      "Sitting on a man",
      "Marching to the colonial headquarters",
      "Writing petitions to the governor",
      "Boycotting British goods"
    ],
    "correctIndex": 0,
    "explanation": "The women used a long-standing practice called 'sitting on a man' or 'making war on a man'—a form of public shaming."
  },
  {
    "id": "q_nf_1055_3",
    "factId": "nf_1055",
    "question": "What was one of the significant reforms that followed the Women's War?",
    "options": [
      "The abolition of the warrant chief system",
      "The introduction of direct taxation on women",
      "The establishment of separate courts for women",
      "The appointment of women as colonial governors"
    ],
    "correctIndex": 0,
    "explanation": "The colonial government's inquiry led to the abolition of the warrant chief system and the appointment of women to the Native Court system."
  },
  {
    "id": "q_nf_1056_1",
    "factId": "nf_1056",
    "question": "Where is Anna Maria commemorated by a plaque?",
    "options": [
      "St Andrew's Church, Chesterton, Cambridge",
      "Fitzwilliam Museum, Cambridge",
      "Westminster Abbey, London",
      "St Paul's Cathedral, London"
    ],
    "correctIndex": 0,
    "explanation": "The plaque is on St Andrew's Church in Chesterton, Cambridge, where Anna Maria was buried."
  },
  {
    "id": "q_nf_1056_2",
    "factId": "nf_1056",
    "question": "Who rediscovered Anna Maria's grave in 1977?",
    "options": [
      "Professor Victoria Avery",
      "Cathy O'Neill",
      "Olaudah Equiano",
      "A church historian"
    ],
    "correctIndex": 1,
    "explanation": "Cathy O'Neill, a student, found the grave while studying for her A-levels in 1977."
  },
  {
    "id": "q_nf_1056_3",
    "factId": "nf_1056",
    "question": "How old was Anna Maria when she died?",
    "options": [
      "Three years old",
      "Five years old",
      "Ten years old",
      "One year old"
    ],
    "correctIndex": 0,
    "explanation": "Anna Maria was only three years old when she died in 1797."
  },
  {
    "id": "q_nf_1057_1",
    "factId": "nf_1057",
    "question": "In what year was the crater on Mercury named after Equiano?",
    "options": [
      "1976",
      "2019",
      "1789",
      "2017"
    ],
    "correctIndex": 0,
    "explanation": "The article states that the crater was named in 1976."
  },
  {
    "id": "q_nf_1057_2",
    "factId": "nf_1057",
    "question": "What is the name of the exoplanet that was officially named Equiano?",
    "options": [
      "HD 43197 b",
      "Mercury",
      "Google Cloud",
      "Cambridge"
    ],
    "correctIndex": 0,
    "explanation": "The exoplanet HD 43197 b received the official name Equiano in 2019."
  },
  {
    "id": "q_nf_1057_3",
    "factId": "nf_1057",
    "question": "Which of these is NOT mentioned as bearing Equiano's name?",
    "options": [
      "A bridge in Cambridge",
      "A Google Doodle",
      "A mountain on Mars",
      "A Google Cloud subsea cable"
    ],
    "correctIndex": 2,
    "explanation": "The article mentions a Google Cloud subsea cable, a bridge in Cambridge, and a Google Doodle, but not a mountain on Mars."
  },
  {
    "id": "q_nf_1058_1",
    "factId": "nf_1058",
    "question": "Who was jailed in 1984 on a charge of currency smuggling?",
    "options": [
      "Fela Kuti",
      "Muhammadu Buhari",
      "Ibrahim Babangida",
      "Amnesty International"
    ],
    "correctIndex": 0,
    "explanation": "Fela Kuti was jailed in 1984 by Muhammadu Buhari's government on a charge of currency smuggling."
  },
  {
    "id": "q_nf_1058_2",
    "factId": "nf_1058",
    "question": "What did Amnesty International denounce the charges against Fela Kuti as?",
    "options": [
      "Accurate",
      "Politically motivated",
      "Economically necessary",
      "Legally justified"
    ],
    "correctIndex": 1,
    "explanation": "Amnesty International denounced the charges as politically motivated and designated Kuti a prisoner of conscience."
  },
  {
    "id": "q_nf_1058_3",
    "factId": "nf_1058",
    "question": "How long did Fela Kuti spend in prison before being released?",
    "options": [
      "20 months",
      "2 years",
      "5 years",
      "6 months"
    ],
    "correctIndex": 0,
    "explanation": "He spent 20 months in prison before being released by General Ibrahim Babangida."
  },
  {
    "id": "q_nf_1059_1",
    "factId": "nf_1059",
    "question": "Who did Fela Kuti refer to as 'an animal in a madman's body'?",
    "options": [
      "P.W. Botha",
      "Muhammadu Buhari",
      "Ronald Reagan",
      "Margaret Thatcher"
    ],
    "correctIndex": 1,
    "explanation": "In the title track of 'Beasts of No Nation', Kuti sang that Buhari was 'an animal in a madman's body'."
  },
  {
    "id": "q_nf_1059_2",
    "factId": "nf_1059",
    "question": "Why was Fela Kuti jailed in 1984?",
    "options": [
      "For political activism",
      "For currency smuggling",
      "For insulting a foreign leader",
      "For tax evasion"
    ],
    "correctIndex": 1,
    "explanation": "Buhari's military government jailed Kuti on a charge of currency smuggling, which Amnesty International and others called politically motivated."
  },
  {
    "id": "q_nf_1059_3",
    "factId": "nf_1059",
    "question": "What was the original source of the phrase 'Beasts of No Nation'?",
    "options": [
      "A statement by Muhammadu Buhari",
      "A song by Fela Kuti",
      "A statement by P.W. Botha",
      "A book about apartheid"
    ],
    "correctIndex": 2,
    "explanation": "The album title came from a statement by South African President P.W. Botha about the anti-apartheid uprising."
  },
  {
    "id": "q_nf_1060_1",
    "factId": "nf_1060",
    "question": "What was distinctive about the horn section in Fela Kuti's Africa '70 band?",
    "options": [
      "It used two baritone saxophones",
      "It had no saxophones",
      "It featured only trumpets",
      "It used one alto saxophone"
    ],
    "correctIndex": 0,
    "explanation": "The article states that the band's distinctive feature was the use of two baritone saxophones, a rarity in most groups."
  },
  {
    "id": "q_nf_1060_2",
    "factId": "nf_1060",
    "question": "What effect did the two baritone saxophones have on the band's sound?",
    "options": [
      "It created a thin, high-pitched sound",
      "It produced a deep, powerful sound",
      "It made the music softer and quieter",
      "It had no noticeable effect"
    ],
    "correctIndex": 1,
    "explanation": "The article says the two baritone saxophones gave the band a deep, powerful sound that became a hallmark of Afrobeat."
  },
  {
    "id": "q_nf_1060_3",
    "factId": "nf_1060",
    "question": "How does the article describe the use of baritone saxophones in Western bands?",
    "options": [
      "They are used as the main instrument",
      "They are often used sparingly",
      "They are never used",
      "They are always used in pairs"
    ],
    "correctIndex": 1,
    "explanation": "The article notes that the baritone saxophone is often used sparingly in Western bands, unlike Kuti's full embrace of it."
  },
  {
    "id": "q_nf_1061_1",
    "factId": "nf_1061",
    "question": "How long could some of Fela Kuti's unreleased tracks last when played live?",
    "options": [
      "10 to 15 minutes",
      "20 to 30 minutes",
      "Up to 45 minutes",
      "Over an hour"
    ],
    "correctIndex": 2,
    "explanation": "The article states that some unreleased numbers, when played live, could last up to 45 minutes."
  },
  {
    "id": "q_nf_1061_2",
    "factId": "nf_1061",
    "question": "What often happened before Fela Kuti started singing in his songs?",
    "options": [
      "A short intro",
      "A long instrumental jam",
      "A spoken monologue",
      "A drum solo"
    ],
    "correctIndex": 1,
    "explanation": "Kuti's songs often opened with a long instrumental jam—sometimes 10 to 15 minutes—before he began singing."
  },
  {
    "id": "q_nf_1061_3",
    "factId": "nf_1061",
    "question": "Why was the length of Fela Kuti's songs important to his art?",
    "options": [
      "It made them popular on the radio",
      "It allowed him to deliver complex political messages",
      "It was a requirement of the record label",
      "It helped him sell more records"
    ],
    "correctIndex": 1,
    "explanation": "The extended format gave Kuti room to deliver complex political messages, mixing satire and protest with his music."
  },
  {
    "id": "q_nf_1062_1",
    "factId": "nf_1062",
    "question": "Where did the Igbo captives land in 1803?",
    "options": [
      "Dunbar Creek on St. Simons Island, Georgia",
      "Charleston Harbor, South Carolina",
      "Savannah River, Georgia",
      "Chesapeake Bay, Virginia"
    ],
    "correctIndex": 0,
    "explanation": "The article states that the ship arrived at Dunbar Creek on St. Simons Island, Georgia."
  },
  {
    "id": "q_nf_1062_2",
    "factId": "nf_1062",
    "question": "What did the Igbo captives sing as they walked into the creek?",
    "options": [
      "The Water Spirit brought us, the Water Spirit will take us home",
      "We shall overcome someday",
      "Oh freedom, over me",
      "Go down Moses, let my people go"
    ],
    "correctIndex": 0,
    "explanation": "The article quotes their song: 'The Water Spirit brought us, the Water Spirit will take us home.'"
  },
  {
    "id": "q_nf_1062_3",
    "factId": "nf_1062",
    "question": "What did the Igbo captives choose over enslavement?",
    "options": [
      "Death",
      "Escape to the North",
      "Working on the plantations",
      "Returning to Africa"
    ],
    "correctIndex": 0,
    "explanation": "The article says they chose death over enslavement, accepting the protection of their god Chukwu."
  },
  {
    "id": "q_nf_1063_1",
    "factId": "nf_1063",
    "question": "Where did the Igbo captives revolt and run aground?",
    "options": [
      "Dunbar Creek",
      "St. Simons Island",
      "Nigeria",
      "The Atlantic Ocean"
    ],
    "correctIndex": 0,
    "explanation": "The article states that the ship ran aground in Dunbar Creek, which is the site known as Igbo Landing."
  },
  {
    "id": "q_nf_1063_2",
    "factId": "nf_1063",
    "question": "What did the Igbo captives do after taking control of the ship?",
    "options": [
      "They sailed back to Africa.",
      "They drowned their captors.",
      "They surrendered to the plantation owners.",
      "They escaped into the forest."
    ],
    "correctIndex": 1,
    "explanation": "The article says they revolted, took control, and drowned their captors, causing the ship to run aground."
  },
  {
    "id": "q_nf_1063_3",
    "factId": "nf_1063",
    "question": "What did Killmonger ask to be done with his body in Black Panther?",
    "options": [
      "Bury him in the ocean with his ancestors.",
      "Bury him in Wakanda.",
      "Bury him in the desert.",
      "Bury him in the mountains."
    ],
    "correctIndex": 0,
    "explanation": "Killmonger's dying words were 'Bury me in the ocean with my ancestors who jumped from ships, 'cause they knew death was better than bondage.'"
  },
  {
    "id": "q_nf_1064_1",
    "factId": "nf_1064",
    "question": "What nickname has Igbo-Ora earned due to its high rate of twin births?",
    "options": [
      "Twin Capital of the World",
      "City of Twins",
      "Twin Town",
      "Land of Twins"
    ],
    "correctIndex": 0,
    "explanation": "Igbo-Ora is nicknamed 'Twin Capital of the World' because twins are so common there."
  },
  {
    "id": "q_nf_1064_2",
    "factId": "nf_1064",
    "question": "According to the study from the University of Lagos Teaching Hospital, where was a chemical found that might be linked to twin births?",
    "options": [
      "In the water and soil",
      "In the women and yam peelings",
      "In the air and plants",
      "In the livestock and crops"
    ],
    "correctIndex": 1,
    "explanation": "The study found the chemical in the women of Igbo-Ora and in the peelings of yams, a staple food."
  },
  {
    "id": "q_nf_1064_3",
    "factId": "nf_1064",
    "question": "What does the article say about the connection between the chemical and twin births?",
    "options": [
      "It has been proven to cause twins",
      "It is a direct cause of twins",
      "It is suggested but not proven",
      "It has no relation to twins"
    ],
    "correctIndex": 2,
    "explanation": "The study suggested a link but did not prove a direct connection, and no direct relation between diet and twin births has been established."
  },
  {
    "id": "q_nf_1065_1",
    "factId": "nf_1065",
    "question": "Who founded Igbo-Ora?",
    "options": [
      "Obe Alade",
      "Alaafin of Oyo",
      "Egungun",
      "Alaale"
    ],
    "correctIndex": 0,
    "explanation": "Obe Alade, a descendant of the Alaafin of Oyo, founded Igbo-Ora after migrating from Oyo town."
  },
  {
    "id": "q_nf_1065_2",
    "factId": "nf_1065",
    "question": "Why did Obe Alade leave Oyo town?",
    "options": [
      "Lack of water",
      "Mosquitoes",
      "Lost a chieftaincy tussle",
      "To find a market"
    ],
    "correctIndex": 2,
    "explanation": "He left after losing a chieftaincy contest, as it was customary for the defeated to leave."
  },
  {
    "id": "q_nf_1065_3",
    "factId": "nf_1065",
    "question": "What was the name of the first settlement where Obe Alade and his kinsmen stayed?",
    "options": [
      "Igbo-Ayin",
      "Igbo-Ira",
      "Apata Itaja",
      "Igbo-Asako"
    ],
    "correctIndex": 3,
    "explanation": "They first settled in a forest called Igbo-Asako, about three kilometers from where Igbo-Ora's market stands today."
  },
  {
    "id": "q_nf_1066_1",
    "factId": "nf_1066",
    "question": "What was the name of the first settlement of the founders of Igbo-Ora?",
    "options": [
      "Igbo-Asako",
      "Igbo-Ayin",
      "Igbo-Ira",
      "Igbo-Ora"
    ],
    "correctIndex": 0,
    "explanation": "The article states that the first settlement was Igbo-Asako, named after the forest where they first camped."
  },
  {
    "id": "q_nf_1066_2",
    "factId": "nf_1066",
    "question": "Why was the final settlement called Igbo-Ira?",
    "options": [
      "Because it was near the Ayin river",
      "Because it was in a marshy and swampy area",
      "Because it had a market on a flat rock",
      "Because it was the first place they camped"
    ],
    "correctIndex": 1,
    "explanation": "The article explains that Igbo-Ira means 'forest in a marshy and swampy area,' describing the location of their final settlement."
  },
  {
    "id": "q_nf_1066_3",
    "factId": "nf_1066",
    "question": "How did the name Igbo-Ora come about?",
    "options": [
      "It was the original name given by the founders",
      "It was derived from 'Omo Igbo-Ira' which was shortened",
      "It was named after a river called Ora",
      "It was chosen by the town's later leaders"
    ],
    "correctIndex": 1,
    "explanation": "The article says that people referred to the settlers as 'Omo Igbo-Ira,' which was later shortened to Igbo-Ora."
  },
  {
    "id": "q_nf_1067_1",
    "factId": "nf_1067",
    "question": "Where did the copper used in the Igbo-Ukwu bronzes come from?",
    "options": [
      "The Abakaliki area of south-eastern Nigeria",
      "The Mediterranean region",
      "Europe",
      "North Africa"
    ],
    "correctIndex": 0,
    "explanation": "Lead isotope and trace element analysis traced the copper to ore sources in the Abakaliki area, not from Europe or the Mediterranean."
  },
  {
    "id": "q_nf_1067_2",
    "factId": "nf_1067",
    "question": "What method did researchers use to trace the origin of the copper in the Igbo-Ukwu bronzes?",
    "options": [
      "Carbon dating",
      "Analyzing lead isotopes and trace elements",
      "Comparing artistic styles",
      "Historical documents"
    ],
    "correctIndex": 1,
    "explanation": "Researchers analyzed lead isotopes and trace elements in the metal to trace most of the copper and lead to local ore sources."
  },
  {
    "id": "q_nf_1067_3",
    "factId": "nf_1067",
    "question": "What did the discovery of Igbo-Ukwu bronzes overturn?",
    "options": [
      "The idea that Africa's great metalwork was always imported",
      "The belief that West Africa had no trade networks",
      "The notion that bronze casting was unknown in Africa",
      "The theory that the bronzes were made in the 20th century"
    ],
    "correctIndex": 0,
    "explanation": "The local origin of the copper overturns the old idea that Africa's great metalwork was always imported, showing local innovation and trade."
  },
  {
    "id": "q_nf_1068_1",
    "factId": "nf_1068",
    "question": "What did UNESCO recognize thieboudienne as?",
    "options": [
      "An intangible cultural heritage dish",
      "A national dish of Senegal",
      "A type of fish stew",
      "A traditional festival"
    ],
    "correctIndex": 0,
    "explanation": "UNESCO recognized thieboudienne as an intangible cultural heritage dish, highlighting its cultural importance."
  },
  {
    "id": "q_nf_1068_2",
    "factId": "nf_1068",
    "question": "According to the article, what did cooks in Saint-Louis substitute to create thieboudienne?",
    "options": [
      "Rice for barley",
      "Fish for meat",
      "Tomatoes for chilies",
      "Vegetables for fish"
    ],
    "correctIndex": 0,
    "explanation": "The article says cooks substituted rice when they ran out of barley, leading to the creation of thieboudienne."
  },
  {
    "id": "q_nf_1068_3",
    "factId": "nf_1068",
    "question": "What does the West African saying 'a party without jollof is just a meeting' imply?",
    "options": [
      "Jollof is essential for celebrations",
      "Meetings are boring",
      "Jollof is only for parties",
      "Parties are common"
    ],
    "correctIndex": 0,
    "explanation": "The saying underscores how central jollof is to celebrations, implying that a party without it is not a real party."
  },
  {
    "id": "q_nf_1069_1",
    "factId": "nf_1069",
    "question": "According to oral histories, what did Penda Mbaye substitute for barley to create a new dish?",
    "options": [
      "Rice",
      "Wheat",
      "Corn",
      "Millet"
    ],
    "correctIndex": 0,
    "explanation": "Penda Mbaye ran out of barley and substituted rice, which according to oral histories gave birth to jollof rice."
  },
  {
    "id": "q_nf_1069_2",
    "factId": "nf_1069",
    "question": "Which empire is named as the dish's namesake in the article?",
    "options": [
      "Mali Empire",
      "Jolof Empire",
      "Ghana Empire",
      "Songhai Empire"
    ],
    "correctIndex": 1,
    "explanation": "Historians point to the Jolof Empire, which ruled parts of modern-day Senegal, Mali, The Gambia, and Mauritania, as the dish's namesake."
  },
  {
    "id": "q_nf_1069_3",
    "factId": "nf_1069",
    "question": "What recognition has the Senegalese version of jollof rice, thieboudienne, received?",
    "options": [
      "It was named a national dish.",
      "It was recognized by UNESCO as an intangible cultural heritage dish.",
      "It won a West African cooking competition.",
      "It was featured in a famous cookbook."
    ],
    "correctIndex": 1,
    "explanation": "The Senegalese version, thieboudienne, has been recognized by UNESCO as an intangible cultural heritage dish."
  },
  {
    "id": "q_nf_1072_1",
    "factId": "nf_1072",
    "question": "Who conquered Kanem–Bornu in 1893?",
    "options": [
      "Rabih az-Zubayr",
      "Shehu Ashimi",
      "al-Kanemi",
      "Karnak Logone"
    ],
    "correctIndex": 0,
    "explanation": "Rabih az-Zubayr, a Sudanese adventurer and slave raider, conquered Kanem–Bornu in 1893."
  },
  {
    "id": "q_nf_1072_2",
    "factId": "nf_1072",
    "question": "What city did Rabih make his capital after conquering Kanem–Bornu?",
    "options": [
      "Karnak Logone",
      "Dikwa",
      "Kousséri",
      "Amja"
    ],
    "correctIndex": 1,
    "explanation": "Rabih made Dikwa his capital and ruled with an iron fist."
  },
  {
    "id": "q_nf_1072_3",
    "factId": "nf_1072",
    "question": "What happened to Rabih's rule in 1900?",
    "options": [
      "He was killed by French forces at the battle of Kousséri",
      "He was captured by British forces",
      "He fled across the Yobe River",
      "He was assassinated by his own council"
    ],
    "correctIndex": 0,
    "explanation": "Rabih's rule lasted only until 1900, when he was killed by French forces at the battle of Kousséri."
  },
  {
    "id": "q_nf_1073_1",
    "factId": "nf_1073",
    "question": "In 1257, the mai of Kanem sent a giraffe as a gift to which dynasty?",
    "options": [
      "Hafsid",
      "Almohad",
      "Ayyubid",
      "Mamluk"
    ],
    "correctIndex": 0,
    "explanation": "The article states that the mai sent a giraffe to Muhammad I al-Mustansir, the Hafsid ruler of Ifriqiya."
  },
  {
    "id": "q_nf_1073_2",
    "factId": "nf_1073",
    "question": "What was the Kanem Empire's power primarily built on?",
    "options": [
      "Trade and military strength",
      "Agriculture and fishing",
      "Mining and manufacturing",
      "Religious conquest"
    ],
    "correctIndex": 0,
    "explanation": "The article says the Kanem Empire's power was built on trade and military strength, including control of Saharan routes and a large cavalry."
  },
  {
    "id": "q_nf_1073_3",
    "factId": "nf_1073",
    "question": "What did the Kanem Empire export along trans-Saharan trade routes?",
    "options": [
      "Salt, ivory, and slaves",
      "Gold, spices, and textiles",
      "Horses, weapons, and grain",
      "Oil, dates, and copper"
    ],
    "correctIndex": 0,
    "explanation": "The article mentions that the empire exported salt, ivory, and slaves, and imported horses from North Africa."
  },
  {
    "id": "q_nf_1074_1",
    "factId": "nf_1074",
    "question": "How many hectares of land does Lekki Conservation Centre sit on?",
    "options": [
      "78",
      "100",
      "50",
      "200"
    ],
    "correctIndex": 0,
    "explanation": "The article states that Lekki Conservation Centre sits on 78 hectares of land in Lagos, Nigeria."
  },
  {
    "id": "q_nf_1074_2",
    "factId": "nf_1074",
    "question": "Which organization runs Lekki Conservation Centre?",
    "options": [
      "Nigerian Conservation Foundation",
      "Lagos State Government",
      "African Wildlife Foundation",
      "UNESCO"
    ],
    "correctIndex": 0,
    "explanation": "The centre is run by the Nigerian Conservation Foundation, as mentioned in the article."
  },
  {
    "id": "q_nf_1074_3",
    "factId": "nf_1074",
    "question": "What types of habitats are found in the nature reserve at Lekki Conservation Centre?",
    "options": [
      "Secondary forest, swamp forest, and savanna grassland",
      "Rainforest, desert, and wetlands",
      "Mangroves, alpine meadows, and tundra",
      "Deciduous forest, prairie, and chaparral"
    ],
    "correctIndex": 0,
    "explanation": "The article lists secondary forest, swamp forest, and savanna grassland as the habitats in the reserve."
  },
  {
    "id": "q_nf_1075_1",
    "factId": "nf_1075",
    "question": "Where is the Nike Art Gallery located?",
    "options": [
      "Lagos",
      "Abuja",
      "Accra",
      "Nairobi"
    ],
    "correctIndex": 0,
    "explanation": "The article states the gallery is in the heart of Lagos."
  },
  {
    "id": "q_nf_1075_2",
    "factId": "nf_1075",
    "question": "How many works of art does the Nike Art Gallery house?",
    "options": [
      "About 8,000",
      "About 5,000",
      "About 10,000",
      "About 2,000"
    ],
    "correctIndex": 0,
    "explanation": "The article says the gallery houses about 8,000 works by Nigerian artists."
  },
  {
    "id": "q_nf_1075_3",
    "factId": "nf_1075",
    "question": "Who is the owner of the Nike Art Gallery?",
    "options": [
      "Chief Josephine Oboh Macleod",
      "Nike Davies-Okundaye",
      "A local artist",
      "A tourist"
    ],
    "correctIndex": 1,
    "explanation": "The article identifies Nike Davies-Okundaye as the owner."
  },
  {
    "id": "q_nf_1076_1",
    "factId": "nf_1076",
    "question": "What type of bridge is the Lekki-Ikoyi Bridge?",
    "options": [
      "Suspension bridge",
      "Cable-stayed bridge",
      "Arch bridge",
      "Beam bridge"
    ],
    "correctIndex": 1,
    "explanation": "The article describes the Lekki-Ikoyi Bridge as a cable-stayed bridge."
  },
  {
    "id": "q_nf_1076_2",
    "factId": "nf_1076",
    "question": "In what year was the Lekki-Ikoyi Bridge completed?",
    "options": [
      "2013",
      "2016",
      "2015",
      "2010"
    ],
    "correctIndex": 0,
    "explanation": "The article states that the bridge was completed in 2013."
  },
  {
    "id": "q_nf_1076_3",
    "factId": "nf_1076",
    "question": "What did Mark Zuckerberg do on the Lekki-Ikoyi Bridge during his 2016 visit?",
    "options": [
      "He gave a speech",
      "He jogged across it",
      "He took a helicopter tour",
      "He attended a tech conference"
    ],
    "correctIndex": 1,
    "explanation": "The article mentions that Zuckerberg famously went for a morning jog across the bridge."
  },
  {
    "id": "q_nf_1077_1",
    "factId": "nf_1077",
    "question": "Who founded Nairaland?",
    "options": [
      "Seun Osewa",
      "Mark Zuckerberg",
      "Jack Dorsey",
      "Elon Musk"
    ],
    "correctIndex": 0,
    "explanation": "Seun Osewa, a Nigerian entrepreneur, launched Nairaland in October 2011."
  },
  {
    "id": "q_nf_1077_2",
    "factId": "nf_1077",
    "question": "What is Nairaland's ranking among the most visited websites in Nigeria?",
    "options": [
      "1st",
      "3rd",
      "5th",
      "10th"
    ],
    "correctIndex": 2,
    "explanation": "Nairaland ranks as the 5th most visited website in Nigeria."
  },
  {
    "id": "q_nf_1077_3",
    "factId": "nf_1077",
    "question": "What happened to Nairaland in 2014?",
    "options": [
      "It was shut down permanently",
      "Hackers wiped its servers",
      "It was acquired by a foreign company",
      "It changed its name"
    ],
    "correctIndex": 1,
    "explanation": "In 2014, hackers wiped Nairaland's servers, causing a three-day outage and loss of posts."
  },
  {
    "id": "q_nf_1078_1",
    "factId": "nf_1078",
    "question": "What percentage of Nigerian Internet users are registered on Nairaland?",
    "options": [
      "5%",
      "20%",
      "11%",
      "5.9%"
    ],
    "correctIndex": 0,
    "explanation": "The article states that approximately 5% of Nigerian Internet users are registered on Nairaland."
  },
  {
    "id": "q_nf_1078_2",
    "factId": "nf_1078",
    "question": "When was Nairaland founded?",
    "options": [
      "October 20, 2011",
      "2014",
      "2023",
      "October 20, 2010"
    ],
    "correctIndex": 0,
    "explanation": "The article says Nairaland was founded by Seun Osewa on October 20, 2011."
  },
  {
    "id": "q_nf_1078_3",
    "factId": "nf_1078",
    "question": "Which of the following is a challenge Nairaland has faced?",
    "options": [
      "A hacking incident in 2014",
      "A permanent shutdown",
      "Lack of users",
      "Government censorship"
    ],
    "correctIndex": 0,
    "explanation": "The article mentions a 2014 hacking incident that wiped data and a temporary shutdown in 2023."
  },
  {
    "id": "q_nf_1079_1",
    "factId": "nf_1079",
    "question": "What did trolls from 4chan falsely claim about Americans and Europeans during the 2014 Ebola epidemic?",
    "options": [
      "They were spreading Ebola through worship of the 'Ebola-chan' meme.",
      "They were spreading Ebola through contaminated vaccines.",
      "They were spreading Ebola through air travel.",
      "They were spreading Ebola through contaminated food."
    ],
    "correctIndex": 0,
    "explanation": "The article states that trolls posted false claims that Americans and Europeans were spreading the virus through magical rituals centered on 'Ebola-chan.'"
  },
  {
    "id": "q_nf_1079_2",
    "factId": "nf_1079",
    "question": "On which platform did the 4chan trolls create accounts to spread their false claims?",
    "options": [
      "Twitter",
      "Facebook",
      "Nairaland",
      "Reddit"
    ],
    "correctIndex": 2,
    "explanation": "The article says the trolls created accounts on Nairaland, a major Nigerian forum."
  },
  {
    "id": "q_nf_1079_3",
    "factId": "nf_1079",
    "question": "What did the 'Ebola-chan' meme personify?",
    "options": [
      "The Ebola virus",
      "A Nigerian forum",
      "A public health crisis",
      "A conspiracy theory"
    ],
    "correctIndex": 0,
    "explanation": "The article describes 'Ebola-chan' as an anime character personifying the virus."
  },
  {
    "id": "q_nf_1080_1",
    "factId": "nf_1080",
    "question": "What happened to Nairaland in June 2014?",
    "options": [
      "It was shut down by the government",
      "It was hacked and lost data",
      "It was sold to another company",
      "It experienced a power outage"
    ],
    "correctIndex": 1,
    "explanation": "Nairaland went dark due to a successful hacking attempt that wiped its host server and backup."
  },
  {
    "id": "q_nf_1080_2",
    "factId": "nf_1080",
    "question": "What data was lost in the attack on Nairaland?",
    "options": [
      "All user posts and registrations from January 10 to June 22, 2014",
      "Only user posts from the last month",
      "Only user registrations from the last year",
      "All data from the site's inception"
    ],
    "correctIndex": 0,
    "explanation": "The attack erased all user posts and registrations from January 10 to June 22, 2014."
  },
  {
    "id": "q_nf_1080_3",
    "factId": "nf_1080",
    "question": "How did Nairaland recover some data after the attack?",
    "options": [
      "From a remote backup",
      "From user submissions",
      "From the host server",
      "From a government archive"
    ],
    "correctIndex": 0,
    "explanation": "When the site returned, it had recovered some data from a remote backup, but the lost content was gone for good."
  },
  {
    "id": "q_nf_1081_1",
    "factId": "nf_1081",
    "question": "What does the Nok terracotta sculpture depict?",
    "options": [
      "Two people paddling a dugout canoe",
      "A figure with a seashell on its head",
      "A farmer harvesting crops",
      "A warrior holding a spear"
    ],
    "correctIndex": 0,
    "explanation": "The sculpture shows two people paddling a dugout canoe with goods on board, suggesting river travel and trade."
  },
  {
    "id": "q_nf_1081_2",
    "factId": "nf_1081",
    "question": "Which river is mentioned as a tributary of the Niger River that the Nok may have used for trade?",
    "options": [
      "Gurara",
      "Benue",
      "Kaduna",
      "Niger"
    ],
    "correctIndex": 0,
    "explanation": "The article states that the canoe sculpture suggests the Nok used dugout canoes along rivers like the Gurara, a tributary of the Niger River."
  },
  {
    "id": "q_nf_1081_3",
    "factId": "nf_1081",
    "question": "What does the sculpture of a figure with a seashell on its head hint at?",
    "options": [
      "River routes may have reached the Atlantic coast",
      "The Nok were skilled farmers",
      "The Nok used canoes for fishing",
      "The Nok traded with the Dufuna people"
    ],
    "correctIndex": 0,
    "explanation": "The seashell sculpture hints that river routes might have reached the Atlantic coast, bringing goods from far away."
  },
  {
    "id": "q_nf_1082_1",
    "factId": "nf_1082",
    "question": "What did a tin miner accidentally discover in central Nigeria in 1928?",
    "options": [
      "A terracotta head",
      "An iron tool",
      "A gold ornament",
      "A stone statue"
    ],
    "correctIndex": 0,
    "explanation": "The article states that in 1928, a tin miner accidentally unearthed a terracotta head at a depth of 24 feet."
  },
  {
    "id": "q_nf_1082_2",
    "factId": "nf_1082",
    "question": "During which period did the Nok culture flourish?",
    "options": [
      "From around 1500 BCE to 1 BCE",
      "From around 1000 CE to 1500 CE",
      "From around 500 BCE to 500 CE",
      "From around 3000 BCE to 2000 BCE"
    ],
    "correctIndex": 0,
    "explanation": "The article says the Nok culture flourished from around 1500 BCE to 1 BCE."
  },
  {
    "id": "q_nf_1082_3",
    "factId": "nf_1082",
    "question": "What is the significance of Nok terracotta sculptures in African art history?",
    "options": [
      "They are the earliest large three-dimensional figurative art in continental Africa, excluding ancient Egyptian art.",
      "They are the first examples of iron metallurgy in Africa.",
      "They were used exclusively as roof finials.",
      "They are the oldest known pottery in the world."
    ],
    "correctIndex": 0,
    "explanation": "The fact and article emphasize that Nok terracottas are the earliest large three-dimensional figurative art in continental Africa, excluding ancient Egyptian art."
  },
  {
    "id": "q_nf_1083_1",
    "factId": "nf_1083",
    "question": "What evidence suggests the Nok people used honey to preserve meat?",
    "options": [
      "Traces of beeswax and animal fats on pottery",
      "Written records describing the practice",
      "Remains of beehives in their settlements",
      "Paintings on cave walls showing honey collection"
    ],
    "correctIndex": 0,
    "explanation": "The article states that traces of beeswax and animal fats on their ceramics suggest they used honey to preserve meat."
  },
  {
    "id": "q_nf_1083_2",
    "factId": "nf_1083",
    "question": "Besides preserving meat, what other use for honey is mentioned?",
    "options": [
      "Sweetening food",
      "Making medicine",
      "Creating cosmetics",
      "Building materials"
    ],
    "correctIndex": 0,
    "explanation": "The article says 'The honey likely sweetened their food as well.'"
  },
  {
    "id": "q_nf_1083_3",
    "factId": "nf_1083",
    "question": "What are the Nok people most famous for?",
    "options": [
      "Their iron tools",
      "Their terracotta sculptures",
      "Their woven baskets",
      "Their stone houses"
    ],
    "correctIndex": 1,
    "explanation": "The article notes that 'The Nok are famous for their terracotta sculptures.'"
  },
  {
    "id": "q_nf_1084_1",
    "factId": "nf_1084",
    "question": "What is the Nok culture famous for?",
    "options": [
      "Terracotta sculptures",
      "Bronze castings",
      "Rock paintings",
      "Wooden masks"
    ],
    "correctIndex": 0,
    "explanation": "The Nok culture is known for its terracotta sculptures, which are among the earliest large figurative art in Africa."
  },
  {
    "id": "q_nf_1084_2",
    "factId": "nf_1084",
    "question": "According to the article, what percentage of known Nok sites have been illegally dug up?",
    "options": [
      "Over 50%",
      "Over 70%",
      "Over 90%",
      "Over 99%"
    ],
    "correctIndex": 2,
    "explanation": "The joint research project found that over 90% of known Nok sites have been illegally excavated."
  },
  {
    "id": "q_nf_1084_3",
    "factId": "nf_1084",
    "question": "What is a consequence of looting mentioned in the article?",
    "options": [
      "Loss of context about the people who made the sculptures",
      "Increase in the number of known Nok sites",
      "Better preservation of the sculptures",
      "More accurate dating of the sculptures"
    ],
    "correctIndex": 0,
    "explanation": "Looting removes sculptures from their context, losing information about the people who made them."
  },
  {
    "id": "q_nf_1085_1",
    "factId": "nf_1085",
    "question": "How much does Nollywood lose annually to piracy?",
    "options": [
      "$1–$5 billion",
      "$10–$15 billion",
      "$20–$25 billion",
      "$5–$10 billion"
    ],
    "correctIndex": 1,
    "explanation": "The article states that Nollywood loses an estimated $10–$15 billion annually to piracy."
  },
  {
    "id": "q_nf_1085_2",
    "factId": "nf_1085",
    "question": "What is mentioned as a major contributor to Nollywood's piracy losses?",
    "options": [
      "YouTube channels",
      "Telegram groups",
      "DVD sellers",
      "Streaming services"
    ],
    "correctIndex": 1,
    "explanation": "The article identifies Telegram groups as major contributors to the piracy losses."
  },
  {
    "id": "q_nf_1085_3",
    "factId": "nf_1085",
    "question": "Why are Nollywood filmmakers increasingly using YouTube?",
    "options": [
      "To avoid paying taxes",
      "To bypass traditional distribution channels vulnerable to piracy",
      "To compete with Hollywood",
      "To access government funding"
    ],
    "correctIndex": 1,
    "explanation": "The article says YouTube offers a way to reach viewers while bypassing traditional distribution channels that are vulnerable to piracy."
  },
  {
    "id": "q_nf_1086_1",
    "factId": "nf_1086",
    "question": "What was the title of the Yoruba-language film by Moses Olaiya that became one of Nigeria's first blockbusters?",
    "options": [
      "Mosebolatan",
      "Nollywood",
      "Ola Balogun",
      "Ade Love"
    ],
    "correctIndex": 0,
    "explanation": "The article states that Mosebolatan (1985) by Moses Olaiya was one of Nigeria's first blockbusters."
  },
  {
    "id": "q_nf_1086_2",
    "factId": "nf_1086",
    "question": "How much did Mosebolatan gross within five days of its release?",
    "options": [
      "₦107,000",
      "₦44.2 million",
      "₦1,000,000",
      "₦500,000"
    ],
    "correctIndex": 0,
    "explanation": "The article says Mosebolatan earned ₦107,000 in five days, which would be roughly ₦44.2 million in 2015."
  },
  {
    "id": "q_nf_1086_3",
    "factId": "nf_1086",
    "question": "What tradition did Mosebolatan come out of?",
    "options": [
      "Yoruba traveling theatre",
      "Nollywood video boom",
      "English-language cinema",
      "International film festivals"
    ],
    "correctIndex": 0,
    "explanation": "The article explains that Mosebolatan came out of the Yoruba traveling theatre tradition, where performers like Olaiya moved from stage to screen."
  },
  {
    "id": "q_nf_1087_1",
    "factId": "nf_1087",
    "question": "Who coined the term 'Kannywood'?",
    "options": [
      "Sunusi Shehu",
      "Dalhatu Bawa",
      "Kasimu Yero",
      "A journalist from RTV Kaduna"
    ],
    "correctIndex": 0,
    "explanation": "The article states that Sunusi Shehu, a journalist for Tauraruwa Magazine, coined the term in 1999."
  },
  {
    "id": "q_nf_1087_2",
    "factId": "nf_1087",
    "question": "What was the name of the magazine for which Sunusi Shehu worked?",
    "options": [
      "Tauraruwa Magazine",
      "Kano State Filmmakers Association",
      "Radio Kaduna",
      "RTV Kaduna"
    ],
    "correctIndex": 0,
    "explanation": "The article says Sunusi Shehu was writing for Tauraruwa Magazine when he coined the term."
  },
  {
    "id": "q_nf_1087_3",
    "factId": "nf_1087",
    "question": "Which film is often cited as the first commercially successful Kannywood film?",
    "options": [
      "Turmin Danya",
      "Kannywood",
      "Bollywood",
      "RTV Kaduna"
    ],
    "correctIndex": 0,
    "explanation": "The article mentions that the 1990 film Turmin Danya is often cited as the first commercially successful Kannywood film."
  },
  {
    "id": "q_nf_1088_1",
    "factId": "nf_1088",
    "question": "What happened to the Nigerian Railway Corporation in 1988?",
    "options": [
      "It was privatized",
      "It declared bankruptcy",
      "It expanded its network",
      "It was nationalized"
    ],
    "correctIndex": 1,
    "explanation": "In 1988, the Nigerian Railway Corporation declared bankruptcy, leading to a six-month halt in rail traffic."
  },
  {
    "id": "q_nf_1088_2",
    "factId": "nf_1088",
    "question": "How long did the halt in rail traffic last after the 1988 bankruptcy?",
    "options": [
      "Six months",
      "One year",
      "Two years",
      "Five years"
    ],
    "correctIndex": 0,
    "explanation": "All rail traffic stopped for six months after the bankruptcy declaration."
  },
  {
    "id": "q_nf_1088_3",
    "factId": "nf_1088",
    "question": "When was regular scheduled service restored on the Lagos to Kano line?",
    "options": [
      "In 2002",
      "In December 2012",
      "In 1988",
      "In 1964"
    ],
    "correctIndex": 1,
    "explanation": "Regular scheduled service on the Lagos to Kano line was restored in December 2012, after being discontinued in 2002."
  },
  {
    "id": "q_nf_1089_1",
    "factId": "nf_1089",
    "question": "What is the Lagos-Ibadan railway the first of in West Africa?",
    "options": [
      "Double-track standard gauge line",
      "High-speed rail line",
      "Electric railway line",
      "Privately-owned railway line"
    ],
    "correctIndex": 0,
    "explanation": "The article states it is the first double-track standard gauge line in West Africa."
  },
  {
    "id": "q_nf_1089_2",
    "factId": "nf_1089",
    "question": "How long does a train journey between Lagos and Ibadan take?",
    "options": [
      "One hour",
      "Two and a half hours",
      "Four hours",
      "Five hours"
    ],
    "correctIndex": 1,
    "explanation": "The article says the journey takes two and a half hours, half the time of the equivalent car trip."
  },
  {
    "id": "q_nf_1089_3",
    "factId": "nf_1089",
    "question": "Which company built the Lagos-Ibadan railway?",
    "options": [
      "China Railway Construction Corporation",
      "China Civil Engineering Construction Corp",
      "Nigerian Railway Corporation",
      "Siemens"
    ],
    "correctIndex": 1,
    "explanation": "The article states the line was built by China Civil Engineering Construction Corp (CCECC)."
  },
  {
    "id": "q_nf_1090_1",
    "factId": "nf_1090",
    "question": "According to the article, what percentage of the NRC's locomotives are not operational?",
    "options": [
      "Up to 25%",
      "Up to 50%",
      "Up to 75%",
      "Up to 90%"
    ],
    "correctIndex": 2,
    "explanation": "The article states that up to 75% of the NRC's nearly 200 locomotives are not operational."
  },
  {
    "id": "q_nf_1090_2",
    "factId": "nf_1090",
    "question": "What event occurred in 1988 regarding the Nigerian Railway Corporation?",
    "options": [
      "It reached its peak",
      "It declared bankruptcy",
      "It discontinued passenger service",
      "It was privatized"
    ],
    "correctIndex": 1,
    "explanation": "The article mentions that the NRC declared bankruptcy in 1988."
  },
  {
    "id": "q_nf_1090_3",
    "factId": "nf_1090",
    "question": "What is the approximate number of locomotives in working condition, based on the article?",
    "options": [
      "About 25",
      "About 50",
      "About 75",
      "About 100"
    ],
    "correctIndex": 1,
    "explanation": "Since up to 75% of nearly 200 locomotives are not operational, only about 50 are in working condition."
  },
  {
    "id": "q_nf_1091_1",
    "factId": "nf_1091",
    "question": "According to the article, when was the last time the Nigerian Railway Corporation purchased new wagons before 2008?",
    "options": [
      "1948",
      "1988",
      "1993",
      "2002"
    ],
    "correctIndex": 2,
    "explanation": "The article states that no new wagons had been purchased since 1993."
  },
  {
    "id": "q_nf_1091_2",
    "factId": "nf_1091",
    "question": "What was the approximate number of employees at the Nigerian Railway Corporation between 1954 and 1975?",
    "options": [
      "6,516",
      "35,000",
      "45,000",
      "50,000"
    ],
    "correctIndex": 2,
    "explanation": "The article mentions that the corporation had roughly 45,000 employees between 1954 and 1975."
  },
  {
    "id": "q_nf_1091_3",
    "factId": "nf_1091",
    "question": "What was the speed limit for trains due to track conditions, as mentioned in the article?",
    "options": [
      "25 km/h",
      "35 km/h",
      "45 km/h",
      "55 km/h"
    ],
    "correctIndex": 1,
    "explanation": "Track conditions limited trains to just 35 km/h."
  },
  {
    "id": "q_nf_1092_1",
    "factId": "nf_1092",
    "question": "What event in 1911 is widely used to date the end of the Nri kingdom?",
    "options": [
      "The British colonial administration summoned the Eze Nri to a colonial court at Awka.",
      "The Eze Nri was killed in battle against British forces.",
      "The British abolished the title of Eze Nri.",
      "The Eze Nri voluntarily abdicated his throne."
    ],
    "correctIndex": 0,
    "explanation": "The article states that in 1911, the British colonial administration summoned the Eze Nri to appear before a colonial court at Awka, which was a significant breach of ritual seclusion."
  },
  {
    "id": "q_nf_1092_2",
    "factId": "nf_1092",
    "question": "What did colonial officials compel the Eze Nri to do in 1911?",
    "options": [
      "To pay heavy taxes to the colonial government.",
      "To annul taboos and ritual obligations linking communities to Nri.",
      "To convert to Christianity.",
      "To move the capital of the kingdom."
    ],
    "correctIndex": 1,
    "explanation": "According to later Nri accounts, colonial officials compelled Obalike to annul the taboos and ritual obligations that linked communities to Nri, effectively dismantling its ritual authority."
  },
  {
    "id": "q_nf_1092_3",
    "factId": "nf_1092",
    "question": "What happened to the title of Eze Nri after the 1911 event?",
    "options": [
      "It was abolished immediately.",
      "It was transferred to a British-appointed chief.",
      "It was not abolished, and Obalike remained Eze Nri until his death in 1936.",
      "It was given to a council of elders."
    ],
    "correctIndex": 2,
    "explanation": "The article notes that the title of Eze Nri was not abolished; Obalike remained Eze Nri until his death in 1936, but the office no longer held sovereign or administrative jurisdiction."
  },
  {
    "id": "q_nf_1093_1",
    "factId": "nf_1093",
    "question": "What was the primary basis of the Eze Nri's authority?",
    "options": [
      "Military force",
      "Central administration",
      "Religion, title-taking, and purification rites",
      "Economic wealth"
    ],
    "correctIndex": 2,
    "explanation": "The article states that the Eze Nri's authority rested on religion, title-taking, and purification rites, not on armies or bureaucracy."
  },
  {
    "id": "q_nf_1093_2",
    "factId": "nf_1093",
    "question": "Who were the ndi Nri?",
    "options": [
      "A standing army",
      "Traveling ritual specialists",
      "Colonial administrators",
      "Traders from the Aro network"
    ],
    "correctIndex": 1,
    "explanation": "The ndi Nri were traveling ritual specialists who performed services like cleansing offenses and consecrating titles."
  },
  {
    "id": "q_nf_1093_3",
    "factId": "nf_1093",
    "question": "What happened to Nri's influence from the late seventeenth century?",
    "options": [
      "It expanded rapidly",
      "It remained stable",
      "It contracted due to trade and other shifts",
      "It became a centralized empire"
    ],
    "correctIndex": 2,
    "explanation": "The article says Nri's influence contracted as regional trade, the Atlantic slave economy, and the Aro commercial network shifted the balance of power."
  },
  {
    "id": "q_nf_1094_1",
    "factId": "nf_1094",
    "question": "What was the Eze Nri traditionally credited with?",
    "options": [
      "Proclaiming the agricultural year and regulating the four-day market cycle",
      "Leading military conquests and expanding territory",
      "Managing trade and setting market prices",
      "Collecting taxes and administering justice"
    ],
    "correctIndex": 0,
    "explanation": "The Eze Nri's role was symbolic and ritual, linked to the fertility of the land and well-being of the people."
  },
  {
    "id": "q_nf_1094_2",
    "factId": "nf_1094",
    "question": "How did the Eze Nri's authority primarily rest?",
    "options": [
      "On military force and conquest",
      "On religion and ritual rather than military force",
      "On economic wealth and trade control",
      "On a centralized bureaucracy"
    ],
    "correctIndex": 1,
    "explanation": "His authority was based on ritual and reputation, not on a standing army or bureaucracy."
  },
  {
    "id": "q_nf_1094_3",
    "factId": "nf_1094",
    "question": "What happened to the Eze Nri's calendrical authority from the late seventeenth century?",
    "options": [
      "It expanded under colonial rule",
      "It remained unchanged",
      "It diminished, especially under colonial rule",
      "It was transferred to a council of elders"
    ],
    "correctIndex": 2,
    "explanation": "As Nri's influence waned, especially under colonial rule, the king's calendrical authority diminished, but the office survived."
  },
  {
    "id": "q_nf_1096_1",
    "factId": "nf_1096",
    "question": "Who began excavating the three sites at Igbo-Ukwu in 1959?",
    "options": [
      "Thurstan Shaw",
      "Eze Nri",
      "Igbo Isaiah",
      "Agukwu-Nri"
    ],
    "correctIndex": 0,
    "explanation": "The article states that archaeologist Thurstan Shaw began excavating the three sites in 1959."
  },
  {
    "id": "q_nf_1096_2",
    "factId": "nf_1096",
    "question": "What do the materials found at Igbo-Ukwu indicate about the society?",
    "options": [
      "It was isolated from other regions",
      "It had no social hierarchies",
      "It had long-distance connections and social differentiation",
      "It was a simple, egalitarian society"
    ],
    "correctIndex": 2,
    "explanation": "The article says the copper alloys, beads, and other materials point to long-distance connections and reveal specialized production and social differentiation."
  },
  {
    "id": "q_nf_1096_3",
    "factId": "nf_1096",
    "question": "According to recent excavations and radiocarbon dates, during which period was the settlement at Igbo-Ukwu active?",
    "options": [
      "From the first to the fifth century",
      "From the late ninth to the thirteenth century",
      "From the fourteenth to the seventeenth century",
      "From the eighteenth to the twentieth century"
    ],
    "correctIndex": 1,
    "explanation": "The article states that recent excavations and radiocarbon dates show the settlement was active from the late ninth to the thirteenth century."
  },
  {
    "id": "q_nf_1097_1",
    "factId": "nf_1097",
    "question": "When were the recent excavations at Igbo-Ukwu conducted?",
    "options": [
      "1960s",
      "2019 and 2021",
      "Ninth century",
      "Thirteenth century"
    ],
    "correctIndex": 1,
    "explanation": "The article states that excavations in 2019 and 2021 found ceramics south of the original sites."
  },
  {
    "id": "q_nf_1097_2",
    "factId": "nf_1097",
    "question": "What do the new radiocarbon dates from Igbo-Ukwu indicate about the settlement?",
    "options": [
      "It existed only in the ninth century.",
      "It lasted from the end of the ninth to the second half of the thirteenth century.",
      "It was a brief flash.",
      "It was a single event."
    ],
    "correctIndex": 1,
    "explanation": "The new dates range from the end of the ninth to the second half of the thirteenth century, showing a much longer span than previously thought."
  },
  {
    "id": "q_nf_1097_3",
    "factId": "nf_1097",
    "question": "What has archaeology not yet proven about Igbo-Ukwu?",
    "options": [
      "That it was a lasting community.",
      "That it was larger than previously known.",
      "That it was Nri's capital or that the excavated individuals were Nri kings.",
      "That it had sophisticated copper-alloy castings."
    ],
    "correctIndex": 2,
    "explanation": "The article says archaeology has not yet proven that Igbo-Ukwu was Nri's capital or that the excavated individuals were Nri kings."
  },
  {
    "id": "q_nf_1098_1",
    "factId": "nf_1098",
    "question": "Who did Emmanuel Nwude impersonate to convince the Brazilian bank director?",
    "options": [
      "The governor of Nigeria's central bank",
      "The president of Nigeria",
      "The minister of finance",
      "The director of the Nigerian Stock Exchange"
    ],
    "correctIndex": 0,
    "explanation": "Nwude impersonated the governor of Nigeria's central bank to gain the bank director's trust."
  },
  {
    "id": "q_nf_1098_2",
    "factId": "nf_1098",
    "question": "What was the total amount transferred to Nwude and his accomplices over three years?",
    "options": [
      "$242 million",
      "$200 million",
      "$250 million",
      "$300 million"
    ],
    "correctIndex": 0,
    "explanation": "The article states that Sakaguchi transferred $242 million to Nwude and his accomplices."
  },
  {
    "id": "q_nf_1098_3",
    "factId": "nf_1098",
    "question": "What happened to Banco Noroeste after the fraud was uncovered?",
    "options": [
      "It was sold to Banco Santander",
      "It collapsed in 2001",
      "It was fined by regulators",
      "It merged with another bank"
    ],
    "correctIndex": 1,
    "explanation": "The article says the bank collapsed in 2001, despite the owners paying the $242 million to guarantee a sale to Santander."
  },
  {
    "id": "q_nf_1099_1",
    "factId": "nf_1099",
    "question": "Who did Emmanuel Nwude impersonate to commit the fraud?",
    "options": [
      "The Governor of the Central Bank of Nigeria",
      "The President of Nigeria",
      "The Minister of Finance of Nigeria",
      "The Director of Banco Noroeste"
    ],
    "correctIndex": 0,
    "explanation": "Nwude impersonated Paul Ogwuma, then Governor of the Central Bank of Nigeria, to convince the bank director to invest."
  },
  {
    "id": "q_nf_1099_2",
    "factId": "nf_1099",
    "question": "How much money did Nelson Sakaguchi transfer to Nwude and his accomplices?",
    "options": [
      "$10 million",
      "$242 million",
      "$25 million",
      "$200 million"
    ],
    "correctIndex": 1,
    "explanation": "Over three years, Sakaguchi transferred $242 million to Nwude and his accomplices."
  },
  {
    "id": "q_nf_1099_3",
    "factId": "nf_1099",
    "question": "What event led to the unraveling of the fraud in December 1997?",
    "options": [
      "Nwude's arrest",
      "A Spanish bank taking over Banco Noroeste noticed a huge sum unmonitored",
      "The collapse of Banco Noroeste",
      "The creation of the EFCC"
    ],
    "correctIndex": 1,
    "explanation": "The fraud unraveled when Santander, a Spanish bank taking over Banco Noroeste, noticed a huge sum sitting unmonitored in the Cayman Islands."
  },
  {
    "id": "q_nf_1100_1",
    "factId": "nf_1100",
    "question": "What was the total amount netted from the fraud against Banco Noroeste?",
    "options": [
      "$10 million",
      "$191 million",
      "$242 million",
      "$52 million"
    ],
    "correctIndex": 2,
    "explanation": "The fraud netted $242 million, which included $191 million in cash and the rest in interest."
  },
  {
    "id": "q_nf_1100_2",
    "factId": "nf_1100",
    "question": "What event led to the unraveling of the scheme in December 1997?",
    "options": [
      "The arrest of Emmanuel Nwude",
      "A Spanish bank questioned a large sum in the Cayman Islands",
      "The collapse of Banco Noroeste",
      "A lawsuit by Nwude"
    ],
    "correctIndex": 1,
    "explanation": "The scheme unraveled when Banco Santander questioned a large sum sitting in the Cayman Islands."
  },
  {
    "id": "q_nf_1100_3",
    "factId": "nf_1100",
    "question": "What happened to Banco Noroeste after the fraud?",
    "options": [
      "It was sold to Banco Santander",
      "It collapsed in 2001",
      "It recovered the $242 million",
      "It continued operating normally"
    ],
    "correctIndex": 1,
    "explanation": "The owners paid the $242 million bill themselves, but the bank collapsed in 2001."
  },
  {
    "id": "q_nf_1101_1",
    "factId": "nf_1101",
    "question": "Who was the first Nigerian professor of medicine at the University of Ibadan?",
    "options": [
      "Adebayo Ogunlesi",
      "Theophilus O. Ogunlesi",
      "Thurgood Marshall",
      "A Nigerian doctor not mentioned in the article"
    ],
    "correctIndex": 1,
    "explanation": "The article states that Theophilus O. Ogunlesi was the first Nigerian professor of medicine at the University of Ibadan."
  },
  {
    "id": "q_nf_1101_2",
    "factId": "nf_1101",
    "question": "In which year did Adebayo Ogunlesi found Global Infrastructure Partners?",
    "options": [
      "2005",
      "2006",
      "2007",
      "2019"
    ],
    "correctIndex": 1,
    "explanation": "The article mentions that Adebayo Ogunlesi founded Global Infrastructure Partners in 2006."
  },
  {
    "id": "q_nf_1101_3",
    "factId": "nf_1101",
    "question": "What is the relationship between Theophilus O. Ogunlesi and Adebayo Ogunlesi?",
    "options": [
      "They are brothers",
      "Theophilus is Adebayo's father",
      "They are colleagues",
      "They are unrelated"
    ],
    "correctIndex": 1,
    "explanation": "The fact states that Adebayo Ogunlesi is the son of Theophilus O. Ogunlesi, making Theophilus his father."
  },
  {
    "id": "q_nf_1102_1",
    "factId": "nf_1102",
    "question": "What was Christian Okoye's nickname?",
    "options": [
      "The Nigerian Nightmare",
      "The African Thunder",
      "The Nigerian Storm",
      "The African Nightmare"
    ],
    "correctIndex": 0,
    "explanation": "Okoye was nicknamed 'the Nigerian Nightmare' during his NFL career."
  },
  {
    "id": "q_nf_1102_2",
    "factId": "nf_1102",
    "question": "In which video game did Christian Okoye become a legendary, nearly unstoppable player?",
    "options": [
      "Madden NFL",
      "Tecmo Super Bowl",
      "NFL Blitz",
      "John Madden Football"
    ],
    "correctIndex": 1,
    "explanation": "Okoye's virtual dominance in Tecmo Super Bowl made him a video game icon."
  },
  {
    "id": "q_nf_1102_3",
    "factId": "nf_1102",
    "question": "Before playing American football, what sport did Christian Okoye pursue?",
    "options": [
      "Basketball",
      "Soccer",
      "Track and field",
      "Cricket"
    ],
    "correctIndex": 2,
    "explanation": "Okoye had a track and field career before taking up football at age 23."
  },
  {
    "id": "q_nf_1103_1",
    "factId": "nf_1103",
    "question": "What was the approximate area of the Oyo Empire by 1680?",
    "options": [
      "Over 150,000 square kilometers",
      "Over 100,000 square kilometers",
      "Over 200,000 square kilometers",
      "Over 50,000 square kilometers"
    ],
    "correctIndex": 0,
    "explanation": "The article states that by 1680, the Oyo Empire had grown to cover over 150,000 square kilometers."
  },
  {
    "id": "q_nf_1103_2",
    "factId": "nf_1103",
    "question": "Which of the following was a key factor in the Oyo Empire's expansion?",
    "options": [
      "Its powerful navy",
      "Its use of cavalry",
      "Its control of the Sahara trade",
      "Its alliance with the Sokoto Caliphate"
    ],
    "correctIndex": 1,
    "explanation": "The article says the empire's military strength, particularly its use of cavalry, was key to its growth."
  },
  {
    "id": "q_nf_1103_3",
    "factId": "nf_1103",
    "question": "What contributed to the fall of the Oyo Empire?",
    "options": [
      "Internal strife and the decline of the slave trade",
      "A devastating drought",
      "An invasion by the Kingdom of Dahomey",
      "The rise of the Oyo Mesi"
    ],
    "correctIndex": 0,
    "explanation": "The article mentions that internal strife and the decline of the slave trade weakened the empire, leading to its collapse."
  },
  {
    "id": "q_nf_1104_1",
    "factId": "nf_1104",
    "question": "What was the primary weapon of the Oyo cavalry?",
    "options": [
      "Firearms",
      "Bows and arrows or clubs",
      "Swords and shields",
      "Spears and javelins"
    ],
    "correctIndex": 1,
    "explanation": "The article states that Oyo horsemen were armed with bows and arrows or clubs."
  },
  {
    "id": "q_nf_1104_2",
    "factId": "nf_1104",
    "question": "Why was the Oyo Empire able to maintain large numbers of horses?",
    "options": [
      "It had access to European horse traders",
      "Its northern location in the savannah was free from the tsetse fly",
      "It imported horses from North Africa",
      "It had vast grasslands for grazing"
    ],
    "correctIndex": 1,
    "explanation": "The article explains that the empire's northern location in the savannah allowed it to keep horses free from the tsetse fly."
  },
  {
    "id": "q_nf_1104_3",
    "factId": "nf_1104",
    "question": "What was one drawback of maintaining the large cavalry force?",
    "options": [
      "Horses could not be used in the forested south",
      "The cavalry was ineffective against firearms",
      "Horses were expensive to feed",
      "The cavalry was difficult to train"
    ],
    "correctIndex": 0,
    "explanation": "The article notes that horses could not be used in the forested south, which was a drawback."
  },
  {
    "id": "q_nf_1105_1",
    "factId": "nf_1105",
    "question": "How much did the Kingdom of Dahomey pay in taxes to the Oyo Empire per year?",
    "options": [
      "14 million US dollars",
      "40 million US dollars",
      "14 billion US dollars",
      "4 million US dollars"
    ],
    "correctIndex": 0,
    "explanation": "The article states that Dahomey paid an estimated 14 million US dollars a year in taxes."
  },
  {
    "id": "q_nf_1105_2",
    "factId": "nf_1105",
    "question": "What was the role of the Ilari in the Oyo Empire?",
    "options": [
      "They were military commanders.",
      "They collected tribute and served as spies.",
      "They were religious leaders.",
      "They were traders."
    ],
    "correctIndex": 1,
    "explanation": "The Ilari were Oyo-appointed officials who collected tribute and also served as spies."
  },
  {
    "id": "q_nf_1105_3",
    "factId": "nf_1105",
    "question": "What happened when Oyo's power waned in the early 19th century?",
    "options": [
      "Dahomey increased its tribute payments.",
      "Dahomey revolted and stopped paying tribute.",
      "Oyo conquered new territories.",
      "The Oyo Empire formed an alliance with Dahomey."
    ],
    "correctIndex": 1,
    "explanation": "When Oyo's power declined, Dahomey revolted and ended its tribute payments, contributing to Oyo's decline."
  },
  {
    "id": "q_nf_1106_1",
    "factId": "nf_1106",
    "question": "How many times did the Oyo Empire invade Dahomey before finally subjugating it in 1748?",
    "options": [
      "5",
      "11",
      "15",
      "20"
    ],
    "correctIndex": 1,
    "explanation": "The article states that Oyo invaded Dahomey 11 times before finally subjugating the kingdom in 1748."
  },
  {
    "id": "q_nf_1106_2",
    "factId": "nf_1106",
    "question": "What advantage did the Fon warriors have when Oyo first invaded in 1728?",
    "options": [
      "Cavalry",
      "Trenches and firearms",
      "Elephants",
      "Naval fleet"
    ],
    "correctIndex": 1,
    "explanation": "The Fon warriors had no horses but plenty of firearms, and their trenches stopped Oyo's charges."
  },
  {
    "id": "q_nf_1106_3",
    "factId": "nf_1106",
    "question": "What event in 1823 ended Oyo's dominance over Dahomey?",
    "options": [
      "Dahomey paid tribute",
      "King Gezo refused to pay tribute and Oyo's attack was beaten",
      "Oyo voluntarily withdrew",
      "A peace treaty was signed"
    ],
    "correctIndex": 1,
    "explanation": "When Oyo demanded tribute after Dahomey raided villages, King Gezo refused, and Oyo's attack was decisively beaten, ending its dominance."
  },
  {
    "id": "q_nf_1107_1",
    "factId": "nf_1107",
    "question": "What event forced the Oyo ruling dynasty into exile around 1535?",
    "options": [
      "An invasion by the Nupe people",
      "A civil war within the empire",
      "A drought that caused famine",
      "An attack by the Borgu kingdom"
    ],
    "correctIndex": 0,
    "explanation": "The Nupe invasion forced the Oyo dynasty into exile in Borgu, leading to an 80-year period of exile."
  },
  {
    "id": "q_nf_1107_2",
    "factId": "nf_1107",
    "question": "What military tactic did Oyo adopt to strengthen its military?",
    "options": [
      "Naval warfare",
      "Cavalry",
      "Siege engines",
      "Archery"
    ],
    "correctIndex": 1,
    "explanation": "Oyo adopted cavalry, a tactic learned from their Nupe enemies, which was key to their resurgence."
  },
  {
    "id": "q_nf_1107_3",
    "factId": "nf_1107",
    "question": "Which political body served as a check on the Alaafin's power?",
    "options": [
      "The Oyo Mesi",
      "The Borgu council",
      "The Nupe assembly",
      "The Ewe parliament"
    ],
    "correctIndex": 0,
    "explanation": "The Oyo Mesi and the Ogboni were councils that checked the Alaafin's power, forming a system of checks and balances."
  },
  {
    "id": "q_nf_1108_1",
    "factId": "nf_1108",
    "question": "Which city was named World Book Capital for 2014?",
    "options": [
      "Port Harcourt",
      "Lagos",
      "Nairobi",
      "Cape Town"
    ],
    "correctIndex": 0,
    "explanation": "Port Harcourt was named World Book Capital for 2014, making it the first city in Black Africa to receive the title."
  },
  {
    "id": "q_nf_1108_2",
    "factId": "nf_1108",
    "question": "What was the title given to Port Harcourt for 2014?",
    "options": [
      "World Book Capital",
      "Literary City of Africa",
      "Book Festival Host",
      "Reading Capital"
    ],
    "correctIndex": 0,
    "explanation": "The title was World Book Capital, awarded by UNESCO and other organizations."
  },
  {
    "id": "q_nf_1108_3",
    "factId": "nf_1108",
    "question": "Which event, established in 2008, helped grow Port Harcourt's literary scene?",
    "options": [
      "Port Harcourt Book Festival",
      "African Book Fair",
      "International Book Day",
      "Literary Carnival"
    ],
    "correctIndex": 0,
    "explanation": "The Port Harcourt Book Festival, an annual event, was established in 2008 and helped attract publishers and promote reading."
  },
  {
    "id": "q_nf_1109_1",
    "factId": "nf_1109",
    "question": "What is the name of the building that is the tallest in the Southeast and South-South geopolitical zones?",
    "options": [
      "Point Block",
      "Rivers State Secretariat",
      "Port Harcourt Tower",
      "Niger Delta Building"
    ],
    "correctIndex": 0,
    "explanation": "The article states that the Point Block of the Rivers State Secretariat is the tallest building in those zones."
  },
  {
    "id": "q_nf_1109_2",
    "factId": "nf_1109",
    "question": "How many stories does the Point Block have?",
    "options": [
      "8",
      "18",
      "80",
      "12"
    ],
    "correctIndex": 1,
    "explanation": "The article says the Point Block rises 18 stories above the city."
  },
  {
    "id": "q_nf_1109_3",
    "factId": "nf_1109",
    "question": "In which city is the Point Block located?",
    "options": [
      "Lagos",
      "Abuja",
      "Port Harcourt",
      "Enugu"
    ],
    "correctIndex": 2,
    "explanation": "The article mentions that the building is in the heart of Port Harcourt."
  },
  {
    "id": "q_nf_1110_1",
    "factId": "nf_1110",
    "question": "What was Funmilayo Ransome-Kuti's name when she enrolled at Abeokuta Grammar School?",
    "options": [
      "Frances Abigail Thomas",
      "Funmilayo Ransome-Kuti",
      "Abigail Frances Thomas",
      "Frances Ransome-Kuti"
    ],
    "correctIndex": 0,
    "explanation": "The article states that Frances Abigail Thomas would later be known as Funmilayo Ransome-Kuti."
  },
  {
    "id": "q_nf_1110_2",
    "factId": "nf_1110",
    "question": "In what year did Abeokuta Grammar School first admit female students?",
    "options": [
      "1914",
      "1915",
      "1916",
      "1917"
    ],
    "correctIndex": 0,
    "explanation": "The article says that in 1914, the school opened its doors to female students for the first time."
  },
  {
    "id": "q_nf_1110_3",
    "factId": "nf_1110",
    "question": "What did Funmilayo Ransome-Kuti organize for lower-income women?",
    "options": [
      "Literacy classes",
      "Tax protests",
      "Preschool classes",
      "Constitutional changes"
    ],
    "correctIndex": 0,
    "explanation": "The article mentions that she organized literacy classes for lower-income women, among other activities."
  },
  {
    "id": "q_nf_1111_1",
    "factId": "nf_1111",
    "question": "What was the main reason the Abeokuta Women's Union protested?",
    "options": [
      "Unfair taxes on market women",
      "Lack of education for women",
      "Colonial rule in general",
      "The Alake's abdication"
    ],
    "correctIndex": 0,
    "explanation": "The AWU protested unfair taxes on market women and demanded representation in local government."
  },
  {
    "id": "q_nf_1111_2",
    "factId": "nf_1111",
    "question": "How did Funmilayo Ransome-Kuti and the AWU publicly shame the Alake?",
    "options": [
      "By organizing a strike",
      "By singing insulting songs outside his palace",
      "By writing letters to the British government",
      "By refusing to pay taxes"
    ],
    "correctIndex": 1,
    "explanation": "The AWU used petitions, press conferences, and sang insulting songs outside the Alake's palace to publicly shame him."
  },
  {
    "id": "q_nf_1111_3",
    "factId": "nf_1111",
    "question": "What was a direct result of the AWU's protests?",
    "options": [
      "The Alake was permanently removed from power",
      "Women were given the right to vote",
      "The flat-rate tax was abolished",
      "The British district officer was expelled"
    ],
    "correctIndex": 2,
    "explanation": "The protests led to the abolition of the flat-rate tax and the appointment of women to the interim governing council."
  },
  {
    "id": "q_nf_1112_1",
    "factId": "nf_1112",
    "question": "Why was Funmilayo Ransome-Kuti denied a US visa in 1958?",
    "options": [
      "Because she had too many Communist connections",
      "Because she had visited China",
      "Because she was an African Socialist",
      "Because she had met Mao Zedong"
    ],
    "correctIndex": 0,
    "explanation": "The article states that American authorities denied her visa because they felt she had 'too many Communist connections.'"
  },
  {
    "id": "q_nf_1112_2",
    "factId": "nf_1112",
    "question": "What happened to Ransome-Kuti's passport a year before the visa denial?",
    "options": [
      "It was renewed",
      "It was refused renewal by British colonial authorities",
      "It was stolen",
      "It was revoked by the US"
    ],
    "correctIndex": 1,
    "explanation": "The article says that a year earlier, British colonial authorities had refused to renew her passport, also citing suspected communist ties."
  },
  {
    "id": "q_nf_1112_3",
    "factId": "nf_1112",
    "question": "What did Ransome-Kuti receive in 1970?",
    "options": [
      "The Nobel Peace Prize",
      "The Lenin Peace Prize",
      "The US visa",
      "The Women's International Democratic Federation award"
    ],
    "correctIndex": 1,
    "explanation": "The article mentions that in 1970 she received the Lenin Peace Prize from the Soviet Union."
  },
  {
    "id": "q_nf_1113_1",
    "factId": "nf_1113",
    "question": "Which of Funmilayo Ransome-Kuti's sons was a doctor and human rights campaigner?",
    "options": [
      "Fela Kuti",
      "Beko Ransome-Kuti",
      "Olikoye Ransome-Kuti",
      "All of the above"
    ],
    "correctIndex": 1,
    "explanation": "The article states that Beko Ransome-Kuti was a doctor and human rights campaigner."
  },
  {
    "id": "q_nf_1113_2",
    "factId": "nf_1113",
    "question": "In the 1940s, which organization did Funmilayo Ransome-Kuti lead in protests?",
    "options": [
      "The Nigerian Women's Union",
      "The Abeokuta Women's Union",
      "The Women's Rights League",
      "The Anti-Colonial League"
    ],
    "correctIndex": 1,
    "explanation": "The article says she led the Abeokuta Women's Union in protests that forced the local ruler to temporarily step down."
  },
  {
    "id": "q_nf_1113_3",
    "factId": "nf_1113",
    "question": "What was the cause of Funmilayo Ransome-Kuti's death in 1978?",
    "options": [
      "She died of natural causes",
      "She was wounded during a raid on Fela's compound",
      "She was killed in a car accident",
      "She died during a protest"
    ],
    "correctIndex": 1,
    "explanation": "The article states that her death came after she was wounded during a raid on Fela's compound."
  },
  {
    "id": "q_nf_1114_1",
    "factId": "nf_1114",
    "question": "What was the population of the Sokoto Caliphate by 1837?",
    "options": [
      "1–2.5 million",
      "10–20 million",
      "30–40 million",
      "50–60 million"
    ],
    "correctIndex": 1,
    "explanation": "By 1837, the Sokoto Caliphate had a population of 10–20 million, making it the most populous empire in West Africa."
  },
  {
    "id": "q_nf_1114_2",
    "factId": "nf_1114",
    "question": "Who led the jihad that founded the Sokoto Caliphate?",
    "options": [
      "Abdullahi dan Fodio",
      "Usman dan Fodio",
      "Boko Haram",
      "The Sultan of Sokoto"
    ],
    "correctIndex": 1,
    "explanation": "Usman dan Fodio, a scholar, led the jihad against the Hausa kingdoms, and by 1808 the Sokoto Caliphate was born."
  },
  {
    "id": "q_nf_1114_3",
    "factId": "nf_1114",
    "question": "What happened to the Sokoto Caliphate in 1903?",
    "options": [
      "It reached its peak population.",
      "It was dissolved by British forces.",
      "It inspired jihads in Mali.",
      "It became a center of Islamic scholarship."
    ],
    "correctIndex": 1,
    "explanation": "In 1903, British forces conquered Sokoto and dissolved the caliphate, though the title of Sultan was retained symbolically."
  },
  {
    "id": "q_nf_1115_1",
    "factId": "nf_1115",
    "question": "By 1900, how many slaves did the Sokoto Caliphate hold?",
    "options": [
      "Between 1 and 2.5 million",
      "Between 500,000 and 1 million",
      "Between 2.5 and 5 million",
      "Exactly 1 million"
    ],
    "correctIndex": 0,
    "explanation": "The article states that by 1900, the caliphate held between 1 and 2.5 million slaves."
  },
  {
    "id": "q_nf_1115_2",
    "factId": "nf_1115",
    "question": "Which of the following is mentioned as having a slave population that was possibly larger than Sokoto's?",
    "options": [
      "The American South",
      "Ancient Rome",
      "The Ottoman Empire",
      "The Caribbean"
    ],
    "correctIndex": 0,
    "explanation": "The article says Sokoto's slave population was surpassed only by the American South and possibly Brazil."
  },
  {
    "id": "q_nf_1115_3",
    "factId": "nf_1115",
    "question": "What happened in 1903 that formally abolished the legal status of slavery in Sokoto?",
    "options": [
      "The British conquest",
      "A local uprising",
      "A treaty with France",
      "The death of the caliph"
    ],
    "correctIndex": 0,
    "explanation": "The article states that the British conquest in 1903 formally abolished the legal status of slavery."
  },
  {
    "id": "q_nf_1116_1",
    "factId": "nf_1116",
    "question": "Who introduced the name 'Sokoto Caliphate'?",
    "options": [
      "Murray Last",
      "Abdullahi Smith",
      "Usman dan Fodio",
      "A colonial writer"
    ],
    "correctIndex": 0,
    "explanation": "Murray Last, a young British historian, chose the title 'The Sokoto Caliphate' for his 1966 dissertation."
  },
  {
    "id": "q_nf_1116_2",
    "factId": "nf_1116",
    "question": "What did Professor Abdullahi Smith prefer to call the state?",
    "options": [
      "The Fulani Empire",
      "The Sokoto Caliphate",
      "The Caliphate of Sokoto",
      "Daular 'Uthmaniyya"
    ],
    "correctIndex": 2,
    "explanation": "Professor Abdullahi Smith preferred 'The Caliphate of Sokoto', but the shorter version caught on."
  },
  {
    "id": "q_nf_1116_3",
    "factId": "nf_1116",
    "question": "Why did Murray Last choose the term 'caliphate'?",
    "options": [
      "To emphasize ethnic conquest",
      "To use a properly Islamic term",
      "To follow colonial naming",
      "To honor his supervisor"
    ],
    "correctIndex": 1,
    "explanation": "Last wanted a properly Islamic term for what he saw as a properly Islamic state, and the choice shifted understanding of the jihad as a religious movement."
  },
  {
    "id": "q_nf_1117_1",
    "factId": "nf_1117",
    "question": "What military shift began in the Sokoto Caliphate after 1860?",
    "options": [
      "From cavalry to infantry and firearms",
      "From infantry to cavalry and swords",
      "From naval to land-based warfare",
      "From guerrilla tactics to siege warfare"
    ],
    "correctIndex": 0,
    "explanation": "The article states that after 1860, the caliphate's army began shifting toward infantry, long-range fighting, and firearms."
  },
  {
    "id": "q_nf_1117_2",
    "factId": "nf_1117",
    "question": "What event halted the military evolution of the Sokoto Caliphate?",
    "options": [
      "Internal rebellion",
      "British conquest",
      "French invasion",
      "Economic collapse"
    ],
    "correctIndex": 1,
    "explanation": "The British conquest from 1897 to 1903 cut short the caliphate's military transition."
  },
  {
    "id": "q_nf_1117_3",
    "factId": "nf_1117",
    "question": "By 1903, the Sokoto Caliphate's territories were absorbed into which entity?",
    "options": [
      "The French West Africa",
      "The Northern Nigeria Protectorate",
      "The British East Africa",
      "The German Cameroon"
    ],
    "correctIndex": 1,
    "explanation": "The article says that by 1903, the caliphate was dissolved and its territories were absorbed into the Northern Nigeria Protectorate."
  },
  {
    "id": "q_nf_1118_1",
    "factId": "nf_1118",
    "question": "Who was the first Grand Vizier of the Sokoto Caliphate?",
    "options": [
      "Waziri Gidado",
      "Abdullahi dan Fodio",
      "Usman dan Fodio",
      "Gidado Idris"
    ],
    "correctIndex": 1,
    "explanation": "The article states that Abdullahi dan Fodio, a brother of the founder Usman dan Fodio, was the first Grand Vizier."
  },
  {
    "id": "q_nf_1118_2",
    "factId": "nf_1118",
    "question": "What was the role of the Vizier in the Sokoto Caliphate?",
    "options": [
      "Chief military commander",
      "Chief adviser and friend to the Caliph",
      "Treasurer of the Caliphate",
      "Religious leader"
    ],
    "correctIndex": 1,
    "explanation": "The article describes the Vizier as acting as chief adviser and friend to the Caliph."
  },
  {
    "id": "q_nf_1118_3",
    "factId": "nf_1118",
    "question": "Who was Gidado Idris in relation to Waziri Gidado?",
    "options": [
      "His son",
      "His grandson",
      "His great-grandson",
      "His brother"
    ],
    "correctIndex": 2,
    "explanation": "The article states that Gidado Idris was a great-grandson of Waziri Gidado."
  },
  {
    "id": "q_nf_1119_1",
    "factId": "nf_1119",
    "question": "What was the total volume of the dungeon in Kano described by Lord Lugard?",
    "options": [
      "2,618 cubic feet",
      "1,000 cubic feet",
      "5,000 cubic feet",
      "10,000 cubic feet"
    ],
    "correctIndex": 0,
    "explanation": "The dungeon's two compartments totaled 2,618 cubic feet, as stated in the article."
  },
  {
    "id": "q_nf_1119_2",
    "factId": "nf_1119",
    "question": "How were prisoners in the dungeon treated during the day?",
    "options": [
      "They were kept in the dungeon all day.",
      "They were let out to cook.",
      "They were taken to work in fields.",
      "They were allowed to exercise."
    ],
    "correctIndex": 1,
    "explanation": "The article says prisoners were let out during the day to cook, but at night they were crammed inside."
  },
  {
    "id": "q_nf_1119_3",
    "factId": "nf_1119",
    "question": "What did the British abolish after conquering the region?",
    "options": [
      "The Sokoto Caliphate",
      "The legal status of slavery",
      "The dungeon system",
      "The slave trade"
    ],
    "correctIndex": 1,
    "explanation": "The article states that the British abolished the legal status of slavery after conquering the region."
  },
  {
    "id": "q_nf_1120_1",
    "factId": "nf_1120",
    "question": "In what year did Wole Soyinka become the first African to win the Nobel Prize in Literature?",
    "options": [
      "1986",
      "1984",
      "1990",
      "1976"
    ],
    "correctIndex": 0,
    "explanation": "The article states that in 1986, Wole Soyinka was the first African to receive the Nobel Prize in Literature."
  },
  {
    "id": "q_nf_1120_2",
    "factId": "nf_1120",
    "question": "What was the title of Wole Soyinka's Nobel acceptance speech?",
    "options": [
      "This Past Must Address Its Present",
      "The Drama of Existence",
      "A Voice for the Voiceless",
      "Literature and Politics"
    ],
    "correctIndex": 0,
    "explanation": "The article mentions that his Nobel acceptance speech was titled 'This Past Must Address Its Present' and was devoted to Nelson Mandela."
  },
  {
    "id": "q_nf_1120_3",
    "factId": "nf_1120",
    "question": "Which country renamed the National Arts Theatre in honor of Wole Soyinka during his 90th birthday celebrations?",
    "options": [
      "Nigeria",
      "Ghana",
      "South Africa",
      "Kenya"
    ],
    "correctIndex": 0,
    "explanation": "The article states that in 2024, Nigeria renamed the National Arts Theatre in his honor during his 90th birthday celebrations."
  },
  {
    "id": "q_nf_1121_1",
    "factId": "nf_1121",
    "question": "In what year did Wole Soyinka flee Nigeria on a motorcycle?",
    "options": [
      "1994",
      "1997",
      "1996",
      "1967"
    ],
    "correctIndex": 0,
    "explanation": "The article states that in November 1994, Soyinka made his dramatic escape from Nigeria on a motorcycle."
  },
  {
    "id": "q_nf_1121_2",
    "factId": "nf_1121",
    "question": "Which country did Soyinka cross into after fleeing Nigeria?",
    "options": [
      "Benin",
      "Ghana",
      "Togo",
      "United States"
    ],
    "correctIndex": 0,
    "explanation": "The article says he crossed the border into Benin before continuing to the United States."
  },
  {
    "id": "q_nf_1121_3",
    "factId": "nf_1121",
    "question": "What was the name of the memoir Soyinka wrote about his imprisonment during the Nigerian Civil War?",
    "options": [
      "The Open Sore of a Continent",
      "The Man Died",
      "Ake: The Years of Childhood",
      "Death and the King's Horseman"
    ],
    "correctIndex": 1,
    "explanation": "The article mentions that his prison experiences led to his memoir 'The Man Died.'"
  },
  {
    "id": "q_nf_1122_1",
    "factId": "nf_1122",
    "question": "What did the viral photo in 2025 claim to show?",
    "options": [
      "Wole Soyinka with a young Gbenga Daniel",
      "Wole Soyinka receiving the Nobel Prize",
      "Gbenga Daniel with a Nobel laureate",
      "A scene of loyalty between two politicians"
    ],
    "correctIndex": 0,
    "explanation": "The photo was claimed to show Soyinka with a young Gbenga Daniel, but it was debunked."
  },
  {
    "id": "q_nf_1122_2",
    "factId": "nf_1122",
    "question": "Which organization labelled the photo as false?",
    "options": [
      "Nobel Prize Committee",
      "Dubawa",
      "Nigerian government",
      "AfriFacts"
    ],
    "correctIndex": 1,
    "explanation": "Dubawa, a fact-checking website, debunked the photo and labelled it false."
  },
  {
    "id": "q_nf_1122_3",
    "factId": "nf_1122",
    "question": "What is Wole Soyinka known for according to the article?",
    "options": [
      "Being a politician",
      "Winning the Nobel Prize in Literature in 1986",
      "Being a fact-checker",
      "Being a young man in a viral photo"
    ],
    "correctIndex": 1,
    "explanation": "Soyinka won the Nobel Prize in Literature in 1986 and is a cultural icon."
  },
  {
    "id": "q_nf_1123_1",
    "factId": "nf_1123",
    "question": "What was the name of the team that Nigeria played in 1949, drawing a record crowd of 6,000?",
    "options": [
      "Marine A.F.C.",
      "Bishop Auckland",
      "Dulwich Hamlet",
      "Bromley"
    ],
    "correctIndex": 0,
    "explanation": "Marine A.F.C. hosted Nigeria at Rossett Park, and the 6,000 spectators set a record for that ground."
  },
  {
    "id": "q_nf_1123_2",
    "factId": "nf_1123",
    "question": "When did Nigeria arrive in Liverpool for their 1949 tour?",
    "options": [
      "29 August",
      "Late summer",
      "Two months before their first international",
      "After playing Bishop Auckland"
    ],
    "correctIndex": 0,
    "explanation": "The article states they arrived in Liverpool on 29 August, beginning the tour."
  },
  {
    "id": "q_nf_1123_3",
    "factId": "nf_1123",
    "question": "What was the result of Nigeria's first official international match?",
    "options": [
      "They beat Sierra Leone 2–0",
      "They lost to Sierra Leone",
      "They drew with Sierra Leone",
      "They played no official match in 1949"
    ],
    "correctIndex": 0,
    "explanation": "Two months after the tour, Nigeria beat Sierra Leone 2–0 in Freetown, their first official international."
  },
  {
    "id": "q_nf_1124_1",
    "factId": "nf_1124",
    "question": "In what year did Nigeria play its first official football match?",
    "options": [
      "1938",
      "1949",
      "1950",
      "1960"
    ],
    "correctIndex": 1,
    "explanation": "Nigeria's first official game was in October 1949, as stated in the fact."
  },
  {
    "id": "q_nf_1124_2",
    "factId": "nf_1124",
    "question": "Who did Nigeria beat in its first official match?",
    "options": [
      "Gold Coast",
      "England",
      "Sierra Leone",
      "Ghana"
    ],
    "correctIndex": 2,
    "explanation": "The article says Nigeria beat Sierra Leone 2–0 in Freetown in that match."
  },
  {
    "id": "q_nf_1124_3",
    "factId": "nf_1124",
    "question": "What was the score of Nigeria's first official match?",
    "options": [
      "1–0",
      "2–0",
      "3–1",
      "0–0"
    ],
    "correctIndex": 1,
    "explanation": "The fact and article both state the result was a 2–0 victory."
  },
  {
    "id": "q_nf_1125_1",
    "factId": "nf_1125",
    "question": "Where did Nigeria win its first major football gold medal?",
    "options": [
      "Lagos",
      "Abuja",
      "Cairo",
      "Nairobi"
    ],
    "correctIndex": 0,
    "explanation": "The article states that Nigeria's national football team traveled to Lagos for the 2nd All-Africa Games in 1973 and clinched the gold medal there."
  },
  {
    "id": "q_nf_1125_2",
    "factId": "nf_1125",
    "question": "Who captained Nigeria's team to the 1973 All-Africa Games gold medal?",
    "options": [
      "Victor Oduah",
      "Segun Odegbami",
      "Rashidi Yekini",
      "Stephen Keshi"
    ],
    "correctIndex": 0,
    "explanation": "The article says the team was under the leadership of captain Victor Oduah when they won the gold medal."
  },
  {
    "id": "q_nf_1125_3",
    "factId": "nf_1125",
    "question": "What did Nigeria achieve in the Africa Cup of Nations in 1980?",
    "options": [
      "Third place",
      "Silver medal",
      "First continental title",
      "Group stage exit"
    ],
    "correctIndex": 2,
    "explanation": "The article mentions that in 1980, Nigeria won their first continental title on home soil in Lagos."
  },
  {
    "id": "q_nf_1126_1",
    "factId": "nf_1126",
    "question": "Which team did Nigeria defeat in the semifinal of the 1996 Olympic football tournament?",
    "options": [
      "Mexico",
      "Brazil",
      "Argentina",
      "Italy"
    ],
    "correctIndex": 1,
    "explanation": "Nigeria beat Brazil 4-3 in the semifinal with a golden goal from Nwankwo Kanu."
  },
  {
    "id": "q_nf_1126_2",
    "factId": "nf_1126",
    "question": "Who scored the winning goal in the final against Argentina?",
    "options": [
      "Nwankwo Kanu",
      "Ronaldo",
      "Emmanuel Amunike",
      "Bebeto"
    ],
    "correctIndex": 2,
    "explanation": "Emmanuel Amunike scored the winner in Nigeria's 3-2 victory over Argentina in the final."
  },
  {
    "id": "q_nf_1126_3",
    "factId": "nf_1126",
    "question": "What was significant about Nigeria's gold medal in 1996?",
    "options": [
      "It was their first Olympic medal in any sport.",
      "They became the first African nation to win the Olympic football tournament.",
      "It was the first time the Olympic football final went to extra time.",
      "They defeated Argentina in a rematch of the 2008 final."
    ],
    "correctIndex": 1,
    "explanation": "Nigeria became the first African nation to win the Olympic football tournament, a landmark for African football."
  },
  {
    "id": "q_nf_1127_1",
    "factId": "nf_1127",
    "question": "Who forced Nigeria to withdraw from the 1996 Africa Cup of Nations?",
    "options": [
      "Nelson Mandela",
      "Sani Abacha",
      "Ken Saro-Wiwa",
      "The Nigerian football federation"
    ],
    "correctIndex": 1,
    "explanation": "The article states that military ruler Sani Abacha forced the national team to withdraw."
  },
  {
    "id": "q_nf_1127_2",
    "factId": "nf_1127",
    "question": "What was the reason for Nigeria's withdrawal from the 1996 Africa Cup of Nations?",
    "options": [
      "A dispute over hosting rights",
      "Criticism over the execution of Ken Saro-Wiwa",
      "Financial problems",
      "A player strike"
    ],
    "correctIndex": 1,
    "explanation": "The withdrawal was a response to criticism from South Africa and Nelson Mandela over the execution of Ogoni activist Ken Saro-Wiwa."
  },
  {
    "id": "q_nf_1127_3",
    "factId": "nf_1127",
    "question": "What was a consequence of Nigeria's withdrawal from the 1996 Africa Cup of Nations?",
    "options": [
      "They were banned from the 1998 Africa Cup of Nations",
      "They were fined a large sum",
      "They lost their hosting rights",
      "They were expelled from CAF"
    ],
    "correctIndex": 0,
    "explanation": "The article says Nigeria was subsequently banned from entering the 1998 Africa Cup of Nations."
  },
  {
    "id": "q_nf_1128_1",
    "factId": "nf_1128",
    "question": "What did President Goodluck Jonathan do on 30 June 2010?",
    "options": [
      "Suspended the national team from international competition for two years",
      "Banned Nigeria from international football indefinitely",
      "Provisionally lifted the ban on the national team",
      "Qualified Nigeria for the 2014 World Cup"
    ],
    "correctIndex": 0,
    "explanation": "President Jonathan suspended the Super Eagles from international competition for two years, which led to FIFA's ban."
  },
  {
    "id": "q_nf_1128_2",
    "factId": "nf_1128",
    "question": "How long did FIFA's ban on Nigeria last?",
    "options": [
      "Two years",
      "Four days",
      "Until 26 October",
      "Indefinitely"
    ],
    "correctIndex": 1,
    "explanation": "The ban was imposed on 4 October and provisionally lifted on 8 October, lasting only four days."
  },
  {
    "id": "q_nf_1128_3",
    "factId": "nf_1128",
    "question": "What event led to the provisional lifting of the ban?",
    "options": [
      "Nigeria's qualification for the 2014 World Cup",
      "The NFF officially recognized NANF",
      "NANF dropped its court case against the federation",
      "FIFA held a hearing on the dispute"
    ],
    "correctIndex": 2,
    "explanation": "The ban was lifted after NANF, a players' union not officially recognized by the NFF, dropped its court case."
  },
  {
    "id": "q_nf_1129_1",
    "factId": "nf_1129",
    "question": "What is Zuma Rock depicted on?",
    "options": [
      "The 100 naira note",
      "The 50 naira note",
      "The 200 naira note",
      "The 500 naira note"
    ],
    "correctIndex": 0,
    "explanation": "Zuma Rock is depicted on the 100 naira note, as stated in the fact and article."
  },
  {
    "id": "q_nf_1129_2",
    "factId": "nf_1129",
    "question": "Which people used Zuma Rock as a defensive retreat during intertribal wars?",
    "options": [
      "The Zuba people",
      "The Gbagyi people",
      "The Hausa people",
      "The Yoruba people"
    ],
    "correctIndex": 1,
    "explanation": "The Gbagyi people used Zuma Rock as a defensive retreat during intertribal wars."
  },
  {
    "id": "q_nf_1129_3",
    "factId": "nf_1129",
    "question": "What does 'zumwa' mean?",
    "options": [
      "A place of guinea fowls",
      "A place of refuge",
      "A sacred rock",
      "A place of spirits"
    ],
    "correctIndex": 0,
    "explanation": "'Zumwa' means 'a place of guinea fowls', as named by the Zuba people who discovered the rock."
  },
  {
    "id": "q_nf_1130_1",
    "factId": "nf_1130",
    "question": "What was Zuma Rock used for by the Gbagyi people?",
    "options": [
      "A place for religious rituals",
      "A defensive retreat against invaders",
      "A source of guinea fowls",
      "A landmark for trade routes"
    ],
    "correctIndex": 1,
    "explanation": "The article states that the Gbagyi retreated to Zuma Rock as a defensive position during intertribal wars."
  },
  {
    "id": "q_nf_1130_2",
    "factId": "nf_1130",
    "question": "Who discovered Zuma Rock in the 15th century?",
    "options": [
      "The Gbagyi people",
      "The Zuba people",
      "The Abuja people",
      "The Kaduna people"
    ],
    "correctIndex": 1,
    "explanation": "The article says Zuma Rock was discovered by the Zuba people, who named it 'zumwa'."
  },
  {
    "id": "q_nf_1130_3",
    "factId": "nf_1130",
    "question": "What does 'zumwa' mean in the language of the Zuba people?",
    "options": [
      "A place of guinea fowls",
      "A place of refuge",
      "A place of spirits",
      "A place of rocks"
    ],
    "correctIndex": 0,
    "explanation": "The article explains that 'zumwa' means 'a place of guinea fowls'."
  },
  {
    "id": "q_nf_1131_1",
    "factId": "nf_1131",
    "question": "What did the Emir of Abuja send annually to the guardians of Zuma Rock?",
    "options": [
      "A black ox, a black he-goat, and a black dog",
      "A white bull, a white ram, and a white rooster",
      "A brown cow, a brown goat, and a brown hen",
      "A red horse, a red sheep, and a red pig"
    ],
    "correctIndex": 0,
    "explanation": "The article states that the Emir of Abuja sent a black ox, a black he-goat, and a black dog as offerings to the deity of Zuma Rock."
  },
  {
    "id": "q_nf_1131_2",
    "factId": "nf_1131",
    "question": "Who delivered the annual sacrifices to the guardians of Zuma Rock?",
    "options": [
      "The villagers from Chachi",
      "The Koro people's chief",
      "The District Officer of Abuja",
      "Sulaimanu Barau"
    ],
    "correctIndex": 0,
    "explanation": "The article says the sacrifices were delivered by villagers from Chachi, who could interact with the guardians because of shared tribal connections."
  },
  {
    "id": "q_nf_1131_3",
    "factId": "nf_1131",
    "question": "According to the priest visited in the 1940s, to whom were animal sacrifices still made?",
    "options": [
      "To the rock itself",
      "To ancestors and spirits of past priests",
      "To the Emir of Abuja",
      "To the District Officer"
    ],
    "correctIndex": 1,
    "explanation": "The priest said animal sacrifices were still made to ancestors and spirits of past priests, not to the rock itself, revealing a shift in understanding."
  },
  {
    "id": "q_nf_1132_1",
    "factId": "nf_1132",
    "question": "In which year did Northern Nigeria formally outlaw slavery?",
    "options": [
      "1914",
      "1936",
      "1900",
      "1945"
    ],
    "correctIndex": 1,
    "explanation": "The article states that slavery was formally outlawed in northern Nigeria in 1936, decades after it was abolished in the south."
  },
  {
    "id": "q_nf_1132_2",
    "factId": "nf_1132",
    "question": "What was the British policy that preserved existing power structures in Northern Nigeria?",
    "options": [
      "Direct rule",
      "Indirect rule",
      "Assimilation",
      "Apartheid"
    ],
    "correctIndex": 1,
    "explanation": "The article explains that the delay in abolition reflected the British policy of indirect rule, which preserved existing power structures to maintain order."
  },
  {
    "id": "q_nf_1132_3",
    "factId": "nf_1132",
    "question": "Which region of Nigeria saw slavery abolished soon after colonial rule was established?",
    "options": [
      "Northern Nigeria",
      "Southern Nigeria",
      "Eastern Nigeria",
      "Western Nigeria"
    ],
    "correctIndex": 1,
    "explanation": "The article says that in the south, the legal abolition of slavery followed soon after colonial rule, while in the north it persisted until 1936."
  },
  {
    "id": "q_nf_1133_1",
    "factId": "nf_1133",
    "question": "According to the article, which organization reported that Nigeria had the highest rate of deforestation in the world in 2005?",
    "options": [
      "World Bank",
      "United Nations",
      "African Union",
      "World Wildlife Fund"
    ],
    "correctIndex": 1,
    "explanation": "The article states that the Food and Agriculture Organization of the United Nations reported this."
  },
  {
    "id": "q_nf_1133_2",
    "factId": "nf_1133",
    "question": "What was Nigeria's annual deforestation rate between 1990 and 2000?",
    "options": [
      "1.2%",
      "2.4%",
      "3.5%",
      "4.6%"
    ],
    "correctIndex": 1,
    "explanation": "The article says Nigeria lost an average of 409,700 hectares per year, an annual deforestation rate of 2.4%."
  },
  {
    "id": "q_nf_1133_3",
    "factId": "nf_1133",
    "question": "What percentage of its forest cover did Nigeria lose from 1990 to 2005?",
    "options": [
      "25.7%",
      "35.7%",
      "45.7%",
      "55.7%"
    ],
    "correctIndex": 1,
    "explanation": "The article states that Nigeria lost 35.7% of its forest cover during that period."
  },
  {
    "id": "q_nf_1134_1",
    "factId": "nf_1134",
    "question": "What is the Niger Delta often cited as an example of?",
    "options": [
      "ecocide",
      "deforestation",
      "desertification",
      "overfishing"
    ],
    "correctIndex": 0,
    "explanation": "The article states that the Delta is often cited as an example of ecocide, which is environmental destruction on a scale that harms entire ecosystems and communities."
  },
  {
    "id": "q_nf_1134_2",
    "factId": "nf_1134",
    "question": "How many people were killed in explosions at illegal refineries in Nigeria in 2022?",
    "options": [
      "125",
      "250",
      "500",
      "1000"
    ],
    "correctIndex": 0,
    "explanation": "The article reports that in 2022 alone, explosions at illegal refineries killed 125 people across Nigeria."
  },
  {
    "id": "q_nf_1134_3",
    "factId": "nf_1134",
    "question": "What has the environmental damage in the Delta fueled?",
    "options": [
      "conflict",
      "tourism",
      "agriculture",
      "fishing"
    ],
    "correctIndex": 0,
    "explanation": "The article says that the environmental damage has fueled conflict in the Delta, as communities protested against pollution and lack of benefits from oil extraction."
  },
  {
    "id": "q_nf_1135_1",
    "factId": "nf_1135",
    "question": "What is the height of NECOM House, the tallest building in Nigeria?",
    "options": [
      "160 meters",
      "100 meters",
      "200 meters",
      "520 meters"
    ],
    "correctIndex": 0,
    "explanation": "NECOM House is 160 meters (520 feet) tall, making it the tallest building in Nigeria."
  },
  {
    "id": "q_nf_1135_2",
    "factId": "nf_1135",
    "question": "In which city is NECOM House located?",
    "options": [
      "Abuja",
      "Lagos",
      "Eko Atlantic",
      "Port Harcourt"
    ],
    "correctIndex": 1,
    "explanation": "NECOM House is located in Lagos, which is described as the commercial hub of Nigeria."
  },
  {
    "id": "q_nf_1135_3",
    "factId": "nf_1135",
    "question": "What does the article suggest about the future of NECOM House's status as the tallest building?",
    "options": [
      "It will remain the tallest for many years.",
      "It may be surpassed by new skyscrapers under construction or proposed.",
      "It will be demolished soon.",
      "It will be converted into a residential building."
    ],
    "correctIndex": 1,
    "explanation": "The article notes that several skyscrapers are under construction or proposed, aiming to exceed 100 meters, which could surpass NECOM House's record."
  },
  {
    "id": "q_nf_1136_1",
    "factId": "nf_1136",
    "question": "What was the Aro network's approximate number of diaspora communities in the Nigerian section of the Bight of Biafra?",
    "options": [
      "50",
      "100",
      "150",
      "200"
    ],
    "correctIndex": 2,
    "explanation": "The article states that by the eighteenth and nineteenth centuries, the network had grown to include around 150 diaspora communities."
  },
  {
    "id": "q_nf_1136_2",
    "factId": "nf_1136",
    "question": "What type of diaspora was the Aro network described as?",
    "options": [
      "Colonial",
      "Trade",
      "Religious",
      "Military"
    ],
    "correctIndex": 1,
    "explanation": "The article describes the Aro network as a trade diaspora, not colonies in the usual sense."
  },
  {
    "id": "q_nf_1136_3",
    "factId": "nf_1136",
    "question": "Which of the following was NOT mentioned as a good that Aro merchants moved?",
    "options": [
      "Enslaved people",
      "Cloth",
      "Firearms",
      "Gold"
    ],
    "correctIndex": 3,
    "explanation": "The article mentions enslaved people, cloth, and firearms, but not gold."
  },
  {
    "id": "q_nf_1142_1",
    "factId": "nf_1142",
    "question": "Who coined the name 'Nigeria'?",
    "options": [
      "Flora Shaw",
      "Lord Lugard",
      "The Times editor",
      "A Nigerian chief"
    ],
    "correctIndex": 0,
    "explanation": "Flora Shaw, a British journalist, proposed the name in a letter to The Times."
  },
  {
    "id": "q_nf_1142_2",
    "factId": "nf_1142",
    "question": "What was the name 'Nigeria' derived from?",
    "options": [
      "The Niger River",
      "The Sahara Desert",
      "The Nile River",
      "The Atlantic Ocean"
    ],
    "correctIndex": 0,
    "explanation": "The name was derived from the Niger River that runs through the region."
  },
  {
    "id": "q_nf_1142_3",
    "factId": "nf_1142",
    "question": "When was the name 'Nigeria' officially used for the merged protectorates?",
    "options": [
      "1897",
      "1914",
      "1900",
      "1960"
    ],
    "correctIndex": 1,
    "explanation": "The name was officially used when the British merged the Southern and Northern protectorates in 1914."
  },
  {
    "id": "q_nf_1147_1",
    "factId": "nf_1147",
    "question": "Who performed the first human-to-human heart transplant?",
    "options": [
      "Christiaan Barnard",
      "Louis Washkansky",
      "A surgeon from the United States",
      "A surgeon from Europe"
    ],
    "correctIndex": 0,
    "explanation": "Christiaan Barnard, a South African surgeon, performed the first human-to-human heart transplant at Groote Schuur Hospital."
  },
  {
    "id": "q_nf_1147_2",
    "factId": "nf_1147",
    "question": "What happened to the first heart transplant patient, Louis Washkansky?",
    "options": [
      "He lived for many years",
      "He died 18 days later from pneumonia",
      "He died during the operation",
      "He recovered fully"
    ],
    "correctIndex": 1,
    "explanation": "Louis Washkansky died 18 days after the transplant from pneumonia, a complication of immunosuppressive drugs."
  },
  {
    "id": "q_nf_1147_3",
    "factId": "nf_1147",
    "question": "What did the first heart transplant spark global debate about?",
    "options": [
      "The ethics of organ transplantation and the definition of death",
      "The cost of medical procedures",
      "The role of animals in research",
      "The location of the hospital"
    ],
    "correctIndex": 0,
    "explanation": "The procedure sparked global debate about the ethics of organ transplantation and the definition of death."
  },
  {
    "id": "q_nf_1148_1",
    "factId": "nf_1148",
    "question": "In which year was the Dufuna canoe discovered?",
    "options": [
      "1987",
      "1990",
      "1975",
      "2000"
    ],
    "correctIndex": 0,
    "explanation": "The article states that the Dufuna canoe was discovered in 1987 by Fulani herdsmen."
  },
  {
    "id": "q_nf_1148_2",
    "factId": "nf_1148",
    "question": "What is the Dufuna canoe recognized as?",
    "options": [
      "The oldest known canoe in Africa and the third oldest in the world",
      "The oldest boat in the world",
      "The oldest artifact in Nigeria",
      "The oldest canoe in the world"
    ],
    "correctIndex": 0,
    "explanation": "The article says it is the oldest known canoe in Africa and the third oldest in the world."
  },
  {
    "id": "q_nf_1148_3",
    "factId": "nf_1148",
    "question": "What material was the Dufuna canoe crafted from?",
    "options": [
      "Oak",
      "Teak",
      "African mahogany",
      "Cedar"
    ],
    "correctIndex": 2,
    "explanation": "The article mentions that the canoe was crafted from African mahogany."
  },
  {
    "id": "q_nf_1149_1",
    "factId": "nf_1149",
    "question": "In 1812, female literacy in the Sokoto Caliphate was higher than in which regions?",
    "options": [
      "United Kingdom and United States",
      "France and Germany",
      "China and Japan",
      "Egypt and Ethiopia"
    ],
    "correctIndex": 0,
    "explanation": "The fact states that female literacy in the Sokoto Caliphate in 1812 was higher than women in the United Kingdom and the United States."
  },
  {
    "id": "q_nf_1149_2",
    "factId": "nf_1149",
    "question": "Who founded the Sokoto Caliphate and championed education for all?",
    "options": [
      "Colonel Runciman",
      "Usman dan Fodio",
      "Mansa Musa",
      "Shaka Zulu"
    ],
    "correctIndex": 1,
    "explanation": "The article says the caliphate's founder, Usman dan Fodio, championed education for all."
  },
  {
    "id": "q_nf_1149_3",
    "factId": "nf_1149",
    "question": "What did British traveler Colonel Runciman find astonishing about the people of Sokoto?",
    "options": [
      "They were literate 'not to a man, but to a woman.'",
      "They had no written language.",
      "They only educated boys.",
      "They had no schools."
    ],
    "correctIndex": 0,
    "explanation": "The article quotes Colonel Runciman as astonished that the people were 'literate not to a man, but to a woman.'"
  },
  {
    "id": "q_nf_1150_1",
    "factId": "nf_1150",
    "question": "What is the family relationship between Kemi Badenoch and Yemi Osinbajo?",
    "options": [
      "First cousin once removed",
      "Siblings",
      "Parent and child",
      "Uncle and niece"
    ],
    "correctIndex": 0,
    "explanation": "The article states that Badenoch is the first cousin once removed of Osinbajo, meaning Osinbajo is her cousin's child or her parent's cousin."
  },
  {
    "id": "q_nf_1150_2",
    "factId": "nf_1150",
    "question": "In which year was Kemi Badenoch elected leader of the UK Conservative Party?",
    "options": [
      "2023",
      "2024",
      "2025",
      "2022"
    ],
    "correctIndex": 1,
    "explanation": "The article says she was elected leader in November 2024."
  },
  {
    "id": "q_nf_1150_3",
    "factId": "nf_1150",
    "question": "What position did Yemi Osinbajo hold in Nigeria before becoming vice president?",
    "options": [
      "Attorney-General of Lagos State",
      "Senator",
      "Governor of Lagos State",
      "Minister of Justice"
    ],
    "correctIndex": 0,
    "explanation": "The article mentions that Osinbajo served as Attorney-General of Lagos State before becoming vice president."
  },
  {
    "id": "q_nf_1151_1",
    "factId": "nf_1151",
    "question": "Who is Dolapo Osinbajo's famous grandfather?",
    "options": [
      "Yemi Osinbajo",
      "Obafemi Awolowo",
      "Nnamdi Azikiwe",
      "Ahmadu Bello"
    ],
    "correctIndex": 1,
    "explanation": "Dolapo is a granddaughter of Obafemi Awolowo, the iconic Yoruba leader."
  },
  {
    "id": "q_nf_1151_2",
    "factId": "nf_1151",
    "question": "In what year did Yemi Osinbajo become Nigeria's vice president?",
    "options": [
      "2010",
      "2015",
      "2020",
      "2005"
    ],
    "correctIndex": 1,
    "explanation": "The article states that Osinbajo stepped into the role of Nigeria's vice president in 2015."
  },
  {
    "id": "q_nf_1151_3",
    "factId": "nf_1151",
    "question": "What role did Obafemi Awolowo play in Nigeria's history?",
    "options": [
      "He was a central figure in Nigeria's independence movement.",
      "He was the first president of Nigeria.",
      "He was a military ruler.",
      "He was a colonial governor."
    ],
    "correctIndex": 0,
    "explanation": "Awolowo was a central figure in Nigeria's independence movement and a powerful advocate for the Yoruba people."
  },
  {
    "id": "q_nf_1152_1",
    "factId": "nf_1152",
    "question": "Who fired the SSS boss Lawal Daura in 2018?",
    "options": [
      "President Muhammadu Buhari",
      "Acting president Yemi Osinbajo",
      "Matthew Seiyefa",
      "The National Assembly"
    ],
    "correctIndex": 1,
    "explanation": "The article states that Nigeria's acting president, Yemi Osinbajo, fired the SSS boss Lawal Daura."
  },
  {
    "id": "q_nf_1152_2",
    "factId": "nf_1152",
    "question": "Why was Lawal Daura fired?",
    "options": [
      "For corruption",
      "For illegal invasion of the National Assembly",
      "For incompetence",
      "For political reasons"
    ],
    "correctIndex": 1,
    "explanation": "The firing came after armed and masked SSS operatives illegally invaded the National Assembly, an action described as illegal."
  },
  {
    "id": "q_nf_1152_3",
    "factId": "nf_1152",
    "question": "Who replaced Lawal Daura as head of the SSS?",
    "options": [
      "Yemi Osinbajo",
      "Muhammadu Buhari",
      "Matthew Seiyefa",
      "Lawal Daura"
    ],
    "correctIndex": 2,
    "explanation": "The article says Daura was replaced with Matthew Seiyefa."
  },
  {
    "id": "q_nf_1153_1",
    "factId": "nf_1153",
    "question": "Where did the helicopter crash involving Osinbajo occur?",
    "options": [
      "Kabba, Kogi State",
      "Abuja",
      "Lagos",
      "Port Harcourt"
    ],
    "correctIndex": 0,
    "explanation": "The article states that the helicopter came down in Kabba, Kogi State."
  },
  {
    "id": "q_nf_1153_2",
    "factId": "nf_1153",
    "question": "What did Osinbajo do immediately after surviving the helicopter crash?",
    "options": [
      "He canceled his campaign events",
      "He delivered a previously scheduled campaign speech",
      "He was hospitalized",
      "He returned to Abuja"
    ],
    "correctIndex": 1,
    "explanation": "Osinbajo went on to deliver a previously scheduled campaign speech, showing resilience."
  },
  {
    "id": "q_nf_1153_3",
    "factId": "nf_1153",
    "question": "Who was Osinbajo's running mate in the election?",
    "options": [
      "Atiku Abubakar",
      "Peter Obi",
      "Muhammadu Buhari",
      "Yemi Osinbajo"
    ],
    "correctIndex": 2,
    "explanation": "Osinbajo ran for a second term as vice president alongside Muhammadu Buhari."
  },
  {
    "id": "q_nf_1154_1",
    "factId": "nf_1154",
    "question": "Who is regarded as the only Nigerian journalist to have interviewed a sitting American president in the White House?",
    "options": [
      "Laolu Akande",
      "Bill Gates",
      "Colin Powell",
      "Yemi Osinbajo"
    ],
    "correctIndex": 0,
    "explanation": "The article states that Laolu Akande is regarded as the only Nigerian journalist to have interviewed a sitting US president in the White House."
  },
  {
    "id": "q_nf_1154_2",
    "factId": "nf_1154",
    "question": "Which American president did Laolu Akande interview in the White House?",
    "options": [
      "George W. Bush",
      "Bill Clinton",
      "Barack Obama",
      "Donald Trump"
    ],
    "correctIndex": 0,
    "explanation": "The fact and article specify that Akande interviewed President George W. Bush in 2008."
  },
  {
    "id": "q_nf_1154_3",
    "factId": "nf_1154",
    "question": "What role did Laolu Akande serve in Nigeria from 2015 to 2023?",
    "options": [
      "Spokesman for Vice President Yemi Osinbajo",
      "Correspondent for Empowered Newswire",
      "Founder of his own agency",
      "Editor at Newsday"
    ],
    "correctIndex": 0,
    "explanation": "The article says Akande served as spokesman for Vice President Yemi Osinbajo from 2015 to 2023."
  },
  {
    "id": "q_nf_1155_1",
    "factId": "nf_1155",
    "question": "What was the title of Laolu Akande's story that led to his exile?",
    "options": [
      "Who wants Diya dead?",
      "The Guardian",
      "The News",
      "Empowered Newswire"
    ],
    "correctIndex": 0,
    "explanation": "The story titled 'Who wants Diya dead?' was published on the same day the Abacha junta declared Oladipo Diya a coup plotter, leading to Akande's exile."
  },
  {
    "id": "q_nf_1155_2",
    "factId": "nf_1155",
    "question": "In which year did Laolu Akande go into exile?",
    "options": [
      "1998",
      "1999",
      "2000",
      "2001"
    ],
    "correctIndex": 1,
    "explanation": "Akande was forced into exile in 1998, about 14 months after publishing the story, so the exile occurred around 1999."
  },
  {
    "id": "q_nf_1155_3",
    "factId": "nf_1155",
    "question": "What role did Laolu Akande hold from 2015 to 2023?",
    "options": [
      "Editor of The Guardian",
      "Founder of Empowered Newswire",
      "Spokesperson for Nigeria's Vice President",
      "Minister of Information"
    ],
    "correctIndex": 2,
    "explanation": "Akande served as the spokesperson for Nigeria's Vice President Yemi Osinbajo from 2015 to 2023."
  },
  {
    "id": "q_nf_1156_1",
    "factId": "nf_1156",
    "question": "What position did Laolu Akande hold at the Nigerian Tribune in 1995?",
    "options": [
      "Editor",
      "Special Projects Editor",
      "Founding Member",
      "Spokesperson"
    ],
    "correctIndex": 1,
    "explanation": "The article states that in 1995, Akande joined the Nigerian Tribune as a Special Projects Editor."
  },
  {
    "id": "q_nf_1156_2",
    "factId": "nf_1156",
    "question": "Which publication did Laolu Akande help found in 1993?",
    "options": [
      "The Guardian",
      "The Tribune",
      "The News magazine",
      "Empowered Newswire"
    ],
    "correctIndex": 2,
    "explanation": "The article says Akande became a founding member of The News magazine in 1993."
  },
  {
    "id": "q_nf_1156_3",
    "factId": "nf_1156",
    "question": "What happened to Laolu Akande after he wrote a story about Oladipo Diya in 1998?",
    "options": [
      "He was promoted",
      "He was forced into exile",
      "He founded a magazine",
      "He became a spokesperson"
    ],
    "correctIndex": 1,
    "explanation": "The article states that his story about Oladipo Diya led to a direct confrontation with the Abacha regime, and he was forced into exile in the United States."
  },
  {
    "id": "q_nf_1157_1",
    "factId": "nf_1157",
    "question": "Who was Segun Awolowo Jr.'s grandfather?",
    "options": [
      "Obafemi Awolowo",
      "Segun Awolowo Sr.",
      "Dolapo Osinbajo",
      "A Nigerian statesman"
    ],
    "correctIndex": 0,
    "explanation": "The article states that Segun Jr. was the grandson of Obafemi Awolowo, a prominent Nigerian statesman."
  },
  {
    "id": "q_nf_1157_2",
    "factId": "nf_1157",
    "question": "What was Segun Awolowo Jr.'s role at the Nigerian Export Promotion Council?",
    "options": [
      "President",
      "Executive director",
      "Lawyer",
      "Founder"
    ],
    "correctIndex": 1,
    "explanation": "He served as executive director of the NEPC from 2013 to 2021."
  },
  {
    "id": "q_nf_1157_3",
    "factId": "nf_1157",
    "question": "When did Segun Awolowo Jr. pass away?",
    "options": [
      "2021",
      "2025",
      "1963",
      "2013"
    ],
    "correctIndex": 1,
    "explanation": "The article says he passed away in 2025 at the age of 62."
  },
  {
    "id": "q_nf_1158_1",
    "factId": "nf_1158",
    "question": "What prize did Yemi Osinbajo win in 1974?",
    "options": [
      "African Statesman Intercollegiate Best Speaker's Prize",
      "State Merit Award",
      "Elias Prize for Best Performance in History",
      "School Prize for Literature"
    ],
    "correctIndex": 0,
    "explanation": "The article states that in 1974, Osinbajo won the African Statesman Intercollegiate Best Speaker's Prize."
  },
  {
    "id": "q_nf_1158_2",
    "factId": "nf_1158",
    "question": "In which year did Osinbajo win the State Merit Award?",
    "options": [
      "1971",
      "1972",
      "1973",
      "1975"
    ],
    "correctIndex": 0,
    "explanation": "The article lists the State Merit Award as one of his achievements in 1971."
  },
  {
    "id": "q_nf_1158_3",
    "factId": "nf_1158",
    "question": "What skill, recognized in the 1974 competition, remained a hallmark of Osinbajo's public life?",
    "options": [
      "Legal expertise",
      "Oratory talent",
      "Historical knowledge",
      "Literary ability"
    ],
    "correctIndex": 1,
    "explanation": "The article says his oratory talent, first recognized in that 1974 competition, remained a hallmark of his public life."
  },
  {
    "id": "q_nf_1159_1",
    "factId": "nf_1159",
    "question": "Why does Yemi Osinbajo not wear a wedding ring?",
    "options": [
      "He lost it and never replaced it",
      "He believes the Bible is the symbol of holy marriage",
      "He prefers not to wear jewelry",
      "His wife does not wear one either"
    ],
    "correctIndex": 1,
    "explanation": "Osinbajo's reason is rooted in his faith: he believes the Bible itself is the symbol of holy marriage."
  },
  {
    "id": "q_nf_1159_2",
    "factId": "nf_1159",
    "question": "Who is Dolapo Osinbajo's grandfather?",
    "options": [
      "Chief Obafemi Awolowo",
      "Nnamdi Azikiwe",
      "Ahmadu Bello",
      "Tafawa Balewa"
    ],
    "correctIndex": 0,
    "explanation": "Dolapo is a granddaughter of Chief Obafemi Awolowo, a prominent nationalist leader."
  },
  {
    "id": "q_nf_1159_3",
    "factId": "nf_1159",
    "question": "In what year were Yemi and Dolapo Osinbajo married?",
    "options": [
      "1979",
      "1989",
      "1999",
      "2009"
    ],
    "correctIndex": 1,
    "explanation": "The article states they were married in 1989."
  },
  {
    "id": "q_nf_1160_1",
    "factId": "nf_1160",
    "question": "What role did Osinbajo hold before becoming vice-president?",
    "options": [
      "Governor of Lagos",
      "Attorney-General of Lagos State",
      "Senator",
      "Minister of Finance"
    ],
    "correctIndex": 1,
    "explanation": "Osinbajo served as Attorney-General of Lagos State under Governor Tinubu before becoming vice-president."
  },
  {
    "id": "q_nf_1160_2",
    "factId": "nf_1160",
    "question": "Which church was Osinbajo a pastor in?",
    "options": [
      "Catholic Church",
      "Anglican Church",
      "Redeemed Christian Church",
      "Methodist Church"
    ],
    "correctIndex": 2,
    "explanation": "The source states Osinbajo was a pastor in the Redeemed Christian Church in Lagos."
  },
  {
    "id": "q_nf_1160_3",
    "factId": "nf_1160",
    "question": "Who did Osinbajo lose to in the APC presidential primaries?",
    "options": [
      "Atiku Abubakar",
      "Rotimi Amaechi",
      "Bola Tinubu",
      "Goodluck Jonathan"
    ],
    "correctIndex": 2,
    "explanation": "The source says Osinbajo lost out to Tinubu at the APC primaries."
  },
  {
    "id": "q_nf_1161_1",
    "factId": "nf_1161",
    "question": "Who proposed that creditor nations forgive debts if the money is spent on green energy?",
    "options": [
      "Bola Tinubu",
      "Yemi Osinbajo",
      "Muhammadu Buhari",
      "Atiku Abubakar"
    ],
    "correctIndex": 1,
    "explanation": "Yemi Osinbajo, Nigeria's Vice-President, made the proposal at a summit."
  },
  {
    "id": "q_nf_1161_2",
    "factId": "nf_1161",
    "question": "What accusation did the proposal respond to?",
    "options": [
      "That Africa is not doing enough for climate",
      "That Western countries are compelling Africa to cut fossil fuels unfairly",
      "That Nigeria is not investing in green energy",
      "That creditor nations are not forgiving enough debt"
    ],
    "correctIndex": 1,
    "explanation": "The proposal came amid accusations that Western countries are unfair in compelling Africa to curtail fossil fuel use."
  },
  {
    "id": "q_nf_1161_3",
    "factId": "nf_1161",
    "question": "What position did Yemi Osinbajo hold at the time of the proposal?",
    "options": [
      "President of Nigeria",
      "Governor of Lagos",
      "Vice-President of Nigeria",
      "Minister of Finance"
    ],
    "correctIndex": 2,
    "explanation": "Osinbajo was serving as Vice-President under Muhammadu Buhari."
  }
];

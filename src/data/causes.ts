/**
 * Every way to give. One entry here generates a card on the GoSeva hub
 * and a full donation page at /goseva/<slug>/ — replacing the thirteen
 * hand-maintained HTML files the old site carried.
 *
 * `amount: null` means the donor names their own amount.
 * `legacy` keeps the old URL alive with a redirect so shared links,
 * printed QR codes and WhatsApp forwards do not break.
 */

export type Cause = {
  slug: string;
  title: string;
  titleSa?: string;
  tagline: string;
  amount: number | null;
  suggested?: number[];
  blurb: string;
  includes: string[];
  image: string | null;
  group: 'occasion' | 'adopt' | 'feed' | 'project';
  order: number;
  legacy: string[];
};

export const causes: Cause[] = [
  // ---------- mark an occasion ----------
  {
    slug: 'janma-dina',
    title: 'Janma Dina',
    titleSa: 'जन्म दिन',
    tagline: 'Go Pooja on your birthday',
    amount: null,
    suggested: [1250, 2500, 5000],
    blurb:
      'Mark the day you were born by feeding the herd. A Go Pooja is performed in your name and a sankalpa taken on your behalf.',
    includes: [
      'Go Pooja performed in your name',
      'Sankalpa taken on the day you choose',
      'Photographs of the pooja sent to you',
    ],
    image: '/images/causes/janma-dina.webp',
    group: 'occasion',
    order: 1,
    legacy: ['/blog/janmadina'],
  },
  {
    slug: 'vivaha-dina',
    title: 'Vivaha Dina',
    titleSa: 'विवाह दिन',
    tagline: 'Go Pooja on your anniversary',
    amount: null,
    suggested: [1250, 2500, 5000],
    blurb:
      'Celebrate an anniversary in a way that outlasts the day. The pooja is performed in both names.',
    includes: [
      'Go Pooja performed in both names',
      'Sankalpa taken on your anniversary',
      'Photographs of the pooja sent to you',
    ],
    image: '/images/causes/vivaha-dina.webp',
    group: 'occasion',
    order: 2,
    legacy: ['/blog/vivahadina'],
  },
  {
    slug: 'punya-tithi',
    title: 'Punya Tithi',
    titleSa: 'पुण्य तिथि',
    tagline: 'In memory of your ancestors',
    amount: null,
    suggested: [1250, 2500, 5000],
    blurb:
      'Honour the memory of those who came before you. Go Pooja and Go Grasa are offered on the tithi you name.',
    includes: [
      'Go Pooja offered in their name',
      'Go Grasa fed to the herd on the tithi',
      'Photographs sent to you afterwards',
    ],
    image: '/images/causes/punya-tithi.webp',
    group: 'occasion',
    order: 3,
    legacy: ['/blog/punyatithi'],
  },
  {
    slug: 'go-pooja',
    title: 'Go Pooja',
    titleSa: 'गो पूजा',
    tagline: 'Sankalpa poorvaka',
    amount: 1250,
    blurb:
      'A formal Go Pooja performed with sankalpa on a day of your choosing, for any reason you hold important.',
    includes: [
      'Go Pooja with sankalpa',
      'Performed on the date you choose',
      'Photographs sent to you',
    ],
    image: '/images/causes/go-pooja.webp',
    group: 'occasion',
    order: 4,
    legacy: ['/blog/goPooja'],
  },

  // ---------- adopt ----------
  {
    slug: 'adopt-a-cow',
    title: 'Adopt a Cow',
    titleSa: 'गो दत्तक',
    tagline: 'One cow, one year',
    amount: 11000,
    blurb:
      'Carry the full cost of one cow for a year — her feed, her shelter and her medical care. You are told which cow is yours.',
    includes: [
      'One cow cared for in your name for a year',
      'Certificate of adoption',
      'Eligible for 80G exemption',
    ],
    image: '/images/causes/adopt-a-cow.webp',
    group: 'adopt',
    order: 5,
    legacy: ['/blog/adoptacow'],
  },
  {
    slug: 'adopt-a-nandi',
    title: 'Adopt a Nandi',
    titleSa: 'नन्दि दत्तक',
    tagline: 'One bull, one year',
    amount: 6000,
    blurb:
      'Bulls cost less to keep than cows and are far harder to find homes for. Adopting one for a year keeps him off the road.',
    includes: [
      'One nandi cared for in your name for a year',
      'Certificate of adoption',
      'Eligible for 80G exemption',
    ],
    image: '/images/causes/adopt-a-nandi.webp',
    group: 'adopt',
    order: 6,
    legacy: ['/blog/adoptANandi'],
  },
  {
    slug: 'adopt-a-govatsa',
    title: 'Adopt a Govatsa',
    titleSa: 'गो वत्स दत्तक',
    tagline: 'One calf, one year',
    amount: 3000,
    blurb:
      'A calf eats less and needs more watching. Three thousand rupees covers a year of both.',
    includes: [
      'One calf cared for in your name for a year',
      'Certificate of adoption',
      'Eligible for 80G exemption',
    ],
    image: '/images/causes/adopt-a-govatsa.webp',
    group: 'adopt',
    order: 7,
    legacy: ['/blog/adoptGovatsa'],
  },

  // ---------- feed ----------
  {
    slug: 'go-kanike',
    title: 'Go Kanike',
    titleSa: 'गो कानिके',
    tagline: 'Any amount, any day',
    amount: null,
    suggested: [500, 1100, 2100],
    blurb:
      'The simplest way to give. Whatever you send goes straight into the day’s feed.',
    includes: [
      'Goes directly to the herd’s feed',
      'No minimum',
      'Eligible for 80G exemption',
    ],
    image: '/images/causes/go-kanike.webp',
    group: 'feed',
    order: 8,
    legacy: ['/blog/gokanike'],
  },
  {
    slug: 'siddha-grasa',
    title: 'Siddha Grasa',
    titleSa: 'सिद्ध ग्रास',
    tagline: 'A prepared meal for the herd',
    amount: 2000,
    blurb:
      'A prepared feed offered to the whole herd in your name on a day you choose.',
    includes: [
      'One prepared meal for the full herd',
      'Certificate of support',
      'Eligible for 80G exemption',
    ],
    image: '/images/causes/siddha-grasa.webp',
    group: 'feed',
    order: 9,
    legacy: ['/blog/SiddhaGrasa'],
  },
  {
    slug: 'one-day-expense',
    title: 'One Day of the Goshala',
    tagline: 'Everything, for a day',
    amount: 4500,
    blurb:
      'The entire running cost of the goshala for one full day — feed, labour, water and medicine for every animal here.',
    includes: [
      'One full day of operations',
      'Certificate of support',
      'Eligible for 80G exemption',
    ],
    image: '/images/causes/one-day-expense.webp',
    group: 'feed',
    order: 10,
    legacy: ['/blog/oneDayExpense'],
  },
  {
    slug: 'jeep-of-grass',
    title: 'A Jeep of Grass',
    tagline: 'Fodder run',
    amount: 6500,
    blurb:
      'One jeep-load of green fodder brought in from the surrounding fields.',
    includes: [
      'One jeep-load of green fodder',
      'Certificate of support',
      'Eligible for 80G exemption',
    ],
    image: null,
    group: 'feed',
    order: 11,
    legacy: ['/blog/oneJeepGrass'],
  },
  {
    slug: 'tractor-of-grass',
    title: 'A Tractor of Grass',
    tagline: 'Nourish the whole herd',
    amount: 13000,
    blurb:
      'A full tractor-load of fodder — roughly a fortnight of green feed for the herd.',
    includes: [
      'One tractor-load of green fodder',
      'Certificate of support',
      'Eligible for 80G exemption',
    ],
    image: null,
    group: 'feed',
    order: 12,
    legacy: ['/blog/oneTractorGrass'],
  },

  // ---------- project ----------
  {
    slug: 'swarna-nandini',
    title: 'Shri Swarna Nandini Project',
    tagline: 'New shelter construction',
    amount: null,
    suggested: [11000, 25000, 51000],
    blurb:
      'The new goshala buildings — shelter, feed store and medical room — being raised at Karadolli. Contribute any amount toward the construction.',
    includes: [
      'Goes directly to construction',
      'Named on the project record',
      'Eligible for 80G exemption',
    ],
    image: '/images/causes/swarna-nandini.webp',
    group: 'project',
    order: 13,
    legacy: ['/blog/newconstruction-payment-page', '/blog/newconstruction'],
  },
];

export const causeGroups = [
  { id: 'occasion', title: 'Mark an occasion', blurb: 'Turn a date that matters into a day the herd eats well.' },
  { id: 'adopt',    title: 'Adopt an animal',  blurb: 'Carry one animal’s full keep for a year.' },
  { id: 'feed',     title: 'Feed the herd',    blurb: 'Fodder, prepared meals, and the daily running of the goshala.' },
  { id: 'project',  title: 'Build the goshala', blurb: 'The new shelter rising at Karadolli.' },
] as const;

export const byGroup = (g: string) =>
  causes.filter((c) => c.group === g).sort((a, b) => a.order - b.order);

/**
 * Every fact about the goshala that appears in more than one place.
 * Nothing here should be duplicated into a template.
 */

export const site = {
  name: 'Shri Govardhan [R] Goshala',
  nameKn: 'ಶ್ರೀ ಗೋವರ್ಧನ ಗೋಶಾಲೆ',
  lineage: 'Shreemad Jagadguru Shankaracharya Shree Sonda Swarnavalli Mahasamsthanam',
  registration: 'BK4/75',
  url: 'https://shrigovardhan.org',

  address: {
    line: 'Karadolli, Yellapur',
    district: 'Uttara Kannada',
    state: 'Karnataka',
    lat: 14.9634,
    lng: 74.8411,
  },

  contact: {
    email: 'contact@shrigovardhan.org',
    // Left null deliberately: the old site shipped "+91-XXXXXXXXXX" to
    // production. Templates hide the field entirely while this is null.
    phone: null as string | null,
    whatsapp: null as string | null,
  },

  /** The single source of truth for where money goes. */
  upi: {
    vpa: 'govardhanylp@sbi',
    payeeName: 'Shri Govardhan Goshala',
  },

  analytics: {
    ga4: 'G-2ZJXCX9BQF',
  },
} as const;

/**
 * Identification is required on every donation: the trust reports each one
 * in Form 10BD, which needs an identifier against the donor.
 *
 * PAN is listed first deliberately. Both are valid Form 10BD identifiers,
 * but the donor's 80G claim is matched through PAN — an Aadhaar-only record
 * is reported correctly yet cannot be claimed in the donor's return. The
 * hint text on the Aadhaar option says so.
 */
export const taxReceipt = {
  required: true,
  idOptions: [
    {
      code: 'PAN',
      label: 'PAN',
      hint: 'Required to claim the deduction in your return.',
      pattern: '^[A-Z]{5}[0-9]{4}[A-Z]$',
      placeholder: 'ABCDE1234F',
    },
    {
      code: 'AADHAAR',
      label: 'Aadhaar',
      hint: 'We can report your donation, but claiming 80G in your return needs a PAN.',
      pattern: '^[2-9][0-9]{11}$',
      placeholder: '12 digits',
    },
  ],
} as const;

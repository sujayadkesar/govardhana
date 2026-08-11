/**
 * Committee, carried over from the old /about page.
 *
 * NOTE: the phone numbers below were already published on the previous site,
 * so keeping them is not a new disclosure — but they are personal mobile
 * numbers of named individuals. Worth deciding deliberately whether they
 * belong on a public page, particularly with DPDP obligations arriving.
 * Set `showPhones` to false to hide every number without deleting the data.
 */

export const showPhones = true;

export const president = {
  role: 'Member and Honorary President',
  name: 'Sri Jagadguru Shankaracharya Sri Srimad Gangadharendra Saraswati Mahaswamiji',
  seat: 'Sri Sonda Swarnavalli Mahasansthan, Sirsi',
};

export type Member = { name: string; place?: string; phone?: string; note?: string };

export const administrative: Member[] = [
  { name: 'Sri Ramakrishna Bhat',     place: 'Hunashetti Kopp', phone: '8762517674' },
  { name: 'Sri V. N. Geragadde' },
  { name: 'Sri Nagesh Hegde',         place: 'Panathageri' },
  { name: 'Sri Ganapati Bhat',        place: 'Kolibena',        phone: '8762759240' },
  { name: 'Sri Umashankar Bhat',      place: 'Jaddigadde',      phone: '9743121491' },
  { name: 'Sri M. N. Bhat',           place: 'Kavale',          phone: '9480018604' },
  { name: 'Sri Mahabaleshwar Bhat',   place: 'Shigepala',       phone: '9449629726' },
  { name: 'Sri Vishweshwar Bhat',     place: 'Artibail',        phone: '9353053421' },
  { name: 'Sri Balachandra N Jaddipal', place: 'Kumbritota',    phone: '9449629788' },
  { name: 'Sri Mahabaleshwar G Hegde', place: 'Gaveguli',       phone: '8073682377' },
  { name: 'Sri Ramakrishna Bhat',     place: 'Kaudikere',       phone: '9480508509' },
  { name: 'Sri Narayan Karumane',     place: 'Kondemane',       phone: '9448302539' },
  { name: 'Sri Ganapati Adikesar',                              phone: '9482185679' },
  { name: 'Sri Ramakrishna Bhat',     place: 'Gudepala',        phone: '8762200702' },
  { name: 'Sri Manjunath Bhat',       place: 'Gundkal',         phone: '7411117981' },
  { name: 'Sri Vivek Ganapumane',                               phone: '9481729858' },
];

export const officers: Member[] = [
  { name: 'Dr. Govinda S. Bhat',        place: 'Sirsi', note: 'Medical Advisor' },
  { name: 'Sri L. P. Bhat',             place: 'Gundkal' },
  { name: 'Sri Narayan Hegde',          place: 'Beegar' },
  { name: 'Sri G. N. G.',               place: 'Yellapur' },
  { name: 'Sri Kumarasubrahmanya Bhat', place: 'Handramane' },
];

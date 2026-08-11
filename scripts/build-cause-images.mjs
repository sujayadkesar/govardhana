/**
 * Produce one distinct, correctly-named image per cause from the goshala's
 * own photographs. Run once; re-run if the source photos change.
 *
 *   node scripts/build-cause-images.mjs
 */
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';

const SRC = 'public/images';
const OUT = 'public/images/causes';

/** cause slug -> source photo. Every value is distinct. */
const MAP = {
  'janma-dina':      'ed00d592-f1fc-48ac-bf32-db5a498c5309.jpg', // pooja, decorated cow
  'vivaha-dina':     'cb3a3818-98c6-4569-8988-7d67635e161b.jpg', // blessing the pair
  'punya-tithi':     '3cow.jpg',                                  // three cows, bells
  'go-pooja':        'gopooja.jpg',                               // feeding by hand
  'adopt-a-cow':     '8193b777-9801-4213-86d8-f5b15879e7fe.jpg',  // cow with her calf
  'adopt-a-nandi':   'derek-story-KVghA6Wv7S8-unsplash.jpg',      // bull, close
  'adopt-a-govatsa': 'punganuru.jpg',                             // calf grazing
  'go-kanike':       'blake-lisk-7KBUuFzT9Dk-unsplash.jpg',
  'siddha-grasa':    'vikas-makwana-UETquu-C_98-unsplash.jpg',    // calf, close
  'one-day-expense': 'goshala.jpg',                               // the whole herd
  'swarna-nandini':  'construction.jpeg',
};

/** Non-cause images used elsewhere on the site. */
const OTHER = {
  'why-abandoned': 'homeless.jpg',   // about page: why the goshala exists
  'lineage':       'guru1.jpeg',     // about page: the Swamijis
  'hero':          'goshala.jpg',    // homepage hero — the real herd
  'herd-wide':     '3cow.jpg',
};

await mkdir(OUT, { recursive: true });

const kb = (n) => `${Math.round(n / 1024)} KB`;

async function make(src, dest, width, quality = 78) {
  const buf = await sharp(`${SRC}/${src}`)
    .rotate()
    .resize(width, null, { withoutEnlargement: true })
    .webp({ quality })
    .toBuffer();
  await sharp(buf).toFile(dest);
  return buf.length;
}

let total = 0;
for (const [slug, src] of Object.entries(MAP)) {
  const n = await make(src, `${OUT}/${slug}.webp`, 900, 76);
  total += n;
  console.log(`  causes/${slug}.webp  ← ${src}  ${kb(n)}`);
}
for (const [name, src] of Object.entries(OTHER)) {
  const n = await make(src, `${SRC}/${name}.webp`, 1800, 78);
  total += n;
  console.log(`  ${name}.webp  ← ${src}  ${kb(n)}`);
}
console.log(`\n${Object.keys(MAP).length} cause images + ${Object.keys(OTHER).length} others — ${kb(total)} total`);

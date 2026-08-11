/**
 * Point each cause at its own image. Two fodder causes get `image: null`,
 * which renders a typographic card instead of a borrowed photograph.
 */
import { readFileSync, writeFileSync } from 'node:fs';

const p = 'src/data/causes.ts';
let s = readFileSync(p, 'utf8');

const HAS_PHOTO = new Set([
  'janma-dina', 'vivaha-dina', 'punya-tithi', 'go-pooja',
  'adopt-a-cow', 'adopt-a-nandi', 'adopt-a-govatsa',
  'go-kanike', 'siddha-grasa', 'one-day-expense', 'swarna-nandini',
]);

// Walk each cause block and rewrite its image line based on its own slug.
s = s.replace(
  /slug: '([a-z-]+)',([\s\S]*?)image: '[^']*',/g,
  (_m, slug, middle) =>
    `slug: '${slug}',${middle}image: ${
      HAS_PHOTO.has(slug) ? `'/images/causes/${slug}.webp'` : 'null'
    },`
);

// Widen the type so a cause may legitimately have no photograph.
s = s.replace('image: string;', 'image: string | null;');

writeFileSync(p, s, 'utf8');

const pairs = [...s.matchAll(/slug: '([a-z-]+)',[\s\S]*?image: ([^,]+),/g)];
for (const [, slug, img] of pairs) console.log(`${slug.padEnd(18)} ${img}`);

const imgs = pairs.map(([, , i]) => i).filter((i) => i !== 'null');
console.log(`\n${imgs.length} photos, ${new Set(imgs).size} distinct — ${
  imgs.length === new Set(imgs).size ? 'no duplicates' : 'DUPLICATES PRESENT'
}`);

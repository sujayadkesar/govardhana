/**
 * One-off image optimisation pass.
 *
 * The repo carried 72 MB of media: a 21 MB video on the gallery page, a
 * 4.6 MB photograph on the homepage, and a 1.7 MB logo rendered at 40 px.
 * On an Indian mobile connection that is several seconds before anything
 * useful appears.
 *
 *   node scripts/optimise-images.mjs          # report only
 *   node scripts/optimise-images.mjs --write  # actually rewrite
 */

import sharp from 'sharp';
import { readdir, stat, mkdir } from 'node:fs/promises';
import { join, extname, basename } from 'node:path';

const WRITE = process.argv.includes('--write');
const SRC = 'public/images';

/** Longest edge per role. Anything larger is downscaled. */
const TARGETS = [
  { match: /^logo\.png$/i,         sizes: [96, 192, 384], prefix: 'logo' },
  { match: /^causes[/\\]/i,        sizes: [800],          quality: 74 },
  { match: /unsplash|homeless|goshala|punganuru|gopooja|3cow/i, sizes: [1600], quality: 76 },
];

const kb = (n) => `${Math.round(n / 1024)} KB`;

async function walk(dir, base = '') {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const rel = join(base, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(join(dir, entry.name), rel)));
    else out.push(rel);
  }
  return out;
}

const savings = { before: 0, after: 0 };

async function processOne(rel) {
  const abs = join(SRC, rel);
  const ext = extname(rel).toLowerCase();
  if (!['.jpg', '.jpeg', '.png'].includes(ext)) return;

  const { size } = await stat(abs);
  const rule = TARGETS.find((t) => t.match.test(rel));
  if (!rule) return;

  const img = sharp(abs);
  const meta = await img.metadata();

  // Logo: emit fixed-size square variants instead of rewriting in place.
  if (rule.prefix) {
    savings.before += size;
    for (const s of rule.sizes) {
      const out = join(SRC, `${rule.prefix}-${s}.webp`);
      const buf = await sharp(abs)
        .resize(s, s, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .webp({ quality: 88 })
        .toBuffer();
      savings.after += buf.length;
      console.log(`  ${rel} → ${basename(out)}  ${kb(size)} → ${kb(buf.length)}`);
      if (WRITE) await sharp(buf).toFile(out);
    }
    return;
  }

  const target = rule.sizes[0];
  if (meta.width <= target && size < 250_000) return;

  const outWebp = abs.replace(/\.(jpe?g|png)$/i, '.webp');
  const buf = await sharp(abs)
    .resize(target, null, { withoutEnlargement: true })
    .webp({ quality: rule.quality ?? 76 })
    .toBuffer();

  savings.before += size;
  savings.after += buf.length;
  const pct = Math.round((1 - buf.length / size) * 100);
  console.log(`  ${rel}  ${kb(size)} → ${kb(buf.length)}  (−${pct}%)`);
  if (WRITE) await sharp(buf).toFile(outWebp);
}

const files = await walk(SRC);
console.log(WRITE ? 'Writing optimised images…\n' : 'Dry run — pass --write to apply\n');
for (const f of files) await processOne(f);

console.log(
  `\nTotal: ${kb(savings.before)} → ${kb(savings.after)} ` +
  `(−${Math.round((1 - savings.after / savings.before) * 100)}%)`
);

/**
 * The palette moved from indigo to warm; three token names went with it.
 * --rule-soft and --ink-soft still exist and are left alone.
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const RENAMES = [
  [/var\(--turmeric-lit\)/g, 'var(--marigold)'],
  [/var\(--turmeric\)/g,     'var(--saffron)'],
  [/var\(--text-onDark\)/g,  '#FFF6E8'],
];

function walk(dir) {
  const out = [];
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else if (/\.(astro|css)$/.test(e)) out.push(p);
  }
  return out;
}

let touched = 0;
for (const f of walk('src')) {
  const before = readFileSync(f, 'utf8');
  let after = before;
  for (const [re, to] of RENAMES) after = after.replace(re, to);
  if (after !== before) {
    writeFileSync(f, after, 'utf8');
    console.log(`  updated ${f}`);
    touched++;
  }
}
console.log(`\n${touched} file(s) updated`);

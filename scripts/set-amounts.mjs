/** Uniform suggested amounts across every name-your-own-amount cause. */
import { readFileSync, writeFileSync } from 'node:fs';

const p = 'src/data/causes.ts';
let s = readFileSync(p, 'utf8');

s = s.replace(/suggested: \[[^\]]*\]/g, 'suggested: [1001, 2500, 5001]');

writeFileSync(p, s, 'utf8');

for (const m of s.matchAll(/slug: '([a-z-]+)',[\s\S]*?amount: ([^,]+),(?:[\s\S]*?suggested: (\[[^\]]*\]))?/g)) {
  console.log(`${m[1].padEnd(18)} amount=${String(m[2]).padEnd(8)} ${m[3] ?? ''}`);
}

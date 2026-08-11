import { readFileSync, writeFileSync } from 'node:fs';

const p = 'src/data/causes.ts';
let s = readFileSync(p, 'utf8');
s = s.replace(/\/images\/causes\/([a-z]+)\.jpg/g, '/images/causes/$1.webp');
writeFileSync(p, s, 'utf8');

console.log([...s.matchAll(/image: '([^']+)'/g)].map((m) => m[1]).join('\n'));

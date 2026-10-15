import { readFile, access } from 'node:fs/promises';

const html = await readFile('index.html', 'utf8');
const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]));
const anchors = [...html.matchAll(/href="#([^"]+)"/g)].map((match) => match[1]);
const missingAnchors = [...new Set(anchors.filter((anchor) => !ids.has(anchor)))];

for (const file of ['styles.css', 'script.js', 'favicon.svg', 'robots.txt']) {
  await access(file);
}

const required = [
  ['lang="ja"', 'Japanese language declaration'],
  ['name="description"', 'meta description'],
  ['name="viewport"', 'responsive viewport'],
  ['制作サンプル', 'sample disclosure'],
  ['参考料金', 'draft pricing disclosure'],
];
const missingRequired = required.filter(([needle]) => !html.includes(needle)).map(([, label]) => label);

if (missingAnchors.length || missingRequired.length) {
  if (missingAnchors.length) console.error(`Missing anchor targets: ${missingAnchors.join(', ')}`);
  if (missingRequired.length) console.error(`Missing required content: ${missingRequired.join(', ')}`);
  process.exit(1);
}

console.log(`Site check passed: ${ids.size} ids, ${anchors.length} internal links, all required disclosures present.`);

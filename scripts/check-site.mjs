import { readFile, access } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';

const pages = ['index.html', 'samples/cafe/index.html', 'samples/salon/index.html', 'samples/bakery/index.html'];
let internalLinks = 0;
for (const page of pages) {
  const html = await readFile(page, 'utf8');
  const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]));
  for (const [, href] of html.matchAll(/href="([^"]+)"/g)) {
    if (href.startsWith('#')) {
      internalLinks += 1;
      if (!ids.has(href.slice(1))) throw new Error(`${page}: missing anchor target ${href}`);
    } else if (!/^(https?:|mailto:|tel:)/.test(href)) {
      const [path] = href.split('#');
      const target = resolve(dirname(page), path || '.');
      try { await access(target); }
      catch { throw new Error(`${page}: missing linked file ${href}`); }
    }
  }
  for (const [, src] of html.matchAll(/src="([^"]+)"/g)) {
    if (!/^https?:/.test(src)) {
      try { await access(resolve(dirname(page), src)); }
      catch { throw new Error(`${page}: missing asset ${src}`); }
    }
  }
}
const main = await readFile('index.html', 'utf8');
for (const [needle, label] of [['lang="ja"','Japanese declaration'],['name="description"','description'],['架空店舗','sample disclosure'],['参考料金','pricing disclosure'],['おみせのWeb係','service brand']]) {
  if (!main.includes(needle)) throw new Error(`index.html: missing ${label}`);
}
console.log(`Site check passed: ${pages.length} pages, ${internalLinks} anchor links, local files and disclosures verified.`);

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
  for (const image of html.matchAll(/<img\b[^>]*>/g)) {
    if (!/\balt="[^"]+"/.test(image[0])) throw new Error(`${page}: image is missing descriptive alt text`);
  }
}
const samplePages = pages.slice(1);
for (const page of samplePages) {
  const html = await readFile(page, 'utf8');
  if (!html.includes('sample-interactions.js')) throw new Error(`${page}: shared interactions script is missing`);
  if (!html.includes('sample-mobile-nav')) throw new Error(`${page}: mobile section navigation is missing`);
  if (!html.includes('data-lightbox')) throw new Error(`${page}: tappable photo gallery is missing`);
}
const salon = await readFile('samples/salon/index.html', 'utf8');
for (const needle of ['data-reservation-open', 'data-reservation-dialog', 'data-reservation-complete']) {
  if (!salon.includes(needle)) throw new Error(`samples/salon/index.html: reservation demo is incomplete (${needle})`);
}

const main = await readFile('index.html', 'utf8');
for (const [needle, label] of [['lang="ja"','Japanese declaration'],['name="description"','description'],['架空','sample disclosure'],['参考料金','pricing disclosure'],['おみせのWeb係','service brand']]) {
  if (!main.includes(needle)) throw new Error(`index.html: missing ${label}`);
}
console.log(`Site check passed: ${pages.length} pages, ${internalLinks} anchor links, local files and disclosures verified.`);

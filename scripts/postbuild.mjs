// Build utáni lépések (GitHub Pages-hez):
// 1. A kézzel írt gyökér-relatív linkek ("/rolam", "/assets/...") elé beírja a
//    BASE_PATH előtagot, az oldal-linkekhez záró perjelet tesz.
// 2. A régi Wix URL-ekhez átirányító oldalakat generál (a Pages nem tud 301-et).
// 3. CUSTOM_DOMAIN esetén CNAME fájlt ír.
import fs from 'node:fs';
import path from 'node:path';

const DIST = 'dist';
const base = (process.env.BASE_PATH || '/').replace(/\/?$/, '/');
const prefix = base === '/' ? '' : base.slice(0, -1);

const walk = (d) =>
  fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(d, e.name);
    return e.isDirectory() ? walk(p) : [p];
  });

const fixUrl = (url, isLink) => {
  if (!url.startsWith('/') || url.startsWith('//')) return url;
  if (prefix && (url === prefix || url.startsWith(prefix + '/'))) return url;
  let [p, hash = ''] = url.split('#');
  const [pathname, query] = p.split('?');
  let out = pathname;
  // Oldal-link (nem fájl): záró perjel a GitHub Pages átirányítás elkerülésére
  if (isLink && out && !out.endsWith('/') && !/\.[a-z0-9]+$/i.test(out)) out += '/';
  out = prefix + out;
  return out + (query ? '?' + query : '') + (hash ? '#' + hash : '');
};

let changed = 0;
for (const file of walk(DIST).filter((f) => f.endsWith('.html'))) {
  const src = fs.readFileSync(file, 'utf8');
  const out = src.replace(
    /\b(href|src|poster|data-src|action)="([^"]*)"/g,
    (m, attr, url) => `${attr}="${fixUrl(url, attr === 'href')}"`,
  );
  if (out !== src) {
    fs.writeFileSync(file, out);
    changed++;
  }
}

// Régi Wix URL-ek -> új oldalak
const redirects = {
  'rólam': '/rolam/',
  blank: '/sikersztorik/',
  'terms-and-conditions': '/adatkezelesi-nyilatkozat/',
  'privacy-policy': '/impresszum/',
  programs: '/',
  'blog/categories/mentalis-pillerek': '/blog/kategoria/mentalis-pillerek/',
  'post/hogyan-lett-a-mentaliserobol-mindforge': '/blog/hogyan-lett-a-mentaliserobol-mindforge/',
  'post/mentális-pillérek-1-rész-a-fókusz-ereje': '/blog/mentalis-pillerek-1-resz-a-fokusz-ereje/',
  'post/mentális-pillérek-2-a-belső-hang': '/blog/mentalis-pillerek-2-a-belso-hang/',
  'post/mentális-pillérek-3-nincs-fejlődés-hiba-nélkül': '/blog/mentalis-pillerek-3-nincs-fejlodes-hiba-nelkul/',
  'post/mentális-pillérek-4-szemléletváltás': '/blog/mentalis-pillerek-4-szemleletvaltas/',
  'post/mentális-pillérek-5-a-rutin-biztonsága': '/blog/mentalis-pillerek-5-a-rutin-biztonsaga/',
};
for (const [from, to] of Object.entries(redirects)) {
  const target = prefix + to;
  const canonical = 'https://www.mindforge.hu' + to;
  const dir = path.join(DIST, from);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(
    path.join(dir, 'index.html'),
    `<!doctype html><html lang="hu"><head><meta charset="utf-8"><title>Átirányítás…</title>` +
      `<link rel="canonical" href="${canonical}"><meta name="robots" content="noindex">` +
      `<meta http-equiv="refresh" content="0; url=${target}"></head>` +
      `<body><script>location.replace(${JSON.stringify(target)}+location.hash)</script>` +
      `<a href="${target}">Tovább</a></body></html>`,
  );
}

// Klasszikus, egyetlen /sitemap.xml (az @astrojs/sitemap index + sitemap-0 helyett)
fs.renameSync(path.join(DIST, 'sitemap-0.xml'), path.join(DIST, 'sitemap.xml'));
fs.rmSync(path.join(DIST, 'sitemap-index.xml'));

if (process.env.CUSTOM_DOMAIN) fs.writeFileSync(path.join(DIST, 'CNAME'), process.env.CUSTOM_DOMAIN + '\n');
// A Pages ne futtassa a Jekyllt (különben a _astro mappát kihagyná)
fs.writeFileSync(path.join(DIST, '.nojekyll'), '');

console.log(`postbuild: ${changed} HTML frissítve, ${Object.keys(redirects).length} átirányítás, base="${base}"`);

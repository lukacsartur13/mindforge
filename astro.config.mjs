import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import fs from 'node:fs';
import path from 'node:path';

// Blogposztok dátuma a sitemap <lastmod> mezőjéhez
const postDates = Object.fromEntries(
  fs
    .readdirSync('./src/content/blog')
    .filter((f) => f.endsWith('.md'))
    .map((f) => {
      const src = fs.readFileSync(path.join('./src/content/blog', f), 'utf8');
      const date = (src.match(/^updated:\s*(.+)$/m) || src.match(/^date:\s*(.+)$/m))?.[1];
      return [`/blog/${f.replace(/\.md$/, '')}`, date && new Date(date).toISOString()];
    }),
);

const priority = { '/': 1.0, '/rolam/': 0.9, '/sikersztorik/': 0.8, '/blog/': 0.7 };

// GitHub Pages előnézeten '/mindforge', saját domainen '/'
const base = process.env.BASE_PATH || '/';

export default defineConfig({
  site: 'https://www.mindforge.hu',
  base,
  trailingSlash: 'ignore',
  // CSS a HTML-be ágyazva: nincs renderelést blokkoló kérés
  build: { format: 'directory', inlineStylesheets: 'always' },
  integrations: [
    sitemap({
      filter: (page) => !/\/(impresszum|adatkezelesi-nyilatkozat)\/$/.test(page),
      serialize(item) {
        const p = new URL(item.url).pathname;
        const key = p.replace(/\/$/, '');
        if (postDates[key]) item.lastmod = postDates[key];
        item.priority = priority[p] ?? (p.startsWith('/blog/') ? 0.6 : 0.5);
        return item;
      },
    }),
  ],
});

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

const priority = { '/': 1.0, '/rolam': 0.9, '/sikersztorik': 0.8, '/blog': 0.7 };

export default defineConfig({
  site: 'https://www.mindforge.hu',
  trailingSlash: 'never',
  build: { format: 'directory' },
  integrations: [
    sitemap({
      filter: (page) => !/\/(impresszum|adatkezelesi-nyilatkozat)\/?$/.test(page),
      serialize(item) {
        const p = new URL(item.url).pathname.replace(/\/$/, '') || '/';
        item.url = new URL(p, 'https://www.mindforge.hu').href;
        if (postDates[p]) item.lastmod = postDates[p];
        item.priority = priority[p] ?? (p.startsWith('/blog/') ? 0.6 : 0.5);
        return item;
      },
    }),
  ],
});

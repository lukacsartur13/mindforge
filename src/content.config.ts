import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: ({ image }) => z.object({
    title: z.string(),
    /** Rövidebb, kulcsszavas cím a Google találati listához (max. ~60 karakter) */
    seoTitle: z.string().optional(),
    /** Meta leírás (max. ~155 karakter) */
    description: z.string(),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    cover: image(),
    coverAlt: z.string().default(''),
    /** Ha üres, a szöveg hosszából számolódik */
    readingTime: z.number().optional(),
    category: z.string().optional(),
  }),
});

export const collections = { blog };

/** Olvasási idő percben (~200 szó/perc), ha a posztban nincs kézzel megadva */
export function readingMinutes(post: { body?: string; data: { readingTime?: number } }): number {
  if (post.data.readingTime) return post.data.readingTime;
  const words = (post.body ?? '').replace(/[#*_>\[\]()`-]/g, ' ').split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

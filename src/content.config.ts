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
    readingTime: z.number().default(1),
    category: z.string().optional(),
    oldSlug: z.string().optional(),
  }),
});

export const collections = { blog };

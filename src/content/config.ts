import { defineCollection, z } from 'astro:content';

const blogCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    publishDate: z.string(),
    updateDate: z.string().optional(),
    author: z.string().default('Locked_in Editör Ekibi'),
    category: z.enum(['web-tasarim', 'seo', 'google-maps', 'yemek-platformlari', 'dijital-reklam']),
    readingTime: z.string(),
    relatedServiceHref: z.string(),
    relatedServiceTitle: z.string(),
    featured: z.boolean().default(false),
  }),
});

export const collections = {
  blog: blogCollection,
};

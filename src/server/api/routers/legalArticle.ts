import { z } from 'zod';
import { LegalArea } from '@/lib/types';
import { createTRPCRouter, publicProcedure } from '@/server/api/trpc';
import { mockLegalArticles } from '@/lib/mock-data'; // Import mockLegalArticles

export const legalArticleSchema = z.object({
  id: z.string(),
  title: z.string(),
  articleNumber: z.string(),
  fullText: z.string(),
  lawCode: z.string(),
  category: z.nativeEnum(LegalArea),
});

export const legalArticleRouter = createTRPCRouter({
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .output(legalArticleSchema.nullable())
    .query(({ input }) => {
      return mockLegalArticles.find((article) => article.id === input.id) || null;
    }),

  list: publicProcedure
    .output(z.array(legalArticleSchema))
    .query(() => {
      return mockLegalArticles;
    }),
});

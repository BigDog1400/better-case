import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '@/server/api/trpc';
import { mockLegalSuggestions } from '@/lib/mock-data'; // Import mockLegalSuggestions

export const legalSuggestionSchema = z.object({
  id: z.string(),
  caseId: z.string(),
  lawTitle: z.string(),
  articleNumber: z.string(),
  snippet: z.string(),
  relevanceScore: z.number(),
  fullText: z.string(),
});

export const legalSuggestionRouter = createTRPCRouter({
  listByCaseId: publicProcedure
    .input(z.object({ caseId: z.string() }))
    .output(z.array(legalSuggestionSchema))
    .query(({ input }) => {
      return mockLegalSuggestions.filter((s) => s.caseId === input.caseId);
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .output(legalSuggestionSchema.nullable())
    .query(({ input }) => {
      return mockLegalSuggestions.find((s) => s.id === input.id) || null;
    }),
});

import { z } from 'zod';
import { LegalArea } from '@/lib/types';
import { createTRPCRouter, publicProcedure } from '@/server/api/trpc';
import { legalAreaOptions, mockCases } from '@/lib/mock-data'; // Import mockCases

export const caseSchema = z.object({
  id: z.string(),
  name: z.string(),
  client: z.string().optional(), // Made client optional as per types.ts
  areaOfLaw: z.nativeEnum(LegalArea),
  description: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  status: z.enum(['active', 'archived']),
});

export const legalAreaOptionSchema = z.object({
  value: z.nativeEnum(LegalArea),
  label: z.string(),
});

// Schema for creating a case, id, createdAt and updatedAt are auto-generated
export const createCaseSchema = caseSchema.omit({ id: true, createdAt: true, updatedAt: true });

export const caseRouter = createTRPCRouter({
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .output(caseSchema.nullable())
    .query(({ input }) => {
      return mockCases.find((c) => c.id === input.id) || null;
    }),

  list: publicProcedure
    .output(z.array(caseSchema))
    .query(() => {
      return mockCases;
    }),

  create: publicProcedure
    .input(createCaseSchema)
    .output(caseSchema)
    .mutation(({ input }) => {
      const newCase = {
        ...input,
        id: `case-${Date.now()}`, // Generate a unique ID
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockCases.push(newCase); // In a real app, you'd save this to a DB
      return newCase;
    }),

  getLegalAreaOptions: publicProcedure
    .output(z.array(legalAreaOptionSchema))
    .query(() => {
      return legalAreaOptions;
    }),
});

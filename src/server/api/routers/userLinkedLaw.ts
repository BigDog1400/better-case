import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

export const userLinkedLawRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        caseId: z.string().uuid(),
        elasticsearchLawArticleId: z.string(),
        lawTitleCache: z.string().optional(),
        articleNumberCache: z.string().optional(),
        userNotesOnLink: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.userLinkedLaw.create({
        data: {
          case: { connect: { id: input.caseId } },
          elasticsearchLawArticleId: input.elasticsearchLawArticleId,
          lawTitleCache: input.lawTitleCache,
          articleNumberCache: input.articleNumberCache,
          userNotesOnLink: input.userNotesOnLink,
        },
      });
    }),

  getAllByCaseId: protectedProcedure
    .input(z.object({ caseId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.userLinkedLaw.findMany({
        where: { caseId: input.caseId },
      });
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.userLinkedLaw.findUnique({
        where: { id: input.id },
      });
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        lawTitleCache: z.string().optional(),
        articleNumberCache: z.string().optional(),
        userNotesOnLink: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.userLinkedLaw.update({
        where: { id: input.id },
        data: {
          lawTitleCache: input.lawTitleCache,
          articleNumberCache: input.articleNumberCache,
          userNotesOnLink: input.userNotesOnLink,
        },
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.userLinkedLaw.delete({
        where: { id: input.id },
      });
    }),
});

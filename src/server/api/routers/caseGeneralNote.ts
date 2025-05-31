import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

export const caseGeneralNoteRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        caseId: z.string().uuid(),
        noteContent: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.caseGeneralNote.create({
        data: {
          case: { connect: { id: input.caseId } },
          noteContent: input.noteContent,
        },
      });
    }),

  getAllByCaseId: protectedProcedure
    .input(z.object({ caseId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.caseGeneralNote.findMany({
        where: { caseId: input.caseId },
      });
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.caseGeneralNote.findUnique({
        where: { id: input.id },
      });
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        noteContent: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.caseGeneralNote.update({
        where: { id: input.id },
        data: {
          noteContent: input.noteContent,
        },
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.caseGeneralNote.delete({
        where: { id: input.id },
      });
    }),
});

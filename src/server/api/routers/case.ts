import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";

export const caseRouter = createTRPCRouter({
  // Create a new case
  create: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        countryId: z.string(),
        areaOfLawId: z.string().optional(),
        caseName: z.string().min(1),
        clientName: z.string().optional(),
        caseDescriptionInput: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.db.case.create({
          data: {
            userId: input.userId,
            countryId: input.countryId,
            areaOfLawId: input.areaOfLawId,
            caseName: input.caseName,
            clientName: input.clientName,
            caseDescriptionInput: input.caseDescriptionInput,
          },
        });
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create case",
        });
      }
    }),

  // Get all cases
  getAll: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.case.findMany({
      include: {
        user: true,
        country: true,
        areaOfLaw: true,
      },
    });
  }),

  // Get case by ID
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const legalCase = await ctx.db.case.findUnique({
        where: { id: input.id },
        include: {
          user: true,
          country: true,
          areaOfLaw: true,
          userLinkedLaws: true,
          caseGeneralNotes: true,
        },
      });
      if (!legalCase) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Case not found",
        });
      }
      return legalCase;
    }),

  // Update case
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        userId: z.string().optional(),
        countryId: z.string().optional(),
        areaOfLawId: z.string().optional().nullable(),
        caseName: z.string().min(1).optional(),
        clientName: z.string().optional().nullable(),
        caseDescriptionInput: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.db.case.update({
          where: { id: input.id },
          data: {
            userId: input.userId,
            countryId: input.countryId,
            areaOfLawId: input.areaOfLawId,
            caseName: input.caseName,
            clientName: input.clientName,
            caseDescriptionInput: input.caseDescriptionInput,
          },
        });
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update case",
        });
      }
    }),

  // Delete case
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.db.case.delete({
          where: { id: input.id },
        });
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete case",
        });
      }
    }),

  getCaseStats: protectedProcedure.query(async ({ ctx }) => {
    const totalCases = await ctx.db.case.count({
      where: { userId: ctx.session.user.id },
    });

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const casesThisMonth = await ctx.db.case.count({
      where: {
        userId: ctx.session.user.id,
        createdAt: {
          gte: startOfMonth,
        },
      },
    });

    return {
      totalCases,
      casesThisMonth,
    };
  }),
});

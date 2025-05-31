import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";

export const areaOfLawRouter = createTRPCRouter({
  create: publicProcedure
    .input(
      z.object({
        name: z.string().min(1),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.db.areaOfLaw.create({
          data: {
            name: input.name,
            description: input.description,
          },
        });
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create area of law",
        });
      }
    }),

  getAll: publicProcedure.query(async ({ ctx }) => {
    return await ctx.db.areaOfLaw.findMany();
  }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const area = await ctx.db.areaOfLaw.findUnique({
        where: { id: input.id },
      });
      if (!area) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Area of law not found",
        });
      }
      return area;
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.db.areaOfLaw.update({
          where: { id: input.id },
          data: {
            name: input.name,
            description: input.description,
          },
        });
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update area of law",
        });
      }
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.db.areaOfLaw.delete({
          where: { id: input.id },
        });
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete area of law",
        });
      }
    }),
});

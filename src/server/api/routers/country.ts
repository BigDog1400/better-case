import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";

export const countryRouter = createTRPCRouter({
  create: publicProcedure
    .input(
      z.object({
        name: z.string().min(1),
        isoCode: z.string().length(2),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.db.country.create({
          data: {
            name: input.name,
            isoCode: input.isoCode,
          },
        });
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create country",
        });
      }
    }),

  getAll: publicProcedure.query(async ({ ctx }) => {
    return await ctx.db.country.findMany();
  }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const country = await ctx.db.country.findUnique({
        where: { id: input.id },
      });
      if (!country) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Country not found",
        });
      }
      return country;
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
        isoCode: z.string().length(2).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.db.country.update({
          where: { id: input.id },
          data: {
            name: input.name,
            isoCode: input.isoCode,
          },
        });
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update country",
        });
      }
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.db.country.delete({
          where: { id: input.id },
        });
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete country",
        });
      }
    }),
});

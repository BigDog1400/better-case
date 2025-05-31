import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { z } from "zod";

export const userRouter = createTRPCRouter({
  getMe: protectedProcedure.query(async ({ ctx }) => {
    // This procedure returns the current user's session data
    // The session data should already contain the user object if the session is valid
    return ctx.session.user;
  }),
});

import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";
import { countryRouter } from "./routers/country";
import { areaOfLawRouter } from "./routers/areaOfLaw";
import { caseRouter } from "./routers/case";
import { userLinkedLawRouter } from "./routers/userLinkedLaw";
import { caseGeneralNoteRouter } from "./routers/caseGeneralNote";
import { userRouter } from "./routers/user";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  country: countryRouter,
  areaOfLaw: areaOfLawRouter,
  case: caseRouter,
  userLinkedLaw: userLinkedLawRouter,
  caseGeneralNote: caseGeneralNoteRouter,
  user: userRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 */
export const createCaller = createCallerFactory(appRouter);

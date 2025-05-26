import { postRouter } from "@/server/api/routers/post";
import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";
import { caseRouter } from "@/server/api/routers/case";
import { legalSuggestionRouter } from "@/server/api/routers/legalSuggestion";
import { chatMessageRouter } from "@/server/api/routers/chatMessage";
import { legalArticleRouter } from "@/server/api/routers/legalArticle";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  post: postRouter,
  case: caseRouter,
  legalSuggestion: legalSuggestionRouter,
  chatMessage: chatMessageRouter,
  legalArticle: legalArticleRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);

import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '@/server/api/trpc';
import { mockChatMessages } from '@/lib/mock-data'; // Import mockChatMessages

export const chatMessageSchema = z.object({
  id: z.string(),
  caseId: z.string(),
  role: z.enum(['user', 'assistant']),
  content: z.string(),
  timestamp: z.date(),
});

// Schema for creating a message, id and timestamp are auto-generated
export const createChatMessageSchema = chatMessageSchema.omit({ id: true, timestamp: true });

export const chatMessageRouter = createTRPCRouter({
  listByCaseId: publicProcedure
    .input(z.object({ caseId: z.string() }))
    .output(z.array(chatMessageSchema))
    .query(({ input }) => {
      return mockChatMessages.filter((msg) => msg.caseId === input.caseId);
    }),

  create: publicProcedure
    .input(createChatMessageSchema)
    .output(chatMessageSchema)
    .mutation(({ input }) => {
      const newUserMessage = {
        ...input,
        id: `msg-${Date.now()}`, // Generate a unique ID
        timestamp: new Date(),
      };
      mockChatMessages.push(newUserMessage); // In a real app, you'd save this to a DB

      // Simulate AI response
      if (input.role === 'user') {
        const aiResponse = {
          id: `msg-${Date.now() + 1}`,
          caseId: input.caseId,
          role: 'assistant' as const,
          content: "This is a canned AI response.",
          timestamp: new Date(),
        };
        mockChatMessages.push(aiResponse);
      }
      return newUserMessage; // Return the user's message
    }),
});

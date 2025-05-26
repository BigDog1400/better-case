"use client"
import { useState, useRef, useEffect } from "react"
import { api } from "@/trpc/react"; // Import api
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Send, AlertTriangle, ArrowLeft, Loader2 } from "lucide-react" // Added Loader2
import { ChatMessageComponent } from "./chat-message"
import type { ChatMessage, Case } from "@/lib/types" // ChatMessage might be inferred

interface ChatInterfaceProps {
  caseData: Case
  onBack: () => void
}

export function ChatInterface({ caseData, onBack }: ChatInterfaceProps) {
  const utils = api.useUtils();
  const [inputMessage, setInputMessage] = useState("")
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const { data: messages = [], isLoading: isLoadingMessages, error: messagesError } = api.chatMessage.listByCaseId.useQuery(
    { caseId: caseData.id },
    {
      initialData: () => [ // Provide initial data to avoid flicker and show greeting
        {
          id: 'initial-ai-greeting',
          caseId: caseData.id,
          role: 'assistant',
          content: `¡Hola! Soy tu Estratega IA para el caso "${caseData.name}". Estoy aquí para ayudarte a desarrollar estrategias legales, analizar argumentos y explorar diferentes enfoques para tu caso.\n\n¿En qué aspecto específico del caso te gustaría que trabajemos juntos?`,
          timestamp: new Date()
        }
      ],
      refetchOnWindowFocus: false, // Optional: disable refetch on window focus
    }
  );

  const createMessageMutation = api.chatMessage.create.useMutation({
    onMutate: async (newMessageData) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await utils.chatMessage.listByCaseId.cancel({ caseId: caseData.id });

      // Snapshot the previous value
      const previousMessages = utils.chatMessage.listByCaseId.getData({ caseId: caseData.id });

      // Optimistically update to the new value
      const optimisticMessage: ChatMessage = {
        id: `optimistic-${Date.now()}`, // Temporary ID
        caseId: newMessageData.caseId,
        role: newMessageData.role as 'user' | 'assistant', // Ensure role is correctly typed
        content: newMessageData.content,
        timestamp: new Date(),
      };
      utils.chatMessage.listByCaseId.setData({ caseId: caseData.id }, (oldMessages = []) => [...oldMessages, optimisticMessage]);
      
      setInputMessage(""); // Clear input after optimistic update
      return { previousMessages }; // Return context with the optimistic message and previous messages
    },
    onError: (err, newMessage, context) => {
      // Rollback on error
      if (context?.previousMessages) {
        utils.chatMessage.listByCaseId.setData({ caseId: caseData.id }, context.previousMessages);
      }
      // TODO: Show error toast to user
      console.error("Error sending message:", err);
    },
    onSettled: () => {
      // Always refetch after error or success to ensure server state
      utils.chatMessage.listByCaseId.invalidate({ caseId: caseData.id });
      textareaRef.current?.focus();
    },
  });
  
  const isLoading = createMessageMutation.isLoading; // isLoading is now from the mutation

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages, createMessageMutation.data]); // Also scroll when new message from mutation comes in

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || createMessageMutation.isLoading) return

    createMessageMutation.mutate({
      caseId: caseData.id,
      role: 'user',
      content: inputMessage.trim(),
    });
    // Input is cleared optimistically in onMutate
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)]">
      {/* Header */}
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={onBack} aria-label="Volver">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex-1">
              <CardTitle className="text-lg">Estratega IA</CardTitle>
              <p className="text-sm text-muted-foreground">
                Estrategia para: {caseData.name}
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Disclaimer */}
      <Alert className="mb-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Las respuestas de la IA son para fines informativos y de lluvia de ideas únicamente. 
          No constituyen asesoramiento legal. Siempre verifica la información y usa tu criterio profesional.
        </AlertDescription>
      </Alert>

      {/* Messages */}
      <Card className="flex-1 flex flex-col">
        <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {/* Display messages from useQuery, which includes optimistic updates */}
            {messages.map((message) => (
              <ChatMessageComponent key={message.id} message={message} />
            ))}
            {/* The tRPC create endpoint now handles creating the assistant's response,
                so the loading indicator for the assistant's response is implicit
                while the listByCaseId query is being invalidated and refetched.
                We can show a specific loading indicator if the mutation is pending. */}
            {createMessageMutation.isLoading && (
              <ChatMessageComponent 
                message={{
                  id: 'ai-reply-loading',
                  caseId: caseData.id,
                  role: 'assistant',
                  content: '', // Empty content while loading
                  timestamp: new Date()
                }}
                isLoading={true} // This prop will show the dots animation
              />
            )}
          </div>
        </ScrollArea>
        
        {messagesError && (
          <Alert variant="destructive" className="m-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Error al cargar mensajes: {messagesError.message}. Intenta recargar la página.
            </AlertDescription>
          </Alert>
        )}

        {/* Input */}
        <CardContent className="border-t p-4">
          <div className="flex gap-2">
            <Textarea
              ref={textareaRef}
              placeholder={`Pregunta sobre estrategia para "${caseData.name}"...`}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              className="min-h-[60px] max-h-32 resize-none"
              disabled={createMessageMutation.isLoading}
            />
            <Button 
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || createMessageMutation.isLoading}
              size="lg"
              className="px-4"
              aria-label="Enviar mensaje"
            >
              {createMessageMutation.isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Presiona Enter para enviar, Shift+Enter para nueva línea
          </p>
          {createMessageMutation.error && (
             <p className="text-xs text-red-500 mt-1">
               Error al enviar: {createMessageMutation.error.message}
             </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
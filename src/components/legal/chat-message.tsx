import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Copy, ThumbsUp, ThumbsDown, User, Bot } from "lucide-react"
import { toast } from "sonner"
import type { ChatMessage } from "@/lib/types"

interface ChatMessageProps {
  message: ChatMessage
  isLoading?: boolean
}

export function ChatMessageComponent({ message, isLoading = false }: ChatMessageProps) {
  const isUser = message.role === 'user'
  
  const handleCopy = () => {
    navigator.clipboard.writeText(message.content)
    toast.success("Mensaje copiado al portapapeles")
  }

  const handleRate = (positive: boolean) => {
    toast.success(positive ? "Respuesta marcada como útil" : "Feedback registrado")
  }

  return (
    <div className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      {!isUser && (
        <Avatar className="h-8 w-8 mt-1">
          <AvatarFallback className="bg-primary text-primary-foreground">
            <Bot className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      )}
      
      <div className={`max-w-[80%] ${isUser ? 'order-first' : ''}`}>
        <Card className={`p-4 ${isUser ? 'bg-primary text-primary-foreground ml-auto' : 'bg-muted'}`}>
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
              <span className="text-sm">IA está escribiendo...</span>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <div className="whitespace-pre-wrap">{message.content}</div>
              </div>
              
              <div className="flex items-center justify-between text-xs opacity-70">
                <span>{message.timestamp.toLocaleTimeString('es-VE', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}</span>
                
                {!isUser && (
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCopy}
                      className="h-6 w-6 p-0 hover:bg-background/20"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRate(true)}
                      className="h-6 w-6 p-0 hover:bg-background/20"
                    >
                      <ThumbsUp className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRate(false)}
                      className="h-6 w-6 p-0 hover:bg-background/20"
                    >
                      <ThumbsDown className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </Card>
      </div>
      
      {isUser && (
        <Avatar className="h-8 w-8 mt-1">
          <AvatarFallback className="bg-secondary">
            <User className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  )
}
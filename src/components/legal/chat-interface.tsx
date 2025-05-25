"use client"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Send, AlertTriangle, ArrowLeft } from "lucide-react"
import { ChatMessageComponent } from "./chat-message"
import type { ChatMessage, Case } from "@/lib/types"

interface ChatInterfaceProps {
  caseData: Case
  onBack: () => void
}

export function ChatInterface({ caseData, onBack }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      caseId: caseData.id,
      role: 'assistant',
      content: `¡Hola! Soy tu Estratega IA para el caso "${caseData.name}". Estoy aquí para ayudarte a desarrollar estrategias legales, analizar argumentos y explorar diferentes enfoques para tu caso.\n\n¿En qué aspecto específico del caso te gustaría que trabajemos juntos?`,
      timestamp: new Date()
    }
  ])
  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    // Scroll to bottom when new messages are added
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  const generateAIResponse = async (userMessage: string): Promise<string> => {
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000))
    
    // Mock AI responses based on keywords
    const lowerMessage = userMessage.toLowerCase()
    
    if (lowerMessage.includes('estrategia') || lowerMessage.includes('enfoque')) {
      return `Para desarrollar una estrategia efectiva en el caso "${caseData.name}", te sugiero considerar los siguientes enfoques:\n\n1. **Análisis de precedentes**: Revisar casos similares en el área de ${caseData.areaOfLaw}\n2. **Fortalezas del caso**: Identificar los elementos más sólidos de tu posición\n3. **Posibles objeciones**: Anticipar argumentos de la contraparte\n\n¿Te gustaría profundizar en alguno de estos aspectos específicos?`
    }
    
    if (lowerMessage.includes('argumento') || lowerMessage.includes('defensa')) {
      return `Los argumentos clave para tu caso podrían incluir:\n\n• **Fundamento legal**: Basado en las leyes venezolanas aplicables\n• **Evidencia documental**: Documentos que respalden tu posición\n• **Jurisprudencia**: Decisiones judiciales previas favorables\n\n¿Qué tipo de evidencia tienes disponible para respaldar estos argumentos?`
    }
    
    if (lowerMessage.includes('riesgo') || lowerMessage.includes('problema')) {
      return `Es importante evaluar los riesgos potenciales:\n\n⚠️ **Riesgos identificados**:\n- Posibles contrargumentos de la otra parte\n- Requisitos procesales específicos\n- Plazos legales críticos\n\n💡 **Estrategias de mitigación**:\n- Preparación exhaustiva de documentación\n- Análisis de jurisprudencia favorable\n- Consideración de alternativas de resolución\n\n¿Hay algún riesgo específico que te preocupe?`
    }
    
    // Default response
    return `Entiendo tu consulta sobre "${userMessage}". Para el caso "${caseData.name}" en el área de ${caseData.areaOfLaw}, es importante considerar:\n\n• El contexto legal específico venezolano\n• Los precedentes relevantes en esta materia\n• Las mejores prácticas procesales\n\n¿Podrías ser más específico sobre qué aspecto te gustaría explorar en detalle?`
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      caseId: caseData.id,
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage("")
    setIsLoading(true)

    try {
      const aiResponse = await generateAIResponse(inputMessage.trim())
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        caseId: caseData.id,
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Error generating AI response:', error)
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        caseId: caseData.id,
        role: 'assistant',
        content: 'Lo siento, hubo un error al procesar tu mensaje. Por favor intenta nuevamente.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
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
            <Button variant="ghost" size="sm" onClick={onBack}>
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
            {messages.map((message) => (
              <ChatMessageComponent key={message.id} message={message} />
            ))}
            {isLoading && (
              <ChatMessageComponent 
                message={{
                  id: 'loading',
                  caseId: caseData.id,
                  role: 'assistant',
                  content: '',
                  timestamp: new Date()
                }}
                isLoading={true}
              />
            )}
          </div>
        </ScrollArea>

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
              disabled={isLoading}
            />
            <Button 
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
              size="lg"
              className="px-4"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Presiona Enter para enviar, Shift+Enter para nueva línea
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
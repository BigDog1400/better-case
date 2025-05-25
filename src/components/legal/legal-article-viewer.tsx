import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Copy, Star, ArrowLeft, BookOpen } from "lucide-react"
import { toast } from "sonner"
import type { LegalArticle } from "@/lib/types"

interface LegalArticleViewerProps {
  article: LegalArticle
  onBack: () => void
  highlightTerms?: string[]
}

export function LegalArticleViewer({ article, onBack, highlightTerms = [] }: LegalArticleViewerProps) {
  const handleCopyText = () => {
    navigator.clipboard.writeText(article.fullText)
    toast.success("Texto copiado al portapapeles")
  }

  const handleLinkToCase = () => {
    toast.success("Artículo vinculado al caso")
  }

  const highlightText = (text: string, terms: string[]) => {
    if (terms.length === 0) return text
    
    let highlightedText = text
    terms.forEach(term => {
      const regex = new RegExp(`(${term})`, 'gi')
      highlightedText = highlightedText.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-800">$1</mark>')
    })
    
    return highlightedText
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start gap-4">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex-1">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <CardTitle className="text-2xl mb-2">{article.title}</CardTitle>
                  <CardDescription className="text-lg font-medium text-primary">
                    {article.articleNumber}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{article.category}</Badge>
                  <BookOpen className="h-5 w-5 text-muted-foreground" />
                </div>
              </div>
              <p className="text-muted-foreground font-medium">{article.lawCode}</p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Article Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Texto Completo</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleCopyText}>
                <Copy className="h-4 w-4 mr-2" />
                Copiar Texto
              </Button>
              <Button variant="default" size="sm" onClick={handleLinkToCase}>
                <Star className="h-4 w-4 mr-2" />
                Vincular al Caso
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <Separator />
        
        <CardContent className="pt-6">
          <div className="prose prose-lg max-w-none dark:prose-invert">
            <div 
              className="leading-relaxed text-foreground"
              dangerouslySetInnerHTML={{ 
                __html: highlightText(article.fullText, highlightTerms) 
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Related Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Información Adicional</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Código Legal</h4>
            <p className="text-muted-foreground">{article.lawCode}</p>
          </div>
          
          <Separator />
          
          <div>
            <h4 className="font-medium mb-2">Categoría</h4>
            <Badge variant="secondary">{article.category}</Badge>
          </div>
          
          <Separator />
          
          <div>
            <h4 className="font-medium mb-2">Acciones Disponibles</h4>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                Ver Artículos Relacionados
              </Button>
              <Button variant="outline" size="sm">
                Buscar Jurisprudencia
              </Button>
              <Button variant="outline" size="sm">
                Agregar Nota
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
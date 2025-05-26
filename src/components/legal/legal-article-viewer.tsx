import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { api } from "@/trpc/react"; // Import api
import { Skeleton } from "@/components/ui/skeleton"; // Added Skeleton
import { AlertTriangle, Loader2 } from "lucide-react"; // Added icons
import { Separator } from "@/components/ui/separator"
import { Copy, Star, ArrowLeft, BookOpen } from "lucide-react" // Removed: BookText, Landmark, Tag, FileCheck2
import { toast } from "sonner"
import type { LegalArticle } from "@/lib/types" // LegalArticle might be inferred

interface LegalArticleViewerProps {
  articleId: string; // Changed from article: LegalArticle
  onBack: () => void;
  highlightTerms?: string[];
}

export function LegalArticleViewer({ articleId, onBack, highlightTerms = [] }: LegalArticleViewerProps) {
  const { data: article, isLoading, error } = api.legalArticle.getById.useQuery(
    { id: articleId },
    { enabled: !!articleId } // Fetch only if articleId is provided
  );

  // Fetch legalAreaOptions for displaying category label
  const { data: legalAreaOptions, isLoading: isLoadingOptions, error: optionsError } = api.case.getLegalAreaOptions.useQuery(undefined, {
    enabled: !!article, // Fetch only when article is loaded
  });
  
  const areaLabel = article && legalAreaOptions?.find(option => option.value === article.category)?.label || article?.category;

  const handleCopyText = () => {
    if (article) {
      navigator.clipboard.writeText(article.fullText);
      toast.success("Texto copiado al portapapeles");
    }
  };

  const handleLinkToCase = () => {
    // This functionality would require a mutation if it involves backend changes
    toast.success("Artículo vinculado al caso (simulado)");
  };

  const highlightText = (text: string, terms: string[]) => {
    if (terms.length === 0) return text;
    let highlightedText = text;
    terms.forEach(term => {
      const regex = new RegExp(`(${term})`, 'gi');
      highlightedText = highlightedText.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-800">$1</mark>');
    });
    return highlightedText;
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 p-4">
        <Skeleton className="h-12 w-3/4 mb-4" />
        <Card><CardHeader><Skeleton className="h-24 w-full" /></CardHeader></Card>
        <Card>
          <CardHeader><Skeleton className="h-8 w-1/4 mb-2" /><div className="flex gap-2"><Skeleton className="h-8 w-24" /><Skeleton className="h-8 w-24" /></div></CardHeader>
          <CardContent><Skeleton className="h-64 w-full" /></CardContent>
        </Card>
        <Card><CardHeader><Skeleton className="h-8 w-1/4 mb-2" /></CardHeader><CardContent><Skeleton className="h-32 w-full" /></CardContent></Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 p-4 text-center">
        <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-red-600">Error al cargar el artículo</h2>
        <p className="text-muted-foreground mb-4">{error.message}</p>
        <Button onClick={onBack} variant="outline">Volver</Button>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 p-4 text-center">
        <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-xl font-semibold">Artículo no encontrado</h2>
        <p className="text-muted-foreground mb-4">No se pudo encontrar el artículo solicitado.</p>
        <Button onClick={onBack} variant="outline">Volver</Button>
      </div>
    );
  }
  
  // Main content once article is loaded
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
                  {isLoadingOptions && <Skeleton className="h-5 w-20"/>}
                  {optionsError && <Badge variant="destructive" className="text-xs">Error área</Badge>}
                  {!isLoadingOptions && areaLabel && <Badge variant="outline">{areaLabel}</Badge>}
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
            {isLoadingOptions && <Skeleton className="h-5 w-24"/>}
            {optionsError && <Badge variant="destructive" className="text-xs">Error área</Badge>}
            {!isLoadingOptions && areaLabel && <Badge variant="secondary">{areaLabel}</Badge>}
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
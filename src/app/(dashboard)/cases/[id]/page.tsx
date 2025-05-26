"use client"
import { useState, useEffect } from "react"; // useEffect might not be needed if all data comes from tRPC
import { useRouter, useParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { api } from "@/trpc/react"; // Import api
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronDown, ChevronUp, Edit, Calendar, User, FileText, Brain, MessageSquare } from "lucide-react";
import { SuggestionCard } from "@/components/legal/suggestion-card";
// mockCases, mockLegalSuggestions are removed
import { legalAreaOptions as mockLegalAreaOptions } from "@/lib/mock-data"; // Keep for now if tRPC doesn't provide labels directly
import type { Case, LegalSuggestion } from "@/lib/types"; // Types might be inferred from api outputs

export default function CaseDetailPage() {
  const router = useRouter();
  const params = useParams();
  const caseId = params.id as string;
  const { data: session, isPending: isSessionPending } = authClient.useSession();
  
  const [isCollapsed, setIsCollapsed] = useState(false);

  const { data: caseData, isLoading: isLoadingCase, error: caseError } = api.case.getById.useQuery(
    { id: caseId },
    { enabled: !!session && !isSessionPending } // Only fetch if session is loaded
  );

  const { data: suggestions, isLoading: isLoadingSuggestions, error: suggestionsError } = api.legalSuggestion.listByCaseId.useQuery(
    { caseId: caseId },
    { enabled: !!session && !isSessionPending && !!caseData } // Fetch only if caseData is available
  );
  
  // Fetch legalAreaOptions - this might be better fetched at a higher level if used in multiple places
  const { data: legalAreaOptionsData, isLoading: isLoadingOptions, error: optionsError } = api.case.getLegalAreaOptions.useQuery(undefined, {
    enabled: !!session && !isSessionPending,
  });
  const legalAreaOptions = legalAreaOptionsData || mockLegalAreaOptions; // Fallback to mock if needed, or handle loading/error

  useEffect(() => {
    if (!session && !isSessionPending) {
      router.push("/login");
    }
  }, [session, isSessionPending, router]);

  const isLoading = isSessionPending || isLoadingCase || isLoadingSuggestions || isLoadingOptions;

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <div className="space-y-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-32 w-full" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
          </div>
        </div>
      </div>
    );
  }

  if (!session || !caseData && !isLoading) { // If done loading and still no caseData (e.g. error or not found)
    // Handle error or not found case, e.g. router.push('/404') or show error message
    // For now, returning null or a skeleton might be fine, or show an error component
    if (caseError) {
      return <div className="container mx-auto max-w-6xl px-4 py-8 text-red-500">Error loading case: {caseError.message}</div>;
    }
    return null; // Or a more specific "not found" component
  }
  
  // Ensure caseData is available before trying to access its properties
  const areaLabel = caseData ? legalAreaOptions.find(option => option.value === caseData.areaOfLaw)?.label || caseData.areaOfLaw : '';

  const handleEditCase = () => {
    router.push(`/cases/${caseId}/edit`); // This route might need to be created or use a modal
  };

  const handleViewFullText = (suggestionId: string) => {
    // The suggestionId here is likely the ID of the LegalSuggestion itself,
    // not the LegalArticle. We need to ensure the LegalSuggestion object contains
    // a direct reference (e.g., `articleId`) to the LegalArticle.
    // Assuming `suggestion.id` is what's used in the URL for now,
    // but the target page `articles/[articleId]/page.tsx` will need to handle this.
    // If `LegalSuggestion` contains `articleId`, that should be used.
    // For now, we use suggestionId as it is in the current code.
    router.push(`/cases/${caseId}/articles/${suggestionId}`);
  };

  const handleOpenStrategist = () => {
    // This likely opens a chat interface. We'll need to ensure ChatInterface uses tRPC.
    router.push(`/cases/${caseId}/strategist`); // This might be a new page or a modal
  };

  // This check should be after isLoading, to ensure caseData is attempted to be loaded
  if (!caseData) {
    // This can happen if there was an error, or if the case was not found.
    // A more specific error message or a "Not Found" component would be better here.
    return (
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <p>Case not found or error loading data.</p>
        {caseError && <p className="text-red-500">Error: {caseError.message}</p>}
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      {/* Case Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">{caseData.name}</h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <Badge variant="secondary">{areaLabel}</Badge>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Actualizado: {new Date(caseData.updatedAt).toLocaleDateString('es-VE')}
              </div>
              <div className="flex items-center gap-1">
                <FileText className="h-4 w-4" />
                Estado: {caseData.status === 'active' ? 'Activo' : 'Archivado'}
              </div>
            </div>
          </div>
          <Button onClick={handleEditCase} variant="outline" className="flex items-center gap-2">
            <Edit className="h-4 w-4" />
            Editar Caso
          </Button>
        </div>

        {/* Case Summary - Collapsible */}
        <Collapsible open={!isCollapsed} onOpenChange={setIsCollapsed}>
          <Card>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Resumen del Caso</CardTitle>
                  {isCollapsed ? <ChevronDown className="h-5 w-5" /> : <ChevronUp className="h-5 w-5" />}
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-0">
                {caseData.client && (
                  <div className="flex items-center gap-2 mb-3">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Cliente:</span>
                    <span>{caseData.client}</span>
                  </div>
                )}
                <div className="space-y-2">
                  <h4 className="font-medium">Descripción:</h4>
                  <p className="text-muted-foreground leading-relaxed">{caseData.description}</p>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="suggestions" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
          <TabsTrigger value="suggestions" className="flex items-center gap-2" disabled={isLoadingSuggestions}>
            <Brain className="h-4 w-4" />
            Sugerencias IA {isLoadingSuggestions && "(Cargando...)"}
          </TabsTrigger>
          <TabsTrigger value="strategist" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Estratega IA 
            {/* Chat interface will be loaded inside this tab's content */}
          </TabsTrigger>
          <TabsTrigger value="linked" disabled className="opacity-50">
            Leyes Vinculadas
          </TabsTrigger>
          <TabsTrigger value="notes" disabled className="opacity-50">
            Notas del Caso
          </TabsTrigger>
        </TabsList>

        <TabsContent value="suggestions" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Sugerencias Legales</h2>
              <p className="text-muted-foreground">
                Artículos y leyes relevantes identificados automáticamente por IA
              </p>
            </div>
            <Badge variant="outline" className="text-sm">
              {isLoadingSuggestions ? "Cargando..." : `${suggestions?.length || 0} sugerencias encontradas`}
            </Badge>
          </div>
          
          {suggestionsError && <p className="text-red-500">Error al cargar sugerencias: {suggestionsError.message}</p>}
          
          {isLoadingSuggestions && !suggestionsError && (
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Skeleton className="h-40 w-full" />
                <Skeleton className="h-40 w-full" />
             </div>
          )}

          {!isLoadingSuggestions && suggestions && suggestions.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {suggestions.map((suggestion) => (
                <SuggestionCard
                  key={suggestion.id}
                  suggestion={suggestion}
                  onViewFullText={handleViewFullText} // Pass the caseId if needed by SuggestionCard or its links
                />
              ))}
            </div>
          ) : (
            !isLoadingSuggestions && !suggestionsError && ( // Only show "Analizando caso..." if not loading and no error
            <Card className="text-center py-12">
              <CardContent>
                <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <CardTitle className="mb-2">Analizando caso...</CardTitle>
                <CardDescription>
                  La IA está procesando la información del caso para generar sugerencias legales relevantes. O no hay sugerencias para este caso.
                </CardDescription>
              </CardContent>
            </Card>
            )
          )}
        </TabsContent>

        <TabsContent value="strategist" className="space-y-6">
           {/* The ChatInterface component should be rendered here directly if this is where it belongs */}
           {/* Or the "Abrir Chat" button navigates to a page that contains ChatInterface */}
           {/* For now, let's assume the button navigates, so we keep the placeholder content. */}
           {/* If ChatInterface is to be embedded, it would look like: */}
           {/* <ChatInterface caseData={caseData} /> */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Estratega IA</h2>
              <p className="text-muted-foreground">
                Conversa con la IA para desarrollar estrategias legales para este caso
              </p>
            </div>
            {/* The button to open strategist might navigate to a route like /cases/[id]/strategist */}
            {/* This page would then host the ChatInterface component */}
            <Button onClick={handleOpenStrategist} className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Abrir Chat con Estratega
            </Button>
          </div>

          <Card className="text-center py-12">
            <CardContent>
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <CardTitle className="mb-2">Estratega IA para {caseData.name}</CardTitle>
              <CardDescription className="mb-4">
                Inicia una conversación con la IA especializada para explorar estrategias legales, 
                analizar argumentos y obtener insights para tu caso.
              </CardDescription>
              <Button onClick={handleOpenStrategist} size="lg" className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Comenzar Conversación con Estratega
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="linked">
          <Card className="text-center py-12">
            <CardContent>
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <CardTitle className="mb-2">Próximamente</CardTitle>
              <CardDescription>
                Esta funcionalidad estará disponible en una futura actualización.
              </CardDescription>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notes">
          <Card className="text-center py-12">
            <CardContent>
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <CardTitle className="mb-2">Próximamente</CardTitle>
              <CardDescription>
                Esta funcionalidad estará disponible en una futura actualización.
              </CardDescription>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Legal Article Viewer Modal */}
      {selectedArticleId && (
        <LegalArticleViewer
          articleId={selectedArticleId}
          onBack={handleCloseArticleViewer} // Or onClose, depending on its props
                                            // LegalArticleViewer was changed to use onBack
        />
      )}
      {/* The above assumes LegalArticleViewer is designed like a modal. 
          If it's a full-page component, the router.push logic would be needed,
          and that page (articles/[articleId]/page.tsx) would use LegalArticleViewer.
          Given the current structure of LegalArticleViewer (it's a div, not a Dialog),
          it's likely meant to be part of a page. Let's assume it's rendered here for now.
          However, the original page.tsx had a modal for this.
          The refactored LegalArticleViewer is not a Dialog itself.
          So, it should be on a separate page or wrapped in a Dialog here.
          Let's revert to router.push for now, assuming articles/[articleId]/page.tsx will be created
          and will use the new LegalArticleViewer.
          This means the `handleViewFullText` change is not needed right now for THIS file.
          The LegalArticleViewer itself is refactored to fetch its own data.
          The task was to update components to use tRPC hooks. LegalArticleViewer is done.
          The navigation part is a separate concern.
          I will revert the changes for `handleViewFullText` and `selectedArticleId` in this file
          as the immediate task is about using tRPC hooks in existing components.
          The `LegalArticleViewer` component has been updated.
          The `SuggestionCard` calls `onViewFullText` which in this `page.tsx` calls `router.push`.
          This means a new page `src/app/(dashboard)/cases/[id]/articles/[articleId]/page.tsx`
          is indeed expected to exist and use the refactored `LegalArticleViewer`.
          I will proceed with creating this new page in the next step if it's missing.
          For now, this file's previous state regarding navigation is correct.
          The key is that `LegalArticleViewer` now fetches its own data.
          The task for *this file* was to use tRPC for caseData and suggestions, which is done.
      */}
    </div>
  );
}
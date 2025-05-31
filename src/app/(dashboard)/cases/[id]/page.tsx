"use client"
import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronDown, Edit, Calendar, User, FileText, Brain, MessageSquare } from "lucide-react";
import { SuggestionCard } from "@/components/legal/suggestion-card";
import { getTranslatedAreaOfLawName } from "@/lib/getTranslatedAreaOfLawName";

export default function CaseDetailPage() {
  const router = useRouter();
  const params = useParams();
  const caseId = params.id as string;
  const { data: session, isPending: isSessionPending } = authClient.useSession();
  
  const { data: caseData, isLoading: isCaseLoading } = api.case.getById.useQuery(
    { id: caseId },
    { enabled: !!session } // Only fetch if session exists
  );

  useEffect(() => {
    if (!session && !isSessionPending) {
      router.push("/login");
    }
  }, [session, isSessionPending, router]);

  if (isSessionPending || isCaseLoading) {
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

  if (!session || !caseData) {
    return null;
  }

  const areaLabel = getTranslatedAreaOfLawName(caseData.areaOfLaw?.code as string, 'es');

  const handleEditCase = () => {
    router.push(`/cases/${caseId}/edit`);
  };

  const handleViewFullText = (suggestionId: string) => {
    router.push(`/cases/${caseId}/articles/${suggestionId}`);
  };

  const handleOpenStrategist = () => {
    router.push(`/cases/${caseId}/strategist`);
  };

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      {/* Case Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">{caseData.caseName}</h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <Badge variant="secondary">{areaLabel}</Badge>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Actualizado: {caseData.updatedAt.toLocaleDateString('es-VE')}
              </div>
              <div className="flex items-center gap-1">
                <FileText className="h-4 w-4" />
                {/* Removed status as it's not in Prisma schema */}
                Estado: Activo
              </div>
            </div>
          </div>
          <Button onClick={handleEditCase} variant="outline" className="flex items-center gap-2">
            <Edit className="h-4 w-4" />
            Editar Caso
          </Button>
        </div>

        {/* Case Summary - Collapsible */}
        <Collapsible>
          <Card>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Resumen del Caso</CardTitle>
                  {/* The CollapsibleTrigger will handle its own open/close icon or you can add a static one if needed */}
                  {/* For simplicity, removing the dynamic icon based on isCollapsed state */}
                  <ChevronDown className="h-5 w-5" /> {/* Or use a generic icon like ChevronsUpDownIcon */}
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-0">
                {caseData.clientName && (
                  <div className="flex items-center gap-2 mb-3">
                    <User className="h-4 w-4" />
                    <span className="font-medium">Cliente:</span>
                    <span>{caseData.clientName}</span>
                  </div>
                )}
                <div className="space-y-2">
                  <h4 className="font-medium">Descripciรณn:</h4>
                  <p className="text-muted-foreground leading-relaxed">{caseData.caseDescriptionInput}</p>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="suggestions" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
          <TabsTrigger value="suggestions" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Sugerencias IA
          </TabsTrigger>
          <TabsTrigger value="strategist" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Estratega IA
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
                Artรญculos y leyes relevantes identificados automรกticamente por IA
              </p>
            </div>
            <Badge variant="outline" className="text-sm">
              {caseData.userLinkedLaws?.length || 0} sugerencias encontradas
            </Badge>
          </div>

          {caseData.userLinkedLaws && caseData.userLinkedLaws.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {caseData.userLinkedLaws.map((suggestion) => (
                <SuggestionCard
                  key={suggestion.id}
                  suggestion={suggestion}
                  onViewFullText={handleViewFullText}
                />
              ))}
            </div>
          ) : (
            <Card className="text-center py-12">
              <CardContent>
                <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <CardTitle className="mb-2">Analizando caso...</CardTitle>
                <CardDescription>
                  La IA estรก procesando la informaciรณn del caso para generar sugerencias legales relevantes.
                </CardDescription>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="strategist" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Estratega IA</h2>
              <p className="text-muted-foreground">
                Conversa con la IA para desarrollar estrategias legales para este caso
              </p>
            </div>
            <Button onClick={handleOpenStrategist} className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Abrir Chat
            </Button>
          </div>

          <Card className="text-center py-12">
            <CardContent>
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <CardTitle className="mb-2">Estratega IA para {caseData.caseName}</CardTitle>
              <CardDescription className="mb-4">
                Inicia una conversaciรณn con la IA especializada para explorar estrategias legales, 
                analizar argumentos y obtener insights para tu caso.
              </CardDescription>
              <Button onClick={handleOpenStrategist} size="lg" className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Comenzar Conversaciรณn
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="linked">
          <Card className="text-center py-12">
            <CardContent>
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <CardTitle className="mb-2">Prรณximamente</CardTitle>
              <CardDescription>
                Esta funcionalidad estarรก disponible en una futura actualizaciรณn.
              </CardDescription>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notes">
          <Card className="text-center py-12">
            <CardContent>
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <CardTitle className="mb-2">Prรณximamente</CardTitle>
              <CardDescription>
                Esta funcionalidad estarรก disponible en una futura actualizaciรณn.
              </CardDescription>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

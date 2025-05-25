"use client"
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronDown, ChevronUp, Edit, Calendar, User, FileText, Brain, MessageSquare } from "lucide-react";
import { SuggestionCard } from "@/components/legal/suggestion-card";
import { mockCases, mockLegalSuggestions, legalAreaOptions } from "@/lib/mock-data";
import type { Case, LegalSuggestion } from "@/lib/types";

export default function CaseDetailPage() {
  const router = useRouter();
  const params = useParams();
  const caseId = params.id as string;
  const { data: session, isPending } = authClient.useSession();
  
  const [caseData, setCaseData] = useState<Case | null>(null);
  const [suggestions, setSuggestions] = useState<LegalSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    if (!session && !isPending) {
      router.push("/login");
      return;
    }

    // Simulate loading case data
    const loadCaseData = async () => {
      setIsLoading(true);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Find case in mock data or create a new one for demo
      const foundCase = mockCases.find(c => c.id === caseId) || {
        ...mockCases[0],
        id: caseId
      };
      
      const caseSuggestions = mockLegalSuggestions.filter(s => s.caseId === caseId || s.caseId === '1');
      
      setCaseData(foundCase);
      setSuggestions(caseSuggestions);
      setIsLoading(false);
    };

    if (session) {
      loadCaseData();
    }
  }, [session, isPending, router, caseId]);

  if (isPending || isLoading) {
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

  const areaLabel = legalAreaOptions.find(option => option.value === caseData.areaOfLaw)?.label || caseData.areaOfLaw;

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
            <h1 className="text-3xl font-bold mb-2">{caseData.name}</h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <Badge variant="secondary">{areaLabel}</Badge>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Actualizado: {caseData.updatedAt.toLocaleDateString('es-VE')}
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
                Artículos y leyes relevantes identificados automáticamente por IA
              </p>
            </div>
            <Badge variant="outline" className="text-sm">
              {suggestions.length} sugerencias encontradas
            </Badge>
          </div>

          {suggestions.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {suggestions.map((suggestion) => (
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
                  La IA está procesando la información del caso para generar sugerencias legales relevantes.
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
              <CardTitle className="mb-2">Estratega IA para {caseData.name}</CardTitle>
              <CardDescription className="mb-4">
                Inicia una conversación con la IA especializada para explorar estrategias legales, 
                analizar argumentos y obtener insights para tu caso.
              </CardDescription>
              <Button onClick={handleOpenStrategist} size="lg" className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Comenzar Conversación
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
    </div>
  );
}
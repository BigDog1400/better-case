"use client"
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { CaseForm } from "@/components/legal/case-form";
import { toast } from "sonner";
import { mockCases } from "@/lib/mock-data";
import type { Case } from "@/lib/types";

export default function EditCasePage() {
  const router = useRouter();
  const params = useParams();
  const caseId = params.id as string;
  const { data: session, isPending } = authClient.useSession();
  
  const [caseData, setCaseData] = useState<Case | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCase, setIsLoadingCase] = useState(true);

  useEffect(() => {
    if (!session && !isPending) {
      router.push("/login");
      return;
    }

    // Load case data
    const loadCaseData = async () => {
      setIsLoadingCase(true);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Find case in mock data
      const foundCase = mockCases.find(c => c.id === caseId);
      
      if (foundCase) {
        setCaseData(foundCase);
      } else {
        toast.error("Caso no encontrado");
        router.push("/dashboard");
      }
      
      setIsLoadingCase(false);
    };

    if (session) {
      loadCaseData();
    }
  }, [session, isPending, router, caseId]);

  if (isPending || isLoadingCase) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session || !caseData) {
    return null;
  }

  const handleSubmit = async (updatedCaseData: Partial<Case>) => {
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In a real app, this would be an API call
      console.log("Updating case:", { ...updatedCaseData, id: caseId });
      
      toast.success("Caso actualizado exitosamente. Re-analizando contenido...");
      
      // Redirect back to the case detail page
      router.push(`/cases/${caseId}`);
      
    } catch (error) {
      console.error("Error updating case:", error);
      toast.error("Error al actualizar el caso. Por favor intenta nuevamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Editar Caso</h1>
        <p className="text-muted-foreground">
          Modifica los detalles del caso "{caseData.name}" y re-analiza el contenido para obtener nuevas sugerencias.
        </p>
      </div>
      
      <CaseForm 
        case={caseData}
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />
    </div>
  );
}
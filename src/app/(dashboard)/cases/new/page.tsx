"use client"
import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { CaseForm } from "@/components/legal/case-form";
import { toast } from "sonner";
import type { Case } from "@/lib/types";

export default function NewCasePage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [isLoading, setIsLoading] = useState(false);

  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session) {
    router.push("/login");
    return null;
  }

  const handleSubmit = async (caseData: Partial<Case>) => {
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate a new case ID
      const newCaseId = Math.random().toString(36).substr(2, 9);
      
      // In a real app, this would be an API call
      console.log("Creating new case:", { ...caseData, id: newCaseId });
      
      toast.success("Caso creado exitosamente. Analizando contenido...");
      
      // Redirect to the new case detail page
      router.push(`/cases/${newCaseId}`);
      
    } catch (error) {
      console.error("Error creating case:", error);
      toast.error("Error al crear el caso. Por favor intenta nuevamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Crear Nuevo Caso</h1>
        <p className="text-muted-foreground">
          Ingresa los detalles de tu caso para obtener sugerencias legales automáticas y comenzar el análisis con IA.
        </p>
      </div>
      
      <CaseForm 
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />
    </div>
  );
}
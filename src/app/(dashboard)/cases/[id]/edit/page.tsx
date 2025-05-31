"use client"
import {  useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { CaseForm } from "@/components/legal/case-form";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import type { Case } from "@prisma/client";

export default function EditCasePage() {
  const router = useRouter();
  const params = useParams();
  const caseId = params.id as string;
  const { data: session, isPending: isSessionPending } = authClient.useSession();
  
  const { data: caseData, isLoading: isCaseLoading } = api.case.getById.useQuery(
    { id: caseId },
    { enabled: !!session }
  );
  const legalAreaOptionsQuery = api.case.getLegalAreaOptions.useQuery();

  const updateCaseMutation = api.case.update.useMutation({
    onSuccess: () => {
      toast.success("Caso actualizado exitosamente. Re-analizando contenido...");
      router.push(`/cases/${caseId}`);
    },
    onError: (error) => {
      console.error("Error updating case:", error);
      toast.error("Error al actualizar el caso. Por favor intenta nuevamente.");
    },
  });

  useEffect(() => {
    if (!session && !isSessionPending) {
      router.push("/login");
    }
  }, [session, isSessionPending, router]);

  if (isSessionPending || isCaseLoading || legalAreaOptionsQuery.isLoading) {
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
    if (legalAreaOptionsQuery.error) {
      toast.error("Error al cargar las áreas legales. No se puede guardar el caso.");
      return;
    }
    // It's good practice to ensure data is available, though CaseForm might render empty select if not.
    if (!legalAreaOptionsQuery.data) {
      toast.info("Áreas legales aún cargando. Por favor espera antes de guardar.");
      return;
    }
    updateCaseMutation.mutate({ id: caseId, ...updatedCaseData });
  };

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Editar Caso</h1>
        <p className="text-muted-foreground">
          Modifica los detalles del caso "{caseData.caseName}" y re-analiza el contenido para obtener nuevas sugerencias.
        </p>
      </div>
      
      <CaseForm 
        case={caseData}
        onSubmit={handleSubmit}
        isLoading={updateCaseMutation.isPending}
        legalAreaOptions={legalAreaOptionsQuery.data ?? []}
      />
    </div>
  );
}

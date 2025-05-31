"use client"
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { CaseForm } from "@/components/legal/case-form";
import { toast } from "sonner";
import { api } from "@/trpc/react";
import type { Case } from "@prisma/client";

export default function NewCasePage() {
  const router = useRouter();
  const { data: session, isPending: isSessionPending } = authClient.useSession();
  const countriesQuery = api.country.getAll.useQuery();
  const legalAreaOptionsQuery = api.case.getLegalAreaOptions.useQuery();

  const createCaseMutation = api.case.create.useMutation({
    onSuccess: (newCase) => {
      toast.success("Caso creado exitosamente. Analizando contenido...");
      router.push(`/cases/${newCase.id}`);
    },
    onError: (error) => {
      console.error("Error creating case:", error);
      toast.error("Error al crear el caso. Por favor intenta nuevamente.");
    },
  });

  if (isSessionPending || countriesQuery.isLoading || legalAreaOptionsQuery.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const handleSubmit = async (caseData: Partial<Case>) => {
    if (legalAreaOptionsQuery.error) {
      toast.error("Error al cargar las áreas legales. Intenta de nuevo.");
      return;
    }
    if (!legalAreaOptionsQuery.data) {
      toast.info("Áreas legales aún cargando. Por favor espera."); // Or handle as error
      return;
    }
    if (!countriesQuery.data || countriesQuery.data.length === 0) {
      toast.error("No hay países disponibles para crear un caso.");
      return;
    }

    // Use the first country as a default for now
    const defaultCountryIsoCode = 'VE';

    createCaseMutation.mutate({
      userId: session?.user.id ?? '',
      countryIsoCode: defaultCountryIsoCode,
      areaOfLawId: caseData.areaOfLawId ?? '',
      caseName: caseData.caseName!,
      clientName: caseData.clientName ?? '',
      caseDescriptionInput: caseData.caseDescriptionInput!,
    });
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
        isLoading={createCaseMutation.isPending}
        legalAreaOptions={legalAreaOptionsQuery.data ?? []}
      />
    </div>
  );
}

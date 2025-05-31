"use client"
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Search, Filter, FileText, Briefcase } from "lucide-react";
import { CaseCard } from "@/components/legal/case-card";


// Define legalAreaOptions with string values
const legalAreaOptions = [
  { value: "CIVIL", label: "Civil" },
  { value: "PENAL", label: "Penal" },
  { value: "LABOR", label: "Laboral" },
  { value: "FAMILY", label: "Familia" },
  { value: "COMMERCIAL", label: "Comercial" },
  { value: "ADMINISTRATIVE", label: "Administrativo" },
  { value: "CONSTITUTIONAL", label: "Constitucional" },
  { value: "INTERNATIONAL", label: "Internacional" },
  { value: "TRIBUTARY", label: "Tributario" },
  { value: "INTELLECTUAL", label: "Propiedad Intelectual" },
];

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, isPending: isSessionPending } = authClient.useSession();
  const casesQuery = api.case.getAll.useQuery();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterArea, setFilterArea] = useState<string>("all");

  useEffect(() => {
    if (!session && !isSessionPending) {
      router.push("/login");
    }
  }, [session, isSessionPending, router]);

  if (isSessionPending) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session) {
    return null; // Will redirect via useEffect
  }

  const handleViewCase = (caseId: string) => {
    router.push(`/cases/${caseId}`);
  };

  const handleEditCase = (caseId: string) => {
    router.push(`/cases/${caseId}/edit`);
  };

  const handleCreateCase = () => {
    router.push("/cases/new");
  };
  
  
  // The SidebarProvider, AppSidebar, SidebarInset and header are now in dashboard/layout.tsx
  return (
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          {/* Welcome Message - This is now part of the page content */}
          <div className="mb-4">
            <h1 className="text-2xl font-semibold">
              Bienvenido, {session.user.name}!
            </h1>
            <p className="text-muted-foreground">
              Gestiona tus casos legales y obtén asistencia IA.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Casos Activos</CardTitle>
                <Briefcase className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3</div>
                <p className="text-xs text-muted-foreground">
                  Total de casos en progreso
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Casos Este Mes</CardTitle>
                <Plus className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2</div> {/* Placeholder */}
                <p className="text-xs text-muted-foreground">
                  Nuevos casos creados (simulado)
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar casos por nombre, cliente o descripción..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={filterArea} onValueChange={setFilterArea}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filtrar por área" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las áreas</SelectItem>
                  {legalAreaOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Cases Grid */}
          {casesQuery.data && casesQuery.data.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {casesQuery.data.map((caseItem) => (
                <CaseCard
                  key={caseItem.id}
                  case={caseItem}
                  onView={handleViewCase}
                  onEdit={handleEditCase}
                />
              ))}
            </div>
          ) : (
            <Card className="text-center py-12 col-span-full">
              <CardContent>
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <CardTitle className="mb-2">
                  {searchTerm || filterArea !== "all" ? "No se encontraron casos" : "No tienes casos aún"}
                </CardTitle>
                <CardDescription className="mb-4">
                  {searchTerm || filterArea !== "all"
                    ? "Intenta ajustar tus filtros de búsqueda."
                    : "Crea tu primer caso para comenzar a usar Better Case."
                  }
                </CardDescription>
                {(!searchTerm && filterArea === "all") && (
                  <Button onClick={handleCreateCase} className="flex items-center gap-2 mx-auto">
                    <Plus className="h-4 w-4" />
                    Crear Primer Caso
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </main>
  );
}

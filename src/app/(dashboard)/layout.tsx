"use client"
import React from "react"; // Added React for React.ReactNode
import { useRouter } from "next/navigation"; // Needed for potential auth checks in layout
import { authClient } from "@/lib/auth-client"; // Needed for potential auth checks in layout
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  // BreadcrumbSeparator, // Not used in this simplified header
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter(); // Added router for navigation
  // Minimal auth check for layout, page itself will handle detailed session logic
  const { data: session, isPending: isSessionPending } = authClient.useSession();

  React.useEffect(() => {
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
    return null; // Redirecting
  }
  
  const handleCreateCase = () => {
    router.push("/cases/new");
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {/* Header within SidebarInset - This is part of the shared layout */}
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 px-4 border-b bg-background sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-6"
            />
            {/* Breadcrumb can be dynamic based on children later if needed */}
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  {/* This could be dynamic based on the child route */}
                  <BreadcrumbPage className="text-lg font-medium">Dashboard</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <Button onClick={handleCreateCase} size="sm" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Nuevo Caso
          </Button>
        </header>
        {/* Children (page content) will be rendered here */}
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
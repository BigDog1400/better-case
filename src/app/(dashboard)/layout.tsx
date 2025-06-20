import React from "react"; // Added React for React.ReactNode
import { redirect } from "next/navigation"; // Needed for potential auth checks in layout
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
import { getSession } from "@/server/auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  // Minimal auth check for layout, page itself will handle detailed session logic
  const session = await getSession()

  if (!session) {
    redirect("/login");
  }


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
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-lg font-medium">Dashboard</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <Button size="sm" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Nuevo Caso
          </Button>
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
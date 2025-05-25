'use client'
import * as React from "react"
import {
  BookOpen,
  Bot,
  Scale, // Changed from Command
  LifeBuoy,
  // Map, // Removed
  // PieChart, // Removed
  Send,
  Settings2,
  PlusCircle, // Changed from SquareTerminal
  FileText, // Added for Mis Casos
} from "lucide-react"
import { authClient } from "@/lib/auth-client" // Added for session

import { NavMain } from "@/components/nav-main"
// import { NavProjects } from "@/components/nav-projects" // Commented out as project concept might change
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { ModeToggle } from "./mode-toggle"

// Updated data structure for Better Case
const getBetterCaseData = (userName?: string | null, userEmail?: string | null) => ({
  user: {
    name: userName ?? "Usuario",
    email: userEmail ?? "usuario@bettercase.com",
    avatar: "", // Use session image or empty string
  },
  navMain: [
    {
      title: "Mis Casos",
      url: "/dashboard", // Link to the dashboard (case list)
      icon: FileText,
      isActive: true, // Assuming dashboard is the main active page
    },
    {
      title: "Nuevo Caso",
      url: "/cases/new", // Link to create new case
      icon: PlusCircle,
    },
    {
      title: "Estratega IA", // Placeholder for a general strategist link if needed
      url: "#", // To be defined
      icon: Bot,
    },
    {
      title: "Base Legal (Próx.)", // Placeholder for legal database
      url: "#",
      icon: BookOpen,
      disabled: true,
    },
    {
      title: "Configuración",
      url: "#", // To be defined
      icon: Settings2,
      disabled: true,
    },
  ],
  navSecondary: [
    {
      title: "Soporte",
      url: "#",
      icon: LifeBuoy,
      disabled: true,
    },
    {
      title: "Feedback",
      url: "#",
      icon: Send,
      disabled: true,
    },
  ],
  // Projects might not be relevant, or could be areas of law, TBD
  // projects: [
  //   {
  //     name: "Derecho Civil",
  //     url: "#",
  //     icon: Briefcase,
  //   },
  //   {
  //     name: "Derecho Penal",
  //     url: "#",
  //     icon: Briefcase,
  //   },
  // ],
})

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = authClient.useSession()
  const betterCaseData = getBetterCaseData(session?.user?.name, session?.user?.email)

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/dashboard"> {/* Link to dashboard */}
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Scale className="size-4" /> {/* Better Case Icon */}
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">Better Case</span>
                  <span className="truncate text-xs">Asistente Legal IA</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={betterCaseData.navMain} />
        {/* <NavProjects projects={betterCaseData.projects} /> */} {/* Decide if NavProjects is needed */}
        <NavSecondary items={betterCaseData.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <div className="flex items-center justify-between">
        <NavUser user={betterCaseData.user} />
        <ModeToggle/>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}

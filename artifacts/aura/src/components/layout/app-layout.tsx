import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./app-sidebar";
import { ReactNode } from "react";
import { Menu } from "lucide-react";

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider style={{ "--sidebar-width": "18rem" } as React.CSSProperties}>
      <div className="flex h-screen w-full bg-background overflow-hidden relative">
        <AppSidebar />
        <div className="flex flex-col flex-1 relative z-10 w-full min-w-0">
          
          {/* Mobile Header */}
          <header className="md:hidden flex items-center justify-between p-4 border-b bg-white/80 backdrop-blur-md z-20">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="text-foreground">
                <Menu className="w-6 h-6" />
              </SidebarTrigger>
              <span className="font-display font-bold text-lg">AURA</span>
            </div>
          </header>

          <main className="flex-1 overflow-x-hidden overflow-y-auto w-full relative">
            {/* Subtle background texture for the entire app */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none z-[-1]" />
            <div className="h-full">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

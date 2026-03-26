import { Link, useLocation } from "wouter";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { 
  LayoutDashboard, 
  CheckSquare, 
  Mail, 
  Newspaper, 
  BellRing, 
  MessageSquare,
  Sparkles
} from "lucide-react";

const navItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Tasks", url: "/tasks", icon: CheckSquare },
  { title: "Mail", url: "/mail", icon: Mail },
  { title: "News", url: "/news", icon: Newspaper },
  { title: "Reminders", url: "/reminders", icon: BellRing },
  { title: "Chat", url: "/chat", icon: MessageSquare },
];

export function AppSidebar() {
  const [location] = useLocation();

  return (
    <Sidebar className="border-r-0 shadow-[1px_0_15px_rgba(0,0,0,0.03)] z-20">
      <SidebarContent className="bg-sidebar">
        {/* Brand Header */}
        <div className="p-6 pb-2">
          <div className="flex items-center gap-2 px-2 py-1">
            <div className="h-8 w-8 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-md">
              <Sparkles className="h-4 w-4" />
            </div>
            <h1 className="text-xl font-display font-extrabold tracking-tight">
              AURA
            </h1>
          </div>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className="px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground/60 mb-2">
            Overview
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="px-3 gap-1">
              {navItems.map((item) => {
                const isActive = location === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={isActive}
                      className={`
                        rounded-xl h-11 transition-all duration-200
                        ${isActive 
                          ? 'bg-secondary font-semibold text-foreground shadow-sm' 
                          : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'}
                      `}
                    >
                      <Link href={item.url} className="flex items-center gap-3 px-3">
                        <item.icon className={`h-5 w-5 ${isActive ? 'text-primary' : ''}`} />
                        <span className="text-base">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 bg-sidebar">
        <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-secondary/50 transition-colors cursor-pointer active-elevate-2">
          <img 
            src={`${import.meta.env.BASE_URL}images/avatar-default.png`} 
            alt="User" 
            className="w-10 h-10 rounded-full object-cover shadow-sm bg-secondary"
          />
          <div className="flex flex-col">
            <span className="text-sm font-semibold leading-none mb-1">Alex Doe</span>
            <span className="text-xs text-muted-foreground leading-none">alex@example.com</span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

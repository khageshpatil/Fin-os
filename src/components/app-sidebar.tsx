import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, ListChecks, Sparkles, Settings, Command } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const items = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Rules", url: "/rules", icon: ListChecks },
  { title: "Planner", url: "/planner", icon: Sparkles },
  { title: "Settings", url: "/settings", icon: Settings },
] as const;

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const pathname = useRouterState({ select: (r) => r.location.pathname });

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="px-3 py-4">
        <div className="flex items-center gap-2.5">
          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-foreground text-background">
            <Command className="h-4 w-4" strokeWidth={2.25} />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <div className="text-sm font-semibold tracking-tight">WealthOS</div>
              <div className="text-[11px] text-muted-foreground">Personal financial OS</div>
            </div>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent className="px-2">
        <SidebarGroup>
          {!collapsed && <SidebarGroupLabel className="px-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground/70">Workspace</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const active = item.url === "/" ? pathname === "/" : pathname.startsWith(item.url);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={active} className="data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground rounded-md">
                      <Link to={item.url} className="flex items-center gap-2.5">
                        <item.icon className="h-4 w-4 shrink-0" />
                        {!collapsed && <span className="text-sm">{item.title}</span>}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border p-3">
        {!collapsed ? (
          <div className="rounded-md bg-sidebar-accent/40 p-3">
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Profile</div>
            <div className="mt-1 text-sm font-medium">Personal</div>
          </div>
        ) : (
          <div className="grid h-8 w-8 place-items-center rounded-md bg-sidebar-accent/40 text-xs">P</div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}

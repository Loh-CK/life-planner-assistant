import { useCurrentUser } from '@/hooks/useCurrentUser';
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarTrigger, SidebarHeader, SidebarContent, Sidebar, SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { CalendarIcon, HomeIcon, ListIcon, DollarSignIcon, BookOpenIcon, SettingsIcon, TimerIcon, LogOutIcon, UserIcon, Sparkles, ListTodo } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import AIAdvisorPanel from "@/components/AIAdvisorPanel";
import { supabase } from "@/integrations/supabase/client";

const navItems = [
  { name: "Dashboard", icon: HomeIcon, path: "/dashboard" },
  { name: "Calendar", icon: CalendarIcon, path: "/calendar" },
  { name: "Day Planner", icon: ListTodo, path: "/day-planner" },
  { name: "Tasks", icon: ListIcon, path: "/tasks" },
  { name: "Expenses", icon: DollarSignIcon, path: "/expenses" },
  { name: "Notes", icon: BookOpenIcon, path: "/notes" },
  { name: "Pomodoro", icon: TimerIcon, path: "/pomodoro" },
  { name: "Settings", icon: SettingsIcon, path: "/settings" },
];

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(true);
  const { userId, email } = useCurrentUser();
  const [displayName, setDisplayName] = useState<string>("");

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("lifePlannerSettings") ?? "{}");
      setDisplayName(stored?.preferences?.displayName ?? "");
    } catch {
      setDisplayName("");
    }
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const activeItem = navItems.find((item) => location.pathname.startsWith(item.path));
  const pageTitle = activeItem?.name ?? "Dashboard";

  return (
    <div className="flex h-screen w-full overflow-x-hidden">
      <SidebarProvider defaultOpen={open} onOpenChange={setOpen}>
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center gap-2 p-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <Sparkles className="h-5 w-5" />
              </div>
              <h1 className="flex-1 truncate text-lg font-bold leading-tight">Life Planner</h1>
              <SidebarTrigger />
            </div>
          </SidebarHeader>
          <SidebarContent className="flex flex-col h-full">
            <SidebarMenu className="flex-1 gap-1 px-1">
              {navItems.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton
                    onClick={() => navigate(item.path)}
                    isActive={location.pathname === item.path}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>

            <div className="mt-auto border-t border-sidebar-border pt-3 pb-3 px-3">
              <div className="flex items-center gap-2 px-1 pb-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sidebar-accent shrink-0">
                  <UserIcon className="h-4 w-4 text-sidebar-accent-foreground" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-medium truncate">
                    {displayName || email || "User"}
                  </span>
                  {displayName && email && (
                    <span className="text-xs text-sidebar-foreground/60 truncate">{email}</span>
                  )}
                </div>
              </div>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton onClick={handleSignOut}>
                    <LogOutIcon className="h-4 w-4" />
                    <span>Sign Out</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </div>
          </SidebarContent>
        </Sidebar>
        <SidebarInset className="flex-1">
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between gap-4 border-b bg-card/60 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-card/60">
              <div className="flex items-center gap-3">
                <SidebarTrigger className="md:hidden" />
                <h2 className="text-lg font-semibold">{pageTitle}</h2>
              </div>
              <div className="text-sm text-muted-foreground">
                {new Date().toLocaleDateString(undefined, {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </div>
            </div>
            <div className="relative flex-1 overflow-auto p-4">{children}</div>
          </div>
        </SidebarInset>
        <div className="w-96 min-w-[20rem] max-w-[40rem] resize-x overflow-auto bg-sidebar p-4 hidden md:block">
          <AIAdvisorPanel />
        </div>
      </SidebarProvider>
    </div>
  );
};
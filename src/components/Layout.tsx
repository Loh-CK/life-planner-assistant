import { useCurrentUser } from '@/hooks/useCurrentUser';
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarTrigger, SidebarHeader, SidebarContent, Sidebar, SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { CalendarIcon, HomeIcon, ListIcon, DollarSignIcon, BookOpenIcon, SettingsIcon, TimerIcon, LogOutIcon } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import AIAdvisorPanel from "@/components/AIAdvisorPanel";
import { supabase } from "@/integrations/supabase/client";

const navItems = [
  { name: "Dashboard", icon: HomeIcon, path: "/dashboard" },
  { name: "Calendar", icon: CalendarIcon, path: "/calendar" },
  { name: "Day Planner", icon: ListIcon, path: "/day-planner" },
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

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <div className="flex h-screen w-full overflow-x-hidden">
      <SidebarProvider defaultOpen={open} onOpenChange={setOpen}>
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center justify-between p-4">
              <h1 className="text-xl font-bold">Life Planner Assistant</h1>
              <SidebarTrigger />
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
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
              <SidebarMenuItem>
                <SidebarMenuButton onClick={handleSignOut}>
                  <LogOutIcon className="h-4 w-4" />
                  <span>Sign Out</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
        <SidebarInset className="flex-1">
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center">
                <h2 className="text-lg font-semibold">{location.pathname.split("/")[1] || "Dashboard"}</h2>
              </div>
              <div>{new Date().toLocaleDateString()}</div>
            </div>
            <div className="flex-1 overflow-auto p-4">{children}</div>
          </div>
        </SidebarInset>
        <div className="w-80 bg-sidebar p-4 hidden md:block">
          <AIAdvisorPanel />
        </div>
      </SidebarProvider>
    </div>
  );
};
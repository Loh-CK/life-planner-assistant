import { Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarTrigger, SidebarInset, SidebarFooter, SidebarSeparator, SidebarProvider } from "@/components/ui/sidebar";
import { CalendarIcon, HomeIcon, ListIcon, DollarSignIcon, BookOpenIcon, SettingsIcon, HelpCircleIcon, TimerIcon } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";

const navItems = [
  { name: "Dashboard", icon: HomeIcon, path: "/dashboard" },
  { name: "Calendar", icon: CalendarIcon, path: "/calendar" },
  { name: "Day Planner", icon: ListIcon, path: "/day-planner" },
  { name: "Tasks", icon: ListIcon, path: "/tasks" },
  { name: "Expenses", icon: DollarSignIcon, path: "/expenses" },
  { name: "Notes", icon: BookOpenIcon, path: "/notes" },
  { name: "Pomodoro", icon: TimerIcon, path: "/pomodoro" },
  { name: "Settings", icon: SettingsIcon, path: "/settings" },
  { name: "Help", icon: HelpCircleIcon, path: "/help" },
];

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(true);

  return (
    <div className="flex h-screen">
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
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
        <SidebarInset>
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
        <div className="w-64 bg-sidebar p-4 hidden md:block">
          <h3 className="text-sm font-medium mb-2">AI Advisor</h3>
          <div className="h-full bg-card rounded-md p-4">Placeholder</div>
        </div>
      </SidebarProvider>
    </div>
  );
};

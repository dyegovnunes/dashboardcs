import { useState } from "react";
import {
  LayoutDashboard,
  ShieldAlert,
  Headphones,
  Route,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navItems = [
  { id: "overview", label: "Visão Geral", icon: LayoutDashboard },
  { id: "retention", label: "Retenção", icon: ShieldAlert },
  { id: "support", label: "Atendimento", icon: Headphones },
  { id: "journey", label: "Jornada", icon: Route },
  { id: "nps", label: "NPS", icon: BarChart3 },
];

const SidebarNav = ({ activeTab, onTabChange }: SidebarNavProps) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "h-screen sticky top-0 bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300",
        collapsed ? "w-16" : "w-56"
      )}>

      <div className="p-4 flex items-center justify-between border-b border-sidebar-border">
        {!collapsed && (
          <div>
            <h1 className="text-sm font-bold text-sidebar-foreground tracking-tight">Sucesso do Cliente +A</h1>
            <p className="text-[10px] text-sidebar-foreground/50 mt-0.5">OPM</p>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-md hover:bg-sidebar-accent text-sidebar-foreground/60 hover:text-sidebar-foreground transition-colors">
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      <nav className="flex-1 p-2 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
              activeTab === item.id
                ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
            )}>
            <item.icon className="h-4 w-4 flex-shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </button>
        ))}
      </nav>

      <div className="p-3 border-t border-sidebar-border">
        {!collapsed && (
          <div className="flex items-center gap-2 px-2">
            <User className="h-4 w-4 text-sidebar-foreground/60 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-medium text-sidebar-foreground truncate">Dyego Nunes</p>
              <p className="text-[10px] text-sidebar-foreground/50">Gerente CS</p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default SidebarNav;
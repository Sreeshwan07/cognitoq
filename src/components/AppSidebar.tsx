import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Database,
  FileText,
  BarChart3,
  Settings,
  BookOpen,
  Zap,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Upload,
  FolderOpen,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import ThemeToggle from "./ThemeToggle";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/subjects", icon: GraduationCap, label: "Subjects" },
  { to: "/question-bank", icon: Database, label: "Question Bank" },
  { to: "/generate", icon: Zap, label: "Generate Paper" },
  { to: "/upload", icon: Upload, label: "Upload Paper" },
  { to: "/saved", icon: FolderOpen, label: "Saved Papers" },
  { to: "/blueprints", icon: BookOpen, label: "Blueprints" },
  { to: "/analytics", icon: BarChart3, label: "Analytics" },
  { to: "/papers", icon: FileText, label: "Past Papers" },
  { to: "/pyq", icon: BookOpen, label: "PYQ Papers" },
  { to: "/settings", icon: Settings, label: "Settings" },
];

export default function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <aside
      className={cn(
        "h-screen sticky top-0 flex flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-all duration-300",
        collapsed ? "w-[68px]" : "w-[240px]"
      )}
    >
      <div className="flex items-center gap-3 px-4 h-16 border-b border-sidebar-border">
        <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center flex-shrink-0">
          <Zap className="w-4 h-4 text-accent-foreground" />
        </div>
        {!collapsed && (
          <span className="font-display text-lg tracking-tight text-sidebar-foreground">
            CognitoQ
          </span>
        )}
      </div>

      <nav className="flex-1 py-4 space-y-1 px-2">
        {navItems.map((item) => {
          const isActive =
            location.pathname === item.to ||
            (item.to !== "/" && location.pathname.startsWith(item.to));
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-primary"
                  : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
              )}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      <div className="flex items-center justify-between px-2 h-12 border-t border-sidebar-border">
        <ThemeToggle />
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-center w-9 h-9 text-sidebar-foreground/50 hover:text-sidebar-foreground transition-colors"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </aside>
  );
}

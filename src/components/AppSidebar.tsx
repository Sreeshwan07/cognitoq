import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Database,
  Settings,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Upload,
  FolderOpen,
  LogOut,
  Zap,
  Shield,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import ThemeToggle from "./ThemeToggle";
import cognitoQLogo from "@/assets/cognitoq-logo.jpeg";
import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/subjects", icon: GraduationCap, label: "Subjects" },
  { to: "/question-bank", icon: Database, label: "Question Bank" },
  { to: "/generate", icon: Zap, label: "Generate Paper" },
  { to: "/upload", icon: Upload, label: "Upload Paper" },
  { to: "/saved", icon: FolderOpen, label: "Saved Papers" },
  { to: "/pyq", icon: BookOpen, label: "PYQ Papers" },
  { to: "/settings", icon: Settings, label: "Settings" },
];

const adminItems = [
  { to: "/admin", icon: Shield, label: "Admin Panel" },
];

export default function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { profile, role, signOut } = useAuth();

  return (
    <aside
      className={cn(
        "h-screen sticky top-0 flex flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-all duration-300",
        collapsed ? "w-[68px]" : "w-[240px]"
      )}
    >
      <div className="flex items-center gap-3 px-3 h-16 border-b border-sidebar-border">
        <img
          src={cognitoQLogo}
          alt="CognitoQ"
          className="w-9 h-9 rounded-lg object-contain flex-shrink-0 bg-white"
        />
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

        {role === "admin" && (
          <>
            {!collapsed && (
              <div className="pt-3 pb-1 px-3">
                <span className="text-[10px] uppercase tracking-wider text-sidebar-foreground/40 font-medium">Admin</span>
              </div>
            )}
            {adminItems.map((item) => {
              const isActive = location.pathname.startsWith(item.to);
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
          </>
        )}
      </nav>

      {/* User info */}
      {!collapsed && profile && (
        <div className="px-3 py-2 border-t border-sidebar-border">
          <div className="flex items-center gap-2">
            <p className="text-xs font-medium text-sidebar-foreground truncate">{profile.full_name || profile.email}</p>
            {role === "admin" && (
              <Badge variant="outline" className="text-[9px] px-1.5 py-0 border-sidebar-primary/40 text-sidebar-primary">
                {profile.email?.toLowerCase() === "mdr.gemini@gmail.com" ? "SUPER ADMIN" : "ADMIN"}
              </Badge>
            )}
          </div>
          <p className="text-[10px] text-sidebar-foreground/50 capitalize">{role}</p>
        </div>
      )}

      <div className="flex items-center justify-between px-2 h-12 border-t border-sidebar-border">
        <ThemeToggle />
        <div className="flex items-center gap-1">
          <button
            onClick={signOut}
            className="flex items-center justify-center w-9 h-9 text-sidebar-foreground/50 hover:text-destructive transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex items-center justify-center w-9 h-9 text-sidebar-foreground/50 hover:text-sidebar-foreground transition-colors"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </aside>
  );
}

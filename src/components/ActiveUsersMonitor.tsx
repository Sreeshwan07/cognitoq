import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Activity, Wifi, WifiOff, Clock, RefreshCw, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ActiveUser {
  id: string;
  full_name: string;
  email: string;
  last_active_at: string | null;
  current_page: string | null;
  status: string;
}

type PresenceStatus = "online" | "idle" | "offline";

function getPresenceStatus(lastActive: string | null): PresenceStatus {
  if (!lastActive) return "offline";
  const diff = Date.now() - new Date(lastActive).getTime();
  if (diff < 60_000) return "online"; // < 1 min
  if (diff < 5 * 60_000) return "idle"; // < 5 min
  return "offline";
}

function formatTime(ts: string | null): string {
  if (!ts) return "Never";
  const diff = Date.now() - new Date(ts).getTime();
  if (diff < 60000) return "Just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return new Date(ts).toLocaleDateString();
}

const statusConfig: Record<PresenceStatus, { dot: string; label: string; badgeClass: string; icon: typeof Wifi }> = {
  online: { dot: "bg-success animate-pulse", label: "Online", badgeClass: "bg-success/10 text-success border-success/20", icon: Wifi },
  idle: { dot: "bg-warning", label: "Idle", badgeClass: "bg-warning/10 text-warning border-warning/20", icon: Clock },
  offline: { dot: "bg-muted-foreground/40", label: "Offline", badgeClass: "bg-muted text-muted-foreground border-border", icon: WifiOff },
};

export default function ActiveUsersMonitor() {
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);
  const [loading, setLoading] = useState(true);

  const loadActiveUsers = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("profiles")
      .select("id, full_name, email, last_active_at, current_page, status")
      .eq("status", "approved")
      .not("last_active_at", "is", null)
      .order("last_active_at", { ascending: false })
      .limit(30);

    setActiveUsers((data as ActiveUser[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    loadActiveUsers();
    const interval = setInterval(loadActiveUsers, 15000); // refresh every 15s
    return () => clearInterval(interval);
  }, []);

  const onlineCount = activeUsers.filter(u => getPresenceStatus(u.last_active_at) === "online").length;
  const idleCount = activeUsers.filter(u => getPresenceStatus(u.last_active_at) === "idle").length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="elevated-card rounded-xl overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-muted/30">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Active Users (Live)</h3>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="text-xs font-medium text-foreground">{onlineCount} online</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-warning" />
            <span className="text-xs text-muted-foreground">{idleCount} idle</span>
          </div>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={loadActiveUsers} disabled={loading}>
            <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin")} />
          </Button>
        </div>
      </div>

      {/* User List */}
      <div className="divide-y divide-border max-h-[400px] overflow-y-auto">
        {activeUsers.length === 0 ? (
          <div className="px-5 py-8 text-center text-sm text-muted-foreground">No recent activity</div>
        ) : (
          activeUsers.map((u) => {
            const presence = getPresenceStatus(u.last_active_at);
            const config = statusConfig[presence];
            const Icon = config.icon;

            return (
              <div key={u.id} className="flex items-center justify-between px-5 py-3 hover:bg-muted/20 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  {/* Avatar with status dot */}
                  <div className="relative flex-shrink-0">
                    <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-xs font-semibold text-foreground">
                      {u.full_name?.charAt(0)?.toUpperCase() || "?"}
                    </div>
                    <span className={cn("absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background", config.dot)} />
                  </div>

                  {/* Info */}
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{u.full_name || "Unknown"}</p>
                    <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {/* Current page */}
                  {u.current_page && presence !== "offline" && (
                    <Badge variant="outline" className="text-[10px] gap-1 hidden sm:flex">
                      <Monitor className="w-3 h-3" />
                      {u.current_page}
                    </Badge>
                  )}

                  {/* Status badge */}
                  <Badge className={cn("text-[10px] gap-1", config.badgeClass)}>
                    <Icon className="w-3 h-3" />
                    {presence === "online" ? "Online" : formatTime(u.last_active_at)}
                  </Badge>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="px-5 py-2 border-t border-border bg-muted/20 text-center">
        <p className="text-[10px] text-muted-foreground">
          Auto-refreshes every 15s • 🟢 Online (&lt;1min) • 🟡 Idle (&lt;5min) • ⚫ Offline
        </p>
      </div>
    </motion.div>
  );
}

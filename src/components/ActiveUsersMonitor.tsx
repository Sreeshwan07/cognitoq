import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Activity, Wifi, WifiOff, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

interface ActiveUser {
  id: string;
  full_name: string;
  email: string;
  last_active_at: string | null;
  status: string;
}

export default function ActiveUsersMonitor() {
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);
  const [loading, setLoading] = useState(true);

  const loadActiveUsers = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("profiles")
      .select("id, full_name, email, last_active_at, status")
      .eq("status", "approved")
      .not("last_active_at", "is", null)
      .order("last_active_at", { ascending: false })
      .limit(20);

    setActiveUsers(data || []);
    setLoading(false);
  };

  useEffect(() => {
    loadActiveUsers();
    const interval = setInterval(loadActiveUsers, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const isOnline = (lastActive: string | null) => {
    if (!lastActive) return false;
    const diff = Date.now() - new Date(lastActive).getTime();
    return diff < 5 * 60 * 1000; // active in last 5 min
  };

  const isRecent = (lastActive: string | null) => {
    if (!lastActive) return false;
    const diff = Date.now() - new Date(lastActive).getTime();
    return diff < 30 * 60 * 1000; // active in last 30 min
  };

  const formatTime = (ts: string | null) => {
    if (!ts) return "Never";
    const diff = Date.now() - new Date(ts).getTime();
    if (diff < 60000) return "Just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return new Date(ts).toLocaleDateString();
  };

  const onlineCount = activeUsers.filter((u) => isOnline(u.last_active_at)).length;
  const recentCount = activeUsers.filter((u) => isRecent(u.last_active_at) && !isOnline(u.last_active_at)).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="elevated-card rounded-xl overflow-hidden"
    >
      <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-muted/30">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Live Activity Monitor</h3>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="text-xs text-muted-foreground">{onlineCount} online</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-warning" />
            <span className="text-xs text-muted-foreground">{recentCount} recent</span>
          </div>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={loadActiveUsers} disabled={loading}>
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      <div className="divide-y divide-border max-h-[320px] overflow-y-auto">
        {activeUsers.length === 0 ? (
          <div className="px-5 py-8 text-center text-sm text-muted-foreground">No recent activity</div>
        ) : (
          activeUsers.map((u) => {
            const online = isOnline(u.last_active_at);
            const recent = isRecent(u.last_active_at);
            return (
              <div key={u.id} className="flex items-center justify-between px-5 py-2.5 hover:bg-muted/20 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium text-foreground">
                      {u.full_name?.charAt(0)?.toUpperCase() || "?"}
                    </div>
                    {online && (
                      <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-success border-2 border-background" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{u.full_name || "Unknown"}</p>
                    <p className="text-xs text-muted-foreground">{u.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {online ? (
                    <Badge className="bg-success/10 text-success border-success/20 text-[10px]">
                      <Wifi className="w-3 h-3 mr-1" /> Online
                    </Badge>
                  ) : recent ? (
                    <Badge className="bg-warning/10 text-warning border-warning/20 text-[10px]">
                      <WifiOff className="w-3 h-3 mr-1" /> {formatTime(u.last_active_at)}
                    </Badge>
                  ) : (
                    <span className="text-[10px] text-muted-foreground">{formatTime(u.last_active_at)}</span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </motion.div>
  );
}

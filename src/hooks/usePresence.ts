import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const HEARTBEAT_INTERVAL = 30_000; // 30 seconds

const pageNames: Record<string, string> = {
  "/": "Dashboard",
  "/dashboard": "Dashboard",
  "/generate": "Generate Paper",
  "/question-bank": "Question Bank",
  "/saved-papers": "Saved Papers",
  "/settings": "Settings",
  "/admin": "Admin Panel",
  "/pyq": "Previous Year Papers",
  "/subjects": "Subject Library",
  "/generate-from-notes": "Generate from Notes",
};

function getPageName(pathname: string): string {
  return pageNames[pathname] || pathname;
}

export function usePresence() {
  const location = useLocation();
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    const sendHeartbeat = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from("profiles")
        .update({
          last_active_at: new Date().toISOString(),
          current_page: getPageName(location.pathname),
        } as any)
        .eq("id", user.id);
    };

    // Send immediately on page change
    sendHeartbeat();

    // Set up interval
    intervalRef.current = setInterval(sendHeartbeat, HEARTBEAT_INTERVAL);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [location.pathname]);

  // Clear presence on tab close
  useEffect(() => {
    const handleBeforeUnload = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      // Use sendBeacon for reliability on tab close
      const url = `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/profiles?id=eq.${user.id}`;
      const body = JSON.stringify({ current_page: null });
      navigator.sendBeacon?.(url); // Best-effort
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);
}

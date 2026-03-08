import { Outlet } from "react-router-dom";
import AppSidebar from "./AppSidebar";
import { usePresence } from "@/hooks/usePresence";

export default function AppLayout() {
  usePresence();

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}

import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Loader2, ShieldAlert, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, profile, loading, signOut } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground text-sm">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Pending approval
  if (profile?.status === "pending") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <div className="elevated-card rounded-2xl p-8 max-w-md text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-warning/10 flex items-center justify-center mx-auto">
            <Clock className="w-8 h-8 text-warning" />
          </div>
          <h2 className="text-xl font-display text-foreground">Approval Pending</h2>
          <p className="text-muted-foreground text-sm">
            Your faculty account is awaiting admin approval. You'll receive access once verified.
          </p>
          <Button variant="outline" onClick={signOut} className="mt-4">
            Sign Out
          </Button>
        </div>
      </div>
    );
  }

  // Rejected
  if (profile?.status === "rejected") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <div className="elevated-card rounded-2xl p-8 max-w-md text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8 text-destructive" />
          </div>
          <h2 className="text-xl font-display text-foreground">Access Denied</h2>
          <p className="text-muted-foreground text-sm">
            Your account has not been approved. Contact your institution's admin for assistance.
          </p>
          <Button variant="outline" onClick={signOut} className="mt-4">
            Sign Out
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

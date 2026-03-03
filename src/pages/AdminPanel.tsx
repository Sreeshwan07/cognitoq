import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  CheckCircle2,
  XCircle,
  Search,
  Users,
  ShieldCheck,
  Clock,
  Shield,
  Loader2,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const SUPER_ADMIN_EMAIL = "mdr.gemini@gmail.com";

interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  status: string;
  created_at: string;
  approved_by: string | null;
  approved_at: string | null;
  role: string;
}

export default function AdminPanel() {
  const { role } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (role === "admin") loadUsers();
  }, [role]);

  if (role !== "admin") {
    return <Navigate to="/" replace />;
  }

  const loadUsers = async () => {
    setLoading(true);
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, email, status, created_at, approved_by, approved_at")
      .order("created_at", { ascending: false });

    const { data: roles } = await supabase
      .from("user_roles")
      .select("user_id, role");

    const roleMap = new Map<string, string>();
    roles?.forEach((r: any) => roleMap.set(r.user_id, r.role));

    const merged = (profiles || []).map((p: any) => ({
      ...p,
      role: roleMap.get(p.id) || "faculty",
    }));

    setUsers(merged);
    setLoading(false);
  };

  const updateUserStatus = async (userId: string, status: string) => {
    setActionLoading(userId);
    const { data: { user: currentUser } } = await supabase.auth.getUser();

    await supabase.from("profiles").update({
      status,
      approved_by: currentUser?.email || null,
      approved_at: status === "approved" ? new Date().toISOString() : null,
    }).eq("id", userId);

    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId
          ? { ...u, status, approved_by: currentUser?.email || null, approved_at: status === "approved" ? new Date().toISOString() : null }
          : u
      )
    );
    setActionLoading(null);
    toast({ title: `User ${status === "approved" ? "Approved" : "Rejected"}` });
  };

  const promoteToAdmin = async (userId: string) => {
    setActionLoading(userId);
    await supabase.from("user_roles").update({ role: "admin" }).eq("user_id", userId);
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: "admin" } : u)));
    setActionLoading(null);
    toast({ title: "User promoted to Admin" });
  };

  const demoteToFaculty = async (userId: string) => {
    setActionLoading(userId);
    await supabase.from("user_roles").update({ role: "faculty" }).eq("user_id", userId);
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: "faculty" } : u)));
    setActionLoading(null);
    toast({ title: "User demoted to Faculty" });
  };

  const filtered = users.filter((u) => {
    const matchesSearch =
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.full_name.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "all" || u.status === filter;
    return matchesSearch && matchesFilter;
  });

  const counts = {
    all: users.length,
    pending: users.filter((u) => u.status === "pending").length,
    approved: users.filter((u) => u.status === "approved").length,
    rejected: users.filter((u) => u.status === "rejected").length,
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-success/10 text-success border-success/20">Approved</Badge>;
      case "rejected":
        return <Badge className="bg-destructive/10 text-destructive border-destructive/20">Rejected</Badge>;
      default:
        return <Badge className="bg-warning/10 text-warning border-warning/20">Pending</Badge>;
    }
  };

  const roleBadge = (userRole: string, email: string) => {
    if (email.toLowerCase() === SUPER_ADMIN_EMAIL) {
      return <Badge className="bg-primary/10 text-primary border-primary/20">Super Admin</Badge>;
    }
    if (userRole === "admin") {
      return <Badge className="bg-accent/10 text-accent border-accent/20">Admin</Badge>;
    }
    return <Badge variant="secondary">Faculty</Badge>;
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="space-y-1">
        <div className="flex items-center gap-3">
          <Shield className="w-7 h-7 text-primary" />
          <h1 className="text-3xl font-display text-foreground">Admin Panel</h1>
        </div>
        <p className="text-muted-foreground">Manage faculty accounts and system access.</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Total Users", count: counts.all, icon: Users, color: "text-primary" },
          { label: "Pending", count: counts.pending, icon: Clock, color: "text-warning" },
          { label: "Approved", count: counts.approved, icon: CheckCircle2, color: "text-success" },
          { label: "Rejected", count: counts.rejected, icon: XCircle, color: "text-destructive" },
        ].map((s) => (
          <div key={s.label} className="elevated-card rounded-xl p-4 flex items-center gap-3">
            <s.icon className={`w-5 h-5 ${s.color}`} />
            <div>
              <p className="text-2xl font-display text-foreground">{s.count}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Users ({counts.all})</SelectItem>
            <SelectItem value="pending">Pending ({counts.pending})</SelectItem>
            <SelectItem value="approved">Approved ({counts.approved})</SelectItem>
            <SelectItem value="rejected">Rejected ({counts.rejected})</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Users Table */}
      <div className="elevated-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">User</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Role</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Status</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Joined</th>
                <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto text-muted-foreground" />
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-sm text-muted-foreground">
                    No users found.
                  </td>
                </tr>
              ) : (
                filtered.map((u) => {
                  const isSuperAdmin = u.email.toLowerCase() === SUPER_ADMIN_EMAIL;
                  const isLoading = actionLoading === u.id;
                  return (
                    <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-5 py-3">
                        <p className="text-sm font-medium text-foreground">{u.full_name || "—"}</p>
                        <p className="text-xs text-muted-foreground">{u.email}</p>
                      </td>
                      <td className="px-5 py-3">{roleBadge(u.role, u.email)}</td>
                      <td className="px-5 py-3">{statusBadge(u.status)}</td>
                      <td className="px-5 py-3 text-xs text-muted-foreground">
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-3">
                        {isSuperAdmin ? (
                          <span className="text-xs text-muted-foreground flex items-center justify-end gap-1">
                            <ShieldCheck className="w-3.5 h-3.5" /> Protected
                          </span>
                        ) : (
                          <div className="flex items-center justify-end gap-1.5">
                            {u.status === "pending" && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 text-xs text-success border-success/30 hover:bg-success/10"
                                  disabled={isLoading}
                                  onClick={() => updateUserStatus(u.id, "approved")}
                                >
                                  {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3 mr-1" />}
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 text-xs text-destructive border-destructive/30 hover:bg-destructive/10"
                                  disabled={isLoading}
                                  onClick={() => updateUserStatus(u.id, "rejected")}
                                >
                                  <XCircle className="w-3 h-3 mr-1" /> Reject
                                </Button>
                              </>
                            )}
                            {u.status === "approved" && u.role === "faculty" && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-xs"
                                disabled={isLoading}
                                onClick={() => promoteToAdmin(u.id)}
                              >
                                Promote
                              </Button>
                            )}
                            {u.status === "approved" && u.role === "admin" && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-xs"
                                disabled={isLoading}
                                onClick={() => demoteToFaculty(u.id)}
                              >
                                Demote
                              </Button>
                            )}
                            {u.status === "rejected" && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-xs text-success border-success/30 hover:bg-success/10"
                                disabled={isLoading}
                                onClick={() => updateUserStatus(u.id, "approved")}
                              >
                                Approve
                              </Button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

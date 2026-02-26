import { useState, useEffect } from "react";
import {
  FileText, Search, Trash2, Copy, Edit3, Download, Calendar,
  GraduationCap, Filter, Loader2, MoreVertical, RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

interface Paper {
  id: string;
  title: string;
  department: string;
  subject: string;
  max_marks: number;
  total_questions: number;
  paper_id_code: string;
  is_draft: boolean;
  version: number;
  created_at: string;
  exam_type: string | null;
}

export default function SavedPapers() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [papers, setPapers] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("all");

  const fetchPapers = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("papers")
      .select("id, title, department, subject, max_marks, total_questions, paper_id_code, is_draft, version, created_at, exam_type")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (!error && data) setPapers(data);
    setLoading(false);
  };

  useEffect(() => { fetchPapers(); }, [user]);

  const filtered = papers.filter(p => {
    if (search && !p.title.toLowerCase().includes(search.toLowerCase()) && !p.subject.toLowerCase().includes(search.toLowerCase())) return false;
    if (deptFilter !== "all" && p.department !== deptFilter) return false;
    return true;
  });

  const deletePaper = async (id: string) => {
    await supabase.from("papers").delete().eq("id", id);
    setPapers(prev => prev.filter(p => p.id !== id));
    toast({ title: "Paper deleted" });
  };

  const duplicatePaper = async (paper: Paper) => {
    const { data: original } = await supabase.from("papers").select("*").eq("id", paper.id).single();
    if (!original || !user) return;

    const { id, created_at, updated_at, paper_id_code, ...rest } = original as any;
    await supabase.from("papers").insert({
      ...rest,
      user_id: user.id,
      title: `${rest.title} (Copy)`,
      parent_id: paper.id,
    });
    fetchPapers();
    toast({ title: "Paper duplicated" });
  };

  const departments = [...new Set(papers.map(p => p.department))];

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-display text-foreground">Saved Papers</h1>
        <p className="text-muted-foreground mt-1">Manage your generated and saved question papers.</p>
      </motion.div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search papers..."
            className="pl-10"
          />
        </div>
        <Select value={deptFilter} onValueChange={setDeptFilter}>
          <SelectTrigger className="w-[180px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            {departments.map(d => <SelectItem key={d} value={d}>{d.toUpperCase()}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={fetchPapers}>
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {/* Papers List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="elevated-card rounded-xl p-12 text-center">
          <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
          <h3 className="text-lg font-display text-foreground">No papers found</h3>
          <p className="text-muted-foreground text-sm mt-1">Generate your first paper to see it here.</p>
          <Button className="mt-4" onClick={() => navigate("/generate")}>Generate Paper</Button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((paper, i) => (
            <motion.div
              key={paper.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="elevated-card rounded-xl p-4 flex items-center gap-4 hover:shadow-lg transition-shadow"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/5 flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5 text-primary" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-medium text-foreground truncate">{paper.title}</h3>
                  {paper.is_draft && <Badge variant="secondary">Draft</Badge>}
                  <Badge variant="outline">v{paper.version}</Badge>
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><GraduationCap className="w-3 h-3" /> {paper.department.toUpperCase()}</span>
                  <span>{paper.subject}</span>
                  <span>{paper.max_marks} marks</span>
                  <span>{paper.total_questions} Qs</span>
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(paper.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              <code className="text-xs text-muted-foreground hidden md:block">{paper.paper_id_code}</code>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => duplicatePaper(paper)}>
                    <Copy className="w-4 h-4 mr-2" /> Duplicate
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => deletePaper(paper.id)} className="text-destructive">
                    <Trash2 className="w-4 h-4 mr-2" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

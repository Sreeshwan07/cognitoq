import { useState, useEffect, useMemo } from "react";
import {
  FileText, Download, Copy, Trash2, Calendar, Search, Filter, FolderOpen, RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { exportAsTxt, exportAsPdf } from "@/lib/exportUtils";

interface SavedPaper {
  id: string;
  title: string;
  subject: string;
  department: string;
  max_marks: number;
  total_questions: number;
  created_at: string;
  paper_id_code: string;
  is_draft: boolean;
  version: number;
  questions: any[];
  paper_data: any;
}

export default function SavedPapers() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [papers, setPapers] = useState<SavedPaper[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterDept, setFilterDept] = useState("all");
  const [filterSubject, setFilterSubject] = useState("all");

  useEffect(() => {
    loadPapers();
  }, []);

  const loadPapers = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      // Show demo data if not logged in
      setPapers([]);
      setLoading(false);
      return;
    }
    const { data, error } = await supabase
      .from("papers")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (data) setPapers(data as any);
    setLoading(false);
  };

  const deletePaper = async (id: string) => {
    const { error } = await supabase.from("papers").delete().eq("id", id);
    if (!error) {
      setPapers(prev => prev.filter(p => p.id !== id));
      toast({ title: "Paper Deleted" });
    }
  };

  const duplicatePaper = async (paper: SavedPaper) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from("papers").insert({
      user_id: user.id,
      title: `${paper.title} (Copy)`,
      subject: paper.subject,
      department: paper.department,
      max_marks: paper.max_marks,
      total_questions: paper.total_questions,
      questions: paper.questions as any,
      paper_data: paper.paper_data as any,
      is_draft: true,
      parent_id: paper.id,
    });
    if (!error) {
      loadPapers();
      toast({ title: "Paper Duplicated" });
    }
  };

  const generateSimilar = (paper: SavedPaper) => {
    // Store the paper config + excluded question texts in sessionStorage
    const excludedTexts = Array.isArray(paper.questions)
      ? paper.questions.map((q: any) => q.text?.toLowerCase?.().trim()).filter(Boolean)
      : [];
    const similarConfig = {
      paperData: paper.paper_data,
      subject: paper.subject,
      department: paper.department,
      excludedTexts,
    };
    sessionStorage.setItem("cognitoq_similar_config", JSON.stringify(similarConfig));
    // Navigate to generate page with similar flag
    navigate("/generate?similar=true");
    toast({ title: "🔄 Loading similar paper config...", description: "Same structure, different questions." });
  };

  const downloadPaper = (paper: SavedPaper, format: "pdf" | "txt") => {
    const questions = Array.isArray(paper.questions) ? paper.questions.map((q: any, i: number) => ({
      questionNumber: i + 1,
      text: q.text || `Question ${i + 1}`,
      marks: q.marks || 2,
      unit: q.unit || "General",
      difficulty: q.difficulty || "Medium",
    })) : [];

    const meta = {
      subjectName: paper.subject,
      maxMarks: paper.max_marks,
      collegeName: (paper.paper_data as any)?.collegeName,
      examType: (paper.paper_data as any)?.examType,
      duration: (paper.paper_data as any)?.duration,
      paperId: paper.paper_id_code,
      watermark: true,
    };

    if (format === "pdf") exportAsPdf(questions, meta);
    else exportAsTxt(questions, meta);
  };

  const subjects = useMemo(() => {
    const s = new Set(papers.map(p => p.subject));
    return Array.from(s);
  }, [papers]);

  const departments = useMemo(() => {
    const d = new Set(papers.map(p => p.department));
    return Array.from(d);
  }, [papers]);

  const filtered = useMemo(() => {
    return papers.filter(p => {
      if (search && !p.title.toLowerCase().includes(search.toLowerCase()) && !p.subject.toLowerCase().includes(search.toLowerCase())) return false;
      if (filterDept !== "all" && p.department !== filterDept) return false;
      if (filterSubject !== "all" && p.subject !== filterSubject) return false;
      return true;
    });
  }, [papers, search, filterDept, filterSubject]);

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-display text-foreground">Saved Papers</h1>
        <p className="text-muted-foreground mt-1">Manage all your generated and uploaded papers.</p>
      </motion.div>

      {/* Filters */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search papers..." className="pl-9" />
        </div>
        <Select value={filterDept} onValueChange={setFilterDept}>
          <SelectTrigger className="w-[160px]"><Filter className="w-3.5 h-3.5 mr-1" /><SelectValue placeholder="Department" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            {departments.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterSubject} onValueChange={setFilterSubject}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="Subject" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Subjects</SelectItem>
            {subjects.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </motion.div>

      {/* Papers List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="elevated-card rounded-xl p-5 animate-pulse">
              <div className="h-4 bg-muted rounded w-1/3 mb-2" />
              <div className="h-3 bg-muted rounded w-1/4" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="elevated-card rounded-xl p-12 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
            <FolderOpen className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="font-display text-xl text-foreground mb-2">No Papers Found</h3>
          <p className="text-sm text-muted-foreground">Generate or upload a paper to see it here.</p>
        </motion.div>
      ) : (
        <div className="grid gap-3">
          <AnimatePresence>
            {filtered.map((paper, i) => (
              <motion.div
                key={paper.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: i * 0.03 }}
                className="elevated-card rounded-xl p-5 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-primary/5 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-medium text-foreground truncate">{paper.title}</h3>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <Badge variant="secondary" className="text-xs">{paper.subject}</Badge>
                      <Badge variant="outline" className="text-xs">{paper.department}</Badge>
                      {paper.is_draft && <Badge variant="secondary" className="text-[10px]">Draft</Badge>}
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {new Date(paper.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="hidden sm:flex gap-3 text-xs text-muted-foreground">
                    <span>{paper.total_questions} Qs</span>
                    <span>{paper.max_marks}M</span>
                    <span>V{paper.version}</span>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={() => downloadPaper(paper, "pdf")} title="Download PDF">
                      <Download className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-accent" onClick={() => generateSimilar(paper)} title="Generate Similar Paper">
                      <RefreshCw className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={() => duplicatePaper(paper)} title="Duplicate">
                      <Copy className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive/70 hover:text-destructive" onClick={() => deletePaper(paper.id)} title="Delete">
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <div className="text-xs text-muted-foreground text-center">
        {filtered.length} paper{filtered.length !== 1 ? "s" : ""} found
      </div>
    </div>
  );
}

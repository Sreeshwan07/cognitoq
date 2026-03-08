import { useState, useEffect, useCallback } from "react";
import { Upload, Search, Plus, Trash2, Tag, BookOpen, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { subjects, branches } from "@/data/subjects";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { normalizeSubject } from "@/lib/saveQuestions";
import { toast } from "sonner";

const difficultyColor: Record<string, string> = {
  Easy: "bg-success/10 text-success border-success/20",
  Medium: "bg-warning/10 text-warning border-warning/20",
  Hard: "bg-destructive/10 text-destructive border-destructive/20",
};

const PAGE_SIZE = 20;

interface DBQuestion {
  id: string;
  text: string;
  subject: string;
  subject_code: string | null;
  unit: string;
  difficulty: string;
  marks: number;
  type: string;
  bloom: string | null;
  source: string;
  created_at: string;
}

export default function QuestionBank() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("");
  const [branchFilter, setBranchFilter] = useState("all");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [dragActive, setDragActive] = useState(false);
  const [questions, setQuestions] = useState<DBQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);

  const filteredSubjects = branchFilter === "all"
    ? subjects
    : subjects.filter((s) => s.branch === branchFilter || s.branch === "core");

  // Build subject match names for case-insensitive matching
  const getSubjectMatchNames = useCallback((subjectId: string): string[] => {
    const sub = subjects.find(s => s.id === subjectId);
    if (!sub) return [subjectId];
    // Return multiple possible names for ilike matching
    return [sub.name, sub.code, sub.id];
  }, []);

  // Fetch questions from DB when subject or page changes
  useEffect(() => {
    if (!subjectFilter || !user) {
      setQuestions([]);
      setTotalCount(0);
      return;
    }

    setLoading(true);
    const matchNames = getSubjectMatchNames(subjectFilter);
    const normalized = normalizeSubject(subjectFilter);

    const fetchQuestions = async () => {
      // Build OR filter for case-insensitive subject matching
      const orFilter = [
        `subject.ilike.%${normalized.name}%`,
        `subject.ilike.%${subjectFilter}%`,
        ...matchNames.map(n => `subject.ilike.%${n}%`),
      ].join(",");

      // Get total count
      const { count } = await supabase
        .from("questions")
        .select("id", { count: "exact", head: true })
        .or(orFilter);

      setTotalCount(count || 0);

      // Fetch page
      let query = supabase
        .from("questions")
        .select("*")
        .or(orFilter)
        .order("created_at", { ascending: false })
        .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

      if (difficultyFilter !== "all") {
        query = query.eq("difficulty", difficultyFilter);
      }

      const { data, error } = await query;

      if (error) {
        toast.error("Failed to load questions");
        console.error(error);
        setQuestions([]);
      } else {
        setQuestions(data || []);
      }
      setLoading(false);
    };

    fetchQuestions();
  }, [subjectFilter, user, page, difficultyFilter, getSubjectMatchNames]);

  // Reset page when filters change
  useEffect(() => {
    setPage(0);
  }, [subjectFilter, difficultyFilter, search]);

  // Client-side search filter
  const filtered = search
    ? questions.filter(q => q.text.toLowerCase().includes(search.toLowerCase()))
    : questions;

  const getSubjectName = (id: string) => subjects.find((s) => s.id === id)?.name || id;
  const selectedSubjectObj = subjects.find(s => s.id === subjectFilter);
  const selectedSubjectName = selectedSubjectObj?.name || subjectFilter;

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-display text-foreground">Question Bank</h1>
        <p className="text-muted-foreground mt-1">Manage, upload, and organize B.Tech questions.</p>
      </motion.div>

      {/* Upload Zone */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        onDragEnter={() => setDragActive(true)}
        onDragLeave={() => setDragActive(false)}
        onDragOver={(e) => e.preventDefault()}
        onDrop={() => setDragActive(false)}
        className={cn(
          "border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200",
          dragActive ? "border-accent bg-accent/5 scale-[1.01]" : "border-border hover:border-accent/50"
        )}
      >
        <Upload className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
        <p className="text-sm font-medium text-foreground">
          Drag & drop files here, or <span className="text-accent cursor-pointer hover:underline">browse</span>
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Supports PDF, DOCX, CSV, Excel • AI auto-categorizes by subject, unit & difficulty
        </p>
      </motion.div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search questions..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={branchFilter} onValueChange={(v) => { setBranchFilter(v); setSubjectFilter(""); }}>
          <SelectTrigger className="w-[140px]"><SelectValue placeholder="Branch" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Branches</SelectItem>
            {branches.map((b) => (
              <SelectItem key={b.id} value={b.id}>{b.shortName}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={subjectFilter} onValueChange={setSubjectFilter}>
          <SelectTrigger className={cn("w-[200px]", !subjectFilter && "border-accent ring-1 ring-accent/30")}>
            <SelectValue placeholder="⬅ Select Subject" />
          </SelectTrigger>
          <SelectContent>
            {filteredSubjects.map((s) => (
              <SelectItem key={s.id} value={s.id}>{s.code} — {s.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
          <SelectTrigger className="w-[130px]"><SelectValue placeholder="Difficulty" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            <SelectItem value="Easy">Easy</SelectItem>
            <SelectItem value="Medium">Medium</SelectItem>
            <SelectItem value="Hard">Hard</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm"><Plus className="w-4 h-4 mr-1" /> Add Question</Button>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {!subjectFilter ? (
          <motion.div
            key="prompt"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <BookOpen className="w-16 h-16 text-muted-foreground/40 mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">Select a Subject</h2>
            <p className="text-muted-foreground text-sm max-w-md">
              Choose a subject from the dropdown above to view all questions — including AI-generated, uploaded, manual, and notes-generated questions.
            </p>
          </motion.div>
        ) : loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-20"
          >
            <Loader2 className="w-8 h-8 animate-spin text-accent mb-3" />
            <p className="text-sm text-muted-foreground">Loading {selectedSubjectName} questions...</p>
          </motion.div>
        ) : (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            {/* Count header */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-foreground">
                Showing <span className="text-accent font-bold">{totalCount}</span> {selectedSubjectName} Questions
              </p>
              {totalPages > 1 && (
                <p className="text-xs text-muted-foreground">
                  Page {page + 1} of {totalPages}
                </p>
              )}
            </div>

            {totalCount === 0 ? (
              <div className="text-center py-16">
                <p className="text-muted-foreground">⚠ No questions found for {selectedSubjectName}.</p>
                <p className="text-xs text-muted-foreground mt-1">Generate a paper to populate the question bank.</p>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  {filtered.map((q, i) => (
                    <motion.div
                      key={q.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(i * 0.02, 0.4) }}
                      className="elevated-card rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <p className="text-sm font-medium text-foreground">{q.text}</p>
                          <div className="flex flex-wrap gap-2">
                            {q.subject_code && <Badge variant="secondary" className="text-xs">{q.subject_code}</Badge>}
                            <Badge variant="secondary" className="text-xs">{q.unit}</Badge>
                            <Badge className={cn("text-xs border", difficultyColor[q.difficulty] || "")}>{q.difficulty}</Badge>
                            <Badge variant="outline" className="text-xs">{q.type}</Badge>
                            <Badge variant="outline" className="text-xs">{q.marks} marks</Badge>
                            {q.bloom && <Badge variant="outline" className="text-xs">{q.bloom}</Badge>}
                            <Badge variant="secondary" className="text-xs capitalize">{q.source}</Badge>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground"><Tag className="w-3.5 h-3.5" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive"><Trash2 className="w-3.5 h-3.5" /></Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 pt-6">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page === 0}
                      onClick={() => setPage(p => p - 1)}
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" /> Previous
                    </Button>
                    <span className="text-sm text-muted-foreground px-3">
                      {page + 1} / {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page >= totalPages - 1}
                      onClick={() => setPage(p => p + 1)}
                    >
                      Next <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

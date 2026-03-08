import { useState, useEffect } from "react";
import { Upload, Search, Plus, Trash2, Tag, BookOpen, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { subjects, branches } from "@/data/subjects";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const difficultyColor: Record<string, string> = {
  Easy: "bg-success/10 text-success border-success/20",
  Medium: "bg-warning/10 text-warning border-warning/20",
  Hard: "bg-destructive/10 text-destructive border-destructive/20",
};

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
  const [hasSelected, setHasSelected] = useState(false);

  const filteredSubjects = branchFilter === "all"
    ? subjects
    : subjects.filter((s) => s.branch === branchFilter || s.branch === "core");

  // Fetch questions from DB when subject changes
  useEffect(() => {
    if (!subjectFilter || !user) {
      setQuestions([]);
      return;
    }
    setHasSelected(true);
    setLoading(true);

    const fetchQuestions = async () => {
      const { data, error } = await supabase
        .from("questions")
        .select("*")
        .eq("subject", subjectFilter);

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
  }, [subjectFilter, user]);

  // Client-side filters on fetched data
  const filtered = questions.filter((q) => {
    const matchesSearch = q.text.toLowerCase().includes(search.toLowerCase());
    const matchesDifficulty = difficultyFilter === "all" || q.difficulty === difficultyFilter;
    return matchesSearch && matchesDifficulty;
  });

  const getSubjectName = (id: string) => subjects.find((s) => s.id === id)?.name || id;
  const getSubjectCode = (id: string) => subjects.find((s) => s.id === id)?.code || "";
  const selectedSubjectName = subjectFilter ? getSubjectName(subjectFilter) : "";

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
                Showing <span className="text-accent font-bold">{filtered.length}</span> {selectedSubjectName} Questions
              </p>
              <Badge variant="secondary" className="text-xs">
                Total in DB: {questions.length}
              </Badge>
            </div>

            {filtered.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-muted-foreground">No questions found for {selectedSubjectName}.</p>
                <p className="text-xs text-muted-foreground mt-1">Generate a paper or upload questions to populate the bank.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filtered.map((q, i) => (
                  <motion.div
                    key={q.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.02, 0.5) }}
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
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

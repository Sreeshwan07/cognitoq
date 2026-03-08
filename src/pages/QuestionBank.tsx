import { useState, useEffect, useCallback } from "react";
import { Search, Plus, Trash2, BookOpen, Loader2, ChevronLeft, ChevronRight, Ban, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { subjects, branches, getSubjectById } from "@/data/subjects";
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
  exclude_from_paper: boolean;
}

export default function QuestionBank() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("");
  const [branchFilter, setBranchFilter] = useState("all");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [questions, setQuestions] = useState<DBQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);

  // Add Question Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newQ, setNewQ] = useState({ text: "", subject: "", unit: "", difficulty: "Medium", marks: "2", type: "Short", bloom: "Remember" });
  const [saving, setSaving] = useState(false);

  const filteredSubjects = branchFilter === "all"
    ? subjects
    : subjects.filter((s) => s.branch === branchFilter || s.branch === "core");

  const getSubjectMatchNames = useCallback((subjectId: string): string[] => {
    const sub = subjects.find(s => s.id === subjectId);
    if (!sub) return [subjectId];
    return [sub.name, sub.code, sub.id];
  }, []);

  // Fetch questions from DB
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
      const orFilter = [
        `subject.ilike.%${normalized.name}%`,
        `subject.ilike.%${subjectFilter}%`,
        ...matchNames.map(n => `subject.ilike.%${n}%`),
      ].join(",");

      const { count } = await supabase
        .from("questions")
        .select("id", { count: "exact", head: true })
        .or(orFilter);

      setTotalCount(count || 0);

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
        setQuestions([]);
      } else {
        setQuestions(data || []);
      }
      setLoading(false);
    };

    fetchQuestions();
  }, [subjectFilter, user, page, difficultyFilter, getSubjectMatchNames]);

  useEffect(() => { setPage(0); }, [subjectFilter, difficultyFilter, search]);

  const filtered = search
    ? questions.filter(q => q.text.toLowerCase().includes(search.toLowerCase()))
    : questions;

  const selectedSubjectObj = subjects.find(s => s.id === subjectFilter);
  const selectedSubjectName = selectedSubjectObj?.name || subjectFilter;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  // Get units for selected subject in add modal
  const addModalSubject = getSubjectById(newQ.subject);
  const addModalUnits = addModalSubject?.units || [];

  // Open modal pre-filled with current filter subject
  const openAddModal = () => {
    setNewQ({ text: "", subject: subjectFilter || "", unit: "", difficulty: "Medium", marks: "2", type: "Short", bloom: "Remember" });
    setShowAddModal(true);
  };

  // Save new question
  const handleSaveQuestion = async () => {
    if (!newQ.text.trim()) { toast.error("Question text is required"); return; }
    if (!newQ.subject) { toast.error("Please select a subject"); return; }
    if (!newQ.unit) { toast.error("Please select a unit"); return; }
    if (!user) { toast.error("You must be logged in"); return; }

    setSaving(true);
    const sub = getSubjectById(newQ.subject);
    const { error } = await supabase.from("questions").insert({
      text: newQ.text.trim(),
      subject: sub?.name || newQ.subject,
      subject_code: sub?.code || null,
      unit: newQ.unit,
      difficulty: newQ.difficulty,
      marks: parseInt(newQ.marks),
      type: newQ.type,
      bloom: newQ.bloom,
      source: "manual",
      user_id: user.id,
    });

    setSaving(false);
    if (error) {
      toast.error("Failed to add question");
    } else {
      toast.success("Question added successfully");
      setShowAddModal(false);
      // Refresh if same subject is selected
      if (newQ.subject === subjectFilter) {
        setPage(0);
        // Trigger refetch
        setSubjectFilter("");
        setTimeout(() => setSubjectFilter(newQ.subject), 50);
      }
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    const { error } = await supabase.from("questions").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete question");
    } else {
      setQuestions(prev => prev.filter(q => q.id !== id));
      setTotalCount(prev => prev - 1);
      toast.success("Question deleted");
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display text-foreground">Question Bank</h1>
          <p className="text-muted-foreground mt-1">Manage and organize B.Tech questions.</p>
        </div>
        <Button onClick={openAddModal} className="bg-accent text-accent-foreground hover:bg-accent/90">
          <Plus className="w-4 h-4 mr-1.5" /> Add Question
        </Button>
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
            <h2 className="text-xl font-semibold text-foreground mb-2">No questions yet</h2>
            <p className="text-muted-foreground text-sm max-w-md">
              Select a subject above to view questions, or click <strong>Add Question</strong> to get started.
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
                <BookOpen className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-foreground font-medium">No questions yet</p>
                <p className="text-xs text-muted-foreground mt-1">Click <strong>Add Question</strong> to create your first question.</p>
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
                          <div className="flex items-start gap-2">
                            <p className="text-sm font-medium text-foreground">{q.text}</p>
                            {q.exclude_from_paper && (
                              <Badge variant="destructive" className="text-[10px] shrink-0">🚫 Excluded</Badge>
                            )}
                          </div>
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
                          <Button
                            variant="ghost"
                            size="icon"
                            className={cn("h-8 w-8", q.exclude_from_paper ? "text-destructive" : "text-muted-foreground")}
                            title={q.exclude_from_paper ? "Include in papers" : "Exclude from papers"}
                            onClick={async () => {
                              const newVal = !q.exclude_from_paper;
                              const { error } = await supabase
                                .from("questions")
                                .update({ exclude_from_paper: newVal })
                                .eq("id", q.id);
                              if (error) {
                                toast.error("Failed to update");
                              } else {
                                setQuestions(prev => prev.map(x => x.id === q.id ? { ...x, exclude_from_paper: newVal } : x));
                                toast.success(newVal ? "Excluded from papers" : "Included in papers");
                              }
                            }}
                          >
                            {q.exclude_from_paper ? <Check className="w-3.5 h-3.5" /> : <Ban className="w-3.5 h-3.5" />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => handleDeleteQuestion(q.id)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 pt-6">
                    <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>
                      <ChevronLeft className="w-4 h-4 mr-1" /> Previous
                    </Button>
                    <span className="text-sm text-muted-foreground px-3">{page + 1} / {totalPages}</span>
                    <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>
                      Next <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Question Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display">Add Question</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Question Text <span className="text-destructive">*</span></Label>
              <Textarea
                placeholder="Enter the question..."
                value={newQ.text}
                onChange={e => setNewQ(p => ({ ...p, text: e.target.value }))}
                className="min-h-[80px]"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Subject <span className="text-destructive">*</span></Label>
                <Select value={newQ.subject} onValueChange={v => setNewQ(p => ({ ...p, subject: v, unit: "" }))}>
                  <SelectTrigger><SelectValue placeholder="Select subject" /></SelectTrigger>
                  <SelectContent>
                    {subjects.filter(s => s.branch !== "core").map(s => (
                      <SelectItem key={s.id} value={s.id}>{s.code} — {s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Unit <span className="text-destructive">*</span></Label>
                <Select value={newQ.unit} onValueChange={v => setNewQ(p => ({ ...p, unit: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select unit" /></SelectTrigger>
                  <SelectContent>
                    {addModalUnits.map((u, i) => (
                      <SelectItem key={u} value={u}>Unit {i + 1}: {u}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label>Difficulty</Label>
                <Select value={newQ.difficulty} onValueChange={v => setNewQ(p => ({ ...p, difficulty: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Easy">Easy</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Marks</Label>
                <Select value={newQ.marks} onValueChange={v => setNewQ(p => ({ ...p, marks: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Mark</SelectItem>
                    <SelectItem value="2">2 Marks</SelectItem>
                    <SelectItem value="3">3 Marks</SelectItem>
                    <SelectItem value="5">5 Marks</SelectItem>
                    <SelectItem value="10">10 Marks</SelectItem>
                    <SelectItem value="15">15 Marks</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Bloom's Level</Label>
                <Select value={newQ.bloom} onValueChange={v => setNewQ(p => ({ ...p, bloom: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Remember">Remember</SelectItem>
                    <SelectItem value="Understand">Understand</SelectItem>
                    <SelectItem value="Apply">Apply</SelectItem>
                    <SelectItem value="Analyze">Analyze</SelectItem>
                    <SelectItem value="Evaluate">Evaluate</SelectItem>
                    <SelectItem value="Create">Create</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddModal(false)}>Cancel</Button>
            <Button onClick={handleSaveQuestion} disabled={saving} className="bg-accent text-accent-foreground hover:bg-accent/90">
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : <Plus className="w-4 h-4 mr-1.5" />}
              {saving ? "Saving..." : "Add Question"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

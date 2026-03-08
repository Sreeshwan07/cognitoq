import { useState, useEffect, useCallback, useMemo } from "react";
import { Search, Plus, Trash2, Eye, Edit2, FileText, Filter, X, ChevronLeft, ChevronRight, Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { subjects } from "@/data/subjects";
import questionBankData from "@/data/questionBank";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const PAGE_SIZE = 20;

interface DBQuestion {
  id: string;
  user_id: string;
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

const difficultyColor: Record<string, string> = {
  Easy: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400",
  Medium: "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400",
  Hard: "bg-red-500/10 text-red-600 border-red-500/20 dark:text-red-400",
};

const sourceColor: Record<string, string> = {
  ai: "bg-violet-500/10 text-violet-600 border-violet-500/20",
  upload: "bg-sky-500/10 text-sky-600 border-sky-500/20",
  manual: "bg-slate-500/10 text-slate-600 border-slate-500/20",
  notes: "bg-teal-500/10 text-teal-600 border-teal-500/20",
  bank: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
};

export default function QuestionBank() {
  const { toast } = useToast();
  const [questions, setQuestions] = useState<DBQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);

  // Filters
  const [search, setSearch] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [marksFilter, setMarksFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [filtersVisible, setFiltersVisible] = useState(false);

  // Dialogs
  const [previewQuestion, setPreviewQuestion] = useState<DBQuestion | null>(null);
  const [editQuestion, setEditQuestion] = useState<DBQuestion | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newQuestion, setNewQuestion] = useState({ text: "", subject: "", unit: "", difficulty: "Medium", marks: 2, type: "Short", bloom: "Remember" });

  // Seeding state
  const [seeding, setSeeding] = useState(false);

  const hasActiveFilters = subjectFilter !== "all" || difficultyFilter !== "all" || marksFilter !== "all" || sourceFilter !== "all" || search !== "";

  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    let query = supabase.from("questions" as any).select("*", { count: "exact" }).eq("user_id", user.id);

    if (search) query = query.ilike("text", `%${search}%`);
    if (subjectFilter !== "all") query = query.eq("subject", subjectFilter);
    if (difficultyFilter !== "all") query = query.eq("difficulty", difficultyFilter);
    if (marksFilter !== "all") query = query.eq("marks", parseInt(marksFilter));
    if (sourceFilter !== "all") query = query.eq("source", sourceFilter);

    query = query.order("created_at", { ascending: false }).range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

    const { data, count, error } = await query;
    if (error) {
      console.error("Error fetching questions:", error);
      toast({ title: "Error loading questions", description: error.message, variant: "destructive" });
    }
    setQuestions((data as any) || []);
    setTotalCount(count || 0);
    setLoading(false);
  }, [search, subjectFilter, difficultyFilter, marksFilter, sourceFilter, page, toast]);

  useEffect(() => { fetchQuestions(); }, [fetchQuestions]);

  // Reset page when filters change
  useEffect(() => { setPage(0); }, [search, subjectFilter, difficultyFilter, marksFilter, sourceFilter]);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const seedFromLocalBank = async () => {
    setSeeding(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSeeding(false); return; }

    const rows: any[] = [];
    const subjectMap: Record<string, { name: string; code: string }> = {};
    subjects.forEach(s => { subjectMap[s.id] = { name: s.name, code: s.code }; });

    Object.entries(questionBankData).forEach(([subjectId, units]) => {
      const subjectInfo = subjectMap[subjectId] || { name: subjectId, code: "" };
      Object.entries(units).forEach(([unitName, qs]) => {
        qs.forEach(q => {
          rows.push({
            user_id: user.id,
            text: q.text,
            subject: subjectInfo.name,
            subject_code: subjectInfo.code,
            unit: unitName,
            difficulty: q.difficulty,
            marks: q.marks,
            type: q.type,
            bloom: q.bloom,
            source: "bank",
          });
        });
      });
    });

    // Batch insert in chunks of 50
    for (let i = 0; i < rows.length; i += 50) {
      const chunk = rows.slice(i, i + 50);
      const { error } = await supabase.from("questions" as any).insert(chunk);
      if (error) {
        console.error("Seed error:", error);
        toast({ title: "Seeding error", description: error.message, variant: "destructive" });
        setSeeding(false);
        return;
      }
    }

    toast({ title: `${rows.length} questions imported`, description: "Question bank seeded successfully!" });
    setSeeding(false);
    fetchQuestions();
  };

  const deleteQuestion = async (id: string) => {
    const { error } = await supabase.from("questions" as any).delete().eq("id", id);
    if (error) {
      toast({ title: "Delete failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Question deleted" });
      fetchQuestions();
    }
  };

  const saveEdit = async () => {
    if (!editQuestion) return;
    const { error } = await supabase.from("questions" as any).update({
      text: editQuestion.text,
      subject: editQuestion.subject,
      unit: editQuestion.unit,
      difficulty: editQuestion.difficulty,
      marks: editQuestion.marks,
      type: editQuestion.type,
    }).eq("id", editQuestion.id);
    if (error) {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Question updated" });
      setEditQuestion(null);
      fetchQuestions();
    }
  };

  const addQuestion = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from("questions" as any).insert({
      user_id: user.id,
      text: newQuestion.text,
      subject: newQuestion.subject,
      unit: newQuestion.unit,
      difficulty: newQuestion.difficulty,
      marks: newQuestion.marks,
      type: newQuestion.type,
      bloom: newQuestion.bloom,
      source: "manual",
    });
    if (error) {
      toast({ title: "Add failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Question added" });
      setAddDialogOpen(false);
      setNewQuestion({ text: "", subject: "", unit: "", difficulty: "Medium", marks: 2, type: "Short", bloom: "Remember" });
      fetchQuestions();
    }
  };

  const clearFilters = () => {
    setSearch("");
    setSubjectFilter("all");
    setDifficultyFilter("all");
    setMarksFilter("all");
    setSourceFilter("all");
  };

  const uniqueSubjects = useMemo(() => {
    const set = new Set(questions.map(q => q.subject));
    return Array.from(set).sort();
  }, [questions]);

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display text-foreground">Question Bank</h1>
          <p className="text-muted-foreground mt-1">
            {loading ? "Loading..." : `${totalCount} questions total`}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={() => setFiltersVisible(!filtersVisible)}>
            <Filter className="w-4 h-4 mr-1" /> Filters
            {hasActiveFilters && <Badge variant="secondary" className="ml-1.5 text-[10px] px-1.5 py-0">{[subjectFilter !== "all", difficultyFilter !== "all", marksFilter !== "all", sourceFilter !== "all", search !== ""].filter(Boolean).length}</Badge>}
          </Button>
          <Button variant="outline" size="sm" onClick={seedFromLocalBank} disabled={seeding}>
            {seeding ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Upload className="w-4 h-4 mr-1" />}
            Import Bank
          </Button>
          <Button size="sm" onClick={() => setAddDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-1" /> Add Question
          </Button>
        </div>
      </motion.div>

      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by keywords, subject, concept..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Filters */}
      {filtersVisible && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="flex flex-wrap gap-3 items-center">
          <Select value={subjectFilter} onValueChange={setSubjectFilter}>
            <SelectTrigger className="w-[200px]"><SelectValue placeholder="Subject" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Subjects</SelectItem>
              {subjects.map(s => (
                <SelectItem key={s.id} value={s.name}>{s.code} — {s.name}</SelectItem>
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
          <Select value={marksFilter} onValueChange={setMarksFilter}>
            <SelectTrigger className="w-[110px]"><SelectValue placeholder="Marks" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Marks</SelectItem>
              <SelectItem value="2">2 Marks</SelectItem>
              <SelectItem value="5">5 Marks</SelectItem>
              <SelectItem value="10">10 Marks</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sourceFilter} onValueChange={setSourceFilter}>
            <SelectTrigger className="w-[130px]"><SelectValue placeholder="Source" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sources</SelectItem>
              <SelectItem value="ai">AI Generated</SelectItem>
              <SelectItem value="upload">Uploaded</SelectItem>
              <SelectItem value="manual">Manual</SelectItem>
              <SelectItem value="notes">From Notes</SelectItem>
              <SelectItem value="bank">Question Bank</SelectItem>
            </SelectContent>
          </Select>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="w-4 h-4 mr-1" /> Clear Filters
            </Button>
          )}
        </motion.div>
      )}

      {/* Table */}
      <div className="elevated-card rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40%]">Question</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Unit</TableHead>
              <TableHead>Difficulty</TableHead>
              <TableHead>Marks</TableHead>
              <TableHead>Source</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 7 }).map((_, j) => (
                    <TableCell key={j}><div className="h-4 bg-muted rounded animate-pulse" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : questions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12">
                  <div className="text-muted-foreground">
                    <FileText className="w-10 h-10 mx-auto mb-3 opacity-50" />
                    <p className="font-medium">No questions found</p>
                    <p className="text-sm mt-1">Click "Import Bank" to load the built-in question bank, or add questions manually.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              questions.map((q) => (
                <TableRow key={q.id} className="group">
                  <TableCell className="font-medium text-sm max-w-[400px]">
                    <p className="line-clamp-2">{q.text}</p>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-xs whitespace-nowrap">
                      {q.subject_code || q.subject}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-[150px] truncate">{q.unit}</TableCell>
                  <TableCell>
                    <Badge className={cn("text-xs border", difficultyColor[q.difficulty] || "")}>{q.difficulty}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">{q.marks}M</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={cn("text-xs border capitalize", sourceColor[q.source] || "")}>{q.source}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setPreviewQuestion(q)} title="Preview">
                        <Eye className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditQuestion({ ...q })} title="Edit">
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-destructive" onClick={() => deleteQuestion(q.id)} title="Delete">
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-muted-foreground">
            Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, totalCount)} of {totalCount}
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>
              <ChevronLeft className="w-4 h-4 mr-1" /> Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {page + 1} of {totalPages}
            </span>
            <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>
              Next <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Preview Dialog */}
      <Dialog open={!!previewQuestion} onOpenChange={() => setPreviewQuestion(null)}>
        <DialogContent>
          {previewQuestion && (
            <>
              <DialogHeader>
                <DialogTitle>Question Preview</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-sm text-foreground leading-relaxed">{previewQuestion.text}</p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">{previewQuestion.subject}</Badge>
                  <Badge variant="outline">{previewQuestion.unit}</Badge>
                  <Badge className={cn("border", difficultyColor[previewQuestion.difficulty])}>{previewQuestion.difficulty}</Badge>
                  <Badge variant="outline">{previewQuestion.marks}M</Badge>
                  <Badge variant="outline">{previewQuestion.type}</Badge>
                  {previewQuestion.bloom && <Badge variant="outline">{previewQuestion.bloom}</Badge>}
                  <Badge className={cn("border capitalize", sourceColor[previewQuestion.source])}>{previewQuestion.source}</Badge>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editQuestion} onOpenChange={() => setEditQuestion(null)}>
        <DialogContent>
          {editQuestion && (
            <>
              <DialogHeader><DialogTitle>Edit Question</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div>
                  <Label>Question Text</Label>
                  <Textarea value={editQuestion.text} onChange={e => setEditQuestion({ ...editQuestion, text: e.target.value })} rows={3} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Subject</Label>
                    <Input value={editQuestion.subject} onChange={e => setEditQuestion({ ...editQuestion, subject: e.target.value })} />
                  </div>
                  <div>
                    <Label>Unit</Label>
                    <Input value={editQuestion.unit} onChange={e => setEditQuestion({ ...editQuestion, unit: e.target.value })} />
                  </div>
                  <div>
                    <Label>Difficulty</Label>
                    <Select value={editQuestion.difficulty} onValueChange={v => setEditQuestion({ ...editQuestion, difficulty: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Easy">Easy</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="Hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Marks</Label>
                    <Input type="number" value={editQuestion.marks} onChange={e => setEditQuestion({ ...editQuestion, marks: parseInt(e.target.value) || 0 })} />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setEditQuestion(null)}>Cancel</Button>
                <Button onClick={saveEdit}>Save Changes</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Question Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add New Question</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Question Text</Label>
              <Textarea value={newQuestion.text} onChange={e => setNewQuestion({ ...newQuestion, text: e.target.value })} rows={3} placeholder="Enter question..." />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Subject</Label>
                <Select value={newQuestion.subject} onValueChange={v => setNewQuestion({ ...newQuestion, subject: v })}>
                  <SelectTrigger><SelectValue placeholder="Select subject" /></SelectTrigger>
                  <SelectContent>
                    {subjects.map(s => (
                      <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Unit</Label>
                <Input value={newQuestion.unit} onChange={e => setNewQuestion({ ...newQuestion, unit: e.target.value })} placeholder="e.g. Sorting & Searching" />
              </div>
              <div>
                <Label>Difficulty</Label>
                <Select value={newQuestion.difficulty} onValueChange={v => setNewQuestion({ ...newQuestion, difficulty: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Easy">Easy</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Marks</Label>
                <Input type="number" value={newQuestion.marks} onChange={e => setNewQuestion({ ...newQuestion, marks: parseInt(e.target.value) || 0 })} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>Cancel</Button>
            <Button onClick={addQuestion} disabled={!newQuestion.text || !newQuestion.subject}>Add Question</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

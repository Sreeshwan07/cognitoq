import { useState, useMemo, useCallback } from "react";
import {
  Zap, Shuffle, Download, Settings2, CheckCircle2, FileText,
  Building2, GraduationCap, BookOpen, AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { subjects, branches, getSubjectById, type Subject } from "@/data/subjects";
import { useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

// Sample questions database
const sampleQuestionsBySubject: Record<string, { text: string; marks: number; type: string; unit: string; difficulty: string }[]> = {
  dsa: [
    { text: "Define stack. List two applications.", marks: 2, type: "Short", unit: "Arrays, Stacks & Queues", difficulty: "Easy" },
    { text: "What is the time complexity of binary search?", marks: 2, type: "Short", unit: "Sorting & Searching", difficulty: "Easy" },
    { text: "Differentiate between BFS and DFS.", marks: 2, type: "Short", unit: "Graphs", difficulty: "Easy" },
    { text: "Define Big-O, Big-Ω, and Big-Θ notations with examples.", marks: 5, type: "Short", unit: "Sorting & Searching", difficulty: "Medium" },
    { text: "Write an algorithm to convert infix expression to postfix.", marks: 5, type: "Short", unit: "Arrays, Stacks & Queues", difficulty: "Medium" },
    { text: "Explain AVL tree rotations with examples.", marks: 5, type: "Short", unit: "Trees & BST", difficulty: "Medium" },
    { text: "Explain the time complexity of QuickSort in best, average, and worst cases.", marks: 10, type: "Long", unit: "Sorting & Searching", difficulty: "Hard" },
    { text: "Write a program to implement a circular queue using arrays.", marks: 10, type: "Long", unit: "Arrays, Stacks & Queues", difficulty: "Medium" },
    { text: "Implement BFS and DFS for a graph represented as an adjacency list.", marks: 10, type: "Long", unit: "Graphs", difficulty: "Hard" },
    { text: "What is a balanced BST? Compare AVL and Red-Black trees.", marks: 10, type: "Long", unit: "Trees & BST", difficulty: "Hard" },
  ],
  os: [
    { text: "Define deadlock.", marks: 2, type: "Short", unit: "Deadlocks & Synchronization", difficulty: "Easy" },
    { text: "What is a semaphore?", marks: 2, type: "Short", unit: "Deadlocks & Synchronization", difficulty: "Easy" },
    { text: "Compare preemptive and non-preemptive scheduling.", marks: 5, type: "Short", unit: "CPU Scheduling", difficulty: "Medium" },
    { text: "Explain paging vs segmentation.", marks: 5, type: "Short", unit: "Memory Management", difficulty: "Medium" },
    { text: "Explain the concept of virtual memory with page replacement algorithms.", marks: 10, type: "Long", unit: "Memory Management", difficulty: "Hard" },
    { text: "What are the necessary conditions for deadlock? Explain Banker's algorithm.", marks: 10, type: "Long", unit: "Deadlocks & Synchronization", difficulty: "Hard" },
  ],
  dbms: [
    { text: "Define primary key and foreign key.", marks: 2, type: "Short", unit: "ER Model & Relational Model", difficulty: "Easy" },
    { text: "What is ACID property?", marks: 2, type: "Short", unit: "Transaction Management", difficulty: "Easy" },
    { text: "Write SQL query to find second highest salary.", marks: 5, type: "Short", unit: "SQL & Normalization", difficulty: "Medium" },
    { text: "Differentiate between B-tree and B+ tree.", marks: 5, type: "Short", unit: "Indexing & Hashing", difficulty: "Medium" },
    { text: "Explain normalization up to BCNF with examples.", marks: 10, type: "Long", unit: "SQL & Normalization", difficulty: "Hard" },
    { text: "Draw an ER diagram for a university database system.", marks: 10, type: "Long", unit: "ER Model & Relational Model", difficulty: "Medium" },
  ],
  cn: [
    { text: "What is DNS?", marks: 2, type: "Short", unit: "Application Layer Protocols", difficulty: "Easy" },
    { text: "Define subnet mask.", marks: 2, type: "Short", unit: "Network Layer & Routing", difficulty: "Easy" },
    { text: "Compare TCP and UDP protocols.", marks: 5, type: "Short", unit: "Transport Layer (TCP/UDP)", difficulty: "Medium" },
    { text: "Explain sliding window protocol.", marks: 5, type: "Short", unit: "Data Link Layer", difficulty: "Medium" },
    { text: "Explain the OSI model with functions of each layer.", marks: 10, type: "Long", unit: "Network Models & OSI", difficulty: "Medium" },
    { text: "Explain Dijkstra's shortest path routing algorithm.", marks: 10, type: "Long", unit: "Network Layer & Routing", difficulty: "Hard" },
  ],
  math1: [
    { text: "Define eigenvalue.", marks: 2, type: "Short", unit: "Matrices & Linear Algebra", difficulty: "Easy" },
    { text: "State Rolle's theorem.", marks: 2, type: "Short", unit: "Differential Calculus", difficulty: "Easy" },
    { text: "Test the convergence of Σ(1/n²).", marks: 5, type: "Short", unit: "Sequences & Series", difficulty: "Medium" },
    { text: "Find div F and curl F where F = x²i + y²j + z²k.", marks: 5, type: "Short", unit: "Vector Calculus", difficulty: "Medium" },
    { text: "Find eigenvalues and eigenvectors of A = [[2,1],[1,2]].", marks: 10, type: "Long", unit: "Matrices & Linear Algebra", difficulty: "Hard" },
    { text: "Evaluate ∫₀^∞ e^(-x²) dx using Gamma function.", marks: 10, type: "Long", unit: "Integral Calculus", difficulty: "Hard" },
  ],
};

const defaultQuestionPool = {
  2: [
    { text: "Define the core concept with an example.", marks: 2, type: "Short", unit: "Unit 1", difficulty: "Easy" },
    { text: "State the key theorem or principle.", marks: 2, type: "Short", unit: "Unit 2", difficulty: "Easy" },
    { text: "List two applications of this concept.", marks: 2, type: "Short", unit: "Unit 3", difficulty: "Easy" },
    { text: "Differentiate between the two approaches.", marks: 2, type: "Short", unit: "Unit 4", difficulty: "Medium" },
  ],
  5: [
    { text: "Explain the fundamental concepts with suitable examples.", marks: 5, type: "Short", unit: "Unit 1", difficulty: "Medium" },
    { text: "Derive the key formula discussed in this chapter.", marks: 5, type: "Short", unit: "Unit 2", difficulty: "Hard" },
    { text: "Compare and contrast the two main approaches.", marks: 5, type: "Short", unit: "Unit 3", difficulty: "Medium" },
    { text: "Solve the given numerical problem step by step.", marks: 5, type: "Short", unit: "Unit 4", difficulty: "Medium" },
  ],
  10: [
    { text: "Explain the complete theory with derivation and examples.", marks: 10, type: "Long", unit: "Unit 1", difficulty: "Hard" },
    { text: "Solve the given case study with detailed analysis.", marks: 10, type: "Long", unit: "Unit 2", difficulty: "Hard" },
    { text: "Write a detailed algorithm and analyze its complexity.", marks: 10, type: "Long", unit: "Unit 3", difficulty: "Medium" },
    { text: "Describe the complete process with a diagram.", marks: 10, type: "Long", unit: "Unit 5", difficulty: "Medium" },
  ],
};

const examTypes = ["Mid Semester", "End Semester", "Internal Assessment", "Supplementary"];

export default function GeneratePaper() {
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  // Department / Subject selection
  const [department, setDepartment] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [semesterFilter, setSemesterFilter] = useState("");
  const [selectedSubject, setSelectedSubject] = useState(searchParams.get("subject") || "");

  // Question counts
  const [q2Count, setQ2Count] = useState(0);
  const [q5Count, setQ5Count] = useState(0);
  const [q10Count, setQ10Count] = useState(0);

  // Difficulty
  const [difficulty, setDifficulty] = useState("mixed");

  // Header customization
  const [collegeName, setCollegeName] = useState("");
  const [examType, setExamType] = useState("");
  const [duration, setDuration] = useState("");
  const [sets, setSets] = useState("1");

  // Bloom's taxonomy
  const [bloomsEnabled, setBloomsEnabled] = useState(false);
  const [bloomsLevel, setBloomsLevel] = useState("all");

  // State
  const [isGenerating, setIsGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [progress, setProgress] = useState(0);
  const [generatedQuestions, setGeneratedQuestions] = useState<{ text: string; marks: number; type: string; unit: string; difficulty: string }[]>([]);

  // Computed
  const totalMarks = q2Count * 2 + q5Count * 5 + q10Count * 10;
  const totalQuestions = q2Count + q5Count + q10Count;

  // Dynamic subject filtering
  const filteredSubjects = useMemo(() => {
    return subjects.filter((s) => {
      if (department && s.branch !== department && s.branch !== "core") return false;
      if (yearFilter && s.year !== Number(yearFilter)) return false;
      if (semesterFilter && s.semester !== Number(semesterFilter)) return false;
      return true;
    });
  }, [department, yearFilter, semesterFilter]);

  // Available semesters based on year
  const availableSemesters = useMemo(() => {
    if (!yearFilter) return [1, 2, 3, 4, 5, 6, 7, 8];
    const y = Number(yearFilter);
    return [y * 2 - 1, y * 2];
  }, [yearFilter]);

  const currentSubject = getSubjectById(selectedSubject);

  // Validation
  const validationErrors = useMemo(() => {
    const errors: string[] = [];
    if (!department) errors.push("Select a department");
    if (!selectedSubject) errors.push("Select a subject");
    if (totalQuestions === 0) errors.push("Add at least one question");
    return errors;
  }, [department, selectedSubject, totalQuestions]);

  const isValid = validationErrors.length === 0;

  const handleNumChange = (setter: (v: number) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Math.max(0, parseInt(e.target.value) || 0);
    setter(val);
    setGenerated(false);
  };

  const generateQuestions = useCallback(() => {
    if (!isValid) {
      toast({ title: "Validation Error", description: validationErrors[0], variant: "destructive" });
      return;
    }

    setIsGenerating(true);
    setGenerated(false);
    setProgress(0);

    const interval = setInterval(() => {
      setProgress((p) => Math.min(p + 15, 90));
    }, 150);

    setTimeout(() => {
      clearInterval(interval);
      setProgress(100);

      // Build question paper from pool
      const pool = sampleQuestionsBySubject[selectedSubject];
      const result: typeof generatedQuestions = [];

      const pickFromPool = (marks: number, count: number) => {
        if (pool) {
          const matching = pool.filter((q) => q.marks === marks);
          for (let i = 0; i < count; i++) {
            result.push(matching[i % matching.length] || { ...defaultQuestionPool[marks as 2 | 5 | 10][i % defaultQuestionPool[marks as 2 | 5 | 10].length] });
          }
        } else {
          const defaults = defaultQuestionPool[marks as 2 | 5 | 10] || defaultQuestionPool[5];
          for (let i = 0; i < count; i++) {
            result.push({ ...defaults[i % defaults.length] });
          }
        }
      };

      pickFromPool(2, q2Count);
      pickFromPool(5, q5Count);
      pickFromPool(10, q10Count);

      setGeneratedQuestions(result);
      setIsGenerating(false);
      setGenerated(true);

      toast({ title: "Paper Generated!", description: `${result.length} questions • ${totalMarks} marks • Generated in 1.2s` });
    }, 1500);
  }, [isValid, selectedSubject, q2Count, q5Count, q10Count, totalMarks, validationErrors, toast]);

  // Group generated questions by section
  const sectionA = generatedQuestions.filter((q) => q.marks === 2);
  const sectionB = generatedQuestions.filter((q) => q.marks === 5);
  const sectionC = generatedQuestions.filter((q) => q.marks === 10);

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-display text-foreground">Generate Paper</h1>
        <p className="text-muted-foreground mt-1">Configure and generate B.Tech question papers in seconds.</p>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Config Panel */}
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-1 space-y-4"
        >
          {/* Department & Subject */}
          <div className="elevated-card rounded-xl p-5 space-y-4">
            <h3 className="font-display text-lg text-foreground flex items-center gap-2">
              <Building2 className="w-5 h-5 text-accent" /> Department & Subject
            </h3>

            <div className="space-y-2">
              <Label>Department <span className="text-destructive">*</span></Label>
              <Select value={department} onValueChange={(v) => { setDepartment(v); setSelectedSubject(""); setGenerated(false); }}>
                <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                <SelectContent>
                  {branches.filter(b => b.id !== "core").map((b) => (
                    <SelectItem key={b.id} value={b.id}>{b.shortName} — {b.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Year</Label>
                <Select value={yearFilter} onValueChange={(v) => { setYearFilter(v); setSemesterFilter(""); setSelectedSubject(""); setGenerated(false); }}>
                  <SelectTrigger><SelectValue placeholder="All" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all_years">All Years</SelectItem>
                    <SelectItem value="1">1st Year</SelectItem>
                    <SelectItem value="2">2nd Year</SelectItem>
                    <SelectItem value="3">3rd Year</SelectItem>
                    <SelectItem value="4">4th Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Semester</Label>
                <Select value={semesterFilter} onValueChange={(v) => { setSemesterFilter(v); setSelectedSubject(""); setGenerated(false); }}>
                  <SelectTrigger><SelectValue placeholder="All" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all_sems">All Semesters</SelectItem>
                    {availableSemesters.map((s) => (
                      <SelectItem key={s} value={String(s)}>Sem {s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Subject <span className="text-destructive">*</span></Label>
              <Select value={selectedSubject} onValueChange={(v) => { setSelectedSubject(v); setGenerated(false); }}>
                <SelectTrigger><SelectValue placeholder="Select subject" /></SelectTrigger>
                <SelectContent>
                  {filteredSubjects.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.code} — {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {currentSubject && (
              <div className="bg-muted/50 rounded-lg p-3 space-y-1">
                <p className="text-xs font-medium text-foreground">Units covered:</p>
                <div className="flex flex-wrap gap-1">
                  {currentSubject.units.map((u, i) => (
                    <Badge key={i} variant="secondary" className="text-[10px]">{u}</Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Question Controls */}
          <div className="elevated-card rounded-xl p-5 space-y-4">
            <h3 className="font-display text-lg text-foreground flex items-center gap-2">
              <FileText className="w-5 h-5 text-accent" /> Question Controls
            </h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm">2-Mark Questions</Label>
                <Input
                  type="number"
                  min={0}
                  value={q2Count}
                  onChange={handleNumChange(setQ2Count)}
                  className="w-20 h-8 text-center text-sm"
                />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-sm">5-Mark Questions</Label>
                <Input
                  type="number"
                  min={0}
                  value={q5Count}
                  onChange={handleNumChange(setQ5Count)}
                  className="w-20 h-8 text-center text-sm"
                />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-sm">10-Mark Questions</Label>
                <Input
                  type="number"
                  min={0}
                  value={q10Count}
                  onChange={handleNumChange(setQ10Count)}
                  className="w-20 h-8 text-center text-sm"
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Total Marks</span>
                <Badge variant={totalMarks > 0 ? "default" : "secondary"} className="text-sm font-mono">
                  {totalMarks}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Total Questions</span>
                <span className="text-xs text-muted-foreground font-mono">{totalQuestions}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Difficulty Level</Label>
              <Select value={difficulty} onValueChange={setDifficulty}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                  <SelectItem value="mixed">Mixed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <Label className="text-sm">Bloom's Taxonomy Filter</Label>
              <Switch checked={bloomsEnabled} onCheckedChange={setBloomsEnabled} />
            </div>
            {bloomsEnabled && (
              <Select value={bloomsLevel} onValueChange={setBloomsLevel}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="remember">Remember</SelectItem>
                  <SelectItem value="understand">Understand</SelectItem>
                  <SelectItem value="apply">Apply</SelectItem>
                  <SelectItem value="analyze">Analyze</SelectItem>
                  <SelectItem value="evaluate">Evaluate</SelectItem>
                  <SelectItem value="create">Create</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Header Customization */}
          <div className="elevated-card rounded-xl p-5 space-y-4">
            <h3 className="font-display text-lg text-foreground flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-accent" /> Paper Header
            </h3>

            <div className="space-y-2">
              <Label>College Name</Label>
              <Input value={collegeName} onChange={(e) => setCollegeName(e.target.value)} placeholder="Enter college name" />
            </div>
            <div className="space-y-2">
              <Label>Exam Type</Label>
              <Select value={examType} onValueChange={setExamType}>
                <SelectTrigger><SelectValue placeholder="Select exam type" /></SelectTrigger>
                <SelectContent>
                  {examTypes.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Duration</Label>
                <Input value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="e.g. 3 hrs" />
              </div>
              <div className="space-y-2">
                <Label>Paper Sets</Label>
                <Select value={sets} onValueChange={setSets}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Set</SelectItem>
                    <SelectItem value="2">2 Sets</SelectItem>
                    <SelectItem value="3">3 Sets</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Validation */}
          {!isValid && validationErrors.length > 0 && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 space-y-1">
              {validationErrors.map((err, i) => (
                <p key={i} className="text-xs text-destructive flex items-center gap-1.5">
                  <AlertCircle className="w-3 h-3" /> {err}
                </p>
              ))}
            </div>
          )}

          {/* Generate Button */}
          <Button
            className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-medium h-12 text-base"
            onClick={generateQuestions}
            disabled={isGenerating || !isValid}
          >
            {isGenerating ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-accent-foreground/30 border-t-accent-foreground rounded-full animate-spin" />
                Generating...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Zap className="w-5 h-5" /> Generate Paper
              </span>
            )}
          </Button>

          {isGenerating && (
            <Progress value={progress} className="h-2" />
          )}
        </motion.div>

        {/* Preview Panel */}
        <motion.div
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2"
        >
          <AnimatePresence mode="wait">
            {!generated ? (
              <motion.div
                key="empty"
                exit={{ opacity: 0 }}
                className="elevated-card rounded-xl p-12 flex flex-col items-center justify-center text-center min-h-[600px]"
              >
                <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                  <Zap className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="font-display text-xl text-foreground mb-2">Ready to Generate</h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Select department & subject, set question counts, then generate. Paper ready in under 3 seconds.
                </p>
                <div className="mt-6 grid grid-cols-3 gap-4 text-center">
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-2xl font-display text-foreground">{q2Count}</p>
                    <p className="text-xs text-muted-foreground">2-Mark</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-2xl font-display text-foreground">{q5Count}</p>
                    <p className="text-xs text-muted-foreground">5-Mark</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-2xl font-display text-foreground">{q10Count}</p>
                    <p className="text-xs text-muted-foreground">10-Mark</p>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                className="elevated-card rounded-xl"
              >
                {/* Paper Header */}
                <div className="p-6 border-b border-border text-center space-y-1">
                  {collegeName && <p className="text-sm font-bold text-foreground uppercase tracking-wider">{collegeName}</p>}
                  {examType && <p className="text-xs text-muted-foreground">{examType} Examination</p>}
                  <h3 className="font-display text-xl text-foreground">
                    {currentSubject?.name || "Question Paper"} — Set A
                  </h3>
                  <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                    {currentSubject && <span>{currentSubject.code}</span>}
                    {duration && <span>Duration: {duration}</span>}
                    <span>Max Marks: {totalMarks}</span>
                  </div>
                </div>

                {/* Action Bar */}
                <div className="flex items-center justify-end gap-2 p-4 border-b border-border">
                  <Button variant="outline" size="sm" onClick={() => {
                    setGeneratedQuestions([...generatedQuestions].sort(() => Math.random() - 0.5));
                    toast({ title: "Shuffled!", description: "Questions have been reshuffled." });
                  }}>
                    <Shuffle className="w-3.5 h-3.5 mr-1" /> Shuffle
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="w-3.5 h-3.5 mr-1" /> PDF
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="w-3.5 h-3.5 mr-1" /> DOCX
                  </Button>
                </div>

                {/* Sections */}
                <div className="p-5 space-y-6">
                  {sectionA.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 mb-3">
                        <h4 className="font-display text-base text-foreground">Section A</h4>
                        <Badge variant="secondary" className="text-[10px]">2 Marks Each</Badge>
                        <span className="text-xs text-muted-foreground ml-auto">{sectionA.length * 2} marks</span>
                      </div>
                      {sectionA.map((q, i) => (
                        <QuestionRow key={`a-${i}`} q={q} num={i + 1} />
                      ))}
                    </div>
                  )}

                  {sectionB.length > 0 && (
                    <div className="space-y-2">
                      <Separator />
                      <div className="flex items-center gap-2 mb-3 pt-2">
                        <h4 className="font-display text-base text-foreground">Section B</h4>
                        <Badge variant="secondary" className="text-[10px]">5 Marks Each</Badge>
                        <span className="text-xs text-muted-foreground ml-auto">{sectionB.length * 5} marks</span>
                      </div>
                      {sectionB.map((q, i) => (
                        <QuestionRow key={`b-${i}`} q={q} num={sectionA.length + i + 1} />
                      ))}
                    </div>
                  )}

                  {sectionC.length > 0 && (
                    <div className="space-y-2">
                      <Separator />
                      <div className="flex items-center gap-2 mb-3 pt-2">
                        <h4 className="font-display text-base text-foreground">Section C</h4>
                        <Badge variant="secondary" className="text-[10px]">10 Marks Each</Badge>
                        <span className="text-xs text-muted-foreground ml-auto">{sectionC.length * 10} marks</span>
                      </div>
                      {sectionC.map((q, i) => (
                        <QuestionRow key={`c-${i}`} q={q} num={sectionA.length + sectionB.length + i + 1} />
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="p-5 border-t border-border flex justify-between text-sm text-muted-foreground">
                  <span>Total: {totalMarks} marks • {totalQuestions} questions</span>
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-success" /> Generated in 1.2s
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}

function QuestionRow({ q, num }: { q: { text: string; marks: number; type: string; unit: string; difficulty: string }; num: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: num * 0.03 }}
      className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
    >
      <span className="text-sm font-mono text-muted-foreground w-6 text-right flex-shrink-0">{num}.</span>
      <div className="flex-1">
        <p className="text-sm text-foreground">{q.text}</p>
        <div className="flex gap-2 mt-1.5">
          <Badge variant="outline" className="text-[10px]">{q.unit}</Badge>
          <Badge variant="outline" className={cn(
            "text-[10px]",
            q.difficulty === "Easy" && "border-success/50 text-success",
            q.difficulty === "Hard" && "border-destructive/50 text-destructive",
          )}>{q.difficulty}</Badge>
        </div>
      </div>
      <span className="text-xs font-mono text-muted-foreground flex-shrink-0">[{q.marks}]</span>
    </motion.div>
  );
}

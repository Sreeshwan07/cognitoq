import { useState } from "react";
import { Upload, Search, Plus, Trash2, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { subjects, branches } from "@/data/subjects";

const mockQuestions = [
  { id: 1, text: "Explain the time complexity of QuickSort in best, average, and worst cases.", subject: "dsa", unit: "Sorting & Searching", difficulty: "Hard", marks: 10, type: "Long" },
  { id: 2, text: "What is ACID property? Explain each with examples.", subject: "dbms", unit: "Transaction Management", difficulty: "Medium", marks: 8, type: "Long" },
  { id: 3, text: "Find the eigenvalues of the matrix A = [[2,1],[1,2]].", subject: "math1", unit: "Matrices & Linear Algebra", difficulty: "Medium", marks: 10, type: "Long" },
  { id: 4, text: "Differentiate between process and thread.", subject: "os", unit: "Process Management", difficulty: "Easy", marks: 5, type: "Short" },
  { id: 5, text: "Explain the OSI model with functions of each layer.", subject: "cn", unit: "Network Models & OSI", difficulty: "Medium", marks: 10, type: "Long" },
  { id: 6, text: "Compare preemptive and non-preemptive scheduling.", subject: "os", unit: "CPU Scheduling", difficulty: "Medium", marks: 8, type: "Long" },
  { id: 7, text: "Write SQL to find the second highest salary.", subject: "dbms", unit: "SQL & Normalization", difficulty: "Easy", marks: 5, type: "Short" },
  { id: 8, text: "Explain virtual memory with page replacement algorithms.", subject: "os", unit: "Memory Management", difficulty: "Hard", marks: 10, type: "Long" },
  { id: 9, text: "State and prove Rolle's theorem.", subject: "math1", unit: "Differential Calculus", difficulty: "Hard", marks: 8, type: "Long" },
  { id: 10, text: "Implement BFS and DFS for an adjacency list.", subject: "dsa", unit: "Graphs", difficulty: "Medium", marks: 10, type: "Long" },
  { id: 11, text: "Which data structure uses LIFO?", subject: "dsa", unit: "Arrays, Stacks & Queues", difficulty: "Easy", marks: 2, type: "MCQ" },
  { id: 12, text: "Explain sliding window protocol.", subject: "cn", unit: "Data Link Layer", difficulty: "Medium", marks: 8, type: "Long" },
];

const difficultyColor: Record<string, string> = {
  Easy: "bg-success/10 text-success border-success/20",
  Medium: "bg-warning/10 text-warning border-warning/20",
  Hard: "bg-destructive/10 text-destructive border-destructive/20",
};

export default function QuestionBank() {
  const [search, setSearch] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [branchFilter, setBranchFilter] = useState("all");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [dragActive, setDragActive] = useState(false);

  const filteredSubjects = branchFilter === "all"
    ? subjects
    : subjects.filter((s) => s.branch === branchFilter || s.branch === "core");

  const filtered = mockQuestions.filter((q) => {
    const matchesSearch = q.text.toLowerCase().includes(search.toLowerCase());
    const matchesSubject = subjectFilter === "all" || q.subject === subjectFilter;
    const matchesDifficulty = difficultyFilter === "all" || q.difficulty === difficultyFilter;
    return matchesSearch && matchesSubject && matchesDifficulty;
  });

  const getSubjectName = (id: string) => subjects.find((s) => s.id === id)?.name || id;
  const getSubjectCode = (id: string) => subjects.find((s) => s.id === id)?.code || "";

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
        <Select value={branchFilter} onValueChange={(v) => { setBranchFilter(v); setSubjectFilter("all"); }}>
          <SelectTrigger className="w-[140px]"><SelectValue placeholder="Branch" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Branches</SelectItem>
            {branches.map((b) => (
              <SelectItem key={b.id} value={b.id}>{b.shortName}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={subjectFilter} onValueChange={setSubjectFilter}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Subject" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Subjects</SelectItem>
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

      {/* Question List */}
      <div className="space-y-2">
        {filtered.map((q, i) => (
          <motion.div
            key={q.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className="elevated-card rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-2">
                <p className="text-sm font-medium text-foreground">{q.text}</p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="text-xs">{getSubjectCode(q.subject)}</Badge>
                  <Badge variant="secondary" className="text-xs">{getSubjectName(q.subject)}</Badge>
                  <Badge variant="secondary" className="text-xs">{q.unit}</Badge>
                  <Badge className={cn("text-xs border", difficultyColor[q.difficulty])}>{q.difficulty}</Badge>
                  <Badge variant="outline" className="text-xs">{q.type}</Badge>
                  <Badge variant="outline" className="text-xs">{q.marks} marks</Badge>
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

      <p className="text-xs text-muted-foreground text-center pt-2">
        Showing {filtered.length} of {mockQuestions.length} questions
      </p>
    </div>
  );
}

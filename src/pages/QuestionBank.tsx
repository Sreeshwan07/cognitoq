import { useState } from "react";
import { Upload, Search, Filter, Plus, FileText, Trash2, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const mockQuestions = [
  { id: 1, text: "Explain Newton's Third Law of Motion with examples.", subject: "Physics", unit: "Unit 1", difficulty: "Medium", marks: 5, type: "Long" },
  { id: 2, text: "What is the chemical formula of sulfuric acid?", subject: "Chemistry", unit: "Unit 3", difficulty: "Easy", marks: 1, type: "MCQ" },
  { id: 3, text: "Derive the quadratic formula.", subject: "Mathematics", unit: "Unit 2", difficulty: "Hard", marks: 8, type: "Long" },
  { id: 4, text: "Define photosynthesis and list the reactants.", subject: "Biology", unit: "Unit 4", difficulty: "Easy", marks: 3, type: "Short" },
  { id: 5, text: "Solve: If f(x) = 3x² + 2x - 5, find f'(x).", subject: "Mathematics", unit: "Unit 5", difficulty: "Medium", marks: 4, type: "Short" },
  { id: 6, text: "Compare mitosis and meiosis with diagrams.", subject: "Biology", unit: "Unit 2", difficulty: "Hard", marks: 10, type: "Long" },
  { id: 7, text: "What is Ohm's Law? State its formula.", subject: "Physics", unit: "Unit 3", difficulty: "Easy", marks: 2, type: "Short" },
  { id: 8, text: "A factory produces 500 units daily. If 3% are defective, how many are defective per week?", subject: "Mathematics", unit: "Unit 1", difficulty: "Medium", marks: 4, type: "Case-based" },
];

const difficultyColor: Record<string, string> = {
  Easy: "bg-success/10 text-success border-success/20",
  Medium: "bg-warning/10 text-warning border-warning/20",
  Hard: "bg-destructive/10 text-destructive border-destructive/20",
};

export default function QuestionBank() {
  const [search, setSearch] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [dragActive, setDragActive] = useState(false);

  const filtered = mockQuestions.filter((q) => {
    const matchesSearch = q.text.toLowerCase().includes(search.toLowerCase());
    const matchesSubject = subjectFilter === "all" || q.subject === subjectFilter;
    const matchesDifficulty = difficultyFilter === "all" || q.difficulty === difficultyFilter;
    return matchesSearch && matchesSubject && matchesDifficulty;
  });

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-display text-foreground">Question Bank</h1>
        <p className="text-muted-foreground mt-1">Manage, upload, and organize your questions.</p>
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
          dragActive
            ? "border-accent bg-accent/5 scale-[1.01]"
            : "border-border hover:border-accent/50"
        )}
      >
        <Upload className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
        <p className="text-sm font-medium text-foreground">
          Drag & drop files here, or{" "}
          <span className="text-accent cursor-pointer hover:underline">browse</span>
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Supports PDF, DOCX, CSV, Excel • AI auto-categorizes questions
        </p>
      </motion.div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search questions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={subjectFilter} onValueChange={setSubjectFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Subject" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Subjects</SelectItem>
            <SelectItem value="Physics">Physics</SelectItem>
            <SelectItem value="Chemistry">Chemistry</SelectItem>
            <SelectItem value="Mathematics">Mathematics</SelectItem>
            <SelectItem value="Biology">Biology</SelectItem>
          </SelectContent>
        </Select>
        <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Difficulty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            <SelectItem value="Easy">Easy</SelectItem>
            <SelectItem value="Medium">Medium</SelectItem>
            <SelectItem value="Hard">Hard</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm">
          <Plus className="w-4 h-4 mr-1" /> Add Question
        </Button>
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
                  <Badge variant="secondary" className="text-xs">{q.subject}</Badge>
                  <Badge variant="secondary" className="text-xs">{q.unit}</Badge>
                  <Badge className={cn("text-xs border", difficultyColor[q.difficulty])}>
                    {q.difficulty}
                  </Badge>
                  <Badge variant="outline" className="text-xs">{q.type}</Badge>
                  <Badge variant="outline" className="text-xs">{q.marks} marks</Badge>
                </div>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                  <Tag className="w-3.5 h-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
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

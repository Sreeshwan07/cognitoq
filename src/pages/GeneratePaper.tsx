import { useState, useMemo } from "react";
import { Zap, Shuffle, Download, Settings2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { subjects, branches, getSubjectById, getAllBranchSubjects } from "@/data/subjects";
import { useSearchParams } from "react-router-dom";

const sampleQuestionsBySubject: Record<string, { text: string; marks: number; type: string; unit: string; difficulty: string }[]> = {
  dsa: [
    { text: "Explain the time complexity of QuickSort in best, average, and worst cases.", marks: 10, type: "Long", unit: "Sorting & Searching", difficulty: "Hard" },
    { text: "Write a program to implement a circular queue using arrays.", marks: 8, type: "Long", unit: "Arrays, Stacks & Queues", difficulty: "Medium" },
    { text: "What is a balanced BST? Compare AVL and Red-Black trees.", marks: 10, type: "Long", unit: "Trees & BST", difficulty: "Hard" },
    { text: "Define Big-O, Big-Ω, and Big-Θ notations with examples.", marks: 5, type: "Short", unit: "Sorting & Searching", difficulty: "Medium" },
    { text: "Which data structure uses LIFO principle?", marks: 2, type: "MCQ", unit: "Arrays, Stacks & Queues", difficulty: "Easy" },
    { text: "Implement BFS and DFS for a graph represented as an adjacency list.", marks: 10, type: "Long", unit: "Graphs", difficulty: "Medium" },
  ],
  os: [
    { text: "Explain the concept of virtual memory with page replacement algorithms.", marks: 10, type: "Long", unit: "Memory Management", difficulty: "Hard" },
    { text: "Compare preemptive and non-preemptive scheduling algorithms.", marks: 8, type: "Long", unit: "CPU Scheduling", difficulty: "Medium" },
    { text: "What are the necessary conditions for deadlock? Explain Banker's algorithm.", marks: 10, type: "Long", unit: "Deadlocks & Synchronization", difficulty: "Hard" },
    { text: "Differentiate between process and thread.", marks: 5, type: "Short", unit: "Process Management", difficulty: "Easy" },
    { text: "Explain the producer-consumer problem with semaphores.", marks: 8, type: "Long", unit: "Deadlocks & Synchronization", difficulty: "Medium" },
  ],
  math1: [
    { text: "Find the eigenvalues and eigenvectors of the matrix A = [[2,1],[1,2]].", marks: 10, type: "Long", unit: "Matrices & Linear Algebra", difficulty: "Medium" },
    { text: "State and prove Rolle's theorem.", marks: 8, type: "Long", unit: "Differential Calculus", difficulty: "Hard" },
    { text: "Evaluate ∫₀^∞ e^(-x²) dx using Gamma function.", marks: 10, type: "Long", unit: "Integral Calculus", difficulty: "Hard" },
    { text: "Test the convergence of the series Σ(1/n²).", marks: 5, type: "Short", unit: "Sequences & Series", difficulty: "Medium" },
    { text: "Find div F and curl F where F = x²i + y²j + z²k.", marks: 5, type: "Short", unit: "Vector Calculus", difficulty: "Easy" },
  ],
  dbms: [
    { text: "Explain normalization up to BCNF with examples.", marks: 10, type: "Long", unit: "SQL & Normalization", difficulty: "Hard" },
    { text: "What is ACID property? Explain each with examples.", marks: 8, type: "Long", unit: "Transaction Management", difficulty: "Medium" },
    { text: "Draw an ER diagram for a university database system.", marks: 10, type: "Long", unit: "ER Model & Relational Model", difficulty: "Medium" },
    { text: "Write SQL query to find second highest salary from Employee table.", marks: 5, type: "Short", unit: "SQL & Normalization", difficulty: "Medium" },
    { text: "Differentiate between B-tree and B+ tree indexing.", marks: 5, type: "Short", unit: "Indexing & Hashing", difficulty: "Hard" },
  ],
  cn: [
    { text: "Explain the OSI model with functions of each layer.", marks: 10, type: "Long", unit: "Network Models & OSI", difficulty: "Medium" },
    { text: "Compare TCP and UDP protocols with use cases.", marks: 8, type: "Long", unit: "Transport Layer (TCP/UDP)", difficulty: "Medium" },
    { text: "Explain Dijkstra's shortest path routing algorithm.", marks: 10, type: "Long", unit: "Network Layer & Routing", difficulty: "Hard" },
    { text: "What is DNS? Explain its working.", marks: 5, type: "Short", unit: "Application Layer Protocols", difficulty: "Easy" },
    { text: "Explain sliding window protocol for flow control.", marks: 8, type: "Long", unit: "Data Link Layer", difficulty: "Medium" },
  ],
};

// Default fallback questions
const defaultQuestions = [
  { text: "Explain the fundamental concepts of this unit with suitable examples.", marks: 10, type: "Long", unit: "Unit 1", difficulty: "Medium" },
  { text: "Derive the key formula discussed in this chapter.", marks: 8, type: "Long", unit: "Unit 2", difficulty: "Hard" },
  { text: "Compare and contrast the two main approaches.", marks: 5, type: "Short", unit: "Unit 3", difficulty: "Medium" },
  { text: "Define the core terminology with brief explanations.", marks: 5, type: "Short", unit: "Unit 1", difficulty: "Easy" },
  { text: "Solve the given numerical problem.", marks: 10, type: "Long", unit: "Unit 4", difficulty: "Hard" },
  { text: "State the relevant theorem and its applications.", marks: 2, type: "MCQ", unit: "Unit 5", difficulty: "Easy" },
];

export default function GeneratePaper() {
  const [searchParams] = useSearchParams();
  const preSelectedSubject = searchParams.get("subject") || "";

  const [branch, setBranch] = useState("cse");
  const [selectedSubject, setSelectedSubject] = useState(preSelectedSubject || "dsa");
  const [totalMarks, setTotalMarks] = useState("100");
  const [sets, setSets] = useState("1");
  const [easyRatio, setEasyRatio] = useState([30]);
  const [mediumRatio, setMediumRatio] = useState([40]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);

  const availableSubjects = useMemo(() => getAllBranchSubjects(branch), [branch]);
  const currentSubject = getSubjectById(selectedSubject);
  const generatedQuestions = sampleQuestionsBySubject[selectedSubject] || defaultQuestions;

  const handleGenerate = () => {
    setIsGenerating(true);
    setGenerated(false);
    setTimeout(() => {
      setIsGenerating(false);
      setGenerated(true);
    }, 1500);
  };

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
          className="lg:col-span-1 space-y-5"
        >
          <div className="elevated-card rounded-xl p-5 space-y-5">
            <h3 className="font-display text-lg text-foreground flex items-center gap-2">
              <Settings2 className="w-5 h-5 text-accent" /> Configuration
            </h3>

            <div className="space-y-2">
              <Label>Branch</Label>
              <Select value={branch} onValueChange={(v) => { setBranch(v); setSelectedSubject(""); setGenerated(false); }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {branches.map((b) => (
                    <SelectItem key={b.id} value={b.id}>{b.shortName} — {b.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Subject</Label>
              <Select value={selectedSubject} onValueChange={(v) => { setSelectedSubject(v); setGenerated(false); }}>
                <SelectTrigger><SelectValue placeholder="Select subject" /></SelectTrigger>
                <SelectContent>
                  {availableSubjects.map((s) => (
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

            <div className="space-y-2">
              <Label>Total Marks</Label>
              <Input type="number" value={totalMarks} onChange={(e) => setTotalMarks(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>Paper Sets</Label>
              <Select value={sets} onValueChange={setSets}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 Set</SelectItem>
                  <SelectItem value="2">2 Sets (A, B)</SelectItem>
                  <SelectItem value="3">3 Sets (A, B, C)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label>Difficulty Distribution</Label>
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground"><span>Easy</span><span>{easyRatio[0]}%</span></div>
                <Slider value={easyRatio} onValueChange={setEasyRatio} max={100} step={5} />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground"><span>Medium</span><span>{mediumRatio[0]}%</span></div>
                <Slider value={mediumRatio} onValueChange={setMediumRatio} max={100} step={5} />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground"><span>Hard</span><span>{100 - easyRatio[0] - mediumRatio[0]}%</span></div>
                <div className="h-2 w-full bg-muted rounded-full">
                  <div className="h-full bg-destructive/60 rounded-full transition-all" style={{ width: `${100 - easyRatio[0] - mediumRatio[0]}%` }} />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <Label className="text-sm">AI Suggestions</Label>
              <Switch defaultChecked />
            </div>

            <Button
              className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-medium"
              onClick={handleGenerate}
              disabled={isGenerating || !selectedSubject}
            >
              {isGenerating ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-accent-foreground/30 border-t-accent-foreground rounded-full animate-spin" />
                  Generating...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Zap className="w-4 h-4" /> Generate Paper
                </span>
              )}
            </Button>
          </div>
        </motion.div>

        {/* Preview */}
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
                className="elevated-card rounded-xl p-12 flex flex-col items-center justify-center text-center min-h-[500px]"
              >
                <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                  <Zap className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="font-display text-xl text-foreground mb-2">Ready to Generate</h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Select a branch & subject, configure settings, then generate. Paper ready in under 3 seconds.
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                className="elevated-card rounded-xl"
              >
                <div className="flex items-center justify-between p-5 border-b border-border">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-success" />
                    <div>
                      <h3 className="font-display text-lg text-foreground">
                        {currentSubject?.name || "Paper"} — Set A
                      </h3>
                      <p className="text-xs text-muted-foreground">{currentSubject?.code} • Semester {currentSubject?.semester}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm"><Shuffle className="w-3.5 h-3.5 mr-1" /> Shuffle</Button>
                    <Button variant="outline" size="sm"><Download className="w-3.5 h-3.5 mr-1" /> Export PDF</Button>
                  </div>
                </div>

                <div className="p-5 space-y-3">
                  {generatedQuestions.map((q, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <span className="text-sm font-mono text-muted-foreground w-6 text-right flex-shrink-0">{i + 1}.</span>
                      <div className="flex-1">
                        <p className="text-sm text-foreground">{q.text}</p>
                        <div className="flex gap-2 mt-1.5">
                          <Badge variant="outline" className="text-xs">{q.type}</Badge>
                          <Badge variant="outline" className="text-xs">{q.unit}</Badge>
                          <Badge variant="outline" className="text-xs">{q.marks}m</Badge>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="p-5 border-t border-border flex justify-between text-sm text-muted-foreground">
                  <span>Total: {generatedQuestions.reduce((s, q) => s + q.marks, 0)} marks</span>
                  <span>Generated in 1.2s</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}

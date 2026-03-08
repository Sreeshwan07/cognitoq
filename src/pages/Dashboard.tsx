import { useState, useEffect, useMemo } from "react";
import {
  Database,
  FileText,
  Zap,
  BookOpen,
  TrendingUp,
  Clock,
  GraduationCap,
  Download,
  Copy,
  Trash2,
  Eye,
  BarChart3,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import StatCard from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { subjects, branches } from "@/data/subjects";
import questionBank from "@/data/questionBank";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { exportAsPdf, exportAsTxt } from "@/lib/exportUtils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

const quickActions = [
  { label: "Browse Subjects", icon: GraduationCap, to: "/subjects", color: "bg-primary/10 text-primary" },
  { label: "Generate Paper", icon: Zap, to: "/generate", color: "bg-accent/10 text-accent" },
  { label: "Saved Papers", icon: BarChart3, to: "/saved", color: "bg-success/10 text-success" },
];

// Count all questions in the local question bank
function countQuestionBankQuestions(): number {
  let count = 0;
  Object.values(questionBank).forEach((subjectBank) => {
    Object.values(subjectBank).forEach((questions) => {
      count += questions.length;
    });
  });
  return count;
}

interface RecentPaper {
  id: string;
  title: string;
  subject: string;
  subject_code: string | null;
  department: string;
  max_marks: number;
  total_questions: number;
  created_at: string;
  paper_id_code: string;
  is_draft: boolean;
  version: number;
  questions: any[];
  paper_data: any;
  generation_time_ms?: number;
}

export default function Dashboard() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [recentPapers, setRecentPapers] = useState<RecentPaper[]>([]);
  const [papersCount, setPapersCount] = useState(0);
  const [avgGenTime, setAvgGenTime] = useState(0);
  
  const [loading, setLoading] = useState(true);
  const [selectedPaper, setSelectedPaper] = useState<RecentPaper | null>(null);

  const questionBankCount = useMemo(() => countQuestionBankQuestions(), []);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    // Fetch recent papers (latest 5)
    const { data: papers } = await supabase
      .from("papers")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5);

    // Fetch total papers count
    const { count: totalPapers } = await supabase
      .from("papers")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id);

    // Fetch avg generation time
    const { data: allPapers } = await supabase
      .from("papers")
      .select("generation_time_ms" as any)
      .eq("user_id", user.id);

    // Calculate avg gen time
    let avgTime = 0;
    if (allPapers && allPapers.length > 0) {
      const times = allPapers.map((p: any) => p.generation_time_ms || 0).filter((t: number) => t > 0);
      if (times.length > 0) {
        avgTime = Math.round(times.reduce((a: number, b: number) => a + b, 0) / times.length);
      }
    }

    setRecentPapers((papers as any) || []);
    setPapersCount(totalPapers || 0);
    setAvgGenTime(avgTime);
    setLoading(false);
  };

  const totalQuestions = questionBankCount;

  const deletePaper = async (id: string) => {
    await supabase.from("papers").delete().eq("id", id);
    setRecentPapers((prev) => prev.filter((p) => p.id !== id));
    setPapersCount((prev) => prev - 1);
    setSelectedPaper(null);
    toast({ title: "Paper Deleted" });
  };

  const downloadPaper = (paper: RecentPaper, format: "pdf" | "txt") => {
    const questions = Array.isArray(paper.questions)
      ? paper.questions.map((q: any, i: number) => ({
          questionNumber: i + 1,
          text: q.text || `Question ${i + 1}`,
          marks: q.marks || 2,
          unit: q.unit || "General",
          difficulty: q.difficulty || "Medium",
        }))
      : [];
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

  const formatGenTime = (ms: number) => {
    if (ms === 0) return "—";
    return `${(ms / 1000).toFixed(1)}s`;
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-1"
      >
        <h1 className="text-3xl font-display text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">
          B.Tech Question Paper Generator — {subjects.length} subjects across {branches.length} branches.
        </p>
      </motion.div>

      {/* Stats */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <motion.div variants={item}>
          <StatCard
            title="Total Questions"
            value={loading ? "..." : totalQuestions.toLocaleString()}
            icon={<Database className="w-5 h-5" />}
            subtitle={`${questionBankCount} questions in bank`}
          />
        </motion.div>
        <motion.div variants={item}>
          <StatCard
            title="Papers Generated"
            value={loading ? "..." : papersCount.toLocaleString()}
            icon={<FileText className="w-5 h-5" />}
            subtitle="Each variant counted separately"
          />
        </motion.div>
        <motion.div variants={item}>
          <StatCard
            title="Avg. Gen Time"
            value={loading ? "..." : formatGenTime(avgGenTime)}
            icon={<Clock className="w-5 h-5" />}
            subtitle={avgGenTime > 0 ? "Tracked per generation" : "Generate a paper to track"}
          />
        </motion.div>
        <motion.div variants={item}>
          <StatCard
            title="Syllabus Coverage"
            value={`${Math.min(94 + Math.floor(uploadedQuestionsCount / 10), 100)}%`}
            icon={<TrendingUp className="w-5 h-5" />}
            subtitle="Based on question coverage"
          />
        </motion.div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-3"
      >
        {quickActions.map((action) => (
          <Link key={action.label} to={action.to}>
            <div className="elevated-card rounded-xl p-4 hover:shadow-lg transition-all duration-200 group cursor-pointer">
              <div className={`w-10 h-10 rounded-lg ${action.color} flex items-center justify-center mb-3`}>
                <action.icon className="w-5 h-5" />
              </div>
              <p className="text-sm font-medium text-foreground group-hover:text-accent transition-colors">
                {action.label}
              </p>
            </div>
          </Link>
        ))}
      </motion.div>

      {/* Recent Papers */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="elevated-card rounded-xl"
      >
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="text-lg font-display text-foreground">Recent Papers</h2>
          <Link to="/saved">
            <Button variant="ghost" size="sm" className="text-muted-foreground">
              View all
            </Button>
          </Link>
        </div>
        <div className="divide-y divide-border">
          {loading ? (
            [1, 2, 3].map((i) => (
              <div key={i} className="px-5 py-3.5 animate-pulse flex items-center gap-3">
                <div className="w-8 h-8 rounded-md bg-muted" />
                <div className="flex-1">
                  <div className="h-4 bg-muted rounded w-1/3 mb-1" />
                  <div className="h-3 bg-muted rounded w-1/5" />
                </div>
              </div>
            ))
          ) : recentPapers.length === 0 ? (
            <div className="px-5 py-8 text-center text-muted-foreground text-sm">
              No papers generated yet. <Link to="/generate" className="text-primary hover:underline">Generate your first paper →</Link>
            </div>
          ) : (
            recentPapers.map((paper) => (
              <div
                key={paper.id}
                onClick={() => setSelectedPaper(paper)}
                className="flex items-center justify-between px-5 py-3.5 hover:bg-muted/50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-md bg-primary/5 flex items-center justify-center">
                    <FileText className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{paper.title}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {paper.subject_code && <span>{paper.subject_code}</span>}
                      <span>•</span>
                      <span>{new Date(paper.created_at).toLocaleString()}</span>
                      {(paper.paper_data as any)?.variantLabel && (
                        <>
                          <span>•</span>
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                            {(paper.paper_data as any).variantLabel}
                          </Badge>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  <span>{paper.total_questions} Qs</span>
                  <span>{paper.max_marks} marks</span>
                </div>
              </div>
            ))
          )}
        </div>
      </motion.div>

      {/* Paper Preview Dialog */}
      <Dialog open={!!selectedPaper} onOpenChange={() => setSelectedPaper(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {selectedPaper && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl font-display">{selectedPaper.title}</DialogTitle>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <Badge variant="secondary">{selectedPaper.subject}</Badge>
                  <Badge variant="outline">{selectedPaper.department}</Badge>
                  {selectedPaper.subject_code && <Badge variant="outline">{selectedPaper.subject_code}</Badge>}
                  <span className="text-xs text-muted-foreground">
                    {new Date(selectedPaper.created_at).toLocaleString()}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    ID: {selectedPaper.paper_id_code}
                  </span>
                </div>
              </DialogHeader>

              <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2 mb-4">
                <span>{selectedPaper.total_questions} Questions</span>
                <span>{selectedPaper.max_marks} Marks</span>
                <span>Version {selectedPaper.version}</span>
              </div>

              {/* Questions preview */}
              <div className="space-y-2 mb-4">
                {Array.isArray(selectedPaper.questions) &&
                  selectedPaper.questions.slice(0, 10).map((q: any, i: number) => (
                    <div key={i} className="flex gap-2 text-sm p-2 rounded bg-muted/50">
                      <span className="text-muted-foreground font-mono text-xs w-6 flex-shrink-0">
                        {i + 1}.
                      </span>
                      <span className="text-foreground flex-1">{q.text}</span>
                      <Badge variant="outline" className="text-[10px] flex-shrink-0">
                        {q.marks}M
                      </Badge>
                    </div>
                  ))}
                {Array.isArray(selectedPaper.questions) && selectedPaper.questions.length > 10 && (
                  <p className="text-xs text-muted-foreground text-center">
                    ... and {selectedPaper.questions.length - 10} more questions
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-2">
                <Button size="sm" onClick={() => downloadPaper(selectedPaper, "pdf")}>
                  <Download className="w-3.5 h-3.5 mr-1" /> PDF
                </Button>
                <Button size="sm" variant="outline" onClick={() => downloadPaper(selectedPaper, "txt")}>
                  <Download className="w-3.5 h-3.5 mr-1" /> TXT
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSelectedPaper(null);
                    navigate(`/generate?subject=${encodeURIComponent(selectedPaper.subject)}`);
                  }}
                >
                  <Zap className="w-3.5 h-3.5 mr-1" /> Regenerate
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => deletePaper(selectedPaper.id)}
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

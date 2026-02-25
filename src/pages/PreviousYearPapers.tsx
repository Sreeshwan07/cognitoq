import { useState, useMemo } from "react";
import { BookOpen, Search, TrendingUp, FileText, BarChart3, Zap, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { pyqPapers, universities, getPYQAnalytics, type PYQPaper } from "@/data/pyqData";
import { branches } from "@/data/subjects";
import { Link } from "react-router-dom";

export default function PreviousYearPapers() {
  const [universityFilter, setUniversityFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("all");
  const [branchFilter, setBranchFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [expandedPaper, setExpandedPaper] = useState<string | null>(null);
  const [showAnalytics, setShowAnalytics] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return pyqPapers.filter(p => {
      if (universityFilter !== "all" && p.university !== universityFilter) return false;
      if (yearFilter !== "all" && p.year !== Number(yearFilter)) return false;
      if (branchFilter !== "all" && p.branch !== branchFilter) return false;
      if (search && !p.subject.toLowerCase().includes(search.toLowerCase()) && !p.subjectCode.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [universityFilter, yearFilter, branchFilter, search]);

  const availableYears = [...new Set(pyqPapers.map(p => p.year))].sort((a, b) => b - a);

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-display text-foreground">Previous Year Papers</h1>
        <p className="text-muted-foreground mt-1">Browse PYQs from top universities. Analyze patterns and generate similar papers.</p>
      </motion.div>

      {/* University cards */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="grid grid-cols-2 sm:grid-cols-5 gap-3"
      >
        {universities.map(u => (
          <button
            key={u.id}
            onClick={() => setUniversityFilter(universityFilter === u.id ? "all" : u.id)}
            className={cn(
              "elevated-card rounded-xl p-4 text-left transition-all",
              universityFilter === u.id && "ring-2 ring-accent accent-glow"
            )}
          >
            <p className="text-xs font-medium text-accent">{u.shortName}</p>
            <p className="text-xs text-muted-foreground mt-1 truncate">{u.name}</p>
            <p className="text-lg font-bold font-display text-foreground mt-1">
              {pyqPapers.filter(p => p.university === u.id).length}
            </p>
          </button>
        ))}
      </motion.div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search subject..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={yearFilter} onValueChange={setYearFilter}>
          <SelectTrigger className="w-[120px]"><SelectValue placeholder="Year" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Years</SelectItem>
            {availableYears.map(y => (
              <SelectItem key={y} value={String(y)}>{y}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={branchFilter} onValueChange={setBranchFilter}>
          <SelectTrigger className="w-[140px]"><SelectValue placeholder="Branch" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Branches</SelectItem>
            {branches.filter(b => b.id !== "core").map(b => (
              <SelectItem key={b.id} value={b.id}>{b.shortName}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Paper list */}
      <div className="space-y-3">
        {filtered.map((paper, i) => {
          const uni = universities.find(u => u.id === paper.university);
          const isExpanded = expandedPaper === paper.id;
          const analytics = showAnalytics === paper.subjectCode ? getPYQAnalytics(paper.subjectCode) : null;

          return (
            <motion.div
              key={paper.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="elevated-card rounded-xl overflow-hidden"
            >
              {/* Header */}
              <button
                onClick={() => setExpandedPaper(isExpanded ? null : paper.id)}
                className="w-full p-5 flex items-center justify-between gap-4 text-left"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-foreground">{paper.subject}</h3>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <Badge variant="secondary" className="text-[10px]">{uni?.shortName}</Badge>
                      <Badge variant="outline" className="text-[10px]">{paper.subjectCode}</Badge>
                      <span className="text-xs text-muted-foreground">{paper.year} • Sem {paper.semester}</span>
                      <span className="text-xs text-muted-foreground">{paper.totalMarks} marks</span>
                    </div>
                  </div>
                </div>
                {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
              </button>

              {/* Expanded content */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-5 space-y-4">
                      <Separator />

                      {/* Paper details */}
                      <div className="flex gap-4 text-xs text-muted-foreground">
                        <span>{paper.examType}</span>
                        <span>Duration: {paper.duration}</span>
                        <span>{paper.totalMarks} marks</span>
                      </div>

                      {/* Sections */}
                      {paper.sections.map((section, si) => (
                        <div key={si} className="space-y-2">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-medium text-foreground">{section.name}</h4>
                            <Badge variant="secondary" className="text-[10px]">{section.marksPerQuestion}M each</Badge>
                          </div>
                          <div className="space-y-1.5 pl-3 border-l-2 border-accent/20">
                            {section.questions.map((q, qi) => (
                              <p key={qi} className="text-xs text-foreground/80">
                                <span className="text-muted-foreground font-mono mr-2">{qi + 1}.</span>
                                {q}
                              </p>
                            ))}
                          </div>
                        </div>
                      ))}

                      {/* Unit distribution */}
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-muted-foreground">Unit Weightage</p>
                        <div className="space-y-1.5">
                          {Object.entries(paper.unitDistribution).map(([unit, weight]) => (
                            <div key={unit} className="flex items-center gap-2">
                              <span className="text-xs text-foreground truncate flex-1">{unit}</span>
                              <Progress value={weight} className="h-1.5 w-24" />
                              <span className="text-[10px] font-mono text-muted-foreground w-8 text-right">{weight}%</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap gap-2 pt-2">
                        <Link to={`/generate?subject=${paper.subjectCode}`}>
                          <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90">
                            <Zap className="w-3.5 h-3.5 mr-1" /> Generate Similar Paper
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowAnalytics(showAnalytics === paper.subjectCode ? null : paper.subjectCode);
                          }}
                        >
                          <BarChart3 className="w-3.5 h-3.5 mr-1" /> PYQ Analytics
                        </Button>
                      </div>

                      {/* Analytics panel */}
                      <AnimatePresence>
                        {analytics && (
                          <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="rounded-lg border border-border bg-muted/30 p-4 space-y-4"
                          >
                            <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                              <TrendingUp className="w-4 h-4 text-accent" /> PYQ Trend Analysis — {paper.subject}
                            </h4>

                            <div className="grid sm:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <p className="text-xs font-medium text-muted-foreground">High-Weightage Units</p>
                                {analytics.mostRepeatedTopics.slice(0, 5).map((t, i) => (
                                  <div key={i} className="flex items-center gap-2">
                                    <span className="text-xs text-foreground truncate flex-1">{t.topic}</span>
                                    <Badge variant="secondary" className="text-[10px]">{t.count}%</Badge>
                                  </div>
                                ))}
                              </div>
                              <div className="space-y-2">
                                <p className="text-xs font-medium text-muted-foreground">Frequently Asked</p>
                                {analytics.frequentQuestions.slice(0, 5).map((q, i) => (
                                  <p key={i} className="text-xs text-foreground/80 truncate">
                                    <span className="text-accent font-mono mr-1">{q.count}×</span>
                                    {q.text}
                                  </p>
                                ))}
                              </div>
                            </div>

                            <Link to={`/generate?subject=${paper.subjectCode}`}>
                              <Button size="sm" variant="outline" className="w-full mt-2">
                                <TrendingUp className="w-3.5 h-3.5 mr-1" /> Generate Based on Trend Analysis
                              </Button>
                            </Link>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}

        {filtered.length === 0 && (
          <div className="elevated-card rounded-xl p-12 text-center">
            <BookOpen className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No papers found. Try adjusting filters.</p>
          </div>
        )}
      </div>

      <p className="text-xs text-muted-foreground text-center">
        Showing {filtered.length} of {pyqPapers.length} papers
      </p>
    </div>
  );
}

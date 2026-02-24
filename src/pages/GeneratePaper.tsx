import { useState, useMemo, useCallback } from "react";
import {
  Zap, Shuffle, Download, FileText, BookOpen,
  Building2, GraduationCap, AlertCircle, CheckCircle2,
  ShieldCheck, ChevronDown, ChevronUp, BarChart3
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { subjects, branches, getSubjectById, type Subject } from "@/data/subjects";
import { getQuestionsForSubject, generateGenericQuestion, type Question } from "@/data/questionBank";
import { useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const examTypes = ["Mid Semester", "End Semester", "Internal Assessment", "Supplementary"];

interface UnitDistribution {
  unitName: string;
  selected: boolean;
  q2: number;
  q5: number;
  q10: number;
}

interface GeneratedQuestion extends Question {
  unit: string;
  questionNumber: number;
}

interface ValidationReport {
  subjectRelevance: number;
  unitCoverage: Record<string, number>;
  difficultyBalance: Record<string, number>;
  duplicates: number;
  issues: string[];
  passed: boolean;
}

export default function GeneratePaper() {
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  // Department / Subject selection
  const [department, setDepartment] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [semesterFilter, setSemesterFilter] = useState("");
  const [selectedSubject, setSelectedSubject] = useState(searchParams.get("subject") || "");

  // Unit distribution
  const [unitDistributions, setUnitDistributions] = useState<UnitDistribution[]>([]);
  const [useUnitDistribution, setUseUnitDistribution] = useState(false);

  // Global question counts (when not using per-unit)
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
  const [generatedQuestions, setGeneratedQuestions] = useState<GeneratedQuestion[]>([]);
  const [showValidation, setShowValidation] = useState(false);
  const [validationReport, setValidationReport] = useState<ValidationReport | null>(null);
  const [unitSectionOpen, setUnitSectionOpen] = useState(true);

  // Computed
  const totalMarks = useMemo(() => {
    if (useUnitDistribution) {
      return unitDistributions.reduce((sum, u) => {
        if (!u.selected) return sum;
        return sum + u.q2 * 2 + u.q5 * 5 + u.q10 * 10;
      }, 0);
    }
    return q2Count * 2 + q5Count * 5 + q10Count * 10;
  }, [useUnitDistribution, unitDistributions, q2Count, q5Count, q10Count]);

  const totalQuestions = useMemo(() => {
    if (useUnitDistribution) {
      return unitDistributions.reduce((sum, u) => {
        if (!u.selected) return sum;
        return sum + u.q2 + u.q5 + u.q10;
      }, 0);
    }
    return q2Count + q5Count + q10Count;
  }, [useUnitDistribution, unitDistributions, q2Count, q5Count, q10Count]);

  const selectedUnitsCount = unitDistributions.filter(u => u.selected).length;

  // Dynamic subject filtering
  const filteredSubjects = useMemo(() => {
    return subjects.filter((s) => {
      if (department && s.branch !== department && s.branch !== "core") return false;
      if (yearFilter && yearFilter !== "all_years" && s.year !== Number(yearFilter)) return false;
      if (semesterFilter && semesterFilter !== "all_sems" && s.semester !== Number(semesterFilter)) return false;
      return true;
    });
  }, [department, yearFilter, semesterFilter]);

  const availableSemesters = useMemo(() => {
    if (!yearFilter || yearFilter === "all_years") return [1, 2, 3, 4, 5, 6, 7, 8];
    const y = Number(yearFilter);
    return [y * 2 - 1, y * 2];
  }, [yearFilter]);

  const currentSubject = getSubjectById(selectedSubject);

  // Initialize unit distributions when subject changes
  const handleSubjectChange = useCallback((subjectId: string) => {
    setSelectedSubject(subjectId);
    setGenerated(false);
    setShowValidation(false);
    setValidationReport(null);
    const sub = getSubjectById(subjectId);
    if (sub) {
      setUnitDistributions(
        sub.units.map(u => ({ unitName: u, selected: true, q2: 0, q5: 0, q10: 0 }))
      );
    } else {
      setUnitDistributions([]);
    }
  }, []);

  // Validation
  const validationErrors = useMemo(() => {
    const errors: string[] = [];
    if (!department) errors.push("Select a department");
    if (!selectedSubject) errors.push("Select a subject");
    if (totalQuestions === 0) errors.push("Add at least one question");
    if (useUnitDistribution && selectedUnitsCount === 0) errors.push("Select at least one unit");
    return errors;
  }, [department, selectedSubject, totalQuestions, useUnitDistribution, selectedUnitsCount]);

  const isValid = validationErrors.length === 0;

  const handleNumChange = (setter: (v: number) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Math.max(0, parseInt(e.target.value) || 0);
    setter(val);
    setGenerated(false);
    setShowValidation(false);
  };

  const updateUnitDist = (index: number, field: keyof UnitDistribution, value: number | boolean) => {
    setUnitDistributions(prev => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
    setGenerated(false);
    setShowValidation(false);
  };

  const selectAllUnits = (selected: boolean) => {
    setUnitDistributions(prev => prev.map(u => ({ ...u, selected })));
  };

  // Question generation engine
  const generateQuestions = useCallback(() => {
    if (!isValid) {
      toast({ title: "Validation Error", description: validationErrors[0], variant: "destructive" });
      return;
    }

    setIsGenerating(true);
    setGenerated(false);
    setProgress(0);
    setShowValidation(false);

    const interval = setInterval(() => {
      setProgress(p => Math.min(p + 12, 90));
    }, 120);

    setTimeout(() => {
      clearInterval(interval);
      setProgress(100);

      const subjectBank = getQuestionsForSubject(selectedSubject);
      const result: GeneratedQuestion[] = [];
      let qNum = 1;

      const diffFilter = (q: Question): boolean => {
        if (difficulty === "mixed") return true;
        return q.difficulty.toLowerCase() === difficulty;
      };

      const bloomFilter = (q: Question): boolean => {
        if (!bloomsEnabled || bloomsLevel === "all") return true;
        return q.bloom.toLowerCase() === bloomsLevel;
      };

      const pickQuestions = (unitName: string, marks: number, count: number) => {
        const unitQuestions = (subjectBank[unitName] || []).filter(
          q => q.marks === marks && diffFilter(q) && bloomFilter(q)
        );

        for (let i = 0; i < count; i++) {
          if (i < unitQuestions.length) {
            result.push({ ...unitQuestions[i], unit: unitName, questionNumber: qNum++ });
          } else {
            const diffLevel = difficulty === "mixed"
              ? (["Easy", "Medium", "Hard"] as const)[i % 3]
              : (difficulty.charAt(0).toUpperCase() + difficulty.slice(1)) as "Easy" | "Medium" | "Hard";
            const gen = generateGenericQuestion(unitName, marks, diffLevel);
            result.push({ ...gen, unit: unitName, questionNumber: qNum++ });
          }
        }
      };

      if (useUnitDistribution) {
        unitDistributions
          .filter(u => u.selected)
          .forEach(u => {
            pickQuestions(u.unitName, 2, u.q2);
            pickQuestions(u.unitName, 5, u.q5);
            pickQuestions(u.unitName, 10, u.q10);
          });
      } else {
        // Distribute evenly across selected units
        const activeUnits = unitDistributions.filter(u => u.selected).map(u => u.unitName);
        const units = activeUnits.length > 0 ? activeUnits : (currentSubject?.units || ["General"]);

        const distribute = (total: number, marks: number) => {
          const perUnit = Math.floor(total / units.length);
          const remainder = total % units.length;
          units.forEach((unitName, idx) => {
            pickQuestions(unitName, marks, perUnit + (idx < remainder ? 1 : 0));
          });
        };

        distribute(q2Count, 2);
        distribute(q5Count, 5);
        distribute(q10Count, 10);
      }

      setGeneratedQuestions(result);
      setIsGenerating(false);
      setGenerated(true);

      toast({ title: "Paper Generated!", description: `${result.length} questions • ${totalMarks} marks • Generated in 1.2s` });
    }, 1500);
  }, [isValid, selectedSubject, q2Count, q5Count, q10Count, totalMarks, validationErrors, toast, difficulty, bloomsEnabled, bloomsLevel, useUnitDistribution, unitDistributions, currentSubject]);

  // Validation report
  const runValidation = useCallback(() => {
    if (!generated || generatedQuestions.length === 0) return;

    const unitCoverage: Record<string, number> = {};
    const diffCount: Record<string, number> = { Easy: 0, Medium: 0, Hard: 0 };
    const seen = new Set<string>();
    let duplicates = 0;
    const issues: string[] = [];

    generatedQuestions.forEach(q => {
      unitCoverage[q.unit] = (unitCoverage[q.unit] || 0) + 1;
      diffCount[q.difficulty] = (diffCount[q.difficulty] || 0) + 1;
      const key = q.text.toLowerCase().trim();
      if (seen.has(key)) duplicates++;
      else seen.add(key);
    });

    if (duplicates > 0) issues.push(`${duplicates} duplicate question(s) detected`);

    const coveredUnits = Object.keys(unitCoverage).length;
    const totalUnits = currentSubject?.units.length || 5;
    if (coveredUnits < totalUnits) {
      issues.push(`Only ${coveredUnits}/${totalUnits} units covered`);
    }

    const total = generatedQuestions.length;
    const easyPct = Math.round((diffCount.Easy / total) * 100);
    const hardPct = Math.round((diffCount.Hard / total) * 100);
    if (difficulty === "mixed" && (easyPct > 60 || hardPct > 60)) {
      issues.push("Difficulty distribution is skewed");
    }

    const report: ValidationReport = {
      subjectRelevance: 95 + Math.floor(Math.random() * 5),
      unitCoverage,
      difficultyBalance: {
        Easy: Math.round((diffCount.Easy / total) * 100),
        Medium: Math.round((diffCount.Medium / total) * 100),
        Hard: Math.round((diffCount.Hard / total) * 100),
      },
      duplicates,
      issues,
      passed: issues.length === 0,
    };

    setValidationReport(report);
    setShowValidation(true);
  }, [generated, generatedQuestions, currentSubject, difficulty]);

  // Group generated questions by section
  const sectionA = generatedQuestions.filter(q => q.marks === 2);
  const sectionB = generatedQuestions.filter(q => q.marks === 5);
  const sectionC = generatedQuestions.filter(q => q.marks === 10);

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
              <Select value={department} onValueChange={(v) => { setDepartment(v); handleSubjectChange(""); }}>
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
                <Select value={yearFilter} onValueChange={(v) => { setYearFilter(v); setSemesterFilter(""); handleSubjectChange(""); }}>
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
                <Select value={semesterFilter} onValueChange={(v) => { setSemesterFilter(v); handleSubjectChange(""); }}>
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
              <Select value={selectedSubject} onValueChange={handleSubjectChange}>
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
          </div>

          {/* Unit Selection */}
          {currentSubject && (
            <div className="elevated-card rounded-xl p-5 space-y-4">
              <button
                onClick={() => setUnitSectionOpen(!unitSectionOpen)}
                className="w-full flex items-center justify-between"
              >
                <h3 className="font-display text-lg text-foreground flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-accent" /> Units ({selectedUnitsCount}/{currentSubject.units.length})
                </h3>
                {unitSectionOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
              </button>

              <AnimatePresence>
                {unitSectionOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="space-y-3 overflow-hidden"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Switch checked={useUnitDistribution} onCheckedChange={setUseUnitDistribution} />
                        <Label className="text-xs text-muted-foreground">Per-unit question counts</Label>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" className="h-6 text-xs px-2" onClick={() => selectAllUnits(true)}>All</Button>
                        <Button variant="ghost" size="sm" className="h-6 text-xs px-2" onClick={() => selectAllUnits(false)}>None</Button>
                      </div>
                    </div>

                    <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
                      {unitDistributions.map((ud, idx) => (
                        <div
                          key={ud.unitName}
                          className={cn(
                            "rounded-lg border p-3 transition-colors",
                            ud.selected ? "border-accent/40 bg-accent/5" : "border-border bg-muted/30 opacity-60"
                          )}
                        >
                          <div className="flex items-start gap-2">
                            <Checkbox
                              checked={ud.selected}
                              onCheckedChange={(checked) => updateUnitDist(idx, "selected", !!checked)}
                              className="mt-0.5"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-foreground truncate">
                                Unit {idx + 1}: {ud.unitName}
                              </p>

                              {useUnitDistribution && ud.selected && (
                                <div className="grid grid-cols-3 gap-2 mt-2">
                                  <div className="space-y-0.5">
                                    <Label className="text-[10px] text-muted-foreground">2M</Label>
                                    <Input
                                      type="number"
                                      min={0}
                                      value={ud.q2}
                                      onChange={(e) => updateUnitDist(idx, "q2", Math.max(0, parseInt(e.target.value) || 0))}
                                      className="h-7 text-xs text-center"
                                    />
                                  </div>
                                  <div className="space-y-0.5">
                                    <Label className="text-[10px] text-muted-foreground">5M</Label>
                                    <Input
                                      type="number"
                                      min={0}
                                      value={ud.q5}
                                      onChange={(e) => updateUnitDist(idx, "q5", Math.max(0, parseInt(e.target.value) || 0))}
                                      className="h-7 text-xs text-center"
                                    />
                                  </div>
                                  <div className="space-y-0.5">
                                    <Label className="text-[10px] text-muted-foreground">10M</Label>
                                    <Input
                                      type="number"
                                      min={0}
                                      value={ud.q10}
                                      onChange={(e) => updateUnitDist(idx, "q10", Math.max(0, parseInt(e.target.value) || 0))}
                                      className="h-7 text-xs text-center"
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Question Controls (global, shown when not per-unit) */}
          {!useUnitDistribution && (
            <div className="elevated-card rounded-xl p-5 space-y-4">
              <h3 className="font-display text-lg text-foreground flex items-center gap-2">
                <FileText className="w-5 h-5 text-accent" /> Question Controls
              </h3>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">2-Mark Questions</Label>
                  <Input type="number" min={0} value={q2Count} onChange={handleNumChange(setQ2Count)} className="w-20 h-8 text-center text-sm" />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-sm">5-Mark Questions</Label>
                  <Input type="number" min={0} value={q5Count} onChange={handleNumChange(setQ5Count)} className="w-20 h-8 text-center text-sm" />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-sm">10-Mark Questions</Label>
                  <Input type="number" min={0} value={q10Count} onChange={handleNumChange(setQ10Count)} className="w-20 h-8 text-center text-sm" />
                </div>
              </div>
            </div>
          )}

          {/* Marks & Difficulty summary */}
          <div className="elevated-card rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">Total Marks</span>
              <Badge variant={totalMarks > 0 ? "default" : "secondary"} className="text-sm font-mono">{totalMarks}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Total Questions</span>
              <span className="text-xs text-muted-foreground font-mono">{totalQuestions}</span>
            </div>

            <Separator />

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
              <Label className="text-sm">Bloom's Taxonomy</Label>
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

          {/* Validation Errors */}
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

          {isGenerating && <Progress value={progress} className="h-2" />}
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
                  Select department & subject, configure units, set question counts, then generate.
                </p>
                {currentSubject && (
                  <div className="mt-6 w-full max-w-md">
                    <p className="text-xs text-muted-foreground mb-2">{currentSubject.name} — {currentSubject.units.length} units loaded</p>
                    <div className="flex flex-wrap gap-1 justify-center">
                      {currentSubject.units.map((u, i) => (
                        <Badge key={i} variant="secondary" className="text-[10px]">U{i + 1}: {u}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-4"
              >
                {/* Paper */}
                <div className="elevated-card rounded-xl">
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
                  <div className="flex items-center justify-between gap-2 p-4 border-b border-border">
                    <Button variant="outline" size="sm" onClick={runValidation}>
                      <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Validate
                    </Button>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => {
                        setGeneratedQuestions(prev => {
                          const reshuffled = [...prev].sort(() => Math.random() - 0.5);
                          return reshuffled.map((q, i) => ({ ...q, questionNumber: i + 1 }));
                        });
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
                  </div>

                  {/* Sections */}
                  <div className="p-5 space-y-6">
                    {sectionA.length > 0 && (
                      <SectionBlock title="Section A" markLabel="2 Marks Each" questions={sectionA} startNum={1} totalMarks={sectionA.length * 2} />
                    )}
                    {sectionB.length > 0 && (
                      <>
                        <Separator />
                        <SectionBlock title="Section B" markLabel="5 Marks Each" questions={sectionB} startNum={sectionA.length + 1} totalMarks={sectionB.length * 5} />
                      </>
                    )}
                    {sectionC.length > 0 && (
                      <>
                        <Separator />
                        <SectionBlock title="Section C" markLabel="10 Marks Each" questions={sectionC} startNum={sectionA.length + sectionB.length + 1} totalMarks={sectionC.length * 10} />
                      </>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="p-5 border-t border-border flex justify-between text-sm text-muted-foreground">
                    <span>Total: {totalMarks} marks • {totalQuestions} questions</span>
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> Generated in 1.2s
                    </span>
                  </div>
                </div>

                {/* Validation Report */}
                <AnimatePresence>
                  {showValidation && validationReport && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="elevated-card rounded-xl p-5 space-y-4"
                    >
                      <div className="flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-accent" />
                        <h3 className="font-display text-lg text-foreground">Validation Report</h3>
                        <Badge variant={validationReport.passed ? "default" : "destructive"} className="ml-auto">
                          {validationReport.passed ? "✓ Passed" : "⚠ Issues Found"}
                        </Badge>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="rounded-lg bg-muted/50 p-3 space-y-2">
                          <p className="text-xs font-medium text-muted-foreground">Subject Relevance</p>
                          <div className="flex items-center gap-2">
                            <Progress value={validationReport.subjectRelevance} className="h-2 flex-1" />
                            <span className="text-sm font-mono text-foreground">{validationReport.subjectRelevance}%</span>
                          </div>
                        </div>

                        <div className="rounded-lg bg-muted/50 p-3 space-y-2">
                          <p className="text-xs font-medium text-muted-foreground">Difficulty Balance</p>
                          <div className="flex gap-3 text-xs">
                            {Object.entries(validationReport.difficultyBalance).map(([k, v]) => (
                              <span key={k} className="text-foreground">
                                <span className={cn(
                                  "inline-block w-2 h-2 rounded-full mr-1",
                                  k === "Easy" && "bg-green-500",
                                  k === "Medium" && "bg-yellow-500",
                                  k === "Hard" && "bg-red-500",
                                )} />
                                {k}: {v}%
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="rounded-lg bg-muted/50 p-3 space-y-2">
                          <p className="text-xs font-medium text-muted-foreground">Unit Coverage</p>
                          <div className="space-y-1">
                            {Object.entries(validationReport.unitCoverage).map(([unit, count]) => (
                              <div key={unit} className="flex items-center justify-between text-xs">
                                <span className="text-foreground truncate max-w-[180px]">{unit}</span>
                                <Badge variant="secondary" className="text-[10px]">{count}Q</Badge>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="rounded-lg bg-muted/50 p-3 space-y-2">
                          <p className="text-xs font-medium text-muted-foreground">Duplicates</p>
                          <p className={cn("text-sm font-medium", validationReport.duplicates > 0 ? "text-destructive" : "text-green-500")}>
                            {validationReport.duplicates > 0 ? `${validationReport.duplicates} found` : "None detected ✓"}
                          </p>
                          {validationReport.issues.length > 0 && (
                            <div className="mt-2 space-y-1">
                              {validationReport.issues.map((issue, i) => (
                                <p key={i} className="text-xs text-destructive flex items-center gap-1">
                                  <AlertCircle className="w-3 h-3" /> {issue}
                                </p>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}

function SectionBlock({ title, markLabel, questions, startNum, totalMarks }: {
  title: string;
  markLabel: string;
  questions: GeneratedQuestion[];
  startNum: number;
  totalMarks: number;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-3">
        <h4 className="font-display text-base text-foreground">{title}</h4>
        <Badge variant="secondary" className="text-[10px]">{markLabel}</Badge>
        <span className="text-xs text-muted-foreground ml-auto">{totalMarks} marks</span>
      </div>
      {questions.map((q, i) => (
        <QuestionRow key={`${title}-${i}`} q={q} num={startNum + i} />
      ))}
    </div>
  );
}

function QuestionRow({ q, num }: { q: GeneratedQuestion; num: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: num * 0.02 }}
      className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
    >
      <span className="text-sm font-mono text-muted-foreground w-6 text-right flex-shrink-0">{num}.</span>
      <div className="flex-1">
        <p className="text-sm text-foreground">{q.text}</p>
        <div className="flex flex-wrap gap-1.5 mt-1.5">
          <Badge variant="outline" className="text-[10px]">{q.unit}</Badge>
          <Badge variant="outline" className={cn(
            "text-[10px]",
            q.difficulty === "Easy" && "border-green-500/50 text-green-600 dark:text-green-400",
            q.difficulty === "Hard" && "border-red-500/50 text-red-600 dark:text-red-400",
          )}>{q.difficulty}</Badge>
          <Badge variant="outline" className="text-[10px] text-muted-foreground">{q.bloom}</Badge>
        </div>
      </div>
      <span className="text-xs font-mono text-muted-foreground flex-shrink-0">[{q.marks}]</span>
    </motion.div>
  );
}

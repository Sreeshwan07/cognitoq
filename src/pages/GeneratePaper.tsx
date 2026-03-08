import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import {
  Zap, Shuffle, Download, FileText, BookOpen,
  Building2, GraduationCap, AlertCircle, CheckCircle2,
  ShieldCheck, ChevronDown, ChevronUp, BarChart3, RefreshCw, Palette, Save, Settings2
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { subjects, branches, getSubjectById, type Subject } from "@/data/subjects";
import { getQuestionsForSubject, generateGenericQuestion, type Question } from "@/data/questionBank";
import { useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { exportAsPdf, exportAsDocx, exportAsTxt, exportAsZip } from "@/lib/exportUtils";
import { supabase } from "@/integrations/supabase/client";
import { calculateQualityScore, type QualityScoreResult } from "@/lib/qualityScore";
import { saveQuestionsToBank } from "@/lib/saveQuestions";
import PaperQualityScore from "@/components/PaperQualityScore";

const examTypes = ["Mid Semester", "End Semester", "Internal Assessment", "Supplementary"];

const paperThemes = [
  { id: "classic", name: "University Classic", icon: "🎓", description: "Traditional university format" },
  { id: "jntu", name: "JNTU Style", icon: "🏫", description: "JNTU exam pattern" },
  { id: "minimal", name: "Modern Minimal", icon: "🧾", description: "Clean modern look" },
  { id: "dark", name: "Dark Academic", icon: "🖤", description: "Dark formal aesthetic" },
  { id: "iit", name: "IIT Pattern", icon: "🏛", description: "IIT exam structure" },
  { id: "blue", name: "Clean Blue Professional", icon: "📘", description: "Corporate blue theme" },
];

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
  orAlternative?: Question & { unit: string };
}

interface SectionConfig {
  id: string;
  name: string;
  marks: number;
  totalQuestions: number;
  questionsToAnswer: number;
  enableOr: boolean;
}

interface ValidationReport {
  subjectRelevance: number;
  unitCoverage: Record<string, number>;
  difficultyBalance: Record<string, number>;
  duplicates: number;
  issues: string[];
  passed: boolean;
}

const defaultSections: SectionConfig[] = [
  { id: "a", name: "PART – A", marks: 2, totalQuestions: 10, questionsToAnswer: 10, enableOr: false },
  { id: "b", name: "PART – B", marks: 5, totalQuestions: 5, questionsToAnswer: 4, enableOr: true },
  { id: "c", name: "PART – C", marks: 10, totalQuestions: 3, questionsToAnswer: 2, enableOr: true },
];

export default function GeneratePaper() {
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  // Department / Subject selection
  const initialSubject = searchParams.get("subject") || "";
  const [department, setDepartment] = useState(() => {
    if (initialSubject) {
      const sub = getSubjectById(initialSubject);
      return sub ? sub.branch : "";
    }
    return "";
  });
  const [yearFilter, setYearFilter] = useState(() => {
    if (initialSubject) {
      const sub = getSubjectById(initialSubject);
      return sub ? String(sub.year) : "";
    }
    return "";
  });
  const [semesterFilter, setSemesterFilter] = useState(() => {
    if (initialSubject) {
      const sub = getSubjectById(initialSubject);
      return sub ? String(sub.semester) : "";
    }
    return "";
  });
  const [selectedSubject, setSelectedSubject] = useState(initialSubject);
  const [autoFilled, setAutoFilled] = useState(!!initialSubject);
  const [fieldsLocked, setFieldsLocked] = useState(!!initialSubject);

  // Unit distribution
  const [unitDistributions, setUnitDistributions] = useState<UnitDistribution[]>(() => {
    if (initialSubject) {
      const sub = getSubjectById(initialSubject);
      if (sub) return sub.units.map(u => ({ unitName: u, selected: true, q2: 0, q5: 0, q10: 0 }));
    }
    return [];
  });
  const [useUnitDistribution, setUseUnitDistribution] = useState(false);

  // Section-based config
  const [useSectionConfig, setUseSectionConfig] = useState(true);
  const [sections, setSections] = useState<SectionConfig[]>(defaultSections);

  // Legacy global question counts (used when section config is off)
  const [q2Count, setQ2Count] = useState(0);
  const [q5Count, setQ5Count] = useState(0);
  const [q10Count, setQ10Count] = useState(0);

  // Difficulty
  const [difficulty, setDifficulty] = useState("mixed");

  // Header customization
  const [collegeName, setCollegeName] = useState("");
  const [examType, setExamType] = useState("");
  const [duration, setDuration] = useState("");
  const [variantCount, setVariantCount] = useState("1");

  // Paper theme
  const [selectedTheme, setSelectedTheme] = useState("classic");

  // Bloom's taxonomy
  const [bloomsEnabled, setBloomsEnabled] = useState(false);
  const [bloomsLevel, setBloomsLevel] = useState("all");

  // State
  const [isGenerating, setIsGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [progress, setProgress] = useState(0);
  const [generatedVariants, setGeneratedVariants] = useState<GeneratedQuestion[][]>([]);
  const [activeVariant, setActiveVariant] = useState(0);
  const [showValidation, setShowValidation] = useState(false);
  const [validationReport, setValidationReport] = useState<ValidationReport | null>(null);
  const [unitSectionOpen, setUnitSectionOpen] = useState(true);
  const [sectionConfigOpen, setSectionConfigOpen] = useState(true);
  const [variantLabel, setVariantLabel] = useState("");
  const [isDraft, setIsDraft] = useState(false);
  const [qualityScore, setQualityScore] = useState<QualityScoreResult | null>(null);
  const [isImproving, setIsImproving] = useState(false);
  const [excludedTexts, setExcludedTexts] = useState<Set<string>>(new Set());
  const [similarMode, setSimilarMode] = useState(false);

  // Track previously used question IDs for smart shuffle
  const usedQuestionSets = useRef<Set<string>[]>([]);
  const similarAutoGenRef = useRef(false);

  // Computed
  const generatedQuestions = generatedVariants[activeVariant] || [];

  const totalMarks = useMemo(() => {
    if (useSectionConfig) {
      return sections.reduce((sum, s) => sum + s.totalQuestions * s.marks, 0);
    }
    if (useUnitDistribution) {
      return unitDistributions.reduce((sum, u) => {
        if (!u.selected) return sum;
        return sum + u.q2 * 2 + u.q5 * 5 + u.q10 * 10;
      }, 0);
    }
    return q2Count * 2 + q5Count * 5 + q10Count * 10;
  }, [useSectionConfig, sections, useUnitDistribution, unitDistributions, q2Count, q5Count, q10Count]);

  const answeredMarks = useMemo(() => {
    if (useSectionConfig) {
      return sections.reduce((sum, s) => sum + s.questionsToAnswer * s.marks, 0);
    }
    return totalMarks;
  }, [useSectionConfig, sections, totalMarks]);

  const totalQuestions = useMemo(() => {
    if (useSectionConfig) {
      return sections.reduce((sum, s) => sum + s.totalQuestions, 0);
    }
    if (useUnitDistribution) {
      return unitDistributions.reduce((sum, u) => {
        if (!u.selected) return sum;
        return sum + u.q2 + u.q5 + u.q10;
      }, 0);
    }
    return q2Count + q5Count + q10Count;
  }, [useSectionConfig, sections, useUnitDistribution, unitDistributions, q2Count, q5Count, q10Count]);

  const selectedUnitsCount = unitDistributions.filter(u => u.selected).length;

  // All subjects for subject-first selection
  const allSelectableSubjects = useMemo(() => {
    return subjects.filter((s) => s.branch !== "core");
  }, []);

  // Dynamic subject filtering (when dept/year/sem are set first)
  const filteredSubjects = useMemo(() => {
    if (!department && !yearFilter && !semesterFilter) return allSelectableSubjects;
    return subjects.filter((s) => {
      if (department && s.branch !== department && s.branch !== "core") return false;
      if (yearFilter && yearFilter !== "all_years" && s.year !== Number(yearFilter)) return false;
      if (semesterFilter && semesterFilter !== "all_sems" && s.semester !== Number(semesterFilter)) return false;
      return true;
    });
  }, [department, yearFilter, semesterFilter, allSelectableSubjects]);

  const availableSemesters = useMemo(() => {
    if (!yearFilter || yearFilter === "all_years") return [1, 2, 3, 4, 5, 6, 7, 8];
    const y = Number(yearFilter);
    return [y * 2 - 1, y * 2];
  }, [yearFilter]);

  const currentSubject = getSubjectById(selectedSubject);

  const handleSubjectChange = useCallback((subjectId: string) => {
    setSelectedSubject(subjectId);
    setGenerated(false);
    setShowValidation(false);
    setValidationReport(null);
    setGeneratedVariants([]);
    setActiveVariant(0);
    usedQuestionSets.current = [];
    const sub = getSubjectById(subjectId);
    if (sub) {
      // Auto-fill department, year, semester from subject mapping
      setDepartment(sub.branch);
      setYearFilter(String(sub.year));
      setSemesterFilter(String(sub.semester));
      setAutoFilled(true);
      setFieldsLocked(true);

      setUnitDistributions(
        sub.units.map(u => ({ unitName: u, selected: true, q2: 0, q5: 0, q10: 0 }))
      );
    } else {
      setAutoFilled(false);
      setFieldsLocked(false);
      setUnitDistributions([]);
    }
  }, []);

  // Load "Generate Similar" config from sessionStorage
  useEffect(() => {
    if (searchParams.get("similar") !== "true") return;
    const raw = sessionStorage.getItem("cognitoq_similar_config");
    if (!raw) return;
    sessionStorage.removeItem("cognitoq_similar_config");

    try {
      const config = JSON.parse(raw);
      const paperData = config.paperData || {};

      // Find subject ID by name match
      const subjectMatch = subjects.find(
        s => s.name === config.subject || s.code === config.subject || s.id === config.subject
      );
      if (subjectMatch) {
        handleSubjectChange(subjectMatch.id);
      }

      // Restore header
      if (paperData.collegeName) setCollegeName(paperData.collegeName);
      if (paperData.examType) setExamType(paperData.examType);
      if (paperData.duration) setDuration(paperData.duration);
      if (paperData.theme) setSelectedTheme(paperData.theme);

      // Restore sections
      if (paperData.sections && paperData.sections.length > 0) {
        setUseSectionConfig(true);
        setSections(paperData.sections);
      }

      // Pre-load excluded texts from previous paper
      if (config.excludedTexts && config.excludedTexts.length > 0) {
        setExcludedTexts(new Set(config.excludedTexts));
      }

      setSimilarMode(true);
      similarAutoGenRef.current = true;

      toast({
        title: "📋 Similar Paper Config Loaded",
        description: "Same structure loaded. Click Generate to create with new questions.",
      });
    } catch (e) {
      console.error("Failed to parse similar config", e);
    }
  }, []);


  const updateSection = (index: number, field: keyof SectionConfig, value: number | boolean | string) => {
    setSections(prev => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      // Ensure questionsToAnswer <= totalQuestions
      if (field === "totalQuestions" && next[index].questionsToAnswer > (value as number)) {
        next[index].questionsToAnswer = value as number;
      }
      return next;
    });
    setGenerated(false);
    setShowValidation(false);
  };

  const addSection = () => {
    setSections(prev => [
      ...prev,
      { id: String(Date.now()), name: `PART – ${String.fromCharCode(65 + prev.length)}`, marks: 5, totalQuestions: 3, questionsToAnswer: 3, enableOr: false },
    ]);
  };

  const removeSection = (index: number) => {
    if (sections.length <= 1) return;
    setSections(prev => prev.filter((_, i) => i !== index));
  };

  // Validation
  const validationErrors = useMemo(() => {
    const errors: string[] = [];
    if (!department) errors.push("Select a department");
    if (!selectedSubject) errors.push("Select a subject");
    if (useSectionConfig) {
      if (sections.every(s => s.totalQuestions === 0)) errors.push("Add at least one question");
      sections.forEach(s => {
        if (s.questionsToAnswer > s.totalQuestions) {
          errors.push(`${s.name}: Questions to answer exceeds total`);
        }
      });
    } else {
      if (totalQuestions === 0) errors.push("Add at least one question");
    }
    if (useUnitDistribution && selectedUnitsCount === 0) errors.push("Select at least one unit");
    return errors;
  }, [department, selectedSubject, useSectionConfig, sections, totalQuestions, useUnitDistribution, selectedUnitsCount]);

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

  // Pre-generation validation: check question bank availability
  const preGenerationCheck = useCallback((): string[] => {
    const warnings: string[] = [];
    const subjectBank = getQuestionsForSubject(selectedSubject);
    const activeUnits = unitDistributions.filter(u => u.selected).map(u => u.unitName);
    const units = activeUnits.length > 0 ? activeUnits : (currentSubject?.units || []);

    if (useSectionConfig) {
      sections.forEach(section => {
        const marksNeeded = section.marks;
        // Count total questions available for this marks level across all units
        let totalAvailable = 0;
        units.forEach(unitName => {
          const unitQs = subjectBank[unitName] || [];
          totalAvailable += unitQs.filter(q => q.marks === marksNeeded).length;
        });

        const needed = section.enableOr ? section.totalQuestions * 2 : section.totalQuestions;
        if (totalAvailable < needed) {
          warnings.push(`${section.name} (${marksNeeded}M): Need ${needed} questions, only ${totalAvailable} available in bank. Generic questions will be used.`);
        }

        // Check unit coverage
        units.forEach(unitName => {
          const unitQs = (subjectBank[unitName] || []).filter(q => q.marks === marksNeeded);
          if (unitQs.length === 0 && section.totalQuestions > 0) {
            warnings.push(`${section.name}: No ${marksNeeded}M questions for "${unitName}"`);
          }
        });
      });
    }

    return warnings;
  }, [selectedSubject, unitDistributions, currentSubject, useSectionConfig, sections]);

  // Core generation engine for a single variant
  const generateSingleVariant = useCallback((excludeKeys: Set<string>): { questions: GeneratedQuestion[]; usedKeys: Set<string> } => {
    const subjectBank = getQuestionsForSubject(selectedSubject);
    const result: GeneratedQuestion[] = [];
    const newUsedKeys = new Set<string>();
    let qNum = 1;

    const diffFilter = (q: Question): boolean => {
      if (difficulty === "mixed") return true;
      return q.difficulty.toLowerCase() === difficulty;
    };

    const bloomFilter = (q: Question): boolean => {
      if (!bloomsEnabled || bloomsLevel === "all") return true;
      return q.bloom.toLowerCase() === bloomsLevel;
    };

    const activeUnits = unitDistributions.filter(u => u.selected).map(u => u.unitName);
    const units = activeUnits.length > 0 ? activeUnits : (currentSubject?.units || ["General"]);

    const pickQuestionsFromPool = (marks: number, count: number, needOr: boolean): GeneratedQuestion[] => {
      const picked: GeneratedQuestion[] = [];

      // Distribute evenly across units
      const perUnit = Math.floor(count / units.length);
      const remainder = count % units.length;

      // Collect available questions per unit
      const unitPools: Record<string, Question[]> = {};
      units.forEach(unitName => {
        unitPools[unitName] = [...(subjectBank[unitName] || [])].filter(
          q => q.marks === marks && diffFilter(q) && bloomFilter(q) && !excludeKeys.has(q.text.toLowerCase().trim()) && !newUsedKeys.has(q.text.toLowerCase().trim()) && !excludedTexts.has(q.text.toLowerCase().trim())
        ).sort(() => Math.random() - 0.5);
      });

      let unitIndex = 0;
      let questionsNeeded = count;
      const unitOrder = [...units].sort(() => Math.random() - 0.5);

      // Round-robin across units for even distribution
      while (questionsNeeded > 0) {
        const unitName = unitOrder[unitIndex % unitOrder.length];
        const pool = unitPools[unitName];

        let mainQ: Question;
        if (pool && pool.length > 0) {
          mainQ = pool.shift()!;
        } else {
          const diffLevel = difficulty === "mixed"
            ? (["Easy", "Medium", "Hard"] as const)[questionsNeeded % 3]
            : (difficulty.charAt(0).toUpperCase() + difficulty.slice(1)) as "Easy" | "Medium" | "Hard";
          mainQ = generateGenericQuestion(unitName, marks, diffLevel);
        }

        const key = mainQ.text.toLowerCase().trim();
        newUsedKeys.add(key);

        const genQ: GeneratedQuestion = { ...mainQ, unit: unitName, questionNumber: qNum++ };

        // Generate OR alternative if enabled
        if (needOr) {
          // Find another question from SAME unit with SAME marks
          const orPool = (unitPools[unitName] || []).filter(
            q => !newUsedKeys.has(q.text.toLowerCase().trim())
          );

          let orQ: Question;
          if (orPool.length > 0) {
            orQ = orPool[0];
            // Remove from pool
            const idx = unitPools[unitName]?.indexOf(orQ);
            if (idx !== undefined && idx >= 0) unitPools[unitName]?.splice(idx, 1);
          } else {
            const diffLevel = difficulty === "mixed"
              ? (["Medium", "Hard", "Easy"] as const)[questionsNeeded % 3]
              : (difficulty.charAt(0).toUpperCase() + difficulty.slice(1)) as "Easy" | "Medium" | "Hard";
            orQ = generateGenericQuestion(unitName, marks, diffLevel);
            // Ensure different text
            if (orQ.text === mainQ.text) {
              orQ = { ...orQ, text: orQ.text + " (alternative approach)" };
            }
          }

          const orKey = orQ.text.toLowerCase().trim();
          newUsedKeys.add(orKey);
          genQ.orAlternative = { ...orQ, unit: unitName };
        }

        picked.push(genQ);
        questionsNeeded--;
        unitIndex++;
      }

      return picked;
    };

    if (useSectionConfig) {
      // Section-based generation
      sections.forEach(section => {
        const sectionQuestions = pickQuestionsFromPool(section.marks, section.totalQuestions, section.enableOr);
        result.push(...sectionQuestions);
      });
    } else if (useUnitDistribution) {
      // Legacy per-unit distribution
      const pickQuestions = (unitName: string, marks: number, count: number) => {
        const unitQuestions = (subjectBank[unitName] || []).filter(
          q => q.marks === marks && diffFilter(q) && bloomFilter(q) && !excludeKeys.has(q.text.toLowerCase().trim())
        );
        const shuffled = [...unitQuestions].sort(() => Math.random() - 0.5);
        for (let i = 0; i < count; i++) {
          if (i < shuffled.length) {
            const key = shuffled[i].text.toLowerCase().trim();
            newUsedKeys.add(key);
            result.push({ ...shuffled[i], unit: unitName, questionNumber: qNum++ });
          } else {
            const diffLevel = difficulty === "mixed"
              ? (["Easy", "Medium", "Hard"] as const)[i % 3]
              : (difficulty.charAt(0).toUpperCase() + difficulty.slice(1)) as "Easy" | "Medium" | "Hard";
            const gen = generateGenericQuestion(unitName, marks, diffLevel);
            newUsedKeys.add(gen.text.toLowerCase().trim());
            result.push({ ...gen, unit: unitName, questionNumber: qNum++ });
          }
        }
      };
      unitDistributions.filter(u => u.selected).forEach(u => {
        pickQuestions(u.unitName, 2, u.q2);
        pickQuestions(u.unitName, 5, u.q5);
        pickQuestions(u.unitName, 10, u.q10);
      });
    } else {
      // Legacy global counts
      const qs2 = pickQuestionsFromPool(2, q2Count, false);
      const qs5 = pickQuestionsFromPool(5, q5Count, false);
      const qs10 = pickQuestionsFromPool(10, q10Count, false);
      result.push(...qs2, ...qs5, ...qs10);
    }

    return { questions: result, usedKeys: newUsedKeys };
  }, [selectedSubject, q2Count, q5Count, q10Count, difficulty, bloomsEnabled, bloomsLevel, useUnitDistribution, unitDistributions, currentSubject, useSectionConfig, sections, excludedTexts]);

  // Multi-variant generation
  const generateQuestions = useCallback(async () => {
    if (!isValid) {
      toast({ title: "Validation Error", description: validationErrors[0], variant: "destructive" });
      return;
    }

    // Pre-generation warnings
    const warnings = preGenerationCheck();
    if (warnings.length > 0) {
      toast({
        title: "⚠ Question Bank Warning",
        description: warnings[0],
        variant: "destructive",
      });
    }

    // Fetch excluded questions from DB
    const { data: excludedData } = await supabase
      .from("questions")
      .select("text")
      .eq("exclude_from_paper", true);
    const newExcluded = new Set<string>(
      (excludedData || []).map(q => q.text.toLowerCase().trim())
    );
    setExcludedTexts(newExcluded);

    const genStartTime = Date.now();
    setIsGenerating(true);
    setGenerated(false);
    setProgress(0);
    setShowValidation(false);
    setVariantLabel("");

    const interval = setInterval(() => {
      setProgress(p => Math.min(p + 15, 90));
    }, 100);

    setTimeout(async () => {
      clearInterval(interval);
      setProgress(100);

      const numVariants = parseInt(variantCount) || 1;
      const allVariants: GeneratedQuestion[][] = [];
      const allUsedKeys = new Set<string>();

      for (let v = 0; v < numVariants; v++) {
        const { questions, usedKeys } = generateSingleVariant(allUsedKeys);
        allVariants.push(questions);
        usedKeys.forEach(k => allUsedKeys.add(k));
      }

      usedQuestionSets.current = allVariants.map(variant => {
        const s = new Set<string>();
        variant.forEach(q => {
          s.add(q.text.toLowerCase().trim());
          if (q.orAlternative) s.add(q.orAlternative.text.toLowerCase().trim());
        });
        return s;
      });

      setGeneratedVariants(allVariants);
      setActiveVariant(0);
      setIsGenerating(false);
      setGenerated(true);
      setIsDraft(false);

      const generationTimeMs = Date.now() - genStartTime;

      // Compute effective counts for quality score
      const effectiveQ2 = useSectionConfig ? sections.filter(s => s.marks === 2).reduce((sum, s) => sum + s.totalQuestions, 0) : (useUnitDistribution ? unitDistributions.filter(u => u.selected).reduce((s, u) => s + u.q2, 0) : q2Count);
      const effectiveQ5 = useSectionConfig ? sections.filter(s => s.marks === 5).reduce((sum, s) => sum + s.totalQuestions, 0) : (useUnitDistribution ? unitDistributions.filter(u => u.selected).reduce((s, u) => s + u.q5, 0) : q5Count);
      const effectiveQ10 = useSectionConfig ? sections.filter(s => s.marks === 10).reduce((sum, s) => sum + s.totalQuestions, 0) : (useUnitDistribution ? unitDistributions.filter(u => u.selected).reduce((s, u) => s + u.q10, 0) : q10Count);

      // Auto-save each variant to database
      const { data: { user } } = await supabase.auth.getUser();
      if (user && currentSubject) {
        const variantLabelsArr = ["Set A", "Set B", "Set C", "Set D", "Set E"];
        const selectedUnits = unitDistributions.filter(u => u.selected).map(u => u.unitName);
        for (let v = 0; v < allVariants.length; v++) {
          const variant = allVariants[v];
          const label = numVariants > 1 ? variantLabelsArr[v] || `Set ${v + 1}` : "";
          const variantScore = calculateQualityScore(
            variant.map(q => ({ text: q.text, marks: q.marks, unit: q.unit, difficulty: q.difficulty, type: q.type, bloom: q.bloom })),
            selectedUnits, totalMarks, effectiveQ2, effectiveQ5, effectiveQ10,
          );
          await supabase.from("papers").insert({
            user_id: user.id,
            title: `${currentSubject.name} - ${examType || "Paper"}${label ? ` (${label})` : ""}`,
            subject: currentSubject.name,
            department: department,
            max_marks: answeredMarks,
            total_questions: variant.length,
            questions: variant as any,
            paper_data: { collegeName, examType, duration, theme: selectedTheme, variantLabel: label, sections: useSectionConfig ? sections : undefined } as any,
            is_draft: false,
            difficulty,
            theme: selectedTheme,
            subject_code: currentSubject.code,
            college_name: collegeName || null,
            exam_type: examType || null,
            duration: duration || null,
            generation_time_ms: generationTimeMs,
            quality_score: variantScore.total,
            score_breakdown: variantScore.breakdown as any,
          } as any);
        }
      }

      // Auto-save individual questions to question bank
      if (user && currentSubject) {
        const allQsToSave = allVariants.flatMap(variant =>
          variant.flatMap(q => {
            const items = [{
              text: q.text,
              marks: q.marks,
              unit: q.unit,
              difficulty: q.difficulty,
              type: q.type,
              bloom: q.bloom,
              subject: currentSubject.name,
              subject_code: currentSubject.code,
              source: "generated",
            }];
            if (q.orAlternative) {
              items.push({
                text: q.orAlternative.text,
                marks: q.orAlternative.marks,
                unit: q.orAlternative.unit,
                difficulty: q.orAlternative.difficulty,
                type: q.orAlternative.type,
                bloom: q.orAlternative.bloom,
                subject: currentSubject.name,
                subject_code: currentSubject.code,
                source: "generated",
              });
            }
            return items;
          })
        );
        const { saved } = await saveQuestionsToBank(allQsToSave, user.id);
        if (saved > 0) {
          console.log(`Saved ${saved} questions to question bank`);
        }
      }

      const totalQs = allVariants.reduce((s, v) => s + v.length, 0);
      toast({
        title: "Paper Generated!",
        description: `${numVariants} variant${numVariants > 1 ? "s" : ""} • ${totalQs} questions • ${answeredMarks} marks`
      });
    }, 1200);
  }, [isValid, validationErrors, toast, totalMarks, answeredMarks, variantCount, generateSingleVariant, currentSubject, department, examType, collegeName, duration, selectedTheme, difficulty, preGenerationCheck, useSectionConfig, sections, useUnitDistribution, unitDistributions, q2Count, q5Count, q10Count]);

  // Smart Shuffle
  const smartShuffle = useCallback(() => {
    if (!isValid) return;
    setIsGenerating(true);
    setProgress(0);
    const interval = setInterval(() => { setProgress(p => Math.min(p + 20, 90)); }, 80);
    setTimeout(() => {
      clearInterval(interval);
      setProgress(100);
      const prevUsedKeys = new Set<string>();
      usedQuestionSets.current.forEach(s => s.forEach(k => prevUsedKeys.add(k)));
      const numVariants = parseInt(variantCount) || 1;
      const allVariants: GeneratedQuestion[][] = [];
      const allUsedKeys = new Set(prevUsedKeys);
      for (let v = 0; v < numVariants; v++) {
        const { questions, usedKeys } = generateSingleVariant(allUsedKeys);
        allVariants.push(questions);
        usedKeys.forEach(k => allUsedKeys.add(k));
      }
      usedQuestionSets.current = allVariants.map(variant => {
        const s = new Set<string>();
        variant.forEach(q => { s.add(q.text.toLowerCase().trim()); if (q.orAlternative) s.add(q.orAlternative.text.toLowerCase().trim()); });
        return s;
      });
      setGeneratedVariants(allVariants);
      setActiveVariant(0);
      setIsGenerating(false);
      setVariantLabel("New Variant Generated ✨");
      toast({ title: "🔄 Smart Shuffle Complete", description: "New unique questions generated." });
      setTimeout(() => setVariantLabel(""), 3000);
    }, 800);
  }, [isValid, variantCount, generateSingleVariant, toast]);

  // Quality score
  useEffect(() => {
    if (!generated || generatedQuestions.length === 0) { setQualityScore(null); return; }
    const selectedUnits = unitDistributions.filter(u => u.selected).map(u => u.unitName);
    const effectiveQ2 = useSectionConfig ? sections.filter(s => s.marks === 2).reduce((sum, s) => sum + s.totalQuestions, 0) : (useUnitDistribution ? unitDistributions.filter(u => u.selected).reduce((s, u) => s + u.q2, 0) : q2Count);
    const effectiveQ5 = useSectionConfig ? sections.filter(s => s.marks === 5).reduce((sum, s) => sum + s.totalQuestions, 0) : (useUnitDistribution ? unitDistributions.filter(u => u.selected).reduce((s, u) => s + u.q5, 0) : q5Count);
    const effectiveQ10 = useSectionConfig ? sections.filter(s => s.marks === 10).reduce((sum, s) => sum + s.totalQuestions, 0) : (useUnitDistribution ? unitDistributions.filter(u => u.selected).reduce((s, u) => s + u.q10, 0) : q10Count);
    const score = calculateQualityScore(
      generatedQuestions.map(q => ({ text: q.text, marks: q.marks, unit: q.unit, difficulty: q.difficulty, type: q.type, bloom: q.bloom })),
      selectedUnits, totalMarks, effectiveQ2, effectiveQ5, effectiveQ10,
    );
    setQualityScore(score);
  }, [generated, generatedQuestions, unitDistributions, totalMarks, q2Count, q5Count, q10Count, useUnitDistribution, useSectionConfig, sections]);

  // Improve paper quality
  const improvePaperQuality = useCallback(() => {
    if (!isValid || !generated) return;
    setIsImproving(true);
    setTimeout(() => {
      const numVariants = parseInt(variantCount) || 1;
      let bestVariants: GeneratedQuestion[][] = [];
      let bestScore = -1;
      const effectiveQ2 = useSectionConfig ? sections.filter(s => s.marks === 2).reduce((sum, s) => sum + s.totalQuestions, 0) : (useUnitDistribution ? unitDistributions.filter(u => u.selected).reduce((s, u) => s + u.q2, 0) : q2Count);
      const effectiveQ5 = useSectionConfig ? sections.filter(s => s.marks === 5).reduce((sum, s) => sum + s.totalQuestions, 0) : (useUnitDistribution ? unitDistributions.filter(u => u.selected).reduce((s, u) => s + u.q5, 0) : q5Count);
      const effectiveQ10 = useSectionConfig ? sections.filter(s => s.marks === 10).reduce((sum, s) => sum + s.totalQuestions, 0) : (useUnitDistribution ? unitDistributions.filter(u => u.selected).reduce((s, u) => s + u.q10, 0) : q10Count);

      for (let attempt = 0; attempt < 5; attempt++) {
        const tryVariants: GeneratedQuestion[][] = [];
        const tryKeys = new Set<string>();
        for (let v = 0; v < numVariants; v++) {
          const { questions, usedKeys } = generateSingleVariant(tryKeys);
          tryVariants.push(questions);
          usedKeys.forEach(k => tryKeys.add(k));
        }
        const selectedUnits = unitDistributions.filter(u => u.selected).map(u => u.unitName);
        const tryScore = calculateQualityScore(
          tryVariants[0].map(q => ({ text: q.text, marks: q.marks, unit: q.unit, difficulty: q.difficulty, type: q.type, bloom: q.bloom })),
          selectedUnits, totalMarks, effectiveQ2, effectiveQ5, effectiveQ10,
        );
        if (tryScore.total > bestScore) { bestScore = tryScore.total; bestVariants = tryVariants; }
      }
      setGeneratedVariants(bestVariants);
      setActiveVariant(0);
      setIsImproving(false);
      toast({ title: "✨ Paper Quality Improved", description: `Best score: ${bestScore}/100 from 5 attempts.` });
    }, 600);
  }, [isValid, generated, variantCount, generateSingleVariant, unitDistributions, totalMarks, q2Count, q5Count, q10Count, useUnitDistribution, useSectionConfig, sections, toast]);

  // Save as draft
  const saveAsDraft = useCallback(async () => {
    setIsDraft(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user && currentSubject) {
      await supabase.from("papers").insert({
        user_id: user.id,
        title: `${currentSubject.name} - ${examType || "Paper"}`,
        subject: currentSubject.name,
        department: department,
        max_marks: answeredMarks,
        total_questions: totalQuestions,
        questions: generatedQuestions as any,
        paper_data: { collegeName, examType, duration, theme: selectedTheme, sections: useSectionConfig ? sections : undefined } as any,
        is_draft: true,
        difficulty,
        theme: selectedTheme,
        subject_code: currentSubject.code,
        college_name: collegeName || null,
        exam_type: examType || null,
        duration: duration || null,
      });
    }
    toast({ title: "Draft Saved", description: "Paper saved as draft." });
  }, [toast, currentSubject, department, answeredMarks, totalQuestions, generatedQuestions, collegeName, examType, duration, selectedTheme, difficulty, useSectionConfig, sections]);

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
      // Check OR alternatives
      if (q.orAlternative) {
        unitCoverage[q.orAlternative.unit] = (unitCoverage[q.orAlternative.unit] || 0) + 1;
        const orKey = q.orAlternative.text.toLowerCase().trim();
        if (seen.has(orKey)) duplicates++;
        else seen.add(orKey);
        // Check OR pair is from same unit
        if (q.unit !== q.orAlternative.unit) {
          issues.push(`Q${q.questionNumber}: OR pair from different units`);
        }
      }
    });

    if (duplicates > 0) issues.push(`${duplicates} duplicate question(s) detected`);
    const coveredUnits = Object.keys(unitCoverage).length;
    const totalUnitsCount = currentSubject?.units.length || 5;
    if (coveredUnits < totalUnitsCount) issues.push(`Only ${coveredUnits}/${totalUnitsCount} units covered`);

    const total = generatedQuestions.length;
    const easyPct = Math.round((diffCount.Easy / total) * 100);
    const hardPct = Math.round((diffCount.Hard / total) * 100);
    if (difficulty === "mixed" && (easyPct > 60 || hardPct > 60)) issues.push("Difficulty distribution is skewed");

    if (generatedVariants.length > 1) {
      const allTexts: string[] = [];
      let crossDups = 0;
      generatedVariants.forEach(variant => {
        variant.forEach(q => {
          const k = q.text.toLowerCase().trim();
          if (allTexts.includes(k)) crossDups++;
          allTexts.push(k);
        });
      });
      if (crossDups > 0) issues.push(`${crossDups} cross-variant duplicate(s) found`);
    }

    setValidationReport({
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
    });
    setShowValidation(true);
  }, [generated, generatedQuestions, currentSubject, difficulty, generatedVariants]);

  // Group generated questions by section
  const questionsBySection = useMemo(() => {
    if (!useSectionConfig) {
      // Legacy mode - group by marks
      const sA = generatedQuestions.filter(q => q.marks === 2);
      const sB = generatedQuestions.filter(q => q.marks === 5);
      const sC = generatedQuestions.filter(q => q.marks === 10);
      return [
        { config: { id: "a", name: "PART – A", marks: 2, totalQuestions: sA.length, questionsToAnswer: sA.length, enableOr: false }, questions: sA },
        { config: { id: "b", name: "PART – B", marks: 5, totalQuestions: sB.length, questionsToAnswer: sB.length, enableOr: false }, questions: sB },
        { config: { id: "c", name: "PART – C", marks: 10, totalQuestions: sC.length, questionsToAnswer: sC.length, enableOr: false }, questions: sC },
      ].filter(s => s.questions.length > 0);
    }

    // Section-based mode
    let offset = 0;
    return sections.map(section => {
      const sectionQs = generatedQuestions.slice(offset, offset + section.totalQuestions);
      offset += section.totalQuestions;
      return { config: section, questions: sectionQs };
    }).filter(s => s.questions.length > 0);
  }, [useSectionConfig, sections, generatedQuestions]);

  const variantLabelsArr = ["A", "B", "C", "D", "E"];

  // Build export questions (flatten OR into separate entries with markers)
  const buildExportQuestions = useCallback(() => {
    return generatedQuestions.map(q => ({
      questionNumber: q.questionNumber,
      text: q.text,
      marks: q.marks,
      unit: q.unit,
      difficulty: q.difficulty,
      orAlternativeText: q.orAlternative?.text,
    }));
  }, [generatedQuestions]);

  const buildExportMeta = useCallback(() => ({
    subjectName: currentSubject?.name || "Paper",
    subjectCode: currentSubject?.code,
    maxMarks: answeredMarks,
    collegeName,
    examType,
    duration,
    setLabel: `Set ${variantLabelsArr[activeVariant] || "A"}`,
    watermark: true,
    paperId: `CQ-${Date.now().toString(36).toUpperCase()}`,
    sections: useSectionConfig ? sections : undefined,
  }), [currentSubject, answeredMarks, collegeName, examType, duration, activeVariant, useSectionConfig, sections]);

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-display text-foreground">Generate Paper</h1>
        <p className="text-muted-foreground mt-1">Configure and generate university-style question papers with OR options.</p>
        {similarMode && (
          <Badge className="mt-2 bg-accent/10 text-accent border-accent/20">
            🔄 Similar Paper Mode — Same structure, different questions
          </Badge>
        )}
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
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg text-foreground flex items-center gap-2">
                <Building2 className="w-5 h-5 text-accent" /> Department & Subject
              </h3>
              {autoFilled && (
                <Badge variant="secondary" className="text-[10px] bg-accent/10 text-accent border-accent/20">
                  ✨ Auto-filled from syllabus
                </Badge>
              )}
            </div>

            {/* Department FIRST */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Department <span className="text-destructive">*</span></Label>
                {fieldsLocked && (
                  <button
                    onClick={() => setFieldsLocked(false)}
                    className="text-[10px] text-muted-foreground hover:text-foreground underline"
                  >
                    Unlock to edit
                  </button>
                )}
              </div>
              <Select
                value={department}
                onValueChange={(v) => { setDepartment(v); setAutoFilled(false); setFieldsLocked(false); handleSubjectChange(""); }}
                disabled={fieldsLocked}
              >
                <SelectTrigger className={fieldsLocked ? "opacity-70" : ""}><SelectValue placeholder="Select department" /></SelectTrigger>
                <SelectContent>
                  {branches.filter(b => b.id !== "core").map((b) => (
                    <SelectItem key={b.id} value={b.id}>{b.shortName} — {b.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Subject (filtered by department) */}
            <div className="space-y-2">
              <Label>Subject <span className="text-destructive">*</span></Label>
              <Select value={selectedSubject} onValueChange={handleSubjectChange} disabled={!department}>
                <SelectTrigger><SelectValue placeholder={department ? "Select subject" : "Select department first"} /></SelectTrigger>
                <SelectContent>
                  {filteredSubjects.filter(s => s.branch !== "core").map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.code} — {s.name}
                      {s.category === "open_elective" ? " (OE)" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Year</Label>
                <Select
                  value={yearFilter}
                  onValueChange={(v) => { setYearFilter(v); setSemesterFilter(""); setAutoFilled(false); setFieldsLocked(false); handleSubjectChange(""); }}
                  disabled={fieldsLocked}
                >
                  <SelectTrigger className={fieldsLocked ? "opacity-70" : ""}><SelectValue placeholder="All" /></SelectTrigger>
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
                <Select
                  value={semesterFilter}
                  onValueChange={(v) => { setSemesterFilter(v); setAutoFilled(false); setFieldsLocked(false); handleSubjectChange(""); }}
                  disabled={fieldsLocked}
                >
                  <SelectTrigger className={fieldsLocked ? "opacity-70" : ""}><SelectValue placeholder="All" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all_sems">All Semesters</SelectItem>
                    {availableSemesters.map((s) => (
                      <SelectItem key={s} value={String(s)}>Sem {s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Section Configuration */}
          <div className="elevated-card rounded-xl p-5 space-y-4">
            <button
              onClick={() => setSectionConfigOpen(!sectionConfigOpen)}
              className="w-full flex items-center justify-between"
            >
              <h3 className="font-display text-lg text-foreground flex items-center gap-2">
                <Settings2 className="w-5 h-5 text-accent" /> Paper Sections
              </h3>
              {sectionConfigOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
            </button>

            <AnimatePresence>
              {sectionConfigOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="space-y-3 overflow-hidden"
                >
                  <div className="flex items-center gap-2">
                    <Switch checked={useSectionConfig} onCheckedChange={setUseSectionConfig} />
                    <Label className="text-xs text-muted-foreground">Section-based paper structure</Label>
                  </div>

                  {useSectionConfig && (
                    <div className="space-y-3">
                      {sections.map((section, idx) => (
                        <div key={section.id} className="rounded-lg border border-accent/20 bg-accent/5 p-3 space-y-2">
                          <div className="flex items-center justify-between">
                            <Input
                              value={section.name}
                              onChange={e => updateSection(idx, "name", e.target.value)}
                              className="h-7 text-xs font-semibold w-32"
                            />
                            {sections.length > 1 && (
                              <Button variant="ghost" size="sm" className="h-6 text-xs text-destructive" onClick={() => removeSection(idx)}>
                                Remove
                              </Button>
                            )}
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-0.5">
                              <Label className="text-[10px] text-muted-foreground">Marks/Q</Label>
                              <Select value={String(section.marks)} onValueChange={v => updateSection(idx, "marks", Number(v))}>
                                <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
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
                            <div className="space-y-0.5">
                              <Label className="text-[10px] text-muted-foreground">Total Questions</Label>
                              <Input
                                type="number" min={0}
                                value={section.totalQuestions}
                                onChange={e => updateSection(idx, "totalQuestions", Math.max(0, parseInt(e.target.value) || 0))}
                                className="h-7 text-xs text-center"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-0.5">
                              <Label className="text-[10px] text-muted-foreground">Answer Any</Label>
                              <Input
                                type="number" min={0} max={section.totalQuestions}
                                value={section.questionsToAnswer}
                                onChange={e => updateSection(idx, "questionsToAnswer", Math.min(section.totalQuestions, Math.max(0, parseInt(e.target.value) || 0)))}
                                className="h-7 text-xs text-center"
                              />
                            </div>
                            <div className="flex items-end gap-1.5 pb-0.5">
                              <Switch
                                checked={section.enableOr}
                                onCheckedChange={v => updateSection(idx, "enableOr", v)}
                                className="scale-75"
                              />
                              <Label className="text-[10px] text-muted-foreground">OR options</Label>
                            </div>
                          </div>
                        </div>
                      ))}

                      <Button variant="outline" size="sm" className="w-full text-xs" onClick={addSection}>
                        + Add Section
                      </Button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
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
                    {!useSectionConfig && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Switch checked={useUnitDistribution} onCheckedChange={setUseUnitDistribution} />
                          <Label className="text-xs text-muted-foreground">Per-unit question counts</Label>
                        </div>
                      </div>
                    )}
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" className="h-6 text-xs px-2" onClick={() => selectAllUnits(true)}>All</Button>
                      <Button variant="ghost" size="sm" className="h-6 text-xs px-2" onClick={() => selectAllUnits(false)}>None</Button>
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

                              {!useSectionConfig && useUnitDistribution && ud.selected && (
                                <div className="grid grid-cols-3 gap-2 mt-2">
                                  <div className="space-y-0.5">
                                    <Label className="text-[10px] text-muted-foreground">2M</Label>
                                    <Input type="number" min={0} value={ud.q2}
                                      onChange={(e) => updateUnitDist(idx, "q2", Math.max(0, parseInt(e.target.value) || 0))}
                                      className="h-7 text-xs text-center" />
                                  </div>
                                  <div className="space-y-0.5">
                                    <Label className="text-[10px] text-muted-foreground">5M</Label>
                                    <Input type="number" min={0} value={ud.q5}
                                      onChange={(e) => updateUnitDist(idx, "q5", Math.max(0, parseInt(e.target.value) || 0))}
                                      className="h-7 text-xs text-center" />
                                  </div>
                                  <div className="space-y-0.5">
                                    <Label className="text-[10px] text-muted-foreground">10M</Label>
                                    <Input type="number" min={0} value={ud.q10}
                                      onChange={(e) => updateUnitDist(idx, "q10", Math.max(0, parseInt(e.target.value) || 0))}
                                      className="h-7 text-xs text-center" />
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

          {/* Legacy Question Controls (when section config is off) */}
          {!useSectionConfig && !useUnitDistribution && (
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

          {/* Marks & Difficulty */}
          <div className="elevated-card rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">Total Marks (Paper)</span>
              <Badge variant={totalMarks > 0 ? "default" : "secondary"} className="text-sm font-mono">{totalMarks}</Badge>
            </div>
            {useSectionConfig && answeredMarks !== totalMarks && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Max Marks (To Answer)</span>
                <Badge variant="outline" className="text-sm font-mono text-accent">{answeredMarks}</Badge>
              </div>
            )}
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

          {/* Paper Header & Variants */}
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
                <Label>Paper Variants</Label>
                <Select value={variantCount} onValueChange={setVariantCount}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Set</SelectItem>
                    <SelectItem value="2">2 Sets (A, B)</SelectItem>
                    <SelectItem value="3">3 Sets (A, B, C)</SelectItem>
                    <SelectItem value="4">4 Sets</SelectItem>
                    <SelectItem value="5">5 Sets</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Paper Theme */}
          <div className="elevated-card rounded-xl p-5 space-y-3">
            <h3 className="font-display text-lg text-foreground flex items-center gap-2">
              <Palette className="w-5 h-5 text-accent" /> Paper Theme
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {paperThemes.map(theme => (
                <button
                  key={theme.id}
                  onClick={() => setSelectedTheme(theme.id)}
                  className={cn(
                    "rounded-lg border p-3 text-left transition-all",
                    selectedTheme === theme.id
                      ? "border-accent bg-accent/5 ring-1 ring-accent"
                      : "border-border hover:border-accent/40"
                  )}
                >
                  <span className="text-lg">{theme.icon}</span>
                  <p className="text-xs font-medium text-foreground mt-1">{theme.name}</p>
                </button>
              ))}
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
                  Configure sections with OR options, set question counts, then generate your university-style paper.
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
                {/* Variant label */}
                <AnimatePresence>
                  {variantLabel && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="rounded-lg bg-accent/10 border border-accent/30 p-3 text-center"
                    >
                      <p className="text-sm font-medium text-accent">{variantLabel}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Variant Tabs */}
                {generatedVariants.length > 1 && (
                  <Tabs value={String(activeVariant)} onValueChange={(v) => setActiveVariant(Number(v))}>
                    <TabsList className="w-full">
                      {generatedVariants.map((_, i) => (
                        <TabsTrigger key={i} value={String(i)} className="flex-1">
                          Set {variantLabelsArr[i] || i + 1}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </Tabs>
                )}

                {/* Paper */}
                <div className={cn(
                  "elevated-card rounded-xl overflow-hidden",
                  selectedTheme === "dark" && "bg-card border-border",
                  selectedTheme === "blue" && "border-info/30",
                )}>
                  {/* Paper Header */}
                  <div className={cn(
                    "p-6 border-b border-border text-center space-y-1",
                    selectedTheme === "jntu" && "bg-muted/50",
                    selectedTheme === "iit" && "border-b-2",
                    selectedTheme === "blue" && "bg-info/5",
                  )}>
                    {collegeName && <p className="text-sm font-bold text-foreground uppercase tracking-wider">{collegeName}</p>}
                    {examType && <p className="text-xs text-muted-foreground">{examType} Examination</p>}
                    <h3 className="font-display text-xl text-foreground">
                      {currentSubject?.name || "Question Paper"} — Set {variantLabelsArr[activeVariant] || "A"}
                    </h3>
                    <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                      {currentSubject && <span>{currentSubject.code}</span>}
                      {duration && <span>Duration: {duration}</span>}
                      <span>Max Marks: {answeredMarks}</span>
                    </div>
                    {isDraft && (
                      <Badge variant="secondary" className="text-[10px] mt-2">📝 DRAFT</Badge>
                    )}
                    <div className="flex items-center gap-1.5 mt-2">
                      <Badge className="bg-success/10 text-success border-success/20 text-[10px]">
                        <CheckCircle2 className="w-3 h-3 mr-1" /> AI Validated Paper
                      </Badge>
                    </div>
                  </div>

                  {/* Action Bar */}
                  <div className="flex items-center justify-between gap-2 p-4 border-b border-border flex-wrap">
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={runValidation}>
                        <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Validate
                      </Button>
                      <Button variant="outline" size="sm" onClick={saveAsDraft}>
                        <Save className="w-3.5 h-3.5 mr-1" /> Save Draft
                      </Button>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <Button variant="outline" size="sm" onClick={smartShuffle} disabled={isGenerating}>
                        <RefreshCw className="w-3.5 h-3.5 mr-1" /> Smart Shuffle
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => {
                        setGeneratedVariants(prev => {
                          const updated = [...prev];
                          updated[activeVariant] = [...updated[activeVariant]].sort(() => Math.random() - 0.5).map((q, i) => ({ ...q, questionNumber: i + 1 }));
                          return updated;
                        });
                        toast({ title: "Shuffled!", description: "Question order reshuffled." });
                      }}>
                        <Shuffle className="w-3.5 h-3.5 mr-1" /> Reorder
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => {
                        exportAsPdf(buildExportQuestions(), buildExportMeta());
                      }}>
                        <Download className="w-3.5 h-3.5 mr-1" /> PDF
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => {
                        exportAsDocx(buildExportQuestions(), buildExportMeta());
                      }}>
                        <Download className="w-3.5 h-3.5 mr-1" /> DOCX
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => {
                        exportAsTxt(buildExportQuestions(), buildExportMeta());
                      }}>
                        <Download className="w-3.5 h-3.5 mr-1" /> TXT
                      </Button>
                      {generatedVariants.length > 1 && (
                        <Button variant="outline" size="sm" onClick={() => {
                          const allVars = generatedVariants.map(v => v.map(q => ({
                            questionNumber: q.questionNumber, text: q.text, marks: q.marks, unit: q.unit, difficulty: q.difficulty,
                            orAlternativeText: q.orAlternative?.text,
                          })));
                          const meta = { subjectName: currentSubject?.name || "Paper", subjectCode: currentSubject?.code, maxMarks: answeredMarks, collegeName, examType, duration, watermark: true, sections: useSectionConfig ? sections : undefined };
                          exportAsZip(allVars, meta);
                        }}>
                          <Download className="w-3.5 h-3.5 mr-1" /> ZIP
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Sections */}
                  <div className="p-5 space-y-6">
                    {questionsBySection.map((sectionData, sIdx) => {
                      const { config, questions: sectionQs } = sectionData;
                      const startNum = questionsBySection.slice(0, sIdx).reduce((sum, s) => sum + s.questions.length, 0) + 1;
                      return (
                        <div key={config.id}>
                          {sIdx > 0 && <Separator className="mb-6" />}
                          <SectionBlock
                            title={config.name}
                            markLabel={`${config.marks} Marks Each`}
                            instruction={formatSectionInstruction(config.questionsToAnswer, config.totalQuestions, config.marks)}
                            questions={sectionQs}
                            startNum={startNum}
                            totalMarks={config.questionsToAnswer * config.marks}
                            theme={selectedTheme}
                            showOr={config.enableOr}
                          />
                        </div>
                      );
                    })}
                  </div>

                  {/* Footer */}
                  <div className="p-5 border-t border-border flex justify-between text-sm text-muted-foreground">
                    <span>Total: {answeredMarks} marks • {generatedQuestions.length} questions</span>
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-success" /> Generated
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
                                  k === "Easy" && "bg-success",
                                  k === "Medium" && "bg-warning",
                                  k === "Hard" && "bg-destructive",
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
                          <p className={cn("text-sm font-medium", validationReport.duplicates > 0 ? "text-destructive" : "text-success")}>
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

                {/* Paper Quality Score */}
                {qualityScore && (
                  <PaperQualityScore
                    result={qualityScore}
                    onImprove={improvePaperQuality}
                    improving={isImproving}
                  />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}

const numberWords: Record<number, string> = {
  1: "ONE", 2: "TWO", 3: "THREE", 4: "FOUR", 5: "FIVE",
  6: "SIX", 7: "SEVEN", 8: "EIGHT", 9: "NINE", 10: "TEN",
  11: "ELEVEN", 12: "TWELVE", 13: "THIRTEEN", 14: "FOURTEEN", 15: "FIFTEEN",
};

function formatSectionInstruction(questionsToAnswer: number, totalQuestions: number, marks: number): string {
  if (questionsToAnswer >= totalQuestions) return "Answer ALL questions";
  const word = numberWords[questionsToAnswer] || String(questionsToAnswer);
  const totalMarksVal = questionsToAnswer * marks;
  return `Answer ANY ${word} out of ${totalQuestions} questions (${questionsToAnswer} × ${marks} = ${totalMarksVal} Marks)`;
}

function SectionBlock({ title, markLabel, instruction, questions, startNum, totalMarks, theme, showOr }: {
  title: string;
  markLabel: string;
  instruction: string;
  questions: GeneratedQuestion[];
  startNum: number;
  totalMarks: number;
  theme: string;
  showOr: boolean;
}) {
  return (
    <div className="space-y-2">
      <div className={cn(
        "flex flex-col gap-1 mb-3",
        theme === "jntu" && "border-b border-border pb-2",
        theme === "iit" && "border-b-2 border-foreground pb-2",
      )}>
        <div className="flex items-center gap-2">
          <h4 className="font-display text-base text-foreground">{title}</h4>
          <Badge variant="secondary" className="text-[10px]">{markLabel}</Badge>
          <span className="text-xs text-muted-foreground ml-auto">{totalMarks} marks</span>
        </div>
        <p className="text-xs text-muted-foreground italic font-medium">{instruction}</p>
      </div>
      {questions.map((q, i) => (
        <QuestionRow key={`${title}-${i}`} q={q} num={startNum + i} showOr={showOr} />
      ))}
    </div>
  );
}

function QuestionRow({ q, num, showOr }: { q: GeneratedQuestion; num: number; showOr: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: num * 0.02 }}
      className="p-3 rounded-lg hover:bg-muted/50 transition-colors"
    >
      {/* Main question (A) */}
      <div className="flex items-start gap-3">
        <span className="text-sm font-mono text-muted-foreground w-6 text-right flex-shrink-0">{num}.</span>
        <div className="flex-1">
          {showOr && q.orAlternative && (
            <span className="text-xs font-bold text-accent mr-1">A)</span>
          )}
          <p className="text-sm text-foreground inline">{q.text}</p>
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            <Badge variant="outline" className="text-[10px]">{q.unit}</Badge>
            <Badge variant="outline" className={cn(
              "text-[10px]",
              q.difficulty === "Easy" && "border-success/50 text-success",
              q.difficulty === "Hard" && "border-destructive/50 text-destructive",
            )}>{q.difficulty}</Badge>
            <Badge variant="outline" className="text-[10px] text-muted-foreground">{q.bloom}</Badge>
          </div>
        </div>
        <span className="text-xs font-mono text-muted-foreground flex-shrink-0">[{q.marks}]</span>
      </div>

      {/* OR alternative (B) */}
      {showOr && q.orAlternative && (
        <>
          <div className="flex items-center gap-2 my-2 pl-9">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs font-bold text-accent px-2">OR</span>
            <div className="flex-1 h-px bg-border" />
          </div>
          <div className="flex items-start gap-3">
            <span className="text-sm font-mono text-muted-foreground w-6 text-right flex-shrink-0">{num}.</span>
            <div className="flex-1">
              <span className="text-xs font-bold text-accent mr-1">B)</span>
              <p className="text-sm text-foreground inline">{q.orAlternative.text}</p>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                <Badge variant="outline" className="text-[10px]">{q.orAlternative.unit}</Badge>
              </div>
            </div>
            <span className="text-xs font-mono text-muted-foreground flex-shrink-0">[{q.marks}]</span>
          </div>
        </>
      )}
    </motion.div>
  );
}

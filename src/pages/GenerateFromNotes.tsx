import { useState, useRef, useCallback, useMemo } from "react";
import {
  Upload, FileText, X, CheckCircle2, AlertCircle, Edit3, Save, Trash2,
  Eye, Brain, Sparkles, BookOpen, Download, RefreshCw, Settings2, ShieldCheck, Shuffle
} from "lucide-react";
import { buildKnowledgeContext } from "@/data/subjectKnowledge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { exportAsPdf, exportAsDocx, exportAsTxt } from "@/lib/exportUtils";

const ALLOWED_EXT = [".pdf", ".docx", ".txt"];
const MAX_SIZE = 15 * 1024 * 1024;

interface SectionConfig {
  id: string;
  name: string;
  marks: number;
  totalQuestions: number;
  questionsToAnswer: number;
  enableOr: boolean;
}

interface AIQuestion {
  text: string;
  marks: number;
  unit: string;
  difficulty: string;
  type: string;
  bloom: string;
  section: string;
  orAlternativeText?: string;
  orAlternativeType?: string;
  orAlternativeBloom?: string;
}

interface AIResult {
  detectedSubject: string;
  detectedUnits: string[];
  questions: AIQuestion[];
  contentSummary: string;
  warnings?: string[];
}

const defaultSections: SectionConfig[] = [
  { id: "a", name: "PART – A", marks: 2, totalQuestions: 10, questionsToAnswer: 10, enableOr: false },
  { id: "b", name: "PART – B", marks: 5, totalQuestions: 5, questionsToAnswer: 4, enableOr: true },
  { id: "c", name: "PART – C", marks: 10, totalQuestions: 2, questionsToAnswer: 2, enableOr: true },
];

export default function GenerateFromNotes() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // File state
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState("");

  // Config state
  const [sections, setSections] = useState<SectionConfig[]>(defaultSections);
  const [difficulty, setDifficulty] = useState("mixed");
  const [strictMode, setStrictMode] = useState(true);
  const [subjectHint, setSubjectHint] = useState("");

  // Header customization
  const [collegeName, setCollegeName] = useState("");
  const [examType, setExamType] = useState("");
  const [duration, setDuration] = useState("");

  // Generation state
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("");
  const [result, setResult] = useState<AIResult | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editQuestions, setEditQuestions] = useState<AIQuestion[]>([]);

  // Smart Shuffle state — tracks all previously generated questions across shuffles
  const [shuffleHistory, setShuffleHistory] = useState<string[][]>([]); // array of question text arrays per shuffle
  const [currentShuffleIndex, setCurrentShuffleIndex] = useState(0);
  const MAX_SHUFFLES = 4;

  const totalMarks = useMemo(() => sections.reduce((s, sec) => s + sec.totalQuestions * sec.marks, 0), [sections]);
  const answeredMarks = useMemo(() => sections.reduce((s, sec) => s + sec.questionsToAnswer * sec.marks, 0), [sections]);

  const validateFile = (f: File): string | null => {
    if (f.size > MAX_SIZE) return "File exceeds 15MB limit";
    const ext = f.name.substring(f.name.lastIndexOf(".")).toLowerCase();
    if (!ALLOWED_EXT.includes(ext)) return "Only PDF, DOCX, and TXT files are supported";
    return null;
  };

  const handleFile = useCallback((f: File) => {
    const error = validateFile(f);
    if (error) {
      toast({ title: "Invalid File", description: error, variant: "destructive" });
      return;
    }
    setFile(f);
    setResult(null);
    setEditMode(false);
    setExtractedText("");
    setShuffleHistory([]);
    setCurrentShuffleIndex(0);
  }, [toast]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
  }, [handleFile]);

  const removeFile = () => {
    setFile(null);
    setResult(null);
    setEditMode(false);
    setExtractedText("");
    setShuffleHistory([]);
    setCurrentShuffleIndex(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const updateSection = (index: number, field: keyof SectionConfig, value: number | boolean | string) => {
    setSections(prev => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      if (field === "totalQuestions" && next[index].questionsToAnswer > (value as number)) {
        next[index].questionsToAnswer = value as number;
      }
      return next;
    });
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

  const generateFromNotes = useCallback(async () => {
    if (!file) return;
    setProcessing(true);
    setProgress(0);
    setProgressLabel("Reading file...");
    setResult(null);

    try {
      // Step 1: Extract and CLEAN text
      let rawText = "";
      setProgress(10);
      
      if (file.type === "text/plain" || file.name.endsWith(".txt")) {
        rawText = await file.text();
      } else {
        try {
          rawText = await file.text();
        } catch {
          rawText = "";
        }
      }

      // === MANDATORY TEXT CLEANING FILTER ===
      // Remove PDF binary/structural artifacts
      const pdfJunkPatterns = [
        /%%?EOF/g,
        /%PDF[\s\S]*?(?=\n[A-Z])/g,
        /\d+\s+\d+\s+obj[\s\S]*?endobj/g,
        /stream[\s\S]*?endstream/g,
        /\/\w+\s*(?:\/\w+|\[.*?\]|\(.*?\)|\d+)/g,  // /Type /Page etc.
        /xref[\s\S]*?startxref\s*\d+/g,
        /<<[\s\S]*?>>/g,
        /FlateDecode|ASCIIHexDecode|LZWDecode|DCTDecode/g,
        /\/(?:Length|Registry|Ordering|Supplement|Filter|Width|Height|BitsPerComponent)\b[^\n]*/g,
        /[^\x20-\x7E\n\r\t]/g, // non-printable characters
      ];
      
      let text = rawText;
      for (const pattern of pdfJunkPatterns) {
        text = text.replace(pattern, " ");
      }
      
      // Collapse excessive whitespace
      text = text.replace(/[ \t]{2,}/g, " ").replace(/\n{3,}/g, "\n\n").trim();
      
      // Filter: keep only lines that look like real sentences/headings (3+ word lines)
      const lines = text.split("\n");
      const academicLines = lines.filter(line => {
        const trimmed = line.trim();
        if (trimmed.length < 5) return false;
        const wordCount = trimmed.split(/\s+/).length;
        // Keep lines with 2+ real words
        return wordCount >= 2;
      });
      text = academicLines.join("\n").trim();

      if (text.length < 100) {
        toast({
          title: "Invalid Academic Content",
          description: "Could not extract readable academic text. For PDF/DOCX files, please convert to TXT format first.",
          variant: "destructive",
        });
        setProcessing(false);
        return;
      }

      setExtractedText(text);
      setProgress(30);
      setProgressLabel("Analyzing content with AI...");

      // Step 2: Call AI edge function
      const { data, error } = await supabase.functions.invoke("generate-from-notes", {
        body: {
          text: text.substring(0, 15000),
          sections,
          difficulty,
          strictMode,
          subjectHint: subjectHint || undefined,
        },
      });

      if (error) {
        throw new Error(error.message || "AI processing failed");
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      setProgress(90);
      setProgressLabel("Finalizing questions...");

      const aiResult = data as AIResult;
      setResult(aiResult);
      setEditQuestions(aiResult.questions);
      setProgress(100);
      setProgressLabel("Complete!");

      // Show warnings if any
      if (aiResult.warnings && aiResult.warnings.length > 0) {
        toast({
          title: "⚠ Generation Warnings",
          description: aiResult.warnings[0],
        });
      }

      toast({
        title: "✨ Questions Generated!",
        description: `${aiResult.questions.length} questions from "${aiResult.detectedSubject}" across ${aiResult.detectedUnits.length} units.`,
      });

      // Save to database
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("papers").insert({
          user_id: user.id,
          title: `${aiResult.detectedSubject} - AI Generated from Notes`,
          subject: aiResult.detectedSubject,
          department: "AI Generated",
          max_marks: answeredMarks,
          total_questions: aiResult.questions.length,
          questions: aiResult.questions as any,
          paper_data: { collegeName, examType, duration, source: "notes", sections } as any,
          is_draft: false,
          difficulty,
          college_name: collegeName || null,
          exam_type: examType || null,
          duration: duration || null,
        } as any);
      }
    } catch (err: any) {
      console.error("Generation error:", err);
      toast({
        title: "Generation Failed",
        description: err.message || "Could not generate questions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  }, [file, sections, difficulty, strictMode, subjectHint, toast, collegeName, examType, duration, answeredMarks]);

  const saveEdits = useCallback(() => {
    if (!result) return;
    setResult({ ...result, questions: editQuestions });
    setEditMode(false);
    toast({ title: "Changes Saved", description: "Questions updated." });
  }, [result, editQuestions, toast]);

  const deleteQuestion = (index: number) => {
    setEditQuestions(prev => prev.filter((_, i) => i !== index));
  };

  const updateQuestion = (index: number, field: keyof AIQuestion, value: string | number) => {
    setEditQuestions(prev => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  // Group questions by section for display
  const questionsBySection = useMemo(() => {
    const qs = editMode ? editQuestions : (result?.questions || []);
    const grouped: Record<string, AIQuestion[]> = {};
    qs.forEach(q => {
      const sec = q.section || "PART – A";
      if (!grouped[sec]) grouped[sec] = [];
      grouped[sec].push(q);
    });
    return grouped;
  }, [result, editQuestions, editMode]);

  const buildExportQuestions = useCallback(() => {
    const qs = result?.questions || [];
    return qs.map((q, i) => ({
      questionNumber: i + 1,
      text: q.text,
      marks: q.marks,
      unit: q.unit,
      difficulty: q.difficulty,
      orAlternativeText: q.orAlternativeText,
    }));
  }, [result]);

  const buildExportMeta = useCallback(() => ({
    subjectName: result?.detectedSubject || "Paper",
    maxMarks: answeredMarks,
    collegeName,
    examType,
    duration,
    watermark: true,
    paperId: `CQ-AI-${Date.now().toString(36).toUpperCase()}`,
    sections,
  }), [result, answeredMarks, collegeName, examType, duration, sections]);

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
            <Brain className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h1 className="text-3xl font-display text-foreground">Generate from Notes</h1>
            <p className="text-muted-foreground mt-0.5">Upload notes or PDFs — AI generates a structured question paper.</p>
          </div>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Left Panel: Upload & Config */}
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2 space-y-4"
        >
          {/* Upload Zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "elevated-card rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all min-h-[180px] border-2 border-dashed",
              dragOver ? "border-accent bg-accent/5" : "border-border hover:border-accent/50",
              file && "border-accent/40 bg-accent/5"
            )}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.txt"
              className="hidden"
              onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }}
            />
            {file ? (
              <>
                <FileText className="w-10 h-10 text-accent mb-3" />
                <p className="text-sm font-medium text-foreground">{file.name}</p>
                <p className="text-xs text-muted-foreground mt-1">{(file.size / 1024).toFixed(1)} KB</p>
                <Button variant="ghost" size="sm" className="mt-3 text-destructive" onClick={(e) => { e.stopPropagation(); removeFile(); }}>
                  <X className="w-3.5 h-3.5 mr-1" /> Remove
                </Button>
              </>
            ) : (
              <>
                <Upload className="w-10 h-10 text-muted-foreground mb-3" />
                <p className="text-sm font-medium text-foreground">Drag & drop or click to upload</p>
                <p className="text-xs text-muted-foreground mt-1">PDF, DOCX, TXT • Max 15MB</p>
              </>
            )}
          </div>

          {/* Subject Hint */}
          <div className="elevated-card rounded-xl p-4 space-y-3">
            <Label className="text-sm font-medium">Subject Hint (optional)</Label>
            <Input
              value={subjectHint}
              onChange={e => setSubjectHint(e.target.value)}
              placeholder="e.g. Database Management Systems"
              className="text-sm"
            />
            <p className="text-[10px] text-muted-foreground">Leave empty for auto-detection</p>
          </div>

          {/* Strict Mode */}
          <div className="elevated-card rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-accent" />
                <div>
                  <Label className="text-sm font-medium">Strict Mode</Label>
                  <p className="text-[10px] text-muted-foreground">Questions only from uploaded content</p>
                </div>
              </div>
              <Switch checked={strictMode} onCheckedChange={setStrictMode} />
            </div>
          </div>

          {/* Section Config */}
          <div className="elevated-card rounded-xl p-4 space-y-3">
            <h3 className="font-display text-base text-foreground flex items-center gap-2">
              <Settings2 className="w-4 h-4 text-accent" /> Paper Sections
            </h3>
            {sections.map((section, idx) => (
              <div key={section.id} className="rounded-lg border border-accent/20 bg-accent/5 p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <Input
                    value={section.name}
                    onChange={e => updateSection(idx, "name", e.target.value)}
                    className="h-7 text-xs font-semibold w-32"
                  />
                  {sections.length > 1 && (
                    <Button variant="ghost" size="sm" className="h-6 text-xs text-destructive" onClick={() => removeSection(idx)}>Remove</Button>
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
                        <SelectItem value="5">5 Marks</SelectItem>
                        <SelectItem value="10">10 Marks</SelectItem>
                        <SelectItem value="15">15 Marks</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-0.5">
                    <Label className="text-[10px] text-muted-foreground">Total Qs</Label>
                    <Input type="number" min={0} value={section.totalQuestions}
                      onChange={e => updateSection(idx, "totalQuestions", Math.max(0, parseInt(e.target.value) || 0))}
                      className="h-7 text-xs text-center" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-0.5">
                    <Label className="text-[10px] text-muted-foreground">Answer Any</Label>
                    <Input type="number" min={0} max={section.totalQuestions} value={section.questionsToAnswer}
                      onChange={e => updateSection(idx, "questionsToAnswer", Math.min(section.totalQuestions, Math.max(0, parseInt(e.target.value) || 0)))}
                      className="h-7 text-xs text-center" />
                  </div>
                  <div className="flex items-end gap-1.5 pb-0.5">
                    <Switch checked={section.enableOr} onCheckedChange={v => updateSection(idx, "enableOr", v)} className="scale-75" />
                    <Label className="text-[10px] text-muted-foreground">OR options</Label>
                  </div>
                </div>
              </div>
            ))}
            <Button variant="outline" size="sm" className="w-full text-xs" onClick={addSection}>+ Add Section</Button>
          </div>

          {/* Difficulty */}
          <div className="elevated-card rounded-xl p-4 space-y-2">
            <Label className="text-sm">Difficulty Level</Label>
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

          {/* Paper Header */}
          <div className="elevated-card rounded-xl p-4 space-y-3">
            <h3 className="font-display text-base text-foreground">Paper Header</h3>
            <div className="space-y-2">
              <Label className="text-xs">College Name</Label>
              <Input value={collegeName} onChange={e => setCollegeName(e.target.value)} placeholder="Enter college name" className="text-sm" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs">Exam Type</Label>
                <Select value={examType} onValueChange={setExamType}>
                  <SelectTrigger className="text-xs"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mid Semester">Mid Semester</SelectItem>
                    <SelectItem value="End Semester">End Semester</SelectItem>
                    <SelectItem value="Internal Assessment">Internal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Duration</Label>
                <Input value={duration} onChange={e => setDuration(e.target.value)} placeholder="3 hrs" className="text-sm" />
              </div>
            </div>
          </div>

          {/* Marks Summary */}
          <div className="elevated-card rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Marks (Paper)</span>
              <Badge variant="default" className="font-mono">{totalMarks}</Badge>
            </div>
            {answeredMarks !== totalMarks && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Max Marks (To Answer)</span>
                <Badge variant="outline" className="font-mono text-accent">{answeredMarks}</Badge>
              </div>
            )}
          </div>

          {/* Generate Button */}
          <Button
            className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-medium h-12 text-base"
            onClick={generateFromNotes}
            disabled={!file || processing}
          >
            {processing ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-accent-foreground/30 border-t-accent-foreground rounded-full animate-spin" />
                {progressLabel || "Processing..."}
              </span>
            ) : (
              <span className="flex items-center gap-2"><Sparkles className="w-5 h-5" /> Generate from Notes</span>
            )}
          </Button>

          {processing && <Progress value={progress} className="h-2" />}
        </motion.div>

        {/* Right Panel: Results */}
        <motion.div
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-3"
        >
          {!result ? (
            <div className="elevated-card rounded-xl p-12 flex flex-col items-center justify-center text-center min-h-[600px]">
              <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                <Brain className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-display text-xl text-foreground mb-2">AI Question Generator</h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                Upload your lecture notes, syllabus, or study material. The AI will analyze the content and generate a structured university-style question paper.
              </p>
              <div className="mt-6 flex flex-wrap gap-2 justify-center">
                <Badge variant="secondary" className="text-xs">📝 Short answers</Badge>
                <Badge variant="secondary" className="text-xs">📖 Long answers</Badge>
                <Badge variant="secondary" className="text-xs">🔢 Numericals</Badge>
                <Badge variant="secondary" className="text-xs">📊 Case Studies</Badge>
                <Badge variant="secondary" className="text-xs">🔄 OR Options</Badge>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Analysis Summary */}
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="elevated-card rounded-xl p-5 space-y-3">
                <h3 className="font-display text-base text-foreground flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-accent" /> AI Analysis
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Detected Subject</span><span className="text-foreground font-medium">{result.detectedSubject}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Questions Generated</span><span className="text-foreground font-medium">{result.questions.length}</span></div>
                  {result.contentSummary && (
                    <p className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-2 mt-2">{result.contentSummary}</p>
                  )}
                  <p className="text-xs text-muted-foreground font-medium mt-2">Detected Units</p>
                  <div className="flex gap-1 flex-wrap">
                    {result.detectedUnits.map((u, i) => (
                      <Badge key={i} variant="secondary" className="text-[10px]">{u}</Badge>
                    ))}
                  </div>
                  {result.warnings && result.warnings.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {result.warnings.map((w, i) => (
                        <p key={i} className="text-xs text-warning flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> {w}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Paper */}
              <div className="elevated-card rounded-xl overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-border">
                  <h3 className="font-display text-lg text-foreground flex items-center gap-2">
                    <Eye className="w-5 h-5 text-accent" /> Generated Paper
                  </h3>
                  <div className="flex gap-2">
                    {editMode ? (
                      <Button variant="outline" size="sm" onClick={saveEdits}>
                        <Save className="w-3.5 h-3.5 mr-1" /> Save Changes
                      </Button>
                    ) : (
                      <Button variant="outline" size="sm" onClick={() => setEditMode(true)}>
                        <Edit3 className="w-3.5 h-3.5 mr-1" /> Edit
                      </Button>
                    )}
                  </div>
                </div>

                {/* Paper Header */}
                <div className="p-6 border-b border-border text-center space-y-1">
                  {collegeName && <p className="text-sm font-bold text-foreground uppercase tracking-wider">{collegeName}</p>}
                  {examType && <p className="text-xs text-muted-foreground">{examType} Examination</p>}
                  <h3 className="font-display text-xl text-foreground">{result.detectedSubject}</h3>
                  <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                    {duration && <span>Duration: {duration}</span>}
                    <span>Max Marks: {answeredMarks}</span>
                  </div>
                </div>

                {/* Export Bar */}
                <div className="flex items-center justify-end gap-2 p-3 border-b border-border flex-wrap">
                  <Button variant="outline" size="sm" onClick={() => generateFromNotes()} disabled={processing}>
                    <RefreshCw className="w-3.5 h-3.5 mr-1" /> Regenerate
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => exportAsPdf(buildExportQuestions(), buildExportMeta())}>
                    <Download className="w-3.5 h-3.5 mr-1" /> PDF
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => exportAsDocx(buildExportQuestions(), buildExportMeta())}>
                    <Download className="w-3.5 h-3.5 mr-1" /> DOCX
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => exportAsTxt(buildExportQuestions(), buildExportMeta())}>
                    <Download className="w-3.5 h-3.5 mr-1" /> TXT
                  </Button>
                </div>

                {/* Questions by Section */}
                <div className="p-5 space-y-6 max-h-[700px] overflow-y-auto">
                  {Object.entries(questionsBySection).map(([sectionName, sectionQs], sIdx) => {
                    const sectionConfig = sections.find(s => s.name === sectionName);
                    const instruction = sectionConfig && sectionConfig.questionsToAnswer < sectionConfig.totalQuestions
                      ? `Answer any ${sectionConfig.questionsToAnswer} out of ${sectionConfig.totalQuestions} questions`
                      : "Answer all questions";
                    return (
                      <div key={sectionName}>
                        {sIdx > 0 && <Separator className="mb-4" />}
                        <div className="mb-3">
                          <div className="flex items-center gap-2">
                            <h4 className="font-display text-base text-foreground">{sectionName}</h4>
                            {sectionConfig && <Badge variant="secondary" className="text-[10px]">{sectionConfig.marks} Marks Each</Badge>}
                          </div>
                          <p className="text-xs text-muted-foreground italic">{instruction}</p>
                        </div>
                        {sectionQs.map((q, qi) => {
                          const globalIdx = (result?.questions || editQuestions).indexOf(q);
                          return (
                            <div key={qi} className="rounded-lg border border-border p-3 mb-2 hover:bg-muted/30 transition-colors">
                              {editMode ? (
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-mono text-muted-foreground w-6">{qi + 1}.</span>
                                    <Textarea
                                      value={editQuestions[globalIdx]?.text || q.text}
                                      onChange={e => updateQuestion(globalIdx, "text", e.target.value)}
                                      className="text-sm min-h-[50px]"
                                    />
                                  </div>
                                  <div className="flex gap-2 ml-8">
                                    <Select value={editQuestions[globalIdx]?.difficulty || q.difficulty} onValueChange={v => updateQuestion(globalIdx, "difficulty", v)}>
                                      <SelectTrigger className="w-24 h-7 text-xs"><SelectValue /></SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="Easy">Easy</SelectItem>
                                        <SelectItem value="Medium">Medium</SelectItem>
                                        <SelectItem value="Hard">Hard</SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <Button variant="ghost" size="sm" className="h-7 text-destructive" onClick={() => deleteQuestion(globalIdx)}>
                                      <Trash2 className="w-3 h-3" />
                                    </Button>
                                  </div>
                                  {q.orAlternativeText && (
                                    <div className="ml-8 mt-2 border-l-2 border-accent/30 pl-3">
                                      <p className="text-[10px] font-bold text-accent mb-1">OR (B)</p>
                                      <Textarea
                                        value={editQuestions[globalIdx]?.orAlternativeText || ""}
                                        onChange={e => updateQuestion(globalIdx, "orAlternativeText", e.target.value)}
                                        className="text-sm min-h-[40px]"
                                      />
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div>
                                  <div className="flex items-start gap-3">
                                    <span className="text-sm font-mono text-muted-foreground w-6 text-right flex-shrink-0">{qi + 1}.</span>
                                    <div className="flex-1">
                                      {q.orAlternativeText && <span className="text-xs font-bold text-accent mr-1">A)</span>}
                                      <p className="text-sm text-foreground inline">{q.text}</p>
                                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                                        <Badge variant="outline" className="text-[10px]">{q.unit}</Badge>
                                        <Badge variant="outline" className={cn(
                                          "text-[10px]",
                                          q.difficulty === "Easy" && "border-success/50 text-success",
                                          q.difficulty === "Hard" && "border-destructive/50 text-destructive",
                                        )}>{q.difficulty}</Badge>
                                        <Badge variant="secondary" className="text-[10px]">{q.type}</Badge>
                                        <Badge variant="outline" className="text-[10px] text-muted-foreground">{q.bloom}</Badge>
                                      </div>
                                    </div>
                                    <span className="text-xs font-mono text-muted-foreground flex-shrink-0">[{q.marks}]</span>
                                  </div>
                                  {q.orAlternativeText && (
                                    <div className="ml-9 mt-3 border-l-2 border-accent/30 pl-3">
                                      <p className="text-[10px] font-bold text-accent mb-1">OR</p>
                                      <div className="flex items-start gap-1">
                                        <span className="text-xs font-bold text-accent mr-1">{qi + 1}. B)</span>
                                        <p className="text-sm text-foreground">{q.orAlternativeText}</p>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-border flex justify-between text-sm text-muted-foreground">
                  <span>Total: {answeredMarks} marks • {result.questions.length} questions</span>
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-accent" /> AI Generated from Notes
                  </span>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

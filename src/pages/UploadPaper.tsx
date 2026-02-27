import { useState, useRef, useCallback } from "react";
import {
  Upload, FileText, X, CheckCircle2, AlertCircle, Edit3, Save, Trash2, Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const ALLOWED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
];
const ALLOWED_EXT = [".pdf", ".docx", ".txt"];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

interface ExtractedQuestion {
  id: string;
  text: string;
  marks: number;
  unit: string;
  section: string;
  type: "Theory" | "Numerical" | "Case Study";
}

interface PaperAnalysis {
  subject: string;
  units: string[];
  sections: string[];
  totalMarks: number;
  questions: ExtractedQuestion[];
  marksDistribution: Record<string, number>;
  difficultyBreakdown: Record<string, number>;
}

export default function UploadPaper() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [analysis, setAnalysis] = useState<PaperAnalysis | null>(null);
  const [editing, setEditing] = useState(false);
  const [editQuestions, setEditQuestions] = useState<ExtractedQuestion[]>([]);

  const validateFile = (f: File): string | null => {
    if (f.size > MAX_SIZE) return "File exceeds 10MB limit";
    const ext = f.name.substring(f.name.lastIndexOf(".")).toLowerCase();
    if (!ALLOWED_EXT.includes(ext) && !ALLOWED_TYPES.includes(f.type)) {
      return "Only PDF, DOCX, and TXT files are supported";
    }
    return null;
  };

  const handleFile = useCallback((f: File) => {
    const error = validateFile(f);
    if (error) {
      toast({ title: "Invalid File", description: error, variant: "destructive" });
      return;
    }
    setFile(f);
    setAnalysis(null);
    setEditing(false);
  }, [toast]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
  }, [handleFile]);

  const processFile = useCallback(async () => {
    if (!file) return;
    setUploading(true);
    setUploadProgress(0);

    const interval = setInterval(() => {
      setUploadProgress(p => Math.min(p + 12, 85));
    }, 150);

    try {
      // Read file as text for TXT, simulate extraction for PDF/DOCX
      let extractedText = "";
      if (file.type === "text/plain") {
        extractedText = await file.text();
      } else {
        // For PDF/DOCX, we simulate text extraction client-side
        extractedText = `[Extracted content from ${file.name}]`;
      }

      // Simulate AI analysis
      await new Promise(r => setTimeout(r, 1500));

      const mockQuestions: ExtractedQuestion[] = [
        { id: "q1", text: "Define normalization and its types.", marks: 2, unit: "Unit 2", section: "A", type: "Theory" },
        { id: "q2", text: "Explain the difference between 2NF and 3NF with examples.", marks: 5, unit: "Unit 2", section: "B", type: "Theory" },
        { id: "q3", text: "What is an ER diagram? Draw an ER diagram for a library management system.", marks: 10, unit: "Unit 1", section: "C", type: "Case Study" },
        { id: "q4", text: "List the ACID properties of transactions.", marks: 2, unit: "Unit 3", section: "A", type: "Theory" },
        { id: "q5", text: "Explain deadlock detection in DBMS with an example.", marks: 5, unit: "Unit 4", section: "B", type: "Theory" },
        { id: "q6", text: "Solve: Given a relation R(A,B,C,D) with FDs A→B, B→C, find the candidate keys.", marks: 5, unit: "Unit 2", section: "B", type: "Numerical" },
        { id: "q7", text: "Discuss B+ tree indexing and its advantages over B-tree.", marks: 10, unit: "Unit 5", section: "C", type: "Theory" },
        { id: "q8", text: "Write SQL queries for the given schema.", marks: 5, unit: "Unit 2", section: "B", type: "Numerical" },
      ];

      const result: PaperAnalysis = {
        subject: "Database Management Systems",
        units: ["Unit 1: ER Model", "Unit 2: SQL & Normalization", "Unit 3: Transactions", "Unit 4: Concurrency", "Unit 5: Indexing"],
        sections: ["A", "B", "C"],
        totalMarks: mockQuestions.reduce((s, q) => s + q.marks, 0),
        questions: mockQuestions,
        marksDistribution: { "2M": 2, "5M": 4, "10M": 2 },
        difficultyBreakdown: { Theory: 5, Numerical: 2, "Case Study": 1 },
      };

      clearInterval(interval);
      setUploadProgress(100);

      // Save to database
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("uploaded_papers").insert({
          user_id: user.id,
          file_name: file.name,
          file_type: file.type || "unknown",
          detected_subject: result.subject,
          detected_units: result.units as any,
          marks_distribution: result.marksDistribution as any,
          sections: result.sections as any,
          questions: result.questions as any,
          analysis: result.difficultyBreakdown as any,
          extracted_text: extractedText.substring(0, 10000),
          status: "completed",
        });
      }

      setAnalysis(result);
      setEditQuestions(result.questions);
      toast({ title: "Upload Complete", description: `${result.questions.length} questions extracted from ${file.name}` });
    } catch (err) {
      toast({ title: "Processing Failed", description: "Could not extract content from the file.", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  }, [file, toast]);

  const saveEdits = useCallback(() => {
    if (!analysis) return;
    setAnalysis({ ...analysis, questions: editQuestions, totalMarks: editQuestions.reduce((s, q) => s + q.marks, 0) });
    setEditing(false);
    toast({ title: "Changes Saved", description: "Paper has been updated." });
  }, [analysis, editQuestions, toast]);

  const removeFile = () => {
    setFile(null);
    setAnalysis(null);
    setEditing(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-display text-foreground">Upload Paper</h1>
        <p className="text-muted-foreground mt-1">Upload question papers for analysis, editing, and storage.</p>
      </motion.div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Upload Zone */}
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2 space-y-4"
        >
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "elevated-card rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all min-h-[220px] border-2 border-dashed",
              dragOver ? "border-accent bg-accent/5" : "border-border hover:border-accent/50",
              file && "border-success/40 bg-success/5"
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
                <FileText className="w-10 h-10 text-success mb-3" />
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
                <p className="text-xs text-muted-foreground mt-1">PDF, DOCX, TXT • Max 10MB</p>
              </>
            )}
          </div>

          {uploading && (
            <div className="space-y-2">
              <Progress value={uploadProgress} className="h-2" />
              <p className="text-xs text-muted-foreground text-center">Processing... {uploadProgress}%</p>
            </div>
          )}

          <Button
            className="w-full bg-accent text-accent-foreground hover:bg-accent/90 h-11"
            disabled={!file || uploading}
            onClick={processFile}
          >
            {uploading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-accent-foreground/30 border-t-accent-foreground rounded-full animate-spin" />
                Processing...
              </span>
            ) : (
              <span className="flex items-center gap-2"><Upload className="w-4 h-4" /> Upload & Analyze</span>
            )}
          </Button>

          {/* Analysis Summary */}
          {analysis && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="elevated-card rounded-xl p-5 space-y-3">
              <h3 className="font-display text-base text-foreground flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-success" /> Analysis Summary
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Subject</span><span className="text-foreground font-medium">{analysis.subject}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Total Marks</span><span className="text-foreground font-medium">{analysis.totalMarks}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Questions</span><span className="text-foreground font-medium">{analysis.questions.length}</span></div>
                <Separator />
                <p className="text-xs text-muted-foreground font-medium">Marks Distribution</p>
                <div className="flex gap-2 flex-wrap">
                  {Object.entries(analysis.marksDistribution).map(([k, v]) => (
                    <Badge key={k} variant="secondary" className="text-xs">{k}: {v}</Badge>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground font-medium">Question Types</p>
                <div className="flex gap-2 flex-wrap">
                  {Object.entries(analysis.difficultyBreakdown).map(([k, v]) => (
                    <Badge key={k} variant="outline" className="text-xs">{k}: {v}</Badge>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground font-medium">Units Detected</p>
                <div className="flex gap-1 flex-wrap">
                  {analysis.units.map((u, i) => (
                    <Badge key={i} variant="secondary" className="text-[10px]">{u}</Badge>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Preview Panel */}
        <motion.div
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-3"
        >
          {!analysis ? (
            <div className="elevated-card rounded-xl p-12 flex flex-col items-center justify-center text-center min-h-[500px]">
              <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                <FileText className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-display text-xl text-foreground mb-2">No Paper Uploaded</h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                Upload a question paper to see the extracted questions and analysis.
              </p>
            </div>
          ) : (
            <div className="elevated-card rounded-xl overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-border">
                <h3 className="font-display text-lg text-foreground flex items-center gap-2">
                  <Eye className="w-5 h-5 text-accent" /> Extracted Questions
                </h3>
                <div className="flex gap-2">
                  {editing ? (
                    <Button variant="outline" size="sm" onClick={saveEdits}>
                      <Save className="w-3.5 h-3.5 mr-1" /> Save Changes
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
                      <Edit3 className="w-3.5 h-3.5 mr-1" /> Edit
                    </Button>
                  )}
                </div>
              </div>

              <div className="p-5 space-y-3 max-h-[600px] overflow-y-auto">
                {(editing ? editQuestions : analysis.questions).map((q, i) => (
                  <div key={q.id} className="rounded-lg border border-border p-3 hover:bg-muted/30 transition-colors">
                    {editing ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-mono text-muted-foreground w-6">{i + 1}.</span>
                          <Textarea
                            value={editQuestions[i].text}
                            onChange={(e) => {
                              const next = [...editQuestions];
                              next[i] = { ...next[i], text: e.target.value };
                              setEditQuestions(next);
                            }}
                            className="text-sm min-h-[60px]"
                          />
                        </div>
                        <div className="flex gap-2 ml-8">
                          <div className="flex items-center gap-1">
                            <Label className="text-[10px]">Marks:</Label>
                            <Input
                              type="number"
                              value={editQuestions[i].marks}
                              onChange={(e) => {
                                const next = [...editQuestions];
                                next[i] = { ...next[i], marks: parseInt(e.target.value) || 0 };
                                setEditQuestions(next);
                              }}
                              className="w-16 h-7 text-xs"
                            />
                          </div>
                          <div className="flex items-center gap-1">
                            <Label className="text-[10px]">Unit:</Label>
                            <Input
                              value={editQuestions[i].unit}
                              onChange={(e) => {
                                const next = [...editQuestions];
                                next[i] = { ...next[i], unit: e.target.value };
                                setEditQuestions(next);
                              }}
                              className="w-24 h-7 text-xs"
                            />
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-destructive"
                            onClick={() => setEditQuestions(prev => prev.filter((_, idx) => idx !== i))}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start gap-3">
                        <span className="text-sm font-mono text-muted-foreground w-6 text-right flex-shrink-0">{i + 1}.</span>
                        <div className="flex-1">
                          <p className="text-sm text-foreground">{q.text}</p>
                          <div className="flex gap-1.5 mt-1.5 flex-wrap">
                            <Badge variant="outline" className="text-[10px]">{q.unit}</Badge>
                            <Badge variant="outline" className="text-[10px]">{q.section}</Badge>
                            <Badge variant="secondary" className="text-[10px]">{q.marks}M</Badge>
                            <Badge variant="secondary" className={cn(
                              "text-[10px]",
                              q.type === "Numerical" && "border-info/50 text-info",
                              q.type === "Case Study" && "border-warning/50 text-warning",
                            )}>{q.type}</Badge>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

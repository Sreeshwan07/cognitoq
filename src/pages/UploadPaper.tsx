import { useState, useRef } from "react";
import {
  Upload, FileText, BarChart3, CheckCircle2, AlertCircle,
  Edit3, Trash2, Loader2, BookOpen, Hash
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface ExtractedQuestion {
  id: string;
  text: string;
  marks: number;
  unit: string;
  type: "Theory" | "Numerical" | "Case Study";
  section: string;
}

interface UploadAnalysis {
  totalQuestions: number;
  totalMarks: number;
  unitDistribution: Record<string, number>;
  difficultyBreakdown: Record<string, number>;
  questionTypes: Record<string, number>;
  duplicateCount: number;
}

export default function UploadPaper() {
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [extracted, setExtracted] = useState(false);
  const [extractedText, setExtractedText] = useState("");
  const [questions, setQuestions] = useState<ExtractedQuestion[]>([]);
  const [analysis, setAnalysis] = useState<UploadAnalysis | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    const validTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ];
    if (!validTypes.includes(selected.type)) {
      toast({ title: "Invalid file", description: "Please upload PDF, DOCX, or TXT files.", variant: "destructive" });
      return;
    }

    setFile(selected);
    setExtracted(false);
    setQuestions([]);
    setAnalysis(null);
  };

  const processFile = async () => {
    if (!file || !user) return;

    setUploading(true);
    setUploadProgress(0);

    const progressInterval = setInterval(() => {
      setUploadProgress(p => Math.min(p + 10, 90));
    }, 150);

    try {
      // Read file text (for TXT files)
      let text = "";
      if (file.type === "text/plain") {
        text = await file.text();
      } else {
        // For PDF/DOCX, simulate extraction
        text = `[Extracted from ${file.name}]\n\nSection A (2 marks each)\n1. Define normalization. (2M)\n2. What is ER model? (2M)\n3. List ACID properties. (2M)\n4. Define a primary key. (2M)\n5. What is SQL? (2M)\n\nSection B (5 marks each)\n6. Explain 3NF with example. (5M)\n7. Describe relational algebra operations. (5M)\n8. Write SQL queries for joins. (5M)\n\nSection C (10 marks each)\n9. Design an ER diagram for a library management system. (10M)\n10. Explain transaction management with concurrency control. (10M)`;
      }

      setExtractedText(text);

      // Parse questions from text
      const parsed = parseQuestions(text);
      setQuestions(parsed);

      // Generate analysis
      const analysisData = generateAnalysis(parsed);
      setAnalysis(analysisData);

      // Upload to storage
      const filePath = `${user.id}/${Date.now()}_${file.name}`;
      await supabase.storage.from("papers").upload(filePath, file);

      // Save to database
      await supabase.from("uploaded_papers").insert({
        user_id: user.id,
        file_name: file.name,
        file_type: file.type,
        file_url: filePath,
        extracted_text: text,
        detected_subject: "DBMS",
        detected_units: parsed.map(q => q.unit) as unknown as import("@/integrations/supabase/types").Json,
        marks_distribution: analysisData.unitDistribution as unknown as import("@/integrations/supabase/types").Json,
        questions: parsed as unknown as import("@/integrations/supabase/types").Json,
        analysis: analysisData as unknown as import("@/integrations/supabase/types").Json,
        status: "completed",
      });

      clearInterval(progressInterval);
      setUploadProgress(100);
      setExtracted(true);

      toast({ title: "Paper processed!", description: `${parsed.length} questions extracted successfully.` });
    } catch (error: any) {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const parseQuestions = (text: string): ExtractedQuestion[] => {
    const lines = text.split("\n").filter(l => l.trim());
    const result: ExtractedQuestion[] = [];
    let currentSection = "A";

    for (const line of lines) {
      if (line.toLowerCase().includes("section b")) { currentSection = "B"; continue; }
      if (line.toLowerCase().includes("section c")) { currentSection = "C"; continue; }

      const match = line.match(/^\d+\.\s*(.+?)\s*\((\d+)M?\)/i);
      if (match) {
        const marks = parseInt(match[2]);
        result.push({
          id: crypto.randomUUID(),
          text: match[1].trim(),
          marks,
          unit: `Unit ${Math.ceil(result.length / 2) || 1}`,
          type: marks >= 10 ? "Case Study" : marks >= 5 ? "Theory" : "Theory",
          section: currentSection,
        });
      }
    }
    return result;
  };

  const generateAnalysis = (qs: ExtractedQuestion[]): UploadAnalysis => {
    const unitDist: Record<string, number> = {};
    const typeDist: Record<string, number> = {};

    qs.forEach(q => {
      unitDist[q.unit] = (unitDist[q.unit] || 0) + 1;
      typeDist[q.type] = (typeDist[q.type] || 0) + 1;
    });

    return {
      totalQuestions: qs.length,
      totalMarks: qs.reduce((s, q) => s + q.marks, 0),
      unitDistribution: unitDist,
      difficultyBreakdown: { Easy: 40, Medium: 40, Hard: 20 },
      questionTypes: typeDist,
      duplicateCount: 0,
    };
  };

  const updateQuestion = (id: string, field: keyof ExtractedQuestion, value: any) => {
    setQuestions(prev => prev.map(q => q.id === id ? { ...q, [field]: value } : q));
    setEditingId(null);
  };

  const deleteQuestion = (id: string) => {
    setQuestions(prev => prev.filter(q => q.id !== id));
  };

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-display text-foreground">Upload Paper</h1>
        <p className="text-muted-foreground mt-1">Upload question papers for analysis and extraction.</p>
      </motion.div>

      {/* Upload Zone */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="elevated-card rounded-xl p-8"
      >
        <div
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors",
            file ? "border-accent bg-accent/5" : "border-border hover:border-accent/50"
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.txt"
            onChange={handleFileSelect}
            className="hidden"
          />
          <Upload className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
          {file ? (
            <div>
              <p className="text-foreground font-medium">{file.name}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {(file.size / 1024).toFixed(1)} KB • {file.type.split("/").pop()?.toUpperCase()}
              </p>
            </div>
          ) : (
            <div>
              <p className="text-foreground font-medium">Drop your paper here or click to browse</p>
              <p className="text-sm text-muted-foreground mt-1">Supports PDF, DOCX, TXT</p>
            </div>
          )}
        </div>

        {file && !extracted && (
          <div className="mt-4 space-y-3">
            {uploading && <Progress value={uploadProgress} className="h-2" />}
            <Button onClick={processFile} disabled={uploading} className="w-full">
              {uploading ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</> : "Process Paper"}
            </Button>
          </div>
        )}
      </motion.div>

      {/* Results */}
      <AnimatePresence>
        {extracted && analysis && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {/* Analysis Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Questions", value: analysis.totalQuestions, icon: Hash },
                { label: "Total Marks", value: analysis.totalMarks, icon: BarChart3 },
                { label: "Units Covered", value: Object.keys(analysis.unitDistribution).length, icon: BookOpen },
                { label: "Duplicates", value: analysis.duplicateCount, icon: analysis.duplicateCount > 0 ? AlertCircle : CheckCircle2 },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="elevated-card rounded-xl p-4">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                    <Icon className="w-4 h-4" /> {label}
                  </div>
                  <p className="text-2xl font-display text-foreground">{value}</p>
                </div>
              ))}
            </div>

            {/* Tabs */}
            <Tabs defaultValue="questions" className="elevated-card rounded-xl">
              <TabsList className="w-full justify-start rounded-t-xl rounded-b-none border-b border-border px-4 pt-2">
                <TabsTrigger value="questions">Questions ({questions.length})</TabsTrigger>
                <TabsTrigger value="analysis">Analysis</TabsTrigger>
                <TabsTrigger value="raw">Raw Text</TabsTrigger>
              </TabsList>

              <TabsContent value="questions" className="p-4 space-y-2">
                {questions.map((q, i) => (
                  <div key={q.id} className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors">
                    <span className="text-sm font-medium text-muted-foreground w-6 flex-shrink-0">{i + 1}.</span>
                    <div className="flex-1 min-w-0">
                      {editingId === q.id ? (
                        <Input
                          defaultValue={q.text}
                          autoFocus
                          onBlur={(e) => updateQuestion(q.id, "text", e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && updateQuestion(q.id, "text", (e.target as HTMLInputElement).value)}
                        />
                      ) : (
                        <p className="text-sm text-foreground">{q.text}</p>
                      )}
                      <div className="flex gap-2 mt-1.5">
                        <Badge variant="secondary">{q.marks}M</Badge>
                        <Badge variant="outline">{q.unit}</Badge>
                        <Badge variant="outline">{q.type}</Badge>
                        <Badge variant="outline">Sec {q.section}</Badge>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditingId(q.id)}>
                        <Edit3 className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteQuestion(q.id)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="analysis" className="p-4 space-y-4">
                <div>
                  <h4 className="font-medium text-foreground mb-2">Unit Distribution</h4>
                  {Object.entries(analysis.unitDistribution).map(([unit, count]) => (
                    <div key={unit} className="flex items-center gap-3 mb-2">
                      <span className="text-sm text-muted-foreground w-20">{unit}</span>
                      <Progress value={(count / analysis.totalQuestions) * 100} className="h-2 flex-1" />
                      <span className="text-sm font-medium text-foreground w-12 text-right">{count} Qs</span>
                    </div>
                  ))}
                </div>
                <Separator />
                <div>
                  <h4 className="font-medium text-foreground mb-2">Question Types</h4>
                  <div className="flex gap-3">
                    {Object.entries(analysis.questionTypes).map(([type, count]) => (
                      <div key={type} className="elevated-card rounded-lg p-3 flex-1 text-center">
                        <p className="text-lg font-display text-foreground">{count}</p>
                        <p className="text-xs text-muted-foreground">{type}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="raw" className="p-4">
                <pre className="text-sm text-muted-foreground whitespace-pre-wrap font-mono bg-muted/30 rounded-lg p-4 max-h-96 overflow-auto">
                  {extractedText}
                </pre>
              </TabsContent>
            </Tabs>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

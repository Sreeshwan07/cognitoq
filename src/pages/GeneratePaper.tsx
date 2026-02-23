import { useState } from "react";
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

const generatedQuestions = [
  { id: 1, text: "Define Newton's First Law and give two real-life examples.", marks: 5, type: "Long", difficulty: "Medium", unit: "Unit 1" },
  { id: 2, text: "What is the SI unit of force?", marks: 1, type: "MCQ", difficulty: "Easy", unit: "Unit 1" },
  { id: 3, text: "Derive the equation v² = u² + 2as.", marks: 8, type: "Long", difficulty: "Hard", unit: "Unit 2" },
  { id: 4, text: "A car accelerates from 0 to 60 km/h in 5 seconds. Find the acceleration.", marks: 4, type: "Short", difficulty: "Medium", unit: "Unit 2" },
  { id: 5, text: "State Hooke's Law.", marks: 2, type: "Short", difficulty: "Easy", unit: "Unit 3" },
  { id: 6, text: "Explain the working principle of a hydraulic press.", marks: 5, type: "Long", difficulty: "Medium", unit: "Unit 4" },
];

export default function GeneratePaper() {
  const [totalMarks, setTotalMarks] = useState("100");
  const [subject, setSubject] = useState("Physics");
  const [sets, setSets] = useState("1");
  const [easyRatio, setEasyRatio] = useState([30]);
  const [mediumRatio, setMediumRatio] = useState([40]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setGenerated(true);
    }, 1500);
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-display text-foreground">Generate Paper</h1>
        <p className="text-muted-foreground mt-1">Configure and generate question papers in seconds.</p>
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
              <Label>Subject</Label>
              <Select value={subject} onValueChange={setSubject}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Physics">Physics</SelectItem>
                  <SelectItem value="Chemistry">Chemistry</SelectItem>
                  <SelectItem value="Mathematics">Mathematics</SelectItem>
                  <SelectItem value="Biology">Biology</SelectItem>
                </SelectContent>
              </Select>
            </div>

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
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Easy</span><span>{easyRatio[0]}%</span>
                </div>
                <Slider value={easyRatio} onValueChange={setEasyRatio} max={100} step={5} />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Medium</span><span>{mediumRatio[0]}%</span>
                </div>
                <Slider value={mediumRatio} onValueChange={setMediumRatio} max={100} step={5} />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Hard</span><span>{100 - easyRatio[0] - mediumRatio[0]}%</span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full">
                  <div
                    className="h-full bg-destructive/60 rounded-full transition-all"
                    style={{ width: `${100 - easyRatio[0] - mediumRatio[0]}%` }}
                  />
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
              disabled={isGenerating}
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
                  Configure your paper settings and click generate. Your paper will be ready in under 3 seconds.
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
                    <h3 className="font-display text-lg text-foreground">
                      {subject} Paper — Set A
                    </h3>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Shuffle className="w-3.5 h-3.5 mr-1" /> Shuffle
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="w-3.5 h-3.5 mr-1" /> Export PDF
                    </Button>
                  </div>
                </div>

                <div className="p-5 space-y-3">
                  {generatedQuestions.map((q, i) => (
                    <motion.div
                      key={q.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <span className="text-sm font-mono text-muted-foreground w-6 text-right flex-shrink-0">
                        {i + 1}.
                      </span>
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

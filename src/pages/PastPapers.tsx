import { FileText, Download, Copy, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

const papers = [
  { id: 1, name: "Physics Mid-Term Set A", subject: "Physics", date: "Feb 20, 2026", marks: 100, questions: 25, sets: 3 },
  { id: 2, name: "Chemistry Final Exam", subject: "Chemistry", date: "Feb 18, 2026", marks: 75, questions: 30, sets: 2 },
  { id: 3, name: "Mathematics Unit Test 3", subject: "Mathematics", date: "Feb 15, 2026", marks: 50, questions: 15, sets: 1 },
  { id: 4, name: "Biology Practice Paper", subject: "Biology", date: "Feb 12, 2026", marks: 100, questions: 40, sets: 2 },
  { id: 5, name: "Physics Practical Exam", subject: "Physics", date: "Feb 10, 2026", marks: 30, questions: 10, sets: 1 },
  { id: 6, name: "Chemistry Quiz - Organic", subject: "Chemistry", date: "Feb 8, 2026", marks: 25, questions: 20, sets: 1 },
];

export default function PastPapers() {
  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-display text-foreground">Past Papers</h1>
        <p className="text-muted-foreground mt-1">View and download previously generated question papers.</p>
      </motion.div>

      <div className="grid gap-3">
        {papers.map((paper, i) => (
          <motion.div
            key={paper.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="elevated-card rounded-xl p-5 flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-primary/5 flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-foreground">{paper.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="text-xs">{paper.subject}</Badge>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> {paper.date}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex gap-4 text-xs text-muted-foreground">
                <span>{paper.questions} Qs</span>
                <span>{paper.marks} marks</span>
                <span>{paper.sets} set{paper.sets > 1 ? "s" : ""}</span>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                  <Copy className="w-3.5 h-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                  <Download className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

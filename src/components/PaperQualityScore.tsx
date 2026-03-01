import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Sparkles, Info, RefreshCw } from "lucide-react";
import type { QualityScoreResult, ScoreBreakdown } from "@/lib/qualityScore";

interface PaperQualityScoreProps {
  result: QualityScoreResult;
  onImprove?: () => void;
  improving?: boolean;
}

function AnimatedNumber({ value, duration = 1200 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<number>();

  useEffect(() => {
    const start = display;
    const diff = value - start;
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setDisplay(Math.round(start + diff * eased));
      if (progress < 1) ref.current = requestAnimationFrame(animate);
    };

    ref.current = requestAnimationFrame(animate);
    return () => { if (ref.current) cancelAnimationFrame(ref.current); };
  }, [value, duration]);

  return <>{display}</>;
}

function CircularProgress({ value, size = 120, strokeWidth = 8 }: { value: number; size?: number; strokeWidth?: number }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  const color = value >= 85 ? "hsl(var(--success))" : value >= 70 ? "hsl(var(--warning))" : value >= 50 ? "hsl(30, 90%, 50%)" : "hsl(var(--destructive))";

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="rotate-[-90deg]">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-display font-bold text-foreground">
          <AnimatedNumber value={value} />
        </span>
        <span className="text-xs text-muted-foreground">/100</span>
      </div>
    </div>
  );
}

const criteriaLabels: Record<keyof ScoreBreakdown, { label: string; icon: string }> = {
  unitCoverage: { label: "Unit Coverage", icon: "📊" },
  difficultyBalance: { label: "Difficulty Balance", icon: "⚖️" },
  marksAccuracy: { label: "Marks Accuracy", icon: "🎯" },
  duplicateDetection: { label: "No Duplicates", icon: "🔍" },
  conceptDepth: { label: "Concept Depth", icon: "🧠" },
  syllabusRelevance: { label: "Syllabus Relevance", icon: "📚" },
};

export default function PaperQualityScore({ result, onImprove, improving }: PaperQualityScoreProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="elevated-card rounded-xl p-5 space-y-5"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-accent" />
          <h3 className="font-display text-lg text-foreground">Paper Quality Score</h3>
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <button className="text-muted-foreground hover:text-foreground transition-colors">
              <Info className="w-4 h-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="left" className="max-w-xs text-xs leading-relaxed">
            <p className="font-semibold mb-1">How is this scored?</p>
            <p>Unit Coverage (25) — Even question distribution across units.</p>
            <p>Difficulty Balance (20) — Mix of Easy/Medium/Hard.</p>
            <p>Marks Accuracy (15) — Correct marks distribution.</p>
            <p>Duplicates (15) — No repeated questions.</p>
            <p>Concept Depth (15) — Variety of cognitive levels.</p>
            <p>Syllabus Relevance (10) — Questions match selected units.</p>
          </TooltipContent>
        </Tooltip>
      </div>

      {/* Score Circle + Grade */}
      <div className="flex items-center gap-6">
        <CircularProgress value={result.total} />
        <div className="space-y-2">
          <Badge
            variant="outline"
            className={cn("text-sm font-semibold px-3 py-1", result.gradeColor)}
          >
            {result.gradeLabel}
          </Badge>
          <p className="text-xs text-muted-foreground">
            {result.grade === "excellent"
              ? "This paper meets academic quality standards."
              : result.grade === "good"
              ? "Good quality — minor improvements possible."
              : result.grade === "moderate"
              ? "Some areas need attention for better quality."
              : "Significant improvements recommended."}
          </p>
        </div>
      </div>

      {/* Breakdown */}
      <div className="space-y-2">
        {(Object.keys(result.breakdown) as (keyof ScoreBreakdown)[]).map((key, i) => {
          const item = result.breakdown[key];
          const meta = criteriaLabels[key];
          const pct = (item.score / item.max) * 100;

          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + i * 0.08 }}
              className="flex items-center gap-3"
            >
              <span className="text-sm w-5 flex-shrink-0">{meta.icon}</span>
              <span className="text-xs text-foreground w-[130px] flex-shrink-0 truncate">{meta.label}</span>
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className={cn(
                    "h-full rounded-full",
                    pct >= 80 ? "bg-success" : pct >= 60 ? "bg-warning" : "bg-destructive"
                  )}
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.8, delay: 0.5 + i * 0.08 }}
                />
              </div>
              <span className="text-xs font-mono text-muted-foreground w-12 text-right flex-shrink-0">
                {item.score}/{item.max}
              </span>
            </motion.div>
          );
        })}
      </div>

      {/* Improve Button */}
      {onImprove && result.total < 85 && (
        <Button
          onClick={onImprove}
          disabled={improving}
          className="w-full"
          size="sm"
        >
          {improving ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 mr-1 animate-spin" /> Improving...
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5 mr-1" /> Improve Paper Quality
            </>
          )}
        </Button>
      )}
    </motion.div>
  );
}

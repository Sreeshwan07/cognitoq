// Paper Quality Score Engine — Rule-Based, Mathematically Precise
// Total: 100 points across 6 criteria

export interface ScoreBreakdown {
  unitCoverage: { score: number; max: 25; detail: string };
  difficultyBalance: { score: number; max: 20; detail: string };
  marksAccuracy: { score: number; max: 15; detail: string };
  duplicateDetection: { score: number; max: 15; detail: string };
  conceptDepth: { score: number; max: 15; detail: string };
  syllabusRelevance: { score: number; max: 10; detail: string };
}

export interface QualityScoreResult {
  total: number;
  breakdown: ScoreBreakdown;
  grade: "excellent" | "good" | "moderate" | "poor";
  gradeLabel: string;
  gradeColor: string;
}

interface ScoredQuestion {
  text: string;
  marks: number;
  unit: string;
  difficulty: string;
  type?: string;
  bloom?: string;
}

export function calculateQualityScore(
  questions: ScoredQuestion[],
  selectedUnits: string[],
  expectedTotalMarks: number,
  expectedQ2: number,
  expectedQ5: number,
  expectedQ10: number,
): QualityScoreResult {
  if (questions.length === 0) return emptyResult();

  const unitCoverage = scoreUnitCoverage(questions, selectedUnits);
  const difficultyBalance = scoreDifficultyBalance(questions);
  const marksAccuracy = scoreMarksAccuracy(questions, expectedTotalMarks, expectedQ2, expectedQ5, expectedQ10);
  const duplicateDetection = scoreDuplicates(questions);
  const conceptDepth = scoreConceptDepth(questions);
  const syllabusRelevance = scoreSyllabusRelevance(questions, selectedUnits);

  const total = unitCoverage.score + difficultyBalance.score + marksAccuracy.score +
    duplicateDetection.score + conceptDepth.score + syllabusRelevance.score;

  // Clamp to 0-100
  const finalTotal = Math.max(0, Math.min(100, total));

  const grade = finalTotal >= 85 ? "excellent" : finalTotal >= 70 ? "good" : finalTotal >= 50 ? "moderate" : "poor";
  const gradeLabel = grade === "excellent" ? "🟢 Excellent" : grade === "good" ? "🟡 Good" : grade === "moderate" ? "🟠 Moderate" : "🔴 Weak";
  const gradeColor = grade === "excellent" ? "text-success" : grade === "good" ? "text-warning" : grade === "moderate" ? "text-orange-500" : "text-destructive";

  return { total: finalTotal, breakdown: { unitCoverage, difficultyBalance, marksAccuracy, duplicateDetection, conceptDepth, syllabusRelevance }, grade, gradeLabel, gradeColor };
}

// ═══════════════════════════════════════════
// 1. Unit Coverage (25 marks)
// Formula: (Units Covered ÷ Selected Units) × 25
// Penalty: If any unit > 40% of questions → −3, if > 50% → −5
// ═══════════════════════════════════════════
function scoreUnitCoverage(questions: ScoredQuestion[], selectedUnits: string[]): ScoreBreakdown["unitCoverage"] {
  if (selectedUnits.length === 0) return { score: 25, max: 25, detail: "No units specified" };

  const unitCounts: Record<string, number> = {};
  questions.forEach(q => { unitCounts[q.unit] = (unitCounts[q.unit] || 0) + 1; });

  const coveredUnits = selectedUnits.filter(u => (unitCounts[u] || 0) > 0);
  const coverageRatio = coveredUnits.length / selectedUnits.length;
  let score = Math.round(coverageRatio * 25);

  // Concentration penalties
  const total = questions.length;
  for (const unit of selectedUnits) {
    const pct = (unitCounts[unit] || 0) / total;
    if (pct > 0.5) {
      score -= 5;
    } else if (pct > 0.4) {
      score -= 3;
    }
  }

  const detail = `${coveredUnits.length}/${selectedUnits.length} units covered`;
  return { score: Math.max(0, Math.min(25, score)), max: 25, detail };
}

// ═══════════════════════════════════════════
// 2. Difficulty Balance (20 marks)
// Ideal: Easy 30%, Medium 50%, Hard 20%
// Deduct 1 mark for each 5% deviation
// ═══════════════════════════════════════════
function scoreDifficultyBalance(questions: ScoredQuestion[]): ScoreBreakdown["difficultyBalance"] {
  const counts: Record<string, number> = { Easy: 0, Medium: 0, Hard: 0 };
  questions.forEach(q => { counts[q.difficulty] = (counts[q.difficulty] || 0) + 1; });

  const total = questions.length;
  const easyPct = (counts.Easy / total) * 100;
  const medPct = (counts.Medium / total) * 100;
  const hardPct = (counts.Hard / total) * 100;

  // Ideal: Easy 30%, Medium 50%, Hard 20%
  const easyDev = Math.abs(easyPct - 30);
  const medDev = Math.abs(medPct - 50);
  const hardDev = Math.abs(hardPct - 20);

  // Deduct 1 mark per 5% deviation
  const deductions = Math.floor(easyDev / 5) + Math.floor(medDev / 5) + Math.floor(hardDev / 5);
  const score = Math.max(0, 20 - deductions);

  const detail = `E:${Math.round(easyPct)}% M:${Math.round(medPct)}% H:${Math.round(hardPct)}%`;
  return { score: Math.min(20, score), max: 20, detail };
}

// ═══════════════════════════════════════════
// 3. Marks Accuracy (15 marks)
// Perfect = 15, Small mismatch = −5, Wrong structure = 0
// ═══════════════════════════════════════════
function scoreMarksAccuracy(
  questions: ScoredQuestion[],
  expectedTotal: number,
  expectedQ2: number,
  expectedQ5: number,
  expectedQ10: number,
): ScoreBreakdown["marksAccuracy"] {
  const actualTotal = questions.reduce((s, q) => s + q.marks, 0);
  const actual2 = questions.filter(q => q.marks === 2).length;
  const actual5 = questions.filter(q => q.marks === 5).length;
  const actual10 = questions.filter(q => q.marks === 10).length;

  const totalMatch = actualTotal === expectedTotal;
  const patternMatch = actual2 === expectedQ2 && actual5 === expectedQ5 && actual10 === expectedQ10;

  let score: number;
  if (totalMatch && patternMatch) {
    score = 15; // Perfect
  } else if (totalMatch || patternMatch) {
    score = 10; // Small mismatch
  } else {
    // Check how far off
    const totalDiff = Math.abs(actualTotal - expectedTotal);
    const patternDiff = Math.abs(actual2 - expectedQ2) + Math.abs(actual5 - expectedQ5) + Math.abs(actual10 - expectedQ10);
    if (totalDiff <= 5 && patternDiff <= 2) {
      score = 10; // Small mismatch
    } else {
      score = 0; // Wrong structure
    }
  }

  const detail = totalMatch && patternMatch
    ? "Marks match perfectly"
    : `${actualTotal}/${expectedTotal} marks, pattern: ${actual2}×2 + ${actual5}×5 + ${actual10}×10`;
  return { score, max: 15, detail };
}

// ═══════════════════════════════════════════
// 4. Duplicate Detection (15 marks)
// No duplicates = 15, 1 duplicate = 10, 2+ = 5
// Also checks concept duplicates (>80% word overlap)
// ═══════════════════════════════════════════
function scoreDuplicates(questions: ScoredQuestion[]): ScoreBreakdown["duplicateDetection"] {
  const texts = questions.map(q => q.text.toLowerCase().trim());
  const seen = new Set<string>();
  let exactDuplicates = 0;

  texts.forEach(t => {
    if (seen.has(t)) exactDuplicates++;
    else seen.add(t);
  });

  // Concept duplicates: check word overlap > 80%
  let conceptDuplicates = 0;
  for (let i = 0; i < texts.length; i++) {
    const wordsA = new Set(texts[i].split(/\s+/).filter(w => w.length > 3));
    for (let j = i + 1; j < texts.length; j++) {
      if (texts[i] === texts[j]) continue; // already counted
      const wordsB = new Set(texts[j].split(/\s+/).filter(w => w.length > 3));
      if (wordsA.size === 0 || wordsB.size === 0) continue;
      const overlap = [...wordsA].filter(w => wordsB.has(w)).length;
      const overlapPct = overlap / Math.min(wordsA.size, wordsB.size);
      if (overlapPct > 0.8) conceptDuplicates++;
    }
  }

  const totalDupes = exactDuplicates + conceptDuplicates;
  const score = totalDupes === 0 ? 15 : totalDupes === 1 ? 10 : 5;
  const detail = totalDupes === 0
    ? "No duplicates detected"
    : `${exactDuplicates} exact + ${conceptDuplicates} concept duplicate(s)`;
  return { score, max: 15, detail };
}

// ═══════════════════════════════════════════
// 5. Concept Coverage Depth (15 marks)
// Check: Theory, Application, Analytical present
// Each present = +5
// ═══════════════════════════════════════════
function scoreConceptDepth(questions: ScoredQuestion[]): ScoreBreakdown["conceptDepth"] {
  // Map bloom levels and types to the three categories
  const hasTheory = questions.some(q => {
    const b = (q.bloom || "").toLowerCase();
    const t = (q.type || "").toLowerCase();
    return b === "remember" || b === "understand" || t === "short" || t === "mcq";
  });

  const hasApplication = questions.some(q => {
    const b = (q.bloom || "").toLowerCase();
    const t = (q.type || "").toLowerCase();
    return b === "apply" || b === "create" || t === "numerical" || t === "diagram";
  });

  const hasAnalytical = questions.some(q => {
    const b = (q.bloom || "").toLowerCase();
    const t = (q.type || "").toLowerCase();
    return b === "analyze" || b === "evaluate" || t === "long";
  });

  let score = 0;
  const parts: string[] = [];

  if (hasTheory) { score += 5; parts.push("Theory ✓"); }
  else parts.push("Theory ✗");

  if (hasApplication) { score += 5; parts.push("Application ✓"); }
  else parts.push("Application ✗");

  if (hasAnalytical) { score += 5; parts.push("Analytical ✓"); }
  else parts.push("Analytical ✗");

  return { score, max: 15, detail: parts.join(", ") };
}

// ═══════════════════════════════════════════
// 6. Syllabus Relevance (10 marks)
// Perfect = 10, 1 irrelevant = −3, >2 irrelevant = 0
// ═══════════════════════════════════════════
function scoreSyllabusRelevance(questions: ScoredQuestion[], selectedUnits: string[]): ScoreBreakdown["syllabusRelevance"] {
  if (selectedUnits.length === 0) return { score: 10, max: 10, detail: "All relevant" };

  const irrelevant = questions.filter(q => !selectedUnits.includes(q.unit)).length;

  let score: number;
  if (irrelevant === 0) {
    score = 10;
  } else if (irrelevant === 1) {
    score = 7; // −3
  } else {
    score = 0; // >2 irrelevant
  }

  const detail = irrelevant === 0
    ? "All questions match syllabus"
    : `${irrelevant} off-syllabus question(s)`;
  return { score, max: 10, detail };
}

function emptyResult(): QualityScoreResult {
  return {
    total: 0,
    breakdown: {
      unitCoverage: { score: 0, max: 25, detail: "No questions" },
      difficultyBalance: { score: 0, max: 20, detail: "No questions" },
      marksAccuracy: { score: 0, max: 15, detail: "No questions" },
      duplicateDetection: { score: 0, max: 15, detail: "No questions" },
      conceptDepth: { score: 0, max: 15, detail: "No questions" },
      syllabusRelevance: { score: 0, max: 10, detail: "No questions" },
    },
    grade: "poor",
    gradeLabel: "🔴 No Data",
    gradeColor: "text-destructive",
  };
}

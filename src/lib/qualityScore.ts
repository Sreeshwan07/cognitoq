// Paper Quality Score Engine
// Evaluates generated papers on 6 criteria for a score out of 100

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
  const total = questions.length;
  if (total === 0) {
    return emptyResult();
  }

  // 1. Unit Coverage (25)
  const unitCoverage = scoreUnitCoverage(questions, selectedUnits);

  // 2. Difficulty Balance (20)
  const difficultyBalance = scoreDifficultyBalance(questions);

  // 3. Marks Distribution Accuracy (15)
  const marksAccuracy = scoreMarksAccuracy(questions, expectedTotalMarks, expectedQ2, expectedQ5, expectedQ10);

  // 4. Duplicate Detection (15)
  const duplicateDetection = scoreDuplicates(questions);

  // 5. Concept Coverage Depth (15)
  const conceptDepth = scoreConceptDepth(questions);

  // 6. Syllabus Relevance (10)
  const syllabusRelevance = scoreSyllabusRelevance(questions, selectedUnits);

  const totalScore =
    unitCoverage.score +
    difficultyBalance.score +
    marksAccuracy.score +
    duplicateDetection.score +
    conceptDepth.score +
    syllabusRelevance.score;

  const grade = totalScore >= 85 ? "excellent" : totalScore >= 70 ? "good" : totalScore >= 50 ? "moderate" : "poor";
  const gradeLabel = grade === "excellent" ? "🟢 Excellent" : grade === "good" ? "🟡 Good" : grade === "moderate" ? "🟠 Moderate" : "🔴 Needs Improvement";
  const gradeColor = grade === "excellent" ? "text-success" : grade === "good" ? "text-warning" : grade === "moderate" ? "text-orange-500" : "text-destructive";

  return {
    total: totalScore,
    breakdown: { unitCoverage, difficultyBalance, marksAccuracy, duplicateDetection, conceptDepth, syllabusRelevance },
    grade,
    gradeLabel,
    gradeColor,
  };
}

function scoreUnitCoverage(questions: ScoredQuestion[], selectedUnits: string[]): ScoreBreakdown["unitCoverage"] {
  if (selectedUnits.length === 0) return { score: 25, max: 25, detail: "No units specified" };

  const unitCounts: Record<string, number> = {};
  questions.forEach((q) => {
    unitCounts[q.unit] = (unitCounts[q.unit] || 0) + 1;
  });

  const coveredUnits = selectedUnits.filter((u) => (unitCounts[u] || 0) > 0);
  const coverageRatio = coveredUnits.length / selectedUnits.length;

  // Check distribution evenness
  const counts = selectedUnits.map((u) => unitCounts[u] || 0);
  const avg = counts.reduce((a, b) => a + b, 0) / counts.length;
  const variance = counts.reduce((s, c) => s + Math.pow(c - avg, 2), 0) / counts.length;
  const evenness = avg > 0 ? Math.max(0, 1 - Math.sqrt(variance) / avg) : 0;

  const score = Math.round(coverageRatio * 15 + evenness * 10);
  const detail = `${coveredUnits.length}/${selectedUnits.length} units covered`;
  return { score: Math.min(score, 25), max: 25, detail };
}

function scoreDifficultyBalance(questions: ScoredQuestion[]): ScoreBreakdown["difficultyBalance"] {
  const counts: Record<string, number> = { Easy: 0, Medium: 0, Hard: 0 };
  questions.forEach((q) => {
    counts[q.difficulty] = (counts[q.difficulty] || 0) + 1;
  });

  const total = questions.length;
  const easyPct = counts.Easy / total;
  const medPct = counts.Medium / total;
  const hardPct = counts.Hard / total;

  // Ideal: ~30% easy, ~40% medium, ~30% hard
  const easyDev = Math.abs(easyPct - 0.3);
  const medDev = Math.abs(medPct - 0.4);
  const hardDev = Math.abs(hardPct - 0.3);
  const avgDev = (easyDev + medDev + hardDev) / 3;

  const score = Math.round(20 * Math.max(0, 1 - avgDev * 3));
  const detail = `E:${Math.round(easyPct * 100)}% M:${Math.round(medPct * 100)}% H:${Math.round(hardPct * 100)}%`;
  return { score: Math.min(score, 20), max: 20, detail };
}

function scoreMarksAccuracy(
  questions: ScoredQuestion[],
  expectedTotal: number,
  expectedQ2: number,
  expectedQ5: number,
  expectedQ10: number,
): ScoreBreakdown["marksAccuracy"] {
  const actualTotal = questions.reduce((s, q) => s + q.marks, 0);
  const actual2 = questions.filter((q) => q.marks === 2).length;
  const actual5 = questions.filter((q) => q.marks === 5).length;
  const actual10 = questions.filter((q) => q.marks === 10).length;

  let score = 15;
  if (actualTotal !== expectedTotal) score -= 5;
  if (actual2 !== expectedQ2) score -= 3;
  if (actual5 !== expectedQ5) score -= 3;
  if (actual10 !== expectedQ10) score -= 3;

  const detail = actualTotal === expectedTotal ? "Marks match perfectly" : `${actualTotal}/${expectedTotal} marks`;
  return { score: Math.max(0, score), max: 15, detail };
}

function scoreDuplicates(questions: ScoredQuestion[]): ScoreBreakdown["duplicateDetection"] {
  const seen = new Set<string>();
  let duplicates = 0;
  questions.forEach((q) => {
    const key = q.text.toLowerCase().trim();
    if (seen.has(key)) duplicates++;
    else seen.add(key);
  });

  const score = duplicates === 0 ? 15 : Math.max(0, 15 - duplicates * 5);
  const detail = duplicates === 0 ? "No duplicates detected" : `${duplicates} duplicate(s) found`;
  return { score, max: 15, detail };
}

function scoreConceptDepth(questions: ScoredQuestion[]): ScoreBreakdown["conceptDepth"] {
  // Check for variety of question types based on bloom levels and types
  const blooms = new Set<string>();
  const types = new Set<string>();
  questions.forEach((q) => {
    if (q.bloom) blooms.add(q.bloom);
    if (q.type) types.add(q.type);
  });

  // Ideal: at least 3 bloom levels and 2 types
  const bloomScore = Math.min(blooms.size / 3, 1) * 8;
  const typeScore = Math.min(types.size / 2, 1) * 7;

  const score = Math.round(bloomScore + typeScore);
  const detail = `${blooms.size} cognitive levels, ${types.size} question types`;
  return { score: Math.min(score, 15), max: 15, detail };
}

function scoreSyllabusRelevance(questions: ScoredQuestion[], selectedUnits: string[]): ScoreBreakdown["syllabusRelevance"] {
  if (selectedUnits.length === 0) return { score: 10, max: 10, detail: "All relevant" };

  const irrelevant = questions.filter((q) => !selectedUnits.includes(q.unit)).length;
  const ratio = 1 - irrelevant / questions.length;
  const score = Math.round(ratio * 10);
  const detail = irrelevant === 0 ? "All questions match syllabus" : `${irrelevant} off-syllabus question(s)`;
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

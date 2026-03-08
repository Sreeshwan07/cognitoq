import { supabase } from "@/integrations/supabase/client";
import { subjects } from "@/data/subjects";

interface QuestionToSave {
  text: string;
  marks: number;
  unit: string;
  difficulty: string;
  type?: string;
  bloom?: string;
  subject: string;
  subject_code?: string;
  source: string;
}

/**
 * Normalize a subject name/id to the canonical subject name from our subjects list.
 * Falls back to the input if no match is found.
 */
export function normalizeSubject(input: string): { name: string; code: string } {
  const lower = input.toLowerCase().trim();
  
  // Try exact id match
  const byId = subjects.find(s => s.id === lower);
  if (byId) return { name: byId.name, code: byId.code };
  
  // Try exact name match (case-insensitive)
  const byName = subjects.find(s => s.name.toLowerCase() === lower);
  if (byName) return { name: byName.name, code: byName.code };
  
  // Try code match
  const byCode = subjects.find(s => s.code.toLowerCase() === lower);
  if (byCode) return { name: byCode.name, code: byCode.code };
  
  // Try partial match
  const byPartial = subjects.find(s => 
    lower.includes(s.name.toLowerCase()) || s.name.toLowerCase().includes(lower) ||
    lower.includes(s.code.toLowerCase()) || s.code.toLowerCase().includes(lower)
  );
  if (byPartial) return { name: byPartial.name, code: byPartial.code };
  
  // Common abbreviation mappings
  const abbreviations: Record<string, string> = {
    dbms: "Database Management Systems",
    dsa: "Data Structures & Algorithms",
    os: "Operating Systems",
    cn: "Computer Networks",
    oops: "Object Oriented Programming",
    oop: "Object Oriented Programming",
    se: "Software Engineering",
    ai: "Artificial Intelligence",
    ml: "Machine Learning",
    cd: "Compiler Design",
    toc: "Theory of Computation",
    coa: "Computer Organization & Architecture",
  };
  
  const abbr = abbreviations[lower];
  if (abbr) {
    const found = subjects.find(s => s.name.toLowerCase() === abbr.toLowerCase());
    if (found) return { name: found.name, code: found.code };
    return { name: abbr, code: lower.toUpperCase() };
  }
  
  return { name: input.trim(), code: "" };
}

/**
 * Save an array of questions to the questions table.
 * Deduplicates by text before inserting.
 */
export async function saveQuestionsToBank(
  questions: QuestionToSave[],
  userId: string
): Promise<{ saved: number; duplicates: number }> {
  if (questions.length === 0) return { saved: 0, duplicates: 0 };

  // Normalize all subjects
  const normalized = questions.map(q => {
    const { name, code } = normalizeSubject(q.subject);
    return { ...q, subject: name, subject_code: code || q.subject_code || null };
  });

  // Get existing question texts for this user + subject to avoid duplicates
  const subjectNames = [...new Set(normalized.map(q => q.subject))];
  const existingTexts = new Set<string>();

  for (const subj of subjectNames) {
    const { data } = await supabase
      .from("questions")
      .select("text")
      .eq("user_id", userId)
      .ilike("subject", subj);
    if (data) {
      data.forEach(row => existingTexts.add(row.text.toLowerCase().trim()));
    }
  }

  // Filter out duplicates
  const toInsert = normalized.filter(q => !existingTexts.has(q.text.toLowerCase().trim()));
  const duplicates = normalized.length - toInsert.length;

  if (toInsert.length === 0) return { saved: 0, duplicates };

  // Batch insert
  const rows = toInsert.map(q => ({
    user_id: userId,
    text: q.text,
    subject: q.subject,
    subject_code: q.subject_code || null,
    unit: q.unit || "General",
    difficulty: q.difficulty || "Medium",
    marks: q.marks || 2,
    type: q.type || "Short",
    bloom: q.bloom || "Remember",
    source: q.source || "manual",
  }));

  const { error } = await supabase.from("questions").insert(rows);
  if (error) {
    console.error("Failed to save questions:", error);
    return { saved: 0, duplicates };
  }

  return { saved: toInsert.length, duplicates };
}

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ─── Text Cleaning ───
function cleanText(rawText: string): string {
  let text = (rawText || "").toString();
  text = text.replace(/%%?EOF/g, " ")
    .replace(/\d+\s+\d+\s+obj/g, " ")
    .replace(/endobj/g, " ")
    .replace(/stream|endstream/g, " ")
    .replace(/FlateDecode|ASCIIHexDecode|LZWDecode/g, " ")
    .replace(/\/(?:Length|Registry|Ordering|Supplement|Filter|Type|Page|Font)\b[^\n]*/g, " ")
    .replace(/<<[^>]*>>/g, " ")
    .replace(/[^\x20-\x7E\n\r\t]/g, " ")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  return text;
}

// ─── Build System Prompt ───
function buildSystemPrompt(difficulty: string, strictMode: boolean, knowledgeContext: string, previousQuestions: string[]): string {
  const strictNote = strictMode
    ? "CRITICAL: Generate questions ONLY from the provided content and the internal knowledge base. Do NOT use any external knowledge beyond what is provided."
    : "Generate questions primarily from the provided content, supplemented by the internal knowledge base.";

  const previousQuestionsBlock = previousQuestions.length > 0
    ? `\n\nPREVIOUSLY USED QUESTIONS (DO NOT REPEAT ANY OF THESE — generate completely new questions covering different concepts/angles):\n${previousQuestions.map((q, i) => `${i + 1}. ${q}`).join("\n")}\n\nYou MUST generate entirely different questions. Change both the wording AND the concept/angle being tested. Simply rephrasing is NOT acceptable.`
    : "";

  return `You are a university-level academic question paper setter.

${strictNote}

CRITICAL PRE-PROCESSING RULES:
- If you see ANY PDF structural terms (obj, endobj, stream, FlateDecode, xref), COMPLETELY IGNORE them.
- Focus ONLY on readable academic sentences, headings, definitions, and concepts.

SUBJECT DETECTION (STRICT):
- Detect subject ONLY from academic text content.
- Use keyword matching: normalization/SQL/DBMS → DBMS; scheduling/deadlock/process → Operating Systems; routing/TCP/IP → Computer Networks; etc.
- If subject cannot be determined, set detectedSubject to "Unknown" and add warning.

${knowledgeContext ? `INTERNAL KNOWLEDGE BASE (use to supplement uploaded notes, but PRIORITIZE uploaded content):\n${knowledgeContext}\n` : ""}
${previousQuestionsBlock}

QUESTION GENERATION PIPELINE:

STEP 1 — INTERNAL ANALYSIS (do not expose):
- Identify: subject, major topics, subtopics, key definitions, important concepts, high-weightage areas
- Group into logical units
- If content insufficient → add warning

STEP 2 — BLUEPRINT:
- Cover ALL major topics — no overloading any single topic
- Mix: concept-based short questions + analytical long questions + application-based
- Ensure balanced unit distribution

STEP 3 — GENERATE with these rules:
- Every question MUST be directly derivable from the content or internal knowledge base
- NO duplicates or near-duplicates (including with previously used questions)
- Specify for each: text, marks, unit, difficulty, type, Bloom's level
- OR questions: SAME unit, SAME marks, DIFFERENT concepts
- Difficulty: ${difficulty === "mixed" ? "balanced mix of Easy, Medium, Hard" : difficulty}
- Short (1-3 marks): definitions, basic concepts
- Medium (5 marks): understanding, explanations with examples
- Long (10+ marks): application, analysis, case studies

STEP 4 — VALIDATE before returning:
- ✔ Every question traceable to content or knowledge base
- ✔ No overlap with previously used questions
- ✔ No repetition within this paper
- ✔ Subject consistent throughout
- ✔ Balanced unit distribution (no unit should have >40% of questions)
- ✔ Proper academic wording
- If validation fails → regenerate that question

If content is unclear or insufficient, report as warning. DO NOT GUESS.`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { text: rawText, sections, difficulty, strictMode, subjectHint, knowledgeContext, previousQuestions } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const text = cleanText(rawText);

    if (!text || text.trim().length < 50) {
      return new Response(JSON.stringify({ error: "Uploaded content is too short or contains no readable academic text." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const sectionsDesc = (sections || []).map((s: any) => {
      const orNote = s.enableOr ? " (generate OR alternatives for each question — two questions per slot from the same topic)" : "";
      return `${s.name}: ${s.totalQuestions} questions × ${s.marks} marks each. Students answer ${s.questionsToAnswer} out of ${s.totalQuestions}.${orNote}`;
    }).join("\n");

    const systemPrompt = buildSystemPrompt(
      difficulty || "mixed",
      strictMode !== false,
      knowledgeContext || "",
      previousQuestions || []
    );

    const userPrompt = `Analyze the following academic content and generate exam questions.

${subjectHint ? `Subject hint: ${subjectHint}` : "Detect the subject automatically."}

CONTENT:
"""
${text.substring(0, 15000)}
"""

PAPER STRUCTURE:
${sectionsDesc || "Generate 10 short (2 marks), 5 medium (5 marks), and 2 long (10 marks) questions."}

Respond using the suggest_questions tool with the detected subject, detected units, and all generated questions.`;

    const toolSchema = {
      type: "function",
      function: {
        name: "suggest_questions",
        description: "Return the detected subject, units, and generated exam questions",
        parameters: {
          type: "object",
          properties: {
            detectedSubject: { type: "string", description: "The detected academic subject" },
            detectedUnits: {
              type: "array",
              items: { type: "string" },
              description: "List of detected units/topics"
            },
            questions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  text: { type: "string" },
                  marks: { type: "number" },
                  unit: { type: "string" },
                  difficulty: { type: "string", enum: ["Easy", "Medium", "Hard"] },
                  type: { type: "string", enum: ["Theory", "Numerical", "Application", "Case Study"] },
                  bloom: { type: "string", enum: ["Remember", "Understand", "Apply", "Analyze", "Evaluate", "Create"] },
                  section: { type: "string" },
                  orAlternativeText: { type: "string" },
                  orAlternativeType: { type: "string", enum: ["Theory", "Numerical", "Application", "Case Study"] },
                  orAlternativeBloom: { type: "string", enum: ["Remember", "Understand", "Apply", "Analyze", "Evaluate", "Create"] },
                },
                required: ["text", "marks", "unit", "difficulty", "type", "bloom", "section"],
                additionalProperties: false
              }
            },
            contentSummary: { type: "string" },
            warnings: {
              type: "array",
              items: { type: "string" },
            }
          },
          required: ["detectedSubject", "detectedUnits", "questions", "contentSummary"],
          additionalProperties: false
        }
      }
    };

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [toolSchema],
        tool_choice: { type: "function", function: { name: "suggest_questions" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits in your workspace settings." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      return new Response(JSON.stringify({ error: "AI processing failed. Please try again." }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall?.function?.arguments) {
      return new Response(JSON.stringify({ error: "AI did not return structured output. Please try again." }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const result = JSON.parse(toolCall.function.arguments);

    // ─── Server-side validation ───
    const warnings = result.warnings || [];
    const questions = result.questions || [];

    // Check unit balance
    const unitCounts: Record<string, number> = {};
    for (const q of questions) {
      unitCounts[q.unit] = (unitCounts[q.unit] || 0) + 1;
    }
    const maxUnitRatio = Math.max(...Object.values(unitCounts)) / questions.length;
    if (maxUnitRatio > 0.5 && Object.keys(unitCounts).length > 1) {
      warnings.push("Unit distribution is unbalanced — one unit dominates over 50% of questions.");
    }

    // Check for duplicate questions
    const seen = new Set<string>();
    for (const q of questions) {
      const normalized = q.text.toLowerCase().replace(/[^a-z0-9]/g, "").substring(0, 80);
      if (seen.has(normalized)) {
        warnings.push("Potential duplicate question detected in generated paper.");
        break;
      }
      seen.add(normalized);
    }

    result.warnings = warnings;

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-from-notes error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

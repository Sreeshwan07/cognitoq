import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { text: rawText, sections, difficulty, strictMode, subjectHint } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // === SERVER-SIDE TEXT CLEANING (defense in depth) ===
    let text = (rawText || "").toString();
    // Remove any remaining PDF structural artifacts
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

    if (!text || text.trim().length < 50) {
      return new Response(JSON.stringify({ error: "Uploaded content is too short or contains no readable academic text." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Build sections description for the prompt
    const sectionsDesc = (sections || []).map((s: any) => {
      const orNote = s.enableOr ? " (generate OR alternatives for each question - two questions per slot from the same topic)" : "";
      return `${s.name}: ${s.totalQuestions} questions × ${s.marks} marks each. Students answer ${s.questionsToAnswer} out of ${s.totalQuestions}.${orNote}`;
    }).join("\n");

    const strictNote = strictMode
      ? "CRITICAL: Generate questions ONLY from the provided content. Do NOT use any external knowledge. Every question must be directly answerable from the uploaded notes."
      : "Generate questions primarily from the provided content, but you may use general academic knowledge to improve question quality.";

    const systemPrompt = `You are a university-level academic question paper setter.

${strictNote}

CRITICAL PRE-PROCESSING RULES:
- The content has been pre-cleaned, but if you see ANY remaining PDF structural terms (obj, endobj, stream, FlateDecode, xref, etc.), COMPLETELY IGNORE them.
- Focus ONLY on readable academic sentences, headings, definitions, and concepts.
- Do NOT treat PDF metadata, encoding strings, or technical markup as academic content.

SUBJECT DETECTION (STRICT):
- Detect subject ONLY from academic text content (sentences, definitions, concepts).
- Use keyword matching: normalization/SQL/DBMS keywords → DBMS; scheduling/deadlock/process → Operating Systems; routing/TCP/IP → Computer Networks; etc.
- If the subject cannot be clearly determined from the content, set detectedSubject to "Unknown" and add warning: "Subject unclear from uploaded notes."
- Do NOT guess or mix subjects.

QUESTION GENERATION PIPELINE:

STEP 1 — INTERNAL ANALYSIS (do not expose):
- Identify: subject, major topics, subtopics, key definitions, important concepts, high-weightage areas
- Group into logical units
- If content insufficient → add warning

STEP 2 — BLUEPRINT:
- Cover ALL major topics — no overloading any single topic
- Mix: concept-based short questions + analytical long questions + application-based

STEP 3 — GENERATE with these rules:
- Every question MUST be directly derivable from the readable academic content
- No duplicates or near-duplicates
- Specify for each: text, marks, unit, difficulty (Easy/Medium/Hard), type (Theory/Numerical/Application/Case Study), Bloom's level
- OR questions: SAME unit, SAME marks, DIFFERENT concepts within that unit
- Difficulty: ${difficulty === "mixed" ? "balanced mix of Easy, Medium, Hard" : difficulty}
- Short (1-3 marks): definitions, basic concepts
- Medium (5 marks): understanding, explanations with examples  
- Long (10+ marks): application, analysis, case studies

STEP 4 — VALIDATE before returning:
- ✔ Every question traceable to uploaded content
- ✔ No unrelated/out-of-syllabus topics
- ✔ No repetition
- ✔ Subject consistent throughout
- ✔ Proper academic wording
- If validation fails → regenerate that question

If content is unclear or insufficient, report as warning. DO NOT GUESS.`;

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
              description: "List of detected units/topics from the content"
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
                  section: { type: "string", description: "Which section this belongs to, e.g. PART – A" },
                  orAlternativeText: { type: "string", description: "OR alternative question text if OR is enabled for this section" },
                  orAlternativeType: { type: "string", enum: ["Theory", "Numerical", "Application", "Case Study"] },
                  orAlternativeBloom: { type: "string", enum: ["Remember", "Understand", "Apply", "Analyze", "Evaluate", "Create"] },
                },
                required: ["text", "marks", "unit", "difficulty", "type", "bloom", "section"],
                additionalProperties: false
              }
            },
            contentSummary: { type: "string", description: "Brief summary of the content analyzed" },
            warnings: {
              type: "array",
              items: { type: "string" },
              description: "Any warnings about content coverage or quality"
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
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits in your workspace settings." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      return new Response(JSON.stringify({ error: "AI processing failed. Please try again." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    
    if (!toolCall?.function?.arguments) {
      return new Response(JSON.stringify({ error: "AI did not return structured output. Please try again." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const result = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-from-notes error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

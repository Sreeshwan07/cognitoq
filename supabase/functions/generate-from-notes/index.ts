import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { text, sections, difficulty, strictMode, subjectHint } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    if (!text || text.trim().length < 50) {
      return new Response(JSON.stringify({ error: "Uploaded content is too short to generate questions from." }), {
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

    const systemPrompt = `You are an expert university exam paper question generator. You analyze academic notes/content and generate structured exam questions.

${strictNote}

Rules:
- Questions must be academically correct and well-formed
- No duplicate or near-duplicate questions
- Ensure balanced coverage across all detected topics/units
- Each question must specify: text, marks, unit/topic, difficulty (Easy/Medium/Hard), type (Theory/Numerical/Application/Case Study), and bloom's taxonomy level
- For OR questions, both alternatives must be from the SAME unit/topic and carry the SAME marks
- Difficulty distribution should match: ${difficulty === "mixed" ? "balanced mix of Easy, Medium, Hard" : difficulty}
- Short answer questions (1-3 marks): test definitions, basic concepts
- Medium questions (5 marks): test understanding, explanations with examples
- Long questions (10+ marks): test application, analysis, case studies`;

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

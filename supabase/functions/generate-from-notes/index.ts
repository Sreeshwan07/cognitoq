import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Subject detection keywords
const SUBJECT_KEYWORDS: Record<string, string[]> = {
  "Database Management Systems": ["sql", "normalization", "er model", "entity relationship", "relational algebra", "dbms", "database", "primary key", "foreign key", "1nf", "2nf", "3nf", "bcnf", "acid", "transaction", "deadlock", "b-tree", "indexing", "query optimization", "plsql", "nosql", "mongodb"],
  "Operating Systems": ["process scheduling", "deadlock", "semaphore", "mutex", "virtual memory", "paging", "segmentation", "thread", "cpu scheduling", "round robin", "fcfs", "sjf", "page replacement", "lru", "fifo", "operating system", "kernel", "system call", "file system", "ipc", "inter process"],
  "Computer Networks": ["tcp", "udp", "osi model", "routing", "ip address", "subnet", "dns", "http", "ftp", "smtp", "arp", "rarp", "ethernet", "socket", "protocol", "packet switching", "circuit switching", "congestion control", "flow control", "network layer", "data link"],
  "Data Structures": ["linked list", "binary tree", "stack", "queue", "graph", "sorting", "searching", "hashing", "bst", "avl tree", "heap", "priority queue", "array", "recursion", "dynamic programming", "greedy algorithm", "bfs", "dfs", "dijkstra"],
  "Object Oriented Programming": ["class", "object", "inheritance", "polymorphism", "encapsulation", "abstraction", "constructor", "destructor", "overloading", "overriding", "virtual function", "interface", "abstract class", "oop"],
  "Software Engineering": ["sdlc", "agile", "waterfall", "spiral model", "requirement analysis", "use case", "uml", "testing", "black box", "white box", "software design", "coupling", "cohesion", "risk management"],
  "Compiler Design": ["lexical analysis", "syntax analysis", "parser", "grammar", "automata", "finite automaton", "context free grammar", "cfg", "lr parser", "ll parser", "code optimization", "intermediate code", "symbol table", "tokenizer"],
  "Artificial Intelligence": ["search algorithm", "heuristic", "a* algorithm", "minimax", "neural network", "machine learning", "deep learning", "natural language processing", "expert system", "fuzzy logic", "genetic algorithm", "reinforcement learning", "classification", "regression"],
  "Theory of Computation": ["turing machine", "finite automata", "pushdown automata", "regular expression", "context free grammar", "pumping lemma", "decidability", "np complete", "chomsky hierarchy", "dfa", "nfa"],
  "Digital Electronics": ["boolean algebra", "logic gates", "karnaugh map", "flip flop", "counter", "register", "multiplexer", "decoder", "encoder", "adc", "dac", "combinational circuit", "sequential circuit"],
  "Mathematics": ["calculus", "differential equation", "integration", "matrix", "eigen value", "laplace transform", "fourier transform", "probability", "statistics", "linear algebra", "discrete mathematics"],
  "Web Technologies": ["html", "css", "javascript", "react", "angular", "node.js", "express", "rest api", "json", "xml", "ajax", "dom", "responsive design", "bootstrap", "php", "servlet", "jsp"],
  "Microprocessor": ["8085", "8086", "assembly language", "instruction set", "addressing mode", "interrupt", "dma", "io interfacing", "memory mapping", "bus architecture"],
  "Cloud Computing": ["virtualization", "iaas", "paas", "saas", "aws", "azure", "docker", "kubernetes", "cloud storage", "serverless", "load balancing", "auto scaling"],
};

function detectSubject(text: string): { subject: string; confidence: number; scores: Record<string, number> } {
  const lower = text.toLowerCase();
  const scores: Record<string, number> = {};
  
  for (const [subject, keywords] of Object.entries(SUBJECT_KEYWORDS)) {
    let score = 0;
    for (const kw of keywords) {
      const regex = new RegExp(`\\b${kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, "gi");
      const matches = lower.match(regex);
      if (matches) score += matches.length;
    }
    if (score > 0) scores[subject] = score;
  }
  
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  if (sorted.length === 0) return { subject: "Unknown", confidence: 0, scores };
  
  const topScore = sorted[0][1];
  const secondScore = sorted.length > 1 ? sorted[1][1] : 0;
  const confidence = Math.min(100, Math.round((topScore / (topScore + secondScore + 1)) * 100));
  
  return { subject: sorted[0][0], confidence, scores };
}

function preprocessText(raw: string): string {
  let text = raw;
  
  // Remove common PDF/DOCX artifacts
  text = text.replace(/page\s*\d+\s*(of\s*\d+)?/gi, "");
  text = text.replace(/^\s*\d+\s*$/gm, ""); // standalone page numbers
  text = text.replace(/https?:\/\/\S+/g, ""); // URLs
  text = text.replace(/[^\x20-\x7E\n\r\t\u00A0-\u024F]/g, " "); // non-printable chars (keep extended latin)
  
  // Remove repeated header/footer lines (lines appearing 3+ times)
  const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
  const lineCounts: Record<string, number> = {};
  for (const line of lines) {
    const key = line.toLowerCase().substring(0, 80);
    lineCounts[key] = (lineCounts[key] || 0) + 1;
  }
  const repeatedLines = new Set(Object.entries(lineCounts).filter(([, c]) => c >= 3).map(([k]) => k));
  const filtered = lines.filter(l => !repeatedLines.has(l.toLowerCase().substring(0, 80)));
  
  // Merge broken sentences (lines ending without punctuation followed by lowercase)
  const merged: string[] = [];
  for (let i = 0; i < filtered.length; i++) {
    const line = filtered[i];
    if (merged.length > 0) {
      const prev = merged[merged.length - 1];
      if (!prev.match(/[.!?:;,\-]$/) && line.match(/^[a-z]/)) {
        merged[merged.length - 1] = prev + " " + line;
        continue;
      }
    }
    merged.push(line);
  }
  
  text = merged.join("\n");
  
  // Collapse excessive whitespace
  text = text.replace(/\n{3,}/g, "\n\n");
  text = text.replace(/[ \t]{3,}/g, "  ");
  
  return text.trim();
}

function validateAIOutput(questions: any[], detectedSubject: string, sourceText: string): { valid: any[]; rejected: any[]; warnings: string[] } {
  const lower = sourceText.toLowerCase();
  const valid: any[] = [];
  const rejected: any[] = [];
  const warnings: string[] = [];
  const seenTexts = new Set<string>();
  
  for (const q of questions) {
    const qText = (q.text || "").toLowerCase().trim();
    
    // Reject empty
    if (!qText || qText.length < 10) {
      rejected.push({ ...q, reason: "Too short or empty" });
      continue;
    }
    
    // Reject near-duplicates
    const normalized = qText.replace(/[^a-z0-9]/g, "");
    if (seenTexts.has(normalized)) {
      rejected.push({ ...q, reason: "Duplicate question" });
      continue;
    }
    
    // Reject overly generic questions
    const genericPatterns = [
      /^what is .{1,15}\??$/,
      /^define .{1,15}\.?$/,
      /^explain .{1,10}\.?$/,
    ];
    if (genericPatterns.some(p => p.test(qText)) && q.marks > 2) {
      rejected.push({ ...q, reason: "Too generic for marks assigned" });
      continue;
    }
    
    // Check if key terms from question exist in source (relaxed: at least 2 significant words)
    const significantWords = qText
      .replace(/[^a-z\s]/g, "")
      .split(/\s+/)
      .filter(w => w.length > 4 && !["which", "what", "where", "explain", "define", "write", "describe", "discuss", "compare", "short", "answer", "question", "example", "following", "between", "about", "given", "using"].includes(w));
    
    const matchCount = significantWords.filter(w => lower.includes(w)).length;
    if (significantWords.length > 2 && matchCount < Math.ceil(significantWords.length * 0.3)) {
      rejected.push({ ...q, reason: "Topic not found in uploaded notes" });
      continue;
    }
    
    seenTexts.add(normalized);
    valid.push(q);
  }
  
  if (rejected.length > 0) {
    warnings.push(`${rejected.length} question(s) were filtered out: ${rejected.map(r => r.reason).filter((v, i, a) => a.indexOf(v) === i).join(", ")}`);
  }
  
  return { valid, rejected, warnings };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { text, sections, difficulty, strictMode, subjectHint, confirmedSubject } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Preprocess
    const cleaned = preprocessText(text || "");
    
    if (cleaned.length < 100) {
      return new Response(JSON.stringify({ 
        error: "Not enough academic content detected. Please upload a file with more substantive text content (at least a few paragraphs of notes)." 
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Detect subject using keywords
    const detection = detectSubject(cleaned);
    const lockedSubject = confirmedSubject || subjectHint || detection.subject;

    // Build sections description
    const sectionsDesc = (sections || []).map((s: any) => {
      const orNote = s.enableOr ? " (generate OR alternatives for each question — two questions per slot from the same topic)" : "";
      return `${s.name}: ${s.totalQuestions} questions × ${s.marks} marks each. Students answer ${s.questionsToAnswer} out of ${s.totalQuestions}.${orNote}`;
    }).join("\n");

    const systemPrompt = `You are a university-level academic question paper setter.

SUBJECT: ${lockedSubject}
You MUST generate questions ONLY for this subject. Do NOT change or mix subjects.

STRICT RULES:
${strictMode 
  ? `- Generate questions ONLY from the provided content below.
- NEVER use outside knowledge. NEVER guess missing topics. NEVER add information not present in the notes.
- Every single question must be directly answerable from the uploaded content.
- If the content is insufficient for the required number of questions, generate as many as possible and include a warning.`
  : `- Generate questions primarily from the provided content. You may use general academic knowledge to improve quality.`}

- Questions must be academically correct, well-formed, and clearly worded
- No duplicate or near-duplicate questions
- Ensure balanced coverage across all detected topics/units from the content
- Each question must specify: text, marks, unit/topic, difficulty, type, bloom's taxonomy level, and section
- For OR questions: both alternatives MUST be from the SAME unit/topic and carry the SAME marks but cover DIFFERENT concepts
- Difficulty distribution: ${difficulty === "mixed" ? "balanced mix of Easy, Medium, Hard" : difficulty}
- Short answer questions (1-3 marks): test definitions, basic concepts
- Medium questions (5 marks): test understanding, explanations with examples  
- Long questions (10+ marks): test application, analysis, case studies

INTERNAL ANALYSIS STEPS (do NOT output these):
1. Identify all units/topics present in the content
2. Find key concepts, definitions, formulas, and important ideas per topic
3. Plan question distribution across topics
4. Generate questions ensuring no repetition and full coverage

SELF-VALIDATION before output:
- Verify every question is answerable from the provided content
- Verify subject is "${lockedSubject}" — reject if any question belongs to a different subject
- Verify no two questions ask the same thing differently
- If validation fails, regenerate the failing questions`;

    const userPrompt = `Analyze the following academic content for subject "${lockedSubject}" and generate exam questions.

CONTENT:
"""
${cleaned.substring(0, 15000)}
"""

PAPER STRUCTURE:
${sectionsDesc || "Generate 10 short (2 marks), 5 medium (5 marks), and 2 long (10 marks) questions."}

Respond using the suggest_questions tool.`;

    const toolSchema = {
      type: "function",
      function: {
        name: "suggest_questions",
        description: "Return the detected subject, units, and generated exam questions",
        parameters: {
          type: "object",
          properties: {
            detectedSubject: { type: "string", description: "The academic subject (must match the locked subject)" },
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
    
    // Force subject to locked value
    result.detectedSubject = lockedSubject;
    
    // Post-generation validation
    const validation = validateAIOutput(result.questions, lockedSubject, cleaned);
    result.questions = validation.valid;
    result.warnings = [...(result.warnings || []), ...validation.warnings];
    
    // Add keyword detection metadata
    result.keywordDetection = {
      detectedSubject: detection.subject,
      confidence: detection.confidence,
      topScores: Object.entries(detection.scores)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, score]) => ({ name, score })),
    };

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

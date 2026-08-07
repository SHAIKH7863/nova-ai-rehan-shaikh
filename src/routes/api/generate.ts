import "@tanstack/react-start";
import { createFileRoute } from "@tanstack/react-router";
import { generateText } from "ai";
import { z } from "zod";
import { getAiErrorMessage, getNovaModels, NOVA_SYSTEM_PROMPT } from "@/lib/ai-gateway";

const ResourceSchema = z.object({
  resources: z
    .array(
      z.object({
        title: z.string(),
        url: z.string(),
        type: z.enum([
          "book",
          "pdf",
          "youtube",
          "official",
          "notes",
          "syllabus",
          "admit_card",
          "result",
          "answer_key",
          "mock_test",
          "article",
          "other",
        ]),
        source: z.string().describe("e.g. NTA, NCERT, Physics Wallah"),
        description: z.string(),
      })
    )
    .min(1),
});

const QuestionSchema = z.object({
  title: z.string(),
  questions: z
    .array(
      z.object({
        question: z.string(),
        type: z.enum(["mcq", "short", "long"]),
        options: z.array(z.string()).optional(),
        answer: z.string(),
        explanation: z.string().optional(),
        marks: z.number().optional(),
      })
    )
    .min(1),
});

const FlashcardSchema = z.object({
  cards: z
    .array(z.object({ front: z.string(), back: z.string() }))
    .min(1),
});

const FormulaSchema = z.object({
  topic: z.string(),
  formulas: z
    .array(
      z.object({
        name: z.string(),
        formula: z.string(),
        description: z.string(),
      })
    )
    .min(1),
});

const SummarySchema = z.object({
  title: z.string(),
  keyPoints: z.array(z.string()).min(1),
  detailedNotes: z.string(),
  importantFormulas: z.array(z.string()).optional(),
});

const RoadmapSchema = z.object({
  exam: z.string(),
  totalWeeks: z.number(),
  phases: z
    .array(
      z.object({
        title: z.string(),
        weeks: z.string(),
        focus: z.string(),
        topics: z.array(z.string()),
        dailyHours: z.number(),
      })
    )
    .min(1),
  tips: z.array(z.string()),
});

const schemaMap = {
  resources: ResourceSchema,
  questions: QuestionSchema,
  flashcards: FlashcardSchema,
  formulas: FormulaSchema,
  summary: SummarySchema,
  roadmap: RoadmapSchema,
} as const;

type Kind = keyof typeof schemaMap;

export const Route = createFileRoute("/api/generate")({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        const body = (await request.json()) as { kind?: Kind; prompt?: string };
        const kind = body.kind;
        const prompt = body.prompt?.trim();

        if (!kind || !schemaMap[kind] || !prompt) {
          return new Response("kind + prompt required", { status: 400 });
        }
        const models = getNovaModels();
        if (models.length === 0) return new Response("AI not configured", { status: 500 });
        const schema = schemaMap[kind];
        const jsonShape = JSON.stringify(zodToShape(schema));
        const errors: string[] = [];

        for (const picked of models) {
          try {
          const { text } = await generateText({
            model: picked.model,
            system:
              NOVA_SYSTEM_PROMPT +
              `\n\nYou MUST respond with ONLY a valid JSON object (no markdown fences, no commentary) matching this shape:\n${jsonShape}\nBe accurate, specific and useful for Indian competitive exam students.`,
            prompt,
          });
          const parsed = extractJson(text);
          const validated = schema.safeParse(parsed);
          if (validated.success) return Response.json(validated.data);
          if (parsed && typeof parsed === "object" && Object.keys(parsed).length > 0) {
            // best-effort: usable even if not strictly valid
            return Response.json(parsed);
          }
          errors.push(`${picked.provider}: empty/invalid JSON`);

          } catch (e) {
            const msg = getAiErrorMessage(e);
            errors.push(`${picked.provider}: ${msg}`);
            console.error("generate error", msg);
          }
        }

        {
          const msg = errors.at(-1) ?? "AI generation failed. Try again.";
          return new Response(
            JSON.stringify({ error: "AI generation failed. Try again.", detail: msg }),
            { status: 500, headers: { "Content-Type": "application/json" } }
          );
        }
      },
    },
  },
});

function extractJson(text: string): unknown {
  const cleaned = text.trim().replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const m = cleaned.match(/\{[\s\S]*\}/);
    if (m) {
      try {
        return JSON.parse(m[0]);
      } catch {
        return null;
      }
    }
    return null;
  }
}

// Very small zod -> shape hint for the model prompt
function zodToShape(s: z.ZodTypeAny): unknown {
  const def: any = (s as any)._def;
  const t = def?.typeName ?? def?.type;
  if (t === "ZodObject" || t === "object") {
    const shape = typeof def.shape === "function" ? def.shape() : def.shape;
    const out: Record<string, unknown> = {};
    for (const k of Object.keys(shape)) out[k] = zodToShape(shape[k]);
    return out;
  }
  if (t === "ZodArray" || t === "array") return [zodToShape(def.type ?? def.element)];
  if (t === "ZodOptional" || t === "optional") return zodToShape(def.innerType);
  if (t === "ZodEnum" || t === "enum") return (def.values ?? def.entries ?? []).join("|");
  if (t === "ZodNumber" || t === "number") return 0;
  if (t === "ZodBoolean" || t === "boolean") return false;
  return "string";
}

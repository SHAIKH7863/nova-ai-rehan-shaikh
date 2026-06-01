import "@tanstack/react-start";
import { createFileRoute } from "@tanstack/react-router";
import { generateObject } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider, NOVA_SYSTEM_PROMPT } from "@/lib/ai-gateway";

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
    .min(4)
    .max(12),
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
    .min(5)
    .max(30),
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
    .min(5)
    .max(25),
});

const SummarySchema = z.object({
  title: z.string(),
  keyPoints: z.array(z.string()).min(5).max(15),
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
    .min(3)
    .max(8),
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
        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("AI not configured", { status: 500 });

        const gateway = createLovableAiGatewayProvider(key);
        const model = gateway("google/gemini-3-flash-preview");

        try {
          const { object } = await generateObject({
            model,
            schema: schemaMap[kind],
            system:
              NOVA_SYSTEM_PROMPT +
              "\n\nReturn ONLY valid structured JSON matching the schema. Be accurate and specific for Indian competitive exam students.",
            prompt,
          } as Parameters<typeof generateObject>[0]);
          return Response.json(object);
        } catch (e) {
          const msg = e instanceof Error ? e.message : String(e);
          console.error("generate error", msg);
          return new Response(
            JSON.stringify({ error: "AI generation failed. Try again.", detail: msg }),
            { status: 500, headers: { "Content-Type": "application/json" } }
          );
        }
      },
    },
  },
});

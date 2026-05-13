import "@tanstack/react-start";
import { createFileRoute } from "@tanstack/react-router";
import { generateText, Output } from "ai";
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
    .min(6)
    .max(20),
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
          const { experimental_output } = await generateText({
            model,
            system:
              NOVA_SYSTEM_PROMPT +
              "\n\nReturn ONLY the structured data requested. Be specific, accurate, and helpful for Indian competitive exam students.",
            prompt,
            experimental_output: Output.object({ schema: schemaMap[kind] }),
          });
          return Response.json(experimental_output);
        } catch (e) {
          console.error("generate error", e);
          return new Response(
            JSON.stringify({ error: "AI generation failed. Try again." }),
            { status: 500, headers: { "Content-Type": "application/json" } }
          );
        }
      },
    },
  },
});

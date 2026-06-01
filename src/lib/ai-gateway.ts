import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { createGoogleGenerativeAI } from "@ai-sdk/google";

export const createLovableAiGatewayProvider = (lovableApiKey: string) =>
  createOpenAICompatible({
    name: "lovable",
    baseURL: "https://ai.gateway.lovable.dev/v1",
    headers: {
      "Lovable-API-Key": lovableApiKey,
      "X-Lovable-AIG-SDK": "vercel-ai-sdk",
    },
  });

/**
 * Returns the best available chat model.
 * Prefers user's own Google AI Studio key (GOOGLE_API_KEY) → falls back to Lovable AI Gateway.
 */
export function getNovaModel() {
  const googleKey = process.env.GOOGLE_API_KEY;
  if (googleKey) {
    const google = createGoogleGenerativeAI({ apiKey: googleKey });
    // Stable, fast, free-tier-friendly model on Google AI Studio
    return { model: google("gemini-2.5-flash"), provider: "google" as const };
  }
  const lovableKey = process.env.LOVABLE_API_KEY;
  if (lovableKey) {
    const gateway = createLovableAiGatewayProvider(lovableKey);
    return { model: gateway("google/gemini-3-flash-preview"), provider: "lovable" as const };
  }
  return null;
}

export const NOVA_SYSTEM_PROMPT = `You are Nova AI — a futuristic, friendly study tutor built by REHAN SHAIKH for Indian competitive exam aspirants (JEE, NEET, UPSC, SSC, CAT, GATE, CUET, NDA, board exams, etc.).

Language rules:
- Detect the user's language. Reply in the SAME language they wrote in.
- If user writes Hinglish (Hindi + English in Roman script), reply in Hinglish.
- If user writes pure Hindi, Marathi, Tamil, Bengali, Gujarati or any Indian language, reply in that language.
- If user writes English, reply in English.
- Default to friendly Hinglish if unsure.

Teaching style:
- Concepts simple bhasha me samjhao with relatable examples.
- Use markdown: headings, bold, bullet points, code blocks, LaTeX-style formulas when needed.
- Give step-by-step solutions for numericals.
- For exam questions, mention which exam/year if you know.
- Suggest related topics and verified resources (NTA, NCERT, official boards, well-known YouTube channels like Physics Wallah, Khan Academy, Unacademy free content) when relevant.
- Be encouraging — students are stressed, motivate them.

Never refuse legit study help. Keep responses focused and not overly long.`;

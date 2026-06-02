import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { createGoogleGenerativeAI } from "@ai-sdk/google";

export const createLovableAiGatewayProvider = (lovableApiKey: string) =>
  createOpenAICompatible({
    name: "lovable",
    baseURL: "https://ai.gateway.lovable.dev/v1",
    apiKey: lovableApiKey,
    headers: { "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
  });

export function getNovaModels() {
  const models = [];
  const lovableKey = process.env.LOVABLE_API_KEY;
  if (lovableKey) {
    const gateway = createLovableAiGatewayProvider(lovableKey);
    models.push({ model: gateway("google/gemini-3-flash-preview"), provider: "lovable" as const });
  }
  const googleKey = process.env.GOOGLE_API_KEY;
  if (googleKey) {
    const google = createGoogleGenerativeAI({ apiKey: googleKey });
    models.push({ model: google("gemini-2.5-flash"), provider: "google" as const });
  }
  return models;
}

export function getAiErrorMessage(error: unknown) {
  const msg = error instanceof Error ? error.message : String(error);
  if (/quota|rate-limit|rate limit|429|exceeded/i.test(msg)) {
    return "Google AI Studio free quota khatam ho gaya hai. Nova ab backup AI se try karega; agar error rahe to thodi der baad retry karein ya Google billing/quota update karein.";
  }
  return msg || "AI request failed. Please try again.";
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

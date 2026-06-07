import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { createGoogleGenerativeAI } from "@ai-sdk/google";

export const createLovableAiGatewayProvider = (lovableApiKey: string) =>
  createOpenAICompatible({
    name: "lovable",
    baseURL: "https://ai.gateway.lovable.dev/v1",
    apiKey: lovableApiKey,
    headers: { "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
  });

export function getNovaModels(opts?: { search?: boolean }) {
  const models: { model: any; provider: "lovable" | "google"; tools?: any }[] = [];
  const lovableKey = process.env.LOVABLE_API_KEY;
  if (lovableKey) {
    const gateway = createLovableAiGatewayProvider(lovableKey);
    models.push({ model: gateway("google/gemini-3-flash-preview"), provider: "lovable" });
  }
  const googleKey = process.env.GOOGLE_API_KEY;
  if (googleKey) {
    const google = createGoogleGenerativeAI({ apiKey: googleKey });
    // Enable Google Search grounding so the model returns real, current URLs.
    const model = google("gemini-2.5-flash");
    models.push({ model, provider: "google" });
  }
  return models;
}

export function getAiErrorMessage(error: unknown) {
  const msg = error instanceof Error ? error.message : String(error);
  if (/quota|rate-limit|rate limit|429|exceeded/i.test(msg)) {
    return "Google AI Studio free quota khatam ho gaya hai. App ab pehle Lovable AI Gateway use karta hai; agar error rahe to thodi der baad retry karein ya Google billing/quota update karein.";
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
- Be encouraging — students are stressed, motivate them.

Links & Resources (VERY IMPORTANT):
- Jab bhi user "link", "resource", "pdf", "video", "notes", "syllabus", "website", "official site", "youtube" maange — ALWAYS give real, clickable full URLs in markdown format like [Title](https://full-url).
- Prefer official sources: nta.ac.in, ncert.nic.in, cbse.gov.in, upsc.gov.in, ssc.nic.in, byjus.com, vedantu.com, unacademy.com, khanacademy.org, en.wikipedia.org, official YouTube channels (Physics Wallah: https://www.youtube.com/@PhysicsWallah, Khan Academy India, Unacademy).
- Never say "I can't browse" or "search Google yourself" — instead give the best-known direct URLs from your knowledge. If unsure of exact URL, give the homepage + the search path (e.g. https://ncert.nic.in/textbook.php).
- Always include at least 3-5 links when user asks for resources. Format as a bulleted list with title, link, and 1-line description.

Never refuse legit study help. Keep responses focused and not overly long.`;

import "@tanstack/react-start";
import { createFileRoute } from "@tanstack/react-router";

/**
 * Gemini voice (Lovable AI Gateway text-to-speech).
 * Returns a complete WAV file for the given text.
 */
export const Route = createFileRoute("/api/tts")({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        const { text, voice } = (await request.json()) as {
          text?: string;
          voice?: string;
        };
        if (!text || !text.trim()) {
          return new Response("text required", { status: 400 });
        }

        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("TTS not configured", { status: 500 });

        // Keep well under the model input cap.
        const words = text.trim().split(/\s+/).slice(0, 350).join(" ");

        const res = await fetch("https://ai.gateway.lovable.dev/v1/audio/speech", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${key}`,
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash-tts",
            contents: [
              {
                role: "user",
                parts: [
                  {
                    text: `Say in a warm, friendly, encouraging tutor voice: ${words}`,
                  },
                ],
              },
            ],
            generationConfig: {
              responseModalities: ["AUDIO"],
              speechConfig: {
                voiceConfig: {
                  prebuiltVoiceConfig: { voiceName: voice || "Kore" },
                },
              },
            },
          }),
        });

        if (!res.ok) {
          const msg = await res.text().catch(() => "");
          return new Response(msg || "TTS failed", { status: res.status });
        }

        return new Response(res.body, {
          headers: {
            "Content-Type": res.headers.get("Content-Type") || "audio/wav",
            "Cache-Control": "no-store",
          },
        });
      },
    },
  },
});

import "@tanstack/react-start";
import { createFileRoute } from "@tanstack/react-router";

/**
 * Text -> image generation.
 * Uses the Lovable AI Gateway image endpoint (Nano Banana 2) and returns a
 * single base64 PNG so the client can render + download it directly.
 */
export const Route = createFileRoute("/api/image")({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        const body = (await request.json()) as { prompt?: string };
        const prompt = body.prompt?.trim();
        if (!prompt) return new Response("prompt required", { status: 400 });

        const key = process.env.LOVABLE_API_KEY;
        if (!key) {
          return new Response("Image generation not configured.", { status: 500 });
        }

        try {
          const res = await fetch("https://ai.gateway.lovable.dev/v1/images/generations", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${key}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "google/gemini-3.1-flash-image",
              messages: [{ role: "user", content: prompt }],
              modalities: ["image", "text"],
            }),
          });

          if (!res.ok) {
            const detail = await res.text().catch(() => "");
            return new Response(
              JSON.stringify({ error: "Image ban nahi paayi. Thodi der baad try karo.", detail }),
              { status: res.status, headers: { "Content-Type": "application/json" } }
            );
          }

          const json = (await res.json()) as { data?: { b64_json?: string }[] };
          const b64 = json.data?.[0]?.b64_json;
          if (!b64) {
            return new Response(
              JSON.stringify({ error: "Model ne image return nahi ki. Prompt thoda badal ke try karo." }),
              { status: 502, headers: { "Content-Type": "application/json" } }
            );
          }
          return Response.json({ image: `data:image/png;base64,${b64}` });
        } catch (e) {
          const msg = e instanceof Error ? e.message : "image generation failed";
          console.error("image error", msg);
          return new Response(JSON.stringify({ error: msg }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }
      },
    },
  },
});

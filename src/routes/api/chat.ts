import "@tanstack/react-start";
import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import {
  getAiErrorMessage,
  getNovaModels,
  NOVA_BOSS_PROMPT,
  NOVA_SYSTEM_PROMPT,
} from "@/lib/ai-gateway";

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        const body = (await request.json()) as { messages?: UIMessage[]; boss?: boolean };
        if (!Array.isArray(body.messages)) {
          return new Response("messages required", { status: 400 });
        }


        const picked = getNovaModels()[0];
        if (!picked) {
          return new Response("AI not configured. Add GOOGLE_API_KEY or enable Lovable AI.", {
            status: 500,
          });
        }
        const { model } = picked;

        try {
          const result = streamText({
            model,
            system: NOVA_SYSTEM_PROMPT + (body.boss ? NOVA_BOSS_PROMPT : ""),
            messages: await convertToModelMessages(body.messages),
          });
          return result.toUIMessageStreamResponse({
            originalMessages: body.messages,
            onError: getAiErrorMessage,
          });
        } catch (e) {
          const message = getAiErrorMessage(e);
          console.error("chat error", message);
          return new Response(message, { status: 500 });
        }
      },
    },
  },
});

import "@tanstack/react-start";
import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
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


        let privateContext = "";
        const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
        const url = process.env["SUPABASE_URL"];
        const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
        if (token && url && key) {
          const cloud = createClient<Database>(url, key, {
            global: { headers: { Authorization: `Bearer ${token}` } },
            auth: { persistSession: false, autoRefreshToken: false, storage: undefined },
          });
          const { data: claims } = await cloud.auth.getClaims(token);
          const userId = claims?.claims?.sub;
          if (userId) {
            const [{ data: profile }, { data: memories }] = await Promise.all([
              cloud.from("profiles").select("username,display_name,is_owner").eq("id", userId).maybeSingle(),
              cloud.from("user_memories").select("memory,is_private").eq("user_id", userId).order("updated_at", { ascending: false }).limit(30),
            ]);
            privateContext = [
              profile?.display_name || profile?.username ? `User name: ${profile.display_name || profile.username}.` : "",
              profile?.is_owner ? "This is the app owner. Reveal the owner's name only when directly asked." : "",
              memories?.length ? `Private memories (use only to personalize this user's replies):\n${memories.map((item) => `- ${item.memory}`).join("\n")}` : "",
            ].filter(Boolean).join("\n");
          }
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
            system: NOVA_SYSTEM_PROMPT + (body.boss ? NOVA_BOSS_PROMPT : "") + (privateContext ? `\n\n## PRIVATE USER CONTEXT\n${privateContext}` : ""),
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

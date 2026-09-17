import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const messageSchema = z.object({
  id: z.string(),
  role: z.string(),
  parts: z.unknown(),
});

const threadSchema = z.object({
  id: z.string(),
  title: z.string(),
  bookmarked: z.boolean(),
  updatedAt: z.number(),
  messages: z.array(messageSchema),
});

export const getCloudThreads = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: threads, error } = await context.supabase
      .from("chat_threads")
      .select("id,title,bookmarked,updated_at")
      .eq("user_id", context.userId)
      .order("updated_at", { ascending: false });
    if (error) throw error;
    if (!threads?.length) return [];

    const ids = threads.map((thread) => thread.id);
    const { data: messages, error: messageError } = await context.supabase
      .from("chat_messages")
      .select("id,thread_id,role,parts")
      .in("thread_id", ids)
      .eq("user_id", context.userId)
      .order("created_at", { ascending: true });
    if (messageError) throw messageError;

    return threads.map((thread) => ({
      id: thread.id,
      title: thread.title,
      bookmarked: thread.bookmarked,
      updatedAt: new Date(thread.updated_at).getTime(),
      messages: (messages ?? [])
        .filter((message) => message.thread_id === thread.id)
        .map(({ id, role, parts }) => ({ id, role, parts })),
    }));
  });

export const saveCloudThread = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => threadSchema.parse(data))
  .handler(async ({ context, data }) => {
    const { error: threadError } = await context.supabase.from("chat_threads").upsert({
      id: data.id,
      user_id: context.userId,
      title: data.title,
      bookmarked: data.bookmarked,
      updated_at: new Date(data.updatedAt).toISOString(),
    });
    if (threadError) throw threadError;

    const { error: deleteError } = await context.supabase
      .from("chat_messages")
      .delete()
      .eq("thread_id", data.id)
      .eq("user_id", context.userId);
    if (deleteError) throw deleteError;

    if (data.messages.length) {
      const { error: messageError } = await context.supabase.from("chat_messages").insert(
        data.messages.map((message) => ({
          id: message.id,
          thread_id: data.id,
          user_id: context.userId,
          role: message.role,
          parts: message.parts as never,
        })),
      );
      if (messageError) throw messageError;
    }
    return { ok: true };
  });

export const saveMemory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ memory: z.string().min(2), isPrivate: z.boolean().default(true) }).parse(data))
  .handler(async ({ context, data }) => {
    const { error } = await context.supabase.from("user_memories").insert({
      user_id: context.userId,
      memory: data.memory,
      is_private: data.isPrivate,
      source: "chat",
    });
    if (error) throw error;
    return { ok: true };
  });

export const getMyMemories = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("user_memories")
      .select("memory,is_private")
      .eq("user_id", context.userId)
      .order("updated_at", { ascending: false })
      .limit(30);
    if (error) throw error;
    return data ?? [];
  });

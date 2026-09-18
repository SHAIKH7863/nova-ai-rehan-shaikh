import { useCallback, useEffect, useState } from "react";
import type { UIMessage } from "ai";
import { supabase } from "@/integrations/supabase/client";

export type ChatThread = {
  id: string;
  title: string;
  bookmarked: boolean;
  messages: UIMessage[];
  updatedAt: number;
};

export function useThreads() {
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      const raw = localStorage.getItem("nova:threads:guest");
      let localThreads: ChatThread[] = [];
      try {
        localThreads = raw ? (JSON.parse(raw) as ChatThread[]) : [];
      } catch {
        localThreads = [];
      }

      const { data: auth } = await supabase.auth.getUser();
      const id = auth.user?.id ?? null;
      if (!active) return;
      setUserId(id);
      if (!id) {
        setThreads(localThreads);
        setHydrated(true);
        return;
      }

      const { data: cloudThreads, error: threadError } = await supabase
        .from("chat_threads")
        .select("id,title,bookmarked,updated_at")
        .eq("user_id", id)
        .order("updated_at", { ascending: false });
      if (threadError) {
        console.error("Unable to load cloud chats", threadError);
        setThreads([]);
        setHydrated(true);
        return;
      }

      const ids = (cloudThreads ?? []).map((thread) => thread.id);
      const { data: cloudMessages } = ids.length
        ? await supabase
            .from("chat_messages")
            .select("id,thread_id,role,parts")
            .eq("user_id", id)
            .in("thread_id", ids)
            .order("created_at", { ascending: true })
        : { data: [] };
      const cloud = (cloudThreads ?? []).map((thread) => ({
        id: thread.id,
        title: thread.title,
        bookmarked: thread.bookmarked,
        updatedAt: new Date(thread.updated_at).getTime(),
        messages: (cloudMessages ?? [])
          .filter((message) => message.thread_id === thread.id)
          .map((message) => ({
            id: message.id,
            role: message.role as UIMessage["role"],
            parts: message.parts as UIMessage["parts"],
          })),
      }));
      setThreads(cloud);
      setHydrated(true);
    };
    void load();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(userId ? `nova:threads:${userId}` : "nova:threads:guest", JSON.stringify(threads));
  }, [threads, hydrated, userId]);

  const saveCloud = useCallback(async (thread: ChatThread, id: string) => {
    const { error } = await supabase.from("chat_threads").upsert({
      id: thread.id,
      user_id: id,
      title: thread.title,
      bookmarked: thread.bookmarked,
      updated_at: new Date(thread.updatedAt).toISOString(),
    });
    if (error) return;
    await supabase.from("chat_messages").delete().eq("thread_id", thread.id).eq("user_id", id);
    if (thread.messages.length) {
      await supabase.from("chat_messages").insert(
        thread.messages.map((message) => ({
          id: message.id,
          thread_id: thread.id,
          user_id: id,
          role: message.role,
          parts: message.parts as never,
        })),
      );
    }
  }, []);

  const upsert = useCallback(
    (t: ChatThread) => {
      setThreads((prev) => {
        const idx = prev.findIndex((x) => x.id === t.id);
        const next = [...prev];
        if (idx === -1) next.unshift(t);
        else next[idx] = t;
        return next.sort((a, b) => b.updatedAt - a.updatedAt);
      });
      if (userId) void saveCloud(t, userId);
    },
    [saveCloud, userId]
  );

  const remove = useCallback(
    (id: string) => {
      setThreads((prev) => prev.filter((t) => t.id !== id));
      if (userId) {
        void supabase.from("chat_messages").delete().eq("thread_id", id).eq("user_id", userId);
        void supabase.from("chat_threads").delete().eq("id", id).eq("user_id", userId);
      }
    },
    [userId]
  );

  const rename = useCallback(
    (id: string, title: string) => {
      setThreads((prev) => prev.map((t) => (t.id === id ? { ...t, title, updatedAt: Date.now() } : t)));
      if (userId) void supabase.from("chat_threads").update({ title, updated_at: new Date().toISOString() }).eq("id", id).eq("user_id", userId);
    },
    [userId]
  );

  const toggleBookmark = useCallback(
    (id: string) => {
      const current = threads.find((thread) => thread.id === id);
      if (!current) return;
      const bookmarked = !current.bookmarked;
      setThreads((prev) => prev.map((t) => (t.id === id ? { ...t, bookmarked } : t)));
      if (userId) void supabase.from("chat_threads").update({ bookmarked, updated_at: new Date().toISOString() }).eq("id", id).eq("user_id", userId);
    },
    [threads, userId]
  );

  return { threads, upsert, remove, rename, toggleBookmark, hydrated };
}

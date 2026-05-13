import { useCallback } from "react";
import type { UIMessage } from "ai";
import { useLocalStorage } from "./use-local-storage";

export type ChatThread = {
  id: string;
  title: string;
  bookmarked: boolean;
  messages: UIMessage[];
  updatedAt: number;
};

export function useThreads() {
  const [threads, setThreads, hydrated] = useLocalStorage<ChatThread[]>(
    "nova:threads",
    []
  );

  const upsert = useCallback(
    (t: ChatThread) => {
      setThreads((prev) => {
        const idx = prev.findIndex((x) => x.id === t.id);
        const next = [...prev];
        if (idx === -1) next.unshift(t);
        else next[idx] = t;
        return next.sort((a, b) => b.updatedAt - a.updatedAt);
      });
    },
    [setThreads]
  );

  const remove = useCallback(
    (id: string) => setThreads((prev) => prev.filter((t) => t.id !== id)),
    [setThreads]
  );

  const rename = useCallback(
    (id: string, title: string) =>
      setThreads((prev) =>
        prev.map((t) => (t.id === id ? { ...t, title, updatedAt: Date.now() } : t))
      ),
    [setThreads]
  );

  const toggleBookmark = useCallback(
    (id: string) =>
      setThreads((prev) =>
        prev.map((t) => (t.id === id ? { ...t, bookmarked: !t.bookmarked } : t))
      ),
    [setThreads]
  );

  return { threads, upsert, remove, rename, toggleBookmark, hydrated };
}

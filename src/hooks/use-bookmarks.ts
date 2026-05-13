import { useCallback } from "react";
import { useLocalStorage } from "./use-local-storage";

export type Bookmark = {
  id: string;
  kind: "link" | "paper" | "chat" | "tool";
  title: string;
  subtitle?: string;
  payload: Record<string, unknown>;
  createdAt: number;
};

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useLocalStorage<Bookmark[]>("nova:bookmarks", []);

  const add = useCallback(
    (b: Omit<Bookmark, "id" | "createdAt">) => {
      setBookmarks((prev) => [
        { ...b, id: crypto.randomUUID(), createdAt: Date.now() },
        ...prev,
      ]);
    },
    [setBookmarks]
  );

  const remove = useCallback(
    (id: string) => setBookmarks((prev) => prev.filter((b) => b.id !== id)),
    [setBookmarks]
  );

  return { bookmarks, add, remove };
}

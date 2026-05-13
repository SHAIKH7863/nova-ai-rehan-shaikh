import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Plus, MessageSquare, Trash2, Star, Pencil } from "lucide-react";
import { useState } from "react";
import { AppHeader } from "@/components/app-header";
import { useThreads } from "@/hooks/use-threads";

export const Route = createFileRoute("/chat/")({
  head: () => ({
    meta: [
      { title: "Chat — Nova AI" },
      { name: "description", content: "Your conversations with Nova AI tutor." },
    ],
  }),
  component: ChatList,
});

function ChatList() {
  const { threads, remove, rename, toggleBookmark } = useThreads();
  const nav = useNavigate();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editVal, setEditVal] = useState("");

  const newChat = () => {
    const id = crypto.randomUUID();
    nav({ to: "/chat/$threadId", params: { threadId: id } });
  };

  return (
    <div>
      <AppHeader title="Conversations" subtitle={`${threads.length} chats`} />

      <button
        onClick={newChat}
        className="mb-4 flex w-full items-center justify-center gap-2 rounded-2xl gradient-primary px-4 py-3.5 text-sm font-semibold shadow-[0_0_28px_-8px_var(--primary)]"
      >
        <Plus size={18} /> New Chat
      </button>

      {threads.length === 0 ? (
        <div className="glass mt-4 rounded-3xl p-8 text-center">
          <MessageSquare className="mx-auto mb-3 text-muted-foreground" size={28} />
          <p className="text-sm font-medium">No chats yet</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Tap "New Chat" to start asking Nova AI anything.
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {threads.map((t) => (
            <li
              key={t.id}
              className="glass group flex items-center gap-3 rounded-2xl p-3 hover:bg-white/5"
            >
              <Link
                to="/chat/$threadId"
                params={{ threadId: t.id }}
                className="flex min-w-0 flex-1 items-center gap-3"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5">
                  <MessageSquare size={16} />
                </div>
                <div className="min-w-0 flex-1">
                  {editingId === t.id ? (
                    <input
                      autoFocus
                      value={editVal}
                      onChange={(e) => setEditVal(e.target.value)}
                      onClick={(e) => e.preventDefault()}
                      onBlur={() => {
                        if (editVal.trim()) rename(t.id, editVal.trim());
                        setEditingId(null);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          if (editVal.trim()) rename(t.id, editVal.trim());
                          setEditingId(null);
                        }
                      }}
                      className="w-full rounded bg-white/10 px-2 py-1 text-sm outline-none"
                    />
                  ) : (
                    <p className="truncate text-sm font-medium">{t.title}</p>
                  )}
                  <p className="truncate text-[10px] text-muted-foreground">
                    {new Date(t.updatedAt).toLocaleString()}
                  </p>
                </div>
              </Link>
              <button
                onClick={() => toggleBookmark(t.id)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-white/10 hover:text-accent"
                aria-label="Bookmark"
              >
                <Star
                  size={14}
                  fill={t.bookmarked ? "currentColor" : "none"}
                  className={t.bookmarked ? "text-accent" : ""}
                />
              </button>
              <button
                onClick={() => {
                  setEditingId(t.id);
                  setEditVal(t.title);
                }}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-white/10"
                aria-label="Rename"
              >
                <Pencil size={14} />
              </button>
              <button
                onClick={() => {
                  if (confirm("Delete this chat?")) remove(t.id);
                }}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/20 hover:text-destructive"
                aria-label="Delete"
              >
                <Trash2 size={14} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

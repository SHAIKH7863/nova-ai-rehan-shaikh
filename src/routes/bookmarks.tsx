import { createFileRoute } from "@tanstack/react-router";
import { Bookmark, ExternalLink, Trash2, Link as LinkIcon, FileText, MessageSquare, Sparkles } from "lucide-react";
import { useState } from "react";
import { AppHeader } from "@/components/app-header";
import { useBookmarks, type Bookmark as B } from "@/hooks/use-bookmarks";
import { useThreads } from "@/hooks/use-threads";
import { Link } from "@tanstack/react-router";
import { InAppBrowser } from "@/components/in-app-browser";

export const Route = createFileRoute("/bookmarks")({
  head: () => ({ meta: [{ title: "Bookmarks — Nova AI" }] }),
  component: BookmarksPage,
});

const ICONS = {
  link: LinkIcon,
  paper: FileText,
  chat: MessageSquare,
  tool: Sparkles,
} as const;

function BookmarksPage() {
  const { bookmarks, remove } = useBookmarks();
  const { threads } = useThreads();
  const [browserUrl, setBrowserUrl] = useState<{ url: string; title: string } | null>(null);
  const [filter, setFilter] = useState<"all" | B["kind"]>("all");

  const bookmarkedChats = threads.filter((t) => t.bookmarked);

  const filtered = filter === "all" ? bookmarks : bookmarks.filter((b) => b.kind === filter);

  return (
    <div>
      <AppHeader title="Bookmarks" subtitle={`${bookmarks.length + bookmarkedChats.length} saved`} />

      <div className="mb-3 flex gap-1.5 overflow-x-auto pb-1">
        {(["all", "link", "paper", "tool", "chat"] as const).map((k) => (
          <button
            key={k}
            onClick={() => setFilter(k)}
            className={`shrink-0 rounded-full border px-3 py-1 text-[11px] capitalize ${
              filter === k
                ? "border-primary/60 bg-primary/15"
                : "border-white/10 bg-white/5 text-muted-foreground"
            }`}
          >
            {k}
          </button>
        ))}
      </div>

      {filter !== "chat" && filtered.length === 0 && bookmarkedChats.length === 0 && (
        <div className="glass rounded-3xl p-8 text-center">
          <Bookmark className="mx-auto mb-3 text-muted-foreground" size={28} />
          <p className="text-sm font-medium">No bookmarks yet</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Save links, papers, tools and chats for quick access.
          </p>
        </div>
      )}

      <ul className="space-y-2">
        {(filter === "all" || filter === "chat") &&
          bookmarkedChats.map((t) => (
            <li key={t.id} className="glass rounded-2xl p-3">
              <Link
                to="/chat/$threadId"
                params={{ threadId: t.id }}
                className="flex items-center gap-3"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5">
                  <MessageSquare size={16} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{t.title}</p>
                  <p className="text-[10px] text-muted-foreground">Chat</p>
                </div>
              </Link>
            </li>
          ))}

        {filtered.map((b) => {
          const Icon = ICONS[b.kind];
          const url = (b.payload as { url?: string }).url;
          return (
            <li key={b.id} className="glass rounded-2xl p-3">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5">
                  <Icon size={16} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{b.title}</p>
                  {b.subtitle && (
                    <p className="truncate text-[11px] text-muted-foreground">
                      {b.subtitle}
                    </p>
                  )}
                </div>
                {url && (
                  <button
                    onClick={() => setBrowserUrl({ url, title: b.title })}
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10"
                  >
                    <ExternalLink size={13} />
                  </button>
                )}
                <button
                  onClick={() => remove(b.id)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/20 hover:text-destructive"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      {browserUrl && (
        <InAppBrowser
          url={browserUrl.url}
          title={browserUrl.title}
          onClose={() => setBrowserUrl(null)}
        />
      )}
    </div>
  );
}

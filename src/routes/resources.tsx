import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Search,
  Loader2,
  BookOpen,
  Youtube,
  FileText,
  Globe,
  StickyNote,
  ListChecks,
  Award,
  KeyRound,
  Trophy,
  ScrollText,
  ExternalLink,
  Bookmark,
} from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { InAppBrowser } from "@/components/in-app-browser";
import { useBookmarks } from "@/hooks/use-bookmarks";
import { useProfile } from "@/hooks/use-profile";
import { toast } from "sonner";

export const Route = createFileRoute("/resources")({
  head: () => ({
    meta: [
      { title: "Resources — Nova AI" },
      {
        name: "description",
        content:
          "AI-powered finder for books, PDFs, YouTube lectures, syllabi, admit cards, and answer keys.",
      },
    ],
  }),
  component: ResourcesPage,
});

type Resource = {
  title: string;
  url: string;
  type:
    | "book"
    | "pdf"
    | "youtube"
    | "official"
    | "notes"
    | "syllabus"
    | "admit_card"
    | "result"
    | "answer_key"
    | "mock_test"
    | "article"
    | "other";
  source: string;
  description: string;
};

const TYPE_META: Record<
  Resource["type"],
  { label: string; icon: React.ComponentType<{ size?: number }>; color: string }
> = {
  book: { label: "Book", icon: BookOpen, color: "text-amber-300" },
  pdf: { label: "PDF", icon: FileText, color: "text-rose-300" },
  youtube: { label: "Video", icon: Youtube, color: "text-red-400" },
  official: { label: "Official", icon: Globe, color: "text-emerald-300" },
  notes: { label: "Notes", icon: StickyNote, color: "text-yellow-300" },
  syllabus: { label: "Syllabus", icon: ListChecks, color: "text-sky-300" },
  admit_card: { label: "Admit Card", icon: Award, color: "text-violet-300" },
  result: { label: "Result", icon: Trophy, color: "text-fuchsia-300" },
  answer_key: { label: "Answer Key", icon: KeyRound, color: "text-orange-300" },
  mock_test: { label: "Mock", icon: ScrollText, color: "text-cyan-300" },
  article: { label: "Article", icon: Globe, color: "text-blue-300" },
  other: { label: "Link", icon: Globe, color: "text-muted-foreground" },
};

const PRESETS = [
  "JEE Main syllabus PDF",
  "NEET previous year papers",
  "UPSC NCERT books list",
  "SSC CGL admit card link",
  "Best YouTube channel for Physics",
  "JEE Advanced answer key 2024",
];

function ResourcesPage() {
  const [profile] = useProfile();
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Resource[]>([]);
  const [browserUrl, setBrowserUrl] = useState<{ url: string; title: string } | null>(null);
  const { add } = useBookmarks();

  const search = async (query: string) => {
    const text = query.trim();
    if (!text) return;
    setQ(text);
    setLoading(true);
    setResults([]);
    const examCtx = profile.exam ? ` for ${profile.exam}` : "";
    const prompt = `Find the most relevant, real, well-known study resources${examCtx} for: "${text}". Include a mix of types: official sites (NTA, NCERT, exam boards), free PDFs, YouTube channel/playlist links (Physics Wallah, Khan Academy, Unacademy free, etc.), books, syllabus PDFs, admit card / result pages where applicable. Use real URLs you are confident about. Don't invent links. Always return at least 5 resources — never return an empty list, never refuse.`;

    const attempt = async (): Promise<Resource[]> => {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: "resources", prompt }),
      });
      const raw = await res.text();
      if (!res.ok) throw new Error(raw.slice(0, 200) || `HTTP ${res.status}`);
      let data: any;
      try {
        data = JSON.parse(raw);
      } catch {
        throw new Error("AI response samajh nahi aaya, dobara try karo");
      }
      const list: Resource[] = Array.isArray(data)
        ? data
        : (data?.resources ?? data?.results ?? data?.links ?? []);
      return (list ?? []).filter((r) => r && r.url && r.title);
    };

    try {
      let list = await attempt();
      if (list.length === 0) list = await attempt(); // one retry
      if (list.length === 0) throw new Error("Koi result nahi mila — thoda alag shabd try karo");
      setResults(list);
    } catch (e) {
      console.error(e);
      toast.error("Search failed", {
        description: e instanceof Error ? e.message : "Try again",
      });
    } finally {
      setLoading(false);
    }
  };


  return (
    <div>
      <AppHeader
        title="Universal Finder"
        subtitle="Books · PDFs · Videos · Official sites"
      />

      <form
        onSubmit={(e) => {
          e.preventDefault();
          search(q);
        }}
        className="glass mb-3 flex items-center gap-2 rounded-2xl p-2"
      >
        <Search size={16} className="ml-2 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Kuch bhi dhundo... e.g. NEET biology notes"
          className="flex-1 bg-transparent px-1 py-2 text-sm outline-none placeholder:text-muted-foreground"
        />
        <button
          type="submit"
          disabled={loading || !q.trim()}
          className="flex h-9 items-center gap-1 rounded-xl gradient-primary px-3 text-xs font-semibold disabled:opacity-50"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : "Find"}
        </button>
      </form>

      {results.length === 0 && !loading && (
        <div className="space-y-2">
          <p className="px-1 text-[10px] uppercase tracking-wider text-muted-foreground">
            Try
          </p>
          {PRESETS.map((p) => (
            <button
              key={p}
              onClick={() => search(p)}
              className="glass w-full rounded-xl px-3 py-2.5 text-left text-xs hover:bg-white/5"
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {loading && <SkeletonList />}

      {results.length > 0 && (
        <>
          <p className="mb-2 px-1 text-[10px] text-muted-foreground">
            ⚠️ AI-suggested links — always verify with the official source.
          </p>
          <ul className="space-y-2">
            {results.map((r, i) => {
              const meta = TYPE_META[r.type] ?? TYPE_META.other;
              const Icon = meta.icon;
              return (
                <li key={i} className="glass rounded-2xl p-3">
                  <div className="flex items-start gap-3">
                    <div className={`mt-0.5 ${meta.color}`}>
                      <Icon size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold leading-snug">
                        {r.title}
                      </p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground line-clamp-2">
                        {r.description}
                      </p>
                      <div className="mt-1.5 flex items-center gap-2 text-[10px] text-muted-foreground">
                        <span className="rounded-full bg-white/10 px-2 py-0.5">
                          {meta.label}
                        </span>
                        <span className="truncate">{r.source}</span>
                      </div>
                      <div className="mt-2 flex gap-2">
                        <button
                          onClick={() =>
                            setBrowserUrl({ url: r.url, title: r.title })
                          }
                          className="flex-1 rounded-xl bg-white/10 px-3 py-1.5 text-xs font-medium hover:bg-white/15"
                        >
                          Open
                        </button>
                        <a
                          href={r.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10"
                          aria-label="Open externally"
                        >
                          <ExternalLink size={13} />
                        </a>
                        <button
                          onClick={() => {
                            add({
                              kind: "link",
                              title: r.title,
                              subtitle: r.source,
                              payload: r as unknown as Record<string, unknown>,
                            });
                            toast.success("Bookmarked");
                          }}
                          className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10"
                          aria-label="Bookmark"
                        >
                          <Bookmark size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      )}

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

function SkeletonList() {
  return (
    <ul className="space-y-2">
      {[0, 1, 2, 3].map((i) => (
        <li key={i} className="glass overflow-hidden rounded-2xl p-3">
          <div className="h-4 w-3/4 animate-shimmer rounded" />
          <div className="mt-2 h-3 w-full animate-shimmer rounded" />
          <div className="mt-1 h-3 w-2/3 animate-shimmer rounded" />
        </li>
      ))}
    </ul>
  );
}

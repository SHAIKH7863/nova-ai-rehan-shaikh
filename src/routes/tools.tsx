import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Sparkles,
  Loader2,
  Layers,
  FileText,
  Calculator,
  Map,
  ChevronLeft,
  Bookmark,
} from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { Markdown } from "@/components/markdown";
import { useBookmarks } from "@/hooks/use-bookmarks";
import { toast } from "sonner";

export const Route = createFileRoute("/tools")({
  head: () => ({
    meta: [
      { title: "Study Tools — Nova AI" },
      {
        name: "description",
        content:
          "AI flashcards, formula sheets, chapter summaries, and personalized roadmaps.",
      },
    ],
  }),
  component: ToolsPage,
});

type ToolKind = "flashcards" | "summary" | "formulas" | "roadmap";

const TOOLS: {
  key: ToolKind;
  label: string;
  desc: string;
  icon: React.ComponentType<{ size?: number }>;
  placeholder: string;
}[] = [
  {
    key: "flashcards",
    label: "Flashcards",
    desc: "AI-generated cards for quick revision",
    icon: Layers,
    placeholder: "Topic e.g. Mughal Empire, Calculus",
  },
  {
    key: "summary",
    label: "Chapter Summary",
    desc: "Key points + detailed notes",
    icon: FileText,
    placeholder: "Chapter e.g. Class 12 Electrochemistry",
  },
  {
    key: "formulas",
    label: "Formula Sheet",
    desc: "All important formulas in one place",
    icon: Calculator,
    placeholder: "Topic e.g. Trigonometry, Kinematics",
  },
  {
    key: "roadmap",
    label: "Exam Roadmap",
    desc: "Personalized prep plan",
    icon: Map,
    placeholder: "Exam + months e.g. NEET in 6 months",
  },
];

function ToolsPage() {
  const [active, setActive] = useState<ToolKind | null>(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState<any>(null);
  const { add } = useBookmarks();

  const tool = TOOLS.find((t) => t.key === active);

  const generate = async () => {
    if (!active || !input.trim()) return;
    setLoading(true);
    setOutput(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: active,
          prompt: input.trim(),
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      setOutput(await res.json());
    } catch (e) {
      toast.error("Failed", {
        description: e instanceof Error ? e.message : "Try again",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!active) {
    return (
      <div>
        <AppHeader title="AI Study Tools" subtitle="Pick your tool" />
        <ul className="space-y-3">
          {TOOLS.map((t) => {
            const Icon = t.icon;
            return (
              <li key={t.key}>
                <button
                  onClick={() => {
                    setActive(t.key);
                    setOutput(null);
                    setInput("");
                  }}
                  className="glass flex w-full items-center gap-3 rounded-2xl p-4 text-left hover:bg-white/5"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl gradient-primary shadow-[0_0_18px_-6px_var(--primary)]">
                    <Icon size={20} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{t.label}</p>
                    <p className="text-[11px] text-muted-foreground">{t.desc}</p>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    );
  }

  const Icon = tool!.icon;

  return (
    <div>
      <header className="safe-top sticky top-0 z-30 -mx-4 mb-3 px-4 pt-3">
        <div className="glass flex items-center gap-3 rounded-2xl px-3 py-2.5">
          <button
            onClick={() => {
              setActive(null);
              setOutput(null);
            }}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5"
          >
            <ChevronLeft size={16} />
          </button>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-primary">
            <Icon size={16} />
          </div>
          <div>
            <p className="text-sm font-semibold">{tool!.label}</p>
            <p className="text-[10px] text-muted-foreground">{tool!.desc}</p>
          </div>
        </div>
      </header>

      <div className="glass mb-3 rounded-2xl p-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={tool!.placeholder}
          className="w-full rounded-xl bg-input/60 px-3 py-2.5 text-sm outline-none ring-1 ring-white/10 focus:ring-primary"
        />
        <button
          onClick={generate}
          disabled={loading || !input.trim()}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl gradient-primary px-4 py-3 text-sm font-semibold shadow-[0_0_24px_-8px_var(--primary)] disabled:opacity-50"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
          {loading ? "Generating..." : "Generate"}
        </button>
      </div>

      {output && (
        <div className="space-y-2">
          {active === "flashcards" && <Flashcards data={output} />}
          {active === "summary" && <SummaryView data={output} />}
          {active === "formulas" && <FormulasView data={output} />}
          {active === "roadmap" && <RoadmapView data={output} />}
          <button
            onClick={() => {
              add({
                kind: "tool",
                title: `${tool!.label} · ${input}`,
                subtitle: tool!.label,
                payload: { kind: active, input, output },
              });
              toast.success("Saved");
            }}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-white/10 px-3 py-2.5 text-xs font-semibold"
          >
            <Bookmark size={14} /> Save
          </button>
        </div>
      )}
    </div>
  );
}

function Flashcards({ data }: { data: { cards: { front: string; back: string }[] } }) {
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const card = data.cards[idx];
  if (!card) return null;
  return (
    <div>
      <div className="text-center text-[11px] text-muted-foreground mb-2">
        Card {idx + 1} / {data.cards.length}
      </div>
      <button
        onClick={() => setFlipped((v) => !v)}
        className="glass flex min-h-[200px] w-full items-center justify-center rounded-3xl p-6 text-center text-base font-medium hover:bg-white/5"
      >
        {flipped ? card.back : card.front}
      </button>
      <p className="mt-1.5 text-center text-[10px] text-muted-foreground">
        Tap to flip
      </p>
      <div className="mt-3 flex gap-2">
        <button
          onClick={() => {
            setIdx((i) => Math.max(0, i - 1));
            setFlipped(false);
          }}
          disabled={idx === 0}
          className="flex-1 rounded-xl bg-white/10 px-3 py-2.5 text-xs font-semibold disabled:opacity-30"
        >
          Previous
        </button>
        <button
          onClick={() => {
            setIdx((i) => Math.min(data.cards.length - 1, i + 1));
            setFlipped(false);
          }}
          disabled={idx >= data.cards.length - 1}
          className="flex-1 rounded-xl gradient-primary px-3 py-2.5 text-xs font-semibold disabled:opacity-30"
        >
          Next
        </button>
      </div>
    </div>
  );
}

function SummaryView({
  data,
}: {
  data: {
    title: string;
    keyPoints: string[];
    detailedNotes: string;
    importantFormulas?: string[];
  };
}) {
  return (
    <div className="glass rounded-2xl p-4">
      <p className="font-display text-base font-semibold text-gradient">
        {data.title}
      </p>
      <p className="mt-3 text-[10px] uppercase tracking-wider text-muted-foreground">
        Key Points
      </p>
      <ul className="mt-1 list-disc space-y-1 pl-5 text-sm">
        {data.keyPoints.map((p, i) => (
          <li key={i}>{p}</li>
        ))}
      </ul>
      {data.importantFormulas && data.importantFormulas.length > 0 && (
        <>
          <p className="mt-3 text-[10px] uppercase tracking-wider text-muted-foreground">
            Important Formulas
          </p>
          <ul className="mt-1 space-y-1">
            {data.importantFormulas.map((f, i) => (
              <li
                key={i}
                className="rounded-lg bg-white/5 px-2.5 py-1.5 font-mono text-xs"
              >
                {f}
              </li>
            ))}
          </ul>
        </>
      )}
      <p className="mt-3 text-[10px] uppercase tracking-wider text-muted-foreground">
        Detailed Notes
      </p>
      <div className="mt-1">
        <Markdown>{data.detailedNotes}</Markdown>
      </div>
    </div>
  );
}

function FormulasView({
  data,
}: {
  data: {
    topic: string;
    formulas: { name: string; formula: string; description: string }[];
  };
}) {
  return (
    <div className="glass rounded-2xl p-4">
      <p className="font-display text-base font-semibold text-gradient">
        {data.topic}
      </p>
      <ul className="mt-3 space-y-2">
        {data.formulas.map((f, i) => (
          <li key={i} className="rounded-xl bg-white/5 p-3">
            <p className="text-xs font-semibold">{f.name}</p>
            <p className="mt-1 rounded-lg bg-black/30 px-2.5 py-2 font-mono text-sm">
              {f.formula}
            </p>
            <p className="mt-1.5 text-[11px] text-muted-foreground">
              {f.description}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}

function RoadmapView({
  data,
}: {
  data: {
    exam: string;
    totalWeeks: number;
    phases: {
      title: string;
      weeks: string;
      focus: string;
      topics: string[];
      dailyHours: number;
    }[];
    tips: string[];
  };
}) {
  return (
    <div className="space-y-3">
      <div className="glass rounded-2xl p-4">
        <p className="font-display text-base font-semibold text-gradient">
          {data.exam}
        </p>
        <p className="text-xs text-muted-foreground">
          {data.totalWeeks} weeks plan · {data.phases.length} phases
        </p>
      </div>
      {data.phases.map((p, i) => (
        <div key={i} className="glass rounded-2xl p-3">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg gradient-primary text-xs font-bold">
              {i + 1}
            </span>
            <div>
              <p className="text-sm font-semibold">{p.title}</p>
              <p className="text-[10px] text-muted-foreground">
                {p.weeks} · {p.dailyHours}h/day
              </p>
            </div>
          </div>
          <p className="mt-2 text-xs">{p.focus}</p>
          <ul className="mt-2 flex flex-wrap gap-1">
            {p.topics.map((t, j) => (
              <li
                key={j}
                className="rounded-full bg-white/5 px-2 py-0.5 text-[10px]"
              >
                {t}
              </li>
            ))}
          </ul>
        </div>
      ))}
      <div className="glass rounded-2xl p-4">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
          Tips
        </p>
        <ul className="mt-1 list-disc space-y-1 pl-5 text-xs">
          {data.tips.map((t, i) => (
            <li key={i}>{t}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

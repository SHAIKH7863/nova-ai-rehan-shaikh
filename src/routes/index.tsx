import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Sparkles,
  MessageSquare,
  Compass,
  FileText,
  Timer,
  ChevronRight,
  Calendar,
  Flame,
} from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { useProfile, EXAMS, type ExamKey } from "@/hooks/use-profile";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Nova AI — Your Study Companion" },
      {
        name: "description",
        content:
          "AI tutor, resources, question papers and study tools for Indian competitive exams. Built by REHAN SHAIKH.",
      },
      { property: "og:title", content: "Nova AI — Your Study Companion" },
      {
        property: "og:description",
        content: "Premium AI study app for JEE, NEET, UPSC, SSC and more. Free.",
      },
    ],
  }),
  component: Dashboard,
});

const QUOTES = [
  "Padhai me thoda discipline = future me bahut sukoon. 💪",
  "Aaj ka effort, kal ka result. Keep going! ✨",
  "You don't need to be perfect — just consistent. 🚀",
  "One topic at a time. You got this. 🔥",
  "Every revision counts. Trust the process. 🌱",
];

function Dashboard() {
  const [profile, setProfile, hydrated] = useProfile();
  const nav = useNavigate();
  const [showOnboard, setShowOnboard] = useState(false);

  useEffect(() => {
    if (hydrated && !profile.onboarded) setShowOnboard(true);
  }, [hydrated, profile.onboarded]);

  const quote = useMemo(
    () => QUOTES[new Date().getDate() % QUOTES.length],
    []
  );

  const daysLeft = useMemo(() => {
    if (!profile.examDate) return null;
    const diff =
      (new Date(profile.examDate).getTime() - Date.now()) / 86400000;
    return Math.max(0, Math.ceil(diff));
  }, [profile.examDate]);

  const examMeta = EXAMS.find((e) => e.key === profile.exam);

  return (
    <div className="flex flex-col">
      <AppHeader
        title={`Hey ${profile.name || "Aspirant"} 👋`}
        subtitle={examMeta ? `${examMeta.emoji} ${examMeta.label}` : "Set your target exam"}
      />

      {/* Hero / countdown */}
      <section className="glass relative overflow-hidden rounded-3xl p-5 mb-4">
        <div className="absolute -top-12 -right-10 h-40 w-40 rounded-full gradient-aurora opacity-30 blur-3xl" />
        <div className="absolute -bottom-12 -left-10 h-40 w-40 rounded-full gradient-primary opacity-20 blur-3xl" />
        <div className="relative">
          <p className="text-xs font-medium text-muted-foreground">
            <Flame size={12} className="inline -mt-1 mr-1 text-accent" />
            Daily push
          </p>
          <p className="mt-1 text-sm leading-snug">{quote}</p>

          {daysLeft !== null ? (
            <div className="mt-4 flex items-end justify-between gap-3">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Exam Countdown
                </p>
                <p className="font-display text-4xl font-bold text-gradient leading-none">
                  {daysLeft}
                </p>
                <p className="text-xs text-muted-foreground">days left</p>
              </div>
              <button
                onClick={() => setShowOnboard(true)}
                className="rounded-xl bg-white/10 px-3 py-1.5 text-[11px] font-medium hover:bg-white/15"
              >
                <Calendar size={12} className="inline mr-1" /> Edit
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowOnboard(true)}
              className="mt-4 rounded-xl gradient-primary px-4 py-2 text-xs font-semibold"
            >
              Set exam date
            </button>
          )}
        </div>
      </section>

      {/* Quick actions */}
      <section className="grid grid-cols-2 gap-3">
        <QuickCard
          to="/chat"
          icon={MessageSquare}
          title="Ask Nova AI"
          subtitle="Doubts in any language"
          gradient
        />
        <QuickCard
          to="/resources"
          icon={Compass}
          title="Find Resources"
          subtitle="Books, PDFs, videos"
        />
        <QuickCard
          to="/papers"
          icon={FileText}
          title="Past Papers"
          subtitle="+ AI mock generator"
        />
        <QuickCard
          to="/tools"
          icon={Sparkles}
          title="AI Study Tools"
          subtitle="Flashcards & summaries"
        />
      </section>

      {/* Focus */}
      <Link
        to="/focus"
        className="glass mt-4 flex items-center gap-3 rounded-2xl p-4 hover:bg-white/5"
      >
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/20 text-accent">
          <Timer size={20} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">Focus Mode</p>
          <p className="text-xs text-muted-foreground">
            Pomodoro timer & deep work
          </p>
        </div>
        <ChevronRight size={16} className="text-muted-foreground" />
      </Link>

      <p className="mt-6 text-center text-[10px] text-muted-foreground">
        Built with 💜 by <span className="text-foreground">REHAN SHAIKH</span> · 100% free
      </p>

      {showOnboard && (
        <OnboardingSheet
          initial={profile}
          onClose={() => setShowOnboard(false)}
          onSave={(p) => {
            setProfile({ ...p, onboarded: true });
            setShowOnboard(false);
            if (!profile.onboarded) nav({ to: "/" });
          }}
        />
      )}
    </div>
  );
}

function QuickCard({
  to,
  icon: Icon,
  title,
  subtitle,
  gradient,
}: {
  to: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  subtitle: string;
  gradient?: boolean;
}) {
  return (
    <Link
      to={to}
      className="glass group relative overflow-hidden rounded-2xl p-4 transition-all hover:-translate-y-0.5 hover:bg-white/5"
    >
      <div
        className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${
          gradient
            ? "gradient-primary shadow-[0_0_24px_-6px_var(--primary)]"
            : "bg-white/5"
        }`}
      >
        <Icon size={18} />
      </div>
      <p className="text-sm font-semibold">{title}</p>
      <p className="text-[11px] text-muted-foreground">{subtitle}</p>
    </Link>
  );
}

function OnboardingSheet({
  initial,
  onClose,
  onSave,
}: {
  initial: { name: string; exam: ExamKey | null; examDate: string | null };
  onClose: () => void;
  onSave: (p: {
    name: string;
    exam: ExamKey | null;
    examDate: string | null;
    onboarded: boolean;
  }) => void;
}) {
  const [name, setName] = useState(initial.name);
  const [exam, setExam] = useState<ExamKey | null>(initial.exam);
  const [examDate, setExamDate] = useState(initial.examDate ?? "");

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center">
      <div className="glass-strong w-full max-w-md rounded-t-3xl border-t border-white/10 p-5 sm:rounded-3xl safe-bottom">
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-white/20" />
        <h2 className="font-display text-xl font-semibold text-gradient">
          Welcome to Nova AI
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Built by REHAN SHAIKH. Personalize karte hain.
        </p>

        <label className="mt-4 block text-xs font-medium text-muted-foreground">
          Your name
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Rehan"
          className="mt-1 w-full rounded-xl bg-input/60 px-3 py-2.5 text-sm outline-none ring-1 ring-white/10 focus:ring-primary"
        />

        <label className="mt-3 block text-xs font-medium text-muted-foreground">
          Target exam
        </label>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {EXAMS.map((e) => (
            <button
              key={e.key}
              onClick={() => setExam(e.key)}
              className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-left text-xs transition-all ${
                exam === e.key
                  ? "border-primary/60 bg-primary/15 shadow-[0_0_18px_-6px_var(--primary)]"
                  : "border-white/10 bg-white/5"
              }`}
            >
              <span>{e.emoji}</span>
              <span className="truncate">{e.label}</span>
            </button>
          ))}
        </div>

        <label className="mt-3 block text-xs font-medium text-muted-foreground">
          Exam date (optional)
        </label>
        <input
          type="date"
          value={examDate}
          onChange={(e) => setExamDate(e.target.value)}
          className="mt-1 w-full rounded-xl bg-input/60 px-3 py-2.5 text-sm outline-none ring-1 ring-white/10 focus:ring-primary [color-scheme:dark]"
        />

        <div className="mt-5 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl bg-white/10 px-4 py-3 text-sm font-semibold"
          >
            Skip
          </button>
          <button
            onClick={() =>
              onSave({
                name: name.trim(),
                exam,
                examDate: examDate || null,
                onboarded: true,
              })
            }
            className="flex-1 rounded-xl gradient-primary px-4 py-3 text-sm font-semibold shadow-[0_0_28px_-8px_var(--primary)]"
          >
            Let's go
          </button>
        </div>
      </div>
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { User2, Trash2, Heart } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { useProfile, EXAMS, type ExamKey } from "@/hooks/use-profile";
import { toast } from "sonner";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Profile — Nova AI" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const [profile, setProfile] = useProfile();
  const [name, setName] = useState(profile.name);
  const [exam, setExam] = useState<ExamKey | null>(profile.exam);
  const [examDate, setExamDate] = useState(profile.examDate ?? "");

  const save = () => {
    setProfile({
      name: name.trim(),
      exam,
      examDate: examDate || null,
      onboarded: true,
    });
    toast.success("Saved");
  };

  const wipe = () => {
    if (!confirm("Clear ALL local data (chats, bookmarks, profile)?")) return;
    [
      "nova:profile",
      "nova:threads",
      "nova:bookmarks",
    ].forEach((k) => localStorage.removeItem(k));
    location.href = "/";
  };

  return (
    <div>
      <AppHeader title="Profile" subtitle="Your study identity" />

      <div className="glass rounded-3xl p-5 text-center">
        <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-3xl gradient-primary shadow-[0_0_32px_-8px_var(--primary)]">
          <User2 size={28} />
        </div>
        <p className="font-display text-lg font-semibold">{profile.name || "Aspirant"}</p>
        <p className="text-xs text-muted-foreground">
          {profile.exam ? EXAMS.find((e) => e.key === profile.exam)?.label : "No exam set"}
        </p>
      </div>

      <div className="glass mt-3 rounded-2xl p-4 space-y-3">
        <div>
          <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-xl bg-input/60 px-3 py-2.5 text-sm outline-none ring-1 ring-white/10 focus:ring-primary"
          />
        </div>
        <div>
          <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Target exam</label>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {EXAMS.map((e) => (
              <button
                key={e.key}
                onClick={() => setExam(e.key)}
                className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-left text-xs ${
                  exam === e.key
                    ? "border-primary/60 bg-primary/15"
                    : "border-white/10 bg-white/5"
                }`}
              >
                <span>{e.emoji}</span>
                <span className="truncate">{e.label}</span>
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Exam date</label>
          <input
            type="date"
            value={examDate}
            onChange={(e) => setExamDate(e.target.value)}
            className="mt-1 w-full rounded-xl bg-input/60 px-3 py-2.5 text-sm outline-none ring-1 ring-white/10 focus:ring-primary [color-scheme:dark]"
          />
        </div>
        <button
          onClick={save}
          className="w-full rounded-xl gradient-primary px-4 py-3 text-sm font-semibold shadow-[0_0_24px_-8px_var(--primary)]"
        >
          Save
        </button>
      </div>

      <button
        onClick={wipe}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-xs font-semibold text-destructive"
      >
        <Trash2 size={14} /> Clear all data
      </button>

      <p className="mt-6 flex items-center justify-center gap-1 text-center text-[11px] text-muted-foreground">
        Made with <Heart size={11} className="text-primary fill-primary" /> by REHAN SHAIKH
      </p>
      <p className="mt-1 text-center text-[10px] text-muted-foreground">
        Nova AI · 100% free · No subscriptions
      </p>
    </div>
  );
}

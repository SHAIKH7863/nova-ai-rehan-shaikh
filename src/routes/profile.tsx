import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { User2, Trash2, Heart, Brain, Loader2 } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { useProfile, EXAMS, type ExamKey } from "@/hooks/use-profile";
import { toast } from "sonner";
import { useCloudAuth } from "@/hooks/use-cloud-auth";
import { getMyMemories, saveMemory } from "@/lib/account.functions";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Profile — Nova AI" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user, profile: cloudProfile } = useCloudAuth();
  const getMemoriesFn = useServerFn(getMyMemories);
  const saveMemoryFn = useServerFn(saveMemory);
  const [memories, setMemories] = useState<Array<{ memory: string; is_private: boolean }>>([]);
  const [memoriesLoading, setMemoriesLoading] = useState(false);
  const [newMemory, setNewMemory] = useState("");
  const [profile, setProfile] = useProfile();
  const [name, setName] = useState(profile.name);
  const [exam, setExam] = useState<ExamKey | null>(profile.exam);
  const [examDate, setExamDate] = useState(profile.examDate ?? "");

  useEffect(() => {
    if (!user) {
      setMemories([]);
      return;
    }
    setMemoriesLoading(true);
    void getMemoriesFn()
      .then((items) => setMemories(items))
      .catch(() => toast.error("Memories load nahi ho paayi"))
      .finally(() => setMemoriesLoading(false));
  }, [getMemoriesFn, user]);

  const addMemory = () => {
    const value = newMemory.trim();
    if (!value || !user) return;
    void saveMemoryFn({ memory: value, isPrivate: true })
      .then(() => {
        setMemories((current) => [{ memory: value, is_private: true }, ...current]);
        setNewMemory("");
        toast.success("Private memory save ho gayi");
      })
      .catch(() => toast.error("Memory save nahi ho paayi"));
  };

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
      "nova:threads:guest",
      "nova:bookmarks",
    ].forEach((k) => localStorage.removeItem(k));
    location.href = "/";
  };

  return (
    <div>
      <AppHeader title="Profile" subtitle={user ? `Signed in as ${cloudProfile?.username ?? "student"}` : "Your study identity"} />

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

      {user && (
        <section className="glass mt-3 rounded-2xl p-4">
          <div className="flex items-center gap-2">
            <Brain size={16} className="text-primary" />
            <div>
              <h2 className="text-sm font-semibold">Nova ki private memory</h2>
              <p className="text-[11px] text-muted-foreground">Sirf tumhare account ke liye saved baatein.</p>
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            <input
              value={newMemory}
              onChange={(e) => setNewMemory(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") addMemory(); }}
              placeholder="Nova ko kya yaad rakhna chahiye?"
              className="min-w-0 flex-1 rounded-xl bg-input/60 px-3 py-2.5 text-xs outline-none ring-1 ring-white/10 focus:ring-primary"
            />
            <button onClick={addMemory} disabled={!newMemory.trim()} className="rounded-xl gradient-primary px-3 text-xs font-semibold disabled:opacity-40">Save</button>
          </div>
          {memoriesLoading ? (
            <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground"><Loader2 size={14} className="animate-spin" /> Loading memories…</div>
          ) : memories.length ? (
            <ul className="mt-3 space-y-2">
              {memories.map((item, index) => <li key={`${item.memory}-${index}`} className="rounded-xl bg-white/5 px-3 py-2 text-xs leading-relaxed">🧠 {item.memory}</li>)}
            </ul>
          ) : (
            <p className="mt-3 text-xs text-muted-foreground">Abhi koi memory saved nahi hai.</p>
          )}
        </section>
      )}

      <p className="mt-6 flex items-center justify-center gap-1 text-center text-[11px] text-muted-foreground">
        Made with <Heart size={11} className="text-primary fill-primary" /> for students
      </p>
      <p className="mt-1 text-center text-[10px] text-muted-foreground">
        Nova AI · 100% free · No subscriptions
      </p>
    </div>
  );
}

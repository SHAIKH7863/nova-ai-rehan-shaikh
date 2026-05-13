import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Play, Pause, RotateCcw, X } from "lucide-react";

export const Route = createFileRoute("/focus")({
  head: () => ({ meta: [{ title: "Focus Mode — Nova AI" }] }),
  component: FocusPage,
});

const PRESETS = [
  { label: "25 / 5", work: 25, brk: 5 },
  { label: "50 / 10", work: 50, brk: 10 },
  { label: "90 / 20", work: 90, brk: 20 },
];

function FocusPage() {
  const nav = useNavigate();
  const [preset, setPreset] = useState(PRESETS[0]);
  const [mode, setMode] = useState<"work" | "break">("work");
  const [secs, setSecs] = useState(PRESETS[0].work * 60);
  const [running, setRunning] = useState(false);
  const [completed, setCompleted] = useState(0);
  const intRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!running) return;
    intRef.current = setInterval(() => {
      setSecs((s) => {
        if (s <= 1) {
          if (mode === "work") {
            setCompleted((c) => c + 1);
            setMode("break");
            return preset.brk * 60;
          } else {
            setMode("work");
            return preset.work * 60;
          }
        }
        return s - 1;
      });
    }, 1000);
    return () => {
      if (intRef.current) clearInterval(intRef.current);
    };
  }, [running, mode, preset]);

  const reset = () => {
    setRunning(false);
    setMode("work");
    setSecs(preset.work * 60);
  };

  const mm = String(Math.floor(secs / 60)).padStart(2, "0");
  const ss = String(secs % 60).padStart(2, "0");
  const total = (mode === "work" ? preset.work : preset.brk) * 60;
  const progress = 1 - secs / total;

  return (
    <div className="fixed inset-0 z-40 flex flex-col items-center justify-center bg-background p-6">
      <button
        onClick={() => nav({ to: "/" })}
        className="absolute top-5 right-5 flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 safe-top"
      >
        <X size={18} />
      </button>

      <p className="font-display text-sm uppercase tracking-[0.3em] text-muted-foreground">
        {mode === "work" ? "Deep Work" : "Break"}
      </p>

      <div className="relative my-6 flex h-64 w-64 items-center justify-center">
        <svg viewBox="0 0 100 100" className="absolute inset-0 -rotate-90">
          <circle cx="50" cy="50" r="46" stroke="oklch(1 0 0 / 0.08)" strokeWidth="6" fill="none" />
          <circle
            cx="50"
            cy="50"
            r="46"
            stroke="url(#grad)"
            strokeWidth="6"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 46}
            strokeDashoffset={2 * Math.PI * 46 * (1 - progress)}
            style={{ transition: "stroke-dashoffset 1s linear" }}
          />
          <defs>
            <linearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="oklch(0.65 0.27 295)" />
              <stop offset="100%" stopColor="oklch(0.7 0.22 240)" />
            </linearGradient>
          </defs>
        </svg>
        <div className="text-center">
          <p className="font-display text-6xl font-bold tabular-nums text-gradient">
            {mm}:{ss}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Sessions: {completed}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={reset}
          className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10"
        >
          <RotateCcw size={18} />
        </button>
        <button
          onClick={() => setRunning((r) => !r)}
          className="flex h-16 w-16 items-center justify-center rounded-3xl gradient-primary shadow-[0_0_32px_-8px_var(--primary)]"
        >
          {running ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
        </button>
        <div className="w-12" />
      </div>

      <div className="mt-8 flex gap-2">
        {PRESETS.map((p) => (
          <button
            key={p.label}
            onClick={() => {
              setPreset(p);
              setMode("work");
              setSecs(p.work * 60);
              setRunning(false);
            }}
            className={`rounded-xl border px-4 py-2 text-xs ${
              preset.label === p.label
                ? "border-primary/60 bg-primary/15"
                : "border-white/10 bg-white/5 text-muted-foreground"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );
}

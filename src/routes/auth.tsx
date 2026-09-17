import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Eye, EyeOff, LockKeyhole, Sparkles, UserRound } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in to Nova AI" },
      { name: "description", content: "Sign in to keep your Nova AI chats and private memories synced." },
      { property: "og:title", content: "Sign in to Nova AI" },
      { property: "og:description", content: "Keep your Nova AI chats and private memories synced." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);

  const emailFor = (value: string) => `${value.trim().toLowerCase().replace(/[^a-z0-9._-]/g, "-")}@nova.local`;

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const cleanUsername = username.trim().toLowerCase();
    if (cleanUsername.length < 3 || password.length < 6) {
      toast.error("Username 3+ characters aur password 6+ characters hona chahiye.");
      return;
    }
    setBusy(true);
    try {
      const email = emailFor(cleanUsername);
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        if (!data.user) throw new Error("Account create nahi ho paaya.");
        const { error: profileError } = await supabase.from("profiles").insert({
          id: data.user.id,
          username: cleanUsername,
          display_name: displayName.trim(),
          is_owner: cleanUsername === "shaikhrehanshaikh475",
        });
        if (profileError) throw profileError;
        toast.success("Account ready — Nova tumhari chats yaad rakhega. ✨");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back! Assalamualaikum 🌙");
      }
      navigate({ to: "/" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Sign in failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center py-8">
      <div className="w-full space-y-5">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl gradient-primary shadow-[0_0_35px_-8px_var(--primary)]">
            <Sparkles size={28} />
          </div>
          <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Nova AI</p>
          <h1 className="mt-1 font-display text-2xl font-bold text-gradient">Your private study space</h1>
          <p className="mt-2 text-sm text-muted-foreground">Chats, memories aur progress — sirf tumhare account ke liye.</p>
        </div>

        <form onSubmit={submit} className="glass space-y-4 rounded-3xl border border-white/10 p-5">
          {mode === "signup" && (
            <label className="block">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Display name</span>
              <div className="mt-1 flex items-center gap-2 rounded-xl bg-input/60 px-3 ring-1 ring-white/10 focus-within:ring-primary">
                <UserRound size={15} className="text-muted-foreground" />
                <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="w-full bg-transparent py-3 text-sm outline-none" placeholder="What should Nova call you?" />
              </div>
            </label>
          )}
          <label className="block">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Username</span>
            <div className="mt-1 flex items-center gap-2 rounded-xl bg-input/60 px-3 ring-1 ring-white/10 focus-within:ring-primary">
              <UserRound size={15} className="text-muted-foreground" />
              <input required autoComplete="username" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full bg-transparent py-3 text-sm outline-none" placeholder="your name" />
            </div>
          </label>
          <label className="block">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Password</span>
            <div className="mt-1 flex items-center gap-2 rounded-xl bg-input/60 px-3 ring-1 ring-white/10 focus-within:ring-primary">
              <LockKeyhole size={15} className="text-muted-foreground" />
              <input required minLength={6} type={showPassword ? "text" : "password"} autoComplete={mode === "signin" ? "current-password" : "new-password"} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-transparent py-3 text-sm outline-none" placeholder="6+ characters" />
              <button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Hide password" : "Show password"} className="text-muted-foreground">
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </label>
          <button disabled={busy} className="w-full rounded-xl gradient-primary px-4 py-3 font-semibold disabled:opacity-50">
            {busy ? "Please wait…" : mode === "signin" ? "Sign in to Nova" : "Create private account"}
          </button>
        </form>

        <button onClick={() => setMode((value) => value === "signin" ? "signup" : "signin")} className="w-full text-center text-xs text-muted-foreground hover:text-foreground">
          {mode === "signin" ? "New here? Create an account" : "Already have an account? Sign in"}
        </button>
        <Link to="/" className="block text-center text-xs text-muted-foreground hover:text-foreground">Continue without signing in</Link>
      </div>
    </main>
  );
}

import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Send, Sparkles, Star, Loader2, Mic, Link2, BookOpen, FileText, Brain, Calculator, Map as MapIcon, ListChecks, Lightbulb, Download, Copy, Share2, Volume2, VolumeX, Feather } from "lucide-react";
import { Markdown, cleanAiText } from "@/components/markdown";
import { useThreads, type ChatThread } from "@/hooks/use-threads";
import { toast } from "sonner";
import { downloadTextAsPdf } from "@/lib/pdf";
const NOVA_SECRET_CODE = "nova-boss-786";


export const Route = createFileRoute("/chat/$threadId")({
  head: () => ({
    meta: [{ title: "Nova AI Chat" }],
  }),
  component: ChatPage,
});

const SUGGESTIONS = [
  { icon: "⚡", text: "Newton's laws ko real-life example se samjhao" },
  { icon: "🌹", text: "Chai aur baarish par ek shayari sunao" },
  { icon: "🎯", text: "JEE Main 2025 ke best free resources aur PDFs do" },
  { icon: "💔", text: "Judaai par Faraz ke andaz me 2 sher likho" },
  { icon: "🗺️", text: "6 months me NEET crack karne ka week-wise roadmap" },
  { icon: "🔥", text: "Aaj ka motivation chahiye — exam stress ho raha hai" },
];

const BOSS_SUGGESTIONS = [
  { icon: "🌹", text: "Mere mood par ek gehri shayari likho" },
  { icon: "👑", text: "Aaj ka full study plan bana do, Boss style" },
  { icon: "💎", text: "Koi zabardast idea do jo main build kar saku" },
  { icon: "📚", text: "Kisi bhi topic ke complete notes + PDF links do" },
  { icon: "🕊️", text: "Dosti par Ghalib ke andaz me sher sunao" },
  { icon: "🚀", text: "Meri productivity 10x kaise karu?" },
];


function greeting() {
  const h = new Date().getHours();
  if (h < 5) return "Late night grind? 🌙";
  if (h < 12) return "Good morning, champ! ☀️";
  if (h < 17) return "Afternoon focus mode 🎯";
  if (h < 21) return "Evening study session? 🌆";
  return "Night owl mode 🦉";
}

function ChatPage() {
  const { threadId } = Route.useParams();
  const { threads, upsert, toggleBookmark } = useThreads();
  const nav = useNavigate();
  const existing = useMemo(
    () => threads.find((t) => t.id === threadId),
    [threads, threadId]
  );

  const initialMessages = existing?.messages ?? [];
  const initialTitle = existing?.title ?? "New chat";
  const titleSet = useRef(!!existing);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const [boss, setBoss] = useState(false);
  const [greet, setGreet] = useState("");
  useEffect(() => {
    setBoss(localStorage.getItem("nova-boss") === "1");
    setGreet(greeting());
  }, []);

  const transport = useMemo(
    () => new DefaultChatTransport({ api: "/api/chat", body: { boss } }),
    [boss]
  );


  const { messages, sendMessage, status, error } = useChat({
    id: threadId,
    messages: initialMessages,
    transport,
    onError: (e) => {
      console.error(e);
      toast.error("AI request failed", { description: e.message });
    },
  });

  // Persist messages to localStorage
  useEffect(() => {
    if (messages.length === 0) return;
    let title = existing?.title ?? "";
    if (!titleSet.current && messages.length >= 1) {
      const first = messages.find((m) => m.role === "user");
      if (first) {
        const text = msgText(first).slice(0, 60);
        title = text || "New chat";
        titleSet.current = true;
      }
    }
    const thread: ChatThread = {
      id: threadId,
      title: title || initialTitle,
      bookmarked: existing?.bookmarked ?? false,
      messages,
      updatedAt: Date.now(),
    };
    upsert(thread);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);

  // Autoscroll
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, status]);

  // Keep textarea focused
  useEffect(() => {
    inputRef.current?.focus();
  }, [threadId]);
  useEffect(() => {
    if (status === "ready") inputRef.current?.focus();
  }, [status]);

  const isLoading = status === "submitted" || status === "streaming";

  const send = (text: string) => {
    const t = text.trim();
    if (!t || isLoading) return;
    if (t.toLowerCase() === NOVA_SECRET_CODE) {
      localStorage.setItem("nova-boss", "1");
      setBoss(true);
      setInput("");
      toast.success("👑 Boss Mode unlocked!", {
        description: "Nova ab full power me hai — kuch bhi maango, sab milega.",
      });
      return;
    }
    sendMessage({ text: t });
    setInput("");
  };


  // Voice input (Web Speech API)
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const startVoice = () => {
    const SR =
      (typeof window !== "undefined" &&
        ((window as any).SpeechRecognition ||
          (window as any).webkitSpeechRecognition)) ||
      null;
    if (!SR) {
      toast.error("Voice input not supported on this browser");
      return;
    }
    if (listening) {
      recognitionRef.current?.stop();
      return;
    }
    const r = new SR();
    r.lang = "en-IN";
    r.continuous = false;
    r.interimResults = true;
    r.onresult = (e: any) => {
      const transcript = Array.from(e.results)
        .map((res: any) => res[0].transcript)
        .join("");
      setInput(transcript);
    };
    r.onend = () => setListening(false);
    recognitionRef.current = r;
    r.start();
    setListening(true);
  };

  return (
    <div className={`flex min-h-screen flex-col -mx-4 px-4 ${boss ? "boss-mode" : ""}`}>
      {boss && (
        <div
          aria-hidden
          className="pointer-events-none fixed inset-0 -z-10 opacity-30 blur-3xl"
          style={{
            background:
              "radial-gradient(60% 40% at 20% 0%, #f5c76e55, transparent), radial-gradient(50% 40% at 90% 20%, #a855f755, transparent)",
          }}
        />
      )}
      <header className="safe-top sticky top-0 z-30 -mx-4 mb-2 px-4 pt-3">
        <div
          className={`glass flex items-center gap-2 rounded-2xl border px-3 py-2.5 ${
            boss ? "border-amber-300/40 shadow-[0_0_28px_-12px_#f5c76e]" : "border-white/10"
          }`}
        >
          <button
            onClick={() => nav({ to: "/chat" })}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5"
            aria-label="Back"
          >
            <ArrowLeft size={16} />
          </button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">
              {existing?.title || "New chat"}
            </p>
            <p className="text-[10px] text-muted-foreground">
              {boss ? (
                <span className="text-amber-300">👑 Nova Boss Mode · Rehan bhai ke liye</span>
              ) : (
                <>
                  <Sparkles size={10} className="inline -mt-0.5 mr-0.5" /> Nova AI · any language
                </>
              )}
            </p>
          </div>
          {existing && (
            <button
              onClick={() => toggleBookmark(threadId)}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5"
              aria-label="Bookmark"
            >
              <Star
                size={14}
                fill={existing.bookmarked ? "currentColor" : "none"}
                className={existing.bookmarked ? "text-accent" : ""}
              />
            </button>
          )}
        </div>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto pb-4">
        {messages.length === 0 && (
          <div className="mt-4 space-y-3">
            <div
              className={`glass rounded-3xl p-5 text-center relative overflow-hidden ${
                boss ? "border border-amber-300/30" : ""
              }`}
            >
              <div className="absolute inset-0 -z-10 opacity-40 blur-2xl gradient-aurora" />
              <div
                className={`mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl animate-pulse-glow ${
                  boss ? "bg-amber-400/20 text-amber-300 text-2xl" : "gradient-primary"
                }`}
              >
                {boss ? "👑" : <Sparkles size={22} />}
              </div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                {greet || "\u00a0"}
              </p>
              <p
                className={`font-display text-lg font-semibold mt-1 ${
                  boss ? "text-amber-300" : "text-gradient"
                }`}
              >
                {boss ? "Assalamualaikum Boss 👑" : "Main Nova hu 💜"}
              </p>
              <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
                {boss
                  ? "Rehan bhai (ya unka yaar) — jo bolo wahi hazir. Shayari, notes, links, PDFs, ideas — sab full power me. 💎"
                  : "Tumhara personal study buddy. Koi bhi sawaal, koi bhi bhasha — bas pucho. Concepts, notes, PDFs, shayari, roadmap — sab milega yahi. ✨"}
              </p>
            </div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground px-1 pt-1">
              ✦ Try asking
            </p>
            <div className="flex flex-col gap-2">
              {(boss ? BOSS_SUGGESTIONS : SUGGESTIONS).map((s) => (
                <button
                  key={s.text}
                  onClick={() => send(s.text)}
                  className={`glass group flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs transition-all hover:bg-white/10 ${
                    boss ? "border border-amber-300/20 hover:border-amber-300/50" : "hover:border-primary/30"
                  }`}
                >
                  <span className="text-base">{s.icon}</span>
                  <span className="flex-1">{s.text}</span>
                  <span className={`opacity-0 group-hover:opacity-100 transition-opacity ${boss ? "text-amber-300" : "text-primary"}`}>→</span>
                </button>
              ))}
            </div>
          </div>
        )}


        <div className="space-y-3 pt-2">
          {messages.map((m) => (
            <MessageBubble key={m.id} message={m} />
          ))}
          {isLoading && (
            <div className="flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground">
              <Loader2 size={14} className="animate-spin" />
              <span>Nova soch raha hai...</span>
            </div>
          )}
          {error && (
            <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive">
              {error.message}
            </div>
          )}
        </div>
      </div>

      <ToolChips
        disabled={isLoading}
        onPick={(prefix) => {
          setInput((cur) => (cur.trim() ? `${prefix}: ${cur.trim()}` : `${prefix}: `));
          inputRef.current?.focus();
        }}
      />

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="sticky bottom-3 -mx-1 z-30 mt-2"
      >
        <div className="glass-strong flex items-end gap-2 rounded-2xl border border-white/10 p-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send(input);
              }
            }}
            placeholder="Pucho kuch bhi..."
            rows={1}
            className="max-h-32 min-h-[40px] flex-1 resize-none bg-transparent px-2 py-2 text-sm outline-none placeholder:text-muted-foreground"
          />
          <button
            type="button"
            onClick={startVoice}
            className={`flex h-10 w-10 items-center justify-center rounded-xl ${
              listening ? "bg-destructive/30 text-destructive" : "bg-white/10"
            }`}
            aria-label="Voice input"
          >
            <Mic size={16} />
          </button>
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary shadow-[0_0_20px_-6px_var(--primary)] disabled:opacity-40"
            aria-label="Send"
          >
            <Send size={16} />
          </button>
        </div>
      </form>
    </div>
  );
}

function msgText(m: UIMessage): string {
  return m.parts
    .map((p) => (p.type === "text" ? p.text : ""))
    .join("")
    .trim();
}

/** Strip markdown/URLs so the voice reads only the actual content. */
function speakableText(t: string): string {
  return cleanAiText(t)
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/\[([^\]]+)\]\((https?:[^)]+)\)/g, "$1")
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/[#*_>`|]/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}


function MessageBubble({ message }: { message: UIMessage }) {
  const isUser = message.role === "user";
  const text = cleanAiText(msgText(message));
  const [speaking, setSpeaking] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied");
    } catch {
      toast.error("Copy failed");
    }
  };

  const pdf = () => {
    const title = text.split("\n")[0].slice(0, 80) || "Nova AI Notes";
    downloadTextAsPdf(title, text);
    toast.success("PDF downloaded");
  };

  const share = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: "Nova AI", text });
      } catch {
        /* user cancelled */
      }
    } else {
      copy();
    }
  };

  const stopSpeak = () => {
    audioRef.current?.pause();
    audioRef.current = null;
    if (typeof window !== "undefined" && "speechSynthesis" in window)
      window.speechSynthesis.cancel();
    setSpeaking(false);
  };

  const browserSpeak = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      toast.error("Speech not supported");
      return;
    }
    const u = new SpeechSynthesisUtterance(speakableText(text));
    u.lang = "hi-IN";
    u.onend = () => setSpeaking(false);
    u.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(u);
    setSpeaking(true);
  };

  const speak = async () => {
    if (speaking) {
      stopSpeak();
      return;
    }
    setSpeaking(true);
    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: speakableText(text) }),
      });
      if (!res.ok) throw new Error(await res.text().catch(() => "tts failed"));
      const blob = await res.blob();
      const audio = new Audio(URL.createObjectURL(blob));
      audioRef.current = audio;
      audio.onended = () => setSpeaking(false);
      audio.onerror = () => setSpeaking(false);
      await audio.play();
    } catch {
      // Gemini voice unavailable — fall back to device voice
      browserSpeak();
    }
  };


  return (
    <div className={`flex flex-col gap-1 ${isUser ? "items-end" : "items-start"}`}>
      <div
        className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-sm ${
          isUser
            ? "gradient-primary shadow-[0_0_20px_-8px_var(--primary)] text-primary-foreground"
            : "glass"
        }`}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap leading-relaxed">{text}</p>
        ) : (
          <Markdown>{text}</Markdown>
        )}
      </div>
      {!isUser && text.length > 0 && (
        <div className="flex items-center gap-1 px-1">
          <ActionBtn onClick={copy} label="Copy"><Copy size={12} /></ActionBtn>
          <ActionBtn onClick={pdf} label="PDF"><Download size={12} /> PDF</ActionBtn>
          <ActionBtn onClick={speak} label="Listen">
            {speaking ? <VolumeX size={12} /> : <Volume2 size={12} />}
          </ActionBtn>
          <ActionBtn onClick={share} label="Share"><Share2 size={12} /></ActionBtn>
        </div>
      )}
    </div>
  );
}

function ActionBtn({
  onClick,
  label,
  children,
}: {
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="flex items-center gap-1 rounded-full bg-white/5 px-2 py-1 text-[10px] text-muted-foreground hover:bg-white/10 hover:text-foreground"
    >
      {children}
    </button>
  );
}

const TOOLS: { label: string; prefix: string; icon: React.ComponentType<{ size?: number }> }[] = [
  { label: "Resources", prefix: "Find best resources (PDFs, YouTube, official links, books) for", icon: Link2 },
  { label: "Notes", prefix: "Detailed study notes with key points and examples for", icon: BookOpen },
  { label: "Summary", prefix: "Short crisp summary with bullet points for", icon: FileText },
  { label: "Flashcards", prefix: "Create 10 Q&A style flashcards for", icon: Brain },
  { label: "Formulas", prefix: "List all important formulas with brief explanation for", icon: Calculator },
  { label: "Mock Qs", prefix: "Generate 10 MCQs with answers and explanations on", icon: ListChecks },
  { label: "Roadmap", prefix: "Make a week-by-week study roadmap for", icon: MapIcon },
  { label: "Doubt", prefix: "Solve this doubt step-by-step in simple language", icon: Lightbulb },
];

function ToolChips({
  onPick,
  disabled,
}: {
  onPick: (prefix: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className="-mx-4 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="flex gap-2 w-max">
        {TOOLS.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.label}
              type="button"
              disabled={disabled}
              onClick={() => onPick(t.prefix)}
              className="glass flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1.5 text-[11px] font-medium hover:bg-white/10 disabled:opacity-40"
            >
              <Icon size={12} />
              {t.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

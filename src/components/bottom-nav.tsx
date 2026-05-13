import { Link, useLocation } from "@tanstack/react-router";
import {
  Home,
  MessageSquare,
  Compass,
  FileText,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { to: "/", label: "Home", icon: Home },
  { to: "/chat", label: "Chat", icon: MessageSquare },
  { to: "/resources", label: "Find", icon: Compass },
  { to: "/papers", label: "Papers", icon: FileText },
  { to: "/tools", label: "Tools", icon: Sparkles },
] as const;

export function BottomNav() {
  const { pathname } = useLocation();

  return (
    <nav className="fixed bottom-0 left-1/2 z-40 w-full max-w-md -translate-x-1/2 safe-bottom">
      <div className="glass-strong mx-3 mb-3 rounded-3xl border border-white/10 px-2 py-2 shadow-card">
        <ul className="flex items-center justify-between">
          {tabs.map((t) => {
            const active =
              t.to === "/"
                ? pathname === "/"
                : pathname === t.to || pathname.startsWith(t.to + "/");
            const Icon = t.icon;
            return (
              <li key={t.to} className="flex-1">
                <Link
                  to={t.to}
                  className={cn(
                    "flex flex-col items-center gap-0.5 rounded-2xl py-2 text-[10px] font-medium transition-all",
                    active
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <span
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-xl transition-all",
                      active &&
                        "gradient-primary shadow-[0_0_20px_-4px_var(--primary)]"
                    )}
                  >
                    <Icon className="h-4.5 w-4.5" size={18} />
                  </span>
                  <span>{t.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}

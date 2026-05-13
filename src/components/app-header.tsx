import { Link } from "@tanstack/react-router";
import { Bookmark, User2 } from "lucide-react";

export function AppHeader({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}) {
  return (
    <header className="safe-top sticky top-0 z-30 -mx-4 mb-3 px-4 pt-3">
      <div className="glass flex items-center gap-3 rounded-2xl border border-white/10 px-4 py-3">
        <div className="flex-1 min-w-0">
          <h1 className="text-base font-display font-semibold leading-tight truncate">
            {title}
          </h1>
          {subtitle && (
            <p className="text-[11px] text-muted-foreground truncate">
              {subtitle}
            </p>
          )}
        </div>
        <div className="flex items-center gap-1">
          {right}
          <Link
            to="/bookmarks"
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 text-foreground/80 hover:bg-white/10"
            aria-label="Bookmarks"
          >
            <Bookmark size={16} />
          </Link>
          <Link
            to="/profile"
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 text-foreground/80 hover:bg-white/10"
            aria-label="Profile"
          >
            <User2 size={16} />
          </Link>
        </div>
      </div>
    </header>
  );
}

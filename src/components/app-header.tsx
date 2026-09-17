import { Link, useNavigate } from "@tanstack/react-router";
import { Bookmark, LogIn, LogOut, User2 } from "lucide-react";
import { useCloudAuth } from "@/hooks/use-cloud-auth";

export function AppHeader({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}) {
  const { user, profile, signOut } = useCloudAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: "/auth", replace: true });
  };

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
          {user ? (
            <button
              onClick={() => void handleSignOut()}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 text-foreground/80 hover:bg-white/10"
              aria-label={`Sign out ${profile?.display_name || profile?.username || "account"}`}
            >
              <LogOut size={16} />
            </button>
          ) : (
            <Link
              to="/auth"
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 text-foreground/80 hover:bg-white/10"
              aria-label="Sign in"
            >
              <LogIn size={16} />
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

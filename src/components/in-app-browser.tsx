import { useEffect, useRef, useState } from "react";
import { ExternalLink, X, Loader2, AlertTriangle } from "lucide-react";

export function InAppBrowser({
  url,
  title,
  onClose,
}: {
  url: string;
  title?: string;
  onClose: () => void;
}) {
  const [status, setStatus] = useState<"loading" | "ok" | "blocked">("loading");
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Many sites (YouTube watch pages, Google, most .gov.in, NTA, etc.) send
  // X-Frame-Options: DENY / CSP frame-ancestors and silently fail to load
  // in an iframe. We can't reliably detect that from JS, so after a short
  // timeout if `load` never fired we mark as blocked and prompt the user to
  // open the link in a new tab.
  useEffect(() => {
    const t = setTimeout(() => {
      setStatus((s) => (s === "loading" ? "blocked" : s));
    }, 3500);
    return () => clearTimeout(t);
  }, [url]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      <div className="glass-strong flex items-center gap-2 border-b border-white/10 px-3 py-3 safe-top">
        <button
          onClick={onClose}
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5"
          aria-label="Close"
        >
          <X size={18} />
        </button>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{title ?? "Resource"}</p>
          <p className="truncate text-[10px] text-muted-foreground">{url}</p>
        </div>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-9 items-center gap-1 rounded-xl gradient-primary px-3 text-xs font-semibold"
          aria-label="Open externally"
        >
          <ExternalLink size={14} /> Open
        </a>
      </div>

      <div className="relative flex-1 bg-white">
        {status !== "blocked" && (
          <iframe
            ref={iframeRef}
            src={url}
            title={title ?? url}
            className="h-full w-full border-0"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            onLoad={() => setStatus("ok")}
          />
        )}

        {status === "loading" && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-white/80">
            <div className="flex items-center gap-2 rounded-full bg-background px-3 py-1.5 text-xs text-foreground">
              <Loader2 size={14} className="animate-spin" /> Loading…
            </div>
          </div>
        )}

        {status === "blocked" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-background p-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400">
              <AlertTriangle size={22} />
            </div>
            <p className="text-sm font-semibold">
              Ye site iframe me open nahi hoti
            </p>
            <p className="max-w-xs text-xs text-muted-foreground">
              Security ke kaaran (YouTube, Google, govt sites, etc.) inhe app ke
              andar embed nahi kar sakte. Naye tab me kholo —
            </p>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 flex items-center gap-2 rounded-xl gradient-primary px-4 py-2.5 text-sm font-semibold"
            >
              <ExternalLink size={14} /> Open in new tab
            </a>
            <button
              onClick={onClose}
              className="text-xs text-muted-foreground underline-offset-2 hover:underline"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

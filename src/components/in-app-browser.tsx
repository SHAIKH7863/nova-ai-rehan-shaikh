import { useState } from "react";
import { ExternalLink, X } from "lucide-react";

export function InAppBrowser({
  url,
  title,
  onClose,
}: {
  url: string;
  title?: string;
  onClose: () => void;
}) {
  const [errored, setErrored] = useState(false);

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
          className="flex h-9 w-9 items-center justify-center rounded-xl gradient-primary"
          aria-label="Open externally"
        >
          <ExternalLink size={16} />
        </a>
      </div>
      <div className="relative flex-1 bg-white">
        {!errored ? (
          <iframe
            src={url}
            title={title ?? url}
            className="h-full w-full border-0"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            onError={() => setErrored(true)}
          />
        ) : null}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-background/80 to-transparent p-4 text-center text-xs text-foreground">
          <p className="pointer-events-auto inline-block rounded-full glass px-3 py-1">
            Some sites block embedding. Tap{" "}
            <ExternalLink size={12} className="inline -mt-0.5" /> to open in new
            tab.
          </p>
        </div>
      </div>
    </div>
  );
}

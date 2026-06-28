import { useEffect, useRef } from "react";

/**
 * Many useful sites (YouTube, Google, NTA, gov.in, etc.) refuse to load in an
 * iframe due to X-Frame-Options / CSP. To avoid the in-app crash/blank screen,
 * we now open every link in the device's real browser (new tab) and never
 * render an embedded webview.
 */
export function InAppBrowser({
  url,
  onClose,
}: {
  url: string;
  title?: string;
  onClose: () => void;
}) {
  const opened = useRef(false);
  useEffect(() => {
    if (opened.current) return;
    opened.current = true;
    try {
      const w = window.open(url, "_blank", "noopener,noreferrer");
      if (!w) {
        // Popup blocked — fall back to top navigation
        window.location.href = url;
      }
    } catch {
      window.location.href = url;
    }
    onClose();
  }, [url, onClose]);

  return null;
}

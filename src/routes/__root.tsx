import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useLocation,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { BottomNav } from "@/components/bottom-nav";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="glass max-w-sm rounded-3xl p-8 text-center">
        <h1 className="text-7xl font-display font-bold text-gradient">404</h1>
        <h2 className="mt-3 text-lg font-semibold">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Yeh page exist nahi karta.
        </p>
        <Link
          to="/"
          className="mt-5 inline-flex items-center justify-center rounded-xl gradient-primary px-5 py-2.5 text-sm font-semibold"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="glass max-w-sm rounded-3xl p-6 text-center">
        <h1 className="text-lg font-semibold">Something broke</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {error.message || "Unknown error"}
        </p>
        <div className="mt-5 flex justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="rounded-xl gradient-primary px-4 py-2 text-sm font-semibold"
          >
            Retry
          </button>
          <a
            href="/"
            className="rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold"
          >
            Home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      {
        name: "viewport",
        content:
          "width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover",
      },
      { name: "theme-color", content: "#1a0b2e" },
      { title: "Nova AI — Your Study Companion" },
      {
        name: "description",
        content:
          "Nova AI by REHAN SHAIKH — premium AI study app for JEE, NEET, UPSC, SSC and all Indian competitive exams. Chat, resources, papers, flashcards, all free.",
      },
      { property: "og:title", content: "Nova AI — Your Study Companion" },
      { name: "twitter:title", content: "Nova AI — Your Study Companion" },
      { name: "description", content: "NovaStudy AI: Ultimate Edition is a comprehensive AI-powered study assistant for students." },
      { property: "og:description", content: "NovaStudy AI: Ultimate Edition is a comprehensive AI-powered study assistant for students." },
      { name: "twitter:description", content: "NovaStudy AI: Ultimate Edition is a comprehensive AI-powered study assistant for students." },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/z2LEKkUB7bhpAwNIzvrZh6uuAn13/social-images/social-1778672270773-1000069064.webp" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/z2LEKkUB7bhpAwNIzvrZh6uuAn13/social-images/social-1778672270773-1000069064.webp" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:type", content: "website" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      {
        rel: "preconnect",
        href: "https://fonts.googleapis.com",
      },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const { pathname } = useLocation();
  const hideNav = pathname.startsWith("/focus") || pathname.startsWith("/onboarding");

  return (
    <QueryClientProvider client={queryClient}>
      <div className="relative mx-auto flex min-h-screen w-full max-w-md flex-col px-4 pb-24">
        <Outlet />
      </div>
      {!hideNav && <BottomNav />}
      <Toaster />
    </QueryClientProvider>
  );
}

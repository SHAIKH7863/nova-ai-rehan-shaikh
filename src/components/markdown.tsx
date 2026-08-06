import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/**
 * Models sometimes emit LaTeX delimiters, stray symbols or escape artifacts
 * that render as junk like "$", "\(", "&nbsp;" etc. Clean them before render.
 */
export function cleanAiText(input: string): string {
  return (input || "")
    // LaTeX delimiters -> plain text
    .replace(/\\\[|\\\]|\\\(|\\\)/g, "")
    .replace(/\$\$([\s\S]*?)\$\$/g, "$1")
    .replace(/(?<!\d)\$(?!\d)([^$\n]+?)\$/g, "$1")
    // common LaTeX commands -> readable
    .replace(/\\times/g, "×")
    .replace(/\\div/g, "÷")
    .replace(/\\pm/g, "±")
    .replace(/\\cdot/g, "·")
    .replace(/\\degree|\\circ/g, "°")
    .replace(/\\alpha/g, "α")
    .replace(/\\beta/g, "β")
    .replace(/\\theta/g, "θ")
    .replace(/\\pi/g, "π")
    .replace(/\\Delta/g, "Δ")
    .replace(/\\frac\{([^{}]*)\}\{([^{}]*)\}/g, "($1)/($2)")
    .replace(/\\sqrt\{([^{}]*)\}/g, "√($1)")
    .replace(/\\text\{([^{}]*)\}/g, "$1")
    .replace(/\\left|\\right|\\!|\\,|\\;/g, "")
    .replace(/\\boxed\{([^{}]*)\}/g, "$1")
    // html entities that slip through
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    // stray escaped punctuation like \% \& \_
    .replace(/\\([%&_#{}])/g, "$1")
    // collapse noise runs of symbols (e.g. "*-/;:,%" garbage)
    .replace(/(?:[*_~^]{3,})/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function Markdown({ children }: { children: string }) {
  return (
    <div className="prose prose-invert prose-sm max-w-none prose-headings:font-display prose-headings:text-foreground prose-p:leading-relaxed prose-code:rounded prose-code:bg-white/10 prose-code:px-1 prose-code:py-0.5 prose-code:text-[0.85em] prose-code:before:content-[''] prose-code:after:content-[''] prose-pre:bg-black/40 prose-pre:border prose-pre:border-white/10 prose-a:text-accent prose-strong:text-foreground prose-li:my-0.5">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children, ...props }) => (
            <a
              {...props}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="underline decoration-accent/50 underline-offset-2"
            >
              {children}
            </a>
          ),
        }}
      >
        {cleanAiText(children)}
      </ReactMarkdown>
    </div>
  );
}

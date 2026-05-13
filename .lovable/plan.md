# Nova AI by REHAN SHAIKH 

Bhai, full feature list bohot bada hai (community, admin panel, voice teacher, OCR, offline, push notifications, video calls jaisi cheezein). Sab ek saath build karenge to har feature aadha-adhura rahega. Isliye ek **solid v1** plan bana raha hoon jo actually ship ho — baaki features baad ke iterations me add karenge.

App Hinglish me responses dega (AI ko system prompt me bolenge), links AI on-demand generate karega, login optional rahega, focus Indian competitive exams (JEE, NEET, UPSC, SSC, CAT, GATE, etc.) par.

---

## v1 Scope (build now)

1. **Mobile-first premium UI** — purple-blue neon gradients, glassmorphism, dark mode, smooth animations
2. **AI Chat (Hinglish tutor)** — streaming responses, markdown rendering, chat history, rename/delete/bookmark
3. **Universal Resource Finder** — user query → AI returns curated links (books, PDFs, YouTube, official sites, syllabus, admit cards, results, answer keys, mock tests) with categorized cards
4. **In-app browser** — open links inside app via embedded webview-style modal (iframe + open-in-new fallback)
5. **Question Paper Library + AI Mock Generator** — exam + year picker, AI generates MCQ/subjective sets chapter-wise/topic-wise, one-click PDF export
6. **Study Tools** — AI flashcards, formula sheets, chapter summaries, weak-topic predictor, exam roadmap generator
7. **Dashboard** — exam countdown widget, daily motivation, recent chats, bookmarks, quick actions
8. **Optional Auth** — anonymous browsing works; login (email + Google) unlocks cloud sync of chats/bookmarks
9. **Focus Mode** — Pomodoro timer
10. **Bookmarks** — save links, chats, papers

## Deferred to v2+ (mention to user, don't build now)

Community/discussion rooms, quiz battles, public rankings, admin panel, voice teacher (TTS), live camera OCR, true offline mode (PWA), push notifications, voice-to-text input, chat export to PDF, analytics charts. Inme se kuch (jaise voice input, PDF export of chat, basic PWA) v1.5 me jaldi add ho sakte hain.

---

## Pages / Routes

```
/                  Dashboard (countdown, quick actions, recent)
/chat              AI tutor chat list
/chat/$threadId    Single chat thread
/resources         Universal resource search
/papers            Question paper library + mock generator
/tools             Flashcards, formulas, summaries, roadmap
/bookmarks         Saved links, chats, papers
/focus             Pomodoro + focus timer
/login             Optional login
/profile           User profile + settings
```

Bottom tab bar (mobile-native feel): Home, Chat, Resources, Papers, Tools.

---

## Technical Section

**Stack**: TanStack Start (already set up) + Tailwind + Lovable Cloud (Supabase) + Lovable AI Gateway (`google/gemini-3-flash-preview` default).

**AI calls** — TanStack server routes (`src/routes/api/*`) using Vercel AI SDK + Lovable AI Gateway:

- `/api/chat` — `streamText` with Hinglish system prompt, `useChat` on client
- `/api/resources` — structured output (Zod schema): array of `{ title, url, type, description, source }`
- `/api/generate-paper` — structured MCQ/subjective questions for given exam/topic
- `/api/study-tool` — flashcards / summary / formulas / roadmap generators

**Database (Lovable Cloud)** — enabled on first auth-needing action:

- `profiles` (id → auth.users, display_name, target_exam, exam_date)
- `chat_threads` (id, user_id, title, bookmarked, updated_at)
- `chat_messages` (id, thread_id, role, parts jsonb, created_at)
- `bookmarks` (id, user_id, kind: link|paper|chat, payload jsonb)
- `generated_papers` (id, user_id, exam, topic, questions jsonb)
- RLS: every table user-scoped via `auth.uid() = user_id`
- Anonymous users: data kept in localStorage; on login, optional one-time migration

**PDF export** — `pdf-lib` (Worker-compatible) for mock papers and (later) chat export.

**In-app browser** — modal with `<iframe sandbox>`; if site blocks framing (X-Frame-Options), show "Open in new tab" fallback with friendly message.

**Design tokens** — define in `src/styles.css`:

- Dark base (`--background` deep navy), `--primary` electric purple, `--accent` neon blue
- `--gradient-primary`, `--gradient-aurora`, glassmorphism `--surface-glass` with backdrop-blur
- Font: Inter (UI) + Space Grotesk (display)
- All colors in `oklch`, no hardcoded hex in components

**Mobile-first** — `preview_ui--set_preview_device_viewport: mobile` set during build; layouts capped at `max-w-md` mx-auto on desktop so it always feels like a phone app. Bottom safe-area padding, large tap targets, swipe-friendly lists.

**Animations** — Tailwind transitions + `tw-animate-css` (already installed) for entry animations, gradient shimmer on AI thinking states.

**Hinglish system prompt** — every AI route includes: "Tum NovaStudy AI ho — ek friendly Hinglish tutor jo Indian competitive exam (JEE/NEET/UPSC/SSC/CAT/GATE) students ki help karta hai. Hinglish me reply karo (Hindi + English mix, Roman script). Concepts simple bhasha me samjhao, examples do, aur jab links chahiye to verified sources prefer karo (NTA, official boards, NCERT, reputed YouTube channels)."

**AI link disclaimer** — Resource cards par chhota note: "AI-suggested links — verify before relying on official documents."

---

## Build Order

1. Design system + mobile shell + bottom tab nav
2. Dashboard + exam countdown + onboarding (target exam picker)
3. AI chat (streaming, Hinglish) — localStorage threads first
4. Resource finder (structured AI output + categorized cards + in-app browser modal)
5. Enable Lovable Cloud + auth + migrate chats/bookmarks to DB
6. Question paper library + AI mock generator + PDF export
7. Study tools (flashcards, summaries, formulas, roadmap)
8. Bookmarks + focus mode + polish pass

---

## Open Items

- **Hinglish answer**: aapne "Please Hinglish told me and" likha — main maan raha hoon ki aap chahte ho **AI Hinglish me jawab de aur app ka tone bhi Hinglish-friendly ho au**r hindi Marathi har ek bhasha me user se baat kar sake interface English me ho(UI labels English rahenge, AI responses + microcopy Hinglish). Galat ho to bata dena.
- v2 features (community, admin, voice, OCR, offline) ka order baad me decide karenge.

Approve karte ho to build start kar du?
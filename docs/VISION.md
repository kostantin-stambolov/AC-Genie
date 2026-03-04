# AC-Genie: Vision, Architecture & Critique

## 1. Product vision

A **web app** (mobile-first) for students preparing for the American College in Sofia admission exam. The student logs in with **email + PIN**, sees a **home** with exam parts (Part 1: Essay, Part 2: Test with 4 sections). Each part/section is either **incomplete** (must complete before continuing) or **complete** (can continue or start new; link to previous examples). The app will later use **Clova and ChatGPT APIs** for dictation, recording, and file upload. Design: **clean, simple, universally accessible**, no middle ground on completion.

---

## 2. User flow

1. **Intro:** Login with email + PIN.
2. **Home:** List of “exams”:
   - **Part 1 – Essay:** One block. State: incomplete → “Continue” (resume) or complete → “Start new” / “See previous examples”.
   - **Part 2 – Test:** Four sections (e.g. Reading 1, Reading 2, Logic 1, Logic 2, or Section I–IV). Same logic per section: incomplete → “Continue”; complete → “Start new” / “See previous examples”.
3. **No middle ground:** A section is either done or not; partial progress is “incomplete” until explicitly completed.

---

## 3. Technical architecture

| Layer | Choice | Rationale |
|-------|--------|-----------|
| **Frontend** | Next.js 14 (App Router), React, Tailwind | SSR, API routes, simple deploy, mobile-first CSS |
| **Database** | SQLite via Prisma | Simple, file-based, no external DB for local; easy to swap to Postgres later |
| **Auth** | Email + PIN, session in **HTTP-only, Secure, SameSite** cookie | No PIN in JS; server-side session only |
| **API** | Next.js Route Handlers | Same origin, no separate backend |
| **Future** | API routes for Clova/ChatGPT (dictation, upload) | Keys only on server; rate limit and audit |

---

## 4. Data model (simple)

- **User:** id, email (unique), pinHash, createdAt.
- **Session:** id, userId, token (random), expiresAt. Stored in DB; token in cookie.
- **Attempt:** id, userId, part (1 | 2), section (null for Part 1, 1–4 for Part 2), status (in_progress | completed), startedAt, completedAt. One active “in_progress” per (user, part, section).
- **Previous examples:** Link from home to a static or dynamic page listing past completed attempts (read-only).

No PII in client beyond “logged in” and list of attempts. PIN never stored plain; session token unguessable.

---

## 5. Security measures

- **PIN:** Bcrypt (or argon2) hash only; never log or expose.
- **Session:** Long random token, HTTP-only cookie, Secure in prod, SameSite=Lax. Short expiry (e.g. 7 days) and refresh on activity.
- **Rate limiting:** Login endpoint (e.g. 5 attempts per email per 15 min) to slow brute force.
- **HTTPS:** Enforced in production; no sensitive cookies over HTTP.
- **Secrets:** All keys (DB, API keys for Clova/ChatGPT) in env vars; never in repo or client.
- **Input:** Validate and sanitize email; PIN length (e.g. 4–8 digits). No raw PIN in URLs or logs.

---

## 6. Weak spots & mitigations

| Weak spot | Risk | Mitigation |
|-----------|------|------------|
| **PIN is weak** | Guessing, shoulder surfing | Rate limit login; consider optional 2FA or “forgot PIN” flow later. Keep PIN short for target age. |
| **Session fixation** | Attacker reuses session | New token on login; bind to User-Agent or fingerprint (optional). |
| **No email verification** | Fake accounts | Accept for MVP; add verification later if needed. |
| **SQLite file** | Theft of DB file = all hashes | File permissions; in prod use Postgres with access control. |
| **Clova/ChatGPT keys** | Leak, abuse | Keys only server-side; rate limit per user; audit logs. |
| **Mobile + shared device** | Someone else continues session | Short session expiry; “Log out” prominent; optional PIN to resume. |
| **“Previous examples”** | Privacy if shared device | Show only metadata (date, part/section); full content only when we add storage, with access control. |

---

## 7. Mobile-first & accessibility

- **Viewport, touch:** Meta viewport; tap targets ≥ 44px; no hover-only actions.
- **Contrast, font:** WCAG AA; readable font size (e.g. 16px base); support zoom.
- **Simple UI:** One primary action per screen; clear labels; “Continue” / “Start new” / “Previous examples” obvious.
- **Companion use:** Works on small screen; minimal data use; works offline later (e.g. service worker) if we add it.

---

## 8. Future: Clova / ChatGPT

- **Dictation / recording:** Server-side API route receives audio (or chunked upload), sends to provider, returns text. Token and cost tracking per user.
- **File upload:** Same idea; store in blob storage or temp; process server-side only. Validate type and size; virus scan in prod if needed.
- **No keys in client;** no direct browser → Clova/ChatGPT. All via our backend.

---

## 9. What we’re building in this iteration

- Intro (login: email + PIN).
- Simple DB (SQLite + Prisma): User, Session, Attempt.
- Home: list Part 1 + Part 2 (four sections); each item: Continue / Start new / See previous examples (by state).
- Part 1 and Part 2 section pages: placeholders (e.g. “Essay” and “Section 1–4”) with complete/incomplete flow.
- Session auth with secure cookie; rate-limited login.
- Clean, minimal, mobile-first UI; push to git and run locally.

No Clova/ChatGPT or file upload in this first cut; structure so we can add them without redesign.

# Essay grading agent – setup and tuning

## What was wrong (Invalid `lastFeedbackGrade`)

The error happened because the **Prisma client** was generated before the new fields (`lastFeedbackGrade`, `lastFeedbackText`, `lastFeedbackAt`) were added to the schema. The running dev server was still using the old client.

**Fix:** Run `npx prisma generate` and **restart the dev server** (stop and run `npm run dev` again). The dev server has been restarted for you so the fix is active.

---

## Where the grading agent is configured

### 1. **Prompt and rubric** – `lib/essay-feedback-prompt.ts`

This file defines how the AI grades and gives feedback.

- **`RUBRIC`** – Bulgarian 2–6 scale, 15–16 yo standard, weights for idea/content (~50%), structure (~20%), language (~30%). Language/grammar/spelling errors directly lower the grade. Edit this to change grade definitions or criteria.
- **`LANGUAGE_ASSESSMENT`** – Instructions for identifying spelling, grammar, punctuation, and word-choice errors; each error is returned with `original`, `correction`, and optional `note`. Adjust categories or strictness here.
- **`buildEssayFeedbackSystemPrompt()`** – Full system prompt (rubric + language assessment + output rules). Change tone, strictness, or output format here.
- **`buildEssayFeedbackUserPrompt(...)`** – Builds the user message (topic + instructions + student draft). Change how the essay and prompt are presented to the model.

The agent returns `grade`, `feedback` (overall text), and `languageErrors` (array of `{ type, original, correction, note }`). The feedback page shows the overall feedback and a “Language, grammar & spelling” section listing each error and correction when present.

**To make the agent stricter or looser:** Adjust the Grade 2–6 descriptions in `RUBRIC` or add instructions in `buildEssayFeedbackSystemPrompt()` (e.g. “Be encouraging but precise” or “Aim for solid 6 only when logic and wording are clearly at 15–16 yo level”).

### 2. **API and model** – `app/api/essay/feedback/route.ts`

- **Model:** `gpt-4o-mini` (see the `model` field in the `fetch("https://api.openai.com/v1/chat/completions", ...)` body). Change to `gpt-4o` for a stronger model.
- **Temperature:** `0.3` – lower = more consistent grading; raise slightly if you want more variation.
- **Flow:** Loads attempt + essay, calls the prompt builders, sends to OpenAI, parses `grade` and `feedback`, saves them on the attempt, returns them to the client.

**To switch model or temperature:** Edit the `body` of that `fetch` call in `app/api/essay/feedback/route.ts`.

### 3. **UI** – `app/practice/part1/EssayFeedbackSection.tsx`

- “Submit for feedback” button and the feedback panel (grade + text).
- Copy under the feedback: “Update your essay above based on this feedback, then click Submit again to get a new grade.”

You can change labels or add extra instructions for the student here.

---

## Quick checklist for “agent working properly”

1. **`OPENAI_API_KEY`** is set in `.env` (you already have it).
2. **Prisma client is up to date:** run `npx prisma generate` after any schema change; restart dev server after generate.
3. **Tune the rubric** in `lib/essay-feedback-prompt.ts` so the 2–6 descriptions match what you want (e.g. what “solid 6” means for 15–16 yo).
4. **Optional:** In `app/api/essay/feedback/route.ts`, try `gpt-4o` instead of `gpt-4o-mini` if you want more consistent or nuanced grading.

The continuous feedback loop is: **write → Submit for feedback → see grade + feedback → edit essay → Submit for feedback again** (repeat as needed). No extra setup is required beyond the above.

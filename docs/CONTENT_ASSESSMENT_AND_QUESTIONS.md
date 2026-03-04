# AC Sample – Content Assessment & Open Questions

## 0. Exam structure from the Exam Guide (Grade 7)

*Source: Exam Guide Grade 7.pdf – American College in Sofia admission exam.*

### 0.1 Overall format

- **Language:** Bulgarian.
- **Total time:** 130 minutes, no break.
- **Weight:** Essay 20%, Test 80%.

| Component | Time | Weight |
|-----------|------|--------|
| **Part 1: Essay (Съчинение)** | 30 min | 20% |
| **Part 2: Test (Тест)** | 100 min (4 sections × 25 min) | 80% (4 × 20%) |
| **Total** | 130 min | 100% |

### 0.2 Part 1: Essay

- **No single “correct” answer.** Assessed on: clear thesis, argumentation, structure, language.
- **Scoring (20 pts total):** Idea/content 10 pts, Structure 4 pts, Language 6 pts.
- **Process:** Two markers; if difference ≥ 4 pts, an arbitrator scores; then scores are combined.
- **Tips in guide:** 5 min read instructions, 20 min write, 5 min review. Optional title when instructed.
- **Examples in guide:** Many past prompts (quote, image, passage, “what would you do?”, etc.).

### 0.3 Part 2: Test (4 sections)

- **4 sections**, 25 minutes each, 20% each. No penalty for wrong answers.
- **Instructions:** Answers must be on an **answer sheet** (bubble/form); answers in the test booklet do not count. Use pencil; fill circles completely; erase fully if changing. Match question number to row on the sheet. Do not mark answers for any **sample/practice questions** at the start of a section.
- **Purpose (from guide):** Not topic-specific; aims at logical and combinatorial thinking, curiosity, intuition. Some questions easy, some hard; focus on what you can do, skip and return if needed.
- **Past materials listed in guide:**  
  Reading comprehension 1 & 2, Logic 1 & 2, Math 1, 2, 3, 4 (each with a separate answer key). So the **sample PDFs in AC Sample** match this list.

### 0.4 Mapping to AC Sample PDFs

| Guide “Task” | AC Sample file(s) |
|--------------|-------------------|
| Четене с разбиране 1 / 2 | reading-comprehension-1.pdf, reading-comprehension-2.pdf |
| Логически задачи 1 / 2 | logic-1.pdf, logic-2.pdf |
| Математика 1–4 | math-1.pdf … math-4.pdf |

The guide does **not** say which PDF corresponds to “Section I”, “Section II”, etc.; it only lists these 8 task sets. For the app, we can treat each PDF as one practice set (segment + exercise).

---

## 1. What’s in the AC Sample folder (as scanned)

### 1.1 File inventory

| Category | Files | Purpose (inferred) |
|----------|--------|--------------------|
| **Exam guide** | `Exam Guide Grade 7.pdf` (~13 MB) | Main reference for Grade 7 exam structure/rules |
| **Registration** | `helpful-information-about-registration-2026.pdf` | Registration info for 2026 |
| **Logic** | `logic-1.pdf`, `logic-2.pdf` | Practice sets |
| **Logic answers** | `answers-logic-1.pdf`, `answers-logic-2.pdf` | Answer keys |
| **Math** | `math-1.pdf`, `math-2.pdf`, `math-3.pdf`, `math-4.pdf` | Practice sets |
| **Math answers** | `answers-math-1.pdf` … `answers-math-4.pdf` | Answer keys |
| **Reading** | `reading-comprehension-1.pdf`, `reading-comprehension-2.pdf` | Practice sets |
| **Reading answers** | `answers-reading-comprehension-1.pdf`, `answers-reading-comprehension-2.pdf` | Answer keys |

All content is **PDF only**; no JSON/MD/CSV or other structured data was found.

### 1.2 Inferred content model

- **Segments (3):** Logic, Math, Reading Comprehension  
- **Exercises per segment:** 2 (Logic, Reading) or 4 (Math), each as a pair (question PDF + answer PDF)  
- **Naming:** `{segment-slug}-{index}.pdf` and `answers-{segment-slug}-{index}.pdf`  
- **Grade level:** Grade 7 (from Exam Guide title)

---

## 2. Answers to the earlier questions (from the folder alone)

| Question | Answer from folder |
|----------|---------------------|
| **Content source/format** | PDF only. No existing split of “segment → exercise → question” in a machine-readable format. |
| **Segments** | Yes: **Logic**, **Math**, **Reading Comprehension**. |
| **Exercises/tasks** | Yes, but only as PDFs: e.g. math-1 … math-4, logic-1/2, reading-comprehension-1/2. No per-question structure in files. |
| **Answer keys** | Yes: one answer PDF per question PDF. Keys are not in a format the app can use without extraction. |
| **Difficulty / tags** | Not visible in filenames; would be inside PDFs or need to be defined. |

**Conclusion:** To support “choose segment → practice → log & track,” we need either (a) in-app PDF viewer + manual/assisted scoring, or (b) extracted/structured content (e.g. questions + correct answers in DB/JSON) for auto-grading and progress.

---

## 3. Necessary materials for the system (from this sample)

1. **Segments**
   - **Logic** (2 exercises)
   - **Math** (4 exercises)
   - **Reading Comprehension** (2 exercises)

2. **Per “exercise”**
   - Question set: PDF (and optionally extracted text/HTML for better UX).
   - Answer key: PDF (and optionally structured answers for auto-grading).

3. **Reference / meta**
   - Exam Guide (Grade 7) for rules/structure.
   - Registration info (optional for the tutoring flow).

4. **To support sessions + history**
   - A way to know “what was attempted” and “what was correct”: either structured answers in the backend or a defined process (e.g. student self-checks against PDF, or AI/assisted grading).

---

## 4. Additional questions that still need answering

### A. Content format and ingestion

1. **PDF vs structured content**  
   Should the first version of the app:
   - **Option A:** Show PDFs in-app (e.g. embed/viewer) and track “completed” per PDF, with answers checked by the student against the answer PDF (or by AI)?
   - **Option B:** Use content extracted from PDFs into a DB (questions, options, correct answer per item) so the app can show one question at a time and auto-grade?
   - **Option C:** A hybrid (e.g. PDF for passages, structured data for discrete questions)?

2. **More segments / exercises later**  
   Will you add more segments (e.g. Writing, Science) or more exercises per segment? Should the data model support arbitrary segments and exercise counts from day one?

3. **Grade levels**  
   Is the product only “Grade 7” or will there be multiple grades (e.g. 7, 8, 9)? If multiple, should segments be per grade or shared across grades?

### B. How practice and sessions work

4. **Session scope**  
   Is one session = one segment (e.g. “This session: Math only”) or can a student mix segments in one session (e.g. “10 min Logic, 10 min Reading”)?

5. **Exercise selection**  
   Within a segment, should the student:
   - Choose a specific exercise (e.g. “Math – Set 2”),
   - Get a random exercise,
   - Or follow a suggested order (e.g. complete 1 before 2)?

6. **Question-level vs set-level**  
   Do we need to track and show progress per **question** (e.g. “Q3 correct, Q7 wrong”) or is it enough to track per **exercise/set** (e.g. “Completed math-2, 80% correct”)?

### C. AI and scoring

7. **AI role**  
   Should AI:
   - Only explain after the student answers (using answer key),
   - Give hints during the attempt,
   - Grade open-ended/short-answer responses,
   - Or all of the above?

8. **Who has the “correct” answer?**  
   For auto-grading: will correct answers be in our system (from extracted keys) or should the AI infer correctness from the answer PDF (e.g. we send question + student answer + answer PDF to AI)?

### D. Users and history

9. **Identity**  
   Do we need accounts (email/password or SSO) from the start, or is anonymous/guest usage OK with optional “save progress” (e.g. link or code) later?

10. **What to store in history**  
    Per session (or per attempt), do we need: segment, exercise, score, time spent, and per-question right/wrong? Any need to export or report for parents/schools?

### E. Technical

11. **AI provider**  
    Any preference or constraint (e.g. OpenAI, Anthropic, local model)? This affects how we design API usage and token tracking.

12. **Deployment**  
    Web-only at first, or do you want a mobile app (e.g. React Native / PWA) in the initial scope?

### F. Scope from the Exam Guide

13. **Essay (Съчинение) in the app?**  
    The real exam has 30 min essay (20%). Should the tutoring app include **essay practice** (prompts + AI feedback on structure/thesis/language), or only the **test** segments (Reading, Logic, Math) for now?

14. **Answer format in the app**  
    The real exam uses bubble sheets. In the app, do we want to mimic that (e.g. multiple-choice bubbles), or is a simpler UI (e.g. tap A/B/C/D, or type short answer) enough for practice?

15. **Timing**  
    Should practice sessions enforce **25 min per section** (exam-like) or allow untimed / flexible practice?

---

## 5. Suggested next steps (once the above are decided)

1. Lock content strategy: PDF-only vs extracted vs hybrid.
2. Define data model: segments, exercises, questions (if applicable), and how answers are stored.
3. Design session and history schema (sessions, attempts, scores, optional per-question detail).
4. Choose stack (e.g. Next.js + API + DB) and add minimal backend + UI for “start session → choose segment → practice” with history.

This document can be updated as you answer the questions above.

/**
 * Prompt for the essay rewrite agent: produce a model essay with clear structure
 * and a score section (sub-scores out of 20 + reason). All output in English.
 */

export function buildRewriteSystemPrompt(): string {
  return `You are an expert essay tutor. Rewrite the student's essay into a well-structured, strong version (aiming for 16+ out of 20 from a single ACS examiner) that a talented 13–14 year old could realistically have written. The essay is in Bulgarian — write the essay, all labels, and all explanations in Bulgarian.

Output valid JSON only, no markdown or extra text:
{"parts": [{"label": "<string>", "text": "<string>"}, ...], "score": {"ideaContent": <0-10>, "structure": <0-4>, "language": <0-6>, "total": <0-20>}, "scoreReason": "<string>"}

Rules:
- "parts": array of structural sections. Use Bulgarian labels like "Въведение", "Основна част — първи аргумент", "Основна част — втори аргумент", "Заключение". 3–5 parts. "text" is the paragraph(s) in Bulgarian. The essay must address the topic and show clear thesis, argumentation, and structure.
- "score": sub-scores for this model essay as if a single ACS examiner assessed it (ideaContent 0–10, structure 0–4, language 0–6, total = sum of the three).
- "scoreReason": 2–3 sentences in Bulgarian explaining what makes it strong or what a real 13–14 year old might still struggle with.`;
}

export function buildRewriteUserPrompt(
  topicTitle: string,
  topicInstruction: string,
  topicBody: string,
  studentDraft: string,
  feedback: string
): string {
  return `Essay topic: ${topicTitle}

Topic / prompt:
${topicBody}

Instructions for the essay:
${topicInstruction}

---
Student's draft (rewrite this into a strong, well-structured version):
${studentDraft || "(No draft provided.)"}

---
Feedback the student received (use this to inform your rewrite):
${feedback || "(No feedback.)"}

---
The essay topic and student draft are in Bulgarian. Reply in Bulgarian. JSON only: {"parts": [{"label": "...", "text": "..."}, ...], "score": {"ideaContent": <0-10>, "structure": <0-4>, "language": <0-6>, "total": <0-20>}, "scoreReason": "..."}`.trim();
}

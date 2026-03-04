/**
 * Prompt for the essay rewrite agent: produce a model essay with clear structure
 * and a grade section (grade + reason). All output in English.
 */

export function buildRewriteSystemPrompt(): string {
  return `You are an expert essay tutor. Your task is to rewrite the student's essay into a well-structured, strong version (grade 6 level, 15–16 yo) that addresses the same topic. Write the entire model essay and all labels in English.

Output valid JSON only, no markdown or extra text:
{"parts": [{"label": "<string>", "text": "<string>"}, ...], "grade": <number 2-6>, "gradeReason": "<string>"}

Rules:
- "parts": array of structural sections. Use labels like "Introduction", "Body — first point", "Body — second point", "Conclusion". 3–5 parts. "text" is the paragraph(s) in English. The essay must address the topic and show clear thesis, argumentation, and structure.
- "grade": integer 2–6 (Bulgarian scale; 6 = excellent). Grade this model essay as if it were a 15–16 yo submission.
- "gradeReason": 2–4 sentences in English explaining why this grade was given (what makes it strong or what would be needed for a higher grade).`;
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
Reply in English. JSON only: {"parts": [{"label": "...", "text": "..."}, ...], "grade": <2-6>, "gradeReason": "..."}`.trim();
}

export type WeakestDimension = "ideaContent" | "structure" | "language";

export function getWeakestDimension(
  e1: { ideaContent: number; structure: number; language: number },
  e2: { ideaContent: number; structure: number; language: number }
): WeakestDimension {
  const avg = {
    ideaContent: (e1.ideaContent + e2.ideaContent) / 2 / 10,
    structure:   (e1.structure   + e2.structure)   / 2 / 4,
    language:    (e1.language    + e2.language)     / 2 / 6,
  };
  const min = Math.min(avg.ideaContent, avg.structure, avg.language);
  if (avg.ideaContent === min) return "ideaContent";
  if (avg.structure   === min) return "structure";
  return "language";
}

export const DIMENSION_LABELS: Record<WeakestDimension, string> = {
  ideaContent: "Idea & Content",
  structure:   "Structure",
  language:    "Language",
};

export const DIMENSION_MODEL_OBSERVATIONS: Record<WeakestDimension, string> = {
  ideaContent: "a clear thesis sentence and specific personal examples made the argument convincing",
  structure:   "a deliberate opening and conclusion that echo each other made the essay feel complete",
  language:    "varied vocabulary and clean grammar created a polished, confident impression",
};

export const DIMENSION_REFLECTION_PLACEHOLDERS: Record<WeakestDimension, string> = {
  ideaContent: "Next time I will start by writing my thesis as one clear sentence before I write anything else…",
  structure:   "Next time I will plan my opening and closing sentences before I start writing the body…",
  language:    "Next time I will leave 3 minutes at the end to re-read for spelling and grammar…",
};

export const DIMENSION_ANNOTATION_NOTES: Record<
  WeakestDimension,
  Array<{ position: "before" | "after" | "top"; partLabel?: string; text: string }>
> = {
  ideaContent: [
    { position: "top", text: "✦ Notice: the Introduction states the thesis in one specific, arguable sentence — not a general statement." },
    { position: "before", partLabel: "Body", text: "✦ Notice: the first argument is directly tied to the thesis, with a concrete personal example to back it up." },
  ],
  structure: [
    { position: "top", text: "✦ Notice: the first sentence of the Introduction sets up the whole essay. The last sentence of the Conclusion deliberately echoes it — this is what makes an essay feel complete." },
    { position: "after", partLabel: "Body", text: "✦ Notice: each paragraph develops ONE point, then the next paragraph starts a new one. No mixing." },
  ],
  language: [
    { position: "top", text: "✦ Notice the vocabulary variety — the model avoids repeating the same words. Notice how sentences vary in length — some short, some longer. This is what a clean, expressive style looks like for a 13–14 year old." },
  ],
};

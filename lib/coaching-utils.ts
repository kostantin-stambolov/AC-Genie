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
  ideaContent: "Идея и съдържание",
  structure:   "Структура",
  language:    "Език",
};

export const DIMENSION_MODEL_OBSERVATIONS: Record<WeakestDimension, string> = {
  ideaContent: "ясното тезисно изречение и конкретните лични примери направиха аргумента убедителен",
  structure:   "обмисленото начало и заключение, които си отекват, направиха есето пълноценно",
  language:    "разнообразната лексика и чистата граматика създадоха полиран, уверен стил",
};

export const DIMENSION_REFLECTION_PLACEHOLDERS: Record<WeakestDimension, string> = {
  ideaContent: "Следващия път ще започна с написването на тезата като едно ясно изречение, преди да напиша нещо друго…",
  structure:   "Следващия път ще планирам началното и заключителното изречение, преди да пиша основната част…",
  language:    "Следващия път ще оставя 3 минути накрая да препрочета за правописни и граматически грешки…",
};

export const DIMENSION_ANNOTATION_NOTES: Record<
  WeakestDimension,
  Array<{ position: "before" | "after" | "top"; partLabel?: string; text: string }>
> = {
  ideaContent: [
    { position: "top", text: "✦ Забележи: Въведението заявява тезата в едно конкретно, спорно изречение — не общо твърдение." },
    { position: "before", partLabel: "Body", text: "✦ Забележи: първият аргумент е директно свързан с тезата, с конкретен личен пример в подкрепа." },
  ],
  structure: [
    { position: "top", text: "✦ Забележи: първото изречение на Въведението задава тона на цялото есе. Последното изречение на Заключението умишлено го отеква — това е, което прави едно есе завършено." },
    { position: "after", partLabel: "Body", text: "✦ Забележи: всеки параграф развива ЕДИН аспект, след което следващият параграф започва нов. Без смесване." },
  ],
  language: [
    { position: "top", text: "✦ Забележи разнообразието на речника — моделът избягва повтарянето на едни и същи думи. Забележи как изреченията варират по дължина — някои кратки, други по-дълги. Това е чист, изразителен стил за ученик на 13–14 години." },
  ],
};

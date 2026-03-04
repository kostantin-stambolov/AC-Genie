/**
 * Essay prompts in the style of the American College in Sofia Exam Guide (Grade 7).
 * Used to randomly offer 3 options; the chosen one is stored on the attempt.
 */

export interface EssayPrompt {
  id: string;
  title: string;
  instruction: string;
  body: string;
}

export const ESSAY_PROMPTS: EssayPrompt[] = [
  {
    id: "quote-lao-tzu",
    title: "The first step",
    instruction:
      "Read the quote carefully. Describe a goal or aspiration you have. What is the first step you need to take toward it? How do you imagine a plan that would motivate you to achieve that goal?",
    body: `"The longest journey begins with a single step." — Lao Tzu`,
  },
  {
    id: "theme-travel",
    title: "When I travel",
    instruction:
      "Write an essay on the theme: When I travel. Do not change the title. Consider: Do you travel, and why? What does travel mean to you? What does it give or take from you? Formulate a thesis and support it with reasoning and examples from your own experience.",
    body: "Theme: When I travel.",
  },
  {
    id: "quote-thoreau",
    title: "Castles in the air",
    instruction:
      "Reflect on the quote from Henry David Thoreau's Walden: What do you think he means by 'castles in the air'? Do you agree that building them is not in vain and that 'they are right where they should be'? If you could build your own 'castle', what would it be and how would you build the foundations under it? Write an essay in response.",
    body: `"If you have built castles in the air, your work need not be lost; that is where they should be. Now put the foundations under them." — Henry David Thoreau, Walden`,
  },
  {
    id: "quote-orwell",
    title: "Words and freedom",
    instruction:
      "Reflect on George Orwell's words and the following: What is freedom, and when do we feel truly free? What is the link between freedom and the need to be heard? Why might Orwell think some people do not want to hear certain things? Write an essay on the theme 'Words and freedom'.",
    body: `"If liberty means anything at all, it means the right to tell people what they do not want to hear." — George Orwell`,
  },
  {
    id: "someone-special",
    title: "Someone you would choose",
    instruction:
      "Read the question carefully. Answer in an essay and give it a title. If right now, instead of taking this exam, you could spend your time with someone who is not in your family and not a close friend or relative, who would that person be and why?",
    body: "If at this moment, instead of taking the exam, you could spend your time with someone who is not a member of your family and not a close friend or relative, who would that person be and why?",
  },
  {
    id: "two-roads",
    title: "Two roads",
    instruction:
      "Read the lines below. Identify what situation in life the author is describing. See it as a problem and state that problem as the title of your essay. In the essay, explain how you see the solution to this problem. Support your view with personal experience.",
    body: `Two roads diverged in a yellow wood,\nAnd sorry I could not travel both\nAnd be one traveler, long I stood\nAnd looked down one as far as I could\n— Robert Frost`,
  },
  {
    id: "significant-book",
    title: "A book that mattered",
    instruction:
      "What is the most significant or impactful book you have read so far? Write an essay that: (1) Explains why that book moved you and how—e.g. through the author's voice and ideas, a character, the plot, or something you learned. (2) Explains what you see as the book's valuable message and why it matters to you. Does it matter to others? Will it matter in 30 years, and why?",
    body: "What is the most significant or impactful book you have read so far?",
  },
  {
    id: "witness-choice",
    title: "What would you do?",
    instruction:
      "The passage below is from a novel. Read it carefully. Imagine you are a witness to the scene. What would you do? Justify your choice in an essay. Support your position with examples from your own life. Give your essay a title.",
    body: `Just then the gate of a nearby house opened and a boy ran out. He looked frightened, and no wonder—five other boys were chasing him. They caught up, pushed him against the fence, and threw themselves on him. The five began to hit and shove him. He started to cry and covered his face with his hands to protect himself.`,
  },
  {
    id: "punishment",
    title: "On punishment",
    instruction:
      "Read the passage from Lewis Carroll's Through the Looking-Glass. Think about the Queen's claim. Are punishments necessary? Does a person become better after being punished? Write an essay in response and give it a title. Support your view with examples from your own experience.",
    body: `"Have you ever been punished?" asked the White Queen.\n"Only for misdeeds!" replied Alice.\n"And after the punishment you were always better, I'm sure!" the Queen exclaimed.`,
  },
  {
    id: "goal-first-step",
    title: "Your goal and your first step",
    instruction:
      "Think of a goal or dream you have. What is the very first step you would take toward it? Describe both the goal and the step. Then explain how you would plan the next steps so that you stay motivated.",
    body: "Describe a goal or dream you have. What is the first step you would take toward it? How would you plan the rest so you stay motivated?",
  },
];

/** Pick n random prompts without repetition */
export function pickRandomPrompts(n: number): EssayPrompt[] {
  const shuffled = [...ESSAY_PROMPTS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

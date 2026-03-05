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
  // ── QUOTES TO REFLECT ON ─────────────────────────────────────────────────
  {
    id: "quote-lao-tzu",
    title: "The first step",
    body: `"The longest journey begins with a single step." — Lao Tzu`,
    instruction:
      "Describe a goal or aspiration you have. What is the first step you need to take toward it? How do you imagine a plan that would motivate you to achieve that goal?",
  },
  {
    id: "quote-thoreau",
    title: "Castles in the air",
    body: `"If you have built castles in the air, your work need not be lost; that is where they should be. Now put the foundations under them." — Henry David Thoreau`,
    instruction:
      "What do you think Thoreau means by 'castles in the air'? Do you agree that building them is worthwhile? If you could build your own 'castle', what would it be and how would you lay the foundations?",
  },
  {
    id: "quote-orwell",
    title: "Words and freedom",
    body: `"If liberty means anything at all, it means the right to tell people what they do not want to hear." — George Orwell`,
    instruction:
      "What is freedom, and when do we feel truly free? What is the link between freedom and the need to be heard? Write an essay on the theme 'Words and freedom'.",
  },
  {
    id: "quote-twain",
    title: "Courage and fear",
    body: `"Courage is resistance to fear, mastery of fear — not absence of fear." — Mark Twain`,
    instruction:
      "Do you agree with Twain's definition of courage? Describe a moment when you or someone you know had to resist fear rather than simply be without it. What made it possible?",
  },
  {
    id: "quote-einstein",
    title: "Imagination and knowledge",
    body: `"Imagination is more important than knowledge. For knowledge is limited, whereas imagination encircles the world." — Albert Einstein`,
    instruction:
      "Do you agree that imagination is more important than knowledge? In what situations does imagination lead where knowledge cannot? Support your view with examples from your own experience or from books and films you know.",
  },
  {
    id: "quote-mandela",
    title: "Education as a weapon",
    body: `"Education is the most powerful weapon which you can use to change the world." — Nelson Mandela`,
    instruction:
      "Do you believe education is the most powerful force for change in the world? What does 'education' mean to you beyond the classroom? Argue your position with examples.",
  },
  {
    id: "quote-confucius",
    title: "Knowing yourself",
    body: `"Real knowledge is to know the extent of one's ignorance." — Confucius`,
    instruction:
      "What does it mean to truly know yourself? Have you ever discovered something about yourself that surprised you? How has that knowledge changed how you think or act?",
  },
  {
    id: "quote-wilde",
    title: "Being yourself",
    body: `"Be yourself; everyone else is already taken." — Oscar Wilde`,
    instruction:
      "Is it always easy to 'be yourself'? Are there moments when it feels dangerous or difficult to show who you really are? Write an essay that explores the price — and the reward — of authenticity.",
  },
  {
    id: "quote-tolstoy",
    title: "Three most important things",
    body: `"Remember then: there is only one time that is important — Now! It is the most important time because it is the only time when we have any power." — Leo Tolstoy`,
    instruction:
      "Do you live in the present, or does your mind often drift to the past or future? Is that a problem? Write an essay in which you reflect on how you relate to time and the present moment.",
  },
  {
    id: "quote-helen-keller",
    title: "The best things",
    body: `"The best and most beautiful things in the world cannot be seen or even touched — they must be felt with the heart." — Helen Keller`,
    instruction:
      "What are the most important things in your life that cannot be measured or held? How do you recognise them, and how do they shape who you are?",
  },
  {
    id: "quote-gandhi",
    title: "Be the change",
    body: `"Be the change you wish to see in the world." — Mahatma Gandhi`,
    instruction:
      "What change do you wish to see in the world around you — in your school, your city, or society? What would it take for you to become the person who makes that change happen?",
  },
  {
    id: "quote-aristotle",
    title: "Excellence is a habit",
    body: `"We are what we repeatedly do. Excellence, then, is not an act, but a habit." — Aristotle`,
    instruction:
      "Think of a skill or quality you are trying to build through repeated practice. Do you believe that habits shape who we are? Write an essay that argues for or against Aristotle's idea, drawing on your own experience.",
  },
  {
    id: "quote-kafka",
    title: "Books that change us",
    body: `"A book must be the axe for the frozen sea within us." — Franz Kafka`,
    instruction:
      "Has a book, film, or piece of music ever 'cracked something open' inside you — changed how you see yourself or the world? Describe the experience and explain why it affected you so deeply.",
  },
  {
    id: "quote-sagan",
    title: "Pale blue dot",
    body: `"Our planet is a lonely speck in the great enveloping cosmic dark. In our obscurity, in all this vastness, there is no hint that help will come from elsewhere to save us from ourselves." — Carl Sagan`,
    instruction:
      "What responsibilities do we have toward one another and toward Earth, given how small and fragile our world is? Write an essay in which you reflect on what Sagan's words mean to you.",
  },
  {
    id: "quote-seneca",
    title: "How we spend our days",
    body: `"It is not that we have a short time to live, but that we waste much of it." — Seneca`,
    instruction:
      "Do you feel you use your time well? What does it mean to 'waste' time, and is it always bad? Write an essay in which you reflect on how you spend your days and what you would change.",
  },

  // ── PERSONAL THEMES ──────────────────────────────────────────────────────
  {
    id: "theme-travel",
    title: "When I travel",
    body: "Theme: When I travel.",
    instruction:
      "Write an essay on this theme. Do not change the title. Consider: Do you travel, and why? What does travel mean to you? What does it give or take from you? Formulate a thesis and support it with reasoning and examples.",
  },
  {
    id: "theme-alone",
    title: "When I am alone",
    body: "Theme: When I am alone.",
    instruction:
      "Write an essay on this theme. Do you enjoy being alone, or do you find it uncomfortable? What do you do and think when no one is watching? What does solitude reveal about you?",
  },
  {
    id: "theme-fail",
    title: "When I failed",
    body: "Theme: When I failed.",
    instruction:
      "Write an essay on this theme. Describe a time you failed at something that mattered to you. What happened? What did you feel, and what did you learn? How did failure change you?",
  },
  {
    id: "theme-helped",
    title: "When I helped",
    body: "Theme: When I helped.",
    instruction:
      "Write an essay on this theme. Describe a time when you genuinely helped someone. Why did you choose to help? What was the outcome — for them and for you? Does helping others change the helper?",
  },
  {
    id: "theme-afraid",
    title: "When I was afraid",
    body: "Theme: When I was afraid.",
    instruction:
      "Write an essay on this theme. What were you afraid of, and how did that fear affect your choices? Did you face it or avoid it? What did the experience teach you about yourself?",
  },
  {
    id: "theme-unfair",
    title: "When something was unfair",
    body: "Theme: When something was unfair.",
    instruction:
      "Write an essay on this theme. Describe a situation you found deeply unfair — at school, at home, or in the wider world. How did you respond? Do you think fairness is always possible?",
  },
  {
    id: "theme-changed-my-mind",
    title: "When I changed my mind",
    body: "Theme: When I changed my mind.",
    instruction:
      "Write an essay on this theme. Describe something you once believed strongly but no longer believe. What made you change? Is changing your mind a sign of weakness or of growth?",
  },

  // ── PERSONAL QUESTIONS ───────────────────────────────────────────────────
  {
    id: "someone-special",
    title: "Someone you would choose",
    body: "If at this moment, instead of taking the exam, you could spend your time with someone who is not a member of your family and not a close friend or relative, who would that person be and why?",
    instruction:
      "Read the question carefully. Answer in an essay and give it a title. Who would you choose to spend your time with, and what would you do or talk about?",
  },
  {
    id: "significant-book",
    title: "A book that mattered",
    body: "What is the most significant or impactful book you have read so far?",
    instruction:
      "Write an essay that explains why this book moved you — through its ideas, a character, or something you learned. What does the book mean to you? Will it still matter in thirty years?",
  },
  {
    id: "one-rule",
    title: "One rule for the world",
    body: "If you could make one rule that every person in the world had to follow, what would it be?",
    instruction:
      "Choose your rule carefully. Explain why you chose it, what problem it would solve, and what objections people might raise. Defend your position with reasoning and examples.",
  },
  {
    id: "superpower",
    title: "One ability you wish you had",
    body: "If you could have one extraordinary ability — real or imaginary — what would it be and how would you use it?",
    instruction:
      "Think beyond the obvious. What ability would you choose, and why? What problems would you solve? What responsibilities would come with it? What would you learn about yourself?",
  },
  {
    id: "letter-to-self",
    title: "A letter to your future self",
    body: "Write a letter to yourself ten years from now.",
    instruction:
      "What do you hope will have changed? What do you hope will have stayed the same? What advice would you give your future self, and what questions would you ask?",
  },
  {
    id: "place-matters",
    title: "A place that matters",
    body: "Describe a place — real or imaginary — that matters deeply to you.",
    instruction:
      "What makes this place special? Is it the people, the memories, the feeling it gives you, or something else? What would you lose if that place disappeared?",
  },
  {
    id: "admire-most",
    title: "The person I admire most",
    body: "Who do you admire most — a person you know personally, a historical figure, or a character from fiction? Why?",
    instruction:
      "Write an essay explaining who this person is, what qualities you admire in them, and what you have learned from them. How have they influenced who you are or want to be?",
  },

  // ── ETHICAL DILEMMAS ─────────────────────────────────────────────────────
  {
    id: "witness-choice",
    title: "What would you do?",
    body: `Just then the gate of a nearby house opened and a boy ran out. He looked frightened, and no wonder — five other boys were chasing him. They caught up, pushed him against the fence, and threw themselves on him. The five began to hit and shove him. He started to cry and covered his face with his hands to protect himself.`,
    instruction:
      "Imagine you are a witness to this scene. What would you do? Justify your choice in an essay. Support your position with examples from your own life. Give your essay a title.",
  },
  {
    id: "punishment",
    title: "On punishment",
    body: `"Have you ever been punished?" asked the White Queen.\n"Only for misdeeds!" replied Alice.\n"And after the punishment you were always better, I'm sure!" the Queen exclaimed.\n— Lewis Carroll, Through the Looking-Glass`,
    instruction:
      "Are punishments necessary? Does a person become better after being punished? Write an essay in response and give it a title. Support your view with examples.",
  },
  {
    id: "lie-for-good",
    title: "A good lie",
    body: "Is there such a thing as a lie that does more good than harm?",
    instruction:
      "Think of a situation where telling the truth would cause serious harm. Is it ever right to lie? Write an essay that explores the ethics of honesty and explores when, if ever, dishonesty is justified.",
  },
  {
    id: "social-media",
    title: "The price of connection",
    body: "We are more connected than ever — and yet many people feel more lonely than ever. Why?",
    instruction:
      "Explore the relationship between technology, social media, and loneliness. Do digital connections replace real ones, or do they deepen them? Support your view with examples.",
  },
  {
    id: "privacy-vs-safety",
    title: "Privacy or safety?",
    body: "Some argue that giving up personal privacy in exchange for greater safety is a reasonable trade. Others disagree strongly.",
    instruction:
      "Do you think it is acceptable to sacrifice personal privacy for the sake of security? Think about where you draw the line, and why. Support your view with reasoning and examples.",
  },

  // ── LITERATURE & POETRY ──────────────────────────────────────────────────
  {
    id: "two-roads",
    title: "Two roads",
    body: `Two roads diverged in a yellow wood,\nAnd sorry I could not travel both\nAnd be one traveler, long I stood\nAnd looked down one as far as I could\n— Robert Frost`,
    instruction:
      "What situation in life is the poet describing? Name the problem as the title of your essay. Explain how you see the solution. Support your view with personal experience.",
  },
  {
    id: "poem-desiderata",
    title: "Go placidly",
    body: `"Go placidly amid the noise and haste, and remember what peace there may be in silence. As far as possible, without surrender, be on good terms with all persons." — Max Ehrmann, Desiderata`,
    instruction:
      "Is it truly possible to be 'on good terms with all persons'? Is staying calm amid conflict a sign of wisdom or weakness? Write an essay that responds to this idea.",
  },
  {
    id: "poem-roads-not-taken",
    title: "The road not taken",
    body: `"I shall be telling this with a sigh\nSomewhere ages and ages hence:\nTwo roads diverged in a wood, and I —\nI took the one less traveled by,\nAnd that has made all the difference." — Robert Frost`,
    instruction:
      "Have you ever made a choice that went against what most people around you would have done? What was it? Did it 'make all the difference'? Write an essay about a time you chose your own path.",
  },

  // ── SOCIETY & THE WORLD ──────────────────────────────────────────────────
  {
    id: "environment",
    title: "Our responsibility to nature",
    body: "Every year, thousands of animal and plant species disappear forever. Yet most people continue their daily lives unchanged.",
    instruction:
      "Do we have a moral responsibility toward nature and future generations? What, if anything, are you personally willing to do? Write an essay that argues your position.",
  },
  {
    id: "ai-and-humans",
    title: "Machines and us",
    body: "Artificial intelligence can now write essays, paint pictures, compose music, and diagnose diseases. Some people celebrate this; others are worried.",
    instruction:
      "What does the rise of artificial intelligence mean for you personally? What can machines never replace about a human being? Write an essay that explores what makes us uniquely human.",
  },
  {
    id: "fairness",
    title: "Is life fair?",
    body: "Some people are born into wealth and opportunity; others are not. Some have good health; others are born with illness or disability.",
    instruction:
      "Is fairness possible in the world? Should we strive for it even if perfect fairness is impossible? Write an essay that argues your position and explores what a fairer world would look like.",
  },
  {
    id: "heroes",
    title: "What makes a hero?",
    body: "We use the word 'hero' to describe soldiers, athletes, activists, and even fictional characters. But what does it really mean to be a hero?",
    instruction:
      "Write an essay that defines what a hero truly is. Use examples from history, literature, or your own experience. Is heroism always dramatic, or can it be quiet and everyday?",
  },
  {
    id: "success",
    title: "What is success?",
    body: "For some, success means wealth. For others, it means happiness, contribution, or simply peace of mind.",
    instruction:
      "What does success mean to you personally? How will you know when you have achieved it? Is success something you reach, or something you live? Write an essay that defines your own vision of success.",
  },
  {
    id: "tradition-vs-change",
    title: "Tradition or progress?",
    body: "Every generation faces the tension between preserving what has been inherited and changing what no longer serves the present.",
    instruction:
      "Do you think it is important to preserve traditions? When should tradition give way to change? Use examples from your own life, culture, or the wider world.",
  },
  {
    id: "childhood",
    title: "The end of childhood",
    body: "At what point does childhood end and adulthood begin? Is it an age, an event, a feeling, or a choice?",
    instruction:
      "Write an essay that explores what childhood means to you. Was there a moment when you felt you had left it behind? Was that moment welcome, or did you resist it?",
  },
  {
    id: "gratitude",
    title: "Things we take for granted",
    body: "Often we only appreciate something after we lose it — clean water, health, a person, a place, a feeling.",
    instruction:
      "Write an essay about something in your life that you now realise you were taking for granted. What changed your perspective? How do you think differently because of it?",
  },
  {
    id: "goal-first-step",
    title: "Your goal and your first step",
    body: "Describe a goal or dream you have. What is the first step you would take toward it? How would you plan the rest so you stay motivated?",
    instruction:
      "Think of a goal that genuinely matters to you. What makes it worth pursuing? What obstacles will you face, and how will you stay motivated when progress is slow?",
  },
  {
    id: "language-identity",
    title: "Language and who we are",
    body: "The language you speak shapes the way you think, the way you see the world, and even the way you feel.",
    instruction:
      "Do you agree that language shapes identity? If you speak more than one language, does your personality feel different in each? Write an essay that explores the relationship between language and who we are.",
  },
  {
    id: "kindness-strength",
    title: "Is kindness a strength?",
    body: "In a competitive world, some see kindness as a weakness — something that can be taken advantage of. Others believe the opposite.",
    instruction:
      "Is kindness a strength or a vulnerability? Write an essay that argues your view. Use examples from your own experience, or from people you admire.",
  },
];

/** Pick n random prompts without repetition */
export function pickRandomPrompts(n: number): EssayPrompt[] {
  const shuffled = [...ESSAY_PROMPTS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

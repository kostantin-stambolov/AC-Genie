import { redirect } from "next/navigation";
import { getSessionUserId } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NavHeader } from "@/components/NavHeader";
import { EssayFeedbackSection } from "./EssayFeedbackSection";

type Props = { searchParams: Promise<{ attemptId?: string }> };

type ParsedPrompt = { title: string; instruction: string; body: string };

function parsePrompt(promptText: string | null): ParsedPrompt | null {
  if (!promptText) return null;
  try {
    const p = JSON.parse(promptText) as { title?: string; instruction?: string; body?: string };
    return {
      title: p.title ?? "Essay",
      instruction: p.instruction ?? "",
      body: p.body ?? "",
    };
  } catch {
    return { title: "Essay", instruction: promptText, body: "" };
  }
}

function isQuote(body: string) {
  return body.includes("—") || body.startsWith('"') || body.startsWith("\u201C");
}

/**
 * Parse an instruction string into an array of segments.
 *
 * Handles two patterns:
 *  A) Inline numbered steps: "Do X. (1) First thing. (2) Second thing."
 *     → returns a lead sentence + numbered items
 *  B) Multiple sentences that each end with "?"
 *     → each question becomes its own item
 *  C) Plain prose → single paragraph item
 */
type InstructionSegment =
  | { kind: "prose"; text: string }
  | { kind: "numbered"; lead: string; items: string[] }
  | { kind: "questions"; items: string[] };

function parseInstruction(raw: string): InstructionSegment {
  // A) Numbered pattern: (1) ... (2) ...
  const numberedRe = /\((\d+)\)/g;
  const matches = [...raw.matchAll(numberedRe)];
  if (matches.length >= 2) {
    const firstIdx = raw.indexOf(matches[0][0]);
    const lead = raw.slice(0, firstIdx).trim();
    const items: string[] = [];
    for (let i = 0; i < matches.length; i++) {
      const start = raw.indexOf(matches[i][0]) + matches[i][0].length;
      const end = i + 1 < matches.length ? raw.indexOf(matches[i + 1][0]) : raw.length;
      items.push(raw.slice(start, end).trim());
    }
    return { kind: "numbered", lead, items };
  }

  // B) Multiple questions (≥ 2 sentences ending with "?")
  const sentences = raw.split(/(?<=[.?!])\s+/);
  const questions = sentences.filter((s) => s.trim().endsWith("?"));
  if (questions.length >= 2) {
    const nonQ = sentences.filter((s) => !s.trim().endsWith("?")).join(" ").trim();
    const allItems = nonQ ? [nonQ, ...questions] : questions;
    return { kind: "questions", items: allItems };
  }

  // C) Plain prose
  return { kind: "prose", text: raw };
}

function InstructionBlock({ instruction }: { instruction: string }) {
  const seg = parseInstruction(instruction);

  return (
    <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm px-5 py-5">
      <p className="text-[10px] font-bold text-violet-500 uppercase tracking-widest mb-3">
        Your task
      </p>

      {seg.kind === "numbered" && (
        <div className="space-y-3">
          {seg.lead && (
            <p className="text-neutral-700 text-[15px] leading-relaxed">{seg.lead}</p>
          )}
          <ol className="space-y-2.5">
            {seg.items.map((item, i) => (
              <li key={i} className="flex gap-3">
                <span className="shrink-0 w-6 h-6 rounded-full bg-violet-100 text-violet-700 text-xs font-bold flex items-center justify-center mt-0.5">
                  {i + 1}
                </span>
                <p className="text-neutral-700 text-[15px] leading-relaxed">{item}</p>
              </li>
            ))}
          </ol>
        </div>
      )}

      {seg.kind === "questions" && (
        <ul className="space-y-2.5">
          {seg.items.map((item, i) => (
            <li key={i} className="flex gap-3">
              <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-violet-400 mt-2.5" />
              <p className="text-neutral-700 text-[15px] leading-relaxed">{item}</p>
            </li>
          ))}
        </ul>
      )}

      {seg.kind === "prose" && (
        <p className="text-neutral-700 text-[15px] leading-relaxed">{seg.text}</p>
      )}
    </div>
  );
}

export default async function Part1Page({ searchParams }: Props) {
  const userId = await getSessionUserId();
  if (!userId) redirect("/login");

  const { attemptId } = await searchParams;
  if (!attemptId) redirect("/home");

  const attempt = await prisma.attempt.findFirst({
    where: { id: attemptId, userId, part: 1, section: null, status: "in_progress" },
  });
  if (!attempt) redirect("/home");

  const prompt = parsePrompt(attempt.promptText);

  return (
    <div className="min-h-screen bg-[#f7f8fa]">
      <NavHeader backHref="/home" backLabel="Home" title="Essay" />
      <main className="max-w-2xl mx-auto px-4 py-8">

        {prompt ? (
          <div className="mb-6 space-y-3">
            {/* Title */}
            <h1 className="text-2xl font-bold text-neutral-900 leading-tight">{prompt.title}</h1>

            {/* Body — styled quote or plain prompt */}
            {prompt.body && (
              isQuote(prompt.body) ? (
                <div className="bg-white rounded-2xl border border-violet-100 shadow-sm px-5 py-5">
                  <span className="block text-4xl text-violet-200 font-serif leading-none mb-2 select-none">&ldquo;</span>
                  <p className="text-neutral-800 text-base leading-relaxed italic whitespace-pre-wrap px-1">
                    {prompt.body}
                  </p>
                </div>
              ) : (
                <div className="bg-violet-50 border border-violet-100 rounded-2xl px-5 py-4">
                  <p className="text-neutral-700 text-[15px] leading-relaxed whitespace-pre-wrap">
                    {prompt.body}
                  </p>
                </div>
              )
            )}

            {/* Instruction — formatted task card */}
            {prompt.instruction && (
              <InstructionBlock instruction={prompt.instruction} />
            )}
          </div>
        ) : (
          <div className="rounded-2xl bg-amber-50 border border-amber-200 p-5 mb-6 text-sm text-amber-800">
            No topic loaded. Go back to home and start a new essay.
          </div>
        )}

        <EssayFeedbackSection
          attemptId={attemptId}
          initialBody={attempt.essayBody ?? ""}
        />
      </main>
    </div>
  );
}

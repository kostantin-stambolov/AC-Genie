import { NextResponse } from "next/server";

/**
 * Simple check that env is loaded. Use to verify OPENAI_API_KEY is set on the host.
 * Does not expose the key.
 */
export async function GET() {
  const hasOpenAI = !!process.env.OPENAI_API_KEY?.trim();
  return NextResponse.json({
    openaiConfigured: hasOpenAI,
    message: hasOpenAI
      ? "OPENAI_API_KEY is set."
      : "OPENAI_API_KEY is missing or empty. Add it in Railway → Variables and redeploy.",
  });
}

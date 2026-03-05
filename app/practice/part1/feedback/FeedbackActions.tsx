"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkles, RotateCcw } from "@/components/icons";
import { RewriteModal } from "./RewriteModal";

type Props = { attemptId: string };

export function FeedbackActions({ attemptId }: Props) {
  const [rewriteOpen, setRewriteOpen] = useState(false);

  return (
    <>
      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={() => setRewriteOpen(true)}
          className="flex items-center justify-center gap-2 w-full h-12 rounded-xl bg-violet-600 text-white text-sm font-semibold hover:bg-violet-700 active:scale-[0.98] transition cursor-pointer"
        >
          <Sparkles size={16} /> See model essay
        </button>
        <Link
          href={`/practice/part1?attemptId=${attemptId}`}
          className="flex items-center justify-center gap-2 w-full h-12 rounded-xl border border-neutral-200 bg-white text-neutral-700 text-sm font-semibold hover:bg-neutral-50 active:scale-[0.98] transition cursor-pointer"
        >
          <RotateCcw size={15} /> Try again
        </Link>
      </div>

      <RewriteModal
        attemptId={attemptId}
        open={rewriteOpen}
        onClose={() => setRewriteOpen(false)}
      />
    </>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
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
          className="block w-full h-12 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700"
        >
          Rewrite the Essay
        </button>
        <Link
          href={`/practice/part1?attemptId=${attemptId}`}
          className="block w-full h-12 rounded-lg border border-neutral-300 bg-white text-neutral-700 font-medium text-center flex items-center justify-center hover:bg-neutral-50"
        >
          Try Again
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

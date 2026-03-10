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
        <Link
          href={`/practice/part1?attemptId=${attemptId}`}
          className="flex items-center justify-center gap-2 w-full h-[52px] rounded-2xl bg-[#0B1F3A] text-white text-[15px] font-semibold hover:bg-[#122a50] hover:-translate-y-0.5 shadow-md transition-all cursor-pointer"
        >
          <RotateCcw size={15} /> Опитай отново
        </Link>
        <button
          type="button"
          onClick={() => setRewriteOpen(true)}
          className="flex items-center justify-center gap-2 w-full h-[50px] rounded-2xl bg-[#F3F4F6] text-[#6B7280] text-[15px] font-normal hover:bg-[#E5E7EB] transition cursor-pointer"
        >
          <Sparkles size={16} /> Виж примерно есе
        </button>
      </div>

      <RewriteModal
        attemptId={attemptId}
        open={rewriteOpen}
        onClose={() => setRewriteOpen(false)}
      />
    </>
  );
}

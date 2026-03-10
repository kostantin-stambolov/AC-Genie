"use client";

import { useState, useRef, useCallback } from "react";
import { Mic, StopCircle } from "@/components/icons";

type Props = {
  attemptId: string;
  initialBody: string;
  onBodyChange?: (body: string) => void;
};

export function EssayEditor({ attemptId, initialBody, onBodyChange }: Props) {
  const [body, setBody] = useState(initialBody);
  const [saving, setSaving] = useState(false);
  const [dictating, setDictating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [transcribeError, setTranscribeError] = useState<string | null>(null);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const saveBody = useCallback(
    async (newBody: string) => {
      setSaving(true);
      try {
        await fetch(`/api/attempts/${attemptId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ essayBody: newBody }),
        });
      } finally {
        setSaving(false);
      }
    },
    [attemptId]
  );

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setBody(value);
    onBodyChange?.(value);
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => saveBody(value), 800);
  };

  const appendTranscription = (text: string) => {
    const newBody = body ? `${body}\n\n${text}` : text;
    setBody(newBody);
    onBodyChange?.(newBody);
    saveBody(newBody);
  };

  const startDictation = async () => {
    setTranscribeError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];
      recorder.ondataavailable = (e) => { if (e.data.size) chunksRef.current.push(e.data); };
      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType });
        setDictating(false);
        setUploading(true);
        const formData = new FormData();
        formData.append("audio", blob, "recording.webm");
        try {
          const res = await fetch("/api/transcribe", { method: "POST", body: formData });
          const data = await res.json().catch(() => ({}));
          if (res.ok && typeof data.text === "string") {
            appendTranscription(data.text);
          } else {
            setTranscribeError(data.error || "Транскрипцията не е налична.");
          }
        } catch {
          setTranscribeError("Качването не бе успешно.");
        } finally {
          setUploading(false);
        }
      };
      recorder.start(1000);
      setDictating(true);
    } catch {
      setTranscribeError("Достъпът до микрофона е отказан или недостъпен.");
    }
  };

  const stopDictation = () => {
    const rec = mediaRecorderRef.current;
    if (rec && rec.state !== "inactive") rec.stop();
  };

  const wordCount = body.trim() ? body.trim().split(/\s+/).length : 0;

  return (
    <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden">
      {/* Toolbar row — always visible at the top */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-neutral-100 bg-neutral-50/60">
        <div className="flex items-center gap-2 text-xs text-neutral-400">
          <span>{wordCount} {wordCount === 1 ? "дума" : "думи"}</span>
          {saving && <span className="animate-pulse">· Записва…</span>}
          {uploading && (
            <span className="flex items-center gap-1 text-violet-500">
              <span className="w-3 h-3 border border-violet-400 border-t-transparent rounded-full animate-spin inline-block" />
              Транскрибира…
            </span>
          )}
        </div>

        {/* Dictation button — top right, always visible */}
        {!dictating ? (
          <button
            type="button"
            onClick={startDictation}
            disabled={uploading}
            title="Диктувай — говори и текстът ще се добави автоматично"
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-neutral-200 bg-white text-neutral-600 text-xs font-medium hover:border-violet-300 hover:text-violet-600 hover:bg-violet-50 transition disabled:opacity-50 cursor-pointer"
          >
            <Mic size={14} />
            <span className="hidden sm:inline">Диктувай</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={stopDictation}
            title="Спри записа"
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-semibold cursor-pointer animate-pulse"
          >
            <StopCircle size={14} />
            <span className="hidden sm:inline">Спри</span>
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 sm:hidden" />
          </button>
        )}
      </div>

      {/* Textarea */}
      <textarea
        value={body}
        onChange={handleChange}
        placeholder="Започни да пишеш тук…"
        className="w-full min-h-[300px] p-5 text-neutral-800 text-[15px] leading-relaxed placeholder:text-neutral-300 focus:outline-none resize-none block"
        aria-label="Текст на есето"
      />

      {transcribeError && (
        <div className="px-5 py-3 border-t border-amber-100 bg-amber-50/50">
          <p className="text-xs text-amber-700">{transcribeError}</p>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useRef, useCallback } from "react";

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
        const res = await fetch(`/api/attempts/${attemptId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ essayBody: newBody }),
        });
        if (!res.ok) return;
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
      recorder.ondataavailable = (e) => {
        if (e.data.size) chunksRef.current.push(e.data);
      };
      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType });
        setDictating(false);
        const formData = new FormData();
        formData.append("audio", blob, "recording.webm");
        setUploading(true);
        try {
          const res = await fetch("/api/transcribe", {
            method: "POST",
            body: formData,
          });
          const data = await res.json().catch(() => ({}));
          if (res.ok && typeof data.text === "string") {
            appendTranscription(data.text);
          } else {
            setTranscribeError(data.error || "Transcription not available. Add an API key (see docs).");
          }
        } catch {
          setTranscribeError("Upload failed.");
        } finally {
          setUploading(false);
        }
      };
      recorder.start(1000);
      setDictating(true);
    } catch {
      setTranscribeError("Microphone access denied or not available.");
    }
  };

  const stopDictation = () => {
    const rec = mediaRecorderRef.current;
    if (rec && rec.state !== "inactive") rec.stop();
  };

  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-4 space-y-4">
      <textarea
        value={body}
        onChange={handleChange}
        placeholder="Write your essay here. You can also use the button below to dictate."
        className="w-full min-h-[240px] p-3 rounded-lg border border-neutral-200 bg-neutral-50 text-neutral-800 text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        aria-label="Essay text"
      />
      {saving && <p className="text-xs text-neutral-500">Saving…</p>}

      <div className="pt-2 border-t border-neutral-100">
        <p className="text-xs font-medium text-neutral-500 mb-2">Or add by voice</p>
        <div className="flex flex-wrap gap-2 items-center">
        {!dictating ? (
          <button
            type="button"
            onClick={startDictation}
            disabled={uploading}
            className="h-10 px-4 rounded-lg border border-neutral-300 bg-white text-neutral-700 text-sm font-medium hover:bg-neutral-50 disabled:opacity-50"
          >
            🎤 Dictate
          </button>
        ) : (
          <button
            type="button"
            onClick={stopDictation}
            className="h-10 px-4 rounded-lg bg-red-100 text-red-800 text-sm font-medium"
          >
            ⏹ Stop recording
          </button>
        )}
        {(uploading || dictating) && (
          <span className="text-sm text-neutral-500">
            {dictating ? "Recording…" : "Transcribing…"}
          </span>
        )}
        </div>
      </div>
      {transcribeError && (
        <p className="text-sm text-amber-700" role="alert">
          {transcribeError}
        </p>
      )}
    </div>
  );
}

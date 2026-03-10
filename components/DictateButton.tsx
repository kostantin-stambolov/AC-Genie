"use client";

import { useRef, useState } from "react";
import { Mic, StopCircle } from "@/components/icons";

type Props = {
  onTranscribed: (text: string) => void;
};

export function DictateButton({ onTranscribed }: Props) {
  const [dictating, setDictating]   = useState(false);
  const [uploading, setUploading]   = useState(false);
  const [error, setError]           = useState<string | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef   = useRef<Blob[]>([]);

  async function start() {
    setError(null);
    try {
      const stream   = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      recorderRef.current = recorder;
      chunksRef.current   = [];
      recorder.ondataavailable = (e) => { if (e.data.size) chunksRef.current.push(e.data); };
      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType });
        setDictating(false);
        setUploading(true);
        try {
          const form = new FormData();
          form.append("audio", blob, "recording.webm");
          const res  = await fetch("/api/transcribe", { method: "POST", body: form });
          const data = await res.json().catch(() => ({}));
          if (res.ok && typeof data.text === "string") {
            onTranscribed(data.text);
          } else {
            setError(data.error || "Грешка при транскрипция.");
          }
        } catch {
          setError("Качването не бе успешно.");
        } finally {
          setUploading(false);
        }
      };
      recorder.start(1000);
      setDictating(true);
    } catch {
      setError("Достъпът до микрофона е отказан.");
    }
  }

  function stop() {
    const rec = recorderRef.current;
    if (rec && rec.state !== "inactive") rec.stop();
  }

  return (
    <span className="inline-flex flex-col items-end gap-0.5">
      {dictating ? (
        <button
          type="button"
          onClick={stop}
          title="Спри записа"
          className="inline-flex items-center gap-1 h-7 px-2.5 rounded-lg bg-red-50 border border-red-200 text-red-600 text-[12px] font-semibold animate-pulse cursor-pointer"
        >
          <StopCircle size={13} />
          Спри
        </button>
      ) : (
        <button
          type="button"
          onClick={start}
          disabled={uploading}
          title="Диктувай — говори и текстът ще се добави"
          className="inline-flex items-center gap-1 h-7 px-2.5 rounded-lg border border-[#E5E7EB] bg-white text-[#6B7280] text-[12px] font-medium hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50 transition disabled:opacity-50 cursor-pointer"
        >
          {uploading
            ? <span className="w-3 h-3 border border-indigo-400 border-t-transparent rounded-full animate-spin" />
            : <Mic size={13} />}
          <span>{uploading ? "Транскрибира…" : "Диктувай"}</span>
        </button>
      )}
      {error && <span className="text-[11px] text-red-500 max-w-[140px] text-right">{error}</span>}
    </span>
  );
}

"use client";

import { useState, useEffect, useRef } from "react";

type Props = {
  durationSeconds?: number;
  initialElapsedSeconds?: number;
  onTimeUp?: () => void;
  onTick?: (elapsedSeconds: number) => void;
  tickSaveIntervalSeconds?: number;
};

export function CountdownTimer({
  durationSeconds = 1200,
  initialElapsedSeconds = 0,
  onTimeUp,
  onTick,
  tickSaveIntervalSeconds = 60,
}: Props) {
  const [elapsed, setElapsed] = useState(initialElapsedSeconds);
  const [timeUpFired, setTimeUpFired] = useState(initialElapsedSeconds >= durationSeconds);
  const lastSaveRef = useRef(initialElapsedSeconds);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (elapsed >= durationSeconds) return;

    intervalRef.current = setInterval(() => {
      setElapsed((prev) => {
        const next = prev + 1;
        if (next - lastSaveRef.current >= tickSaveIntervalSeconds) {
          lastSaveRef.current = next;
          onTick?.(next);
        }
        if (next >= durationSeconds) {
          clearInterval(intervalRef.current!);
        }
        return next;
      });
    }, 1000);

    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (elapsed >= durationSeconds && !timeUpFired) {
      setTimeUpFired(true);
      onTimeUp?.();
    }
  }, [elapsed, durationSeconds, timeUpFired, onTimeUp]);

  const remaining = Math.max(0, durationSeconds - elapsed);
  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const display = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  const pct = Math.min(1, elapsed / durationSeconds);

  let colorClass = "text-neutral-700";
  let bgClass = "bg-neutral-100";
  let ringClass = "ring-neutral-200";
  if (remaining <= 120) { colorClass = "text-red-700"; bgClass = "bg-red-50"; ringClass = "ring-red-200"; }
  else if (remaining <= 300) { colorClass = "text-amber-700"; bgClass = "bg-amber-50"; ringClass = "ring-amber-200"; }

  return (
    <div className={`inline-flex items-center gap-3 rounded-2xl px-4 py-2.5 ring-1 ${bgClass} ${ringClass}`}>
      <div className="relative w-8 h-8 shrink-0">
        <svg viewBox="0 0 36 36" className="w-8 h-8 -rotate-90">
          <circle cx="18" cy="18" r="15" fill="none" stroke="currentColor" strokeWidth="3" className="text-neutral-200" />
          <circle
            cx="18" cy="18" r="15" fill="none" stroke="currentColor" strokeWidth="3"
            strokeDasharray={`${pct * 94.25} 94.25`}
            className={remaining <= 120 ? "text-red-500" : remaining <= 300 ? "text-amber-500" : "text-violet-500"}
          />
        </svg>
      </div>
      <div>
        <p className={`text-xl font-bold leading-none tabular-nums ${colorClass}`}>{display}</p>
        <p className={`text-[10px] font-semibold uppercase tracking-widest mt-0.5 ${colorClass} opacity-60`}>оставащо</p>
      </div>
    </div>
  );
}

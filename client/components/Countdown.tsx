"use client";

import { useEffect, useState } from "react";

function remainingSeconds(target: number) {
  return Math.max(0, Math.floor((target - Date.now()) / 1000));
}

const pad = (n: number) => String(n).padStart(2, "0");

function Cell({ v }: { v: string }) {
  return (
    <span className="inline-flex min-w-7 items-center justify-center rounded-sm bg-primary-700 px-1.5 py-0.5 text-xs font-bold tabular-nums text-white">
      {v}
    </span>
  );
}

/** Rolling HH : MM : SS countdown to the next midnight. */
export function Countdown({ className = "" }: { className?: string }) {
  // -1 = not yet measured, so server + first client render stay identical (no hydration mismatch).
  const [secs, setSecs] = useState(-1);

  useEffect(() => {
    const d = new Date();
    d.setHours(23, 59, 59, 999);
    const target = d.getTime();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSecs(remainingSeconds(target));
    const id = setInterval(() => setSecs(remainingSeconds(target)), 1000);
    return () => clearInterval(id);
  }, []);

  if (secs < 0) {
    return (
      <div className={`inline-flex items-center gap-1 ${className}`} aria-label="Flash deals end soon">
        <Cell v="--" />
        <span className="font-bold text-neutral-400">:</span>
        <Cell v="--" />
        <span className="font-bold text-neutral-400">:</span>
        <Cell v="--" />
      </div>
    );
  }

  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;

  return (
    <div className={`inline-flex items-center gap-1 ${className}`} aria-label="Flash deals end soon">
      <Cell v={pad(h)} />
      <span className="font-bold text-neutral-400">:</span>
      <Cell v={pad(m)} />
      <span className="font-bold text-neutral-400">:</span>
      <Cell v={pad(s)} />
    </div>
  );
}

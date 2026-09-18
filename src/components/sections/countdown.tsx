"use client";

import { useEffect, useState } from "react";

export function Countdown({ to, label }: { to: string; label?: string }) {
  const [t, setT] = useState<{ d: number; h: number; m: number; s: number } | null>(null);
  useEffect(() => {
    const target = new Date(to).getTime();
    const tick = () => {
      const diff = Math.max(0, target - Date.now());
      setT({ d: Math.floor(diff / 86400000), h: Math.floor((diff / 3600000) % 24), m: Math.floor((diff / 60000) % 60), s: Math.floor((diff / 1000) % 60) });
    };
    tick();
    const i = setInterval(tick, 1000);
    return () => clearInterval(i);
  }, [to]);
  const cells = [
    ["Days", t?.d],
    ["Hours", t?.h],
    ["Min", t?.m],
    ["Sec", t?.s],
  ] as const;
  return (
    <div>
      {label && <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-sun-300">{label}</p>}
      <div className="grid grid-cols-4 gap-2 sm:gap-3">
        {cells.map(([l, v]) => (
          <div key={l} className="rounded-2xl border border-white/15 bg-white/10 px-2 py-3 text-center backdrop-blur sm:px-4 sm:py-4">
            <p className="font-display text-2xl font-extrabold tabular-nums sm:text-4xl">{v === undefined ? "--" : String(v).padStart(2, "0")}</p>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-white/60">{l}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

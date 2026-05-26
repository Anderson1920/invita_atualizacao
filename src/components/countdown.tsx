"use client";

import { useEffect, useMemo, useState } from "react";

export function Countdown({ date, time }: { date: string; time: string }) {
  const target = useMemo(() => new Date(`${date}T${time}:00`).getTime(), [date, time]);
  const [remaining, setRemaining] = useState(() => target - Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setRemaining(target - Date.now()), 1000);

    return () => window.clearInterval(timer);
  }, [target]);

  const safe = Math.max(remaining, 0);
  const days = Math.floor(safe / 86_400_000);
  const hours = Math.floor((safe % 86_400_000) / 3_600_000);
  const minutes = Math.floor((safe % 3_600_000) / 60_000);
  const seconds = Math.floor((safe % 60_000) / 1000);

  return (
    <div className="grid grid-cols-4 gap-2">
      <Tile label="dias" value={days} />
      <Tile label="horas" value={hours} />
      <Tile label="min" value={minutes} />
      <Tile label="seg" value={seconds} />
    </div>
  );
}

function Tile({ value, label }: { value: number; label: string }) {
  return (
    <div className="rounded-2xl bg-white/80 p-3 text-center shadow-sm">
      <strong className="block text-2xl text-violet-950">{String(value).padStart(2, "0")}</strong>
      <span className="text-xs uppercase tracking-[0.18em] text-violet-500">{label}</span>
    </div>
  );
}

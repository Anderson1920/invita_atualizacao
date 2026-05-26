import type { LucideIcon } from "lucide-react";

export function StatCard({
  label,
  value,
  helper,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  helper: string;
  icon: LucideIcon;
}) {
  return (
    <article className="rounded-[24px] border border-white/80 bg-white/88 p-5 shadow-[0_18px_55px_rgba(88,28,135,0.08)] backdrop-blur">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-zinc-500">{label}</p>
          <strong className="mt-3 block text-3xl font-semibold text-violet-950">{value}</strong>
        </div>
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-violet-100 text-violet-800">
          <Icon className="h-5 w-5" />
        </span>
      </div>
      <p className="mt-5 text-sm leading-6 text-zinc-500">{helper}</p>
    </article>
  );
}

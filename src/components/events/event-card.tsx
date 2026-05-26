import Link from "next/link";
import { CalendarDays, MapPin, UsersRound } from "lucide-react";
import { eventTheme, eventTypeLabels } from "@/lib/constants";
import { shortDate } from "@/lib/format";
import type { EventRecord } from "@/lib/types";

export function EventCard({ event, guests = 0 }: { event: EventRecord; guests?: number }) {
  const theme = eventTheme[event.type];

  return (
    <Link
      href={`/host/eventos/${event.id}`}
      className="group overflow-hidden rounded-[26px] border border-white/80 bg-white shadow-[0_18px_50px_rgba(88,28,135,0.1)] transition hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(88,28,135,0.16)]"
    >
      <div className="relative h-44 overflow-hidden">
        <img src={event.heroImageUrl} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-violet-950/80 via-violet-950/20 to-transparent" />
        <span
          className={`absolute left-4 top-4 rounded-full bg-gradient-to-r ${theme.accent} px-3 py-1 text-xs font-semibold text-white shadow-lg`}
        >
          {eventTypeLabels[event.type]}
        </span>
        <h3 className="absolute bottom-4 left-4 right-4 text-2xl font-semibold text-white">{event.name}</h3>
      </div>
      <div className="space-y-3 p-5">
        <p className="line-clamp-2 text-sm leading-6 text-zinc-600">{event.description}</p>
        <div className="grid gap-2 text-sm text-zinc-500">
          <span className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-violet-500" />
            {shortDate(event.date)} as {event.time}
          </span>
          <span className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-violet-500" />
            {event.location}
          </span>
          <span className="flex items-center gap-2">
            <UsersRound className="h-4 w-4 text-violet-500" />
            {guests} convidados
          </span>
        </div>
      </div>
    </Link>
  );
}

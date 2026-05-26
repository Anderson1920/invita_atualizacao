"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { CalendarDays, MapPin, Pencil, Trash2, UsersRound } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { StatCard } from "@/components/dashboard/stat-card";
import { GuestManager } from "@/components/events/guest-manager";
import { PhotoGallery } from "@/components/photo-gallery";
import { eventTheme, eventTypeLabels } from "@/lib/constants";
import { demoEvents, demoGuests, demoPhotos } from "@/lib/demo-data";
import { shortDate } from "@/lib/format";

export default function HostEventDetailPage() {
  const params = useParams<{ eventId: string }>();
  const event = demoEvents.find((item) => item.id === params.eventId) || demoEvents[0];
  const guests = demoGuests.filter((guest) => guest.eventId === event.id);
  const photos = demoPhotos.filter((photo) => photo.eventId === event.id);
  const theme = eventTheme[event.type];

  return (
    <ProtectedRoute roles={["HOST", "ADMIN"]}>
      <AppShell>
        <div className="mx-auto max-w-7xl space-y-6">
          <header className="overflow-hidden rounded-[32px] border border-white/80 bg-white shadow-[0_22px_70px_rgba(88,28,135,0.12)]">
            <div className="relative min-h-[340px]">
              <img src={event.heroImageUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-violet-950 via-violet-950/45 to-transparent" />
              <div className="relative flex min-h-[340px] flex-col justify-end p-5 text-white sm:p-8">
                <span className={`mb-4 w-max rounded-full bg-gradient-to-r ${theme.accent} px-3 py-1 text-xs font-semibold`}>
                  {eventTypeLabels[event.type]}
                </span>
                <h1 className="max-w-3xl text-5xl font-semibold">{event.name}</h1>
                <div className="mt-5 flex flex-wrap gap-3 text-sm text-violet-100">
                  <span className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4" />
                    {shortDate(event.date)} as {event.time}
                  </span>
                  <span className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {event.location}
                  </span>
                </div>
                <div className="mt-6 flex flex-wrap gap-3">
                  <button className="grid h-11 w-11 place-items-center rounded-2xl bg-white text-violet-950" title="Editar evento">
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button className="grid h-11 w-11 place-items-center rounded-2xl bg-white text-rose-600" title="Excluir evento">
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <Link
                    href={`/album/${event.id}`}
                    className="flex h-11 items-center rounded-2xl bg-white px-4 text-sm font-semibold text-violet-950"
                  >
                    Album publico
                  </Link>
                </div>
              </div>
            </div>
          </header>

          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Convidados" value={guests.length} helper="Total cadastrado" icon={UsersRound} />
            <StatCard label="Confirmados" value={guests.filter((guest) => guest.status !== "pending").length} helper="RSVP atualizado" icon={CalendarDays} />
            <StatCard label="Check-ins" value={guests.filter((guest) => guest.status === "checked_in").length} helper="Entradas realizadas" icon={MapPin} />
            <StatCard label="Fotos" value={photos.length} helper="Arquivos no album" icon={Pencil} />
          </section>

          <GuestManager eventId={event.id} initialGuests={guests} />
          <PhotoGallery eventId={event.id} photos={photos} hostMode />
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}

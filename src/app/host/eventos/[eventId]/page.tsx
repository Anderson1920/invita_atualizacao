"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { CalendarDays, MapPin, Pencil, Trash2 } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { StatCard } from "@/components/dashboard/stat-card";
import { GuestManager } from "@/components/events/guest-manager";
import { PhotoGallery } from "@/components/photo-gallery";
import { eventTheme, eventTypeLabels } from "@/lib/constants";
import { shortDate } from "@/lib/format";
import type { EventRecord, GuestRecord, PhotoRecord } from "@/lib/types";

export default function HostEventDetailPage() {
  const params = useParams<{ eventId: string }>();
  const router = useRouter();
  const [event, setEvent] = useState<EventRecord | null>(null);
  const [guests, setGuests] = useState<GuestRecord[]>([]);
  const [photos, setPhotos] = useState<PhotoRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const [eventRes, guestsRes] = await Promise.all([
          fetch(`/api/host/events?eventId=${params.eventId}`),
          fetch(`/api/host/guests?eventId=${params.eventId}`),
        ]);
        const [eventData, guestsData] = await Promise.all([
          eventRes.json(),
          guestsRes.json(),
        ]);

        if (eventData.ok && eventData.data.length > 0) {
          const found = eventData.data.find((e: EventRecord) => e.id === params.eventId);
          setEvent(found || eventData.data[0]);
        }
        if (guestsData.ok) setGuests(guestsData.data);
      } catch (err) {
        setError("Erro ao carregar evento.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [params.eventId]);

  async function handleDelete() {
    if (!confirm("Tem certeza que deseja excluir este evento?")) return;
    setDeleting(true);
    try {
      const res = await fetch("/api/host/events", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId: params.eventId }),
      });
      if (res.ok) router.push("/host");
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <ProtectedRoute roles={["HOST", "ADMIN"]}>
        <AppShell>
          <div className="mx-auto max-w-7xl space-y-6">
            <div className="h-[340px] animate-pulse rounded-[32px] bg-violet-50" />
            <div className="grid gap-4 sm:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-28 animate-pulse rounded-2xl bg-violet-50" />)}
            </div>
          </div>
        </AppShell>
      </ProtectedRoute>
    );
  }

  if (error || !event) {
    return (
      <ProtectedRoute roles={["HOST", "ADMIN"]}>
        <AppShell>
          <div className="mx-auto max-w-7xl">
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              {error || "Evento nao encontrado."}
            </div>
          </div>
        </AppShell>
      </ProtectedRoute>
    );
  }

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
                  <Link
                    href={`/host/eventos/${event.id}/editar`}
                    className="grid h-11 w-11 place-items-center rounded-2xl bg-white text-violet-950"
                    title="Editar evento"
                  >
                    <Pencil className="h-4 w-4" />
                  </Link>
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="grid h-11 w-11 place-items-center rounded-2xl bg-white text-rose-600 disabled:opacity-50"
                    title="Excluir evento"
                  >
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
            <StatCard label="Convidados" value={guests.length} helper="Total cadastrado" icon={CalendarDays} />
            <StatCard label="Confirmados" value={guests.filter((g) => g.status !== "pending").length} helper="RSVP atualizado" icon={CalendarDays} />
            <StatCard label="Check-ins" value={guests.filter((g) => g.status === "checked_in").length} helper="Entradas realizadas" icon={MapPin} />
            <StatCard label="Fotos" value={photos.length} helper="Arquivos no album" icon={Pencil} />
          </section>

          <GuestManager eventId={event.id} initialGuests={guests} />
          <PhotoGallery eventId={event.id} photos={photos} hostMode />
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}

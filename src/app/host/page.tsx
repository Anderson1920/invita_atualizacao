"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CalendarPlus, CheckCircle2, Image, QrCode, UsersRound } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { StatCard } from "@/components/dashboard/stat-card";
import { EventCard } from "@/components/events/event-card";
import { ReceptionistManager } from "@/components/host/receptionist-manager";
import type { EventRecord, HostMetrics } from "@/lib/types";

export default function HostDashboardPage() {
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [metrics, setMetrics] = useState<HostMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [eventsRes, metricsRes] = await Promise.all([
          fetch("/api/host/events"),
          fetch("/api/host/metrics"),
        ]);
        const [eventsData, metricsData] = await Promise.all([
          eventsRes.json(),
          metricsRes.json(),
        ]);
        if (eventsData.ok) setEvents(eventsData.data);
        if (metricsData.ok) setMetrics(metricsData.data);
      } catch (err) {
        setError("Erro ao carregar dados.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  async function handleDeleteEvent(eventId: string) {
    if (!confirm("Tem certeza que deseja excluir este evento?")) return;
    try {
      const res = await fetch("/api/host/events", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId }),
      });
      if (res.ok) {
        setEvents((prev) => prev.filter((e) => e.id !== eventId));
      }
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <ProtectedRoute roles={["HOST", "ADMIN"]}>
      <AppShell>
        <div className="mx-auto max-w-7xl space-y-6">
          <header className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-900">
                Painel Host
              </span>
              <h1 className="mt-4 text-4xl font-semibold text-violet-950">Seus eventos</h1>
            </div>
            <Link
              href="/host/eventos/novo"
              className="flex h-12 items-center gap-2 rounded-2xl bg-violet-950 px-5 text-sm font-semibold text-white shadow-xl shadow-violet-100"
            >
              <CalendarPlus className="h-4 w-4" />
              Criar evento
            </Link>
          </header>

          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>
          )}

          {/* Métricas */}
          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-28 animate-pulse rounded-2xl bg-violet-50" />
              ))}
            </div>
          ) : (
            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard label="Convidados" value={metrics?.totalGuests ?? 0} helper="Total cadastrado" icon={UsersRound} />
              <StatCard label="Confirmados" value={metrics?.confirmed ?? 0} helper="RSVP e presencas" icon={CheckCircle2} />
              <StatCard label="Check-ins" value={metrics?.checkins ?? 0} helper="Entradas registradas" icon={QrCode} />
              <StatCard label="Fotos" value={metrics?.photos ?? 0} helper="Album colaborativo" icon={Image} />
            </section>
          )}

          <section className="grid gap-5 xl:grid-cols-[1fr_360px]">
            <div>
              <h2 className="mb-4 text-2xl font-semibold text-violet-950">Eventos</h2>
              {loading ? (
                <div className="grid gap-5 md:grid-cols-2">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <div key={i} className="h-48 animate-pulse rounded-[28px] bg-violet-50" />
                  ))}
                </div>
              ) : events.length === 0 ? (
                <div className="rounded-[28px] border border-violet-100 bg-violet-50/50 p-10 text-center">
                  <p className="text-zinc-500">Nenhum evento criado ainda.</p>
                  <Link
                    href="/host/eventos/novo"
                    className="mt-4 inline-flex h-10 items-center gap-2 rounded-2xl bg-violet-950 px-5 text-sm font-semibold text-white"
                  >
                    <CalendarPlus className="h-4 w-4" />
                    Criar primeiro evento
                  </Link>
                </div>
              ) : (
                <div className="grid gap-5 md:grid-cols-2">
                  {events.map((event) => (
                    <EventCard
                      key={event.id}
                      event={event}
                      guests={0}
                    />
                  ))}
                </div>
              )}
            </div>
            <div className="space-y-5">
              <ReceptionistManager />
            </div>
          </section>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}

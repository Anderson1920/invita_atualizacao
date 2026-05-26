"use client";

import Link from "next/link";
import { CalendarPlus, CheckCircle2, Image, QrCode, UsersRound } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { StatCard } from "@/components/dashboard/stat-card";
import { EventCard } from "@/components/events/event-card";
import { ReceptionistManager } from "@/components/host/receptionist-manager";
import { demoEvents, demoGuests, demoHostMetrics, demoNotifications } from "@/lib/demo-data";

export default function HostDashboardPage() {
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

          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Convidados" value={demoHostMetrics.totalGuests} helper="Total cadastrado" icon={UsersRound} />
            <StatCard label="Confirmados" value={demoHostMetrics.confirmed} helper="RSVP e presencas" icon={CheckCircle2} />
            <StatCard label="Check-ins" value={demoHostMetrics.checkins} helper="Entradas registradas" icon={QrCode} />
            <StatCard label="Fotos" value={demoHostMetrics.photos} helper="Album colaborativo" icon={Image} />
          </section>

          <section className="grid gap-5 xl:grid-cols-[1fr_360px]">
            <div>
              <h2 className="mb-4 text-2xl font-semibold text-violet-950">Eventos</h2>
              <div className="grid gap-5 md:grid-cols-2">
                {demoEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    guests={demoGuests.filter((guest) => guest.eventId === event.id).length}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-5">
              <ReceptionistManager />

              <aside className="rounded-[28px] border border-white/80 bg-white p-5 shadow-[0_18px_55px_rgba(88,28,135,0.08)]">
                <h2 className="text-xl font-semibold text-violet-950">Notificacoes</h2>
                <div className="mt-4 grid gap-3">
                  {demoNotifications.map((notification) => (
                    <article key={notification.id} className="rounded-2xl border border-violet-100 bg-violet-50/60 p-4">
                      <strong className="text-sm text-violet-950">{notification.title}</strong>
                      <p className="mt-2 text-sm leading-6 text-zinc-600">{notification.body}</p>
                    </article>
                  ))}
                </div>
              </aside>
            </div>
          </section>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}

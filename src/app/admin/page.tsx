"use client";

import { Ban, CalendarCheck2, CreditCard, LineChart, ShieldCheck, UsersRound } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { StatCard } from "@/components/dashboard/stat-card";
import { currency, compactNumber } from "@/lib/format";
import { demoAdminMetrics, demoEvents, demoPayments, demoUsers } from "@/lib/demo-data";

export default function AdminPage() {
  return (
    <ProtectedRoute roles={["ADMIN"]}>
      <AppShell>
        <div className="mx-auto max-w-7xl space-y-6">
          <header className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-900">
                Painel Admin
              </span>
              <h1 className="mt-4 text-4xl font-semibold text-violet-950">Operacao INVITA</h1>
            </div>
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
              Sistema online
            </div>
          </header>

          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <StatCard label="Usuarios" value={compactNumber(demoAdminMetrics.totalUsers)} helper="Contas cadastradas" icon={UsersRound} />
            <StatCard label="Eventos" value={demoAdminMetrics.totalEvents} helper="Total criado" icon={CalendarCheck2} />
            <StatCard label="Faturamento" value={currency(demoAdminMetrics.revenue)} helper="Pagamentos aprovados" icon={CreditCard} />
            <StatCard label="Ativos" value={demoAdminMetrics.activeEvents} helper="Eventos em andamento" icon={LineChart} />
            <StatCard label="Finalizados" value={demoAdminMetrics.finishedEvents} helper="Historico encerrado" icon={ShieldCheck} />
          </section>

          <section className="grid gap-5 xl:grid-cols-[1.1fr_.9fr]">
            <div className="rounded-[28px] border border-white/80 bg-white p-5 shadow-[0_18px_55px_rgba(88,28,135,0.08)]">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-violet-950">Usuarios</h2>
                <button className="grid h-10 w-10 place-items-center rounded-2xl border border-violet-100 text-violet-800" title="Bloquear conta">
                  <Ban className="h-4 w-4" />
                </button>
              </div>
              <div className="overflow-hidden rounded-2xl border border-violet-100">
                {demoUsers.map((user) => (
                  <div key={user.id} className="grid gap-2 border-b border-violet-100 p-4 last:border-0 sm:grid-cols-[1fr_auto_auto] sm:items-center">
                    <div>
                      <strong className="text-violet-950">{user.name}</strong>
                      <p className="text-sm text-zinc-500">{user.email}</p>
                    </div>
                    <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-900">{user.role}</span>
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">{user.status}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[28px] border border-white/80 bg-white p-5 shadow-[0_18px_55px_rgba(88,28,135,0.08)]">
              <h2 className="text-xl font-semibold text-violet-950">Pagamentos e planos</h2>
              <div className="mt-4 grid gap-3">
                {demoPayments.map((payment) => (
                  <article key={payment.id} className="rounded-2xl border border-violet-100 bg-violet-50/50 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <strong className="text-violet-950">{currency(payment.amount)}</strong>
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-violet-800">{payment.status}</span>
                    </div>
                    <p className="mt-2 text-sm text-zinc-500">Plano {payment.planType}</p>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <section className="rounded-[28px] border border-white/80 bg-white p-5 shadow-[0_18px_55px_rgba(88,28,135,0.08)]">
            <h2 className="text-xl font-semibold text-violet-950">Eventos recentes</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {demoEvents.map((event) => (
                <article key={event.id} className="rounded-2xl border border-violet-100 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <strong className="text-violet-950">{event.name}</strong>
                    <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-900">{event.status}</span>
                  </div>
                  <p className="mt-2 text-sm text-zinc-500">{event.location}</p>
                </article>
              ))}
            </div>
          </section>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}

"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { Ban, CalendarCheck2, CheckCircle, CreditCard, LineChart, ShieldCheck, Trash2, UsersRound } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { StatCard } from "@/components/dashboard/stat-card";
import { currency, compactNumber } from "@/lib/format";
import type { UserProfile, EventRecord, PaymentRecord, DashboardMetrics } from "@/lib/types";

export default function AdminPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);
  const [tab, setTab] = useState<"usuarios" | "eventos" | "pagamentos">("usuarios");

  useEffect(() => {
    async function fetchAll() {
      try {
        const [metricsRes, usersRes, eventsRes, paymentsRes] = await Promise.all([
          fetch("/api/admin/metrics"),
          fetch("/api/admin/users"),
          fetch("/api/admin/events"),
          fetch("/api/admin/payments"),
        ]);
        const [m, u, e, p] = await Promise.all([
          metricsRes.json(), usersRes.json(), eventsRes.json(), paymentsRes.json(),
        ]);
        if (m.ok) setMetrics(m.data);
        if (u.ok) setUsers(u.data);
        if (e.ok) setEvents(e.data);
        if (p.ok) setPayments(p.data);
      } catch (err) {
        setError("Erro ao carregar dados.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, []);

  async function toggleUserStatus(userId: string, currentStatus: string) {
    const newStatus = currentStatus === "active" ? "blocked" : "active";
    setActionId(userId);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, status: newStatus }),
      });
      if (res.ok) {
        setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, status: newStatus as "active" | "blocked" } : u));
      }
    } finally {
      setActionId(null);
    }
  }

  async function deleteEvent(eventId: string) {
    if (!confirm("Tem certeza que deseja excluir este evento?")) return;
    setActionId(eventId);
    try {
      const res = await fetch("/api/admin/events", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId }),
      });
      if (res.ok) {
        setEvents((prev) => prev.filter((e) => e.id !== eventId));
      }
    } finally {
      setActionId(null);
    }
  }

  const tabs = [
    { id: "usuarios", label: `Usuarios (${users.length})` },
    { id: "eventos", label: `Eventos (${events.length})` },
    { id: "pagamentos", label: `Pagamentos (${payments.length})` },
  ] as const;

  return (
    <ProtectedRoute roles={["ADMIN"]}>
      <AppShell>
        <div className="mx-auto max-w-7xl space-y-6">
          <header className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-900">Painel Admin</span>
              <h1 className="mt-4 text-4xl font-semibold text-violet-950">Operacao INVITA</h1>
            </div>
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
              Sistema online
            </div>
          </header>

          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>
          )}

          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-28 animate-pulse rounded-2xl bg-violet-50" />
              ))}
            </div>
          ) : (
            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
              <StatCard label="Usuarios" value={compactNumber(metrics?.totalUsers ?? 0)} helper="Contas cadastradas" icon={UsersRound} />
              <StatCard label="Eventos" value={metrics?.totalEvents ?? 0} helper="Total criado" icon={CalendarCheck2} />
              <StatCard label="Faturamento" value={currency(metrics?.revenue ?? 0)} helper="Pagamentos aprovados" icon={CreditCard} />
              <StatCard label="Ativos" value={metrics?.activeEvents ?? 0} helper="Eventos em andamento" icon={LineChart} />
              <StatCard label="Finalizados" value={metrics?.finishedEvents ?? 0} helper="Historico encerrado" icon={ShieldCheck} />
            </section>
          )}

          <div className="rounded-[28px] border border-white/80 bg-white p-5 shadow-[0_18px_55px_rgba(88,28,135,0.08)]">
            <div className="mb-5 flex gap-2 border-b border-violet-100 pb-4">
              {tabs.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
                    tab === t.id ? "bg-violet-950 text-white" : "text-violet-800 hover:bg-violet-50"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {tab === "usuarios" && (
              loading ? (
                <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-16 animate-pulse rounded-2xl bg-violet-50" />)}</div>
              ) : users.length === 0 ? (
                <p className="text-sm text-zinc-400">Nenhum usuario encontrado.</p>
              ) : (
                <div className="overflow-hidden rounded-2xl border border-violet-100">
                  {users.map((user) => (
                    <div key={user.id} className="grid gap-2 border-b border-violet-100 p-4 last:border-0 sm:grid-cols-[1fr_auto_auto_auto_auto] sm:items-center">
                      <div>
                        <strong className="text-violet-950">{user.name}</strong>
                        <p className="text-sm text-zinc-500">{user.email}</p>
                      </div>
                      <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-900">{user.role}</span>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${user.status === "active" ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-800"}`}>
                        {user.status === "active" ? "ativo" : "bloqueado"}
                      </span>
                      {user.plan && (
                        <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">
                          {user.plan.type}
                        </span>
                      )}
                      <button
                        onClick={() => toggleUserStatus(user.id, user.status)}
                        disabled={actionId === user.id}
                        title={user.status === "active" ? "Bloquear" : "Desbloquear"}
                        className="grid h-8 w-8 place-items-center rounded-xl border border-violet-100 text-violet-800 hover:bg-violet-50 disabled:opacity-50"
                      >
                        {user.status === "active" ? <Ban className="h-3 w-3" /> : <CheckCircle className="h-3 w-3" />}
                      </button>
                    </div>
                  ))}
                </div>
              )
            )}

            {tab === "eventos" && (
              loading ? (
                <div className="grid gap-3 md:grid-cols-2">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-24 animate-pulse rounded-2xl bg-violet-50" />)}</div>
              ) : events.length === 0 ? (
                <p className="text-sm text-zinc-400">Nenhum evento encontrado.</p>
              ) : (
                <div className="grid gap-3 md:grid-cols-2">
                  {events.map((event) => (
                    <article key={event.id} className="rounded-2xl border border-violet-100 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <strong className="text-violet-950">{event.name}</strong>
                          <p className="mt-1 text-sm text-zinc-500">{event.location}</p>
                          <p className="text-xs text-zinc-400">{event.date} • {event.type}</p>
                          <p className="text-xs text-zinc-400">Host: {event.hostId}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            event.status === "active" ? "bg-emerald-50 text-emerald-800" :
                            event.status === "finished" ? "bg-zinc-100 text-zinc-600" :
                            event.status === "draft" ? "bg-yellow-50 text-yellow-800" :
                            "bg-red-50 text-red-800"
                          }`}>
                            {event.status}
                          </span>
                          <button
                            onClick={() => deleteEvent(event.id)}
                            disabled={actionId === event.id}
                            title="Excluir evento"
                            className="grid h-8 w-8 place-items-center rounded-xl border border-red-100 text-red-500 hover:bg-red-50 disabled:opacity-50"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )
            )}

            {tab === "pagamentos" && (
              loading ? (
                <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-20 animate-pulse rounded-2xl bg-violet-50" />)}</div>
              ) : payments.length === 0 ? (
                <p className="text-sm text-zinc-400">Nenhum pagamento encontrado.</p>
              ) : (
                <div className="grid gap-3 md:grid-cols-2">
                  {payments.map((payment) => (
                    <article key={payment.id} className="rounded-2xl border border-violet-100 bg-violet-50/50 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <strong className="text-violet-950">{currency(payment.amount)}</strong>
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${payment.status === "approved" ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-800"}`}>
                          {payment.status}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-zinc-500">Plano {payment.planType}</p>
                      <p className="text-xs text-zinc-400">Usuario: {payment.userId}</p>
                      <p className="text-xs text-zinc-400">{payment.createdAt?.slice(0, 10)}</p>
                    </article>
                  ))}
                </div>
              )
            )}
          </div>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}

"use client";

import { AppShell } from "@/components/app-shell";
import { PlanCard } from "@/components/payments/plan-card";
import { plans } from "@/lib/constants";
import { useAuth } from "@/contexts/auth-context";

export default function PlansPage() {
  const { user } = useAuth();

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl">
        <div className="mb-7">
          <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-900">
            Planos INVITA
          </span>
          <h1 className="mt-4 text-4xl font-semibold text-violet-950">Escolha seu plano</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-600">
            Sem plano ativo, a criacao de eventos fica bloqueada e o anfitriao retorna para esta pagina.
          </p>
          {user?.plan?.status === "active" && (
            <div className="mt-4 inline-flex rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
              Plano ativo: {user.plan.type === "venue" ? "Casa de festas" : "Individual"}
            </div>
          )}
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          {plans.map((plan) => (
            <PlanCard key={plan.id} plan={plan} />
          ))}
        </div>
      </div>
    </AppShell>
  );
}

"use client";

import { useState } from "react";
import { Check, CreditCard, Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { currency } from "@/lib/format";
import type { PlanDefinition } from "@/lib/types";

export function PlanCard({ plan }: { plan: PlanDefinition }) {
  const { user, authHeaders } = useAuth();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function buy() {
    if (!user) {
      window.location.href = "/login";
      return;
    }

    setBusy(true);
    setMessage("");

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(await authHeaders()),
        },
        credentials: "same-origin",
        body: JSON.stringify({
          planType: plan.id,
          userId: user.id,
          email: user.email,
        }),
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Nao foi possivel abrir o checkout.");
      }

      window.location.href = payload.data.initPoint || payload.data.sandboxInitPoint;
    } catch (caught) {
      setMessage(caught instanceof Error ? caught.message : "Nao foi possivel iniciar pagamento.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <article className="relative overflow-hidden rounded-[28px] border border-white/80 bg-white p-6 shadow-[0_22px_70px_rgba(88,28,135,0.12)]">
      <div className="absolute right-0 top-0 h-32 w-32 rounded-bl-[64px] bg-gradient-to-br from-violet-200 to-fuchsia-100" />
      <div className="relative">
        <span className="inline-flex items-center gap-2 rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-900">
          <Sparkles className="h-3.5 w-3.5" />
          {plan.recurrence === "monthly" ? "Assinatura" : "Compra unica"}
        </span>
        <h2 className="mt-5 text-3xl font-semibold text-violet-950">{plan.name}</h2>
        <p className="mt-3 min-h-12 text-sm leading-6 text-zinc-600">{plan.description}</p>
        <div className="mt-6 flex items-end gap-2">
          <strong className="text-4xl font-semibold text-violet-950">{currency(plan.price)}</strong>
          <span className="pb-1 text-sm text-zinc-500">{plan.recurrence === "monthly" ? "/mes" : "por evento"}</span>
        </div>

        <ul className="mt-6 space-y-3">
          {plan.features.map((feature) => (
            <li key={feature} className="flex items-center gap-3 text-sm text-zinc-700">
              <span className="grid h-6 w-6 place-items-center rounded-full bg-violet-100 text-violet-800">
                <Check className="h-3.5 w-3.5" />
              </span>
              {feature}
            </li>
          ))}
        </ul>

        {message && <div className="mt-5 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{message}</div>}

        <button
          onClick={buy}
          disabled={busy}
          className="mt-7 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-violet-950 px-5 text-sm font-semibold text-white shadow-xl shadow-violet-100 transition hover:bg-violet-800 disabled:cursor-wait disabled:opacity-70"
        >
          <CreditCard className="h-4 w-4" />
          {busy ? "Abrindo checkout..." : "Comprar plano"}
        </button>
      </div>
    </article>
  );
}

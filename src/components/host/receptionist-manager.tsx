"use client";

import { FormEvent, useEffect, useState } from "react";
import { Headset, UserPlus } from "lucide-react";
import type { UserProfile } from "@/lib/types";

export function ReceptionistManager() {
  const [receptionists, setReceptionists] = useState<UserProfile[]>([]);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;

    fetch("/api/receptionists", { credentials: "same-origin" })
      .then((response) => response.json())
      .then((payload) => {
        if (active && payload.ok) {
          setReceptionists(payload.data);
        }
      })
      .catch(() => undefined);

    return () => {
      active = false;
    };
  }, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);

    setBusy(true);
    setMessage("");

    try {
      const response = await fetch("/api/receptionists", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
        body: JSON.stringify({
          name: form.get("name"),
          email: form.get("email"),
          password: form.get("password"),
        }),
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Nao foi possivel cadastrar recepcionista.");
      }

      setReceptionists((current) => [payload.data, ...current]);
      event.currentTarget.reset();
      setMessage("Recepcionista cadastrado com acesso ao check-in.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Nao foi possivel cadastrar recepcionista.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="rounded-[28px] border border-white/80 bg-white p-5 shadow-[0_18px_55px_rgba(88,28,135,0.08)]">
      <div className="mb-5 flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-violet-100 text-violet-800">
          <Headset className="h-5 w-5" />
        </span>
        <div>
          <h2 className="text-xl font-semibold text-violet-950">Equipe de recepcao</h2>
          <p className="text-sm text-zinc-500">Acesso criado pelo anfitriao.</p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="grid gap-3">
        <input
          required
          name="name"
          className="h-11 rounded-2xl border border-violet-100 px-4 text-sm outline-none"
          placeholder="Nome"
        />
        <input
          required
          name="email"
          type="email"
          className="h-11 rounded-2xl border border-violet-100 px-4 text-sm outline-none"
          placeholder="email@exemplo.com"
        />
        <input
          required
          minLength={8}
          name="password"
          type="password"
          className="h-11 rounded-2xl border border-violet-100 px-4 text-sm outline-none"
          placeholder="Senha inicial"
        />
        <button
          disabled={busy}
          className="flex h-11 items-center justify-center gap-2 rounded-2xl bg-violet-950 text-sm font-semibold text-white disabled:opacity-60"
        >
          <UserPlus className="h-4 w-4" />
          {busy ? "Cadastrando..." : "Cadastrar recepcao"}
        </button>
      </form>

      {message && <p className="mt-4 rounded-2xl bg-violet-50 px-4 py-3 text-sm text-violet-800">{message}</p>}

      <div className="mt-5 grid gap-2">
        {receptionists.map((profile) => (
          <article key={profile.id} className="rounded-2xl border border-violet-100 bg-violet-50/55 p-3">
            <strong className="text-sm text-violet-950">{profile.name}</strong>
            <p className="text-xs text-zinc-500">{profile.email}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

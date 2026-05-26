"use client";

import { FormEvent, useState } from "react";
import { MailPlus, QrCode, UsersRound } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import type { GuestRecord } from "@/lib/types";

export function GuestManager({ eventId, initialGuests }: { eventId: string; initialGuests: GuestRecord[] }) {
  const { authHeaders } = useAuth();
  const [guests, setGuests] = useState(initialGuests);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);

    setBusy(true);
    setMessage("");

    try {
      const response = await fetch("/api/guests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(await authHeaders()),
        },
        credentials: "same-origin",
        body: JSON.stringify({
          eventId,
          name: form.get("name"),
          email: form.get("email"),
          phone: form.get("phone"),
          companions: form.get("companions"),
          personalMessage: form.get("personalMessage"),
        }),
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Nao foi possivel cadastrar convidado.");
      }

      setGuests((current) => [payload.data, ...current]);
      event.currentTarget.reset();
      setMessage("Convidado cadastrado com QR unico.");
    } catch (caught) {
      setMessage(caught instanceof Error ? caught.message : "Nao foi possivel cadastrar convidado.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="grid gap-5 lg:grid-cols-[.9fr_1.1fr]">
      <form onSubmit={onSubmit} className="rounded-[26px] border border-white/80 bg-white p-5 shadow-[0_18px_55px_rgba(88,28,135,0.08)]">
        <div className="mb-5 flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-violet-100 text-violet-800">
            <MailPlus className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-xl font-semibold text-violet-950">Convidados</h2>
            <p className="text-sm text-zinc-500">Cadastro individual com token antifraude.</p>
          </div>
        </div>

        <div className="grid gap-3">
          <Input name="name" label="Nome" placeholder="Nome do convidado" />
          <Input name="email" type="email" label="Email" placeholder="email@exemplo.com" />
          <Input name="phone" label="Telefone" placeholder="+55 11 90000-0000" />
          <Input name="companions" type="number" label="Acompanhantes" placeholder="0" />
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-zinc-700">Mensagem personalizada</span>
            <textarea
              name="personalMessage"
              className="min-h-24 w-full rounded-2xl border border-violet-100 px-4 py-3 text-sm outline-none"
              placeholder="Mensagem para o convite individual"
            />
          </label>
        </div>

        {message && <div className="mt-4 rounded-2xl bg-violet-50 px-4 py-3 text-sm text-violet-800">{message}</div>}

        <button
          disabled={busy}
          className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-violet-950 text-sm font-semibold text-white"
        >
          <UsersRound className="h-4 w-4" />
          {busy ? "Salvando..." : "Adicionar convidado"}
        </button>
      </form>

      <div className="rounded-[26px] border border-white/80 bg-white p-5 shadow-[0_18px_55px_rgba(88,28,135,0.08)]">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-xl font-semibold text-violet-950">Lista e QR Codes</h2>
          <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-900">{guests.length} pessoas</span>
        </div>
        <div className="grid max-h-[540px] gap-3 overflow-auto pr-1">
          {guests.map((guest) => (
            <article key={guest.id} className="rounded-2xl border border-violet-100 bg-violet-50/45 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <strong className="text-violet-950">{guest.name}</strong>
                  <p className="mt-1 text-sm text-zinc-500">{guest.email}</p>
                </div>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-violet-800">{guest.status}</span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2 text-xs text-zinc-500">
                <span>{guest.companions} acompanhantes</span>
                <span>{guest.phone}</span>
              </div>
              <a
                href={`/convite/${guest.token}`}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-sm font-medium text-violet-900"
              >
                <QrCode className="h-4 w-4" />
                Ver convite
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Input({
  label,
  name,
  placeholder,
  type = "text",
}: {
  label: string;
  name: string;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-zinc-700">{label}</span>
      <input
        required
        name={name}
        type={type}
        placeholder={placeholder}
        min={type === "number" ? 0 : undefined}
        className="h-11 w-full rounded-2xl border border-violet-100 px-4 text-sm outline-none"
      />
    </label>
  );
}

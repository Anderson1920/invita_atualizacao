"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarPlus, ImageIcon, MapPin, Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { eventTypeLabels, eventTheme } from "@/lib/constants";
import type { EventType } from "@/lib/types";

const eventTypes = Object.keys(eventTypeLabels) as EventType[];

export function EventForm() {
  const router = useRouter();
  const { user, authHeaders } = useAuth();
  const [type, setType] = useState<EventType>("wedding");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const activeTheme = useMemo(() => eventTheme[type], [type]);
  const hasPlan = Boolean(user?.plan?.status === "active");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!hasPlan) {
      router.push("/planos");
      return;
    }

    const data = new FormData(event.currentTarget);
    setBusy(true);

    try {
      const response = await fetch("/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(await authHeaders()),
        },
        credentials: "same-origin",
        body: JSON.stringify({
          name: data.get("name"),
          type,
          description: data.get("description"),
          date: data.get("date"),
          time: data.get("time"),
          location: data.get("location"),
          mapsUrl: data.get("mapsUrl"),
          heroImageUrl: data.get("heroImageUrl"),
          hostMessage: data.get("hostMessage"),
        }),
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Nao foi possivel criar o evento.");
      }

      router.push(`/host/eventos/${payload.data.id}`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Nao foi possivel criar o evento.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-[1.1fr_.9fr]">
      <section className="rounded-[28px] border border-white/80 bg-white p-5 shadow-[0_20px_60px_rgba(88,28,135,0.1)] sm:p-7">
        <div className="mb-6 flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-violet-100 text-violet-800">
            <CalendarPlus className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-2xl font-semibold text-violet-950">Criar evento</h1>
            <p className="text-sm text-zinc-500">Dados principais do convite digital.</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nome do evento" name="name" placeholder="Luna & Rafa" />
          <div>
            <span className="mb-2 block text-sm font-medium text-zinc-700">Tipo</span>
            <div className="grid grid-cols-2 gap-2">
              {eventTypes.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setType(option)}
                  className={`rounded-2xl border px-3 py-3 text-sm font-medium transition ${
                    type === option
                      ? "border-violet-800 bg-violet-950 text-white"
                      : "border-violet-100 bg-white text-violet-900 hover:border-violet-300"
                  }`}
                >
                  {eventTypeLabels[option]}
                </button>
              ))}
            </div>
          </div>
          <Field label="Data" name="date" type="date" />
          <Field label="Hora" name="time" type="time" />
          <Field label="Local" name="location" placeholder="Villa Aurora, Sao Paulo" icon={<MapPin className="h-4 w-4" />} />
          <Field label="Link Google Maps" name="mapsUrl" placeholder="https://maps.google.com/..." />
          <div className="sm:col-span-2">
            <Field
              label="Imagem principal"
              name="heroImageUrl"
              placeholder="https://images.unsplash.com/..."
              icon={<ImageIcon className="h-4 w-4" />}
            />
          </div>
          <TextArea label="Descricao" name="description" placeholder="Conte o clima da celebracao." />
          <TextArea label="Mensagem do anfitriao" name="hostMessage" placeholder="Uma mensagem especial para os convidados." />
        </div>

        {error && <div className="mt-5 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}

        <button
          disabled={busy}
          className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-violet-950 px-5 text-sm font-semibold text-white shadow-xl shadow-violet-100 transition hover:bg-violet-800 disabled:cursor-wait disabled:opacity-70 sm:w-auto"
        >
          <Sparkles className="h-4 w-4" />
          {busy ? "Criando..." : "Publicar evento"}
        </button>
      </section>

      <aside className="rounded-[28px] border border-white/80 p-5 shadow-[0_20px_60px_rgba(88,28,135,0.1)] sm:p-7" style={{ background: activeTheme.texture }}>
        <div className={`${activeTheme.panel} rounded-[24px] p-5 backdrop-blur`}>
          <span className={`inline-flex rounded-full bg-gradient-to-r ${activeTheme.accent} px-3 py-1 text-xs font-semibold text-white`}>
            {activeTheme.name}
          </span>
          <h2 className={`mt-5 text-4xl font-semibold text-violet-950 ${activeTheme.font}`}>Preview premium</h2>
          <p className="mt-4 text-sm leading-6 text-zinc-600">
            Cada modo troca tema, layout, cores e tipografia para combinar com o tipo do evento.
          </p>
          <div className="mt-6 grid grid-cols-3 gap-2">
            <span className="h-24 rounded-2xl bg-white/75" />
            <span className="h-24 rounded-2xl bg-violet-200/70" />
            <span className="h-24 rounded-2xl bg-fuchsia-200/70" />
          </div>
        </div>
      </aside>
    </form>
  );
}

function Field({
  label,
  name,
  placeholder,
  type = "text",
  icon,
}: {
  label: string;
  name: string;
  placeholder?: string;
  type?: string;
  icon?: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-zinc-700">{label}</span>
      <span className="flex h-12 items-center gap-3 rounded-2xl border border-violet-100 bg-white px-4 text-violet-500">
        {icon}
        <input
          required={name !== "mapsUrl" && name !== "heroImageUrl"}
          type={type}
          name={name}
          placeholder={placeholder}
          className="w-full bg-transparent text-sm text-zinc-900 outline-none placeholder:text-zinc-400"
        />
      </span>
    </label>
  );
}

function TextArea({ label, name, placeholder }: { label: string; name: string; placeholder?: string }) {
  return (
    <label className="block sm:col-span-2">
      <span className="mb-2 block text-sm font-medium text-zinc-700">{label}</span>
      <textarea
        required
        name={name}
        placeholder={placeholder}
        className="min-h-28 w-full resize-none rounded-2xl border border-violet-100 bg-white px-4 py-3 text-sm text-zinc-900 outline-none placeholder:text-zinc-400"
      />
    </label>
  );
}

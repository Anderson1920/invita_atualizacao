"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { CalendarDays, Heart, Images, MapPin, Navigation, UsersRound } from "lucide-react";
import { Countdown } from "@/components/countdown";
import { QrCodeImage } from "@/components/qr/qr-code-image";
import { eventTheme, eventTypeLabels } from "@/lib/constants";
import { shortDate } from "@/lib/format";
import type { EventRecord, GuestRecord } from "@/lib/types";

interface InvitePayload {
  event: EventRecord;
  guest: GuestRecord;
  qrValue: string;
}

export default function InvitePage() {
  const params = useParams<{ token: string }>();
  const [invite, setInvite] = useState<InvitePayload | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    fetch(`/api/invite/${encodeURIComponent(params.token)}`)
      .then((response) => response.json())
      .then((payload) => {
        if (!active) {
          return;
        }

        if (payload.ok) {
          setInvite(payload.data);
        } else {
          setError(payload.error || "Convite nao encontrado.");
        }
      })
      .catch(() => setError("Nao foi possivel abrir este convite."));

    return () => {
      active = false;
    };
  }, [params.token]);

  if (error) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#fbf8ff] px-4">
        <div className="max-w-md rounded-[28px] border border-rose-100 bg-white p-6 text-center shadow-xl">
          <h1 className="text-2xl font-semibold text-rose-700">{error}</h1>
          <Link href="/" className="mt-5 inline-flex rounded-2xl bg-violet-950 px-5 py-3 text-sm font-semibold text-white">
            Voltar
          </Link>
        </div>
      </main>
    );
  }

  if (!invite) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#fbf8ff]">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-violet-200 border-t-violet-700" />
      </main>
    );
  }

  const theme = eventTheme[invite.event.type];

  return (
    <main className="min-h-screen px-4 py-5 sm:px-6" style={{ background: theme.texture }}>
      <section className="mx-auto max-w-5xl overflow-hidden rounded-[34px] border border-white/80 bg-white/82 shadow-[0_28px_90px_rgba(88,28,135,0.18)] backdrop-blur">
        <div className="relative min-h-[460px]">
          <img src={invite.event.heroImageUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-violet-950 via-violet-950/45 to-transparent" />
          <div className="relative flex min-h-[460px] flex-col justify-end p-5 text-white sm:p-8">
            <span className={`mb-4 w-max rounded-full bg-gradient-to-r ${theme.accent} px-3 py-1 text-xs font-semibold`}>
              {eventTypeLabels[invite.event.type]}
            </span>
            <h1 className={`max-w-3xl text-5xl font-semibold leading-tight sm:text-7xl ${theme.font}`}>{invite.event.name}</h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-violet-50">{invite.event.hostMessage}</p>
          </div>
        </div>

        <div className="grid gap-6 p-5 sm:p-8 lg:grid-cols-[1fr_320px]">
          <div className="space-y-5">
            <div className="rounded-[26px] bg-violet-50 p-5">
              <p className="text-sm font-semibold text-violet-700">Convite para</p>
              <h2 className="mt-2 text-3xl font-semibold text-violet-950">{invite.guest.name}</h2>
              <p className="mt-3 leading-7 text-zinc-600">{invite.guest.personalMessage}</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Info icon={CalendarDays} label="Data e hora" value={`${shortDate(invite.event.date)} as ${invite.event.time}`} />
              <Info icon={MapPin} label="Local" value={invite.event.location} />
              <Info icon={UsersRound} label="Acompanhantes" value={`${invite.guest.companions} liberados`} />
              <Info icon={Heart} label="Status" value={invite.guest.status} />
            </div>

            <Countdown date={invite.event.date} time={invite.event.time} />

            <div className="flex flex-wrap gap-3">
              <a
                href={invite.event.mapsUrl}
                target="_blank"
                rel="noreferrer"
                className="flex h-12 items-center gap-2 rounded-2xl bg-violet-950 px-5 text-sm font-semibold text-white"
              >
                <Navigation className="h-4 w-4" />
                Abrir mapa
              </a>
              <Link
                href={`/album/${invite.event.id}`}
                className="flex h-12 items-center gap-2 rounded-2xl border border-violet-200 px-5 text-sm font-semibold text-violet-950"
              >
                <Images className="h-4 w-4" />
                Album do evento
              </Link>
            </div>
          </div>

          <aside className="rounded-[28px] bg-white p-5 shadow-sm">
            <QrCodeImage value={invite.qrValue} label="Apresente na entrada" />
            <p className="mt-4 text-center text-sm leading-6 text-zinc-500">
              QR Code unico, validado em tempo real e invalidado apos o check-in.
            </p>
          </aside>
        </div>
      </section>
    </main>
  );
}

function Info({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof CalendarDays;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[22px] border border-violet-100 bg-white p-4">
      <Icon className="h-5 w-5 text-violet-700" />
      <p className="mt-3 text-xs font-semibold uppercase text-zinc-400">{label}</p>
      <strong className="mt-1 block text-sm text-violet-950">{value}</strong>
    </div>
  );
}

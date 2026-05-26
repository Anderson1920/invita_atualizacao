"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, ImagePlus, Link as LinkIcon } from "lucide-react";
import { PhotoGallery } from "@/components/photo-gallery";
import { useAuth } from "@/contexts/auth-context";
import { demoEvents, demoPhotos } from "@/lib/demo-data";
import type { PhotoRecord } from "@/lib/types";

export default function AlbumPage() {
  const params = useParams<{ eventId: string }>();
  const { user, authHeaders } = useAuth();
  const event = demoEvents.find((item) => item.id === params.eventId) || demoEvents[0];
  const [photos, setPhotos] = useState<PhotoRecord[]>(() => demoPhotos.filter((photo) => photo.eventId === event.id));
  const [url, setUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(formEvent: FormEvent<HTMLFormElement>) {
    formEvent.preventDefault();
    setBusy(true);
    setMessage("");

    try {
      if (!url && !file) {
        throw new Error("Informe uma URL de imagem ou envie um arquivo.");
      }

      const response = file
        ? await uploadFile(file, event.id, user?.name || "Convidado")
        : await fetch("/api/photos", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(await authHeaders()),
            },
            credentials: "same-origin",
            body: JSON.stringify({
              eventId: event.id,
              uploaderName: user?.name || "Convidado",
              url,
            }),
          });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Nao foi possivel enviar a foto.");
      }

      setPhotos((current) => [payload.data, ...current]);
      setUrl("");
      setFile(null);
      formEvent.currentTarget.reset();
      setMessage("Foto adicionada ao album.");
    } catch (caught) {
      setMessage(caught instanceof Error ? caught.message : "Nao foi possivel enviar a foto.");
    } finally {
      setBusy(false);
    }
  }

  async function uploadFile(selectedFile: File, eventId: string, uploaderName: string) {
    const payload = new FormData();

    payload.set("eventId", eventId);
    payload.set("uploaderName", uploaderName);
    payload.set("file", selectedFile);

    return fetch("/api/photos/upload", {
      method: "POST",
      credentials: "same-origin",
      body: payload,
    });
  }

  return (
    <main className="min-h-screen bg-[#fbf8ff] px-4 py-5 sm:px-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-4 rounded-[28px] border border-white/80 bg-white p-5 shadow-sm">
          <div>
            <Link href={`/convite/demo-token-ana`} className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-violet-800">
              <ArrowLeft className="h-4 w-4" />
              Convite
            </Link>
            <h1 className="text-4xl font-semibold text-violet-950">Album de {event.name}</h1>
            <p className="mt-2 text-sm text-zinc-500">Convidados compartilham fotos e o anfitriao baixa tudo em ZIP.</p>
          </div>
        </header>

        <form onSubmit={onSubmit} className="grid gap-3 rounded-[28px] border border-white/80 bg-white p-5 shadow-sm md:grid-cols-[1fr_1fr_auto] md:items-end">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-zinc-700">Arquivo</span>
            <span className="flex h-12 items-center gap-3 rounded-2xl border border-violet-100 px-4 text-sm text-zinc-500">
              <ImagePlus className="h-4 w-4 text-violet-700" />
              <input type="file" accept="image/*" onChange={(event) => setFile(event.target.files?.[0] || null)} className="min-w-0 flex-1" />
            </span>
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-zinc-700">URL da foto</span>
            <span className="flex h-12 items-center gap-3 rounded-2xl border border-violet-100 px-4 text-sm text-zinc-500">
              <LinkIcon className="h-4 w-4 text-violet-700" />
              <input
                value={url}
                onChange={(event) => setUrl(event.target.value)}
                className="min-w-0 flex-1 bg-transparent text-zinc-900 outline-none"
                placeholder="https://..."
              />
            </span>
          </label>
          <button
            disabled={busy}
            className="flex h-12 items-center justify-center rounded-2xl bg-violet-950 px-5 text-sm font-semibold text-white disabled:opacity-60"
          >
            {busy ? "Enviando..." : "Enviar foto"}
          </button>
          {message && <p className="md:col-span-3 rounded-2xl bg-violet-50 px-4 py-3 text-sm text-violet-800">{message}</p>}
        </form>

        <PhotoGallery eventId={event.id} photos={photos} />
      </div>
    </main>
  );
}

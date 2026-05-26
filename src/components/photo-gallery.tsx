"use client";

import { useState } from "react";
import { Download, Heart, Maximize2, Star, Trash2, UploadCloud } from "lucide-react";
import type { PhotoRecord } from "@/lib/types";

export function PhotoGallery({
  eventId,
  photos,
  hostMode = false,
}: {
  eventId: string;
  photos: PhotoRecord[];
  hostMode?: boolean;
}) {
  const [selected, setSelected] = useState<PhotoRecord | null>(null);

  return (
    <section className="rounded-[28px] border border-white/80 bg-white p-5 shadow-[0_22px_70px_rgba(88,28,135,0.1)]">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold text-violet-950">Album colaborativo</h2>
          <p className="text-sm text-zinc-500">Fotos, curtidas, destaque e download em ZIP.</p>
        </div>
        <div className="flex gap-2">
          <a
            href={`/api/photos/zip?eventId=${eventId}`}
            className="flex h-11 items-center gap-2 rounded-2xl bg-violet-950 px-4 text-sm font-semibold text-white"
          >
            <Download className="h-4 w-4" />
            Baixar fotos do evento
          </a>
          {!hostMode && (
            <button className="grid h-11 w-11 place-items-center rounded-2xl border border-violet-100 text-violet-800" title="Enviar foto">
              <UploadCloud className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {photos.map((photo) => (
          <article key={photo.id} className="group relative overflow-hidden rounded-[22px] bg-violet-50">
            <img src={photo.url} alt="" className="aspect-[4/3] w-full object-cover transition duration-500 group-hover:scale-105" />
            <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-violet-950/80 to-transparent p-4 text-white">
              <span className="text-sm font-medium">{photo.uploaderName}</span>
              <span className="flex items-center gap-1 text-sm">
                <Heart className="h-4 w-4 fill-white" />
                {photo.likes}
              </span>
            </div>
            <div className="absolute right-3 top-3 flex gap-2 opacity-0 transition group-hover:opacity-100">
              {photo.featured && (
                <span className="grid h-9 w-9 place-items-center rounded-full bg-white text-violet-800">
                  <Star className="h-4 w-4 fill-violet-800" />
                </span>
              )}
              <button
                onClick={() => setSelected(photo)}
                className="grid h-9 w-9 place-items-center rounded-full bg-white text-violet-800"
                title="Ver em tela cheia"
              >
                <Maximize2 className="h-4 w-4" />
              </button>
              {hostMode && (
                <button className="grid h-9 w-9 place-items-center rounded-full bg-white text-rose-600" title="Apagar foto">
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          </article>
        ))}
      </div>

      {selected && (
        <button
          onClick={() => setSelected(null)}
          className="fixed inset-0 z-50 grid place-items-center bg-violet-950/85 p-4 backdrop-blur"
          title="Fechar"
        >
          <img src={selected.url} alt="" className="max-h-[88vh] max-w-[92vw] rounded-[24px] object-contain shadow-2xl" />
        </button>
      )}
    </section>
  );
}

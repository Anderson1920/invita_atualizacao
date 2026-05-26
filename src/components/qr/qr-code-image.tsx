"use client";

import { useEffect, useState } from "react";
import { QrCode } from "lucide-react";

export function QrCodeImage({ value, label }: { value: string; label?: string }) {
  const [src, setSrc] = useState("");

  useEffect(() => {
    let active = true;

    fetch(`/api/qr?data=${encodeURIComponent(value)}`)
      .then((response) => response.json())
      .then((payload) => {
        if (active && payload.ok) {
          setSrc(payload.data.src);
        }
      });

    return () => {
      active = false;
    };
  }, [value]);

  return (
    <div className="rounded-[24px] border border-violet-100 bg-white p-4 text-center shadow-sm">
      {src ? (
        <img src={src} alt={label || "QR Code do convite"} className="mx-auto aspect-square w-full max-w-56 rounded-2xl" />
      ) : (
        <div className="grid aspect-square w-full max-w-56 place-items-center rounded-2xl bg-violet-50 text-violet-500">
          <QrCode className="h-12 w-12" />
        </div>
      )}
      {label && <p className="mt-3 text-sm font-medium text-violet-950">{label}</p>}
    </div>
  );
}

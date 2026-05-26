"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { Camera, CheckCircle2, Keyboard, QrCode, XCircle } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";

interface ValidationResult {
  status: "valid" | "invalid" | "used";
  message: string;
  guest?: {
    name: string;
    companions: number;
    eventName: string;
  };
}

function extractToken(value: string) {
  try {
    const url = new URL(value);
    const segments = url.pathname.split("/").filter(Boolean);

    return segments.at(-1) || value;
  } catch {
    return value;
  }
}

export function QrScanner() {
  const { authHeaders, user } = useAuth();
  const scannerId = "invita-qr-reader";
  const scannerRef = useRef<{ stop: () => Promise<void>; clear: () => void } | null>(null);
  const [manualToken, setManualToken] = useState("demo-token-ana");
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [cameraError, setCameraError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function startScanner() {
      try {
        const { Html5Qrcode } = await import("html5-qrcode");
        const scanner = new Html5Qrcode(scannerId);
        scannerRef.current = scanner;

        await scanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 260, height: 260 } },
          async (decodedText) => {
            await validate(decodedText);
          },
          () => undefined,
        );
      } catch {
        if (mounted) {
          setCameraError("Camera indisponivel neste navegador. Use a entrada manual para validar o QR.");
        }
      }
    }

    startScanner();

    return () => {
      mounted = false;
      scannerRef.current
        ?.stop()
        .then(() => scannerRef.current?.clear())
        .catch(() => undefined);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function validate(value: string) {
    const token = extractToken(value).trim();

    if (!token || busy) {
      return;
    }

    setBusy(true);

    try {
      const response = await fetch("/api/checkin/validate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(await authHeaders()),
        },
        credentials: "same-origin",
        body: JSON.stringify({
          token,
          receptionistId: user?.id || "reception-demo",
        }),
      });
      const payload = await response.json();

      setResult(payload.data || { status: "invalid", message: payload.error || "Convite invalido." });
    } catch {
      setResult({ status: "invalid", message: "Nao foi possivel validar agora." });
    } finally {
      setBusy(false);
    }
  }

  async function onManualSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await validate(manualToken);
  }

  const resultStyle =
    result?.status === "valid"
      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
      : result?.status === "used"
        ? "border-amber-200 bg-amber-50 text-amber-800"
        : "border-rose-200 bg-rose-50 text-rose-800";

  return (
    <section className="grid gap-6 lg:grid-cols-[1fr_.9fr]">
      <div className="rounded-[28px] border border-white/80 bg-white p-5 shadow-[0_22px_70px_rgba(88,28,135,0.12)]">
        <div className="mb-5 flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-violet-100 text-violet-800">
            <Camera className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-2xl font-semibold text-violet-950">Check-in</h1>
            <p className="text-sm text-zinc-500">Scanner por camera com validacao antifraude.</p>
          </div>
        </div>

        <div id={scannerId} className="min-h-[320px] overflow-hidden rounded-[24px] border border-violet-100 bg-violet-50" />
        {cameraError && <p className="mt-3 text-sm text-amber-700">{cameraError}</p>}
      </div>

      <aside className="rounded-[28px] border border-white/80 bg-white p-5 shadow-[0_22px_70px_rgba(88,28,135,0.12)]">
        <div className="mb-5 flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-violet-100 text-violet-800">
            <Keyboard className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-xl font-semibold text-violet-950">Validador manual</h2>
            <p className="text-sm text-zinc-500">Use quando a camera nao estiver disponivel.</p>
          </div>
        </div>

        <form onSubmit={onManualSubmit} className="flex gap-2">
          <input
            value={manualToken}
            onChange={(event) => setManualToken(event.target.value)}
            className="h-12 min-w-0 flex-1 rounded-2xl border border-violet-100 px-4 text-sm outline-none"
            placeholder="Token ou URL do convite"
          />
          <button
            disabled={busy}
            className="grid h-12 w-12 place-items-center rounded-2xl bg-violet-950 text-white disabled:opacity-60"
            title="Validar"
          >
            <QrCode className="h-5 w-5" />
          </button>
        </form>

        {result && (
          <div className={`mt-6 rounded-[24px] border p-5 ${resultStyle}`}>
            <div className="flex items-center gap-3">
              {result.status === "valid" ? <CheckCircle2 className="h-6 w-6" /> : <XCircle className="h-6 w-6" />}
              <strong className="text-lg">{result.message}</strong>
            </div>
            {result.guest && (
              <div className="mt-4 rounded-2xl bg-white/70 p-4 text-sm">
                <p className="font-semibold">{result.guest.name}</p>
                <p>{result.guest.eventName}</p>
                <p>{result.guest.companions} acompanhantes</p>
              </div>
            )}
          </div>
        )}
      </aside>
    </section>
  );
}

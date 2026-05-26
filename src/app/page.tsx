import Link from "next/link";
import { ArrowRight, Camera, CheckCircle2, Crown, Images, QrCode, ShieldCheck, Sparkles } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { EventCard } from "@/components/events/event-card";
import { demoEvents, demoGuests, demoHostMetrics } from "@/lib/demo-data";

const features = [
  { label: "QR antifraude", icon: QrCode },
  { label: "Check-in ao vivo", icon: Camera },
  { label: "Album colaborativo", icon: Images },
  { label: "Planos Mercado Pago", icon: Crown },
  { label: "Permissoes por perfil", icon: ShieldCheck },
  { label: "Convite individual", icon: CheckCircle2 },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#fbf8ff] text-zinc-950">
      <section className="premium-grid relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,.96),rgba(250,245,255,.86)_48%,rgba(255,255,255,.92))]" />
        <div className="relative mx-auto grid min-h-[92vh] max-w-7xl gap-10 px-5 py-6 sm:px-8 lg:grid-cols-[.92fr_1.08fr] lg:items-center lg:py-10">
          <div>
            <nav className="mb-14 flex items-center justify-between gap-4 lg:mb-20">
              <Link href="/" className="inline-flex">
                <BrandLogo size="sm" label="eventos digitais" />
              </Link>
              <Link
                href="/login"
                className="rounded-2xl border border-violet-200 bg-white/70 px-4 py-2 text-sm font-semibold text-violet-900 backdrop-blur transition hover:border-violet-400"
              >
                Entrar
              </Link>
            </nav>

            <span className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white/70 px-4 py-2 text-sm font-semibold text-violet-900">
              <Sparkles className="h-4 w-4" />
              SaaS completo para eventos sofisticados
            </span>
            <div className="mt-6">
              <BrandLogo size="lg" showText={false} />
            </div>
            <h1 className="mt-5 max-w-3xl text-5xl font-semibold leading-[1.02] text-violet-950 sm:text-6xl lg:text-7xl">
              Invita
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-zinc-600">
              Convites digitais inteligentes com QR Code unico, check-in por camera, album colaborativo,
              planos pagos e paineis para operacao de ponta a ponta.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/cadastro"
                className="flex h-12 items-center gap-2 rounded-2xl bg-violet-950 px-5 text-sm font-semibold text-white shadow-xl shadow-violet-200 transition hover:bg-violet-800"
              >
                Comecar agora
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/planos"
                className="flex h-12 items-center rounded-2xl border border-violet-200 bg-white/70 px-5 text-sm font-semibold text-violet-900 backdrop-blur transition hover:border-violet-400"
              >
                Ver planos
              </Link>
            </div>
          </div>

          <div className="rounded-[32px] border border-white/80 bg-white/78 p-4 shadow-[0_26px_90px_rgba(88,28,135,0.18)] backdrop-blur">
            <div className="grid gap-4 lg:grid-cols-[.86fr_1.14fr]">
              <div className="rounded-[26px] bg-violet-950 p-5 text-white">
                <p className="text-sm text-violet-200">Painel ativo</p>
                <strong className="mt-3 block text-4xl">{demoHostMetrics.totalGuests}</strong>
                <span className="text-sm text-violet-200">convidados mapeados</span>
                <div className="mt-8 grid gap-3">
                  {features.slice(0, 4).map((feature) => {
                    const Icon = feature.icon;
                    return (
                      <div key={feature.label} className="flex items-center gap-3 rounded-2xl bg-white/10 p-3 text-sm">
                        <Icon className="h-4 w-4 text-fuchsia-200" />
                        {feature.label}
                      </div>
                    );
                  })}
                </div>
              </div>
              <EventCard event={demoEvents[0]} guests={demoGuests.length} />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <article key={feature.label} className="rounded-[24px] border border-white/80 bg-white p-5 shadow-sm">
                <Icon className="h-5 w-5 text-violet-700" />
                <strong className="mt-4 block text-violet-950">{feature.label}</strong>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}

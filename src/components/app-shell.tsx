"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  CalendarDays,
  CreditCard,
  LayoutDashboard,
  LogOut,
  QrCode,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { useAuth } from "@/contexts/auth-context";
import { initials } from "@/lib/format";
import type { UserRole } from "@/lib/types";

const navByRole: Record<UserRole, Array<{ label: string; href: string; icon: typeof LayoutDashboard }>> = {
  ADMIN: [
    { label: "Admin", href: "/admin", icon: ShieldCheck },
    { label: "Planos", href: "/planos", icon: CreditCard },
  ],
  HOST: [
    { label: "Dashboard", href: "/host", icon: LayoutDashboard },
    { label: "Novo evento", href: "/host/eventos/novo", icon: CalendarDays },
    { label: "Planos", href: "/planos", icon: CreditCard },
  ],
  GUEST: [
    { label: "Convite", href: "/convite/demo-token-ana", icon: Sparkles },
    { label: "Album", href: "/album/event-luna-rafa", icon: CalendarDays },
  ],
  RECEPTIONIST: [
    { label: "Check-in", href: "/checkin", icon: QrCode },
    { label: "Planos", href: "/planos", icon: CreditCard },
  ],
};

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  async function handleLogout() {
    await logout();
    router.push("/login");
  }

  const nav = user ? navByRole[user.role] : [];

  return (
    <div className="min-h-screen bg-[#fbf8ff] text-zinc-950">
      <aside className="fixed inset-x-0 top-0 z-30 border-b border-white/70 bg-white/80 px-4 py-3 shadow-sm backdrop-blur-xl lg:inset-y-0 lg:left-0 lg:right-auto lg:w-72 lg:border-b-0 lg:border-r lg:px-6 lg:py-6">
        <div className="flex items-center justify-between gap-4 lg:block">
          <Link href="/" className="inline-flex">
            <BrandLogo size="sm" label="eventos especiais" />
          </Link>

          {user && (
            <button
              onClick={handleLogout}
              className="grid h-10 w-10 place-items-center rounded-2xl border border-violet-100 bg-white text-violet-800 transition hover:border-violet-300 lg:hidden"
              title="Sair"
            >
              <LogOut className="h-4 w-4" />
            </button>
          )}
        </div>

        <nav className="mt-4 flex gap-2 overflow-x-auto pb-1 lg:mt-10 lg:block lg:space-y-2 lg:overflow-visible">
          {nav.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex min-w-max items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                  active
                    ? "bg-violet-950 text-white shadow-lg shadow-violet-100"
                    : "text-zinc-600 hover:bg-violet-50 hover:text-violet-950"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {user && (
          <div className="mt-8 hidden rounded-[24px] border border-violet-100 bg-white p-4 shadow-sm lg:block">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-violet-100 font-semibold text-violet-950">
                {initials(user.name)}
              </span>
              <span className="min-w-0">
                <strong className="block truncate text-sm">{user.name}</strong>
                <small className="text-xs text-zinc-500">{user.role}</small>
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-2xl border border-violet-100 text-sm font-medium text-violet-800 transition hover:border-violet-300"
            >
              <LogOut className="h-4 w-4" />
              Sair
            </button>
          </div>
        )}
      </aside>

      <main className="px-4 pb-10 pt-32 sm:px-6 lg:ml-72 lg:px-8 lg:pt-8">{children}</main>
    </div>
  );
}

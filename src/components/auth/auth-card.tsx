"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Crown, LockKeyhole, Mail, UserRound } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { useAuth } from "@/contexts/auth-context";
import { roleHome } from "@/lib/constants";

export function AuthCard({ mode }: { mode: "login" | "signup" | "reset" }) {
  const router = useRouter();
  const { login, signup, resetPassword } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("host@invita.app");
  const [password, setPassword] = useState("invita123");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");

    try {
      if (mode === "reset") {
        await resetPassword(email);
        setMessage("Enviamos as instrucoes de recuperacao para o email informado.");
        return;
      }

      const profile =
        mode === "signup"
          ? await signup({ name, email, password })
          : await login(email, password);

      router.push(roleHome[profile.role]);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Nao foi possivel concluir agora.");
    } finally {
      setBusy(false);
    }
  }

  const title =
    mode === "login" ? "Entrar no INVITA" : mode === "signup" ? "Criar conta" : "Recuperar senha";

  return (
    <div className="grid min-h-screen place-items-center bg-[linear-gradient(135deg,#fff_0%,#f6edff_46%,#fdf7ff_100%)] px-4 py-10">
      <div className="w-full max-w-md rounded-[28px] border border-white/80 bg-white/88 p-6 shadow-[0_24px_70px_rgba(88,28,135,0.18)] backdrop-blur">
        <Link href="/" className="mb-8 inline-flex">
          <BrandLogo />
        </Link>

        <div className="mb-6">
          <h1 className="text-3xl font-semibold text-violet-950">{title}</h1>
          <p className="mt-2 text-sm leading-6 text-zinc-600">
            Cadastro aberto cria uma conta de anfitriao. Equipe de recepcao e convidados sao cadastrados pelo anfitriao.
          </p>
        </div>

        <form className="space-y-4" onSubmit={onSubmit}>
          {mode === "signup" && (
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-zinc-700">Nome</span>
              <span className="flex items-center gap-3 rounded-2xl border border-violet-100 bg-white px-4 py-3">
                <UserRound className="h-4 w-4 text-violet-500" />
                <input
                  required
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="w-full bg-transparent text-sm outline-none"
                  placeholder="Seu nome"
                />
              </span>
            </label>
          )}

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-zinc-700">Email</span>
            <span className="flex items-center gap-3 rounded-2xl border border-violet-100 bg-white px-4 py-3">
              <Mail className="h-4 w-4 text-violet-500" />
              <input
                required
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full bg-transparent text-sm outline-none"
                placeholder="voce@email.com"
              />
            </span>
          </label>

          {mode !== "reset" && (
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-zinc-700">Senha</span>
              <span className="flex items-center gap-3 rounded-2xl border border-violet-100 bg-white px-4 py-3">
                <LockKeyhole className="h-4 w-4 text-violet-500" />
                <input
                  required
                  minLength={mode === "signup" ? 8 : 6}
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full bg-transparent text-sm outline-none"
                  placeholder={mode === "signup" ? "minimo 8 caracteres" : "minimo 6 caracteres"}
                />
              </span>
            </label>
          )}

          {message && (
            <div className="rounded-2xl border border-violet-100 bg-violet-50 px-4 py-3 text-sm text-violet-900">
              {message}
            </div>
          )}

          <button
            disabled={busy}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-violet-950 px-5 text-sm font-semibold text-white shadow-xl shadow-violet-200 transition hover:bg-violet-800 disabled:cursor-wait disabled:opacity-70"
          >
            <Crown className="h-4 w-4" />
            {busy ? "Processando..." : mode === "login" ? "Entrar" : mode === "signup" ? "Cadastrar" : "Enviar"}
          </button>
        </form>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm text-zinc-600">
          {mode !== "login" ? <Link href="/login">Ja tenho conta</Link> : <Link href="/cadastro">Criar conta</Link>}
          {mode !== "reset" && <Link href="/recuperar">Esqueci minha senha</Link>}
        </div>
      </div>
    </div>
  );
}

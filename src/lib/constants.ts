import type { EventType, PlanDefinition, UserRole } from "@/lib/types";

export const roleHome: Record<UserRole, string> = {
  ADMIN: "/admin",
  HOST: "/host",
  GUEST: "/convite/demo-token-ana",
  RECEPTIONIST: "/checkin",
};

export const roleLabels: Record<UserRole, string> = {
  ADMIN: "Admin",
  HOST: "Anfitriao",
  GUEST: "Convidado",
  RECEPTIONIST: "Recepcao",
};

export const eventTypeLabels: Record<EventType, string> = {
  wedding: "Casamento",
  debutante: "Debutante",
  kids: "Festa infantil",
  party: "Festa normal",
};

export const eventTheme: Record<
  EventType,
  {
    name: string;
    accent: string;
    panel: string;
    font: string;
    texture: string;
  }
> = {
  wedding: {
    name: "Vows",
    accent: "from-violet-500 via-fuchsia-400 to-rose-300",
    panel: "bg-white/82",
    font: "font-serif",
    texture: "linear-gradient(135deg, #fff 0%, #f6efff 55%, #fff7fb 100%)",
  },
  debutante: {
    name: "Fifteen",
    accent: "from-fuchsia-500 via-violet-500 to-indigo-400",
    panel: "bg-white/84",
    font: "font-sans",
    texture: "linear-gradient(140deg, #fff 0%, #f7edff 48%, #eef2ff 100%)",
  },
  kids: {
    name: "Joy",
    accent: "from-violet-400 via-sky-300 to-pink-300",
    panel: "bg-white/88",
    font: "font-sans",
    texture: "linear-gradient(135deg, #fff 0%, #f5f3ff 45%, #fff1f2 100%)",
  },
  party: {
    name: "Noite",
    accent: "from-violet-600 via-purple-500 to-fuchsia-500",
    panel: "bg-white/82",
    font: "font-sans",
    texture: "linear-gradient(135deg, #10051f 0%, #2b0f4f 52%, #f8f4ff 100%)",
  },
};

export const plans: PlanDefinition[] = [
  {
    id: "individual",
    name: "Individual",
    price: 89,
    recurrence: "once",
    eventLimit: 1,
    description: "Perfeito para um evento unico com convite digital completo.",
    features: [
      "1 evento publicado",
      "QR Code unico por convidado",
      "Album colaborativo",
      "Check-in por camera",
      "Dashboard do anfitriao",
    ],
  },
  {
    id: "venue",
    name: "Casa de festas",
    price: 149,
    recurrence: "monthly",
    eventLimit: "unlimited",
    description: "Assinatura para operacoes recorrentes com eventos ilimitados.",
    features: [
      "Eventos ilimitados",
      "Recepcao multiusuario",
      "Metricas em tempo real",
      "Gestao de fotos e downloads ZIP",
      "Prioridade para novas automacoes",
    ],
  },
];

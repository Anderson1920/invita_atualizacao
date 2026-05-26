import type {
  DashboardMetrics,
  EventRecord,
  GuestRecord,
  HostMetrics,
  NotificationRecord,
  PaymentRecord,
  PhotoRecord,
  UserProfile,
} from "@/lib/types";

const now = new Date().toISOString();

export const demoUsers: UserProfile[] = [
  {
    id: "admin-demo",
    name: "Helena Admin",
    email: "admin@invita.app",
    role: "ADMIN",
    status: "active",
    createdAt: now,
  },
  {
    id: "host-demo",
    name: "Marina Costa",
    email: "host@invita.app",
    phone: "+55 11 99999-0000",
    role: "HOST",
    status: "active",
    createdAt: now,
    plan: {
      id: "plan-demo-venue",
      type: "venue",
      status: "active",
      eventLimit: "unlimited",
      startedAt: now,
      expiresAt: "2026-06-19T03:00:00.000Z",
      sourcePaymentId: "mp-demo-approved",
    },
  },
  {
    id: "guest-demo",
    name: "Ana Beatriz",
    email: "ana@exemplo.com",
    role: "GUEST",
    status: "active",
    createdAt: now,
  },
  {
    id: "reception-demo",
    name: "Lucas Recepcao",
    email: "recepcao@invita.app",
    role: "RECEPTIONIST",
    status: "active",
    createdAt: now,
  },
];

export const demoEvents: EventRecord[] = [
  {
    id: "event-luna-rafa",
    hostId: "host-demo",
    name: "Luna & Rafa",
    type: "wedding",
    description: "Uma celebracao elegante no jardim, com jantar, musica ao vivo e lembrancas digitais.",
    date: "2026-08-22",
    time: "18:30",
    location: "Villa Aurora, Sao Paulo",
    mapsUrl: "https://maps.google.com/?q=Villa+Aurora+Sao+Paulo",
    heroImageUrl:
      "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1600&q=80",
    hostMessage:
      "Sua presenca torna este dia ainda mais nosso. Apresente este convite na recepcao e compartilhe suas fotos no album.",
    status: "active",
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "event-bella-15",
    hostId: "host-demo",
    name: "Bella 15",
    type: "debutante",
    description: "Uma noite de luzes, pista cheia e memorias compartilhadas.",
    date: "2026-09-05",
    time: "20:00",
    location: "Maison Lumiere, Rio de Janeiro",
    mapsUrl: "https://maps.google.com/?q=Maison+Lumiere+Rio+de+Janeiro",
    heroImageUrl:
      "https://images.unsplash.com/photo-1505236858219-8359eb29e329?auto=format&fit=crop&w=1600&q=80",
    hostMessage: "Chegue com energia boa e registre seus melhores momentos no album da festa.",
    status: "draft",
    createdAt: now,
    updatedAt: now,
  },
];

export const demoGuests: GuestRecord[] = [
  {
    id: "guest-ana",
    eventId: "event-luna-rafa",
    name: "Ana Beatriz",
    email: "ana@exemplo.com",
    phone: "+55 11 90000-1111",
    companions: 1,
    personalMessage: "Reservamos um lugar especial para voce e seu acompanhante.",
    token: "demo-token-ana",
    qrHash: "demo-hash-ana",
    status: "confirmed",
    createdAt: now,
  },
  {
    id: "guest-carlos",
    eventId: "event-luna-rafa",
    name: "Carlos Mendes",
    email: "carlos@exemplo.com",
    phone: "+55 11 90000-2222",
    companions: 0,
    personalMessage: "Mal podemos esperar para celebrar com voce.",
    token: "demo-token-carlos",
    qrHash: "demo-hash-carlos",
    status: "checked_in",
    checkedInAt: "2026-08-22T21:13:00.000Z",
    createdAt: now,
  },
  {
    id: "guest-julia",
    eventId: "event-luna-rafa",
    name: "Julia Andrade",
    email: "julia@exemplo.com",
    phone: "+55 11 90000-3333",
    companions: 2,
    personalMessage: "Sua mesa esta preparada para receber sua familia.",
    token: "demo-token-julia",
    qrHash: "demo-hash-julia",
    status: "pending",
    createdAt: now,
  },
];

export const demoPhotos: PhotoRecord[] = [
  {
    id: "photo-1",
    eventId: "event-luna-rafa",
    uploaderId: "guest-demo",
    uploaderName: "Ana",
    url: "https://images.unsplash.com/photo-1523438885200-e635ba2c371e?auto=format&fit=crop&w=1200&q=80",
    likes: 42,
    featured: true,
    createdAt: now,
  },
  {
    id: "photo-2",
    eventId: "event-luna-rafa",
    uploaderName: "Rafa",
    url: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1200&q=80",
    likes: 31,
    featured: false,
    createdAt: now,
  },
  {
    id: "photo-3",
    eventId: "event-luna-rafa",
    uploaderName: "Luna",
    url: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1200&q=80",
    likes: 27,
    featured: false,
    createdAt: now,
  },
];

export const demoPayments: PaymentRecord[] = [
  {
    id: "payment-1",
    userId: "host-demo",
    planType: "venue",
    amount: 149,
    currency: "BRL",
    provider: "mercadopago",
    providerPaymentId: "mp-demo-approved",
    status: "approved",
    createdAt: now,
    approvedAt: now,
  },
  {
    id: "payment-2",
    userId: "host-demo",
    planType: "individual",
    amount: 89,
    currency: "BRL",
    provider: "mercadopago",
    providerPaymentId: "mp-demo-previous",
    status: "approved",
    createdAt: "2026-03-12T12:00:00.000Z",
    approvedAt: "2026-03-12T12:04:00.000Z",
  },
];

export const demoNotifications: NotificationRecord[] = [
  {
    id: "notification-1",
    userId: "host-demo",
    title: "Evento proximo",
    body: "Luna & Rafa acontece em breve. Revise convidados pendentes.",
    read: false,
    scheduledFor: "2026-08-21T12:00:00.000Z",
    createdAt: now,
  },
  {
    id: "notification-2",
    userId: "guest-demo",
    title: "Mensagem do anfitriao",
    body: "Apresente seu QR Code na entrada e compartilhe fotos no album.",
    read: false,
    createdAt: now,
  },
];

export const demoAdminMetrics: DashboardMetrics = {
  totalUsers: 1284,
  totalEvents: 312,
  revenue: 58420,
  activeEvents: 86,
  finishedEvents: 226,
};

export const demoHostMetrics: HostMetrics = {
  totalGuests: demoGuests.length,
  confirmed: demoGuests.filter((guest) => guest.status === "confirmed" || guest.status === "checked_in").length,
  checkins: demoGuests.filter((guest) => guest.status === "checked_in").length,
  photos: demoPhotos.length,
};

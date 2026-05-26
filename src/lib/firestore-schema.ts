export const firestoreSchema = {
  users: {
    role: "ADMIN | HOST | GUEST | RECEPTIONIST",
    status: "active | blocked",
    plan: "plano ativo embutido para checagem rapida de entitlement",
  },
  events: {
    hostId: "dono do evento",
    type: "wedding | debutante | kids | party",
    status: "draft | active | finished | cancelled",
  },
  guests: {
    eventId: "evento relacionado",
    token: "token assinado para convite",
    qrHash: "hash SHA-256 para validacao sem expor segredo",
    status: "pending | confirmed | declined | checked_in",
  },
  checkins: {
    eventId: "evento validado",
    guestId: "convidado validado",
    receptionistId: "usuario que realizou leitura",
  },
  photos: {
    eventId: "evento relacionado",
    storagePath: "caminho opcional no Firebase Storage",
    featured: "foto destacada pelo host",
  },
  plans: {
    userId: "usuario contratante",
    type: "individual | venue",
    status: "active | expired | cancelled",
  },
  payments: {
    provider: "mercadopago",
    providerPaymentId: "id do pagamento no Mercado Pago",
    status: "pending | approved | rejected | cancelled",
  },
  notifications: {
    userId: "destinatario",
    scheduledFor: "data opcional para lembrete",
    read: "controle de leitura",
  },
} as const;

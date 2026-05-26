export type UserRole = "ADMIN" | "HOST" | "GUEST" | "RECEPTIONIST";

export type EventType = "wedding" | "debutante" | "kids" | "party";

export type EventStatus = "draft" | "active" | "finished" | "cancelled";

export type GuestStatus = "pending" | "confirmed" | "declined" | "checked_in";

export type PlanType = "individual" | "venue";

export type PaymentStatus = "pending" | "approved" | "rejected" | "cancelled";

export type CheckinStatus = "valid" | "invalid" | "used";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  status: "active" | "blocked";
  plan?: UserPlan;
  createdAt: string;
}

export interface UserPlan {
  id: string;
  type: PlanType;
  status: "active" | "expired" | "cancelled";
  eventLimit: number | "unlimited";
  startedAt: string;
  expiresAt?: string;
  sourcePaymentId?: string;
}

export interface EventRecord {
  id: string;
  hostId: string;
  name: string;
  type: EventType;
  description: string;
  date: string;
  time: string;
  location: string;
  mapsUrl: string;
  heroImageUrl: string;
  hostMessage: string;
  status: EventStatus;
  createdAt: string;
  updatedAt: string;
}

export interface GuestRecord {
  id: string;
  eventId: string;
  name: string;
  email: string;
  phone: string;
  companions: number;
  personalMessage: string;
  token: string;
  qrHash: string;
  status: GuestStatus;
  checkedInAt?: string;
  createdAt: string;
}

export interface CheckinRecord {
  id: string;
  eventId: string;
  guestId: string;
  receptionistId: string;
  status: CheckinStatus;
  tokenHash: string;
  createdAt: string;
}

export interface PhotoRecord {
  id: string;
  eventId: string;
  uploaderId?: string;
  uploaderName: string;
  url: string;
  storagePath?: string;
  likes: number;
  featured: boolean;
  createdAt: string;
}

export interface PaymentRecord {
  id: string;
  userId: string;
  planType: PlanType;
  amount: number;
  currency: "BRL";
  provider: "mercadopago";
  providerPaymentId?: string;
  status: PaymentStatus;
  createdAt: string;
  approvedAt?: string;
}

export interface NotificationRecord {
  id: string;
  userId: string;
  title: string;
  body: string;
  read: boolean;
  scheduledFor?: string;
  createdAt: string;
}

export interface DashboardMetrics {
  totalUsers: number;
  totalEvents: number;
  revenue: number;
  activeEvents: number;
  finishedEvents: number;
}

export interface HostMetrics {
  totalGuests: number;
  confirmed: number;
  checkins: number;
  photos: number;
}

export interface PlanDefinition {
  id: PlanType;
  name: string;
  price: number;
  recurrence: "once" | "monthly";
  eventLimit: number | "unlimited";
  description: string;
  features: string[];
}

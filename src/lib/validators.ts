import { z } from "zod";

export const eventSchema = z.object({
  name: z.string().min(2),
  type: z.enum(["wedding", "debutante", "kids", "party"]),
  description: z.string().min(8),
  date: z.string().min(8),
  time: z.string().min(4),
  location: z.string().min(3),
  mapsUrl: z.string().url().or(z.literal("")),
  heroImageUrl: z.string().url().or(z.literal("")),
  hostMessage: z.string().min(8),
});

export const guestSchema = z.object({
  eventId: z.string().min(2),
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(8),
  companions: z.coerce.number().int().min(0).max(20),
  personalMessage: z.string().default(""),
});

export const checkoutSchema = z.object({
  planType: z.enum(["individual", "venue"]),
  userId: z.string().min(2),
  email: z.string().email(),
});

export const checkinSchema = z.object({
  token: z.string().min(8),
  receptionistId: z.string().min(2).default("reception-demo"),
});

export const photoSchema = z.object({
  eventId: z.string().min(2),
  uploaderName: z.string().min(2),
  url: z.string().url(),
});

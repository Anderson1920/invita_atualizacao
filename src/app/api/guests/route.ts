import crypto from "node:crypto";
import { NextRequest } from "next/server";
import { ok, fail } from "@/lib/api-response";
import { getRequestUser, requireRole } from "@/lib/auth-server";
import { getAdminDb } from "@/lib/firebase/admin";
import { collections } from "@/lib/firebase/collections";
import { createGuestToken, hashToken } from "@/lib/security";
import { guestSchema } from "@/lib/validators";
import type { GuestRecord } from "@/lib/types";

export async function POST(request: NextRequest) {
  const user = await getRequestUser(request);

  if (!requireRole(user, ["HOST", "ADMIN"])) {
    return fail("Sem permissao para cadastrar convidados.", 403);
  }

  const parsed = guestSchema.safeParse(await request.json());

  if (!parsed.success) {
    return fail("Dados do convidado invalidos.", 422, parsed.error.flatten());
  }

  const db = getAdminDb();
  const now = new Date().toISOString();
  const id = db ? db.collection(collections.guests).doc().id : `guest-${crypto.randomUUID()}`;
  const token = createGuestToken(parsed.data.eventId, id);
  const guest: GuestRecord = {
    id,
    ...parsed.data,
    token,
    qrHash: hashToken(token),
    status: "pending",
    createdAt: now,
  };

  if (!db) {
    return ok(guest, { status: 201 });
  }

  const eventDoc = await db.collection(collections.events).doc(parsed.data.eventId).get();

  if (!eventDoc.exists) {
    return fail("Evento nao encontrado.", 404);
  }

  const event = eventDoc.data();

  if (user!.role !== "ADMIN" && event?.hostId !== user!.id) {
    return fail("Sem permissao para este evento.", 403);
  }

  await db.collection(collections.guests).doc(id).set(guest);

  return ok(guest, { status: 201 });
}

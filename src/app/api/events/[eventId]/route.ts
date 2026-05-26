import { NextRequest } from "next/server";
import { ok, fail } from "@/lib/api-response";
import { getRequestUser, requireRole } from "@/lib/auth-server";
import { getAdminDb } from "@/lib/firebase/admin";
import { collections } from "@/lib/firebase/collections";
import { eventSchema } from "@/lib/validators";
import { demoEvents, demoGuests, demoPhotos } from "@/lib/demo-data";

export async function GET(_request: NextRequest, context: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await context.params;
  const db = getAdminDb();

  if (!db) {
    const event = demoEvents.find((item) => item.id === eventId);

    if (!event) {
      return fail("Evento nao encontrado.", 404);
    }

    return ok({
      event,
      guests: demoGuests.filter((guest) => guest.eventId === eventId),
      photos: demoPhotos.filter((photo) => photo.eventId === eventId),
    });
  }

  const eventDoc = await db.collection(collections.events).doc(eventId).get();

  if (!eventDoc.exists) {
    return fail("Evento nao encontrado.", 404);
  }

  const [guests, photos] = await Promise.all([
    db.collection(collections.guests).where("eventId", "==", eventId).orderBy("createdAt", "desc").get(),
    db.collection(collections.photos).where("eventId", "==", eventId).orderBy("createdAt", "desc").get(),
  ]);

  return ok({
    event: { id: eventDoc.id, ...eventDoc.data() },
    guests: guests.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
    photos: photos.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
  });
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ eventId: string }> }) {
  const user = await getRequestUser(request);

  if (!requireRole(user, ["HOST", "ADMIN"])) {
    return fail("Sem permissao para editar este evento.", 403);
  }

  const parsed = eventSchema.partial().safeParse(await request.json());

  if (!parsed.success) {
    return fail("Dados invalidos.", 422, parsed.error.flatten());
  }

  const { eventId } = await context.params;
  const db = getAdminDb();

  if (!db) {
    return ok({
      id: eventId,
      ...parsed.data,
      updatedAt: new Date().toISOString(),
    });
  }

  const ref = db.collection(collections.events).doc(eventId);
  const doc = await ref.get();

  if (!doc.exists) {
    return fail("Evento nao encontrado.", 404);
  }

  const event = doc.data();

  if (user!.role !== "ADMIN" && event?.hostId !== user!.id) {
    return fail("Sem permissao para editar este evento.", 403);
  }

  await ref.update({
    ...parsed.data,
    updatedAt: new Date().toISOString(),
  });

  return ok({ id: eventId, ...event, ...parsed.data });
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ eventId: string }> }) {
  const user = await getRequestUser(request);

  if (!requireRole(user, ["HOST", "ADMIN"])) {
    return fail("Sem permissao para excluir este evento.", 403);
  }

  const { eventId } = await context.params;
  const db = getAdminDb();

  if (!db) {
    return ok({ id: eventId, deleted: true });
  }

  const ref = db.collection(collections.events).doc(eventId);
  const doc = await ref.get();

  if (!doc.exists) {
    return fail("Evento nao encontrado.", 404);
  }

  const event = doc.data();

  if (user!.role !== "ADMIN" && event?.hostId !== user!.id) {
    return fail("Sem permissao para excluir este evento.", 403);
  }

  await ref.update({
    status: "cancelled",
    updatedAt: new Date().toISOString(),
  });

  return ok({ id: eventId, deleted: true });
}

import { NextRequest } from "next/server";
import { ok, fail } from "@/lib/api-response";
import { getAdminDb } from "@/lib/firebase/admin";
import { collections } from "@/lib/firebase/collections";
import { demoEvents, demoGuests } from "@/lib/demo-data";
import { invitationUrl } from "@/lib/qr";
import { verifyGuestToken } from "@/lib/security";

export async function GET(_request: NextRequest, context: { params: Promise<{ token: string }> }) {
  const { token: rawToken } = await context.params;
  const token = decodeURIComponent(rawToken);
  const demoGuest = demoGuests.find((guest) => guest.token === token);

  if (demoGuest) {
    const event = demoEvents.find((item) => item.id === demoGuest.eventId);

    if (!event) {
      return fail("Evento do convite nao encontrado.", 404);
    }

    return ok({
      event,
      guest: demoGuest,
      qrValue: invitationUrl(demoGuest.token),
    });
  }

  const parsed = verifyGuestToken(token);

  if (!parsed.valid) {
    return fail("Convite invalido.", 422);
  }

  const db = getAdminDb();

  if (!db) {
    return fail("Convite nao encontrado.", 404);
  }

  const guestDoc = await db.collection(collections.guests).doc(parsed.guestId).get();

  if (!guestDoc.exists || guestDoc.data()?.qrHash !== parsed.hash) {
    return fail("Convite nao encontrado.", 404);
  }

  const eventDoc = await db.collection(collections.events).doc(parsed.eventId).get();

  if (!eventDoc.exists) {
    return fail("Evento do convite nao encontrado.", 404);
  }

  return ok({
    event: { id: eventDoc.id, ...eventDoc.data() },
    guest: { id: guestDoc.id, ...guestDoc.data() },
    qrValue: invitationUrl(token),
  });
}

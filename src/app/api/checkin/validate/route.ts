import crypto from "node:crypto";
import { NextRequest } from "next/server";
import { ok, fail } from "@/lib/api-response";
import { getRequestUser, requireRole } from "@/lib/auth-server";
import { getAdminDb } from "@/lib/firebase/admin";
import { collections } from "@/lib/firebase/collections";
import { demoEvents, demoGuests } from "@/lib/demo-data";
import { hashToken, verifyGuestToken } from "@/lib/security";
import { checkinSchema } from "@/lib/validators";

export async function POST(request: NextRequest) {
  const user = await getRequestUser(request);

  if (!requireRole(user, ["RECEPTIONIST", "HOST", "ADMIN"])) {
    return fail("Sem permissao para validar check-in.", 403);
  }

  const parsed = checkinSchema.safeParse(await request.json());

  if (!parsed.success) {
    return fail("Token invalido.", 422, parsed.error.flatten());
  }

  const demoGuest = demoGuests.find((guest) => guest.token === parsed.data.token);

  if (demoGuest) {
    const event = demoEvents.find((item) => item.id === demoGuest.eventId);

    if (demoGuest.status === "checked_in") {
      return ok({
        status: "used",
        message: "QR Code ja utilizado.",
        guest: {
          name: demoGuest.name,
          companions: demoGuest.companions,
          eventName: event?.name || "Evento",
        },
      });
    }

    return ok({
      status: "valid",
      message: "Entrada confirmada.",
      guest: {
        name: demoGuest.name,
        companions: demoGuest.companions,
        eventName: event?.name || "Evento",
      },
    });
  }

  const tokenData = verifyGuestToken(parsed.data.token);

  if (!tokenData.valid) {
    return ok({
      status: "invalid",
      message: "QR Code invalido.",
    });
  }

  const db = getAdminDb();

  if (!db) {
    return ok({
      status: "invalid",
      message: "Convite nao encontrado.",
    });
  }

  const response = await db.runTransaction(async (transaction) => {
    const guestRef = db.collection(collections.guests).doc(tokenData.guestId);
    const guestDoc = await transaction.get(guestRef);

    if (!guestDoc.exists) {
      return {
        status: "invalid",
        message: "Convite nao encontrado.",
      };
    }

    const guest = guestDoc.data()!;

    if (guest.qrHash !== tokenData.hash || guest.eventId !== tokenData.eventId) {
      return {
        status: "invalid",
        message: "QR Code nao corresponde ao convite.",
      };
    }

    const eventRef = db.collection(collections.events).doc(tokenData.eventId);
    const eventDoc = await transaction.get(eventRef);
    const eventName = eventDoc.data()?.name || "Evento";

    if (guest.status === "checked_in") {
      return {
        status: "used",
        message: "QR Code ja utilizado.",
        guest: {
          name: guest.name,
          companions: guest.companions,
          eventName,
        },
      };
    }

    const checkedInAt = new Date().toISOString();
    const checkinRef = db.collection(collections.checkins).doc(crypto.randomUUID());

    transaction.update(guestRef, {
      status: "checked_in",
      checkedInAt,
    });
    transaction.set(checkinRef, {
      id: checkinRef.id,
      eventId: guest.eventId,
      guestId: guestDoc.id,
      receptionistId: parsed.data.receptionistId,
      status: "valid",
      tokenHash: hashToken(parsed.data.token),
      createdAt: checkedInAt,
    });

    return {
      status: "valid",
      message: "Entrada confirmada.",
      guest: {
        name: guest.name,
        companions: guest.companions,
        eventName,
      },
    };
  });

  return ok(response);
}

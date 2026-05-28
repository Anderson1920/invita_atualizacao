import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import { getRequestUser, requireRole } from "@/lib/auth-server";

export async function GET(req: NextRequest) {
  try {
    const user = await getRequestUser(req);
    if (!requireRole(user, ["HOST", "ADMIN"])) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const db = getAdminDb();
    if (!db) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });

    // Buscar eventos do host
    const eventsSnap = await db.collection("events").where("hostId", "==", user!.id).get();
    const eventIds = eventsSnap.docs.map((doc) => doc.id);

    if (eventIds.length === 0) {
      return NextResponse.json({ ok: true, data: { totalGuests: 0, confirmed: 0, checkins: 0, photos: 0 } });
    }

    // Buscar convidados e fotos de todos os eventos do host
    const [guestsSnap, photosSnap] = await Promise.all([
      db.collection("guests").where("eventId", "in", eventIds.slice(0, 10)).get(),
      db.collection("photos").where("eventId", "in", eventIds.slice(0, 10)).get(),
    ]);

    const guests = guestsSnap.docs.map((doc) => doc.data());

    return NextResponse.json({
      ok: true,
      data: {
        totalGuests: guests.length,
        confirmed: guests.filter((g) => g.status === "confirmed" || g.status === "checked_in").length,
        checkins: guests.filter((g) => g.status === "checked_in").length,
        photos: photosSnap.size,
      },
    });
  } catch (error) {
    console.error("Host metrics error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

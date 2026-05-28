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

    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get("eventId");
    if (!eventId) return NextResponse.json({ error: "Missing eventId" }, { status: 400 });

    // Verificar se o host tem acesso ao evento
    if (user!.role === "HOST") {
      const eventDoc = await db.collection("events").doc(eventId).get();
      if (!eventDoc.exists || eventDoc.data()?.hostId !== user!.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    const snapshot = await db.collection("guests").where("eventId", "==", eventId).get();
    const guests = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json({ ok: true, data: guests });
  } catch (error) {
    console.error("Host guests GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getRequestUser(req);
    if (!requireRole(user, ["HOST", "ADMIN"])) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const db = getAdminDb();
    if (!db) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });

    const body = await req.json();
    const { eventId } = body;
    if (!eventId) return NextResponse.json({ error: "Missing eventId" }, { status: 400 });

    // Verificar se o host tem acesso ao evento
    if (user!.role === "HOST") {
      const eventDoc = await db.collection("events").doc(eventId).get();
      if (!eventDoc.exists || eventDoc.data()?.hostId !== user!.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    const now = new Date().toISOString();
    const guestData = { ...body, status: "pending", createdAt: now };
    const ref = await db.collection("guests").add(guestData);
    return NextResponse.json({ ok: true, data: { id: ref.id, ...guestData } });
  } catch (error) {
    console.error("Host guests POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getRequestUser(req);
    if (!requireRole(user, ["HOST", "ADMIN"])) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { guestId, eventId } = await req.json();
    if (!guestId || !eventId) return NextResponse.json({ error: "Missing guestId or eventId" }, { status: 400 });

    const db = getAdminDb();
    if (!db) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });

    if (user!.role === "HOST") {
      const eventDoc = await db.collection("events").doc(eventId).get();
      if (!eventDoc.exists || eventDoc.data()?.hostId !== user!.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    await db.collection("guests").doc(guestId).delete();
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Host guests DELETE error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

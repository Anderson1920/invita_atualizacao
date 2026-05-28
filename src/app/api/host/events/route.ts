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

    // Admin vê todos, Host vê apenas os seus
    let query = db.collection("events").orderBy("createdAt", "desc");
    if (user!.role === "HOST") {
      query = db.collection("events").where("hostId", "==", user!.id).orderBy("createdAt", "desc") as any;
    }

    const snapshot = await query.limit(100).get();
    const events = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json({ ok: true, data: events });
  } catch (error) {
    console.error("Host events GET error:", error);
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
    const now = new Date().toISOString();
    const eventData = {
      ...body,
      hostId: user!.id,
      status: "draft",
      createdAt: now,
      updatedAt: now,
    };

    const ref = await db.collection("events").add(eventData);
    return NextResponse.json({ ok: true, data: { id: ref.id, ...eventData } });
  } catch (error) {
    console.error("Host events POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getRequestUser(req);
    if (!requireRole(user, ["HOST", "ADMIN"])) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { eventId } = await req.json();
    if (!eventId) return NextResponse.json({ error: "Missing eventId" }, { status: 400 });

    const db = getAdminDb();
    if (!db) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });

    const eventDoc = await db.collection("events").doc(eventId).get();
    if (!eventDoc.exists) return NextResponse.json({ error: "Event not found" }, { status: 404 });

    // Host só pode deletar os seus próprios eventos
    if (user!.role === "HOST" && eventDoc.data()?.hostId !== user!.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await db.collection("events").doc(eventId).delete();
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Host events DELETE error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

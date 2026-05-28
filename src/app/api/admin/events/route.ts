import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import { getRequestUser, requireRole } from "@/lib/auth-server";

export async function GET(req: NextRequest) {
  try {
    const user = await getRequestUser(req);
    if (!requireRole(user, ["ADMIN"])) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const db = getAdminDb();
    if (!db) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });

    const snapshot = await db.collection("events").orderBy("createdAt", "desc").limit(100).get();
    const events = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json({ ok: true, data: events });
  } catch (error) {
    console.error("Admin events GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getRequestUser(req);
    if (!requireRole(user, ["ADMIN"])) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { eventId } = await req.json();
    if (!eventId) return NextResponse.json({ error: "Missing eventId" }, { status: 400 });

    const db = getAdminDb();
    if (!db) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });

    await db.collection("events").doc(eventId).delete();
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Admin events DELETE error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

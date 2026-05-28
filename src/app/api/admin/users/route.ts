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

    const snapshot = await db.collection("users").orderBy("createdAt", "desc").limit(100).get();
    const users = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json({ ok: true, data: users });
  } catch (error) {
    console.error("Admin users GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await getRequestUser(req);
    if (!requireRole(user, ["ADMIN"])) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { userId, status } = await req.json();
    if (!userId || !status) {
      return NextResponse.json({ error: "Missing userId or status" }, { status: 400 });
    }
    const db = getAdminDb();
    if (!db) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });

    await db.collection("users").doc(userId).update({ status });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Admin users PATCH error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

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

    const [usersSnap, eventsSnap, paymentsSnap, activeSnap, finishedSnap] = await Promise.all([
      db.collection("users").count().get(),
      db.collection("events").count().get(),
      db.collection("payments").where("status", "==", "approved").get(),
      db.collection("events").where("status", "==", "active").count().get(),
      db.collection("events").where("status", "==", "finished").count().get(),
    ]);

    const revenue = paymentsSnap.docs.reduce((sum, doc) => sum + (doc.data().amount || 0), 0);

    return NextResponse.json({
      ok: true,
      data: {
        totalUsers: usersSnap.data().count,
        totalEvents: eventsSnap.data().count,
        revenue,
        activeEvents: activeSnap.data().count,
        finishedEvents: finishedSnap.data().count,
      },
    });
  } catch (error) {
    console.error("Admin metrics error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

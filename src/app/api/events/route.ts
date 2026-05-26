import crypto from "node:crypto";
import { NextRequest } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { ok, fail } from "@/lib/api-response";
import { getRequestUser, requireRole } from "@/lib/auth-server";
import { eventSchema } from "@/lib/validators";
import { getAdminDb } from "@/lib/firebase/admin";
import { collections } from "@/lib/firebase/collections";
import { demoEvents, demoUsers } from "@/lib/demo-data";
import type { EventRecord, UserProfile } from "@/lib/types";

export async function GET(request: NextRequest) {
  const user = await getRequestUser(request);
  const db = getAdminDb();

  if (!db) {
    if (!user || user.role === "ADMIN") {
      return ok(demoEvents);
    }

    return ok(demoEvents.filter((event) => event.hostId === user.id || user.id === "host-demo"));
  }

  const snapshot =
    user?.role === "ADMIN"
      ? await db.collection(collections.events).orderBy("createdAt", "desc").get()
      : await db.collection(collections.events).where("hostId", "==", user?.id || "").orderBy("createdAt", "desc").get();

  return ok(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
}

export async function POST(request: NextRequest) {
  const user = await getRequestUser(request);

  if (!requireRole(user, ["HOST", "ADMIN"])) {
    return fail("Apenas anfitrioes podem criar eventos.", 403);
  }

  const parsed = eventSchema.safeParse(await request.json());

  if (!parsed.success) {
    return fail("Dados do evento invalidos.", 422, parsed.error.flatten());
  }

  const db = getAdminDb();
  const now = new Date().toISOString();

  if (!db) {
    const demoUser = demoUsers.find((item) => item.id === user?.id) || demoUsers[1];

    if (!canCreateEvent(demoUser, demoEvents.filter((event) => event.hostId === demoUser.id).length)) {
      return fail("Voce precisa de um plano ativo para criar eventos.", 402);
    }

    const event: EventRecord = {
      id: `event-${crypto.randomUUID()}`,
      hostId: demoUser.id,
      status: "active",
      createdAt: now,
      updatedAt: now,
      ...parsed.data,
      heroImageUrl:
        parsed.data.heroImageUrl ||
        "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1600&q=80",
    };

    return ok(event, { status: 201 });
  }

  const userDoc = await db.collection(collections.users).doc(user!.id).get();
  const profile = userDoc.exists ? ({ id: userDoc.id, ...userDoc.data() } as UserProfile) : null;
  const existingEvents = await db.collection(collections.events).where("hostId", "==", user!.id).count().get();

  if (!canCreateEvent(profile, existingEvents.data().count)) {
    return fail("Voce precisa de um plano ativo para criar eventos.", 402);
  }

  const ref = db.collection(collections.events).doc();
  const event: EventRecord = {
    id: ref.id,
    hostId: user!.id,
    status: "active",
    createdAt: now,
    updatedAt: now,
    ...parsed.data,
    heroImageUrl:
      parsed.data.heroImageUrl ||
      "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1600&q=80",
  };

  await ref.set({
    ...event,
    createdAt: now,
    updatedAt: now,
    serverCreatedAt: FieldValue.serverTimestamp(),
  });

  return ok(event, { status: 201 });
}

function canCreateEvent(profile: UserProfile | null, existingEvents: number) {
  if (!profile?.plan || profile.plan.status !== "active") {
    return false;
  }

  if (profile.plan.eventLimit === "unlimited") {
    return true;
  }

  return existingEvents < profile.plan.eventLimit;
}

import crypto from "node:crypto";
import { NextRequest } from "next/server";
import { ok, fail } from "@/lib/api-response";
import { getRequestUser, requireRole } from "@/lib/auth-server";
import { getAdminDb } from "@/lib/firebase/admin";
import { collections } from "@/lib/firebase/collections";
import { demoPhotos } from "@/lib/demo-data";
import { photoSchema } from "@/lib/validators";
import type { PhotoRecord } from "@/lib/types";

export async function GET(request: NextRequest) {
  const eventId = request.nextUrl.searchParams.get("eventId");

  if (!eventId) {
    return fail("Evento obrigatorio.", 422);
  }

  const db = getAdminDb();

  if (!db) {
    return ok(demoPhotos.filter((photo) => photo.eventId === eventId));
  }

  const snapshot = await db.collection(collections.photos).where("eventId", "==", eventId).orderBy("createdAt", "desc").get();

  return ok(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
}

export async function POST(request: NextRequest) {
  const user = await getRequestUser(request);

  if (!requireRole(user, ["GUEST", "HOST", "ADMIN"])) {
    return fail("Sem permissao para enviar fotos.", 403);
  }

  const parsed = photoSchema.safeParse(await request.json());

  if (!parsed.success) {
    return fail("Dados da foto invalidos.", 422, parsed.error.flatten());
  }

  const db = getAdminDb();
  const now = new Date().toISOString();
  const id = db ? db.collection(collections.photos).doc().id : `photo-${crypto.randomUUID()}`;
  const photo: PhotoRecord = {
    id,
    eventId: parsed.data.eventId,
    uploaderId: user?.id,
    uploaderName: parsed.data.uploaderName,
    url: parsed.data.url,
    likes: 0,
    featured: false,
    createdAt: now,
  };

  if (!db) {
    return ok(photo, { status: 201 });
  }

  await db.collection(collections.photos).doc(id).set(photo);

  return ok(photo, { status: 201 });
}

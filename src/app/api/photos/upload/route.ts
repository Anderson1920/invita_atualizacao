import crypto from "node:crypto";
import { NextRequest } from "next/server";
import { ok, fail } from "@/lib/api-response";
import { getRequestUser, requireRole } from "@/lib/auth-server";
import { getAdminDb, getAdminStorage } from "@/lib/firebase/admin";
import { collections } from "@/lib/firebase/collections";
import type { PhotoRecord } from "@/lib/types";

const maxPhotoSize = 15 * 1024 * 1024;

export async function POST(request: NextRequest) {
  const user = await getRequestUser(request);

  if (!requireRole(user, ["GUEST", "HOST", "ADMIN"])) {
    return fail("Sem permissao para enviar fotos.", 403);
  }

  const formData = await request.formData();
  const eventId = String(formData.get("eventId") || "");
  const uploaderName = String(formData.get("uploaderName") || user?.email || "Convidado");
  const file = formData.get("file");

  if (!eventId || !(file instanceof File)) {
    return fail("Arquivo e evento sao obrigatorios.", 422);
  }

  if (!file.type.startsWith("image/") || file.size > maxPhotoSize) {
    return fail("Envie uma imagem de ate 15 MB.", 422);
  }

  const storage = getAdminStorage();
  const db = getAdminDb();

  if (!storage || !db) {
    return fail("Firebase Admin Storage precisa estar configurado para upload de arquivos.", 503);
  }

  const extension = file.name.split(".").pop()?.replace(/[^a-z0-9]/gi, "").toLowerCase() || "jpg";
  const storagePath = `events/${eventId}/photos/${Date.now()}-${crypto.randomUUID()}.${extension}`;
  const downloadToken = crypto.randomUUID();
  const bytes = Buffer.from(await file.arrayBuffer());
  const bucket = storage.bucket();

  await bucket.file(storagePath).save(bytes, {
    resumable: false,
    contentType: file.type,
    metadata: {
      metadata: {
        firebaseStorageDownloadTokens: downloadToken,
      },
    },
  });

  const url = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(
    storagePath,
  )}?alt=media&token=${downloadToken}`;
  const photoRef = db.collection(collections.photos).doc();
  const now = new Date().toISOString();
  const photo: PhotoRecord = {
    id: photoRef.id,
    eventId,
    uploaderId: user?.id,
    uploaderName,
    url,
    storagePath,
    likes: 0,
    featured: false,
    createdAt: now,
  };

  await photoRef.set(photo);

  return ok(photo, { status: 201 });
}

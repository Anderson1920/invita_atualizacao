import JSZip from "jszip";
import { NextRequest, NextResponse } from "next/server";
import { fail } from "@/lib/api-response";
import { getAdminDb } from "@/lib/firebase/admin";
import { collections } from "@/lib/firebase/collections";
import { demoPhotos } from "@/lib/demo-data";
import type { PhotoRecord } from "@/lib/types";

export async function GET(request: NextRequest) {
  const eventId = request.nextUrl.searchParams.get("eventId");

  if (!eventId) {
    return fail("Evento obrigatorio.", 422);
  }

  const photos = await loadPhotos(eventId);
  const zip = new JSZip();
  const manifest: string[] = [];

  for (let index = 0; index < photos.length; index += 1) {
    const photo = photos[index];

    manifest.push(`${index + 1}. ${photo.uploaderName} - ${photo.url}`);

    try {
      const response = await fetch(photo.url);

      if (!response.ok) {
        continue;
      }

      const arrayBuffer = await response.arrayBuffer();
      const contentType = response.headers.get("content-type") || "image/jpeg";
      const extension = contentType.includes("png") ? "png" : contentType.includes("webp") ? "webp" : "jpg";

      zip.file(`foto-${String(index + 1).padStart(2, "0")}.${extension}`, Buffer.from(arrayBuffer));
    } catch {
      manifest.push(`Falha ao baixar imagem ${index + 1}`);
    }
  }

  zip.file("manifesto.txt", manifest.join("\n"));

  const content = await zip.generateAsync({ type: "nodebuffer" });
  const body = new Blob([new Uint8Array(content)]);

  return new NextResponse(body, {
    headers: {
      "content-type": "application/zip",
      "content-disposition": `attachment; filename="invita-${eventId}-fotos.zip"`,
    },
  });
}

async function loadPhotos(eventId: string): Promise<PhotoRecord[]> {
  const db = getAdminDb();

  if (!db) {
    return demoPhotos.filter((photo) => photo.eventId === eventId);
  }

  const snapshot = await db.collection(collections.photos).where("eventId", "==", eventId).orderBy("createdAt", "desc").get();

  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as PhotoRecord);
}

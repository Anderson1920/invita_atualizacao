import { NextRequest } from "next/server";
import { ok, fail } from "@/lib/api-response";
import { getAdminDb, getFirebaseAdminConfigStatus } from "@/lib/firebase/admin";

export async function POST(request: NextRequest) {
  const configuredSecret = process.env.ADMIN_SETUP_SECRET;
  const { setupSecret } = (await request.json().catch(() => ({}))) as {
    setupSecret?: string;
  };

  if (!configuredSecret || setupSecret !== configuredSecret) {
    return fail("Nao autorizado.", 403);
  }

  const status = getFirebaseAdminConfigStatus();

  try {
    const db = getAdminDb();

    if (!db) {
      return fail("Firebase Admin nao inicializou.", 503, status);
    }

    await db.collection("_health").limit(1).get();

    return ok({
      ...status,
      firestoreConnection: "ok",
    });
  } catch (error) {
    return fail("Erro ao conectar no Firebase Admin.", 500, {
      ...status,
      error: error instanceof Error ? error.message : "Erro desconhecido",
    });
  }
}

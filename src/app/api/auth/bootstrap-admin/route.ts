import { NextRequest } from "next/server";
import { z } from "zod";
import { ok, fail } from "@/lib/api-response";
import { createBackendUser } from "@/lib/auth-repository";
import { getAdminDb } from "@/lib/firebase/admin";
import { collections } from "@/lib/firebase/collections";

const bootstrapAdminSchema = z.object({
  setupSecret: z.string().min(24),
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(12),
});

export async function POST(request: NextRequest) {
  const configuredSecret = process.env.ADMIN_SETUP_SECRET;

  if (!configuredSecret) {
    return fail("Bootstrap de admin nao configurado.", 503);
  }

  const parsed = bootstrapAdminSchema.safeParse(await request.json());

  if (!parsed.success) {
    return fail("Dados invalidos para criar administrador.", 422, parsed.error.flatten());
  }

  if (parsed.data.setupSecret !== configuredSecret) {
    return fail("Segredo de configuracao invalido.", 403);
  }

  const db = getAdminDb();

  if (!db) {
    return fail("Firebase Admin precisa estar configurado antes de criar o admin.", 503);
  }

  const existingAdmins = await db.collection(collections.users).where("role", "==", "ADMIN").limit(1).get();

  if (!existingAdmins.empty) {
    return fail("Ja existe um administrador cadastrado.", 409);
  }

  try {
    const admin = await createBackendUser({
      name: parsed.data.name,
      email: parsed.data.email,
      password: parsed.data.password,
      role: "ADMIN",
    });

    return ok(
      {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
      { status: 201 },
    );
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Nao foi possivel criar o administrador.", 400);
  }
}

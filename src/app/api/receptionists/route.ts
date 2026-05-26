import { NextRequest } from "next/server";
import { z } from "zod";
import { ok, fail } from "@/lib/api-response";
import { createBackendUser } from "@/lib/auth-repository";
import { getRequestUser, requireRole } from "@/lib/auth-server";
import { getAdminDb } from "@/lib/firebase/admin";
import { collections } from "@/lib/firebase/collections";
import { demoUsers } from "@/lib/demo-data";

const receptionistSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
});

export async function GET(request: NextRequest) {
  const user = await getRequestUser(request);

  if (!requireRole(user, ["HOST", "ADMIN"])) {
    return fail("Sem permissao para listar recepcionistas.", 403);
  }

  const db = getAdminDb();

  if (!db) {
    return ok(demoUsers.filter((profile) => profile.role === "RECEPTIONIST"));
  }

  const snapshot =
    user!.role === "ADMIN"
      ? await db.collection(collections.users).where("role", "==", "RECEPTIONIST").get()
      : await db
          .collection(collections.users)
          .where("role", "==", "RECEPTIONIST")
          .where("hostId", "==", user!.id)
          .get();

  return ok(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data(), passwordHash: undefined })));
}

export async function POST(request: NextRequest) {
  const user = await getRequestUser(request);

  if (!requireRole(user, ["HOST", "ADMIN"])) {
    return fail("Apenas anfitrioes podem cadastrar recepcionistas.", 403);
  }

  const parsed = receptionistSchema.safeParse(await request.json());

  if (!parsed.success) {
    return fail("Dados da recepcao invalidos.", 422, parsed.error.flatten());
  }

  try {
    const receptionist = await createBackendUser({
      ...parsed.data,
      role: "RECEPTIONIST",
    });
    const db = getAdminDb();

    if (db) {
      await db.collection(collections.users).doc(receptionist.id).set(
        {
          hostId: user!.id,
          createdBy: user!.id,
          updatedAt: new Date().toISOString(),
        },
        { merge: true },
      );
    }

    return ok(
      {
        ...receptionist,
        hostId: user!.id,
      },
      { status: 201 },
    );
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Nao foi possivel cadastrar recepcionista.", 400);
  }
}

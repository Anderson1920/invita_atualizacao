import { NextRequest } from "next/server";
import { ok, fail } from "@/lib/api-response";
import { getRequestUser } from "@/lib/auth-server";
import { getAdminDb } from "@/lib/firebase/admin";
import { collections } from "@/lib/firebase/collections";
import { demoUsers } from "@/lib/demo-data";

export async function GET(request: NextRequest) {
  const user = await getRequestUser(request);

  if (!user) {
    return fail("Sessao obrigatoria.", 401);
  }

  const db = getAdminDb();

  if (!db) {
    const profile = demoUsers.find((item) => item.id === user.id) || demoUsers[1];

    return ok({
      plan: profile.plan || null,
    });
  }

  const doc = await db.collection(collections.users).doc(user.id).get();

  return ok({
    plan: doc.data()?.plan || null,
  });
}

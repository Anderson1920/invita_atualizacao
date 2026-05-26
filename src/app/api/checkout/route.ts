import { NextRequest } from "next/server";
import { ok, fail } from "@/lib/api-response";
import { getRequestUser, requireRole } from "@/lib/auth-server";
import { getAdminDb } from "@/lib/firebase/admin";
import { collections } from "@/lib/firebase/collections";
import { createCheckoutPreference } from "@/lib/mercadopago";
import { plans } from "@/lib/constants";
import { checkoutSchema } from "@/lib/validators";

export async function POST(request: NextRequest) {
  const user = await getRequestUser(request);

  if (!requireRole(user, ["HOST", "ADMIN"])) {
    return fail("Apenas anfitrioes podem contratar planos.", 403);
  }

  const parsed = checkoutSchema.safeParse(await request.json());

  if (!parsed.success) {
    return fail("Dados de checkout invalidos.", 422, parsed.error.flatten());
  }

  if (user!.id !== parsed.data.userId && user!.role !== "ADMIN") {
    return fail("Usuario do pagamento nao corresponde a sessao.", 403);
  }

  const selectedPlan = plans.find((plan) => plan.id === parsed.data.planType);

  if (!selectedPlan) {
    return fail("Plano invalido.", 422);
  }

  const preference = await createCheckoutPreference(parsed.data);
  const db = getAdminDb();

  if (db) {
    const paymentRef = db.collection(collections.payments).doc();
    await paymentRef.set({
      id: paymentRef.id,
      userId: parsed.data.userId,
      planType: parsed.data.planType,
      amount: selectedPlan.price,
      currency: "BRL",
      provider: "mercadopago",
      providerPaymentId: preference.id,
      status: "pending",
      createdAt: new Date().toISOString(),
    });
  }

  return ok(preference);
}

import { NextRequest } from "next/server";
import { ok, fail } from "@/lib/api-response";
import { getAdminDb } from "@/lib/firebase/admin";
import { collections } from "@/lib/firebase/collections";
import { getMercadoPagoPayment } from "@/lib/mercadopago";
import { plans } from "@/lib/constants";
import type { PlanType } from "@/lib/types";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const paymentId = body?.data?.id || body?.id || request.nextUrl.searchParams.get("data.id");

  if (!paymentId) {
    return fail("Webhook sem pagamento.", 422);
  }

  const payment = (await getMercadoPagoPayment(String(paymentId))) as {
    id?: string | number;
    status?: string;
    metadata?: {
      userId?: string;
      user_id?: string;
      planType?: PlanType;
      plan_type?: PlanType;
    };
    transaction_amount?: number;
  };

  if (payment.status !== "approved") {
    return ok({ ignored: true, status: payment.status });
  }

  const userId = payment.metadata?.userId || payment.metadata?.user_id;
  const planType = payment.metadata?.planType || payment.metadata?.plan_type;
  const selectedPlan = plans.find((plan) => plan.id === planType);

  if (!userId || !selectedPlan) {
    return fail("Metadados do pagamento invalidos.", 422);
  }

  const db = getAdminDb();
  const now = new Date().toISOString();
  const expiresAt =
    selectedPlan.recurrence === "monthly"
      ? new Date(Date.now() + 31 * 24 * 60 * 60 * 1000).toISOString()
      : undefined;

  if (!db) {
    return ok({
      activated: true,
      userId,
      planType,
    });
  }

  const planRef = db.collection(collections.plans).doc(`${userId}-${selectedPlan.id}`);
  const paymentRef = db.collection(collections.payments).doc(String(payment.id));
  const planPayload = {
    id: planRef.id,
    userId,
    type: selectedPlan.id,
    status: "active",
    eventLimit: selectedPlan.eventLimit,
    startedAt: now,
    expiresAt,
    sourcePaymentId: String(payment.id),
  };

  await db.runTransaction(async (transaction) => {
    transaction.set(paymentRef, {
      id: paymentRef.id,
      userId,
      planType: selectedPlan.id,
      amount: payment.transaction_amount || selectedPlan.price,
      currency: "BRL",
      provider: "mercadopago",
      providerPaymentId: String(payment.id),
      status: "approved",
      createdAt: now,
      approvedAt: now,
    });
    transaction.set(planRef, planPayload);
    transaction.set(
      db.collection(collections.users).doc(userId),
      {
        plan: planPayload,
      },
      { merge: true },
    );
  });

  return ok({ activated: true, userId, planType: selectedPlan.id });
}

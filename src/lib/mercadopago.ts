import { MercadoPagoConfig, Payment, Preference } from "mercadopago";
import { plans } from "@/lib/constants";
import type { PlanType } from "@/lib/types";

export const mercadoPagoConfigured = Boolean(process.env.MERCADO_PAGO_ACCESS_TOKEN);

function getClient() {
  if (!mercadoPagoConfigured) {
    return null;
  }

  return new MercadoPagoConfig({
    accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN!,
  });
}

export async function createCheckoutPreference(input: {
  planType: PlanType;
  userId: string;
  email: string;
}) {
  const selectedPlan = plans.find((plan) => plan.id === input.planType);

  if (!selectedPlan) {
    throw new Error("Plano invalido.");
  }

  const client = getClient();

  if (!client) {
    return {
      id: `demo-${input.planType}-${Date.now()}`,
      initPoint: `/planos?checkout=demo-approved&plan=${input.planType}`,
      sandboxInitPoint: `/planos?checkout=demo-approved&plan=${input.planType}`,
    };
  }

  const preference = new Preference(client);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const response = await preference.create({
    body: {
      items: [
        {
          id: selectedPlan.id,
          title: `INVITA - Plano ${selectedPlan.name}`,
          quantity: 1,
          unit_price: selectedPlan.price,
          currency_id: "BRL",
        },
      ],
      payer: {
        email: input.email,
      },
      metadata: {
        userId: input.userId,
        planType: input.planType,
      },
      back_urls: {
        success: `${appUrl}/planos?status=success`,
        failure: `${appUrl}/planos?status=failure`,
        pending: `${appUrl}/planos?status=pending`,
      },
      notification_url: `${appUrl}/api/webhooks/mercadopago`,
      auto_return: "approved",
    },
  });

  return {
    id: response.id,
    initPoint: response.init_point,
    sandboxInitPoint: response.sandbox_init_point,
  };
}

export async function getMercadoPagoPayment(paymentId: string) {
  const client = getClient();

  if (!client) {
    return {
      id: paymentId,
      status: "approved",
      metadata: {
        userId: "host-demo",
        planType: "individual",
      },
      transaction_amount: 89,
    };
  }

  const payment = new Payment(client);

  return payment.get({ id: paymentId });
}

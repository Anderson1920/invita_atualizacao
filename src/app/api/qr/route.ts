import { NextRequest } from "next/server";
import { ok, fail } from "@/lib/api-response";
import { createQrDataUrl } from "@/lib/qr";

export async function GET(request: NextRequest) {
  const data = request.nextUrl.searchParams.get("data");

  if (!data) {
    return fail("Conteudo do QR Code ausente.", 422);
  }

  const src = await createQrDataUrl(data);

  return ok({ src });
}

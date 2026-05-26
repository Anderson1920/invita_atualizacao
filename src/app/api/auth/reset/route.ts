import { NextRequest } from "next/server";
import { z } from "zod";
import { ok, fail } from "@/lib/api-response";

const resetSchema = z.object({
  email: z.string().email(),
});

export async function POST(request: NextRequest) {
  const parsed = resetSchema.safeParse(await request.json());

  if (!parsed.success) {
    return fail("Email invalido.", 422, parsed.error.flatten());
  }

  return ok({
    message:
      "Se o email existir, enviaremos um link de recuperacao pelo provedor transacional configurado.",
  });
}

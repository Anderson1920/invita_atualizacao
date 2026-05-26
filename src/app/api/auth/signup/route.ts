import { NextRequest } from "next/server";
import { z } from "zod";
import { ok, fail } from "@/lib/api-response";
import { createBackendUser } from "@/lib/auth-repository";
import { createSessionToken, setSessionCookie } from "@/lib/session";

const signupSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
});

export async function POST(request: NextRequest) {
  const parsed = signupSchema.safeParse(await request.json());

  if (!parsed.success) {
    return fail("Dados de cadastro invalidos.", 422, parsed.error.flatten());
  }

  try {
    const user = await createBackendUser({
      ...parsed.data,
      role: "HOST",
    });

    return setSessionCookie(ok(user, { status: 201 }), createSessionToken(user));
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Nao foi possivel criar a conta.", 400);
  }
}

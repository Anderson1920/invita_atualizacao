import { NextRequest } from "next/server";
import { z } from "zod";
import { ok, fail } from "@/lib/api-response";
import { authenticateBackendUser } from "@/lib/auth-repository";
import { createSessionToken, setSessionCookie } from "@/lib/session";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function POST(request: NextRequest) {
  const parsed = loginSchema.safeParse(await request.json());

  if (!parsed.success) {
    return fail("Dados de login invalidos.", 422, parsed.error.flatten());
  }

  const user = await authenticateBackendUser(parsed.data);

  if (!user) {
    return fail("Email ou senha invalidos.", 401);
  }

  return setSessionCookie(ok(user), createSessionToken(user));
}

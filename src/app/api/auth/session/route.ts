import { NextRequest } from "next/server";
import { ok } from "@/lib/api-response";
import { demoUsers } from "@/lib/demo-data";
import { getSessionFromRequest } from "@/lib/session";

export async function GET(request: NextRequest) {
  const session = getSessionFromRequest(request);

  if (!session) {
    if (process.env.NODE_ENV !== "production") {
      return ok({ user: demoUsers[1] });
    }

    return ok({ user: null });
  }

  return ok({
    user: {
      id: session.sub,
      name: session.name,
      email: session.email,
      role: session.role,
      status: session.status,
      createdAt: new Date(session.iat * 1000).toISOString(),
    },
  });
}

import { type NextRequest } from "next/server";
import { getSessionFromRequest } from "@/lib/session";
import type { UserRole } from "@/lib/types";

export interface RequestUser {
  id: string;
  email?: string;
  role: UserRole;
}

export async function getRequestUser(request: NextRequest): Promise<RequestUser | null> {
  const session = getSessionFromRequest(request);

  if (session?.status === "active") {
    return {
      id: session.sub,
      email: session.email,
      role: session.role,
    };
  }

  const demoUser = request.headers.get("x-demo-user");
  const demoRole = request.headers.get("x-demo-role") as UserRole | null;
  const demoAuthAllowed = process.env.NODE_ENV !== "production";

  if (demoAuthAllowed && demoUser && demoRole) {
    return {
      id: demoUser,
      email: request.headers.get("x-demo-email") || undefined,
      role: demoRole,
    };
  }

  return null;
}

export function requireRole(user: RequestUser | null, roles: UserRole[]) {
  return Boolean(user && roles.includes(user.role));
}

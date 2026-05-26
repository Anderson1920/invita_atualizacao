"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import type { UserRole } from "@/lib/types";

export function ProtectedRoute({
  roles,
  children,
}: {
  roles: UserRole[];
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!user) {
      router.replace("/login");
      return;
    }

    if (!roles.includes(user.role)) {
      router.replace("/login");
    }
  }, [loading, roles, router, user]);

  if (loading) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#fbf8ff]">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-violet-200 border-t-violet-700" />
      </main>
    );
  }

  if (!user || !roles.includes(user.role)) {
    return null;
  }

  return children;
}

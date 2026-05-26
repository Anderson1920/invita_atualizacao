"use client";

import { AppShell } from "@/components/app-shell";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { QrScanner } from "@/components/qr/qr-scanner";

export default function CheckinPage() {
  return (
    <ProtectedRoute roles={["RECEPTIONIST", "HOST", "ADMIN"]}>
      <AppShell>
        <div className="mx-auto max-w-6xl">
          <QrScanner />
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}

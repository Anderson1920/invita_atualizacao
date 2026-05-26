"use client";

import { AppShell } from "@/components/app-shell";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { EventForm } from "@/components/events/event-form";

export default function NewEventPage() {
  return (
    <ProtectedRoute roles={["HOST", "ADMIN"]}>
      <AppShell>
        <div className="mx-auto max-w-7xl">
          <EventForm />
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}

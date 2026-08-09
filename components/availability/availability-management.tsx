"use client";

import { useState } from "react";
import { ToggleRight, ToggleLeft } from "lucide-react";
import { updateAvailability } from "@/services/appointment.service";
import { Button } from "@/components/common/button";
import { SectionCard } from "@/components/common/section-card";
import { StatusBadge } from "@/components/common/status-badge";

export function AvailabilityManagement() {
  const [status, setStatus] = useState<"available" | "unavailable">("available");

  const handleToggle = async () => {
    const nextStatus = status === "available" ? "unavailable" : "available";
    await updateAvailability(nextStatus);
    setStatus(nextStatus);
  };

  return (
    <SectionCard
      title="Availability Management"
      subtitle="Control whether the counsellor is accepting new appointments today."
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-[20px] border border-border bg-white p-4 shadow-card">
          <p className="mb-2 text-sm text-text-secondary">Current status</p>
          <div className="flex items-center gap-3">
            <StatusBadge status={status} />
            <p className="text-sm text-text">
              {status === "available" ? "Accepting new appointments" : "Appointments are paused"}
            </p>
          </div>
        </div>

        <div className="rounded-[20px] border border-border bg-white p-4 shadow-card">
          <p className="mb-2 text-sm text-text-secondary">Availability explanation</p>
          <p className="text-sm text-text">
            If unavailable, the portal disables incoming appointment requests until you resume
            availability.
          </p>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between rounded-[20px] border border-border bg-secondary p-4">
        <div>
          <p className="text-sm text-text-secondary">Quick toggle</p>
          <p className="font-semibold text-primary">
            {status === "available" ? "Available now" : "Unavailable now"}
          </p>
        </div>
        <Button variant={status === "available" ? "secondary" : "ghost"} onClick={handleToggle}>
          <span className="flex items-center gap-2">
            {status === "available" ? (
              <ToggleRight className="h-4 w-4" />
            ) : (
              <ToggleLeft className="h-4 w-4" />
            )}
            {status === "available" ? "Set unavailable" : "Set available"}
          </span>
        </Button>
      </div>
    </SectionCard>
  );
}

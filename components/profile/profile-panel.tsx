"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getProfile, updateProfile, type UserProfile } from "@/services/profile.service";
import { Button } from "@/components/common/button";
import { SectionCard } from "@/components/common/section-card";
import { LoadingSkeleton } from "@/components/common/loading-skeleton";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export function ProfilePanel() {
  const queryClient = useQueryClient();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["profile"],
    queryFn: getProfile,
  });

  const [form, setForm] = useState<Partial<UserProfile>>({});

  useEffect(() => {
    if (data) {
      setForm(data);
    }
  }, [data]);

  const mutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Profile updated successfully");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update profile");
    }
  });

  if (isLoading) return <LoadingSkeleton rows={3} />;
  if (isError)
    return (
      <div className="rounded-[20px] border border-border bg-white p-5 text-sm text-danger shadow-card">
        Unable to load profile.
      </div>
    );

  const handleChange = (field: keyof UserProfile, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    mutation.mutate(form);
  };

  return (
    <SectionCard
      title="Profile"
      subtitle="Editable counsellor details for panel identity and contact records."
    >
      <div className="grid gap-4 md:grid-cols-2">
        <label className="text-sm text-text-secondary">
          Name
          <input
            className="mt-1 w-full rounded-2xl border border-border bg-secondary p-3 text-text outline-none transition focus:ring-2 focus:ring-primary/40"
            value={form.full_name || ""}
            onChange={e => handleChange("full_name", e.target.value)}
          />
        </label>
        <label className="text-sm text-text-secondary">
          Email
          <input
            className="mt-1 w-full rounded-2xl border border-border bg-secondary p-3 text-text outline-none transition focus:ring-2 focus:ring-primary/40 disabled:opacity-60"
            value={form.email || ""}
            disabled
          />
        </label>
        <label className="text-sm text-text-secondary">
          Department
          <input
            className="mt-1 w-full rounded-2xl border border-border bg-secondary p-3 text-text outline-none transition focus:ring-2 focus:ring-primary/40"
            value={form.department || ""}
            onChange={e => handleChange("department", e.target.value)}
          />
        </label>
        <label className="text-sm text-text-secondary">
          Designation
          <input
            className="mt-1 w-full rounded-2xl border border-border bg-secondary p-3 text-text outline-none transition focus:ring-2 focus:ring-primary/40"
            value={form.designation || ""}
            onChange={e => handleChange("designation", e.target.value)}
          />
        </label>
        <label className="text-sm text-text-secondary">
          Phone
          <input
            className="mt-1 w-full rounded-2xl border border-border bg-secondary p-3 text-text outline-none transition focus:ring-2 focus:ring-primary/40"
            value={form.phone || ""}
            onChange={e => handleChange("phone", e.target.value)}
          />
        </label>
        <label className="text-sm text-text-secondary">
          Profile Image URL (e.g. LinkedIn photo)
          <input
            className="mt-1 w-full rounded-2xl border border-border bg-secondary p-3 text-text outline-none transition focus:ring-2 focus:ring-primary/40"
            value={form.image_url || ""}
            onChange={e => handleChange("image_url", e.target.value)}
            placeholder="https://..."
          />
        </label>
        <label className="text-sm text-text-secondary md:col-span-2">
          Specialties (comma separated)
          <input
            className="mt-1 w-full rounded-2xl border border-border bg-secondary p-3 text-text outline-none transition focus:ring-2 focus:ring-primary/40"
            value={form.specialties?.join(", ") || ""}
            onChange={e => handleChange("specialties", e.target.value.split(",").map(s => s.trim()).filter(Boolean))}
            placeholder="Academic Stress, Career Guidance"
          />
        </label>
        <label className="text-sm text-text-secondary md:col-span-2">
          Bio
          <textarea
            className="mt-1 w-full resize-none rounded-2xl border border-border bg-secondary p-3 text-text outline-none transition focus:ring-2 focus:ring-primary/40"
            rows={4}
            value={form.bio || ""}
            onChange={e => handleChange("bio", e.target.value)}
          />
        </label>
      </div>
      <div className="mt-6 flex gap-3">
        <Button variant="primary" onClick={handleSave} disabled={mutation.isPending}>
          {mutation.isPending ? "Saving..." : "Save Changes"}
        </Button>
        <Button variant="ghost" onClick={() => data && setForm(data)}>Reset</Button>
      </div>
    </SectionCard>
  );
}

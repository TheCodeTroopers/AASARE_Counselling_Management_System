"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getProfile, updateProfile, type UserProfile } from "@/services/profile.service";
import { Button } from "@/components/common/button";
import { SectionCard } from "@/components/common/section-card";
import { LoadingSkeleton } from "@/components/common/loading-skeleton";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Upload, User, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export function ProfilePanel() {
  const queryClient = useQueryClient();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["profile"],
    queryFn: getProfile,
  });

  const [form, setForm] = useState<Partial<UserProfile>>({});
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (data) {
      setForm(data);
      setPreviewUrl(data.image_url || null);
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

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show local preview immediately
    const localUrl = URL.createObjectURL(file);
    setPreviewUrl(localUrl);

    setUploading(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;

      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/profile/avatar", {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Upload failed");

      // Update form state with the returned URL
      setForm(prev => ({ ...prev, image_url: result.image_url }));
      setPreviewUrl(result.image_url);
      toast.success("Profile photo updated!");
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    } catch (err: any) {
      toast.error(err.message || "Failed to upload photo");
      setPreviewUrl(form.image_url || null);
    } finally {
      setUploading(false);
      // Reset the file input so the same file can be re-selected
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
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
        {/* Avatar upload */}
        <div className="md:col-span-2 flex flex-col items-center gap-4 sm:flex-row sm:items-start mb-2">
          <div className="relative shrink-0">
            <div className="h-24 w-24 rounded-2xl overflow-hidden border-2 border-border bg-secondary flex items-center justify-center">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Profile"
                  className="h-full w-full object-cover"
                />
              ) : (
                <User className="h-10 w-10 text-muted-foreground/40" />
              )}
            </div>
            {previewUrl && (
              <button
                type="button"
                onClick={() => { setPreviewUrl(null); handleChange("image_url", null); }}
                className="absolute -top-2 -right-2 rounded-full bg-rose-500 p-0.5 text-white shadow hover:bg-rose-600 transition"
                title="Remove photo"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium text-text">Profile Photo</p>
            <p className="text-xs text-text-secondary">JPEG, PNG or WebP · Max 5 MB</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={handleAvatarUpload}
              disabled={uploading}
            />
            <Button
              variant="ghost"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              <Upload className="mr-2 h-4 w-4" />
              {uploading ? "Uploading..." : "Choose Photo"}
            </Button>
          </div>
        </div>
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

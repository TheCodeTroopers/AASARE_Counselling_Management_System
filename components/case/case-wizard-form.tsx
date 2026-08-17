"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  User,
  HeartHandshake,
  Brain,
  MessageSquare,
  Calendar,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Save,
  CheckCircle2,
  Printer,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { createCase, saveDraft } from "@/services/case.service";
import { useNotifications } from "@/hooks/use-notifications";
import { SectionCard } from "@/components/common/section-card";
import { Button } from "@/components/common/button";

export type CaseSheetData = {
  // 1. General Information
  clientName: string;
  age: string;
  gender: string;
  roleInInstitution: "Student" | "Parent" | "Faculty" | "Staff";
  department: string;
  yearSemester: string;
  contactNumber: string;
  email: string;
  dateFirstInteraction: string;
  referredBy: "Self" | "Faculty" | "Peer" | "Parent" | "ICC" | "Other";
  referredByOther: string;

  // 2. Reason for Visit
  reasonForVisit: string;

  // 3. Relevant Background
  familyBackground: string;
  academicStressors: string;
  peerChallenges: string;
  recentMajorChanges: string;
  physicalHealthIssues: string;

  // 4. First Aid Response Provided
  activeListening: boolean;
  activeListeningNotes: string;
  emotionalSupport: boolean;
  emotionalSupportNotes: string;
  stressManagementTips: boolean;
  stressTipsBreathing: boolean;
  stressTipsGrounding: boolean;
  stressTipsPositiveTalk: boolean;
  stressTipsOther: string;
  encouragedPeerFamilySupport: boolean;
  peerFamilyNotes: string;
  sharedCollegeHelpline: boolean;
  helplineNotes: string;
  academicAdjustment: boolean;
  academicAdjustmentNotes: string;
  referralProfessionalHelp: boolean;
  referralICCCoordinator: boolean;
  referralToDetails: string;

  // 5. Client Response and Observations
  clientResponseObservations: string;

  // 6. Follow-Up
  isFollowupNeeded: boolean;
  nextFollowupDate: string;
  actionsPlanned: string;
  supportRequiredICC: string;

  // 7. Consent & Confidentiality
  consentInfoPolicy: boolean;
  consentVerbal: boolean;
  iccSignatureName: string;
  caseDate: string;
};

const initialFormData: CaseSheetData = {
  clientName: "",
  age: "",
  gender: "Select Gender",
  roleInInstitution: "Student",
  department: "",
  yearSemester: "",
  contactNumber: "",
  email: "",
  dateFirstInteraction: new Date().toISOString().slice(0, 10),
  referredBy: "Self",
  referredByOther: "",

  reasonForVisit: "",

  familyBackground: "",
  academicStressors: "",
  peerChallenges: "",
  recentMajorChanges: "",
  physicalHealthIssues: "",

  activeListening: false,
  activeListeningNotes: "",
  emotionalSupport: false,
  emotionalSupportNotes: "",
  stressManagementTips: false,
  stressTipsBreathing: false,
  stressTipsGrounding: false,
  stressTipsPositiveTalk: false,
  stressTipsOther: "",
  encouragedPeerFamilySupport: false,
  peerFamilyNotes: "",
  sharedCollegeHelpline: false,
  helplineNotes: "",
  academicAdjustment: false,
  academicAdjustmentNotes: "",
  referralProfessionalHelp: false,
  referralICCCoordinator: false,
  referralToDetails: "",

  clientResponseObservations: "",

  isFollowupNeeded: false,
  nextFollowupDate: "",
  actionsPlanned: "",
  supportRequiredICC: "",

  consentInfoPolicy: true,
  consentVerbal: true,
  iccSignatureName: "",
  caseDate: new Date().toISOString().slice(0, 10),
};

const steps = [
  "1. General Info",
  "2. Reason for Visit",
  "3. Background",
  "4. First Aid Response",
  "5. Observations",
  "6. Follow-Up",
  "7. Consent",
];

export function CaseWizardForm() {
  const router = useRouter();
  const { addNotification } = useNotifications();
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<CaseSheetData>(initialFormData);
  const [submitting, setSubmitting] = useState(false);

  const updateField = (field: keyof CaseSheetData, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveDraftClick = async () => {
    setSubmitting(true);
    try {
      await saveDraft(formData);
      toast.success("Draft saved successfully!");
      addNotification({
        title: "Draft Saved",
        message: `Draft intake sheet for ${formData.clientName || "client"} saved.`,
        type: "case",
        link: "/case-management",
      });
    } catch (err: unknown) {
      toast.error((err as Error).message || "Failed to save draft");
    } finally {
      setSubmitting(false);
    }
  };

  const submitCase = async () => {
    if (!formData.clientName.trim()) {
      toast.error("Please enter the Client Name in Step 1.");
      setStep(0);
      return;
    }

    setSubmitting(true);
    try {
      await createCase(formData);
      toast.success("Case Sheet created successfully!");
      addNotification({
        title: "Case Sheet Created",
        message: `Case sheet for ${formData.clientName} created successfully.`,
        type: "case",
        link: "/case-management",
      });
      router.push("/case-management");
    } catch (err: unknown) {
      toast.error((err as Error).message || "Failed to create case sheet");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < steps.length - 1) {
      setStep((s) => Math.min(s + 1, steps.length - 1));
      return;
    }
    submitCase();
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header Banner matching Case Sheet Official Header */}
      <div className="rounded-3xl border border-border bg-white p-6 shadow-sm">
        <div className="text-center space-y-1">
          <p className="text-xs font-semibold uppercase tracking-widest text-accent">
            SHRI MADHWA VADIRAJA INSTITUTE OF TECHNOLOGY AND MANAGEMENT (SMVITM)
          </p>
          <h1 className="font-display text-2xl font-bold text-primary md:text-3xl">
            AASARE — Institutional Counseling Cell
          </h1>
          <p className="text-sm font-medium text-slate-600">Case Sheet (Mental Health First Aid)</p>
        </div>

        {/* Step Indicator Pills */}
        <div className="mt-6 flex flex-wrap justify-center gap-2 border-t border-secondary pt-4">
          {steps.map((label, idx) => (
            <button
              key={label}
              type="button"
              onClick={() => setStep(idx)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition cursor-pointer ${
                step === idx
                  ? "bg-primary text-white shadow-sm"
                  : idx < step
                    ? "bg-success-light text-emerald-800 border border-emerald-200"
                    : "bg-secondary text-slate-600 hover:bg-slate-200"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Wizard Form Card */}
      <form
        onSubmit={handleSubmit}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !(e.target instanceof HTMLTextAreaElement)) {
            e.preventDefault();
          }
        }}
      >
        <SectionCard
          title={steps[step]}
          subtitle="Fill in the official Case Sheet fields accurately."
        >
          {/* STEP 1: General Information */}
          {step === 0 && (
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Client Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.clientName}
                  onChange={(e) => updateField("clientName", e.target.value)}
                  placeholder="Enter full name"
                  className="w-full rounded-2xl border border-border bg-secondary p-3 text-sm text-text outline-none transition focus:ring-2 focus:ring-primary/40"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-600">
                    Age
                  </label>
                  <input
                    type="text"
                    value={formData.age}
                    onChange={(e) => updateField("age", e.target.value)}
                    placeholder="e.g. 20"
                    className="w-full rounded-2xl border border-border bg-secondary p-3 text-sm text-text outline-none transition focus:ring-2 focus:ring-primary/40"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-600">
                    Gender
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => updateField("gender", e.target.value)}
                    className="w-full rounded-2xl border border-border bg-secondary p-3 text-sm text-text outline-none transition focus:ring-2 focus:ring-primary/40"
                  >
                    <option>Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Role in Institution
                </label>
                <div className="flex flex-wrap gap-2.5 pt-1">
                  {(["Student", "Parent", "Faculty", "Staff"] as const).map((r) => {
                    const isSelected = formData.roleInInstitution === r;
                    return (
                      <button
                        key={r}
                        type="button"
                        onClick={() => updateField("roleInInstitution", r)}
                        className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-sm font-semibold transition cursor-pointer ${
                          isSelected
                            ? "border-primary bg-primary/10 text-primary shadow-xs ring-2 ring-primary/20"
                            : "border-border bg-secondary text-slate-700 hover:bg-slate-200"
                        }`}
                      >
                        <span
                          className={`h-3.5 w-3.5 rounded-full border flex items-center justify-center ${
                            isSelected ? "border-primary bg-primary" : "border-slate-400 bg-white"
                          }`}
                        >
                          {isSelected && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                        </span>
                        {r}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Department / Branch
                </label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => updateField("department", e.target.value)}
                  placeholder="e.g. Computer Science & Engineering"
                  className="w-full rounded-2xl border border-border bg-secondary p-3 text-sm text-text outline-none transition focus:ring-2 focus:ring-primary/40"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Year / Semester (if student)
                </label>
                <input
                  type="text"
                  value={formData.yearSemester}
                  onChange={(e) => updateField("yearSemester", e.target.value)}
                  placeholder="e.g. 3rd Year / 6th Sem"
                  className="w-full rounded-2xl border border-border bg-secondary p-3 text-sm text-text outline-none transition focus:ring-2 focus:ring-primary/40"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Contact Number
                </label>
                <input
                  type="text"
                  value={formData.contactNumber}
                  onChange={(e) => updateField("contactNumber", e.target.value)}
                  placeholder="+91 98xxxxxx00"
                  className="w-full rounded-2xl border border-border bg-secondary p-3 text-sm text-text outline-none transition focus:ring-2 focus:ring-primary/40"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Email ID
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  placeholder="client@sode-edu.in"
                  className="w-full rounded-2xl border border-border bg-secondary p-3 text-sm text-text outline-none transition focus:ring-2 focus:ring-primary/40"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Date of First Interaction
                </label>
                <input
                  type="date"
                  value={formData.dateFirstInteraction}
                  onChange={(e) => updateField("dateFirstInteraction", e.target.value)}
                  className="w-full rounded-2xl border border-border bg-secondary p-3 text-sm text-text outline-none transition focus:ring-2 focus:ring-primary/40"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Referred By
                </label>
                <div className="flex flex-wrap gap-2.5 pt-1">
                  {(["Self", "Faculty", "Peer", "Parent", "ICC", "Other"] as const).map((ref) => {
                    const isSelected = formData.referredBy === ref;
                    return (
                      <button
                        key={ref}
                        type="button"
                        onClick={() => updateField("referredBy", ref)}
                        className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-sm font-semibold transition cursor-pointer ${
                          isSelected
                            ? "border-primary bg-primary/10 text-primary shadow-xs ring-2 ring-primary/20"
                            : "border-border bg-secondary text-slate-700 hover:bg-slate-200"
                        }`}
                      >
                        <span
                          className={`h-3.5 w-3.5 rounded-full border flex items-center justify-center ${
                            isSelected ? "border-primary bg-primary" : "border-slate-400 bg-white"
                          }`}
                        >
                          {isSelected && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                        </span>
                        {ref}
                      </button>
                    );
                  })}
                </div>
                {formData.referredBy === "Other" && (
                  <input
                    type="text"
                    value={formData.referredByOther}
                    onChange={(e) => updateField("referredByOther", e.target.value)}
                    placeholder="Mention who referred"
                    className="mt-2 w-full rounded-2xl border border-border bg-secondary p-3 text-sm outline-none"
                  />
                )}
              </div>
            </div>
          )}

          {/* STEP 2: Reason for Visit */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Reason for Visit / Concerns Expressed
                </label>
                <p className="mb-2 text-xs italic text-slate-500">
                  (In the client's own words, if possible. Brief summary.)
                </p>
                <textarea
                  rows={6}
                  value={formData.reasonForVisit}
                  onChange={(e) => updateField("reasonForVisit", e.target.value)}
                  placeholder="Describe concerns expressed by client..."
                  className="w-full rounded-2xl border border-border bg-secondary p-4 text-sm text-text outline-none transition focus:ring-2 focus:ring-primary/40"
                />
              </div>
            </div>
          )}

          {/* STEP 3: Relevant Background */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Family / Personal Background
                </label>
                <textarea
                  rows={3}
                  value={formData.familyBackground}
                  onChange={(e) => updateField("familyBackground", e.target.value)}
                  placeholder="Notes on family structure, personal history..."
                  className="w-full rounded-2xl border border-border bg-secondary p-3 text-sm outline-none transition focus:ring-2 focus:ring-primary/40"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Academic / Work Stressors
                </label>
                <textarea
                  rows={3}
                  value={formData.academicStressors}
                  onChange={(e) => updateField("academicStressors", e.target.value)}
                  placeholder="Notes on exams, assignments, performance pressure..."
                  className="w-full rounded-2xl border border-border bg-secondary p-3 text-sm outline-none transition focus:ring-2 focus:ring-primary/40"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Peer / Social Challenges
                </label>
                <textarea
                  rows={3}
                  value={formData.peerChallenges}
                  onChange={(e) => updateField("peerChallenges", e.target.value)}
                  placeholder="Notes on hostel life, peer relationships, social anxiety..."
                  className="w-full rounded-2xl border border-border bg-secondary p-3 text-sm outline-none transition focus:ring-2 focus:ring-primary/40"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Any Recent Major Changes / Loss / Events
                </label>
                <textarea
                  rows={2}
                  value={formData.recentMajorChanges}
                  onChange={(e) => updateField("recentMajorChanges", e.target.value)}
                  placeholder="Bereavement, illness, transition, sudden event..."
                  className="w-full rounded-2xl border border-border bg-secondary p-3 text-sm outline-none transition focus:ring-2 focus:ring-primary/40"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Physical / Health Issues (if shared)
                </label>
                <textarea
                  rows={2}
                  value={formData.physicalHealthIssues}
                  onChange={(e) => updateField("physicalHealthIssues", e.target.value)}
                  placeholder="Sleep issues, chronic illness, appetite, fatigue..."
                  className="w-full rounded-2xl border border-border bg-secondary p-3 text-sm outline-none transition focus:ring-2 focus:ring-primary/40"
                />
              </div>
            </div>
          )}

          {/* STEP 4: First Aid Response Provided */}
          {step === 3 && (
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Check support type and describe action taken:
              </p>

              <div className="space-y-3">
                {/* Active Listening */}
                <div
                  className={`rounded-2xl border p-4 transition-all duration-200 ${
                    formData.activeListening
                      ? "border-emerald-600/50 bg-emerald-50/40 shadow-xs ring-1 ring-emerald-500/20"
                      : "border-border bg-secondary hover:bg-slate-100/70"
                  }`}
                >
                  <label className="flex items-center gap-3 font-semibold text-sm text-primary cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={formData.activeListening}
                      onChange={(e) => updateField("activeListening", e.target.checked)}
                      className="sr-only"
                    />
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-lg border transition ${
                        formData.activeListening
                          ? "border-emerald-600 bg-emerald-600 text-white"
                          : "border-slate-400 bg-white"
                      }`}
                    >
                      {formData.activeListening && <CheckCircle2 className="h-3.5 w-3.5" />}
                    </span>
                    Active Listening
                  </label>
                  {formData.activeListening && (
                    <input
                      type="text"
                      value={formData.activeListeningNotes}
                      onChange={(e) => updateField("activeListeningNotes", e.target.value)}
                      placeholder="Describe active listening provided..."
                      className="mt-3 w-full rounded-xl border border-border bg-white p-2.5 text-sm text-slate-900 outline-none transition focus:ring-2 focus:ring-primary/40"
                    />
                  )}
                </div>

                {/* Emotional Support */}
                <div
                  className={`rounded-2xl border p-4 transition-all duration-200 ${
                    formData.emotionalSupport
                      ? "border-emerald-600/50 bg-emerald-50/40 shadow-xs ring-1 ring-emerald-500/20"
                      : "border-border bg-secondary hover:bg-slate-100/70"
                  }`}
                >
                  <label className="flex items-center gap-3 font-semibold text-sm text-primary cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={formData.emotionalSupport}
                      onChange={(e) => updateField("emotionalSupport", e.target.checked)}
                      className="sr-only"
                    />
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-lg border transition ${
                        formData.emotionalSupport
                          ? "border-emerald-600 bg-emerald-600 text-white"
                          : "border-slate-400 bg-white"
                      }`}
                    >
                      {formData.emotionalSupport && <CheckCircle2 className="h-3.5 w-3.5" />}
                    </span>
                    Emotional Support
                  </label>
                  {formData.emotionalSupport && (
                    <input
                      type="text"
                      value={formData.emotionalSupportNotes}
                      onChange={(e) => updateField("emotionalSupportNotes", e.target.value)}
                      placeholder="Describe emotional support provided..."
                      className="mt-3 w-full rounded-xl border border-border bg-white p-2.5 text-sm text-slate-900 outline-none transition focus:ring-2 focus:ring-primary/40"
                    />
                  )}
                </div>

                {/* Stress Management Tips */}
                <div
                  className={`rounded-2xl border p-4 transition-all duration-200 ${
                    formData.stressManagementTips
                      ? "border-emerald-600/50 bg-emerald-50/40 shadow-xs ring-1 ring-emerald-500/20"
                      : "border-border bg-secondary hover:bg-slate-100/70"
                  }`}
                >
                  <label className="flex items-center gap-3 font-semibold text-sm text-primary cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={formData.stressManagementTips}
                      onChange={(e) => updateField("stressManagementTips", e.target.checked)}
                      className="sr-only"
                    />
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-lg border transition ${
                        formData.stressManagementTips
                          ? "border-emerald-600 bg-emerald-600 text-white"
                          : "border-slate-400 bg-white"
                      }`}
                    >
                      {formData.stressManagementTips && <CheckCircle2 className="h-3.5 w-3.5" />}
                    </span>
                    Stress Management Tips
                  </label>
                  {formData.stressManagementTips && (
                    <div className="mt-3 space-y-2 pl-8">
                      <div className="flex flex-wrap gap-2 text-sm text-slate-700">
                        {[
                          { key: "stressTipsBreathing", label: "Breathing" },
                          { key: "stressTipsGrounding", label: "Grounding" },
                          { key: "stressTipsPositiveTalk", label: "Positive Talk" },
                        ].map((tip) => {
                          const isChecked = Boolean(formData[tip.key as keyof CaseSheetData]);
                          return (
                            <button
                              key={tip.key}
                              type="button"
                              onClick={() =>
                                updateField(tip.key as keyof CaseSheetData, !isChecked)
                              }
                              className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
                                isChecked
                                  ? "border-primary bg-primary text-white shadow-xs"
                                  : "border-border bg-white text-slate-700 hover:bg-slate-100"
                              }`}
                            >
                              <span
                                className={`h-3 w-3 rounded-xs border flex items-center justify-center ${
                                  isChecked
                                    ? "border-white bg-white/20"
                                    : "border-slate-400 bg-white"
                                }`}
                              >
                                {isChecked && <CheckCircle2 className="h-2.5 w-2.5 text-white" />}
                              </span>
                              {tip.label}
                            </button>
                          );
                        })}
                      </div>
                      <input
                        type="text"
                        value={formData.stressTipsOther}
                        onChange={(e) => updateField("stressTipsOther", e.target.value)}
                        placeholder="Mention if other stress tips provided..."
                        className="w-full rounded-xl border border-border bg-white p-2.5 text-sm text-slate-900 outline-none"
                      />
                    </div>
                  )}
                </div>

                {/* Encouraged Peer/Family Support */}
                <div
                  className={`rounded-2xl border p-4 transition-all duration-200 ${
                    formData.encouragedPeerFamilySupport
                      ? "border-emerald-600/50 bg-emerald-50/40 shadow-xs ring-1 ring-emerald-500/20"
                      : "border-border bg-secondary hover:bg-slate-100/70"
                  }`}
                >
                  <label className="flex items-center gap-3 font-semibold text-sm text-primary cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={formData.encouragedPeerFamilySupport}
                      onChange={(e) =>
                        updateField("encouragedPeerFamilySupport", e.target.checked)
                      }
                      className="sr-only"
                    />
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-lg border transition ${
                        formData.encouragedPeerFamilySupport
                          ? "border-emerald-600 bg-emerald-600 text-white"
                          : "border-slate-400 bg-white"
                      }`}
                    >
                      {formData.encouragedPeerFamilySupport && (
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      )}
                    </span>
                    Encouraged Peer / Family Support
                  </label>
                  {formData.encouragedPeerFamilySupport && (
                    <input
                      type="text"
                      value={formData.peerFamilyNotes}
                      onChange={(e) => updateField("peerFamilyNotes", e.target.value)}
                      placeholder="Describe guidance given..."
                      className="mt-3 w-full rounded-xl border border-border bg-white p-2.5 text-sm text-slate-900 outline-none"
                    />
                  )}
                </div>

                {/* Shared College Helpline Info */}
                <div
                  className={`rounded-2xl border p-4 transition-all duration-200 ${
                    formData.sharedCollegeHelpline
                      ? "border-emerald-600/50 bg-emerald-50/40 shadow-xs ring-1 ring-emerald-500/20"
                      : "border-border bg-secondary hover:bg-slate-100/70"
                  }`}
                >
                  <label className="flex items-center gap-3 font-semibold text-sm text-primary cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={formData.sharedCollegeHelpline}
                      onChange={(e) => updateField("sharedCollegeHelpline", e.target.checked)}
                      className="sr-only"
                    />
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-lg border transition ${
                        formData.sharedCollegeHelpline
                          ? "border-emerald-600 bg-emerald-600 text-white"
                          : "border-slate-400 bg-white"
                      }`}
                    >
                      {formData.sharedCollegeHelpline && <CheckCircle2 className="h-3.5 w-3.5" />}
                    </span>
                    Shared College Helpline / Mental Health Info
                  </label>
                </div>

                {/* Academic Adjustment/Faculty Coordination */}
                <div
                  className={`rounded-2xl border p-4 transition-all duration-200 ${
                    formData.academicAdjustment
                      ? "border-emerald-600/50 bg-emerald-50/40 shadow-xs ring-1 ring-emerald-500/20"
                      : "border-border bg-secondary hover:bg-slate-100/70"
                  }`}
                >
                  <label className="flex items-center gap-3 font-semibold text-sm text-primary cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={formData.academicAdjustment}
                      onChange={(e) => updateField("academicAdjustment", e.target.checked)}
                      className="sr-only"
                    />
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-lg border transition ${
                        formData.academicAdjustment
                          ? "border-emerald-600 bg-emerald-600 text-white"
                          : "border-slate-400 bg-white"
                      }`}
                    >
                      {formData.academicAdjustment && <CheckCircle2 className="h-3.5 w-3.5" />}
                    </span>
                    Academic Adjustment / Faculty Coordination
                  </label>
                  {formData.academicAdjustment && (
                    <input
                      type="text"
                      value={formData.academicAdjustmentNotes}
                      onChange={(e) => updateField("academicAdjustmentNotes", e.target.value)}
                      placeholder="Describe faculty coordination arranged..."
                      className="mt-3 w-full rounded-xl border border-border bg-white p-2.5 text-sm text-slate-900 outline-none"
                    />
                  )}
                </div>

                {/* Referral to Professional Help */}
                <div
                  className={`rounded-2xl border p-4 transition-all duration-200 ${
                    formData.referralProfessionalHelp
                      ? "border-emerald-600/50 bg-emerald-50/40 shadow-xs ring-1 ring-emerald-500/20"
                      : "border-border bg-secondary hover:bg-slate-100/70"
                  }`}
                >
                  <label className="flex items-center gap-3 font-semibold text-sm text-primary cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={formData.referralProfessionalHelp}
                      onChange={(e) => updateField("referralProfessionalHelp", e.target.checked)}
                      className="sr-only"
                    />
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-lg border transition ${
                        formData.referralProfessionalHelp
                          ? "border-emerald-600 bg-emerald-600 text-white"
                          : "border-slate-400 bg-white"
                      }`}
                    >
                      {formData.referralProfessionalHelp && (
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      )}
                    </span>
                    Referral to Professional Help
                  </label>
                  {formData.referralProfessionalHelp && (
                    <div className="mt-3 space-y-2 pl-8">
                      <button
                        type="button"
                        onClick={() =>
                          updateField("referralICCCoordinator", !formData.referralICCCoordinator)
                        }
                        className={`inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
                          formData.referralICCCoordinator
                            ? "border-primary bg-primary text-white shadow-xs"
                            : "border-border bg-white text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        <span
                          className={`h-3 w-3 rounded-xs border flex items-center justify-center ${
                            formData.referralICCCoordinator
                              ? "border-white bg-white/20"
                              : "border-slate-400 bg-white"
                          }`}
                        >
                          {formData.referralICCCoordinator && (
                            <CheckCircle2 className="h-2.5 w-2.5 text-white" />
                          )}
                        </span>
                        Informed ICC Coordinator
                      </button>
                      <input
                        type="text"
                        value={formData.referralToDetails}
                        onChange={(e) => updateField("referralToDetails", e.target.value)}
                        placeholder="Referred to (Doctor / External Psychiatrist / Specialist name)..."
                        className="w-full rounded-xl border border-border bg-white p-2.5 text-sm text-slate-900 outline-none"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: Client Response and Observations */}
          {step === 4 && (
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Client Response and Observations
                </label>
                <p className="mb-2 text-xs italic text-slate-500">
                  (Note how the client responded — e.g., relieved, emotional, withdrawn, open,
                  receptive, etc.)
                </p>
                <textarea
                  rows={6}
                  value={formData.clientResponseObservations}
                  onChange={(e) => updateField("clientResponseObservations", e.target.value)}
                  placeholder="Record client's emotional state, demeanor, receptiveness during the session..."
                  className="w-full rounded-2xl border border-border bg-secondary p-4 text-sm text-text outline-none transition focus:ring-2 focus:ring-primary/40"
                />
              </div>
            </div>
          )}

          {/* STEP 6: Follow-Up */}
          {step === 5 && (
            <div className="space-y-4">
              <div
                className={`rounded-2xl border p-4 transition-all duration-200 ${
                  formData.isFollowupNeeded
                    ? "border-emerald-600/50 bg-emerald-50/40 shadow-xs ring-1 ring-emerald-500/20"
                    : "border-border bg-secondary hover:bg-slate-100/70"
                }`}
              >
                <label className="flex items-center gap-3 font-semibold text-sm text-primary cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formData.isFollowupNeeded}
                    onChange={(e) => updateField("isFollowupNeeded", e.target.checked)}
                    className="sr-only"
                  />
                  <span
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-lg border transition ${
                      formData.isFollowupNeeded
                        ? "border-emerald-600 bg-emerald-600 text-white"
                        : "border-slate-400 bg-white"
                    }`}
                  >
                    {formData.isFollowupNeeded && <CheckCircle2 className="h-3.5 w-3.5" />}
                  </span>
                  Is follow-up needed? (Yes / No)
                </label>
              </div>

              {formData.isFollowupNeeded && (
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-600">
                    Next Follow-Up Date
                  </label>
                  <input
                    type="date"
                    value={formData.nextFollowupDate}
                    onChange={(e) => updateField("nextFollowupDate", e.target.value)}
                    className="w-full rounded-2xl border border-border bg-secondary p-3 text-sm outline-none"
                  />
                </div>
              )}

              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Actions Planned
                </label>
                <textarea
                  rows={3}
                  value={formData.actionsPlanned}
                  onChange={(e) => updateField("actionsPlanned", e.target.value)}
                  placeholder="Specific action items planned for client..."
                  className="w-full rounded-2xl border border-border bg-secondary p-3 text-sm outline-none transition focus:ring-2 focus:ring-primary/40"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Any support required from ICC Co. / HR / Faculty?
                </label>
                <textarea
                  rows={3}
                  value={formData.supportRequiredICC}
                  onChange={(e) => updateField("supportRequiredICC", e.target.value)}
                  placeholder="Mention institutional support required..."
                  className="w-full rounded-2xl border border-border bg-secondary p-3 text-sm outline-none transition focus:ring-2 focus:ring-primary/40"
                />
              </div>
            </div>
          )}

          {/* STEP 7: Consent & Confidentiality */}
          {step === 6 && (
            <div className="space-y-3">
              {[
                {
                  field: "consentInfoPolicy" as const,
                  text: "The individual was informed about the nature of support and the confidentiality policy.",
                },
                {
                  field: "consentVerbal" as const,
                  text: "Verbal consent was taken to proceed with first aid support and basic documentation.",
                },
              ].map((item) => {
                const isChecked = Boolean(formData[item.field]);
                return (
                  <div
                    key={item.field}
                    onClick={() => updateField(item.field, !isChecked)}
                    className={`rounded-2xl border p-4 transition-all duration-200 cursor-pointer ${
                      isChecked
                        ? "border-emerald-600/50 bg-emerald-50/40 shadow-xs ring-1 ring-emerald-500/20"
                        : "border-border bg-secondary hover:bg-slate-100/70"
                    }`}
                  >
                    <label className="flex items-start gap-3 text-sm font-medium text-slate-800 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => updateField(item.field, !isChecked)}
                        className="sr-only"
                      />
                      <span
                        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-lg border transition ${
                          isChecked
                            ? "border-emerald-600 bg-emerald-600 text-white"
                            : "border-slate-400 bg-white"
                        }`}
                      >
                        {isChecked && <CheckCircle2 className="h-3.5 w-3.5" />}
                      </span>
                      <span className="leading-snug">{item.text}</span>
                    </label>
                  </div>
                );
              })}
            </div>
          )}

          {/* Navigation & Action Footer */}
          <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-secondary pt-5">
            <div>
              <button
                type="button"
                onClick={() => setStep((s) => s - 1)}
                disabled={step === 0}
                className={`inline-flex items-center gap-1.5 rounded-2xl border border-border px-4 py-2.5 text-sm font-semibold transition cursor-pointer ${
                  step === 0
                    ? "invisible"
                    : "bg-secondary text-slate-700 hover:bg-slate-200"
                }`}
              >
                <ArrowLeft className="h-4 w-4" /> Previous
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleSaveDraftClick}
                disabled={submitting}
                className="inline-flex items-center gap-1.5 rounded-2xl border border-border bg-secondary px-4 py-2.5 text-sm font-semibold text-primary hover:bg-slate-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Saving Draft...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" /> Save Draft
                  </>
                )}
              </button>

              {step < steps.length - 1 ? (
                <button
                  type="button"
                  onClick={() => setStep((s) => s + 1)}
                  disabled={submitting}
                  className="inline-flex items-center gap-1.5 rounded-2xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-primary-hover disabled:opacity-50"
                >
                  Next <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={submitCase}
                  disabled={submitting}
                  className="inline-flex items-center gap-1.5 rounded-2xl bg-emerald-700 px-6 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Submitting...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" /> Submit Case Sheet
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </SectionCard>
      </form>
    </div>
  );
}

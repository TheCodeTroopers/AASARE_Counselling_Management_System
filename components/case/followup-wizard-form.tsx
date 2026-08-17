"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  Save,
} from "lucide-react";
import { toast } from "sonner";
import { getCase, updateCase, type CaseSheetRecord, type FollowupSession } from "@/services/case.service";
import { SectionCard } from "@/components/common/section-card";
import { Button } from "@/components/common/button";
import { LoadingSkeleton } from "@/components/common/loading-skeleton";
import Link from "next/link";

const steps = [
  "1. Session & Observations",
  "2. Interventions Provided",
  "3. Next Steps & Schedule",
];

export function FollowupWizardForm({ caseId }: { caseId: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["case", caseId],
    queryFn: () => getCase(caseId),
  });

  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [followupDate, setFollowupDate] = useState(new Date().toISOString().slice(0, 10));
  const [progressObservations, setProgressObservations] = useState("");

  // Interventions State
  const [activeListening, setActiveListening] = useState(false);
  const [activeListeningNotes, setActiveListeningNotes] = useState("");
  const [emotionalSupport, setEmotionalSupport] = useState(false);
  const [emotionalSupportNotes, setEmotionalSupportNotes] = useState("");
  const [stressManagementTips, setStressManagementTips] = useState(false);
  const [stressTipsBreathing, setStressTipsBreathing] = useState(false);
  const [stressTipsGrounding, setStressTipsGrounding] = useState(false);
  const [stressTipsPositiveTalk, setStressTipsPositiveTalk] = useState(false);
  const [stressTipsOther, setStressTipsOther] = useState("");
  const [encouragedPeerFamily, setEncouragedPeerFamily] = useState(false);
  const [sharedHelpline, setSharedHelpline] = useState(false);
  const [academicAdjustment, setAcademicAdjustment] = useState(false);
  const [referralProfessional, setReferralProfessional] = useState(false);
  const [referralDetails, setReferralDetails] = useState("");

  // Next Steps State
  const [isFollowupNeeded, setIsFollowupNeeded] = useState(true);
  const [nextFollowupDate, setNextFollowupDate] = useState(
    new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10)
  );
  const [actionsPlanned, setActionsPlanned] = useState("");

  if (isLoading) return <LoadingSkeleton rows={6} />;
  if (isError || !data?.data) {
    return (
      <div className="mx-auto max-w-4xl rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">
        Unable to load case record for follow-up session.
      </div>
    );
  }

  const caseRecord = data.data as unknown as CaseSheetRecord;
  const rawData = (caseRecord.data as Record<string, any>) || {};
  const existingFollowups: FollowupSession[] = (rawData.followupSessions as FollowupSession[]) || [];
  const nextSessionNumber = existingFollowups.length + 1;
  const defaultCounsellor = rawData.iccSignatureName || "Dr. Deepika B V";

  const clientName = rawData.clientName || caseRecord.studentName || "N/A";
  const departmentName = rawData.department || caseRecord.department || "N/A";
  const semesterInfo = rawData.yearSemester || caseRecord.semester || "";
  const deptAndSemesterText = semesterInfo ? `${departmentName} (${semesterInfo})` : departmentName;

  const handleNextStep = () => {
    if (step === 0 && !progressObservations.trim()) {
      toast.error("Please enter Client Progress & Session Observations.");
      return;
    }
    setStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const handlePrevStep = () => {
    setStep((prev) => Math.max(prev - 1, 0));
  };

  const handleSaveSession = async () => {
    if (step < steps.length - 1) {
      return;
    }

    if (!progressObservations.trim()) {
      toast.error("Please enter session progress and observations in Step 1.");
      setStep(0);
      return;
    }

    setSubmitting(true);

    try {
      const interventionsList: string[] = [];
      if (activeListening) {
        interventionsList.push(`Active Listening${activeListeningNotes ? ` (${activeListeningNotes})` : ""}`);
      }
      if (emotionalSupport) {
        interventionsList.push(`Emotional Support${emotionalSupportNotes ? ` (${emotionalSupportNotes})` : ""}`);
      }
      if (stressManagementTips) {
        const tips = [
          stressTipsBreathing && "Breathing",
          stressTipsGrounding && "Grounding",
          stressTipsPositiveTalk && "Positive Talk",
          stressTipsOther,
        ]
          .filter(Boolean)
          .join(", ");
        interventionsList.push(`Stress Management Tips${tips ? ` (${tips})` : ""}`);
      }
      if (encouragedPeerFamily) interventionsList.push("Encouraged Peer / Family Support");
      if (sharedHelpline) interventionsList.push("Shared Helpline / Mental Health Info");
      if (academicAdjustment) interventionsList.push("Academic Adjustment / Faculty Coordination");
      if (referralProfessional) {
        interventionsList.push(`Referred to Professional Specialist${referralDetails ? `: ${referralDetails}` : ""}`);
      }

      const newSession: FollowupSession = {
        id: `FU-${Date.now().toString().slice(-6)}`,
        sessionNumber: nextSessionNumber,
        followupDate,
        counsellorName: defaultCounsellor,
        progressObservations: progressObservations.trim(),
        interventionsProvided: interventionsList,
        isFollowupNeeded,
        nextFollowupDate: isFollowupNeeded ? nextFollowupDate : undefined,
        actionsPlanned: actionsPlanned.trim(),
        createdAt: new Date().toISOString(),
      };

      const updatedFollowupSessions = [...existingFollowups, newSession];

      const updatedCaseData = {
        ...rawData,
        isFollowupNeeded,
        nextFollowupDate: isFollowupNeeded ? nextFollowupDate : rawData.nextFollowupDate,
        actionsPlanned: actionsPlanned.trim() || rawData.actionsPlanned,
        followupSessions: updatedFollowupSessions,
        lastUpdated: followupDate,
      };

      await updateCase(caseRecord.id, updatedCaseData);

      toast.success(`Follow-up Session #${nextSessionNumber} recorded for Case ${caseRecord.id}!`);

      queryClient.invalidateQueries({ queryKey: ["cases"] });
      queryClient.invalidateQueries({ queryKey: ["case", caseRecord.id] });

      router.push(`/case/${caseRecord.id}`);
    } catch (err: unknown) {
      toast.error((err as Error).message || "Failed to save follow-up session.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href={`/case/${caseRecord.id}`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-primary transition"
        >
          <ArrowLeft className="h-4 w-4" /> Cancel
        </Link>
        <span className="text-xs font-semibold text-slate-500 font-mono">
          Case ID: {caseRecord.id}
        </span>
      </div>

      {/* Header Banner matching Case Sheet Official Header */}
      <div className="rounded-3xl border border-border bg-white p-6 shadow-sm">
        <div className="text-center space-y-1">
          <p className="text-xs font-semibold uppercase tracking-widest text-accent">
            SHRI MADHWA VADIRAJA INSTITUTE OF TECHNOLOGY AND MANAGEMENT (SMVITM)
          </p>
          <h1 className="font-display text-2xl font-bold text-primary md:text-3xl">
            AASARE — Follow-up Session Form
          </h1>
          <p className="text-sm font-medium text-slate-600">
            Follow-Up Session #{nextSessionNumber} • {clientName} ({departmentName})
          </p>
        </div>

        {/* Step Indicator Pills */}
        <div className="mt-6 flex flex-wrap justify-center gap-2 border-t border-secondary pt-4">
          {steps.map((label, idx) => (
            <button
              key={label}
              type="button"
              onClick={() => setStep(idx)}
              className={`rounded-full px-4 py-2 text-xs font-semibold transition cursor-pointer ${
                step === idx
                  ? "bg-primary text-white shadow-sm"
                  : idx < step
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                    : "bg-secondary text-slate-600 hover:bg-slate-200"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Follow-up Wizard Form Card */}
      <form onSubmit={(e) => e.preventDefault()}>
        <SectionCard
          title={steps[step]}
          subtitle={`Fill in details for Follow-up Session #${nextSessionNumber}.`}
        >
          {/* STEP 1: Session & Observations */}
          {step === 0 && (
            <div className="space-y-5">
              {/* Client Overview Card */}
              <div className="rounded-2xl border border-border bg-secondary p-4 grid gap-3 sm:grid-cols-4">
                <div>
                  <span className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                    Client Name
                  </span>
                  <p className="text-base font-bold text-slate-900">{clientName}</p>
                </div>
                <div>
                  <span className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                    Department & Semester
                  </span>
                  <p className="text-sm font-medium text-slate-800">
                    {deptAndSemesterText}
                  </p>
                </div>
                <div>
                  <span className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                    Session Sequence
                  </span>
                  <p className="text-sm font-bold text-primary">
                    Follow-up Session #{nextSessionNumber} ({existingFollowups.length} prior)
                  </p>
                </div>
                <div>
                  <span className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                    Counsellor
                  </span>
                  <p className="text-sm font-bold text-slate-800">
                    {defaultCounsellor}
                  </p>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Session Date *
                </label>
                <input
                  type="date"
                  required
                  value={followupDate}
                  onChange={(e) => setFollowupDate(e.target.value)}
                  className="w-full md:w-auto min-w-sm rounded-2xl border border-border bg-secondary p-3 text-sm text-text outline-none transition focus:ring-2 focus:ring-primary/40"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Client Progress & Session Observations *
                </label>
                <textarea
                  rows={6}
                  required
                  value={progressObservations}
                  onChange={(e) => setProgressObservations(e.target.value)}
                  placeholder="Record client progress since last session, changes in symptoms/behaviour, coping effectiveness, or newly expressed concerns..."
                  className="w-full rounded-2xl border border-border bg-secondary p-4 text-sm outline-none transition focus:ring-2 focus:ring-primary/40 placeholder:text-slate-400"
                />
              </div>
            </div>
          )}

          {/* STEP 2: Interventions Provided */}
          {step === 1 && (
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Check support method and describe action taken:
              </p>

              <div className="space-y-3">
                {/* 1. Active Listening */}
                <div
                  className={`rounded-2xl border p-4 transition-all duration-200 ${
                    activeListening
                      ? "border-emerald-600/50 bg-emerald-50/40 shadow-xs ring-1 ring-emerald-500/20"
                      : "border-border bg-secondary hover:bg-slate-100/70"
                  }`}
                >
                  <label className="flex items-center gap-3 font-semibold text-sm text-primary cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={activeListening}
                      onChange={(e) => setActiveListening(e.target.checked)}
                      className="sr-only"
                    />
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-lg border transition ${
                        activeListening
                          ? "border-emerald-600 bg-emerald-600 text-white"
                          : "border-slate-400 bg-white"
                      }`}
                    >
                      {activeListening && <CheckCircle2 className="h-3.5 w-3.5" />}
                    </span>
                    Active Listening & Empathy Support
                  </label>
                  {activeListening && (
                    <input
                      type="text"
                      value={activeListeningNotes}
                      onChange={(e) => setActiveListeningNotes(e.target.value)}
                      placeholder="Notes on client expression & listening response..."
                      className="mt-3 w-full rounded-xl border border-border bg-white p-2.5 text-sm text-slate-900 outline-none transition focus:ring-2 focus:ring-primary/40"
                    />
                  )}
                </div>

                {/* 2. Emotional Support */}
                <div
                  className={`rounded-2xl border p-4 transition-all duration-200 ${
                    emotionalSupport
                      ? "border-emerald-600/50 bg-emerald-50/40 shadow-xs ring-1 ring-emerald-500/20"
                      : "border-border bg-secondary hover:bg-slate-100/70"
                  }`}
                >
                  <label className="flex items-center gap-3 font-semibold text-sm text-primary cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={emotionalSupport}
                      onChange={(e) => setEmotionalSupport(e.target.checked)}
                      className="sr-only"
                    />
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-lg border transition ${
                        emotionalSupport
                          ? "border-emerald-600 bg-emerald-600 text-white"
                          : "border-slate-400 bg-white"
                      }`}
                    >
                      {emotionalSupport && <CheckCircle2 className="h-3.5 w-3.5" />}
                    </span>
                    Emotional Reassurance & Grounding Support
                  </label>
                  {emotionalSupport && (
                    <input
                      type="text"
                      value={emotionalSupportNotes}
                      onChange={(e) => setEmotionalSupportNotes(e.target.value)}
                      placeholder="Notes on emotional support provided..."
                      className="mt-3 w-full rounded-xl border border-border bg-white p-2.5 text-sm text-slate-900 outline-none transition focus:ring-2 focus:ring-primary/40"
                    />
                  )}
                </div>

                {/* 3. Stress Management Tips */}
                <div
                  className={`rounded-2xl border p-4 transition-all duration-200 ${
                    stressManagementTips
                      ? "border-emerald-600/50 bg-emerald-50/40 shadow-xs ring-1 ring-emerald-500/20"
                      : "border-border bg-secondary hover:bg-slate-100/70"
                  }`}
                >
                  <label className="flex items-center gap-3 font-semibold text-sm text-primary cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={stressManagementTips}
                      onChange={(e) => setStressManagementTips(e.target.checked)}
                      className="sr-only"
                    />
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-lg border transition ${
                        stressManagementTips
                          ? "border-emerald-600 bg-emerald-600 text-white"
                          : "border-slate-400 bg-white"
                      }`}
                    >
                      {stressManagementTips && <CheckCircle2 className="h-3.5 w-3.5" />}
                    </span>
                    Stress Management & Coping Techniques Provided
                  </label>

                  {stressManagementTips && (
                    <div className="mt-3 space-y-2 pl-8">
                      <div className="flex flex-wrap gap-2 text-sm text-slate-700">
                        {[
                          { label: "Deep Breathing", val: stressTipsBreathing, set: setStressTipsBreathing },
                          { label: "Grounding Exercises", val: stressTipsGrounding, set: setStressTipsGrounding },
                          { label: "Positive Self-Talk", val: stressTipsPositiveTalk, set: setStressTipsPositiveTalk },
                        ].map((tip) => (
                          <button
                            key={tip.label}
                            type="button"
                            onClick={() => tip.set(!tip.val)}
                            className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
                              tip.val
                                ? "border-primary bg-primary text-white shadow-xs"
                                : "border-border bg-white text-slate-700 hover:bg-slate-100"
                            }`}
                          >
                            <span
                              className={`h-3.5 w-3.5 rounded-xs border flex items-center justify-center ${
                                tip.val
                                  ? "border-white bg-white/20"
                                  : "border-slate-400 bg-white"
                              }`}
                            >
                              {tip.val && <CheckCircle2 className="h-3 w-3 text-white" />}
                            </span>
                            {tip.label}
                          </button>
                        ))}
                      </div>
                      <input
                        type="text"
                        value={stressTipsOther}
                        onChange={(e) => setStressTipsOther(e.target.value)}
                        placeholder="Other stress management techniques..."
                        className="w-full rounded-xl border border-border bg-white p-2.5 text-sm text-slate-900 outline-none transition focus:ring-2 focus:ring-primary/40"
                      />
                    </div>
                  )}
                </div>

                {/* 4. Encouraged Peer / Family Support */}
                <div
                  className={`rounded-2xl border p-4 transition-all duration-200 ${
                    encouragedPeerFamily
                      ? "border-emerald-600/50 bg-emerald-50/40 shadow-xs ring-1 ring-emerald-500/20"
                      : "border-border bg-secondary hover:bg-slate-100/70"
                  }`}
                >
                  <label className="flex items-center gap-3 font-semibold text-sm text-primary cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={encouragedPeerFamily}
                      onChange={(e) => setEncouragedPeerFamily(e.target.checked)}
                      className="sr-only"
                    />
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-lg border transition ${
                        encouragedPeerFamily
                          ? "border-emerald-600 bg-emerald-600 text-white"
                          : "border-slate-400 bg-white"
                      }`}
                    >
                      {encouragedPeerFamily && <CheckCircle2 className="h-3.5 w-3.5" />}
                    </span>
                    Encouraged Peer / Family Support
                  </label>
                </div>

                {/* 5. Shared Helpline */}
                <div
                  className={`rounded-2xl border p-4 transition-all duration-200 ${
                    sharedHelpline
                      ? "border-emerald-600/50 bg-emerald-50/40 shadow-xs ring-1 ring-emerald-500/20"
                      : "border-border bg-secondary hover:bg-slate-100/70"
                  }`}
                >
                  <label className="flex items-center gap-3 font-semibold text-sm text-primary cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={sharedHelpline}
                      onChange={(e) => setSharedHelpline(e.target.checked)}
                      className="sr-only"
                    />
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-lg border transition ${
                        sharedHelpline
                          ? "border-emerald-600 bg-emerald-600 text-white"
                          : "border-slate-400 bg-white"
                      }`}
                    >
                      {sharedHelpline && <CheckCircle2 className="h-3.5 w-3.5" />}
                    </span>
                    Shared College Helpline & Mental Health Info
                  </label>
                </div>

                {/* 6. Academic & Specialist Referrals */}
                <div
                  className={`rounded-2xl border p-4 transition-all duration-200 ${
                    academicAdjustment
                      ? "border-emerald-600/50 bg-emerald-50/40 shadow-xs ring-1 ring-emerald-500/20"
                      : "border-border bg-secondary hover:bg-slate-100/70"
                  }`}
                >
                  <label className="flex items-center gap-3 font-semibold text-sm text-primary cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={academicAdjustment}
                      onChange={(e) => setAcademicAdjustment(e.target.checked)}
                      className="sr-only"
                    />
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-lg border transition ${
                        academicAdjustment
                          ? "border-emerald-600 bg-emerald-600 text-white"
                          : "border-slate-400 bg-white"
                      }`}
                    >
                      {academicAdjustment && <CheckCircle2 className="h-3.5 w-3.5" />}
                    </span>
                    Academic Adjustment / Faculty Coordination Requested
                  </label>
                </div>

                <div
                  className={`rounded-2xl border p-4 transition-all duration-200 ${
                    referralProfessional
                      ? "border-emerald-600/50 bg-emerald-50/40 shadow-xs ring-1 ring-emerald-500/20"
                      : "border-border bg-secondary hover:bg-slate-100/70"
                  }`}
                >
                  <label className="flex items-center gap-3 font-semibold text-sm text-primary cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={referralProfessional}
                      onChange={(e) => setReferralProfessional(e.target.checked)}
                      className="sr-only"
                    />
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-lg border transition ${
                        referralProfessional
                          ? "border-emerald-600 bg-emerald-600 text-white"
                          : "border-slate-400 bg-white"
                      }`}
                    >
                      {referralProfessional && <CheckCircle2 className="h-3.5 w-3.5" />}
                    </span>
                    Referred to External Specialist / Medical Professional
                  </label>
                  {referralProfessional && (
                    <input
                      type="text"
                      value={referralDetails}
                      onChange={(e) => setReferralDetails(e.target.value)}
                      placeholder="Specialist name / hospital referral details..."
                      className="mt-3 w-full rounded-xl border border-border bg-white p-2.5 text-sm text-slate-900 outline-none transition focus:ring-2 focus:ring-primary/40"
                    />
                  )}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Next Steps & Schedule */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Further Follow-Up Required?
                </label>
                <div className="flex flex-wrap gap-2.5 pt-1">
                  {[true, false].map((val) => {
                    const isSelected = isFollowupNeeded === val;
                    return (
                      <button
                        key={String(val)}
                        type="button"
                        onClick={() => setIsFollowupNeeded(val)}
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
                        {val ? "Yes" : "No"}
                      </button>
                    );
                  })}
                </div>
              </div>

              {isFollowupNeeded && (
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-600">
                    Target Next Follow-Up Date
                  </label>
                  <input
                    type="date"
                    value={nextFollowupDate}
                    onChange={(e) => setNextFollowupDate(e.target.value)}
                    className="w-full rounded-2xl border border-border bg-secondary p-3 text-sm text-text outline-none transition focus:ring-2 focus:ring-primary/40"
                  />
                </div>
              )}

              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Actions Planned / Goals for Next Interaction
                </label>
                <textarea
                  rows={4}
                  value={actionsPlanned}
                  onChange={(e) => setActionsPlanned(e.target.value)}
                  placeholder="Specify action steps, homework exercises, or faculty check-ins for the next visit..."
                  className="w-full rounded-2xl border border-border bg-secondary p-4 text-sm outline-none transition focus:ring-2 focus:ring-primary/40 placeholder:text-slate-400"
                />
              </div>
            </div>
          )}

          {/* Bottom Wizard Navigation Bar */}
          <div className="mt-8 flex items-center justify-between gap-3 border-t border-border pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={handlePrevStep}
              disabled={step === 0 || submitting}
              className={step === 0 ? "invisible" : ""}
            >
              <ArrowLeft className="mr-1.5 h-4 w-4 shrink-0" /> Previous
            </Button>

            <div className="flex items-center gap-2">
              {step < steps.length - 1 ? (
                <Button key="next-btn" type="button" variant="primary" onClick={handleNextStep}>
                  Next <ArrowRight className="ml-1.5 h-4 w-4 shrink-0" />
                </Button>
              ) : (
                <Button
                  key="save-btn"
                  type="button"
                  variant="primary"
                  disabled={submitting}
                  onClick={handleSaveSession}
                >
                  {submitting ? (
                    "Saving Session..."
                  ) : (
                    <>
                      <Save className="mr-1.5 h-4 w-4 shrink-0" /> Save Follow-Up Session #{nextSessionNumber}
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </SectionCard>
      </form>
    </div>
  );
}

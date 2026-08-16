"use client";

import { useQuery } from "@tanstack/react-query";
import { Printer, ArrowLeft, ShieldCheck, CheckSquare, Square, Calendar, User, PlusCircle } from "lucide-react";
import Link from "next/link";
import { getCase, type FollowupSession, type CaseSheetRecord } from "@/services/case.service";
import { SectionCard } from "@/components/common/section-card";
import { LoadingSkeleton } from "@/components/common/loading-skeleton";

export function CaseDetailsView({ caseId }: { caseId: string }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["case", caseId],
    queryFn: () => getCase(caseId),
  });

  if (isLoading) return <LoadingSkeleton rows={4} />;
  if (isError || !data?.data)
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">
        Unable to load case details.
      </div>
    );

  const item = data.data as unknown as CaseSheetRecord;
  const sheet = (item.data as Record<string, any>) || {};
  const followupSessions: FollowupSession[] = (sheet.followupSessions as FollowupSession[]) || [];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Top Controls Bar (hidden during print) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 print:hidden">
        <Link
          href="/case-management"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-primary transition"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Case Directory
        </Link>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
          <Link
            href={`/case/${caseId}/followup`}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-primary bg-white px-4 py-2.5 text-sm font-semibold text-primary shadow transition hover:bg-secondary cursor-pointer w-full sm:w-auto"
          >
            <PlusCircle className="h-4 w-4 shrink-0" /> Add Follow-up Session
          </Link>
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-primary-hover cursor-pointer w-full sm:w-auto"
          >
            <Printer className="h-4 w-4 shrink-0" /> Print / Export Official PDF
          </button>
        </div>
      </div>

      {/* Official Case Sheet Printable Container */}
      <div className="rounded-3xl border border-border bg-white p-4 sm:p-6 md:p-8 shadow-sm print:border-none print:shadow-none print:p-0">
        {/* Document Header */}
        <div className="border-b-2 border-primary pb-4 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-accent">
            SHRI MADHWA VADIRAJA INSTITUTE OF TECHNOLOGY AND MANAGEMENT
          </p>
          <p className="text-[11px] text-slate-500">
            An Autonomous Institute Affiliated to VTU, Belagavi | Approved by AICTE, Accredited by
            NAAC with 'A' Grade
          </p>
          <h1 className="mt-3 font-serif text-2xl font-bold text-primary md:text-3xl">
            AASARE — Institutional Counseling Cell – Case Sheet
          </h1>
          <p className="text-sm font-semibold text-slate-700">(Mental Health First Aid)</p>
        </div>

        {/* 1. General Information Table */}
        <div className="mt-6 space-y-3">
          <h2 className="font-semibold text-base text-primary border-b border-slate-200 pb-1">
            1. General Information
          </h2>
          <div className="grid gap-3 text-sm sm:grid-cols-2">
            <div className="rounded-xl bg-secondary p-3">
              <span className="font-semibold text-slate-600 block text-xs">Client Name:</span>
              <span className="font-medium text-slate-900">
                {sheet.clientName || item.studentName}
              </span>
            </div>
            <div className="rounded-xl bg-secondary p-3">
              <span className="font-semibold text-slate-600 block text-xs">Age / Gender:</span>
              <span className="font-medium text-slate-900">
                {sheet.age || "N/A"} · {sheet.gender || "N/A"}
              </span>
            </div>
            <div className="rounded-xl bg-secondary p-3">
              <span className="font-semibold text-slate-600 block text-xs">
                Role in Institution:
              </span>
              <span className="font-medium text-slate-900">
                {sheet.roleInInstitution || "Student"}
              </span>
            </div>
            <div className="rounded-xl bg-secondary p-3">
              <span className="font-semibold text-slate-600 block text-xs">
                Department / Branch:
              </span>
              <span className="font-medium text-slate-900">
                {sheet.department || item.department}
              </span>
            </div>
            <div className="rounded-xl bg-secondary p-3">
              <span className="font-semibold text-slate-600 block text-xs">Year / Semester:</span>
              <span className="font-medium text-slate-900">
                {sheet.yearSemester || item.semester}
              </span>
            </div>
            <div className="rounded-xl bg-secondary p-3">
              <span className="font-semibold text-slate-600 block text-xs">Contact / Email:</span>
              <span className="font-medium text-slate-900 break-words">
                {sheet.contactNumber || "N/A"} · {sheet.email || "N/A"}
              </span>
            </div>
            <div className="rounded-xl bg-secondary p-3 sm:col-span-2">
              <span className="font-semibold text-slate-600 block text-xs">
                Date of First Interaction / Referred By:
              </span>
              <span className="font-medium text-slate-900">
                {sheet.dateFirstInteraction || item.createdDate} · Referred by:{" "}
                {sheet.referredBy || "Self"}{" "}
                {sheet.referredByOther ? `(${sheet.referredByOther})` : ""}
              </span>
            </div>
          </div>
        </div>

        {/* 2. Reason for Visit */}
        <div className="mt-6 space-y-2">
          <h2 className="font-semibold text-base text-primary border-b border-slate-200 pb-1">
            2. Reason for Visit / Concerns Expressed
          </h2>
          <div className="rounded-xl bg-secondary p-4 text-sm leading-relaxed text-slate-800">
            {sheet.reasonForVisit || "No concerns expressed recorded."}
          </div>
        </div>

        {/* 3. Relevant Background */}
        <div className="mt-6 space-y-3">
          <h2 className="font-semibold text-base text-primary border-b border-slate-200 pb-1">
            3. Relevant Background
          </h2>
          <div className="space-y-2 text-sm">
            <div className="rounded-xl border border-slate-200 p-3">
              <span className="font-semibold text-slate-700 block text-xs">
                Family / Personal Background:
              </span>
              <p className="mt-1 text-slate-800">{sheet.familyBackground || "None noted."}</p>
            </div>
            <div className="rounded-xl border border-slate-200 p-3">
              <span className="font-semibold text-slate-700 block text-xs">
                Academic / Work Stressors:
              </span>
              <p className="mt-1 text-slate-800">{sheet.academicStressors || "None noted."}</p>
            </div>
            <div className="rounded-xl border border-slate-200 p-3">
              <span className="font-semibold text-slate-700 block text-xs">
                Peer / Social Challenges:
              </span>
              <p className="mt-1 text-slate-800">{sheet.peerChallenges || "None noted."}</p>
            </div>
            <div className="rounded-xl border border-slate-200 p-3">
              <span className="font-semibold text-slate-700 block text-xs">
                Recent Major Changes / Loss / Events:
              </span>
              <p className="mt-1 text-slate-800">{sheet.recentMajorChanges || "None noted."}</p>
            </div>
            <div className="rounded-xl border border-slate-200 p-3">
              <span className="font-semibold text-slate-700 block text-xs">
                Physical / Health Issues (if shared):
              </span>
              <p className="mt-1 text-slate-800">{sheet.physicalHealthIssues || "None noted."}</p>
            </div>
          </div>
        </div>

        {/* 4. First Aid Response Provided */}
        <div className="mt-6 space-y-3">
          <h2 className="font-semibold text-base text-primary border-b border-slate-200 pb-1">
            4. First Aid Response Provided
          </h2>
          <div className="grid gap-2 text-sm sm:grid-cols-2">
            <div className="flex items-center gap-2 rounded-xl bg-secondary p-3">
              {sheet.activeListening ? (
                <CheckSquare className="h-4 w-4 text-emerald-700" />
              ) : (
                <Square className="h-4 w-4 text-slate-400" />
              )}
              <span>
                Active Listening{" "}
                {sheet.activeListeningNotes ? `(${sheet.activeListeningNotes})` : ""}
              </span>
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-secondary p-3">
              {sheet.emotionalSupport ? (
                <CheckSquare className="h-4 w-4 text-emerald-700" />
              ) : (
                <Square className="h-4 w-4 text-slate-400" />
              )}
              <span>
                Emotional Support{" "}
                {sheet.emotionalSupportNotes ? `(${sheet.emotionalSupportNotes})` : ""}
              </span>
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-secondary p-3 sm:col-span-2">
              {sheet.stressManagementTips ? (
                <CheckSquare className="h-4 w-4 text-emerald-700" />
              ) : (
                <Square className="h-4 w-4 text-slate-400" />
              )}
              <span>
                Stress Management Tips:{" "}
                {[
                  sheet.stressTipsBreathing && "Breathing",
                  sheet.stressTipsGrounding && "Grounding",
                  sheet.stressTipsPositiveTalk && "Positive Talk",
                  sheet.stressTipsOther,
                ]
                  .filter(Boolean)
                  .join(", ") || "Standard tips"}
              </span>
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-secondary p-3">
              {sheet.encouragedPeerFamilySupport ? (
                <CheckSquare className="h-4 w-4 text-emerald-700" />
              ) : (
                <Square className="h-4 w-4 text-slate-400" />
              )}
              <span>Encouraged Peer / Family Support</span>
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-secondary p-3">
              {sheet.sharedCollegeHelpline ? (
                <CheckSquare className="h-4 w-4 text-emerald-700" />
              ) : (
                <Square className="h-4 w-4 text-slate-400" />
              )}
              <span>Shared Helpline / Mental Health Info</span>
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-secondary p-3 sm:col-span-2">
              {sheet.referralProfessionalHelp ? (
                <CheckSquare className="h-4 w-4 text-emerald-700" />
              ) : (
                <Square className="h-4 w-4 text-slate-400" />
              )}
              <span>
                Referral to Professional Help:{" "}
                {sheet.referralICCCoordinator ? "Informed ICC Coordinator" : ""}{" "}
                {sheet.referralToDetails ? `Referred to: ${sheet.referralToDetails}` : "None"}
              </span>
            </div>
          </div>
        </div>

        {/* 5. Client Response and Observations */}
        <div className="mt-6 space-y-2">
          <h2 className="font-semibold text-base text-primary border-b border-slate-200 pb-1">
            5. Client Response and Observations
          </h2>
          <div className="rounded-xl bg-secondary p-4 text-sm leading-relaxed text-slate-800">
            {sheet.clientResponseObservations || "No observations recorded."}
          </div>
        </div>

        {/* 6. Follow-Up */}
        <div className="mt-6 space-y-3">
          <h2 className="font-semibold text-base text-primary border-b border-slate-200 pb-1">
            6. Follow-Up
          </h2>
          <div className="grid gap-3 text-sm sm:grid-cols-2">
            <div className="rounded-xl bg-secondary p-3">
              <span className="font-semibold text-slate-600 block text-xs">Follow-Up Needed:</span>
              <span className="font-medium text-slate-900">
                {sheet.isFollowupNeeded ? "Yes" : "No"}
              </span>
            </div>
            {sheet.isFollowupNeeded && (
              <div className="rounded-xl bg-secondary p-3">
                <span className="font-semibold text-slate-600 block text-xs">
                  Next Follow-Up Date:
                </span>
                <span className="font-medium text-slate-900">
                  {sheet.nextFollowupDate || "TBD"}
                </span>
              </div>
            )}
            <div className="rounded-xl bg-secondary p-3 sm:col-span-2">
              <span className="font-semibold text-slate-600 block text-xs">Actions Planned:</span>
              <p className="mt-1 text-slate-800">{sheet.actionsPlanned || "None specified."}</p>
            </div>
          </div>
        </div>

        {/* 7. Follow-Up Sessions History */}
        {followupSessions.length > 0 && (
          <div className="mt-6 space-y-4">
            <div className="border-b-2 border-primary pb-1">
              <h2 className="font-semibold text-base text-primary">
                7. Follow-Up Sessions History ({followupSessions.length})
              </h2>
            </div>

            <div className="space-y-4">
              {followupSessions.map((session: FollowupSession, idx: number) => (
                <div key={session.id || idx} className="space-y-2.5">
                  <div className="font-semibold text-sm text-primary pt-1">
                    Follow-up Session #{session.sessionNumber || idx + 1} &nbsp;•&nbsp; Date: {session.followupDate}
                  </div>

                  <div className="rounded-xl bg-secondary p-3 text-sm">
                    <span className="font-semibold text-slate-600 block text-xs">
                      Progress & Session Observations:
                    </span>
                    <p className="mt-1 text-slate-900 leading-relaxed">
                      {session.progressObservations || "None recorded."}
                    </p>
                  </div>

                  {session.interventionsProvided && session.interventionsProvided.length > 0 && (
                    <div className="rounded-xl bg-secondary p-3 text-sm">
                      <span className="font-semibold text-slate-600 block text-xs">
                        Interventions Provided:
                      </span>
                      <p className="mt-1 text-slate-900 font-medium">
                        {session.interventionsProvided.join(", ")}
                      </p>
                    </div>
                  )}

                  <div className="grid gap-3 text-sm sm:grid-cols-2">
                    <div className="rounded-xl bg-secondary p-3">
                      <span className="font-semibold text-slate-600 block text-xs">
                        Further Follow-Up:
                      </span>
                      <span className="font-medium text-slate-900">
                        {session.isFollowupNeeded
                          ? `Yes (Scheduled: ${session.nextFollowupDate || "TBD"})`
                          : "No (Completed)"}
                      </span>
                    </div>
                    <div className="rounded-xl bg-secondary p-3">
                      <span className="font-semibold text-slate-600 block text-xs">
                        Actions Planned:
                      </span>
                      <span className="font-medium text-slate-900">
                        {session.actionsPlanned || "None noted."}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Consent & Confidentiality & Signatures */}
        <div className="mt-8 border-t-2 border-border pt-6 space-y-4">
          <h2 className="font-semibold text-base text-primary">
            {followupSessions.length > 0 ? "8" : "7"}. Consent & Confidentiality
          </h2>
          <div className="space-y-2 text-xs text-slate-700">
            <div className="flex items-center gap-2">
              {sheet.consentInfoPolicy !== false ? (
                <CheckSquare className="h-4 w-4 text-emerald-700" />
              ) : (
                <Square className="h-4 w-4 text-slate-400" />
              )}
              <span>
                The individual was informed about the nature of support and the confidentiality
                policy.
              </span>
            </div>
            <div className="flex items-center gap-2">
              {sheet.consentVerbal !== false ? (
                <CheckSquare className="h-4 w-4 text-emerald-700" />
              ) : (
                <Square className="h-4 w-4 text-slate-400" />
              )}
              <span>
                Verbal consent was taken to proceed with first aid support and basic documentation.
              </span>
            </div>
          </div>

          <div className="mt-8 grid gap-4 pt-4 text-sm sm:grid-cols-2 border-t border-slate-200">
            <div>
              <span className="font-semibold text-slate-600 text-xs uppercase block">
                ICC Faculty / HR Co. Signature:
              </span>
              <p className="mt-2 font-serif text-lg font-bold text-primary">
                {sheet.iccSignatureName || "Dr. Deepika B V"}
              </p>
            </div>
            <div>
              <span className="font-semibold text-slate-600 text-xs uppercase block">Date:</span>
              <p className="mt-2 font-medium text-slate-900">
                {sheet.caseDate || item.createdDate}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

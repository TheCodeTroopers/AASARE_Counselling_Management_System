'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
} from 'lucide-react';
import { toast } from 'sonner';
import { createCase, saveDraft } from '@/services/case.service';
import { SectionCard } from '@/components/common/section-card';
import { Button } from '@/components/common/button';

export type CaseSheetData = {
  // 1. General Information
  clientName: string;
  age: string;
  gender: string;
  roleInInstitution: 'Student' | 'Parent' | 'Faculty' | 'Staff';
  department: string;
  yearSemester: string;
  contactNumber: string;
  email: string;
  dateFirstInteraction: string;
  referredBy: 'Self' | 'Faculty' | 'Peer' | 'Parent' | 'ICC' | 'Other';
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
  clientName: '',
  age: '',
  gender: 'Select Gender',
  roleInInstitution: 'Student',
  department: '',
  yearSemester: '',
  contactNumber: '',
  email: '',
  dateFirstInteraction: new Date().toISOString().slice(0, 10),
  referredBy: 'Self',
  referredByOther: '',

  reasonForVisit: '',

  familyBackground: '',
  academicStressors: '',
  peerChallenges: '',
  recentMajorChanges: '',
  physicalHealthIssues: '',

  activeListening: false,
  activeListeningNotes: '',
  emotionalSupport: false,
  emotionalSupportNotes: '',
  stressManagementTips: false,
  stressTipsBreathing: false,
  stressTipsGrounding: false,
  stressTipsPositiveTalk: false,
  stressTipsOther: '',
  encouragedPeerFamilySupport: false,
  peerFamilyNotes: '',
  sharedCollegeHelpline: false,
  helplineNotes: '',
  academicAdjustment: false,
  academicAdjustmentNotes: '',
  referralProfessionalHelp: false,
  referralICCCoordinator: false,
  referralToDetails: '',

  clientResponseObservations: '',

  isFollowupNeeded: false,
  nextFollowupDate: '',
  actionsPlanned: '',
  supportRequiredICC: '',

  consentInfoPolicy: true,
  consentVerbal: true,
  iccSignatureName: '',
  caseDate: new Date().toISOString().slice(0, 10),
};

const steps = [
  '1. General Info',
  '2. Reason for Visit',
  '3. Background',
  '4. First Aid Response',
  '5. Observations',
  '6. Follow-Up',
  '7. Consent',
];

export function CaseWizardForm() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<CaseSheetData>(initialFormData);
  const [submitting, setSubmitting] = useState(false);

  const updateField = (field: keyof CaseSheetData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveDraftClick = async () => {
    setSubmitting(true);
    try {
      await saveDraft(formData);
      toast.success('Draft saved successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to save draft');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.clientName.trim()) {
      toast.error('Please enter the Client Name in Step 1.');
      setStep(0);
      return;
    }

    setSubmitting(true);
    try {
      const res = await createCase(formData);
      toast.success('Case Sheet created successfully!');
      router.push('/case-management');
    } catch (err: any) {
      toast.error(err.message || 'Failed to create case sheet');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header Banner matching Case Sheet Official Header */}
      <div className="rounded-3xl border border-[#E8DDD5] bg-white p-6 shadow-sm">
        <div className="text-center space-y-1">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#C89B7B]">
            SHRI MADHWA VADIRAJA INSTITUTE OF TECHNOLOGY AND MANAGEMENT (SMVITM)
          </p>
          <h1 className="font-display text-2xl font-bold text-[#6D214F] md:text-3xl">
            AASARE — Institutional Counseling Cell
          </h1>
          <p className="text-sm font-medium text-slate-600">Case Sheet (Mental Health First Aid)</p>
        </div>

        {/* Step Indicator Pills */}
        <div className="mt-6 flex flex-wrap justify-center gap-2 border-t border-[#F8F3EE] pt-4">
          {steps.map((label, idx) => (
            <button
              key={label}
              type="button"
              onClick={() => setStep(idx)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition cursor-pointer ${
                step === idx
                  ? 'bg-[#6D214F] text-white shadow-sm'
                  : idx < step
                  ? 'bg-[#ECF8EE] text-emerald-800 border border-emerald-200'
                  : 'bg-[#F8F3EE] text-slate-600 hover:bg-slate-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Wizard Form Card */}
      <form onSubmit={handleSubmit}>
        <SectionCard title={steps[step]} subtitle="Fill in the official Case Sheet fields accurately.">
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
                  onChange={(e) => updateField('clientName', e.target.value)}
                  placeholder="Enter full name"
                  className="w-full rounded-2xl border border-[#E8DDD5] bg-[#F8F3EE] p-3 text-sm text-[#2F2F2F] outline-none transition focus:border-[#6D214F] focus:ring-2 focus:ring-[#E8DDD5]"
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
                    onChange={(e) => updateField('age', e.target.value)}
                    placeholder="e.g. 20"
                    className="w-full rounded-2xl border border-[#E8DDD5] bg-[#F8F3EE] p-3 text-sm text-[#2F2F2F] outline-none transition focus:border-[#6D214F] focus:ring-2 focus:ring-[#E8DDD5]"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-600">
                    Gender
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => updateField('gender', e.target.value)}
                    className="w-full rounded-2xl border border-[#E8DDD5] bg-[#F8F3EE] p-3 text-sm text-[#2F2F2F] outline-none transition focus:border-[#6D214F]"
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
                <div className="flex flex-wrap gap-4 pt-1">
                  {(['Student', 'Parent', 'Faculty', 'Staff'] as const).map((r) => (
                    <label key={r} className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                      <input
                        type="radio"
                        name="roleInInstitution"
                        checked={formData.roleInInstitution === r}
                        onChange={() => updateField('roleInInstitution', r)}
                        className="accent-[#6D214F]"
                      />
                      {r}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Department / Branch
                </label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => updateField('department', e.target.value)}
                  placeholder="e.g. Computer Science & Engineering"
                  className="w-full rounded-2xl border border-[#E8DDD5] bg-[#F8F3EE] p-3 text-sm text-[#2F2F2F] outline-none transition focus:border-[#6D214F] focus:ring-2 focus:ring-[#E8DDD5]"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Year / Semester (if student)
                </label>
                <input
                  type="text"
                  value={formData.yearSemester}
                  onChange={(e) => updateField('yearSemester', e.target.value)}
                  placeholder="e.g. 3rd Year / 6th Sem"
                  className="w-full rounded-2xl border border-[#E8DDD5] bg-[#F8F3EE] p-3 text-sm text-[#2F2F2F] outline-none transition focus:border-[#6D214F] focus:ring-2 focus:ring-[#E8DDD5]"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Contact Number
                </label>
                <input
                  type="text"
                  value={formData.contactNumber}
                  onChange={(e) => updateField('contactNumber', e.target.value)}
                  placeholder="+91 98xxxxxx00"
                  className="w-full rounded-2xl border border-[#E8DDD5] bg-[#F8F3EE] p-3 text-sm text-[#2F2F2F] outline-none transition focus:border-[#6D214F] focus:ring-2 focus:ring-[#E8DDD5]"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Email ID
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  placeholder="client@sode-edu.in"
                  className="w-full rounded-2xl border border-[#E8DDD5] bg-[#F8F3EE] p-3 text-sm text-[#2F2F2F] outline-none transition focus:border-[#6D214F] focus:ring-2 focus:ring-[#E8DDD5]"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Date of First Interaction
                </label>
                <input
                  type="date"
                  value={formData.dateFirstInteraction}
                  onChange={(e) => updateField('dateFirstInteraction', e.target.value)}
                  className="w-full rounded-2xl border border-[#E8DDD5] bg-[#F8F3EE] p-3 text-sm text-[#2F2F2F] outline-none transition focus:border-[#6D214F] focus:ring-2 focus:ring-[#E8DDD5]"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Referred By
                </label>
                <div className="flex flex-wrap gap-4 pt-1">
                  {(['Self', 'Faculty', 'Peer', 'Parent', 'ICC', 'Other'] as const).map((ref) => (
                    <label key={ref} className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                      <input
                        type="radio"
                        name="referredBy"
                        checked={formData.referredBy === ref}
                        onChange={() => updateField('referredBy', ref)}
                        className="accent-[#6D214F]"
                      />
                      {ref}
                    </label>
                  ))}
                </div>
                {formData.referredBy === 'Other' && (
                  <input
                    type="text"
                    value={formData.referredByOther}
                    onChange={(e) => updateField('referredByOther', e.target.value)}
                    placeholder="Mention who referred"
                    className="mt-2 w-full rounded-2xl border border-[#E8DDD5] bg-[#F8F3EE] p-3 text-sm outline-none"
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
                  onChange={(e) => updateField('reasonForVisit', e.target.value)}
                  placeholder="Describe concerns expressed by client..."
                  className="w-full rounded-2xl border border-[#E8DDD5] bg-[#F8F3EE] p-4 text-sm text-[#2F2F2F] outline-none transition focus:border-[#6D214F] focus:ring-2 focus:ring-[#E8DDD5]"
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
                  onChange={(e) => updateField('familyBackground', e.target.value)}
                  placeholder="Notes on family structure, personal history..."
                  className="w-full rounded-2xl border border-[#E8DDD5] bg-[#F8F3EE] p-3 text-sm outline-none focus:border-[#6D214F]"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Academic / Work Stressors
                </label>
                <textarea
                  rows={3}
                  value={formData.academicStressors}
                  onChange={(e) => updateField('academicStressors', e.target.value)}
                  placeholder="Notes on exams, assignments, performance pressure..."
                  className="w-full rounded-2xl border border-[#E8DDD5] bg-[#F8F3EE] p-3 text-sm outline-none focus:border-[#6D214F]"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Peer / Social Challenges
                </label>
                <textarea
                  rows={3}
                  value={formData.peerChallenges}
                  onChange={(e) => updateField('peerChallenges', e.target.value)}
                  placeholder="Notes on hostel life, peer relationships, social anxiety..."
                  className="w-full rounded-2xl border border-[#E8DDD5] bg-[#F8F3EE] p-3 text-sm outline-none focus:border-[#6D214F]"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Any Recent Major Changes / Loss / Events
                </label>
                <textarea
                  rows={2}
                  value={formData.recentMajorChanges}
                  onChange={(e) => updateField('recentMajorChanges', e.target.value)}
                  placeholder="Bereavement, illness, transition, sudden event..."
                  className="w-full rounded-2xl border border-[#E8DDD5] bg-[#F8F3EE] p-3 text-sm outline-none focus:border-[#6D214F]"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Physical / Health Issues (if shared)
                </label>
                <textarea
                  rows={2}
                  value={formData.physicalHealthIssues}
                  onChange={(e) => updateField('physicalHealthIssues', e.target.value)}
                  placeholder="Sleep issues, chronic illness, appetite, fatigue..."
                  className="w-full rounded-2xl border border-[#E8DDD5] bg-[#F8F3EE] p-3 text-sm outline-none focus:border-[#6D214F]"
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
                <div className="rounded-2xl border border-[#E8DDD5] bg-[#F8F3EE] p-3.5">
                  <label className="flex items-center gap-2 font-semibold text-sm text-[#6D214F] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.activeListening}
                      onChange={(e) => updateField('activeListening', e.target.checked)}
                      className="h-4 w-4 rounded accent-[#6D214F]"
                    />
                    Active Listening
                  </label>
                  {formData.activeListening && (
                    <input
                      type="text"
                      value={formData.activeListeningNotes}
                      onChange={(e) => updateField('activeListeningNotes', e.target.value)}
                      placeholder="Describe active listening provided..."
                      className="mt-2 w-full rounded-xl border border-[#E8DDD5] bg-white p-2.5 text-sm outline-none"
                    />
                  )}
                </div>

                {/* Emotional Support */}
                <div className="rounded-2xl border border-[#E8DDD5] bg-[#F8F3EE] p-3.5">
                  <label className="flex items-center gap-2 font-semibold text-sm text-[#6D214F] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.emotionalSupport}
                      onChange={(e) => updateField('emotionalSupport', e.target.checked)}
                      className="h-4 w-4 rounded accent-[#6D214F]"
                    />
                    Emotional Support
                  </label>
                  {formData.emotionalSupport && (
                    <input
                      type="text"
                      value={formData.emotionalSupportNotes}
                      onChange={(e) => updateField('emotionalSupportNotes', e.target.value)}
                      placeholder="Describe emotional support provided..."
                      className="mt-2 w-full rounded-xl border border-[#E8DDD5] bg-white p-2.5 text-sm outline-none"
                    />
                  )}
                </div>

                {/* Stress Management Tips */}
                <div className="rounded-2xl border border-[#E8DDD5] bg-[#F8F3EE] p-3.5">
                  <label className="flex items-center gap-2 font-semibold text-sm text-[#6D214F] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.stressManagementTips}
                      onChange={(e) => updateField('stressManagementTips', e.target.checked)}
                      className="h-4 w-4 rounded accent-[#6D214F]"
                    />
                    Stress Management Tips
                  </label>
                  {formData.stressManagementTips && (
                    <div className="mt-3 space-y-2 pl-6">
                      <div className="flex flex-wrap gap-4 text-sm text-slate-700">
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.stressTipsBreathing}
                            onChange={(e) => updateField('stressTipsBreathing', e.target.checked)}
                            className="accent-[#6D214F]"
                          />
                          Breathing
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.stressTipsGrounding}
                            onChange={(e) => updateField('stressTipsGrounding', e.target.checked)}
                            className="accent-[#6D214F]"
                          />
                          Grounding
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.stressTipsPositiveTalk}
                            onChange={(e) => updateField('stressTipsPositiveTalk', e.target.checked)}
                            className="accent-[#6D214F]"
                          />
                          Positive Talk
                        </label>
                      </div>
                      <input
                        type="text"
                        value={formData.stressTipsOther}
                        onChange={(e) => updateField('stressTipsOther', e.target.value)}
                        placeholder="Mention if other stress tips provided..."
                        className="w-full rounded-xl border border-[#E8DDD5] bg-white p-2.5 text-sm outline-none"
                      />
                    </div>
                  )}
                </div>

                {/* Encouraged Peer/Family Support */}
                <div className="rounded-2xl border border-[#E8DDD5] bg-[#F8F3EE] p-3.5">
                  <label className="flex items-center gap-2 font-semibold text-sm text-[#6D214F] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.encouragedPeerFamilySupport}
                      onChange={(e) => updateField('encouragedPeerFamilySupport', e.target.checked)}
                      className="h-4 w-4 rounded accent-[#6D214F]"
                    />
                    Encouraged Peer / Family Support
                  </label>
                  {formData.encouragedPeerFamilySupport && (
                    <input
                      type="text"
                      value={formData.peerFamilyNotes}
                      onChange={(e) => updateField('peerFamilyNotes', e.target.value)}
                      placeholder="Describe guidance given..."
                      className="mt-2 w-full rounded-xl border border-[#E8DDD5] bg-white p-2.5 text-sm outline-none"
                    />
                  )}
                </div>

                {/* Shared College Helpline Info */}
                <div className="rounded-2xl border border-[#E8DDD5] bg-[#F8F3EE] p-3.5">
                  <label className="flex items-center gap-2 font-semibold text-sm text-[#6D214F] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.sharedCollegeHelpline}
                      onChange={(e) => updateField('sharedCollegeHelpline', e.target.checked)}
                      className="h-4 w-4 rounded accent-[#6D214F]"
                    />
                    Shared College Helpline / Mental Health Info
                  </label>
                </div>

                {/* Academic Adjustment/Faculty Coordination */}
                <div className="rounded-2xl border border-[#E8DDD5] bg-[#F8F3EE] p-3.5">
                  <label className="flex items-center gap-2 font-semibold text-sm text-[#6D214F] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.academicAdjustment}
                      onChange={(e) => updateField('academicAdjustment', e.target.checked)}
                      className="h-4 w-4 rounded accent-[#6D214F]"
                    />
                    Academic Adjustment / Faculty Coordination
                  </label>
                  {formData.academicAdjustment && (
                    <input
                      type="text"
                      value={formData.academicAdjustmentNotes}
                      onChange={(e) => updateField('academicAdjustmentNotes', e.target.value)}
                      placeholder="Describe faculty coordination arranged..."
                      className="mt-2 w-full rounded-xl border border-[#E8DDD5] bg-white p-2.5 text-sm outline-none"
                    />
                  )}
                </div>

                {/* Referral to Professional Help */}
                <div className="rounded-2xl border border-[#E8DDD5] bg-[#F8F3EE] p-3.5">
                  <label className="flex items-center gap-2 font-semibold text-sm text-[#6D214F] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.referralProfessionalHelp}
                      onChange={(e) => updateField('referralProfessionalHelp', e.target.checked)}
                      className="h-4 w-4 rounded accent-[#6D214F]"
                    />
                    Referral to Professional Help
                  </label>
                  {formData.referralProfessionalHelp && (
                    <div className="mt-3 space-y-2 pl-6">
                      <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.referralICCCoordinator}
                          onChange={(e) => updateField('referralICCCoordinator', e.target.checked)}
                          className="accent-[#6D214F]"
                        />
                        Informed ICC Coordinator
                      </label>
                      <input
                        type="text"
                        value={formData.referralToDetails}
                        onChange={(e) => updateField('referralToDetails', e.target.value)}
                        placeholder="Referred to (Doctor / External Psychiatrist / Specialist name)..."
                        className="w-full rounded-xl border border-[#E8DDD5] bg-white p-2.5 text-sm outline-none"
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
                  (Note how the client responded — e.g., relieved, emotional, withdrawn, open, receptive, etc.)
                </p>
                <textarea
                  rows={6}
                  value={formData.clientResponseObservations}
                  onChange={(e) => updateField('clientResponseObservations', e.target.value)}
                  placeholder="Record client's emotional state, demeanor, receptiveness during the session..."
                  className="w-full rounded-2xl border border-[#E8DDD5] bg-[#F8F3EE] p-4 text-sm text-[#2F2F2F] outline-none transition focus:border-[#6D214F] focus:ring-2 focus:ring-[#E8DDD5]"
                />
              </div>
            </div>
          )}

          {/* STEP 6: Follow-Up */}
          {step === 5 && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-[#E8DDD5] bg-[#F8F3EE] p-4">
                <label className="flex items-center gap-3 font-semibold text-sm text-[#6D214F] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isFollowupNeeded}
                    onChange={(e) => updateField('isFollowupNeeded', e.target.checked)}
                    className="h-4 w-4 rounded accent-[#6D214F]"
                  />
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
                    onChange={(e) => updateField('nextFollowupDate', e.target.value)}
                    className="w-full rounded-2xl border border-[#E8DDD5] bg-[#F8F3EE] p-3 text-sm outline-none"
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
                  onChange={(e) => updateField('actionsPlanned', e.target.value)}
                  placeholder="Specific action items planned for client..."
                  className="w-full rounded-2xl border border-[#E8DDD5] bg-[#F8F3EE] p-3 text-sm outline-none focus:border-[#6D214F]"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Any support required from ICC Co. / HR / Faculty?
                </label>
                <textarea
                  rows={3}
                  value={formData.supportRequiredICC}
                  onChange={(e) => updateField('supportRequiredICC', e.target.value)}
                  placeholder="Mention institutional support required..."
                  className="w-full rounded-2xl border border-[#E8DDD5] bg-[#F8F3EE] p-3 text-sm outline-none focus:border-[#6D214F]"
                />
              </div>
            </div>
          )}

          {/* STEP 7: Consent & Confidentiality */}
          {step === 6 && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-[#E8DDD5] bg-[#F8F3EE] p-4 space-y-3">
                <label className="flex items-start gap-2 text-sm text-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.consentInfoPolicy}
                    onChange={(e) => updateField('consentInfoPolicy', e.target.checked)}
                    className="mt-1 h-4 w-4 rounded accent-[#6D214F]"
                  />
                  <span>The individual was informed about the nature of support and the confidentiality policy.</span>
                </label>
                <label className="flex items-start gap-2 text-sm text-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.consentVerbal}
                    onChange={(e) => updateField('consentVerbal', e.target.checked)}
                    className="mt-1 h-4 w-4 rounded accent-[#6D214F]"
                  />
                  <span>Verbal consent was taken to proceed with first aid support and basic documentation.</span>
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-600">
                    ICC Faculty / HR Co. Name & Signature
                  </label>
                  <input
                    type="text"
                    value={formData.iccSignatureName}
                    onChange={(e) => updateField('iccSignatureName', e.target.value)}
                    placeholder="Dr. Deepika B V / SWO Counsellor Name"
                    className="w-full rounded-2xl border border-[#E8DDD5] bg-[#F8F3EE] p-3 text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-600">
                    Date
                  </label>
                  <input
                    type="date"
                    value={formData.caseDate}
                    onChange={(e) => updateField('caseDate', e.target.value)}
                    className="w-full rounded-2xl border border-[#E8DDD5] bg-[#F8F3EE] p-3 text-sm outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Navigation & Action Footer */}
          <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-[#F8F3EE] pt-5">
            <div className="flex gap-2">
              {step > 0 && (
                <Button variant="ghost" type="button" onClick={() => setStep((s) => s - 1)}>
                  <ArrowLeft className="h-4 w-4" /> Previous
                </Button>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleSaveDraftClick}
                disabled={submitting}
                className="inline-flex items-center gap-1.5 rounded-2xl border border-[#E8DDD5] bg-[#F8F3EE] px-4 py-2.5 text-sm font-semibold text-[#6D214F] hover:bg-slate-200 transition cursor-pointer"
              >
                <Save className="h-4 w-4" /> Save Draft
              </button>

              {step < steps.length - 1 ? (
                <button
                  type="button"
                  onClick={() => setStep((s) => s + 1)}
                  className="inline-flex items-center gap-1.5 rounded-2xl bg-[#6D214F] px-5 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-[#581a3f] cursor-pointer"
                >
                  Next <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-1.5 rounded-2xl bg-emerald-700 px-6 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-emerald-800 cursor-pointer"
                >
                  <CheckCircle2 className="h-4 w-4" /> Submit Case Sheet
                </button>
              )}
            </div>
          </div>
        </SectionCard>
      </form>
    </div>
  );
}

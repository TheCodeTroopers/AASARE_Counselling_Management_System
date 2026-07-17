'use client';

import { useState } from 'react';
import { Button } from '@/components/common/button';
import { SectionCard } from '@/components/common/section-card';

const steps = [
  'General Information',
  'Reason for Visit',
  'Relevant Background',
  'First Aid Response',
  'Client Response',
  'Follow Up',
  'Consent',
];

export function CaseWizardForm() {
  const [step, setStep] = useState(0);

  return (
    <SectionCard title="New Case Wizard" subtitle="Multi-step case intake flow with draft and submit integration points.">
      <div className="mb-4 flex flex-wrap gap-2">
        {steps.map((label, index) => (
          <span key={label} className={`rounded-full px-3 py-1 text-xs font-semibold ${index === step ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600'}`}>
            {label}
          </span>
        ))}
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <label className="text-sm text-slate-600">
          Client Name
          <input className="mt-1 w-full rounded-xl border border-slate-200 p-3" placeholder="Client name" />
        </label>
        <label className="text-sm text-slate-600">
          Age
          <input className="mt-1 w-full rounded-xl border border-slate-200 p-3" placeholder="Age" />
        </label>
        <label className="text-sm text-slate-600">
          Role
          <input className="mt-1 w-full rounded-xl border border-slate-200 p-3" placeholder="Student / Parent / Staff" />
        </label>
        <label className="text-sm text-slate-600">
          Department
          <input className="mt-1 w-full rounded-xl border border-slate-200 p-3" placeholder="Department" />
        </label>
        <label className="text-sm text-slate-600">
          Semester
          <input className="mt-1 w-full rounded-xl border border-slate-200 p-3" placeholder="Semester" />
        </label>
        <label className="text-sm text-slate-600">
          Phone
          <input className="mt-1 w-full rounded-xl border border-slate-200 p-3" placeholder="Phone" />
        </label>
        <label className="text-sm text-slate-600 md:col-span-2">
          Summary
          <textarea className="mt-1 min-h-28 w-full rounded-xl border border-slate-200 p-3" placeholder="Reason for visit and summary" />
        </label>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <Button variant="ghost" onClick={() => setStep((current) => Math.max(0, current - 1))}>Previous</Button>
        <Button variant="secondary" onClick={() => setStep((current) => Math.min(steps.length - 1, current + 1))}>Next</Button>
        <Button variant="ghost">Save Draft</Button>
        <Button variant="primary">Submit</Button>
      </div>
    </SectionCard>
  );
}

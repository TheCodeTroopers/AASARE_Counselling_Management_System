import { FollowupWizardForm } from "@/components/case/followup-wizard-form";

export default async function FollowupPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <FollowupWizardForm caseId={id} />;
}

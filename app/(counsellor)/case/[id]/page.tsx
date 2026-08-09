import { CaseDetailsView } from "@/components/case/case-details-view";

export default async function CaseDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <CaseDetailsView caseId={id} />;
}

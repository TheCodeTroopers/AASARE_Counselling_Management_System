export interface CounsellingCase {
  id: string;
  studentName: string;
  createdDate: string;
  lastUpdated: string;
  status: 'draft' | 'completed';
  department: string;
  semester: string;
}

export interface NewCaseDraft {
  general: Record<string, unknown>;
  reason: string;
  background: Record<string, unknown>;
  firstAid: Record<string, unknown>;
  response: string;
  followUp: Record<string, unknown>;
  consent: Record<string, unknown>;
}

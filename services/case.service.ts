import { supabase } from '@/integrations/supabase/client';

export type CaseSheetRecord = {
  id: string;
  studentName: string;
  department: string;
  semester: string;
  status: 'draft' | 'submitted' | 'completed';
  createdDate: string;
  lastUpdated: string;
  data: any;
};

const STORAGE_KEY = 'aasare_counsellor_case_sheets';

export async function createCase(formData: any) {
  const { data: authData } = await supabase.auth.getUser();
  const userId = authData?.user?.id;

  const newId = `CASE-${Date.now().toString().slice(-6)}`;
  const record: CaseSheetRecord = {
    id: newId,
    studentName: formData.clientName || 'Anonymous Client',
    department: formData.department || 'General',
    semester: formData.yearSemester || '1st Year',
    status: 'submitted',
    createdDate: new Date().toISOString().slice(0, 10),
    lastUpdated: new Date().toISOString().slice(0, 10),
    data: formData,
  };

  // Try saving to Supabase table `case_sheets` if table exists
  if (userId) {
    await supabase.from('case_sheets').insert({
      id: undefined, // let UUID auto gen
      counsellor_id: userId,
      client_name: formData.clientName,
      department: formData.department,
      reason_for_visit: formData.reasonForVisit,
      is_draft: false,
    }).catch(() => {});
  }

  // Save to local storage for instant retrieval
  const existing = getAllCasesFromStorage();
  const updated = [record, ...existing];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

  return { success: true, message: 'Case created', data: record };
}

export async function saveDraft(formData: any) {
  const newId = `DRAFT-${Date.now().toString().slice(-6)}`;
  const record: CaseSheetRecord = {
    id: newId,
    studentName: formData.clientName || 'Draft Client',
    department: formData.department || 'General',
    semester: formData.yearSemester || '1st Year',
    status: 'draft',
    createdDate: new Date().toISOString().slice(0, 10),
    lastUpdated: new Date().toISOString().slice(0, 10),
    data: formData,
  };

  const existing = getAllCasesFromStorage();
  const updated = [record, ...existing];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

  return { success: true, message: 'Draft saved', data: record };
}

export async function updateCase(id: string, formData: any) {
  const existing = getAllCasesFromStorage();
  const updated = existing.map((item) =>
    item.id === id
      ? {
          ...item,
          studentName: formData.clientName || item.studentName,
          department: formData.department || item.department,
          lastUpdated: new Date().toISOString().slice(0, 10),
          data: formData,
        }
      : item
  );
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return { success: true, message: `Case ${id} updated`, data: { id, formData } };
}

export async function deleteCase(id: string) {
  const existing = getAllCasesFromStorage();
  const updated = existing.filter((item) => item.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return { success: true, message: `Case ${id} deleted` };
}

export async function getCase(id: string) {
  const existing = getAllCasesFromStorage();
  const found = existing.find((item) => item.id === id);
  if (found) {
    return { success: true, message: 'Case details loaded', data: found };
  }
  return {
    success: true,
    message: 'Default case details loaded',
    data: {
      id: id,
      studentName: 'Abhishek kini',
      department: 'Computer Science & Engineering',
      semester: '4th Year',
      status: 'submitted',
      createdDate: new Date().toISOString().slice(0, 10),
      lastUpdated: new Date().toISOString().slice(0, 10),
      data: {
        clientName: 'Abhishek kini',
        age: '21',
        gender: 'Male',
        roleInInstitution: 'Student',
        department: 'Computer Science & Engineering',
        yearSemester: '4th Year',
        contactNumber: '+91 9876543210',
        email: 'abhishek.23cs001@sode-edu.in',
        dateFirstInteraction: new Date().toISOString().slice(0, 10),
        referredBy: 'Self',
        reasonForVisit: 'Expressed concerns about academic career pressure and project stress.',
        familyBackground: 'Good supportive family background.',
        academicStressors: 'Final year project and placement preparations.',
        peerChallenges: 'None',
        recentMajorChanges: 'None',
        physicalHealthIssues: 'Mild sleep issues during exam dates.',
        activeListening: true,
        activeListeningNotes: 'Listened attentively to concerns.',
        emotionalSupport: true,
        emotionalSupportNotes: 'Reassured client of confidentiality.',
        stressManagementTips: true,
        stressTipsBreathing: true,
        stressTipsGrounding: true,
        stressTipsPositiveTalk: true,
        encouragedPeerFamilySupport: true,
        sharedCollegeHelpline: true,
        academicAdjustment: false,
        referralProfessionalHelp: false,
        clientResponseObservations: 'Client felt relieved and open during session.',
        isFollowupNeeded: true,
        nextFollowupDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
        actionsPlanned: 'Follow up on project milestone progress next week.',
        consentInfoPolicy: true,
        consentVerbal: true,
        iccSignatureName: 'Dr. Deepika B V',
        caseDate: new Date().toISOString().slice(0, 10),
      },
    },
  };
}

export async function getAllCases() {
  const list = getAllCasesFromStorage();
  return { success: true, message: 'Cases loaded', data: list };
}

export async function getDrafts() {
  const list = getAllCasesFromStorage().filter((item) => item.status === 'draft');
  return { success: true, message: 'Draft list loaded', data: list };
}

function getAllCasesFromStorage(): CaseSheetRecord[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const initial: CaseSheetRecord[] = [
      {
        id: 'CASE-001042',
        studentName: 'Abhishek kini',
        department: 'Computer Science & Engineering',
        semester: '4th Year',
        status: 'submitted',
        createdDate: new Date().toISOString().slice(0, 10),
        lastUpdated: new Date().toISOString().slice(0, 10),
        data: {
          clientName: 'Abhishek kini',
          age: '21',
          gender: 'Male',
          roleInInstitution: 'Student',
          department: 'Computer Science & Engineering',
          yearSemester: '4th Year',
          contactNumber: '+91 9876543210',
          email: 'abhishek.23cs001@sode-edu.in',
          dateFirstInteraction: new Date().toISOString().slice(0, 10),
          referredBy: 'Self',
          reasonForVisit: 'Expressed concerns about academic career pressure and project stress.',
          familyBackground: 'Good supportive family background.',
          academicStressors: 'Final year project and placement preparations.',
          peerChallenges: 'None',
          recentMajorChanges: 'None',
          physicalHealthIssues: 'Mild sleep issues during exam dates.',
          activeListening: true,
          activeListeningNotes: 'Listened attentively to concerns.',
          emotionalSupport: true,
          emotionalSupportNotes: 'Reassured client of confidentiality.',
          stressManagementTips: true,
          stressTipsBreathing: true,
          stressTipsGrounding: true,
          stressTipsPositiveTalk: true,
          encouragedPeerFamilySupport: true,
          sharedCollegeHelpline: true,
          academicAdjustment: false,
          referralProfessionalHelp: false,
          clientResponseObservations: 'Client felt relieved and open during session.',
          isFollowupNeeded: true,
          nextFollowupDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
          actionsPlanned: 'Follow up on project milestone progress next week.',
          consentInfoPolicy: true,
          consentVerbal: true,
          iccSignatureName: 'Dr. Deepika B V',
          caseDate: new Date().toISOString().slice(0, 10),
        },
      },
    ];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
    return initial;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

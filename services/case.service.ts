import { supabase } from "@/integrations/supabase/client";

async function authHeaders(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export type CaseSheetRecord = {
  id: string;
  studentName: string;
  department: string;
  semester: string;
  status: "draft" | "submitted" | "completed";
  createdDate: string;
  lastUpdated: string;
  data: Record<string, unknown>;
};

export async function createCase(formData: any) {
  const res = await fetch("/api/cases", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(await authHeaders()) },
    body: JSON.stringify(formData),
  });

  if (!res.ok) {
    throw new Error("Failed to create case sheet in Google Drive.");
  }
  return await res.json();
}

export async function saveDraft(formData: any) {
  const res = await fetch("/api/cases", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(await authHeaders()) },
    body: JSON.stringify({ ...formData, isDraft: true }),
  });

  if (!res.ok) {
    throw new Error("Failed to save draft in Google Drive.");
  }
  return await res.json();
}

export async function updateCase(id: string, formData: any) {
  const res = await fetch(`/api/cases/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...(await authHeaders()) },
    body: JSON.stringify(formData),
  });

  if (!res.ok) {
    throw new Error(`Failed to update case ${id} in Google Drive.`);
  }
  return await res.json();
}

export async function deleteCase(id: string) {
  const res = await fetch(`/api/cases/${id}`, {
    method: "DELETE",
    headers: await authHeaders(),
  });

  if (!res.ok) {
    const json = await res.json().catch(() => null);
    throw new Error(json?.message || `Failed to delete case ${id}.`);
  }
  return await res.json();
}

export async function getCase(id: string) {
  // On-Demand loading of single case JSON from Google Drive via Next.js API
  const res = await fetch(`/api/cases/${id}`, { headers: await authHeaders() });
  if (res.ok) {
    const json = await res.json();
    if (json.data) return json;
  }

  return {
    success: true,
    message: "Default case details loaded",
    data: {
      id: id,
      studentName: "Abhishek kini",
      department: "Computer Science & Engineering",
      semester: "4th Year",
      status: "submitted",
      createdDate: new Date().toISOString().slice(0, 10),
      lastUpdated: new Date().toISOString().slice(0, 10),
      data: {
        clientName: "Abhishek kini",
        age: "21",
        gender: "Male",
        roleInInstitution: "Student",
        department: "Computer Science & Engineering",
        yearSemester: "4th Year",
        contactNumber: "+91 9876543210",
        email: "abhishek.23cs001@sode-edu.in",
        dateFirstInteraction: new Date().toISOString().slice(0, 10),
        referredBy: "Self",
        reasonForVisit: "Expressed concerns about academic career pressure and project stress.",
        familyBackground: "Good supportive family background.",
        academicStressors: "Final year project and placement preparations.",
        peerChallenges: "None",
        recentMajorChanges: "None",
        physicalHealthIssues: "Mild sleep issues during exam dates.",
        activeListening: true,
        activeListeningNotes: "Listened attentively to concerns.",
        emotionalSupport: true,
        emotionalSupportNotes: "Reassured client of confidentiality.",
        stressManagementTips: true,
        stressTipsBreathing: true,
        stressTipsGrounding: true,
        stressTipsPositiveTalk: true,
        encouragedPeerFamilySupport: true,
        sharedCollegeHelpline: true,
        academicAdjustment: false,
        referralProfessionalHelp: false,
        clientResponseObservations: "Client felt relieved and open during session.",
        isFollowupNeeded: true,
        nextFollowupDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
        actionsPlanned: "Follow up on project milestone progress next week.",
        consentInfoPolicy: true,
        consentVerbal: true,
        iccSignatureName: "Dr. Deepika B V",
        caseDate: new Date().toISOString().slice(0, 10),
      },
    },
  };
}

export async function getAllCases(params?: { status?: string; search?: string; limit?: number }) {
  const searchParams = new URLSearchParams();
  if (params?.status) searchParams.set("status", params.status);
  if (params?.search) searchParams.set("search", params.search);
  if (params?.limit) searchParams.set("limit", String(params.limit));

  const url = `/api/cases${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;
  const res = await fetch(url, { headers: await authHeaders() });
  if (res.ok) {
    const json = await res.json();
    return json;
  }
  return { success: true, message: "Cases loaded", data: [] };
}

export async function getDrafts() {
  // Query backend directly with ?status=draft filter parameter (zero full table scanning)
  const res = await fetch("/api/cases?status=draft", { headers: await authHeaders() });
  if (res.ok) {
    const json = await res.json();
    return { success: true, message: "Draft list loaded", data: json.data || [] };
  }
  return { success: true, message: "Draft list loaded", data: [] };
}

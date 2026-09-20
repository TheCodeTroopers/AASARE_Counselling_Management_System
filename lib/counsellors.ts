export type Counsellor = {
  id: string;
  name: string;
  designation: string;
  department: string;
  bio: string;
  specialties: string[];
  email: string;
  available: boolean;
  isCoordinator?: boolean;
  initials: string;
  accent: string;
  image?: string;
};

// Simple hash function to generate a consistent color based on email
function getAccent(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `oklch(0.65 0.12 ${hue})`;
}

// Generate initials from full name
function getInitials(name: string) {
  const parts = name.replace(/^(Dr\.|Mr\.|Ms\.)\s*/i, "").trim().split(" ");
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return "CN";
}

export async function fetchCounsellors(): Promise<Counsellor[]> {
  try {
    const res = await fetch("/api/counsellors");
    if (!res.ok) throw new Error("Failed to load counsellors");
    const profiles = await res.json();
    return profiles.map((p: any) => ({
      id: p.id,
      name: p.full_name || "Faculty Counsellor",
      designation: p.designation || "Faculty Counsellor",
      department: p.department || "Unknown Department",
      bio: p.bio || "Dedicated faculty counsellor ready to support students in their academic and personal journey.",
      specialties: Array.isArray(p.specialties) && p.specialties.length > 0 
        ? p.specialties 
        : ["General Support", "Student Wellbeing"],
      email: p.email || "",
      available: true, // we assume all are available in directory unless we link to another system
      isCoordinator: p.is_coordinator || false,
      initials: getInitials(p.full_name || "Counsellor"),
      accent: getAccent(p.email || p.id),
      image: p.image_url || undefined,
    }));
  } catch (err) {
    console.error("Error fetching counsellors", err);
    return [];
  }
}

export async function getCounsellor(id: string): Promise<Counsellor | undefined> {
  const list = await fetchCounsellors();
  return list.find((c) => c.id === id);
}

export function getSlotsForCounsellor(counsellorId: string, dateISO: string) {
  const base = ["09:30", "10:30", "11:30", "14:00", "15:00", "16:00"];
  let h = 0;
  const s = `${counsellorId}-${dateISO}`;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return base.map((time, i) => ({
    time,
    booked: ((h >> i) & 1) === 1 && ((h >> (i + 3)) & 1) === 0,
  }));
}

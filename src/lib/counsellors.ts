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
  accent: string; // avatar tint
  image?: string; // optional photo from /public
};

export const counsellors: Counsellor[] = [
  {
    id: "deepika-bv",
    name: "Dr. Deepika B V",
    designation: "Committee Coordinator, SWO",
    department: "Civil Engineering",
    bio: "Coordinator of the AASARE Institutional Counselling Cell. Focused on student wellbeing, academic stress, and career direction.",
    specialties: ["Academic Stress", "Career Guidance", "Coordinator"],
    email: "deepika.civil@sode-edu.in",
    available: true,
    isCoordinator: true,
    initials: "DB",
    accent: "oklch(0.62 0.14 25)",
    image: "/Dr. Deepika B V.webp",
  },
  {
    id: "subbulakshmi-karanth",
    name: "Dr. Subbulakshmi N Karanth",
    designation: "Faculty Counsellor",
    department: "Basic Sciences & Humanities",
    bio: "Supports first-year students through the transition into college life and foundational coursework.",
    specialties: ["Freshman Support", "Study Habits"],
    email: "snkaranth.chemistry@sode-edu.in",
    available: true,
    initials: "SK",
    accent: "oklch(0.65 0.12 60)",
    image: "./SUBBALAKSHMI-CHEM.jpg",
  },
  {
    id: "reshma-nayak",
    name: "Ms. Reshma Nayak",
    designation: "Faculty Counsellor",
    department: "Basic Sciences & Humanities",
    bio: "A warm listener who works with students on stress management, motivation, and personal challenges.",
    specialties: ["Stress", "Motivation", "Personal"],
    email: "reshma.maths@sode-edu.in",
    available: true,
    initials: "RN",
    accent: "oklch(0.7 0.11 40)",
    image: "/Reshma-Nayak-Maths.jpg",
  },
  {
    id: "shashikala-r",
    name: "Ms. Shashikala",
    designation: "Faculty Counsellor",
    department: "Electronics & Communication Engineering",
    bio: "Guides ECE students through academic difficulties, project stress, and internship-related concerns.",
    specialties: ["Academics", "Internships"],
    email: "shashikala.ec@sode-edu.in",
    available: true,
    initials: "SR",
    accent: "oklch(0.6 0.12 200)",
    image: "/SHASHIKALA-R.jpg",
  },
  {
    id: "savitha-shenoy",
    name: "Ms. Savitha Shenoy",
    designation: "Faculty Counsellor",
    department: "Computer Science & Engineering",
    bio: "Approachable mentor for CSE students navigating placements, imposter syndrome, and workload.",
    specialties: ["Placements", "Workload"],
    email: "savitha.cs@sode-edu.in",
    available: true,
    initials: "SS",
    accent: "oklch(0.68 0.12 300)",
    image: "/savitha-2.jpg",
  },
  {
    id: "ashwitha-thota",
    name: "Ms. ASHWITHA C THOTA",
    designation: "Faculty Counsellor",
    department: "Computer Science & Engineering",
    bio: "Focuses on peer relationships, hostel life, and finding balance during hectic semesters.",
    specialties: ["Peer Support", "Life Balance"],
    email: "ashwithac.cs@sode-edu.in",
    available: true,
    initials: "AT",
    accent: "oklch(0.66 0.13 340)",
    image: "/Ashwitha.webp",
  },
  {
    id: "mamatha",
    name: "Ms. MAMATHA",
    designation: "Faculty Counsellor",
    department: "Artificial Intelligence & Machine Learning",
    bio: "Helps students set realistic goals, plan academic milestones, and address anxiety around performance.",
    specialties: ["Goal Setting", "Anxiety"],
    email: "mamathas.ml@sode-edu.in",
    available: true,
    initials: "MA",
    accent: "oklch(0.68 0.13 150)",
    image: "/Ms. Mamatha AI and ML.jpg",
  },
  {
    id: "karthik-v",
    name: "Mr. Karthik V",
    designation: "Faculty Counsellor",
    department: "Mechanical Engineering",
    bio: "Practical, grounded mentor for students dealing with family expectations and long-term direction.",
    specialties: ["Family Pressure", "Direction"],
    email: "karthik.mech@sode-edu.in",
    available: true,
    initials: "KV",
    accent: "oklch(0.6 0.12 90)",
    image: "/Karthik-Mech-1-e1690266651386.jpg",
  },
  {
    id: "neha-lakhotia",
    name: "Dr. Neha Lakhotia",
    designation: "Faculty Counsellor",
    department: "Business Administration",
    bio: "Supports MBA and inter-disciplinary students on career pivots, self-confidence, and communication.",
    specialties: ["Career", "Confidence"],
    email: "nehal.mba@sode-edu.in",
    available: true,
    initials: "NL",
    accent: "oklch(0.66 0.13 15)",
    image: "/Dr.-Neha-Lakhotia.jpg",
  },
];

export function getCounsellor(id: string) {
  return counsellors.find((c) => c.id === id);
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
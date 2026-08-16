import { NextRequest, NextResponse } from "next/server";

const DEFAULT_NOTIFICATIONS = [
  {
    id: "notif-1",
    title: "New Appointment Request",
    message: "Student Aarav Nair requested a counselling session for Tomorrow at 10:00 AM.",
    type: "appointment",
    timestamp: "10 mins ago",
    isRead: false,
    link: "/dashboard",
  },
  {
    id: "notif-2",
    title: "Case Sheet Updated",
    message: "Draft case sheet for CASE-001042 was updated with new session notes.",
    type: "case",
    timestamp: "45 mins ago",
    isRead: false,
    link: "/case-management",
  },
  {
    id: "notif-3",
    title: "Appointment Approved",
    message: "Session with Ananya Rao confirmed for Friday at 2:00 PM.",
    type: "appointment",
    timestamp: "2 hours ago",
    isRead: true,
    link: "/dashboard",
  },
  {
    id: "notif-4",
    title: "Google Drive Sync Completed",
    message: "Encrypted backup of confidential case files finished successfully.",
    type: "system",
    timestamp: "5 hours ago",
    isRead: true,
    link: "/google-drive",
  },
  {
    id: "notif-5",
    title: "Weekly Slot Reminder",
    message: "Please review and set your available consultation slots for next week.",
    type: "reminder",
    timestamp: "1 day ago",
    isRead: true,
    link: "/slots",
  },
];

export async function GET() {
  return NextResponse.json({
    success: true,
    data: DEFAULT_NOTIFICATIONS,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const newNotif = {
      id: `notif-${Date.now()}`,
      title: body.title || "New Alert",
      message: body.message || "",
      type: body.type || "system",
      timestamp: "Just now",
      isRead: false,
      link: body.link || "/dashboard",
    };

    return NextResponse.json({
      success: true,
      message: "Notification created",
      data: newNotif,
    });
  } catch (err: unknown) {
    return NextResponse.json({ success: false, message: (err as Error).message }, { status: 500 });
  }
}

import { supabase } from '@/integrations/supabase/client';

const slugMap: Record<string, string> = {
  'deepika.civil@sode-edu.in': 'deepika-bv',
  'shashikala.ec@sode-edu.in': 'shashikala-r',
  'savitha.cs@sode-edu.in': 'savitha-shenoy',
  'ashwithac.cs@sode-edu.in': 'ashwitha-thota',
  'karthik.mech@sode-edu.in': 'karthik-v',
  'mamathas.ml@sode-edu.in': 'mamatha',
  'snkaranth.chemistry@sode-edu.in': 'subbulakshmi-karanth',
  'reshma.maths@sode-edu.in': 'reshma-nayak',
  'nehal.mba@sode-edu.in': 'nehal-mba',
};

export async function getDashboard() {
  const { data: authData } = await supabase.auth.getUser();
  if (!authData?.user) {
    return {
      success: true,
      message: 'No auth user',
      data: {
        stats: [
          { label: "Today's Appointments", value: '0', tone: 'primary' },
          { label: 'Upcoming Appointments', value: '0', tone: 'secondary' },
          { label: 'Pending Requests', value: '0', tone: 'warning' },
          { label: 'Approved', value: '0', tone: 'success' },
          { label: 'Rejected', value: '0', tone: 'danger' },
        ],
        chartData: [],
        activityFeed: [],
      },
    };
  }

  const user = authData.user;
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, email')
    .eq('id', user.id)
    .single();

  const userRole = profile?.role || 'student';
  const userEmail = profile?.email || user.email || '';

  let query = supabase.from('appointments').select('*');

  if (userRole === 'counsellor') {
    const staticSlug = slugMap[userEmail];
    const matchIds = [user.id, userEmail];
    if (staticSlug) matchIds.push(staticSlug);
    query = query.in('counsellor_id', matchIds);
  }

  const { data: appts } = await query;
  const list = appts || [];

  const todayStr = new Date().toISOString().slice(0, 10);

  const todaysCount = list.filter((a) => a.date === todayStr).length;
  const upcomingCount = list.filter((a) => a.date >= todayStr && a.status !== 'cancelled').length;
  const pendingCount = list.filter((a) => a.status === 'pending').length;
  const approvedCount = list.filter((a) => a.status === 'approved').length;
  const rejectedCount = list.filter((a) => a.status === 'rejected').length;

  const stats = [
    { label: "Today's Appointments", value: String(todaysCount), tone: 'primary' },
    { label: 'Upcoming Appointments', value: String(upcomingCount), tone: 'secondary' },
    { label: 'Pending Requests', value: String(pendingCount), tone: 'warning' },
    { label: 'Approved', value: String(approvedCount), tone: 'success' },
    { label: 'Rejected', value: String(rejectedCount), tone: 'danger' },
  ];

  // Activity Feed
  const recentAppts = [...list].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  ).slice(0, 5);

  const studentUserIds = Array.from(new Set(recentAppts.map((a) => a.user_id)));
  const { data: profilesData } = await supabase
    .from('profiles')
    .select('id, full_name')
    .in('id', studentUserIds);

  const profileMap = new Map((profilesData || []).map((p) => [p.id, p.full_name]));

  const activityFeed = recentAppts.map((a) => {
    const sName = profileMap.get(a.user_id) || 'Student';
    return {
      id: a.id,
      title: `Appointment (${a.status}) for ${sName} on ${a.date} at ${a.slot_time}`,
      meta: new Date(a.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
  });

  // Simple chart distribution by day of week
  const dayCounts: Record<string, { appointments: number; status: number }> = {
    Mon: { appointments: 0, status: 0 },
    Tue: { appointments: 0, status: 0 },
    Wed: { appointments: 0, status: 0 },
    Thu: { appointments: 0, status: 0 },
    Fri: { appointments: 0, status: 0 },
    Sat: { appointments: 0, status: 0 },
  };

  list.forEach((a) => {
    const d = new Date(a.date);
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
    if (dayCounts[dayName]) {
      dayCounts[dayName].appointments += 1;
      if (a.status === 'approved' || a.status === 'completed') {
        dayCounts[dayName].status += 1;
      }
    }
  });

  const chartData = Object.entries(dayCounts).map(([name, val]) => ({
    name,
    appointments: val.appointments,
    status: val.status,
  }));

  return {
    success: true,
    message: 'Dashboard loaded',
    data: {
      stats,
      chartData,
      activityFeed,
    },
  };
}

export async function getDashboardMock() {
  return getDashboard();
}

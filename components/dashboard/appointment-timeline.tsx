'use client';

import { useEffect, useState } from 'react';
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
  'nehal.mba@sode-edu.in': 'neha-lakhotia',
};

type TimelineItem = {
  id: string;
  time: string;
  date: string;
  studentName: string;
  reason: string;
  status: string;
};

export function AppointmentTimeline() {
  const [items, setItems] = useState<TimelineItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTimeline() {
      const { data: authData } = await supabase.auth.getUser();
      if (!authData?.user) {
        setLoading(false);
        return;
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

      const { data: appts } = await query.order('date', { ascending: true }).limit(10);
      const list = appts || [];

      if (list.length === 0) {
        setItems([]);
        setLoading(false);
        return;
      }

      const studentIds = Array.from(new Set(list.map((a) => a.user_id)));
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', studentIds);

      const profileMap = new Map((profilesData || []).map((p) => [p.id, p.full_name]));

      const timelineData = list.map((a) => ({
        id: a.id,
        time: a.slot_time,
        date: a.date,
        studentName: profileMap.get(a.user_id) || 'Student',
        reason: a.reason,
        status: a.status,
      }));

      setItems(timelineData);
      setLoading(false);
    }

    loadTimeline();
  }, []);

  if (loading) {
    return (
      <div className="rounded-[20px] border border-[#E8DDD5] bg-white p-5 shadow-card">
        <h2 className="text-lg font-semibold text-[#6D214F]">Upcoming Timeline</h2>
        <p className="mt-4 text-xs text-slate-500">Loading timeline...</p>
      </div>
    );
  }

  return (
    <div className="rounded-[20px] border border-[#E8DDD5] bg-white p-5 shadow-card">
      <h2 className="text-lg font-semibold text-[#6D214F]">Upcoming Timeline</h2>
      {items.length === 0 ? (
        <p className="mt-4 text-sm text-slate-500">No appointments scheduled in your timeline yet.</p>
      ) : (
        <div className="mt-4 space-y-3 text-sm text-[#2F2F2F]">
          {items.map((item) => (
            <div key={item.id} className="flex flex-col gap-1 rounded-2xl bg-[#F8F3EE] p-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <span className="font-medium text-[#6D214F]">{item.date} at {item.time}</span> · <span className="font-semibold">{item.studentName}</span>
                <p className="text-xs text-slate-600">{item.reason}</p>
              </div>
              <span className={`inline-block w-fit rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${
                item.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : item.status === 'pending' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
              }`}>
                {item.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

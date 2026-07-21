"use client";

import { useState } from "react";
import { Building2, UserCircle2, BellRing, Clock3, Save, Check } from "lucide-react";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function SettingsPage() {
  const [institute, setInstitute] = useState({
  name: "AASARE – Institutional Counselling Cell (ICC)",
  address:
    "Shri Madhwa Vadiraja Institute of Technology and Management (SMVITM), Bantakal, Udupi, Karnataka",
  email: "admin@smvitm.edu.in",
  phone: "+91 XXXXX XXXXX",
});
  const [profile, setProfile] = useState({
  name: "Dr. Deepika B V",
  email: "deepika.bv@smvitm.edu.in",
  role: "Counselling Cell Coordinator",
});
  const [notifications, setNotifications] = useState({
    emailNew: true,
    emailReminders: true,
    smsUrgent: false,
    weeklyReport: true,
  });
  const [sessionDuration, setSessionDuration] = useState(45);
  const [bufferMinutes, setBufferMinutes] = useState(10);
  const [hours, setHours] = useState({ start: "09:00", end: "17:00" });
  const [workingDays, setWorkingDays] = useState<string[]>(["Mon", "Tue", "Wed", "Thu", "Fri"]);
  const [saved, setSaved] = useState(false);

  const toggleDay = (d: string) =>
    setWorkingDays((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]));

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const Card = ({
    icon: Icon,
    title,
    subtitle,
    children,
  }: {
    icon: typeof Building2;
    title: string;
    subtitle: string;
    children: React.ReactNode;
  }) => (
    <section className="rounded-2xl border border-[#ece1cd] bg-white shadow-sm">
      <div className="flex items-start gap-3 px-5 py-4 border-b border-[#f0e5d3]">
        <div className="grid h-9 w-9 place-items-center rounded-lg bg-[#faf3e2] text-[#6b1e2b]">
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <h3 className="font-serif text-lg text-[#3b1219] leading-tight">{title}</h3>
          <p className="text-xs text-[#8a6a55]">{subtitle}</p>
        </div>
      </div>
      <div className="p-5">{children}</div>
    </section>
  );

  const inputCls =
    "w-full rounded-xl border border-[#e9dfd0] bg-[#fdfaf3] px-3 py-2.5 text-sm text-[#3b1219] placeholder:text-[#a08a76] focus:outline-none focus:border-[#c9a24a]";
  const labelCls = "block text-xs font-medium tracking-wide uppercase text-[#8a6a55] mb-1.5";

  return (
    <>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Card icon={Building2} title="Institute Information" subtitle="Public details for the cell">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className={labelCls}>Institute name</label>
              <input className={inputCls} value={institute.name} onChange={(e) => setInstitute({ ...institute, name: e.target.value })} />
            </div>
            <div>
              <label className={labelCls}>Address</label>
              <input className={inputCls} value={institute.address} onChange={(e) => setInstitute({ ...institute, address: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Email</label>
                <input className={inputCls} value={institute.email} onChange={(e) => setInstitute({ ...institute, email: e.target.value })} />
              </div>
              <div>
                <label className={labelCls}>Phone</label>
                <input className={inputCls} value={institute.phone} onChange={(e) => setInstitute({ ...institute, phone: e.target.value })} />
              </div>
            </div>
          </div>
        </Card>

        <Card icon={UserCircle2} title="Admin Profile" subtitle="Your account details">
          <div className="flex items-center gap-4 mb-5">
            <div className="grid h-14 w-14 place-items-center rounded-full bg-[#6b1e2b] text-[#f5e9c8] font-serif text-lg">
              {profile.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
            </div>
            <button className="rounded-full border border-[#e9dfd0] bg-white px-3 py-1.5 text-xs font-medium text-[#3b1219] hover:bg-[#faf3e2]">
              Change avatar
            </button>
          </div>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className={labelCls}>Full name</label>
              <input className={inputCls} value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Email</label>
                <input className={inputCls} value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} />
              </div>
              <div>
                <label className={labelCls}>Role</label>
                <input className={inputCls} value={profile.role} onChange={(e) => setProfile({ ...profile, role: e.target.value })} />
              </div>
            </div>
          </div>
        </Card>

        <Card icon={BellRing} title="Notifications" subtitle="Choose how you're alerted">
          <div className="space-y-3">
            {[
              { key: "emailNew", label: "Email me for new appointment requests" },
              { key: "emailReminders", label: "Email reminders 24h before sessions" },
              { key: "smsUrgent", label: "SMS alerts for urgent requests" },
              { key: "weeklyReport", label: "Weekly summary report every Monday" },
            ].map((row) => {
              const k = row.key as keyof typeof notifications;
              const on = notifications[k];
              return (
                <label
                  key={row.key}
                  className="flex items-center justify-between gap-4 rounded-xl border border-[#efe4d1] bg-[#fdfaf3] px-4 py-3 cursor-pointer"
                >
                  <span className="text-sm text-[#3b1219]">{row.label}</span>
                  <button
                    type="button"
                    onClick={() => setNotifications({ ...notifications, [k]: !on })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      on ? "bg-[#6b1e2b]" : "bg-[#e9dfd0]"
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${
                        on ? "translate-x-5" : "translate-x-0.5"
                      }`}
                    />
                  </button>
                </label>
              );
            })}
          </div>
        </Card>

        <Card icon={Clock3} title="Session & Working Hours" subtitle="Defaults for schedules">
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label className={labelCls}>Session duration (min)</label>
              <input type="number" min={15} step={5} className={inputCls} value={sessionDuration} onChange={(e) => setSessionDuration(Number(e.target.value))} />
            </div>
            <div>
              <label className={labelCls}>Buffer between (min)</label>
              <input type="number" min={0} step={5} className={inputCls} value={bufferMinutes} onChange={(e) => setBufferMinutes(Number(e.target.value))} />
            </div>
            <div>
              <label className={labelCls}>Working hours start</label>
              <input type="time" className={inputCls} value={hours.start} onChange={(e) => setHours({ ...hours, start: e.target.value })} />
            </div>
            <div>
              <label className={labelCls}>Working hours end</label>
              <input type="time" className={inputCls} value={hours.end} onChange={(e) => setHours({ ...hours, end: e.target.value })} />
            </div>
          </div>
          <div>
            <label className={labelCls}>Working days</label>
            <div className="flex flex-wrap gap-2">
              {DAYS.map((d) => {
                const on = workingDays.includes(d);
                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() => toggleDay(d)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                      on
                        ? "bg-[#6b1e2b] text-[#faf3e2] border-[#6b1e2b]"
                        : "bg-white text-[#3b1219] border-[#e9dfd0] hover:bg-[#faf3e2]"
                    }`}
                  >
                    {d}
                  </button>
                );
              })}
            </div>
          </div>
        </Card>
      </div>

      {/* Sticky save bar */}
      <div className="sticky bottom-4 mt-6 flex justify-end">
        <div className="flex items-center gap-3 rounded-full border border-[#ece1cd] bg-white/95 backdrop-blur px-3 py-2 shadow-lg shadow-[#6b1e2b]/10">
          {saved && (
            <span className="inline-flex items-center gap-1.5 text-xs text-[#2f6b3a] pl-2">
              <Check className="h-3.5 w-3.5" /> Saved
            </span>
          )}
          <button
            onClick={handleSave}
            className="inline-flex items-center gap-2 rounded-full bg-[#6b1e2b] px-5 py-2 text-sm font-medium text-[#faf3e2] hover:bg-[#5a1723]"
          >
            <Save className="h-4 w-4" /> Save Changes
          </button>
        </div>
      </div>
    </>
  );
}

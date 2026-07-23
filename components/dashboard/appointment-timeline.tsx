export function AppointmentTimeline() {
  return (
    <div className="rounded-[20px] border border-[#E8DDD5] bg-white p-5 shadow-card">
      <h2 className="text-lg font-semibold text-[#6D214F]">Upcoming Timeline</h2>
      <div className="mt-4 space-y-3 text-sm text-[#2F2F2F]">
        <div className="rounded-2xl bg-[#F8F3EE] p-3">09:30 AM · Aarav Nair · Academic counselling</div>
        <div className="rounded-2xl bg-[#F8F3EE] p-3">11:00 AM · Nisha Verma · Career guidance</div>
        <div className="rounded-2xl bg-[#F8F3EE] p-3">02:30 PM · Karthik Roy · Family support session</div>
      </div>
    </div>
  );
}

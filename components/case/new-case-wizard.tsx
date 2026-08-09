export function NewCaseWizard() {
  return (
    <div className="glass-card rounded-2xl p-5">
      <h1 className="text-2xl font-semibold">New Case Wizard</h1>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <label className="text-sm">
          Client Name
          <input
            className="mt-1 w-full rounded-xl border border-slate-200 p-3"
            placeholder="Client name"
          />
        </label>
        <label className="text-sm">
          Age
          <input className="mt-1 w-full rounded-xl border border-slate-200 p-3" placeholder="Age" />
        </label>
        <label className="text-sm">
          Department
          <input
            className="mt-1 w-full rounded-xl border border-slate-200 p-3"
            placeholder="Department"
          />
        </label>
        <label className="text-sm">
          Semester
          <input
            className="mt-1 w-full rounded-xl border border-slate-200 p-3"
            placeholder="Semester"
          />
        </label>
      </div>
      <div className="mt-4 flex gap-2">
        <button className="rounded-xl bg-primary px-4 py-2 text-sm text-white">Previous</button>
        <button className="rounded-xl bg-secondary px-4 py-2 text-sm text-white">Next</button>
        <button className="rounded-xl bg-slate-100 px-4 py-2 text-sm text-slate-700">
          Save Draft
        </button>
        <button className="rounded-xl bg-success px-4 py-2 text-sm text-white">Submit</button>
      </div>
    </div>
  );
}

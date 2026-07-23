"use client";

import { Search, Bell, ChevronDown } from "lucide-react";

export default function AdminHeader({
  title = "Dashboard",
  subtitle = "Overview of counselling activity",
}: {
  title?: string;
  subtitle?: string;
}) {
  return (
    <header className="sticky top-0 z-20 border-b border-[#ece1cd] bg-[#fdfaf3]/90 backdrop-blur">
      <div className="flex items-center gap-4 px-6 py-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-[11px] tracking-[0.18em] uppercase text-[#a08a76]">
            <span>AASARE</span>
            <span className="text-[#d4b48a]">•</span>
            <span>Admin</span>
          </div>
          <h1 className="font-serif text-2xl text-[#3b1219] leading-tight">
            {title}
          </h1>
          <p className="text-xs text-[#7a5a4a]">{subtitle}</p>
        </div>

        <div className="ml-auto flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 rounded-full border border-[#e9dfd0] bg-white px-3 py-2 w-72">
            <Search className="h-4 w-4 text-[#a08a76]" />
            <input
              placeholder="Search counsellors, students, sessions…"
              className="w-full bg-transparent text-sm text-[#3b1219] placeholder:text-[#b39c86] outline-none"
            />
          </div>

          <button className="relative grid h-10 w-10 place-items-center rounded-full border border-[#e9dfd0] bg-white text-[#6b1e2b] hover:bg-[#faf3e2]">
            <Bell className="h-4 w-4" />
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-[#c9a24a] ring-2 ring-white" />
          </button>

          <div className="flex items-center gap-3 rounded-full border border-[#e9dfd0] bg-white pl-1 pr-3 py-1">
            <div className="grid h-8 w-8 place-items-center rounded-full bg-[#6b1e2b] text-[#f5e9c8] text-xs font-semibold">
              AD
            </div>
            <div className="hidden sm:block leading-tight">
              <div className="text-xs font-semibold text-[#3b1219]">Admin</div>
              <div className="text-[10px] text-[#8a6a55]">admin@sode-edu.in</div>
            </div>
            <ChevronDown className="h-4 w-4 text-[#8a6a55]" />
          </div>
        </div>
      </div>
    </header>
  );
}

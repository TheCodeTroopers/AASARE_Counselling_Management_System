import Link from "next/link";
import Image from "next/image";
import logo from "@/src/assets/smvitm-logo.jpg";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border/60 bg-cream/60">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 md:grid-cols-4 md:px-8">
        <div className="md:col-span-2">
          <div className="flex items-center gap-3">
            <Image src={logo} alt="SMVITM" className="h-12 w-12 object-contain rounded-full" />
            <div>
              <p className="font-display text-2xl font-semibold text-primary">AASARE</p>
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Institutional Counselling Cell
              </p>
            </div>
          </div>
          <p className="mt-5 max-w-md text-sm leading-relaxed text-muted-foreground">
            Shri Madhwa Vadiraja Institute of Technology & Management. VTU affiliated,
            VTU recognized. A quiet, confidential space where students meet trained
            faculty counsellors.
          </p>
        </div>

        <div>
          <p className="text-sm font-semibold text-foreground">Navigate</p>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li><Link href="/counsellors" className="hover:text-primary">Counsellor Directory</Link></li>
            <li><Link href="/my-appointments" className="hover:text-primary">My Appointments</Link></li>
            <li><Link href="/about" className="hover:text-primary">About AASARE</Link></li>
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold text-foreground">Reach us</p>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li>Vishwothama Nagar, Bantakal – 574115</li>
            <li>Udupi District, Karnataka</li>
            <li>info@sode-edu.in</li>
            <li>+91 820 258 9182</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/60">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-2 px-5 py-5 text-xs text-muted-foreground md:flex-row md:items-center md:px-8">
          <p>© {new Date().getFullYear()} SMVITM · AASARE Counselling Cell. All rights reserved.</p>
          <p className="italic">सर्वे भद्राणि पश्यन्तु — May all see auspiciousness.</p>
        </div>
      </div>
    </footer>
  );
}

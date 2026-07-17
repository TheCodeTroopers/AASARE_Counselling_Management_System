import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AASARE Counsellor Portal',
  description: 'Counsellor panel management dashboard for AASARE counselling cell.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
// @ts-ignore: allow side-effect CSS import when no declaration file is present
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'AASARE Counsellor Portal',
  description: 'Counsellor panel management dashboard for AASARE counselling cell.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-background text-text antialiased">{children}</body>
    </html>
  );
}

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
// @ts-ignore
import './globals.css';
import { AuthProvider } from '@/hooks/use-auth';
import { Toaster } from 'sonner';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'AASARE — SMVITM Counselling Cell',
  description: 'A quiet room, whenever you need one. Institutional Counselling Cell of SMVITM.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-background text-text antialiased">
        <AuthProvider>
          {children}
          <Toaster position="top-right" richColors />
        </AuthProvider>
      </body>
    </html>
  );
}

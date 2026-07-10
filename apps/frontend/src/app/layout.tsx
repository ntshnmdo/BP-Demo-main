import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import QueryProvider from '@/providers/QueryProvider';
import { Toaster } from '@/components/ui/Toaster';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Battery Passport Platform',
  description:
    'Enterprise Battery Passport Management Platform — Track, verify, and manage battery lifecycle data with full regulatory compliance.',
  keywords: ['battery passport', 'sustainability', 'EV battery', 'compliance'],
  authors: [{ name: 'Battery Passport Team' }],
  themeColor: '#10b981',
  openGraph: {
    title: 'Battery Passport Platform',
    description: 'Enterprise Battery Passport Management Platform',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} font-inter bg-slate-950 text-slate-100 antialiased`}>
        <QueryProvider>
          {children}
          <Toaster />
        </QueryProvider>
      </body>
    </html>
  );
}

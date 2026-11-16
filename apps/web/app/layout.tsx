import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import ThemeRegistry from './ThemeRegistry';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Fresher Jobs India',
  description:
    'Discover 200+ genuine fresher jobs and internships across India. ' +
    'AI-powered classification by role and city, updated daily.',
  keywords: [
    'fresher jobs',
    'internships',
    'entry-level jobs',
    'India jobs',
    'fresher hiring',
    '0 experience jobs',
  ],
  authors: [{ name: 'Fresher Jobs India' }],
  robots: 'index, follow',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <ThemeRegistry>{children}</ThemeRegistry>
      </body>
    </html>
  );
}

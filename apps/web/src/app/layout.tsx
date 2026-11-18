import type { Metadata } from 'next';
import ThemeRegistry from '../theme/ThemeRegistry';

export const metadata: Metadata = {
  title: 'Fresher Jobs India — Entry-Level Jobs & Internships',
  description:
    'Discover genuine fresher and internship listings aggregated from verified public sources across India. Search by role, city, job type, and skills.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body style={{ margin: 0, padding: 0, backgroundColor: '#f8f9fa' }}>
        <ThemeRegistry>{children}</ThemeRegistry>
      </body>
    </html>
  );
}

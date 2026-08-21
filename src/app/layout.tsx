import type { Metadata, Viewport } from 'next';

import '../index.css';
import { ClientLayout } from './ClientLayout';

export const viewport: Viewport = {
  themeColor: '#f5f0e8',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: 'EX-it.',
  description: 'Your personal breakup recovery space',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'EX-it.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-180.svg" />
        <link rel="apple-touch-icon" sizes="192x192" href="/icons/icon-192.svg" />
      </head>
      <body suppressHydrationWarning>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}

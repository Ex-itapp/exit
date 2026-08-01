import type { Metadata } from 'next';
import '../index.css';
import { ClientLayout } from './ClientLayout';

export const metadata: Metadata = {
  title: 'EX-it.',
  description: 'Your personal breakup recovery space',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}

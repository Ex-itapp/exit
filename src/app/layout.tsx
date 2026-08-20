import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
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
        <Script
          id="pwa-install-prompt"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.deferredPWAInstallPrompt = null;
              window.addEventListener('beforeinstallprompt', (e) => {
                e.preventDefault();
                window.deferredPWAInstallPrompt = e;
              });
            `
          }}
        />
        <Script
          id="remove-bis-skin"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const removeAttr = (el) => {
                  if (el && el.removeAttribute) el.removeAttribute('bis_skin_checked');
                };
                document.querySelectorAll('[bis_skin_checked]').forEach(removeAttr);
                const observer = new MutationObserver((mutations) => {
                  mutations.forEach((m) => {
                    if (m.type === 'attributes' && m.attributeName === 'bis_skin_checked') {
                      removeAttr(m.target);
                    } else if (m.addedNodes.length) {
                      m.addedNodes.forEach((node) => {
                        if (node.nodeType === 1) {
                          removeAttr(node);
                          node.querySelectorAll('[bis_skin_checked]').forEach(removeAttr);
                        }
                      });
                    }
                  });
                });
                observer.observe(document.documentElement, {
                  attributes: true,
                  childList: true,
                  subtree: true,
                  attributeFilter: ['bis_skin_checked']
                });
              })();
            `
          }}
        />
      </head>
      <body suppressHydrationWarning>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}

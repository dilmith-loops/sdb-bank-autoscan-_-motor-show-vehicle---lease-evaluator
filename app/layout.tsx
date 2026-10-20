import type { Metadata, Viewport } from 'next';
import '../src/index.css';

const title = 'SDB Bank AutoScan | Motor Show Vehicle & Lease Evaluator';
const description =
  'Scan any vehicle at the Motor Show to verify specs, condition, Sri Lankan market price, and calculate personalized SDB Bank leasing installments.';

export const metadata: Metadata = {
  title,
  description,
  icons: { icon: '/sdb-bank-logo.png' },
  openGraph: { title, description, type: 'website' },
  twitter: { card: 'summary_large_image' },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0072BC',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Space+Grotesk:wght@600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}

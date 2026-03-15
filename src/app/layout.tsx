import type { Metadata } from 'next';
import { Nunito } from 'next/font/google';
import './globals.css';

const nunito = Nunito({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-nunito',
});

export const metadata: Metadata = {
  title: 'The Latent Space Zoo',
  description: 'A living storybook where AI glitches become magical creatures!',
  manifest: '/manifest.json',
  themeColor: '#1F2937',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Latent Space Zoo',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${nunito.variable} font-body antialiased`}>
        {children}
      </body>
    </html>
  );
}

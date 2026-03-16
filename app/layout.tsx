import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'The Latent Space Zoo',
  description: 'A WebGPU-powered AI creature generator',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

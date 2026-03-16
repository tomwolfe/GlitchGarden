import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Latent Space Zoo - Catch AI Creatures!",
  description: "A privacy-first, client-side AI storybook and creature collection game. All AI runs locally in your browser - no data leaves your device!",
  keywords: ["AI", "creatures", "game", "kids", "privacy", "storybook", "offline"],
  authors: [{ name: "Latent Space Zoo" }],
  openGraph: {
    title: "The Latent Space Zoo",
    description: "Catch glitch creatures from the AI latent space!",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <meta name="theme-color" content="#a855f7" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Latent Zoo" />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}

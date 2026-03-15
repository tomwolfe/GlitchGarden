import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SWRegistration } from "@/components/SWRegistration";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "The Latent Space Zoo",
  description: "Create creatures with local AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <SWRegistration />
      </body>
    </html>
  );
}

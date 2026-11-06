import type { Metadata } from "next";
import { Geist, Geist_Mono, Anton } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const anton = Anton({
  weight: "400",
  variable: "--font-anton",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Jepong Devxyz",
  description:
    "Jepong Devxyz — a cinematic streaming interface demo. Browse, search, and preview titles in a Netflix-style experience.",
  keywords: ["Jepong Devxyz", "streaming", "movies", "series", "demo"],
  authors: [{ name: "Jepong Devxyz" }],
  openGraph: {
    title: "Jepong Devxyz",
    description: "A cinematic streaming interface demo",
    siteName: "Jepong Devxyz",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${anton.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}

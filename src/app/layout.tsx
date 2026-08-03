import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { getSiteUrl } from "@/lib/site";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Event Pendidikan | Registrasi & Kehadiran",
    template: "%s | Event Pendidikan",
  },
  description: "Platform registrasi event pendidikan yang rapi, cepat, dan mudah digunakan.",
  openGraph: {
    type: "website",
    siteName: "Event Pendidikan",
    title: "Event Pendidikan | Registrasi & Kehadiran",
    description: "Platform registrasi event pendidikan yang rapi, cepat, dan mudah digunakan.",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Event Pendidikan" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Event Pendidikan | Registrasi & Kehadiran",
    description: "Platform registrasi event pendidikan yang rapi, cepat, dan mudah digunakan.",
    images: ["/opengraph-image"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

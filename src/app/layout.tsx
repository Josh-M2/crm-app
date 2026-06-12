import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const rawSiteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  process.env.VERCEL_URL ??
  "http://localhost:3000";
const siteUrl = rawSiteUrl.startsWith("http")
  ? rawSiteUrl
  : `https://${rawSiteUrl}`;

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "LeadNest",
  description:
    "A modern CRM platform for managing leads, customers, pipelines, and sales follow-ups in one organized workspace.",
  openGraph: {
    title: "LeadNest",
    description:
      "A modern CRM platform for managing leads, customers, pipelines, and sales follow-ups in one organized workspace.",
    url: siteUrl,
    siteName: "LeadNest",
    images: [
      {
        url: `${siteUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "LeadNest hero preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "LeadNest",
    description:
      "A modern CRM platform for managing leads, customers, pipelines, and sales follow-ups in one organized workspace.",
    images: [`${siteUrl}/og-image.png`],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

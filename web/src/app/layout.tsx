import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { getRequestLocale } from "@/lib/i18n-server";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PetLife",
  description: "Pet social, companionship, and services platform.",
  icons: {
    icon: "/brand/petlife-cat-icon.jpg",
    apple: "/brand/petlife-cat-icon.jpg",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getRequestLocale();

  return (
    <html
      lang={locale === "en" ? "en" : "zh-CN"}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}

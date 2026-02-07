import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from 'next/script'
import "./globals.css";
import { ThemeSelect } from '@/components/theme/ThemeSelect'
import { getThemeInitScript } from '@/components/theme/themeInit'
import { Toaster } from '@/components/ui/toaster'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Risk Assistant",
  description: "Lightweight, deterministic, facts-based guardrail engine",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-gradient-to-br from-indigo-50/30 via-purple-50/20 to-pink-50/30 dark:from-indigo-950/30 dark:via-purple-950/20 dark:to-pink-950/30 text-foreground antialiased font-sans`}
      >
        <Script id="theme-init" strategy="beforeInteractive" dangerouslySetInnerHTML={{ __html: getThemeInitScript() }} />

        <div className="fixed right-4 top-4 z-50">
          <ThemeSelect />
        </div>
        {children}
        <Toaster />
      </body>
    </html>
  );
}

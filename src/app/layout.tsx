import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { SiteNavbar } from "@/components/layout/SiteNavbar";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Omni-OS | The Ultimate No-Code Operating System",
  description: "Build portfolios, SaaS, e-commerce, and luxury web apps visually. No code required.",
};

import { AuthProvider } from "@/components/providers/AuthProvider";
import I18nProvider from "@/components/providers/I18nProvider";
import { PerformanceMonitor } from "@/components/telemetry/PerformanceMonitor";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700;800;900&family=Montserrat:wght@100;200;300;400;500;600;700;800;900&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400&family=Roboto+Mono:wght@100;300;400;500;700&display=swap" rel="stylesheet" />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <I18nProvider>
          <AuthProvider>
            <PerformanceMonitor />
            <SiteNavbar />
            {children}
          </AuthProvider>
        </I18nProvider>
      </body>
    </html>
  );
}

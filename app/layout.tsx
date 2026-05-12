import React from "react";
import "./globals.css";
import GlobalFooter from "@/components/GlobalFooter";
import { PageMetadataProvider } from "@/context/pagemetadataContext";
import { LanguageProvider } from '@/context/languagecontext';
import { PiNetworkProvider } from '@/context/PiNetworkContext';
import GlobalMobileElements from "@/components/GlobalMobileElements";
import { ThemeProvider } from "@/components/theme-provider";
import NavbarWithMobile from '@/components/navbar';
import { AddressProvider } from '@/context/AddressContext';
import Script from 'next/script';
import type { Metadata, Viewport } from "next";
import MobilePiWelcome from "@/components/MobilePiWelcome";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'localhost:3000'),
  title: {
    default: 'Zyraview',
    template: '%s | Zyraview'
  },
  description: 'Zyraview is a data-driven platform for Pi Network enthusiasts, offering resources, events, and a vibrant ecosystem to connect and grow together.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
      <Script src="https://sdk.minepi.com/pi-sdk.js" strategy="beforeInteractive" />
      <Script id="pi-init" strategy="beforeInteractive">
        {`
          const Pi = window.Pi;
          Pi.init({ version: "2.0", sandbox: true });
        `}
      </Script>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <PiNetworkProvider>
            <AddressProvider>
              <LanguageProvider>
                <PageMetadataProvider>
                  <MobilePiWelcome />
                    <NavbarWithMobile />
                    <GlobalMobileElements />
                    <div className="flex min-h-screen flex-col">
                      <main className="flex-1 pb-safe-area-mobile">
                        {children}
                      </main>
                      <GlobalFooter />
                    </div>
                </PageMetadataProvider>
              </LanguageProvider>
            </AddressProvider>
          </PiNetworkProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

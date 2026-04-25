import type { Metadata } from "next";
import { Instrument_Serif, JetBrains_Mono } from "next/font/google";
import { AtmosphereBackground } from "@/components/site/atmosphere-background";
import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import { OnboardingOverlay } from "@/components/site/onboarding-overlay";
import { SettingsModal } from "@/components/site/settings-modal";
import "./globals.css";

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
});

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://devilsadvocate.app"),
  title: {
    default: "反方辩友 | Devil's Advocate",
    template: "%s | 反方辩友",
  },
  description: "让最锋利的反对声，替你做决定前的最后一道审视。",
  openGraph: {
    title: "反方辩友 | Devil's Advocate",
    description: "Your worst critic, for your best decisions.",
    images: ["/og-brand.svg"],
    siteName: "反方辩友",
    locale: "zh_CN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "反方辩友 | Devil's Advocate",
    description: "Your worst critic, for your best decisions.",
    images: ["/og-brand.svg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      className={`${instrumentSerif.variable} ${jetBrainsMono.variable} dark h-full antialiased`}
    >
      <body className="min-h-full bg-devil-bg text-devil-ivory">
        <AtmosphereBackground />
        <div className="relative z-10 flex min-h-screen flex-col">
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
        <SettingsModal />
        <OnboardingOverlay />
      </body>
    </html>
  );
}

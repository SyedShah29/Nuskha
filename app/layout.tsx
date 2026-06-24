import type { Metadata, Viewport } from "next";
import {
  Plus_Jakarta_Sans,
  Noto_Nastaliq_Urdu,
  Geist_Mono,
} from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

// Primary display + body font — Satoshi-class Grotesk
const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

// Monospace for ICD-11 codes, confidence numbers, SOAP data
const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

// Urdu script
const notoUrdu = Noto_Nastaliq_Urdu({
  variable: "--font-noto-urdu",
  subsets: ["arabic"],
  weight: ["400", "700"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#059669",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: "Nuskha | AI Clinical Assistant for Pakistan",
  description:
    "Pakistan's first multi-agent AI clinical assistant. Describe symptoms in Urdu or English — get a doctor-verified SOAP report with ICD-11 coding, FHIR export, and real-time emergency detection.",
  manifest: "/manifest.json",
  icons: {
    icon: "/logo/nuskha-favicon.svg",
    apple: "/logo/nuskha-logo.svg",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Nuskha",
  },
  openGraph: {
    title: "Nuskha | AI Clinical Assistant for Pakistan",
    description:
      "Multi-agent AI conducts bilingual clinical interviews, generates SOAP reports with ICD-11 codes, and connects you with PMDC-licensed doctors.",
    type: "website",
    locale: "ur_PK",
  },
  keywords: [
    "Nuskha", "نسخہ", "AI doctor Pakistan", "Urdu healthcare",
    "SOAP report AI", "ICD-11 Pakistan", "FHIR export", "telemedicine Pakistan",
    "clinical interview AI", "PHQ-9 Pakistan", "LangGraph medical",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(
        "antialiased",
        plusJakarta.variable,
        geistMono.variable,
        notoUrdu.variable
      )}
    >
      <body className="font-sans bg-[#F6F7F9] text-[#0F1117]">
        {children}
      </body>
    </html>
  );
}

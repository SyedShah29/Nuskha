import type { Metadata, Viewport } from "next";
import { Inter, Noto_Nastaliq_Urdu, Playfair_Display, Lora, Geist } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' });

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const notoUrdu = Noto_Nastaliq_Urdu({
  variable: "--font-noto-urdu",
  subsets: ["arabic"],
  weight: ["400", "700"],
});

export const viewport: Viewport = {
  themeColor: "#4f46e5",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: "Shifa | AI-Powered Healthcare",
  description:
    "Shifa provides AI-powered voice consultations, clinical interviews, and robust medical reporting.",
  manifest: "/manifest.json",
  icons: {
    icon: "/logo/shifa-favicon.svg",
    apple: "/logo/shifa-logo.svg",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Shifa",
  },
  openGraph: {
    title: "Shifa | AI-Powered Healthcare",
    description:
      "Shifa provides AI-powered clinical interviews and detailed diagnostic reports.",
    type: "website",
    locale: "en_US",
  },
  keywords: [
    "Shifa",
    "Shifa AI",
    "AI doctor",
    "clinical interview",
    "telemedicine",
    "AI healthcare",
    "Urdu healthcare",
    "Pakistani health tech",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <body
        className={`${inter.variable} ${notoUrdu.variable} ${playfair.variable} ${lora.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}

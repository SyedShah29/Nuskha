"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { TrustedBy } from "@/components/landing/TrustedBy";
import { About } from "@/components/landing/About";
import { TrustSafety } from "@/components/landing/TrustSafety";
import { CTASection } from "@/components/landing/CTASection";
import { Footer } from "@/components/landing/Footer";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      <TrustedBy />
      <Features />
      <About />
      <TrustSafety />
      <CTASection />
      <Footer />
    </main>
  );
}

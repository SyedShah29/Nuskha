import { Navbar } from "@/components/layout/Navbar";
import { Hero } from "@/components/landing/Hero";
import { FeatureBento } from "@/components/landing/FeatureBento";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { ComplianceWall } from "@/components/landing/ComplianceWall";
import { DualAudience } from "@/components/landing/DualAudience";
import { CTASection } from "@/components/landing/CTASection";
import { Footer } from "@/components/landing/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#F6F7F9] overflow-x-hidden selection:bg-[#059669]/20 selection:text-[#047857]">
      <Navbar />
      <Hero />
      <FeatureBento />
      <HowItWorks />
      <DualAudience />
      <ComplianceWall />
      <CTASection />
      <Footer />
    </main>
  );
}

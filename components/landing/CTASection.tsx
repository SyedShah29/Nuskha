"use client";

import { ArrowUpRight } from "@phosphor-icons/react";
import Link from "next/link";

export const CTASection = () => {
  return (
    <section className="py-32 bg-[#0F1117] relative overflow-hidden">
      {/* Background texture */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")' }} />

      <div className="container mx-auto px-4 md:px-6 relative z-10 text-center max-w-3xl">
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight mb-6">
          Ready to experience the future of care?
        </h2>
        <p className="text-[#9CA3AF] text-lg leading-relaxed mb-10 max-w-xl mx-auto">
          Start your free bilingual consultation now. Get a professional SOAP report and connect with PMDC-licensed doctors in minutes.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/signup">
            <button className="btn-primary">
              Start Free Consultation
              <span className="btn-icon-nest">
                <ArrowUpRight size={14} weight="bold" />
              </span>
            </button>
          </Link>
          <Link href="/doctor-signup">
            <button className="btn-ghost text-white border-white/20 hover:bg-white/5 hover:border-white/30">
              Apply as a Doctor
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
};

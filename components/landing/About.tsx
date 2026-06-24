"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export const About = () => {
  return (
    <section
      id="about"
      className="py-24 bg-[#f5f2eb] relative overflow-hidden"
    >
      {/* Subtle decorative element */}
      <div className="absolute top-1/2 right-0 w-[400px] h-[400px] bg-[#2d5016]/4 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

      <div className="container mx-auto px-6 md:px-8 max-w-7xl relative z-10">
        <div className="flex flex-col lg:flex-row items-start gap-16 lg:gap-20">

          {/* ── Left — Text ── */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7 }}
            className="flex-1 max-w-[440px] pt-4"
          >
            <div className="flex items-center gap-2 text-[10px] font-bold text-[#2d5016] uppercase tracking-widest mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#c4a96b]" />
              About Nuskha
            </div>

            <h2 className="text-4xl md:text-5xl text-[#1a2e1a] mb-5 leading-[1.15] tracking-tight">
              <span className="font-bold block">Empowering clinicians.</span>
              <span className="font-normal italic" style={{ fontFamily: "var(--font-lora), serif" }}>
                Elevating care.
              </span>
            </h2>

            <p className="text-base text-[#1a2e1a]/60 leading-relaxed mb-6">
              Nuskha (نسخہ) combines deep medical expertise with cutting-edge AI
              to support clinicians and patients in making smarter, faster, and
              more confident decisions. Our platform bridges the healthcare gap
              through intelligent bilingual clinical consultations.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-5 mb-8 py-6 border-y border-[#2d5016]/10">
              {[
                { value: "10K+", label: "Consultations" },
                { value: "96%", label: "Accuracy" },
                { value: "2", label: "Languages" },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="text-2xl font-bold text-[#1a2e1a]">{stat.value}</p>
                  <p className="text-xs text-[#1a2e1a]/40 font-medium mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>

            <Link href="/signup" id="about-learn-more-link">
              <button
                id="about-learn-more-btn"
                className="group flex items-center gap-2.5 text-[#1a2e1a] font-semibold hover:text-[#2d5016] transition-colors text-sm"
              >
                Learn more about us
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
          </motion.div>

          {/* ── Right — Photo + testimonial ── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8 }}
            className="flex-1 relative w-full"
          >
            {/* Main photo — using our hero image as placeholder */}
            <div className="relative rounded-3xl overflow-hidden aspect-[5/6] shadow-xl shadow-[#1a2e1a]/10 border border-[#2d5016]/10">
              <Image
                src="/images/hero_nuskha.png"
                alt="Nuskha AI healthcare team"
                fill
                className="object-cover object-center"
              />
              {/* Light overlay to maintain warmth */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#1a2e1a]/20 via-transparent to-transparent" />
            </div>

            {/* Testimonial card — floating bottom-left like Aafiya */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.7 }}
              className="absolute -bottom-6 -left-6 md:-left-10 bg-white rounded-2xl p-6 md:p-7 max-w-[300px] shadow-xl shadow-[#1a2e1a]/10 border border-[#2d5016]/8"
            >
              <p className="text-[#c4a96b] text-4xl font-serif leading-none mb-2">&ldquo;</p>
              <p className="text-[#1a2e1a]/75 italic text-sm leading-relaxed mb-4" style={{ fontFamily: "var(--font-lora), serif" }}>
                Nuskha has become an essential part of our decision-making process. It&apos;s like having an expert by our side, 24/7.
              </p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#2d5016] flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                  AK
                </div>
                <div>
                  <p className="text-sm font-bold text-[#1a2e1a]">Dr. Aisha Khan</p>
                  <p className="text-xs text-[#1a2e1a]/40">Chief of Internal Medicine</p>
                </div>
              </div>
            </motion.div>

            {/* Circular badge — top right like Aafiya */}
            <div className="absolute top-6 -right-4 w-20 h-20 rounded-full bg-white border border-[#2d5016]/12 shadow-md flex items-center justify-center">
              <div className="text-center">
                <p className="text-[8px] font-bold text-[#1a2e1a]/40 uppercase tracking-wider leading-tight">Responsible</p>
                <Sparkles className="w-4 h-4 text-[#c4a96b] mx-auto my-0.5" />
                <p className="text-[8px] font-bold text-[#1a2e1a]/40 uppercase tracking-wider leading-tight">AI</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

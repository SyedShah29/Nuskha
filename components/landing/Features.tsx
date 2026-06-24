"use client";

import { motion } from "framer-motion";
import {
  Brain, Shield, Mic, FileText, ArrowRight, Activity, Globe, Clock,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const features: {
  icon: LucideIcon;
  title: string;
  description: string;
  iconBg: string;
}[] = [
  {
    icon: Brain,
    title: "AI-Powered Insights",
    description: "Advanced models find what matters, faster — guided clinical interviews in Urdu and English.",
    iconBg: "#e8f0e0",
  },
  {
    icon: FileText,
    title: "Seamless Integration",
    description: "Built to fit into your existing workflows with FHIR export and ICD-11 coded SOAP reports.",
    iconBg: "#e8f0e0",
  },
  {
    icon: Shield,
    title: "Privacy & Security",
    description: "Enterprise-grade security for sensitive healthcare data. HIPAA compliant. AES-256 encrypted.",
    iconBg: "#e8f0e0",
  },
  {
    icon: Activity,
    title: "Better Outcomes",
    description: "Data-driven decisions that improve patient care and reduce diagnostic errors to near-zero.",
    iconBg: "#e8f0e0",
  },
  {
    icon: Mic,
    title: "Voice & Text in Urdu",
    description: "Speak naturally in Urdu or English. Our AI understands regional accents and cultural context.",
    iconBg: "#e8f0e0",
  },
  {
    icon: Globe,
    title: "Hospital Finder",
    description: "Locate nearby emergency hospitals and clinics in real-time across all of Pakistan.",
    iconBg: "#e8f0e0",
  },
  {
    icon: Clock,
    title: "24/7 Availability",
    description: "Access clinical-grade guidance any time, anywhere. No appointments needed.",
    iconBg: "#e8f0e0",
  },
  {
    icon: Brain,
    title: "Health Timeline",
    description: "Track symptoms and conditions over time with longitudinal AI-driven trend analysis.",
    iconBg: "#e8f0e0",
  },
];

export const Features = () => {
  return (
    <section
      id="features"
      className="py-24 bg-[#f5f2eb] relative overflow-hidden"
    >
      {/* Subtle top divider */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#2d5016]/15 to-transparent" />

      <div className="container mx-auto px-6 md:px-8 max-w-7xl relative z-10">

        {/* 4-column feature cards — exactly like Aafiya */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.slice(0, 4).map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: index * 0.08, duration: 0.5 }}
              className="group bg-white rounded-2xl p-6 border border-[#2d5016]/8 hover:border-[#2d5016]/20 hover:shadow-lg hover:shadow-[#2d5016]/6 transition-all duration-300"
            >
              {/* Icon — 3D style placeholder using image-like element */}
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-105"
                style={{ background: feature.iconBg }}
              >
                <feature.icon className="w-7 h-7 text-[#2d5016]" strokeWidth={1.5} />
              </div>

              <h3 className="text-base font-bold text-[#1a2e1a] mb-2 leading-snug">
                {feature.title}
              </h3>
              <p className="text-sm text-[#1a2e1a]/55 leading-relaxed mb-5">
                {feature.description}
              </p>

              {/* Arrow button — Aafiya style */}
              <div className="w-8 h-8 rounded-full border border-[#2d5016]/20 flex items-center justify-center group-hover:bg-[#1a2e1a] group-hover:border-[#1a2e1a] transition-all duration-300">
                <ArrowRight className="w-3.5 h-3.5 text-[#1a2e1a]/50 group-hover:text-white transition-colors" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Section header — below the 4 cards, above the rest */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center my-16"
        >
          <span className="inline-block px-3 py-1 bg-[#2d5016]/8 rounded-full text-[#2d5016] text-[11px] font-bold tracking-widest uppercase mb-4">
            Full Feature Set
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-[#1a2e1a] mb-3 tracking-tight">
            Everything you need for{" "}
            <span className="italic font-normal" style={{ fontFamily: "var(--font-lora), serif" }}>
              smart healthcare
            </span>
          </h2>
          <p className="text-[#1a2e1a]/55 text-base max-w-xl mx-auto">
            A comprehensive platform fusing AI intelligence with clinical workflows — purpose-built for Pakistan.
          </p>
        </motion.div>

        {/* Additional feature cards — 4 more */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.slice(4).map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: index * 0.08, duration: 0.5 }}
              className="group bg-white rounded-2xl p-6 border border-[#2d5016]/8 hover:border-[#2d5016]/20 hover:shadow-lg hover:shadow-[#2d5016]/6 transition-all duration-300"
            >
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-105"
                style={{ background: feature.iconBg }}
              >
                <feature.icon className="w-7 h-7 text-[#2d5016]" strokeWidth={1.5} />
              </div>
              <h3 className="text-base font-bold text-[#1a2e1a] mb-2 leading-snug">
                {feature.title}
              </h3>
              <p className="text-sm text-[#1a2e1a]/55 leading-relaxed mb-5">
                {feature.description}
              </p>
              <div className="w-8 h-8 rounded-full border border-[#2d5016]/20 flex items-center justify-center group-hover:bg-[#1a2e1a] group-hover:border-[#1a2e1a] transition-all duration-300">
                <ArrowRight className="w-3.5 h-3.5 text-[#1a2e1a]/50 group-hover:text-white transition-colors" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

"use client";

import { ShieldCheck, LockKey, FileCode, FirstAidKit, Translate, Graph } from "@phosphor-icons/react";
import { motion } from "framer-motion";

const stats = [
  {
    icon: Graph,
    value: "4",
    label: "Autonomous AI Agents",
    desc: "Orchestrated via LangGraph for interviewing, reasoning, documenting, and safety.",
  },
  {
    icon: ShieldCheck,
    value: "PHQ-9",
    label: "Mental Health Integration",
    desc: "Built-in clinical screening for depression and anxiety (GAD-7) during intake.",
  },
  {
    icon: FileCode,
    value: "FHIR R4",
    label: "Enterprise EMR Ready",
    desc: "One-click export of clinical sessions into raw JSON FHIR standard format.",
  },
  {
    icon: FirstAidKit,
    value: "6",
    label: "Emergency Protocols",
    desc: "Real-time safety halt connects directly to 1122, Edhi 115, and local trauma centers.",
  },
  {
    icon: LockKey,
    value: "AES-256",
    label: "HIPAA-Grade Security",
    desc: "End-to-end encryption for all session transcripts and generated SOAP reports.",
  },
  {
    icon: Translate,
    value: "ICD-11",
    label: "WHO Diagnostic Standard",
    desc: "Every condition is mapped to the latest International Classification of Diseases.",
  },
];

export const ComplianceWall = () => {
  return (
    <section className="py-32 bg-white border-b border-[rgba(15,17,23,0.04)] overflow-hidden">
      <style>{`
        .marquee-container:hover .animate-marquee {
          animation-play-state: paused !important;
        }
      `}</style>
      
      <div className="container mx-auto px-4 md:px-6 mb-20">
        
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#0F1117] tracking-tight mb-6">
            Medical-grade by default.
          </h2>
          <p className="text-[#6B7280] text-lg leading-relaxed max-w-2xl mx-auto">
            We do not compromise on clinical rigor. Nuskha integrates standard diagnostic tooling, ensuring every report is ready for professional medical review.
          </p>
        </motion.div>
      </div>

      {/* Infinite Marquee Section */}
      <div className="relative flex overflow-hidden w-full marquee-container py-4">
        {/* Fade masks for smooth entry/exit */}
        <div className="absolute left-0 top-0 bottom-0 w-16 md:w-48 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-16 md:w-48 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
        
        {/* Scrolling Track */}
        <div className="flex w-max animate-marquee gap-6 px-3">
          {/* We duplicate the array to ensure a seamless infinite loop */}
          {[...stats, ...stats].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div 
                key={i}
                className="flex flex-col w-[280px] md:w-[380px] shrink-0 p-8 border border-[rgba(15,17,23,0.06)] rounded-3xl bg-[#F6F7F9]/30 transition-all duration-300 cursor-pointer hover:bg-[#059669]/10 hover:border-[#059669] hover:shadow-[0_8px_32px_rgba(5,150,105,0.2)] hover:-translate-y-2 group"
              >
                <div className="flex items-center justify-between mb-8">
                  <div className="w-14 h-14 rounded-2xl bg-white border border-[rgba(15,17,23,0.08)] flex items-center justify-center shadow-sm group-hover:border-[#059669]/40 transition-colors">
                    <Icon size={28} weight="duotone" className="text-[#059669]" />
                  </div>
                  <span className="font-mono-data text-xl font-bold text-[#0F1117] tracking-tight bg-white px-4 py-1.5 rounded-lg shadow-sm border border-[rgba(15,17,23,0.04)] group-hover:border-[#059669]/40 group-hover:text-[#059669] transition-colors">
                    {stat.value}
                  </span>
                </div>
                <h3 className="font-bold text-xl text-[#0F1117] mb-3 group-hover:text-[#059669] transition-colors">{stat.label}</h3>
                <p className="text-[#6B7280] leading-relaxed group-hover:text-[#0F1117] transition-colors">
                  {stat.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
      
    </section>
  );
};

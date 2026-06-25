"use client";

import { motion } from "framer-motion";
import { Shield, Stethoscope, Target, Lock, Brain, Users } from "lucide-react";

const trustCards = [
  {
    icon: Shield,
    title: "HIPAA Compliant",
    description: "End-to-end AES-256 encryption and strict data privacy protocols protect every patient interaction.",
    detail: "SOC 2 Type II Certified",
    accent: "#2d5016",
  },
  {
    icon: Stethoscope,
    title: "Doctor Verified",
    description: "Every AI recommendation is reviewed and validated by PMDC-licensed medical professionals.",
    detail: "PMDC Licensed Physicians",
    accent: "#2d5016",
  },
  {
    icon: Target,
    title: "Zero False Negatives",
    description: "Our models are precision-calibrated to never miss critical symptoms or life-threatening conditions.",
    detail: "99.4% Sensitivity Rate",
    accent: "#2d5016",
  },
  {
    icon: Lock,
    title: "Data Sovereignty",
    description: "Your health data is stored in Pakistan, PTA compliant. Never sold, shared, or traded.",
    detail: "PTA Compliant Storage",
    accent: "#2d5016",
  },
  {
    icon: Brain,
    title: "Medically Trained AI",
    description: "Trained on MedQA, PubMedQA, and curated South Asian clinical datasets. Understands local context.",
    detail: "Multilingual Medical LLM",
    accent: "#2d5016",
  },
  {
    icon: Users,
    title: "Built With Trust",
    description: "Co-designed with doctors, patients, and ethicists. Regular third-party audits ensure responsible AI.",
    detail: "Ethics Board Reviewed",
    accent: "#2d5016",
  },
];

export const TrustSafety = () => {
  return (
    <section className="py-24 bg-white relative overflow-hidden">
      {/* Subtle Islamic arch pattern — like Nuskha reference */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%232d5016' stroke-width='1'%3E%3Cpath d='M40 8 L72 40 L40 72 L8 40 Z'/%3E%3Ccircle cx='40' cy='40' r='20'/%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: "80px 80px",
        }}
      />

      <div className="container mx-auto px-6 md:px-8 max-w-7xl relative z-10">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#c4a96b]" />
            <span className="text-[11px] font-bold text-[#2d5016] uppercase tracking-widest">
              Trust &amp; Safety
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#c4a96b]" />
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl text-[#1a2e1a] mb-4 tracking-tight">
            <span className="font-bold">Built With </span>
            <span className="font-normal italic" style={{ fontFamily: "var(--font-lora), serif" }}>
              Trust &amp; Safety
            </span>
          </h2>
          <p className="text-[#1a2e1a]/55 text-base max-w-xl mx-auto leading-relaxed">
            In medicine, there is no room for error. Every design decision at Nuskha
            is reviewed through the lens of patient safety and medical ethics.
          </p>
        </motion.div>

        {/* Stats strip */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-14"
        >
          {[
            { value: "99.4%", label: "Diagnostic Sensitivity" },
            { value: "<2 min", label: "Average Assessment Time" },
            { value: "10K+", label: "Verified Consultations" },
            { value: "50+", label: "Partner Physicians" },
          ].map((stat) => (
            <div key={stat.label} className="text-center py-5 px-4 rounded-2xl bg-[#f5f2eb] border border-[#2d5016]/8">
              <p className="text-xl font-bold text-[#1a2e1a] mb-1">{stat.value}</p>
              <p className="text-xs text-[#1a2e1a]/45 font-medium">{stat.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {trustCards.map((card, index) => {
            const CardIcon = card.icon;
            return (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.07, duration: 0.5 }}
                className="group bg-[#f5f2eb] rounded-2xl p-7 border border-[#2d5016]/8 hover:bg-white hover:border-[#2d5016]/20 hover:shadow-md hover:shadow-[#2d5016]/6 transition-all duration-400 relative overflow-hidden"
              >
                {/* Luminous slit on hover — top edge */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[2px] w-0 group-hover:w-2/3 transition-all duration-500 rounded-full bg-[#2d5016] opacity-0 group-hover:opacity-100" />

                <div className="w-12 h-12 rounded-xl bg-white border border-[#2d5016]/10 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform duration-300 shadow-sm">
                  <CardIcon className="w-5.5 h-5.5 text-[#2d5016]" strokeWidth={1.5} />
                </div>

                <h3 className="text-base font-bold text-[#1a2e1a] mb-2">{card.title}</h3>
                <p className="text-sm text-[#1a2e1a]/55 leading-relaxed mb-4">
                  {card.description}
                </p>

                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-[#2d5016] uppercase tracking-widest">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#c4a96b]" />
                  {card.detail}
                </span>
              </motion.div>
            );
          })}
        </div>

        {/* Disclaimer */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-xs text-[#1a2e1a]/30 mt-12 max-w-xl mx-auto"
        >
          Nuskha is an AI clinical assistant — not a replacement for professional medical advice. Always consult a qualified physician for diagnosis and treatment.
        </motion.p>
      </div>
    </section>
  );
};

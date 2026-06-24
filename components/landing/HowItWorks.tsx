"use client";

import { motion } from "framer-motion";
import { Mic, Database, FileSignature } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const steps: { id: number; title: string; description: string; icon: LucideIcon; gradient: string }[] = [
  {
    id: 1,
    title: "Adaptive Clinical Intake",
    description: "Initiate an autonomous conversation in Urdu or English. Our AI agent actively listens, parses symptom timelines, and asks targeted, medically-relevant follow-up questions to build a comprehensive subjective history.",
    icon: Mic,
    gradient: "bg-[var(--primary)] text-[var(--background)]",
  },
  {
    id: 2,
    title: "RAG-Powered Analysis",
    description: "The captured data is instantly cross-referenced against vast, verified medical datasets (MedQA, PubMedQA). The system filters for critical red flags and formulates differential diagnostic probabilities.",
    icon: Database,
    gradient: "bg-[var(--primary)] text-[var(--background)]",
  },
  {
    id: 3,
    title: "SOAP Report Generation",
    description: "A highly structured, professional SOAP (Subjective, Objective, Assessment, Plan) report is synthesized. This is immediately securely routed to the physician portal for final review and validation.",
    icon: FileSignature,
    gradient: "bg-[var(--primary)] text-[var(--background)]",
  },
];

export const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-32 bg-[var(--background)] relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(27,33,29,0.02),transparent_50%)]" />

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="text-center mb-24">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-[var(--primary)] font-serif italic text-sm mb-4 block"
          >
            Clinical Methodology
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-display text-4xl md:text-6xl tracking-wide text-[var(--primary)] mb-6"
          >
            THE ARCHITECTURE OF CARE
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-[var(--primary)]/70 max-w-3xl mx-auto font-serif leading-relaxed"
          >
            Shifa operates on a stringent three-phase autonomous protocol, ensuring that every patient interaction is medically rigorous, empathetic, and perfectly formatted for physician review.
          </motion.p>
        </div>

        <div className="steps-container relative max-w-6xl mx-auto">
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.3 }}
            className="hidden md:block absolute top-12 left-[15%] right-[15%] h-px bg-[var(--primary)]/20 origin-left"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16">
            {steps.map((step, index) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15, duration: 0.8 }}
                className="relative text-center"
              >
                <div className={`w-24 h-24 rounded-full ${step.gradient} flex items-center justify-center mx-auto mb-8 relative z-10 shadow-lg`}>
                  <step.icon className="w-8 h-8" strokeWidth={1.5} />
                </div>

                <div className="mb-4">
                  <span className="text-[var(--primary)]/30 font-display text-6xl font-bold">0{step.id}</span>
                </div>

                <h3 className="font-display text-xl text-[var(--primary)] mb-4">{step.title}</h3>
                <p className="text-[var(--primary)]/60 font-sans leading-relaxed text-sm max-w-sm mx-auto">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

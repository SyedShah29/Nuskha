"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { ChatCircleDots, Heartbeat, FileText } from "@phosphor-icons/react";

const steps = [
  {
    id: "01",
    title: "Adaptive Clinical Intake",
    desc: "Speak naturally in Urdu or English. The AI Interview Agent parses your symptom timeline and asks targeted, medically-relevant follow-up questions.",
    icon: ChatCircleDots,
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80"
  },
  {
    id: "02",
    title: "Multi-Agent RAG Analysis",
    desc: "Your data is passed to the Reasoning Agent, which cross-references PubMed citations and runs drug-interaction checks in real-time.",
    icon: Heartbeat,
    image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80"
  },
  {
    id: "03",
    title: "SOAP & Doctor Review",
    desc: "The Documentation Agent generates a formatted SOAP report with ICD-11 codes and routes it directly to a PMDC-licensed physician for final review.",
    icon: FileText,
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80"
  },
];

export const HowItWorks = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Track scroll progress of the entire timeline container
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"]
  });

  // Smooth out the scale value so it doesn't jump aggressively
  const scaleY = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <section id="how-it-works" className="py-32 bg-[#F6F7F9] relative overflow-hidden border-t border-[rgba(15,17,23,0.04)] border-b">
      <div className="container mx-auto px-4 md:px-6">
        
        {/* Header */}
        <div className="mb-24 text-center max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#0F1117] tracking-tight">
            The architecture of care.
          </h2>
        </div>

        {/* Vertical Alternating Timeline */}
        <div ref={containerRef} className="relative max-w-6xl mx-auto flex flex-col gap-24 md:gap-32">
          
          {/* Vertical Connecting Line (Scroll Linked) */}
          <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-[rgba(15,17,23,0.06)] transform md:-translate-x-1/2 hidden md:block">
            <motion.div 
              className="w-full bg-[#059669] origin-top h-full"
              style={{ scaleY }}
            />
          </div>

          {steps.map((step, i) => {
            const Icon = step.icon;
            const isEven = i % 2 !== 0;

            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, margin: "-20% 0px -20% 0px" }}
                transition={{ duration: 1.2, ease: "easeInOut" }}
                className={`flex flex-col ${isEven ? 'md:flex-row-reverse' : 'md:flex-row'} items-center gap-12 lg:gap-24 relative z-10 group`}
              >
                {/* Timeline Number Node (Desktop) */}
                <div className="absolute left-1/2 transform -translate-x-1/2 w-12 h-12 bg-white border border-[rgba(15,17,23,0.08)] rounded-full hidden md:flex items-center justify-center shadow-sm z-20 transition-transform duration-700 group-hover:scale-110">
                  <span className="font-mono-data font-bold text-[#059669]">{step.id}</span>
                </div>

                {/* Text Content */}
                <div className={`flex-1 w-full ${isEven ? 'md:text-left' : 'md:text-right'}`}>
                  <div className={`flex items-center gap-4 mb-6 ${isEven ? 'justify-start' : 'md:justify-end'}`}>
                    <span className="text-6xl font-display text-[#0F1117]/5 font-bold tracking-tighter leading-none md:hidden block">
                      {step.id}
                    </span>
                    <div className="w-12 h-12 rounded-xl border border-[rgba(15,17,23,0.08)] bg-white flex items-center justify-center shadow-sm">
                      <Icon size={24} weight="duotone" className="text-[#059669]" />
                    </div>
                  </div>
                  <h3 className="text-2xl lg:text-3xl font-bold text-[#0F1117] mb-4">{step.title}</h3>
                  <p className="text-[#6B7280] leading-relaxed text-lg max-w-md ${isEven ? 'mr-auto' : 'ml-auto md:mr-0'}">
                    {step.desc}
                  </p>
                </div>

                {/* Image Card */}
                <div className="flex-1 w-full">
                  <div className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden bento-dark shadow-xl cursor-crosshair">
                    <div className="absolute inset-0 z-0 pointer-events-none">
                      <img 
                        src={step.image} 
                        alt={step.title} 
                        className="w-full h-full object-cover object-center transition-transform duration-1000 group-hover:scale-105" 
                      />
                    </div>
                  </div>
                </div>

              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { User, Stethoscope, ArrowRight } from "@phosphor-icons/react";
import Link from "next/link";

export const DualAudience = () => {
  return (
    <section id="patients" className="py-24 bg-[#F6F7F9]">
      <div className="container mx-auto px-4 md:px-6">
        
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-[#0F1117] tracking-tight mb-4">
            One platform. Two distinct experiences.
          </h2>
          <p className="text-[#6B7280] leading-relaxed">
            Nuskha bridges the gap between patient symptoms and clinical documentation, providing specialized portals for both.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 max-w-5xl mx-auto">
          
          {/* Patient Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bento-dark p-0 flex flex-col h-[500px] group relative overflow-hidden shadow-lg"
          >
            {/* Background Image */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1618498082410-b4aa22193b38?auto=format&fit=crop&q=80" 
                alt="Patient Portal" 
                className="w-full h-full object-cover object-left opacity-40 transition-transform duration-1000 group-hover:scale-110" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0F1117] via-[#0F1117]/80 to-[#0F1117]/20" />
            </div>
            
            <div className="relative z-10 p-8 lg:p-10 flex flex-col h-full transition-transform duration-500 group-hover:-translate-y-2">
              <div className="w-12 h-12 rounded-xl bg-black/40 backdrop-blur-md flex items-center justify-center mb-6 border border-white/20 shadow-lg">
                <User size={24} weight="duotone" className="text-white" />
              </div>
              
              <h3 className="text-2xl font-bold text-white mb-3">For Patients</h3>
              <p className="text-white/80 leading-relaxed mb-8 max-w-sm">
                Speak your symptoms in Urdu or English. Get instant triage, track your health longitudinal timeline, and receive doctor-verified SOAP reports you can understand.
              </p>
              
              <ul className="flex flex-col gap-3 mb-10 mt-auto">
                {['Bilingual Voice STT', 'Real-time Emergency Maps', 'Mental Health Screening', 'Longitudinal Timeline'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-white font-medium">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#059669]" />
                    {item}
                  </li>
                ))}
              </ul>
              
              <Link href="/signup" className="mt-auto inline-block">
                <button className="flex items-center gap-2 text-sm font-bold text-[#059669] group-hover:text-[#34D399] transition-colors">
                  Open Patient Portal
                  <ArrowRight size={16} weight="bold" className="transition-transform group-hover:translate-x-1" />
                </button>
              </Link>
            </div>
          </motion.div>

          {/* Doctor Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="bento-dark p-0 flex flex-col h-[500px] group relative overflow-hidden shadow-lg"
          >
            {/* Background Image */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1530497610245-94d3c16cda28?auto=format&fit=crop&q=80" 
                alt="Doctor Dashboard" 
                className="w-full h-full object-cover object-right opacity-40 transition-transform duration-1000 group-hover:scale-110" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0F1117] via-[#0F1117]/80 to-[#0F1117]/20" />
            </div>

            <div className="relative z-10 p-8 lg:p-10 flex flex-col h-full transition-transform duration-500 group-hover:-translate-y-2">
              <div className="w-12 h-12 rounded-xl bg-black/40 backdrop-blur-md flex items-center justify-center mb-6 border border-white/20 shadow-lg">
                <Stethoscope size={24} weight="duotone" className="text-white" />
              </div>
              
              <h3 id="doctors" className="text-2xl font-bold text-white mb-3">For Doctors</h3>
              <p className="text-white/80 leading-relaxed mb-8 max-w-sm">
                Stop typing clinical notes. Review highly-accurate, AI-generated SOAP reports with built-in ICD-11 coding, drug interactions, and PubMed citations.
              </p>
              
              <ul className="flex flex-col gap-3 mb-10 mt-auto">
                {['Auto-ICD-11 Coding', 'FHIR R4 JSON Export', 'PubMed RAG Citations', 'Drug Interaction Checker'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-white font-medium">
                    <div className="w-1.5 h-1.5 rounded-full bg-white/50" />
                    {item}
                  </li>
                ))}
              </ul>
              
              <Link href="/signup" className="mt-auto inline-block">
                <button className="flex items-center gap-2 text-sm font-bold text-white opacity-90 group-hover:opacity-100 transition-opacity">
                  Apply for Doctor Portal
                  <ArrowRight size={16} weight="bold" className="transition-transform group-hover:translate-x-1" />
                </button>
              </Link>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

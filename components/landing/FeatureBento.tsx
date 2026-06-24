"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Brain, MicrophoneStage, MapPin, Database, FileCode } from "@phosphor-icons/react";

export const FeatureBento = () => {
  return (
    <section id="features" className="py-24 bg-white relative">
      <div className="container mx-auto px-4 md:px-6">
        
        {/* Header */}
        <div className="mb-16 max-w-2xl">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#0F1117] tracking-tight mb-4">
            Built for clinical rigor.
          </h2>
          <p className="text-[#6B7280] text-lg leading-relaxed">
            Nuskha is not just a chatbot. It is a multi-agent orchestration system directly connected to WHO ICD-11 standards, FHIR export, and live emergency routing.
          </p>
        </div>


        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6 auto-rows-[300px]">
          
          {/* Cell 1: Multi-Agent */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bento-dark col-span-1 md:col-span-4 lg:col-span-4 lg:row-span-2 p-0 relative flex flex-col justify-end group overflow-hidden"
          >
            <div className="absolute inset-0 z-0 pointer-events-none">
              <Image src="/images/mockups/bento_agents_1782320083562.png" alt="4-Agent Architecture" fill className="object-cover object-center blur-[2px] transition-all duration-700 group-hover:scale-105 group-hover:blur-none" />
            </div>
            
            <div className="relative z-10 p-8 h-full flex flex-col justify-between drop-shadow-lg transition-opacity duration-500 group-hover:opacity-0">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-lg">
                  <Brain size={24} weight="duotone" className="text-white" />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-2 transition-colors drop-shadow-md">4-Agent Autonomous Architecture</h3>
                <p className="text-white/90 text-sm leading-relaxed max-w-lg font-medium drop-shadow-md">
                  Every session triggers specialized agents: an Interviewer parses symptoms, a Reasoner checks interactions, a Documenter formats SOAP, and a Safety agent monitors for red flags in real-time.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Cell 2: Emergency Routing */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="bento-dark col-span-1 md:col-span-2 lg:col-span-2 p-0 flex flex-col justify-end relative overflow-hidden group"
          >
            <div className="absolute inset-0 z-0 pointer-events-none">
              <Image src="/images/mockups/bento_map_1782320094692.png" alt="Emergency Map" fill className="object-cover object-center blur-[2px] transition-all duration-700 group-hover:scale-105 group-hover:blur-none" />
            </div>
            <div className="relative z-10 p-6 pt-24 h-full flex flex-col justify-between drop-shadow-lg transition-opacity duration-500 group-hover:opacity-0">
              <div className="w-10 h-10 rounded-lg bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-lg">
                <MapPin size={20} weight="fill" className="text-white" />
              </div>
              <div className="mt-auto">
                <h3 className="text-lg font-bold text-white mb-1 drop-shadow-md">Live Emergency Map</h3>
                <p className="text-sm text-white/90 font-medium leading-relaxed mb-4 drop-shadow-md">
                  Instantly pings OpenStreetMap Overpass API for the 5 nearest trauma centers if critical red flags are detected.
                </p>
                <div className="flex gap-2">
                  <span className="text-[10px] font-bold px-2 py-1 bg-black/40 backdrop-blur-md rounded-md text-white border border-white/20 shadow-lg">Call 1122</span>
                  <span className="text-[10px] font-bold px-2 py-1 bg-black/40 backdrop-blur-md rounded-md text-white border border-white/20 shadow-lg">Call 115</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Cell 3: Voice Input */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="bento-dark col-span-1 md:col-span-2 lg:col-span-2 p-0 flex flex-col justify-end relative overflow-hidden group"
          >
            <div className="absolute inset-0 z-0 pointer-events-none">
              <Image src="/images/mockups/bento_voice_1782320105123.png" alt="Voice AI" fill className="object-cover object-center blur-[2px] transition-all duration-700 group-hover:scale-105 group-hover:blur-none" />
            </div>
            <div className="relative z-10 p-6 pt-24 h-full flex flex-col justify-between drop-shadow-lg transition-opacity duration-500 group-hover:opacity-0">
              <div className="w-10 h-10 rounded-lg bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-lg">
                <MicrophoneStage size={20} weight="duotone" className="text-white" />
              </div>
              <div className="mt-auto">
                <h3 className="text-lg font-bold text-white mb-1 drop-shadow-md">Urdu Voice STT/TTS</h3>
                <p className="text-sm text-white/90 font-medium leading-relaxed drop-shadow-md">
                  Native bilingual voice recognition allows patients from any demographic to describe symptoms naturally.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Cell 4: FHIR Export */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="bento-dark col-span-1 md:col-span-2 lg:col-span-3 p-0 flex flex-col justify-end relative overflow-hidden group"
          >
            <div className="absolute inset-0 z-0 pointer-events-none">
              <Image src="/images/mockups/bento_fhir_1782320115903.png" alt="FHIR JSON" fill className="object-cover object-center blur-[2px] transition-all duration-700 group-hover:scale-105 group-hover:blur-none" />
            </div>
            <div className="relative z-10 p-6 h-full flex flex-col justify-between w-full md:w-[70%] drop-shadow-lg transition-opacity duration-500 group-hover:opacity-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-lg">
                  <FileCode size={20} weight="duotone" className="text-white" />
                </div>
                <span className="font-mono-data text-xs text-white font-bold bg-black/40 backdrop-blur-md px-2 py-1 rounded shadow-lg border border-white/20">HL7 FHIR R4</span>
              </div>
              <div className="mt-auto">
                <h3 className="text-lg font-bold text-white mb-1 drop-shadow-md">Enterprise Export</h3>
                <p className="text-sm text-white/90 font-medium leading-relaxed drop-shadow-md">
                  One-click export of clinical sessions into raw JSON FHIR R4 standard, ready for any modern hospital EMR system.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Cell 5: ICD-11 Auto-coding */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="bento-dark col-span-1 md:col-span-2 lg:col-span-3 p-0 flex flex-col justify-end relative overflow-hidden group"
          >
            <div className="absolute inset-0 z-0 pointer-events-none">
              <Image src="/images/mockups/bento_icd_1782320126990.png" alt="ICD-11 Coding" fill className="object-cover object-center blur-[2px] transition-all duration-700 group-hover:scale-105 group-hover:blur-none" />
            </div>
            <div className="relative z-10 p-6 h-full flex flex-col justify-between w-full drop-shadow-lg transition-opacity duration-500 group-hover:opacity-0">
              <div className="w-10 h-10 rounded-lg bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-lg">
                <Database size={20} weight="duotone" className="text-white" />
              </div>
              <div className="mt-auto md:w-3/4">
                <h3 className="text-lg font-bold text-white mb-1 drop-shadow-md">WHO ICD-11 Auto-coding</h3>
                <p className="text-sm text-white/90 font-medium leading-relaxed drop-shadow-md">
                  Every diagnosis in the SOAP report is automatically mapped to the latest WHO ICD-11 terminology.
                </p>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

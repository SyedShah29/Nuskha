"use client";

import { motion } from "framer-motion";
import { Shield, Stethoscope, Target } from "lucide-react";

const trustItems = [
  {
    icon: Shield,
    title: "HIPAA Compliant",
    description:
      "End-to-end encryption and strict data privacy protocols protect every patient interaction.",
    gradient: "from-indigo-500 to-purple-500",
  },
  {
    icon: Stethoscope,
    title: "Doctor Verified",
    description:
      "Every AI recommendation is reviewed and validated by licensed medical professionals.",
    gradient: "from-cyan-500 to-blue-500",
  },
  {
    icon: Target,
    title: "Zero False Negatives",
    description:
      "Our models are calibrated to never miss critical symptoms or life-threatening conditions.",
    gradient: "from-emerald-500 to-teal-500",
  },
];

export const TrustSafety = () => {
  return (
    <section className="py-24 bg-gradient-to-br from-gray-900 via-indigo-950 to-purple-950 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('/images/noise.png')] bg-blend-overlay opacity-[0.03]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/10 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 md:px-6 max-w-7xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 bg-white/10 rounded-full text-white/80 text-xs font-bold tracking-widest uppercase mb-4">
            Trust & Safety
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
            Your health,{" "}
            <span className="bg-gradient-to-r from-cyan-300 to-purple-300 bg-clip-text text-transparent">
              our promise
            </span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {trustItems.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              className="glass-card-dark p-8 text-center hover:bg-white/10 transition-all duration-300 group"
            >
              <div
                className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${item.gradient} flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform`}
              >
                <item.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
              <p className="text-white/50 text-sm leading-relaxed">
                {item.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

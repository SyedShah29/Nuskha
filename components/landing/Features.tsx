"use client";

import { motion } from "framer-motion";
import {
  Brain,
  Shield,
  Mic,
  FileText,
  ArrowRight,
  Activity,
  Globe,
  Clock,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const features: {
  icon: LucideIcon;
  title: string;
  description: string;
  gradient: string;
}[] = [
  {
    icon: Brain,
    title: "AI Clinical Assessment",
    description:
      "Multi-agent AI system conducts guided interviews, identifies symptoms, and generates comprehensive SOAP reports.",
    gradient: "from-indigo-500 to-purple-500",
  },
  {
    icon: Mic,
    title: "Voice & Text in Urdu",
    description:
      "Communicate naturally in Urdu or English. Our AI understands your language and responds with empathy.",
    gradient: "from-cyan-500 to-blue-500",
  },
  {
    icon: Shield,
    title: "Privacy First",
    description:
      "Enterprise-grade security with HIPAA compliance. Your health data is encrypted and never shared.",
    gradient: "from-emerald-500 to-teal-500",
  },
  {
    icon: FileText,
    title: "SOAP Reports & FHIR",
    description:
      "Auto-generated clinical reports in standard SOAP format with ICD-11 coding and FHIR export.",
    gradient: "from-orange-500 to-pink-500",
  },
  {
    icon: Activity,
    title: "Health Timeline",
    description:
      "Track your symptoms and conditions over time. Visualize your health journey with longitudinal data.",
    gradient: "from-violet-500 to-indigo-500",
  },
  {
    icon: Globe,
    title: "Hospital Finder",
    description:
      "Locate nearby emergency hospitals and clinics in real-time using geolocation and OpenStreetMap data.",
    gradient: "from-rose-500 to-red-500",
  },
  {
    icon: Clock,
    title: "24/7 Availability",
    description:
      "Access healthcare guidance anytime, anywhere. No appointments needed for initial assessment.",
    gradient: "from-amber-500 to-orange-500",
  },
];

export const Features = () => {
  return (
    <section className="py-24 bg-gradient-to-b from-indigo-600 via-purple-600 to-cyan-500 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('/images/noise.png')] bg-blend-overlay opacity-[0.04]" />

      <div className="container mx-auto px-4 md:px-6 max-w-7xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 bg-white/10 rounded-full text-white/80 text-xs font-bold tracking-widest uppercase mb-4">
            Features
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Everything you need for{" "}
            <span className="bg-gradient-to-r from-cyan-300 to-purple-300 bg-clip-text text-transparent">
              smart healthcare
            </span>
          </h2>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            A comprehensive platform that combines AI intelligence with clinical
            workflows to deliver better health outcomes.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: index * 0.08, duration: 0.5 }}
              className="group glass-card-dark p-6 hover:bg-white/10 transition-all duration-300 hover:-translate-y-1"
            >
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}
              >
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-white/50 text-sm leading-relaxed mb-4">
                {feature.description}
              </p>
              <div className="flex items-center gap-2 text-white/30 group-hover:text-white/60 transition-colors text-sm font-medium">
                Learn more
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

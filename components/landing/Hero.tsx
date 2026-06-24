"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Play, Sparkles, Shield, Heart, Zap } from "lucide-react";

export const Hero = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-cyan-500"
    >
      <div className="absolute inset-0 bg-[url('/images/noise.png')] bg-blend-overlay opacity-[0.04]" />

      <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-purple-400/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-[900px] h-[900px] bg-cyan-400/15 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-400/10 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 md:px-6 relative z-10 flex flex-col lg:flex-row items-center pt-32 pb-16 gap-12 lg:gap-16">
        <motion.div
          style={{ y, opacity }}
          className="flex-1 flex flex-col items-start text-left max-w-2xl"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-xs font-bold tracking-widest uppercase mb-8"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
            AI-Powered Healthcare
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-[1.1] tracking-tight"
          >
            Your Health,{" "}
            <span className="bg-gradient-to-r from-cyan-300 to-purple-300 bg-clip-text text-transparent">
              Reimagined
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-lg md:text-xl text-white/70 leading-relaxed mb-8 max-w-xl"
          >
            Consult with our AI health assistant in{" "}
            <strong className="text-white">Urdu</strong> or{" "}
            <strong className="text-white">English</strong>. Describe your symptoms
            through voice or text, receive a guided clinical assessment, and get
            connected with verified doctors.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
          >
            <Link href="/signup">
              <button className="group flex items-center gap-3 bg-white text-indigo-600 font-bold px-8 py-4 rounded-2xl shadow-xl shadow-indigo-500/20 hover:shadow-2xl hover:shadow-indigo-500/30 transition-all hover:-translate-y-1 text-sm">
                Get Started Free
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>

            <Link href="/login">
              <button className="flex items-center gap-3 text-white/80 font-semibold hover:text-white transition-colors group px-6 py-4">
                <div className="w-10 h-10 rounded-full border-2 border-white/30 flex items-center justify-center group-hover:border-white/60 group-hover:bg-white/10 transition-all">
                  <Play className="w-4 h-4 text-white ml-0.5" />
                </div>
                Watch Demo
              </button>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex items-center gap-8 mt-12"
          >
            {[
              { icon: Shield, label: "HIPAA Compliant" },
              { icon: Heart, label: "24/7 Available" },
              { icon: Zap, label: "Instant Results" },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-2 text-white/50 text-xs font-medium"
              >
                <item.icon className="w-3.5 h-3.5" />
                {item.label}
              </div>
            ))}
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="flex-1 relative w-full max-w-lg aspect-square flex items-center justify-center"
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-80 h-80 bg-gradient-to-r from-purple-400/30 to-cyan-400/30 rounded-full blur-3xl animate-pulse" />
          </div>

          <motion.div
            animate={{ y: [-8, 8, -8] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-8 left-0 glass-card p-5 w-52 shadow-2xl shadow-purple-500/10"
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Risk Assessment
                </p>
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-800 mb-1">62%</p>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="w-[62%] h-full bg-gradient-to-r from-orange-400 to-pink-500 rounded-full" />
            </div>
            <p className="text-[10px] text-gray-400 mt-2">High confidence</p>
          </motion.div>

          <motion.div
            animate={{ y: [6, -6, 6] }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5,
            }}
            className="absolute top-0 right-0 glass-card p-5 w-56 shadow-2xl shadow-cyan-500/10"
          >
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">
              Patient Summary
            </p>
            <div className="flex flex-col gap-2.5">
              {["Medical History", "Lab Results", "Imaging", "Medications"].map(
                (item) => (
                  <div key={item} className="flex items-center gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-indigo-400 to-cyan-400 flex items-center justify-center">
                      <svg
                        viewBox="0 0 24 24"
                        className="w-3 h-3 stroke-white fill-none stroke-[3]"
                      >
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                    </div>
                    <span className="text-xs font-medium text-gray-600">
                      {item}
                    </span>
                  </div>
                )
              )}
            </div>
          </motion.div>

          <motion.div
            animate={{ y: [-5, 5, -5] }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1,
            }}
            className="absolute bottom-16 right-0 glass-card p-5 w-60 shadow-2xl shadow-indigo-500/10"
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                AI Insight
              </p>
            </div>
            <p className="text-sm text-gray-700 leading-snug">
              Consider follow-up imaging in 3-6 months for monitoring.
            </p>
          </motion.div>

          <motion.div
            animate={{ y: [4, -4, 4] }}
            transition={{
              duration: 7,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1.5,
            }}
            className="absolute bottom-8 left-4 glass-card p-4 w-48 shadow-2xl shadow-green-500/10"
          >
            <div className="flex justify-between items-center mb-2">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Confidence
              </p>
              <p className="text-sm font-bold text-green-600">92%</p>
            </div>
            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="w-[92%] h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full" />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

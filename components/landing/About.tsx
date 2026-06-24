"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

export const About = () => {
  return (
    <section className="py-24 bg-white relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-cyan-50 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

      <div className="container mx-auto px-4 md:px-6 max-w-7xl relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="flex-1 max-w-xl"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-bold tracking-widest uppercase mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              About Shifa
            </div>

            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-[1.15] tracking-tight">
              Empowering clinicians.{" "}
              <span className="bg-gradient-to-r from-indigo-500 to-cyan-500 bg-clip-text text-transparent">
                Elevating care.
              </span>
            </h2>

            <p className="text-lg text-gray-600 leading-relaxed mb-8">
              Shifa combines deep medical expertise with cutting-edge AI to
              support clinicians in making smarter, faster, and more confident
              decisions. Our platform bridges the healthcare gap through
              intelligent clinical consultations.
            </p>

            <div className="grid grid-cols-3 gap-6 mb-8">
              {[
                { value: "10K+", label: "Consultations" },
                { value: "95%", label: "Accuracy" },
                { value: "4", label: "Languages" },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="text-3xl font-bold bg-gradient-to-r from-indigo-500 to-cyan-500 bg-clip-text text-transparent">
                    {stat.value}
                  </p>
                  <p className="text-sm text-gray-400 font-medium">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>

            <Link href="/signup">
              <button className="flex items-center gap-3 px-6 py-3 rounded-xl border-2 border-gray-200 text-gray-700 font-semibold hover:border-indigo-500 hover:text-indigo-600 transition-all group">
                Learn more about us
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1 }}
            className="flex-1 relative w-full"
          >
            <div className="relative rounded-3xl overflow-hidden aspect-[4/5] shadow-2xl shadow-indigo-500/10">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-purple-500 to-cyan-500" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white p-8">
                  <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
                    <Sparkles className="w-10 h-10" />
                  </div>
                  <p className="text-2xl font-bold mb-2">AI-Powered</p>
                  <p className="text-white/70">Clinical Intelligence</p>
                </div>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="absolute -bottom-8 -left-4 md:-left-12 glass-card p-6 md:p-8 max-w-[320px] shadow-2xl"
            >
              <p className="text-indigo-500 text-4xl font-serif leading-none mb-2">
                &ldquo;
              </p>
              <p className="text-gray-700 italic text-lg leading-relaxed mb-4">
                Shifa has become essential in our decision-making process.
                It&apos;s like having an expert by our side, 24/7.
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-cyan-400 flex items-center justify-center text-white font-bold text-sm">
                  SM
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-800">
                    Dr. Sarah Malik
                  </p>
                  <p className="text-xs text-gray-500">
                    Chief of Internal Medicine
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

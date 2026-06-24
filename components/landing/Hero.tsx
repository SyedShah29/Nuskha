"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "@phosphor-icons/react";
import { useState, useEffect } from "react";

const mockupImages = [
  "/images/mockups/hero_mockup_1_1782319178329.png",
  "/images/mockups/hero_mockup_2_1782319190535.png",
  "/images/mockups/hero_mockup_soap_1782319652847.png",
  "/images/mockups/hero_mockup_4_1782319211987.png",
  "/images/mockups/hero_mockup_5_1782319223850.png",
];

export const Hero = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % mockupImages.length);
    }, 14000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden min-h-[100dvh] flex items-center">
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left: Typography & CTAs */}
          <div className="lg:col-span-6 flex flex-col items-start text-left">
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="text-[clamp(2.5rem,5vw,4.5rem)] font-bold text-[#0F1117] leading-[1.05] tracking-tight mb-6"
            >
              Clinical intelligence, <br className="hidden md:block" />
              fluent in <span className="text-emerald-gradient"><span className="font-urdu">اردو</span> & English.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="text-[#059669] text-xl md:text-2xl font-urdu mb-3"
            >
              اپنی صحت کے مسائل اپنی زبان میں بیان کریں
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="text-[#6B7280] text-lg md:text-xl max-w-[500px] leading-relaxed mb-10"
            >
              Describe your symptoms naturally. Our AI orchestrates a live clinical interview, generates a doctor-verified SOAP report, and connects you to care.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-wrap items-center gap-5"
            >
              <Link href="/signup">
                <button className="relative flex items-center h-[3.25rem] pl-6 pr-[3.75rem] text-base font-bold text-white bg-[#059669] rounded-full overflow-hidden group shadow-[inset_0_0_1.5rem_-0.4rem_#047857] transition-all">
                  <span className="relative z-10 group-hover:text-[#059669] transition-colors duration-300">Start Free Consultation</span>
                  <div className="absolute right-1.5 flex items-center w-10 h-10 bg-white rounded-full shadow-[0.1rem_0.1rem_0.5rem_0.1rem_rgba(5,150,105,0.3)] transition-all duration-300 group-hover:w-[calc(100%-0.75rem)] z-0">
                    <ArrowUpRight size={18} weight="bold" className="absolute right-[11px] text-[#059669]" />
                  </div>
                </button>
              </Link>
            </motion.div>
          </div>

          {/* Right: SOAP Report Mockup & Floating Elements */}
          <div className="lg:col-span-6 relative perspective-1000 w-full max-w-[600px] mx-auto lg:ml-auto">
            <motion.div
              initial={{ opacity: 0, x: 40, rotateY: 10 }}
              animate={{ opacity: 1, x: 0, rotateY: 0 }}
              transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full aspect-[4/3]"
            >
              {/* The "Double Bezel" outer shell from high-end-visual-design */}
              <div className="bezel-outer w-full h-full absolute inset-0 shadow-2xl shadow-[#0F1117]/5 rotate-2 hover:rotate-0 transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]">
                <div className="relative w-full h-full bg-white shadow-sm overflow-hidden">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentImageIndex}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 2.5, ease: "easeInOut" }}
                      className="absolute inset-0 w-full h-full"
                    >
                      <Image
                        src={mockupImages[currentImageIndex]}
                        alt={`AI Clinical Dashboard View ${currentImageIndex + 1}`}
                        fill
                        className="object-cover object-center"
                        priority
                      />
                    </motion.div>
                  </AnimatePresence>
              {/* Subtle gradient overlay at bottom to blend image if needed */}
              <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent" />
            </div>
          </div>
        </motion.div>
      </div>

        </div>
      </div>
    </section>
  );
};

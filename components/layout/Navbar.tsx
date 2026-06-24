"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, X, List } from "@phosphor-icons/react";

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "For Patients", href: "#patients" },
  { label: "For Doctors", href: "#doctors" },
];

export const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  
  // Uiverse.io SVG Animation State
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isContainerHovered, setIsContainerHovered] = useState(false);
  const [rectStyle, setRectStyle] = useState({ strokeDashoffset: 5, strokeDasharray: "0 0 10 40 10 40" });
  
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Dynamic SVG Stroke Calculation
  useEffect(() => {
    if (!isContainerHovered) {
      setRectStyle({ strokeDashoffset: 5, strokeDasharray: "0 0 10 40 10 40" });
      return;
    }
    if (hoveredIndex === null) return;

    const container = containerRef.current;
    const btn = buttonRefs.current[hoveredIndex];
    if (!container || !btn) return;

    const W = container.offsetWidth;
    const H = container.offsetHeight;
    const P = 2 * (W + H);

    const x = btn.offsetLeft;
    const w = btn.offsetWidth;

    const topStartPct = (x / P) * 100;
    const topDashPct = (w / P) * 100;
    
    const bottomStart = W + H + (W - (x + w));
    const gapBetween = (bottomStart - (x + w)) / P * 100;
    const bottomDashPct = (w / P) * 100;
    
    const restGap = 100 - (topStartPct + topDashPct + gapBetween + bottomDashPct);

    setRectStyle({
      strokeDashoffset: 0,
      strokeDasharray: `0 ${topStartPct} ${topDashPct} ${gapBetween} ${bottomDashPct} ${restGap}`
    });
  }, [hoveredIndex, isContainerHovered]);

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 flex justify-center transition-[padding] duration-500 ease-out ${scrolled ? "px-4 pt-4" : "px-0 pt-0"}`}>
        <motion.nav
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className={`
            flex items-center justify-between gap-8
            w-full transition-all duration-500 ease-out
            ${scrolled
              ? "max-w-5xl px-4 py-3 rounded-[2rem] bg-white/40 backdrop-blur-2xl border border-white/20 shadow-[0_8px_32px_rgba(15,17,23,0.06)]"
              : "max-w-full px-6 md:px-12 py-5 rounded-none bg-white/0 backdrop-blur-none border border-transparent shadow-none"
            }
          `}
        >
          {/* Logo */}
          <Link href="/" id="nav-logo" className="flex items-center gap-2.5 flex-shrink-0 group">
            <div className="relative w-10 h-10 rounded-[0.85rem] overflow-hidden flex-shrink-0 shadow-sm transition-transform duration-500 ease-out group-hover:scale-105 group-hover:shadow-md border border-[rgba(15,17,23,0.06)]">
              <Image 
                src="/images/nuskha_logo.png" 
                alt="Nuskha App Logo" 
                fill 
                className="object-cover"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-bold text-[#0F1117] tracking-tight leading-none">Nuskha</span>
              <span className="text-xl text-[#059669] font-urdu leading-none relative top-[1px] opacity-90">نسخہ</span>
            </div>
          </Link>

          {/* Desktop links with Uiverse SVG outline effect */}
          <div 
            className="hidden md:flex items-center relative px-1 py-1 rounded-[1rem]"
            ref={containerRef}
            onMouseEnter={() => setIsContainerHovered(true)}
            onMouseLeave={() => {
              setIsContainerHovered(false);
              setHoveredIndex(null);
            }}
          >
            {navLinks.map((link, i) => (
              <Link
                key={link.label}
                href={link.href}
                ref={(el) => {
                  buttonRefs.current[i] = el;
                }}
                onMouseEnter={() => setHoveredIndex(i)}
                className="px-4 py-2 text-sm text-[#6B7280] hover:text-[#059669] hover:bg-[#059669]/5 rounded-[0.75rem] font-medium transition-colors z-10 relative"
              >
                {link.label}
              </Link>
            ))}
            <svg 
              className="absolute inset-0 w-full h-full pointer-events-none" 
              overflow="visible"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect 
                pathLength="100"
                x="0" y="0" width="100%" height="100%" 
                fill="transparent" 
                stroke="#059669" 
                strokeWidth="1.5"
                rx="16"
                strokeDashoffset={rectStyle.strokeDashoffset}
                strokeDasharray={rectStyle.strokeDasharray}
                className="transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
              />
            </svg>
          </div>

          {/* Right CTAs */}
          <div className="flex items-center gap-3">
            <Link href="/login" id="nav-signin" className="hidden sm:inline-flex items-center justify-center px-5 py-[0.4rem] text-sm font-bold text-[#0F1117] border-2 border-[#0F1117] rounded-full relative overflow-hidden group z-10 transition-colors duration-300 hover:text-white">
              <span className="relative z-10">Sign in</span>
              <div className="absolute inset-0 w-full h-full bg-[#0F1117] -translate-x-full transition-transform duration-300 ease-out group-hover:translate-x-0 -z-10" />
            </Link>
            
            <Link href="/signup" id="nav-cta">
              <button className="relative flex items-center h-10 pl-5 pr-11 text-sm font-bold text-white bg-[#059669] rounded-full overflow-hidden group shadow-[inset_0_0_1.2rem_-0.4rem_#047857] transition-all">
                <span className="relative z-10 group-hover:text-[#059669] transition-colors duration-300">Get started</span>
                <div className="absolute right-1 flex items-center w-8 h-8 bg-white rounded-full shadow-[0.1rem_0.1rem_0.5rem_0.1rem_rgba(5,150,105,0.3)] transition-all duration-300 group-hover:w-[calc(100%-0.5rem)] z-0">
                  <ArrowUpRight size={14} weight="bold" className="absolute right-[9px] text-[#059669]" />
                </div>
              </button>
            </Link>
            {/* Mobile hamburger */}
            <button
              id="nav-mobile-menu"
              onClick={() => setOpen(true)}
              className="md:hidden w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#F6F7F9] text-[#0F1117] transition-all ml-1"
              aria-label="Open menu"
            >
              <List size={16} weight="bold" />
            </button>
          </div>
        </motion.nav>
      </header>

      {/* Mobile overlay menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[100] bg-white/95 backdrop-blur-2xl flex flex-col"
          >
            <div className="flex justify-between items-center px-6 pt-7 pb-4">
              <Link href="/" onClick={() => setOpen(false)} className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#0F1117] flex items-center justify-center">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M3 12 Q12 4 21 12" stroke="#059669" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M4 12 L7 12 L8.5 8 L10 16 L11.5 12 L20 12" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="3" cy="12" r="1.2" fill="#059669"/>
                  </svg>
                </div>
                <span className="font-bold text-[#0F1117]">Nuskha</span>
              </Link>
              <button onClick={() => setOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full border border-[rgba(15,17,23,0.1)]" aria-label="Close menu">
                <X size={15} weight="bold" />
              </button>
            </div>
            <nav className="flex flex-col px-6 pt-8 gap-2">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.label}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 + 0.1, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="block text-2xl font-bold text-[#0F1117] py-3 border-b border-[rgba(15,17,23,0.06)] hover:text-[#059669] transition-colors"
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
            </nav>
            <div className="mt-auto px-6 pb-10 flex flex-col gap-3">
              <Link href="/signup" onClick={() => setOpen(false)}>
                <button className="btn-primary w-full justify-center py-3.5 text-sm">
                  Get started free
                  <span className="btn-icon-nest"><ArrowUpRight size={12} weight="bold" /></span>
                </button>
              </Link>
              <Link href="/login" onClick={() => setOpen(false)} className="text-center text-sm text-[#6B7280]">
                Already have an account? <span className="text-[#059669] font-medium">Sign in</span>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

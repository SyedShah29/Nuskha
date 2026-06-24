import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";

export const metadata: Metadata = {
  title: "Authentication | Nuskha",
  description: "Sign in or create an account for Nuskha.",
};

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Promotional Side (Hidden on Mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#0F1117] overflow-hidden flex-col justify-between p-12">
        {/* Abstract dark tech background elements */}
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-10 mix-blend-overlay pointer-events-none" />
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#059669]/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />

        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl overflow-hidden shadow-sm transition-transform duration-500 ease-out group-hover:scale-105 border border-[rgba(255,255,255,0.1)]">
              <Image src="/images/nuskha_logo.png" alt="Nuskha" width={40} height={40} className="object-cover" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight leading-none">Nuskha</span>
          </Link>
        </div>

        <div className="relative z-10 max-w-lg mt-24">
          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-6 leading-[1.1]">
            Clinical intelligence, <br />
            <span className="text-[#059669]">seamlessly integrated.</span>
          </h1>
          <p className="text-[#9CA3AF] text-lg leading-relaxed mb-12">
            Nuskha bridges the gap between patient symptoms and clinical documentation, providing specialized, medical-grade portals for both.
          </p>

          {/* Premium UI Mockup Bezel */}
          <div className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden bento-dark shadow-2xl border border-[rgba(255,255,255,0.08)] transform origin-bottom-left hover:scale-[1.02] transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]">
            <img 
              src="/images/mockups/hero_mockup_soap_1782319652847.png" 
              alt="Nuskha Dashboard" 
              className="w-full h-full object-cover object-top opacity-90"
            />
            {/* Dark gradient fade at bottom to blend into the card */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0F1117] to-transparent" />
          </div>
        </div>
        
        <div className="relative z-10 text-sm text-[#6B7280]">
          © {new Date().getFullYear()} Nuskha. All rights reserved.
        </div>
      </div>

      {/* Right Authentication Side */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center relative px-6 py-12 md:px-12 bg-background">
        
        <Link
          href="/"
          className="absolute top-8 left-6 md:left-12 flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-surface text-muted-foreground hover:text-foreground hover:shadow-sm transition-all z-50 group"
        >
          <ArrowLeft weight="bold" className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span className="text-sm font-bold">Back to site</span>
        </Link>

        {/* Mobile Logo (visible only on small screens) */}
        <Link href="/" className="lg:hidden inline-flex items-center gap-3 mb-12 group">
          <div className="w-12 h-12 rounded-xl overflow-hidden shadow-sm border border-border">
            <Image src="/images/nuskha_logo.png" alt="Nuskha" width={48} height={48} className="object-cover" />
          </div>
          <span className="text-2xl font-bold text-foreground tracking-tight">Nuskha</span>
        </Link>

        <div className="w-full max-w-md">
          {/* Children will contain the RoleTabUI and AuthForm */}
          {children}
        </div>
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { X } from "lucide-react";

export const metadata: Metadata = {
  title: "Authentication | Shifa",
  description: "Login or Signup to Shifa",
};

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-cyan-500 flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('/images/noise.png')] bg-blend-overlay opacity-[0.03]" />

      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-purple-400/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-cyan-400/20 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/10 rounded-full blur-3xl" />

      <Link
        href="/"
        className="absolute top-6 right-6 lg:top-8 lg:right-8 flex items-center gap-2 px-4 py-2 rounded-full glass-dark text-white/80 hover:text-white hover:bg-white/10 transition-all z-50"
      >
        <X className="w-4 h-4" />
        <span className="text-sm font-medium">Close</span>
      </Link>

      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg">
              <Image src="/logo/shifa-logo.svg" alt="Shifa" width={32} height={32} />
            </div>
          </Link>
          <h2 className="text-4xl font-bold text-white tracking-tight">
            Welcome to <span className="font-display italic">Shifa</span>
          </h2>
          <p className="text-white/60 mt-2">AI-Powered Healthcare Platform</p>
        </div>

        <div className="glass-card py-8 px-6 sm:px-10 shadow-2xl shadow-black/20">
          {children}
        </div>
      </div>
    </div>
  );
}

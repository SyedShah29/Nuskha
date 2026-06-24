import { motion } from "framer-motion";

export function LoadingSpinner({ className = "" }: { className?: string }) {
  return (
    <div className={`min-h-screen flex items-center justify-center bg-[var(--background)] bg-[url('/images/noise.png')] bg-blend-multiply ${className}`}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="w-12 h-12 border-4 border-[var(--primary)] border-t-transparent rounded-full"
      />
    </div>
  );
}

"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, LogOut, User, Search } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

interface DashboardNavbarProps {
  user: { name?: string; email?: string } | null;
  brandName: string;
  logoSrc?: string;
  searchPlaceholder?: string;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  showSearch?: boolean;
  profileHref?: string;
  extraInfo?: React.ReactNode;
  dashboardHref?: string;
}

export function DashboardNavbar({
  user,
  brandName,
  logoSrc,
  searchPlaceholder = "Search...",
  searchQuery = "",
  onSearchChange,
  showSearch = true,
  profileHref = "/patient/profile",
  extraInfo,
  dashboardHref = "/patient/dashboard",
}: DashboardNavbarProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    await authClient.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <nav className="bg-surface/80 backdrop-blur-xl border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href={dashboardHref} className="flex items-center gap-3">
            {logoSrc ? (
              <img src={logoSrc} alt={brandName} className="w-10 h-10 rounded-xl object-cover" />
            ) : (
              <div className="w-10 h-10 rounded-xl overflow-hidden shadow-sm border border-[rgba(15,17,23,0.06)] flex items-center justify-center">
                <Image
                  src="/images/nuskha_logo.png"
                  alt={brandName}
                  width={40}
                  height={40}
                  className="object-cover"
                />
              </div>
            )}
            <span className="text-xl font-bold text-foreground hidden sm:block tracking-tight">
              {brandName}
            </span>
          </Link>

          {showSearch && onSearchChange && (
            <div className="flex-1 max-w-md mx-4 hidden md:block">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="w-full pl-10 pr-4 py-2.5 bg-[rgba(15,17,23,0.02)] border border-border rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-[#059669]/10 focus:border-[#059669] transition-all"
                />
              </div>
            </div>
          )}

          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-3 px-2 py-1.5 hover:bg-[rgba(15,17,23,0.02)] rounded-xl transition-colors border border-transparent hover:border-border"
              aria-label="User menu"
            >
              <div className="w-9 h-9 rounded-xl bg-[#0F1117] flex items-center justify-center text-white font-bold text-sm shadow-sm">
                {user?.name?.charAt(0) || "U"}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-bold text-foreground">
                  {user?.name || "User"}
                </p>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-muted-foreground transition-transform ${showUserMenu ? "rotate-180" : ""}`}
              />
            </button>

            <AnimatePresence>
              {showUserMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  className="absolute right-0 top-full mt-2 w-60 bg-surface rounded-2xl shadow-xl border border-border overflow-hidden z-50"
                >
                  <div className="p-4 border-b border-border bg-[rgba(15,17,23,0.02)]">
                    <p className="text-sm font-bold text-foreground">{user?.name}</p>
                    <p className="text-xs text-muted-foreground truncate font-mono-data">{user?.email}</p>
                    {extraInfo}
                  </div>
                  <div className="p-2">
                    <Link href={profileHref}>
                      <button
                        onClick={() => setShowUserMenu(false)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-foreground hover:bg-[rgba(15,17,23,0.04)] rounded-xl transition-colors"
                      >
                        <User className="w-4 h-4" />
                        Profile
                      </button>
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-[#EF4444] hover:bg-[#EF4444]/10 rounded-xl transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </nav>
  );
}

"use client";

import { useState } from "react";
import { User, Stethoscope } from "lucide-react";
import { motion } from "framer-motion";

interface RoleTabSelectorProps {
  mode: "login" | "signup";
}

export function RoleTabSelector({ mode }: RoleTabSelectorProps) {
  const [userType, setUserType] = useState<"patient" | "doctor">("patient");

  const layoutId = `activeTab-${mode}`;
  const heading =
    mode === "login"
      ? `Sign in as ${userType === "patient" ? "Patient" : "Doctor"}`
      : `Create ${userType === "patient" ? "Patient" : "Doctor"} Account`;

  return { userType, heading, layoutId, setUserType };
}

export function RoleTabUI({
  userType,
  setUserType,
  layoutId,
}: {
  userType: "patient" | "doctor";
  setUserType: (t: "patient" | "doctor") => void;
  layoutId: string;
}) {
  return (
    <div className="mb-6">
      <div className="flex bg-indigo-50 rounded-xl p-1">
        <button
          onClick={() => setUserType("patient")}
          className={`relative flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-semibold transition-all ${
            userType === "patient"
              ? "text-white"
              : "text-indigo-400 hover:text-indigo-600"
          }`}
        >
          {userType === "patient" && (
            <motion.div
              layoutId={layoutId}
              className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-lg shadow-lg shadow-indigo-500/25"
              transition={{ type: "spring", duration: 0.5 }}
            />
          )}
          <span className="relative z-10 flex items-center gap-2">
            <User className="w-4 h-4" />
            Patient
          </span>
        </button>
        <button
          onClick={() => setUserType("doctor")}
          className={`relative flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-semibold transition-all ${
            userType === "doctor"
              ? "text-white"
              : "text-indigo-400 hover:text-indigo-600"
          }`}
        >
          {userType === "doctor" && (
            <motion.div
              layoutId={layoutId}
              className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-lg shadow-lg shadow-indigo-500/25"
              transition={{ type: "spring", duration: 0.5 }}
            />
          )}
          <span className="relative z-10 flex items-center gap-2">
            <Stethoscope className="w-4 h-4" />
            Doctor
          </span>
        </button>
      </div>
    </div>
  );
}

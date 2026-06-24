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
    <div className="mb-8">
      <div className="flex bg-[rgba(15,17,23,0.04)] rounded-xl p-1 border border-border">
        <button
          onClick={() => setUserType("patient")}
          className={`relative flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-bold transition-all z-10 ${
            userType === "patient"
              ? "text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {userType === "patient" && (
            <motion.div
              layoutId={layoutId}
              className="absolute inset-0 bg-surface rounded-lg shadow-sm border border-[rgba(15,17,23,0.06)] -z-10"
              transition={{ type: "spring", duration: 0.5, bounce: 0.2 }}
            />
          )}
          <User className={`w-4 h-4 ${userType === "patient" ? "text-[#059669]" : ""}`} />
          Patient
        </button>
        <button
          onClick={() => setUserType("doctor")}
          className={`relative flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-bold transition-all z-10 ${
            userType === "doctor"
              ? "text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {userType === "doctor" && (
            <motion.div
              layoutId={layoutId}
              className="absolute inset-0 bg-surface rounded-lg shadow-sm border border-[rgba(15,17,23,0.06)] -z-10"
              transition={{ type: "spring", duration: 0.5, bounce: 0.2 }}
            />
          )}
          <Stethoscope className={`w-4 h-4 ${userType === "doctor" ? "text-[#059669]" : ""}`} />
          Doctor
        </button>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { AuthForm } from "@/components/auth/AuthForm";
import { RoleTabUI } from "@/components/shared/RoleTabSelector";

export default function SignupPage() {
  const [userType, setUserType] = useState<"patient" | "doctor">("patient");

  return (
    <div>
      <RoleTabUI
        userType={userType}
        setUserType={setUserType}
        layoutId="activeTab-signup"
      />
      <h3 className="text-xl font-bold text-gray-800 mb-6 text-center">
        Create {userType === "patient" ? "Patient" : "Doctor"} Account
      </h3>
      <AuthForm mode="signup" userType={userType} />
    </div>
  );
}

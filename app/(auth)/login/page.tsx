"use client";

import { useState } from "react";
import { AuthForm } from "@/components/auth/AuthForm";
import { RoleTabUI } from "@/components/shared/RoleTabSelector";

export default function LoginPage() {
  const [userType, setUserType] = useState<"patient" | "doctor">("patient");

  return (
    <div>
      <RoleTabUI
        userType={userType}
        setUserType={setUserType}
        layoutId="activeTab-login"
      />
      <h3 className="text-xl font-bold text-foreground mb-6 text-center">
        {userType === "patient" ? "Patient" : "Doctor"} Sign In
      </h3>
      <AuthForm mode="login" userType={userType} />
    </div>
  );
}

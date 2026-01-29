import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = {
  title: "Create Account",
  description: "Create your FundSight account to start tracking loans and managing your finances.",
};

export default function RegisterPage() {
  return <RegisterForm />;
}

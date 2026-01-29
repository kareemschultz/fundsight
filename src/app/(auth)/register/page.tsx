import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = {
  title: "Create Account",
  description: "Create your GPSCCU Financial Platform account to start tracking loans and managing your finances.",
};

export default function RegisterPage() {
  return <RegisterForm />;
}

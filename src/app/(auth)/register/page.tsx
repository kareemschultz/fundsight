import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = {
  title: "Create Account",
  description: "Create your Helm account and start charting your course to financial freedom.",
};

export default function RegisterPage() {
  return <RegisterForm />;
}

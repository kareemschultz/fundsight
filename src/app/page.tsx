import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

// Root page: redirect authenticated users to dashboard, others to login.
// This is a Server Component — instant redirect, no client JS.
export default async function RootPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  redirect("/loans");
}

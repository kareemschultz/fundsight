import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

// Root page redirects to the dashboard (which has the sidebar layout)
// or to login if not authenticated
export default async function RootPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // Redirect to the dashboard with the proper layout
  redirect("/loans");
}

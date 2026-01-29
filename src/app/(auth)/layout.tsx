import Link from "next/link";
import { APP_NAME } from "@/lib/constants";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-svh flex flex-col bg-zinc-50 dark:bg-zinc-950">
      {/* Subtle gradient accent */}
      <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />

      <div className="relative flex flex-1 flex-col items-center justify-center p-4 sm:p-6">
        {/* Logo / Branding */}
        <Link
          href="/"
          className="mb-8 flex items-center gap-3 transition-opacity hover:opacity-80"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm shadow-sm">
            GF
          </div>
          <span className="text-lg font-semibold tracking-tight">
            {APP_NAME}
          </span>
        </Link>

        {/* Auth Card */}
        <div className="w-full max-w-md">
          {children}
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-xs text-muted-foreground">
          Guyana Public Service Co-operative Credit Union
        </p>
      </div>
    </div>
  );
}

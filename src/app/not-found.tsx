import Link from "next/link";
import { buttonVariants } from "@/components/ui/button-variants";

export default function NotFound() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center p-6 text-center">
      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
        <span className="text-4xl font-bold text-muted-foreground">404</span>
      </div>
      <h1 className="text-2xl font-bold tracking-tight mb-2">
        Page not found
      </h1>
      <p className="text-muted-foreground max-w-sm mb-8">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link href="/" className={buttonVariants()}>
        Return to Dashboard
      </Link>
    </div>
  );
}

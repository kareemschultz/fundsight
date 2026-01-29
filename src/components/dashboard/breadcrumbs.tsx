"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

const ROUTE_LABELS: Record<string, string> = {
  "/": "Dashboard",
  "/loans": "My Loans",
  "/loans/new": "Add Loan",
  "/tracker": "Payments",
  "/planning": "Planning",
  "/scenarios": "Scenarios",
  "/analytics": "Analytics",
  "/reports": "Reports",
  "/settings": "Settings",
  "/household": "Household",
  "/lenders": "Lenders",
};

export function DashboardBreadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  // Build breadcrumb items
  const crumbs: { label: string; href: string; isLast: boolean }[] = [];

  if (pathname === "/") {
    crumbs.push({ label: "Dashboard", href: "/", isLast: true });
  } else {
    crumbs.push({ label: "Dashboard", href: "/", isLast: false });

    let currentPath = "";
    segments.forEach((segment, i) => {
      currentPath += `/${segment}`;
      const isLast = i === segments.length - 1;

      // Check for known routes first
      const label = ROUTE_LABELS[currentPath];
      if (label) {
        crumbs.push({ label, href: currentPath, isLast });
      } else {
        // UUID or dynamic segment — show parent context
        const parentPath = segments.slice(0, i).join("/");
        if (parentPath === "loans") {
          crumbs.push({ label: "Loan Details", href: currentPath, isLast });
        } else {
          crumbs.push({
            label: segment.charAt(0).toUpperCase() + segment.slice(1),
            href: currentPath,
            isLast,
          });
        }
      }
    });
  }

  return (
    <nav aria-label="Breadcrumb" className="flex items-center text-sm">
      <ol className="flex items-center gap-1.5">
        {crumbs.map((crumb, index) => (
          <li key={crumb.href} className="flex items-center gap-1.5">
            {index > 0 && (
              <svg
                className="h-3.5 w-3.5 text-muted-foreground/50"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            )}
            {crumb.isLast ? (
              <span className="font-medium text-foreground">
                {crumb.label}
              </span>
            ) : (
              <Link
                href={crumb.href}
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                {crumb.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

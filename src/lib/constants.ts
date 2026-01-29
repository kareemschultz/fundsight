// ============================================================================
// Application Constants
// ============================================================================

export const APP_NAME = "Helm — Personal Finance Platform";
export const APP_SHORT_NAME = "Helm";
export const APP_DESCRIPTION =
  "Take the helm of your finances. Track loans, plan payments, model scenarios, and chart your course to financial freedom.";
export const APP_URL = process.env.NEXTAUTH_URL || "http://localhost:3000";

// Currency formatting
export const DEFAULT_CURRENCY = "GYD";
export const DEFAULT_LOCALE = "en-GY";

// Format currency in GYD (or any currency)
export function formatCurrency(
  amount: number,
  currency: string = DEFAULT_CURRENCY,
  locale: string = DEFAULT_LOCALE
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Format percentage
export function formatPercent(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

// Navigation items (single source of truth)
export const NAVIGATION = [
  { name: "Dashboard", href: "/", description: "Portfolio overview" },
  { name: "My Loans", href: "/loans", description: "Manage loans" },
  { name: "Payments", href: "/tracker", description: "Record payments" },
  { name: "Planning", href: "/planning", description: "Payment strategy" },
  { name: "Scenarios", href: "/scenarios", description: "What-if analysis" },
  { name: "Analytics", href: "/analytics", description: "Charts & insights" },
  { name: "Reports", href: "/reports", description: "Export data" },
] as const;

"use client";

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center space-y-6 max-w-md px-6">
        <div className="flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary text-primary-foreground font-bold text-3xl shadow-lg">
            FS
          </div>
        </div>

        <h1 className="text-3xl font-bold tracking-tight">
          You&apos;re Offline
        </h1>

        <p className="text-muted-foreground">
          FundSight needs an internet connection to load your financial data.
          Please check your connection and try again.
        </p>

        <div className="space-y-3">
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
          >
            Try Again
          </button>

          <p className="text-xs text-muted-foreground">
            Your data is safe — it will sync when you&apos;re back online.
          </p>
        </div>
      </div>
    </div>
  );
}

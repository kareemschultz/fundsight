# Guyana Loan Tracker Pro

Multi-user car loan tracking platform for Guyanese financial institutions.

## Features

- **Multi-User Authentication** - Email/password sign-up with secure JWT sessions
- **Multi-Lender Support** - GPSCCU, GBTI, Republic Bank, Demerara Bank, Citizens Bank, GNCB
- **Loan Management** - Track multiple vehicle loans with full CRUD operations
- **Payment Tracking** - Record payments with categorized sources (salary, gratuity, bonus)
- **6-Month Planning** - Optimize payment strategy using gratuity cycles
- **Scenario Comparison** - Compare different extra payment strategies
- **Analytics Dashboard** - Recharts visualizations for payoff projections and trends
- **Financial Health Score** - Weighted score based on progress and payment consistency
- **CSV Export** - Download loan summaries, payment history, and reports

## Tech Stack

- **Framework:** Next.js 16 with App Router
- **Database:** PostgreSQL with Drizzle ORM
- **Auth:** NextAuth.js v5 (credentials provider)
- **UI:** shadcn/ui (base-maia preset) + Hugeicons
- **Charts:** Recharts
- **Runtime:** Bun
- **Deployment:** Docker with multi-stage build

## Getting Started

### Prerequisites

- Node.js 20+ or Bun
- PostgreSQL 16+
- Docker (optional)

### Quick Start with Docker

```bash
# Start everything with Docker Compose
docker compose up -d

# The app will be available at http://localhost:3000
```

### Manual Setup

```bash
# Install dependencies
bun install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your database credentials

# Push database schema
bun run db:push

# Seed lenders data
bun run db/seed.ts

# Start development server
bun dev
```

### Environment Variables

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/loan_tracker
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000
```

## Project Structure

```
src/
├── app/
│   ├── (auth)/           # Login, Register pages
│   ├── (dashboard)/      # Protected dashboard pages
│   │   ├── analytics/    # Charts and health score
│   │   ├── loans/        # Loan CRUD
│   │   ├── planning/     # 6-month strategy
│   │   ├── reports/      # CSV export
│   │   ├── scenarios/    # Payment comparisons
│   │   ├── settings/     # User preferences
│   │   └── tracker/      # Payment recording
│   └── api/              # REST API routes
├── components/
│   ├── ui/               # shadcn components
│   ├── auth/             # Auth forms
│   └── dashboard/        # Dashboard components
└── lib/
    ├── auth.ts           # NextAuth config
    └── db/               # Drizzle schema
```

## Supported Lenders

| Lender | Short Name | Default Rate |
|--------|------------|--------------|
| Greater Pomeroon-Supenaam Credit Cooperative Union | GPSCCU | 12% |
| Guyana Bank for Trade and Industry | GBTI | 14% |
| Republic Bank Guyana | Republic | 13% |
| Demerara Bank Limited | Demerara | 13.5% |
| Citizens Bank Guyana | Citizens | 14% |
| Guyana National Co-operative Bank | GNCB | 12.5% |

## License

MIT

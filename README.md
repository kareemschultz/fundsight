<p align="center">
  <img src="https://img.shields.io/badge/FundSight-Personal%20Finance%20Platform-2563eb?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0id2hpdGUiPjxwYXRoIGQ9Ik0xMiAyQzYuNDggMiAyIDYuNDggMiAxMnM0LjQ4IDEwIDEwIDEwIDEwLTQuNDggMTAtMTBTMTcuNTIgMiAxMiAyem0wIDE4Yy00LjQxIDAtOC0zLjU5LTgtOHMzLjU5LTggOC04IDggMy41OSA4IDgtMy41OSA4LTggNHptLjMxLTguODZjLTEuNzctLjQ1LTIuMzQtLjk0LTIuMzQtMS42NyAwLS44NC43OS0xLjQzIDIuMS0xLjQzIDEuMzggMCAxLjkuNjYgMS45NCAxLjY0aDEuNzFjLS4wNS0xLjM0LS44Ny0yLjU3LTIuNDktMi45N1YyLjVoLTIuMzR2MS41OGMtMS41MS4zMi0yLjcyIDEuMy0yLjcyIDIuNTEgMCAxLjYgMS4zMiAyLjQgMy4yOCAyLjg4IDEuNzYuNDMgMi4xMS4wNiAyLjExIDEuNjUgMCAuNDctLjMzIDEuMjItMS44NSAxLjIyLTEuNDkgMC0yLjA3LS42My0yLjE1LTEuNjRoLTEuN2MuMDkgMS43MyAxLjM5IDIuNyAyLjgxIDMuMDJ2MS42aDIuMzR2LTEuNThjMS41Mi0uMjkgMi43Mi0xLjE2IDIuNzItMi41MiAwLTEuOTctMS41My0yLjY4LTMuMzEtMy4xNHoiLz48L3N2Zz4=&logoColor=white" alt="FundSight — Personal Finance Platform" />
</p>

<h1 align="center">💰 FundSight — Personal Finance Platform</h1>

<p align="center">
  <strong>Track loans, plan payments, and build your path to financial freedom.</strong>
</p>

<p align="center">
  <a href="#features"><img src="https://img.shields.io/badge/Status-MVP%20Complete-success?style=flat-square" alt="Status" /></a>
  <a href="#tech-stack"><img src="https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js" alt="Next.js" /></a>
  <a href="#tech-stack"><img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=white" alt="React" /></a>
  <a href="#tech-stack"><img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" /></a>
  <a href="#tech-stack"><img src="https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat-square&logo=postgresql&logoColor=white" alt="PostgreSQL" /></a>
  <a href="#tech-stack"><img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" /></a>
  <a href="#tech-stack"><img src="https://img.shields.io/badge/Docker-Ready-2496ED?style=flat-square&logo=docker&logoColor=white" alt="Docker" /></a>
  <a href="#license"><img src="https://img.shields.io/badge/License-MIT-yellow?style=flat-square" alt="License" /></a>
</p>

<p align="center">
  <a href="#getting-started">Getting Started</a> •
  <a href="#features">Features</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#architecture">Architecture</a> •
  <a href="#api-documentation">API Docs</a> •
  <a href="#deployment">Deployment</a>
</p>

---

## 📋 Table of Contents

- [About](#about)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Database Schema](#database-schema)
- [Screenshots](#screenshots)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [Roadmap](#roadmap)
- [License](#license)
- [Acknowledgments](#acknowledgments)

---

## 📖 About

**FundSight** is a full-stack personal finance management platform that helps you take control of your debt and plan your way to financial freedom. It combines loan portfolio tracking, intelligent payment planning, scenario modelling, and rich analytics into a single, polished application.

The platform ships pre-configured for the **Guyanese market** — with GYD as the default currency and seven major local financial institutions already seeded — but its architecture is currency- and locale-agnostic, making it easy to adapt for any market.

### What It Does

- **Loan Portfolio Management** — Track multiple loans across financial institutions with real-time balance tracking and progress visualisation
- **Payment Recording & Analysis** — Log every payment with categorised sources (salary, gratuity, bonus, investment) and automatic principal/interest breakdown
- **Financial Planning** — Optimise payment strategies with intelligent 6-month planning tools aligned to your income cycle
- **Scenario Modelling** — Compare "what-if" payment strategies to find the fastest, cheapest path to debt freedom
- **Analytics & Insights** — Visualise your financial health with interactive charts, projections, and a proprietary health score algorithm
- **Professional Reporting** — Generate and export PDF and CSV reports for personal records or financial adviser consultations

### Who It's For

- 💼 Anyone managing one or more loans and seeking structured payoff planning
- 📊 Data-driven individuals who want insights into their debt-free journey
- 🇬🇾 Guyanese borrowers — pre-configured with local lenders and GYD currency
- 🏦 Credit union and bank customers tracking multiple obligations

---

## ✨ Features

### 🔐 Authentication & Security
| Feature | Description |
|---------|-------------|
| Email/Password Auth | Secure registration with bcrypt password hashing (12 rounds) |
| JWT Sessions | Stateless session management via NextAuth.js v5 |
| OAuth Ready | Pre-configured Google & GitHub OAuth providers |
| Route Protection | Middleware-based auth guards on all protected routes |
| Edge-Compatible | Auth config split for Edge runtime middleware support |

### 💰 Loan Management
| Feature | Description |
|---------|-------------|
| Multi-Loan Support | Track unlimited loans simultaneously |
| Lender Integration | 7 pre-configured Guyanese financial institutions (extensible) |
| Real-Time Balances | Automatic balance updates when payments are recorded |
| Interest Tracking | Annual and monthly interest rate calculations |
| Loan Lifecycle | Active/paid-off status management with payoff date tracking |
| Vehicle Association | Link loans to specific vehicles for easy identification |

### 💳 Payment Tracking
| Feature | Description |
|---------|-------------|
| Regular & Extra Payments | Categorise payment types for accurate analysis |
| Payment Sources | Track origin: salary, gratuity, bonus, investment, savings |
| Auto-Split | Automatic principal vs. interest portion calculation |
| Balance Sync | Loan balances update automatically on payment recording |
| Payment History | Chronological view with filtering and search |

### 📊 Analytics & Insights
| Feature | Description |
|---------|-------------|
| Financial Health Score | Proprietary 0–850 score based on progress, payments, and cushion |
| Payoff Projections | Amortisation-based timeline predictions per loan |
| Loan Comparison | Side-by-side analysis of all loans (rates, balances, progress) |
| Multi-Loan Charts | Visualise projected balances across all loans over time |
| Correlation Analysis | See how extra payments correlate with interest savings |
| Interactive Charts | Bar, pie, area, and line charts powered by Recharts |

### 🗓️ Financial Planning
| Feature | Description |
|---------|-------------|
| 6-Month Strategy | Plan payment schedules aligned with your income cycles |
| Extra Payment Optimisation | Calculate optimal extra payment amounts and timing |
| Gratuity Tracking | Track expected gratuity dates and amounts |
| Amortisation Tables | Month-by-month breakdown of planned payments |
| Payment Calendar | See upcoming payments and milestones |

### 🔄 Scenario Comparison
| Feature | Description |
|---------|-------------|
| What-If Analysis | Create multiple payment scenarios per loan |
| Side-by-Side Comparison | Compare months saved, interest saved, total paid |
| Custom Frequencies | Model extra payments at any interval (monthly to annual) |
| Persistent Scenarios | Save and revisit scenarios over time |

### 📄 Reports & Export
| Feature | Description |
|---------|-------------|
| PDF Reports | Professional loan summary and payment history reports |
| CSV Export | Download loan and payment data for spreadsheet analysis |
| Custom Filtering | Export by loan, date range, or payment type |
| Branded Output | Reports include platform branding and metadata |

### 🎨 User Experience
| Feature | Description |
|---------|-------------|
| Dark Mode | System-aware theme with manual toggle |
| Responsive Design | Mobile, tablet, and desktop optimised layouts |
| Sidebar Navigation | Collapsible sidebar with active state indicators |
| Toast Notifications | Non-intrusive feedback via Sonner |
| Loading States | Skeleton loaders and suspense boundaries |
| Accessibility | ARIA-compliant components via shadcn/ui |

### ⚙️ Settings & Personalisation
| Feature | Description |
|---------|-------------|
| Profile Management | Update name, email, and account details |
| Financial Profile | Set income, emergency fund, investment portfolio targets |
| Currency Preference | Default GYD with configurable display |
| Date Format | Customisable date display format |
| Theme Selection | Light, dark, or system-following theme |

---

## 🛠️ Tech Stack

<table>
<tr>
<td align="center" width="200">

### Frontend
![Next.js](https://img.shields.io/badge/Next.js_15-000?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React_19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript_5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind_4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)

</td>
<td align="center" width="200">

### Backend
![Next.js API](https://img.shields.io/badge/API_Routes-000?style=for-the-badge&logo=next.js)
![Drizzle](https://img.shields.io/badge/Drizzle_ORM-C5F74F?style=for-the-badge&logo=drizzle&logoColor=black)
![Zod](https://img.shields.io/badge/Zod_4-3E67B1?style=for-the-badge&logo=zod&logoColor=white)

</td>
<td align="center" width="200">

### Database
![PostgreSQL](https://img.shields.io/badge/PostgreSQL_16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)

</td>
</tr>
<tr>
<td align="center">

### Auth
![NextAuth](https://img.shields.io/badge/NextAuth.js_v5-000?style=for-the-badge&logo=next.js)
![bcrypt](https://img.shields.io/badge/bcryptjs-333?style=for-the-badge)
![JWT](https://img.shields.io/badge/JWT_Sessions-000?style=for-the-badge&logo=jsonwebtokens)

</td>
<td align="center">

### UI Components
![shadcn/ui](https://img.shields.io/badge/shadcn/ui-000?style=for-the-badge)
![Recharts](https://img.shields.io/badge/Recharts-22B5BF?style=for-the-badge)
![Hugeicons](https://img.shields.io/badge/Hugeicons-FF6B35?style=for-the-badge)

</td>
<td align="center">

### DevOps
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Bun](https://img.shields.io/badge/Bun-000?style=for-the-badge&logo=bun)

</td>
</tr>
</table>

---

## 🏗️ Architecture

```mermaid
graph TB
    subgraph Client["🖥️ Client (Browser)"]
        UI["React 19 UI<br/>shadcn/ui + Tailwind CSS 4"]
        Charts["Recharts Visualizations"]
        Auth_Client["NextAuth.js Client"]
    end

    subgraph NextJS["⚡ Next.js 15 (App Router)"]
        subgraph Pages["Server Components"]
            Dashboard["Dashboard Page"]
            Loans["Loans Pages"]
            Tracker["Payment Tracker"]
            Analytics["Analytics Page"]
            Planning["Planning Page"]
            Scenarios["Scenarios Page"]
            Reports["Reports Page"]
            Settings["Settings Page"]
        end

        subgraph API["API Routes (/api)"]
            Auth_API["Auth API<br/>/api/auth/*"]
            Loans_API["Loans API<br/>/api/loans/*"]
            Payments_API["Payments API<br/>/api/payments"]
            Analytics_API["Analytics API<br/>/api/analytics/*"]
            Scenarios_API["Scenarios API<br/>/api/scenarios/*"]
            Export_API["Export API<br/>/api/export/*"]
            Users_API["Users API<br/>/api/users/*"]
            Lenders_API["Lenders API<br/>/api/lenders"]
        end

        Middleware["🔒 Auth Middleware<br/>(Edge Runtime)"]
    end

    subgraph Data["💾 Data Layer"]
        Drizzle["Drizzle ORM<br/>Type-safe queries"]
        PG["PostgreSQL 16<br/>Primary Database"]
    end

    Client -->|HTTP/HTTPS| Middleware
    Middleware -->|Authorized| Pages
    Middleware -->|Authorized| API
    Pages -->|RSC| Drizzle
    API -->|Queries| Drizzle
    Drizzle -->|SQL| PG
    Auth_Client -->|JWT| Auth_API
    UI --> Charts

    style Client fill:#1e293b,stroke:#3b82f6,color:#fff
    style NextJS fill:#0f172a,stroke:#8b5cf6,color:#fff
    style Data fill:#1e293b,stroke:#10b981,color:#fff
```

---

## 🗄️ Database Schema

```mermaid
erDiagram
    USERS {
        uuid id PK
        varchar email UK
        text password_hash
        varchar name
        timestamp created_at
        timestamp updated_at
    }

    LENDERS {
        uuid id PK
        varchar name
        varchar short_name
        text logo_url
        decimal default_rate
        varchar country
        timestamp created_at
    }

    LOANS {
        uuid id PK
        uuid user_id FK
        uuid lender_id FK
        varchar vehicle_description
        decimal original_amount
        decimal current_balance
        decimal interest_rate
        decimal monthly_payment
        date start_date
        integer term_months
        boolean is_active
        date paid_off_date
        text notes
        timestamp created_at
        timestamp updated_at
    }

    FINANCIAL_PROFILES {
        uuid id PK
        uuid user_id FK "UNIQUE"
        decimal monthly_income
        decimal emergency_fund
        decimal investment_portfolio
        decimal target_extra_payment
        decimal current_savings_progress
        decimal expected_gratuity
        date next_gratuity_date
        timestamp created_at
        timestamp updated_at
    }

    PAYMENTS {
        uuid id PK
        uuid loan_id FK
        uuid user_id FK
        date payment_date
        decimal amount
        decimal principal_portion
        decimal interest_portion
        varchar payment_type
        varchar source
        text notes
        timestamp created_at
    }

    PAYMENT_SCENARIOS {
        uuid id PK
        uuid loan_id FK
        uuid user_id FK
        varchar name
        text description
        decimal extra_amount
        integer frequency
        integer start_month
        date projected_payoff_date
        decimal total_interest_saved
        integer months_saved
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }

    USER_SETTINGS {
        uuid id PK
        uuid user_id FK "UNIQUE"
        varchar theme
        varchar currency
        varchar date_format
        boolean display_months_as_years
        jsonb preferences
        timestamp updated_at
    }

    USERS ||--o{ LOANS : "has many"
    USERS ||--o| FINANCIAL_PROFILES : "has one"
    USERS ||--o| USER_SETTINGS : "has one"
    USERS ||--o{ PAYMENTS : "records"
    USERS ||--o{ PAYMENT_SCENARIOS : "creates"
    LENDERS ||--o{ LOANS : "provides"
    LOANS ||--o{ PAYMENTS : "receives"
    LOANS ||--o{ PAYMENT_SCENARIOS : "has"
```

---

## 📸 Screenshots

<details>
<summary><strong>Click to expand screenshots</strong></summary>

### Login Page
![Login Page](.playwright-mcp/login-page.png)

### Dashboard
![Dashboard](.playwright-mcp/dashboard-working.png)

### Dark Mode
![Dashboard Dark Mode](.playwright-mcp/dashboard-dark-mode.png)

### Bank Selection
![Bank Dropdown](.playwright-mcp/bank-dropdown-working.png)

### Lender Short Names
![Dropdown with Short Names](.playwright-mcp/dropdown-with-shortnames.png)

</details>

---

## 🚀 Getting Started

### Prerequisites

| Requirement | Version | Purpose |
|-------------|---------|---------|
| **Node.js** | 20+ | JavaScript runtime |
| **Bun** *(recommended)* | Latest | Fast package manager & runtime |
| **PostgreSQL** | 16+ | Primary database |
| **Docker** *(optional)* | Latest | Containerised deployment |

### Quick Start (Development)

```bash
# 1. Clone the repository
git clone https://github.com/kareemschultz/fundsight.git
cd fundsight

# 2. Install dependencies
bun install
# or: npm install

# 3. Start the database
docker compose up -d db

# 4. Configure environment
cp .env.example .env
# Edit .env with your settings (see Environment Variables section)

# 5. Push database schema
bun run db:push

# 6. Seed initial data (pre-configured lenders)
bun run db:seed

# 7. Start development server
bun run dev
```

Visit **http://localhost:3000** to access the application.

### Full Docker Setup

Run the entire stack (app + database) in Docker:

```bash
# Build and start all services
docker compose up -d

# The app will be available at http://localhost:3000
# PostgreSQL is exposed on port 5433 (for external tools)
```

### First-Time Setup

1. Navigate to **http://localhost:3000/register**
2. Create your account with name, email, and password
3. You'll be redirected to the dashboard
4. Start by adding your first loan under **My Loans → Add New Loan**

---

## 🔑 Environment Variables

Create a `.env` file in the project root:

```env
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/loan_tracker

# Authentication (Required)
NEXTAUTH_SECRET=your-secret-key-here          # Generate: openssl rand -base64 32
NEXTAUTH_URL=http://localhost:3000

# OAuth Providers (Optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | ✅ | — | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | ✅ | — | Secret key for JWT signing (min 32 chars) |
| `NEXTAUTH_URL` | ✅ | — | Canonical URL of your deployment |
| `GOOGLE_CLIENT_ID` | ❌ | — | Google OAuth 2.0 client ID |
| `GOOGLE_CLIENT_SECRET` | ❌ | — | Google OAuth 2.0 client secret |
| `GITHUB_CLIENT_ID` | ❌ | — | GitHub OAuth app client ID |
| `GITHUB_CLIENT_SECRET` | ❌ | — | GitHub OAuth app client secret |

---

## 📡 API Documentation

All API routes are RESTful and require JWT authentication (except auth and registration endpoints).

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/[...nextauth]` | NextAuth.js handler (login/logout/session) |
| `POST` | `/api/register` | Create new user account |

### Loans

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/loans` | List all loans for authenticated user |
| `POST` | `/api/loans` | Create a new loan |
| `GET` | `/api/loans/:id` | Get loan details |
| `PUT` | `/api/loans/:id` | Update loan |
| `DELETE` | `/api/loans/:id` | Delete loan |

<details>
<summary><strong>Request/Response Examples</strong></summary>

**POST /api/loans**
```json
{
  "lenderId": "uuid-of-lender",
  "vehicleDescription": "Toyota Hilux 2023",
  "originalAmount": 5000000,
  "currentBalance": 4200000,
  "interestRate": 0.12,
  "monthlyPayment": 120000,
  "startDate": "2024-01-15",
  "termMonths": 60,
  "notes": "Vehicle loan"
}
```

**Response (201)**
```json
{
  "id": "generated-uuid",
  "userId": "user-uuid",
  "lenderId": "lender-uuid",
  "vehicleDescription": "Toyota Hilux 2023",
  "originalAmount": "5000000.00",
  "currentBalance": "4200000.00",
  "interestRate": "0.1200",
  "monthlyPayment": "120000.00",
  "startDate": "2024-01-15",
  "termMonths": 60,
  "isActive": true,
  "createdAt": "2025-01-21T00:00:00.000Z"
}
```

</details>

### Payments

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/payments` | List payments (optional `?loanId=` filter) |
| `POST` | `/api/payments` | Record a new payment |

### Analytics

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/analytics/health-score` | Calculate financial health score (0–850) |
| `GET` | `/api/analytics/payoff-projection` | Loan payoff timeline projections |
| `GET` | `/api/analytics/comparison` | Multi-loan comparison data |

### Scenarios

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/scenarios?loanId=` | List scenarios for a loan |
| `POST` | `/api/scenarios` | Create payment scenario |
| `PUT` | `/api/scenarios/:id` | Update scenario |
| `DELETE` | `/api/scenarios/:id` | Delete scenario |

### Export

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/export/pdf` | Generate PDF report (`type`: `summary` or `payment-history`) |
| `POST` | `/api/export/csv` | Generate CSV export (`type`: `loans` or `payments`) |

### Users

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/users/profile` | Get user profile |
| `PUT` | `/api/users/profile` | Update user profile |
| `GET` | `/api/users/financial-profile` | Get financial profile |
| `PUT` | `/api/users/financial-profile` | Update financial profile |

### Lenders

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/lenders` | List all available lenders |

---

## 📁 Project Structure

```
fundsight/
├── 📄 docker-compose.yml          # Docker services (app + PostgreSQL)
├── 📄 Dockerfile                   # Multi-stage production build
├── 📄 drizzle.config.ts           # Drizzle ORM configuration
├── 📄 next.config.ts              # Next.js configuration
├── 📄 package.json                # Dependencies and scripts
├── 📄 tsconfig.json               # TypeScript configuration
├── 📄 components.json             # shadcn/ui configuration
├── 📄 postcss.config.mjs          # PostCSS with Tailwind
├── 📄 eslint.config.mjs           # ESLint configuration
│
├── 📂 db/
│   ├── 📄 init.sql                # Database initialisation SQL
│   └── 📄 seed.ts                 # Lender seed data script
│
├── 📂 public/                     # Static assets
│
└── 📂 src/
    ├── 📄 middleware.ts            # Auth middleware (Edge runtime)
    │
    ├── 📂 app/
    │   ├── 📄 layout.tsx          # Root layout (providers, fonts)
    │   ├── 📄 page.tsx            # Root redirect (→ /loans or /login)
    │   ├── 📄 globals.css         # Global styles + Tailwind
    │   ├── 📄 actions.ts          # Server actions
    │   │
    │   ├── 📂 (auth)/            # Auth route group
    │   │   ├── 📄 layout.tsx      # Centred auth layout
    │   │   ├── 📂 login/          # Login page
    │   │   └── 📂 register/       # Registration page
    │   │
    │   ├── 📂 (dashboard)/       # Protected dashboard route group
    │   │   ├── 📄 layout.tsx      # Sidebar + main content layout
    │   │   ├── 📄 page.tsx        # Dashboard overview
    │   │   ├── 📂 analytics/      # Charts, health score, projections
    │   │   ├── 📂 loans/          # Loan CRUD (list, detail, new)
    │   │   ├── 📂 planning/       # 6-month payment planning
    │   │   ├── 📂 reports/        # PDF/CSV export interface
    │   │   ├── 📂 scenarios/      # What-if scenario builder
    │   │   ├── 📂 settings/       # User preferences
    │   │   └── 📂 tracker/        # Payment recording
    │   │
    │   └── 📂 api/               # REST API endpoints
    │       ├── 📂 auth/           # NextAuth.js handlers
    │       ├── 📂 register/       # User registration
    │       ├── 📂 loans/          # Loan CRUD API
    │       ├── 📂 payments/       # Payment recording API
    │       ├── 📂 scenarios/      # Scenario CRUD API
    │       ├── 📂 analytics/      # Computed analytics API
    │       ├── 📂 export/         # PDF & CSV generation
    │       ├── 📂 users/          # Profile & financial profile
    │       └── 📂 lenders/        # Lender listing
    │
    ├── 📂 components/
    │   ├── 📂 auth/              # Login & register forms
    │   ├── 📂 dashboard/         # Sidebar, charts, app-specific UI
    │   └── 📂 ui/                # shadcn/ui base components (30+)
    │
    ├── 📂 hooks/
    │   └── 📄 use-mobile.ts      # Responsive breakpoint hook
    │
    ├── 📂 lib/
    │   ├── 📄 auth.ts            # NextAuth config (Node runtime)
    │   ├── 📄 auth.config.ts     # Auth config (Edge compatible)
    │   ├── 📄 utils.ts           # Utility functions (cn, etc.)
    │   └── 📂 db/
    │       ├── 📄 index.ts       # Database connection pool
    │       └── 📄 schema.ts      # Drizzle schema (7 tables)
    │
    └── 📂 types/
        └── 📄 next-auth.d.ts     # NextAuth type augmentation
```

---

## 🐳 Deployment

### Docker (Recommended)

The application includes a production-ready multi-stage Dockerfile:

```bash
# Build and deploy
docker compose up -d --build

# View logs
docker compose logs -f app

# Stop services
docker compose down
```

**Docker Compose services:**
- **app** — Next.js application (port 3000)
- **db** — PostgreSQL 16 Alpine (port 5433 externally, 5432 internally)

### Manual Deployment

```bash
# Install dependencies
bun install --production

# Build for production
bun run build

# Start production server
bun run start
```

### Vercel

The app is fully compatible with Vercel deployment:

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy — Vercel auto-detects Next.js

> **Note:** You'll need an external PostgreSQL database (e.g., [Neon](https://neon.tech), [Supabase](https://supabase.com), or [Railway](https://railway.app)).

### Database Management

```bash
# Generate migration files
bun run db:generate

# Push schema changes directly
bun run db:push

# Seed lender data
bun run db:seed

# Open Drizzle Studio (visual database browser)
bun run db:studio
```

---

## 🏦 Pre-Configured Lenders

FundSight ships with major Guyanese financial institutions ready to go:

| Institution | Short Name | Default Rate |
|-------------|------------|:------------:|
| Guyana Public Service Co-operative Credit Union | GPSCCU | 12.00% |
| Guyana Bank for Trade and Industry | GBTI | 14.00% |
| Republic Bank Guyana | Republic | 13.00% |
| Demerara Bank Limited | Demerara | 13.50% |
| Citizens Bank Guyana | Citizens | 14.00% |
| Guyana National Co-operative Bank | GNCB | 12.50% |
| Hand-in-Hand Trust Corporation | HIH | 13.00% |
| Other | Other | 15.00% |

> Custom lenders can be added via the seed script or directly in the database.

---

## 🤝 Contributing

Contributions are welcome! Here's how to get started:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'feat: add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Guidelines

- Follow the existing code style and TypeScript conventions
- Use [Conventional Commits](https://www.conventionalcommits.org/) for commit messages
- Add appropriate types — avoid `any` where possible
- Server Components by default; use `"use client"` only when needed
- Validate all API inputs with Zod schemas
- Test your changes build cleanly: `bun run build`

---

## 🗺️ Roadmap

See [ROADMAP.md](./ROADMAP.md) for the full development roadmap. Key upcoming milestones:

- [ ] **Testing Suite** — Unit, integration, and E2E tests
- [ ] **PWA Support** — Offline mode, push notifications, install prompt
- [ ] **Email Reminders** — Payment due date notifications
- [ ] **Advanced Charts** — Debt ratio trends, income vs. obligation analysis
- [ ] **Multi-Currency** — Support for USD, TTD, BBD, and other Caribbean currencies
- [ ] **Team Accounts** — Household/family shared loan management
- [ ] **Mobile Apps** — React Native iOS and Android applications

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **[Next.js](https://nextjs.org/)** — The React framework powering the application
- **[shadcn/ui](https://ui.shadcn.com/)** — Beautiful, accessible UI components
- **[Drizzle ORM](https://orm.drizzle.team/)** — Type-safe database toolkit
- **[Recharts](https://recharts.org/)** — Composable charting library for React
- **[Hugeicons](https://hugeicons.com/)** — Premium icon library
- **[NextAuth.js](https://authjs.dev/)** — Authentication for Next.js
- **[Vercel](https://vercel.com/)** — Deployment and hosting platform

---

<p align="center">
  Built with ❤️ in 🇬🇾 Guyana
  <br />
  <sub>A <a href="https://github.com/kareemschultz">Kareem Schultz</a> project</sub>
</p>

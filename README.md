<p align="center">
  <img src="https://img.shields.io/badge/FundSight-Personal%20Finance%20Platform-2563eb?style=for-the-badge&logoColor=white" alt="FundSight — Personal Finance Platform" />
</p>

<h1 align="center">💰 FundSight — Personal Finance Platform</h1>

<p align="center">
  <strong>Track loans, plan payments, and build your path to financial freedom.</strong>
</p>

<p align="center">
  <a href="#features"><img src="https://img.shields.io/badge/Status-Phase%2010%20Complete-success?style=flat-square" alt="Status" /></a>
  <a href="#tech-stack"><img src="https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js" alt="Next.js" /></a>
  <a href="#tech-stack"><img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=white" alt="React" /></a>
  <a href="#tech-stack"><img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" /></a>
  <a href="#tech-stack"><img src="https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat-square&logo=postgresql&logoColor=white" alt="PostgreSQL" /></a>
  <a href="#tech-stack"><img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" /></a>
  <a href="#tech-stack"><img src="https://img.shields.io/badge/PWA-Ready-5A0FC8?style=flat-square&logo=pwa&logoColor=white" alt="PWA" /></a>
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

## 📖 About

**FundSight** is a full-stack personal finance management platform that helps you take control of your debt and plan your way to financial freedom. It combines loan portfolio tracking, intelligent payment planning, scenario modelling, AI-powered financial insights, and rich analytics into a single, polished application.

The platform ships pre-configured for the **Guyanese market** — with GYD as the default currency and seven major local financial institutions already seeded — but its architecture is currency- and locale-agnostic, making it easy to adapt for any market.

### What It Does

- **Loan Portfolio Management** — Track multiple loans across financial institutions with real-time balance tracking and progress visualisation
- **Payment Recording & Analysis** — Log every payment with categorised sources (salary, gratuity, bonus, investment) and automatic principal/interest breakdown
- **Financial Planning** — Optimise payment strategies with intelligent 6-month planning tools aligned to your income cycle
- **Scenario Modelling** — Compare "what-if" payment strategies to find the fastest, cheapest path to debt freedom
- **AI Financial Insights** — Personalized payment strategy suggestions, DTI monitoring, savings analysis, and gratuity allocation optimization
- **Analytics & Insights** — Visualise your financial health with interactive charts, multi-loan comparisons, correlation analysis, and debt ratio trends
- **Notification System** — In-app notification center with payment reminders, milestone alerts, and gratuity countdown
- **Professional Reporting** — Generate and export PDF and CSV reports for personal records or financial adviser consultations
- **PWA Support** — Install on mobile devices, offline page support, service worker caching

---

## ✨ Features

### 🔐 Authentication & Security
| Feature | Description |
|---------|-------------|
| Email/Password Auth | Secure registration with bcrypt password hashing (12 rounds) |
| JWT Sessions | Stateless session management via NextAuth.js v5 |
| Route Protection | Middleware-based auth guards on all protected routes |
| Security Headers | X-Frame-Options, CSP, HSTS, and more |

### 💰 Loan Management
| Feature | Description |
|---------|-------------|
| Multi-Loan Support | Track unlimited loans simultaneously |
| Lender Integration | 7+ pre-configured Guyanese financial institutions |
| Real-Time Balances | Automatic balance updates when payments are recorded |
| Interest Tracking | Annual and monthly interest rate calculations |
| Vehicle Association | Link loans to specific vehicles for easy identification |

### 📊 Advanced Analytics
| Feature | Description |
|---------|-------------|
| Financial Health Score | Proprietary 0–100 score based on progress, payments, and cushion |
| Multi-Loan Comparison | Side-by-side payoff projections across all loans |
| Correlation Analysis | Extra payments vs interest savings scatter plot |
| Debt-to-Income Trends | 24-month DTI ratio projection chart |
| Payment Source Breakdown | Donut chart of salary, gratuity, bonus contributions |
| Monthly Payment Trends | Stacked bar chart of regular vs extra payments |

### 💡 AI Financial Insights
| Feature | Description |
|---------|-------------|
| Payment Strategies | Avalanche vs snowball recommendations |
| DTI Monitoring | Alerts when debt-to-income exceeds healthy thresholds |
| Savings Rate Analysis | Track if you're saving enough after obligations |
| Gratuity Optimizer | Best allocation suggestions when gratuity arrives |
| Budget Recommendations | Optimal extra payment amounts based on income |
| Emergency Fund Check | Alerts when reserves are below recommended levels |

### 🔔 Notification System
| Feature | Description |
|---------|-------------|
| In-App Bell Icon | Real-time notification center in dashboard header |
| Payment Reminders | Alerts when payments are due within 5 days |
| Milestone Alerts | Celebration notifications at 25%, 50%, 75%, 90% payoff |
| Gratuity Countdown | Reminders when gratuity is approaching |
| Customizable Preferences | Toggle each notification type on/off |

### 📱 Progressive Web App (PWA)
| Feature | Description |
|---------|-------------|
| Installable | Add to home screen on mobile devices |
| Offline Support | Graceful offline page with retry option |
| Service Worker | Smart caching for static assets and navigation |
| App Manifest | Full PWA manifest with icons and theme colors |

### 🏠 Advanced Dashboard
| Feature | Description |
|---------|-------------|
| Progress Rings | Visual SVG ring showing overall loan progress |
| Financial Health Gauge | Color-coded health score with rating |
| Payment Countdown | Days until next payment due |
| Gratuity Countdown | Days until next gratuity with expected amount |
| Interest Saved Summary | Estimated savings from extra payments |
| DTI Indicator | Debt-to-income ratio with health coloring |
| Recent Payments Timeline | Latest 5 payments with icons and badges |
| Quick Action Buttons | One-click access to common tasks |
| AI Insights Widget | Personalized financial recommendations |

---

## 🛠️ Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | Next.js 15, React 19, TypeScript 5, Tailwind CSS 4 |
| **UI Components** | shadcn/ui (base-maia), Recharts, Hugeicons |
| **Backend** | Next.js API Routes, Drizzle ORM, Zod 4 |
| **Database** | PostgreSQL 16 |
| **Auth** | NextAuth.js v5, bcryptjs, JWT |
| **Export** | jsPDF, jspdf-autotable |
| **DevOps** | Docker, Docker Compose, Bun |

---

## 🚀 Getting Started

### Quick Start (Docker)

```bash
git clone https://github.com/kareemschultz/gpsccu-loan-tracker.git
cd gpsccu-loan-tracker
docker compose up -d --build
```

Visit **http://localhost:3100** and register a new account.

### Development

```bash
bun install
docker compose up -d db   # Start PostgreSQL
bun run db:push            # Push schema
bun run db:seed            # Seed lenders
bun dev                    # Start dev server
```

---

## 📡 API Documentation

| Method | Endpoint | Description |
|--------|----------|-------------|
| **Auth** | `/api/auth/[...nextauth]` | NextAuth.js handler |
| **Register** | `POST /api/register` | Create account |
| **Loans** | `GET/POST /api/loans` | List/create loans |
| **Loan Detail** | `GET/PUT/DELETE /api/loans/:id` | CRUD single loan |
| **Payments** | `GET/POST /api/payments` | List/record payments |
| **Scenarios** | `GET/POST /api/scenarios` | List/create scenarios |
| **Scenario Detail** | `GET/PUT/DELETE /api/scenarios/:id` | CRUD scenario |
| **Health Score** | `GET /api/analytics/health-score` | Financial health (0-850) |
| **Projections** | `GET /api/analytics/payoff-projection` | Payoff timeline |
| **Comparison** | `GET /api/analytics/comparison` | Multi-loan comparison |
| **AI Insights** | `GET /api/insights` | Personalized recommendations |
| **PDF Export** | `POST /api/export/pdf` | Generate PDF report |
| **CSV Export** | `POST /api/export/csv` | Generate CSV export |
| **User Profile** | `GET/PUT /api/users/profile` | Profile management |
| **Financial Profile** | `GET/PUT /api/users/financial-profile` | Financial data |
| **Notifications** | `GET /api/notifications` | List notifications |
| **Mark Read** | `POST /api/notifications/mark-read` | Mark notifications read |
| **Notif Prefs** | `GET/PUT /api/notifications/preferences` | Notification settings |
| **Lenders** | `GET /api/lenders` | Available lenders |

---

## 🏦 Pre-Configured Lenders

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

---

## 🐳 Deployment

```bash
docker compose up -d --build     # Build and deploy
docker compose logs -f fs-app    # View logs
docker compose down              # Stop services
```

**Services:**
- **fs-app** — Next.js application (port 3100 → 3000)
- **fs-postgres** — PostgreSQL 16 Alpine (port 5434 → 5432)

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

<p align="center">
  Built with ❤️ in 🇬🇾 Guyana
  <br />
  <sub>A <a href="https://github.com/kareemschultz">Kareem Schultz</a> project</sub>
</p>

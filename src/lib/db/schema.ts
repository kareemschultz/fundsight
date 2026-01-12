import {
  pgTable,
  uuid,
  varchar,
  text,
  decimal,
  integer,
  boolean,
  date,
  timestamp,
  jsonb,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ============================================================================
// USERS TABLE
// ============================================================================
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many, one }) => ({
  loans: many(loans),
  financialProfile: one(financialProfiles),
  settings: one(userSettings),
}));

// ============================================================================
// LENDERS TABLE (Guyanese Banks/Credit Unions)
// ============================================================================
export const lenders = pgTable("lenders", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 100 }).notNull(),
  shortName: varchar("short_name", { length: 20 }).notNull(),
  logoUrl: text("logo_url"),
  defaultRate: decimal("default_rate", { precision: 5, scale: 2 }), // Annual rate as percentage
  country: varchar("country", { length: 50 }).default("Guyana"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const lendersRelations = relations(lenders, ({ many }) => ({
  loans: many(loans),
}));

// ============================================================================
// LOANS TABLE
// ============================================================================
export const loans = pgTable("loans", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  lenderId: uuid("lender_id").references(() => lenders.id),

  // Loan details
  vehicleDescription: varchar("vehicle_description", { length: 200 }), // "BMW X1 2019"
  originalAmount: decimal("original_amount", { precision: 15, scale: 2 }).notNull(),
  currentBalance: decimal("current_balance", { precision: 15, scale: 2 }).notNull(),
  interestRate: decimal("interest_rate", { precision: 6, scale: 4 }).notNull(), // Annual rate as decimal (0.12 = 12%)
  monthlyPayment: decimal("monthly_payment", { precision: 12, scale: 2 }).notNull(),
  startDate: date("start_date").notNull(),
  termMonths: integer("term_months"),

  // Status
  isActive: boolean("is_active").default(true).notNull(),
  paidOffDate: date("paid_off_date"),

  // Metadata
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const loansRelations = relations(loans, ({ one, many }) => ({
  user: one(users, {
    fields: [loans.userId],
    references: [users.id],
  }),
  lender: one(lenders, {
    fields: [loans.lenderId],
    references: [lenders.id],
  }),
  payments: many(payments),
  scenarios: many(paymentScenarios),
}));

// ============================================================================
// FINANCIAL PROFILES TABLE
// ============================================================================
export const financialProfiles = pgTable("financial_profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().unique().references(() => users.id, { onDelete: "cascade" }),

  // Income & Savings
  monthlyIncome: decimal("monthly_income", { precision: 12, scale: 2 }),
  emergencyFund: decimal("emergency_fund", { precision: 15, scale: 2 }).default("0"),
  investmentPortfolio: decimal("investment_portfolio", { precision: 15, scale: 2 }).default("0"),

  // Extra payment planning
  targetExtraPayment: decimal("target_extra_payment", { precision: 12, scale: 2 }).default("0"),
  currentSavingsProgress: decimal("current_savings_progress", { precision: 12, scale: 2 }).default("0"),

  // Gratuity (common in Guyana)
  expectedGratuity: decimal("expected_gratuity", { precision: 15, scale: 2 }).default("0"),
  nextGratuityDate: date("next_gratuity_date"),

  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const financialProfilesRelations = relations(financialProfiles, ({ one }) => ({
  user: one(users, {
    fields: [financialProfiles.userId],
    references: [users.id],
  }),
}));

// ============================================================================
// PAYMENTS TABLE
// ============================================================================
export const paymentTypes = ["regular", "extra"] as const;
export const paymentSources = ["salary", "gratuity", "bonus", "investment", "savings", "other"] as const;

export const payments = pgTable("payments", {
  id: uuid("id").primaryKey().defaultRandom(),
  loanId: uuid("loan_id").notNull().references(() => loans.id, { onDelete: "cascade" }),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),

  // Payment details
  paymentDate: date("payment_date").notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  principalPortion: decimal("principal_portion", { precision: 12, scale: 2 }),
  interestPortion: decimal("interest_portion", { precision: 12, scale: 2 }),

  // Categorization
  paymentType: varchar("payment_type", { length: 20 }).notNull(), // 'regular' | 'extra'
  source: varchar("source", { length: 50 }).notNull(), // 'salary' | 'gratuity' | 'bonus' | etc.

  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const paymentsRelations = relations(payments, ({ one }) => ({
  loan: one(loans, {
    fields: [payments.loanId],
    references: [loans.id],
  }),
  user: one(users, {
    fields: [payments.userId],
    references: [users.id],
  }),
}));

// ============================================================================
// PAYMENT SCENARIOS TABLE
// ============================================================================
export const paymentScenarios = pgTable("payment_scenarios", {
  id: uuid("id").primaryKey().defaultRandom(),
  loanId: uuid("loan_id").notNull().references(() => loans.id, { onDelete: "cascade" }),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),

  // Scenario details
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  extraAmount: decimal("extra_amount", { precision: 12, scale: 2 }).notNull(),
  frequency: integer("frequency").notNull().default(6), // months between extra payments
  startMonth: integer("start_month").default(1), // when to start extra payments

  // Calculated projections (stored for quick access)
  projectedPayoffDate: date("projected_payoff_date"),
  totalInterestSaved: decimal("total_interest_saved", { precision: 15, scale: 2 }),
  monthsSaved: integer("months_saved"),

  isActive: boolean("is_active").default(false).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const paymentScenariosRelations = relations(paymentScenarios, ({ one }) => ({
  loan: one(loans, {
    fields: [paymentScenarios.loanId],
    references: [loans.id],
  }),
  user: one(users, {
    fields: [paymentScenarios.userId],
    references: [users.id],
  }),
}));

// ============================================================================
// USER SETTINGS TABLE
// ============================================================================
export const userSettings = pgTable("user_settings", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().unique().references(() => users.id, { onDelete: "cascade" }),

  theme: varchar("theme", { length: 20 }).default("system"), // 'light' | 'dark' | 'system'
  currency: varchar("currency", { length: 10 }).default("GYD"),
  dateFormat: varchar("date_format", { length: 20 }).default("MM/DD/YYYY"),
  displayMonthsAsYears: boolean("display_months_as_years").default(false),

  // Additional preferences as JSON for flexibility
  preferences: jsonb("preferences").default({}),

  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const userSettingsRelations = relations(userSettings, ({ one }) => ({
  user: one(users, {
    fields: [userSettings.userId],
    references: [users.id],
  }),
}));

// ============================================================================
// TYPE EXPORTS
// ============================================================================
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Lender = typeof lenders.$inferSelect;
export type NewLender = typeof lenders.$inferInsert;

export type Loan = typeof loans.$inferSelect;
export type NewLoan = typeof loans.$inferInsert;

export type FinancialProfile = typeof financialProfiles.$inferSelect;
export type NewFinancialProfile = typeof financialProfiles.$inferInsert;

export type Payment = typeof payments.$inferSelect;
export type NewPayment = typeof payments.$inferInsert;

export type PaymentScenario = typeof paymentScenarios.$inferSelect;
export type NewPaymentScenario = typeof paymentScenarios.$inferInsert;

export type UserSettings = typeof userSettings.$inferSelect;
export type NewUserSettings = typeof userSettings.$inferInsert;

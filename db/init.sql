-- Guyana Loan Tracker Database Schema
-- Run this to initialize a fresh PostgreSQL database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- USERS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================================
-- LENDERS TABLE (Guyanese Banks/Credit Unions)
-- ============================================================================
CREATE TABLE IF NOT EXISTS lenders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    short_name VARCHAR(20) NOT NULL,
    logo_url TEXT,
    default_rate DECIMAL(5, 2),
    country VARCHAR(50) DEFAULT 'Guyana',
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================================
-- LOANS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS loans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    lender_id UUID REFERENCES lenders(id),
    vehicle_description VARCHAR(200),
    original_amount DECIMAL(15, 2) NOT NULL,
    current_balance DECIMAL(15, 2) NOT NULL,
    interest_rate DECIMAL(6, 4) NOT NULL,
    monthly_payment DECIMAL(12, 2) NOT NULL,
    start_date DATE NOT NULL,
    term_months INTEGER,
    is_active BOOLEAN DEFAULT true NOT NULL,
    paid_off_date DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================================
-- FINANCIAL PROFILES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS financial_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    monthly_income DECIMAL(12, 2),
    emergency_fund DECIMAL(15, 2) DEFAULT 0,
    investment_portfolio DECIMAL(15, 2) DEFAULT 0,
    target_extra_payment DECIMAL(12, 2) DEFAULT 0,
    current_savings_progress DECIMAL(12, 2) DEFAULT 0,
    expected_gratuity DECIMAL(15, 2) DEFAULT 0,
    next_gratuity_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================================
-- PAYMENTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    loan_id UUID NOT NULL REFERENCES loans(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    payment_date DATE NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    principal_portion DECIMAL(12, 2),
    interest_portion DECIMAL(12, 2),
    payment_type VARCHAR(20) NOT NULL CHECK (payment_type IN ('regular', 'extra')),
    source VARCHAR(50) NOT NULL CHECK (source IN ('salary', 'gratuity', 'bonus', 'investment', 'savings', 'other')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================================
-- PAYMENT SCENARIOS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS payment_scenarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    loan_id UUID NOT NULL REFERENCES loans(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    extra_amount DECIMAL(12, 2) NOT NULL,
    frequency INTEGER NOT NULL DEFAULT 6,
    start_month INTEGER DEFAULT 1,
    projected_payoff_date DATE,
    total_interest_saved DECIMAL(15, 2),
    months_saved INTEGER,
    is_active BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================================
-- USER SETTINGS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    theme VARCHAR(20) DEFAULT 'system',
    currency VARCHAR(10) DEFAULT 'GYD',
    date_format VARCHAR(20) DEFAULT 'MM/DD/YYYY',
    display_months_as_years BOOLEAN DEFAULT false,
    preferences JSONB DEFAULT '{}',
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================================
-- INDEXES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_loans_user_id ON loans(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_loan_id ON payments(loan_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_date ON payments(payment_date DESC);
CREATE INDEX IF NOT EXISTS idx_scenarios_loan_id ON payment_scenarios(loan_id);

-- ============================================================================
-- SEED DATA: Guyanese Lenders
-- ============================================================================
INSERT INTO lenders (name, short_name, default_rate, country) VALUES
    ('Greater Pomeroon-Supenaam Credit Cooperative Union', 'GPSCCU', 12.00, 'Guyana'),
    ('Guyana Bank for Trade and Industry', 'GBTI', 14.00, 'Guyana'),
    ('Republic Bank Guyana', 'Republic', 13.00, 'Guyana'),
    ('Demerara Bank Limited', 'Demerara', 13.50, 'Guyana'),
    ('Citizens Bank Guyana', 'Citizens', 14.00, 'Guyana'),
    ('Guyana National Co-operative Bank', 'GNCB', 12.50, 'Guyana'),
    ('Hand-in-Hand Trust Corporation', 'HIH', 13.00, 'Guyana'),
    ('Other', 'Other', 15.00, 'Guyana')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_loans_updated_at ON loans;
CREATE TRIGGER update_loans_updated_at
    BEFORE UPDATE ON loans
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_financial_profiles_updated_at ON financial_profiles;
CREATE TRIGGER update_financial_profiles_updated_at
    BEFORE UPDATE ON financial_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_payment_scenarios_updated_at ON payment_scenarios;
CREATE TRIGGER update_payment_scenarios_updated_at
    BEFORE UPDATE ON payment_scenarios
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_settings_updated_at ON user_settings;
CREATE TRIGGER update_user_settings_updated_at
    BEFORE UPDATE ON user_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

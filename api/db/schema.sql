-- Enable UUID generation helper
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Account per Clerk user (one row per MailShield customer)
CREATE TABLE IF NOT EXISTS accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clerk_user_id TEXT NOT NULL UNIQUE,
    plan TEXT NOT NULL DEFAULT 'free',
    monthly_quota INTEGER NOT NULL DEFAULT 25000,
    quota_used INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_accounts_clerk_user_id
    ON accounts (clerk_user_id);

-- API keys tied to accounts (hash stored, secret shown once)
CREATE TABLE IF NOT EXISTS api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    label TEXT,
    hashed_secret TEXT NOT NULL UNIQUE,
    last4 TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    revoked_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_api_keys_owner_id
    ON api_keys (owner_id);

-- Daily usage counters (used for analytics/billing)
CREATE TABLE IF NOT EXISTS usage_daily (
    owner_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    ok INTEGER NOT NULL DEFAULT 0,
    suspect INTEGER NOT NULL DEFAULT 0,
    disposable INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (owner_id, date)
);

-- Simple trigger to keep updated_at fresh
CREATE OR REPLACE FUNCTION touch_accounts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_accounts_updated_at ON accounts;
CREATE TRIGGER trg_accounts_updated_at
    BEFORE UPDATE ON accounts
    FOR EACH ROW
    EXECUTE FUNCTION touch_accounts_updated_at();

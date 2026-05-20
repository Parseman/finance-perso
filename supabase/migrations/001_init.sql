-- ─── Tables métier ────────────────────────────────────────────────────────────
-- user_id est un TEXT correspondant à l'email de l'utilisateur (identifiant JWT)

CREATE TABLE IF NOT EXISTS financial_profiles (
  id                  UUID NOT NULL DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL UNIQUE,
  starting_capital    FLOAT NOT NULL DEFAULT 0,
  current_capital     FLOAT NOT NULL DEFAULT 0,
  monthly_income      FLOAT NOT NULL DEFAULT 0,
  monthly_fixed_costs FLOAT NOT NULL DEFAULT 0,
  currency            TEXT NOT NULL DEFAULT 'EUR',
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS expenses (
  id          UUID NOT NULL DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL,
  amount      FLOAT NOT NULL,
  description TEXT NOT NULL,
  category       TEXT NOT NULL DEFAULT 'other',
  date           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_anticipated BOOLEAN NOT NULL DEFAULT FALSE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS idx_expenses_user_date ON expenses (user_id, date);

CREATE TABLE IF NOT EXISTS financial_goals (
  id             UUID NOT NULL DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL,
  target_capital FLOAT NOT NULL,
  target_date    TIMESTAMPTZ NOT NULL,
  label          TEXT NOT NULL DEFAULT 'Mon objectif',
  is_active      BOOLEAN NOT NULL DEFAULT TRUE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS idx_goals_user_active ON financial_goals (user_id, is_active);

-- ─── Row Level Security ───────────────────────────────────────────────────────
-- Le service_role key (utilisé côté serveur) contourne le RLS automatiquement.
-- Ces politiques protègent d'éventuels accès via la clé anon publique.

ALTER TABLE financial_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_goals ENABLE ROW LEVEL SECURITY;

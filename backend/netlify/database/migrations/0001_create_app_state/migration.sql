-- Single-row JSONB blob holding the whole demo app state (see src/store.ts
-- for why: this is a placeholder backend, not a real relational schema).
CREATE TABLE IF NOT EXISTS app_state (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Users
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Organisations (Tenant)
CREATE TABLE IF NOT EXISTS orgs (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  plan TEXT DEFAULT 'free', -- 'free', 'starter', 'growth', 'enterprise'
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- User <-> Org mapping (Many-to-Many, but usually 1-1 for MVP)
CREATE TABLE IF NOT EXISTS org_users (
  org_id TEXT NOT NULL REFERENCES orgs(id),
  user_id TEXT NOT NULL REFERENCES users(id),
  role TEXT DEFAULT 'admin',
  PRIMARY KEY (org_id, user_id)
);

-- Sessions (Cookie-based auth)
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  expires_at DATETIME NOT NULL
);

-- API Keys (for Phase 3)
CREATE TABLE IF NOT EXISTS api_keys (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL REFERENCES orgs(id),
  key_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  last_used_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tokens (for Phase 3)
CREATE TABLE IF NOT EXISTS proxy_logs (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL REFERENCES orgs(id),
  model TEXT NOT NULL,
  input_tokens INTEGER DEFAULT 0,
  output_tokens INTEGER DEFAULT 0,
  provider_cost_usd REAL DEFAULT 0,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

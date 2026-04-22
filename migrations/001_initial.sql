

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          VARCHAR(100) NOT NULL,
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at    TIMESTAMP DEFAULT NOW()
);

-- Dives
CREATE TABLE dives (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date         DATE NOT NULL,
  location     VARCHAR(255) NOT NULL,
  depth_m      NUMERIC(5,1) NOT NULL,
  duration_min INTEGER NOT NULL,
  my_role      VARCHAR(20) NOT NULL CHECK (my_role IN ('diver','tender','standby_diver','dive_leader')),
  visibility_m NUMERIC(5,1),
  water_temp_c NUMERIC(4,1),
  notes        TEXT,
  created_at   TIMESTAMP DEFAULT NOW()
);

-- Dive team members (per dive)
CREATE TABLE dive_team (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dive_id    UUID NOT NULL REFERENCES dives(id) ON DELETE CASCADE,
  name       VARCHAR(100) NOT NULL,
  role       VARCHAR(20) NOT NULL CHECK (role IN ('diver','tender','standby_diver','dive_leader')),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Public dive sites
CREATE TABLE dive_sites (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        VARCHAR(255) UNIQUE NOT NULL,
  lat         NUMERIC(9,6),
  lng         NUMERIC(9,6),
  max_depth_m NUMERIC(5,1),
  type        VARCHAR(20) CHECK (type IN ('shore','boat','wreck')),
  created_at  TIMESTAMP DEFAULT NOW()
);

-- Seed a few local sites
INSERT INTO dive_sites (name, lat, lng, max_depth_m, type) VALUES
  ('Ågotnes pier',    60.3812, 5.0541, 32, 'shore'),
  ('Ryvarden',        59.9256, 5.2108, 40, 'shore'),
  ('Litledalen wreck',60.1234, 5.1234, 45, 'wreck'),
  ('Fedje',           60.7667, 4.7167, 35, 'shore');

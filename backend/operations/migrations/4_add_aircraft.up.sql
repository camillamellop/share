CREATE TABLE aircrafts (
  id TEXT PRIMARY KEY,
  registration TEXT NOT NULL UNIQUE,
  model TEXT NOT NULL,
  total_hours DOUBLE PRECISION NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance')),
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL
);

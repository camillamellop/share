CREATE TABLE crew_members (
  id TEXT PRIMARY KEY,
  user_id TEXT UNIQUE,
  name TEXT NOT NULL,
  cpf TEXT UNIQUE,
  department TEXT NOT NULL,
  position TEXT NOT NULL,
  anac_license TEXT,
  is_pilot BOOLEAN NOT NULL DEFAULT FALSE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL
);

CREATE INDEX idx_crew_members_name ON crew_members(name);
CREATE INDEX idx_crew_members_is_pilot ON crew_members(is_pilot);
CREATE INDEX idx_crew_members_is_active ON crew_members(is_active);
CREATE INDEX idx_crew_members_department ON crew_members(department);
CREATE INDEX idx_crew_members_user_id ON crew_members(user_id);

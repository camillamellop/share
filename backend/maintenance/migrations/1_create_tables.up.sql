-- Table for crew member license and medical expirations
CREATE TABLE crew_expirations (
  id TEXT PRIMARY KEY,
  crew_member_id TEXT NOT NULL,
  crew_member_name TEXT NOT NULL,
  item_type TEXT NOT NULL, -- 'CHT', 'IFR', 'MLTE', 'MNTE', 'CMA'
  expiration_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL
);

CREATE INDEX idx_crew_expirations_crew_member_id ON crew_expirations(crew_member_id);
CREATE INDEX idx_crew_expirations_expiration_date ON crew_expirations(expiration_date);
CREATE INDEX idx_crew_expirations_item_type ON crew_expirations(item_type);

-- Table for aircraft inspections
CREATE TABLE aircraft_inspections (
  id TEXT PRIMARY KEY,
  aircraft_id TEXT NOT NULL,
  aircraft_registration TEXT NOT NULL,
  inspection_type TEXT NOT NULL, -- 'IAM' (Annual), '50h', '100h', etc.
  last_inspection_date DATE,
  last_inspection_hours DOUBLE PRECISION,
  next_due_date DATE,
  next_due_hours DOUBLE PRECISION,
  notes TEXT,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL
);

CREATE INDEX idx_aircraft_inspections_aircraft_id ON aircraft_inspections(aircraft_id);
CREATE INDEX idx_aircraft_inspections_next_due_date ON aircraft_inspections(next_due_date);
CREATE INDEX idx_aircraft_inspections_next_due_hours ON aircraft_inspections(next_due_hours);

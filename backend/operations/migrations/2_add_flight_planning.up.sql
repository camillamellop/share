CREATE TABLE flight_plans (
  id TEXT PRIMARY KEY,
  flight_number TEXT NOT NULL,
  aircraft TEXT NOT NULL,
  departure_airport TEXT NOT NULL,
  arrival_airport TEXT NOT NULL,
  departure_time TIMESTAMP NOT NULL,
  arrival_time TIMESTAMP NOT NULL,
  route TEXT,
  altitude INTEGER,
  fuel_required INTEGER,
  weight_balance TEXT NOT NULL, -- JSON
  weather_data TEXT NOT NULL, -- JSON
  checklist_completed BOOLEAN NOT NULL DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'filed', 'approved', 'active', 'completed')),
  created_by TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL
);

CREATE TABLE favorite_routes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  departure_airport TEXT NOT NULL,
  arrival_airport TEXT NOT NULL,
  route TEXT NOT NULL,
  altitude INTEGER NOT NULL,
  estimated_time INTEGER NOT NULL, -- minutes
  distance INTEGER NOT NULL, -- km
  created_by TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL
);

CREATE INDEX idx_flight_plans_departure_time ON flight_plans(departure_time);
CREATE INDEX idx_flight_plans_status ON flight_plans(status);
CREATE INDEX idx_flight_plans_created_by ON flight_plans(created_by);
CREATE INDEX idx_favorite_routes_created_by ON favorite_routes(created_by);

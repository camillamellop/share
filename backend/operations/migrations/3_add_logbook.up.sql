CREATE TABLE logbooks (
  id TEXT PRIMARY KEY,
  aircraft_id TEXT NOT NULL,
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  previous_hours DOUBLE PRECISION NOT NULL,
  current_hours DOUBLE PRECISION NOT NULL,
  revision_hours DOUBLE PRECISION NOT NULL,
  UNIQUE(aircraft_id, month, year)
);

CREATE TABLE logbook_entries (
  id TEXT PRIMARY KEY,
  logbook_id TEXT NOT NULL REFERENCES logbooks(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  from_airport TEXT NOT NULL,
  to_airport TEXT NOT NULL,
  time_activated TEXT NOT NULL,
  time_departure TEXT NOT NULL,
  time_arrival TEXT NOT NULL,
  time_shutdown TEXT NOT NULL,
  flight_time_total DOUBLE PRECISION NOT NULL,
  flight_time_day DOUBLE PRECISION NOT NULL,
  flight_time_night DOUBLE PRECISION NOT NULL,
  ifr_hours DOUBLE PRECISION NOT NULL,
  landings INTEGER NOT NULL,
  fuel_added INTEGER NOT NULL,
  fuel_on_arrival INTEGER NOT NULL,
  cell_hours DOUBLE PRECISION NOT NULL,
  pic_hours DOUBLE PRECISION NOT NULL,
  sic_hours DOUBLE PRECISION NOT NULL,
  pic_name TEXT,
  sic_name TEXT,
  daily_allowance DOUBLE PRECISION NOT NULL,
  extras TEXT,
  voo_para TEXT,
  confere TEXT,
  created_at TIMESTAMP NOT NULL
);

CREATE INDEX idx_logbook_entries_logbook_id ON logbook_entries(logbook_id);
CREATE INDEX idx_logbook_entries_date ON logbook_entries(date);

CREATE TABLE aerodromes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  icao TEXT NOT NULL UNIQUE,
  coordinates TEXT NOT NULL,
  is_favorite BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL
);

CREATE INDEX idx_aerodromes_name ON aerodromes(name);
CREATE INDEX idx_aerodromes_is_favorite ON aerodromes(is_favorite);

CREATE TABLE flight_schedules (
  id TEXT PRIMARY KEY,
  aeronave TEXT NOT NULL,
  data DATE NOT NULL,
  horario TEXT NOT NULL,
  nome_cliente TEXT NOT NULL,
  destino TEXT NOT NULL,
  origem TEXT NOT NULL,
  passageiros INTEGER NOT NULL,
  tripulacao TEXT NOT NULL,
  observacoes TEXT,
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'confirmado', 'realizado', 'cancelado')),
  tipo_voo TEXT NOT NULL CHECK (tipo_voo IN ('executivo', 'treinamento', 'manutencao')),
  duracao_estimada TEXT NOT NULL,
  contato_cliente TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL
);

CREATE TABLE operations_config (
  id TEXT PRIMARY KEY,
  status_options TEXT NOT NULL, -- JSON object
  tipo_voo_options TEXT NOT NULL, -- JSON object
  theme TEXT NOT NULL, -- JSON object
  locale TEXT NOT NULL, -- JSON object
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL
);

CREATE INDEX idx_flight_schedules_data ON flight_schedules(data);
CREATE INDEX idx_flight_schedules_aeronave ON flight_schedules(aeronave);
CREATE INDEX idx_flight_schedules_status ON flight_schedules(status);
CREATE INDEX idx_flight_schedules_tipo_voo ON flight_schedules(tipo_voo);

CREATE TABLE contacts (
  id TEXT PRIMARY KEY,
  nome TEXT NOT NULL,
  categoria_nome TEXT NOT NULL,
  categoria_cor TEXT,
  empresa TEXT,
  cargo TEXT,
  observacoes TEXT,
  favorito BOOLEAN NOT NULL DEFAULT FALSE,
  telefones TEXT NOT NULL, -- JSON array
  emails TEXT NOT NULL, -- JSON array
  endereco_principal TEXT,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL
);

CREATE TABLE clients (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  document TEXT NOT NULL UNIQUE,
  email TEXT,
  phone TEXT,
  address TEXT,
  company TEXT,
  notes TEXT,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL
);

CREATE INDEX idx_contacts_categoria ON contacts(categoria_nome);
CREATE INDEX idx_contacts_favorito ON contacts(favorito);
CREATE INDEX idx_clients_name ON clients(name);
CREATE INDEX idx_clients_document ON clients(document);

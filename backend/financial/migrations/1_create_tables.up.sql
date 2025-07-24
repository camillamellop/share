CREATE TABLE company_config (
  id TEXT PRIMARY KEY,
  nome TEXT NOT NULL,
  cnpj TEXT,
  endereco TEXT,
  telefone TEXT,
  email TEXT,
  logotipo_url TEXT,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL
);

CREATE TABLE receipts (
  id TEXT PRIMARY KEY,
  numero TEXT NOT NULL UNIQUE,
  cliente_nome TEXT NOT NULL,
  cliente_cpf_cnpj TEXT,
  cliente_endereco TEXT,
  descricao TEXT NOT NULL,
  valor DOUBLE PRECISION NOT NULL,
  data_emissao DATE NOT NULL,
  observacoes TEXT,
  created_at TIMESTAMP NOT NULL
);

CREATE TABLE travel_reports (
  id TEXT PRIMARY KEY,
  numero_relatorio TEXT NOT NULL UNIQUE,
  cotista TEXT NOT NULL,
  aeronave TEXT NOT NULL,
  tripulante TEXT NOT NULL,
  destino TEXT NOT NULL,
  data_inicio DATE NOT NULL,
  data_fim DATE NOT NULL,
  despesas JSONB NOT NULL,
  valor_total DOUBLE PRECISION NOT NULL,
  observacoes TEXT,
  created_at TIMESTAMP NOT NULL
);

CREATE TABLE billing_documents (
  id TEXT PRIMARY KEY,
  numero_cobranca TEXT NOT NULL UNIQUE,
  devedor TEXT NOT NULL,
  referencia TEXT NOT NULL,
  valor DOUBLE PRECISION NOT NULL,
  vencimento DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP NOT NULL
);

CREATE TABLE user_profiles (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  foto_perfil TEXT,
  dados_pessoais JSONB NOT NULL,
  dados_profissionais JSONB NOT NULL,
  dados_bancarios JSONB NOT NULL,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL
);

CREATE TABLE documents (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  nome TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('pessoais', 'aleatorios', 'holerites')),
  arquivo_url TEXT NOT NULL,
  tamanho INTEGER NOT NULL,
  mime_type TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL
);

CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_documents_user_id ON documents(user_id);
CREATE INDEX idx_documents_tipo ON documents(tipo);

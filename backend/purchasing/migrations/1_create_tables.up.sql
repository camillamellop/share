CREATE TABLE purchase_requisitions (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL, -- 'Compra' or 'Serviço'
  status TEXT NOT NULL DEFAULT 'pendente', -- 'pendente', 'em_analise', 'aprovada', 'rejeitada', 'concluida'
  priority TEXT NOT NULL DEFAULT 'media', -- 'baixa', 'media', 'alta'
  value DOUBLE PRECISION NOT NULL,
  created_by TEXT NOT NULL,
  needed_by DATE,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL
);

CREATE INDEX idx_purchase_requisitions_status ON purchase_requisitions(status);
CREATE INDEX idx_purchase_requisitions_priority ON purchase_requisitions(priority);
CREATE INDEX idx_purchase_requisitions_created_by ON purchase_requisitions(created_by);

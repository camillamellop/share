DROP TABLE IF EXISTS reconciliation_entries;

CREATE TABLE financial_transactions (
  id TEXT PRIMARY KEY,
  description TEXT NOT NULL,
  type TEXT NOT NULL, -- 'expense' (despesa a pagar), 'reimbursement' (a receber do cliente)
  category TEXT,
  amount DOUBLE PRECISION NOT NULL,
  party_name TEXT NOT NULL, -- Fornecedor, funcionário ou cliente
  aircraft TEXT,
  transaction_date DATE NOT NULL,
  due_date DATE,
  payment_method TEXT,
  status TEXT NOT NULL, -- 'pending_payment', 'paid', 'awaiting_billing', 'billed', 'received'
  notes TEXT,
  attachment_url TEXT,
  source_id TEXT, -- ID do recibo, relatorio, etc.
  source_type TEXT,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL
);

CREATE INDEX idx_financial_transactions_type_status ON financial_transactions(type, status);
CREATE INDEX idx_financial_transactions_party_name ON financial_transactions(party_name);
CREATE INDEX idx_financial_transactions_transaction_date ON financial_transactions(transaction_date);

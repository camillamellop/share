CREATE TABLE vacation_requests (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  days INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('regulares', 'premio', 'coletivas')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  requested_at TIMESTAMP NOT NULL,
  approved_at TIMESTAMP,
  approved_by TEXT,
  notes TEXT
);

CREATE INDEX idx_vacation_requests_user_id ON vacation_requests(user_id);
CREATE INDEX idx_vacation_requests_status ON vacation_requests(status);
CREATE INDEX idx_vacation_requests_start_date ON vacation_requests(start_date);

ALTER TABLE receipts ADD COLUMN created_by_id TEXT;
ALTER TABLE receipts ADD COLUMN created_by_name TEXT;
ALTER TABLE receipts ADD COLUMN updated_at TIMESTAMP;

ALTER TABLE travel_reports ADD COLUMN created_by_id TEXT;
ALTER TABLE travel_reports ADD COLUMN created_by_name TEXT;
ALTER TABLE travel_reports ADD COLUMN updated_at TIMESTAMP;

ALTER TABLE billing_documents ADD COLUMN created_by_id TEXT;
ALTER TABLE billing_documents ADD COLUMN created_by_name TEXT;
ALTER TABLE billing_documents ADD COLUMN updated_at TIMESTAMP;

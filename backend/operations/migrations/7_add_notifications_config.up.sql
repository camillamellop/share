ALTER TABLE operations_config ADD COLUMN notifications TEXT;
UPDATE operations_config SET notifications = '{"enabled": true}';
ALTER TABLE operations_config ALTER COLUMN notifications SET NOT NULL;

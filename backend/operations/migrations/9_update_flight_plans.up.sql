ALTER TABLE flight_plans RENAME COLUMN fuel_required TO fuel_burn_liters;
ALTER TABLE flight_plans ADD COLUMN ete_minutes INTEGER;

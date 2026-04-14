-- 026_add_notes_to_vehicles.sql
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS notes TEXT;

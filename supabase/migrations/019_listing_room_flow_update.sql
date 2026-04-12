-- 019_listing_room_flow_update.sql
-- Full listing flow update: room reserved state + listing extended fields

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    WHERE t.typname = 'room_status' AND e.enumlabel = 'reserved'
  ) THEN
    ALTER TYPE room_status ADD VALUE 'reserved' AFTER 'available';
  END IF;
END $$;

ALTER TABLE rooms ADD COLUMN IF NOT EXISTS available_from DATE;
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS deposit_meta JSONB;
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS rental_meta JSONB;

ALTER TABLE listings ADD COLUMN IF NOT EXISTS video_url TEXT;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS is_discounted BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS is_newly_built BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS max_people INTEGER;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS max_vehicles INTEGER;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS length_m NUMERIC(8,2);
ALTER TABLE listings ADD COLUMN IF NOT EXISTS width_m NUMERIC(8,2);
ALTER TABLE listings ADD COLUMN IF NOT EXISTS guest_note TEXT;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS room_features TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE listings ADD COLUMN IF NOT EXISTS interior_features TEXT[] NOT NULL DEFAULT '{}';


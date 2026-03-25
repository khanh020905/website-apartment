-- 004_create_reviews_and_qr.sql
-- Migration to safely create tables for listing reviews and QR codes
-- Using IF NOT EXISTS to avoid conflicts with 001_initial_schema.sql

-- =================
-- LISTING REVIEWS (Check Legit)
-- =================
CREATE TABLE IF NOT EXISTS listing_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES profiles(id),
  action review_action NOT NULL,
  notes TEXT,
  reviewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Use IF NOT EXISTS for indexes (PostgreSQL 9.5+)
CREATE INDEX IF NOT EXISTS idx_reviews_listing ON listing_reviews(listing_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewer ON listing_reviews(reviewer_id);

-- Enable RLS safely
ALTER TABLE listing_reviews ENABLE ROW LEVEL SECURITY;

-- Policies (Wrapped in a DO block to prevent "already exists" errors)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'listing_reviews' AND policyname = 'Reviews viewable by listing owner and admins'
    ) THEN
        CREATE POLICY "Reviews viewable by listing owner and admins" ON listing_reviews
          FOR SELECT USING (
            EXISTS (SELECT 1 FROM listings WHERE id = listing_id AND posted_by = auth.uid())
            OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
          );
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'listing_reviews' AND policyname = 'Admins can insert reviews'
    ) THEN
        CREATE POLICY "Admins can insert reviews" ON listing_reviews
          FOR INSERT WITH CHECK (
            EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
          );
    END IF;
END
$$;

-- =================
-- QR CODES (Building QR)
-- =================
CREATE TABLE IF NOT EXISTS qr_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id UUID NOT NULL REFERENCES buildings(id) ON DELETE CASCADE,
  code TEXT NOT NULL UNIQUE, -- short unique code for URL
  generated_by UUID NOT NULL REFERENCES profiles(id),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(building_id) -- one QR per building
);

CREATE INDEX IF NOT EXISTS idx_qr_code ON qr_codes(code);

-- Enable RLS safely
ALTER TABLE qr_codes ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'qr_codes' AND policyname = 'Active QR codes are viewable by everyone'
    ) THEN
        CREATE POLICY "Active QR codes are viewable by everyone" ON qr_codes
          FOR SELECT USING (is_active = true OR EXISTS (
            SELECT 1 FROM buildings WHERE id = building_id AND owner_id = auth.uid()
          ));
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'qr_codes' AND policyname = 'Building owners can insert QR codes'
    ) THEN
        CREATE POLICY "Building owners can insert QR codes" ON qr_codes
          FOR INSERT WITH CHECK (
            EXISTS (SELECT 1 FROM buildings WHERE id = building_id AND owner_id = auth.uid())
          );
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'qr_codes' AND policyname = 'Building owners can update QR codes'
    ) THEN
        CREATE POLICY "Building owners can update QR codes" ON qr_codes
          FOR UPDATE USING (
            EXISTS (SELECT 1 FROM buildings WHERE id = qr_codes.building_id AND owner_id = auth.uid())
          );
    END IF;
END
$$;

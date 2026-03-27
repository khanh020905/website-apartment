-- 008_check_legit_assignment.sql
-- Add assignment + checklist support for Check Legit workflow

-- Assign inspector/staff to pending listings
ALTER TABLE listings
  ADD COLUMN IF NOT EXISTS assigned_inspector_id UUID REFERENCES profiles(id),
  ADD COLUMN IF NOT EXISTS assigned_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_listings_assigned_inspector ON listings(assigned_inspector_id);

-- Store structured on-site verification checklist for each review
ALTER TABLE listing_reviews
  ADD COLUMN IF NOT EXISTS checklist JSONB;

CREATE INDEX IF NOT EXISTS idx_reviews_reviewed_at ON listing_reviews(reviewed_at DESC);

-- ============================================
-- Rental Platform V1 - Initial Database Schema
-- ============================================

-- =================
-- ENUM TYPES
-- =================

-- User roles
CREATE TYPE user_role AS ENUM ('user', 'landlord', 'broker', 'admin');

-- Subscription tiers
CREATE TYPE subscription_tier AS ENUM ('free', 'broker_basic', 'broker_pro', 'landlord_basic', 'landlord_pro');

-- Room status
CREATE TYPE room_status AS ENUM ('available', 'occupied', 'maintenance');

-- Listing status
CREATE TYPE listing_status AS ENUM ('draft', 'pending', 'approved', 'rejected');

-- Property type
CREATE TYPE property_type AS ENUM ('phong_tro', 'can_ho_mini', 'chung_cu', 'nha_nguyen_can');

-- Furniture status
CREATE TYPE furniture_status AS ENUM ('full', 'basic', 'none');

-- Contract status
CREATE TYPE contract_status AS ENUM ('active', 'expired', 'terminated', 'pending');

-- Review action
CREATE TYPE review_action AS ENUM ('approved', 'rejected');


-- =================
-- PROFILES TABLE
-- =================
-- Extends Supabase auth.users with app-specific data
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  role user_role NOT NULL DEFAULT 'user',
  subscription subscription_tier NOT NULL DEFAULT 'free',
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-create profile on new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'user')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();


-- =================
-- AMENITIES LOOKUP
-- =================
CREATE TABLE IF NOT EXISTS amenities (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  name_vi TEXT NOT NULL,
  icon TEXT, -- icon identifier (e.g., 'wifi', 'ac', 'parking')
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed default amenities from SRS §4.2.3
INSERT INTO amenities (name, name_vi, icon) VALUES
  ('wifi', 'Wi-Fi / Internet', 'wifi'),
  ('air_conditioning', 'Điều hòa không khí', 'snowflake'),
  ('kitchen', 'Bếp nấu ăn', 'utensils'),
  ('bed', 'Giường và nệm', 'bed'),
  ('wardrobe', 'Tủ quần áo', 'archive'),
  ('desk', 'Bàn học', 'book-open'),
  ('washing_machine', 'Máy giặt', 'loader'),
  ('security_camera', 'Camera giám sát', 'camera'),
  ('parking', 'Chỗ để xe', 'car'),
  ('balcony', 'Ban công', 'sun'),
  ('window', 'Cửa sổ', 'maximize'),
  ('fire_safety', 'Hệ thống PCCC', 'shield'),
  ('convenient_transport', 'Giao thông thuận tiện', 'map-pin'),
  ('near_market', 'Gần chợ / siêu thị', 'shopping-cart'),
  ('safe_area', 'Khu vực an ninh trật tự', 'lock')
ON CONFLICT (name) DO NOTHING;


-- =================
-- BUILDINGS TABLE
-- =================
CREATE TABLE IF NOT EXISTS buildings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  ward TEXT,         -- Phường/Xã
  district TEXT,     -- Quận/Huyện
  city TEXT,         -- Tỉnh/TP
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  floors INTEGER NOT NULL DEFAULT 1 CHECK (floors >= 1),
  description TEXT,
  images JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_buildings_owner ON buildings(owner_id);
CREATE INDEX idx_buildings_location ON buildings(city, district, ward);


-- =================
-- ROOMS TABLE
-- =================
CREATE TABLE IF NOT EXISTS rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id UUID NOT NULL REFERENCES buildings(id) ON DELETE CASCADE,
  room_number TEXT NOT NULL,
  floor INTEGER NOT NULL DEFAULT 1,
  area DECIMAL(8,2), -- m²
  price DECIMAL(12,0), -- VNĐ/month
  max_occupants INTEGER DEFAULT 1,
  current_occupants INTEGER DEFAULT 0,
  status room_status NOT NULL DEFAULT 'available',
  furniture furniture_status DEFAULT 'none',
  amenity_ids INTEGER[] DEFAULT '{}', -- references amenities.id
  images JSONB DEFAULT '[]'::jsonb,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(building_id, room_number)
);

CREATE INDEX idx_rooms_building ON rooms(building_id);
CREATE INDEX idx_rooms_status ON rooms(status);
CREATE INDEX idx_rooms_price ON rooms(price);


-- =================
-- LISTINGS TABLE
-- =================
CREATE TABLE IF NOT EXISTS listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  posted_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  room_id UUID REFERENCES rooms(id) ON DELETE SET NULL,
  
  -- Listing info (can exist without a room for standalone listings)
  title TEXT NOT NULL CHECK (char_length(title) <= 100),
  description TEXT,
  price DECIMAL(12,0) NOT NULL, -- VNĐ/month
  area DECIMAL(8,2),
  bedrooms INTEGER DEFAULT 0,
  bathrooms INTEGER DEFAULT 0,
  property_type property_type NOT NULL DEFAULT 'phong_tro',
  furniture furniture_status DEFAULT 'none',
  
  -- Location (for standalone listings not tied to a building)
  address TEXT,
  ward TEXT,
  district TEXT,
  city TEXT,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  
  -- Contact
  contact_phone TEXT NOT NULL,
  contact_name TEXT,
  
  -- Media
  images JSONB DEFAULT '[]'::jsonb, -- array of { url, order }
  
  -- Amenities
  amenity_ids INTEGER[] DEFAULT '{}',
  
  -- Status
  status listing_status NOT NULL DEFAULT 'draft',
  available_date DATE,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  
  -- Counts (for performance)
  view_count INTEGER DEFAULT 0
);

CREATE INDEX idx_listings_posted_by ON listings(posted_by);
CREATE INDEX idx_listings_status ON listings(status);
CREATE INDEX idx_listings_price ON listings(price);
CREATE INDEX idx_listings_area ON listings(area);
CREATE INDEX idx_listings_property_type ON listings(property_type);
CREATE INDEX idx_listings_location ON listings(city, district, ward);
CREATE INDEX idx_listings_created ON listings(created_at DESC);


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

CREATE INDEX idx_reviews_listing ON listing_reviews(listing_id);
CREATE INDEX idx_reviews_reviewer ON listing_reviews(reviewer_id);


-- =================
-- CONTRACTS TABLE
-- =================
CREATE TABLE IF NOT EXISTS contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  landlord_id UUID NOT NULL REFERENCES profiles(id),
  tenant_name TEXT NOT NULL,
  tenant_phone TEXT,
  tenant_email TEXT,
  start_date DATE NOT NULL,
  end_date DATE,
  rent_amount DECIMAL(12,0) NOT NULL,
  deposit_amount DECIMAL(12,0) DEFAULT 0,
  status contract_status NOT NULL DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_contracts_room ON contracts(room_id);
CREATE INDEX idx_contracts_landlord ON contracts(landlord_id);
CREATE INDEX idx_contracts_status ON contracts(status);
CREATE INDEX idx_contracts_end_date ON contracts(end_date);


-- =================
-- QR CODES TABLE
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

CREATE INDEX idx_qr_code ON qr_codes(code);


-- =================
-- UPDATED_AT TRIGGER
-- =================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_buildings_updated BEFORE UPDATE ON buildings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_rooms_updated BEFORE UPDATE ON rooms
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_listings_updated BEFORE UPDATE ON listings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_contracts_updated BEFORE UPDATE ON contracts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- =================
-- ROW LEVEL SECURITY
-- =================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE buildings ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE listing_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE qr_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE amenities ENABLE ROW LEVEL SECURITY;

-- PROFILES: Users can read all profiles, update only their own
CREATE POLICY "Profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- AMENITIES: Public read
CREATE POLICY "Amenities are viewable by everyone" ON amenities
  FOR SELECT USING (true);

-- BUILDINGS: Owners manage their own, public can view
CREATE POLICY "Buildings are viewable by everyone" ON buildings
  FOR SELECT USING (true);
CREATE POLICY "Owners can insert buildings" ON buildings
  FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Owners can update own buildings" ON buildings
  FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Owners can delete own buildings" ON buildings
  FOR DELETE USING (auth.uid() = owner_id);

-- ROOMS: Building owners manage, public can view
CREATE POLICY "Rooms are viewable by everyone" ON rooms
  FOR SELECT USING (true);
CREATE POLICY "Building owners can insert rooms" ON rooms
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM buildings WHERE id = building_id AND owner_id = auth.uid())
  );
CREATE POLICY "Building owners can update rooms" ON rooms
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM buildings WHERE id = rooms.building_id AND owner_id = auth.uid())
  );
CREATE POLICY "Building owners can delete rooms" ON rooms
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM buildings WHERE id = rooms.building_id AND owner_id = auth.uid())
  );

-- LISTINGS: Approved visible to all, owners manage own
CREATE POLICY "Approved listings are viewable by everyone" ON listings
  FOR SELECT USING (status = 'approved' OR auth.uid() = posted_by);
CREATE POLICY "Authenticated can insert listings" ON listings
  FOR INSERT WITH CHECK (auth.uid() = posted_by);
CREATE POLICY "Owners can update own listings" ON listings
  FOR UPDATE USING (auth.uid() = posted_by);
CREATE POLICY "Owners can delete own listings" ON listings
  FOR DELETE USING (auth.uid() = posted_by);

-- LISTING REVIEWS: Admins only
CREATE POLICY "Reviews viewable by listing owner and admins" ON listing_reviews
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM listings WHERE id = listing_id AND posted_by = auth.uid())
    OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
CREATE POLICY "Admins can insert reviews" ON listing_reviews
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- CONTRACTS: Landlord manages own
CREATE POLICY "Landlords view own contracts" ON contracts
  FOR SELECT USING (auth.uid() = landlord_id);
CREATE POLICY "Landlords can insert contracts" ON contracts
  FOR INSERT WITH CHECK (auth.uid() = landlord_id);
CREATE POLICY "Landlords can update own contracts" ON contracts
  FOR UPDATE USING (auth.uid() = landlord_id);

-- QR CODES: Building owners manage, public can read active
CREATE POLICY "Active QR codes are viewable by everyone" ON qr_codes
  FOR SELECT USING (is_active = true OR EXISTS (
    SELECT 1 FROM buildings WHERE id = building_id AND owner_id = auth.uid()
  ));
CREATE POLICY "Building owners can insert QR codes" ON qr_codes
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM buildings WHERE id = building_id AND owner_id = auth.uid())
  );
CREATE POLICY "Building owners can update QR codes" ON qr_codes
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM buildings WHERE id = qr_codes.building_id AND owner_id = auth.uid())
  );


-- =================
-- STORAGE BUCKETS (run in Supabase Dashboard)
-- =================
-- Note: These need to be created via Supabase Dashboard or API:
-- 1. Bucket: "listing-images" (public, max 5MB per file, allowed: jpg, png, webp)
-- 2. Bucket: "building-images" (public, max 5MB per file, allowed: jpg, png, webp)
-- 3. Bucket: "avatars" (public, max 2MB per file, allowed: jpg, png, webp)

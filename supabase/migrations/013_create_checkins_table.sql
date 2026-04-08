-- 1. Create table checkins
CREATE TABLE IF NOT EXISTS public.checkins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  booking_id TEXT,
  room TEXT,
  location TEXT,
  customer TEXT,
  checkin_date DATE,
  checkout_date DATE,
  num_people INTEGER DEFAULT 1,
  electric_meter INTEGER DEFAULT 0,
  water_meter INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('checkedin', 'checkedout', 'pending')),
  created_by TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. RLS Security
ALTER TABLE public.checkins ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies
CREATE POLICY "Owners can view their own checkins"
  ON public.checkins FOR SELECT
  USING (auth.uid() = owner_id);

CREATE POLICY "Owners can insert their own checkins"
  ON public.checkins FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update their own checkins"
  ON public.checkins FOR UPDATE
  USING (auth.uid() = owner_id);

CREATE POLICY "Owners can delete their own checkins"
  ON public.checkins FOR DELETE
  USING (auth.uid() = owner_id);

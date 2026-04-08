-- 1. Create table business_settings
CREATE TABLE IF NOT EXISTS public.business_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  
  -- General info
  brand_name TEXT,
  phone TEXT,
  email TEXT,
  description TEXT,
  address TEXT,
  
  -- Representative info
  rep_business TEXT,
  rep_name TEXT,
  rep_position TEXT,
  rep_phone TEXT,
  rep_email TEXT,
  tax_code TEXT,
  rep_address TEXT,

  -- Social links
  social_website TEXT,
  social_facebook TEXT,
  social_instagram TEXT,
  social_twitter TEXT,
  social_linkedin TEXT,
  social_zalo TEXT,
  social_messenger TEXT,
  social_tiktok TEXT,
  
  -- Branding
  primary_color TEXT DEFAULT '#FFBA38',
  text_color TEXT DEFAULT '#000000',
  logo_full_url TEXT,
  logo_sm_url TEXT,
  
  -- Payment Settings
  payment_cycle TEXT DEFAULT '30_days',
  odd_day_calc TEXT DEFAULT '30_days_fixed',
  reminder_visa BOOLEAN DEFAULT true,
  customer_policy TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. RLS Security Ensure it's enabled
ALTER TABLE public.business_settings ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies
CREATE POLICY "Owners can view their own business settings"
  ON public.business_settings FOR SELECT
  USING (auth.uid() = owner_id);

CREATE POLICY "Owners can insert their own business settings"
  ON public.business_settings FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update their own business settings"
  ON public.business_settings FOR UPDATE
  USING (auth.uid() = owner_id);

CREATE POLICY "Owners can delete their own business settings"
  ON public.business_settings FOR DELETE
  USING (auth.uid() = owner_id);

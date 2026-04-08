-- 1. Create table api_keys
CREATE TABLE IF NOT EXISTS public.api_keys (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  
  client_id TEXT NOT NULL UNIQUE,
  client_secret TEXT NOT NULL,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. RLS Security
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies
CREATE POLICY "Owners can view their own API keys"
  ON public.api_keys FOR SELECT
  USING (auth.uid() = owner_id);

CREATE POLICY "Owners can insert their own API keys"
  ON public.api_keys FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update their own API keys"
  ON public.api_keys FOR UPDATE
  USING (auth.uid() = owner_id);

-- 1. Create table integrations
CREATE TABLE IF NOT EXISTS public.integrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  service_id TEXT NOT NULL, -- 'zns', 'ttlock', 'tingee'
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_connected BOOLEAN DEFAULT false,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(owner_id, service_id)
);

-- 2. RLS Security
ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies
CREATE POLICY "Owners can view their own integrations"
  ON public.integrations FOR SELECT
  USING (auth.uid() = owner_id);

CREATE POLICY "Owners can insert their own integrations"
  ON public.integrations FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update their own integrations"
  ON public.integrations FOR UPDATE
  USING (auth.uid() = owner_id);

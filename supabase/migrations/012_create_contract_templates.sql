-- 1. Create table contract_templates
CREATE TABLE IF NOT EXISTS public.contract_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  name TEXT NOT NULL,
  short_name TEXT,
  prefix_code TEXT,
  reminder_days INTEGER DEFAULT 0,
  file_name TEXT,  -- Equivalent to "content" in types or actual file name
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable RLS
ALTER TABLE public.contract_templates ENABLE ROW LEVEL SECURITY;

-- 3. Create Policies
CREATE POLICY "Users can view their own contract templates"
  ON public.contract_templates FOR SELECT
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can insert their own contract templates"
  ON public.contract_templates FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own contract templates"
  ON public.contract_templates FOR UPDATE
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own contract templates"
  ON public.contract_templates FOR DELETE
  USING (auth.uid() = owner_id);

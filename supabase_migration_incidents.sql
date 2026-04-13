-- MIGRATION: 2024-04-07-004 Incidents & Maintenance
-- SQL MAPPING CHO QUẢN LÝ SỰ CỐ VÀ LOẠI SỰ CỐ

-- 1. BẢNG INCIDENT_TYPES (CẤU HÌNH LOẠI SỰ CỐ)
CREATE TABLE IF NOT EXISTS public.incident_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    building_id UUID NOT NULL REFERENCES public.buildings(id),
    name TEXT NOT NULL,
    icon TEXT,
    default_assignee TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. BẢNG INCIDENTS (NHẬT KÝ SỰ CỐ)
CREATE TABLE IF NOT EXISTS public.incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    building_id UUID NOT NULL REFERENCES public.buildings(id),
    room_id UUID REFERENCES public.rooms(id),
    type_id UUID REFERENCES public.incident_types(id),
    priority TEXT NOT NULL CHECK (priority IN ('emergency', 'high', 'medium', 'low')),
    location TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'cancelled')),
    reported_by UUID REFERENCES auth.users(id), -- Nếu cư dân báo qua app
    reporter_name TEXT, -- Tên khách hàng (nếu admin nhập hộ)
    assignee_id UUID REFERENCES auth.users(id),
    assignee_name TEXT,
    images TEXT[], -- Mảng link ảnh sự cố
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. ENABLE RLS
ALTER TABLE public.incident_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;

-- 4. RLS POLICIES
CREATE POLICY incident_types_owner_policy ON public.incident_types FOR ALL USING (EXISTS (SELECT 1 FROM public.buildings WHERE buildings.id = incident_types.building_id AND buildings.owner_id = auth.uid()));
CREATE POLICY incidents_owner_policy ON public.incidents FOR ALL USING (EXISTS (SELECT 1 FROM public.buildings WHERE buildings.id = incidents.building_id AND buildings.owner_id = auth.uid()));

-- 5. INDEXES
CREATE INDEX IF NOT EXISTS idx_incidents_building_status ON public.incidents (building_id, status);
CREATE INDEX IF NOT EXISTS idx_incidents_type ON public.incidents (type_id);

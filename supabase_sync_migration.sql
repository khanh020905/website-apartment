-- MIGRATION: 2026-04-07-001 Sync Customers and Vehicles Data
-- CHÚ Ý: Cần kích hoạt extension TRGM để tìm kiếm tên tiếng Việt không dấu/có dấu

-- 0. KÍCH HOẠT EXTENSION TRGM (Bắt buộc cho gin_trgm_ops)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 1. ĐỒNG BỘ BẢNG CONTRACTS (Nơi chứa thông tin Tenants hiện tại)
-- Thêm các trường thiếu dựa trên UI 'CustomerPage' và 'CustomerForm'
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='contracts' AND column_name='tenant_id_number') THEN
        ALTER TABLE public.contracts ADD COLUMN tenant_id_number TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='contracts' AND column_name='residence_status') THEN
        ALTER TABLE public.contracts ADD COLUMN residence_status TEXT DEFAULT 'not_registered' CHECK (residence_status IN ('pending', 'completed', 'not_registered'));
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='contracts' AND column_name='tenant_gender') THEN
        ALTER TABLE public.contracts ADD COLUMN tenant_gender TEXT CHECK (tenant_gender IN ('male', 'female', 'other'));
    END IF;
END $$;

-- Thêm Index GIN cho tìm kiếm tên Tenants nhanh (Phân tích UI Tìm kiếm)
CREATE INDEX IF NOT EXISTS idx_contracts_tenant_name_trgm ON public.contracts USING gin (tenant_name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_contracts_tenant_phone ON public.contracts (tenant_phone);

-- 2. TẠO BẢNG VEHICLES (PHƯƠNG TIỆN)
-- Mapping UI: Khách hàng, Phòng, Toà nhà, Loại xe, Biển số, Tên xe, Màu sắc, Trạng thái
CREATE TABLE IF NOT EXISTS public.vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES public.contracts(id) ON DELETE CASCADE,
    room_id UUID NOT NULL REFERENCES public.rooms(id),
    building_id UUID NOT NULL REFERENCES public.buildings(id),
    vehicle_type TEXT NOT NULL CHECK (vehicle_type IN ('xe_may', 'xe_hoi', 'xe_dap', 'xe_dien')),
    license_plate TEXT NOT NULL UNIQUE,
    vehicle_name TEXT,
    color TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index cho tìm kiếm Vehicles nhanh (Theo UI: Biển số, Phòng)
CREATE INDEX IF NOT EXISTS idx_vehicles_license_plate ON public.vehicles (license_plate);
CREATE INDEX IF NOT EXISTS idx_vehicles_building_id ON public.vehicles (building_id);

-- 3. ENABLE RLS (BẢO MẬT DỮ LIỆU)
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;

-- Chủ toà nhà chỉ được thấy xe trong toà nhà của họ
DROP POLICY IF EXISTS vehicles_owner_policy ON public.vehicles;
CREATE POLICY vehicles_owner_policy ON public.vehicles
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.buildings
            WHERE buildings.id = vehicles.building_id
            AND buildings.owner_id = auth.uid()
        )
    );

-- 4. TRIGGER CẬP NHẬT UPDATED_AT
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS tr_vehicles_updated_at ON public.vehicles;
CREATE TRIGGER tr_vehicles_updated_at
    BEFORE UPDATE ON public.vehicles
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

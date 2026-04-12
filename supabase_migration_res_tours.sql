-- MIGRATION: 2026-04-07-002 Sync Reservations and VisitTours
-- PHÂN TÍCH UI -> DATABASE MAPPING CHUẨN SMARTOS

-- 1. BẢNG RESERVATIONS (ĐẶT PHÒNG / GIỮ CHỖ)
-- Mapping UI: Mã đặt phòng, Phòng, Loại phòng, Gói, Khách hàng đại diện, Trạng thái, Tiền cọc, Ngày dự kiến nhận phòng
CREATE TABLE IF NOT EXISTS public.reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reservation_code TEXT NOT NULL UNIQUE, -- VD: NT-RE-XXXXX
    room_id UUID NOT NULL REFERENCES public.rooms(id),
    building_id UUID NOT NULL REFERENCES public.buildings(id),
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_email TEXT,
    check_in_date DATE NOT NULL,
    expected_check_out DATE,
    deposit_amount NUMERIC DEFAULT 0,
    rent_amount NUMERIC DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'active', 'completed', 'cancelled')),
    payment_status TEXT DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'partial', 'paid')), -- Cho Reservation History
    package_type TEXT DEFAULT 'month' CHECK (package_type IN ('day', 'month')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index cho tìm kiếm Reservations nhanh (Theo UI: Mã đặt phòng, Tên khách)
CREATE INDEX IF NOT EXISTS idx_reservations_code ON public.reservations (reservation_code);
CREATE INDEX IF NOT EXISTS idx_reservations_customer_name_trgm ON public.reservations USING gin (customer_name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_reservations_building_id ON public.reservations (building_id);

-- 2. BẢNG VISIT_TOURS (LỊCH HẸN XEM PHÒNG)
-- Mapping UI: Mã xem phòng, Khách xem phòng, Thời gian, Phòng, Toà nhà, Trạng thái, Người đảm nhận, Lời nhắn
CREATE TABLE IF NOT EXISTS public.visit_tours (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tour_code TEXT NOT NULL UNIQUE, -- VD: VT-XXXXX
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_email TEXT,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    building_id UUID NOT NULL REFERENCES public.buildings(id),
    room_id UUID REFERENCES public.rooms(id), -- Có thể xem phòng cụ thể hoặc chỉ xem toà nhà
    assigned_to UUID REFERENCES auth.users(id), -- Nhân viên đảm nhận
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'viewed', 'cancelled')),
    message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index cho tìm kiếm VisitTours nhanh
CREATE INDEX IF NOT EXISTS idx_visit_tours_code ON public.visit_tours (tour_code);
CREATE INDEX IF NOT EXISTS idx_visit_tours_customer_name_trgm ON public.visit_tours USING gin (customer_name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_visit_tours_building_id ON public.visit_tours (building_id);

-- 3. ENABLE RLS (BẢO MẬT DỮ LIỆU)
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visit_tours ENABLE ROW LEVEL SECURITY;

-- Chủ toà nhà chỉ được thấy dữ liệu trong toà nhà của họ
CREATE POLICY reservations_owner_policy ON public.reservations
    FOR ALL USING (EXISTS (SELECT 1 FROM public.buildings WHERE buildings.id = reservations.building_id AND buildings.owner_id = auth.uid()));

CREATE POLICY visit_tours_owner_policy ON public.visit_tours
    FOR ALL USING (EXISTS (SELECT 1 FROM public.buildings WHERE buildings.id = visit_tours.building_id AND buildings.owner_id = auth.uid()));

-- 4. TRIGGERS CẬP NHẬT UPDATED_AT
CREATE TRIGGER tr_reservations_updated_at BEFORE UPDATE ON public.reservations FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER tr_visit_tours_updated_at BEFORE UPDATE ON public.visit_tours FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

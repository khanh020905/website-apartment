-- SCRIPT CẬP NHẬT TRƯỜNG DỮ LIỆU BẢNG CONTRACTS (HỢP ĐỒNG) --
-- Chạy script này trong Supabase > SQL Editor để đảm bảo đồng bộ với UI SmartOS --

ALTER TABLE public.contracts
ADD COLUMN IF NOT EXISTS contract_number TEXT,
ADD COLUMN IF NOT EXISTS contract_name TEXT,
ADD COLUMN IF NOT EXISTS booking_code TEXT,
ADD COLUMN IF NOT EXISTS attachments JSONB DEFAULT '[]'::jsonb;

-- Tùy chọn: Tự động phát sinh contract_number nếu đang trống cho các dữ liệu cũ --
UPDATE public.contracts 
SET contract_number = 'HD-' || UPPER(SUBSTRING(id::text FROM 1 FOR 6))
WHERE contract_number IS NULL;

-- Tùy chọn: Tên hợp đồng mặc định nếu trống --
UPDATE public.contracts c
SET contract_name = 'HĐ Thuê phòng ' || r.room_number
FROM public.rooms r
WHERE c.room_id = r.id AND c.contract_name IS NULL;

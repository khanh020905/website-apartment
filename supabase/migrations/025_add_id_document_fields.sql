-- Migration 025: Add identity document fields to contracts table
ALTER TABLE public.contracts ADD COLUMN IF NOT EXISTS tenant_id_issue_date DATE;
ALTER TABLE public.contracts ADD COLUMN IF NOT EXISTS tenant_id_expiry_date DATE;
ALTER TABLE public.contracts ADD COLUMN IF NOT EXISTS tenant_id_issue_place TEXT;
ALTER TABLE public.contracts ADD COLUMN IF NOT EXISTS tenant_id_front_url TEXT;
ALTER TABLE public.contracts ADD COLUMN IF NOT EXISTS tenant_id_back_url TEXT;
ALTER TABLE public.contracts ADD COLUMN IF NOT EXISTS tenant_residence_url TEXT;

COMMENT ON COLUMN public.contracts.tenant_id_issue_date IS 'Ngày cấp CCCD/Hộ chiếu';
COMMENT ON COLUMN public.contracts.tenant_id_expiry_date IS 'Ngày hết hạn CCCD/Hộ chiếu';
COMMENT ON COLUMN public.contracts.tenant_id_issue_place IS 'Nơi cấp CCCD/Hộ chiếu';
COMMENT ON COLUMN public.contracts.tenant_id_front_url IS 'URL ảnh mặt trước CCCD';
COMMENT ON COLUMN public.contracts.tenant_id_back_url IS 'URL ảnh mặt sau CCCD';
COMMENT ON COLUMN public.contracts.tenant_residence_url IS 'URL ảnh giấy tờ tạm trú';

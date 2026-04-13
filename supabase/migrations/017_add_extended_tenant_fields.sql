-- Migration 017: Add extended tenant information to contracts table
-- Bổ sung các trường thông tin khách hàng mở rộng theo giao diện mới

ALTER TABLE public.contracts
ADD COLUMN IF NOT EXISTS tenant_dob DATE,
ADD COLUMN IF NOT EXISTS tenant_job TEXT,
ADD COLUMN IF NOT EXISTS tenant_nationality TEXT DEFAULT 'Việt Nam',
ADD COLUMN IF NOT EXISTS tenant_city TEXT,
ADD COLUMN IF NOT EXISTS tenant_district TEXT,
ADD COLUMN IF NOT EXISTS tenant_ward TEXT,
ADD COLUMN IF NOT EXISTS tenant_address TEXT,
ADD COLUMN IF NOT EXISTS tenant_avatar TEXT,
ADD COLUMN IF NOT EXISTS tenant_notes TEXT;

-- Ghi chú: Các trường này được thêm vào bảng contracts vì hệ thống hiện tại 
-- đang quản lý khách hàng (tenant) trực tiếp thông qua thông tin trên hợp đồng.

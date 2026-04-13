-- Migration 016: Add detailed fields for buildings management
-- Hỗ trợ lưu trữ các thông tin chi tiết về loại hình, kiến trúc, tiện ích và dịch vụ tùy chỉnh

ALTER TABLE public.buildings
ADD COLUMN IF NOT EXISTS rental_type TEXT,
ADD COLUMN IF NOT EXISTS structure_type TEXT,
ADD COLUMN IF NOT EXISTS amenities JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS metered_services JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS fixed_services JSONB DEFAULT '[]'::jsonb;

-- Đảm bảo quyền truy cập cho RLS (Row Level Security) - đã kế thừa từ các policy cũ
-- Dữ liệu mới sẽ tự động tuân thủ các policy SELECT, INSERT, UPDATE, DELETE hiện có.

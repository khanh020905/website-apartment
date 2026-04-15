-- MIGRATION: 2024-04-15-001 Update Incident Types Schema
-- MỤC TIÊU: Làm cho building_id tùy chọn và thêm các trường còn thiếu (Tên tiếng Anh, Mô tả)

-- 1. Cho phép building_id mang giá trị NULL (Cấu hình chung cho toàn hệ thống)
ALTER TABLE public.incident_types ALTER COLUMN building_id DROP NOT NULL;

-- 2. Thêm cột name_en (Tên tiếng Anh) nếu chưa tồn tại
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='incident_types' AND column_name='name_en') THEN
        ALTER TABLE public.incident_types ADD COLUMN name_en TEXT;
    END IF;
END $$;

-- 3. Thêm cột description (Mô tả) nếu chưa tồn tại
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='incident_types' AND column_name='description') THEN
        ALTER TABLE public.incident_types ADD COLUMN description TEXT;
    END IF;
END $$;

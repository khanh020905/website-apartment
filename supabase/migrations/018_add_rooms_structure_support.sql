-- Migration 018: Support detailed building structure and rooms
-- Thêm hỗ trợ lưu trữ cấu trúc tầng và tên tầng tùy chỉnh cho phòng

-- 1. Thêm cột floor_name vào bảng rooms để lưu tên tầng dạng text (Trệt, Lửng, Tầng 1...)
ALTER TABLE public.rooms
ADD COLUMN IF NOT EXISTS floor_name TEXT;

-- 2. Thêm cột structure_data vào bảng buildings để lưu cấu hình wizard (số tầng, số phòng mỗi tầng, loại đánh số...)
ALTER TABLE public.buildings
ADD COLUMN IF NOT EXISTS structure_data JSONB DEFAULT '{}'::jsonb;

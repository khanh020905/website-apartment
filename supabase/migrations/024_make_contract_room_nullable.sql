-- Migration 024: Make room_id, start_date and rent_amount nullable in contracts table
-- This allows creating customer profiles independently without assigning a room or starting a lease immediately.

ALTER TABLE public.contracts ALTER COLUMN room_id DROP NOT NULL;
ALTER TABLE public.contracts ALTER COLUMN start_date DROP NOT NULL;
ALTER TABLE public.contracts ALTER COLUMN rent_amount DROP NOT NULL;

-- Add comment to explain why this was changed
COMMENT ON COLUMN public.contracts.room_id IS 'Khóa ngoại tới phòng, có thể để trống nếu khách hàng chưa nhận phòng (khách vãng lai/tiềm năng)';
COMMENT ON COLUMN public.contracts.start_date IS 'Ngày bắt đầu thuê, có thể để trống nếu chưa có hợp đồng chính thức';
COMMENT ON COLUMN public.contracts.rent_amount IS 'Tiền thuê mỗi tháng, có thể để trống hoặc bằng 0 nếu chưa gán phòng';

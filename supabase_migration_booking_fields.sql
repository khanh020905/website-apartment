-- MIGRATION: Thêm các cột nâng cao cho luồng Đặt Phòng (BookingForm)
-- Phù hợp với cấu trúc SmartOS

ALTER TABLE public.reservations
ADD COLUMN IF NOT EXISTS identity_number TEXT,
ADD COLUMN IF NOT EXISTS customer_zalo TEXT,
ADD COLUMN IF NOT EXISTS guest_count INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS rent_cycle TEXT DEFAULT 'Chưa cấu hình',
ADD COLUMN IF NOT EXISTS payment_cycle TEXT DEFAULT '1 tháng',
ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'transfer',
ADD COLUMN IF NOT EXISTS transaction_date TIMESTAMP WITH TIME ZONE;

-- Cập nhật comment (tuỳ chọn)
COMMENT ON COLUMN public.reservations.identity_number IS 'Mã CCCD/CMND của khách hàng đại diện';
COMMENT ON COLUMN public.reservations.customer_zalo IS 'Số Zalo liên hệ';
COMMENT ON COLUMN public.reservations.guest_count IS 'Số lượng khách dự kiến ở';
COMMENT ON COLUMN public.reservations.rent_cycle IS 'Chu kỳ tính tiền phòng (Vd: Mỗi cuối tháng)';
COMMENT ON COLUMN public.reservations.payment_cycle IS 'Kỳ thanh toán (Vd: 1 tháng, 3 tháng)';
COMMENT ON COLUMN public.reservations.payment_method IS 'Phương thức thanh toán (cash, transfer, card)';
COMMENT ON COLUMN public.reservations.transaction_date IS 'Ngày hẹn giao dịch / Ngày lập phiếu thu';

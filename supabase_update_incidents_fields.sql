-- Bổ sung các cột thiếu cho bảng incidents với tham chiếu bảng hợp đồng (contracts) chính xác
ALTER TABLE public.incidents 
ADD COLUMN IF NOT EXISTS due_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES public.contracts(id),
ADD COLUMN IF NOT EXISTS contact_phone TEXT;

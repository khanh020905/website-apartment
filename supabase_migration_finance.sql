-- MIGRATION: 2026-04-07-003 Finance & Billing Sync
-- PHÂN TÍCH UI -> DATABASE MAPPING CHO GIAO DỊCH VÀ HOÁ ĐƠN

-- 1. BẢNG BANK_ACCOUNTS (CẤU HÌNH NGÂN HÀNG)
-- Mapping UI: Tên ngân hàng, Chủ tài khoản, Số tài khoản, Chi nhánh, Trạng thái mặc định
CREATE TABLE IF NOT EXISTS public.bank_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES auth.users(id),
    bank_name TEXT NOT NULL,
    account_name TEXT NOT NULL,
    account_number TEXT NOT NULL,
    branch TEXT,
    is_default BOOLEAN DEFAULT false,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. BẢNG INVOICES (QUẢN LÝ HOÁ ĐƠN)
-- Mapping UI: Mã hoá đơn, Phòng, Trạng thái, Hạn thanh toán, Phụ thu, Giảm trừ, Tổng cộng, VAT, Người tạo
CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_code TEXT NOT NULL UNIQUE, -- VD: INV-2024-001
    room_id UUID NOT NULL REFERENCES public.rooms(id),
    building_id UUID NOT NULL REFERENCES public.buildings(id),
    customer_id UUID REFERENCES public.contracts(id), -- Liên kết với tenant qua hợp đồng
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('draft', 'pending', 'paid', 'overdue', 'cancelled', 'partial')),
    due_date DATE NOT NULL,
    billing_month TEXT NOT NULL, -- Định dạng YYYY-MM cho lọc kỳ hoá đơn
    extra_charge NUMERIC DEFAULT 0,
    discount NUMERIC DEFAULT 0,
    total_amount NUMERIC NOT NULL,
    has_vat BOOLEAN DEFAULT false,
    creator_id UUID REFERENCES auth.users(id),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. BẢNG TRANSACTIONS (DANH SÁCH GIAO DỊCH - THU CHI)
-- Mapping UI: Mã GD, Ngày, Toà nhà, Phòng, Khách hàng, Loại GD (Thu/Chi), Hình thức, Số tiền, Trạng thái
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_code TEXT NOT NULL UNIQUE, -- VD: TX-XXXXX
    invoice_id UUID REFERENCES public.invoices(id), -- Có thể tạo từ hoá đơn hoặc giao dịch lẻ
    building_id UUID NOT NULL REFERENCES public.buildings(id),
    room_id UUID REFERENCES public.rooms(id),
    customer_name TEXT, -- Có thể là khách vãng lai hoặc tenant
    flow TEXT NOT NULL CHECK (flow IN ('income', 'expense')),
    category TEXT NOT NULL, -- VD: Tiền phòng, Điện nước, Phụ phí, Nhập quỹ, Rút tiền...
    payment_method TEXT NOT NULL CHECK (payment_method IN ('bank_transfer', 'cash', 'credit_card')),
    amount NUMERIC NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('confirmed', 'pending', 'cancelled')),
    transaction_date DATE DEFAULT CURRENT_DATE,
    note TEXT,
    created_by UUID REFERENCES auth.users(id),
    proof_url TEXT, -- Link ảnh minh chứng thanh toán
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. BẢNG PAYMENT_PROOFS (MINH CHỨNG THANH TOÁN - Chờ duyệt)
-- Mapping UI: Khách hàng, Số tiền, Hoá đơn liên kết, Link ảnh, Ngày gửi, Trạng thái duyệt
CREATE TABLE IF NOT EXISTS public.payment_proofs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID REFERENCES public.invoices(id),
    customer_name TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    image_url TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    reviewer_id UUID REFERENCES auth.users(id),
    reject_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. ENABLE RLS
ALTER TABLE public.bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_proofs ENABLE ROW LEVEL SECURITY;

-- 6. RLS POLICIES (Building Owner isolation)
CREATE POLICY bank_accounts_owner_policy ON public.bank_accounts FOR ALL USING (owner_id = auth.uid());
CREATE POLICY invoices_owner_policy ON public.invoices FOR ALL USING (EXISTS (SELECT 1 FROM public.buildings WHERE buildings.id = invoices.building_id AND buildings.owner_id = auth.uid()));
CREATE POLICY transactions_owner_policy ON public.transactions FOR ALL USING (EXISTS (SELECT 1 FROM public.buildings WHERE buildings.id = transactions.building_id AND buildings.owner_id = auth.uid()));
CREATE POLICY proofs_owner_policy ON public.payment_proofs FOR ALL USING (EXISTS (SELECT 1 FROM public.invoices JOIN public.buildings ON invoices.building_id = buildings.id WHERE invoices.id = payment_proofs.invoice_id AND buildings.owner_id = auth.uid()));

-- 7. INDEXES
CREATE INDEX IF NOT EXISTS idx_invoices_code ON public.invoices (invoice_code);
CREATE INDEX IF NOT EXISTS idx_transactions_code ON public.transactions (transaction_code);
CREATE INDEX IF NOT EXISTS idx_invoices_building_month ON public.invoices (building_id, billing_month);

-- 006_utility_and_reports.sql
-- Migration to add utility bill tracking and revenue summaries (SRS V2 features)

-- =================
-- UTILITY_BILLS (Điện, Nước, Phí dịch vụ)
-- =================
CREATE TABLE IF NOT EXISTS utility_bills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  contract_id UUID REFERENCES contracts(id) ON DELETE SET NULL,
  billing_month DATE NOT NULL, -- First day of the month
  electricity_old_index DECIMAL(10,2),
  electricity_new_index DECIMAL(10,2),
  electricity_usage DECIMAL(10,2),
  electricity_unit_price DECIMAL(10,0) DEFAULT 3500,
  
  water_usage DECIMAL(10,2),
  water_unit_price DECIMAL(10,0) DEFAULT 20000,
  
  service_fee DECIMAL(10,0) DEFAULT 0,
  other_fees DECIMAL(10,0) DEFAULT 0,
  total_amount DECIMAL(12,0) NOT NULL,
  
  status TEXT NOT NULL DEFAULT 'unpaid' CHECK (status IN ('unpaid', 'paid', 'overdue')),
  payment_date TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_utility_room ON utility_bills(room_id);
CREATE INDEX IF NOT EXISTS idx_utility_status ON utility_bills(status);
CREATE INDEX IF NOT EXISTS idx_utility_month ON utility_bills(billing_month);

-- Enable RLS
ALTER TABLE utility_bills ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'utility_bills' AND policyname = 'Owners manage own bills') THEN
        CREATE POLICY "Owners manage own bills" ON utility_bills FOR ALL USING (
            EXISTS (SELECT 1 FROM rooms r JOIN buildings b ON r.building_id = b.id WHERE r.id = room_id AND b.owner_id = auth.uid())
        );
    END IF;
END
$$;

-- =================
-- REVENUE_REPORTS (Summary data for dashboard)
-- =================
CREATE OR REPLACE VIEW revenue_summary AS
SELECT 
    b.owner_id,
    b.name as building_name,
    DATE_TRUNC('month', ub.payment_date) as month,
    SUM(ub.total_amount) as total_revenue,
    COUNT(ub.id) as bills_count
FROM utility_bills ub
JOIN rooms r ON ub.room_id = r.id
JOIN buildings b ON r.building_id = b.id
WHERE ub.status = 'paid'
GROUP BY b.owner_id, b.name, DATE_TRUNC('month', ub.payment_date);

-- Note: In Supabase, Views are automatically accessible if tables are. 
-- But for better RLS with views, they should be filtered by profile.

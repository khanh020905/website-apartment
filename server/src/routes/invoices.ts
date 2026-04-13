import { Router, Response } from "express";
import { getSupabase } from "../lib/supabase";
import { authenticate } from "../middleware/auth";
import type { AuthRequest } from "../middleware/auth";

const router = Router();

// Mapping UI -> DB cho Invoices
interface InvoiceQueryParams {
  page?: string;
  limit?: string;
  search?: string;
  status?: string;
  building_id?: string;
  month?: string;
}

// GET /api/invoices - Danh sách hoá đơn
router.get("/", authenticate, async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: "Chưa xác thực" });

  const {
    page = "1",
    limit = "20",
    search = "",
    status,
    building_id,
    month
  } = req.query as InvoiceQueryParams;

  const pageNum = Math.max(1, parseInt(page) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 20));
  const offset = (pageNum - 1) * limitNum;

  const supabase = getSupabase();

  try {
    let query = supabase
      .from("invoices")
      .select(
        `
        *,
        room:room_id (id, room_number),
        building:building_id (id, name, owner_id),
        creator:creator_id (id, display_name)
      `,
        { count: "exact" }
      )
      .eq("building.owner_id", req.user.id);

    if (status) query = query.eq("status", status);
    if (building_id) query = query.eq("building_id", building_id);
    if (month) query = query.eq("billing_month", month);

    // Search theo UI: Mã hoá đơn, Phòng, Tên khách hàng
    if (search) {
      query = query.or(`invoice_code.ilike.%${search}%,room_number.ilike.%${search}%,customer_name.ilike.%${search}%`);
    }

    const { data: invoices, error, count } = await query
      .order("created_at", { ascending: false })
      .range(offset, offset + limitNum - 1);

    if (error) throw error;

    // Tính toán thống kê theo UI (Tổng hoá đơn, Đã thanh toán, Chờ, Quá hạn)
    const { data: statsData } = await supabase
      .from("invoices")
      .select("status, total_amount, building_id")
      .eq("building_id", building_id || ""); // Cần lọc theo toà nếu có

    const stats = {
      total: count || 0,
      paid: invoices?.filter(i => i.status === 'paid').length || 0,
      pending: invoices?.filter(i => i.status === 'pending').length || 0,
      overdue: invoices?.filter(i => i.status === 'overdue').length || 0
    };

    res.json({
      invoices,
      total: count || 0,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil((count || 0) / limitNum),
      stats
    });
  } catch (err) {
    res.status(500).json({ error: "Lỗi server khi lấy hoá đơn" });
  }
});

// POST /api/invoices - Tạo hoá đơn mới (Mapping UI: InvoiceForm)
router.post("/", authenticate, async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: "Chưa xác thực" });
  const { room_id, building_id, due_date, billing_month, total_amount, extra_charge, discount, has_vat, customer_name, room_number } = req.body;
  
  const supabase = getSupabase();
  try {
    const code = `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const { data, error } = await supabase
      .from("invoices")
      .insert({
        invoice_code: code,
        room_id,
        building_id,
        due_date,
        billing_month,
        total_amount,
        extra_charge: extra_charge || 0,
        discount: discount || 0,
        has_vat: has_vat || false,
        customer_name,
        room_number,
        status: 'pending',
        creator_id: req.user.id
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: "Lỗi server khi tạo hoá đơn" });
  }
});

export default router;

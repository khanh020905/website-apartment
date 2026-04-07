import { Router, Response } from "express";
import { getSupabase } from "../lib/supabase";
import { authenticate } from "../middleware/auth";
import type { AuthRequest } from "../middleware/auth";

const router = Router();

// Mapping UI -> DB cho Reservations
interface ReservationQueryParams {
  page?: string;
  limit?: string;
  search?: string;
  status?: 'confirmed' | 'active' | 'completed' | 'cancelled' | '';
  building_id?: string;
  start_date?: string;
  end_date?: string;
}

// GET /api/reservations - Danh sách đặt chỗ (Dùng cho cả Hiện tại & Lịch sử)
router.get("/", authenticate, async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: "Chưa xác thực" });

  const {
    page = "1",
    limit = "20",
    search = "",
    status,
    building_id,
    start_date,
    end_date
  } = req.query as ReservationQueryParams;

  const pageNum = Math.max(1, parseInt(page) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 20));
  const offset = (pageNum - 1) * limitNum;

  const supabase = getSupabase();

  try {
    let query = supabase
      .from("reservations")
      .select(
        `
        *,
        room:room_id (id, room_number, floor, status),
        building:building_id (id, name, owner_id)
      `,
        { count: "exact" }
      )
      .eq("building.owner_id", req.user.id);

    if (status) query = query.eq("status", status);
    if (building_id) query = query.eq("building_id", building_id);
    if (start_date) query = query.gte("check_in_date", start_date);
    if (end_date) query = query.lte("check_in_date", end_date);

    // Search theo UI: Mã đặt phòng, Tên khách
    if (search) {
      query = query.or(`reservation_code.ilike.%${search}%,customer_name.ilike.%${search}%`);
    }

    const { data: reservations, error, count } = await query
      .order("created_at", { ascending: false })
      .range(offset, offset + limitNum - 1);

    if (error) throw error;

    res.json({
      reservations,
      total: count || 0,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil((count || 0) / limitNum),
    });
  } catch (err) {
    console.error("Error fetching reservations:", err);
    res.status(500).json({ error: "Lỗi server khi lấy lịch sử đặt chỗ" });
  }
});

// POST /api/reservations - Đăng ký giữ chỗ (Mapping UI: BookingForm)
router.post("/", authenticate, async (req: AuthRequest, res: Response) => {
  const { customer_name, customer_phone, customer_email, check_in_date, deposit_amount, rent_amount, room_id, building_id, notes } = req.body;
  
  if (!customer_name || !customer_phone || !check_in_date || !room_id || !building_id) {
    return res.status(400).json({ error: "Thiếu thông tin bắt buộc" });
  }

  const supabase = getSupabase();
  try {
    // Tự động tạo mã đặt phòng (NT-RE-XXXXX)
    const resCode = `NTRE${Math.floor(10000 + Math.random() * 90000)}`;

    const { data, error } = await supabase
      .from("reservations")
      .insert({
        reservation_code: resCode,
        customer_name,
        customer_phone,
        customer_email,
        check_in_date,
        deposit_amount: deposit_amount || 0,
        rent_amount: rent_amount || 0,
        room_id,
        building_id,
        notes,
        status: 'confirmed'
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: "Lỗi server khi đặt phòng" });
  }
});

// PUT /api/reservations/:id - Cập nhật trạng thái (Huỷ, Xác nhận đón khách)
router.put("/:id", authenticate, async (req: AuthRequest, res: Response) => {
  const supabase = getSupabase();
  try {
    const { data, error } = await supabase
      .from("reservations")
      .update(req.body)
      .eq("id", req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Lỗi server khi cập nhật" });
  }
});

export default router;

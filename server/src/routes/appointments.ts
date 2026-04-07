import { Router, Response } from "express";
import { getSupabase } from "../lib/supabase";
import { authenticate } from "../middleware/auth";
import type { AuthRequest } from "../middleware/auth";

const router = Router();

// Mapping UI -> DB cho VisitTours
interface TourQueryParams {
  page?: string;
  limit?: string;
  search?: string;
  status?: 'pending' | 'viewed' | 'cancelled' | '';
  building_id?: string;
  start_date?: string;
  end_date?: string;
}

// GET /api/visit-tours - Danh sách lịch hẹn xem phòng
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
  } = req.query as TourQueryParams;

  const pageNum = Math.max(1, parseInt(page) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 20));
  const offset = (pageNum - 1) * limitNum;

  const supabase = getSupabase();

  try {
    let query = supabase
      .from("visit_tours")
      .select(
        `
        *,
        room:room_id (id, room_number),
        building:building_id (id, name, owner_id)
      `,
        { count: "exact" }
      )
      .eq("building.owner_id", req.user.id);

    if (status) query = query.eq("status", status);
    if (building_id) query = query.eq("building_id", building_id);
    if (start_date) query = query.gte("appointment_date", start_date);
    if (end_date) query = query.lte("appointment_date", end_date);

    // Search theo UI: Mã xem phòng, Tên khách
    if (search) {
      query = query.or(`tour_code.ilike.%${search}%,customer_name.ilike.%${search}%`);
    }

    const { data: tours, error, count } = await query
      .order("created_at", { ascending: false })
      .range(offset, offset + limitNum - 1);

    if (error) throw error;

    res.json({
      tours,
      total: count || 0,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil((count || 0) / limitNum),
    });
  } catch (err) {
    console.error("Error fetching tours:", err);
    res.status(500).json({ error: "Lỗi server khi lấy lịch hẹn xem phòng" });
  }
});

// POST /api/visit-tours - Đặt lịch xem phòng (Mapping UI: AppointmentForm)
router.post("/", authenticate, async (req: AuthRequest, res: Response) => {
  const { customer_name, customer_phone, customer_email, appointment_date, appointment_time, building_id, room_id, assigned_to_name, message } = req.body;
  
  if (!customer_name || !customer_phone || !appointment_date || !appointment_time || !building_id) {
    return res.status(400).json({ error: "Thiếu thông tin bắt buộc" });
  }

  const supabase = getSupabase();
  try {
    // Tự động tạo mã tour (VT-XXXXX)
    const tourCode = `VT${Math.floor(1000 + Math.random() * 9000)}`;

    const { data, error } = await supabase
      .from("visit_tours")
      .insert({
        tour_code: tourCode,
        customer_name,
        customer_phone,
        customer_email,
        appointment_date,
        appointment_time,
        building_id,
        room_id: room_id || null,
        message,
        status: 'pending'
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: "Lỗi server khi đặt lịch" });
  }
});

// PUT /api/visit-tours/:id - Cập nhật trạng thái
router.put("/:id", authenticate, async (req: AuthRequest, res: Response) => {
  const supabase = getSupabase();
  try {
    const { data, error } = await supabase
      .from("visit_tours")
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

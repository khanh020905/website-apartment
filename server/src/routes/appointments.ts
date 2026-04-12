import { Router, Response, Request } from "express";
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

interface PublicTourPayload {
  listing_id?: string;
  customer_name?: string;
  customer_phone?: string;
  customer_email?: string;
  appointment_date?: string;
  appointment_time?: string;
  message?: string;
}

const isValidISODate = (value: string) => {
  const parsed = new Date(value);
  return !Number.isNaN(parsed.getTime());
};

const isValidTime = (value: string) => /^([01]\d|2[0-3]):([0-5]\d)$/.test(value);

const isRlsInsertError = (error: unknown) => {
  if (!error || typeof error !== "object") return false;
  const pgError = error as { code?: string; message?: string };
  const message = (pgError.message || "").toLowerCase();
  return pgError.code === "42501" || message.includes("row-level security policy");
};

// POST /api/visit-tours/public - Đặt lịch xem từ trang listings (không cần đăng nhập)
router.post("/public", async (req: Request, res: Response) => {
  const {
    listing_id,
    customer_name,
    customer_phone,
    customer_email,
    appointment_date,
    appointment_time,
    message,
  } = req.body as PublicTourPayload;

  const normalizedListingId = listing_id?.trim();
  const normalizedName = customer_name?.trim();
  const normalizedPhone = customer_phone?.trim();
  const normalizedEmail = customer_email?.trim() || null;
  const normalizedDate = appointment_date?.trim();
  const normalizedTime = appointment_time?.trim();
  const normalizedMessage = message?.trim() || null;

  if (!normalizedListingId || !normalizedName || !normalizedPhone || !normalizedDate || !normalizedTime) {
    return res.status(400).json({ error: "Thiếu thông tin bắt buộc" });
  }
  if (!isValidISODate(normalizedDate)) {
    return res.status(400).json({ error: "Ngày hẹn không hợp lệ" });
  }
  if (!isValidTime(normalizedTime)) {
    return res.status(400).json({ error: "Giờ hẹn không hợp lệ (HH:mm)" });
  }

  const supabase = getSupabase();

  try {
    const { data: listing, error: listingError } = await supabase
      .from("listings")
      .select("id, status, room_id")
      .eq("id", normalizedListingId)
      .single();

    if (listingError || !listing) {
      return res.status(404).json({ error: "Không tìm thấy tin đăng" });
    }
    if (listing.status !== "approved") {
      return res.status(400).json({ error: "Tin đăng chưa sẵn sàng để đặt lịch xem" });
    }
    if (!listing.room_id) {
      return res.status(400).json({ error: "Tin đăng chưa gắn phòng cụ thể" });
    }

    const { data: room, error: roomError } = await supabase
      .from("rooms")
      .select("id, building_id, status")
      .eq("id", listing.room_id)
      .single();

    if (roomError || !room) {
      return res.status(404).json({ error: "Không tìm thấy phòng của tin đăng" });
    }
    if (room.status !== "available") {
      return res.status(409).json({ error: "Phòng này hiện không còn trống để xem" });
    }

    const tourCode = `VT${Math.floor(10000 + Math.random() * 90000)}`;
    const { data, error } = await supabase
      .from("visit_tours")
      .insert({
        tour_code: tourCode,
        customer_name: normalizedName,
        customer_phone: normalizedPhone,
        customer_email: normalizedEmail,
        appointment_date: normalizedDate,
        appointment_time: normalizedTime,
        building_id: room.building_id,
        room_id: room.id,
        message: normalizedMessage,
        status: "pending",
      })
      .select("id, tour_code, appointment_date, appointment_time, status")
      .single();

    if (error) throw error;

    return res.status(201).json({
      tour: data,
      message: "Đặt lịch xem thành công. Nhân viên sẽ xác nhận lại với bạn.",
    });
  } catch (err) {
    console.error("Error creating public visit tour:", err);
    if (isRlsInsertError(err)) {
      return res.status(500).json({
        error:
          "DB đang chặn quyền tạo lịch xem công khai (RLS). Vui lòng chạy migration mới nhất cho reservations/visit_tours.",
      });
    }
    return res.status(500).json({ error: "Lỗi server khi tạo lịch xem phòng" });
  }
});

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

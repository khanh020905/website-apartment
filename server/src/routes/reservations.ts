import { Router, Response, Request } from "express";
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

interface PublicReservationPayload {
  listing_id?: string;
  customer_name?: string;
  customer_phone?: string;
  customer_email?: string;
  check_in_date?: string;
  expected_check_out?: string;
  deposit_amount?: number | string;
  notes?: string;
}

const isValidISODate = (value: string) => {
  const parsed = new Date(value);
  return !Number.isNaN(parsed.getTime());
};

const isBrokenPaymentStatusConstraintError = (error: unknown) => {
  if (!error || typeof error !== "object") return false;
  const pgError = error as { code?: string; message?: string; constraint?: string };
  const message = pgError.message || "";
  const constraint = pgError.constraint || "";
  if (pgError.code !== "23514") return false;
  return (
    constraint.includes("reservations_status_check1") ||
    message.includes("reservations_status_check1") ||
    (message.includes("payment_status") && message.includes("reservations"))
  );
};

const isRlsInsertError = (error: unknown) => {
  if (!error || typeof error !== "object") return false;
  const pgError = error as { code?: string; message?: string };
  const message = (pgError.message || "").toLowerCase();
  return pgError.code === "42501" || message.includes("row-level security policy");
};

// POST /api/reservations/public - Giữ chỗ từ trang listings (không cần đăng nhập)
router.post("/public", async (req: Request, res: Response) => {
  const {
    listing_id,
    customer_name,
    customer_phone,
    customer_email,
    check_in_date,
    expected_check_out,
    deposit_amount,
    notes,
  } = req.body as PublicReservationPayload;

  const normalizedListingId = listing_id?.trim();
  const normalizedName = customer_name?.trim();
  const normalizedPhone = customer_phone?.trim();
  const normalizedEmail = customer_email?.trim() || null;
  const normalizedCheckInDate = check_in_date?.trim();
  const normalizedExpectedCheckout = expected_check_out?.trim() || null;
  const normalizedNotes = notes?.trim() || null;
  const parsedDeposit = Number(deposit_amount ?? 0);

  if (!normalizedListingId || !normalizedName || !normalizedPhone || !normalizedCheckInDate) {
    return res.status(400).json({ error: "Thiếu thông tin bắt buộc" });
  }
  if (!isValidISODate(normalizedCheckInDate)) {
    return res.status(400).json({ error: "Ngày nhận phòng không hợp lệ" });
  }
  if (normalizedExpectedCheckout && !isValidISODate(normalizedExpectedCheckout)) {
    return res.status(400).json({ error: "Ngày trả phòng dự kiến không hợp lệ" });
  }
  if (Number.isNaN(parsedDeposit) || parsedDeposit < 0) {
    return res.status(400).json({ error: "Tiền cọc không hợp lệ" });
  }

  const supabase = getSupabase();

  try {
    const { data: listing, error: listingError } = await supabase
      .from("listings")
      .select("id, title, status, room_id, price")
      .eq("id", normalizedListingId)
      .single();

    if (listingError || !listing) {
      return res.status(404).json({ error: "Không tìm thấy tin đăng" });
    }
    if (listing.status !== "approved") {
      return res.status(400).json({ error: "Tin đăng chưa sẵn sàng để giữ chỗ" });
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
      return res.status(409).json({ error: "Phòng này hiện không còn trống để giữ chỗ" });
    }

    const reservationCode = `NTRE${Math.floor(100000 + Math.random() * 900000)}`;
    const { data, error } = await supabase
      .from("reservations")
      .insert({
        reservation_code: reservationCode,
        customer_name: normalizedName,
        customer_phone: normalizedPhone,
        customer_email: normalizedEmail,
        check_in_date: normalizedCheckInDate,
        expected_check_out: normalizedExpectedCheckout,
        deposit_amount: parsedDeposit,
        rent_amount: listing.price || 0,
        room_id: room.id,
        building_id: room.building_id,
        notes: normalizedNotes,
        status: "confirmed",
      })
      .select("id, reservation_code, check_in_date, status")
      .single();

    if (error) throw error;

    return res.status(201).json({
      reservation: data,
      message: "Đã giữ chỗ thành công. Chủ trọ sẽ liên hệ bạn sớm.",
    });
  } catch (err) {
    console.error("Error creating public reservation:", err);
    if (isRlsInsertError(err)) {
      return res.status(500).json({
        error:
          "DB đang chặn quyền tạo giữ chỗ công khai (RLS). Vui lòng chạy migration mới nhất cho reservations/visit_tours.",
      });
    }
    if (isBrokenPaymentStatusConstraintError(err)) {
      return res.status(500).json({
        error:
          "Hệ thống đặt chỗ đang bị lệch cấu hình dữ liệu (payment_status). Vui lòng chạy migration sửa constraint rồi thử lại.",
      });
    }
    return res.status(500).json({ error: "Lỗi server khi tạo yêu cầu giữ chỗ" });
  }
});

// GET /api/reservations - Danh sách đặt chỗ (Dùng cho cả Hiện tại & Lịch sử)
router.get("/", authenticate, async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: "Chưa xác thực" });

  const {
    page = "1",
    limit = "20",
    search = "",
    status,
    statuses,
    room_ids,
    building_id,
    start_date,
    end_date
  } = req.query as ReservationQueryParams & { statuses?: string, room_ids?: string };

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

    if (statuses) {
      query = query.in("status", statuses.split(","));
    } else if (status) {
      query = query.eq("status", status);
    }
    
    if (room_ids) {
      query = query.in("room_id", room_ids.split(","));
    }
    
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
  const { 
    customer_name, customer_phone, customer_email, check_in_date, expected_check_out, 
    deposit_amount, rent_amount, room_id, building_id, notes,
    identity_number, customer_zalo, guest_count, rent_cycle, payment_cycle, payment_method, transaction_date
  } = req.body;
  
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
        expected_check_out: expected_check_out || null,
        deposit_amount: deposit_amount || 0,
        rent_amount: rent_amount || 0,
        room_id,
        building_id,
        notes,
        status: 'confirmed',
        
        identity_number: identity_number || null,
        customer_zalo: customer_zalo || null,
        guest_count: guest_count || 1,
        rent_cycle: rent_cycle || 'Chưa cấu hình',
        payment_cycle: payment_cycle || '1 tháng',
        payment_method: payment_method || 'transfer',
        transaction_date: transaction_date || null
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    console.error("Error creating reservation:", err);
    if (isBrokenPaymentStatusConstraintError(err)) {
      return res.status(500).json({
        error:
          "Hệ thống đặt chỗ đang bị lệch cấu hình dữ liệu (payment_status). Vui lòng chạy migration sửa constraint rồi thử lại.",
      });
    }
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

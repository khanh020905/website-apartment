import { Router, Response } from "express";
import { getSupabase } from "../lib/supabase";
import { authenticate } from "../middleware/auth";
import type { AuthRequest } from "../middleware/auth";

const router = Router();

// Mapping UI -> DB: Biển số, Loại xe, Trạng thái, Toà nhà
interface VehicleQueryParams {
  page?: string;
  limit?: string;
  search?: string;
  vehicle_type?: 'xe_may' | 'xe_hoi' | 'xe_dap' | 'xe_dien' | '';
  status?: 'active' | 'inactive' | '';
  building_id?: string;
}

// GET /api/vehicles - List + Search + Filter + Pagination
router.get("/", authenticate, async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: "Chưa xác thực" });

  const {
    page = "1",
    limit = "20",
    search = "",
    vehicle_type,
    status,
    building_id,
  } = req.query as VehicleQueryParams;

  const pageNum = Math.max(1, parseInt(page) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 20));
  const offset = (pageNum - 1) * limitNum;

  const supabase = getSupabase();

  try {
    let query = supabase
      .from("vehicles")
      .select(
        `
        id,
        vehicle_type,
        license_plate,
        vehicle_name,
        color,
        status,
        created_at,
        customer:customer_id (id, tenant_name, tenant_phone),
        room:room_id (id, room_number),
        building:building_id (id, name, owner_id)
      `,
        { count: "exact" }
      )
      .eq("building.owner_id", req.user.id);

    // Filter theo UI: Loại phương tiện & Trạng thái
    if (vehicle_type) query = query.eq("vehicle_type", vehicle_type);
    if (status) query = query.eq("status", status);
    if (building_id) query = query.eq("building_id", building_id);

    // Search theo UI: Biển số, Tên khách, Tên xe, Số phòng
    if (search) {
      query = query.or(
        `license_plate.ilike.%${search}%,vehicle_name.ilike.%${search}%,customer.tenant_name.ilike.%${search}%,room.room_number.ilike.%${search}%`
      );
    }

    const { data: vehicles, error, count } = await query
      .order("created_at", { ascending: false })
      .range(offset, offset + limitNum - 1);

    if (error) throw error;

    res.json({
      vehicles,
      total: count || 0,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil((count || 0) / limitNum),
    });
  } catch (err) {
    console.error("Error fetching vehicles:", err);
    res.status(500).json({ error: "Lỗi server khi lấy phương tiện" });
  }
});

// GET /api/vehicles/:id
router.get("/:id", authenticate, async (req: AuthRequest, res: Response) => {
  const supabase = getSupabase();
  try {
    const { data, error } = await supabase
      .from("vehicles")
      .select("*, customer:customer_id(*), room:room_id(*), building:building_id(*)")
      .eq("id", req.params.id)
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(404).json({ error: "Không tìm thấy phương tiện" });
  }
});

// POST /api/vehicles - Bulk create or single create
router.post("/", authenticate, async (req: AuthRequest, res: Response) => {
  const body = req.body;
  const vehiclesToInsert = Array.isArray(body) ? body : [body];

  if (vehiclesToInsert.length === 0) {
    return res.status(400).json({ error: "Thiếu thông tin phương tiện" });
  }

  // Validate presence of required fields for all items
  for (const v of vehiclesToInsert) {
    if (!v.customer_id || !v.room_id || !v.building_id || !v.vehicle_type || !v.license_plate) {
      return res.status(400).json({ error: "Thiếu thông tin bắt buộc trong một hoặc nhiều phương tiện" });
    }
  }

  const supabase = getSupabase();
  try {
    const { data, error } = await supabase
      .from("vehicles")
      .insert(vehiclesToInsert.map(v => ({
        customer_id: v.customer_id,
        room_id: v.room_id,
        building_id: v.building_id,
        vehicle_type: v.vehicle_type,
        license_plate: v.license_plate,
        vehicle_name: v.vehicle_name,
        color: v.color,
        status: v.status || 'active'
      })))
      .select();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    console.error("Vehicle creation error:", err);
    res.status(500).json({ error: "Lỗi server khi tạo phương tiện" });
  }
});

// PUT /api/vehicles/:id - Mapping UI form "Sửa phương tiện"
router.put("/:id", authenticate, async (req: AuthRequest, res: Response) => {
  const supabase = getSupabase();
  try {
    const { data, error } = await supabase
      .from("vehicles")
      .update(req.body)
      .eq("id", req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Lỗi server khi cập nhật phương tiện" });
  }
});

// DELETE /api/vehicles/:id
router.delete("/:id", authenticate, async (req: AuthRequest, res: Response) => {
  const supabase = getSupabase();
  try {
    const { error } = await supabase.from("vehicles").delete().eq("id", req.params.id);
    if (error) throw error;
    res.json({ message: "Đã xóa phương tiện thành công" });
  } catch (err) {
    res.status(500).json({ error: "Lỗi server khi xóa phương tiện" });
  }
});

export default router;

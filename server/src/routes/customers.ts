import { Router, Response } from "express";
import { getSupabase } from "../lib/supabase";
import { authenticate } from "../middleware/auth";
import type { AuthRequest } from "../middleware/auth";

const router = Router();

interface CustomerQueryParams {
	page?: string;
	limit?: string;
	search?: string;
	status?: "active" | "terminated";
	building_id?: string;
	gender?: "male" | "female" | "other";
	residence_status?: "pending" | "completed" | "not_registered";
}

// GET /api/customers — List all customers (profiles linked to landlord's contracts)
router.get("/", authenticate, async (req: AuthRequest, res: Response) => {
	if (!req.user) {
		res.status(401).json({ error: "Chưa xác thực" });
		return;
	}

	const {
		page = "1",
		limit = "20",
		search = "",
		status,
		building_id,
		gender,
		residence_status,
	} = req.query as CustomerQueryParams;

	const pageNum = Math.max(1, parseInt(page) || 1);
	const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 20));
	const offset = (pageNum - 1) * limitNum;

	const supabase = getSupabase();

	try {
		// Build query for contracts with related data
		let query = supabase
			.from("contracts")
			.select(
				`
        id,
        tenant_name,
        tenant_phone,
        tenant_email,
        tenant_gender,
        tenant_id_number,
        residence_status,
        start_date,
        end_date,
        rent_amount,
        deposit_amount,
        status,
        created_at,
        rooms!inner(
          id,
          room_number,
          floor,
          building_id,
          buildings!inner(
            id,
            name,
            owner_id
          )
        )
      `,
				{ count: "exact" },
			)
			.eq("rooms.buildings.owner_id", req.user.id);

		// Apply filters
		if (status) {
			query = query.eq("status", status);
		}

		if (building_id) {
			query = query.eq("rooms.building_id", building_id);
		}

		if (gender) {
			query = query.eq("tenant_gender", gender);
		}

		if (residence_status) {
			query = query.eq("residence_status", residence_status);
		}

		if (search) {
			query = query.or(
				`tenant_name.ilike.%${search}%,tenant_phone.ilike.%${search}%,tenant_email.ilike.%${search}%`,
			);
		}

		// Execute paginated query
		const {
			data: customers,
			error,
			count,
		} = await query.order("created_at", { ascending: false }).range(offset, offset + limitNum - 1);

		if (error) {
			res.status(400).json({ error: error.message });
			return;
		}

		// Get stats (total, active, terminated)
		const { data: allContracts } = await supabase
			.from("contracts")
			.select(
				`
        status,
        rooms!inner(
          buildings!inner(owner_id)
        )
      `,
			)
			.eq("rooms.buildings.owner_id", req.user.id);

		const stats = {
			total: allContracts?.length || 0,
			active: allContracts?.filter((c) => c.status === "active").length || 0,
			terminated: allContracts?.filter((c) => c.status === "terminated").length || 0,
		};

		// Transform data for frontend
		const transformedCustomers =
			customers?.map((c) => ({
				id: c.id,
				tenant_name: c.tenant_name,
				tenant_phone: c.tenant_phone,
				tenant_email: c.tenant_email,
				tenant_gender: c.tenant_gender,
				tenant_id_number: c.tenant_id_number,
				residence_status: c.residence_status,
				start_date: c.start_date,
				end_date: c.end_date,
				rent_amount: c.rent_amount,
				deposit_amount: c.deposit_amount,
				status: c.status,
				created_at: c.created_at,
				room: {
					id: (c.rooms as any).id,
					room_number: (c.rooms as any).room_number,
					floor: (c.rooms as any).floor,
					building_id: (c.rooms as any).building_id,
					building: {
						id: (c.rooms as any).buildings.id,
						name: (c.rooms as any).buildings.name,
					},
				},
			})) || [];

		res.json({
			customers: transformedCustomers,
			total: count || 0,
			page: pageNum,
			limit: limitNum,
			totalPages: Math.ceil((count || 0) / limitNum),
			stats,
		});
	} catch (err) {
		console.error("Error fetching customers:", err);
		res.status(500).json({ error: "Lỗi server khi lấy danh sách khách hàng" });
	}
});

// GET /api/customers/export — Export all customers for Excel
router.get("/export", authenticate, async (req: AuthRequest, res: Response) => {
	if (!req.user) {
		res.status(401).json({ error: "Chưa xác thực" });
		return;
	}

	const supabase = getSupabase();

	try {
		const { data: customers, error } = await supabase
			.from("contracts")
			.select(
				`
        id,
        tenant_name,
        tenant_phone,
        tenant_email,
        tenant_gender,
        tenant_id_number,
        residence_status,
        start_date,
        end_date,
        rent_amount,
        deposit_amount,
        status,
        created_at,
        rooms!inner(
          room_number,
          floor,
          buildings!inner(
            name,
            owner_id
          )
        )
      `,
			)
			.eq("rooms.buildings.owner_id", req.user.id)
			.order("created_at", { ascending: false });

		if (error) {
			res.status(400).json({ error: error.message });
			return;
		}

		// Transform for export
		const exportData =
			customers?.map((c) => ({
				"Tên khách hàng": c.tenant_name,
				"Số điện thoại": c.tenant_phone || "",
				"Email": c.tenant_email || "",
				"Giới tính":
					c.tenant_gender === "male" ? "Nam"
					: c.tenant_gender === "female" ? "Nữ"
					: "Khác",
				"CCCD/Hộ chiếu": c.tenant_id_number || "",
				"Phòng": (c.rooms as any).room_number,
				"Tầng": (c.rooms as any).floor,
				"Toà nhà": (c.rooms as any).buildings.name,
				"Trạng thái tạm trú":
					c.residence_status === "completed" ? "Đã đăng ký"
					: c.residence_status === "pending" ? "Đang chờ"
					: "Chưa đăng ký",
				"Trạng thái": c.status === "active" ? "Đang ở" : "Đã chuyển đi",
				"Ngày bắt đầu": c.start_date,
				"Ngày kết thúc": c.end_date || "",
				"Tiền thuê": c.rent_amount,
				"Tiền cọc": c.deposit_amount,
			})) || [];

		res.json({ data: exportData });
	} catch (err) {
		console.error("Error exporting customers:", err);
		res.status(500).json({ error: "Lỗi server khi xuất dữ liệu" });
	}
});

// GET /api/customers/rooms — Get available rooms for dropdown
router.get("/rooms", authenticate, async (req: AuthRequest, res: Response) => {
	if (!req.user) {
		res.status(401).json({ error: "Chưa xác thực" });
		return;
	}

	const supabase = getSupabase();

	try {
		const { data: rooms, error } = await supabase
			.from("rooms")
			.select(
				`
        id,
        room_number,
        floor,
        status,
        building_id,
        buildings!inner(
          id,
          name,
          owner_id
        )
      `,
			)
			.eq("buildings.owner_id", req.user.id)
			.order("room_number");

		if (error) {
			res.status(400).json({ error: error.message });
			return;
		}

		res.json({ rooms });
	} catch (err) {
		console.error("Error fetching rooms:", err);
		res.status(500).json({ error: "Lỗi server" });
	}
});

export default router;

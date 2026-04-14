import { NextFunction, Request, Router, Response } from "express";
import multer from "multer";
import { getSupabase } from "../lib/supabase";
import { authenticate } from "../middleware/auth";
import type { AuthRequest } from "../middleware/auth";
import { CUSTOMER_SYNC_FIELDS, type CustomerSyncFieldKey } from "../../../shared/customerSyncFields";

const router = Router();
const CUSTOMER_AVATAR_BUCKET = "customer-avatars";
const MAX_AVATAR_FILE_SIZE = 3 * 1024 * 1024;
const ALLOWED_AVATAR_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

interface CustomerQueryParams {
	page?: string;
	limit?: string;
	search?: string;
	status?: "active" | "terminated";
	building_id?: string;
	room_id?: string;
	gender?: "male" | "female" | "other";
	residence_status?: "pending" | "completed" | "not_registered";
}

interface CustomerImportRow {
	building_name?: string;
	room_number?: string;
	room_id?: string;
	tenant_name?: string;
	tenant_phone?: string;
	tenant_email?: string;
	tenant_gender?: "male" | "female" | "other" | string;
	tenant_dob?: string;
	tenant_id_number?: string;
	tenant_job?: string;
	tenant_nationality?: string;
	tenant_city?: string;
	tenant_district?: string;
	tenant_ward?: string;
	tenant_address?: string;
	residence_status?: "pending" | "completed" | "not_registered" | string;
	tenant_notes?: string;
	tenant_avatar?: string;
	start_date?: string;
	end_date?: string;
	rent_amount?: string | number;
	deposit_amount?: string | number;
}

const normalizeText = (value: unknown): string => {
	if (typeof value !== "string") return "";
	return value.trim();
};

const normalizeLookup = (value: string): string =>
	value
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.toLowerCase()
		.replace(/\s+/g, " ")
		.trim();

const toOptionalText = (value: unknown): string | null => {
	const text = normalizeText(value);
	return text.length > 0 ? text : null;
};

const toDateString = (value: unknown): string | null => {
	const text = normalizeText(value);
	if (!text) return null;
	if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;

	const parsed = new Date(text);
	if (Number.isNaN(parsed.getTime())) return null;

	const year = parsed.getFullYear();
	const month = `${parsed.getMonth() + 1}`.padStart(2, "0");
	const day = `${parsed.getDate()}`.padStart(2, "0");
	return `${year}-${month}-${day}`;
};

const toNumber = (value: unknown): number | null => {
	if (typeof value === "number" && Number.isFinite(value)) return value;
	if (typeof value !== "string") return null;
	const normalized = value.replace(/[,\s]/g, "");
	if (!normalized) return null;
	const parsed = Number(normalized);
	return Number.isFinite(parsed) ? parsed : null;
};

const normalizeGender = (value: unknown): "male" | "female" | "other" | null => {
	const text = normalizeLookup(normalizeText(value));
	if (!text) return null;
	if (text === "male" || text === "nam") return "male";
	if (text === "female" || text === "nu") return "female";
	if (text === "other" || text === "khac") return "other";
	return null;
};

const normalizeResidenceStatus = (value: unknown): "pending" | "completed" | "not_registered" => {
	const text = normalizeLookup(normalizeText(value));
	if (!text) return "not_registered";
	if (text === "pending" || text === "dang cho") return "pending";
	if (text === "completed" || text === "da dang ky") return "completed";
	return "not_registered";
};

const buildSyncExportRow = (contract: any): Record<string, unknown> => {
	const room = contract.rooms as any;
	const values: Partial<Record<CustomerSyncFieldKey, unknown>> = {
		building_name: room?.buildings?.name || "",
		room_number: room?.room_number || "",
		tenant_name: contract.tenant_name || "",
		tenant_phone: contract.tenant_phone || "",
		tenant_email: contract.tenant_email || "",
		tenant_gender: contract.tenant_gender || "",
		tenant_dob: contract.tenant_dob || "",
		tenant_id_number: contract.tenant_id_number || "",
		tenant_job: contract.tenant_job || "",
		tenant_nationality: contract.tenant_nationality || "",
		tenant_city: contract.tenant_city || "",
		tenant_district: contract.tenant_district || "",
		tenant_ward: contract.tenant_ward || "",
		tenant_address: contract.tenant_address || "",
		residence_status: contract.residence_status || "not_registered",
		start_date: contract.start_date || "",
		end_date: contract.end_date || "",
		rent_amount: contract.rent_amount ?? "",
		deposit_amount: contract.deposit_amount ?? "",
		tenant_notes: contract.tenant_notes || "",
		tenant_avatar: contract.tenant_avatar || "",
	};

	return CUSTOMER_SYNC_FIELDS.reduce(
		(acc, field) => {
			acc[field.label] = values[field.key] ?? "";
			return acc;
		},
		{} as Record<string, unknown>,
	);
};

const avatarUpload = multer({
	storage: multer.memoryStorage(),
	limits: {
		fileSize: MAX_AVATAR_FILE_SIZE,
		files: 1,
	},
	fileFilter: (_req, file, cb) => {
		if (!ALLOWED_AVATAR_MIME_TYPES.has(file.mimetype)) {
			cb(new Error("Chỉ chấp nhận ảnh JPG, PNG hoặc WebP"));
			return;
		}
		cb(null, true);
	},
});

function uploadCustomerAvatar(req: Request, res: Response, next: NextFunction): void {
	avatarUpload.single("avatar")(req, res, (err: unknown) => {
		if (!err) {
			next();
			return;
		}

		if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
			res.status(400).json({ error: "Ảnh đại diện tối đa 3MB" });
			return;
		}

		const message = err instanceof Error ? err.message : "Upload ảnh đại diện thất bại";
		res.status(400).json({ error: message });
	});
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
		room_id,
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
        tenant_dob,
        tenant_job,
        tenant_nationality,
        tenant_city,
        tenant_district,
        tenant_ward,
        tenant_address,
        tenant_avatar,
        tenant_notes,
        tenant_id_number,
        tenant_id_issue_date,
        tenant_id_expiry_date,
        tenant_id_issue_place,
        tenant_id_front_url,
        tenant_id_back_url,
        tenant_residence_url,
        residence_status,
        start_date,
        end_date,
        rent_amount,
        deposit_amount,
        status,
        created_at,
        landlord_id,
        rooms(
          id,
          room_number,
          floor,
          building_id,
          buildings(
            id,
            name,
            owner_id
          )
        )
      `,
				{ count: "exact" },
			)
		if (req.user.role !== "admin") {
			query = query.eq("landlord_id", req.user.id);
		}

		// Apply filters
		if (status === "transient") {
            query = query.is("room_id", null);
        } else if (status) {
			query = query.eq("status", status);
		}

		if (building_id) {
			query = query.eq("rooms.building_id", building_id);
		}

		if (room_id) {
			query = query.eq("room_id", room_id);
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

		// Get stats (total, active, terminated, transient)
		let statsQuery = supabase
			.from("contracts")
			.select("status, landlord_id, room_id");

		if (req.user.role !== "admin") {
			statsQuery = statsQuery.eq("landlord_id", req.user.id);
		}

		const { data: allContracts } = await statsQuery;

		const stats = {
			total: allContracts?.length || 0,
			active: allContracts?.filter((c) => c.status === "active").length || 0,
			terminated: allContracts?.filter((c) => c.status === "terminated").length || 0,
            transient: allContracts?.filter((c) => !c.room_id).length || 0,
		};

		// Transform data for frontend
		const transformedCustomers =
			customers?.map((c) => ({
				id: c.id,
				tenant_name: c.tenant_name,
				tenant_phone: c.tenant_phone,
				tenant_email: c.tenant_email,
				tenant_gender: c.tenant_gender,
				tenant_dob: c.tenant_dob,
				tenant_job: c.tenant_job,
				tenant_nationality: c.tenant_nationality,
				tenant_city: c.tenant_city,
				tenant_district: c.tenant_district,
				tenant_ward: c.tenant_ward,
				tenant_address: c.tenant_address,
				tenant_avatar: c.tenant_avatar,
				tenant_notes: c.tenant_notes,
				tenant_id_number: c.tenant_id_number,
				residence_status: c.residence_status,
				start_date: c.start_date,
				end_date: c.end_date,
				rent_amount: c.rent_amount,
				deposit_amount: c.deposit_amount,
				status: c.status,
				created_at: c.created_at,
				room: c.rooms ? {
					id: (c.rooms as any).id,
					room_number: (c.rooms as any).room_number,
					floor: (c.rooms as any).floor,
					building_id: (c.rooms as any).building_id,
					building: (c.rooms as any).buildings ? {
						id: (c.rooms as any).buildings.id,
						name: (c.rooms as any).buildings.name,
					} : null,
				} : null,
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

// GET /api/customers/:id — Get a single customer profile
router.get("/:id", authenticate, async (req: AuthRequest, res: Response) => {
	if (!req.user) {
		res.status(401).json({ error: "Chưa xác thực" });
		return;
	}

	const { id } = req.params;
	const supabase = getSupabase();

	try {
		const { data: customer, error } = await supabase
			.from("contracts")
			.select(`
        id,
        tenant_name,
        tenant_phone,
        tenant_email,
        tenant_gender,
        tenant_dob,
        tenant_job,
        tenant_nationality,
        tenant_city,
        tenant_district,
        tenant_ward,
        tenant_address,
        tenant_avatar,
        tenant_notes,
        tenant_id_number,
        tenant_id_issue_date,
        tenant_id_expiry_date,
        tenant_id_issue_place,
        tenant_id_front_url,
        tenant_id_back_url,
        tenant_residence_url,
        residence_status,
        start_date,
        end_date,
        rent_amount,
        deposit_amount,
        status,
        created_at,
        landlord_id,
        rooms(
          id,
          room_number,
          floor,
          building_id,
          buildings(
            id,
            name,
            owner_id
          )
        ),
        vehicles(
          id,
          vehicle_type,
          license_plate,
          vehicle_name,
          color
        )
      `)
			.eq("id", id)
			.eq("landlord_id", req.user.id)
			.single();

		if (error) {
            console.error("Supabase error fetching customer detail:", error);
			res.status(error.code === 'PGRST116' ? 404 : 500).json({ 
                error: error.code === 'PGRST116' ? "Không tìm thấy khách hàng" : "Lỗi truy vấn dữ liệu",
                details: error 
            });
			return;
		}

		// Transform for frontend
        // Fetch Real Stats for this customer
        const { data: reservations } = await supabase
            .from("reservations")
            .select("id")
            .eq("customer_phone", (customer as any).tenant_phone);

        const { data: invoices } = await supabase
            .from("invoices")
            .select("status, total_amount")
            .eq("room_id", (customer as any).room_id)
            .eq("customer_name", (customer as any).tenant_name);

        const stats = {
            totalBookings: reservations?.length || 0,
            paidInvoices: invoices?.filter((i: any) => i.status === 'paid').length || 0,
            totalDebt: invoices?.filter((i: any) => i.status !== 'paid').reduce((sum: number, i: any) => sum + (Number(i.total_amount) || 0), 0) || 0,
            totalRevenue: invoices?.filter((i: any) => i.status === 'paid').reduce((sum: number, i: any) => sum + (Number(i.total_amount) || 0), 0) || 0,
            depositAmount: Number((customer as any).deposit_amount) || 0,
            prepayments: 0 // Placeholder
        };

		const transformed = {
			...customer,
            stats,
			room: (customer as any).rooms ? {
				id: (customer as any).rooms.id,
				room_number: (customer as any).rooms.room_number,
				floor: (customer as any).rooms.floor,
				building_id: (customer as any).rooms.building_id,
				building: (customer as any).rooms.buildings ? {
					id: (customer as any).rooms.buildings.id,
					name: (customer as any).rooms.buildings.name,
				} : null,
			} : null,
		};

		res.json({ customer: transformed });
	} catch (err) {
		console.error("Error fetching customer detail:", err);
		res.status(500).json({ error: "Lỗi server" });
	}
});

// POST /api/customers — Create a new customer profile (stored as a contract record)
router.post("/", authenticate, async (req: AuthRequest, res: Response) => {
	if (!req.user) {
		res.status(401).json({ error: "Chưa xác thực" });
		return;
	}

	const {
		tenant_name,
      tenant_phone,
      tenant_email,
      tenant_gender,
      tenant_dob,
      tenant_job,
      tenant_nationality,
      tenant_city,
      tenant_district,
      tenant_ward,
      tenant_address,
      tenant_notes,
      tenant_avatar,
      tenant_id_number,
	} = req.body;

	if (!tenant_name) {
		res.status(400).json({ error: "Thiếu tên khách hàng" });
		return;
	}

	const supabase = getSupabase();

	try {
		const { data: customer, error } = await supabase
			.from("contracts")
			.insert({
				landlord_id: req.user.id,
				tenant_name,
				tenant_phone: tenant_phone || null,
				tenant_email: tenant_email || null,
				tenant_gender: tenant_gender || null,
				tenant_dob: tenant_dob || null,
				tenant_job: tenant_job || null,
				tenant_nationality: tenant_nationality || "Vietnam",
				tenant_city: tenant_city || null,
				tenant_district: tenant_district || null,
				tenant_ward: tenant_ward || null,
				tenant_address: tenant_address || null,
				tenant_avatar: tenant_avatar || null,
				tenant_notes: tenant_notes || null,
				tenant_id_number: tenant_id_number || null,
				status: "active", // Default status
				residence_status: "not_registered",
				start_date: new Date().toISOString().split("T")[0], // Default start date
				rent_amount: 0, // Default rent
				room_id: null, // No room assigned by default
			})
			.select()
			.single();

		if (error) {
			res.status(400).json({ error: error.message });
			return;
		}

		res.json({ message: "Đã tạo khách hàng thành công", customer });
	} catch (err) {
		console.error("Error creating customer:", err);
		res.status(500).json({ error: "Lỗi server khi tạo khách hàng" });
	}
});

// PUT /api/customers/:id — Update customer profile
router.put("/:id", authenticate, async (req: AuthRequest, res: Response) => {
	if (!req.user) {
		res.status(401).json({ error: "Chưa xác thực" });
		return;
	}

	const { id } = req.params;
	const updates = req.body;

	const supabase = getSupabase();

	try {
		const { data: customer, error } = await supabase
			.from("contracts")
			.update(updates)
			.eq("id", id)
			.eq("landlord_id", req.user.id)
			.select()
			.single();

		if (error) {
			res.status(400).json({ error: error.message });
			return;
		}

		res.json({ message: "Đã cập nhật thông tin khách hàng", customer });
	} catch (err) {
		console.error("Error updating customer:", err);
		res.status(500).json({ error: "Lỗi server khi cập nhật khách hàng" });
	}
});

// DELETE /api/customers/:id — Delete a customer profile
router.delete("/:id", authenticate, async (req: AuthRequest, res: Response) => {
	if (!req.user) {
		res.status(401).json({ error: "Chưa xác thực" });
		return;
	}

	const { id } = req.params;
	const supabase = getSupabase();

	try {
		const { error } = await supabase
			.from("contracts")
			.delete()
			.eq("id", id)
			.eq("landlord_id", req.user.id);

		if (error) {
			res.status(400).json({ error: error.message });
			return;
		}

		res.json({ message: "Đã xóa khách hàng thành công" });
	} catch (err) {
		console.error("Error deleting customer:", err);
		res.status(500).json({ error: "Lỗi server khi xóa khách hàng" });
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
		let exportQuery = supabase
			.from("contracts")
			.select(
				`
        id,
        tenant_name,
        tenant_phone,
        tenant_email,
        tenant_gender,
        tenant_dob,
        tenant_id_number,
        tenant_job,
        tenant_nationality,
        tenant_city,
        tenant_district,
        tenant_ward,
        tenant_address,
        tenant_notes,
        tenant_avatar,
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
			.order("created_at", { ascending: false });

		if (req.user.role !== "admin") {
			exportQuery = exportQuery.eq("rooms.buildings.owner_id", req.user.id);
		}

		const { data: customers, error } = await exportQuery;

		if (error) {
			res.status(400).json({ error: error.message });
			return;
		}

		const exportData = customers?.map((c) => buildSyncExportRow(c)) || [];

		res.json({ data: exportData });
	} catch (err) {
		console.error("Error exporting customers:", err);
		res.status(500).json({ error: "Lỗi server khi xuất dữ liệu" });
	}
});

// POST /api/customers/import — Bulk import customers/contracts from excel rows
router.post("/import", authenticate, async (req: AuthRequest, res: Response) => {
	if (!req.user) {
		res.status(401).json({ error: "Chưa xác thực" });
		return;
	}

	const rows = Array.isArray(req.body?.rows) ? (req.body.rows as CustomerImportRow[]) : [];
	if (rows.length === 0) {
		res.status(400).json({ error: "Không có dữ liệu để import" });
		return;
	}
	if (rows.length > 500) {
		res.status(400).json({ error: "Chỉ hỗ trợ tối đa 500 dòng mỗi lần import" });
		return;
	}

	const supabase = getSupabase();
	const isAdmin = req.user.role === "admin";

	type RoomRecord = {
		id: string;
		room_number: string;
		status: string;
		buildings: { name: string; owner_id: string } | { name: string; owner_id: string }[] | null;
	};

	try {
		let roomQuery = supabase
			.from("rooms")
			.select(
				`
        id,
        room_number,
        status,
        buildings!inner(
          name,
          owner_id
        )
      `,
			)
			.order("room_number", { ascending: true });

		if (!isAdmin) {
			roomQuery = roomQuery.eq("buildings.owner_id", req.user.id);
		}

		const { data: roomData, error: roomError } = await roomQuery;
		if (roomError) {
			res.status(400).json({ error: roomError.message });
			return;
		}

		const rooms = (roomData || []) as RoomRecord[];
		const roomById = new Map<
			string,
			{ id: string; roomNumber: string; status: string; buildingName: string; ownerId: string }
		>();
		const roomByNumber = new Map<
			string,
			Array<{ id: string; roomNumber: string; status: string; buildingName: string; ownerId: string }>
		>();
		const roomByBuildingAndNumber = new Map<
			string,
			{ id: string; roomNumber: string; status: string; buildingName: string; ownerId: string }
		>();

		for (const room of rooms) {
			const building = Array.isArray(room.buildings) ? room.buildings[0] : room.buildings;
			if (!building) continue;
			const record = {
				id: room.id,
				roomNumber: room.room_number,
				status: room.status,
				buildingName: building.name,
				ownerId: building.owner_id,
			};
			roomById.set(record.id, record);

			const roomKey = normalizeLookup(record.roomNumber);
			const byNumberList = roomByNumber.get(roomKey) || [];
			byNumberList.push(record);
			roomByNumber.set(roomKey, byNumberList);

			const buildingAndRoomKey = `${normalizeLookup(record.buildingName)}::${roomKey}`;
			roomByBuildingAndNumber.set(buildingAndRoomKey, record);
		}

		const results: Array<{
			row: number;
			status: "success" | "error";
			message: string;
			contract_id?: string;
		}> = [];

		let imported = 0;
		let failed = 0;

		for (let i = 0; i < rows.length; i += 1) {
			const row = rows[i];
			const rowIndex = i + 2;

			const tenantName = normalizeText(row.tenant_name);
			if (!tenantName) {
				results.push({ row: rowIndex, status: "error", message: "Thiếu tên khách hàng" });
				failed += 1;
				continue;
			}
			const tenantPhone = normalizeText(row.tenant_phone);
			if (!tenantPhone) {
				results.push({ row: rowIndex, status: "error", message: "Thiếu số điện thoại" });
				failed += 1;
				continue;
			}

			const roomId = normalizeText(row.room_id);
			const roomNumber = normalizeText(row.room_number);
			const buildingName = normalizeText(row.building_name);
			let resolvedRoom:
				| { id: string; roomNumber: string; status: string; buildingName: string; ownerId: string }
				| undefined;

			if (roomId) {
				resolvedRoom = roomById.get(roomId);
			} else if (roomNumber && buildingName) {
				const key = `${normalizeLookup(buildingName)}::${normalizeLookup(roomNumber)}`;
				resolvedRoom = roomByBuildingAndNumber.get(key);
			} else if (roomNumber) {
				const candidates = roomByNumber.get(normalizeLookup(roomNumber)) || [];
				if (candidates.length === 1) {
					resolvedRoom = candidates[0];
				} else if (candidates.length > 1) {
					results.push({
						row: rowIndex,
						status: "error",
						message: "Số phòng bị trùng ở nhiều tòa, vui lòng điền thêm tên tòa nhà",
					});
					failed += 1;
					continue;
				}
			}

			if (!resolvedRoom) {
				results.push({
					row: rowIndex,
					status: "error",
					message: "Không tìm thấy phòng phù hợp (kiểm tra tên tòa, số phòng hoặc room_id)",
				});
				failed += 1;
				continue;
			}

			if (resolvedRoom.status === "occupied") {
				results.push({
					row: rowIndex,
					status: "error",
					message: `Phòng ${resolvedRoom.roomNumber} (${resolvedRoom.buildingName}) đang có người ở`,
				});
				failed += 1;
				continue;
			}

			const startDate = toDateString(row.start_date);
			if (!startDate) {
				results.push({
					row: rowIndex,
					status: "error",
					message: "Ngày bắt đầu không hợp lệ (định dạng YYYY-MM-DD)",
				});
				failed += 1;
				continue;
			}

			const rentAmount = toNumber(row.rent_amount);
			if (!rentAmount || rentAmount <= 0) {
				results.push({
					row: rowIndex,
					status: "error",
					message: "Tiền thuê phải là số lớn hơn 0",
				});
				failed += 1;
				continue;
			}

			const depositAmount = toNumber(row.deposit_amount) || 0;
			const landlordId = isAdmin ? resolvedRoom.ownerId : req.user.id;
			const endDate = toDateString(row.end_date);
			const gender = normalizeGender(row.tenant_gender);
			const residenceStatus = normalizeResidenceStatus(row.residence_status);

			const { data: contract, error: createError } = await supabase
				.from("contracts")
				.insert({
					room_id: resolvedRoom.id,
					landlord_id: landlordId,
					tenant_name: tenantName,
					tenant_phone: tenantPhone,
					tenant_email: toOptionalText(row.tenant_email),
					tenant_gender: gender,
					tenant_dob: toDateString(row.tenant_dob),
					tenant_job: toOptionalText(row.tenant_job),
					tenant_nationality: toOptionalText(row.tenant_nationality) || "Việt Nam",
					tenant_city: toOptionalText(row.tenant_city),
					tenant_district: toOptionalText(row.tenant_district),
					tenant_ward: toOptionalText(row.tenant_ward),
					tenant_address: toOptionalText(row.tenant_address),
					tenant_notes: toOptionalText(row.tenant_notes),
					tenant_avatar: toOptionalText(row.tenant_avatar),
					tenant_id_number: toOptionalText(row.tenant_id_number),
					residence_status: residenceStatus,
					start_date: startDate,
					end_date: endDate,
					rent_amount: rentAmount,
					deposit_amount: depositAmount,
					notes: toOptionalText(row.tenant_notes),
					status: "active",
				})
				.select("id")
				.single();

			if (createError || !contract) {
				results.push({
					row: rowIndex,
					status: "error",
					message: createError?.message || "Không thể tạo hợp đồng",
				});
				failed += 1;
				continue;
			}

			const { error: roomUpdateError } = await supabase
				.from("rooms")
				.update({ status: "occupied" })
				.eq("id", resolvedRoom.id);

			if (roomUpdateError) {
				await supabase.from("contracts").delete().eq("id", contract.id);
				results.push({
					row: rowIndex,
					status: "error",
					message: "Không thể cập nhật trạng thái phòng sau khi tạo hợp đồng",
				});
				failed += 1;
				continue;
			}

			resolvedRoom.status = "occupied";
			imported += 1;
			results.push({
				row: rowIndex,
				status: "success",
				message: `Đã tạo hợp đồng cho ${tenantName}`,
				contract_id: contract.id,
			});
		}

		res.json({
			imported,
			failed,
			total: rows.length,
			results,
		});
	} catch (err) {
		console.error("Error importing customers:", err);
		res.status(500).json({ error: "Lỗi server khi import khách hàng" });
	}
});

// POST /api/customers/upload-avatar — Upload customer avatar and return public URL
router.post("/upload-avatar", authenticate, uploadCustomerAvatar, async (req: AuthRequest, res: Response) => {
	if (!req.user) {
		res.status(401).json({ error: "Chưa xác thực" });
		return;
	}

	const file = req.file;
	if (!file) {
		res.status(400).json({ error: "Vui lòng chọn 1 ảnh đại diện" });
		return;
	}

	const supabase = getSupabase();
	const { data: bucket, error: bucketError } = await supabase.storage.getBucket(CUSTOMER_AVATAR_BUCKET);
	if (bucketError && !bucketError.message.toLowerCase().includes("not found")) {
		res.status(400).json({ error: `Không thể kiểm tra bucket ảnh đại diện: ${bucketError.message}` });
		return;
	}

	if (!bucket) {
		const { error: createBucketError } = await supabase.storage.createBucket(CUSTOMER_AVATAR_BUCKET, {
			public: true,
			fileSizeLimit: `${MAX_AVATAR_FILE_SIZE}`,
			allowedMimeTypes: Array.from(ALLOWED_AVATAR_MIME_TYPES),
		});
		if (createBucketError && !createBucketError.message.toLowerCase().includes("already exists")) {
			res.status(400).json({ error: `Không thể tạo bucket ảnh đại diện: ${createBucketError.message}` });
			return;
		}
	}

	const extension =
		file.mimetype === "image/png" ? "png"
		: file.mimetype === "image/webp" ? "webp"
		: "jpg";
	const filePath = `${req.user.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extension}`;

	const { error: uploadError } = await supabase.storage.from(CUSTOMER_AVATAR_BUCKET).upload(filePath, file.buffer, {
		contentType: file.mimetype,
		upsert: false,
	});
	if (uploadError) {
		res.status(400).json({ error: uploadError.message });
		return;
	}

	const { data: publicUrlData } = supabase.storage.from(CUSTOMER_AVATAR_BUCKET).getPublicUrl(filePath);
	res.json({ url: publicUrlData.publicUrl });
});

// GET /api/customers/rooms — Get available rooms for dropdown
router.get("/rooms", authenticate, async (req: AuthRequest, res: Response) => {
	if (!req.user) {
		res.status(401).json({ error: "Chưa xác thực" });
		return;
	}

	const supabase = getSupabase();

	try {
		const { building_id } = req.query as { building_id?: string };

		let query = supabase
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
			.order("room_number");

		if (req.user.role !== "admin") {
			query = query.eq("buildings.owner_id", req.user.id);
		}
		if (building_id) {
			query = query.eq("building_id", building_id);
		}

		const { data: rooms, error } = await query;

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

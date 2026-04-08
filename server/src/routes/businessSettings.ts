import { Router, Response } from "express";
import { getSupabase } from "../lib/supabase";
import { authenticate } from "../middleware/auth";
import type { AuthRequest } from "../middleware/auth";

const router = Router();

// GET /api/business-settings
// Lấy cài đặt doanh nghiệp
router.get("/", authenticate, async (req: AuthRequest, res: Response) => {
	if (!req.user) {
		res.status(401).json({ error: "Chưa xác thực" });
		return;
	}

	try {
		const supabase = getSupabase();
		const { data, error } = await supabase
			.from("business_settings")
			.select("*")
			.eq("owner_id", req.user.id)
			.single();

		if (error) {
			if (error.code === "PGRST116") {
				// Initialize an empty record for this user if it doesn't exist
				const newRec = {
					owner_id: req.user.id,
				};
				const { data: inserted, error: insertErr } = await supabase
					.from("business_settings")
					.insert(newRec)
					.select()
					.single();
				if (insertErr) {
					res.status(400).json({ error: insertErr.message });
					return;
				}
				res.json({ settings: inserted });
				return;
			}
			res.status(400).json({ error: error.message });
			return;
		}

		res.json({ settings: data });
	} catch (err: any) {
		res.status(500).json({ error: "Lỗi máy chủ r" });
	}
});

// PUT /api/business-settings
// Cập nhật cài đặt
router.put("/", authenticate, async (req: AuthRequest, res: Response) => {
	if (!req.user) {
		res.status(401).json({ error: "Chưa xác thực" });
		return;
	}

	try {
		const supabase = getSupabase();
		
		const payload = {
			...req.body,
			owner_id: req.user.id,
			updated_at: new Date().toISOString(),
		};

		const { data, error } = await supabase
			.from("business_settings")
			.upsert(payload, { onConflict: "owner_id" })
			.select()
			.single();

		if (error) {
			res.status(400).json({ error: error.message });
			return;
		}

		res.json({ settings: data });
	} catch (err: any) {
		res.status(500).json({ error: "Lỗi máy chủ khi cập nhật dữ liệu" });
	}
});

export default router;

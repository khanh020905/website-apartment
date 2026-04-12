import { Router, Response } from "express";
import { getSupabase } from "../lib/supabase";
import { authenticate } from "../middleware/auth";
import type { AuthRequest } from "../middleware/auth";

const router = Router();
const DEFAULT_PRIMARY_COLOR = "#0f9b9b";
const DEFAULT_TEXT_COLOR = "#000000";
const isHexColor = (value: string) => /^#([0-9a-f]{6})$/i.test(value);
const normalizeColor = (value: unknown, fallback: string): string => {
	if (typeof value !== "string") return fallback;
	const normalized = value.trim().toLowerCase();
	return isHexColor(normalized) ? normalized : fallback;
};

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
					primary_color: DEFAULT_PRIMARY_COLOR,
					text_color: DEFAULT_TEXT_COLOR,
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

		const rawPrimary = typeof data.primary_color === "string" ? data.primary_color.trim().toLowerCase() : "";
		const rawText = typeof data.text_color === "string" ? data.text_color.trim().toLowerCase() : "";
		const isLegacyPrimary = rawPrimary === "#ffba38";
		const normalizedPrimary = isLegacyPrimary ? DEFAULT_PRIMARY_COLOR : normalizeColor(data.primary_color, DEFAULT_PRIMARY_COLOR);
		const normalizedText = normalizeColor(data.text_color, DEFAULT_TEXT_COLOR);
		const shouldNormalize = rawPrimary !== normalizedPrimary || rawText !== normalizedText;

		if (shouldNormalize) {
			const { data: normalizedSettings, error: normalizeError } = await supabase
				.from("business_settings")
				.update({
					primary_color: normalizedPrimary,
					text_color: normalizedText,
					updated_at: new Date().toISOString(),
				})
				.eq("owner_id", req.user.id)
				.select("*")
				.single();

			if (!normalizeError && normalizedSettings) {
				res.json({ settings: normalizedSettings });
				return;
			}
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

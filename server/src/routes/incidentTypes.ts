import { Router, Response } from "express";
import { getSupabase } from "../lib/supabase";
import { authenticate } from "../middleware/auth";
import type { AuthRequest } from "../middleware/auth";

const router = Router();

// GET /api/incident-types
router.get("/", authenticate, async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: "Chưa xác thực" });
  const { building_id } = req.query;
  const supabase = getSupabase();
  try {
    let query = supabase.from("incident_types").select("*");
    if (building_id) query = query.eq("building_id", building_id);
    const { data, error } = await query;
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Lỗi server khi lấy loại sự cố" });
  }
});

// POST /api/incident-types
router.post("/", authenticate, async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: "Chưa xác thực" });
  const { building_id, name, icon, default_assignee, status } = req.body;
  const supabase = getSupabase();
  try {
    const { data, error } = await supabase
      .from("incident_types")
      .insert({ building_id, name, icon, default_assignee, status: status || 'active' })
      .select()
      .single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: "Lỗi server khi tạo loại sự cố" });
  }
});

export default router;

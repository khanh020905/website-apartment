import { Router, Response } from "express";
import { getSupabase } from "../lib/supabase";
import { authenticate } from "../middleware/auth";
import type { AuthRequest } from "../middleware/auth";

const router = Router();

// GET /api/incidents
router.get("/", authenticate, async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: "Chưa xác thực" });
  const { building_id, status, priority, type_id } = req.query;
  const supabase = getSupabase();
  try {
    let query = supabase
      .from("incidents")
      .select(`
        *,
        type:type_id (name, icon),
        room:room_id (room_number)
      `)
      .order("created_at", { ascending: false });

    if (building_id) query = query.eq("building_id", building_id);
    if (status) query = query.eq("status", status);
    if (priority) query = query.eq("priority", priority);
    if (type_id) query = query.eq("type_id", type_id);

    const { data, error } = await query;
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Lỗi server khi lấy danh sách sự cố" });
  }
});

// POST /api/incidents
router.post("/", authenticate, async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: "Chưa xác thực" });
  const supabase = getSupabase();
  try {
    const { data, error } = await supabase
      .from("incidents")
      .insert({ ...req.body, reported_by: req.user.id })
      .select()
      .single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: "Lỗi server khi báo sự cố" });
  }
});

export default router;

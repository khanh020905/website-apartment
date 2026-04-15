import { Router, Response } from "express";
import { getSupabase } from "../lib/supabase";
import { authenticate } from "../middleware/auth";
import type { AuthRequest } from "../middleware/auth";

const router = Router();

// GET /api/incident-types?building_id=...
router.get("/", authenticate, async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: "Chưa xác thực" });
  
  const { building_id } = req.query;
  const supabase = getSupabase();

  try {
    let query = supabase.from("incident_types").select("*").order("created_at", { ascending: false });
    
    if (building_id) {
      query = query.eq("building_id", building_id);
    }

    const { data: incidentTypes, error } = await query;
    if (error) throw error;

    res.json(incidentTypes);
  } catch (error) {
    res.status(500).json({ error: "Không thể lấy loại sự cố" });
  }
});

// POST /api/incident-types
router.post("/", authenticate, async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: "Chưa xác thực" });
  
  const { building_id, name, name_en, description, icon, default_assignee } = req.body;
  if (!name) {
    return res.status(400).json({ error: "Thiếu dữ liệu: name" });
  }

  const supabase = getSupabase();
  try {
    const { data, error } = await supabase
      .from("incident_types")
      .insert({
        building_id,
        name,
        name_en,
        description,
        icon,
        default_assignee,
        status: "active"
      })
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Lỗi tạo loại sự cố" });
  }
});

// PUT /api/incident-types/:id
router.put("/:id", authenticate, async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: "Chưa xác thực" });

  const { id } = req.params;
  const updates = req.body;
  const supabase = getSupabase();

  try {
    const { data, error } = await supabase
      .from("incident_types")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Lỗi cập nhật loại sự cố" });
  }
});

// DELETE /api/incident-types/:id
router.delete("/:id", authenticate, async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: "Chưa xác thực" });

  const { id } = req.params;
  const supabase = getSupabase();

  try {
    const { error } = await supabase
      .from("incident_types")
      .delete()
      .eq("id", id);

    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Lỗi xoá loại sự cố" });
  }
});

export default router;

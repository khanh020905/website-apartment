import { Router, Response } from "express";
import { getSupabase } from "../lib/supabase";
import { authenticate } from "../middleware/auth";
import type { AuthRequest } from "../middleware/auth";

const router = Router();

// GET /api/integrations
router.get("/", authenticate, async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: "Chưa xác thực" });

  const supabase = getSupabase();
  try {
    const { data, error } = await supabase
      .from("integrations")
      .select("*")
      .eq("owner_id", req.user.id);

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Lỗi server khi lấy integrations" });
  }
});

// POST /api/integrations
router.post("/", authenticate, async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: "Chưa xác thực" });
  const { service_id, config } = req.body;

  const supabase = getSupabase();
  try {
    // Upsert integration
    const { data, error } = await supabase
      .from("integrations")
      .upsert(
        { owner_id: req.user.id, service_id, config, is_connected: true, updated_at: new Date().toISOString() },
        { onConflict: "owner_id,service_id" }
      )
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Lỗi khi lưu cấu hình tích hợp" });
  }
});

// DELETE /api/integrations/:service_id
router.delete("/:service_id", authenticate, async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: "Chưa xác thực" });

  const supabase = getSupabase();
  try {
    const { error } = await supabase
      .from("integrations")
      .delete()
      .match({ owner_id: req.user.id, service_id: req.params.service_id });

    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Lỗi ngắt kết nối tích hợp" });
  }
});

export default router;

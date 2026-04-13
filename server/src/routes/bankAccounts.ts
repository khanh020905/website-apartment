import { Router, Response } from "express";
import { getSupabase } from "../lib/supabase";
import { authenticate } from "../middleware/auth";
import type { AuthRequest } from "../middleware/auth";

const router = Router();

// GET /api/bank-accounts - Lấy danh sách tài khoản NH của user hiện tại
router.get("/", authenticate, async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: "Chưa xác thực" });
  const supabase = getSupabase();
  try {
    const { data, error } = await supabase
      .from("bank_accounts")
      .select("*")
      .eq("owner_id", req.user.id)
      .order("is_default", { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Lỗi server khi lấy tài khoản" });
  }
});

// POST /api/bank-accounts - Thêm tài khoản mới
router.post("/", authenticate, async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: "Chưa xác thực" });
  const { bank_name, account_name, account_number, branch, is_default } = req.body;
  const supabase = getSupabase();
  try {
    // Nếu đặt là mặc định, reset các tk khác
    if (is_default) {
      await supabase.from("bank_accounts").update({ is_default: false }).eq("owner_id", req.user.id);
    }
    const { data, error } = await supabase
      .from("bank_accounts")
      .insert({
        bank_name,
        account_name,
        account_number,
        branch,
        is_default: is_default || false,
        owner_id: req.user.id
      })
      .select()
      .single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: "Lỗi server khi thêm tài khoản" });
  }
});

// DELETE /api/bank-accounts/:id
router.delete("/:id", authenticate, async (req: AuthRequest, res: Response) => {
  const supabase = getSupabase();
  try {
    const { error } = await supabase.from("bank_accounts").delete().eq("id", req.params.id);
    if (error) throw error;
    res.json({ message: "Đã xóa" });
  } catch (err) {
    res.status(500).json({ error: "Lỗi khi xóa" });
  }
});

export default router;

import { Router, Response } from "express";
import { getSupabase } from "../lib/supabase";
import { authenticate } from "../middleware/auth";
import type { AuthRequest } from "../middleware/auth";

const router = Router();

// GET /api/payment-proofs
router.get("/", authenticate, async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: "Chưa xác thực" });

  const { search, status, limit, page } = req.query;
  const pageNum = parseInt(page as string) || 1;
  const limitNum = parseInt(limit as string) || 20;
  const offset = (pageNum - 1) * limitNum;

  const supabase = getSupabase();

  try {
    let query = supabase
      .from("payment_proofs")
      .select(`
        *,
        invoice:invoice_id(invoice_code, check_in_date, total_amount, building!inner(id, owner_id))
      `, { count: "exact" })
      .eq("invoice.building.owner_id", req.user.id);

    if (status) {
      query = query.eq("status", status);
    }
    if (search) {
      query = query.or(`customer_name.ilike.%${search}%`);
    }

    const { data: proofs, count, error } = await query
      .order("created_at", { ascending: false })
      .range(offset, offset + limitNum - 1);

    if (error) throw error;

    res.json({
      proofs,
      total: count || 0,
      page: pageNum,
      limit: limitNum,
    });
  } catch (error) {
    res.status(500).json({ error: "Lỗi Server" });
  }
});

// POST /api/payment-proofs
router.post("/", authenticate, async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: "Chưa xác thực" });

  const { invoice_id, customer_name, amount, image_url } = req.body;

  const supabase = getSupabase();
  try {
    const { data, error } = await supabase
      .from("payment_proofs")
      .insert({
        invoice_id,
        customer_name,
        amount,
        image_url,
        status: "pending"
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: "Lỗi tạo minh chứng" });
  }
});

// PUT /api/payment-proofs/:id
router.put("/:id", authenticate, async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: "Chưa xác thực" });

  const { id } = req.params;
  const { status, reject_reason } = req.body;

  const supabase = getSupabase();
  try {
    const { data, error } = await supabase
      .from("payment_proofs")
      .update({
        status,
        reviewer_id: req.user.id,
        reject_reason
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Lỗi cập nhật minh chứng" });
  }
});

export default router;

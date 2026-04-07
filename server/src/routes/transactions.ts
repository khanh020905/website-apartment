import { Router, Response } from "express";
import { getSupabase } from "../lib/supabase";
import { authenticate } from "../middleware/auth";
import type { AuthRequest } from "../middleware/auth";

const router = Router();

// Mapping UI -> DB cho Transactions
interface TransactionQueryParams {
  page?: string;
  limit?: string;
  search?: string;
  flow?: 'income' | 'expense' | '';
  status?: string;
  building_id?: string;
  payment_method?: string;
}

// GET /api/transactions - Danh sách thu chi
router.get("/", authenticate, async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: "Chưa xác thực" });

  const {
    page = "1",
    limit = "20",
    search = "",
    flow,
    status,
    building_id,
    payment_method
  } = req.query as TransactionQueryParams;

  const pageNum = Math.max(1, parseInt(page) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 20));
  const offset = (pageNum - 1) * limitNum;

  const supabase = getSupabase();

  try {
    let query = supabase
      .from("transactions")
      .select(
        `
        *,
        room:room_id (id, room_number),
        building:building_id (id, name, owner_id)
      `,
        { count: "exact" }
      )
      .eq("building.owner_id", req.user.id);

    if (flow) query = query.eq("flow", flow);
    if (status) query = query.eq("status", status);
    if (building_id) query = query.eq("building_id", building_id);
    if (payment_method) query = query.eq("payment_method", payment_method);

    // Search theo UI: Mã GD, Khách hàng, Hoá đơn, Toà nhà
    if (search) {
      query = query.or(`transaction_code.ilike.%${search}%,customer_name.ilike.%${search}%,note.ilike.%${search}%`);
    }

    const { data: transactions, error, count } = await query
      .order("transaction_date", { ascending: false })
      .range(offset, offset + limitNum - 1);

    if (error) throw error;

    // Tính toán thống kê theo UI (Lợi nhuận, Tổng thu, Tổng chi)
    const { data: totalData } = await supabase
      .from("transactions")
      .select("flow, amount, building_id")
      .eq("building.owner_id", req.user.id);

    const income = totalData?.filter(t => t.flow === 'income').reduce((s, t) => s + Number(t.amount), 0) || 0;
    const expense = totalData?.filter(t => t.flow === 'expense').reduce((s, t) => s + Number(t.amount), 0) || 0;

    res.json({
      transactions,
      total: count || 0,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil((count || 0) / limitNum),
      stats: {
        income,
        expense,
        profit: income - expense
      }
    });
  } catch (err) {
    res.status(500).json({ error: "Lỗi server khi lấy giao dịch" });
  }
});

// POST /api/transactions - Tạo giao dịch mới (Mapping UI: TransactionForm)
router.post("/", authenticate, async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: "Chưa xác thực" });
  const { building_id, room_id, customer_name, flow, category, payment_method, amount, status, note, transaction_date } = req.body;
  
  const supabase = getSupabase();
  try {
    const txCode = `TX-${Math.floor(10000 + Math.random() * 90000)}`;

    const { data, error } = await supabase
      .from("transactions")
      .insert({
        transaction_code: txCode,
        building_id,
        room_id,
        customer_name,
        flow,
        category,
        payment_method,
        amount,
        status: status || 'pending',
        note,
        transaction_date: transaction_date || new Date().toISOString().split('T')[0],
        created_by: req.user.id
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: "Lỗi server khi tạo giao dịch" });
  }
});

export default router;

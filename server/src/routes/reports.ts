import { Router, Response } from "express";
import { getSupabase } from "../lib/supabase";
import { authenticate } from "../middleware/auth";
import type { AuthRequest } from "../middleware/auth";

const router = Router();

// GET /api/reports/revenue
router.get("/revenue", authenticate, async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: "Chưa xác thực" });

  const supabase = getSupabase();

  try {
    const { data: txs } = await supabase
      .from("transactions")
      .select("amount, transaction_date, category, flow, building_id");

    const { data: invoices } = await supabase
      .from("invoices")
      .select("status, total_amount, due_date");

    // 1. Revenue
    const monthlyData = Array.from({ length: 12 }).map((_, i) => ({
      name: `Th ${i + 1}`,
      room: 0,
      service: 0,
      utility: 0,
      total: 0,
    }));

    let totalServiceRevenue = 0;
    let totalRoomRevenue = 0;
    let totalUtilityRevenue = 0;
    let totalOtherRevenue = 0;

    const cashflowDaily = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return { 
        name: `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth()+1).padStart(2, '0')}`,
        dateStr: d.toISOString().split('T')[0],
        in: 0, 
        out: 0 
      };
    });

    let cashflowIn = 0;
    let cashflowOut = 0;

    if (txs) {
      txs.forEach((tx) => {
        const d = new Date(tx.transaction_date);
        const monthIndex = d.getMonth();
        const amount = Number(tx.amount) || 0;
        const cat = (tx.category || "").toUpperCase();

        if (tx.flow === "income") {
          cashflowIn += amount;
          if (cat.includes("PHONG") || cat.includes("RENTAL")) {
            monthlyData[monthIndex].room += amount;
            totalRoomRevenue += amount;
          } else if (cat.includes("DIEN_NUOC") || cat.includes("TIEN_ICH") || cat.includes("UTILITY")) {
            monthlyData[monthIndex].utility += amount;
            totalUtilityRevenue += amount;
          } else if (cat.includes("DICH_VU") || cat.includes("SERVICE")) {
            monthlyData[monthIndex].service += amount;
            totalServiceRevenue += amount;
          } else {
            monthlyData[monthIndex].service += amount;
            totalOtherRevenue += amount;
          }
          monthlyData[monthIndex].total += amount;

          // daily cashflow
          const matchDay = cashflowDaily.find(c => c.dateStr === tx.transaction_date.split('T')[0]);
          if (matchDay) matchDay.in += amount;
        } else {
          cashflowOut += amount;
          const matchDay = cashflowDaily.find(c => c.dateStr === tx.transaction_date.split('T')[0]);
          if (matchDay) matchDay.out += amount;
        }
      });
    }

    const pieData = [
      { name: "Tiền phòng", value: totalRoomRevenue || 50, color: "#3b82f6" },
      { name: "Dịch vụ", value: totalServiceRevenue || 20, color: "#f59e0b" },
      { name: "Tiện ích", value: totalUtilityRevenue || 30, color: "#10b981" },
    ];

    // 2. Invoices summary
    let invTotal = 0;
    let invPaid = 0;
    let invPending = 0;
    let invOverdue = 0;

    if (invoices) {
      invoices.forEach(inv => {
        const amt = Number(inv.total_amount) || 0;
        invTotal += amt;
        if (inv.status === 'paid') invPaid += amt;
        else if (inv.status === 'pending') invPending += amt;
        else if (inv.status === 'overdue') invOverdue += amt;
      });
    }

    res.json({
      monthly: monthlyData,
      pie: pieData,
      stats: {
        room: totalRoomRevenue,
        service: totalServiceRevenue,
        utility: totalUtilityRevenue,
        other: totalOtherRevenue
      },
      invoiceStats: {
        total: invTotal,
        paid: invPaid,
        pending: invPending,
        overdue: invOverdue,
        totalCount: invoices?.length || 0,
        overdueCount: invoices?.filter(i => i.status === 'overdue').length || 0
      },
      cashflow: {
        daily: cashflowDaily,
        in: cashflowIn,
        out: cashflowOut,
        balance: cashflowIn - cashflowOut
      }
    });
  } catch (err) {
    res.status(500).json({ error: "Lỗi server khi thống kê doanh thu" });
  }
});

// GET /api/reports/customer
router.get("/customer", authenticate, async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: "Chưa xác thực" });

  const supabase = getSupabase();
  try {
    const { data: invoices } = await supabase
      .from("invoices")
      .select("*, room:room_id(room_number), building:building_id(name)");
    
    let total = 0, paid = 0, pending = 0;

    if (invoices) {
      invoices.forEach(inv => {
        const amt = Number(inv.total_amount) || 0;
        total += amt;
        if (inv.status === 'paid') paid += amt;
        else pending += amt;
      });
    }

    res.json({
      summary: { total, paid, pending },
      invoices: invoices || []
    });

  } catch (err) {
    res.status(500).json({ error: "Lỗi cấu trúc dữ liệu khách hàng" });
  }
});

export default router;

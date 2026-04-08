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

// GET /api/reports/occupancy
router.get("/occupancy", authenticate, async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: "Chưa xác thực" });

  const supabase = getSupabase();
  try {
    const { data: rooms } = await supabase
      .from("rooms")
      .select("id, status, building_id, building:building_id(owner_id)")
      .eq("building.owner_id", req.user.id);

    let totalRooms = 0;
    let occupiedRooms = 0;

    if (rooms) {
      // Because to filter by owner_id in join we might get null for unmatched
      const validRooms = rooms.filter(r => r.building); 
      totalRooms = validRooms.length;
      occupiedRooms = validRooms.filter(r => r.status === 'rented').length;
    }

    const availableRooms = totalRooms - occupiedRooms;
    const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

    const chartData = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return { 
        name: `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth()+1).padStart(2, '0')}`,
        value: occupancyRate // Mock historical data using current rate for now
      };
    });

    res.json({
      stats: {
        rate: occupancyRate,
        occupied: occupiedRooms,
        total: totalRooms,
        available: availableRooms,
        new_checkins: 0
      },
      chart: chartData
    });

  } catch (err) {
    res.status(500).json({ error: "Lỗi cấu trúc dữ liệu vận hành" });
  }
});

// GET /api/reports/owner
router.get("/owner", authenticate, async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: "Chưa xác thực" });

  const supabase = getSupabase();
  try {
    const { data: invoices } = await supabase
      .from("invoices")
      .select(`
        id, amount, status, type, created_at,
        contract:contract_id(room:room_id(room_number, building:building_id(name)))
      `)
      .eq("owner_id", req.user.id);

    const ownerData = (invoices || []).map(inv => {
      // Mock some detailed metrics based on invoice amount
      // In a real system, these would come from invoice_items
      const roomAmt = inv.type === 'rent' ? inv.amount : 0;
      const depositAmt = inv.type === 'deposit' ? inv.amount : 0;
      const utilityAmt = inv.type === 'utility' ? inv.amount : 0;
      
      const contract: any = Array.isArray(inv.contract) ? inv.contract[0] : inv.contract;
      const p: any = Array.isArray(contract?.room) ? contract.room[0] : contract?.room;
      const b: any = Array.isArray(p?.building) ? p.building[0] : p?.building;
      return {
        id: inv.id,
        building: b?.name || 'Chưa rõ',
        room: p?.room_number || 'Chưa rõ',
        room_amount: roomAmt,
        old_debt: 0,
        deposit: depositAmt,
        extras: utilityAmt,
        discount: 0,
        owner_payout: inv.status === 'paid' ? inv.amount : 0,
        platform_collected: inv.status === 'paid' ? inv.amount : 0,
        platform_pending: inv.status === 'pending' ? inv.amount : 0,
        status: inv.status
      };
    });

    res.json(ownerData);
  } catch (err) {
    res.status(500).json({ error: "Lỗi báo cáo chủ nhà" });
  }
});

export default router;

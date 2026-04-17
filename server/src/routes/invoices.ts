import { Router, Response } from "express";
import { getSupabase } from "../lib/supabase";
import { authenticate } from "../middleware/auth";
import type { AuthRequest } from "../middleware/auth";

const router = Router();

// Mapping UI -> DB cho Invoices
interface InvoiceQueryParams {
  page?: string;
  limit?: string;
  search?: string;
  status?: string;
  building_id?: string;
  month?: string;
}

// GET /api/invoices - Danh sách hoá đơn
router.get("/", authenticate, async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: "Chưa xác thực" });

  const {
    page = "1",
    limit = "20",
    search = "",
    status,
    building_id,
    month
  } = req.query as InvoiceQueryParams;

  const pageNum = Math.max(1, parseInt(page) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 20));
  const offset = (pageNum - 1) * limitNum;

  const supabase = getSupabase();

  try {
    let query = supabase
      .from("invoices")
      .select(
        `
        *,
        room:room_id (id, room_number),
        building:building_id (id, name, owner_id),
        customer:customer_id (id, tenant_name, tenant_phone),
        creator_id,
        invoice_items:invoice_items(*)
      `,
        { count: "exact" }
      )
      .eq("building.owner_id", req.user.id);

    if (status) query = query.eq("status", status);
    if (building_id) query = query.eq("building_id", building_id);
    if (month) query = query.eq("billing_month", month);

    // Search theo UI: Mã hoá đơn (Bỏ search text db đối với room và customer vì PostgREST cần join alias phức tạp)
    if (search) {
      query = query.ilike("invoice_code", `%${search}%`);
    }

    const { data: invoices, error, count } = await query
      .order("created_at", { ascending: false })
      .range(offset, offset + limitNum - 1);

    if (error) {
      console.error("GET /api/invoices query error:", error);
      throw error;
    }

    // Enrich creator details manually
    let enrichedInvoices = invoices;
    if (invoices && invoices.length > 0) {
      const creatorIds = [...new Set(invoices.map(i => i.creator_id).filter(Boolean))];
      if (creatorIds.length > 0) {
        const { data: profiles } = await getSupabase()
          .from('profiles')
          .select('id, full_name, phone, avatar_url')
          .in('id', creatorIds);
        
        if (profiles) {
          const profileMap = profiles.reduce((acc: any, p: any) => {
            acc[p.id] = p;
            return acc;
          }, {});
          
          enrichedInvoices = invoices.map(inv => ({
            ...inv,
            creator: profileMap[inv.creator_id] ? {
              display_name: profileMap[inv.creator_id].full_name,
              phone: profileMap[inv.creator_id].phone,
              avatar_url: profileMap[inv.creator_id].avatar_url
            } : null
          }));
        }
      }
    }

    // Tính toán thống kê theo UI (Tổng hoá đơn, Đã thanh toán, Chờ, Quá hạn)
    let statsQuery = supabase
      .from("invoices")
      .select('status, building:building_id(owner_id)', { count: 'exact' })
      .eq("building.owner_id", req.user.id);

    if (building_id) statsQuery = statsQuery.eq("building_id", building_id);
    if (month) statsQuery = statsQuery.eq("billing_month", month);
    
    const { data: statsData, error: statsError } = await statsQuery;
    if (statsError) console.error("Stats Error:", statsError);

    const stats = {
      total: count || 0,
      paid: enrichedInvoices?.filter(i => i.status === 'paid').length || 0,
      pending: enrichedInvoices?.filter(i => i.status === 'pending').length || 0,
      overdue: enrichedInvoices?.filter(i => i.status === 'overdue').length || 0
    };

    res.json({
      invoices: enrichedInvoices,
      total: count || 0,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil((count || 0) / limitNum),
      stats
    });
  } catch (err) {
    console.error("GET /invoices error:", err);
    res.status(500).json({ error: "Lỗi server khi lấy hoá đơn" });
  }
});

// POST /api/invoices - Tạo hoá đơn mới (Mapping UI: InvoiceForm)
router.post("/", authenticate, async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: "Chưa xác thực" });
  const { room_id, building_id, due_date, billing_month, total_amount, extra_charge, discount, has_vat, customer_name, room_number } = req.body;
  
  const supabase = getSupabase();
  try {
    const code = `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const { data, error } = await supabase
      .from("invoices")
      .insert({
        invoice_code: code,
        room_id,
        building_id,
        customer_id: req.body.customer_id, // we should pass customer_id if it's there
        due_date,
        billing_month,
        total_amount,
        extra_charge: extra_charge || 0,
        discount: discount || 0,
        has_vat: has_vat || false,
        status: 'pending',
        creator_id: req.user.id
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: "Lỗi server khi tạo hoá đơn" });
  }
});

// GET /api/invoices/batch-prepare - Chuẩn bị sinh hoá đơn hàng loạt
router.get("/batch-prepare", authenticate, async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: "Chưa xác thực" });

  const { building_id, period } = req.query as { building_id: string; period: string };
  if (!building_id || !period) {
    return res.status(400).json({ error: "Thiếu building_id hoặc period" });
  }

  const supabase = getSupabase();

  try {
    // 1. Get building services
    const { data: building, error: bError } = await supabase
      .from("buildings")
      .select("metered_services, fixed_services")
      .eq("id", building_id)
      .eq("owner_id", req.user.id)
      .single();

    if (bError || !building) {
      return res.status(404).json({ error: "Không tìm thấy toà nhà hoặc không có quyền." });
    }

    // 2. Get active contracts for the building
    const { data: contracts, error: cError } = await supabase
      .from("contracts")
      .select("id, room_id, tenant_name, rent_amount, deposit_amount, start_date, end_date, rooms!inner(room_number)")
      .eq("status", "active")
      .eq("landlord_id", req.user.id)
      .eq("rooms.building_id", building_id);

    console.log("DEBUG BATCH-PREPARE:");
    console.log("building_id:", building_id);
    console.log("req.user.id:", req.user.id);
    console.log("contracts count:", contracts?.length);
    require('fs').appendFileSync('debug_batch.txt', `[${new Date().toISOString()}] req.user: ${req.user.id}, building: ${building_id}, contracts: ${contracts?.length}\n`);

    if (cError) throw cError;

    // TODO: Ideally we should fetch the prev_period's invoice_items to get prev_index automatically.
    // For this MVP version, we'll try to find the latest invoice for each room and extract its curr_index.
    const { data: lastItems } = await supabase
      .from("invoice_items")
      .select("invoice_id, service_name, curr_index, invoices!inner(room_id, status)")
      .eq("invoices.building_id", building_id)
      .order("created_at", { ascending: false });

    const batchData = (contracts || []).map(contract => {
      const services = [];
      const room = Array.isArray(contract.rooms) ? contract.rooms[0] : contract.rooms;

      // a. Base Rent
      services.push({
        id: `rent_${contract.id}`,
        name: "Tiền phòng",
        prev: "-",
        curr: "-",
        qty: 1,
        usage: period,
        unitPrice: contract.rent_amount,
        dsco: 0,
        lineTotal: contract.rent_amount,
        hasImage: false,
        editableQty: false,
        editablePrice: true,
        type: "rent"
      });

      // b. Fixed Services
      let sid = 1;
      (building.fixed_services as any[] || []).forEach(svc => {
        services.push({
          id: `fixed_${contract.id}_${sid++}`,
          name: svc.name,
          prev: "-",
          curr: "-",
          qty: 1, // Usually 1 per room or per tenant, can be made editable
          usage: "-",
          unitPrice: svc.price,
          dsco: 0,
          lineTotal: svc.price,
          hasImage: false,
          editableQty: true,
          editablePrice: svc.price === 0,
          type: "fixed"
        });
      });

      // c. Metered Services
      (building.metered_services as any[] || []).forEach(svc => {
        // Find last index
        const lastRec = lastItems?.find(li => {
          const invData = Array.isArray(li.invoices) ? li.invoices[0] : li.invoices;
          return (invData as any)?.room_id === contract.room_id && li.service_name === svc.name;
        });
        const prevIndex = lastRec?.curr_index !== undefined ? Number(lastRec.curr_index) : 0;
        
        services.push({
          id: `metered_${contract.id}_${sid++}`,
          name: svc.name,
          prev: prevIndex,
          curr: prevIndex, // Default pointing to prev
          qty: 0,
          usage: "-",
          unitPrice: svc.price,
          dsco: 0,
          lineTotal: 0,
          hasImage: true,
          editableQty: false, // Calculated from indices
          editablePrice: false,
          type: "metered"
        });
      });

      return {
        id: contract.id, // using contract_id as row id temporarily
        room_id: contract.room_id,
        roomNumber: (room as any)?.room_number || "Unknown",
        customerName: contract.tenant_name,
        usageDate: period,
        guestCount: 1, // Might derive from tenants or form
        deposit: contract.deposit_amount || 0,
        extraDeposit: 0,
        extraCharge: 0,
        discount: 0,
        total: services.reduce((acc, curr) => acc + curr.lineTotal, 0),
        services
      };
    });

    res.json({ batchData });
  } catch (err) {
    console.error("Batch prepare error:", err);
    res.status(500).json({ error: "Lỗi sinh hoá đơn hàng loạt" });
  }
});

// POST /api/invoices/batch - Lưu hoá đơn hàng loạt
router.post("/batch", authenticate, async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: "Chưa xác thực" });

  const { building_id, period, invoices: batchInvoices, due_date } = req.body;
  if (!building_id || !period || !batchInvoices || !Array.isArray(batchInvoices)) {
    return res.status(400).json({ error: "Dữ liệu không hợp lệ" });
  }

  const supabase = getSupabase();
  try {
    const results = [];
    
    // Parse period (e.g. MM/YYYY -> YYYY-MM)
    let parsedBillingMonth = period;
    let fallbackDueDate = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    
    if (period.includes("/")) {
      const [mm, yyyy] = period.split("/");
      parsedBillingMonth = `${yyyy}-${mm}`;
      fallbackDueDate = `${yyyy}-${mm}-10`; // Default due date to 10th of the billing month
    } else if (period.includes("-")) {
      parsedBillingMonth = period;
      fallbackDueDate = `${period}-10`;
    }
    
    // Process sequentially for simplicity and safety, though a raw SQL function would be faster.
    for (const inv of batchInvoices) {
      if (inv.total <= 0) continue; // Skip 0 bill

      const code = `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

      const { data: insertedInvoice, error: invError } = await supabase
        .from("invoices")
        .insert({
          invoice_code: code,
          room_id: inv.room_id,
          building_id,
          customer_id: inv.id, // the contract id
          status: 'pending',
          due_date: due_date || fallbackDueDate,
          billing_month: parsedBillingMonth,
          extra_charge: inv.extraCharge || 0,
          discount: inv.discount || 0,
          total_amount: inv.total,
          has_vat: false,
          creator_id: req.user.id
        })
        .select()
        .single();

      if (invError) throw invError;
      results.push(insertedInvoice);

      // Now prepare items
      if (inv.services && inv.services.length > 0) {
        const itemsToInsert = inv.services.map((svc: any) => ({
          invoice_id: insertedInvoice.id,
          service_name: svc.name,
          prev_index: svc.type === 'metered' ? Number(svc.prev) || 0 : null,
          curr_index: svc.type === 'metered' ? Number(svc.curr) || 0 : null,
          quantity: Number(svc.qty) || 0,
          unit_price: Number(svc.unitPrice) || 0,
          discount_amount: Number(svc.dsco) || 0,
          line_total: Number(svc.lineTotal) || 0,
          has_image: !!svc.hasImage,
          editable_qty: !!svc.editableQty,
          editable_price: !!svc.editablePrice,
        }));

        const { error: itemsError } = await supabase
          .from("invoice_items")
          .insert(itemsToInsert);
          
        if (itemsError) throw itemsError;
      }
    }

    res.status(201).json({ message: "Đã lưu thành công", count: results.length });
  } catch (err) {
    console.error("Batch save error:", err);
    res.status(500).json({ error: "Lỗi lưu hoá đơn hàng loạt" });
  }
});

// PATCH /api/invoices/:id - Cập nhật trạng thái hoá đơn
router.patch("/:id", authenticate, async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: "Chưa xác thực" });
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    // Check if valid status
    if (!status || !['draft', 'pending', 'paid', 'partial', 'overdue', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: "Trạng thái không hợp lệ" });
    }

    const supabase = getSupabase();
    
    // Validate ownership
    const { data: invoice } = await supabase.from("invoices").select("building:building_id(owner_id)").eq("id", id).single();
    if (!invoice || (invoice.building as any)?.owner_id !== req.user.id) {
       return res.status(403).json({ error: "Không có quyền" });
    }
    
    const { data: updated, error } = await supabase
      .from("invoices")
      .update({ status })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    
    res.json({ message: "Cập nhật trạng thái thành công" });
  } catch (err) {
    console.error("Update invoice error:", err);
    res.status(500).json({ error: "Lỗi khi cập nhật hoá đơn" });
  }
});

// DELETE /api/invoices/:id - Xoá hoá đơn
router.delete("/:id", authenticate, async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: "Chưa xác thực" });
  try {
    const { id } = req.params;
    const supabase = getSupabase();
    
    // Validate ownership
    const { data: invoice } = await supabase.from("invoices").select("building:building_id(owner_id)").eq("id", id).single();
    if (!invoice || (invoice.building as any)?.owner_id !== req.user.id) {
       return res.status(403).json({ error: "Không có quyền" });
    }
    
    const { error } = await supabase
      .from("invoices")
      .delete()
      .eq("id", id);
      
    if (error) throw error;
    
    res.json({ message: "Xoá hoá đơn thành công" });
  } catch (err) {
    console.error("Delete invoice error:", err);
    res.status(500).json({ error: "Lỗi khi xoá hoá đơn" });
  }
});

export default router;

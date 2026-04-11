import { Router, Response } from 'express';
import { getSupabase } from '../lib/supabase';
import { authenticate } from '../middleware/auth';
import type { AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/contracts — List all contracts for the landlord
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  if (!req.user) { res.status(401).json({ error: 'Chưa xác thực' }); return; }

  const { data, error } = await getSupabase()
    .from('contracts')
    .select('*, rooms(room_number, building_id, buildings(name))')
    .eq('landlord_id', req.user.id)
    .order('created_at', { ascending: false });

  if (error) { res.status(400).json({ error: error.message }); return; }
  res.json({ contracts: data });
});

// POST /api/contracts — Create a new contract (marks room as occupied)
router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  if (!req.user) { res.status(401).json({ error: 'Chưa xác thực' }); return; }
  const { 
    room_id, tenant_name, tenant_phone, tenant_email, tenant_gender,
    tenant_dob, tenant_job, tenant_nationality, tenant_city,
    tenant_district, tenant_ward, tenant_address, tenant_avatar,
    tenant_notes, start_date, end_date, rent_amount, deposit_amount, notes 
  } = req.body;

  if (!room_id || !tenant_name || !start_date || !rent_amount) {
    res.status(400).json({ error: 'Thiếu thông tin bắt buộc (phòng, tên khách, ngày bắt đầu, tiền thuê)' });
    return;
  }

  const supabase = getSupabase();

  // 1. Verify ownership of the room
  const { data: room, error: roomError } = await supabase
    .from('rooms')
    .select('id, building_id, buildings(owner_id)')
    .eq('id', room_id)
    .single();

  if (roomError || !room || (room.buildings as any).owner_id !== req.user.id) {
    res.status(403).json({ error: 'Bạn không có quyền quản lý phòng này' });
    return;
  }

  // 2. Create the contract
  const { data: contract, error: contractError } = await supabase
    .from('contracts')
    .insert({
      room_id,
      landlord_id: req.user.id,
      tenant_name,
      tenant_phone: tenant_phone || null,
      tenant_email: tenant_email || null,
      tenant_gender: tenant_gender || null,
      tenant_dob: tenant_dob || null,
      tenant_job: tenant_job || null,
      tenant_nationality: tenant_nationality || 'Việt Nam',
      tenant_city: tenant_city || null,
      tenant_district: tenant_district || null,
      tenant_ward: tenant_ward || null,
      tenant_address: tenant_address || null,
      tenant_avatar: tenant_avatar || null,
      tenant_notes: tenant_notes || null,
      start_date,
      end_date: end_date || null,
      rent_amount,
      deposit_amount: deposit_amount || 0,
      notes: notes || tenant_notes || null,
      status: 'active'
    })
    .select()
    .single();

  if (contractError) { res.status(400).json({ error: contractError.message }); return; }

  // 3. Mark room as occupied
  await supabase
    .from('rooms')
    .update({ status: 'occupied' })
    .eq('id', room_id);

  res.json({ message: 'Hợp đồng đã được tạo thành công!', contract });
});

// PUT /api/contracts/:id — Update contract details
router.put('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  if (!req.user) { res.status(401).json({ error: 'Chưa xác thực' }); return; }
  const { id } = req.params;
  const updates = req.body;

  const { data, error } = await getSupabase()
    .from('contracts')
    .update(updates)
    .eq('id', id)
    .eq('landlord_id', req.user.id)
    .select()
    .single();

  if (error) { res.status(400).json({ error: error.message }); return; }
  res.json({ message: 'Đã cập nhật hợp đồng', contract: data });
});

// DELETE /api/contracts/:id — Terminate contract (marks room as available)
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  if (!req.user) { res.status(401).json({ error: 'Chưa xác thực' }); return; }
  const { id } = req.params;

  const supabase = getSupabase();

  // 1. Get contract first
  const { data: contract, error: fetchError } = await supabase
    .from('contracts')
    .select('id, room_id')
    .eq('id', id)
    .eq('landlord_id', req.user.id)
    .single();

  if (fetchError || !contract) {
    res.status(404).json({ error: 'Không tìm thấy hợp đồng' });
    return;
  }

  // 2. Terminate/Delete
  const { error: deleteError } = await supabase
    .from('contracts')
    .delete()
    .eq('id', id);

  if (deleteError) { res.status(400).json({ error: deleteError.message }); return; }

  // 3. Mark room as available
  await supabase
    .from('rooms')
    .update({ status: 'available' })
    .eq('id', contract.room_id);

  res.json({ message: 'Hợp đồng đã kết thúc. Phòng hiện đang trống.' });
});

export default router;

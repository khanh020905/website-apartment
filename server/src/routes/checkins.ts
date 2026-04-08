import { Router, Response } from 'express';
import { getSupabase } from '../lib/supabase';
import { authenticate } from '../middleware/auth';
import type { AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/checkins
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  if (!req.user) { res.status(401).json({ error: 'Chưa xác thực' }); return; }

  const { data, error } = await getSupabase()
    .from('checkins')
    .select('*')
    .eq('owner_id', req.user.id)
    .order('created_at', { ascending: false });

  if (error) { res.status(400).json({ error: error.message }); return; }
  res.json({ checkins: data });
});

// POST /api/checkins
router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  if (!req.user) { res.status(401).json({ error: 'Chưa xác thực' }); return; }

  const { booking_id, room, location, customer, checkin_date, checkout_date, num_people, electric_meter, water_meter, status } = req.body;

  if (!room || !customer) {
    res.status(400).json({ error: 'Thông tin phòng và khách hàng là bắt buộc' });
    return;
  }

  const { data, error } = await getSupabase()
    .from('checkins')
    .insert({
      owner_id: req.user.id,
      booking_id: booking_id || null,
      room,
      location: location || null,
      customer,
      checkin_date: checkin_date || null,
      checkout_date: checkout_date || null,
      num_people: num_people || 1,
      electric_meter: electric_meter || 0,
      water_meter: water_meter || 0,
      status: status || 'pending',
      created_by: req.user.email
    })
    .select()
    .single();

  if (error) { res.status(400).json({ error: error.message }); return; }
  res.status(201).json({ checkin: data });
});

// PUT /api/checkins/:id
router.put('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  if (!req.user) { res.status(401).json({ error: 'Chưa xác thực' }); return; }
  const { id } = req.params;

  const { data: existing } = await getSupabase()
    .from('checkins')
    .select('owner_id')
    .eq('id', id)
    .single();

  if (!existing || existing.owner_id !== req.user.id) {
    res.status(403).json({ error: 'Không có thẩm quyền' });
    return;
  }

  const { status, electric_meter, water_meter, checkout_date } = req.body;
  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  
  if (status !== undefined) updates.status = status;
  if (electric_meter !== undefined) updates.electric_meter = electric_meter;
  if (water_meter !== undefined) updates.water_meter = water_meter;
  if (checkout_date !== undefined) updates.checkout_date = checkout_date;

  const { data, error } = await getSupabase()
    .from('checkins')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) { res.status(400).json({ error: error.message }); return; }
  res.json({ checkin: data });
});

// DELETE /api/checkins/:id
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  if (!req.user) { res.status(401).json({ error: 'Chưa xác thực' }); return; }
  const { id } = req.params;

  const { data: existing } = await getSupabase()
    .from('checkins')
    .select('owner_id')
    .eq('id', id)
    .single();

  if (!existing || existing.owner_id !== req.user.id) {
    res.status(403).json({ error: 'Không có quyền xóa' });
    return;
  }

  const { error } = await getSupabase()
    .from('checkins')
    .delete()
    .eq('id', id);

  if (error) { res.status(400).json({ error: error.message }); return; }
  res.json({ message: 'Thành công' });
});

export default router;

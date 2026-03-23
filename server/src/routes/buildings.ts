import { Router, Response } from 'express';
import { getSupabase } from '../lib/supabase';
import { authenticate, requireRole } from '../middleware/auth';
import type { AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/buildings — List buildings for current user (landlord/broker)
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  if (!req.user) { res.status(401).json({ error: 'Chưa xác thực' }); return; }

  const { data, error } = await getSupabase()
    .from('buildings')
    .select('*, rooms(count)')
    .eq('owner_id', req.user.id)
    .order('created_at', { ascending: false });

  if (error) { res.status(400).json({ error: error.message }); return; }
  res.json({ buildings: data });
});

// GET /api/buildings/:id — Get single building with rooms
router.get('/:id', async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const { data, error } = await getSupabase()
    .from('buildings')
    .select('*, rooms(*)')
    .eq('id', id)
    .single();

  if (error) { res.status(404).json({ error: 'Không tìm thấy tòa nhà' }); return; }
  res.json({ building: data });
});

// POST /api/buildings — Create building
router.post('/', authenticate, requireRole('landlord', 'broker', 'admin'), async (req: AuthRequest, res: Response) => {
  if (!req.user) { res.status(401).json({ error: 'Chưa xác thực' }); return; }

  const { name, address, ward, district, city, lat, lng, floors, description } = req.body;

  if (!name || !address) {
    res.status(400).json({ error: 'Tên và địa chỉ tòa nhà là bắt buộc' });
    return;
  }

  const { data, error } = await getSupabase()
    .from('buildings')
    .insert({
      owner_id: req.user.id,
      name,
      address,
      ward: ward || null,
      district: district || null,
      city: city || null,
      lat: lat || null,
      lng: lng || null,
      floors: floors || 1,
      description: description || null,
    })
    .select()
    .single();

  if (error) { res.status(400).json({ error: error.message }); return; }
  res.status(201).json({ building: data });
});

// PUT /api/buildings/:id — Update building
router.put('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  if (!req.user) { res.status(401).json({ error: 'Chưa xác thực' }); return; }
  const { id } = req.params;

  // Verify ownership
  const { data: existing } = await getSupabase()
    .from('buildings')
    .select('owner_id')
    .eq('id', id)
    .single();

  if (!existing || existing.owner_id !== req.user.id) {
    res.status(403).json({ error: 'Bạn không có quyền chỉnh sửa tòa nhà này' });
    return;
  }

  const { name, address, ward, district, city, lat, lng, floors, description } = req.body;
  const updates: Record<string, unknown> = {};
  if (name !== undefined) updates.name = name;
  if (address !== undefined) updates.address = address;
  if (ward !== undefined) updates.ward = ward;
  if (district !== undefined) updates.district = district;
  if (city !== undefined) updates.city = city;
  if (lat !== undefined) updates.lat = lat;
  if (lng !== undefined) updates.lng = lng;
  if (floors !== undefined) updates.floors = floors;
  if (description !== undefined) updates.description = description;

  const { data, error } = await getSupabase()
    .from('buildings')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) { res.status(400).json({ error: error.message }); return; }
  res.json({ building: data });
});

// DELETE /api/buildings/:id — Delete building (only if no rooms)
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  if (!req.user) { res.status(401).json({ error: 'Chưa xác thực' }); return; }
  const { id } = req.params;

  // Verify ownership
  const { data: existing } = await getSupabase()
    .from('buildings')
    .select('owner_id')
    .eq('id', id)
    .single();

  if (!existing || existing.owner_id !== req.user.id) {
    res.status(403).json({ error: 'Bạn không có quyền xóa tòa nhà này' });
    return;
  }

  // Check for rooms
  const { count } = await getSupabase()
    .from('rooms')
    .select('*', { count: 'exact', head: true })
    .eq('building_id', id);

  if (count && count > 0) {
    res.status(400).json({ error: 'Không thể xóa tòa nhà khi còn phòng. Vui lòng xóa hết phòng trước.' });
    return;
  }

  const { error } = await getSupabase()
    .from('buildings')
    .delete()
    .eq('id', id);

  if (error) { res.status(400).json({ error: error.message }); return; }
  res.json({ message: 'Đã xóa tòa nhà thành công' });
});

export default router;

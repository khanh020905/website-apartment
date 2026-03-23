import { Router, Response } from 'express';
import { getSupabase } from '../lib/supabase';
import { authenticate } from '../middleware/auth';
import type { AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/rooms?building_id=xxx — List rooms for a building
router.get('/', async (req: AuthRequest, res: Response) => {
  const { building_id, status, floor } = req.query;

  let query = getSupabase()
    .from('rooms')
    .select('*')
    .order('floor', { ascending: true })
    .order('room_number', { ascending: true });

  if (building_id) query = query.eq('building_id', building_id as string);
  if (status) query = query.eq('status', status as string);
  if (floor) query = query.eq('floor', Number(floor));

  const { data, error } = await query;

  if (error) { res.status(400).json({ error: error.message }); return; }
  res.json({ rooms: data });
});

// GET /api/rooms/:id — Get single room
router.get('/:id', async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const { data, error } = await getSupabase()
    .from('rooms')
    .select('*, buildings(*)')
    .eq('id', id)
    .single();

  if (error) { res.status(404).json({ error: 'Không tìm thấy phòng' }); return; }
  res.json({ room: data });
});

// POST /api/rooms — Create room
router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  if (!req.user) { res.status(401).json({ error: 'Chưa xác thực' }); return; }

  const {
    building_id, room_number, floor, area, price,
    max_occupants, status, furniture, amenity_ids, description,
  } = req.body;

  if (!building_id || !room_number) {
    res.status(400).json({ error: 'Tòa nhà và số phòng là bắt buộc' });
    return;
  }

  // Verify building ownership
  const { data: building } = await getSupabase()
    .from('buildings')
    .select('owner_id')
    .eq('id', building_id)
    .single();

  if (!building || building.owner_id !== req.user.id) {
    res.status(403).json({ error: 'Bạn không có quyền thêm phòng cho tòa nhà này' });
    return;
  }

  const { data, error } = await getSupabase()
    .from('rooms')
    .insert({
      building_id,
      room_number,
      floor: floor || 1,
      area: area || null,
      price: price || null,
      max_occupants: max_occupants || 1,
      status: status || 'available',
      furniture: furniture || 'none',
      amenity_ids: amenity_ids || [],
      description: description || null,
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      res.status(400).json({ error: 'Số phòng đã tồn tại trong tòa nhà này' });
      return;
    }
    res.status(400).json({ error: error.message });
    return;
  }

  res.status(201).json({ room: data });
});

// PUT /api/rooms/:id — Update room
router.put('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  if (!req.user) { res.status(401).json({ error: 'Chưa xác thực' }); return; }
  const { id } = req.params;

  // Verify ownership through building
  const { data: room } = await getSupabase()
    .from('rooms')
    .select('building_id, buildings(owner_id)')
    .eq('id', id)
    .single();

  const building = room?.buildings as unknown as { owner_id: string } | null;
  if (!room || !building || building.owner_id !== req.user.id) {
    res.status(403).json({ error: 'Bạn không có quyền chỉnh sửa phòng này' });
    return;
  }

  const {
    room_number, floor, area, price, max_occupants,
    current_occupants, status, furniture, amenity_ids, description,
  } = req.body;

  const updates: Record<string, unknown> = {};
  if (room_number !== undefined) updates.room_number = room_number;
  if (floor !== undefined) updates.floor = floor;
  if (area !== undefined) updates.area = area;
  if (price !== undefined) updates.price = price;
  if (max_occupants !== undefined) updates.max_occupants = max_occupants;
  if (current_occupants !== undefined) updates.current_occupants = current_occupants;
  if (status !== undefined) updates.status = status;
  if (furniture !== undefined) updates.furniture = furniture;
  if (amenity_ids !== undefined) updates.amenity_ids = amenity_ids;
  if (description !== undefined) updates.description = description;

  const { data, error } = await getSupabase()
    .from('rooms')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) { res.status(400).json({ error: error.message }); return; }
  res.json({ room: data });
});

// PUT /api/rooms/:id/status — Quick status update
router.put('/:id/status', authenticate, async (req: AuthRequest, res: Response) => {
  if (!req.user) { res.status(401).json({ error: 'Chưa xác thực' }); return; }
  const { id } = req.params;
  const { status } = req.body;

  if (!['available', 'occupied', 'maintenance'].includes(status)) {
    res.status(400).json({ error: 'Trạng thái không hợp lệ' });
    return;
  }

  // Verify ownership
  const { data: room } = await getSupabase()
    .from('rooms')
    .select('building_id, buildings(owner_id)')
    .eq('id', id)
    .single();

  const building = room?.buildings as unknown as { owner_id: string } | null;
  if (!room || !building || building.owner_id !== req.user.id) {
    res.status(403).json({ error: 'Bạn không có quyền thay đổi trạng thái phòng này' });
    return;
  }

  const { data, error } = await getSupabase()
    .from('rooms')
    .update({ status })
    .eq('id', id)
    .select()
    .single();

  if (error) { res.status(400).json({ error: error.message }); return; }
  res.json({ room: data });
});

// DELETE /api/rooms/:id — Delete room (only if available)
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  if (!req.user) { res.status(401).json({ error: 'Chưa xác thực' }); return; }
  const { id } = req.params;

  // Verify ownership + check status
  const { data: room } = await getSupabase()
    .from('rooms')
    .select('status, building_id, buildings(owner_id)')
    .eq('id', id)
    .single();

  const building = room?.buildings as unknown as { owner_id: string } | null;
  if (!room || !building || building.owner_id !== req.user.id) {
    res.status(403).json({ error: 'Bạn không có quyền xóa phòng này' });
    return;
  }

  if (room.status === 'occupied') {
    res.status(400).json({ error: 'Không thể xóa phòng đang có người thuê' });
    return;
  }

  const { error } = await getSupabase()
    .from('rooms')
    .delete()
    .eq('id', id);

  if (error) { res.status(400).json({ error: error.message }); return; }
  res.json({ message: 'Đã xóa phòng thành công' });
});

export default router;

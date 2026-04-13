import { Router, Response } from 'express';
import { getSupabase } from '../lib/supabase';
import { authenticate } from '../middleware/auth';
import type { AuthRequest } from '../middleware/auth';

const router = Router();
const ROOM_SCHEMA_OPTIONAL_COLUMNS = new Set(['available_from', 'deposit_meta', 'rental_meta']);

type RoomMutationResult<T> = {
  data: T | null;
  error: { message: string } | null;
  droppedColumns: string[];
};

const getErrorMessage = (error: unknown): string => {
  if (typeof error === 'object' && error !== null && 'message' in error) {
    const value = (error as { message?: unknown }).message;
    if (typeof value === 'string') return value;
  }
  return '';
};

const dropMissingSchemaColumn = (
  payload: Record<string, unknown>,
  errorMessage: string,
): string | null => {
  const match = errorMessage.match(/Could not find the '([^']+)' column of '([^']+)' in the schema cache/i);
  if (!match) return null;
  const [, missingColumn, targetTable] = match;
  if (targetTable !== 'rooms' || !ROOM_SCHEMA_OPTIONAL_COLUMNS.has(missingColumn)) return null;
  if (!(missingColumn in payload)) return null;
  delete payload[missingColumn];
  return missingColumn;
};

async function runRoomMutationWithSchemaFallback<T>(
  initialPayload: Record<string, unknown>,
  runMutation: (payload: Record<string, unknown>) => Promise<{ data: T | null; error: unknown }>,
): Promise<RoomMutationResult<T>> {
  const payload = { ...initialPayload };
  const droppedColumns: string[] = [];

  // Allow dropping missing columns and retrying once per column.
  for (let attempt = 0; attempt < ROOM_SCHEMA_OPTIONAL_COLUMNS.size + 1; attempt += 1) {
    const { data, error } = await runMutation(payload);
    if (!error) return { data, error: null, droppedColumns };

    const message = getErrorMessage(error);
    const dropped = dropMissingSchemaColumn(payload, message);
    if (dropped) {
      droppedColumns.push(dropped);
      continue;
    }

    if (
      typeof payload.status === 'string'
      && payload.status === 'reserved'
      && /invalid input value for enum .*room_status/i.test(message)
    ) {
      payload.status = 'available';
      delete payload.available_from;
      delete payload.deposit_meta;
      continue;
    }

    return { data: null, error: { message }, droppedColumns };
  }

  return {
    data: null,
    error: { message: 'Không thể đồng bộ schema rooms, vui lòng chạy migration và thử lại' },
    droppedColumns,
  };
}

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
    max_occupants, status, furniture, amenity_ids, images, description,
    available_from, deposit_meta, rental_meta,
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

  if (status === 'reserved' && !available_from) {
    res.status(400).json({ error: 'Phòng đã cọc cần có ngày trống dự kiến' });
    return;
  }

  const createPayload: Record<string, unknown> = {
    building_id,
    room_number,
    floor: floor || 1,
    area: area || null,
    price: price || null,
    max_occupants: max_occupants || 1,
    status: status || 'available',
    furniture: furniture || 'none',
    amenity_ids: amenity_ids || [],
    images: images || [],
    description: description || null,
    available_from: available_from || null,
    deposit_meta: deposit_meta || null,
    rental_meta: rental_meta || null,
  };

  const createResult = await runRoomMutationWithSchemaFallback(
    createPayload,
    async (payload) =>
      getSupabase()
        .from('rooms')
        .insert(payload)
        .select()
        .single(),
  );

  if (createResult.error) {
    if (createResult.error.message.includes('duplicate key value')) {
      res.status(400).json({ error: 'Số phòng đã tồn tại trong tòa nhà này' });
      return;
    }
    res.status(400).json({ error: createResult.error.message });
    return;
  }

  res.status(201).json({
    room: createResult.data,
    dropped_columns: createResult.droppedColumns,
  });
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
    current_occupants, status, furniture, amenity_ids, images, description,
    available_from, deposit_meta, rental_meta,
  } = req.body;

  if (status === 'reserved' && available_from === undefined) {
    res.status(400).json({ error: 'Phòng đã cọc cần có ngày trống dự kiến' });
    return;
  }

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
  if (images !== undefined) updates.images = images;
  if (description !== undefined) updates.description = description;
  if (available_from !== undefined) updates.available_from = available_from || null;
  if (deposit_meta !== undefined) updates.deposit_meta = deposit_meta || null;
  if (rental_meta !== undefined) updates.rental_meta = rental_meta || null;

  const updateResult = await runRoomMutationWithSchemaFallback(
    updates,
    async (payload) =>
      getSupabase()
        .from('rooms')
        .update(payload)
        .eq('id', id)
        .select()
        .single(),
  );

  if (updateResult.error) { res.status(400).json({ error: updateResult.error.message }); return; }
  res.json({
    room: updateResult.data,
    dropped_columns: updateResult.droppedColumns,
  });
});

// PUT /api/rooms/:id/status — Quick status update
router.put('/:id/status', authenticate, async (req: AuthRequest, res: Response) => {
  if (!req.user) { res.status(401).json({ error: 'Chưa xác thực' }); return; }
  const { id } = req.params;
  const { status } = req.body;

  if (!['available', 'reserved', 'occupied', 'maintenance'].includes(status)) {
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

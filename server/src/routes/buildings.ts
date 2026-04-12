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
    .select('*, rooms(*)')
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

  const { 
    name, address, ward, district, city, lat, lng, 
    floors, description, images, phone, status, 
    services, website, rental_type, structure_type, 
    amenities, metered_services, fixed_services,
    rooms, structure_data
  } = req.body;

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
      images: images || [],
      phone: phone || null,
      status: status || 'active',
      services: services || [],
      website: website || null,
      rental_type: rental_type || null,
      structure_type: structure_type || null,
      amenities: amenities || [],
      metered_services: metered_services || [],
      fixed_services: fixed_services || [],
      structure_data: structure_data || {}
    })
    .select()
    .single();

  if (error) { res.status(400).json({ error: error.message }); return; }

  // Handle room creation if building created successfully
  if (rooms && Array.isArray(rooms) && rooms.length > 0) {
    const roomsToInsert = rooms.map((r: any) => ({
      building_id: data.id,
      room_number: r.name,
      floor_name: r.floor_name || "Trệt",
      floor: parseInt(r.floor_name?.match(/\d+/)?.[0] || "1", 10),
      status: 'available'
    }));

    const { error: roomsError } = await getSupabase()
      .from('rooms')
      .insert(roomsToInsert);

    if (roomsError) {
      console.error('Error creating rooms:', roomsError);
      // We don't fail the whole request but maybe log it
    }
  }

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

  const { 
    name, address, ward, district, city, lat, lng, 
    floors, description, images, phone, status, 
    services, website, rental_type, structure_type, 
    amenities, metered_services, fixed_services,
    rooms, structure_data
  } = req.body;

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
  if (images !== undefined) updates.images = images;
  if (phone !== undefined) updates.phone = phone;
  if (status !== undefined) updates.status = status;
  if (services !== undefined) updates.services = services;
  if (website !== undefined) updates.website = website;
  if (rental_type !== undefined) updates.rental_type = rental_type;
  if (structure_type !== undefined) updates.structure_type = structure_type;
  if (amenities !== undefined) updates.amenities = amenities;
  if (metered_services !== undefined) updates.metered_services = metered_services;
  if (fixed_services !== undefined) updates.fixed_services = fixed_services;
  if (structure_data !== undefined) updates.structure_data = structure_data;

  const { data, error } = await getSupabase()
    .from('buildings')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) { res.status(400).json({ error: error.message }); return; }

  // Sync rooms if provided
  if (rooms && Array.isArray(rooms)) {
    // Basic sync: Upsert incoming rooms
    const roomsToUpsert = rooms.map((r: any) => ({
      building_id: id,
      room_number: r.name,
      floor_name: r.floor_name || "Trệt",
      floor: parseInt(r.floor_name?.match(/\d+/)?.[0] || "1", 10),
    }));

    const { error: roomsError } = await getSupabase()
      .from('rooms')
      .upsert(roomsToUpsert, { onConflict: 'building_id,room_number' });

    if (roomsError) {
      console.error('Error syncing rooms:', roomsError);
    }
  }

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
    res.status(400).json({ error: `Toà nhà đang có ${count} phòng, không thể xoá. Vui lòng xoá hết phòng/sơ đồ trước.` });
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

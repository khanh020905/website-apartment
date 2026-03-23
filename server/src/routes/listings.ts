import { Router, Response } from 'express';
import { getSupabase } from '../lib/supabase';
import { authenticate, requireRole } from '../middleware/auth';
import type { AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/listings — Public: list approved listings, or own listings if authenticated
router.get('/', async (req: AuthRequest, res: Response) => {
  const { page = '1', limit = '20', status } = req.query;
  const offset = (Number(page) - 1) * Number(limit);

  let query = getSupabase()
    .from('listings')
    .select('*, profiles!posted_by(full_name, phone, avatar_url)', { count: 'exact' });

  // If status filter provided (for owners viewing their own)
  if (status) {
    query = query.eq('status', status as string);
  } else {
    // Public: only show approved
    query = query.eq('status', 'approved');
  }

  query = query
    .order('created_at', { ascending: false })
    .range(offset, offset + Number(limit) - 1);

  const { data, error, count } = await query;

  if (error) { res.status(400).json({ error: error.message }); return; }
  res.json({
    listings: data,
    total: count || 0,
    page: Number(page),
    limit: Number(limit),
  });
});

// GET /api/listings/my — Get current user's listings
router.get('/my', authenticate, async (req: AuthRequest, res: Response) => {
  if (!req.user) { res.status(401).json({ error: 'Chưa xác thực' }); return; }

  const { data, error } = await getSupabase()
    .from('listings')
    .select('*')
    .eq('posted_by', req.user.id)
    .order('created_at', { ascending: false });

  if (error) { res.status(400).json({ error: error.message }); return; }
  res.json({ listings: data });
});

// GET /api/listings/:id — Get single listing
router.get('/:id', async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const { data, error } = await getSupabase()
    .from('listings')
    .select('*, profiles!posted_by(full_name, phone, avatar_url)')
    .eq('id', id)
    .single();

  if (error) { res.status(404).json({ error: 'Không tìm thấy tin đăng' }); return; }

  // Increment view count (fire and forget)
  getSupabase()
    .from('listings')
    .update({ view_count: (data.view_count || 0) + 1 })
    .eq('id', id)
    .then(() => {});

  res.json({ listing: data });
});

// POST /api/listings — Create listing
// SRS §2.2: Verified accounts bypass Check Legit review
router.post('/', authenticate, requireRole('landlord', 'broker', 'admin'), async (req: AuthRequest, res: Response) => {
  if (!req.user) { res.status(401).json({ error: 'Chưa xác thực' }); return; }

  const {
    title, description, price, area, bedrooms, bathrooms,
    property_type, furniture, address, ward, district, city,
    lat, lng, contact_phone, contact_name, images,
    amenity_ids, available_date, room_id,
    // Broker-specific fields (SRS §2.1)
    target_audience, commission_rate, booking_note,
  } = req.body;

  if (!title || !price || !contact_phone) {
    res.status(400).json({ error: 'Tiêu đề, giá thuê và số điện thoại là bắt buộc' });
    return;
  }

  if (title.length > 100) {
    res.status(400).json({ error: 'Tiêu đề không được quá 100 ký tự' });
    return;
  }

  // Check if poster is verified — verified accounts skip the review queue
  const { data: profile } = await getSupabase()
    .from('profiles')
    .select('is_verified, role')
    .eq('id', req.user.id)
    .single();

  const isVerified = profile?.is_verified === true;
  const isAdmin = profile?.role === 'admin';
  // SRS §2.2: Verified landlord/broker listings are auto-approved
  const listingStatus = (isVerified || isAdmin) ? 'approved' : 'pending';

  const { data, error } = await getSupabase()
    .from('listings')
    .insert({
      posted_by: req.user.id,
      room_id: room_id || null,
      title,
      description: description || null,
      price,
      area: area || null,
      bedrooms: bedrooms || 0,
      bathrooms: bathrooms || 0,
      property_type: property_type || 'phong_tro',
      furniture: furniture || 'none',
      address: address || null,
      ward: ward || null,
      district: district || null,
      city: city || null,
      lat: lat || null,
      lng: lng || null,
      contact_phone,
      contact_name: contact_name || null,
      images: images || [],
      amenity_ids: amenity_ids || [],
      available_date: available_date || null,
      status: listingStatus,
      approved_at: isVerified || isAdmin ? new Date().toISOString() : null,
      // Broker CRM fields
      target_audience: target_audience || null,
      commission_rate: commission_rate || null,
      booking_note: booking_note || null,
    })
    .select()
    .single();

  if (error) { res.status(400).json({ error: error.message }); return; }
  res.status(201).json({
    listing: data,
    auto_approved: isVerified || isAdmin,
    message: (isVerified || isAdmin)
      ? 'Tin đăng đã được tự động duyệt (tài khoản đã xác minh)'
      : 'Tin đăng đang chờ duyệt bởi quản trị viên',
  });
});

// PUT /api/listings/:id — Update listing
router.put('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  if (!req.user) { res.status(401).json({ error: 'Chưa xác thực' }); return; }
  const { id } = req.params;

  // Verify ownership
  const { data: existing } = await getSupabase()
    .from('listings')
    .select('posted_by, status')
    .eq('id', id)
    .single();

  if (!existing || existing.posted_by !== req.user.id) {
    res.status(403).json({ error: 'Bạn không có quyền chỉnh sửa tin đăng này' });
    return;
  }

  const {
    title, description, price, area, bedrooms, bathrooms,
    property_type, furniture, address, ward, district, city,
    lat, lng, contact_phone, contact_name, images,
    amenity_ids, available_date,
  } = req.body;

  const updates: Record<string, unknown> = {};
  if (title !== undefined) {
    if (title.length > 100) {
      res.status(400).json({ error: 'Tiêu đề không được quá 100 ký tự' });
      return;
    }
    updates.title = title;
  }
  if (description !== undefined) updates.description = description;
  if (price !== undefined) updates.price = price;
  if (area !== undefined) updates.area = area;
  if (bedrooms !== undefined) updates.bedrooms = bedrooms;
  if (bathrooms !== undefined) updates.bathrooms = bathrooms;
  if (property_type !== undefined) updates.property_type = property_type;
  if (furniture !== undefined) updates.furniture = furniture;
  if (address !== undefined) updates.address = address;
  if (ward !== undefined) updates.ward = ward;
  if (district !== undefined) updates.district = district;
  if (city !== undefined) updates.city = city;
  if (lat !== undefined) updates.lat = lat;
  if (lng !== undefined) updates.lng = lng;
  if (contact_phone !== undefined) updates.contact_phone = contact_phone;
  if (contact_name !== undefined) updates.contact_name = contact_name;
  if (images !== undefined) updates.images = images;
  if (amenity_ids !== undefined) updates.amenity_ids = amenity_ids;
  if (available_date !== undefined) updates.available_date = available_date;

  // If listing was rejected, re-editing re-submits:
  // verified accounts → auto-approve, unverified → back to pending
  if (existing.status === 'rejected') {
    const { data: profile } = await getSupabase()
      .from('profiles')
      .select('is_verified, role')
      .eq('id', req.user.id)
      .single();
    const isVerified = profile?.is_verified === true || profile?.role === 'admin';
    updates.status = isVerified ? 'approved' : 'pending';
    if (isVerified) updates.approved_at = new Date().toISOString();
  }

  const { data, error } = await getSupabase()
    .from('listings')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) { res.status(400).json({ error: error.message }); return; }
  res.json({ listing: data });
});

// DELETE /api/listings/:id — Delete listing
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  if (!req.user) { res.status(401).json({ error: 'Chưa xác thực' }); return; }
  const { id } = req.params;

  const { data: existing } = await getSupabase()
    .from('listings')
    .select('posted_by')
    .eq('id', id)
    .single();

  if (!existing || existing.posted_by !== req.user.id) {
    res.status(403).json({ error: 'Bạn không có quyền xóa tin đăng này' });
    return;
  }

  const { error } = await getSupabase()
    .from('listings')
    .delete()
    .eq('id', id);

  if (error) { res.status(400).json({ error: error.message }); return; }
  res.json({ message: 'Đã xóa tin đăng thành công' });
});

export default router;

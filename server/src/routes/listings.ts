import { Router, Response, Request, NextFunction } from 'express';
import { getSupabase } from '../lib/supabase';
import { authenticate, requireRole } from '../middleware/auth';
import type { AuthRequest } from '../middleware/auth';
import multer from 'multer';

const router = Router();
const MAX_IMAGE_COUNT = 15;
const MIN_IMAGE_COUNT = 3;
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const LISTING_IMAGE_BUCKET = 'listing-images';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: MAX_IMAGE_COUNT,
  },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      cb(new Error('Chỉ chấp nhận file JPG, PNG hoặc WebP'));
      return;
    }
    cb(null, true);
  },
});

function uploadListingImages(req: Request, res: Response, next: NextFunction): void {
  upload.array('images', MAX_IMAGE_COUNT)(req, res, (err: unknown) => {
    if (!err) {
      next();
      return;
    }

    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        res.status(400).json({ error: 'Mỗi ảnh tối đa 5MB' });
        return;
      }
      if (err.code === 'LIMIT_FILE_COUNT') {
        res.status(400).json({ error: 'Tối đa 15 ảnh mỗi lần upload' });
        return;
      }
    }

    const message = err instanceof Error ? err.message : 'Upload ảnh thất bại';
    res.status(400).json({ error: message });
  });
}

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
    .select('*, listing_reviews(action, notes, reviewed_at)')
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

// POST /api/listings/upload-images — Upload listing images to Supabase storage
router.post(
  '/upload-images',
  authenticate,
  requireRole('landlord', 'broker', 'admin'),
  uploadListingImages,
  async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      res.status(401).json({ error: 'Chưa xác thực' });
      return;
    }

    const files = (req.files as Express.Multer.File[] | undefined) || [];
    if (files.length === 0) {
      res.status(400).json({ error: 'Vui lòng chọn ít nhất 1 ảnh' });
      return;
    }

    const supabase = getSupabase();
    const { data: bucket, error: bucketError } = await supabase.storage.getBucket(LISTING_IMAGE_BUCKET);
    if (bucketError && !bucketError.message.toLowerCase().includes('not found')) {
      res.status(400).json({ error: `Không thể kiểm tra bucket ảnh: ${bucketError.message}` });
      return;
    }
    if (!bucket) {
      const { error: createBucketError } = await supabase.storage.createBucket(LISTING_IMAGE_BUCKET, {
        public: true,
        fileSizeLimit: `${MAX_FILE_SIZE}`,
        allowedMimeTypes: Array.from(ALLOWED_MIME_TYPES),
      });
      if (createBucketError && !createBucketError.message.toLowerCase().includes('already exists')) {
        res.status(400).json({ error: `Không thể tạo bucket ảnh: ${createBucketError.message}` });
        return;
      }
    }

    const uploaded: { url: string; order: number }[] = [];

    for (let i = 0; i < files.length; i += 1) {
      const file = files[i];
      const extension = file.mimetype === 'image/png'
        ? 'png'
        : file.mimetype === 'image/webp'
          ? 'webp'
          : 'jpg';
      const filePath = `${req.user.id}/${Date.now()}-${i}.${extension}`;

      const { error: uploadError } = await supabase.storage
        .from(LISTING_IMAGE_BUCKET)
        .upload(filePath, file.buffer, {
          contentType: file.mimetype,
          upsert: false,
        });

      if (uploadError) {
        res.status(400).json({ error: uploadError.message });
        return;
      }

      const { data: publicUrlData } = supabase.storage.from(LISTING_IMAGE_BUCKET).getPublicUrl(filePath);
      uploaded.push({ url: publicUrlData.publicUrl, order: i });
    }

    res.json({ images: uploaded });
  }
);

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
  const normalizedTitle = String(title).trim();
  const normalizedPhone = String(contact_phone).trim();
  const normalizedPrice = Number(price);
  const normalizedArea = Number(area);

  if (!normalizedTitle || !normalizedPhone) {
    res.status(400).json({ error: 'Tiêu đề và số điện thoại không hợp lệ' });
    return;
  }
  if (Number.isNaN(normalizedPrice) || normalizedPrice <= 0) {
    res.status(400).json({ error: 'Giá thuê phải lớn hơn 0' });
    return;
  }
  if (Number.isNaN(normalizedArea) || normalizedArea <= 0) {
    res.status(400).json({ error: 'Diện tích phải lớn hơn 0' });
    return;
  }

  if (normalizedTitle.length > 100) {
    res.status(400).json({ error: 'Tiêu đề không được quá 100 ký tự' });
    return;
  }
  if (!Array.isArray(images) || images.length < MIN_IMAGE_COUNT || images.length > MAX_IMAGE_COUNT) {
    res.status(400).json({ error: 'Cần từ 3 đến 15 ảnh cho tin đăng' });
    return;
  }
  const imageShapeValid = images.every(
    (img: unknown) =>
      typeof img === 'object' &&
      img !== null &&
      'url' in img &&
      'order' in img &&
      typeof (img as { url: unknown }).url === 'string' &&
      typeof (img as { order: unknown }).order === 'number'
  );
  if (!imageShapeValid) {
    res.status(400).json({ error: 'Danh sách ảnh không hợp lệ' });
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
      title: normalizedTitle,
      description: description || null,
      price: normalizedPrice,
      area: normalizedArea,
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
      contact_phone: normalizedPhone,
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

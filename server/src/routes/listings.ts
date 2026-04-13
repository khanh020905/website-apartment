import { Router, Response, Request, NextFunction } from 'express';
import { getSupabase } from '../lib/supabase';
import { authenticate, requireRole } from '../middleware/auth';
import type { AuthRequest } from '../middleware/auth';
import multer from 'multer';

const router = Router();
const MAX_IMAGE_COUNT = 15;
const MIN_IMAGE_COUNT = 1;
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_VIDEO_FILE_SIZE = 50 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const ALLOWED_VIDEO_MIME_TYPES = new Set(['video/mp4', 'video/webm', 'video/quicktime']);
const LISTING_IMAGE_BUCKET = 'listing-images';
const LISTING_VIDEO_BUCKET = 'listing-videos';
const LISTING_SCHEMA_OPTIONAL_COLUMNS = new Set([
  'video_url',
  'is_discounted',
  'is_newly_built',
  'max_people',
  'max_vehicles',
  'length_m',
  'width_m',
  'guest_note',
  'room_features',
  'interior_features',
]);

type ListingMutationResult<T> = {
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
  table: string,
  errorMessage: string,
  allowedColumns: Set<string>,
): string | null => {
  const match = errorMessage.match(/Could not find the '([^']+)' column of '([^']+)' in the schema cache/i);
  if (!match) return null;
  const [, missingColumn, targetTable] = match;
  if (targetTable !== table || !allowedColumns.has(missingColumn)) return null;
  if (!(missingColumn in payload)) return null;
  delete payload[missingColumn];
  return missingColumn;
};

async function runListingMutationWithSchemaFallback<T>(
  initialPayload: Record<string, unknown>,
  runMutation: (payload: Record<string, unknown>) => Promise<{ data: T | null; error: unknown }>,
): Promise<ListingMutationResult<T>> {
  const payload = { ...initialPayload };
  const droppedColumns: string[] = [];

  // Allow dropping multiple missing columns one-by-one if schema cache is stale.
  for (let attempt = 0; attempt < LISTING_SCHEMA_OPTIONAL_COLUMNS.size + 1; attempt += 1) {
    const { data, error } = await runMutation(payload);
    if (!error) return { data, error: null, droppedColumns };

    const message = getErrorMessage(error);
    const dropped = dropMissingSchemaColumn(payload, 'listings', message, LISTING_SCHEMA_OPTIONAL_COLUMNS);
    if (!dropped) return { data: null, error: { message }, droppedColumns };
    droppedColumns.push(dropped);
  }

  return {
    data: null,
    error: { message: 'Không thể đồng bộ schema listings, vui lòng chạy migration và thử lại' },
    droppedColumns,
  };
}

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

const uploadVideo = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_VIDEO_FILE_SIZE,
    files: 1,
  },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_VIDEO_MIME_TYPES.has(file.mimetype)) {
      cb(new Error('Chỉ chấp nhận file MP4, WEBM hoặc MOV'));
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

function uploadListingVideo(req: Request, res: Response, next: NextFunction): void {
  uploadVideo.single('video')(req, res, (err: unknown) => {
    if (!err) {
      next();
      return;
    }

    if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
      res.status(400).json({ error: 'Video tối đa 50MB' });
      return;
    }

    const message = err instanceof Error ? err.message : 'Upload video thất bại';
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

router.post(
  '/upload-video',
  authenticate,
  requireRole('landlord', 'broker', 'admin'),
  uploadListingVideo,
  async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      res.status(401).json({ error: 'Chưa xác thực' });
      return;
    }

    const file = req.file;
    if (!file) {
      res.status(400).json({ error: 'Vui lòng chọn video' });
      return;
    }

    const supabase = getSupabase();
    const { data: bucket, error: bucketError } = await supabase.storage.getBucket(LISTING_VIDEO_BUCKET);
    if (bucketError && !bucketError.message.toLowerCase().includes('not found')) {
      res.status(400).json({ error: `Không thể kiểm tra bucket video: ${bucketError.message}` });
      return;
    }
    if (!bucket) {
      const { error: createBucketError } = await supabase.storage.createBucket(LISTING_VIDEO_BUCKET, {
        public: true,
        fileSizeLimit: `${MAX_VIDEO_FILE_SIZE}`,
        allowedMimeTypes: Array.from(ALLOWED_VIDEO_MIME_TYPES),
      });
      if (createBucketError && !createBucketError.message.toLowerCase().includes('already exists')) {
        res.status(400).json({ error: `Không thể tạo bucket video: ${createBucketError.message}` });
        return;
      }
    }

    const extension = file.mimetype === 'video/webm'
      ? 'webm'
      : file.mimetype === 'video/quicktime'
        ? 'mov'
        : 'mp4';
    const filePath = `${req.user.id}/${Date.now()}-listing-video.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from(LISTING_VIDEO_BUCKET)
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (uploadError) {
      res.status(400).json({ error: uploadError.message });
      return;
    }

    const { data: publicUrlData } = supabase.storage.from(LISTING_VIDEO_BUCKET).getPublicUrl(filePath);
    res.json({ video_url: publicUrlData.publicUrl });
  },
);

// POST /api/listings — Create listing
router.post('/', authenticate, requireRole('landlord', 'broker', 'admin'), async (req: AuthRequest, res: Response) => {
  if (!req.user) { res.status(401).json({ error: 'Chưa xác thực' }); return; }

  const {
    title, description, price, area, bedrooms, bathrooms,
    property_type, furniture, address, ward, district, city,
    lat, lng, contact_phone, contact_name, images,
    amenity_ids, available_date, room_id, video_url,
    is_discounted, is_newly_built, max_people, max_vehicles,
    length_m, width_m, guest_note, room_features, interior_features,
    // Broker-specific fields (SRS §2.1)
    target_audience, commission_rate, booking_note,
  } = req.body;
  const normalizedRoomId = typeof room_id === 'string' && room_id.trim().length > 0 ? room_id.trim() : null;

  if (!title || !price || !contact_phone) {
    res.status(400).json({ error: 'Tiêu đề, giá thuê và số điện thoại là bắt buộc' });
    return;
  }
  if (!normalizedRoomId) {
    res.status(400).json({ error: 'Vui lòng chọn mã phòng trước khi tạo tin' });
    return;
  }
  const normalizedTitle = String(title).trim();
  const normalizedPhone = String(contact_phone).trim();
  const normalizedPrice = Number(price);
  const rawArea = Number(area);
  const normalizedLength = length_m === undefined || length_m === null || length_m === '' ? null : Number(length_m);
  const normalizedWidth = width_m === undefined || width_m === null || width_m === '' ? null : Number(width_m);
  const normalizedArea = Number.isFinite(rawArea) && rawArea > 0
    ? rawArea
    : (normalizedLength !== null && normalizedWidth !== null ? normalizedLength * normalizedWidth : Number.NaN);
  const normalizedMaxPeople =
    max_people === undefined || max_people === null || max_people === ''
      ? null
      : Number(max_people);
  const normalizedMaxVehicles =
    max_vehicles === undefined || max_vehicles === null || max_vehicles === ''
      ? null
      : Number(max_vehicles);
  const normalizedRoomFeatures =
    Array.isArray(room_features) ? room_features.filter((x: unknown): x is string => typeof x === 'string' && x.trim().length > 0) : [];
  const normalizedInteriorFeatures =
    Array.isArray(interior_features) ? interior_features.filter((x: unknown): x is string => typeof x === 'string' && x.trim().length > 0) : [];

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
  if ((normalizedLength !== null && (Number.isNaN(normalizedLength) || normalizedLength <= 0))
    || (normalizedWidth !== null && (Number.isNaN(normalizedWidth) || normalizedWidth <= 0))) {
    res.status(400).json({ error: 'Chiều dài và chiều rộng phải lớn hơn 0' });
    return;
  }
  if (normalizedMaxPeople !== null && (Number.isNaN(normalizedMaxPeople) || normalizedMaxPeople <= 0)) {
    res.status(400).json({ error: 'Số người tối đa phải lớn hơn 0' });
    return;
  }
  if (normalizedMaxVehicles !== null && (Number.isNaN(normalizedMaxVehicles) || normalizedMaxVehicles < 0)) {
    res.status(400).json({ error: 'Số xe tối đa không hợp lệ' });
    return;
  }

  if (normalizedTitle.length > 100) {
    res.status(400).json({ error: 'Tiêu đề không được quá 100 ký tự' });
    return;
  }
  if (!Array.isArray(images) || images.length < MIN_IMAGE_COUNT || images.length > MAX_IMAGE_COUNT) {
    res.status(400).json({ error: 'Cần từ 1 đến 15 ảnh cho tin đăng' });
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
  if (video_url !== undefined && video_url !== null && typeof video_url !== 'string') {
    res.status(400).json({ error: 'Video không hợp lệ' });
    return;
  }

  const listingPayload = {
    posted_by: req.user.id,
    room_id: normalizedRoomId,
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
    video_url: video_url || null,
    amenity_ids: amenity_ids || [],
    room_features: normalizedRoomFeatures,
    interior_features: normalizedInteriorFeatures,
    is_discounted: Boolean(is_discounted),
    is_newly_built: Boolean(is_newly_built),
    max_people: normalizedMaxPeople,
    max_vehicles: normalizedMaxVehicles,
    length_m: normalizedLength,
    width_m: normalizedWidth,
    guest_note: guest_note || null,
    available_date: available_date || null,
    status: 'pending' as const,
    approved_at: null,
    target_audience: target_audience || null,
    commission_rate: commission_rate || null,
    booking_note: booking_note || null,
  };

  const { data: existingListings, error: existingLookupError } = await getSupabase()
    .from('listings')
    .select('id')
    .eq('posted_by', req.user.id)
    .eq('room_id', normalizedRoomId)
    .order('created_at', { ascending: false })
    .limit(1);

  if (existingLookupError) { res.status(400).json({ error: existingLookupError.message }); return; }

  const existingListingId = existingListings?.[0]?.id;
  if (existingListingId) {
    const updateResult = await runListingMutationWithSchemaFallback(
      listingPayload,
      async (payload) =>
        getSupabase()
          .from('listings')
          .update(payload)
          .eq('id', existingListingId)
          .select()
          .single(),
    );

    if (updateResult.error) { res.status(400).json({ error: updateResult.error.message }); return; }

    res.json({
      listing: updateResult.data,
      auto_approved: false,
      message:
        updateResult.droppedColumns.length > 0 ?
          `Phòng đã có tin trước đó, hệ thống đã tự cập nhật (bỏ qua trường chưa có: ${updateResult.droppedColumns.join(', ')})`
        : 'Phòng đã có tin trước đó, hệ thống đã tự cập nhật và gửi admin duyệt lại',
    });
    return;
  }

  const insertResult = await runListingMutationWithSchemaFallback(
    listingPayload,
    async (payload) =>
      getSupabase()
        .from('listings')
        .insert(payload)
        .select()
        .single(),
  );

  if (insertResult.error) { res.status(400).json({ error: insertResult.error.message }); return; }
  res.status(201).json({
    listing: insertResult.data,
    auto_approved: false,
    message:
      insertResult.droppedColumns.length > 0 ?
        `Tin đăng đã tạo với schema cũ (bỏ qua: ${insertResult.droppedColumns.join(', ')})`
      : 'Tin đăng đã được tạo và gửi admin duyệt',
  });
});

// POST /api/listings/push-all — Push all existing listings to pending
router.post('/push-all', authenticate, requireRole('landlord', 'broker', 'admin'), async (req: AuthRequest, res: Response) => {
  if (!req.user) { res.status(401).json({ error: 'Chưa xác thực' }); return; }

  const { data, error } = await getSupabase()
    .from('listings')
    .update({ status: 'pending', approved_at: null })
    .eq('posted_by', req.user.id)
    .neq('status', 'pending')
    .select('id');

  if (error) { res.status(400).json({ error: error.message }); return; }
  res.json({ updated: data?.length || 0 });
});

// PUT /api/listings/:id/status — Update listing status
router.put('/:id/status', authenticate, async (req: AuthRequest, res: Response) => {
  if (!req.user) { res.status(401).json({ error: 'Chưa xác thực' }); return; }
  const { id } = req.params;
  const { status } = req.body as { status?: 'draft' | 'pending' | 'approved' | 'rejected' };

  if (!status || !['draft', 'pending', 'approved', 'rejected'].includes(status)) {
    res.status(400).json({ error: 'Trạng thái tin đăng không hợp lệ' });
    return;
  }
  if (req.user.role !== 'admin' && (status === 'approved' || status === 'rejected')) {
    res.status(403).json({ error: 'Bạn không có quyền cập nhật trạng thái này' });
    return;
  }

  const { data: existing } = await getSupabase()
    .from('listings')
    .select('posted_by')
    .eq('id', id)
    .single();

  if (!existing) {
    res.status(404).json({ error: 'Không tìm thấy tin đăng' });
    return;
  }

  if (req.user.role !== 'admin' && existing.posted_by !== req.user.id) {
    res.status(403).json({ error: 'Bạn không có quyền thay đổi tin đăng này' });
    return;
  }

  const { data, error } = await getSupabase()
    .from('listings')
    .update({
      status,
      approved_at: status === 'approved' ? new Date().toISOString() : null,
    })
    .eq('id', id)
    .select()
    .single();

  if (error) { res.status(400).json({ error: error.message }); return; }
  res.json({ listing: data });
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
    amenity_ids, available_date, video_url,
    is_discounted, is_newly_built, max_people, max_vehicles,
    length_m, width_m, guest_note, room_features, interior_features,
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
  if (video_url !== undefined) updates.video_url = video_url;
  if (is_discounted !== undefined) updates.is_discounted = Boolean(is_discounted);
  if (is_newly_built !== undefined) updates.is_newly_built = Boolean(is_newly_built);
  if (max_people !== undefined) updates.max_people = max_people;
  if (max_vehicles !== undefined) updates.max_vehicles = max_vehicles;
  if (length_m !== undefined) updates.length_m = length_m;
  if (width_m !== undefined) updates.width_m = width_m;
  if (guest_note !== undefined) updates.guest_note = guest_note;
  if (room_features !== undefined) updates.room_features = room_features;
  if (interior_features !== undefined) updates.interior_features = interior_features;

  // If listing was rejected, re-editing re-submits to pending
  if (existing.status === 'rejected') {
    updates.status = 'pending';
    updates.approved_at = null;
  }

  const updateResult = await runListingMutationWithSchemaFallback(
    updates,
    async (payload) =>
      getSupabase()
        .from('listings')
        .update(payload)
        .eq('id', id)
        .select()
        .single(),
  );

  if (updateResult.error) { res.status(400).json({ error: updateResult.error.message }); return; }
  res.json({
    listing: updateResult.data,
    dropped_columns: updateResult.droppedColumns,
  });
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

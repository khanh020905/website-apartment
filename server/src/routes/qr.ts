import { Router, Request, Response } from 'express';
import { getSupabase } from '../lib/supabase';
import { authenticate, requireRole } from '../middleware/auth';
import type { AuthRequest } from '../middleware/auth';
import crypto from 'crypto';

const router = Router();

// Generate a short unique code for QR URL
function generateShortCode(): string {
  return crypto.randomBytes(4).toString('hex'); // 8 char hex
}

// POST /api/qr/generate — Generate QR for a building (landlord exclusive per SRS §2.1)
router.post('/generate', authenticate, requireRole('landlord', 'admin'), async (req: AuthRequest, res: Response) => { // SRS: landlord-only (Gói Chủ nhà)
  if (!req.user) { res.status(401).json({ error: 'Chưa xác thực' }); return; }
  const { building_id } = req.body;

  if (!building_id) {
    res.status(400).json({ error: 'ID tòa nhà là bắt buộc' });
    return;
  }

  // Verify building ownership
  const { data: building } = await getSupabase()
    .from('buildings')
    .select('owner_id, name')
    .eq('id', building_id)
    .single();

  if (!building || building.owner_id !== req.user.id) {
    res.status(403).json({ error: 'Bạn không có quyền tạo QR cho tòa nhà này' });
    return;
  }

  // Check if QR already exists
  const { data: existing } = await getSupabase()
    .from('qr_codes')
    .select('*')
    .eq('building_id', building_id)
    .single();

  if (existing) {
    // Return existing QR
    res.json({
      qr: existing,
      url: `/qr/${existing.code}`,
      message: 'Mã QR đã tồn tại cho tòa nhà này',
    });
    return;
  }

  // Generate new QR
  const code = generateShortCode();
  const { data, error } = await getSupabase()
    .from('qr_codes')
    .insert({
      building_id,
      code,
      generated_by: req.user.id,
    })
    .select()
    .single();

  if (error) { res.status(400).json({ error: error.message }); return; }

  res.status(201).json({
    qr: data,
    url: `/qr/${code}`,
    message: 'Đã tạo mã QR thành công',
  });
});

// POST /api/qr/regenerate — Regenerate QR for a building
router.post('/regenerate', authenticate, requireRole('landlord', 'admin'), async (req: AuthRequest, res: Response) => { // SRS: landlord-only
  if (!req.user) { res.status(401).json({ error: 'Chưa xác thực' }); return; }
  const { building_id } = req.body;

  // Verify ownership
  const { data: building } = await getSupabase()
    .from('buildings')
    .select('owner_id')
    .eq('id', building_id)
    .single();

  if (!building || building.owner_id !== req.user.id) {
    res.status(403).json({ error: 'Bạn không có quyền tạo mới QR cho tòa nhà này' });
    return;
  }

  // Deactivate old QR
  await getSupabase()
    .from('qr_codes')
    .update({ is_active: false })
    .eq('building_id', building_id);

  // Delete old and create new
  await getSupabase()
    .from('qr_codes')
    .delete()
    .eq('building_id', building_id);

  const code = generateShortCode();
  const { data, error } = await getSupabase()
    .from('qr_codes')
    .insert({
      building_id,
      code,
      generated_by: req.user.id,
    })
    .select()
    .single();

  if (error) { res.status(400).json({ error: error.message }); return; }

  res.json({
    qr: data,
    url: `/qr/${code}`,
    message: 'Đã tạo mã QR mới thành công',
  });
});

// GET /api/qr/:code — Public: Get building status by QR code (no auth needed)
router.get('/:code', async (req: Request, res: Response) => {
  const { code } = req.params;

  // Find QR code
  const { data: qr, error: qrError } = await getSupabase()
    .from('qr_codes')
    .select('building_id, is_active')
    .eq('code', code)
    .single();

  if (qrError || !qr) {
    res.status(404).json({ error: 'Mã QR không hợp lệ' });
    return;
  }

  if (!qr.is_active) {
    res.status(410).json({ error: 'Mã QR đã hết hiệu lực' });
    return;
  }

  // Get building with all rooms
  const { data: building, error: buildingError } = await getSupabase()
    .from('buildings')
    .select(`
      id,
      name,
      address,
      ward,
      district,
      city,
      floors,
      description,
      phone,
      rooms(
        id,
        room_number,
        floor,
        status,
        price,
        area,
        max_occupants,
        current_occupants
      )
    `)
    .eq('id', qr.building_id)
    .single();

  if (buildingError || !building) {
    res.status(404).json({ error: 'Không tìm thấy tòa nhà' });
    return;
  }

  // Get owner contact info
  const { data: owner } = await getSupabase()
    .from('buildings')
    .select('profiles!owner_id(full_name, phone, email, avatar_url)')
    .eq('id', qr.building_id)
    .single();

  res.json({
    building,
    contact: owner?.profiles || null,
  });
});

// GET /api/qr/building/:buildingId — Get QR code for a specific building (owner only)
router.get('/building/:buildingId', authenticate, async (req: AuthRequest, res: Response) => {
  if (!req.user) { res.status(401).json({ error: 'Chưa xác thực' }); return; }
  const { buildingId } = req.params;

  const { data, error } = await getSupabase()
    .from('qr_codes')
    .select('*')
    .eq('building_id', buildingId)
    .eq('is_active', true)
    .single();

  if (error || !data) {
    res.json({ qr: null, message: 'Chưa có mã QR cho tòa nhà này' });
    return;
  }

  res.json({ qr: data, url: `/qr/${data.code}` });
});

export default router;

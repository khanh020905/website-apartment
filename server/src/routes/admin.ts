import { Router, Response } from 'express';
import { getSupabase } from '../lib/supabase';
import { authenticate, requireAdmin } from '../middleware/auth';
import type { AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/admin/listings/pending — List pending listings for review
router.get('/listings/pending', authenticate, requireAdmin, async (_req: AuthRequest, res: Response) => {
  const { data, error } = await getSupabase()
    .from('listings')
    .select('*, profiles!posted_by(full_name, phone, email)')
    .eq('status', 'pending')
    .order('created_at', { ascending: true });

  if (error) { res.status(400).json({ error: error.message }); return; }
  res.json({ listings: data });
});

// GET /api/admin/listings/all — List all listings with any status
router.get('/listings/all', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  const { status, page = '1', limit = '50' } = req.query;
  const offset = (Number(page) - 1) * Number(limit);

  let query = getSupabase()
    .from('listings')
    .select('*, profiles!posted_by(full_name, phone, email)', { count: 'exact' });

  if (status) query = query.eq('status', status as string);

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

// POST /api/admin/listings/:id/review — Approve or reject a listing
router.post('/listings/:id/review', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  if (!req.user) { res.status(401).json({ error: 'Chưa xác thực' }); return; }
  const { id } = req.params;
  const { action, notes } = req.body;

  if (!['approved', 'rejected'].includes(action)) {
    res.status(400).json({ error: 'Hành động phải là "approved" hoặc "rejected"' });
    return;
  }

  const supabase = getSupabase();

  // Update listing status
  const updateData: Record<string, unknown> = {
    status: action,
  };
  if (action === 'approved') {
    updateData.approved_at = new Date().toISOString();
  }

  const { error: updateError } = await supabase
    .from('listings')
    .update(updateData)
    .eq('id', id);

  if (updateError) { res.status(400).json({ error: updateError.message }); return; }

  // Create review record
  const { data: review, error: reviewError } = await supabase
    .from('listing_reviews')
    .insert({
      listing_id: id,
      reviewer_id: req.user.id,
      action,
      notes: notes || null,
    })
    .select()
    .single();

  if (reviewError) { res.status(400).json({ error: reviewError.message }); return; }

  res.json({
    message: action === 'approved' ? 'Tin đăng đã được duyệt' : 'Tin đăng đã bị từ chối',
    review,
  });
});

// GET /api/admin/listings/:id/reviews — Get review history for a listing
router.get('/listings/:id/reviews', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const { data, error } = await getSupabase()
    .from('listing_reviews')
    .select('*, profiles!reviewer_id(full_name, email)')
    .eq('listing_id', id)
    .order('reviewed_at', { ascending: false });

  if (error) { res.status(400).json({ error: error.message }); return; }
  res.json({ reviews: data });
});

// GET /api/admin/stats — Dashboard statistics
router.get('/stats', authenticate, requireAdmin, async (_req: AuthRequest, res: Response) => {
  const supabase = getSupabase();

  const [
    { count: totalUsers },
    { count: totalListings },
    { count: pendingListings },
    { count: approvedListings },
    { count: totalBuildings },
    { count: totalRooms },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('listings').select('*', { count: 'exact', head: true }),
    supabase.from('listings').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('listings').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
    supabase.from('buildings').select('*', { count: 'exact', head: true }),
    supabase.from('rooms').select('*', { count: 'exact', head: true }),
  ]);

  res.json({
    stats: {
      totalUsers: totalUsers || 0,
      totalListings: totalListings || 0,
      pendingListings: pendingListings || 0,
      approvedListings: approvedListings || 0,
      totalBuildings: totalBuildings || 0,
      totalRooms: totalRooms || 0,
    },
  });
});
// PUT /api/admin/users/:id/verify — Verify/unverify a user account
// SRS §2.2: Verified accounts bypass Check Legit review
router.put('/users/:id/verify', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { is_verified } = req.body;

  if (typeof is_verified !== 'boolean') {
    res.status(400).json({ error: 'is_verified phải là true hoặc false' });
    return;
  }

  const { data, error } = await getSupabase()
    .from('profiles')
    .update({ is_verified, verified_at: is_verified ? new Date().toISOString() : null })
    .eq('id', id)
    .select('id, full_name, role, is_verified')
    .single();

  if (error) { res.status(400).json({ error: error.message }); return; }
  res.json({
    message: is_verified
      ? `Tài khoản ${data.full_name} đã được xác minh. Tin đăng sẽ tự động được duyệt.`
      : `Đã hủy xác minh tài khoản ${data.full_name}.`,
    user: data,
  });
});

// GET /api/admin/users — List all users with verification status
router.get('/users', authenticate, requireAdmin, async (_req: AuthRequest, res: Response) => {
  const { data, error } = await getSupabase()
    .from('profiles')
    .select('id, full_name, email, phone, role, is_verified, subscription_tier, created_at')
    .order('created_at', { ascending: false });

  if (error) { res.status(400).json({ error: error.message }); return; }
  res.json({ users: data });
});

export default router;

import { Router, Response } from 'express';
import { getSupabase } from '../lib/supabase';
import { authenticate, requireAdmin } from '../middleware/auth';
import type { AuthRequest } from '../middleware/auth';
import type { ListingReviewChecklist, ReviewAction } from '../../../shared/types';

const router = Router();

// GET /api/admin/listings/pending — List pending listings for review
router.get('/listings/pending', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  const {
    city,
    district,
    ward,
    property_type,
    posted_by,
    assigned_to_me,
    created_from,
    created_to,
    submitter,
  } = req.query;

  let submitterIds: string[] | null = null;
  if (submitter) {
    const submitterKeyword = String(submitter).trim();
    const { data: submitters, error: submitterError } = await getSupabase()
      .from('profiles')
      .select('id')
      .or(`full_name.ilike.%${submitterKeyword}%,email.ilike.%${submitterKeyword}%`);

    if (submitterError) { res.status(400).json({ error: submitterError.message }); return; }
    submitterIds = (submitters || []).map((item) => item.id);
    if (submitterIds.length === 0) {
      res.json({ listings: [] });
      return;
    }
  }

  let query = getSupabase()
    .from('listings')
    .select('*, profiles!posted_by(full_name, phone, email), assigned_inspector:profiles!assigned_inspector_id(full_name, email)')
    .eq('status', 'pending')
    .order('created_at', { ascending: true });

  if (city) query = query.ilike('city', `%${String(city).trim()}%`);
  if (district) query = query.ilike('district', `%${String(district).trim()}%`);
  if (ward) query = query.ilike('ward', `%${String(ward).trim()}%`);
  if (property_type) query = query.eq('property_type', String(property_type).trim());
  if (posted_by) query = query.eq('posted_by', String(posted_by).trim());
  if (submitterIds) query = query.in('posted_by', submitterIds);
  if (assigned_to_me === 'true' && req.user?.id) query = query.eq('assigned_inspector_id', req.user.id);
  if (created_from) query = query.gte('created_at', String(created_from).trim());
  if (created_to) query = query.lte('created_at', `${String(created_to).trim()}T23:59:59.999Z`);

  const { data, error } = await query;

  if (error) { res.status(400).json({ error: error.message }); return; }
  res.json({ listings: data });
});

// GET /api/admin/listings/all — List all listings with any status
router.get('/listings/all', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  const {
    status,
    city,
    district,
    ward,
    property_type,
    posted_by,
    submitter,
    created_from,
    created_to,
    page = '1',
    limit = '50',
  } = req.query;
  const offset = (Number(page) - 1) * Number(limit);
  let submitterIds: string[] | null = null;

  if (submitter) {
    const submitterKeyword = String(submitter).trim();
    const { data: submitters, error: submitterError } = await getSupabase()
      .from('profiles')
      .select('id')
      .or(`full_name.ilike.%${submitterKeyword}%,email.ilike.%${submitterKeyword}%`);

    if (submitterError) { res.status(400).json({ error: submitterError.message }); return; }
    submitterIds = (submitters || []).map((item) => item.id);
    if (submitterIds.length === 0) {
      res.json({
        listings: [],
        total: 0,
        page: Number(page),
        limit: Number(limit),
      });
      return;
    }
  }

  let query = getSupabase()
    .from('listings')
    .select('*, profiles!posted_by(full_name, phone, email), assigned_inspector:profiles!assigned_inspector_id(full_name, email)', { count: 'exact' });

  if (status) query = query.eq('status', status as string);
  if (city) query = query.ilike('city', `%${String(city).trim()}%`);
  if (district) query = query.ilike('district', `%${String(district).trim()}%`);
  if (ward) query = query.ilike('ward', `%${String(ward).trim()}%`);
  if (property_type) query = query.eq('property_type', String(property_type).trim());
  if (posted_by) query = query.eq('posted_by', String(posted_by).trim());
  if (submitterIds) query = query.in('posted_by', submitterIds);
  if (created_from) query = query.gte('created_at', String(created_from).trim());
  if (created_to) query = query.lte('created_at', `${String(created_to).trim()}T23:59:59.999Z`);

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

// GET /api/admin/staff — List staff users for assignment
router.get('/staff', authenticate, async (req: AuthRequest, res: Response) => {
  if (!req.user || !['admin', 'broker', 'landlord'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Bạn không có quyền xem danh sách nhân viên' });
  }
  const { data, error } = await getSupabase()
    .from('profiles')
    .select('id, full_name, email, role')
    .in('role', ['admin', 'broker'])
    .order('full_name', { ascending: true });

  if (error) { res.status(400).json({ error: error.message }); return; }
  res.json({ staff: data });
});

// PUT /api/admin/listings/:id/assign — Assign inspector/staff for on-site check
router.put('/listings/:id/assign', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { inspector_id } = req.body;

  if (!inspector_id || typeof inspector_id !== 'string') {
    res.status(400).json({ error: 'inspector_id là bắt buộc' });
    return;
  }

  const supabase = getSupabase();

  const { data: staff, error: staffError } = await supabase
    .from('profiles')
    .select('id, role')
    .eq('id', inspector_id)
    .single();

  if (staffError || !staff || !['admin', 'broker'].includes(staff.role)) {
    res.status(400).json({ error: 'Nhân viên được phân công không hợp lệ' });
    return;
  }

  const { data, error } = await supabase
    .from('listings')
    .update({
      assigned_inspector_id: inspector_id,
      assigned_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('status', 'pending')
    .select('id, assigned_inspector_id, assigned_at')
    .single();

  if (error) { res.status(400).json({ error: error.message }); return; }
  res.json({ message: 'Đã phân công kiểm tra thực tế', assignment: data });
});

// POST /api/admin/listings/:id/review — Approve or reject a listing
router.post('/listings/:id/review', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  if (!req.user) { res.status(401).json({ error: 'Chưa xác thực' }); return; }
  const { id } = req.params;
  const { action, notes, checklist } = req.body as {
    action?: ReviewAction;
    notes?: string;
    checklist?: ListingReviewChecklist;
  };

  if (!action || !['approved', 'rejected'].includes(action)) {
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
      checklist: checklist || null,
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

// GET /api/admin/reviews/stats — Weekly/monthly review statistics
router.get('/reviews/stats', authenticate, requireAdmin, async (_req: AuthRequest, res: Response) => {
  const supabase = getSupabase();
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - 7);
  const monthStart = new Date(now);
  monthStart.setDate(now.getDate() - 30);

  const [
    { count: weekReviewed, error: weekError },
    { count: monthReviewed, error: monthError },
    { count: weekApproved, error: weekApprovedError },
    { count: monthApproved, error: monthApprovedError },
  ] = await Promise.all([
    supabase.from('listing_reviews').select('*', { count: 'exact', head: true }).gte('reviewed_at', weekStart.toISOString()),
    supabase.from('listing_reviews').select('*', { count: 'exact', head: true }).gte('reviewed_at', monthStart.toISOString()),
    supabase.from('listing_reviews').select('*', { count: 'exact', head: true }).gte('reviewed_at', weekStart.toISOString()).eq('action', 'approved'),
    supabase.from('listing_reviews').select('*', { count: 'exact', head: true }).gte('reviewed_at', monthStart.toISOString()).eq('action', 'approved'),
  ]);

  const statsError = weekError || monthError || weekApprovedError || monthApprovedError;
  if (statsError) {
    res.status(400).json({ error: statsError.message });
    return;
  }

  res.json({
    stats: {
      reviewedThisWeek: weekReviewed || 0,
      reviewedThisMonth: monthReviewed || 0,
      approvedThisWeek: weekApproved || 0,
      approvedThisMonth: monthApproved || 0,
      rejectedThisWeek: (weekReviewed || 0) - (weekApproved || 0),
      rejectedThisMonth: (monthReviewed || 0) - (monthApproved || 0),
    },
  });
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

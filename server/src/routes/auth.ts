import { Router, Request, Response } from 'express';
import { getSupabase } from '../lib/supabase';
import { authenticate, requireAdmin } from '../middleware/auth';
import type { AuthRequest } from '../middleware/auth';
import type { UserRole } from '../../../shared/types';

const router = Router();

// Valid roles for registration (admin is assigned manually)
const VALID_ROLES: UserRole[] = ['user', 'landlord', 'broker'];


/**
 * Helper: Log security and audit events to DB
 */
async function logAudit(
  eventType: string,
  userId: string | null,
  req: Request,
  metadata: Record<string, unknown> = {}
) {
  try {
    const supabase = getSupabase();
    const ip = req.headers['x-forwarded-for']?.toString().split(',')[0]?.trim() || req.ip;
    const userAgent = req.headers['user-agent'];

    await supabase.from('security_audit_logs').insert({
      event_type: eventType,
      user_id: userId,
      ip_address: ip,
      user_agent: userAgent,
      metadata: {
        ...metadata,
        path: req.path,
        method: req.method,
      },
    });

    console.log(`[AUDIT] ${eventType} - User: ${userId || 'GUEST'} - IP: ${ip}`);
  } catch (err) {
    console.error('[AUDIT ERROR]', err);
  }
}

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response) => {
  const { email, password, fullName, phone, role } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: 'Email và mật khẩu là bắt buộc' });
    return;
  }

  // Validate role (default to 'user')
  const selectedRole: UserRole = VALID_ROLES.includes(role) ? role : 'user';

  const supabase = getSupabase();
  const clientIP = req.headers['x-forwarded-for']?.toString().split(',')[0]?.trim() || req.ip;

  // 1. Create auth user
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName || '',
      },
    },
  });

  if (error) {
    console.error('[REGISTER ERROR]', error.message);
    await logAudit('REGISTER_FAILURE', null, req, { email, error: error.message });
    res.status(400).json({ error: error.message });
    return;
  }

  // 2. Create/Update profile row explicitly
  if (data.user) {
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: data.user.id,
        email,
        full_name: fullName || '',
        phone: phone || null,
        role: selectedRole,
        registration_ip: clientIP,
      }, { onConflict: 'id' });

    if (profileError) {
      console.error('[PROFILE CREATE ERROR]', profileError.message);
    }
    
    await logAudit('REGISTER_SUCCESS', data.user.id, req, { email, role: selectedRole });
  }

  res.json({
    user: data.user,
    session: data.session,
  });
});

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: 'Email và mật khẩu là bắt buộc' });
    return;
  }

  const { data, error } = await getSupabase().auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    await logAudit('LOGIN_FAILURE', null, req, { email, error: error?.message || 'Không tìm thấy người dùng' });
    res.status(401).json({ error: error?.message || 'Email hoặc mật khẩu không chính xác' });
    return;
  }

  // Fetch profile with audit data
  const { data: profile } = await getSupabase()
    .from('profiles')
    .select('*')
    .eq('id', data.user.id)
    .single();

  // Update login metadata (similar to EZ backend)
  await getSupabase()
    .from('profiles')
    .update({
      last_login: new Date().toISOString(),
      login_count: (profile?.login_count || 0) + 1,
    })
    .eq('id', data.user.id);

  await logAudit('LOGIN_SUCCESS', data.user.id, req, { email });

  res.json({
    user: {
      ...data.user,
      profile: {
        ...profile,
        last_login: new Date().toISOString(),
        login_count: (profile?.login_count || 0) + 1,
      },
    },
    session: data.session,
  });
});

// POST /api/auth/logout
router.post('/logout', authenticate, async (req: AuthRequest, res: Response) => {
  if (req.user) {
    await logAudit('LOGOUT', req.user.id, req, {});
  }
  res.json({ message: 'Đăng xuất thành công' });
});

// GET /api/auth/me — Get current user with profile
router.get('/me', async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.replace('Bearer ', '');

  if (!token) {
    res.status(401).json({ error: 'Không có token xác thực' });
    return;
  }

  const supabase = getSupabase();
  const { data: authData, error } = await supabase.auth.getUser(token);

  if (error || !authData.user) {
    res.status(401).json({ error: error?.message || 'Token không hợp lệ' });
    return;
  }

  // Fetch full profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', authData.user.id)
    .single();

  res.json({
    user: {
      ...authData.user,
      profile,
    },
  });
});

// POST /api/auth/refresh — Refresh session with refresh token
router.post('/refresh', async (req: Request, res: Response) => {
  const { refresh_token } = req.body;

  if (!refresh_token) {
    res.status(400).json({ error: 'Refresh token là bắt buộc' });
    return;
  }

  const { data, error } = await getSupabase().auth.refreshSession({
    refresh_token,
  });

  if (error) {
    res.status(401).json({ error: error.message });
    return;
  }

  // Fetch profile with role
  if (data.user) {
    const { data: profile } = await getSupabase()
      .from('profiles')
      .select('role, full_name, phone, avatar_url, subscription, is_verified')
      .eq('id', data.user.id)
      .single();

    res.json({
      user: {
        ...data.user,
        profile,
      },
      session: data.session,
    });
    return;
  }

  res.json({
    user: data.user,
    session: data.session,
  });
});

// PUT /api/auth/profile — Update own profile
router.put('/profile', authenticate, async (req: AuthRequest, res: Response) => {
  const { full_name, phone, avatar_url } = req.body;

  if (!req.user) {
    res.status(401).json({ error: 'Chưa xác thực' });
    return;
  }

  const updates: Record<string, unknown> = {};
  if (full_name !== undefined) updates.full_name = full_name;
  if (phone !== undefined) updates.phone = phone;
  if (avatar_url !== undefined) updates.avatar_url = avatar_url;

  const { data, error } = await getSupabase()
    .from('profiles')
    .update(updates)
    .eq('id', req.user.id)
    .select()
    .single();

  if (error) {
    res.status(400).json({ error: error.message });
    return;
  }

  res.json({ profile: data });
});

// GET /api/auth/users — Admin: list all users
router.get('/users', authenticate, requireAdmin, async (_req: AuthRequest, res: Response) => {
  const { data, error } = await getSupabase()
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    res.status(400).json({ error: error.message });
    return;
  }

  res.json({ users: data });
});

// PUT /api/auth/users/:id/role — Admin: change user role
router.put('/users/:id/role', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { role } = req.body;

  if (!['user', 'landlord', 'broker', 'admin'].includes(role)) {
    res.status(400).json({ error: 'Role không hợp lệ' });
    return;
  }

  const { data, error } = await getSupabase()
    .from('profiles')
    .update({ role })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    res.status(400).json({ error: error.message });
    return;
  }

  res.json({ profile: data });
});

// PUT /api/auth/users/:id/verify — Admin: verify/unverify user
router.put('/users/:id/verify', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { is_verified } = req.body;

  const { data, error } = await getSupabase()
    .from('profiles')
    .update({ is_verified: !!is_verified })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    res.status(400).json({ error: error.message });
    return;
  }

  res.json({ profile: data });
});

export default router;

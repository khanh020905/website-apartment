import { Router, Request, Response } from 'express';
import { getSupabase } from '../lib/supabase';

const router = Router();

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response) => {
  const { email, password, fullName } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: 'Email và mật khẩu là bắt buộc' });
    return;
  }

  const { data, error } = await getSupabase().auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName || '' },
    },
  });

  if (error) {
    res.status(400).json({ error: error.message });
    return;
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

  if (error) {
    res.status(401).json({ error: error.message });
    return;
  }

  res.json({
    user: data.user,
    session: data.session,
  });
});

// POST /api/auth/logout
router.post('/logout', async (_req: Request, res: Response) => {
  res.json({ message: 'Đăng xuất thành công' });
});

// GET /api/auth/me — Get current user from access token
router.get('/me', async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.replace('Bearer ', '');

  if (!token) {
    res.status(401).json({ error: 'Không có token xác thực' });
    return;
  }

  const { data, error } = await getSupabase().auth.getUser(token);

  if (error) {
    res.status(401).json({ error: error.message });
    return;
  }

  res.json({ user: data.user });
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

  res.json({
    user: data.user,
    session: data.session,
  });
});

export default router;

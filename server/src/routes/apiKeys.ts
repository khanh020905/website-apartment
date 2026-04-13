import { Router, Response } from 'express';
import { getSupabase } from '../lib/supabase';
import { authenticate } from '../middleware/auth';
import type { AuthRequest } from '../middleware/auth';
import crypto from 'crypto';

const router = Router();

const generateClientId = () => 'app_prod_' + crypto.randomBytes(6).toString('hex');
const generateClientSecret = () => 'sec_live_' + crypto.randomBytes(16).toString('hex');

// GET /api/api-keys
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  if (!req.user) { res.status(401).json({ error: 'Chưa xác thực' }); return; }

  const { data, error } = await getSupabase()
    .from('api_keys')
    .select('*')
    .eq('owner_id', req.user.id)
    .single();

  if (error && error.code !== 'PGRST116') {
    res.status(400).json({ error: error.message });
    return;
  }
  
  res.json({ credentials: data || null });
});

// POST /api/api-keys/refresh (Create or regenerate secret)
router.post('/refresh', authenticate, async (req: AuthRequest, res: Response) => {
  if (!req.user) { res.status(401).json({ error: 'Chưa xác thực' }); return; }

  // Check existing
  const { data: existing } = await getSupabase()
    .from('api_keys')
    .select('id, client_id')
    .eq('owner_id', req.user.id)
    .single();

  const newSecret = generateClientSecret();

  if (existing) {
    // Update existing secret
    const { data, error } = await getSupabase()
      .from('api_keys')
      .update({ client_secret: newSecret, updated_at: new Date().toISOString() })
      .eq('owner_id', req.user.id)
      .select()
      .single();
    if (error) { res.status(400).json({ error: error.message }); return; }
    res.json({ credentials: data });
  } else {
    // Create new
    const newClientId = generateClientId();
    const { data, error } = await getSupabase()
      .from('api_keys')
      .insert({
        owner_id: req.user.id,
        client_id: newClientId,
        client_secret: newSecret
      })
      .select()
      .single();
    
    if (error) { res.status(400).json({ error: error.message }); return; }
    res.json({ credentials: data });
  }
});

export default router;

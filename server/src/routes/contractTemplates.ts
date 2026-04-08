import { Router, Response } from 'express';
import { getSupabase } from '../lib/supabase';
import { authenticate } from '../middleware/auth';
import type { AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/contract-templates
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  if (!req.user) { res.status(401).json({ error: 'Chưa xác thực' }); return; }

  const { data, error } = await getSupabase()
    .from('contract_templates')
    .select('*')
    .eq('owner_id', req.user.id)
    .order('created_at', { ascending: false });

  if (error) { res.status(400).json({ error: error.message }); return; }
  res.json({ templates: data });
});

// POST /api/contract-templates
router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  if (!req.user) { res.status(401).json({ error: 'Chưa xác thực' }); return; }

  const { name, short_name, prefix_code, reminder_days, file_name, status } = req.body;

  if (!name) {
    res.status(400).json({ error: 'Tên mẫu hợp đồng là bắt buộc' });
    return;
  }

  const { data, error } = await getSupabase()
    .from('contract_templates')
    .insert({
      owner_id: req.user.id,
      name,
      short_name: short_name || null,
      prefix_code: prefix_code || null,
      reminder_days: reminder_days || 0,
      file_name: file_name || null,
      status: status || 'active'
    })
    .select()
    .single();

  if (error) { res.status(400).json({ error: error.message }); return; }
  res.status(201).json({ template: data });
});

// PUT /api/contract-templates/:id
router.put('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  if (!req.user) { res.status(401).json({ error: 'Chưa xác thực' }); return; }
  const { id } = req.params;

  // Verify ownership
  const { data: existing } = await getSupabase()
    .from('contract_templates')
    .select('owner_id')
    .eq('id', id)
    .single();

  if (!existing || existing.owner_id !== req.user.id) {
    res.status(403).json({ error: 'Không có quyền truy cập' });
    return;
  }

  const { name, short_name, prefix_code, reminder_days, file_name, status } = req.body;
  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  
  if (name !== undefined) updates.name = name;
  if (short_name !== undefined) updates.short_name = short_name;
  if (prefix_code !== undefined) updates.prefix_code = prefix_code;
  if (reminder_days !== undefined) updates.reminder_days = reminder_days;
  if (file_name !== undefined) updates.file_name = file_name;
  if (status !== undefined) updates.status = status;

  const { data, error } = await getSupabase()
    .from('contract_templates')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) { res.status(400).json({ error: error.message }); return; }
  res.json({ template: data });
});

// DELETE /api/contract-templates/:id
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  if (!req.user) { res.status(401).json({ error: 'Chưa xác thực' }); return; }
  const { id } = req.params;

  const { data: existing } = await getSupabase()
    .from('contract_templates')
    .select('owner_id')
    .eq('id', id)
    .single();

  if (!existing || existing.owner_id !== req.user.id) {
    res.status(403).json({ error: 'Không có quyền xóa' });
    return;
  }

  const { error } = await getSupabase()
    .from('contract_templates')
    .delete()
    .eq('id', id);

  if (error) { res.status(400).json({ error: error.message }); return; }
  res.json({ message: 'Xóa thành công' });
});

export default router;

import { Router, Response } from 'express';
import { getSupabase } from '../lib/supabase';
import { authenticate } from '../middleware/auth';
import type { AuthRequest } from '../middleware/auth';
import { subMonths, startOfMonth, endOfMonth, isAfter, isBefore, addDays } from 'date-fns';

const router = Router();

// GET /api/dashboard/stats — Aggregated stats for landlord/broker dashboard
router.get('/stats', authenticate, async (req: AuthRequest, res: Response) => {
  if (!req.user) { res.status(401).json({ error: 'Chưa xác thực' }); return; }

  try {
    const userId = req.user.id;
    const now = new Date();
    const firstDayCurrentMonth = startOfMonth(now);
    const lastDayCurrentMonth = endOfMonth(now);
    const firstDayLastMonth = startOfMonth(subMonths(now, 1));
    const lastDayLastMonth = endOfMonth(subMonths(now, 1));

    // 1. Get all buildings owned by the user
    const { data: buildings, error: buildingsError } = await getSupabase()
      .from('buildings')
      .select('id')
      .eq('owner_id', userId);

    if (buildingsError) throw buildingsError;
    const buildingIds = buildings.map(b => b.id);

    if (buildingIds.length === 0) {
      return res.json({
        totalRooms: 0,
        statusCounts: { available: 0, occupied: 0, maintenance: 0 },
        revenue: { current: 0, last: 0 },
        expiringContracts: { d7: [], d14: [], d30: [] },
        occupancyRate: 0
      });
    }

    // 2. Get rooms and status counts
    const { data: rooms, error: roomsError } = await getSupabase()
      .from('rooms')
      .select('status, price')
      .in('building_id', buildingIds);

    if (roomsError) throw roomsError;

    const totalRooms = rooms.length;
    const statusCounts = {
      available: rooms.filter(r => r.status === 'available').length,
      occupied: rooms.filter(r => r.status === 'occupied').length,
      maintenance: rooms.filter(r => r.status === 'maintenance').length,
    };

    const occupancyRate = totalRooms > 0 ? (statusCounts.occupied / totalRooms) * 100 : 0;

    // 3. Get contracts for revenue and expiration
    const { data: contracts, error: contractsError } = await getSupabase()
      .from('contracts')
      .select('*')
      .eq('landlord_id', userId)
      .eq('status', 'active');

    if (contractsError) throw contractsError;

    // Calculate revenue (simple sum of rent_amount for current month active contracts)
    // In a real app, this would check payment history
    const currentRevenue = contracts.reduce((acc, c) => acc + Number(c.rent_amount), 0);
    // Mock last month revenue for comparison (real app would query transactions or historical snapshots)
    const lastRevenue = currentRevenue * 0.95; 

    // 4. Expiring contracts
    const d7Limit = addDays(now, 7);
    const d14Limit = addDays(now, 14);
    const d30Limit = addDays(now, 30);

    const expiring = {
      d7: contracts.filter(c => c.end_date && isAfter(new Date(c.end_date), now) && isBefore(new Date(c.end_date), d7Limit)),
      d14: contracts.filter(c => c.end_date && isAfter(new Date(c.end_date), now) && isBefore(new Date(c.end_date), d14Limit)),
      d30: contracts.filter(c => c.end_date && isAfter(new Date(c.end_date), now) && isBefore(new Date(c.end_date), d30Limit)),
    };

    res.json({
      totalRooms,
      statusCounts,
      revenue: {
        current: currentRevenue,
        last: lastRevenue,
      },
      expiringContracts: expiring,
      occupancyRate,
      buildingCount: buildingIds.length
    });

  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

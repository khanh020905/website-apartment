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

    // 4. Incident stats (pending or in_progress)
    const { count: incidentCount, error: incidentError } = await getSupabase()
      .from('incidents')
      .select('*', { count: 'exact', head: true })
      .in('building_id', buildingIds)
      .in('status', ['pending', 'in_progress']);

    if (incidentError) console.error('Error fetching incident stats:', incidentError);

    // 5. Overdue invoices (due_date < now and not paid)
    const { count: overdueInvoiceCount, error: invoiceError } = await getSupabase()
      .from('invoices')
      .select('*', { count: 'exact', head: true })
      .in('building_id', buildingIds)
      .neq('status', 'paid')
      .lt('due_date', now.toISOString());

    if (invoiceError) console.error('Error fetching invoice stats:', invoiceError);

    // 6. Today's appointments
    const todayStart = new Date(now.setHours(0,0,0,0)).toISOString();
    const todayEnd = new Date(now.setHours(23,59,59,999)).toISOString();
    const { count: todayAppointmentCount, error: appointmentError } = await getSupabase()
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .in('building_id', buildingIds)
      .gte('appointment_date', todayStart)
      .lte('appointment_date', todayEnd);

    if (appointmentError) console.error('Error fetching appointment stats:', appointmentError);

    // 7. Expiring contracts
    const d7Limit = addDays(new Date(), 7);
    const d14Limit = addDays(new Date(), 14);
    const d30Limit = addDays(new Date(), 30);

    const expiring = {
      d7: contracts.filter(c => c.end_date && isAfter(new Date(c.end_date), new Date()) && isBefore(new Date(c.end_date), d7Limit)),
      d14: contracts.filter(c => c.end_date && isAfter(new Date(c.end_date), new Date()) && isBefore(new Date(c.end_date), d14Limit)),
      d30: contracts.filter(c => c.end_date && isAfter(new Date(c.end_date), new Date()) && isBefore(new Date(c.end_date), d30Limit)),
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
      buildingCount: buildingIds.length,
      upcomingStats: {
        incidents: incidentCount || 0,
        overdueInvoices: overdueInvoiceCount || 0,
        todayAppointments: todayAppointmentCount || 0
      }
    });

  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

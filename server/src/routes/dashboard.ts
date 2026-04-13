import { Router, Response } from 'express';
import { getSupabase } from '../lib/supabase';
import { authenticate } from '../middleware/auth';
import type { AuthRequest } from '../middleware/auth';
import { isAfter, isBefore, addDays, eachDayOfInterval, endOfMonth, format, startOfMonth } from 'date-fns';

const router = Router();
const DAY_MS = 24 * 60 * 60 * 1000;

const toDateOnly = (value: string | null) => {
  if (!value) return null;
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
};

// GET /api/dashboard/stats — Aggregated stats for landlord/broker dashboard
router.get('/stats', authenticate, async (req: AuthRequest, res: Response) => {
  if (!req.user) { res.status(401).json({ error: 'Chưa xác thực' }); return; }

  try {
    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin';
    const selectedBuildingId =
      typeof req.query.building_id === 'string' && req.query.building_id.trim().length > 0 ?
        req.query.building_id.trim()
      : null;
    const now = new Date();
    const nowDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const monthStart = startOfMonth(nowDay);
    const monthEnd = endOfMonth(nowDay);

    // 1. Resolve accessible buildings by role + selected building
    let buildingQuery = getSupabase()
      .from('buildings')
      .select('id')
      .order('created_at', { ascending: false });

    if (isAdmin) {
      if (selectedBuildingId) {
        buildingQuery = buildingQuery.eq('id', selectedBuildingId);
      }
    } else {
      buildingQuery = buildingQuery.eq('owner_id', userId);
      if (selectedBuildingId) {
        buildingQuery = buildingQuery.eq('id', selectedBuildingId);
      }
    }

    const { data: buildings, error: buildingsError } = await buildingQuery;

    if (buildingsError) throw buildingsError;
    const buildingIds = (buildings || []).map(b => b.id);

    if (buildingIds.length === 0) {
      return res.json({
        totalRooms: 0,
        statusCounts: { available: 0, occupied: 0, maintenance: 0 },
        revenue: { current: 0, last: 0 },
        expiringContracts: { d7: [], d14: [], d30: [] },
        occupancyRate: 0,
        buildingCount: 0,
        quickStats: {
          roomsStartingToday: 0,
          roomsDueReturnToday: 0,
          invoicesDueSoon3d: 0,
          visaExpiringThisMonth: 0,
        },
        occupancyTrend: [],
        upcomingStats: {
          incidents: 0,
          overdueInvoices: 0,
          todayAppointments: 0,
        }
      });
    }

    // 2. Get rooms and status counts
    const { data: rooms, error: roomsError } = await getSupabase()
      .from('rooms')
      .select('id, status')
      .in('building_id', buildingIds);

    if (roomsError) throw roomsError;

    const safeRooms = rooms || [];
    const roomIds = safeRooms.map((room) => room.id);
    const totalRooms = safeRooms.length;
    const statusCounts = {
      available: safeRooms.filter(r => r.status === 'available').length,
      occupied: safeRooms.filter(r => r.status === 'occupied').length,
      maintenance: safeRooms.filter(r => r.status === 'maintenance').length,
    };

    const occupancyRate = totalRooms > 0 ? (statusCounts.occupied / totalRooms) * 100 : 0;

    // 3. Get contracts for revenue/expiration/chart (scoped by selected buildings via room_id)
    const contractsQuery =
      roomIds.length > 0 ?
        (
          await getSupabase()
            .from('contracts')
            .select('*')
            .in('room_id', roomIds)
        )
      : { data: [], error: null as { message: string } | null };

    const contractsError = contractsQuery.error;

    if (contractsError) throw contractsError;
    const allContracts = contractsQuery.data || [];
    const activeContracts = allContracts.filter((c) => c.status === 'active');

    // Calculate revenue (simple sum of active rent_amount in current scope)
    // In a real app, this would check payment history
    const currentRevenue = activeContracts.reduce((acc, c) => acc + Number(c.rent_amount), 0);
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
    const today = format(nowDay, 'yyyy-MM-dd');
    const { count: todayAppointmentCount, error: appointmentError } = await getSupabase()
      .from('visit_tours')
      .select('*', { count: 'exact', head: true })
      .in('building_id', buildingIds)
      .eq('appointment_date', today)
      .neq('status', 'cancelled');

    if (appointmentError) console.error('Error fetching appointment stats:', appointmentError);

    // 7. Expiring contracts
    const d7Limit = addDays(new Date(), 7);
    const d14Limit = addDays(new Date(), 14);
    const d30Limit = addDays(new Date(), 30);

    const expiring = {
      d7: activeContracts.filter(c => c.end_date && isAfter(new Date(c.end_date), new Date()) && isBefore(new Date(c.end_date), d7Limit)),
      d14: activeContracts.filter(c => c.end_date && isAfter(new Date(c.end_date), new Date()) && isBefore(new Date(c.end_date), d14Limit)),
      d30: activeContracts.filter(c => c.end_date && isAfter(new Date(c.end_date), new Date()) && isBefore(new Date(c.end_date), d30Limit)),
    };

    // 8. Quick cards data
    const { data: todayReservations, error: reservationError } = await getSupabase()
      .from('reservations')
      .select('room_id')
      .in('building_id', buildingIds)
      .eq('check_in_date', today)
      .in('status', ['confirmed', 'active']);

    if (reservationError) console.error('Error fetching reservation stats:', reservationError);

    const todayReservationRoomSet = new Set((todayReservations || []).map((r) => r.room_id).filter(Boolean));
    const roomsStartingToday = todayReservationRoomSet.size;

    const roomsDueReturnToday = activeContracts.filter((contract) => {
      const endDate = toDateOnly(contract.end_date);
      return Boolean(endDate && endDate.getTime() === nowDay.getTime());
    }).length;

    const dueSoonDate = format(addDays(nowDay, 3), 'yyyy-MM-dd');
    const { count: invoicesDueSoon3d, error: dueSoonInvoicesError } = await getSupabase()
      .from('invoices')
      .select('*', { count: 'exact', head: true })
      .in('building_id', buildingIds)
      .neq('status', 'paid')
      .gte('due_date', today)
      .lte('due_date', dueSoonDate);

    if (dueSoonInvoicesError) console.error('Error fetching due-soon invoice stats:', dueSoonInvoicesError);

    const visaExpiringThisMonth = activeContracts.filter((contract) => {
      const tenantNationality = (contract.tenant_nationality || '').toLowerCase();
      const isForeignTenant =
        tenantNationality.length > 0 &&
        tenantNationality !== 'việt nam' &&
        tenantNationality !== 'viet nam' &&
        tenantNationality !== 'vietnam';

      if (!isForeignTenant) return false;
      const endDate = toDateOnly(contract.end_date);
      if (!endDate) return false;
      return endDate >= monthStart && endDate <= monthEnd;
    }).length;

    // 9. Occupancy trend by day in current month
    const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
    const occupancyTrend = monthDays.map((day) => {
      const occupiedRoomSet = new Set<string>();
      const dayMs = day.getTime();

      activeContracts.forEach((contract) => {
        const startDate = toDateOnly(contract.start_date);
        if (!startDate || !contract.room_id) return;
        const endDate = toDateOnly(contract.end_date);
        const startMs = startDate.getTime();
        const endMs = endDate ? endDate.getTime() : Number.POSITIVE_INFINITY;
        if (startMs <= dayMs + DAY_MS - 1 && endMs >= dayMs) {
          occupiedRoomSet.add(contract.room_id);
        }
      });

      const rate = totalRooms > 0 ? Math.round((occupiedRoomSet.size / totalRooms) * 100) : 0;
      return {
        day: format(day, 'dd/MM'),
        rate,
      };
    });

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
      quickStats: {
        roomsStartingToday,
        roomsDueReturnToday,
        invoicesDueSoon3d: invoicesDueSoon3d || 0,
        visaExpiringThisMonth,
      },
      occupancyTrend,
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

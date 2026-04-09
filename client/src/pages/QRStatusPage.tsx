import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams } from 'react-router-dom';
import { api } from '../lib/api';
import type { Room, RoomStatus } from '../../../shared/types';

interface BuildingStatus {
  id: string;
  name: string;
  address: string;
  floors: number;
  rooms: Room[];
}

const STATUS_COLORS: Record<RoomStatus, { bg: string; text: string; label: string }> = {
  available: { bg: 'bg-emerald-100 border-emerald-300', text: 'text-emerald-700', label: 'Trống' },
  occupied: { bg: 'bg-red-100 border-red-300', text: 'text-red-700', label: 'Đã thuê' },
  maintenance: { bg: 'bg-brand-bg border-brand-primary/30', text: 'text-brand-ink', label: 'Bảo trì' },
};

export default function QRStatusPage() {
  const { code } = useParams<{ code: string }>();
  const [building, setBuilding] = useState<BuildingStatus | null>(null);
  const [contact, setContact] = useState<{ full_name: string; phone: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!code) return;
    api.get<{ building: BuildingStatus; contact: { full_name: string; phone: string } }>(`/api/qr/${code}`).then(({ data, error }) => {
      if (error) {
        setError(error);
      } else if (data) {
        setBuilding(data.building);
        setContact(data.contact);
      }
      setLoading(false);
    });
  }, [code]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600" />
      </div>
    );
  }

  if (error || !building) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Mã QR không hợp lệ</h1>
          <p className="text-slate-500">{error || 'Không tìm thấy thông tin tòa nhà'}</p>
        </div>
      </div>
    );
  }

  const stats = {
    total: building.rooms.length,
    available: building.rooms.filter(r => r.status === 'available').length,
    occupied: building.rooms.filter(r => r.status === 'occupied').length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-900 to-emerald-700">
      {/* Header */}
      <div className="p-6 pb-0">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <span className="text-xl">🏢</span>
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-white">{building.name}</h1>
              <p className="text-emerald-200 text-sm">{building.address}</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-white/10 backdrop-blur rounded-xl p-3 text-center">
              <p className="text-2xl font-extrabold text-white">{stats.total}</p>
              <p className="text-xs text-emerald-200">Tổng phòng</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-3 text-center">
              <p className="text-2xl font-extrabold text-emerald-300">{stats.available}</p>
              <p className="text-xs text-emerald-200">Còn trống</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-3 text-center">
              <p className="text-2xl font-extrabold text-orange-300">{stats.occupied}</p>
              <p className="text-xs text-emerald-200">Đã thuê</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Floor Diagram */}
      <div className="bg-white rounded-t-3xl min-h-[50vh] p-6">
        <h2 className="font-bold text-slate-800 mb-4">Sơ đồ phòng</h2>
        <div className="flex gap-4 mb-6 text-xs">
          {Object.entries(STATUS_COLORS).map(([status, style]) => (
            <div key={status} className="flex items-center gap-1.5">
              <div className={`w-4 h-4 rounded border-2 ${style.bg}`} />
              {style.label}
            </div>
          ))}
        </div>

        {Array.from({ length: building.floors }, (_, i) => building.floors - i).map(floor => {
          const floorRooms = building.rooms.filter(r => r.floor === floor);
          return (
            <motion.div key={floor} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: floor * 0.05 }}
              className="mb-4">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-400 w-14">Tầng {floor}</span>
                <div className="flex-1 flex gap-2 flex-wrap">
                  {floorRooms.length > 0 ? floorRooms.map(room => (
                    <div key={room.id}
                      className={`min-w-[70px] p-2.5 rounded-xl border-2 text-center transition-all ${STATUS_COLORS[room.status].bg}`}>
                      <p className="text-xs font-extrabold text-slate-800">{room.room_number}</p>
                      <p className={`text-[10px] font-semibold ${STATUS_COLORS[room.status].text}`}>{STATUS_COLORS[room.status].label}</p>
                      {room.price && <p className="text-[10px] text-slate-500 mt-0.5">{(Number(room.price) / 1000000).toFixed(1)}tr</p>}
                    </div>
                  )) : (
                    <span className="text-xs text-slate-400 italic">—</span>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}

        {/* Contact */}
        {contact && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="mt-8 bg-emerald-50 rounded-2xl p-5 border border-emerald-200">
            <h3 className="font-bold text-emerald-800 mb-2">Liên hệ chủ trọ</h3>
            <p className="text-sm text-slate-700">{contact.full_name}</p>
            <a href={`tel:${contact.phone}`} className="inline-flex items-center gap-2 mt-2 px-5 py-2.5 bg-emerald-700 text-white rounded-xl font-semibold text-sm hover:bg-emerald-800 transition-colors">
              📞 {contact.phone}
            </a>
          </motion.div>
        )}
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Building2, Phone, User, 
  AlertCircle, MapPin, 
  RefreshCw, MessageCircle
} from 'lucide-react';
import { api } from '../lib/api';
import type { Room, RoomStatus } from '../../../shared/types';

const PUBLIC_STATUS_CONFIG: Record<RoomStatus, { color: string; bg: string; border: string; dot: string }> = {
  available: { 
    color: 'text-emerald-700', 
    bg: 'bg-emerald-50', 
    border: 'border-emerald-200', 
    dot: 'bg-emerald-500' 
  },
  occupied: { 
    color: 'text-rose-700', 
    bg: 'bg-rose-50', 
    border: 'border-rose-200', 
    dot: 'bg-rose-500' // Red as per SRS 4.5.2
  },
  maintenance: { 
    color: 'text-amber-700', 
    bg: 'bg-amber-50', 
    border: 'border-amber-200', 
    dot: 'bg-amber-500' // Yellow as per SRS 4.5.2
  },
};

export default function BuildingStatusPage() {
  const { code } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<{ building: any; contact: any } | null>(null);

  useEffect(() => {
    loadStatus();
  }, [code]);

  const loadStatus = async () => {
    setLoading(true);
    try {
      const { data, error } = await api.get<{ building: any; contact: any }>(`/api/qr/${code}`);
      if (error) setError(error);
      else if (data) setData(data);
    } catch (err) {
      setError('Không thể tải thông tin. Vui lòng quét lại mã QR.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-10 space-y-6">
      <RefreshCw className="w-12 h-12 text-indigo-500 animate-spin" />
      <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Đang tải trạng thái phòng...</p>
    </div>
  );

  if (error || !data) return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-10 text-center">
      <div className="w-24 h-24 bg-rose-50 rounded-[40px] flex items-center justify-center mb-8 border-4 border-white shadow-xl rotate-6">
        <AlertCircle className="w-12 h-12 text-rose-500" />
      </div>
      <h2 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">QR Không tồn tại</h2>
      <p className="text-slate-400 font-bold mb-10 max-w-xs">{error || 'Mã QR đã hết hiệu lực hoặc không chính xác.'}</p>
      <button onClick={() => window.location.href = '/'} className="px-10 py-4 bg-slate-900 text-white rounded-[24px] font-black uppercase tracking-widest text-xs">Quay lại trang chủ</button>
    </div>
  );

  const { building, contact } = data;
  const rooms: Room[] = building.rooms || [];
  
  // Group by floor
  const floorGroups: Record<number, Room[]> = {};
  rooms.forEach(room => {
    if (!floorGroups[room.floor]) floorGroups[room.floor] = [];
    floorGroups[room.floor].push(room);
  });
  const sortedFloors = Object.keys(floorGroups).map(Number).sort((a,b) => b-a);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center pb-20">
      <div className="w-full max-w-md bg-white border-b border-slate-100 p-8 shadow-sm relative overflow-hidden">
        {/* Abstract background shape */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-50 rounded-full blur-[80px] opacity-60" />
        
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-indigo-600 rounded-[28px] flex items-center justify-center shadow-xl shadow-indigo-900/20 mb-6 border-4 border-white">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mb-2 uppercase tracking-widest leading-none">{building.name}</h1>
          <div className="flex items-start justify-center gap-1 text-slate-400 font-black text-[10px] uppercase tracking-widest">
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            <span className="line-clamp-2">{building.address}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full max-w-md px-4 mt-8 space-y-10">
        
        {/* Status Legend */}
        <div className="flex items-center justify-around p-4 bg-white/60 backdrop-blur-md rounded-3xl border border-white shadow-xl shadow-slate-900/[0.03]">
          {Object.entries(PUBLIC_STATUS_CONFIG).map(([key, cfg]) => (
            <div key={key} className="flex flex-col items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${cfg.dot} shadow-lg shadow-black/10`} />
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                {key === 'available' ? 'Trống' : key === 'occupied' ? 'Đã thuê' : 'Đang sửa'}
              </span>
            </div>
          ))}
        </div>

        {/* Floor Plan */}
        <div className="space-y-12 pb-10">
          {sortedFloors.length > 0 ? sortedFloors.map(floor => (
            <div key={floor} className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-md border border-slate-50">
                  <span className="text-lg font-black text-slate-900">{floor}</span>
                </div>
                <div className="flex-1 h-px bg-slate-200/50" />
              </div>

              <div className="grid grid-cols-4 gap-3">
                {floorGroups[floor].sort((a,b) => a.room_number.localeCompare(b.room_number)).map(room => {
                  const cfg = PUBLIC_STATUS_CONFIG[room.status];
                  return (
                    <motion.div 
                      key={room.id}
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className={`aspect-square ${cfg.bg} border ${cfg.border} rounded-2xl flex flex-col items-center justify-center gap-1 shadow-sm relative overflow-hidden group`}
                    >
                      <span className={`text-base font-black ${cfg.color}`}>{room.room_number}</span>
                      <div className={`w-1 h-1 rounded-full ${cfg.dot}`} />
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )) : (
            <div className="py-20 text-center font-bold text-slate-400">Không có dữ liệu phòng</div>
          )}
        </div>
      </div>

      {/* Landlord Contact (Floating at bottom) */}
      <div className="fixed bottom-0 left-0 right-0 p-4 z-[100] flex justify-center">
        <motion.div 
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="w-full max-w-sm bg-slate-900 rounded-[32px] p-4 flex items-center shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-white/10"
        >
          <div className="flex-1 flex items-center gap-4 pl-2">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center overflow-hidden border border-white/20">
              <User className="w-6 h-6 text-white/40" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Chủ tòa nhà</p>
              <h5 className="text-sm font-black text-white">{contact?.full_name || 'Chưa cập nhật'}</h5>
            </div>
          </div>
          <a 
            href={`tel:${contact?.phone}`}
            className="w-20 h-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-900/40 hover:bg-indigo-700 transition-colors"
          >
            <Phone className="w-6 h-6" />
          </a>
          <a 
             href={`https://zalo.me/${contact?.phone}`}
             target="_blank"
             rel="noopener noreferrer"
             className="w-14 h-14 ml-2 bg-emerald-600 text-white rounded-2xl flex items-center justify-center shadow-xl shadow-emerald-900/40"
          >
            <MessageCircle className="w-6 h-6" />
          </a>
        </motion.div>
      </div>

      <p className="mt-10 mb-20 text-[10px] font-black text-slate-300 uppercase tracking-widest text-center px-10 leading-relaxed">
        * Dữ liệu cập nhật thời gian thực từ hệ thống HomeSpot. Quét mã QR tại tòa nhà để xem lại.
      </p>
    </div>
  );
}

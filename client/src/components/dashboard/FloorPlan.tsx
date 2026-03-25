import { motion } from 'framer-motion';
import { 
  Users, LayoutGrid, Trash2, Edit3, Wrench, CheckCircle 
} from 'lucide-react';
import type { Room, RoomStatus, BuildingWithRooms } from '../../../../shared/types';
import { ROOM_STATUS_LABELS } from '../../../../shared/types';
import { useState } from 'react';

const STATUS_CONFIG: Record<RoomStatus, { color: string; bg: string; border: string; icon: React.ReactNode }> = {
  available: { 
    color: 'text-emerald-600', 
    bg: 'bg-emerald-50', 
    border: 'border-emerald-200', 
    icon: <CheckCircle className="w-3 h-3" /> 
  },
  occupied: { 
    color: 'text-orange-600', 
    bg: 'bg-orange-50', 
    border: 'border-orange-200', 
    icon: <Users className="w-3 h-3" /> 
  },
  maintenance: { 
    color: 'text-slate-500', 
    bg: 'bg-slate-100', 
    border: 'border-slate-300', 
    icon: <Wrench className="w-3 h-3" /> 
  },
};

interface FloorPlanProps {
  building: BuildingWithRooms;
  onStatusChange: (roomId: string, status: RoomStatus) => void;
  onDeleteRoom: (roomId: string) => void;
  onEditRoom: (room: Room) => void;
  onAddRoom: () => void;
}

export const FloorPlan = ({ 
  building, onStatusChange, onDeleteRoom, onEditRoom, onAddRoom 
}: FloorPlanProps) => {
  const [filter, setFilter] = useState<RoomStatus | 'all'>('all');

  const rooms = building.rooms || [];
  const filteredRooms = filter === 'all' 
    ? rooms 
    : rooms.filter(r => r.status === filter);

  // Group by floor
  const floorGroups: Record<number, Room[]> = {};
  filteredRooms.forEach(room => {
    if (!floorGroups[room.floor]) floorGroups[room.floor] = [];
    floorGroups[room.floor].push(room);
  });

  // Sort floors descending
  const sortedFloors = Object.keys(floorGroups)
    .map(Number)
    .sort((a, b) => b - a);

  return (
    <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm min-h-[500px]">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <LayoutGrid className="w-6 h-6 text-indigo-500" />
            Sơ đồ phòng tòa {building.name}
          </h3>
          <p className="text-sm font-bold text-slate-400 mt-1 uppercase tracking-widest">{building.address}</p>
        </div>

        <div className="flex items-center gap-3 overflow-x-auto pb-2 md:pb-0">
          <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
            {(['all', 'available', 'occupied', 'maintenance'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                  filter === f ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {f === 'all' ? 'Tất cả' : ROOM_STATUS_LABELS[f]}
              </button>
            ))}
          </div>
          <button 
            onClick={onAddRoom}
            className="px-6 py-2.5 bg-emerald-700 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-emerald-900/10 hover:bg-emerald-800 transition-colors cursor-pointer"
          >
            + Phòng mới
          </button>
        </div>
      </div>

      {/* Grid Rendering */}
      <div className="space-y-12">
        {sortedFloors.length > 0 ? (
          sortedFloors.map(floor => (
            <div key={floor} className="relative">
              <div className="flex items-start gap-8">
                {/* Floor Indicator */}
                <div className="w-16 h-16 flex flex-col items-center justify-center bg-slate-50 border border-slate-100 rounded-3xl shrink-0">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tầng</span>
                  <span className="text-2xl font-black text-slate-900 leading-tight">{floor}</span>
                </div>

                {/* Rooms Row */}
                <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
                  {floorGroups[floor].sort((a,b) => a.room_number.localeCompare(b.room_number)).map(room => {
                    const cfg = STATUS_CONFIG[room.status];
                    return (
                      <motion.div 
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        key={room.id} 
                        className="group relative"
                      >
                        <div className={`aspect-[5/4] ${cfg.bg} border-2 ${cfg.border} rounded-3xl p-4 flex flex-col items-center justify-center gap-1.5 transition-all hover:shadow-xl hover:-translate-y-1 cursor-pointer overflow-hidden relative`}>
                          <span className="text-base font-black text-slate-800 tracking-tight">{room.room_number}</span>
                          <button 
                            onClick={(e) => { 
                              e.stopPropagation();
                              const statuses: RoomStatus[] = ['available', 'occupied', 'maintenance'];
                              const next = statuses[(statuses.indexOf(room.status) + 1) % statuses.length];
                              onStatusChange(room.id, next);
                            }}
                            className={`flex items-center gap-1.5 ${cfg.color} text-[10px] font-black uppercase tracking-widest bg-white/60 px-2 py-1 rounded-lg backdrop-blur-sm cursor-pointer hover:bg-white transition-colors`}
                          >
                            {cfg.icon}
                            {ROOM_STATUS_LABELS[room.status].split(' ')[1] || ROOM_STATUS_LABELS[room.status]}
                          </button>
                          <p className="text-[10px] text-slate-400 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                            {room.area}m² • {room.current_occupants}/{room.max_occupants}
                          </p>
                          
                          {/* Corner actions for desktop hover */}
                          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1 translate-x-2 group-hover:translate-x-0 transition-transform">
                            <button onClick={(e) => { e.stopPropagation(); onEditRoom(room); }} className="p-1 text-slate-400 hover:text-indigo-600 bg-white rounded-lg shadow-sm">
                              <Edit3 className="w-3 h-3" />
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); onDeleteRoom(room.id); }} className="p-1 text-slate-400 hover:text-rose-600 bg-white rounded-lg shadow-sm">
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        {/* Dropdown / Popover Placeholder - implemented via click & selection */}
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Floor Divider */}
              <div className="absolute left-8 right-0 bottom-[-24px] border-t border-slate-50 border-dashed" />
            </div>
          ))
        ) : (
          <div className="py-20 text-center space-y-4">
            <div className="w-20 h-20 bg-slate-50 text-slate-200 rounded-[40px] flex items-center justify-center mx-auto">
              <LayoutGrid className="w-10 h-10" />
            </div>
            <div>
              <p className="text-lg font-black text-slate-900">Không tìm thấy phòng phù hợp</p>
              <p className="text-sm font-bold text-slate-400">Hãy thử thay đổi bộ lọc hoặc thêm phòng mới</p>
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="mt-20 pt-10 border-t border-slate-50 flex flex-wrap gap-8 justify-center opacity-70 grayscale hover:grayscale-0 transition-all">
        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
          <div key={key} className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${cfg.bg.replace('bg-', 'bg-').split('-')[1] === 'slate' ? 'bg-slate-400' : cfg.bg.replace('bg-', 'bg-').split('-')[1] === 'emerald' ? 'bg-emerald-500' : 'bg-orange-500'}`} />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
              {ROOM_STATUS_LABELS[key as RoomStatus]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

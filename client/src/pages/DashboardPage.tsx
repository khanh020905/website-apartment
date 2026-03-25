import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';
import type { Building, Room, RoomStatus } from '../../../shared/types';

const STATUS_COLORS: Record<RoomStatus, string> = {
  available: 'bg-emerald-400',
  occupied: 'bg-orange-400',
  maintenance: 'bg-slate-400',
};
const STATUS_LABELS: Record<RoomStatus, string> = {
  available: 'Trống',
  occupied: 'Đang thuê',
  maintenance: 'Bảo trì',
};

interface BuildingWithRooms extends Building {
  rooms: Room[];
}

export default function DashboardPage() {
  const { canManageBuildings } = useAuth();
  const [buildings, setBuildings] = useState<BuildingWithRooms[]>([]);
  const [selectedBuilding, setSelectedBuilding] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showBuildingForm, setShowBuildingForm] = useState(false);
  const [showRoomForm, setShowRoomForm] = useState(false);
  const [newBuilding, setNewBuilding] = useState({ name: '', address: '', city: '', district: '', floors: '5' });
  const [newRoom, setNewRoom] = useState({ room_number: '', floor: '1', area: '', price: '' });

  useEffect(() => {
    loadBuildings();
  }, []);

  const loadBuildings = async () => {
    setLoading(true);
    const { data } = await api.get<{ buildings: BuildingWithRooms[] }>('/api/buildings');
    if (data) {
      // Load rooms for each building
      const buildingsWithRooms = await Promise.all(
        data.buildings.map(async (b) => {
          const { data: roomData } = await api.get<{ rooms: Room[] }>(`/api/rooms?building_id=${b.id}`);
          return { ...b, rooms: roomData?.rooms || [] };
        })
      );
      setBuildings(buildingsWithRooms);
      if (buildingsWithRooms.length > 0 && !selectedBuilding) {
        setSelectedBuilding(buildingsWithRooms[0].id);
      }
    }
    setLoading(false);
  };

  const handleCreateBuilding = async () => {
    const { error } = await api.post('/api/buildings', {
      ...newBuilding,
      floors: Number(newBuilding.floors),
    });
    if (!error) {
      setShowBuildingForm(false);
      setNewBuilding({ name: '', address: '', city: '', district: '', floors: '5' });
      loadBuildings();
    }
  };

  const handleCreateRoom = async () => {
    if (!selectedBuilding) return;
    const { error } = await api.post('/api/rooms', {
      building_id: selectedBuilding,
      room_number: newRoom.room_number,
      floor: Number(newRoom.floor),
      area: newRoom.area ? Number(newRoom.area) : null,
      price: newRoom.price ? Number(newRoom.price) * 1000000 : null,
    });
    if (!error) {
      setShowRoomForm(false);
      setNewRoom({ room_number: '', floor: '1', area: '', price: '' });
      loadBuildings();
    }
  };

  const handleRoomStatusChange = async (roomId: string, status: RoomStatus) => {
    await api.put(`/api/rooms/${roomId}/status`, { status });
    loadBuildings();
  };

  const handleDeleteRoom = async (roomId: string) => {
    if (!confirm('Bạn có chắc muốn xóa phòng này?')) return;
    await api.delete(`/api/rooms/${roomId}`);
    loadBuildings();
  };

  const currentBuilding = buildings.find(b => b.id === selectedBuilding);
  const stats = currentBuilding ? {
    total: currentBuilding.rooms.length,
    available: currentBuilding.rooms.filter(r => r.status === 'available').length,
    occupied: currentBuilding.rooms.filter(r => r.status === 'occupied').length,
    maintenance: currentBuilding.rooms.filter(r => r.status === 'maintenance').length,
  } : { total: 0, available: 0, occupied: 0, maintenance: 0 };

  if (!canManageBuildings) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-slate-800">Bạn cần tài khoản Chủ trọ / Môi giới</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900">Bảng điều khiển</h1>
            <p className="text-slate-500 mt-1">Quản lý tòa nhà và phòng trọ của bạn</p>
          </div>
          <div className="flex gap-3">
            <Link to="/create-listing" className="px-5 py-2.5 bg-emerald-700 text-white rounded-xl font-semibold text-sm hover:bg-emerald-800 transition-colors">
              + Đăng tin
            </Link>
            <button onClick={() => setShowBuildingForm(true)} className="px-5 py-2.5 bg-white border-2 border-emerald-700 text-emerald-700 rounded-xl font-semibold text-sm hover:bg-emerald-50 transition-colors cursor-pointer">
              + Thêm tòa nhà
            </button>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Tổng phòng', value: stats.total, color: 'bg-blue-500', icon: '🏠' },
            { label: 'Còn trống', value: stats.available, color: 'bg-emerald-500', icon: '✅' },
            { label: 'Đang thuê', value: stats.occupied, color: 'bg-orange-500', icon: '👤' },
            { label: 'Bảo trì', value: stats.maintenance, color: 'bg-slate-500', icon: '🔧' },
          ].map(s => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl p-5 border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">{s.icon}</span>
                <span className={`w-3 h-3 rounded-full ${s.color}`} />
              </div>
              <p className="text-3xl font-extrabold text-slate-900">{s.value}</p>
              <p className="text-sm text-slate-500">{s.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Building Tabs */}
        {buildings.length > 0 && (
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {buildings.map(b => (
              <button key={b.id} onClick={() => setSelectedBuilding(b.id)}
                className={`px-5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap cursor-pointer transition-all ${
                  selectedBuilding === b.id ? 'bg-emerald-700 text-white shadow-lg shadow-emerald-900/20' : 'bg-white text-slate-600 border border-slate-200 hover:border-emerald-300'
                }`}>
                🏢 {b.name}
              </button>
            ))}
          </div>
        )}

        {/* Floor Diagram */}
        {currentBuilding && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-2xl p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-800">Sơ đồ phòng — {currentBuilding.name}</h3>
              <div className="flex gap-4 text-xs">
                {Object.entries(STATUS_LABELS).map(([status, label]) => (
                  <div key={status} className="flex items-center gap-1.5">
                    <span className={`w-3 h-3 rounded-full ${STATUS_COLORS[status as RoomStatus]}`} />
                    {label}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-slate-500">{currentBuilding.floors} tầng • {currentBuilding.address}</p>
              <button onClick={() => setShowRoomForm(true)} className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg text-sm font-semibold cursor-pointer hover:bg-emerald-200 transition-colors">
                + Thêm phòng
              </button>
            </div>

            {Array.from({ length: currentBuilding.floors }, (_, i) => currentBuilding.floors - i).map(floor => {
              const floorRooms = currentBuilding.rooms.filter(r => r.floor === floor);
              return (
                <div key={floor} className="mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-400 w-12">Tầng {floor}</span>
                    <div className="flex-1 flex gap-2 flex-wrap">
                      {floorRooms.length > 0 ? floorRooms.map(room => (
                        <div key={room.id} className="relative group">
                          <div className={`w-20 h-16 rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all hover:scale-105 ${STATUS_COLORS[room.status]} bg-opacity-20 border-2 ${
                            room.status === 'available' ? 'border-emerald-300 bg-emerald-50' : room.status === 'occupied' ? 'border-orange-300 bg-orange-50' : 'border-slate-300 bg-slate-100'
                          }`}>
                            <span className="text-xs font-bold text-slate-800">{room.room_number}</span>
                            <span className={`text-[10px] ${room.status === 'available' ? 'text-emerald-600' : room.status === 'occupied' ? 'text-orange-600' : 'text-slate-500'}`}>
                              {STATUS_LABELS[room.status]}
                            </span>
                          </div>
                          {/* Popup on hover */}
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-40 bg-white rounded-xl shadow-xl border border-slate-200 p-3 z-10 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity">
                            <p className="text-xs font-bold text-slate-800 mb-1">Phòng {room.room_number}</p>
                            {room.area && <p className="text-[10px] text-slate-500">{room.area} m²</p>}
                            {room.price && <p className="text-[10px] text-emerald-600 font-bold">{(Number(room.price) / 1000000).toFixed(1)} triệu/th</p>}
                            <div className="flex gap-1 mt-2">
                              {(['available', 'occupied', 'maintenance'] as RoomStatus[]).map(s => (
                                <button key={s} onClick={() => handleRoomStatusChange(room.id, s)}
                                  className={`flex-1 px-1 py-0.5 text-[9px] rounded font-semibold cursor-pointer ${
                                    room.status === s ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
                                  {STATUS_LABELS[s].slice(0, 4)}
                                </button>
                              ))}
                            </div>
                            <button onClick={() => handleDeleteRoom(room.id)}
                              className="w-full mt-1 text-[9px] text-red-500 hover:text-red-600 cursor-pointer font-semibold">
                              Xóa phòng
                            </button>
                          </div>
                        </div>
                      )) : (
                        <span className="text-xs text-slate-400 italic">Chưa có phòng</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </motion.div>
        )}

        {loading && <p className="text-center text-slate-400 mt-10">Đang tải...</p>}
        {!loading && buildings.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🏗️</div>
            <h2 className="text-xl font-bold text-slate-700 mb-2">Chưa có tòa nhà nào</h2>
            <p className="text-slate-500 mb-4">Bắt đầu bằng cách thêm tòa nhà đầu tiên</p>
            <button onClick={() => setShowBuildingForm(true)} className="px-6 py-3 bg-emerald-700 text-white rounded-xl font-bold cursor-pointer">+ Thêm tòa nhà</button>
          </div>
        )}

        {/* Building Form Modal */}
        {showBuildingForm && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setShowBuildingForm(false)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-2xl p-6 w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
              <h3 className="text-lg font-bold text-slate-800 mb-4">Thêm tòa nhà mới</h3>
              <div className="space-y-3">
                <input type="text" placeholder="Tên tòa nhà *" value={newBuilding.name} onChange={e => setNewBuilding(p => ({...p, name: e.target.value}))}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-600" />
                <input type="text" placeholder="Địa chỉ *" value={newBuilding.address} onChange={e => setNewBuilding(p => ({...p, address: e.target.value}))}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-600" />
                <div className="grid grid-cols-2 gap-3">
                  <input type="text" placeholder="Tỉnh/TP" value={newBuilding.city} onChange={e => setNewBuilding(p => ({...p, city: e.target.value}))}
                    className="px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-600" />
                  <input type="text" placeholder="Quận/Huyện" value={newBuilding.district} onChange={e => setNewBuilding(p => ({...p, district: e.target.value}))}
                    className="px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-600" />
                </div>
                <input type="number" placeholder="Số tầng" value={newBuilding.floors} onChange={e => setNewBuilding(p => ({...p, floors: e.target.value}))}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-600" />
              </div>
              <div className="flex gap-3 mt-5">
                <button onClick={() => setShowBuildingForm(false)} className="flex-1 py-3 border border-slate-300 rounded-xl font-semibold text-sm cursor-pointer">Hủy</button>
                <button onClick={handleCreateBuilding} className="flex-1 py-3 bg-emerald-700 text-white rounded-xl font-semibold text-sm cursor-pointer">Tạo tòa nhà</button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Room Form Modal */}
        {showRoomForm && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setShowRoomForm(false)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-2xl p-6 w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
              <h3 className="text-lg font-bold text-slate-800 mb-4">Thêm phòng mới</h3>
              <div className="space-y-3">
                <input type="text" placeholder="Số phòng (VD: 101) *" value={newRoom.room_number} onChange={e => setNewRoom(p => ({...p, room_number: e.target.value}))}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-600" />
                <div className="grid grid-cols-3 gap-3">
                  <input type="number" placeholder="Tầng" value={newRoom.floor} onChange={e => setNewRoom(p => ({...p, floor: e.target.value}))}
                    className="px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-600" />
                  <input type="number" placeholder="Diện tích m²" value={newRoom.area} onChange={e => setNewRoom(p => ({...p, area: e.target.value}))}
                    className="px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-600" />
                  <input type="number" placeholder="Giá (triệu)" value={newRoom.price} onChange={e => setNewRoom(p => ({...p, price: e.target.value}))}
                    className="px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-600" />
                </div>
              </div>
              <div className="flex gap-3 mt-5">
                <button onClick={() => setShowRoomForm(false)} className="flex-1 py-3 border border-slate-300 rounded-xl font-semibold text-sm cursor-pointer">Hủy</button>
                <button onClick={handleCreateRoom} className="flex-1 py-3 bg-emerald-700 text-white rounded-xl font-semibold text-sm cursor-pointer">Tạo phòng</button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}

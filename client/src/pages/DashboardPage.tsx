import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, LayoutGrid, PieChart, RefreshCw, AlertCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';
import type { 
  BuildingWithRooms, Room, RoomStatus, DashboardStats, 
  Amenity, CreateBuildingInput, CreateRoomInput 
} from '../../../shared/types';

// Components
import { Overview } from '../components/dashboard/Overview';
import { FloorPlan } from '../components/dashboard/FloorPlan';
import { BuildingList } from '../components/dashboard/BuildingList';
import { RoomModal } from '../components/dashboard/RoomModal';
import { BuildingModal } from '../components/dashboard/BuildingModal';

type DashboardTab = 'overview' | 'floors' | 'buildings';

export default function DashboardPage() {
  const { canManageBuildings } = useAuth();
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Data
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [buildings, setBuildings] = useState<BuildingWithRooms[]>([]);
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [selectedBuildingId, setSelectedBuildingId] = useState<string | null>(null);

  // Modals state
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [isBuildingModalOpen, setIsBuildingModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | undefined>(undefined);
  const [editingBuilding, setEditingBuilding] = useState<BuildingWithRooms | undefined>(undefined);

  useEffect(() => {
    if (canManageBuildings) {
      loadInitialData();
    }
  }, [canManageBuildings]);

  const loadInitialData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, buildingsRes, amenitiesRes] = await Promise.all([
        api.get<DashboardStats>('/api/dashboard/stats'),
        api.get<{ buildings: BuildingWithRooms[] }>('/api/buildings'),
        api.get<{ amenities: Amenity[] }>('/api/search/amenities') // check if this exists or move to rooms
      ]);

      if (statsRes.data) setStats(statsRes.data);
      if (buildingsRes.data) {
        setBuildings(buildingsRes.data.buildings);
        if (buildingsRes.data.buildings.length > 0 && !selectedBuildingId) {
          setSelectedBuildingId(buildingsRes.data.buildings[0].id);
        }
      }
      
      // Load amenities (needed for room modal)
      // If /api/search/amenities is not available, we can mock it or fetch from another route
      if (amenitiesRes.data) {
        setAmenities(amenitiesRes.data.amenities);
      } else {
        // Fallback mock amenities if route fails
        setAmenities([
          { id: 1, name: 'wifi', name_vi: 'Wi-Fi', icon: 'wifi', created_at: '' },
          { id: 2, name: 'ac', name_vi: 'Điều hòa', icon: 'snowflake', created_at: '' },
          { id: 3, name: 'parking', name_vi: 'Chỗ để xe', icon: 'parking', created_at: '' },
          { id: 4, name: 'fridge', name_vi: 'Tủ lạnh', icon: 'fridge', created_at: '' },
          { id: 5, name: 'kitchen', name_vi: 'Bếp', icon: 'utensils', created_at: '' },
        ]);
      }
    } catch (err: any) {
      setError('Không thể tải dữ liệu dashboard. Vui lòng thử lại sau.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const currentBuilding = buildings.find(b => b.id === selectedBuildingId);

  // Actions: Room
  const handleSaveRoom = async (data: CreateRoomInput) => {
    try {
      if (editingRoom) {
        await api.put(`/api/rooms/${editingRoom.id}`, data);
      } else {
        await api.post('/api/rooms', { ...data, building_id: selectedBuildingId });
      }
      setIsRoomModalOpen(false);
      setEditingRoom(undefined);
      loadInitialData(); // Reload stats and buildings
    } catch (err) {
      alert('Lỗi khi lưu phòng');
    }
  };

  const handleDeleteRoom = async (id: string) => {
    if (!confirm('Xác nhận xóa phòng này?')) return;
    const { error } = await api.delete(`/api/rooms/${id}`);
    if (error) alert(error);
    else loadInitialData();
  };

  const handleStatusChange = async (id: string, status: RoomStatus) => {
    await api.put(`/api/rooms/${id}/status`, { status });
    loadInitialData();
  };

  // Actions: Building
  const handleSaveBuilding = async (data: CreateBuildingInput) => {
    try {
      if (editingBuilding) {
        await api.put(`/api/buildings/${editingBuilding.id}`, data);
      } else {
        await api.post('/api/buildings', data);
      }
      setIsBuildingModalOpen(false);
      setEditingBuilding(undefined);
      loadInitialData();
    } catch (err) {
      alert('Lỗi khi lưu tòa nhà');
    }
  };

  const handleDeleteBuilding = async (id: string) => {
    if (!confirm('Cảnh báo: Tòa nhà chỉ xóa được khi không còn phòng. Tiếp tục?')) return;
    const { error } = await api.delete(`/api/buildings/${id}`);
    if (error) alert(error);
    else loadInitialData();
  };

  if (!canManageBuildings) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <div className="w-32 h-32 bg-rose-50 rounded-[48px] flex items-center justify-center mb-10 border-4 border-white shadow-xl rotate-6">
          <AlertCircle className="w-16 h-16 text-rose-500" />
        </div>
        <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tighter">Tính năng giới hạn</h2>
        <p className="max-w-md text-slate-500 font-medium leading-relaxed mb-10">
          Bạn cần tài khoản **Chủ trọ** hoặc **Môi giới** để sử dụng bộ công cụ quản lý chuyên nghiệp này.
        </p>
        <button 
          onClick={() => window.location.href = '/'}
          className="px-10 py-4 bg-slate-900 text-white rounded-[24px] font-black uppercase tracking-widest text-xs shadow-2xl shadow-slate-900/40 hover:scale-105 transition-transform"
        >
          Quay lại Trang chủ
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-slate-100/30 scroll-smooth">
      <div className="max-w-[1440px] mx-auto p-4 md:p-8 space-y-8">
        
        {/* Top Navigation / Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 px-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black uppercase tracking-widest">LANDLORD DASHBOARD</span>
              {loading && <RefreshCw className="w-4 h-4 text-slate-300 animate-spin" />}
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Quản lý Phòng trọ</h1>
          </div>

          <div className="flex items-center gap-2 bg-white p-2 rounded-3xl shadow-sm border border-slate-100">
            {(['overview', 'floors', 'buildings'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer ${
                  activeTab === tab ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20' : 'text-slate-400 hover:bg-slate-50'
                }`}
              >
                {tab === 'overview' && <PieChart className="w-4 h-4" />}
                {tab === 'floors' && <LayoutGrid className="w-4 h-4" />}
                {tab === 'buildings' && <Building2 className="w-4 h-4" />}
                {tab === 'overview' ? 'Tổng quan' : tab === 'floors' ? 'Sơ đồ phòng' : 'Tòa nhà'}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="mx-4 p-4 bg-rose-50 border border-rose-100 rounded-[24px] text-rose-600 font-bold text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            {error}
            <button onClick={loadInitialData} className="ml-auto underline decoration-2 underline-offset-4">Thử lại</button>
          </div>
        )}

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab + (selectedBuildingId || '')}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="px-4"
          >
            {activeTab === 'overview' && stats && (
              <Overview stats={stats} />
            )}

            {activeTab === 'floors' && (
              <div className="space-y-6">
                {/* Internal building switch for FloorPlan if needed, or use the tabs below */}
                {buildings.length > 0 ? (
                  <>
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                      {buildings.map(b => (
                        <button
                          key={b.id}
                          onClick={() => setSelectedBuildingId(b.id)}
                          className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border-2 cursor-pointer ${
                            selectedBuildingId === b.id 
                              ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-900/10' 
                              : 'bg-white border-slate-100 text-slate-400 hover:border-slate-300'
                          }`}
                        >
                          {b.name}
                        </button>
                      ))}
                    </div>
                    {currentBuilding ? (
                       <FloorPlan 
                        building={currentBuilding}
                        onStatusChange={handleStatusChange}
                        onAddRoom={() => { setEditingRoom(undefined); setIsRoomModalOpen(true); }}
                        onEditRoom={(room) => { setEditingRoom(room); setIsRoomModalOpen(true); }}
                        onDeleteRoom={handleDeleteRoom}
                      />
                    ) : (
                      <div className="py-20 text-center font-bold text-slate-400">Vui lòng chọn hoặc thêm tòa nhà</div>
                    )}
                  </>
                ) : (
                  <div className="py-20 text-center">
                    <p className="font-bold text-slate-400 mb-4">Bạn chưa có tòa nhà nào.</p>
                    <button onClick={() => setActiveTab('buildings')} className="text-indigo-600 font-black uppercase tracking-widest text-xs underline decoration-2 underline-offset-4">Đi tới Quản lý Tòa nhà</button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'buildings' && (
              <BuildingList 
                buildings={buildings}
                selectedId={selectedBuildingId}
                onSelect={setSelectedBuildingId}
                onAdd={() => { setEditingBuilding(undefined); setIsBuildingModalOpen(true); }}
                onEdit={(b) => { setEditingBuilding(b); setIsBuildingModalOpen(true); }}
                onDelete={handleDeleteBuilding}
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Global Loading Overlay */}
        {loading && !stats && !buildings.length && (
          <div className="py-40 flex flex-col items-center justify-center space-y-6">
            <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
            <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-xs">Loading Intelligence...</p>
          </div>
        )}
      </div>

      {/* Modals */}
      <RoomModal 
        isOpen={isRoomModalOpen}
        onClose={() => setIsRoomModalOpen(false)}
        onSave={handleSaveRoom}
        initialData={editingRoom}
        amenities={amenities}
      />

      <BuildingModal 
        isOpen={isBuildingModalOpen}
        onClose={() => setIsBuildingModalOpen(false)}
        onSave={handleSaveBuilding}
        initialData={editingBuilding}
      />

    </div>
  );
}

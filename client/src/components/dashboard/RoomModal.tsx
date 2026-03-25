import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  X, Home, Layers, Maximize, DollarSign, Users, 
} from 'lucide-react';
import type { Room, CreateRoomInput, RoomStatus, FurnitureStatus, Amenity } from '../../../../shared/types';
import { ROOM_STATUS_LABELS, FURNITURE_LABELS } from '../../../../shared/types';

interface RoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreateRoomInput) => void;
  initialData?: Room;
  amenities: Amenity[];
}

export const RoomModal = ({ 
  isOpen, onClose, onSave, initialData, amenities 
}: RoomModalProps) => {
  const [formData, setFormData] = useState<CreateRoomInput>({
    building_id: '',
    room_number: '',
    floor: 1,
    area: 0,
    price: 0,
    max_occupants: 1,
    status: 'available',
    furniture: 'none',
    amenity_ids: [],
    description: '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        building_id: initialData.building_id,
        room_number: initialData.room_number,
        floor: initialData.floor,
        area: initialData.area || 0,
        price: initialData.price ? initialData.price / 1000000 : 0, // Assume client works in " triệu"
        max_occupants: initialData.max_occupants,
        status: initialData.status,
        furniture: initialData.furniture,
        amenity_ids: initialData.amenity_ids || [],
        description: initialData.description || '',
      });
    } else {
      setFormData(prev => ({ ...prev, room_number: '', floor: 1, area: 0, price: 0, amenity_ids: [] }));
    }
  }, [initialData, isOpen]);

  const toggleAmenity = (id: number) => {
    setFormData(prev => ({
      ...prev,
      amenity_ids: prev.amenity_ids?.includes(id) 
        ? prev.amenity_ids.filter(i => i !== id) 
        : [...(prev.amenity_ids || []), id]
    }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      price: (formData.price || 0) * 1000000 // Convert back to VND
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" />
      
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="relative bg-white w-full max-w-2xl rounded-[48px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Home className="w-6 h-6 text-indigo-500" />
              {initialData ? 'Chỉnh sửa phòng' : 'Thêm phòng mới'}
            </h3>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Cung cấp thông tin chi tiết cho phòng trọ</p>
          </div>
          <button onClick={onClose} className="p-3 bg-white hover:bg-slate-100 rounded-2xl transition-colors shadow-sm cursor-pointer">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide">
          <div className="grid grid-cols-2 gap-6">
            {/* Room ID / Number */}
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Số phòng *</label>
              <div className="relative">
                <Home className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                <input 
                  required
                  type="text" 
                  placeholder="VD: 101, P.01" 
                  value={formData.room_number}
                  onChange={e => setFormData({ ...formData, room_number: e.target.value })}
                  className="w-full h-14 pl-12 pr-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold placeholder-slate-300 focus:bg-white focus:border-emerald-500 transition-all outline-none"
                />
              </div>
            </div>

            {/* Floor */}
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Tầng *</label>
              <div className="relative">
                <Layers className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                <input 
                  required
                  type="number" 
                  placeholder="1" 
                  value={formData.floor}
                  onChange={e => setFormData({ ...formData, floor: Number(e.target.value) })}
                  className="w-full h-14 pl-12 pr-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold placeholder-slate-300 focus:bg-white focus:border-emerald-500 transition-all outline-none"
                />
              </div>
            </div>

            {/* Area */}
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Diện tích (m²)</label>
              <div className="relative">
                <Maximize className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                <input 
                  type="number" 
                  placeholder="25" 
                  value={formData.area}
                  onChange={e => setFormData({ ...formData, area: Number(e.target.value) })}
                  className="w-full h-14 pl-12 pr-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold placeholder-slate-300 focus:bg-white focus:border-emerald-500 transition-all outline-none"
                />
              </div>
            </div>

            {/* Price */}
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Giá thuê (triệu/tháng)</label>
              <div className="relative">
                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                <input 
                  type="number" 
                  step="0.1"
                  placeholder="3.5" 
                  value={formData.price}
                  onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
                  className="w-full h-14 pl-12 pr-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold placeholder-slate-300 focus:bg-white focus:border-emerald-500 transition-all outline-none text-emerald-600"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
             {/* Furniture */}
             <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Nội thất</label>
              <div className="grid grid-cols-2 gap-2">
                {(['none', 'basic', 'full'] as FurnitureStatus[]).map(f => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFormData({ ...formData, furniture: f })}
                    className={`h-12 rounded-xl text-xs font-black uppercase tracking-tight transition-all border-2 ${
                      formData.furniture === f ? 'bg-emerald-50 border-emerald-600 text-emerald-700' : 'bg-slate-50 border-transparent text-slate-400'
                    }`}
                  >
                    {FURNITURE_LABELS[f].split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>

             {/* Max Occupants */}
             <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Sức chứa (người)</label>
              <div className="relative">
                <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                <input 
                  type="number" 
                  value={formData.max_occupants || 1}
                  onChange={e => setFormData({ ...formData, max_occupants: Number(e.target.value) })}
                  className="w-full h-14 pl-12 pr-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold focus:bg-white focus:border-emerald-500 transition-all outline-none"
                />
              </div>
            </div>
          </div>

          {/* Status Select */}
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Trạng thái phòng</label>
            <div className="grid grid-cols-3 gap-3">
              {(['available', 'occupied', 'maintenance'] as RoomStatus[]).map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setFormData({ ...formData, status: s })}
                  className={`flex flex-col items-center justify-center p-4 rounded-3xl border-2 transition-all gap-1 cursor-pointer ${
                    formData.status === s 
                      ? s === 'available' ? 'bg-emerald-50 border-emerald-600 text-emerald-700' : s === 'occupied' ? 'bg-orange-50 border-orange-600 text-orange-700' : 'bg-slate-50 border-slate-600 text-slate-700'
                      : 'bg-white border-slate-100 text-slate-400'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full mb-1 ${s === 'available' ? 'bg-emerald-500' : s === 'occupied' ? 'bg-orange-500' : 'bg-slate-400'}`} />
                  <span className="text-[10px] font-black uppercase tracking-widest leading-none">{ROOM_STATUS_LABELS[s]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Amenities Multi-select */}
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Tiện nghi có sẵn</label>
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2">
              {amenities.map(item => {
                const isSelected = formData.amenity_ids?.includes(item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => toggleAmenity(item.id)}
                    className={`p-3 rounded-2xl flex flex-col items-center gap-1.5 transition-all text-center border-2 ${
                      isSelected ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'bg-slate-50 border-transparent text-slate-400'
                    }`}
                  >
                    <span className="text-xl opacity-60">
                      {item.icon === 'wifi' ? '📶' : item.icon === 'snowflake' ? '❄️' : item.icon === 'bed' ? '🛏️' : item.icon === 'parking' ? '🅿️' : '✨'}
                    </span>
                    <span className="text-[9px] font-black uppercase tracking-tight leading-tight">{item.name_vi.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Ghi chú / Mô tả thêm</label>
            <textarea 
              rows={4}
              placeholder="VD: Phòng có cửa sổ lớn, WC riêng biệt, giờ giấc tự do..."
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold placeholder-slate-300 focus:bg-white focus:border-emerald-500 transition-all outline-none resize-none text-sm"
            />
          </div>
        </form>

        {/* Footer */}
        <div className="p-8 border-t border-slate-50 flex gap-4 bg-slate-50/20">
          <button onClick={onClose} className="flex-1 h-14 rounded-2xl bg-white border border-slate-200 text-slate-500 font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-colors cursor-pointer">
            Hủy bỏ
          </button>
          <button onClick={handleSave} className="flex-1 h-14 rounded-2xl bg-indigo-600 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-900/10 hover:bg-indigo-700 transition-colors cursor-pointer">
            {initialData ? 'Lưu thay đổi' : 'Tạo phòng ngay'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

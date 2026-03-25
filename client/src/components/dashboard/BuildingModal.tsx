import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  X, Building2, MapPin, Layers
} from 'lucide-react';
import type { Building, CreateBuildingInput } from '../../../../shared/types';

interface BuildingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreateBuildingInput) => void;
  initialData?: Building;
}

export const BuildingModal = ({ 
  isOpen, onClose, onSave, initialData 
}: BuildingModalProps) => {
  const [formData, setFormData] = useState<CreateBuildingInput>({
    name: '',
    address: '',
    ward: '',
    district: '',
    city: '',
    floors: 1,
    description: '',
    lat: undefined,
    lng: undefined,
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        address: initialData.address,
        ward: initialData.ward || '',
        district: initialData.district || '',
        city: initialData.city || '',
        floors: initialData.floors,
        description: initialData.description || '',
        lat: initialData.lat ?? undefined,
        lng: initialData.lng ?? undefined,
      });
    } else {
      setFormData({ name: '', address: '', ward: '', district: '', city: '', floors: 5, description: '' });
    }
  }, [initialData, isOpen]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
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
              <Building2 className="w-6 h-6 text-emerald-600" />
              {initialData ? 'Sửa thông tin tòa nhà' : 'Tạo tòa nhà mới'}
            </h3>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Cấu hình thông tin cơ bản cho tòa nhà quản lý</p>
          </div>
          <button onClick={onClose} className="p-3 bg-white hover:bg-slate-100 rounded-2xl transition-colors shadow-sm cursor-pointer">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide">
          <div className="space-y-6">
            {/* Name */}
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Tên tòa nhà *</label>
              <div className="relative">
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                <input 
                  required
                  type="text" 
                  placeholder="VD: HomeSpot Building A1" 
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full h-14 pl-12 pr-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold placeholder-slate-300 focus:bg-white focus:border-emerald-500 transition-all outline-none"
                />
              </div>
            </div>

            {/* Address */}
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Địa chỉ đường *</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                <input 
                  required
                  type="text" 
                  placeholder="VD: 123 Nguyễn Văn Linh, P. Tân Thuận Tây" 
                  value={formData.address}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                  className="w-full h-14 pl-12 pr-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold placeholder-slate-300 focus:bg-white focus:border-emerald-500 transition-all outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {/* City */}
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Tỉnh / Thành phố</label>
                <input 
                  type="text" 
                  placeholder="TP. Hồ Chí Minh" 
                  value={formData.city}
                  onChange={e => setFormData({ ...formData, city: e.target.value })}
                  className="w-full h-14 px-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold placeholder-slate-300 focus:bg-white focus:border-emerald-500 transition-all outline-none"
                />
              </div>
              {/* District */}
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Quận / Huyện</label>
                <input 
                  type="text" 
                  placeholder="Quận 7" 
                  value={formData.district}
                  onChange={e => setFormData({ ...formData, district: e.target.value })}
                  className="w-full h-14 px-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold placeholder-slate-300 focus:bg-white focus:border-emerald-500 transition-all outline-none"
                />
              </div>
              {/* Ward */}
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Phường / Xã</label>
                <input 
                  type="text" 
                  placeholder="Tân Thuận Tây" 
                  value={formData.ward}
                  onChange={e => setFormData({ ...formData, ward: e.target.value })}
                  className="w-full h-14 px-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold placeholder-slate-300 focus:bg-white focus:border-emerald-500 transition-all outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {/* Floors */}
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Số tầng hiển thị *</label>
                <div className="relative">
                  <Layers className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                  <input 
                    required
                    type="number" 
                    min={1}
                    value={formData.floors}
                    onChange={e => setFormData({ ...formData, floors: Number(e.target.value) })}
                    className="w-full h-14 pl-12 pr-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold focus:bg-white focus:border-emerald-500 transition-all outline-none"
                  />
                </div>
              </div>

              {/* Coordinates (Simple for now) */}
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Tọa độ Bản đồ (Lat/Lng)</label>
                <div className="flex gap-2">
                  <input 
                    type="number" 
                    step="0.000001"
                    placeholder="Lat" 
                    value={formData.lat}
                    onChange={e => setFormData({ ...formData, lat: Number(e.target.value) })}
                    className="flex-1 h-14 px-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold placeholder-slate-300 focus:bg-white focus:border-emerald-500 transition-all outline-none"
                  />
                  <input 
                    type="number" 
                    step="0.000001"
                    placeholder="Lng" 
                    value={formData.lng}
                    onChange={e => setFormData({ ...formData, lng: Number(e.target.value) })}
                    className="flex-1 h-14 px-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold placeholder-slate-300 focus:bg-white focus:border-emerald-500 transition-all outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Mô tả tòa nhà</label>
              <textarea 
                rows={4}
                placeholder="VD: Tòa nhà gần chợ, an ninh tốt, có bảo vệ 24/7..."
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold placeholder-slate-300 focus:bg-white focus:border-emerald-500 transition-all outline-none resize-none text-sm"
              />
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="p-8 border-t border-slate-50 flex gap-4 bg-slate-50/20">
          <button onClick={onClose} className="flex-1 h-14 rounded-2xl bg-white border border-slate-200 text-slate-500 font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-colors cursor-pointer">
            Hủy bỏ
          </button>
          <button onClick={handleSave} className="flex-1 h-14 rounded-2xl bg-emerald-700 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-900/10 hover:bg-emerald-800 transition-colors cursor-pointer">
            {initialData ? 'Ghi lại thông tin' : 'Tạo tòa nhà mới'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

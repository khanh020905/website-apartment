import { motion } from 'framer-motion';
import { 
  Building2, MapPin, Trash2, Edit3, QrCode 
} from 'lucide-react';
import type { BuildingWithRooms } from '../../../../shared/types';
import { useState } from 'react';
import { QRManager } from './QRManager';

interface BuildingListProps {
  buildings: BuildingWithRooms[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onEdit: (building: BuildingWithRooms) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
}

export const BuildingList = ({ 
  buildings, selectedId, onSelect, onEdit, onDelete, onAdd 
}: BuildingListProps) => {
  const [showQR, setShowQR] = useState<{ id: string; name: string } | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-4 mb-4">
        <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
          <Building2 className="w-4 h-4" />
          Danh sách Tòa nhà
        </h3>
        <button 
          onClick={onAdd}
          className="text-[10px] font-black text-indigo-600 hover:text-indigo-800 uppercase tracking-widest cursor-pointer"
        >
          + Thêm mới
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {buildings.map(b => (
          <motion.div
            key={b.id}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={() => onSelect(b.id)}
            className={`p-5 rounded-[28px] border-2 transition-all group relative cursor-pointer ${
              selectedId === b.id 
                ? 'bg-white border-emerald-600 shadow-xl shadow-emerald-900/5' 
                : 'bg-white border-slate-50 hover:border-slate-200'
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className={`p-4 rounded-2xl ${selectedId === b.id ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400 group-hover:text-slate-600'}`}>
                <Building2 className="w-6 h-6" />
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="text-lg font-black text-slate-800 truncate mb-1">{b.name}</h4>
                <div className="flex items-center gap-1.5 text-slate-400 font-bold text-[10px] uppercase tracking-tight">
                  <MapPin className="w-3 h-3 shrink-0" />
                  <span className="truncate">{b.district}, {b.city}</span>
                </div>
              </div>

              {/* Action Dropdown / Icons */}
              <div className="flex flex-col gap-2">
                <button 
                  onClick={(e) => { e.stopPropagation(); setShowQR({ id: b.id, name: b.name }); }}
                  className="p-2 text-slate-300 hover:text-indigo-500 hover:bg-slate-50 rounded-xl transition-colors"
                  title="Quản lý mã QR"
                >
                  <QrCode className="w-4 h-4" />
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); onEdit(b); }}
                  className="p-2 text-slate-300 hover:text-indigo-500 hover:bg-slate-50 rounded-xl transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); onDelete(b.id); }}
                  className="p-2 text-slate-300 hover:text-rose-500 hover:bg-slate-50 rounded-xl transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-slate-50 pt-4">
              <div className="flex items-center gap-4">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none mb-1">Số tầng</span>
                  <span className="text-xs font-black text-slate-700">{b.floors}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none mb-1">Tổng phòng</span>
                  <span className="text-xs font-black text-slate-700">{b.rooms?.length || 0}</span>
                </div>
              </div>

              <div className={`text-[10px] font-black uppercase tracking-[0.1em] px-3 py-1.5 rounded-lg transition-all ${
                selectedId === b.id ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20' : 'bg-slate-100 text-slate-400'
              }`}>
                {selectedId === b.id ? 'Đang bật' : 'Xem sơ đồ'}
              </div>
            </div>
          </motion.div>
        ))}

        {buildings.length === 0 && (
          <div className="lg:col-span-3 py-20 bg-slate-50 rounded-[40px] border-2 border-dashed border-slate-100 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-white rounded-[40px] shadow-sm flex items-center justify-center mb-6">
              <Building2 className="w-10 h-10 text-slate-200" />
            </div>
            <p className="text-lg font-black text-slate-900">Chưa có tòa nhà nào</p>
            <p className="text-sm font-bold text-slate-400 mb-6">Bắt đầu bằng cách thêm tòa nhà đầu tiên của bạn</p>
            <button 
              onClick={onAdd}
              className="px-8 py-3 bg-emerald-700 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-emerald-900/10 cursor-pointer"
            >
              + Thêm Tòa nhà ngay
            </button>
          </div>
        )}
      </div>
      
      {/* QR Manager Modal */}
      {showQR && (
        <QRManager 
          buildingId={showQR.id}
          buildingName={showQR.name}
          isOpen={!!showQR}
          onClose={() => setShowQR(null)}
        />
      )}
    </div>
  );
};

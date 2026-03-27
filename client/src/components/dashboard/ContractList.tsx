import { motion } from 'framer-motion';
import { FileText, Calendar, User, Trash2 } from 'lucide-react';
import type { ContractWithRoom } from '../../../../shared/types';
import { format } from 'date-fns';

interface ContractListProps {
  contracts: ContractWithRoom[];
  onDelete: (id: string) => void;
  onEdit: (contract: ContractWithRoom) => void;
}

export function ContractList({ contracts, onDelete, onEdit }: ContractListProps) {
  if (contracts.length === 0) {
    return (
      <div className="bg-white rounded-4xl border border-slate-100 p-20 text-center">
        <div className="w-20 h-20 bg-slate-50 rounded-[28px] flex items-center justify-center mx-auto mb-6">
          <FileText className="w-10 h-10 text-slate-300" />
        </div>
        <h3 className="text-xl font-black text-slate-900 mb-2">Chưa có hợp đồng nào</h3>
        <p className="text-slate-400 max-w-xs mx-auto text-sm font-medium">
          Các hợp đồng thuê phòng sẽ hiển thị tại đây sau khi bạn tạo mới từ sơ đồ phòng.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {contracts.map((contract, i) => (
        <motion.div
          key={contract.id}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.05 }}
          className="bg-white rounded-[40px] border border-white/60 p-7 shadow-sm hover:shadow-2xl hover:shadow-brand-ink/10 transition-all duration-300 group hover:-translate-y-1 relative overflow-hidden"
        >
          {/* Subtle gloss line */}
          <div className="absolute inset-x-0 -top-px h-px bg-linear-to-r from-transparent via-brand-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

          <div className="flex items-start justify-between mb-8 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-brand-primary/10 text-brand-primary rounded-2xl flex items-center justify-center font-black">
                {contract.room?.room_number || '??'}
              </div>
              <div>
                <h4 className="font-black text-slate-900 leading-none mb-1">Hợp đồng thuê</h4>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{contract.room?.building?.name || 'Tòa nhà'}</p>
              </div>
            </div>
            <div className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-colors ${
              contract.status === 'active' ? 'bg-linear-to-br from-brand-primary/10 to-brand-primary/5 text-brand-primary border-brand-primary/20' : 'bg-slate-50 text-slate-400 border-transparent'
            }`}>
              {contract.status === 'active' ? 'Hiệu lực' : contract.status}
            </div>
          </div>

          <div className="space-y-4 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-slate-50 rounded-xl flex items-center justify-center shrink-0">
                <User className="w-4 h-4 text-slate-400" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-slate-300 font-black uppercase tracking-widest leading-none mb-1">Người thuê</p>
                <p className="text-sm font-bold text-slate-700 truncate">{contract.tenant_name}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-slate-50 rounded-xl flex items-center justify-center shrink-0">
                <Calendar className="w-4 h-4 text-slate-400" />
              </div>
              <div>
                <p className="text-[10px] text-slate-300 font-black uppercase tracking-widest leading-none mb-1">Thời hạn</p>
                <p className="text-sm font-bold text-slate-700">
                  {format(new Date(contract.start_date), 'dd/MM/yyyy')} 
                  {contract.end_date && ` - ${format(new Date(contract.end_date), 'dd/MM/yyyy')}`}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-50">
              <div>
                <p className="text-[10px] text-slate-300 font-black uppercase tracking-widest mb-1">Tiền thuê</p>
                <p className="text-lg font-black text-slate-900">{(contract.rent_amount / 1000000).toFixed(1)}M</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-300 font-black uppercase tracking-widest mb-1">Tiền cọc</p>
                <p className="text-lg font-black text-brand-primary">{(contract.deposit_amount / 1000000).toFixed(1)}M</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-8">
            <button 
              onClick={() => onEdit(contract)}
              className="flex-1 py-3.5 bg-slate-50 text-brand-ink rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-ink hover:text-white transition-all duration-300 hover:shadow-xl hover:shadow-brand-ink/20 cursor-pointer"
            >
              Chi tiết
            </button>
            <button 
              onClick={() => onDelete(contract.id)}
              className="w-12 h-12 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center hover:bg-rose-50 hover:text-rose-600 transition-all duration-300 cursor-pointer hover:shadow-lg hover:shadow-rose-100"
              title="Kết thúc hợp đồng"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

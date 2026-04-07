import { useState } from "react";
import { Building2, User, CreditCard, MapPin, CheckCircle2 } from "lucide-react";

interface BankFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

const BankForm = ({ onSubmit, onCancel }: BankFormProps) => {
  const [formData, setFormData] = useState({
    bank_name: "",
    account_name: "",
    account_number: "",
    branch: "",
    is_default: false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="space-y-4">
        <label className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-2 px-1">
          <Building2 className="w-3.5 h-3.5" /> Thông tin ngân hàng
        </label>
        
        <div className="relative">
          <Building2 className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            required
            placeholder="Tên ngân hàng (VD: Vietcombank)"
            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-amber-400/10 focus:border-amber-400 transition-all outline-none"
            value={formData.bank_name}
            onChange={e => setFormData({...formData, bank_name: e.target.value})}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <User className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              required
              placeholder="Chủ tài khoản"
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-amber-400/10 focus:border-amber-400 transition-all outline-none"
              value={formData.account_name}
              onChange={e => setFormData({...formData, account_name: e.target.value.toUpperCase()})}
            />
          </div>
          <div className="relative">
            <CreditCard className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              required
              placeholder="Số tài khoản"
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-amber-400/10 focus:border-amber-400 transition-all outline-none font-mono"
              value={formData.account_number}
              onChange={e => setFormData({...formData, account_number: e.target.value})}
            />
          </div>
        </div>

        <div className="relative">
          <MapPin className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Chi nhánh (Không bắt buộc)"
            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-amber-400/10 focus:border-amber-400 transition-all outline-none"
            value={formData.branch}
            onChange={e => setFormData({...formData, branch: e.target.value})}
          />
        </div>

        <label className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 cursor-pointer hover:bg-slate-100 transition-colors">
          <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${formData.is_default ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300 bg-white'}`}>
            {formData.is_default && <CheckCircle2 className="w-4 h-4 text-white" />}
          </div>
          <input
            type="checkbox"
            className="hidden"
            checked={formData.is_default}
            onChange={e => setFormData({...formData, is_default: e.target.checked})}
          />
          <span className="text-[13px] font-bold text-slate-700">Đặt làm tài khoản nhận tiền mặc định</span>
        </label>
      </div>

      <div className="flex items-center justify-end gap-3 pt-4">
        <button type="button" onClick={onCancel} className="px-8 py-3 bg-slate-100 text-slate-600 rounded-2xl text-sm font-bold hover:bg-slate-200 transition-all">Hủy</button>
        <button type="submit" className="px-10 py-3 bg-amber-400 text-slate-900 rounded-2xl text-sm font-bold hover:bg-amber-500 shadow-xl shadow-amber-400/20 transition-all active:scale-95">Lưu tài khoản</button>
      </div>
    </form>
  );
};

export default BankForm;

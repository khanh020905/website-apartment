import { useState } from 'react';
import { Receipt, User, Building2, Calendar, Wallet, FileText, CheckCircle2 } from 'lucide-react';

interface InvoiceFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

const InvoiceForm = ({ onSubmit, onCancel }: InvoiceFormProps) => {
  const [formData, setFormData] = useState({
    roomNumber: '',
    customerName: '',
    dueDate: new Date().toISOString().split('T')[0],
    extraCharge: 0,
    discount: 0,
    total: 0,
    hasVat: false,
    notes: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Building2 className="w-3.5 h-3.5" />
            Phòng <span className="text-rose-500">*</span>
          </label>
          <select
            name="roomNumber"
            value={formData.roomNumber}
            onChange={handleChange}
            required
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-4 focus:ring-amber-400/10 focus:border-amber-400 transition-all outline-none"
          >
            <option value="">Chọn phòng</option>
            <option value="P101">P101</option>
            <option value="P102">P102</option>
            <option value="P103">P103</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <User className="w-3.5 h-3.5" />
            Khách hàng <span className="text-rose-500">*</span>
          </label>
          <select
            name="customerName"
            value={formData.customerName}
            onChange={handleChange}
            required
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-4 focus:ring-amber-400/10 focus:border-amber-400 transition-all outline-none"
          >
            <option value="">Chọn khách hàng</option>
            <option value="Nguyễn Văn A">Nguyễn Văn A</option>
            <option value="Trần Thị B">Trần Thị B</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5" />
            Hạn thanh toán <span className="text-rose-500">*</span>
          </label>
          <input
            type="date"
            name="dueDate"
            value={formData.dueDate}
            onChange={handleChange}
            required
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-4 focus:ring-amber-400/10 focus:border-amber-400 transition-all outline-none"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Wallet className="w-3.5 h-3.5" />
            Tổng cộng (VNĐ) <span className="text-rose-500">*</span>
          </label>
          <input
            type="number"
            name="total"
            value={formData.total}
            onChange={handleChange}
            required
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-4 focus:ring-amber-400/10 focus:border-amber-400 transition-all outline-none"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
        <input
          type="checkbox"
          id="hasVat"
          name="hasVat"
          checked={formData.hasVat}
          onChange={handleChange}
          className="w-5 h-5 rounded border-slate-300 text-amber-500 focus:ring-amber-500"
        />
        <label htmlFor="hasVat" className="text-sm font-bold text-slate-700">Hiển thị hoá đơn VAT</label>
      </div>

      <div className="space-y-2">
        <label className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <FileText className="w-3.5 h-3.5" />
          Ghi chú
        </label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows={3}
          placeholder="Nhập ghi chú cho hoá đơn..."
          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-4 focus:ring-amber-400/10 focus:border-amber-400 transition-all outline-none resize-none"
        />
      </div>

      <div className="flex items-center justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-200 transition-all"
        >
          Hủy
        </button>
        <button
          type="submit"
          className="px-8 py-2.5 bg-amber-400 text-slate-900 rounded-xl text-sm font-bold hover:bg-amber-500 shadow-lg shadow-amber-200/50 transition-all active:scale-95"
        >
          Xác nhận tạo
        </button>
      </div>
    </form>
  );
};

export default InvoiceForm;

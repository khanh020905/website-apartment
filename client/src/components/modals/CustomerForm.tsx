import { useState, useEffect } from 'react';
import { User, Phone, Mail, Calendar, Building2, Wallet, FileText } from 'lucide-react';
import { api } from '../../lib/api';

interface CustomerFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

const CustomerForm = ({ onSubmit, onCancel }: CustomerFormProps) => {
  const [rooms, setRooms] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    room_id: '',
    tenant_name: '',
    tenant_phone: '',
    tenant_email: '',
    tenant_gender: '' as 'male' | 'female' | 'other' | '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    rent_amount: '',
    deposit_amount: '',
    notes: '',
  });

  useEffect(() => {
    const fetchRooms = async () => {
      const { data } = await api.get<{ rooms: any[] }>("/api/customers/rooms");
      if (data) setRooms(data.rooms);
    };
    fetchRooms();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <label className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-2 px-1">
          <Building2 className="w-3.5 h-3.5" />
          Chọn phòng thuê <span className="text-rose-500">*</span>
        </label>
        <select
          required
          name="room_id"
          value={formData.room_id}
          onChange={handleChange}
          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-amber-400/10 focus:border-amber-400 transition-all outline-none appearance-none"
        >
          <option value="">Chọn phòng trống</option>
          {rooms
            .filter((r) => r.status === "available")
            .map((r) => (
              <option key={r.id} value={r.id}>
                {r.room_number} - Tầng {r.floor} ({r.buildings.name})
              </option>
            ))}
        </select>
      </div>

      <div className="h-px bg-slate-100" />

      <div className="space-y-4">
        <label className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-2 px-1">
          <User className="w-3.5 h-3.5" />
          Thông tin khách thuê <span className="text-rose-500">*</span>
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            required
            type="text"
            name="tenant_name"
            value={formData.tenant_name}
            onChange={handleChange}
            placeholder="Họ và tên khách hàng"
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-amber-400/10 focus:border-amber-400 transition-all outline-none"
          />
          <select
            name="tenant_gender"
            value={formData.tenant_gender}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-amber-400/10 focus:border-amber-400 transition-all outline-none"
          >
            <option value="">Giới tính</option>
            <option value="male">Nam</option>
            <option value="female">Nữ</option>
            <option value="other">Khác</option>
          </select>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Phone className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="tel"
              name="tenant_phone"
              value={formData.tenant_phone}
              onChange={handleChange}
              placeholder="Số điện thoại"
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-amber-400/10 focus:border-amber-400 transition-all outline-none"
            />
          </div>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              name="tenant_email"
              value={formData.tenant_email}
              onChange={handleChange}
              placeholder="Địa chỉ Email"
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-amber-400/10 focus:border-amber-400 transition-all outline-none"
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <label className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-2 px-1">
          <Calendar className="w-3.5 h-3.5" />
          Thời hạn hợp đồng <span className="text-rose-500">*</span>
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            required
            type="date"
            name="start_date"
            value={formData.start_date}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-amber-400/10 focus:border-amber-400 transition-all outline-none"
          />
          <input
            type="date"
            name="end_date"
            value={formData.end_date}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-amber-400/10 focus:border-amber-400 transition-all outline-none"
          />
        </div>
      </div>

      <div className="space-y-4">
        <label className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-2 px-1">
          <Wallet className="w-3.5 h-3.5" />
          Thông tin tài chính <span className="text-rose-500">*</span>
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            required
            type="number"
            name="rent_amount"
            value={formData.rent_amount}
            onChange={handleChange}
            placeholder="Giá thuê (VNĐ)"
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-amber-400/10 focus:border-amber-400 transition-all outline-none"
          />
          <input
            type="number"
            name="deposit_amount"
            value={formData.deposit_amount}
            onChange={handleChange}
            placeholder="Tiền đặt cọc (VNĐ)"
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-amber-400/10 focus:border-amber-400 transition-all outline-none"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-2 px-1">
          <FileText className="w-3.5 h-3.5" />
          Ghi chú
        </label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows={3}
          placeholder="Lưu ý về khách hàng hoặc hợp đồng..."
          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-3xl text-sm font-bold focus:ring-4 focus:ring-amber-400/10 focus:border-amber-400 transition-all outline-none resize-none"
        />
      </div>

      <div className="flex items-center justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-8 py-3.5 bg-slate-100 text-slate-600 rounded-2xl text-sm font-bold hover:bg-slate-200 transition-all"
        >
          Hủy
        </button>
        <button
          type="submit"
          className="px-10 py-3.5 bg-amber-400 text-slate-900 rounded-2xl text-sm font-bold hover:bg-amber-500 shadow-xl shadow-amber-200/50 transition-all active:scale-95"
        >
          Xác nhận thêm
        </button>
      </div>
    </form>
  );
};

export default CustomerForm;

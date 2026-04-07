import { useState, useEffect } from "react";
import { User, Car, Hash, Palette, Info } from "lucide-react";
import { api } from "../../lib/api";

interface VehicleFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
  initialData?: any;
}

const VehicleForm = ({ onSubmit, onCancel, initialData }: VehicleFormProps) => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [formData, setFormData] = useState(initialData || {
    customer_id: "",
    room_id: "",
    building_id: "",
    vehicle_type: "xe_may",
    license_plate: "",
    vehicle_name: "",
    color: "",
    status: "active"
  });

  useEffect(() => {
    const fetchData = async () => {
      // Lấy danh sách khách hàng để gán vào select (Mapping UI: Khách hàng sở hữu)
      const { data } = await api.get<any>("/api/customers");
      if (data) setCustomers(data.customers);
    };
    fetchData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Khi chọn khách hàng, tự động mapping Phòng và Toà nhà (Requirement 9: Business Logic)
    if (name === "customer_id") {
      const selectedCust = customers.find(c => c.id === value);
      if (selectedCust) {
        setFormData(prev => ({
          ...prev,
          customer_id: value,
          room_id: selectedCust.room?.id || "",
          building_id: selectedCust.room?.building_id || ""
        }));
        return;
      }
    }
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Mapping UI Form: Khách hàng */}
      <div className="space-y-4">
        <label className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <User className="w-3.5 h-3.5" /> Khách hàng sở hữu <span className="text-rose-500">*</span>
        </label>
        <select
          required
          name="customer_id"
          value={formData.customer_id}
          onChange={handleChange}
          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:border-amber-400 outline-none appearance-none font-['Plus_Jakarta_Sans',sans-serif]"
        >
          <option value="">Chọn khách hàng</option>
          {customers.map(c => (
            <option key={c.id} value={c.id}>{c.tenant_name} - {c.room?.room_number}</option>
          ))}
        </select>
      </div>

      {/* Mapping UI Form: Loại xe & Biển số */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
             <Car className="w-3.5 h-3.5" /> Loại phương tiện
          </label>
          <select
            name="vehicle_type"
            value={formData.vehicle_type}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:border-amber-400 outline-none appearance-none font-['Plus_Jakarta_Sans',sans-serif]"
          >
            <option value="xe_may">Xe máy</option>
            <option value="xe_hoi">Ô tô</option>
            <option value="xe_dap">Xe đạp</option>
            <option value="xe_dien">Xe điện</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
             <Hash className="w-3.5 h-3.5" /> Biển số xe <span className="text-rose-500">*</span>
          </label>
          <input
            required
            type="text"
            name="license_plate"
            value={formData.license_plate}
            onChange={handleChange}
            placeholder="VD: 59-A1 123.45"
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:border-amber-400 outline-none font-['Plus_Jakarta_Sans',sans-serif]"
          />
        </div>
      </div>

      {/* Mapping UI Form: Tên xe & Màu sắc */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
             <Info className="w-3.5 h-3.5" /> Tên xe
          </label>
          <input
            type="text"
            name="vehicle_name"
            value={formData.vehicle_name}
            onChange={handleChange}
            placeholder="VD: Honda Vision"
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:border-amber-400 outline-none font-['Plus_Jakarta_Sans',sans-serif]"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
             <Palette className="w-3.5 h-3.5" /> Màu sắc
          </label>
          <input
            type="text"
            name="color"
            value={formData.color}
            onChange={handleChange}
            placeholder="VD: Trắng"
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:border-amber-400 outline-none font-['Plus_Jakarta_Sans',sans-serif]"
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-6">
        <button type="button" onClick={onCancel} className="px-8 py-3.5 bg-slate-100 text-slate-600 rounded-2xl text-sm font-black hover:bg-slate-200 transition-all font-['Plus_Jakarta_Sans',sans-serif]">Hủy</button>
        <button type="submit" className="px-10 py-3.5 bg-amber-400 text-slate-900 rounded-2xl text-sm font-black hover:bg-amber-500 shadow-xl shadow-amber-200/50 transition-all active:scale-95 font-['Plus_Jakarta_Sans',sans-serif]">Xác nhận</button>
      </div>
    </form>
  );
};

export default VehicleForm;

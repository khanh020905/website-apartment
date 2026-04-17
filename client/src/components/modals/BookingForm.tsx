import { useState } from "react";
import { User, Plus, CalendarDays } from "lucide-react";

interface BookingFormProps {
  roomNumber: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

const BookingForm = ({ roomNumber, onSubmit, onCancel }: BookingFormProps) => {
  const [formData, setFormData] = useState({
    roomNumber: roomNumber || "",
    checkInDate: new Date().toISOString().split("T")[0],
    expectedCheckOut: "",
    guestCount: "1",
    customerName: "",
    phone: "",
    email: "",
    identityNumber: "",
    zalo: "",
    
    rentCycle: "Tháng",
    rentAmount: "",
    
    paymentCycle: "Mỗi tháng",
    
    totalDeposit: "",
    depositAmount: "",
    transactionDate: new Date().toISOString().slice(0, 16),
    paymentMethod: "Tiền mặt",
    
    notes: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      
      {/* 1. Thông tin chung & Tiền phòng */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 gap-y-6">
        
        {/* Block: Thông tin chung */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-800">Thông tin chung</h3>
          
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600">Thời gian ở</label>
            <div className="flex items-center border border-slate-200 rounded-lg bg-white overflow-hidden focus-within:border-brand-primary focus-within:ring-1 focus-within:ring-brand-primary transition-all pr-2">
              <input
                type="date"
                name="checkInDate"
                value={formData.checkInDate}
                onChange={handleChange}
                required
                className="w-full pl-3 pr-1 py-2 text-sm text-slate-700 outline-none bg-transparent"
              />
              <span className="text-slate-400 text-sm font-medium">→</span>
              <input
                type="date"
                name="expectedCheckOut"
                value={formData.expectedCheckOut}
                onChange={handleChange}
                required
                className="w-full pl-1 pr-3 py-2 text-sm text-slate-700 outline-none bg-transparent"
              />
              <CalendarDays className="w-4 h-4 text-slate-400 shrink-0 mr-1" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600">
                Số khách ở <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                name="guestCount"
                value={formData.guestCount}
                onChange={handleChange}
                min="1"
                required
                className="w-full px-3 py-2 text-sm text-slate-700 border border-slate-200 rounded-lg outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600">
                Khách hàng đại diện <span className="text-rose-500">*</span>
              </label>
              <button
                type="button"
                className="w-full flex items-center justify-center gap-2 py-2 px-3 border border-slate-200 rounded-lg text-sm font-medium text-slate-500 hover:text-brand-primary hover:bg-brand-primary/5 hover:border-brand-primary transition-all"
              >
                <div className="relative">
                  <User className="w-4 h-4" />
                  <div className="absolute -bottom-1 -right-1 bg-[#14B8A6] text-white rounded-full flex items-center justify-center w-3 h-3">
                    <Plus className="w-2 h-2" />
                  </div>
                </div>
                Chọn khách hàng đại diện
              </button>
            </div>
          </div>
        </div>

        {/* Block: Tiền phòng */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-800">Tiền phòng</h3>
          
          <div className="space-y-1.5">
            <select
              name="rentCycle"
              value={formData.rentCycle}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm text-slate-700 border border-slate-200 rounded-lg outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all"
            >
              <option value="Tháng">Tháng</option>
              <option value="Ngày">Ngày</option>
            </select>
          </div>

          <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-xl space-y-2">
            <label className="text-xs font-semibold text-slate-700">Mỗi tháng (23 tháng, 30 ngày)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-medium">₫</span>
              <input
                type="text"
                name="rentAmount"
                value={formData.rentAmount}
                onChange={handleChange}
                placeholder="2,500,000"
                className="w-full pl-7 pr-3 py-2 text-sm font-medium text-slate-800 border border-slate-200 rounded-lg outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all bg-white"
              />
            </div>
            <p className="text-[10px] text-slate-500 leading-relaxed mt-1">
              <span className="inline-block w-3 h-3 mr-1 text-center rounded-full border border-slate-300 text-slate-400 text-[8px] leading-[10px]">i</span>
              Đơn giá cho ngày lẻ được tính bằng đơn giá theo tháng chia cho số ngày tương ứng của tháng đó.
            </p>
          </div>
        </div>
      </div>

      <div className="h-px bg-slate-100 w-full" />

      {/* 2. Thanh toán */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-800">Thanh toán</h3>
        <div className="w-1/2 pr-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600">
              Kỳ thanh toán <span className="text-rose-500">*</span>
            </label>
            <select
              name="paymentCycle"
              value={formData.paymentCycle}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm text-slate-700 border border-slate-200 rounded-lg outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all"
            >
              <option value="Mỗi tháng">Mỗi tháng</option>
              <option value="Đầu kỳ">Đầu kỳ</option>
              <option value="Cuối kỳ">Cuối kỳ</option>
            </select>
          </div>
        </div>
      </div>

      <div className="h-px bg-slate-100 w-full" />

      {/* 3. Tiền cọc */}
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800">Tiền cọc</h3>
          <button type="button" className="text-xs text-rose-500 hover:text-rose-600 font-medium">Xóa</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600">
              Tổng cọc <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-medium">₫</span>
              <input
                type="text"
                name="totalDeposit"
                value={formData.totalDeposit}
                onChange={handleChange}
                placeholder="2,500,000"
                required
                className="w-full pl-7 pr-3 py-2 text-sm font-medium text-slate-800 border border-slate-200 rounded-lg outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600">Cọc đặt phòng</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-medium">₫</span>
              <input
                type="text"
                name="depositAmount"
                value={formData.depositAmount}
                onChange={handleChange}
                placeholder="2,500,000"
                className="w-full pl-7 pr-3 py-2 text-sm font-medium text-slate-800 border border-slate-200 rounded-lg outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600">
              Ngày giao dịch <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="datetime-local"
                name="transactionDate"
                value={formData.transactionDate}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 text-sm font-medium text-slate-800 border border-slate-200 rounded-lg outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600">
              Phương thức thanh toán <span className="text-rose-500">*</span>
            </label>
            <select
              name="paymentMethod"
              value={formData.paymentMethod}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm font-medium text-slate-800 border border-slate-200 rounded-lg outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all"
            >
              <option value="Tiền mặt">Tiền mặt</option>
              <option value="Chuyển khoản">Chuyển khoản</option>
              <option value="Quẹt thẻ">Quẹt thẻ</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600">Ghi chú cho đặt phòng</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              placeholder="Thêm ghi chú, quản lý thêm dễ dàng..."
              className="w-full px-3 py-2.5 text-sm font-medium text-slate-800 border border-slate-200 rounded-lg outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all resize-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600">Tệp đính kèm</label>
            <div className="flex">
              <button
                type="button"
                className="w-20 h-20 border border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center gap-1 hover:border-brand-primary hover:bg-brand-primary/5 transition-all text-slate-500 hover:text-brand-primary cursor-pointer"
              >
                <Plus className="w-5 h-5" />
                <span className="text-[10px] font-medium">Thêm tệp</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100">
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2 bg-[#EBEBEB] text-slate-700 rounded-md text-sm font-semibold hover:bg-slate-300 transition-all cursor-pointer"
        >
          Hủy
        </button>
        <button
          type="submit"
          className="px-6 py-2 bg-[#14B8A6] text-slate-900 rounded-md text-sm font-semibold hover:brightness-95 transition-all active:scale-95 cursor-pointer shadow-sm"
        >
          Tạo
        </button>
      </div>
    </form>
  );
};

export default BookingForm;

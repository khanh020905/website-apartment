import { useState } from "react";
import { motion } from "framer-motion";
import { 
  CalendarDays, 
  Search, 
  Filter, 
  Plus, 
  Clock, 
  CheckCircle2, 
  XCircle,
  MoreVertical,
  Building2,
  Home,
  Phone,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

interface Booking {
  id: string;
  customer_name: string;
  phone: string;
  room_number: string;
  building_name: string;
  check_in: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  deposit: number;
}

const BookingPage = () => {
  const [loading] = useState(false);
  const [search, setSearch] = useState("");

  const mockBookings: Booking[] = [
    {
      id: "1",
      customer_name: "Nguyễn Văn A",
      phone: "0901234567",
      room_number: "P.101",
      building_name: "Tòa nhà Trà My",
      check_in: "2024-04-10",
      status: 'confirmed',
      deposit: 1000000
    },
    {
      id: "2",
      customer_name: "Trần Thị B",
      phone: "0987654321",
      room_number: "P.202",
      building_name: "Tòa nhà Trà My",
      check_in: "2024-04-12",
      status: 'pending',
      deposit: 500000
    }
  ];

  const stats = [
    { label: "Tổng đặt phòng", value: 42, icon: CalendarDays, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Chờ xác nhận", value: 8, icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Đã xác nhận", value: 28, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Đã hủy", value: 6, icon: XCircle, color: "text-rose-600", bg: "bg-rose-50" },
  ];

  return (
    <div className="p-8 space-y-8 bg-slate-50 min-h-full">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Đặt phòng</h1>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-6 py-2 bg-[#fcd34d] text-black rounded-xl text-sm font-black transition-all hover:shadow-lg hover:shadow-yellow-500/20 cursor-pointer">
            <Plus className="w-5 h-5" />
            Tạo đặt phòng
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between"
          >
            <div>
              <p className="text-3xl font-black text-slate-900 mb-1">{stat.value}</p>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
            </div>
            <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        {/* Filters */}
        <div className="p-6 border-b border-slate-50 flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[300px]">
            <input
              type="text"
              placeholder="Tìm kiếm theo tên khách, số điện thoại..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-teal-600/5 focus:border-teal-600/30 transition-all"
            />
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all cursor-pointer">
            <Filter className="w-4 h-4" />
            Bộ lọc
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Khách hàng</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Phòng / Tòa nhà</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Ngày nhận phòng</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Trạng thái</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Tiền cọc</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <div className="w-10 h-10 border-4 border-teal-600/20 border-t-teal-600 rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-sm font-bold text-slate-400">Đang tải dữ liệu...</p>
                  </td>
                </tr>
              ) : (
                mockBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center font-black">
                          {b.customer_name[0]}
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-900">{b.customer_name}</p>
                          <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                            <Phone className="w-3 h-3" />
                            {b.phone}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                          <Home className="w-4 h-4 text-slate-400" />
                          {b.room_number}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                          <Building2 className="w-3 h-3 text-slate-300" />
                          {b.building_name}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-xs font-bold text-slate-600">{b.check_in}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        b.status === 'confirmed' ? 'bg-emerald-50 text-emerald-600' : 
                        b.status === 'pending' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'
                      }`}>
                        {b.status === 'confirmed' ? 'Đã xác nhận' : b.status === 'pending' ? 'Chờ xác nhận' : 'Đã hủy'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-sm font-black text-slate-900">{b.deposit.toLocaleString()}đ</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-slate-50 flex items-center justify-end gap-4 bg-slate-50/10">
          <span className="text-sm font-bold text-slate-400">1-2/2</span>
          <div className="flex items-center gap-1">
            <button className="p-1 hover:bg-slate-100 rounded-lg text-slate-400" disabled><ChevronLeft className="w-4 h-4" /></button>
            <button className="p-1 hover:bg-slate-100 rounded-lg text-slate-400" disabled><ChevronRight className="w-4 h-4" /></button>
          </div>
          <select className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-500 outline-none">
            <option>20/trang</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;

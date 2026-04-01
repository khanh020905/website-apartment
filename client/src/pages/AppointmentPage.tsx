import { useState } from "react";
import { 
  Search, 
  Settings, 
  Calendar, 
  Plus, 
  LayoutList, 
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  MoreVertical
} from "lucide-react";

interface Appointment {
  id: string;
  code: string;
  customer_name: string;
  time: string;
  room_number: string;
  building_name: string;
  status: string;
  booking_request: boolean;
  assignee: string;
}

const AppointmentPage = () => {
  const [search, setSearch] = useState("");
  const [appointments] = useState<Appointment[]>([]); 

  return (
    <div className="p-8 space-y-8 bg-slate-50 min-h-full">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Lịch hẹn xem phòng</h1>
        <div className="flex items-center gap-3">
          <div className="flex bg-white rounded-xl border border-slate-100 p-1 shadow-sm">
            <button className="p-2 bg-[#1e2329] text-white rounded-lg shadow-lg">
              <LayoutList className="w-5 h-5" />
            </button>
            <button className="p-2 text-slate-400 hover:text-slate-600 rounded-lg">
              <CalendarDays className="w-5 h-5" />
            </button>
          </div>
          <button className="flex items-center gap-2 px-6 py-2.5 bg-[#fcd34d] text-black rounded-xl text-sm font-black transition-all hover:shadow-lg hover:shadow-yellow-500/20 cursor-pointer">
            <Plus className="w-5 h-5" />
            Đặt lịch xem phòng
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden p-6 space-y-6">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-1 max-w-[280px]">
             <input
              type="text"
              placeholder="Tìm kiếm bằng mã xem phòng..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-teal-600/5 transition-all"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          </div>

          <select className="bg-slate-50 border border-slate-100 px-4 py-2.5 rounded-xl text-sm font-bold text-slate-700 outline-none w-44 focus:ring-4 focus:ring-yellow-500/10 focus:border-yellow-500 transition-all">
            <option value="">Trạng thái</option>
            <option value="pending">Đang chờ</option>
            <option value="confirmed">Đã xác nhận</option>
          </select>

          <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 px-4 py-2.5 rounded-xl">
            <input type="date" className="bg-transparent border-none text-sm font-bold text-slate-700 w-32 focus:ring-0 cursor-pointer" />
            <span className="text-slate-400">→</span>
            <input type="date" className="bg-transparent border-none text-sm font-bold text-slate-700 w-32 focus:ring-0 cursor-pointer" />
            <Calendar className="w-4 h-4 text-slate-400" />
          </div>

          <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-100 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all cursor-pointer">
            <Settings className="w-4 h-4" />
            Bộ lọc
          </button>
        </div>

        {/* Table Implementation */}
        <div className="overflow-x-auto min-h-[400px] flex flex-col">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 border-y border-slate-100">
              <tr>
                <th className="px-6 py-4 w-12 text-center">
                   <div className="w-4 h-4 rounded border border-slate-200 bg-white cursor-pointer" />
                </th>
                <th className="px-4 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Mã xem phòng</th>
                <th className="px-4 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Khách xem phòng</th>
                <th className="px-4 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Thời gian</th>
                <th className="px-4 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Phòng</th>
                <th className="px-4 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Toà nhà</th>
                <th className="px-4 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Trạng thái</th>
                <th className="px-4 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Yêu cầu đặt phòng</th>
                <th className="px-4 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Người đảm nhận</th>
                <th className="px-4 py-4 w-12 text-center">
                   <Settings className="w-4 h-4 text-slate-400 mx-auto" />
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {appointments.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-6 py-32 text-center">
                    <div className="flex flex-col items-center justify-center gap-4 opacity-70">
                       <div className="relative w-32 h-32 flex items-center justify-center">
                          <div className="absolute inset-0 bg-teal-50/50 rounded-full animate-pulse" />
                          <CalendarDays className="w-16 h-16 text-teal-100" />
                          <div className="absolute -top-1 -right-1 w-10 h-10 bg-white rounded-2xl shadow-xl flex items-center justify-center">
                             <Search className="w-5 h-5 text-slate-200" />
                          </div>
                       </div>
                       <p className="text-xl font-black text-slate-900 tracking-tight">Không có dữ liệu</p>
                    </div>
                  </td>
                </tr>
              ) : (
                appointments.map((a) => (
                   <tr key={a.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 w-12 text-center">
                         <div className="w-4 h-4 rounded border border-slate-200 bg-white" />
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-[13px] font-black text-slate-700 uppercase">{a.code}</span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="text-[13px] font-bold text-slate-900">{a.customer_name}</span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="text-[13px] font-black text-slate-700">{a.time}</span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="text-[13px] font-bold text-teal-700">{a.room_number}</span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">{a.building_name}</span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                          a.status === 'confirmed' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                        }`}>
                          {a.status === 'confirmed' ? 'Đã xác nhận' : 'Đang chờ'}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center">
                         <span className="text-sm font-bold text-slate-400">{a.booking_request ? 'Có' : 'Không'}</span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                           <div className="w-7 h-7 bg-slate-100 rounded-full flex items-center justify-center text-[10px] font-black">
                              {a.assignee[0]}
                           </div>
                           <span className="text-[12px] font-bold text-slate-600">{a.assignee}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                         <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400">
                           <MoreVertical className="w-4 h-4" />
                         </button>
                      </td>
                   </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Pagination */}
        <div className="flex items-center justify-end gap-6 pt-4 border-t border-slate-50">
          <span className="text-[13px] font-bold text-slate-400">0-0/0</span>
          <div className="flex items-center gap-1">
            <button className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 disabled:opacity-30" disabled>
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 disabled:opacity-30" disabled>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <select className="bg-white border border-slate-200 px-3 py-1 rounded-lg text-[12px] font-bold text-slate-500 outline-none">
            <option>20/trang</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default AppointmentPage;

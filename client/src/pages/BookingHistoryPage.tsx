import { useState, useEffect, useCallback } from "react";
import { Search, Settings2, X, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../lib/api";
import { useBuilding } from "../contexts/BuildingContext";

interface Reservation {
  id: string;
  reservation_code: string;
  customer_name: string;
  status: 'confirmed' | 'active' | 'completed' | 'cancelled';
  package_type: string;
  room: { room_number: string, floor: number };
  created_at: string;
}

export default function BookingHistoryPage() {
  const { selectedBuildingId } = useBuilding();
  const [loading, setLoading] = useState(true);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [search, setSearch] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [status, setStatus] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({
      page: page.toString(),
      limit: "20",
    });
    if (search) params.append("search", search);
    if (selectedBuildingId) params.append("building_id", selectedBuildingId);
    if (status.length > 0) params.append("status", status[0]); // Simple filter for now

    try {
      const { data } = await api.get<any>(`/api/reservations?${params}`);
      if (data) {
        setReservations(data.reservations);
        setTotal(data.total);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }, [page, search, selectedBuildingId, status]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);



  const getStatusLabel = (s: string) => {
    switch(s) {
      case 'confirmed': return 'Đã xác nhận';
      case 'active': return 'Đang sử dụng';
      case 'completed': return 'Đã hoàn thành';
      case 'cancelled': return 'Đã huỷ';
      default: return s;
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f8f9fa] relative overflow-hidden font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="px-6 py-4">
          <h1 className="text-[20px] font-bold text-slate-900 tracking-tight">Lịch sử đặt phòng</h1>
        </div>

        <div className="px-6 pb-4 flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-70 shrink-0">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm kiếm bằng mã đặt phòng..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-700 bg-white focus:outline-none focus:border-brand-primary transition-all shadow-sm"
            />
          </div>

          <button
            onClick={() => setIsFilterOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-black text-slate-700 hover:bg-slate-50 transition-colors shadow-sm ml-auto cursor-pointer"
          >
            <Settings2 className="w-4 h-4" /> Bộ lọc
          </button>
        </div>
      </div>

      {/* Table Area */}
      <div className="flex-1 overflow-auto bg-[#f8f9fa] p-6 text-sm">
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm h-full flex flex-col">
          <div className="overflow-x-auto flex-1">
            <table className="w-full">
              <thead className="bg-[#EDEDED] border-b border-slate-200 sticky top-0 z-10 font-bold uppercase tracking-widest text-[10px] text-slate-500">
                <tr>
                  <th className="px-5 py-3.5 text-left">Mã đặt phòng</th>
                  <th className="px-5 py-3.5 text-left">Phòng</th>
                  <th className="px-5 py-3.5 text-left">Gói</th>
                  <th className="px-5 py-3.5 text-left">Khách hàng</th>
                  <th className="px-5 py-3.5 text-left">Trạng thái</th>
                  <th className="px-5 py-3.5 text-left">Ngày tạo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-bold">
                {loading ? (
                   <tr><td colSpan={6} className="px-6 py-28 text-center text-slate-400">Đang tải...</td></tr>
                ) : reservations.length === 0 ? (
                  <tr><td colSpan={6} className="px-6 py-28 text-center text-slate-400">Chưa có lịch sử đặt phòng</td></tr>
                ) : reservations.map(r => (
                  <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-4 text-emerald-600 uppercase">{r.reservation_code}</td>
                    <td className="px-5 py-4">{r.room?.room_number}</td>
                    <td className="px-5 py-4 uppercase text-[10px]">{r.package_type === 'month' ? 'Tháng' : 'Ngày'}</td>
                    <td className="px-5 py-4">{r.customer_name}</td>
                    <td className="px-5 py-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] uppercase border ${r.status === 'confirmed' ? 'bg-brand-bg text-brand-dark border-brand-primary/20' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                        {getStatusLabel(r.status)}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-400 font-medium">{new Date(r.created_at).toLocaleDateString('vi-VN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-auto px-5 py-3 border-t border-slate-200 bg-white flex items-center justify-end gap-4 text-sm text-slate-600">
             <span className="font-bold">{total === 0 ? "0-0/0" : `${(page - 1) * 20 + 1}-${Math.min(page * 20, total)}/${total}`}</span>
             <div className="flex items-center gap-1">
               <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="p-1 hover:bg-slate-100 rounded disabled:opacity-50 text-slate-400"><ChevronLeft className="w-4 h-4" /></button>
               <button disabled={page * 20 >= total} onClick={() => setPage(p => p + 1)} className="p-1 hover:bg-slate-100 rounded disabled:opacity-50 text-slate-400"><ChevronRight className="w-4 h-4" /></button>
             </div>
          </div>
        </div>
      </div>

       {/* Advanced Filter Sidebar */}
       <AnimatePresence>
        {isFilterOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsFilterOpen(false)} className="absolute inset-0 bg-slate-900/20 z-40 transition-opacity" />
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="absolute top-0 right-0 w-100 h-full bg-white shadow-2xl z-50 flex flex-col border-l border-slate-200">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
                <h2 className="text-lg font-bold text-slate-900">Lọc nâng cao</h2>
                <button onClick={() => setIsFilterOpen(false)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"><X className="w-5 h-5" /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-5 space-y-6">
                 <div>
                    <h3 className="text-sm font-semibold text-slate-800 mb-3">Trạng thái</h3>
                    {["Đã xác nhận", "Đang sử dụng", "Đã hoàn thành", "Đã huỷ"].map(item => (
                       <label key={item} className="flex items-center gap-3 cursor-pointer mb-2">
                          <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-brand-primary focus:ring-brand-primary/20" />
                          <span className="text-sm text-slate-600">{item}</span>
                       </label>
                    ))}
                 </div>
              </div>
              <div className="p-5 border-t border-slate-100 bg-white flex items-center justify-end gap-3 shrink-0">
                <button onClick={() => setStatus([])} className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer">Đặt lại</button>
                <button onClick={() => setIsFilterOpen(false)} className="px-6 py-2.5 text-sm font-bold bg-brand-primary hover:bg-brand-dark text-white rounded-lg transition-colors shadow-sm cursor-pointer">Áp dụng</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

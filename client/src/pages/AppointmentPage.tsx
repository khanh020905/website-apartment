import { useState, useEffect, useCallback } from "react";
import { Search, Settings2, X, ChevronLeft, ChevronRight, Settings } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../lib/api";
import { useBuilding } from "../contexts/BuildingContext";
import Modal from "../components/modals/Modal";
import AppointmentForm, { type AppointmentFormData } from "../components/modals/AppointmentForm";
import type { BuildingWithRooms } from "../../../shared/types";

interface Tour {
  id: string;
  tour_code: string;
  customer_name: string;
  customer_phone: string;
  appointment_date: string;
  appointment_time: string;
  status: 'pending' | 'viewed' | 'cancelled';
  building: { name: string };
  room: { room_number: string } | null;
  message: string;
}

interface VisitToursResponse {
  tours: Tour[];
  total: number;
}

export default function AppointmentPage() {
  const { selectedBuildingId } = useBuilding();
  const [loading, setLoading] = useState(true);
  const [tours, setTours] = useState<Tour[]>([]);
  const [search, setSearch] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [buildings, setBuildings] = useState<BuildingWithRooms[]>([]);
  const [roomFilterSearch, setRoomFilterSearch] = useState("");
  const [selectedRooms, setSelectedRooms] = useState<string[]>([]);
  const [status, setStatus] = useState<string[]>([]);

  const allRooms = buildings.flatMap((b) => 
    (b.rooms || []).map(r => ({ ...r, building_name: b.name }))
  );

  const fetchTours = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({
      page: page.toString(),
      limit: "20",
    });
    if (search) params.append("search", search);
    if (selectedBuildingId) params.append("building_id", selectedBuildingId);
    if (status.length > 0) params.append("statuses", status.join(","));
    if (selectedRooms.length > 0) params.append("room_ids", selectedRooms.join(","));

    try {
      const { data } = await api.get<VisitToursResponse>(`/api/visit-tours?${params}`);
      if (data) {
        setTours(data.tours);
        setTotal(data.total);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }, [page, search, selectedBuildingId, status, selectedRooms]);

  const fetchBuildings = useCallback(async () => {
    const params = selectedBuildingId ? `?building_id=${selectedBuildingId}` : "";
    const { data } = await api.get<{ buildings: BuildingWithRooms[] }>(`/api/buildings${params}`);
    if (data) setBuildings(data.buildings);
  }, [selectedBuildingId]);

  useEffect(() => {
    fetchTours();
    fetchBuildings();
  }, [fetchTours, fetchBuildings]);

  const handleCreateAppointment = async (formData: AppointmentFormData) => {
    const payload = {
      customer_name: formData.customerName,
      customer_phone: formData.phone,
      customer_email: formData.email,
      appointment_date: formData.date,
      appointment_time: formData.time,
      building_id: formData.buildingId === 'all' ? selectedBuildingId : formData.buildingId,
      room_id: formData.room || undefined,
      message: formData.message
    };

    const { error } = await api.post("/api/visit-tours", payload);
    if (!error) {
      setIsModalOpen(false);
      fetchTours();
    } else {
      alert(error);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f8f9fa] relative overflow-hidden font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="px-6 py-4">
          <h1 className="text-[20px] font-bold text-slate-900 tracking-tight">Lịch hẹn xem phòng</h1>
        </div>

        <div className="px-6 pb-4 flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-70 shrink-0">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm kiếm bằng mã xem phòng hoặc khách hàng..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-700 bg-white focus:outline-none focus:border-[#14B8A6] transition-all shadow-sm"
            />
          </div>

          <button
            onClick={() => setIsFilterOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-black text-slate-700 hover:bg-slate-50 transition-colors shadow-sm ml-auto cursor-pointer"
          >
            <Settings2 className="w-4 h-4" /> Bộ lọc
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2 bg-[#14B8A6] text-white rounded-lg text-sm font-black transition-colors hover:bg-[#0F766E] shadow-sm cursor-pointer"
          >
            + Đặt lịch xem phòng
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
                  <th className="px-5 py-3.5 w-10"><input type="checkbox" className="rounded border-slate-300 text-[#14B8A6] w-4 h-4" /></th>
                  <th className="px-5 py-3.5 text-left">Mã xem phòng</th>
                  <th className="px-5 py-3.5 text-left">Khách xem phòng</th>
                  <th className="px-5 py-3.5 text-left">Thời gian</th>
                  <th className="px-5 py-3.5 text-left">Phòng/Tòa</th>
                  <th className="px-5 py-3.5 text-left">Trạng thái</th>
                  <th className="px-5 py-3.5 text-center"><Settings className="w-4 h-4 text-slate-400 inline-block" /></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-bold">
                {loading ? (
                  <tr><td colSpan={7} className="px-6 py-28 text-center text-slate-400">Đang tải biểu mẫu...</td></tr>
                ) : tours.length === 0 ? (
                  <tr><td colSpan={7} className="px-6 py-28 text-center text-slate-400">Chưa có lịch hẹn nào</td></tr>
                ) : tours.map(t => (
                  <tr key={t.id} className="hover:bg-brand-bg/20 group transition-colors">
                    <td className="px-5 py-4"><input type="checkbox" className="rounded border-slate-300 text-[#14B8A6] w-4 h-4" /></td>
                    <td className="px-5 py-4 text-brand-dark uppercase">{t.tour_code}</td>
                    <td className="px-5 py-4">
                      <div className="flex flex-col">
                        <span>{t.customer_name}</span>
                        <span className="text-[10px] text-slate-400">{t.customer_phone}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                       <span className="text-slate-700">{new Date(t.appointment_date).toLocaleDateString('vi-VN')}</span>
                       <span className="ml-2 text-slate-400 text-[10px]">{t.appointment_time}</span>
                    </td>
                    <td className="px-5 py-4">{t.room?.room_number ?? t.building?.name}</td>
                    <td className="px-5 py-4">
                       <span className={`px-2 py-0.5 rounded text-[10px] uppercase border ${t.status === 'pending' ? 'bg-brand-bg text-brand-dark border-[#14B8A6]/20' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                          {t.status === 'pending' ? 'Chờ xem' : 'Đã xem'}
                       </span>
                    </td>
                    <td className="px-5 py-4"></td>
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
              <div className="flex-1 overflow-y-auto p-5 space-y-8">
                 <div>
                    <h3 className="text-sm font-semibold text-slate-800 mb-3">Trạng thái</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: "pending", label: "Chờ xem" },
                        { id: "viewed", label: "Đã xem" },
                        { id: "cancelled", label: "Đã huỷ" }
                      ].map(item => {
                         const isSelected = status.includes(item.id);
                         return (
                           <label key={item.id} className={`flex items-center gap-3 cursor-pointer p-2 rounded-lg transition-colors ${isSelected ? "bg-[#14B8A6]/5" : "hover:bg-slate-50"}`}>
                              <input 
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => {
                                  if (isSelected) setStatus(prev => prev.filter(s => s !== item.id));
                                  else setStatus(prev => [...prev, item.id]);
                                }}
                                className="w-4 h-4 rounded border-slate-300 text-[#14B8A6] focus:ring-[#14B8A6]/20" 
                              />
                              <span className={`text-sm font-medium ${isSelected ? "text-brand-dark" : "text-slate-600"}`}>{item.label}</span>
                           </label>
                         );
                      })}
                    </div>
                 </div>

                 <div className="h-px bg-slate-100" />

                 <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold text-slate-800">Chọn phòng</h3>
                      <span className="text-xs font-bold text-[#14B8A6]">{selectedRooms.length} đã chọn</span>
                    </div>
                    
                    <div className="relative mb-3">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Tìm theo tên phòng..."
                        value={roomFilterSearch}
                        onChange={(e) => setRoomFilterSearch(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-[#14B8A6] transition-all bg-slate-50 focus:bg-white"
                      />
                    </div>

                    <div className="max-h-[300px] overflow-y-auto border border-slate-100 rounded-lg p-2 bg-slate-50/50">
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 gap-y-2">
                        {allRooms
                          .filter(r => r.room_number.toLowerCase().includes(roomFilterSearch.toLowerCase()))
                          .map((r) => {
                            const isSelected = selectedRooms.includes(r.id);
                            return (
                              <label
                                key={r.id}
                                className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${isSelected ? "bg-[#14B8A6]/5" : "hover:bg-slate-50 hover:shadow-sm bg-white border border-transparent"}`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => {
                                    if (isSelected) setSelectedRooms(prev => prev.filter(id => id !== r.id));
                                    else setSelectedRooms(prev => [...prev, r.id]);
                                  }}
                                  className="w-4 h-4 rounded border-slate-300 text-[#14B8A6] focus:ring-[#14B8A6]/20"
                                />
                                <span className={`text-sm ${isSelected ? "font-bold text-brand-dark" : "text-slate-600 font-medium"}`}>
                                  {r.room_number} <span className="text-[10px] text-slate-400 block">{r.building_name}</span>
                                </span>
                              </label>
                            );
                        })}
                        {allRooms.length === 0 && <span className="p-2 text-xs text-slate-400">Không có phòng</span>}
                      </div>
                    </div>
                 </div>
              </div>
              <div className="p-5 border-t border-slate-100 bg-white flex items-center justify-end gap-3 shrink-0">
                <button 
                  onClick={() => { setStatus([]); setSelectedRooms([]); }} 
                  className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                >
                  Đặt lại
                </button>
                <button onClick={() => setIsFilterOpen(false)} className="px-6 py-2.5 text-sm font-bold bg-[#14B8A6] hover:bg-[#0F766E] text-white rounded-lg transition-colors shadow-sm cursor-pointer">Áp dụng</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Đặt lịch xem phòng" size="lg">
        <AppointmentForm onSubmit={handleCreateAppointment} onCancel={() => setIsModalOpen(false)} />
      </Modal>
    </div>
  );
}

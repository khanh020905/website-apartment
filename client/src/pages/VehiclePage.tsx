import { useState, useEffect, useCallback } from "react";
import { Search, Settings2, X, ChevronLeft, ChevronRight, Settings, Download, Edit2, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../lib/api";
import { useBuilding } from "../contexts/BuildingContext";
import Modal from "../components/modals/Modal";
import VehicleForm from "../components/modals/VehicleForm";

interface Vehicle {
  id: string;
  vehicle_type: 'xe_may' | 'xe_hoi' | 'xe_dap' | 'xe_dien';
  license_plate: string;
  vehicle_name: string;
  color: string;
  status: 'active' | 'inactive';
  customer: { id: string, tenant_name: string, tenant_phone: string };
  room: { id: string, room_number: string };
  building: { id: string, name: string };
}

interface VehicleResponse {
  vehicles: Vehicle[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function VehiclePage() {
  const { selectedBuildingId } = useBuilding();
  const [loading, setLoading] = useState(true);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [vehicleType, setVehicleType] = useState("");
  const [status, setStatus] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  
  // Pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, vehicleType, status, selectedBuildingId]);

  const fetchVehicles = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (debouncedSearch) params.append("search", debouncedSearch);
    if (vehicleType) params.append("vehicle_type", vehicleType);
    if (status) params.append("status", status);
    if (selectedBuildingId) params.append("building_id", selectedBuildingId);

    try {
      const { data } = await api.get<VehicleResponse>(`/api/vehicles?${params}`);
      if (data) {
        setVehicles(data.vehicles);
        setTotal(data.total);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }, [page, limit, debouncedSearch, vehicleType, status, selectedBuildingId]);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  const handleAddOrEdit = async (formData: any) => {
    if (editingVehicle) {
      const { error } = await api.put(`/api/vehicles/${editingVehicle.id}`, formData);
      if (!error) {
        setIsAddModalOpen(false);
        setEditingVehicle(null);
        fetchVehicles();
      } else alert(error);
    } else {
      const { error } = await api.post("/api/vehicles", formData);
      if (!error) {
        setIsAddModalOpen(false);
        fetchVehicles();
      } else alert(error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa phương tiện này?")) return;
    const { error } = await api.delete(`/api/vehicles/${id}`);
    if (!error) fetchVehicles();
    else alert(error);
  };

  const clearFilters = () => {
    setSearch("");
    setVehicleType("");
    setStatus("");
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f8f9fa] relative overflow-hidden font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="px-6 py-4 flex items-center justify-between">
          <h1 className="text-[20px] font-black text-slate-900 tracking-tight">Phương tiện</h1>
          <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Xuất Excel</span>
          </button>
        </div>

        {/* Toolbar */}
        <div className="px-6 pb-4 flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-70 shrink-0">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm kiếm theo phòng, khách hàng, biển số..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-700 bg-white focus:outline-none focus:border-amber-400 hover:border-slate-300 transition-all font-['Plus_Jakarta_Sans',sans-serif]"
            />
          </div>

          <div className="w-full sm:w-44 shrink-0">
            <select
              value={vehicleType}
              onChange={(e) => setVehicleType(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-600 bg-white focus:outline-none focus:border-amber-400 hover:border-slate-300 transition-all cursor-pointer appearance-none"
            >
              <option value="">Loại phương tiện</option>
              <option value="xe_may">Xe máy</option>
              <option value="xe_hoi">Ô tô</option>
              <option value="xe_dap">Xe đạp</option>
              <option value="xe_dien">Xe điện</option>
            </select>
          </div>

          <div className="w-full sm:w-40 shrink-0">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-600 bg-white focus:outline-none focus:border-amber-400 hover:border-slate-300 transition-all cursor-pointer appearance-none"
            >
              <option value="">Trạng thái</option>
              <option value="active">Hoạt động</option>
              <option value="inactive">Ngừng</option>
            </select>
          </div>

          <button
            onClick={() => setIsFilterOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-black text-slate-700 hover:bg-slate-50 transition-colors shadow-sm cursor-pointer"
          >
            <Settings2 className="w-4 h-4" /> Bộ lọc
          </button>

          <button 
             onClick={() => { setEditingVehicle(null); setIsAddModalOpen(true); }}
             className="flex items-center gap-2 px-5 py-2 bg-amber-400 text-slate-900 rounded-lg text-sm font-black transition-colors hover:bg-amber-500 shadow-sm ml-auto cursor-pointer"
          >
            + Phương tiện
          </button>
        </div>
      </div>

      {/* Table Area */}
      <div className="flex-1 overflow-auto bg-[#f8f9fa] p-6">
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm h-full flex flex-col">
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left">
              <thead className="bg-[#EDEDED] border-b border-slate-200 sticky top-0 z-10 font-['Plus_Jakarta_Sans',sans-serif]">
                <tr>
                  <th className="px-5 py-3.5 w-10"><input type="checkbox" className="rounded border-slate-300 text-amber-500 focus:ring-amber-500 w-4 h-4" /></th>
                  {["Khách hàng", "Phòng", "Toà nhà", "Loại xe", "Biển số", "Tên xe", "Màu sắc", "Trạng thái", ""].map((h, i) => (
                    <th key={i} className="px-5 py-3.5 text-[11px] font-black text-slate-700 uppercase tracking-wider whitespace-nowrap">{h} <span className="inline-block ml-1 opacity-50">↕</span></th>
                  ))}
                  <th className="px-5 py-3.5 w-10 text-center">
                    <Settings className="w-4 h-4 text-slate-400 inline-block" />
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-['Plus_Jakarta_Sans',sans-serif]">
                {loading ? (
                  <tr><td colSpan={11} className="px-6 py-28 text-center text-slate-400 font-bold">Đang tải...</td></tr>
                ) : vehicles.length === 0 ? (
                  <tr><td colSpan={11} className="px-6 py-28 text-center text-slate-400 font-bold">Không có dữ liệu</td></tr>
                ) : vehicles.map((v) => (
                  <tr key={v.id} className="hover:bg-amber-50/20 group transition-colors border-b border-slate-50">
                    <td className="px-5 py-4"><input type="checkbox" className="rounded border-slate-300 text-amber-500 w-4 h-4" /></td>
                    <td className="px-5 py-4">
                      <div className="flex flex-col">
                        <span className="text-[13px] font-black text-slate-900">{v.customer?.tenant_name}</span>
                        <span className="text-[11px] font-bold text-slate-400">{v.customer?.tenant_phone}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-[13px] font-black text-slate-700">{v.room?.room_number}</td>
                    <td className="px-5 py-4 text-[13px] font-bold text-slate-600">{v.building?.name}</td>
                    <td className="px-5 py-4">
                       <span className="px-2 py-1 bg-slate-100 rounded text-[11px] font-black text-slate-600 uppercase">
                          {v.vehicle_type === 'xe_may' ? 'Xe máy' : v.vehicle_type === 'xe_hoi' ? 'Ô tô' : v.vehicle_type === 'xe_dap' ? 'Xe đạp' : 'Xe điện'}
                       </span>
                    </td>
                    <td className="px-5 py-4 text-[13px] font-black text-amber-600">{v.license_plate}</td>
                    <td className="px-5 py-4 text-[13px] font-bold text-slate-600">{v.vehicle_name || '-'}</td>
                    <td className="px-5 py-4 text-[13px] font-bold text-slate-600">{v.color || '-'}</td>
                    <td className="px-5 py-4">
                       <span className={`px-2 py-0.5 rounded text-[11px] font-black uppercase ${v.status === 'active' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}>
                          {v.status === 'active' ? 'Hoạt động' : 'Ngừng'}
                       </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                       <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                             onClick={() => { setEditingVehicle(v); setIsAddModalOpen(true); }}
                             className="p-1.5 hover:bg-slate-100 rounded text-slate-400 hover:text-amber-500"
                          >
                             <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(v.id)} className="p-1.5 hover:bg-slate-100 rounded text-slate-400 hover:text-rose-500"><Trash2 className="w-4 h-4" /></button>
                       </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="mt-auto px-5 py-3 border-t border-slate-200 bg-white flex items-center justify-end gap-4 text-sm text-slate-600">
            <span className="font-bold">{total === 0 ? "0-0/0" : `${(page - 1) * limit + 1}-${Math.min(page * limit, total)}/${total}`}</span>
            <div className="flex items-center gap-1">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="p-1 hover:bg-slate-100 rounded disabled:opacity-50 text-slate-400"><ChevronLeft className="w-4 h-4" /></button>
              <button disabled={page * limit >= total} onClick={() => setPage(p => p + 1)} className="p-1 hover:bg-slate-100 rounded disabled:opacity-50 text-slate-400"><ChevronRight className="w-4 h-4" /></button>
            </div>
            <select
              value={limit}
              onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
              className="px-2 py-1 border border-slate-200 rounded text-sm font-bold bg-white outline-none cursor-pointer hover:border-amber-400 transition-colors appearance-none"
            >
              <option value={20}>20 / trang</option>
              <option value={50}>50 / trang</option>
            </select>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <Modal 
         isOpen={isAddModalOpen} 
         onClose={() => setIsAddModalOpen(false)} 
         title={editingVehicle ? "Sửa phương tiện" : "Thêm phương tiện mới"}
         size="md"
      >
        <VehicleForm 
           onSubmit={handleAddOrEdit} 
           onCancel={() => setIsAddModalOpen(false)} 
           initialData={editingVehicle ? {
              customer_id: editingVehicle.customer.id,
              room_id: editingVehicle.room.id,
              building_id: editingVehicle.building.id,
              vehicle_type: editingVehicle.vehicle_type,
              license_plate: editingVehicle.license_plate,
              vehicle_name: editingVehicle.vehicle_name,
              color: editingVehicle.color,
              status: editingVehicle.status
           } : undefined}
        />
      </Modal>

      {/* Advanced Filter Sidebar */}
      <AnimatePresence>
        {isFilterOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFilterOpen(false)}
              className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm z-40 transition-opacity"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute top-0 right-0 w-100 h-full bg-white shadow-2xl z-50 flex flex-col border-l border-slate-200"
            >
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
                <h2 className="text-lg font-bold text-slate-900">Lọc nâng cao</h2>
                <button
                  onClick={() => setIsFilterOpen(false)}
                  className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-slate-800 mb-3">Toà nhà</h3>
                  <p className="text-sm text-slate-500">Bộ lọc toà nhà được đồng bộ từ header.</p>
                </div>
              </div>

              <div className="p-5 border-t border-slate-100 bg-white flex items-center justify-end gap-3 shrink-0">
                <button
                  onClick={clearFilters}
                  className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                >
                  Đặt lại
                </button>
                <button
                  onClick={() => setIsFilterOpen(false)}
                  className="px-6 py-2.5 text-sm font-bold bg-amber-400 hover:bg-amber-500 text-slate-900 rounded-lg transition-colors shadow-sm cursor-pointer"
                >
                  Áp dụng
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

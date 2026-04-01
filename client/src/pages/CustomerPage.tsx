import { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, 
  Search, 
  Filter, 
  Upload, 
  FileSpreadsheet, 
  Plus, 
  UserCheck, 
  UserMinus, 
  UserX,
  MoreVertical,
  Building2,
  Home,
  ChevronLeft,
  ChevronRight,
  X
} from "lucide-react";
import { useBuilding } from "../contexts/BuildingContext";
import { api } from "../lib/api";
import type { ContractWithRoom } from "../../../shared/types";

const CustomerPage = () => {
  const { selectedBuildingId } = useBuilding();
  const [loading, setLoading] = useState(true);
  const [contracts, setContracts] = useState<ContractWithRoom[]>([]);
  const [search, setSearch] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // Filter States
  const [filterRoom, setFilterRoom] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterResidency, setFilterResidency] = useState("");
  const [filterGender, setFilterGender] = useState("");

  useEffect(() => {
    const fetchCustomers = async () => {
      setLoading(true);
      const { data } = await api.get<{ contracts: ContractWithRoom[] }>("/api/contracts");
      if (data) setContracts(data.contracts);
      setLoading(false);
    };
    fetchCustomers();
  }, []);

  const uniqueRoomNumbers = useMemo(() => {
    return Array.from(new Set(contracts.map(c => c.room?.room_number).filter(Boolean))).sort();
  }, [contracts]);

  const filteredContracts = useMemo(() => {
    return contracts.filter(c => {
      const matchesSearch = c.tenant_name.toLowerCase().includes(search.toLowerCase()) || 
                           (c.tenant_phone?.includes(search) ?? false);
      const matchesBuilding = !selectedBuildingId || c.room?.building_id === selectedBuildingId;
      const matchesRoom = !filterRoom || c.room?.room_number === filterRoom;
      const matchesStatus = !filterStatus || c.status === filterStatus;
      const matchesResidency = !filterResidency || c.residence_status === filterResidency;
      const matchesGender = !filterGender || c.tenant_gender === filterGender;

      return matchesSearch && matchesBuilding && matchesRoom && matchesStatus && matchesResidency && matchesGender;
    });
  }, [contracts, search, selectedBuildingId, filterRoom, filterStatus, filterResidency, filterGender]);

  const stats = [
    { label: "Tổng số khách hàng", value: filteredContracts.length, icon: Users, color: "text-purple-600", bg: "bg-purple-50" },
    { label: "Tổng số khách đang ở", value: filteredContracts.filter(c => c.status === "active").length, icon: UserCheck, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Tổng số khách đã chuyển đi", value: filteredContracts.filter(c => c.status === "terminated").length, icon: UserMinus, color: "text-rose-600", bg: "bg-rose-50" },
    { label: "Tổng số khách vãng lai", value: 0, icon: UserX, color: "text-amber-600", bg: "bg-amber-50" },
  ];

  return (
    <div className="p-8 space-y-8 bg-slate-50 min-h-full">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Khách hàng</h1>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all cursor-pointer">
            <Upload className="w-4 h-4" />
            Tải tệp lên
          </button>
          <button className="p-2 bg-white border border-slate-200 rounded-xl text-emerald-600 hover:bg-emerald-50 transition-all cursor-pointer">
            <FileSpreadsheet className="w-5 h-5" />
          </button>
          <button className="flex items-center gap-2 px-6 py-2 bg-[#fcd34d] text-black rounded-xl text-sm font-black transition-all hover:shadow-lg hover:shadow-yellow-500/20 cursor-pointer">
            <Plus className="w-5 h-5" />
            Khách hàng
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
              placeholder="Tìm kiếm khách hàng theo tên, điện thoại..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-teal-600/5 focus:border-teal-600/30 transition-all"
            />
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          </div>
          <select className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-600 focus:outline-none">
            <option>Phòng</option>
          </select>
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-500 focus:outline-none focus:border-teal-600/30 min-w-[180px] cursor-pointer"
          >
            <option value="">Trạng thái khách</option>
            <option value="active">Đang ở</option>
            <option value="terminated">Đã chuyển đi</option>
            <option value="visitor">Khách vãng lai</option>
          </select>
          <button 
            onClick={() => setIsFilterOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all cursor-pointer"
          >
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
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Phòng</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Giới tính</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">CCCD/Hộ chiếu</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tạm trú</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Trạng thái khách hàng</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Toà nhà</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-10 h-10 border-4 border-teal-600/20 border-t-teal-600 rounded-full animate-spin" />
                      <p className="text-sm font-bold text-slate-400">Đang tải khách hàng...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredContracts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-32 text-center">
                    <div className="flex flex-col items-center gap-4 opacity-40">
                      <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center">
                        <Users className="w-10 h-10 text-slate-400" />
                      </div>
                      <p className="text-lg font-black text-slate-900 tracking-tight">Không có dữ liệu</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredContracts.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50 transform transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-teal-50 text-teal-700 rounded-full flex items-center justify-center font-black capitalize">
                          {c.tenant_name[0] || 'U'}
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-900">{c.tenant_name}</p>
                          <p className="text-[10px] font-bold text-slate-400">{c.tenant_phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Home className="w-4 h-4 text-slate-400" />
                        <span className="text-sm font-bold text-slate-700">{c.room?.room_number}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-xs font-bold text-slate-600">
                        {c.tenant_gender === 'male' ? 'Nam' : c.tenant_gender === 'female' ? 'Nữ' : 'Khác'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-bold text-slate-600">{c.tenant_id_number || '-'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <div className={`w-1.5 h-1.5 rounded-full ${
                          c.residence_status === 'completed' ? 'bg-emerald-500' : 
                          c.residence_status === 'pending' ? 'bg-amber-500' : 'bg-slate-300'
                        }`} />
                        <span className="text-[11px] font-bold text-slate-600">
                          {c.residence_status === 'completed' ? 'Đã đăng ký' : 
                          c.residence_status === 'pending' ? 'Đang chờ' : 'Chưa đăng ký'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        c.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {c.status === 'active' ? 'Đang ở' : 'Đã chuyển đi'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center gap-2 text-slate-500">
                        <Building2 className="w-4 h-4" />
                        <span className="text-sm font-medium">{c.room?.building?.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer text-slate-400">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Section */}
        <div className="p-4 border-t border-slate-50 flex items-center justify-end gap-4 bg-slate-50/10">
          <span className="text-sm font-bold text-slate-400">{filteredContracts.length > 0 ? `1-${filteredContracts.length}/${filteredContracts.length}` : '0-0/0'}</span>
          <div className="flex items-center gap-1">
            <button className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 disabled:opacity-30" disabled>
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 disabled:opacity-30" disabled>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <select className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-500 outline-none">
            <option>20/khách</option>
          </select>
        </div>
      </div>

      <AnimatePresence>
        {isFilterOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFilterOpen(false)}
              className="fixed inset-0 bg-slate-900/10 backdrop-blur-[2px] z-[100]"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 350, mass: 0.8 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-[380px] bg-white shadow-[-20px_0_50px_rgba(0,0,0,0.03)] z-[101] flex flex-col"
            >
              <div className="p-8 flex items-center justify-between border-b border-slate-50 pt-16">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Lọc</h2>
                <button 
                  onClick={() => setIsFilterOpen(false)}
                  className="p-2.5 hover:bg-slate-50 rounded-2xl text-slate-400 transition-all border border-transparent hover:border-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-8">
                {/* Custom Styled Select Inputs */}
                <div className="grid grid-cols-2 gap-5">
                   <div className="space-y-2.5">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.1em] pl-1">Phòng</label>
                    <div className="relative group">
                      <select 
                        value={filterRoom}
                        onChange={(e) => setFilterRoom(e.target.value)}
                        className="w-full px-4 py-3.5 bg-slate-50/50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:bg-white focus:ring-[6px] focus:ring-yellow-500/5 focus:border-yellow-500 outline-none transition-all appearance-none cursor-pointer"
                      >
                        <option value="">Tất cả</option>
                        {uniqueRoomNumbers.map(rn => (
                          <option key={rn} value={rn}>{rn}</option>
                        ))}
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-40">
                         <ChevronRight className="w-4 h-4 rotate-90" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.1em] pl-1">Trạng thái khách</label>
                    <div className="relative">
                      <select 
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="w-full px-4 py-3.5 bg-slate-50/50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:bg-white focus:ring-[6px] focus:ring-yellow-500/5 focus:border-yellow-500 outline-none transition-all appearance-none cursor-pointer"
                      >
                        <option value="">Tất cả</option>
                        <option value="active">Đang ở</option>
                        <option value="terminated">Đã chuyển đi</option>
                      </select>
                       <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-40">
                         <ChevronRight className="w-4 h-4 rotate-90" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-2.5">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.1em] pl-1">Tạm trú</label>
                    <div className="relative">
                      <select 
                        value={filterResidency}
                        onChange={(e) => setFilterResidency(e.target.value)}
                        className="w-full px-4 py-3.5 bg-slate-50/50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:bg-white focus:ring-[6px] focus:ring-yellow-500/5 focus:border-yellow-500 outline-none transition-all appearance-none cursor-pointer"
                      >
                        <option value="">Tất cả</option>
                        <option value="completed">Đã đăng ký</option>
                        <option value="pending">Đang chờ</option>
                        <option value="not_registered">Chưa đăng ký</option>
                      </select>
                       <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-40">
                         <ChevronRight className="w-4 h-4 rotate-90" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.1em] pl-1">Giới tính</label>
                    <div className="relative">
                      <select 
                        value={filterGender}
                        onChange={(e) => setFilterGender(e.target.value)}
                        className="w-full px-4 py-3.5 bg-slate-50/50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:bg-white focus:ring-[6px] focus:ring-yellow-500/5 focus:border-yellow-500 outline-none transition-all appearance-none cursor-pointer"
                      >
                        <option value="">Tất cả</option>
                        <option value="male">Nam</option>
                        <option value="female">Nữ</option>
                        <option value="other">Khác</option>
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-40">
                         <ChevronRight className="w-4 h-4 rotate-90" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-8 border-t border-slate-50 flex items-center gap-4 pb-20 mt-auto bg-slate-50/30">
                <button 
                  onClick={() => {
                    setFilterRoom("");
                    setFilterStatus("");
                    setFilterResidency("");
                    setFilterGender("");
                  }}
                  className="flex-1 py-3.5 text-sm font-black text-slate-900 bg-white border border-slate-100 hover:bg-slate-50 hover:border-slate-200 rounded-2xl shadow-sm transition-all cursor-pointer active:scale-95"
                >
                  Đặt lại
                </button>
                <button 
                  onClick={() => setIsFilterOpen(false)}
                  className="flex-[1.5] py-3.5 bg-[#fcd34d] text-black text-sm font-black rounded-2xl shadow-[0_10px_20px_rgba(252,211,77,0.15)] hover:shadow-[0_15px_30px_rgba(252,211,77,0.25)] transition-all cursor-pointer active:scale-95"
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
};

export default CustomerPage;

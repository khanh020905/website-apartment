import { useState } from "react";
import { 
  Building2, 
  MapPin, 
  Plus, 
  Search, 
  ChevronLeft, 
  ChevronRight,
  Home,
  CheckCircle2,
  Eye,
  Edit3,
  Trash2,
  Download,
  Settings2,
  X,
  MoreHorizontal
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const LocationsPage = () => {
  const [search, setSearch] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [typeFilter, setTypeFilter] = useState("");

  const STATS = [
    { label: "Tổng toà nhà", value: 12, icon: Building2, color: "text-blue-500", bg: "bg-blue-50" },
    { label: "Tổng số phòng", value: 450, icon: Home, color: "text-emerald-500", bg: "bg-emerald-50" },
    { label: "Phòng trống", value: 68, icon: CheckCircle2, color: "text-amber-500", bg: "bg-amber-50" },
  ];

  const MOCK_DATA = [
     { id: "1", name: "Smartos Building A", address: "123 Lê Lợi, Quận 1, TP.HCM", type: "Căn hộ dịch vụ", totalUnits: 50, vacantUnits: 8, status: "active" },
     { id: "2", name: "Smartos Building B", address: "456 Nguyễn Huệ, Quận 1, TP.HCM", type: "Chung cư mini", totalUnits: 30, vacantUnits: 2, status: "active" },
     { id: "3", name: "Smartos Building C", address: "789 Đồng Khởi, Quận 1, TP.HCM", type: "Nhà phố", totalUnits: 15, vacantUnits: 5, status: "active" },
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f8f9fa] relative overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="px-6 py-4 flex items-center justify-between">
          <h1 className="text-[20px] font-bold text-slate-900 tracking-tight">Cơ sở kinh doanh</h1>
        </div>

        {/* Toolbar */}
        <div className="px-6 pb-4 flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-[320px] flex-shrink-0">
             <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
             <input 
               type="text" 
               placeholder="Tìm theo tên, địa chỉ toà nhà..." 
               value={search}
               onChange={(e) => setSearch(e.target.value)}
               className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-[13px] text-slate-700 bg-white focus:outline-none focus:border-amber-400 hover:border-slate-300 transition-all font-medium"
             />
          </div>

          <div className="w-full sm:w-44 flex-shrink-0">
             <select 
               value={typeFilter} 
               onChange={(e) => setTypeFilter(e.target.value)}
               className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 bg-white focus:outline-none focus:border-amber-400 hover:border-slate-300 transition-all cursor-pointer appearance-none font-medium text-[13px]"
             >
               <option value="">Tất cả loại hình</option>
               <option value="apartment">Căn hộ dịch vụ</option>
               <option value="mini">Chung cư mini</option>
               <option value="house">Nhà phố</option>
             </select>
          </div>

          <button 
            onClick={() => setIsFilterOpen(true)}
            className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg text-[13px] font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm cursor-pointer"
          >
            <Settings2 className="w-4 h-4" />
            Bộ lọc
          </button>

          <div className="flex items-center gap-2 ml-auto">
             <button className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 bg-white text-emerald-600 rounded-lg text-[13px] font-bold hover:bg-emerald-50 transition-colors shadow-sm cursor-pointer">
               <Download className="w-4 h-4" /> Xuất Excel
             </button>
             <button className="flex items-center gap-1.5 px-4 py-2 bg-amber-400 text-slate-900 rounded-lg text-[13px] font-bold transition-all hover:bg-amber-500 active:scale-[0.98] cursor-pointer">
               <Plus className="w-4 h-4 font-bold" /> Thêm toà nhà
             </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-[#f8f9fa] p-5 lg:p-6 flex flex-col gap-6">

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 shrink-0">
          {STATS.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 hover:shadow-md hover:border-slate-300 transition-all group cursor-pointer"
            >
              <div className={`w-12 h-12 ${stat.bg} rounded-xl flex items-center justify-center transition-transform group-hover:scale-110`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-0.5">{stat.value}</h3>
              </div>
            </motion.div>
          ))}
        </div>

        {/* List Table */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm h-full flex flex-col min-h-[400px]">
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left h-full">
              <thead className="bg-[#f8f9fa] border-b border-slate-200 sticky top-0">
                <tr>
                  {["Tên toà nhà", "Loại hình", "Tổng phòng", "Phòng trống", "Địa chỉ"].map((h, i) => (
                    <th key={i} className="px-5 py-3.5 text-[12px] font-bold text-slate-600 tracking-wide whitespace-nowrap">
                      {h} <span className="inline-block ml-1 opacity-50">↕</span>
                    </th>
                  ))}
                  <th className="px-5 py-3.5 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {MOCK_DATA.map((row) => (
                  <tr key={row.id} className="hover:bg-amber-50/20 transition-colors group">
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center text-slate-400">
                          <Building2 className="w-5 h-5" />
                        </div>
                        <span className="text-[13px] font-bold text-slate-900 group-hover:text-amber-600 transition-colors cursor-pointer">{row.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className="text-[13px] font-medium text-slate-600 px-2 py-1 bg-slate-50 rounded border border-slate-200">{row.type}</span>
                    </td>
                    <td className="px-5 py-4 text-[13px] font-bold text-slate-900 whitespace-nowrap">{row.totalUnits}</td>
                    <td className="px-5 py-4 whitespace-nowrap">
                       <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider border ${row.vacantUnits > 5 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                          {row.vacantUnits} Trống
                       </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2 text-[13px] text-slate-500 font-medium whitespace-nowrap">
                         <MapPin className="w-3.5 h-3.5" />
                         {row.address}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right whitespace-nowrap">
                       <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-1.5 hover:bg-white rounded-lg text-slate-400 hover:text-blue-600 transition-colors shadow-sm border border-transparent hover:border-slate-200">
                             <Eye className="w-4 h-4" />
                          </button>
                          <button className="p-1.5 hover:bg-white rounded-lg text-slate-400 hover:text-amber-600 transition-colors shadow-sm border border-transparent hover:border-slate-200">
                             <Edit3 className="w-4 h-4" />
                          </button>
                          <button className="p-1.5 hover:bg-white rounded-lg text-slate-400 hover:text-rose-600 transition-colors shadow-sm border border-transparent hover:border-slate-200">
                             <Trash2 className="w-4 h-4" />
                          </button>
                          <button className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-amber-600 transition-all border border-transparent">
                             <MoreHorizontal className="w-4 h-4" />
                          </button>
                       </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="mt-auto px-5 py-3 border-t border-slate-200 bg-white flex items-center justify-end gap-4 text-[13px] text-slate-600">
             <span>1-{MOCK_DATA.length}/{MOCK_DATA.length} kết quả</span>
             <div className="flex items-center gap-1">
               <button 
                 disabled
                 className="p-1 hover:bg-slate-100 rounded disabled:opacity-50 text-slate-400 transition-colors"
               >
                 <ChevronLeft className="w-4 h-4" />
               </button>
               <button 
                 disabled
                 className="p-1 hover:bg-slate-100 rounded disabled:opacity-50 text-slate-400 transition-colors"
               >
                 <ChevronRight className="w-4 h-4" />
               </button>
             </div>
             <select className="px-2 py-1 outline-none border border-slate-200 rounded cursor-pointer text-slate-600 bg-white hover:border-slate-300 appearance-none font-medium text-[13px]">
               <option>20 / trang</option>
               <option>50 / trang</option>
             </select>
          </div>
        </div>
      </div>

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
              className="absolute top-0 right-0 w-[400px] h-full bg-white shadow-2xl z-50 flex flex-col border-l border-slate-200"
            >
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
                <h2 className="text-lg font-bold text-slate-900">Bộ lọc nâng cao</h2>
                <button 
                  onClick={() => setIsFilterOpen(false)}
                  className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-6">
                 <div>
                   <h3 className="text-sm font-semibold text-slate-800 mb-3">Số lượng phòng trống</h3>
                   <div className="flex items-center gap-2">
                     <input type="number" placeholder="Từ" className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-[13px] text-slate-600 outline-none focus:border-amber-400 transition-colors" />
                     <span className="text-slate-400">-</span>
                     <input type="number" placeholder="Đến" className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-[13px] text-slate-600 outline-none focus:border-amber-400 transition-colors" />
                   </div>
                 </div>
              </div>

              {/* Slider Footer */}
              <div className="p-5 border-t border-slate-100 bg-white flex items-center justify-end gap-3 shrink-0">
                <button 
                  onClick={() => { setSearch(""); setTypeFilter(""); }}
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
};

export default LocationsPage;

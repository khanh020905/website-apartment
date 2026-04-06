import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  Plus, 
  ChevronLeft, 
  ChevronRight,
  Mail,
  Smartphone,
  Eye,
  Edit3,
  Trash2,
  Settings2,
  X,
  Settings,
  MoreHorizontal
} from "lucide-react";

const UsersPage = () => {
  const [search, setSearch] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [roleFilter, setRoleFilter] = useState("");

  const MOCK_USERS = [
     { id: "1", name: "Nguyễn Văn A", email: "vana@smartos.space", phone: "0901234567", role: "Quản trị viên", status: "active" },
     { id: "2", name: "Trần Thị B", email: "thib@smartos.space", phone: "0907654321", role: "Quản lý toà nhà", status: "active" },
     { id: "3", name: "Lê Công C", email: "congc@smartos.space", phone: "0901112222", role: "Nhân viên bảo trì", status: "inactive" },
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f8f9fa] relative overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="px-6 py-4 flex items-center justify-between">
          <h1 className="text-[20px] font-bold text-slate-900 tracking-tight">Nhân viên</h1>
        </div>
        
        {/* Toolbar */}
        <div className="px-6 pb-4 flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-[320px] flex-shrink-0">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm nhân viên theo tên, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-[13px] text-slate-700 bg-white focus:outline-none focus:border-amber-400 hover:border-slate-300 transition-all font-medium"
            />
          </div>

          <div className="w-full sm:w-44 flex-shrink-0">
             <select 
               value={roleFilter} 
               onChange={(e) => setRoleFilter(e.target.value)}
               className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 bg-white focus:outline-none focus:border-amber-400 hover:border-slate-300 transition-all cursor-pointer appearance-none font-medium text-[13px]"
             >
               <option value="">Tất cả vai trò</option>
               <option value="admin">Quản trị viên</option>
               <option value="manager">Quản lý toà nhà</option>
             </select>
          </div>

          <button 
            onClick={() => setIsFilterOpen(true)}
            className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg text-[13px] font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm cursor-pointer"
          >
            <Settings2 className="w-4 h-4" />
            Bộ lọc
          </button>

          <button className="flex items-center gap-1.5 px-4 py-2 bg-amber-400 text-slate-900 rounded-lg text-[13px] font-bold transition-colors hover:bg-amber-500 shadow-sm ml-auto cursor-pointer">
             <Plus className="w-4 h-4 font-bold" /> Thêm nhân viên
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto bg-[#f8f9fa] p-5 lg:p-6 flex flex-col gap-6">
        
        {/* Table Area */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm h-full flex flex-col min-h-[400px]">
          <div className="overflow-x-auto flex-1">
            <table className="w-full h-full text-left">
              <thead className="bg-[#f8f9fa] border-b border-slate-200 sticky top-0 z-10">
                <tr>
                  {["Họ và tên", "Liên hệ", "Vai trò", "Trạng thái"].map((h, i) => (
                    <th key={i} className="px-5 py-3.5 text-[12px] font-bold text-slate-600 tracking-wide whitespace-nowrap">
                      {h} <span className="inline-block ml-1 opacity-50">↕</span>
                    </th>
                  ))}
                  <th className="px-5 py-3.5 w-10 text-center">
                    <Settings className="w-4 h-4 text-slate-400 inline-block" />
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {MOCK_USERS.map((user) => (
                  <tr key={user.id} className="hover:bg-amber-50/20 transition-colors group">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 border border-slate-200 font-bold uppercase overflow-hidden text-[13px]">
                          {user.name[0]}
                        </div>
                        <span className="text-[13px] font-bold text-slate-900">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="space-y-1">
                         <div className="flex items-center gap-2 text-[13px] text-slate-600 font-medium">
                            <Mail className="w-3.5 h-3.5 text-slate-400" />
                            {user.email}
                         </div>
                         <div className="flex items-center gap-2 text-[12px] text-slate-500 font-medium">
                            <Smartphone className="w-3.5 h-3.5 text-slate-400" />
                            {user.phone}
                         </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className="text-[12px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-1 rounded-md">
                         {user.role}
                      </span>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                       <span className={`inline-flex px-2 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider border ${user.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                          {user.status === 'active' ? 'Hoạt động' : 'Đã khoá'}
                       </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                       <button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-amber-600 transition-all">
                          <MoreHorizontal className="w-4 h-4" />
                       </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination Footer */}
          <div className="mt-auto px-5 py-3 border-t border-slate-200 bg-white flex items-center justify-end gap-4 text-[13px] text-slate-600">
             <span>1-{MOCK_USERS.length}/{MOCK_USERS.length}</span>
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
                   <h3 className="text-sm font-semibold text-slate-800 mb-3">Ngày tạo</h3>
                   <div className="flex items-center gap-2">
                     <input type="date" className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-[13px] text-slate-600 outline-none focus:border-amber-400 transition-colors" />
                     <span className="text-slate-400">-</span>
                     <input type="date" className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-[13px] text-slate-600 outline-none focus:border-amber-400 transition-colors" />
                   </div>
                 </div>
              </div>

              {/* Slider Footer */}
              <div className="p-5 border-t border-slate-100 bg-white flex items-center justify-end gap-3 shrink-0">
                <button 
                  onClick={() => { setSearch(""); setRoleFilter(""); }}
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

export default UsersPage;

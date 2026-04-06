import { useState } from "react";
import { 
  ShieldCheck, 
  Plus, 
  Search, 
  ChevronLeft, 
  ChevronRight,
  Users,
  Settings,
  Edit3,
  Trash2,
  Lock,
  Download,
  Settings2,
  X,
  MoreHorizontal
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const RolesPage = () => {
  const [search, setSearch] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [roleType, setRoleType] = useState("");

  const MOCK_ROLES = [
     { id: "1", name: "Quản trị viên", usersCount: 2, description: "Toàn quyền truy cập và cấu hình hệ thống", type: "system" },
     { id: "2", name: "Quản lý toà nhà", usersCount: 5, description: "Quản lý vận hành, khách hàng, hoá đơn của toà nhà được gán", type: "custom" },
     { id: "3", name: "Nhân viên bảo trì", usersCount: 3, description: "Chỉ truy cập mục sự cố và bảo trì", type: "custom" },
     { id: "4", name: "Khách hàng", usersCount: 120, description: "Truy cập ứng dụng dành cho cư dân", type: "system" },
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f8f9fa] relative overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="px-6 py-4 flex items-center justify-between">
          <h1 className="text-[20px] font-bold text-slate-900 tracking-tight">Vai trò & Phân quyền</h1>
        </div>
        
        {/* Toolbar */}
        <div className="px-6 pb-4 flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-[320px] flex-shrink-0">
             <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
             <input 
               type="text" 
               placeholder="Tìm kiếm vai trò..." 
               value={search}
               onChange={(e) => setSearch(e.target.value)}
               className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-[13px] text-slate-700 bg-white focus:outline-none focus:border-amber-400 hover:border-slate-300 transition-all font-medium"
             />
          </div>

          <div className="w-full sm:w-44 flex-shrink-0">
             <select 
               value={roleType} 
               onChange={(e) => setRoleType(e.target.value)}
               className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 bg-white focus:outline-none focus:border-amber-400 hover:border-slate-300 transition-all cursor-pointer appearance-none font-medium text-[13px]"
             >
               <option value="">Tất cả loại hình</option>
               <option value="system">Mặc định</option>
               <option value="custom">Tùy chỉnh</option>
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
             <Plus className="w-4 h-4 font-bold" /> Thêm vai trò
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-[#f8f9fa] p-5 lg:p-6 flex flex-col gap-6">
        {/* Table Area */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm h-full flex flex-col min-h-[400px]">
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left h-full">
              <thead className="bg-[#f8f9fa] border-b border-slate-200 sticky top-0">
                <tr>
                  {["Tên vai trò", "Mô tả", "Nhân viên", "Loại"].map((h, i) => (
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
                {MOCK_ROLES.map((role) => (
                  <tr key={role.id} className="hover:bg-amber-50/20 transition-colors group">
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 ${role.type === 'system' ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' : 'bg-slate-50 text-slate-500 border border-slate-200'} rounded-lg flex items-center justify-center shadow-sm`}>
                          <ShieldCheck className="w-5 h-5" />
                        </div>
                        <span className="text-[13px] font-bold text-slate-900">{role.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-[13px] text-slate-500 font-medium line-clamp-2 max-w-[350px]">
                         {role.description}
                      </span>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                         <Users className="w-4 h-4 text-slate-400" />
                         <span className="text-[13px] font-bold text-slate-700">{role.usersCount}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                       <span className={`inline-flex px-2 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider border ${role.type === 'system' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                          {role.type === 'system' ? 'Mặc định' : 'Tùy chỉnh'}
                       </span>
                    </td>
                    <td className="px-5 py-4 text-right whitespace-nowrap">
                       <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-1.5 hover:bg-white rounded-lg text-slate-400 hover:text-indigo-600 transition-colors shadow-sm border border-transparent hover:border-slate-200">
                             <Settings className="w-4 h-4" />
                          </button>
                          <button className="p-1.5 hover:bg-white rounded-lg text-slate-400 hover:text-amber-600 transition-colors shadow-sm border border-transparent hover:border-slate-200">
                             <Edit3 className="w-4 h-4" />
                          </button>
                          {role.type === 'custom' ? (
                            <button className="p-1.5 hover:bg-white rounded-lg text-slate-400 hover:text-rose-600 transition-colors shadow-sm border border-transparent hover:border-slate-200">
                               <Trash2 className="w-4 h-4" />
                            </button>
                          ) : (
                            <div className="p-1.5 text-slate-300">
                               <Lock className="w-4 h-4" />
                            </div>
                          )}
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
             <span>1-{MOCK_ROLES.length}/{MOCK_ROLES.length} kết quả</span>
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
                  onClick={() => { setSearch(""); setRoleType(""); }}
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

export default RolesPage;

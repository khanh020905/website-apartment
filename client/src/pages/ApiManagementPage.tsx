import { useState } from "react";
import { 
  Key, 
  Plus, 
  Search, 
  Copy, 
  RefreshCcw, 
  Trash2, 
  Clock,
  Eye,
  EyeOff,
  Terminal,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  Settings2,
  X,
  MoreHorizontal
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ApiManagementPage = () => {
  const [search, setSearch] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [showSecret, setShowSecret] = useState<Record<string, boolean>>({});

  const MOCK_TOKENS = [
     { id: "1", name: "Mobile App Production", secret: "sk_live_51M0..." , created_at: "2024-04-06", expires_at: "2324-04-06", status: "active" },
     { id: "2", name: "Internal ERP Connector", secret: "sk_live_72N..." , created_at: "2024-03-15", expires_at: "2024-09-15", status: "expiring" },
     { id: "3", name: "Website Webhook", secret: "sk_live_99P..." , created_at: "2023-12-01", expires_at: "2024-12-01", status: "active" },
  ];

  const toggleShow = (id: string) => {
    setShowSecret(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f8f9fa] relative overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="px-6 py-4 flex items-center justify-between">
          <h1 className="text-[20px] font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Terminal className="w-5 h-5 text-amber-500" />
            Quản lý API Access
          </h1>
        </div>

        {/* Toolbar */}
        <div className="px-6 pb-4 flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-[320px] flex-shrink-0">
             <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
             <input 
               type="text" 
               placeholder="Tìm token theo tên..." 
               value={search}
               onChange={(e) => setSearch(e.target.value)}
               className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-[13px] text-slate-700 bg-white focus:outline-none focus:border-amber-400 hover:border-slate-300 transition-all font-medium"
             />
          </div>

          <div className="w-full sm:w-44 flex-shrink-0">
             <select 
               value={statusFilter} 
               onChange={(e) => setStatusFilter(e.target.value)}
               className="w-full px-3 py-2 border border-slate-200 rounded-lg text-[13px] text-slate-600 bg-white focus:outline-none focus:border-amber-400 hover:border-slate-300 transition-all cursor-pointer appearance-none font-medium"
             >
               <option value="">Tất cả trạng thái</option>
               <option value="active">Đang chạy</option>
               <option value="expiring">Sắp hết hạn</option>
             </select>
          </div>

          <button 
            onClick={() => setIsFilterOpen(true)}
            className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg text-[13px] font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm cursor-pointer"
          >
            <Settings2 className="w-4 h-4" />
            Bộ lọc
          </button>

          <button className="flex items-center gap-1.5 px-4 py-2 bg-amber-400 text-slate-900 rounded-lg text-[13px] font-bold transition-all hover:bg-amber-500 active:scale-[0.98] shadow-sm cursor-pointer ml-auto">
            <Plus className="w-4 h-4 font-bold" />
            Tạo API Token
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-[#f8f9fa] p-5 lg:p-6 flex flex-col gap-6">

        {/* Warning Alert */}
        <div className="flex items-center gap-3 bg-amber-50 p-4 rounded-xl border border-amber-100 shrink-0">
           <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0" />
           <p className="text-[13px] text-amber-800 leading-relaxed font-medium">
              Lưu ý quan trọng: Hệ thống không lưu trữ API Secret Code của bạn sau khi khởi tạo. Không bao giờ chia sẻ API Secret của bạn với bất kỳ ai để đảm bảo an toàn.
           </p>
        </div>

        {/* Table Area */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm h-full flex flex-col min-h-[400px]">
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left h-full">
              <thead className="bg-[#f8f9fa] border-b border-slate-200 sticky top-0 z-10">
                <tr>
                  {["Ứng dụng", "API Key / Token", "Ngày tạo", "Hết hạn", "Trạng thái"].map((h, i) => (
                    <th key={i} className="px-5 py-3.5 text-[12px] font-bold text-slate-600 tracking-wide whitespace-nowrap">
                      {h} <span className="inline-block ml-1 opacity-50">↕</span>
                    </th>
                  ))}
                  <th className="px-5 py-3.5 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {MOCK_TOKENS.map((token) => (
                  <tr key={token.id} className="hover:bg-amber-50/20 transition-colors group">
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-slate-50 border border-slate-200 shadow-sm rounded-lg flex items-center justify-center text-slate-600 group-hover:bg-amber-100 group-hover:text-amber-600 transition-colors">
                          <Key className="w-4 h-4" />
                        </div>
                        <span className="text-[13px] font-bold text-slate-900 group-hover:text-amber-600 transition-colors cursor-pointer">{token.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 font-mono text-[13px] bg-slate-50 px-3 py-1.5 rounded border border-slate-200 text-slate-600 w-fit">
                         <span>{showSecret[token.id] ? token.secret : "••••••••••••••••••••"}</span>
                         <button onClick={() => toggleShow(token.id)} className="p-1 hover:bg-white border border-transparent hover:border-slate-200 shadow-sm rounded shadow-black/5 text-slate-400 hover:text-blue-600 transition-all cursor-pointer">
                            {showSecret[token.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                         </button>
                         <button className="p-1 hover:bg-white border border-transparent hover:border-slate-200 shadow-sm rounded shadow-black/5 text-slate-400 hover:text-emerald-600 transition-all cursor-pointer">
                            <Copy className="w-3.5 h-3.5" />
                         </button>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-[13px] font-medium text-slate-500 whitespace-nowrap">{token.created_at}</td>
                    <td className="px-5 py-4 text-[13px] font-medium text-slate-500 whitespace-nowrap">{token.expires_at}</td>
                    <td className="px-5 py-4 whitespace-nowrap">
                       <span className={`inline-flex px-2 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider border ${
                          token.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'
                       }`}>
                          {token.status === 'active' ? 'Đang chạy' : 'Sắp hết hạn'}
                       </span>
                    </td>
                    <td className="px-5 py-4 text-right whitespace-nowrap">
                       <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-1.5 hover:bg-white rounded-lg text-slate-400 hover:text-amber-600 transition-colors shadow-sm border border-transparent hover:border-slate-200 cursor-pointer">
                             <RefreshCcw className="w-4 h-4" />
                          </button>
                          <button className="p-1.5 hover:bg-white rounded-lg text-slate-400 hover:text-rose-600 transition-colors shadow-sm border border-transparent hover:border-slate-200 cursor-pointer">
                             <Trash2 className="w-4 h-4" />
                          </button>
                          <button className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-amber-600 transition-all border border-transparent cursor-pointer">
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
          <div className="mt-auto px-5 py-3 border-t border-slate-200 bg-white flex flex-col sm:flex-row items-center justify-between gap-4 text-[13px] text-slate-600 shrink-0">
             <div className="flex items-center gap-2 text-[12px] font-bold text-slate-500 whitespace-nowrap">
                <Clock className="w-4 h-4" />
                Lịch sử truy cập API gần nhất: <span className="text-slate-900 uppercase">Vừa xong (12:05 PM)</span>
             </div>
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
                   <h3 className="text-sm font-semibold text-slate-800 mb-3">Ngày tạo token</h3>
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
                  onClick={() => { setSearch(""); setStatusFilter(""); }}
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

export default ApiManagementPage;

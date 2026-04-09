import { useState } from "react";
import { Search, Plus, Filter, X, Camera, Mail, Edit2, Trash2 } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

export default function UsersPage() {
  const location = useLocation();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const TABS = [
    { id: 'users', label: 'Người dùng', path: '/users' },
    { id: 'roles', label: 'Vai trò', path: '/roles' },
  ];

  const USERS = [
    { id: 1, name: "Nguyễn Admin", email: "admin@homespot.com", phone: "0901234567", role: "Quản lý cấp cao", buildings: "Tất cả toà nhà", status: "active", avatar: "" },
    { id: 2, name: "Trần Nhân Viên", email: "staff@homespot.com", phone: "0912345678", role: "Nhân viên Sale", buildings: "Sunrise Apartment", status: "active", avatar: "" },
    { id: 3, name: "Lê Kế Toán", email: "ketoan@homespot.com", phone: "0923456789", role: "Kế toán", buildings: "Central - Toà nhà B", status: "locked", avatar: "" },
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f0f2f5] relative overflow-hidden font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Header Shared */}
      <div className="bg-white border-b border-slate-200">
        <div className="px-6 py-4 flex items-center justify-between">
          <h1 className="text-[18px] font-black text-slate-900 tracking-tight">Người dùng và vai trò</h1>
        </div>
        <div className="px-6 flex items-center justify-between border-t border-slate-100 pt-3 shadow-sm">
          <div className="flex gap-10 overflow-x-auto scrollbar-hide">
             {TABS.map(tab => (
               <Link 
                 key={tab.id}
                 to={tab.path}
                 className={`text-[15px] font-black pb-3 border-b-2 whitespace-nowrap transition-colors outline-none px-1 ${
                   location.pathname === tab.path ? 'text-brand-primary border-brand-primary' : 'text-slate-400 border-transparent hover:text-slate-600'
                 }`}
               >
                 {tab.label}
               </Link>
             ))}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto p-6 space-y-4">
        
        {/* Filters Top Bar */}
        <div className="flex flex-wrap items-center gap-3">
           <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input type="text" placeholder="Tên" className="w-full pl-10 pr-4 h-10 bg-white border border-slate-200 rounded-lg text-[13px] font-bold text-slate-700 outline-none focus:border-brand-primary shadow-sm" />
           </div>
           <input type="text" placeholder="Email" className="w-[180px] px-3 h-10 bg-white border border-slate-200 rounded-lg text-[13px] font-bold text-slate-700 outline-none focus:border-brand-primary shadow-sm" />
           
           <div className="w-[180px] relative group">
              <select className="w-full pl-3 pr-8 h-10 bg-white border border-slate-200 rounded-lg text-[13px] font-bold text-slate-700 outline-none appearance-none focus:border-brand-primary shadow-sm cursor-pointer">
                 <option>Vai trò</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
           </div>

           <div className="w-[140px] relative group">
              <select className="w-full pl-3 pr-8 h-10 bg-white border border-slate-200 rounded-lg text-[13px] font-bold text-slate-700 outline-none appearance-none focus:border-brand-primary shadow-sm cursor-pointer">
                 <option>Đã khoá</option>
                 <option>Có</option>
                 <option>Không</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
           </div>

           <button className="h-10 px-5 bg-brand-primary text-white rounded-lg text-[13px] font-black hover:bg-brand-dark transition-colors shadow-sm cursor-pointer flex items-center gap-2">
              <Filter className="w-4 h-4" /> Lọc
           </button>
           <button className="h-10 px-5 bg-white border border-slate-200 text-slate-600 rounded-lg text-[13px] font-black hover:bg-slate-50 transition-colors shadow-sm cursor-pointer">Xoá</button>
           
           <button 
             onClick={() => setIsDrawerOpen(true)}
             className="h-10 px-5 bg-brand-primary text-white rounded-lg text-[13px] font-black hover:bg-brand-dark transition-colors shadow-sm ml-auto flex items-center gap-1.5 cursor-pointer"
           >
              <Plus className="w-4.5 h-4.5" strokeWidth={3} /> Tạo
           </button>
        </div>

        {/* Users Table */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
           <div className="overflow-x-auto">
              <table className="w-full text-left">
                 <thead>
                    <tr className="bg-[#EDEDED]">
                       {["Tên", "Email", "Số điện thoại", "Vai trò", "Toà nhà", "Đã khoá", "Hành động"].map((h, i) => (
                          <th key={i} className="px-5 py-3 text-[11px] font-black text-slate-700 uppercase tracking-wider border-r border-white last:border-0">{h}</th>
                       ))}
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                    {USERS.map((user) => (
                       <tr key={user.id} className="hover:bg-brand-bg/10 transition-colors group">
                          <td className="px-5 py-3 flex items-center gap-3">
                             <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200">
                                <span className="text-[12px] font-bold">{user.name.charAt(0)}</span>
                             </div>
                             <span className="text-[13px] font-bold text-slate-900">{user.name}</span>
                          </td>
                          <td className="px-5 py-3 text-[13px] font-medium text-slate-600">{user.email}</td>
                          <td className="px-5 py-3 text-[13px] font-medium text-slate-600">{user.phone}</td>
                          <td className="px-5 py-3 text-[13px] font-bold text-slate-700">{user.role}</td>
                          <td className="px-5 py-3 text-[13px] font-medium text-slate-600">{user.buildings}</td>
                          <td className="px-5 py-3">
                             <div className={`w-10 h-5 rounded-full relative transition-colors cursor-pointer ${user.status === 'locked' ? 'bg-brand-primary' : 'bg-slate-200'}`}>
                                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all shadow-sm ${user.status === 'locked' ? 'right-0.5' : 'left-0.5'}`}></div>
                             </div>
                          </td>
                          <td className="px-5 py-3">
                             <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button className="p-1.5 hover:bg-slate-100 rounded text-blue-500"><Mail className="w-4 h-4" /></button>
                                <button className="p-1.5 hover:bg-slate-100 rounded text-slate-500"><Edit2 className="w-4 h-4" /></button>
                                <button className="p-1.5 hover:bg-slate-100 rounded text-rose-500"><Trash2 className="w-4 h-4" /></button>
                             </div>
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
           
           {/* Pagination */}
           <div className="px-5 py-3 bg-[#fefefe] border-t border-slate-50 flex items-center justify-between">
              <div className="text-[12px] font-bold text-slate-400 italic">Tổng số: {USERS.length}</div>
              <div className="flex items-center gap-1">
                 <button className="w-8 h-8 flex items-center justify-center rounded border border-slate-200 text-slate-300">⟨</button>
                 <button className="w-8 h-8 flex items-center justify-center rounded bg-brand-primary text-white text-[13px] font-bold">1</button>
                 <button className="w-8 h-8 flex items-center justify-center rounded border border-slate-200 text-slate-300">⟩</button>
              </div>
           </div>
        </div>
      </div>

      {/* Right Drawer 1:1 Parity */}
      <AnimatePresence>
         {isDrawerOpen && (
            <>
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsDrawerOpen(false)} className="absolute inset-0 bg-slate-900/30 backdrop-blur-[1px] z-40 transition-opacity" />
               <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 30, stiffness: 300 }} className="absolute top-0 right-0 w-full max-w-[480px] h-full bg-white shadow-2xl z-50 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
                  <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
                     <h2 className="text-[16px] font-black text-slate-900 uppercase">Thêm người dùng</h2>
                     <button onClick={() => setIsDrawerOpen(false)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors"><X className="w-5 h-5" /></button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-6 space-y-6 pb-24">
                     <div className="flex flex-col items-center gap-3">
                        <div className="w-24 h-24 rounded-full bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center relative cursor-pointer hover:bg-slate-100 transition-colors">
                           <Camera className="w-8 h-8 text-slate-300" />
                           <div className="absolute bottom-0 right-0 bg-white p-1.5 rounded-full shadow-lg border border-slate-100 text-brand-primary"><Plus className="w-3.5 h-3.5 font-black" /></div>
                        </div>
                        <span className="text-[12px] font-black text-slate-400 uppercase tracking-widest">Ảnh đại diện</span>
                     </div>

                     <div className="grid grid-cols-1 gap-5">
                        <div className="space-y-1.5">
                           <label className="text-[13px] font-black text-slate-700 uppercase flex items-center gap-1">Vai trò <span className="text-rose-500 text-lg leading-none">*</span></label>
                           <select className="w-full px-4 h-11 border border-slate-200 rounded-lg text-sm font-bold text-slate-800 focus:border-brand-primary outline-none appearance-none bg-white">
                              <option>Chọn vai trò</option>
                           </select>
                        </div>
                        <div className="space-y-1.5">
                           <label className="text-[13px] font-black text-slate-700 uppercase">Tên đầy đủ</label>
                           <input type="text" placeholder="Nhập tên đầy đủ" className="w-full px-4 h-11 border border-slate-200 rounded-lg text-sm font-bold text-slate-800 focus:border-brand-primary outline-none" />
                        </div>
                        <div className="space-y-1.5">
                           <label className="text-[13px] font-black text-slate-700 uppercase">Email</label>
                           <input type="email" placeholder="Nhập email" className="w-full px-4 h-11 border border-slate-200 rounded-lg text-sm font-bold text-slate-800 focus:border-brand-primary outline-none" />
                        </div>
                        <div className="space-y-1.5">
                           <label className="text-[13px] font-black text-slate-700 uppercase">Số điện thoại</label>
                           <input type="text" placeholder="Nhập số điện thoại" className="w-full px-4 h-11 border border-slate-200 rounded-lg text-sm font-bold text-slate-800 focus:border-brand-primary outline-none" />
                        </div>
                        <div className="space-y-1.5">
                           <label className="text-[13px] font-black text-slate-700 uppercase">Toà nhà</label>
                           <select className="w-full px-4 h-11 border border-slate-200 rounded-lg text-sm font-bold text-slate-800 focus:border-brand-primary outline-none appearance-none bg-white">
                              <option>Chọn tòa nhà</option>
                           </select>
                        </div>
                     </div>
                  </div>

                  <div className="absolute bottom-0 left-0 w-full p-5 border-t border-slate-50 bg-white flex items-center justify-end gap-3 shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
                     <button onClick={() => setIsDrawerOpen(false)} className="px-6 h-11 text-sm font-black text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-lg transition-all">Huỷ</button>
                     <button className="px-8 h-11 text-sm font-black bg-brand-primary text-white rounded-lg shadow-md hover:bg-brand-dark hover:shadow-lg transition-all">Xác nhận</button>
                  </div>
               </motion.div>
            </>
         )}
      </AnimatePresence>

    </div>
  );
}

const ChevronDown = ({className}: {className?: string}) => (
  <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
);

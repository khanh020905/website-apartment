import React, { useState } from "react";
import { Search, Plus, X, Check, ChevronDown } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

export default function RolesPage() {
  const location = useLocation();
  const [expandedModules, setExpandedModules] = useState<string[]>(["Customer", "Reservation", "Invoice", "Transaction", "Contract", "Enquiry", "Incident"]);

  const TABS = [
    { id: 'users', label: 'Người dùng', path: '/users' },
    { id: 'roles', label: 'Vai trò', path: '/roles' },
  ];

  const ROLES = [
     { id: 'admin', name: 'Quản lý Cấp Cao', users: 1 },
     { id: 'b_manager', name: 'Quản lý Tòa Nhà', users: 2 },
     { id: 'cskh', name: 'Nhân Viên CSKH', users: 3 },
     { id: 'sale', name: 'Nhân Viên Kinh Doanh', users: 8 },
     { id: 'maint', name: 'Bảo Trì', users: 2 },
     { id: 'acc', name: 'Kế Toán', users: 1 },
     { id: 'owner', name: 'Owner', users: 5 },
  ];

  const MODULES = [
    {
      id: "Customer", label: "Khách hàng", 
      perms: [
        { key: "cust_e", label: "Chỉnh sửa khách hàng" },
        { key: "cust_d", label: "Xóa khách hàng" }
      ]
    },
    {
      id: "Reservation", label: "Đặt phòng",
      perms: [
        { key: "res_v", label: "Xem đặt phòng" },
        { key: "res_c", label: "Tạo đặt phòng" },
        { key: "res_e", label: "Chỉnh sửa đặt phòng" },
        { key: "res_d", label: "Xóa đặt phòng" },
        { key: "res_app", label: "Phê duyệt & từ chối yêu cầu xóa đặt phòng" }
      ]
    },
    {
      id: "Invoice", label: "Hóa đơn",
      perms: [
        { key: "inv_v", label: "Xem hóa đơn" },
        { key: "inv_c", label: "Tạo hóa đơn" }
      ]
    },
    {
      id: "Transaction", label: "Giao dịch",
      perms: [
        { key: "tx_v", label: "Xem giao dịch" },
        { key: "tx_c", label: "Tạo giao dịch" },
        { key: "tx_e", label: "Chỉnh sửa giao dịch" },
        { key: "tx_d", label: "Xóa giao dịch" },
        { key: "tx_app", label: "Phê duyệt & từ chối yêu cầu xóa giao dịch" }
      ]
    },
    {
      id: "Contract", label: "Hợp đồng",
      perms: [
        { key: "con_v", label: "Xem hợp đồng" },
        { key: "con_c", label: "Tạo hợp đồng" },
        { key: "con_e", label: "Chỉnh sửa hợp đồng" },
        { key: "con_d", label: "Xóa hợp đồng" }
      ]
    },
    {
      id: "Enquiry", label: "Yêu cầu",
      perms: [
        { key: "enq_v", label: "Xem yêu cầu" },
        { key: "enq_chat", label: "Chat" }
      ]
    },
    {
       id: "Incident", label: "SỰ CỐ (INCIDENT)",
       perms: [
          { key: "inc_v", label: "Xem sự cố" },
          { key: "inc_c", label: "Tạo sự cố" },
          { key: "inc_e", label: "Sửa sự cố" },
          { key: "inc_d", label: "Xoá sự cố" }
       ]
    },
    {
       id: "Blog", label: "BLOG",
       perms: [
          { key: "blg_v", label: "Xem blog" },
          { key: "blg_c", label: "Tạo blog" },
          { key: "blg_e", label: "Sửa blog" },
          { key: "blg_d", label: "Xoá blog" }
       ]
    },
    {
       id: "Post", label: "Bài đăng (Post)",
       perms: [
          { key: "pst_v", label: "Xem bài đăng" },
          { key: "pst_c", label: "Tạo bài đăng" },
          { key: "pst_e", label: "Chỉnh sửa bài viết" },
          { key: "pst_d", label: "Xóa bài đăng" }
       ]
    },
    {
       id: "Event", label: "Sự kiện (Event)",
       perms: [
          { key: "evt_v", label: "Xem sự kiện" },
          { key: "evt_c", label: "Tạo sự kiện" },
          { key: "evt_e", label: "Chỉnh sửa sự kiện" },
          { key: "evt_d", label: "Xóa sự kiện" }
       ]
    },
    {
       id: "Business", label: "Doanh nghiệp (Business)",
       perms: [
          { key: "biz_v", label: "Xem thông tin doanh nghiệp" },
          { key: "biz_e", label: "Chỉnh sửa thông tin doanh nghiệp" }
       ]
    },
    {
       id: "Location", label: "Vị trí (Location)",
       perms: [
          { key: "loc_v", label: "Xem vị trí" },
          { key: "loc_c", label: "Tạo vị trí mới" },
          { key: "loc_e", label: "Chỉnh sửa vị trí" }
       ]
    },
    {
       id: "Room", label: "Phòng (Room)",
       perms: [
          { key: "rom_v", label: "Xem phòng" },
          { key: "rom_c", label: "Tạo phòng" },
          { key: "rom_e", label: "Chỉnh sửa phòng" }
       ]
    },
    {
       id: "BusinessUser", label: "Người dùng hệ thống",
       perms: [
          { key: "user_v", label: "Xem người dùng" },
          { key: "user_e", label: "Chỉnh sửa người dùng" }
       ]
    },
    {
       id: "Role", label: "Vai trò (Role)",
       perms: [
          { key: "role_v", label: "Xem vai trò người dùng" }
       ]
    },
    {
       id: "VisitTour", label: "VisitTour",
       perms: [
          { key: "vst_v", label: "Xem lịch xem phòng" },
          { key: "vst_c", label: "Tạo lịch xem phòng" },
          { key: "vst_e", label: "Chỉnh sửa lịch xem phòng" },
          { key: "vst_d", label: "Xóa lịch xem phòng" }
       ]
    }
  ];

  const toggleModule = (id: string) => {
    setExpandedModules(prev => prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]);
  };

  const renderCheck = (hasPerm: boolean) => 
     hasPerm 
     ? <div className="w-5 h-5 bg-amber-400 rounded-md flex items-center justify-center text-white mx-auto shadow-sm"><Check className="w-3.5 h-3.5 stroke-[4px]" /></div> 
     : <div className="w-5 h-5 border-2 border-slate-200 rounded-md mx-auto hover:border-amber-200 transition-colors"></div>;

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f0f2f5] relative overflow-hidden font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Header Shared Parity */}
      <div className="bg-white border-b border-slate-200">
        <div className="px-6 py-4 flex items-center justify-between">
          <h1 className="text-[18px] font-black text-slate-900 tracking-tight">Người dùng và vai trò</h1>
        </div>
        <div className="px-6 flex items-center justify-between border-t border-slate-100 pt-3 shadow-sm bg-white">
          <div className="flex gap-10 overflow-x-auto scrollbar-hide">
             {TABS.map(tab => (
               <Link 
                 key={tab.id}
                 to={tab.path}
                 className={`text-[15px] font-black pb-3 border-b-2 whitespace-nowrap transition-colors outline-none px-1 ${
                   location.pathname === tab.path ? 'text-amber-500 border-amber-500' : 'text-slate-400 border-transparent hover:text-slate-600'
                 }`}
               >
                 {tab.label}
               </Link>
             ))}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6 space-y-4">
        
        {/* Search & Actions Bar */}
        <div className="flex items-center justify-between gap-4">
           <div className="relative w-[320px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input type="text" placeholder="Tìm kiếm vai trò" className="w-full pl-10 pr-4 h-11 bg-white border border-slate-200 rounded-lg text-[13px] font-bold text-slate-700 outline-none focus:border-amber-400 shadow-sm" />
           </div>
           
           <div className="flex items-center gap-3">
              <button className="h-11 px-6 bg-white border border-slate-200 text-slate-600 rounded-lg text-[13px] font-black hover:bg-slate-50 transition-all shadow-sm">Thiết lập trạng thái</button>
              <button className="h-11 px-6 bg-amber-400 text-slate-900 rounded-lg text-[13px] font-black hover:bg-amber-500 transition-all shadow-sm flex items-center gap-2">
                 <Plus className="w-4 h-4" strokeWidth={3} /> Thêm vai trò
              </button>
           </div>
        </div>

        {/* Permissions Matrix - 100% PARITY */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col min-h-[600px] overflow-hidden">
          
          <div className="overflow-x-auto overflow-y-hidden">
            <table className="w-full text-left border-collapse table-fixed">
              <thead className="bg-[#EDEDED] shadow-sm">
                <tr>
                  <th className="px-5 py-4 w-[280px] border-r border-white bg-[#EDEDED]">
                     <span className="text-[11px] font-black text-slate-700 uppercase tracking-widest whitespace-nowrap">Quyền hạn \ Vai trò</span>
                  </th>
                  {ROLES.map(role => (
                     <th key={role.id} className="px-5 py-4 border-r border-white min-w-[140px] align-top bg-[#EDEDED] last:border-r-0">
                        <div className="flex flex-col gap-0.5 text-center">
                           <span className="text-[13px] font-black text-slate-900 uppercase whitespace-nowrap">{role.name}</span>
                           <span className="text-[11px] font-black text-slate-400 italic">({role.users} người dùng)</span>
                        </div>
                     </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                 {MODULES.map((mod, gIdx) => (
                    <React.Fragment key={mod.id}>
                       {/* Module Group Header */}
                       <tr className="bg-slate-50/80 group">
                          <td className="px-5 py-2.5 border-r border-slate-100 flex items-center gap-2 cursor-pointer" onClick={() => toggleModule(mod.id)}>
                             <div className={`w-5 h-5 flex items-center justify-center rounded text-white transition-all ${expandedModules.includes(mod.id) ? 'bg-amber-500' : 'bg-slate-300'}`}>
                                {expandedModules.includes(mod.id) ? <span className="text-sm font-bold">−</span> : <Plus className="w-3 h-3" />}
                             </div>
                             <span className="text-[14px] font-black text-slate-900 uppercase tracking-tight">{mod.label}</span>
                          </td>
                          {ROLES.map(role => <td key={role.id} className="px-5 py-2.5 border-r border-slate-50/50 last:border-r-0"></td>)}
                       </tr>
                       
                       {/* Detailed Permission Row Items */}
                       <AnimatePresence>
                          {expandedModules.includes(mod.id) && mod.perms.map((perm) => (
                             <motion.tr 
                                key={perm.key} 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="hover:bg-amber-50/10 transition-colors group"
                             >
                                <td className="px-5 py-3 border-r border-slate-50 bg-white pl-12 relative group-hover:bg-slate-50 overflow-hidden">
                                   <span className="text-[13px] font-bold text-slate-700 whitespace-nowrap">{perm.label}</span>
                                   <div className="absolute left-8 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-slate-200 rounded-full group-hover:bg-amber-400 transition-colors"></div>
                                </td>
                                
                                {ROLES.map(role => {
                                   let hasPerm = false;
                                   if (role.id === 'admin') hasPerm = true;
                                   if (role.id === 'owner') hasPerm = true;
                                   if (role.id === 'acc' && (perm.key.includes('inv') || perm.key.includes('tx'))) hasPerm = true;
                                   if (role.id === 'sale' && (perm.key.includes('enq') || perm.key.includes('res'))) hasPerm = true;
                                   if (role.id === 'cskh' && (perm.key.includes('cust') || perm.key.includes('enq'))) hasPerm = true;

                                   return (
                                      <td key={`${perm.key}-${role.id}`} className="px-5 py-3 border-r border-slate-50 text-center bg-white cursor-pointer hover:bg-slate-50 transition-colors group-hover:bg-amber-50/5 last:border-r-0">
                                         {renderCheck(hasPerm)}
                                      </td>
                                   )
                                })}
                             </motion.tr>
                          ))}
                       </AnimatePresence>
                    </React.Fragment>
                 ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          <div className="px-6 py-4 bg-[#fefefe] border-t border-slate-100 flex items-center justify-end">
             <div className="flex items-center gap-1.5">
                <button className="w-10 h-10 flex items-center justify-center rounded border border-slate-200 text-slate-300">⟨</button>
                <button className="w-10 h-10 flex items-center justify-center rounded bg-amber-400 text-white text-[14px] font-black shadow-md">1</button>
                <button className="w-10 h-10 flex items-center justify-center rounded border border-slate-200 text-slate-300">⟩</button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

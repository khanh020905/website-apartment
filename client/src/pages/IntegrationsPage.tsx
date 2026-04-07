import { useState } from "react";
import { MessageSquare, Lock, Settings } from "lucide-react";
import Modal from "../components/modals/Modal";

export default function IntegrationsPage() {
  const [selectedIntegration, setSelectedIntegration] = useState<string | null>(null);

  const INTEGRATIONS = [
    {
      id: "zns",
      name: "Dịch Vụ Thông Báo Zalo (ZNS)",
      description: "Gửi thông báo chăm sóc khách hàng tự động qua Zalo OA.",
      icon: MessageSquare,
      color: "text-blue-500",
      bg: "bg-blue-50",
      connected: true,
    },
    {
      id: "ttlock",
      name: "Khoá Thông Minh TTLock",
      description: "Quản lý khóa cửa điện tử, cấp pass code từ xa tự động.",
      icon: Lock,
      color: "text-emerald-500",
      bg: "bg-emerald-50",
      connected: false,
    },
    {
      id: "tingee",
      name: "Thanh toán Tingee",
      description: "Nhận thanh toán tự động, gạch nợ hóa đơn real-time.",
      icon: Settings,
      color: "text-purple-500",
      bg: "bg-purple-50",
      connected: false,
    }
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f8f9fa] relative overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="px-6 py-4 flex items-center justify-between">
          <h1 className="text-[20px] font-bold text-slate-900 tracking-tight">Tích hợp dịch vụ</h1>
        </div>
      </div>

      {/* Main Content Areas */}
      <div className="flex-1 overflow-auto p-5 lg:p-6 space-y-6">
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {INTEGRATIONS.map(int => (
               <div key={int.id} className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                     <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${int.bg}`}>
                        <int.icon className={`w-6 h-6 ${int.color}`} />
                     </div>
                     <span className={`px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider rounded-md border ${
                        int.connected 
                           ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                           : 'bg-slate-50 text-slate-500 border-slate-200'
                     }`}>
                        {int.connected ? 'Đã kết nối' : 'Chưa kết nối'}
                     </span>
                  </div>
                  <h3 className="text-[16px] font-bold text-slate-900 mb-2">{int.name}</h3>
                  <p className="text-[13px] text-slate-500 mb-6 flex-1 leading-relaxed">{int.description}</p>
                  
                  <button 
                     onClick={() => setSelectedIntegration(int.id)}
                     className={`w-full py-2.5 rounded-lg text-[13px] font-bold transition-colors ${
                        int.connected 
                           ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' 
                           : 'bg-brand-primary text-slate-900 hover:bg-[#f59e0b] shadow-sm'
                     }`}
                  >
                     {int.connected ? 'Cấu hình' : 'Kết nối ngay'}
                  </button>
               </div>
            ))}
         </div>
      </div>

      {/* Configuration Modal */}
      <Modal isOpen={!!selectedIntegration} onClose={() => setSelectedIntegration(null)} title="Cấu hình tích hợp" size="md">
         <form 
            onSubmit={(e) => { e.preventDefault(); setSelectedIntegration(null); }}
            className="p-6"
         >
            {selectedIntegration === 'zns' ? (
               <div className="space-y-5">
                  <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-100 rounded-lg mb-4">
                     <MessageSquare className="w-6 h-6 text-blue-600" />
                     <div>
                        <h4 className="text-[14px] font-bold text-blue-900">Zalo Notification Service</h4>
                        <p className="text-[12px] text-blue-700">Trạng thái: Đang hoạt động ổn định</p>
                     </div>
                  </div>
                  <div>
                     <label className="block text-[13px] font-bold text-slate-700 mb-1.5">OA ID (Zalo Official Account)</label>
                     <input type="text" defaultValue="123456789098765" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 font-medium focus:outline-none focus:border-brand-primary" />
                  </div>
                  <div>
                     <label className="block text-[13px] font-bold text-slate-700 mb-1.5">Refresh Token</label>
                     <input type="password" defaultValue="abcdef123456" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 font-medium focus:outline-none focus:border-brand-primary" />
                  </div>
               </div>
            ) : (
               <div className="space-y-5">
                  <p className="text-[14px] text-slate-600">Vui lòng cung cấp khóa API để kết nối dịch vụ.</p>
                  <div>
                     <label className="block text-[13px] font-bold text-slate-700 mb-1.5">App ID / Client ID</label>
                     <input type="text" placeholder="Nhập Client ID cung cấp bởi đối tác" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 font-medium focus:outline-none focus:border-brand-primary" required />
                  </div>
                  <div>
                     <label className="block text-[13px] font-bold text-slate-700 mb-1.5">App Secret / Client Secret</label>
                     <input type="password" placeholder="Nhập Secret Key" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 font-medium focus:outline-none focus:border-brand-primary" required />
                  </div>
               </div>
            )}

            <div className="flex justify-end gap-3 mt-8 pt-5 border-t border-slate-100">
               <button type="button" onClick={() => setSelectedIntegration(null)} className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors">
                  Hủy
               </button>
               <button type="submit" className="px-6 py-2.5 text-sm font-bold bg-brand-primary text-slate-900 hover:bg-[#f59e0b] rounded-lg shadow-sm transition-colors">
                  Lưu cấu hình
               </button>
            </div>
         </form>
      </Modal>

    </div>
  );
}

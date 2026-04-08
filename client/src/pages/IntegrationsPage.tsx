import { useState, useEffect } from "react";
import { MessageSquare, Lock, Settings } from "lucide-react";
import Modal from "../components/modals/Modal";
import { api } from "../lib/api";

const INTEGRATION_TYPES = [
  {
    id: "zns",
    name: "Dịch Vụ Thông Báo Zalo (ZNS)",
    description: "Gửi thông báo chăm sóc khách hàng tự động qua Zalo OA.",
    icon: MessageSquare,
    color: "text-blue-500",
    bg: "bg-blue-50",
  },
  {
    id: "ttlock",
    name: "Khoá Thông Minh TTLock",
    description: "Quản lý khóa cửa điện tử, cấp pass code từ xa tự động.",
    icon: Lock,
    color: "text-emerald-500",
    bg: "bg-emerald-50",
  },
  {
    id: "tingee",
    name: "Thanh toán Tingee",
    description: "Nhận thanh toán tự động, gạch nợ hóa đơn real-time.",
    icon: Settings,
    color: "text-purple-500",
    bg: "bg-purple-50",
  }
];

export default function IntegrationsPage() {
  const [selectedIntegration, setSelectedIntegration] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [integrations, setIntegrations] = useState<any[]>([]);

  // Config inputs
  const [configParams, setConfigParams] = useState<Record<string, string>>({});

  const fetchIntegrations = async () => {
    try {
      setLoading(true);
      const { data } = await api.get<any[]>("/api/integrations");
      if (data) {
        setIntegrations(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const openConfig = (service_id: string) => {
    const existing = integrations.find(i => i.service_id === service_id);
    if (existing && existing.config) {
      setConfigParams(existing.config);
    } else {
      setConfigParams({});
    }
    setSelectedIntegration(service_id);
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIntegration) return;

    try {
      await api.post("/api/integrations", {
        service_id: selectedIntegration,
        config: configParams
      });
      fetchIntegrations();
      setSelectedIntegration(null);
    } catch (err) {
      console.error(err);
      alert("Lỗi khi lưu cấu hình!");
    }
  };

  const handleDisconnect = async () => {
    if (!selectedIntegration) return;
    if (!confirm("Bạn có chắc chắn muốn ngắt kết nối dịch vụ này?")) return;

    try {
      await api.delete(`/api/integrations/${selectedIntegration}`);
      fetchIntegrations();
      setSelectedIntegration(null);
    } catch (err) {
      console.error(err);
      alert("Lỗi ngắt kết nối!");
    }
  };

  const isConnected = (id: string) => {
    const itg = integrations.find(i => i.service_id === id);
    return itg ? itg.is_connected : false;
  };

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
        {loading ? (
          <div className="flex justify-center p-10"><div className="w-8 h-8 border-4 border-amber-200 border-t-amber-500 rounded-full animate-spin"/></div>
        ) : (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {INTEGRATION_TYPES.map(int => (
               <div key={int.id} className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                     <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${int.bg}`}>
                        <int.icon className={`w-6 h-6 ${int.color}`} />
                     </div>
                     <span className={`px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider rounded-md border ${
                        isConnected(int.id)
                           ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                           : 'bg-slate-50 text-slate-500 border-slate-200'
                     }`}>
                        {isConnected(int.id) ? 'Đã kết nối' : 'Chưa kết nối'}
                     </span>
                  </div>
                  <h3 className="text-[16px] font-bold text-slate-900 mb-2">{int.name}</h3>
                  <p className="text-[13px] text-slate-500 mb-6 flex-1 leading-relaxed">{int.description}</p>
                  
                  <button 
                     onClick={() => openConfig(int.id)}
                     className={`w-full py-2.5 rounded-lg text-[13px] font-bold transition-colors cursor-pointer ${
                        isConnected(int.id)
                           ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' 
                           : 'bg-amber-400 text-slate-900 hover:bg-amber-500 shadow-sm'
                     }`}
                  >
                     {isConnected(int.id) ? 'Cấu hình' : 'Kết nối ngay'}
                  </button>
               </div>
            ))}
         </div>
        )}
      </div>

      {/* Configuration Modal */}
      <Modal isOpen={!!selectedIntegration} onClose={() => setSelectedIntegration(null)} title="Cấu hình tích hợp" size="md">
         <form 
            onSubmit={handleSaveConfig}
            className="p-6"
         >
            {selectedIntegration === 'zns' ? (
               <div className="space-y-5">
                  <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-100 rounded-lg mb-4">
                     <MessageSquare className="w-6 h-6 text-blue-600" />
                     <div>
                        <h4 className="text-[14px] font-bold text-blue-900">Zalo Notification Service</h4>
                        <p className="text-[12px] text-blue-700">Trạng thái: Hoạt động ổn định</p>
                     </div>
                  </div>
                  <div>
                     <label className="block text-[13px] font-bold text-slate-700 mb-1.5">OA ID (Zalo Official Account)</label>
                     <input 
                        type="text" 
                        value={configParams.oa_id || ''}
                        onChange={e => setConfigParams({...configParams, oa_id: e.target.value})}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 font-medium focus:outline-none focus:border-amber-400" 
                        required 
                     />
                  </div>
                  <div>
                     <label className="block text-[13px] font-bold text-slate-700 mb-1.5">Refresh Token</label>
                     <input 
                        type="password" 
                        value={configParams.refresh_token || ''}
                        onChange={e => setConfigParams({...configParams, refresh_token: e.target.value})}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 font-medium focus:outline-none focus:border-amber-400" 
                        required 
                     />
                  </div>
               </div>
            ) : (
               <div className="space-y-5">
                  <p className="text-[14px] text-slate-600">Vui lòng cung cấp khóa API để kết nối dịch vụ.</p>
                  <div>
                     <label className="block text-[13px] font-bold text-slate-700 mb-1.5">App ID / Client ID</label>
                     <input 
                        type="text" 
                        value={configParams.client_id || ''}
                        onChange={e => setConfigParams({...configParams, client_id: e.target.value})}
                        placeholder="Nhập Client ID cung cấp bởi đối tác" 
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 font-medium focus:outline-none focus:border-amber-400" 
                        required 
                     />
                  </div>
                  <div>
                     <label className="block text-[13px] font-bold text-slate-700 mb-1.5">App Secret / Client Secret</label>
                     <input 
                        type="password" 
                        value={configParams.client_secret || ''}
                        onChange={e => setConfigParams({...configParams, client_secret: e.target.value})}
                        placeholder="Nhập Secret Key" 
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 font-medium focus:outline-none focus:border-amber-400" 
                        required 
                     />
                  </div>
               </div>
            )}

            <div className="flex justify-between items-center mt-8 pt-5 border-t border-slate-100">
               {isConnected(selectedIntegration as string) ? (
                 <button type="button" onClick={handleDisconnect} className="px-5 py-2.5 text-sm font-bold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer">
                    Ngắt kết nối
                 </button>
               ) : (
                 <div/>
               )}
               <div className="flex gap-3">
                 <button type="button" onClick={() => setSelectedIntegration(null)} className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer">
                    Hủy
                 </button>
                 <button type="submit" className="px-6 py-2.5 text-sm font-bold bg-amber-400 text-slate-900 hover:bg-amber-500 rounded-lg shadow-sm transition-colors cursor-pointer">
                    Lưu cấu hình
                 </button>
               </div>
            </div>
         </form>
      </Modal>

    </div>
  );
}

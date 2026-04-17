import { useState, useEffect } from "react";
import { Key, RefreshCw, Copy, Eye, EyeOff, AlertCircle } from "lucide-react";
import { api } from "../lib/api";

export default function ApiManagementPage() {
  const [showSecret, setShowSecret] = useState(false);
  
  const [clientId, setClientId] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchCredentials = async () => {
    try {
      const res = await api.get<{ credentials: { client_id: string; client_secret: string } | null }>("/api/api-keys");
      if (res.data?.credentials) {
        setClientId(res.data.credentials.client_id);
        setClientSecret(res.data.credentials.client_secret);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCredentials();
  }, []);

  const handleRefreshKeys = async () => {
    if (!confirm("Tạo lại Secret sẽ làm các ứng dụng đang kết nối bị gián đoạn. Bạn có chắc chắn?")) return;
    try {
      setLoading(true);
      const res = await api.post<{ credentials: { client_id: string; client_secret: string } }>("/api/api-keys/refresh", {});
      if (res.data?.credentials) {
        setClientId(res.data.credentials.client_id);
        setClientSecret(res.data.credentials.client_secret);
        alert("Đã tạo lại API Key thành công!");
      }
    } catch (error) {
      console.error(error);
      alert("Lỗi khi tạo API Key");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    alert("Đã sao chép vào bộ nhớ tạm");
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f8f9fa] relative overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="px-6 py-4 flex items-center justify-between">
          <h1 className="text-[20px] font-bold text-slate-900 tracking-tight">Quản lý API</h1>
        </div>
      </div>

      {/* Main Content Areas */}
      <div className="flex-1 overflow-auto p-5 lg:p-6 flex flex-col items-center justify-start pt-10">
         <div className="w-full max-w-2xl">
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
               <div className="p-6 border-b border-slate-100 flex items-center gap-3">
                  <div className="w-12 h-12 bg-[#14B8A6]/5 text-brand-dark rounded-xl flex items-center justify-center shrink-0">
                     <Key className="w-6 h-6" />
                  </div>
                  <div>
                     <h2 className="text-[16px] font-bold text-slate-900">API Credentials</h2>
                     <p className="text-[13px] text-slate-500">Sử dụng các thông tin này để kết nối ứng dụng bên thứ 3 của bạn vào hệ thống.</p>
                  </div>
               </div>

               {loading ? (
                  <div className="p-8 text-center text-slate-500 text-sm">Đang tải dữ liệu...</div>
               ) : (
               <>
                  <div className="p-6 space-y-6">
                     {/* Client ID */}
                     <div>
                        <label className="block text-[13px] font-bold text-slate-700 mb-2">Client ID</label>
                        <div className="flex gap-2">
                           <input 
                              type="text" 
                              value={clientId || "(Chưa có Client ID)"}
                              readOnly
                              className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 font-mono tracking-wide focus:outline-none" 
                           />
                           <button 
                              onClick={() => handleCopy(clientId)}
                              disabled={!clientId}
                              className="cursor-pointer px-4 py-2.5 flex items-center gap-2 border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 rounded-lg text-sm font-bold transition-colors"
                           >
                              <Copy className="w-4 h-4" /> Sao chép
                           </button>
                        </div>
                     </div>

                     {/* Client Secret */}
                     <div>
                        <label className="block text-[13px] font-bold text-slate-700 mb-2">Client Secret</label>
                        <div className="flex gap-2">
                           <div className="relative flex-1">
                              <input 
                                 type={showSecret ? "text" : "password"} 
                                 value={clientSecret}
                                 placeholder={clientSecret ? "" : "(Chưa có Secret)"}
                                 readOnly
                                 className="w-full pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 font-mono tracking-wide focus:outline-none" 
                              />
                              <button 
                                 onClick={() => setShowSecret(!showSecret)}
                                 className="cursor-pointer absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
                              >
                                 {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                           </div>
                           <button 
                              onClick={() => handleCopy(clientSecret)}
                              disabled={!clientSecret}
                              className="cursor-pointer px-4 py-2.5 flex items-center gap-2 border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 rounded-lg text-sm font-bold transition-colors"
                           >
                              <Copy className="w-4 h-4" /> Sao chép
                           </button>
                        </div>
                        <p className="mt-2 text-[12px] text-brand-dark flex items-center gap-1.5 font-medium">
                           <AlertCircle className="w-3.5 h-3.5" /> Tuyệt đối không chia sẻ Client Secret cho người không có thẩm quyền.
                        </p>
                     </div>
                  </div>

                  {/* Action Footer */}
                  <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                     <p className="text-[12px] text-slate-500 font-medium max-w-[300px]">
                        Tạo lại Client Secret mới nếu bạn nghi ngờ có sự rò rỉ thông tin.
                     </p>
                     <button 
                        onClick={handleRefreshKeys}
                        className="cursor-pointer flex items-center gap-1.5 px-5 py-2.5 bg-white border border-slate-200 text-red-600 rounded-lg text-[13px] font-bold transition-colors hover:bg-red-50 hover:border-red-200 shadow-sm"
                     >
                        <RefreshCw className="w-4 h-4" /> Làm mới Secret
                     </button>
                  </div>
               </>
               )}
            </div>
         </div>
      </div>
    </div>
  );
}

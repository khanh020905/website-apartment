import { useState } from "react";
import { Key, RefreshCw, Copy, Eye, EyeOff, AlertCircle } from "lucide-react";

export default function ApiManagementPage() {
  const [showSecret, setShowSecret] = useState(false);

  const clientId = "app_prod_9Xq2V4N8mL";
  const clientSecret = "sec_live_H7kP1mY3vG5bN9xL2cR4jW6tF8qD0Z";

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    // Suggest adding a toast notification here in actual implementation
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
                  <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center shrink-0">
                     <Key className="w-6 h-6" />
                  </div>
                  <div>
                     <h2 className="text-[16px] font-bold text-slate-900">API Credentials</h2>
                     <p className="text-[13px] text-slate-500">Sử dụng các thông tin này để kết nối ứng dụng bên thứ 3 của bạn vào hệ thống.</p>
                  </div>
               </div>

               <div className="p-6 space-y-6">
                  {/* Client ID */}
                  <div>
                     <label className="block text-[13px] font-bold text-slate-700 mb-2">Client ID</label>
                     <div className="flex gap-2">
                        <input 
                           type="text" 
                           value={clientId}
                           readOnly
                           className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 font-mono tracking-wide focus:outline-none" 
                        />
                        <button 
                           onClick={() => handleCopy(clientId)}
                           className="px-4 py-2.5 flex items-center gap-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg text-sm font-bold transition-colors"
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
                              readOnly
                              className="w-full pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 font-mono tracking-wide focus:outline-none" 
                           />
                           <button 
                              onClick={() => setShowSecret(!showSecret)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
                           >
                              {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                           </button>
                        </div>
                        <button 
                           onClick={() => handleCopy(clientSecret)}
                           className="px-4 py-2.5 flex items-center gap-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg text-sm font-bold transition-colors"
                        >
                           <Copy className="w-4 h-4" /> Sao chép
                        </button>
                     </div>
                     <p className="mt-2 text-[12px] text-amber-600 flex items-center gap-1.5 font-medium">
                        <AlertCircle className="w-3.5 h-3.5" /> Tuyệt đối không chia sẻ Client Secret cho người không có thẩm quyền.
                     </p>
                  </div>
               </div>

               {/* Action Footer */}
               <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                  <p className="text-[12px] text-slate-500 font-medium max-w-[300px]">
                     Tạo lại Client Secret mới nếu bạn nghi ngờ có sự rò rỉ thông tin.
                  </p>
                  <button className="flex items-center gap-1.5 px-5 py-2.5 bg-white border border-slate-200 text-red-600 rounded-lg text-[13px] font-bold transition-colors hover:bg-red-50 hover:border-red-200 shadow-sm">
                     <RefreshCw className="w-4 h-4" /> Làm mới Secret
                  </button>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { 
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Globe,
  Smartphone,
  Mail,
  Zap,
  CreditCard
} from "lucide-react";
import { motion } from "framer-motion";

const IntegrationsPage = () => {
  const [filter, setFilter] = useState("all");

  const MOCK_INTEGRATIONS = [
     { id: "1", name: "Zalo Official Account", category: "Social", icon: MessageSquare, color: "text-blue-500", bg: "bg-blue-50", status: "connected" },
     { id: "2", name: "Facebook Messenger", category: "Social", icon: MessageSquare, color: "text-indigo-600", bg: "bg-indigo-50", status: "disconnected" },
     { id: "3", name: "Website Booking Widget", category: "Website", icon: Globe, color: "text-emerald-500", bg: "bg-emerald-50", status: "connected" },
     { id: "4", name: "SMS Gateway (SpeedSMS)", category: "Marketing", icon: Smartphone, color: "text-orange-500", bg: "bg-orange-50", status: "connected" },
     { id: "5", name: "VNPay Payment Gateway", category: "Payment", icon: CreditCard, color: "text-blue-600", bg: "bg-blue-50", status: "disconnected" },
     { id: "6", name: "Email Marketing (Mailchimp)", category: "Marketing", icon: Mail, color: "text-amber-500", bg: "bg-amber-50", status: "disconnected" },
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f8f9fa] relative overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="px-6 py-4 flex items-center justify-between">
          <h1 className="text-[20px] font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500" />
            Tích hợp ứng dụng
          </h1>
        </div>

        {/* Categories Toolbar */}
        <div className="px-6 pb-4 flex flex-col sm:flex-row items-center gap-3">
          <div className="flex bg-slate-100 rounded-lg p-1 shrink-0">
             {['all', 'Social', 'Website', 'Payment', 'Marketing'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={`px-4 py-1.5 text-[13px] rounded font-bold transition-all ${
                    filter === cat ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {cat === 'all' ? 'Tất cả' : cat}
                </button>
             ))}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-[#f8f9fa] p-5 lg:p-6 flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {MOCK_INTEGRATIONS.filter(i => filter === 'all' || i.category === filter).map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all flex flex-col group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-14 h-14 ${item.bg} rounded-2xl border border-slate-100 shadow-sm flex items-center justify-center transition-transform group-hover:scale-110 duration-300`}>
                  <item.icon className={`w-6 h-6 ${item.color}`} />
                </div>
                <div className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wider ${item.status === 'connected' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-50 text-slate-500'}`}>
                  {item.status === 'connected' ? (
                    <>
                      <CheckCircle2 className="w-3 h-3" />
                      Đã kết nối
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-3 h-3" />
                      Chưa kết nối
                    </>
                  )}
                </div>
              </div>
              <div>
                <h3 className="text-[15px] font-bold text-slate-900 group-hover:text-amber-600 transition-colors">{item.name}</h3>
                <p className="text-[11px] border border-slate-200 px-2 py-0.5 rounded w-fit font-bold uppercase text-slate-500 tracking-widest mt-2">{item.category}</p>
              </div>
              <p className="text-[13px] text-slate-500 font-medium leading-relaxed mt-3 flex-1">
                 Kết nối hệ thống Smartos với {item.name} để đồng bộ hoá dữ liệu và tự động hoá quy trình làm việc của bạn.
              </p>
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                 <button className="text-[13px] font-bold text-blue-600 hover:underline flex items-center gap-1 transition-colors">
                    <ExternalLink className="w-3.5 h-3.5" />
                    Tài liệu SDK
                 </button>
                 <button className={`px-4 py-2 rounded-lg text-[13px] font-bold transition-all shadow-sm cursor-pointer ${
                   item.status === 'connected' 
                   ? "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200" 
                   : "bg-slate-900 text-white hover:bg-slate-800"
                 }`}>
                   {item.status === 'connected' ? "Cấu hình" : "Kết nối ngay"}
                 </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default IntegrationsPage;

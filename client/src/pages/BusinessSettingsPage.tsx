import { useState } from "react";
import { motion } from "framer-motion";
import {
  Settings,
  Info,
  Building2,
  Cog,
  Users,
  Plug,
  Box,
  Tag,
  Truck,
  Shield,
  Phone,
  Mail,
  MapPin,
  Globe,
  Link as LinkIcon,
  Plus,
  Palette,
  CreditCard,
  ChevronRight,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

const tabs = [
  { label: "Chung", path: "/business-information", icon: Info },
  { label: "Toà nhà", path: "/locations", icon: Building2 },
  { label: "Dịch vụ", path: "/services", icon: Cog },
  { label: "Người dùng & vai trò", path: "/users", icon: Users },
  { label: "Tích hợp", path: "/integrations", icon: Plug },
  { label: "Quản lý API", path: "/api-management", icon: Box },
  { label: "Tài sản", path: "/asset-types", icon: Tag },
  { label: "Nhà cung cấp", path: "/suppliers", icon: Truck },
];

const SectionCard = ({ title, children, className = "" }: { title?: string; children: React.ReactNode; className?: string }) => (
  <div className={`bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden ${className}`}>
    {title && (
      <div className="px-6 py-4 border-b border-slate-100">
        <h3 className="text-sm font-bold text-slate-800">{title}</h3>
      </div>
    )}
    <div className="p-6">{children}</div>
  </div>
);

const InfoRow = ({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value?: string }) => (
  <div className="flex items-start gap-3 py-3 border-b border-slate-50 last:border-0">
    <div className="p-1.5 bg-slate-100 rounded-lg mt-0.5 flex-shrink-0">
      <Icon className="w-3.5 h-3.5 text-slate-500" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs text-slate-400 font-medium mb-0.5">{label}</p>
      <p className="text-sm text-slate-700 font-medium">{value || <span className="text-slate-400 italic">Chưa cập nhật</span>}</p>
    </div>
  </div>
);

export default function BusinessSettingsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const activeTab = location.pathname;
  const [primaryColor] = useState("#FFBA38");

  return (
    <div className="p-6 lg:p-8 space-y-6 bg-linear-to-br from-slate-50 to-slate-100/50 min-h-full">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">Thiết lập</h1>
        <p className="text-sm text-slate-500 mt-1">Cấu hình thông tin và hoạt động doanh nghiệp</p>
      </div>

      {/* Tab navigation - horizontal scrollable */}
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
        <div className="flex items-center gap-1 p-2 border-b border-slate-100 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer whitespace-nowrap flex-shrink-0 ${
                activeTab === tab.path ? "bg-slate-900 text-white shadow-sm" : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6 space-y-6">
          {/* General Info Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <SectionCard title="Thông tin liên hệ">
                <InfoRow icon={Building2} label="Tên doanh nghiệp" value="Trà My" />
                <InfoRow icon={Mail} label="Email" value="nguyenvinhthitramy@gmail.com" />
                <InfoRow icon={Phone} label="Điện thoại" value="0886539201" />
                <InfoRow icon={MapPin} label="Địa chỉ" value="123 Nguyen Van Linh, Hai Chau, Da Nang" />
              </SectionCard>
            </motion.div>

            {/* Metrics */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <SectionCard title="Số liệu">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: "Toà nhà hoạt động", value: "5", icon: Building2, color: "text-brand-primary bg-brand-primary/10" },
                    { label: "Người dùng", value: "3", icon: Users, color: "text-violet-600 bg-violet-50" },
                  ].map((m, i) => (
                    <div key={i} className={`p-4 rounded-xl border border-slate-100`}>
                      <div className={`inline-flex p-2 rounded-lg ${m.color} mb-2`}>
                        <m.icon className="w-4 h-4" />
                      </div>
                      <p className="text-2xl font-black text-slate-800">{m.value}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{m.label}</p>
                    </div>
                  ))}
                </div>
              </SectionCard>
            </motion.div>

            {/* Social links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <SectionCard title="Mạng xã hội">
                <div className="space-y-2">
                  {[
                    { icon: Globe, label: "Website" },
                    { icon: LinkIcon, label: "Facebook" },
                    { icon: LinkIcon, label: "Instagram" },
                    { icon: LinkIcon, label: "Zalo" },
                  ].map((s, i) => (
                    <button key={i} className="w-full flex items-center gap-2 px-3 py-2 border border-dashed border-slate-200 rounded-xl text-sm text-slate-400 hover:border-brand-primary/30 hover:text-brand-primary hover:bg-brand-primary/5 transition-all">
                      <s.icon className="w-4 h-4" />
                      <span>Thêm {s.label}</span>
                      <Plus className="w-3.5 h-3.5 ml-auto" />
                    </button>
                  ))}
                </div>
              </SectionCard>
            </motion.div>
          </div>

          {/* Brand settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <SectionCard title="Thương hiệu doanh nghiệp">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Color settings */}
                <div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Màu thương hiệu</h4>
                  <div className="space-y-3">
                    {[
                      { label: "Màu nút bấm chủ đạo", key: "primary", value: primaryColor },
                      { label: "Màu chữ chủ đạo", key: "text", value: "#000000" },
                    ].map((c) => (
                      <div key={c.key} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                        <div className="flex items-center gap-3">
                          <Palette className="w-4 h-4 text-slate-400" />
                          <span className="text-sm font-medium text-slate-700">{c.label}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-slate-500">{c.value}</span>
                          <div className="w-7 h-7 rounded-lg border border-slate-200 cursor-pointer shadow-sm" style={{ background: c.value }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Logo upload */}
                <div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Logo xem thử</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {["Logo kích cỡ đầy đủ", "Logo thu gọn"].map((label) => (
                      <div key={label} className="aspect-video border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-brand-primary/40 hover:bg-brand-primary/5 transition-all cursor-pointer">
                        <Plus className="w-5 h-5 text-slate-400" />
                        <span className="text-xs text-slate-400 text-center px-2">{label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </SectionCard>
          </motion.div>

          {/* Payment settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <SectionCard title="Cài đặt thanh toán">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-3">
                  {[
                    { label: "Cách tính tròn tháng", value: "Chu kỳ lịch", icon: CreditCard },
                    { label: "Cách tính đơn giá ngày lẻ", value: "Theo 30 ngày cố định", icon: CreditCard },
                  ].map((s, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <s.icon className="w-4 h-4 text-slate-400" />
                        <div>
                          <p className="text-sm font-medium text-slate-700">{s.label}</p>
                          <p className="text-xs text-brand-primary font-semibold mt-0.5">{s.value}</p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-300" />
                    </div>
                  ))}
                </div>

                <div className="space-y-3">
                  {[
                    { label: "Nhắc nhở hết hạn visa", desc: "Hệ thống gửi thông báo trước khi visa hết hạn", icon: Shield },
                    { label: "Chính sách khách hàng", desc: "Điều khoản và quy định với khách thuê", icon: Settings },
                  ].map((s, i) => (
                    <div key={i} className="flex items-start justify-between p-4 bg-slate-50 rounded-xl">
                      <div className="flex items-start gap-3">
                        <s.icon className="w-4 h-4 text-slate-400 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-slate-700">{s.label}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{s.desc}</p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-300 flex-shrink-0" />
                    </div>
                  ))}
                </div>
              </div>
            </SectionCard>
          </motion.div>

          {/* Business representative info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <SectionCard title="Thông tin người đại diện">
              <div className="flex flex-col items-center py-6 text-center">
                <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mb-3">
                  <Users className="w-7 h-7 text-slate-400" />
                </div>
                <p className="text-sm text-slate-600 max-w-md mb-4">
                  Vui lòng cung cấp thông tin cụ thể về đại diện doanh nghiệp để hỗ trợ việc thực hiện hợp đồng.
                </p>
                <button className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-900 rounded-xl text-sm font-bold transition-all hover:shadow-lg hover:shadow-amber-500/25">
                  <Plus className="w-4 h-4" />
                  Thêm thông tin người đại diện
                </button>
              </div>
            </SectionCard>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

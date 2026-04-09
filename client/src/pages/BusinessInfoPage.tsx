import { useState, useEffect } from "react";
import { Edit2, Plus, ChevronDown, ChevronUp, Check, Info, Upload, Camera, User, Mail, Phone, MapPin, Globe, MessageCircle, AtSign, Music2 } from "lucide-react";
import Modal from "../components/modals/Modal";
import { api } from "../lib/api";

// Mock icons
const Facebook = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-facebook">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
);
const Instagram = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-instagram">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
);
const Linkedin = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-linkedin">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/>
  </svg>
);
const Twitter = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-twitter">
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/>
  </svg>
);

export default function BusinessInfoPage() {
  const [isEditBusinessOpen, setIsEditBusinessOpen] = useState(false);
  const [isEditRepOpen, setIsEditRepOpen] = useState(false);
  const [isEditSocialOpen, setIsEditSocialOpen] = useState(false);
  
  const [repExpanded, setRepExpanded] = useState(true);

  const [settings, setSettings] = useState<any>({});
  const [loading, setLoading] = useState(true);

  const loadSettings = () => {
    api.get<{ settings: any }>("/api/business-settings")
      .then((res) => {
        if (res.data?.settings) setSettings(res.data.settings);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleUpdate = async (data: any, closeFn: () => void) => {
    try {
      await api.put("/api/business-settings", data);
      loadSettings();
      closeFn();
    } catch (err) {
      console.error(err);
      alert("Lỗi khi cập nhật");
    }
  };

  const handlePaymentConfigChange = async (key: string, value: string) => {
    try {
      setSettings((prev: any) => ({ ...prev, [key]: value }));
      await api.put("/api/business-settings", { [key]: value });
    } catch (err) {
      console.error(err);
      loadSettings();
    }
  };

  const primaryColor = settings?.primary_color || "#FFBA38";
  const textColor = settings?.text_color || "#000000";

  if (loading) {
    return <div className="p-6 text-center text-slate-500 font-bold">Đang tải cấu hình...</div>;
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f4f7f9] relative overflow-hidden font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 shrink-0">
        <h1 className="text-[18px] font-semibold text-[#1E2328]">Thông tin chung</h1>
      </div>

      <div className="flex-1 overflow-auto p-6 space-y-6">
        
        {/* HERO SECTION */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden p-6">
           <div className="flex flex-col lg:flex-row gap-8 relative">
              <button 
                onClick={() => setIsEditBusinessOpen(true)}
                className="absolute top-0 right-0 w-8 h-8 flex items-center justify-center border border-slate-200 rounded-lg text-slate-400 hover:bg-slate-50 transition-colors"
               cursor-pointer
              >
                 <Edit2 className="w-4 h-4" />
              </button>

              <div className="w-full lg:w-[350px] aspect-[16/10] bg-[#eef0f2] rounded-xl relative flex items-center justify-center border border-slate-100 shrink-0">
                 <div className="w-24 h-24 text-slate-300">
                    <img src={settings?.logo_full_url || "https://tra-my.smartos.space/assets/images/no-image.png"} alt="" className="w-full h-full object-contain opacity-20" />
                 </div>
                 <button className="absolute top-3 right-3 w-8 h-8 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-500 shadow-sm hover:bg-slate-50 transition-all cursor-pointer">
                    <Camera className="w-4 h-4" />
                 </button>
              </div>

              <div className="flex-1 flex flex-col pt-2">
                 <div className="mb-8">
                    <h2 className="text-[28px] font-bold text-slate-900 leading-tight">{settings?.brand_name || "Chưa cập nhật Tên doanh nghiệp"}</h2>
                    <p className="text-[14px] font-medium text-slate-400 mt-1">{settings?.description || "N/A"}</p>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-5">
                       <h3 className="text-[14px] font-bold text-slate-800">Thông tin liên hệ</h3>
                       <div className="space-y-4">
                          <div className="flex items-center gap-3">
                             <div className="w-9 h-9 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 border border-slate-50">
                                <User className="w-4.5 h-4.5" />
                             </div>
                             <div>
                                <p className="text-[14px] font-bold text-slate-800">{settings?.rep_name || "N/A"}</p>
                                <p className="text-[12px] text-slate-500">{settings?.rep_email || "N/A"}</p>
                             </div>
                          </div>
                          <div className="flex items-center gap-3 pl-1.5">
                             <Mail className="w-4 h-4 text-slate-400" />
                             <span className="text-[13px] font-medium text-slate-600">{settings?.email || "Chưa thiết lập email"}</span>
                          </div>
                          <div className="flex items-center gap-3 pl-1.5">
                             <Phone className="w-4 h-4 text-slate-400" />
                             <span className="text-[13px] font-medium text-slate-600">{settings?.phone || "Chưa thiết lập số điện thoại"}</span>
                          </div>
                          <div className="flex items-start gap-3 pl-1.5 pt-0.5">
                             <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                             <span className="text-[13px] font-medium text-slate-600 leading-relaxed max-w-[300px]">{settings?.address || "Chưa thiết lập địa chỉ"}</span>
                          </div>
                       </div>
                    </div>

                    <div className="space-y-5">
                       <h3 className="text-[14px] font-bold text-slate-800">Mạng xã hội</h3>
                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-4">
                          {[
                             { Icon: Globe, label: "Thêm đường dẫn", color: "text-slate-600", val: settings?.social_website },
                             { Icon: Facebook, label: "Thêm đường dẫn", color: "text-blue-600", val: settings?.social_facebook },
                             { Icon: Instagram, label: "Thêm đường dẫn", color: "text-rose-500", val: settings?.social_instagram },
                             { Icon: Twitter, label: "Thêm đường dẫn", color: "text-sky-500", val: settings?.social_twitter },
                             { Icon: Linkedin, label: "Thêm đường dẫn", color: "text-blue-700", val: settings?.social_linkedin },
                             { Icon: MessageCircle, label: "Thêm đường dẫn", color: "text-blue-500", val: settings?.social_zalo },
                             { Icon: AtSign, label: "Messenger", color: "text-sky-400", val: settings?.social_messenger },
                             { Icon: Music2, label: "Tiktok", color: "text-slate-900", val: settings?.social_tiktok },
                          ].map((social, i) => (
                             <button 
                                key={i} 
                                onClick={() => setIsEditSocialOpen(true)}
                                className="flex items-center gap-2.5 text-[13px] font-medium text-slate-400 hover:text-slate-600 transition-colors group text-left cursor-pointer"
                             >
                                <social.Icon className={`w-4.5 h-4.5 ${social.color}`} />
                                <span className={`underline decoration-slate-200 underline-offset-4 group-hover:decoration-slate-400 ${social.val ? 'text-slate-700' : ''}`}>
                                   {social.val ? social.val.replace(/^https?:\/\//, '').split('/')[0] : (social.label === "Messenger" || social.label === "Tiktok" ? social.label : social.label)}
                                </span>
                             </button>
                          ))}
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </div>
        
        {/* Statistics Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-brand-bg rounded-xl flex items-center justify-center text-brand-dark">
                 <Plus className="w-6 h-6" />
              </div>
              <div>
                 <p className="text-[13px] font-medium text-slate-500 uppercase tracking-wider">Toà nhà hoạt động</p>
                 <h3 className="text-[24px] font-bold text-slate-900">0</h3>
              </div>
           </div>
           <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                 <Check className="w-6 h-6" />
              </div>
              <div>
                 <p className="text-[13px] font-medium text-slate-500 uppercase tracking-wider">Người dùng</p>
                 <h3 className="text-[24px] font-bold text-slate-900">0</h3>
              </div>
           </div>
        </div>

        {/* Branding Section */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
           <h2 className="text-[16px] font-semibold text-[#1E2328] mb-6">Thương hiệu doanh nghiệp</h2>
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="space-y-6">
                 <h3 className="text-[14px] font-bold text-slate-700 uppercase tracking-wide flex items-center gap-2">Màu thương hiệu <Info className="w-4 h-4 text-slate-400" /></h3>
                 <div className="flex flex-wrap gap-8">
                    <div className="space-y-2">
                       <label className="block text-[13px] font-medium text-slate-600">Màu nút bấm chủ đạo</label>
                       <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded border border-slate-200" style={{backgroundColor: primaryColor}}></div>
                          <span className="text-sm font-mono font-bold text-slate-700 uppercase">{primaryColor}</span>
                       </div>
                    </div>
                    <div className="space-y-2">
                       <label className="block text-[13px] font-medium text-slate-600">Màu chữ chủ đạo</label>
                       <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded border border-slate-200" style={{backgroundColor: textColor}}></div>
                          <span className="text-sm font-mono font-bold text-slate-700 uppercase">{textColor}</span>
                       </div>
                    </div>
                 </div>
              </div>
              <div className="space-y-6">
                 <h3 className="text-[14px] font-bold text-slate-700 uppercase tracking-wide flex items-center gap-2">Logo Preview <Info className="w-4 h-4 text-slate-400" /></h3>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="block text-[13px] font-medium text-slate-600">Logo kích cỡ đầy đủ</label>
                       <div className="h-28 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 flex flex-col items-center justify-center cursor-pointer hover:border-slate-300">
                          <Upload className="w-6 h-6 text-slate-400 mb-2" />
                          <span className="text-[11px] font-bold text-slate-500">TẢI ẢNH LÊN</span>
                       </div>
                    </div>
                    <div className="space-y-2">
                       <label className="block text-[13px] font-medium text-slate-600">Logo thu gọn</label>
                       <div className="h-28 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 flex flex-col items-center justify-center cursor-pointer hover:border-slate-300">
                          <Upload className="w-6 h-6 text-slate-400 mb-2" />
                          <span className="text-[11px] font-bold text-slate-500">TẢI ẢNH LÊN</span>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* Representative Info */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-slate-50" onClick={() => setRepExpanded(!repExpanded)}>
            <div className="flex items-center gap-3">
               {repExpanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
               <h2 className="text-[16px] font-semibold text-[#1E2328]">Thông tin người đại diện</h2>
            </div>
            <button onClick={(e) => { e.stopPropagation(); setIsEditRepOpen(true); }} className="p-2 hover:bg-slate-200 rounded-lg text-slate-500 cursor-pointer"><Edit2 className="w-4 h-4" /></button>
          </div>
          {repExpanded && (
            <div className="p-6 pt-2 border-t border-slate-50">
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-6 gap-x-12">
                  <div className="space-y-1"><span className="text-[13px] text-slate-500">Doanh nghiệp</span><p className="text-[14px] font-semibold text-slate-700">{settings?.rep_business || "N/A"}</p></div>
                  <div className="space-y-1"><span className="text-[13px] text-slate-500">Người đại diện</span><p className="text-[14px] font-semibold text-slate-700">{settings?.rep_name || "N/A"}</p></div>
                  <div className="space-y-1"><span className="text-[13px] text-slate-500">Chức vụ</span><p className="text-[14px] font-semibold text-slate-700">{settings?.rep_position || "N/A"}</p></div>
                  <div className="space-y-1"><span className="text-[13px] text-slate-500">Số điện thoại</span><p className="text-[14px] font-semibold text-slate-700">{settings?.rep_phone || "N/A"}</p></div>
                  <div className="space-y-1"><span className="text-[13px] text-slate-500">Email</span><p className="text-[14px] font-semibold text-slate-700">{settings?.rep_email || "N/A"}</p></div>
                  <div className="space-y-1"><span className="text-[13px] text-slate-500">Mã số thuế</span><p className="text-[14px] font-semibold text-slate-700">{settings?.tax_code || "N/A"}</p></div>
                  <div className="md:col-span-2 lg:col-span-3 space-y-1"><span className="text-[13px] text-slate-500">Địa chỉ</span><p className="text-[14px] font-semibold text-slate-700">{settings?.rep_address || "N/A"}</p></div>
               </div>
            </div>
          )}
        </div>

        {/* Payment Settings */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 overflow-hidden">
           <h2 className="text-[16px] font-semibold text-[#1E2328] mb-6">Cài đặt quy trình & thanh toán</h2>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
              <div className="space-y-4">
                 <h3 className="text-[14px] font-bold text-slate-700 uppercase tracking-wide">Cách tính tròn tháng</h3>
                 <div className="flex gap-6">
                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input type="radio" checked={settings?.payment_cycle !== 'actual_days'} onChange={() => handlePaymentConfigChange('payment_cycle', '30_days')} className="w-4 h-4 text-brand-primary" />
                      <span className="text-[14px]">Chu kỳ (30 ngày)</span>
                    </label>
                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input type="radio" checked={settings?.payment_cycle === 'actual_days'} onChange={() => handlePaymentConfigChange('payment_cycle', 'actual_days')} className="w-4 h-4 text-brand-primary" />
                      <span className="text-[14px]">Theo lịch thực tế</span>
                    </label>
                 </div>
              </div>
              <div className="space-y-4">
                 <h3 className="text-[14px] font-bold text-slate-700 uppercase tracking-wide">Đơn giá ngày lẻ</h3>
                 <div className="flex gap-6">
                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input type="radio" checked={settings?.odd_day_calc !== 'actual_days'} onChange={() => handlePaymentConfigChange('odd_day_calc', '30_days_fixed')} className="w-4 h-4 text-brand-primary" />
                      <span className="text-[14px]">Theo 30 ngày cố định</span>
                    </label>
                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input type="radio" checked={settings?.odd_day_calc === 'actual_days'} onChange={() => handlePaymentConfigChange('odd_day_calc', 'actual_days')} className="w-4 h-4 text-brand-primary" />
                      <span className="text-[14px]">Số ngày thực tế</span>
                    </label>
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* MODALS */}
      <Modal isOpen={isEditSocialOpen} onClose={() => setIsEditSocialOpen(false)} title="Chỉnh sửa mạng xã hội" size="md">
         <form onSubmit={async (e) => { 
            e.preventDefault(); 
            const form = new FormData(e.currentTarget);
            const data = {
                social_website: form.get("social_website"),
                social_facebook: form.get("social_facebook"),
                social_instagram: form.get("social_instagram"),
                social_twitter: form.get("social_twitter"),
                social_linkedin: form.get("social_linkedin"),
                social_zalo: form.get("social_zalo"),
                social_messenger: form.get("social_messenger"),
                social_tiktok: form.get("social_tiktok"),
            };
            await handleUpdate(data, () => setIsEditSocialOpen(false));
         }} className="p-6 space-y-5">
            <div className="space-y-4">
               {[
                  { Icon: Globe, name: "social_website", label: "Website", placeholder: "Nhập website link", val: settings?.social_website },
                  { Icon: Facebook, name: "social_facebook", label: "Facebook", placeholder: "Nhập facebook link", val: settings?.social_facebook },
                  { Icon: Instagram, name: "social_instagram", label: "Instagram", placeholder: "Nhập instagram link", val: settings?.social_instagram },
                  { Icon: Twitter, name: "social_twitter", label: "Twitter", placeholder: "Nhập twitter link", val: settings?.social_twitter },
                  { Icon: Linkedin, name: "social_linkedin", label: "Linkedin", placeholder: "Nhập linkedin link", val: settings?.social_linkedin },
                  { Icon: MessageCircle, name: "social_zalo", label: "Zalo", placeholder: "Nhập zalo link", val: settings?.social_zalo },
                  { Icon: AtSign, name: "social_messenger", label: "Messenger", placeholder: "Nhập messenger link", val: settings?.social_messenger },
                  { Icon: Music2, name: "social_tiktok", label: "Tiktok", placeholder: "Nhập tiktok link", val: settings?.social_tiktok },
               ].map((s, i) => (
                  <div key={i} className="flex flex-col gap-1.5">
                     <label className="text-[13px] font-bold text-slate-700 flex items-center gap-2"><s.Icon className="w-4 h-4 text-slate-400" /> {s.label}</label>
                     <input type="text" name={s.name} defaultValue={s.val || ""} placeholder={s.placeholder} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-brand-primary outline-none" />
                  </div>
               ))}
            </div>
            <div className="flex justify-end gap-3 mt-8 pt-5 border-t border-slate-100">
               <button type="button" onClick={() => setIsEditSocialOpen(false)} className="px-5 py-2.5 text-sm font-bold text-slate-600 cursor-pointer">Hủy</button>
               <button type="submit" className="px-6 py-2.5 text-sm font-bold bg-[#FFC015] text-slate-900 rounded-lg shadow-sm cursor-pointer">Lưu</button>
            </div>
         </form>
      </Modal>

      <Modal isOpen={isEditBusinessOpen} onClose={() => setIsEditBusinessOpen(false)} title="Chỉnh sửa thông tin chung" size="lg">
         <form onSubmit={async (e) => { 
            e.preventDefault(); 
            const form = new FormData(e.currentTarget);
            const data = {
                brand_name: form.get("brand_name"),
                phone: form.get("phone"),
                email: form.get("email"),
                description: form.get("description"),
            };
            await handleUpdate(data, () => setIsEditBusinessOpen(false));
         }} className="p-6 space-y-5">
            <div className="grid grid-cols-2 gap-4">
               <div className="col-span-2">
                 <label className="block text-[13px] font-bold mb-1.5">Tên doanh nghiệp *</label>
                 <input type="text" name="brand_name" defaultValue={settings?.brand_name || ""} className="w-full px-3 py-2 border rounded-lg outline-none" required />
               </div>
               <div>
                 <label className="block text-[13px] font-bold mb-1.5">Số điện thoại *</label>
                 <input type="text" name="phone" defaultValue={settings?.phone || ""} className="w-full px-3 py-2 border rounded-lg outline-none" required />
               </div>
               <div>
                 <label className="block text-[13px] font-bold mb-1.5">Email doanh nghiệp *</label>
                 <input type="email" name="email" defaultValue={settings?.email || ""} className="w-full px-3 py-2 border rounded-lg outline-none" required />
               </div>
               <div className="col-span-2">
                 <label className="block text-[13px] font-bold mb-1.5">Mô tả</label>
                 <textarea name="description" defaultValue={settings?.description || ""} className="w-full px-3 py-2 border rounded-lg outline-none min-h-[100px]"></textarea>
               </div>
            </div>
            <div className="flex justify-end gap-3 mt-8 pt-5 border-t border-slate-100">
               <button type="button" onClick={() => setIsEditBusinessOpen(false)} className="px-5 py-2.5 text-sm font-bold text-slate-600 cursor-pointer">Hủy</button>
               <button type="submit" className="px-6 py-2.5 text-sm font-bold bg-[#FFC015] text-slate-900 rounded-lg cursor-pointer">Lưu</button>
            </div>
         </form>
      </Modal>

      <Modal isOpen={isEditRepOpen} onClose={() => setIsEditRepOpen(false)} title="Chỉnh sửa người đại diện" size="lg">
         <form onSubmit={async (e) => { 
            e.preventDefault(); 
            const form = new FormData(e.currentTarget);
            const data = {
                rep_business: form.get("rep_business"),
                rep_name: form.get("rep_name"),
                rep_position: form.get("rep_position"),
                rep_phone: form.get("rep_phone"),
                rep_email: form.get("rep_email"),
            };
            await handleUpdate(data, () => setIsEditRepOpen(false));
         }} className="p-6 space-y-5">
            <div className="grid grid-cols-2 gap-4">
               <div className="col-span-2">
                 <label className="block text-[13px] font-bold mb-1.5">Tên doanh nghiệp / pháp nhân</label>
                 <input type="text" name="rep_business" defaultValue={settings?.rep_business || ""} className="w-full px-3 py-2 border rounded-lg outline-none" />
               </div>
               <div>
                 <label className="block text-[13px] font-bold mb-1.5">Người đại diện *</label>
                 <input type="text" name="rep_name" defaultValue={settings?.rep_name || ""} className="w-full px-3 py-2 border rounded-lg outline-none" required />
               </div>
               <div>
                 <label className="block text-[13px] font-bold mb-1.5">Chức vụ</label>
                 <input type="text" name="rep_position" defaultValue={settings?.rep_position || ""} className="w-full px-3 py-2 border rounded-lg outline-none" />
               </div>
               <div>
                 <label className="block text-[13px] font-bold mb-1.5">Số điện thoại *</label>
                 <input type="text" name="rep_phone" defaultValue={settings?.rep_phone || ""} className="w-full px-3 py-2 border rounded-lg outline-none" required />
               </div>
               <div>
                 <label className="block text-[13px] font-bold mb-1.5">Email</label>
                 <input type="email" name="rep_email" defaultValue={settings?.rep_email || ""} className="w-full px-3 py-2 border rounded-lg outline-none" />
               </div>
            </div>
            <div className="flex justify-end gap-3 mt-8 pt-5 border-t border-slate-100">
               <button type="button" onClick={() => setIsEditRepOpen(false)} className="px-5 py-2.5 font-bold cursor-pointer">Hủy</button>
               <button type="submit" className="px-6 py-2.5 font-bold bg-[#FFC015] rounded-lg cursor-pointer">Lưu</button>
            </div>
         </form>
      </Modal>
    </div>
  );
}

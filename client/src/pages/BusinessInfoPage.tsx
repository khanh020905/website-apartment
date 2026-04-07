import { useState } from "react";
import { Edit2, Plus, ChevronDown, ChevronUp, Check, Info, Upload, Camera, User, Mail, Phone, MapPin, Globe, MessageCircle, AtSign, Music2 } from "lucide-react";
import Modal from "../components/modals/Modal";

// Mock icons to replace missing Lucide icons
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

interface BusinessData {
  brandName: string;
  taxCode: string;
  phone: string;
  email: string;
  address: string;
  website: string;
}

interface RepData {
  business: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  address: string;
  taxCode: string;
}

export default function BusinessInfoPage() {
  const [isEditBusinessOpen, setIsEditBusinessOpen] = useState(false);
  const [isEditRepOpen, setIsEditRepOpen] = useState(false);
  const [isEditSocialOpen, setIsEditSocialOpen] = useState(false);
  
  const [businessExpanded, setBusinessExpanded] = useState(true);
  const [repExpanded, setRepExpanded] = useState(true);

  const [business, setBusiness] = useState<BusinessData>({
    brandName: "Trà My",
    taxCode: "0108427956",
    phone: "0886539201",
    email: "nguyenvinhthitramy@gmail.com",
    address: "123 Nguyen Van Linh, Hai Chau, Da Nang, , Đà Nẵng, Vietnam",
    website: "",
  });

  const [rep, setRep] = useState<RepData>({
    business: "Công ty TNHH Smartos",
    name: "Trà My",
    email: "nguyenvinhthitramy@gmail.com",
    phone: "0886539201",
    position: "N/A",
    address: "123 Nguyen Van Linh, Hai Chau, Da Nang, , Đà Nẵng, Vietnam",
    taxCode: "0108427956",
  });

  // Branding States
  const [primaryColor, setPrimaryColor] = useState("#FFBA38");
  const [textColor, setTextColor] = useState("#000000");

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
              >
                 <Edit2 className="w-4 h-4" />
              </button>

              <div className="w-full lg:w-[350px] aspect-[16/10] bg-[#eef0f2] rounded-xl relative flex items-center justify-center border border-slate-100 shrink-0">
                 <div className="w-24 h-24 text-slate-300">
                    <img src="https://tra-my.smartos.space/assets/images/no-image.png" alt="" className="w-full h-full object-contain opacity-20" />
                 </div>
                 <button className="absolute top-3 right-3 w-8 h-8 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-500 shadow-sm hover:bg-slate-50 transition-all">
                    <Camera className="w-4 h-4" />
                 </button>
              </div>

              <div className="flex-1 flex flex-col pt-2">
                 <div className="mb-8">
                    <h2 className="text-[28px] font-bold text-slate-900 leading-tight">{business.brandName}</h2>
                    <p className="text-[14px] font-medium text-slate-400 mt-1">N/A</p>
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
                                <p className="text-[14px] font-bold text-slate-800">{rep.name}</p>
                                <p className="text-[12px] text-slate-500">{rep.email}</p>
                             </div>
                          </div>
                          <div className="flex items-center gap-3 pl-1.5">
                             <Mail className="w-4 h-4 text-slate-400" />
                             <span className="text-[13px] font-medium text-slate-600">{business.email}</span>
                          </div>
                          <div className="flex items-center gap-3 pl-1.5">
                             <Phone className="w-4 h-4 text-slate-400" />
                             <span className="text-[13px] font-medium text-slate-600">{business.phone}</span>
                          </div>
                          <div className="flex items-start gap-3 pl-1.5 pt-0.5">
                             <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                             <span className="text-[13px] font-medium text-slate-600 leading-relaxed max-w-[300px]">{business.address}</span>
                          </div>
                       </div>
                    </div>

                    <div className="space-y-5">
                       <h3 className="text-[14px] font-bold text-slate-800">Mạng xã hội</h3>
                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-4">
                          {[
                             { Icon: Globe, label: "Thêm đường dẫn" },
                             { Icon: Facebook, label: "Thêm đường dẫn", color: "text-blue-600" },
                             { Icon: Instagram, label: "Thêm đường dẫn", color: "text-rose-500" },
                             { Icon: Twitter, label: "Thêm đường dẫn", color: "text-sky-500" },
                             { Icon: Linkedin, label: "Thêm đường dẫn", color: "text-blue-700" },
                             { Icon: MessageCircle, label: "Thêm đường dẫn", color: "text-blue-500" },
                             { Icon: AtSign, label: "Messenger", color: "text-sky-400" },
                             { Icon: Music2, label: "Tiktok", color: "text-slate-900" },
                          ].map((social, i) => (
                             <button 
                                key={i} 
                                onClick={() => setIsEditSocialOpen(true)}
                                className="flex items-center gap-2.5 text-[13px] font-medium text-slate-400 hover:text-slate-600 transition-colors group text-left"
                             >
                                <social.Icon className={`w-4.5 h-4.5 ${social.color || 'text-slate-600'}`} />
                                <span className="underline decoration-slate-200 underline-offset-4 group-hover:decoration-slate-400">{social.label === "Messenger" || social.label === "Tiktok" ? social.label : "Thêm đường dẫn"}</span>
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
              <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
                 <Plus className="w-6 h-6" />
              </div>
              <div>
                 <p className="text-[13px] font-medium text-slate-500 uppercase tracking-wider">Toà nhà hoạt động</p>
                 <h3 className="text-[24px] font-bold text-slate-900">5</h3>
              </div>
           </div>
           <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                 <Check className="w-6 h-6" />
              </div>
              <div>
                 <p className="text-[13px] font-medium text-slate-500 uppercase tracking-wider">Người dùng</p>
                 <h3 className="text-[24px] font-bold text-slate-900">3</h3>
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
                       <div className="h-28 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 flex flex-col items-center justify-center">
                          <Upload className="w-6 h-6 text-slate-400 mb-2" />
                          <span className="text-[11px] font-bold text-slate-500">TẢI ẢNH LÊN</span>
                       </div>
                    </div>
                    <div className="space-y-2">
                       <label className="block text-[13px] font-medium text-slate-600">Logo thu gọn</label>
                       <div className="h-28 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 flex flex-col items-center justify-center">
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
            <button onClick={(e) => { e.stopPropagation(); setIsEditRepOpen(true); }} className="p-2 hover:bg-slate-200 rounded-lg text-slate-500"><Edit2 className="w-4 h-4" /></button>
          </div>
          {repExpanded && (
            <div className="p-6 pt-2 border-t border-slate-50">
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-6 gap-x-12">
                  <div className="space-y-1"><span className="text-[13px] text-slate-500">Doanh nghiệp</span><p className="text-[14px] font-semibold">{rep.business}</p></div>
                  <div className="space-y-1"><span className="text-[13px] text-slate-500">Người đại diện</span><p className="text-[14px] font-semibold">{rep.name}</p></div>
                  <div className="space-y-1"><span className="text-[13px] text-slate-500">Chức vụ</span><p className="text-[14px] font-semibold">{rep.position}</p></div>
                  <div className="space-y-1"><span className="text-[13px] text-slate-500">Số điện thoại</span><p className="text-[14px] font-semibold">{rep.phone}</p></div>
                  <div className="space-y-1"><span className="text-[13px] text-slate-500">Email</span><p className="text-[14px] font-semibold">{rep.email}</p></div>
                  <div className="space-y-1"><span className="text-[13px] text-slate-500">Mã số thuế</span><p className="text-[14px] font-semibold">{rep.taxCode}</p></div>
                  <div className="md:col-span-2 lg:col-span-3 space-y-1"><span className="text-[13px] text-slate-500">Địa chỉ</span><p className="text-[14px] font-semibold">{rep.address}</p></div>
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
                    <label className="flex items-center gap-2.5 cursor-pointer"><input type="radio" name="round_month" defaultChecked className="w-4 h-4 text-amber-500" /><span className="text-[14px]">Chu kỳ (30 ngày)</span></label>
                    <label className="flex items-center gap-2.5 cursor-pointer"><input type="radio" name="round_month" className="w-4 h-4 text-amber-500" /><span className="text-[14px]">Theo lịch thực tế</span></label>
                 </div>
              </div>
              <div className="space-y-4">
                 <h3 className="text-[14px] font-bold text-slate-700 uppercase tracking-wide">Đơn giá ngày lẻ</h3>
                 <div className="flex gap-6">
                    <label className="flex items-center gap-2.5 cursor-pointer"><input type="radio" name="unit_price" defaultChecked className="w-4 h-4 text-amber-500" /><span className="text-[14px]">Theo 30 ngày cố định</span></label>
                    <label className="flex items-center gap-2.5 cursor-pointer"><input type="radio" name="unit_price" className="w-4 h-4 text-amber-500" /><span className="text-[14px]">Số ngày thực tế</span></label>
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* MODALS */}
      <Modal isOpen={isEditSocialOpen} onClose={() => setIsEditSocialOpen(false)} title="Chỉnh sửa mạng xã hội" size="md">
         <form onSubmit={(e) => { e.preventDefault(); setIsEditSocialOpen(false); }} className="p-6 space-y-5">
            <div className="space-y-4">
               {[
                  { Icon: Globe, label: "Website", placeholder: "Nhập website link" },
                  { Icon: Facebook, label: "Facebook", placeholder: "Nhập facebook link" },
                  { Icon: Instagram, label: "Instagram", placeholder: "Nhập instagram link" },
                  { Icon: Twitter, label: "Twitter", placeholder: "Nhập twitter link" },
                  { Icon: Linkedin, label: "Linkedin", placeholder: "Nhập linkedin link" },
                  { Icon: MessageCircle, label: "Zalo", placeholder: "Nhập zalo link" },
                  { Icon: AtSign, label: "Messenger", placeholder: "Nhập messenger link" },
                  { Icon: Music2, label: "Tiktok", placeholder: "Nhập tiktok link" },
               ].map((s, i) => (
                  <div key={i} className="flex flex-col gap-1.5">
                     <label className="text-[13px] font-bold text-slate-700 flex items-center gap-2"><s.Icon className="w-4 h-4 text-slate-400" /> {s.label}</label>
                     <input type="text" placeholder={s.placeholder} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-amber-400 outline-none" />
                  </div>
               ))}
            </div>
            <div className="flex justify-end gap-3 mt-8 pt-5 border-t border-slate-100">
               <button type="button" onClick={() => setIsEditSocialOpen(false)} className="px-5 py-2.5 text-sm font-bold text-slate-600">Hủy</button>
               <button type="submit" className="px-6 py-2.5 text-sm font-bold bg-[#FFC015] text-slate-900 rounded-lg shadow-sm">Lưu</button>
            </div>
         </form>
      </Modal>

      <Modal isOpen={isEditBusinessOpen} onClose={() => setIsEditBusinessOpen(false)} title="Chỉnh sửa thông tin chung" size="lg">
         <form onSubmit={(e) => { e.preventDefault(); setIsEditBusinessOpen(false); }} className="p-6 space-y-5">
            <div className="grid grid-cols-2 gap-4">
               <div className="col-span-2"><label className="block text-[13px] font-bold mb-1.5">Tên doanh nghiệp *</label><input type="text" defaultValue={business.brandName} className="w-full px-3 py-2 border rounded-lg outline-none" required /></div>
               <div><label className="block text-[13px] font-bold mb-1.5">Số điện thoại *</label><input type="text" defaultValue={business.phone} className="w-full px-3 py-2 border rounded-lg outline-none" required /></div>
               <div><label className="block text-[13px] font-bold mb-1.5">Email doanh nghiệp *</label><input type="email" defaultValue={business.email} className="w-full px-3 py-2 border rounded-lg outline-none" required /></div>
               <div className="col-span-2"><label className="block text-[13px] font-bold mb-1.5">Mô tả</label><textarea className="w-full px-3 py-2 border rounded-lg outline-none min-h-[100px]"></textarea></div>
            </div>
            <div className="flex justify-end gap-3 mt-8 pt-5 border-t border-slate-100">
               <button type="button" onClick={() => setIsEditBusinessOpen(false)} className="px-5 py-2.5 text-sm font-bold text-slate-600">Hủy</button>
               <button type="submit" className="px-6 py-2.5 text-sm font-bold bg-[#FFC015] text-slate-900 rounded-lg">Lưu</button>
            </div>
         </form>
      </Modal>

      <Modal isOpen={isEditRepOpen} onClose={() => setIsEditRepOpen(false)} title="Chỉnh sửa người đại diện" size="lg">
         <form onSubmit={(e) => { e.preventDefault(); setIsEditRepOpen(false); }} className="p-6 space-y-5">
            <div className="grid grid-cols-2 gap-4">
               <div className="col-span-2"><label className="block text-[13px] font-bold">Tên doanh nghiệp</label><input type="text" defaultValue={rep.business} className="w-full px-3 py-2 border rounded-lg outline-none" /></div>
               <div><label className="block text-[13px] font-bold">Người đại diện *</label><input type="text" defaultValue={rep.name} className="w-full px-3 py-2 border rounded-lg outline-none" required /></div>
               <div><label className="block text-[13px] font-bold">Chức vụ</label><input type="text" defaultValue={rep.position} className="w-full px-3 py-2 border rounded-lg outline-none" /></div>
               <div><label className="block text-[13px] font-bold">Số điện thoại *</label><input type="text" defaultValue={rep.phone} className="w-full px-3 py-2 border rounded-lg outline-none" required /></div>
               <div><label className="block text-[13px] font-bold">Email</label><input type="email" defaultValue={rep.email} className="w-full px-3 py-2 border rounded-lg outline-none" /></div>
            </div>
            <div className="flex justify-end gap-3 mt-8 pt-5 border-t">
               <button type="button" onClick={() => setIsEditRepOpen(false)} className="px-5 py-2.5 font-bold">Hủy</button>
               <button type="submit" className="px-6 py-2.5 font-bold bg-[#FFC015] rounded-lg">Lưu</button>
            </div>
         </form>
      </Modal>
    </div>
  );
}

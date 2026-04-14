import { useRef, useState } from "react";
import { Camera, ChevronDown, Upload } from "lucide-react";
import { api } from "../../lib/api";

interface CustomerFormProps {
   // eslint-disable-next-line @typescript-eslint/no-explicit-any
   onSubmit: (data: any) => void;
   onCancel: () => void;
   initialData?: any;
}

const countries = [
  { name: "Afghanistan", flag: "🇦🇫", code: "AF" },
  { name: "Albania", flag: "🇦🇱", code: "AL" },
  { name: "Algeria", flag: "🇩🇿", code: "DZ" },
  { name: "Andorra", flag: "🇦🇩", code: "AD" },
  { name: "Angola", flag: "🇦🇴", code: "AO" },
  { name: "Argentina", flag: "🇦🇷", code: "AR" },
  { name: "Armenia", flag: "🇦🇲", code: "AM" },
  { name: "Australia", flag: "🇦🇺", code: "AU" },
  { name: "Austria", flag: "🇦🇹", code: "AT" },
  { name: "Azerbaijan", flag: "🇦🇿", code: "AZ" },
  { name: "Bahamas", flag: "🇧🇸", code: "BS" },
  { name: "Bahrain", flag: "🇧🇭", code: "BH" },
  { name: "Bangladesh", flag: "🇧🇩", code: "BD" },
  { name: "Barbados", flag: "🇧🇧", code: "BB" },
  { name: "Belarus", flag: "🇧🇾", code: "BY" },
  { name: "Belgium", flag: "🇧🇪", code: "BE" },
  { name: "Belize", flag: "🇧🇿", code: "BZ" },
  { name: "Benin", flag: "🇧🇯", code: "BJ" },
  { name: "Bhutan", flag: "🇧🇹", code: "BT" },
  { name: "Bolivia", flag: "🇧🇴", code: "BO" },
  { name: "Bosnia and Herzegovina", flag: "🇧🇦", code: "BA" },
  { name: "Botswana", flag: "🇧🇼", code: "BW" },
  { name: "Brazil", flag: "🇧🇷", code: "BR" },
  { name: "Brunei", flag: "🇧🇳", code: "BN" },
  { name: "Bulgaria", flag: "🇧🇬", code: "BG" },
  { name: "Burkina Faso", flag: "🇧🇫", code: "BF" },
  { name: "Burundi", flag: "🇧🇮", code: "BI" },
  { name: "Cambodia", flag: "🇰🇭", code: "KH" },
  { name: "Cameroon", flag: "🇨🇲", code: "CM" },
  { name: "Canada", flag: "🇨🇦", code: "CA" },
  { name: "Chile", flag: "🇨🇱", code: "CL" },
  { name: "China", flag: "🇨🇳", code: "CN" },
  { name: "Colombia", flag: "🇨🇴", code: "CO" },
  { name: "Costa Rica", flag: "🇨🇷", code: "CR" },
  { name: "Croatia", flag: "🇭🇷", code: "HR" },
  { name: "Cuba", flag: "🇨🇺", code: "CU" },
  { name: "Cyprus", flag: "🇨🇾", code: "CY" },
  { name: "Czech Republic", flag: "🇨🇿", code: "CZ" },
  { name: "Denmark", flag: "🇩🇰", code: "DK" },
  { name: "Dominica", flag: "🇩🇲", code: "DM" },
  { name: "Dominican Republic", flag: "🇩🇴", code: "DO" },
  { name: "Ecuador", flag: "🇪🇨", code: "EC" },
  { name: "Egypt", flag: "🇪🇬", code: "EG" },
  { name: "El Salvador", flag: "🇸🇻", code: "SV" },
  { name: "Estonia", flag: "🇪🇪", code: "EE" },
  { name: "Ethiopia", flag: "🇪🇹", code: "ET" },
  { name: "Fiji", flag: "🇫🇯", code: "FJ" },
  { name: "Finland", flag: "🇫🇮", code: "FI" },
  { name: "France", flag: "🇫🇷", code: "FR" },
  { name: "Gabon", flag: "🇬🇦", code: "GA" },
  { name: "Gambia", flag: "🇬🇲", code: "GM" },
  { name: "Georgia", flag: "🇬🇪", code: "GE" },
  { name: "Germany", flag: "🇩🇪", code: "DE" },
  { name: "Ghana", flag: "🇬🇭", code: "GH" },
  { name: "Greece", flag: "🇬🇷", code: "GR" },
  { name: "Grenada", flag: "🇬🇩", code: "GD" },
  { name: "Guatemala", flag: "🇬🇹", code: "GT" },
  { name: "Guinea", flag: "🇬🇳", code: "GN" },
  { name: "Guyana", flag: "🇬🇾", code: "GY" },
  { name: "Haiti", flag: "🇭🇹", code: "HT" },
  { name: "Honduras", flag: "🇭🇳", code: "HN" },
  { name: "Hungary", flag: "🇭🇺", code: "HU" },
  { name: "Iceland", flag: "🇮🇸", code: "IS" },
  { name: "India", flag: "🇮🇳", code: "IN" },
  { name: "Indonesia", flag: "🇮🇩", code: "ID" },
  { name: "Iran", flag: "🇮🇷", code: "IR" },
  { name: "Iraq", flag: "🇮🇶", code: "IQ" },
  { name: "Ireland", flag: "🇮🇪", code: "IE" },
  { name: "Israel", flag: "🇮🇱", code: "IL" },
  { name: "Italy", flag: "🇮🇹", code: "IT" },
  { name: "Jamaica", flag: "🇯🇲", code: "JM" },
  { name: "Japan", flag: "🇯🇵", code: "JP" },
  { name: "Jordan", flag: "🇯🇴", code: "JO" },
  { name: "Kazakhstan", flag: "🇰🇿", code: "KZ" },
  { name: "Kenya", flag: "🇰🇪", code: "KE" },
  { name: "Kuwait", flag: "🇰🇼", code: "KW" },
  { name: "Kyrgyzstan", flag: "🇰🇬", code: "KG" },
  { name: "Laos", flag: "🇱🇦", code: "LA" },
  { name: "Latvia", flag: "🇱🇻", code: "LV" },
  { name: "Lebanon", flag: "🇱🇧", code: "LB" },
  { name: "Libya", flag: "🇱🇾", code: "LY" },
  { name: "Lithuania", flag: "🇱🇹", code: "LT" },
  { name: "Luxembourg", flag: "🇱🇺", code: "LU" },
  { name: "Madagascar", flag: "🇲🇬", code: "MG" },
  { name: "Malawi", flag: "🇲🇼", code: "MW" },
  { name: "Malaysia", flag: "🇲🇾", code: "MY" },
  { name: "Maldives", flag: "🇲🇻", code: "MV" },
  { name: "Mali", flag: "🇲🇱", code: "ML" },
  { name: "Malta", flag: "🇲🇹", code: "MT" },
  { name: "Mauritania", flag: "🇲🇷", code: "MR" },
  { name: "Mauritius", flag: "🇲🇺", code: "MU" },
  { name: "Mexico", flag: "🇲🇽", code: "MX" },
  { name: "Moldova", flag: "🇲🇩", code: "MD" },
  { name: "Monaco", flag: "🇲🇨", code: "MC" },
  { name: "Mongolia", flag: "🇲🇳", code: "MN" },
  { name: "Montenegro", flag: "🇲🇪", code: "ME" },
  { name: "Morocco", flag: "🇲🇦", code: "MA" },
  { name: "Mozambique", flag: "🇲🇿", code: "MZ" },
  { name: "Myanmar", flag: "🇲🇲", code: "MM" },
  { name: "Namibia", flag: "🇳🇦", code: "NA" },
  { name: "Nepal", flag: "🇳🇵", code: "NP" },
  { name: "Netherlands", flag: "🇳🇱", code: "NL" },
  { name: "New Zealand", flag: "🇳🇿", code: "NZ" },
  { name: "Nicaragua", flag: "🇳🇮", code: "NI" },
  { name: "Niger", flag: "🇳🇪", code: "NE" },
  { name: "Nigeria", flag: "🇳🇬", code: "NG" },
  { name: "North Korea", flag: "🇰🇵", code: "KP" },
  { name: "Norway", flag: "🇳🇴", code: "NO" },
  { name: "Oman", flag: "🇴🇲", code: "OM" },
  { name: "Pakistan", flag: "🇵🇰", code: "PK" },
  { name: "Panama", flag: "🇵🇦", code: "PA" },
  { name: "Paraguay", flag: "🇵🇾", code: "PY" },
  { name: "Peru", flag: "🇵🇪", code: "PE" },
  { name: "Philippines", flag: "🇵🇭", code: "PH" },
  { name: "Poland", flag: "🇵🇱", code: "PL" },
  { name: "Portugal", flag: "🇵🇹", code: "PT" },
  { name: "Qatar", flag: "🇶🇦", code: "QA" },
  { name: "Romania", flag: "🇷🇴", code: "RO" },
  { name: "Russia", flag: "🇷🇺", code: "RU" },
  { name: "Rwanda", flag: "🇷🇼", code: "RW" },
  { name: "Saudi Arabia", flag: "🇸🇦", code: "SA" },
  { name: "Senegal", flag: "🇸🇳", code: "SN" },
  { name: "Serbia", flag: "🇷🇸", code: "RS" },
  { name: "Singapore", flag: "🇸🇬", code: "SG" },
  { name: "Slovakia", flag: "🇸🇰", code: "SK" },
  { name: "Slovenia", flag: "🇸🇮", code: "SI" },
  { name: "Somalia", flag: "🇸🇴", code: "SO" },
  { name: "South Africa", flag: "🇿🇦", code: "ZA" },
  { name: "South Korea", flag: "🇰🇷", code: "KR" },
  { name: "Spain", flag: "🇪🇸", code: "ES" },
  { name: "Sri Lanka", flag: "🇱🇰", code: "LK" },
  { name: "Sudan", flag: "🇸🇩", code: "SD" },
  { name: "Suriname", flag: "🇸🇷", code: "SR" },
  { name: "Sweden", flag: "🇸🇪", code: "SE" },
  { name: "Switzerland", flag: "🇨🇭", code: "CH" },
  { name: "Syria", flag: "🇸🇾", code: "SY" },
  { name: "Taiwan", flag: "🇹🇼", code: "TW" },
  { name: "Tajikistan", flag: "🇹🇯", code: "TJ" },
  { name: "Tanzania", flag: "🇹🇿", code: "TZ" },
  { name: "Thailand", flag: "🇹🇭", code: "TH" },
  { name: "Togo", flag: "🇹🇬", code: "TG" },
  { name: "Tunisia", flag: "🇹🇳", code: "TN" },
  { name: "Turkey", flag: "🇹🇷", code: "TR" },
  { name: "Turkmenistan", flag: "🇹🇲", code: "TM" },
  { name: "Uganda", flag: "🇺🇬", code: "UG" },
  { name: "Ukraine", flag: "🇺🇦", code: "UA" },
  { name: "United Arab Emirates", flag: "🇦🇪", code: "AE" },
  { name: "United Kingdom", flag: "🇬🇧", code: "GB" },
  { name: "United States", flag: "🇺🇸", code: "US" },
  { name: "Uruguay", flag: "🇺🇾", code: "UY" },
  { name: "Uzbekistan", flag: "🇺🇿", code: "UZ" },
  { name: "Vanuatu", flag: "🇻🇺", code: "VU" },
  { name: "Venezuela", flag: "🇻🇪", code: "VE" },
  { name: "Yemen", flag: "🇾🇪", code: "YE" },
  { name: "Zambia", flag: "🇿🇲", code: "ZM" },
  { name: "Zimbabwe", flag: "🇿🇼", code: "ZW" },
];

const CustomerForm = ({ onSubmit, onCancel, initialData }: CustomerFormProps) => {
   const [formData, setFormData] = useState({
      tenant_name: initialData?.tenant_name || "",
      tenant_email: initialData?.tenant_email || "",
      tenant_phone: initialData?.tenant_phone || "",
      tenant_gender: initialData?.tenant_gender || "",
      tenant_dob: initialData?.tenant_dob || "",
      tenant_job: initialData?.tenant_job || "",
      tenant_nationality: initialData?.tenant_nationality || "Vietnam",
      tenant_city: initialData?.tenant_city || "",
      tenant_district: initialData?.tenant_district || "",
      tenant_ward: initialData?.tenant_ward || "",
      tenant_address: initialData?.tenant_address || "",
      tenant_notes: initialData?.tenant_notes || "",
      tenant_avatar: initialData?.tenant_avatar || "",
   });

   const [avatarUploadError, setAvatarUploadError] = useState("");
   const avatarInputRef = useRef<HTMLInputElement | null>(null);
   const [isNationalityOpen, setIsNationalityOpen] = useState(false);

   const handleChange = (
      e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
   ) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
   };

   const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSubmit(formData);
   };

   const handleAvatarUpload = async (file: File | null) => {
      if (!file) return;
      setAvatarUploadError("");
      const uploadFormData = new FormData();
      uploadFormData.append("avatar", file);
      const { data, error } = await api.upload<{ url: string }>("/api/customers/upload-avatar", uploadFormData);

      if (error || !data?.url) {
         setAvatarUploadError(error || "Không thể tải ảnh lên");
         return;
      }

      setFormData((prev) => ({ ...prev, tenant_avatar: data.url }));
   };

   return (
      <form onSubmit={handleSubmit} className="bg-white p-2">
         <div className="space-y-6">
            <h3 className="text-[14px] font-black text-slate-900 border-l-4 border-brand-primary pl-3">Thông tin khách hàng</h3>
            
            {/* Header: Avatar and Name Row - Aligned with 3-column grid below */}
            <div className="grid grid-cols-3 gap-5 items-end">
               <div className="shrink-0 flex justify-center md:justify-start">
                  <div className="relative group w-32 h-32 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden transition-all hover:border-brand-primary active:scale-95 cursor-pointer"
                       onClick={() => avatarInputRef.current?.click()}>
                     {formData.tenant_avatar ? (
                        <img src={formData.tenant_avatar} alt="Avatar" className="w-full h-full object-cover" />
                     ) : (
                        <div className="flex flex-col items-center gap-1 text-slate-300">
                           <Camera className="w-10 h-10" />
                           <span className="text-[11px] font-bold uppercase">Ảnh</span>
                        </div>
                     )}
                     <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <Upload className="w-6 h-6 text-white" />
                     </div>
                  </div>
                  <input
                     ref={avatarInputRef}
                     type="file"
                     accept="image/*"
                     className="hidden"
                     onChange={(e) => handleAvatarUpload(e.target.files?.[0] || null)}
                  />
               </div>

               <div className="col-span-2 space-y-2 pb-1">
                  <label className="text-[12px] font-black text-slate-400 uppercase tracking-widest">Họ tên khách hàng <span className="text-rose-500">*</span></label>
                  <input
                     required
                     type="text"
                     name="tenant_name"
                     value={formData.tenant_name}
                     onChange={handleChange}
                     placeholder="Ví dụ: Nguyễn Văn A"
                     className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all"
                  />
               </div>
            </div>

            {/* Row 1: Email, Phone - 2 Columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
               <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Email</label>
                  <input
                     type="email"
                     name="tenant_email"
                     value={formData.tenant_email}
                     onChange={handleChange}
                     placeholder="Email"
                     className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:border-brand-primary transition-all"
                  />
               </div>
               <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Số điện thoại <span className="text-rose-500">*</span></label>
                  <input
                     required
                     type="tel"
                     name="tenant_phone"
                     value={formData.tenant_phone}
                     onChange={handleChange}
                     placeholder="Số điện thoại"
                     className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:border-brand-primary transition-all"
                  />
               </div>
            </div>

            {/* Row 2: Gender, DOB, Job - 3 Columns */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
               <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Giới tính</label>
                  <div className="relative">
                     <select
                        name="tenant_gender"
                        value={formData.tenant_gender}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:border-brand-primary appearance-none cursor-pointer"
                     >
                        <option value="">Giới tính</option>
                        <option value="male">Nam</option>
                        <option value="female">Nữ</option>
                        <option value="other">Khác</option>
                     </select>
                     <ChevronDown className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
               </div>
               <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Ngày sinh</label>
                  <input
                     type="date"
                     name="tenant_dob"
                     value={formData.tenant_dob}
                     onChange={handleChange}
                     className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:border-brand-primary transition-all"
                  />
               </div>
               <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Nghề nghiệp</label>
                  <div className="relative">
                     <select
                        name="tenant_job"
                        value={formData.tenant_job}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:border-brand-primary appearance-none cursor-pointer"
                     >
                        <option value="">Nghề nghiệp</option>
                        <option value="Bác sĩ">Bác sĩ</option>
                        <option value="Bảo hiểm">Bảo hiểm</option>
                        <option value="Biên dịch viên">Biên dịch viên</option>
                        <option value="Biên tập">Biên tập</option>
                        <option value="Cố vấn">Cố vấn</option>
                        <option value="Công nghệ thông tin">Công nghệ thông tin</option>
                        <option value="Digital Marketer">Digital Marketer</option>
                        <option value="Doanh nhân">Doanh nhân</option>
                        <option value="Đầu bếp">Đầu bếp</option>
                        <option value="Giám đốc">Giám đốc</option>
                        <option value="Giảng viên">Giảng viên</option>
                        <option value="Giáo viên">Giáo viên</option>
                        <option value="Họa sĩ">Họa sĩ</option>
                        <option value="Hướng dẫn viên">Hướng dẫn viên</option>
                        <option value="Kế toán">Kế toán</option>
                        <option value="Kỹ sư">Kỹ sư</option>
                        <option value="Lễ tân">Lễ tân</option>
                        <option value="Luật sư">Luật sư</option>
                        <option value="Người làm nghề tự do">Người làm nghề tự do</option>
                        <option value="Nhà báo">Nhà báo</option>
                        <option value="Nhà đầu tư">Nhà đầu tư</option>
                        <option value="Nhà nghiên cứu">Nhà nghiên cứu</option>
                        <option value="Nhà văn">Nhà văn</option>
                        <option value="Nhạc sĩ">Nhạc sĩ</option>
                        <option value="Nhân sự">Nhân sự</option>
                        <option value="Nhân viên kinh doanh">Nhân viên kinh doanh</option>
                        <option value="Nhân viên văn phòng">Nhân viên văn phòng</option>
                        <option value="Nhiếp ảnh gia">Nhiếp ảnh gia</option>
                        <option value="Phiên dịch viên">Phiên dịch viên</option>
                        <option value="Sáng tạo nội dung">Sáng tạo nội dung</option>
                        <option value="Sinh viên">Sinh viên</option>
                        <option value="Tài chính">Tài chính</option>
                        <option value="Tài xế">Tài xế</option>
                        <option value="Thiết kế">Thiết kế</option>
                        <option value="Trợ lý">Trợ lý</option>
                        <option value="Vũ công">Vũ công</option>
                        <option value="Khác">Khác</option>
                     </select>
                     <ChevronDown className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
               </div>
            </div>

            {/* Row 3: Nationality, City, District - 3 Columns */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
               <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Quốc tịch</label>
                  <div className="relative group" id="nationality-dropdown">
                     <div 
                        onClick={() => setIsNationalityOpen(!isNationalityOpen)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 flex items-center gap-3 cursor-pointer hover:border-brand-primary transition-all select-none"
                     >
                        <img 
                           src={`https://flagcdn.com/w20/${(countries.find(c => c.name === formData.tenant_nationality) || {code: 'VN'}).code.toLowerCase()}.png`} 
                           alt="flag"
                           className="w-5 h-auto rounded-sm shadow-sm"
                        />
                        <span>{formData.tenant_nationality === "Vietnam" ? "Vietnam" : formData.tenant_nationality}</span>
                        <ChevronDown className={`w-4 h-4 text-slate-400 ml-auto transition-transform ${isNationalityOpen ? 'rotate-180' : ''}`} />
                     </div>

                     {isNationalityOpen && (
                        <div className="absolute z-50 top-full mt-2 w-full max-h-60 bg-white border border-slate-100 rounded-2xl shadow-2xl overflow-y-auto scrollbar-hide py-2 animate-in fade-in slide-in-from-top-2">
                           <div 
                              onClick={() => {
                                 setFormData(prev => ({...prev, tenant_nationality: "Vietnam"}));
                                 setIsNationalityOpen(false);
                              }}
                              className="px-4 py-2.5 hover:bg-slate-50 flex items-center gap-3 cursor-pointer transition-colors"
                           >
                              <img src="https://flagcdn.com/w20/vn.png" alt="VN" className="w-5 h-auto rounded-sm shadow-sm" />
                              <span className="text-sm font-bold text-slate-700">Vietnam</span>
                           </div>
                           <div className="h-px bg-slate-100 my-1 mx-4" />
                           {countries.filter(c => c.name !== "Vietnam").map(c => (
                              <div 
                                 key={c.code}
                                 onClick={() => {
                                    setFormData(prev => ({...prev, tenant_nationality: c.name}));
                                    setIsNationalityOpen(false);
                                 }}
                                 className="px-4 py-2.5 hover:bg-slate-50 flex items-center gap-3 cursor-pointer transition-colors"
                              >
                                 <img src={`https://flagcdn.com/w20/${c.code.toLowerCase()}.png`} alt={c.code} className="w-5 h-auto rounded-sm shadow-sm" />
                                 <span className="text-sm font-medium text-slate-600">{c.name}</span>
                              </div>
                           ))}
                        </div>
                     )}
                  </div>
               </div>
               <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Thành phố</label>
                  <input
                     type="text"
                     name="tenant_city"
                     value={formData.tenant_city}
                     onChange={handleChange}
                     placeholder="Thành phố"
                     className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:border-brand-primary transition-all"
                  />
               </div>
               <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Quận/huyện</label>
                  <input
                     type="text"
                     name="tenant_district"
                     value={formData.tenant_district}
                     onChange={handleChange}
                     placeholder="Quận/huyện"
                     className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:border-brand-primary transition-all"
                  />
               </div>
            </div>

            {/* Row 4: Ward and Detailed Address - 1:2 Ratio */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
               <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Phường/xã</label>
                  <input
                     type="text"
                     name="tenant_ward"
                     value={formData.tenant_ward}
                     onChange={handleChange}
                     placeholder="Phường/xã"
                     className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:border-brand-primary transition-all"
                  />
               </div>
               <div className="md:col-span-2 space-y-2">
                  <label className="text-sm font-medium text-slate-700">Địa chỉ</label>
                  <input
                     type="text"
                     name="tenant_address"
                     value={formData.tenant_address}
                     onChange={handleChange}
                     placeholder="Địa chỉ"
                     className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:border-brand-primary transition-all"
                  />
               </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
               <label className="text-[12px] font-black text-slate-400 uppercase tracking-widest">Ghi chú</label>
               <textarea
                  name="tenant_notes"
                  value={formData.tenant_notes}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Nhập ghi chú thêm..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:border-brand-primary transition-all resize-none"
               />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100">
               <button
                  type="button"
                  onClick={onCancel}
                  className="px-8 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-200 transition-all active:scale-95"
               >
                  Hủy
               </button>
               <button
                  type="submit"
                  className="px-10 py-2.5 bg-brand-primary text-white rounded-xl text-sm font-bold hover:bg-brand-dark shadow-lg shadow-brand-primary/20 transition-all active:scale-95"
               >
                  Lưu
               </button>
            </div>
         </div>
         {avatarUploadError && <p className="mt-2 text-[11px] text-rose-500 font-bold text-center">{avatarUploadError}</p>}
      </form>
   );
};

export default CustomerForm;

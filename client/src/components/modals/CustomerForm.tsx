import { useState } from "react";
import { Camera, ChevronDown } from "lucide-react";

interface CustomerFormProps {
   // eslint-disable-next-line @typescript-eslint/no-explicit-any
   onSubmit: (data: any) => void;
   onCancel: () => void;
   initialData?: any;
}

const CustomerForm = ({ onSubmit, onCancel, initialData }: CustomerFormProps) => {
   const [formData, setFormData] = useState({
      tenant_name: initialData?.tenant_name || "",
      tenant_email: initialData?.tenant_email || "",
      tenant_phone: initialData?.tenant_phone || "",
      tenant_gender: initialData?.tenant_gender || "",
      tenant_dob: initialData?.tenant_dob || "",
      tenant_job: initialData?.tenant_job || "",
      tenant_nationality: initialData?.tenant_nationality || "Việt Nam",
      tenant_city: initialData?.tenant_city || "",
      tenant_district: initialData?.tenant_district || "",
      tenant_ward: initialData?.tenant_ward || "",
      tenant_address: initialData?.tenant_address || "",
      tenant_notes: initialData?.tenant_notes || "",
      tenant_avatar: initialData?.tenant_avatar || "",
      // Keep original contract fields for compatibility
      room_id: initialData?.room_id || "",
      start_date: initialData?.start_date || new Date().toISOString().split("T")[0],
      rent_amount: initialData?.rent_amount || "",
      deposit_amount: initialData?.deposit_amount || "",
   });

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

   return (
      <form onSubmit={handleSubmit} className="bg-white">
         <div className="space-y-6">
            {/* Row 1: Avatar and Name */}
            <div className="flex flex-col md:flex-row gap-8 items-start">
               <div className="flex flex-col gap-3">
                  <label className="text-[13px] font-semibold text-slate-700">Tải lên ảnh đại diện</label>
                  <div className="relative group cursor-pointer">
                     <div className="w-32 h-32 rounded-full bg-slate-100 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center overflow-hidden transition-all group-hover:border-brand-primary group-hover:bg-slate-50">
                        {formData.tenant_avatar ? (
                           <img src={formData.tenant_avatar} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                           <div className="flex flex-col items-center text-slate-300">
                              <svg className="w-16 h-16" viewBox="0 0 24 24" fill="currentColor">
                                 <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                              </svg>
                           </div>
                        )}
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-full">
                           <Camera className="w-6 h-6 text-white" />
                        </div>
                     </div>
                  </div>
               </div>

               <div className="flex-1 w-full pt-2">
                  <div className="space-y-2">
                     <label className="text-[13px] font-semibold text-slate-700">Tên khách hàng <span className="text-red-500">*</span></label>
                     <input
                        required
                        type="text"
                        name="tenant_name"
                        value={formData.tenant_name}
                        onChange={handleChange}
                        placeholder="Tên khách hàng"
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-[14px] text-slate-700 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20 transition-all font-medium"
                     />
                  </div>
               </div>
            </div>

            {/* Row 2: Email & Phone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="space-y-2">
                  <label className="text-[13px] font-semibold text-slate-700">Email</label>
                  <input
                     type="email"
                     name="tenant_email"
                     value={formData.tenant_email}
                     onChange={handleChange}
                     placeholder="Email"
                     className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-[14px] text-slate-700 focus:outline-none focus:border-brand-primary transition-all font-medium"
                  />
               </div>
               <div className="space-y-2">
                  <label className="text-[13px] font-semibold text-slate-700">Số điện thoại <span className="text-red-500">*</span></label>
                  <input
                     required
                     type="tel"
                     name="tenant_phone"
                     value={formData.tenant_phone}
                     onChange={handleChange}
                     placeholder="Số điện thoại"
                     className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-[14px] text-slate-700 focus:outline-none focus:border-brand-primary transition-all font-medium"
                  />
               </div>
            </div>

            {/* Row 3: Gender, DOB, Job */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <div className="space-y-2">
                  <label className="text-[13px] font-semibold text-slate-700">Giới tính</label>
                  <div className="relative">
                     <select
                        name="tenant_gender"
                        value={formData.tenant_gender}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-[14px] text-slate-700 focus:outline-none focus:border-brand-primary transition-all font-medium appearance-none cursor-pointer"
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
                  <label className="text-[13px] font-semibold text-slate-700">Ngày sinh</label>
                  <div className="relative">
                     <input
                        type="date"
                        name="tenant_dob"
                        value={formData.tenant_dob}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-[14px] text-slate-700 focus:outline-none focus:border-brand-primary transition-all font-medium appearance-none"
                     />
                  </div>
               </div>
               <div className="space-y-2">
                  <label className="text-[13px] font-semibold text-slate-700">Nghề nghiệp</label>
                  <div className="relative">
                     <select
                        name="tenant_job"
                        value={formData.tenant_job}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-[14px] text-slate-700 focus:outline-none focus:border-brand-primary transition-all font-medium appearance-none cursor-pointer"
                     >
                        <option value="">Nghề nghiệp</option>
                        <option value="student">Sinh viên</option>
                        <option value="employee">Nhân viên văn phòng</option>
                        <option value="business">Kinh doanh tự do</option>
                        <option value="other">Khác</option>
                     </select>
                     <ChevronDown className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
               </div>
            </div>

            {/* Row 4: Nationality, City, District */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <div className="space-y-2">
                  <label className="text-[13px] font-semibold text-slate-700">Quốc tịch</label>
                  <div className="relative">
                     <select
                        name="tenant_nationality"
                        value={formData.tenant_nationality}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-[14px] text-slate-700 focus:outline-none focus:border-brand-primary transition-all font-medium appearance-none cursor-pointer"
                     >
                        <option value="Việt Nam">Việt Nam</option>
                        <option value="Khác">Khác</option>
                     </select>
                     <ChevronDown className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
               </div>
               <div className="space-y-2">
                  <label className="text-[13px] font-semibold text-slate-700">Thành phố</label>
                  <input
                     type="text"
                     name="tenant_city"
                     value={formData.tenant_city}
                     onChange={handleChange}
                     placeholder="Thành phố"
                     className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-[14px] text-slate-700 focus:outline-none focus:border-brand-primary transition-all font-medium"
                  />
               </div>
               <div className="space-y-2">
                  <label className="text-[13px] font-semibold text-slate-700">Quận/huyện</label>
                  <input
                     type="text"
                     name="tenant_district"
                     value={formData.tenant_district}
                     onChange={handleChange}
                     placeholder="Quận/huyện"
                     className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-[14px] text-slate-700 focus:outline-none focus:border-brand-primary transition-all font-medium"
                  />
               </div>
            </div>

            {/* Row 5: Ward & Detail Address */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <div className="space-y-2">
                  <label className="text-[13px] font-semibold text-slate-700">Phường/xã</label>
                  <input
                     type="text"
                     name="tenant_ward"
                     value={formData.tenant_ward}
                     onChange={handleChange}
                     placeholder="Phường/xã"
                     className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-[14px] text-slate-700 focus:outline-none focus:border-brand-primary transition-all font-medium"
                  />
               </div>
               <div className="md:col-span-2 space-y-2">
                  <label className="text-[13px] font-semibold text-slate-700">Địa chỉ</label>
                  <input
                     type="text"
                     name="tenant_address"
                     value={formData.tenant_address}
                     onChange={handleChange}
                     placeholder="Địa chỉ"
                     className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-[14px] text-slate-700 focus:outline-none focus:border-brand-primary transition-all font-medium"
                  />
               </div>
            </div>

            {/* Row 6: Notes */}
            <div className="space-y-2">
               <label className="text-[13px] font-semibold text-slate-700">Ghi chú</label>
               <div className="relative">
                  <textarea
                     name="tenant_notes"
                     value={formData.tenant_notes}
                     onChange={handleChange}
                     rows={3}
                     maxLength={255}
                     placeholder="Thêm ghi chú, quản lý thêm dễ dàng..."
                     className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-[14px] text-slate-700 focus:outline-none focus:border-brand-primary transition-all font-medium resize-none min-h-[100px]"
                  />
                  <div className="absolute bottom-3 right-4 text-[11px] font-bold text-slate-400">
                     {formData.tenant_notes.length}/255
                  </div>
               </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-50">
               <button
                  type="button"
                  onClick={onCancel}
                  className="px-8 py-3 bg-slate-100 text-slate-600 rounded-xl text-[14px] font-bold hover:bg-slate-200 transition-all active:scale-95"
               >
                  Hủy
               </button>
               <button
                  type="submit"
                  className="px-10 py-3 bg-brand-primary text-white rounded-xl text-[14px] font-bold hover:bg-brand-dark shadow-lg shadow-brand-primary/20 transition-all active:scale-95"
               >
                  Lưu
               </button>
            </div>
         </div>
      </form>
   );
};

export default CustomerForm;

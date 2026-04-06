import { useState } from "react";
import { Plus } from "lucide-react";

interface IncidentTypeFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export default function IncidentTypeForm({ onSubmit, onCancel }: IncidentTypeFormProps) {
  const [formData, setFormData] = useState({
    icon: null,
    name: "",
    nameEn: "",
    nameVi: "",
    assignee: "",
    description: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full bg-white">
      <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-slate-200">
        
        <div className="space-y-1.5">
          <label className="text-[13px] font-semibold text-slate-700">
            Biểu tượng <span className="text-rose-500">*</span>
          </label>
          <div className="flex items-center gap-4">
             <button type="button" className="w-[52px] h-[52px] border border-slate-200 border-dashed rounded-xl flex items-center justify-center hover:bg-slate-50 transition-colors">
                <div className="w-5 h-5 rounded-full bg-amber-400 flex items-center justify-center text-white">
                   <Plus className="w-3.5 h-3.5 font-bold" />
                </div>
             </button>
             <span className="text-[13px] font-medium text-slate-500 cursor-pointer hover:text-amber-600 transition-colors">Cập nhật biểu tượng</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
               <label className="text-[13px] font-semibold text-slate-700">Tên <span className="text-rose-500">*</span></label>
               <input
                 required
                 type="text"
                 value={formData.name}
                 onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                 placeholder="Tên"
                 className="w-full px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-medium text-slate-900"
               />
            </div>
            <div className="space-y-1.5">
               <label className="text-[13px] font-semibold text-slate-700">Tên tiếng Anh <span className="text-rose-500">*</span></label>
               <input
                 required
                 type="text"
                 value={formData.nameEn}
                 onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                 placeholder="Tên tiếng Anh"
                 className="w-full px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-medium text-slate-900"
               />
            </div>
            <div className="space-y-1.5">
               <label className="text-[13px] font-semibold text-slate-700">Tên tiếng Việt <span className="text-rose-500">*</span></label>
               <input
                 required
                 type="text"
                 value={formData.nameVi}
                 onChange={(e) => setFormData({ ...formData, nameVi: e.target.value })}
                 placeholder="Tên tiếng Việt"
                 className="w-full px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-medium text-slate-900"
               />
            </div>
        </div>

        <div className="space-y-1.5 pt-2">
            <label className="text-[13px] font-semibold text-slate-700">Người đảm nhận</label>
            <button type="button" className="flex items-center gap-2 py-1 transition-colors group">
               <div className="w-8 h-8 rounded-full border border-dashed border-slate-300 flex items-center justify-center text-slate-400 group-hover:border-amber-400 group-hover:text-amber-500">
                 <span className="text-[14px] font-bold">+</span>
               </div>
               <span className="font-medium text-[13px] text-slate-600 group-hover:text-amber-600">Thêm người đảm nhận</span>
            </button>
            <p className="text-[12px] text-slate-500 mt-2 flex items-start gap-1">
               <span className="w-3.5 h-3.5 rounded-full border border-slate-400 flex items-center justify-center text-[8px] mt-0.5">i</span>
               Người đảm nhận mặc định là người được tự động chọn đảm nhận cho loại sự cố này khi có sự cố mới được tạo.
            </p>
        </div>

        <div className="space-y-1.5 pt-2">
          <label className="text-[13px] font-semibold text-slate-700">
            Mô tả
          </label>
          <div className="relative">
             <textarea
               value={formData.description}
               onChange={(e) => setFormData({ ...formData, description: e.target.value })}
               placeholder="Mô tả"
               className="w-full h-32 px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-medium text-slate-900 resize-none flex items-start"
               maxLength={255}
             />
             <div className="absolute bottom-3 right-3 text-[11px] font-semibold text-slate-400">
                {formData.description.length}/255
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 shadow-[0_-4px_10px_rgba(0,0,0,0.02)] shrink-0 h-14">
        <button
          type="button"
          onClick={onCancel}
          className="bg-slate-100 text-slate-700 font-bold text-sm tracking-wide hover:bg-slate-200 transition-colors"
        >
          HỦY
        </button>
        <button
          type="submit"
          className="bg-amber-400 text-white font-bold text-sm tracking-wide hover:bg-amber-500 transition-colors"
        >
          TẠO
        </button>
      </div>
    </form>
  );
}

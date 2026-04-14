import { useRef, useState } from "react";
import { Upload, X, Calendar as CalendarIcon, UploadCloud } from "lucide-react";
import { api } from "../../lib/api";

interface IdentityDocumentFormProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    initialData: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onSubmit: (data: any) => void;
    onCancel: () => void;
}

const IdentityDocumentForm = ({ initialData, onSubmit, onCancel }: IdentityDocumentFormProps) => {
    const [formData, setFormData] = useState({
        tenant_id_number: initialData?.tenant_id_number || "",
        tenant_id_issue_date: initialData?.tenant_id_issue_date || "",
        tenant_id_expiry_date: initialData?.tenant_id_expiry_date || "",
        tenant_id_issue_place: initialData?.tenant_id_issue_place || "",
        tenant_id_front_url: initialData?.tenant_id_front_url || "",
        tenant_id_back_url: initialData?.tenant_id_back_url || "",
        tenant_residence_url: initialData?.tenant_residence_url || "",
    });

    const [uploading, setUploading] = useState<string | null>(null);
    const frontInputRef = useRef<HTMLInputElement>(null);
    const backInputRef = useRef<HTMLInputElement>(null);
    const residenceInputRef = useRef<HTMLInputElement>(null);

    const handleUpload = async (file: File, type: 'front' | 'back' | 'residence') => {
        setUploading(type);
        const uploadData = new FormData();
        uploadData.append("avatar", file); // Using existing upload avatar endpoint for simplicity, or we could create a new one

        const { data, error } = await api.upload<{ url: string }>("/api/customers/upload-avatar", uploadData);
        
        setUploading(null);
        if (error) {
            alert("Lỗi khi tải ảnh: " + error);
            return;
        }

        if (data?.url) {
            const field = type === 'front' ? 'tenant_id_front_url' : type === 'back' ? 'tenant_id_back_url' : 'tenant_residence_url';
            setFormData(prev => ({ ...prev, [field]: data.url }));
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = () => {
        const submissionData = { ...formData };
        if (!submissionData.tenant_id_issue_date) submissionData.tenant_id_issue_date = null;
        if (!submissionData.tenant_id_expiry_date) submissionData.tenant_id_expiry_date = null;
        onSubmit(submissionData);
    };

    return (
        <div className="space-y-8 p-1">
            {/* CCCD/Hộ Chiếu Section */}
            <div>
                <h3 className="text-base font-bold text-slate-900 mb-6">CCCD/Hộ Chiếu</h3>
                
                <div className="grid grid-cols-2 gap-8 mb-8">
                    {/* Front Side */}
                    <div className="space-y-3">
                        <div 
                            onClick={() => frontInputRef.current?.click()}
                            className="relative aspect-[1.6/1] bg-white border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-brand-primary group overflow-hidden transition-all shadow-sm"
                        >
                            {formData.tenant_id_front_url ? (
                                <img src={formData.tenant_id_front_url} className="w-full h-full object-contain bg-slate-50" />
                            ) : (
                                <div className="flex flex-col items-center gap-3 text-slate-400">
                                    <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center group-hover:bg-brand-primary/10 transition-colors">
                                        <UploadCloud className="w-6 h-6 group-hover:text-brand-primary transition-colors" />
                                    </div>
                                    <span className="text-xs font-bold text-slate-500">Mặt trước CCCD</span>
                                </div>
                            )}
                            {uploading === 'front' && (
                                <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                                    <div className="w-6 h-6 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
                                </div>
                            )}
                            <button className="absolute bottom-3 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-white border border-slate-200 rounded-lg text-[11px] font-bold text-slate-600 hover:bg-slate-50 shadow-sm flex items-center gap-2">
                                <Upload className="w-3.5 h-3.5" />
                                Tải lên mặt trước
                            </button>
                        </div>
                        <input type="file" ref={frontInputRef} className="hidden" onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0], 'front')} />
                    </div>

                    {/* Back Side */}
                    <div className="space-y-3">
                        <div 
                            onClick={() => backInputRef.current?.click()}
                            className="relative aspect-[1.6/1] bg-white border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-brand-primary group overflow-hidden transition-all shadow-sm"
                        >
                            {formData.tenant_id_back_url ? (
                                <img src={formData.tenant_id_back_url} className="w-full h-full object-contain bg-slate-50" />
                            ) : (
                                <div className="flex flex-col items-center gap-3 text-slate-400">
                                    <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center group-hover:bg-brand-primary/10 transition-colors">
                                        <UploadCloud className="w-6 h-6 group-hover:text-brand-primary transition-colors" />
                                    </div>
                                    <span className="text-xs font-bold text-slate-500">Mặt sau CCCD</span>
                                </div>
                            )}
                            {uploading === 'back' && (
                                <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                                    <div className="w-6 h-6 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
                                </div>
                            )}
                            <button className="absolute bottom-3 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-white border border-slate-200 rounded-lg text-[11px] font-bold text-slate-600 hover:bg-slate-50 shadow-sm flex items-center gap-2">
                                <Upload className="w-3.5 h-3.5" />
                                Tải lên mặt sau
                            </button>
                        </div>
                        <input type="file" ref={backInputRef} className="hidden" onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0], 'back')} />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                    <div className="space-y-2">
                        <label className="text-[13px] font-bold text-slate-700">Số CCCD/Hộ chiếu</label>
                        <input 
                            type="text" 
                            name="tenant_id_number"
                            value={formData.tenant_id_number}
                            onChange={handleChange}
                            placeholder="Nhập số CCCD/Hộ chiếu"
                            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:border-brand-primary outline-none transition-all"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[13px] font-bold text-slate-700">Ngày cấp</label>
                        <div className="relative">
                            <input 
                                type="date" 
                                name="tenant_id_issue_date"
                                value={formData.tenant_id_issue_date}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:border-brand-primary outline-none transition-all pr-10 appearance-none"
                            />
                            <CalendarIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[13px] font-bold text-slate-700">Ngày hết hạn</label>
                        <div className="relative">
                            <input 
                                type="date" 
                                name="tenant_id_expiry_date"
                                value={formData.tenant_id_expiry_date}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:border-brand-primary outline-none transition-all pr-10 appearance-none"
                            />
                            <CalendarIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[13px] font-bold text-slate-700">Nơi cấp</label>
                        <input 
                            type="text" 
                            name="tenant_id_issue_place"
                            value={formData.tenant_id_issue_place}
                            onChange={handleChange}
                            placeholder="Ví dụ: CA Hồ Chí Minh"
                            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:border-brand-primary outline-none transition-all"
                        />
                    </div>
                </div>
            </div>

            {/* Giấy tạm trú Section */}
            <div className="pt-4">
                <h3 className="text-base font-bold text-slate-900 mb-4">Giấy tạm trú</h3>
                <p className="text-[13px] font-medium text-slate-500 mb-4">Tải lên hình ảnh</p>
                
                <div className="flex items-center gap-4">
                    {formData.tenant_residence_url && (
                        <div className="relative w-40 h-28 rounded-xl overflow-hidden border border-slate-100 group">
                            <img src={formData.tenant_residence_url} className="w-full h-full object-contain bg-slate-50" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer" onClick={() => setFormData(p => ({ ...p, tenant_residence_url: "" }))}>
                                <X className="w-5 h-5 text-white" />
                            </div>
                        </div>
                    )}
                    <button 
                        onClick={() => residenceInputRef.current?.click()}
                        className="flex items-center gap-2 px-5 py-2.5 border border-slate-200 rounded-lg text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
                    >
                        <Upload className="w-4 h-4" />
                        Tải
                    </button>
                    <input type="file" ref={residenceInputRef} className="hidden" onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0], 'residence')} />
                </div>
            </div>

            {/* Actions */}
            <div className="pt-10 flex items-center justify-end gap-3 border-t border-slate-100">
                <button 
                    onClick={onCancel}
                    className="px-6 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 rounded-lg transition-all"
                >
                    Hủy
                </button>
                <button 
                    onClick={handleSave}
                    className="px-8 py-2.5 text-sm font-bold bg-amber-400 hover:bg-amber-500 text-slate-900 rounded-lg transition-all shadow-sm"
                >
                    Lưu
                </button>
            </div>
        </div>
    );
};

export default IdentityDocumentForm;

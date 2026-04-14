import { useState } from "react";
import { X, Plus, ChevronDown } from "lucide-react";

interface Vehicle {
    id?: string;
    vehicle_type: string;
    license_plate: string;
    vehicle_name: string;
    color: string;
    notes: string;
}

interface VehicleFormProps {
    onSubmit: (data: any[]) => void;
    onCancel: () => void;
    initialData?: any;
}

const VehicleForm = ({ onSubmit, onCancel, initialData }: VehicleFormProps) => {
    // Standardizing initial data to array for our multi-row logic
    const [vehicles, setVehicles] = useState<Vehicle[]>(
        initialData ? [initialData] : [{
            vehicle_type: "xe_may",
            license_plate: "",
            vehicle_name: "",
            color: "",
            notes: ""
        }]
    );

    const addVehicle = () => {
        setVehicles([...vehicles, {
            vehicle_type: "xe_may",
            license_plate: "",
            vehicle_name: "",
            color: "",
            notes: ""
        }]);
    };

    const removeVehicle = (index: number) => {
        if (vehicles.length === 1) return;
        setVehicles(vehicles.filter((_, i) => i !== index));
    };

    const handleChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        const newVehicles = [...vehicles];
        newVehicles[index] = { ...newVehicles[index], [name]: value };
        setVehicles(newVehicles);
    };

    return (
        <div className="flex flex-col h-full bg-white font-['Plus_Jakarta_Sans',sans-serif]">
            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 max-h-[60vh] scrollbar-hide">
                {vehicles.map((v, index) => (
                    <div key={index} className="relative p-6 border border-slate-100 rounded-2xl bg-white shadow-sm space-y-5 group">
                        {/* Remove Button */}
                        {vehicles.length > 1 && (
                            <button 
                                onClick={() => removeVehicle(index)}
                                className="absolute -top-2 -right-2 w-7 h-7 bg-white border border-slate-100 rounded-full flex items-center justify-center text-rose-500 hover:bg-rose-50 shadow-sm transition-all"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}

                        {/* Top Row Fields */}
                        <div className="grid grid-cols-4 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-800 flex items-center gap-1">
                                    Loại phương tiện <span className="text-rose-500">*</span>
                                </label>
                                <div className="relative">
                                    <select 
                                        name="vehicle_type"
                                        value={v.vehicle_type}
                                        onChange={(e) => handleChange(index, e)}
                                        className="w-full pl-4 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-400 focus:border-brand-primary outline-none appearance-none transition-all"
                                    >
                                        <option value="xe_may">Xe máy</option>
                                        <option value="xe_hoi">Ô tô</option>
                                        <option value="xe_dap">Xe đạp</option>
                                        <option value="xe_dien">Xe điện</option>
                                    </select>
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 pointer-events-none" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-800 flex items-center gap-1">
                                    Biển số <span className="text-rose-500">*</span>
                                </label>
                                <input 
                                    type="text" 
                                    name="license_plate"
                                    value={v.license_plate}
                                    onChange={(e) => handleChange(index, e)}
                                    placeholder="Biển số"
                                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-400 focus:border-brand-primary outline-none transition-all placeholder:text-slate-300"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-800">Tên dòng xe</label>
                                <input 
                                    type="text" 
                                    name="vehicle_name"
                                    value={v.vehicle_name}
                                    onChange={(e) => handleChange(index, e)}
                                    placeholder="Tên dòng xe"
                                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-400 focus:border-brand-primary outline-none transition-all placeholder:text-slate-300"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-800">Màu sắc</label>
                                <input 
                                    type="text" 
                                    name="color"
                                    value={v.color}
                                    onChange={(e) => handleChange(index, e)}
                                    placeholder="Màu sắc"
                                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-400 focus:border-brand-primary outline-none transition-all placeholder:text-slate-300"
                                />
                            </div>
                        </div>

                        {/* Notes Area */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-800">Ghi chú</label>
                            <div className="relative">
                                <textarea 
                                    name="notes"
                                    value={v.notes}
                                    onChange={(e) => handleChange(index, e)}
                                    placeholder="Thêm ghi chú, quản lý thêm dễ dàng..."
                                    maxLength={255}
                                    rows={3}
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-400 focus:border-brand-primary outline-none resize-none transition-all placeholder:text-slate-300"
                                />
                                <span className="absolute bottom-3 right-4 text-[10px] font-bold text-slate-300">
                                    {(v.notes || "").length}/255
                                </span>
                            </div>
                        </div>
                    </div>
                ))}

                {/* Add Row Button */}
                <button 
                    onClick={addVehicle}
                    className="flex items-center gap-2 text-[13px] font-bold text-brand-primary hover:text-brand-dark transition-colors px-2"
                >
                    <Plus className="w-4 h-4" />
                    Thêm phương tiện
                </button>
            </div>

            {/* Sticky Actions Footer */}
            <div className="p-6 border-t border-slate-50 flex items-center justify-end gap-3 bg-white rounded-b-3xl">
                <button 
                    onClick={onCancel}
                    className="px-8 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-200 transition-all"
                >
                    Hủy
                </button>
                <button 
                    onClick={() => onSubmit(vehicles)}
                    className="px-10 py-2.5 bg-amber-400 text-slate-900 rounded-xl text-sm font-bold hover:bg-amber-500 shadow-sm transition-all"
                >
                    Lưu
                </button>
            </div>
        </div>
    );
};

export default VehicleForm;

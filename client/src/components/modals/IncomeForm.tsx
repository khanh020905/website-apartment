import { useState, useEffect } from "react";
import { Building2, Tag, User, Home, Wallet, CreditCard, Calendar, FileText, Upload } from "lucide-react";
import { api } from "../../lib/api";

interface IncomeFormProps {
    onCancel: () => void;
    onSubmit: (data: {
        building_id: string;
        room_id: string | null;
        customer_name: string | null;
        flow: "income";
        category: string;
        payment_method: "cash" | "bank_transfer" | "credit_card";
        amount: number;
        note: string | null;
        transaction_date: string;
    }) => void;
}

const TRANSACTION_TYPES = [
    { id: "room_payment", label: "Nạp từ tiền thuê phòng" },
    { id: "cash_fund", label: "Nạp quỹ tiền mặt" },
    { id: "deposit", label: "Nạp tiền cọc" },
    { id: "prepayment", label: "Nạp tiền trả trước" },
    { id: "subscription", label: "Nạp từ gói đăng ký" },
];

const PAYMENT_METHODS = [
    { id: "cash", label: "Tiền mặt" },
    { id: "bank_transfer", label: "Chuyển khoản ngân hàng" },
    { id: "credit_card", label: "Thẻ ngân hàng" },
];

export default function IncomeForm({ onCancel, onSubmit }: IncomeFormProps) {
    const [loading] = useState(false);
    const [buildings, setBuildings] = useState<any[]>([]);
    const [customers, setCustomers] = useState<any[]>([]);
    const [units, setUnits] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        building_id: "",
        transaction_type: "room_payment",
        customer_id: "",
        unit_id: "",
        amount: "",
        payment_method: "cash",
        transaction_date: new Date().toISOString().slice(0, 16),
        note: "",
        files: [] as File[],
    });

    useEffect(() => {
        fetchBuildings();
    }, []);

    useEffect(() => {
        if (formData.building_id) {
            fetchCustomers(formData.building_id);
            fetchUnits(formData.building_id);
        }
    }, [formData.building_id]);

    const fetchBuildings = async () => {
        try {
            const res = await api.get("/api/buildings");
            const data = res.data as { buildings?: any[] };
            setBuildings(data?.buildings || []);
            if (data?.buildings && data.buildings.length > 0) {
                setFormData(prev => ({ ...prev, building_id: data.buildings![0].id }));
            }
        } catch (err) {
            console.error(err);
        }
    };

    const fetchCustomers = async (buildingId: string) => {
        try {
            const res = await api.get(`/api/customers?building_id=${buildingId}`);
            const data = res.data as { customers?: any[] };
            setCustomers(data?.customers || []);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchUnits = async (building_id: string) => {
        try {
            const res = await api.get(`/api/rooms?building_id=${building_id}`);
            const data = res.data as { rooms?: any[] };
            setUnits(data?.rooms || []);
        } catch (err) {
            console.error(err);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const amount = Number(formData.amount);
        if (!Number.isFinite(amount) || amount <= 0) {
            return;
        }

        const selectedCustomer = customers.find((c) => c.id === formData.customer_id);
        onSubmit({
            building_id: formData.building_id,
            room_id: formData.unit_id || null,
            customer_name: selectedCustomer?.tenant_name || null,
            flow: "income",
            category: formData.transaction_type,
            payment_method: formData.payment_method as "cash" | "bank_transfer" | "credit_card",
            amount,
            note: formData.note.trim() || null,
            transaction_date: formData.transaction_date
                ? new Date(formData.transaction_date).toISOString().split("T")[0]
                : new Date().toISOString().split("T")[0],
        });
    };

    const showCustomerAndUnit = ["room_payment", "deposit", "prepayment", "subscription"].includes(formData.transaction_type);

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
                {/* Toà nhà */}
                <div className="space-y-1.5">
                    <label className="text-[13px] font-bold text-slate-700 flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-slate-400" />
                        Toà nhà <span className="text-rose-500">*</span>
                    </label>
                    <select
                        value={formData.building_id}
                        onChange={(e) => setFormData({ ...formData, building_id: e.target.value })}
                        required
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all"
                    >
                        {buildings.map(b => (
                            <option key={b.id} value={b.id}>{b.name}</option>
                        ))}
                    </select>
                </div>

                {/* Loai giao dich */}
                <div className="space-y-1.5">
                    <label className="text-[13px] font-bold text-slate-700 flex items-center gap-2">
                        <Tag className="w-4 h-4 text-slate-400" />
                        Loại giao dịch <span className="text-rose-500">*</span>
                    </label>
                    <select
                        value={formData.transaction_type}
                        onChange={(e) => setFormData({ ...formData, transaction_type: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all"
                    >
                        {TRANSACTION_TYPES.map(t => (
                            <option key={t.id} value={t.id}>{t.label}</option>
                        ))}
                    </select>
                </div>

                {/* Chon khach hang */}
                {showCustomerAndUnit && (
                    <div className="space-y-1.5">
                        <label className="text-[13px] font-bold text-slate-700 flex items-center gap-2">
                            <User className="w-4 h-4 text-slate-400" />
                            Chọn khách hàng
                        </label>
                        <select
                            value={formData.customer_id}
                            onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all"
                        >
                            <option value="">Chọn khách hàng</option>
                            {customers.map(c => (
                                <option key={c.id} value={c.id}>{c.tenant_name}</option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Phong - Ma dat phong */}
                {showCustomerAndUnit && (
                    <div className="space-y-1.5">
                        <label className="text-[13px] font-bold text-slate-700 flex items-center gap-2">
                            <Home className="w-4 h-4 text-slate-400" />
                            Phòng - Mã đặt phòng <span className="text-rose-500">*</span>
                        </label>
                        <select
                            value={formData.unit_id}
                            onChange={(e) => setFormData({ ...formData, unit_id: e.target.value })}
                            required={showCustomerAndUnit}
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all"
                        >
                            <option value="">Chọn phòng</option>
                            {units.map(u => (
                                <option key={u.id} value={u.id}>{u.room_number}</option>
                            ))}
                        </select>
                    </div>
                )}

                {/* So tien nap */}
                <div className="space-y-1.5">
                    <label className="text-[13px] font-bold text-slate-700 flex items-center gap-2">
                        <Wallet className="w-4 h-4 text-slate-400" />
                        Số tiền nạp <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                        <input
                            type="number"
                            value={formData.amount}
                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                            placeholder="0"
                            min={1}
                            required
                            className="w-full pl-3 pr-8 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">₫</span>
                    </div>
                </div>

                {/* Phuong thuc thanh toan */}
                <div className="space-y-1.5">
                    <label className="text-[13px] font-bold text-slate-700 flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-slate-400" />
                        Phương thức thanh toán <span className="text-rose-500">*</span>
                    </label>
                    <select
                        value={formData.payment_method}
                        onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                        required
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all"
                    >
                        {PAYMENT_METHODS.map(p => (
                            <option key={p.id} value={p.id}>{p.label}</option>
                        ))}
                    </select>
                </div>

                {/* Ngay giao dich */}
                <div className="space-y-1.5 col-span-2">
                    <label className="text-[13px] font-bold text-slate-700 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        Ngày giao dịch <span className="text-rose-500">*</span>
                    </label>
                    <input
                        type="datetime-local"
                        value={formData.transaction_date}
                        onChange={(e) => setFormData({ ...formData, transaction_date: e.target.value })}
                        required
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all"
                    />
                </div>

                {/* Ghi chú */}
                <div className="space-y-1.5 col-span-2">
                    <label className="text-[13px] font-bold text-slate-700 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-slate-400" />
                        Ghi chú
                    </label>
                    <textarea
                        value={formData.note}
                        onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                        rows={3}
                        placeholder="Nội dung giao dịch..."
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all resize-none"
                    />
                </div>

                {/* Tệp đính kèm */}
                <div className="space-y-1.5 col-span-2">
                    <label className="text-[13px] font-bold text-slate-700 flex items-center gap-2">
                        <Upload className="w-4 h-4 text-slate-400" />
                        Tệp đính kèm
                    </label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-200 border-dashed rounded-xl hover:border-brand-primary transition-colors group cursor-pointer">
                        <div className="space-y-1 text-center">
                            <Upload className="mx-auto h-10 w-10 text-slate-400 group-hover:text-brand-primary transition-colors" />
                            <div className="flex text-sm text-slate-600">
                                <span className="relative cursor-pointer font-bold text-brand-primary">Tải lên tệp</span>
                                <p className="pl-1">hoặc kéo thả</p>
                            </div>
                            <p className="text-xs text-slate-400">PNG, JPG, PDF up to 10MB</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 sticky bottom-0 bg-white">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-6 py-2 bg-slate-100 text-slate-600 rounded-lg text-sm font-bold hover:bg-slate-200 transition-all font-inter"
                >
                    Hủy
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="px-8 py-2 bg-brand-primary text-white rounded-lg text-sm font-bold hover:bg-brand-dark shadow-lg shadow-brand-primary/20 transition-all active:scale-95 font-inter"
                >
                    {loading ? "Đang xử lý..." : "Tạo"}
                </button>
            </div>
        </form>
    );
}

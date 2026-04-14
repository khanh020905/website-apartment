import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
	ChevronLeft,
	Edit3,
	Calendar,
	Box,
	Plus,
	MoreHorizontal,
	ChevronRight,
	Settings,
	ChevronDown,
    DollarSign,
    AlertTriangle,
    Wallet,
    Banknote,
    CheckCircle,
} from "lucide-react";
import { api } from "../lib/api";
import { format } from "date-fns";
import Modal from "../components/modals/Modal";
import CustomerForm from "../components/modals/CustomerForm";
import VehicleForm from "../components/modals/VehicleForm";
import IdentityDocumentForm from "../components/modals/IdentityDocumentForm";
import { useToast } from "../components/Toast";

interface CustomerDetail {
	id: string;
	tenant_name: string;
	tenant_phone: string | null;
	tenant_email: string | null;
	tenant_gender: string | null;
	tenant_dob: string | null;
	tenant_id_number: string | null;
	tenant_job: string | null;
	tenant_nationality: string;
	tenant_city: string | null;
	tenant_district: string | null;
	tenant_ward: string | null;
	tenant_address: string | null;
	tenant_avatar: string | null;
	tenant_notes: string | null;
    tenant_id_issue_date: string | null;
    tenant_id_expiry_date: string | null;
    tenant_id_issue_place: string | null;
    tenant_id_front_url: string | null;
    tenant_id_back_url: string | null;
    tenant_residence_url: string | null;
	residence_status: string;
    status: string;
	created_at: string;
	room?: {
		id: string;
		room_number: string;
		building?: {
			id: string;
			name: string;
		};
	};
    vehicles?: {
        id: string;
        vehicle_type: string;
        license_plate: string;
        vehicle_name: string;
        color: string;
        notes?: string;
    }[];
    stats?: SummaryStats;
}

interface SummaryStats {
    totalBookings: number;
    paidInvoices: number;
    totalDebt: number;
    totalRevenue: number;
    depositAmount: number;
    prepayments: number;
}

export default function CustomerDetailPage() {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
    const { showToast } = useToast();
	const [activeTab, setActiveTab] = useState("bookings");
	const [loading, setLoading] = useState(true);
	const [customer, setCustomer] = useState<CustomerDetail | null>(null);
    const [limit, setLimit] = useState(20);
    
    // Derived stats from backend
    const stats = customer?.stats || {
        totalBookings: 0,
        paidInvoices: 0,
        totalDebt: 0,
        totalRevenue: 0,
        depositAmount: 0,
        prepayments: 0
    };

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
    const [isIDModalOpen, setIsIDModalOpen] = useState(false);



	useEffect(() => {
		if (id) {
			setLoading(true);
			api.get<{ customer: CustomerDetail }>(`/api/customers/${id}`)
				.then((res) => {
					if (res.data) setCustomer(res.data.customer);
				})
				.catch(console.error)
				.finally(() => setLoading(false));
		}
	}, [id]);

	const tabs = [
		{ id: "bookings", label: "Đặt phòng" },
		{ id: "contracts", label: "Hợp đồng" },
		{ id: "invoices", label: "Hóa đơn" },
		{ id: "transactions", label: "Giao dịch" },
		{ id: "prepayments", label: "Tiền trả trước" },
		{ id: "others", label: "Thông tin khác" },
	];

	if (loading) {
		return (
			<div className="flex-1 flex flex-col items-center justify-center p-20 text-slate-400 bg-white">
				<div className="w-10 h-10 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin mb-4" />
				<p className="text-sm font-bold">Đang tải thông tin khách hàng...</p>
			</div>
		);
	}

	if (!customer) {
		return (
			<div className="flex-1 p-8 text-center bg-white">
				<h2 className="text-xl font-bold text-slate-800">Không tìm thấy khách hàng</h2>
				<button onClick={() => navigate("/customers")} className="mt-4 text-brand-primary font-bold transition-all hover:scale-105 active:scale-95">
					Quay lại danh sách
				</button>
			</div>
		);
	}

	return (
		<div className="flex-1 flex flex-col min-h-screen bg-[#f8f9fa] overflow-y-auto font-sans">
            <div className="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate("/customers")}
                        className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <nav className="flex items-center gap-2 text-sm">
                        <span className="text-slate-400 font-medium">Khách hàng</span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                        <span className="text-slate-900 font-bold">{customer.tenant_name}</span>
                    </nav>
                </div>
            </div>

			<div className="flex-1 flex p-6 gap-6">
				{/* Left Sidebar - General Info */}
				<div className="w-[380px] bg-white rounded-xl border border-slate-200 shadow-sm shrink-0 flex flex-col h-fit">
					<div className="p-5 border-b border-slate-100 flex items-center justify-between">
                        <h2 className="text-[17px] font-bold text-slate-800">Thông tin chung</h2>
                        <button 
                            onClick={() => setIsEditModalOpen(true)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[11px] font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                        >
                            <Edit3 className="w-3.5 h-3.5" />
                            Chỉnh sửa
                        </button>
                    </div>

                    <div className="p-6 space-y-7">
                        {/* Avatar & Basic */}
                        <div className="flex items-center gap-4">
                            <div className="w-18 h-18 rounded-full border-2 border-slate-50 shadow-sm overflow-hidden shrink-0">
                                <img
                                    src={customer.tenant_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(customer.tenant_name)}&background=random&size=128`}
                                    alt={customer.tenant_name}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-0.5">
                                    <h3 className="text-[17px] font-bold text-slate-900 truncate">{customer.tenant_name}</h3>
                                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                        !customer.room?.room_number ? "bg-slate-100 text-slate-600"
                                        : customer.status === "active" ? "bg-emerald-100 text-emerald-700" 
                                        : "bg-slate-100 text-slate-600"
                                    }`}>
                                        {!customer.room?.room_number ? "Vãng lai" 
                                         : customer.status === "active" ? "Đang ở" 
                                         : "Đã dời đi"}
                                    </span>
                                </div>
                                <p className="text-sm font-medium text-slate-500">{customer.tenant_phone}</p>
                            </div>
                        </div>

                        {/* Details Table */}
                        <div className="space-y-4 pt-2">
                            {[
                                { label: "Hợp đồng hiện tại", value: "NTSMT00014", color: "text-blue-600" },
                                { label: "Toà nhà", value: customer.room?.building?.name || "-" },
                                { label: "Phòng", value: customer.room?.room_number || "-" },
                                { label: "Email", value: customer.tenant_email || "-", truncate: true },
                                { label: "Nghề nghiệp", value: customer.tenant_job || "-" },
                                { label: "Ngày sinh", value: customer.tenant_dob ? format(new Date(customer.tenant_dob), "dd/MM/yyyy") : "-" },
                                { label: "Nơi thường trú", value: customer.tenant_city || "-" },
                                { label: "Quốc tịch", value: customer.tenant_nationality || "Vietnam" },
                                { label: "Số CCCD/Hộ chiếu", value: customer.tenant_id_number || "-" },
                            ].map((item, i) => (
                                <div key={i} className="flex items-start justify-between gap-4 text-[14px]">
                                    <span className="text-slate-500 font-medium shrink-0">{item.label}</span>
                                    <span className={`font-medium text-right ${item.color || "text-slate-800"} ${item.truncate ? "truncate max-w-[160px]" : ""}`}>
                                        {item.value}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Notes */}
                        <div className="pt-2">
                            <label className="text-[14px] font-bold text-slate-800 block mb-3">Ghi chú</label>
                            <div className="p-4 bg-white border border-slate-100 rounded-xl min-h-[90px] text-[14px] font-medium text-slate-500">
                                {customer.tenant_notes || "N/A"}
                            </div>
                        </div>

                        <div className="pt-4 flex justify-center">
                            <button 
                                onClick={() => setActiveTab("others")}
                                className="text-[14px] font-bold text-blue-600 hover:text-blue-800 transition-colors"
                            >
                                Xem thêm chi tiết
                            </button>
                        </div>
                    </div>
				</div>

				{/* Main Content Area */}
				<div className="flex-1 flex flex-col gap-6">
					{/* Finance Stats Grid */}
					<div className="grid grid-cols-3 gap-4 shrink-0">
						{/* Card 1: Tổng đặt phòng */}
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-5">
                            <div className="w-14 h-14 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-500">
                                <Calendar className="w-7 h-7" />
                            </div>
                            <div>
                                <p className="text-[14px] font-medium text-slate-500 mb-0.5">Tổng đặt phòng</p>
                                <p className="text-2xl font-bold text-slate-900">{stats.totalBookings}</p>
                            </div>
                        </div>
                        {/* Card 2: Hóa đơn đã trả */}
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-5">
                            <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-500">
                                <CheckCircle className="w-7 h-7" />
                            </div>
                            <div>
                                <p className="text-[14px] font-medium text-slate-500 mb-0.5">Hóa đơn đã trả</p>
                                <p className="text-2xl font-bold text-slate-900">₫ {stats.paidInvoices.toLocaleString()}</p>
                            </div>
                        </div>
                        {/* Card 3: Tổng nợ */}
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-5">
                            <div className="w-14 h-14 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-500">
                                <AlertTriangle className="w-7 h-7" />
                            </div>
                            <div>
                                <p className="text-[14px] font-medium text-slate-500 mb-0.5">Tổng nợ</p>
                                <p className="text-2xl font-bold text-slate-900">₫ {stats.totalDebt.toLocaleString()}</p>
                            </div>
                        </div>
                        {/* Card 4: Tổng Doanh thu */}
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-5">
                            <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-500">
                                <DollarSign className="w-7 h-7" />
                            </div>
                            <div>
                                <p className="text-[14px] font-medium text-slate-500 mb-0.5">Tổng Doanh thu</p>
                                <p className="text-2xl font-bold text-slate-900">₫ {stats.totalRevenue.toLocaleString()}</p>
                            </div>
                        </div>
                        {/* Card 5: Đã cọc */}
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-5">
                            <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-500">
                                <Wallet className="w-7 h-7" />
                            </div>
                            <div>
                                <p className="text-[14px] font-medium text-slate-500 mb-0.5">Đã cọc</p>
                                <p className="text-2xl font-bold text-slate-900">₫ {stats.depositAmount.toLocaleString()}</p>
                            </div>
                        </div>
                        {/* Card 6: Tổng trả trước */}
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-5">
                            <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-500">
                                <Banknote className="w-7 h-7" />
                            </div>
                            <div>
                                <p className="text-[14px] font-medium text-slate-500 mb-0.5">Tổng trả trước</p>
                                <p className="text-2xl font-bold text-slate-900">₫ {stats.prepayments.toLocaleString()}</p>
                            </div>
                        </div>
					</div>

					{/* Tab Control & Listing */}
                    <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                        {/* Tabs Header */}
                        <div className="px-6 border-b border-slate-100 shrink-0">
                            <div className="flex gap-10 overflow-x-auto scrollbar-hide py-1">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`py-6 text-[15px] font-bold border-b transition-all cursor-pointer whitespace-nowrap ${
                                            activeTab === tab.id ?
                                                "border-slate-800 text-slate-800"
                                            :	"border-transparent text-slate-400 hover:text-slate-600"
                                        }`}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                        </div>



                        {/* Table Area */}
                        <div className="flex-1 bg-[#fdfdfd]">
                            <AnimatePresence mode="wait">
                                {activeTab === "bookings" && (
                                    <motion.div
                                        key="bookings"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="flex flex-col"
                                    >
                                        <table className="w-full text-left border-collapse">
                                            <thead className="bg-[#fcfcfc] border-b border-slate-50 sticky top-0 z-10">
                                                <tr>
                                                    <th className="px-5 py-4 text-[13px] font-bold text-slate-400 uppercase tracking-wider">Mã đặt phòng</th>
                                                    <th className="px-5 py-4 text-[13px] font-bold text-slate-400 uppercase tracking-wider">Phòng</th>
                                                    <th className="px-5 py-4 text-[13px] font-bold text-slate-400 uppercase tracking-wider">Loại phòng</th>
                                                    <th className="px-5 py-4 text-[13px] font-bold text-slate-400 uppercase tracking-wider">Gói</th>
                                                    <th className="px-5 py-4 text-[13px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">Khách hàng đại diện</th>
                                                    <th className="px-5 py-4 text-center">
                                                        <Settings className="w-4 h-4 text-slate-400 mx-auto" />
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-50">
                                                <tr className="hover:bg-slate-50/50 transition-colors group">
                                                    <td className="px-5 py-5 text-[14px] font-bold text-blue-600 underline decoration-blue-200 underline-offset-4 cursor-pointer">D2604E3B050</td>
                                                    <td className="px-5 py-5 text-[14px] font-bold text-slate-700">{customer.room?.room_number || "P102"}</td>
                                                    <td className="px-5 py-5 text-[14px] font-medium text-slate-500">Duplex</td>
                                                    <td className="px-5 py-5 text-[14px] font-medium text-slate-500">Tháng</td>
                                                    <td className="px-5 py-5">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-9 h-9 rounded-full border border-slate-200 overflow-hidden shrink-0">
                                                                <img src={customer.tenant_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(customer.tenant_name)}&background=random`} className="w-full h-full object-cover" />
                                                            </div>
                                                            <div>
                                                                <p className="text-[14px] font-bold text-slate-800">{customer.tenant_name}</p>
                                                                <p className="text-[12px] text-slate-400 font-medium">{customer.tenant_phone}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-5 text-center">
                                                        <button className="p-1 px-2 text-slate-400 hover:bg-slate-100 rounded-md transition-all">
                                                            <MoreHorizontal className="w-4 h-4" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                        
                                        {/* Pagination */}
                                        <div className="mt-auto border-t border-slate-50 p-4 flex items-center justify-end gap-6 text-[13px] font-bold text-slate-500 bg-white">
                                            <span>1-1/1</span>
                                            <div className="flex items-center gap-1">
                                                <button className="p-1.5 hover:bg-slate-100 rounded-md opacity-50 cursor-not-allowed"><ChevronLeft className="w-4 h-4" /></button>
                                                <button className="p-1.5 hover:bg-slate-100 rounded-md opacity-50 cursor-not-allowed"><ChevronRight className="w-4 h-4" /></button>
                                            </div>
                                            <div className="relative group">
                                                <select 
                                                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                                    value={limit}
                                                    onChange={(e) => {
                                                        setLimit(Number(e.target.value));
                                                    }}
                                                >
                                                    <option value={10}>10/trang</option>
                                                    <option value={20}>20/trang</option>
                                                    <option value={50}>50/trang</option>
                                                    <option value={100}>100/trang</option>
                                                </select>
                                                <div className="flex items-center gap-1 border border-slate-200 rounded-lg px-2 py-1 cursor-pointer hover:bg-slate-50 transition-colors">
                                                    <span>{limit}/trang</span>
                                                    <ChevronDown className="w-3.5 h-3.5" />
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {activeTab === "others" && (
                                    <motion.div
                                        key="others"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="p-8 space-y-6 overflow-y-auto h-full scrollbar-hide"
                                    >
                                        {/* Thông tin chứng từ Section */}
                                        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden relative">
                                            <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                                                <h3 className="text-[18px] font-bold text-slate-800">Thông tin chứng từ</h3>
                                                <button 
                                                    onClick={() => setIsIDModalOpen(true)}
                                                    className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-100 transition-all shadow-sm"
                                                >
                                                    <Edit3 className="w-4 h-4" />
                                                    Chỉnh sửa chứng từ
                                                </button>
                                            </div>

                                            <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-y-10 gap-x-12">
                                                <div className="space-y-10">
                                                    <div>
                                                        <p className="text-[15px] font-bold text-slate-800 mb-2.5">Số CCCD/Hộ chiếu</p>
                                                        <p className="text-[15px] font-medium text-slate-500">{customer.tenant_id_number || "Chưa cập nhật"}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[15px] font-bold text-slate-800 mb-2.5">Ngày hết hạn</p>
                                                        <p className="text-[15px] font-medium text-slate-500">{customer.tenant_id_expiry_date ? format(new Date(customer.tenant_id_expiry_date), "dd/MM/yyyy") : "Chưa cập nhật"}</p>
                                                    </div>
                                                </div>
                                                <div className="space-y-10">
                                                    <div>
                                                        <p className="text-[15px] font-bold text-slate-800 mb-2.5">Ngày cấp</p>
                                                        <p className="text-[15px] font-medium text-slate-500">{customer.tenant_id_issue_date ? format(new Date(customer.tenant_id_issue_date), "dd/MM/yyyy") : "Chưa cập nhật"}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[15px] font-bold text-slate-800 mb-2.5">Nơi cấp</p>
                                                        <p className="text-[15px] font-medium text-slate-500">{customer.tenant_id_issue_place || "Chưa cập nhật"}</p>
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className="text-[15px] font-bold text-slate-800 mb-2.5">Hình ảnh chứng từ</p>
                                                    <div className="flex items-center gap-4">
                                                        {customer.tenant_id_front_url && (
                                                            <div className="w-40 h-28 rounded-xl overflow-hidden border border-slate-100 shadow-sm cursor-pointer hover:scale-105 transition-transform bg-slate-50">
                                                                <img src={customer.tenant_id_front_url} className="w-full h-full object-contain" />
                                                            </div>
                                                        )}
                                                        {customer.tenant_id_back_url && (
                                                            <div className="w-40 h-28 rounded-xl overflow-hidden border border-slate-100 shadow-sm cursor-pointer hover:scale-105 transition-transform bg-slate-50">
                                                                <img src={customer.tenant_id_back_url} className="w-full h-full object-contain" />
                                                            </div>
                                                        )}
                                                        {!customer.tenant_id_front_url && !customer.tenant_id_back_url && (
                                                            <p className="text-[15px] font-medium text-slate-400 italic">Chưa tải lên ảnh CCCD</p>
                                                        )}
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className="text-[15px] font-bold text-slate-800 mb-2.5">Giấy tạm trú</p>
                                                    {customer.tenant_residence_url ? (
                                                        <div className="w-28 h-28 rounded-xl overflow-hidden border border-slate-100 shadow-sm cursor-pointer hover:scale-105 transition-transform bg-slate-50">
                                                            <img src={customer.tenant_residence_url} className="w-full h-full object-contain" />
                                                        </div>
                                                    ) : (
                                                        <p className="text-[15px] font-medium text-slate-400 italic">Chưa tải lên giấy tạm trú</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Phương tiện Section */}
                                        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                                            <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                                                <h3 className="text-[18px] font-bold text-slate-800">Phương tiện ({customer.vehicles?.length || 0})</h3>
                                                <button 
                                                    onClick={() => setIsVehicleModalOpen(true)}
                                                    className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                    Thêm phương tiện
                                                </button>
                                            </div>

                                            <div className="p-10">
                                                {customer.vehicles && customer.vehicles.length > 0 ? (
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                        {customer.vehicles.map((v, i) => (
                                                            <div key={i} className="p-5 border border-slate-100 rounded-2xl bg-slate-50/50 space-y-4 relative group">
                                                                <div className="flex items-start justify-between">
                                                                    <div className="space-y-1">
                                                                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Biển số</p>
                                                                        <p className="text-[16px] font-black text-slate-800">{v.license_plate}</p>
                                                                    </div>
                                                                    <div className="px-3 py-1 bg-white border border-slate-100 rounded-lg text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                                                        {v.vehicle_type === 'xe_may' ? 'Xe máy' : v.vehicle_type === 'xe_hoi' ? 'Ô tô' : 'Khác'}
                                                                    </div>
                                                                </div>
                                                                <div className="grid grid-cols-2 gap-4 border-t border-slate-100/50 pt-4">
                                                                    <div>
                                                                        <p className="text-[11px] font-bold text-slate-400 mb-1">Dòng xe</p>
                                                                        <p className="text-[13px] font-bold text-slate-700">{v.vehicle_name || "-"}</p>
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-[11px] font-bold text-slate-400 mb-1">Màu sắc</p>
                                                                        <p className="text-[13px] font-bold text-slate-700">{v.color || "-"}</p>
                                                                    </div>
                                                                </div>
                                                                {v.notes && (
                                                                    <div className="bg-white/60 p-3 rounded-xl border border-white">
                                                                        <p className="text-[11px] font-medium text-slate-500 leading-relaxed italic">"{v.notes}"</p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col items-center py-10 opacity-40">
                                                        <Plus className="w-12 h-12 text-slate-200 mb-4" />
                                                        <p className="text-sm font-bold text-slate-400">Chưa có phương tiện nào</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {activeTab !== "bookings" && activeTab !== "others" && (
                                    <motion.div
                                        key="empty"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="h-full flex flex-col items-center justify-center p-20 text-slate-300"
                                    >
                                        <Box className="w-16 h-16 mb-4 opacity-10" />
                                        <p className="text-sm font-bold opacity-30">Chưa có dữ liệu</p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
				</div>
			</div>

            {/* Edit Customer Modal */}
            <Modal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                title="Chỉnh sửa thông tin khách hàng"
                size="xl"
            >
                <CustomerForm
                    onSubmit={async (data) => {
                        const { error } = await api.put(`/api/customers/${customer!.id}`, data);
                        if (!error) {
                            setIsEditModalOpen(false);
                            setCustomer(prev => prev ? { ...prev, ...data } : null);
                            showToast("Cập nhật thông tin khách hàng thành công!");
                        } else showToast("Lỗi khi cập nhật thông tin: " + (typeof error === 'string' ? error : JSON.stringify(error)), "error");
                    }}
                    onCancel={() => setIsEditModalOpen(false)}
                    initialData={customer!}
                />
            </Modal>

            {/* Vehicle Modal */}
            <Modal
                isOpen={isVehicleModalOpen}
                onClose={() => setIsVehicleModalOpen(false)}
                title="Thêm phương tiện"
                size="xl"
            >
                <VehicleForm
                    onSubmit={async (vehicleList: any[]) => {
                        const payload = vehicleList.map(v => ({
                            ...v,
                            customer_id: id,
                            room_id: customer?.room?.id || null,
                            building_id: customer?.room?.building?.id || null,
                            status: "active"
                        }));

                        const { error } = await api.post("/api/vehicles", payload);
                        if (!error) {
                            setIsVehicleModalOpen(false);
                            showToast(`Đã thêm ${payload.length} phương tiện thành công!`);
                            // Tải lại dữ liệu khách để cập nhật danh sách xe
                            api.get<{ customer: CustomerDetail }>(`/api/customers/${id}`)
                                .then((res) => {
                                    if (res.data) setCustomer(res.data.customer);
                                });
                        } else showToast("Lỗi khi thêm phương tiện. Vui lòng thử lại.", "error");
                    }}
                    onCancel={() => setIsVehicleModalOpen(false)}
                />
            </Modal>

            {/* Identity Documents Modal */}
            <Modal
                isOpen={isIDModalOpen}
                onClose={() => setIsIDModalOpen(false)}
                title="Chỉnh sửa chứng từ"
                size="lg"
            >
                <IdentityDocumentForm
                    initialData={customer!}
                    onSubmit={async (data) => {
                        const { error } = await api.put(`/api/customers/${customer!.id}`, data);
                        if (!error) {
                            setIsIDModalOpen(false);
                            setCustomer(prev => prev ? { ...prev, ...data } : null);
                            showToast("Đã lưu thông tin chứng từ thành công!");
                        } else showToast("Lỗi khi lưu chứng từ. Vui lòng kiểm tra lại.", "error");
                    }}
                    onCancel={() => setIsIDModalOpen(false)}
                />
            </Modal>

            {/* Footer Copy */}
            <div className="h-10 flex items-center justify-center border-t border-slate-50 italic text-[10px] font-black tracking-widest text-slate-300 select-none mt-auto">
                SMARTOS ©2026.
            </div>
		</div>
	);
}

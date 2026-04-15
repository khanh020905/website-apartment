import { useState, useEffect, useRef } from "react";
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
    ArrowRight,
    Filter,
    FileSpreadsheet,
    Check,
    X,
} from "lucide-react";
import { api } from "../lib/api";
import { format } from "date-fns";
import Modal from "../components/modals/Modal";
import CustomerForm from "../components/modals/CustomerForm";
import VehicleForm from "../components/modals/VehicleForm";
import IdentityDocumentForm from "../components/modals/IdentityDocumentForm";
import { useToast } from "../components/Toast";

interface Reservation {
    id: string;
    reservation_code: string;
    room_id: string;
    building_id: string;
    customer_name: string;
    customer_phone: string;
    status: 'confirmed' | 'active' | 'completed' | 'cancelled';
    payment_status: 'unpaid' | 'partial' | 'paid';
    package_type: 'day' | 'month';
    deposit_amount: number;
    rent_amount: number;
    check_in_date: string;
    expected_check_out: string | null;
    created_at: string;
    room?: {
        room_number: string;
        room_type?: {
            name: string;
        };
    };
    building?: {
        name: string;
    };
}

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
    stats: SummaryStats;
    reservations: Reservation[];
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
    const [statusFilter, setStatusFilter] = useState("");
    const [dateRange, setDateRange] = useState({ start: "", end: "" });
    const [isColumnCustomizerOpen, setIsColumnCustomizerOpen] = useState(false);

    const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({
        code: true,
        room: true,
        type: true,
        package: true,
        customer: true,
        status: true,
        start: true,
        end: true,
        price: true,
        deposit: true,
        payment: true,
        checkIn: true,
        checkOut: true,
        creator: true,
        createdAt: true,
        actions: true,
    });

    const columns = [
        { id: "code", label: "Mã đặt phòng" },
        { id: "room", label: "Phòng" },
        { id: "type", label: "Loại phòng" },
        { id: "package", label: "Gói" },
        { id: "customer", label: "Khách hàng đại diện" },
        { id: "status", label: "Trạng thái" },
        { id: "start", label: "Ngày bắt đầu" },
        { id: "end", label: "Ngày kết thúc" },
        { id: "price", label: "Tiền phòng" },
        { id: "deposit", label: "Tiền cọc" },
        { id: "payment", label: "Trạng thái thanh toán" },
        { id: "checkIn", label: "Ngày nhận phòng" },
        { id: "checkOut", label: "Ngày trả phòng" },
        { id: "creator", label: "Người tạo" },
        { id: "createdAt", label: "Ngày tạo" },
        { id: "actions", label: "Thao tác" },
    ];

    const toggleColumn = (id: string) => {
        setVisibleColumns(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [advancedFilters, setAdvancedFilters] = useState({
        services: [] as string[],
        statuses: [] as string[],
        paymentStatuses: [] as string[],
        packages: [] as string[],
        stayRange: { start: "", end: "" },
        createRange: { start: "", end: "" },
        creator: "",
        taxOnly: false,
        priceRange: [0, 10000000]
    });

    const handleExportExcel = () => {
        const title = "Danh sách đặt phòng";
        const timeInfo = `Thời gian: ${format(new Date(), "dd/MM/yyyy")}`;
        
        const excelColumns = [
            { label: "STT", id: "stt" },
            { label: "Mã đặt phòng", id: "code" },
            { label: "Địa điểm", id: "location" },
            { label: "Phòng", id: "room" },
            { label: "Loại phòng", id: "type" },
            { label: "Gói", id: "package" },
            { label: "Khách hàng", id: "customer" },
            { label: "Trạng thái", id: "status" },
            { label: "Ngày bắt đầu", id: "start" },
            { label: "Ngày kết thúc", id: "end" },
            { label: "Giá phòng", id: "price" },
            { label: "Tiền đã cọc", id: "depositPaid" },
            { label: "Tiền cọc", id: "deposit" },
            { label: "Trạng thái thanh toán", id: "payment" },
            { label: "Ngày nhận phòng", id: "checkIn" },
            { label: "Ngày trả phòng", id: "checkOut" },
            { label: "Người tạo", id: "creator" },
            { label: "Ngày tạo", id: "createdAt" }
        ];

        let totalVal = 0;
        const rowsHtml = filteredBookings.map((b, index) => {
            totalVal += b.rent_amount;
            return `
                <tr>
                    <td style="text-align: center;">${index + 1}</td>
                    <td>${b.reservation_code}</td>
                    <td>${b.building?.name || "N/A"}</td>
                    <td>${b.room?.room_number || "N/A"}</td>
                    <td>${(b.room as any)?.room_type?.name || "N/A"}</td>
                    <td>${b.package_type === 'month' ? "Tháng" : "Ngày"}</td>
                    <td>${b.customer_name}</td>
                    <td>${b.status === "active" ? "Đang sử dụng" : b.status === "confirmed" ? "Đã xác nhận" : b.status === "completed" ? "Đã hoàn thành" : "Đã huỷ"}</td>
                    <td>${b.check_in_date}</td>
                    <td>${b.expected_check_out || "--"}</td>
                    <td style="text-align: right;">${b.rent_amount.toLocaleString()} VND</td>
                    <td style="text-align: right;">${b.deposit_amount.toLocaleString()} VND</td>
                    <td style="text-align: right;">${b.deposit_amount.toLocaleString()} VND</td>
                    <td>${b.payment_status === "unpaid" ? "Chưa thanh toán" : b.payment_status === "partial" ? "Một phần" : "Đã thanh toán"}</td>
                    <td>${b.check_in_date}</td>
                    <td>${b.expected_check_out || "--"}</td>
                    <td>N/A</td>
                    <td>${format(new Date(b.created_at), "dd/MM/yyyy")}</td>
                </tr>
            `;
        }).join("");

        const tableHtml = `
            <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
            <head>
                <meta http-equiv="content-type" content="text/plain; charset=UTF-8"/>
                <!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>Danh sách</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->
                <style>
                    td, th { border: 0.5pt solid #ccc; padding: 5px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 10pt; }
                    th { background-color: #f8fafc; font-weight: bold; color: #475569; }
                    .title { font-size: 16pt; font-weight: bold; color: #1e293b; text-align: center; }
                    .time { font-size: 10pt; color: #64748b; text-align: center; }
                    .total-row td { font-weight: bold; background-color: #f1f5f9; }
                </style>
            </head>
            <body>
                <table>
                    <tr><td colspan="${excelColumns.length}" class="title">${title}</td></tr>
                    <tr><td colspan="${excelColumns.length}" class="time">${timeInfo}</td></tr>
                    <tr></tr>
                    <thead>
                        <tr>
                            ${excelColumns.map(c => `<th>${c.label}</th>`).join("")}
                        </tr>
                    </thead>
                    <tbody>
                        ${rowsHtml}
                        <tr class="total-row">
                            <td colspan="10" style="text-align: right;">Tổng</td>
                            <td style="text-align: right;">${totalVal.toLocaleString()} VND</td>
                            <td colspan="7"></td>
                        </tr>
                    </tbody>
                </table>
            </body>
            </html>
        `;

        const blob = new Blob([tableHtml], { type: 'application/vnd.ms-excel' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `Danh_sach_dat_phong_${format(new Date(), "ddMMyyyy")}.xls`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast("Đã xuất file dữ liệu thành công!");
    };

    const filteredBookings = (customer?.reservations || []).filter(b => {
        const matchesMainStatus = !statusFilter || b.status === statusFilter;
        const matchesAdvancedStatus = advancedFilters.statuses.length === 0 || advancedFilters.statuses.includes(
            b.status === "active" ? "Đang sử dụng" : 
            b.status === "confirmed" ? "Đã xác nhận" : 
            b.status === "completed" ? "Đã hoàn thành" : "Đã huỷ"
        );
        const matchesPayment = advancedFilters.paymentStatuses.length === 0 || advancedFilters.paymentStatuses.includes(
            b.payment_status === "unpaid" ? "Chưa thanh toán" : 
            b.payment_status === "partial" ? "Một phần" : "Đã thanh toán"
        );
        const matchesPackage = advancedFilters.packages.length === 0 || advancedFilters.packages.includes(b.package_type === 'month' ? "Tháng" : "Ngày");
        const matchesPrice = b.rent_amount >= advancedFilters.priceRange[0] && b.rent_amount <= advancedFilters.priceRange[1];
        
        return matchesMainStatus && matchesAdvancedStatus && matchesPayment && matchesPackage && matchesPrice;
    });
    
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

    const tableRef = useRef<HTMLDivElement>(null);
    const startDateRef = useRef<HTMLInputElement>(null);
    const endDateRef = useRef<HTMLInputElement>(null);

    const handleWheel = (e: React.WheelEvent) => {
        if (e.deltaY !== 0 && tableRef.current) {
            // Chỉ cuộn ngang khi có lăn dọc và đang ở trong bảng
            tableRef.current.scrollLeft += e.deltaY;
        }
    };

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
				<div className="flex-1 flex flex-col gap-6 min-w-0">
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
                        <div className="flex-1 bg-[#fdfdfd] flex flex-col overflow-hidden">
                            <AnimatePresence mode="wait">
                                {activeTab === "bookings" && (
                                    <motion.div
                                        key="bookings"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="flex flex-col h-full overflow-hidden"
                                    >
                                        {/* Table Toolbar */}
                                        <div className="px-6 py-4 flex items-center justify-between bg-white border-b border-slate-100 shrink-0">
                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center gap-3 px-3 py-1.5 border border-slate-200 rounded-lg bg-white group hover:border-slate-300 transition-all">
                                                    <div 
                                                        className="relative cursor-pointer"
                                                        onClick={() => startDateRef.current?.showPicker()}
                                                    >
                                                        <input 
                                                            ref={startDateRef}
                                                            type="date" 
                                                            className="absolute inset-0 opacity-0 pointer-events-none"
                                                            value={dateRange.start}
                                                            onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                                                        />
                                                        <span className="text-[13px] font-bold text-slate-700">
                                                            {dateRange.start ? format(new Date(dateRange.start), "dd/MM/yyyy") : "Bắt đầu"}
                                                        </span>
                                                    </div>
                                                    <ArrowRight className="w-3.5 h-3.5 text-slate-300" />
                                                    <div 
                                                        className="relative cursor-pointer"
                                                        onClick={() => endDateRef.current?.showPicker()}
                                                    >
                                                        <input 
                                                            ref={endDateRef}
                                                            type="date" 
                                                            className="absolute inset-0 opacity-0 pointer-events-none"
                                                            value={dateRange.end}
                                                            onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                                                        />
                                                        <span className={`text-[13px] font-bold ${dateRange.end ? 'text-slate-700' : 'text-slate-300'}`}>
                                                            {dateRange.end ? format(new Date(dateRange.end), "dd/MM/yyyy") : "Kết thúc"}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="relative group">
                                                    <select 
                                                        className="absolute inset-0 opacity-0 cursor-pointer z-10 w-full"
                                                        value={statusFilter}
                                                        onChange={(e) => setStatusFilter(e.target.value)}
                                                    >
                                                        <option value="">Trạng thái</option>
                                                        <option value="confirmed">Đã xác nhận</option>
                                                        <option value="completed">Đã hoàn thành</option>
                                                        <option value="active">Đang sử dụng</option>
                                                        <option value="cancelled">Đã huỷ</option>
                                                    </select>
                                                    <div className="flex items-center justify-between gap-6 px-3 py-2 border border-amber-400 rounded-lg bg-white min-w-[170px] group-hover:bg-slate-50 transition-all shadow-sm">
                                                        <span className={`text-[13px] font-bold ${statusFilter ? 'text-slate-800' : 'text-slate-300'}`}>
                                                            {statusFilter === "confirmed" ? "Đã xác nhận" : 
                                                             statusFilter === "completed" ? "Đã hoàn thành" :
                                                             statusFilter === "active" ? "Đang sử dụng" : 
                                                             statusFilter === "cancelled" ? "Đã huỷ" : "Trạng thái"}
                                                        </span>
                                                        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                                                    </div>
                                                </div>
                                                
                                                <button 
                                                    onClick={() => setIsFilterOpen(true)}
                                                    className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg bg-white text-[13px] font-bold text-slate-600 hover:bg-slate-50 hover:border-slate-400 transition-all shadow-sm"
                                                >
                                                    <Filter className="w-3.5 h-3.5" />
                                                    Bộ lọc
                                                </button>
                                            </div>
                                            <button 
                                                onClick={handleExportExcel}
                                                className="p-2 border border-slate-200 rounded-lg bg-white hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
                                            >
                                                <div className="w-5 h-5 bg-emerald-50 rounded flex items-center justify-center">
                                                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                                                </div>
                                            </button>
                                        </div>

                                        <div 
                                            ref={tableRef}
                                            onWheel={handleWheel}
                                            className="overflow-x-auto overflow-y-auto flex-1 custom-tab-scrollbar"
                                        >
                                            <table className="w-full text-left border-collapse min-w-[1600px]">
                                                <thead className="bg-[#f5f5f5] border-b border-slate-200 sticky top-0 z-10">
                                                    <tr>
                                                        {visibleColumns.code && <th className="px-5 py-4 text-[13px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">Mã đặt phòng</th>}
                                                        {visibleColumns.room && <th className="px-5 py-4 text-[13px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">Phòng</th>}
                                                        {visibleColumns.type && <th className="px-5 py-4 text-[13px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">Loại phòng</th>}
                                                        {visibleColumns.package && <th className="px-5 py-4 text-[13px] font-bold text-slate-400 uppercase tracking-wider text-center whitespace-nowrap">Gói</th>}
                                                        {visibleColumns.customer && <th className="px-5 py-4 text-[13px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">Khách hàng đại diện</th>}
                                                        {visibleColumns.status && <th className="px-5 py-4 text-[13px] font-bold text-slate-400 uppercase tracking-wider text-center whitespace-nowrap">Trạng thái</th>}
                                                        {visibleColumns.start && <th className="px-5 py-4 text-[13px] font-bold text-slate-400 uppercase tracking-wider text-center whitespace-nowrap">Ngày bắt đầu</th>}
                                                        {visibleColumns.end && <th className="px-5 py-4 text-[13px] font-bold text-slate-400 uppercase tracking-wider text-center whitespace-nowrap">Ngày kết thúc</th>}
                                                        {visibleColumns.price && <th className="px-5 py-4 text-[13px] font-bold text-slate-400 uppercase tracking-wider text-right whitespace-nowrap">Tiền phòng</th>}
                                                        {visibleColumns.deposit && <th className="px-5 py-4 text-[13px] font-bold text-slate-400 uppercase tracking-wider text-center whitespace-nowrap">Tiền cọc</th>}
                                                        {visibleColumns.payment && <th className="px-5 py-4 text-[13px] font-bold text-slate-400 uppercase tracking-wider text-center whitespace-nowrap">Trạng thái thanh toán</th>}
                                                        {visibleColumns.checkIn && <th className="px-5 py-4 text-[13px] font-bold text-slate-400 uppercase tracking-wider text-center whitespace-nowrap">Ngày nhận phòng</th>}
                                                        {visibleColumns.checkOut && <th className="px-5 py-4 text-[13px] font-bold text-slate-400 uppercase tracking-wider text-center whitespace-nowrap">Ngày trả phòng</th>}
                                                        {visibleColumns.creator && <th className="px-5 py-4 text-[13px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">Người tạo</th>}
                                                        {visibleColumns.createdAt && <th className="px-5 py-4 text-[13px] font-bold text-slate-400 uppercase tracking-wider text-center whitespace-nowrap">Ngày tạo</th>}
                                                        {visibleColumns.actions && <th className="px-5 py-4 text-center sticky right-0 bg-[#f5f5f5] z-10 shadow-[-2px_0_5px_rgba(0,0,0,0.02)] whitespace-nowrap">
                                                            <div className="relative">
                                                                <button 
                                                                    onClick={() => setIsColumnCustomizerOpen(!isColumnCustomizerOpen)}
                                                                    className="p-1 hover:bg-slate-200/50 rounded transition-colors"
                                                                >
                                                                    <Settings className="w-4 h-4 text-slate-400 mx-auto" />
                                                                </button>

                                                                <AnimatePresence>
                                                                    {isColumnCustomizerOpen && (
                                                                        <>
                                                                            <div 
                                                                                className="fixed inset-0 z-20" 
                                                                                onClick={() => setIsColumnCustomizerOpen(false)} 
                                                                            />
                                                                            <motion.div
                                                                                initial={{ opacity: 0, x: 20, scale: 0.95 }}
                                                                                animate={{ opacity: 1, x: 0, scale: 1 }}
                                                                                exit={{ opacity: 0, x: 20, scale: 0.95 }}
                                                                                className="absolute right-0 mt-2 w-[600px] bg-white rounded-2xl border border-slate-200 shadow-2xl z-30 py-6 overflow-hidden text-left"
                                                                            >
                                                                                <div className="px-6 pb-4 border-b border-slate-50 mb-4">
                                                                                    <h3 className="text-[15px] font-bold text-slate-800">Tuỳ chỉnh hiển thị cột</h3>
                                                                                </div>
                                                                                <div className="grid grid-cols-3 gap-x-4 gap-y-1 px-4 max-h-[500px] overflow-y-auto custom-tab-scrollbar">
                                                                                    {columns.map(col => (
                                                                                        <label 
                                                                                            key={col.id}
                                                                                            className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors group"
                                                                                        >
                                                                                            <div className={`w-5 h-5 rounded flex items-center justify-center border-2 transition-all ${
                                                                                                visibleColumns[col.id] 
                                                                                                    ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
                                                                                                    : 'bg-white border-slate-200 text-transparent'
                                                                                            }`}>
                                                                                                <Check className="w-3.5 h-3.5 stroke-[3.5]" />
                                                                                            </div>
                                                                                            <span className={`text-[14px] font-medium transition-colors ${
                                                                                                visibleColumns[col.id] ? 'text-slate-700' : 'text-slate-400'
                                                                                            }`}>
                                                                                                {col.label}
                                                                                            </span>
                                                                                            <input 
                                                                                                type="checkbox"
                                                                                                className="hidden"
                                                                                                checked={visibleColumns[col.id]}
                                                                                                onChange={() => toggleColumn(col.id)}
                                                                                            />
                                                                                        </label>
                                                                                    ))}
                                                                                </div>
                                                                            </motion.div>
                                                                        </>
                                                                    )}
                                                                </AnimatePresence>
                                                            </div>
                                                        </th>}
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-50">
                                                    {filteredBookings.length > 0 ? (
                                                        filteredBookings.map((b) => (
                                                            <tr key={b.id} className="bg-white hover:bg-slate-50/50 transition-colors group">
                                                                {visibleColumns.code && <td className="px-5 py-5 text-[14px] font-bold text-blue-600 underline decoration-blue-200 underline-offset-4 cursor-pointer">{b.reservation_code}</td>}
                                                                {visibleColumns.room && <td className="px-5 py-5 text-[14px] font-bold text-slate-700">{b.room?.room_number || "N/A"}</td>}
                                                                {visibleColumns.type && <td className="px-5 py-5 text-[14px] font-medium text-slate-500">{(b.room as any)?.room_type?.name || "N/A"}</td>}
                                                                {visibleColumns.package && <td className="px-5 py-5 text-[14px] font-medium text-slate-500 text-center">{b.package_type === 'month' ? "Tháng" : "Ngày"}</td>}
                                                                {visibleColumns.customer && <td className="px-5 py-5">
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="w-9 h-9 rounded-full border border-slate-200 overflow-hidden shrink-0">
                                                                            <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(b.customer_name)}&background=random`} className="w-full h-full object-cover" />
                                                                        </div>
                                                                        <div>
                                                                            <p className="text-[14px] font-bold text-slate-800">{b.customer_name}</p>
                                                                            <p className="text-[12px] text-slate-400 font-medium">{b.customer_phone}</p>
                                                                        </div>
                                                                    </div>
                                                                </td>}
                                                                {visibleColumns.status && <td className="px-5 py-5 text-center">
                                                                    <span className={`px-3 py-1 rounded-full text-[12px] font-bold border whitespace-nowrap ${
                                                                        b.status === "active" ? "bg-orange-50 text-orange-600 border-orange-100/50" :
                                                                        b.status === "confirmed" ? "bg-blue-50 text-blue-600 border-blue-100/50" :
                                                                        b.status === "completed" ? "bg-emerald-50 text-emerald-600 border-emerald-100/50" :
                                                                        "bg-rose-50 text-rose-500 border-rose-100/50"
                                                                    }`}>
                                                                        {b.status === "active" ? "Đang sử dụng" : 
                                                                         b.status === "confirmed" ? "Đã xác nhận" : 
                                                                         b.status === "completed" ? "Đã hoàn thành" : "Đã huỷ"}
                                                                    </span>
                                                                </td>}
                                                                {visibleColumns.start && <td className="px-5 py-5 text-[14px] font-medium text-slate-600 text-center whitespace-nowrap">{b.check_in_date}</td>}
                                                                {visibleColumns.end && <td className="px-5 py-5 text-[14px] font-medium text-slate-600 text-center whitespace-nowrap">{b.expected_check_out || "--"}</td>}
                                                                {visibleColumns.price && <td className="px-5 py-5 text-[14px] font-bold text-slate-800 text-right whitespace-nowrap">₫ {b.rent_amount.toLocaleString()}</td>}
                                                                {visibleColumns.deposit && <td className="px-5 py-5 text-center">
                                                                    <div className="flex flex-col items-center whitespace-nowrap">
                                                                        <span className="text-[14px] font-bold text-slate-800">₫ {b.deposit_amount.toLocaleString()}</span>
                                                                        <span className="text-[11px] font-medium text-slate-400">/ ₫ {b.deposit_amount.toLocaleString()}</span>
                                                                    </div>
                                                                </td>}
                                                                {visibleColumns.payment && <td className="px-5 py-5 text-center">
                                                                    <span className={`px-3 py-1 rounded-full text-[12px] font-bold border whitespace-nowrap ${
                                                                        b.payment_status === "unpaid" ? "bg-rose-50 text-rose-600 border-rose-100/50" :
                                                                        b.payment_status === "paid" ? "bg-emerald-50 text-emerald-600 border-emerald-100/50" :
                                                                        "bg-slate-100 text-slate-500 border-slate-200"
                                                                    }`}>
                                                                        {b.payment_status === "unpaid" ? "Chưa thanh toán" : 
                                                                         b.payment_status === "partial" ? "Một phần" : "Đã thanh toán"}
                                                                    </span>
                                                                </td>}
                                                                {visibleColumns.checkIn && <td className="px-5 py-5 text-[14px] font-medium text-slate-600 text-center">{b.check_in_date}</td>}
                                                                {visibleColumns.checkOut && <td className="px-5 py-5 text-[14px] font-medium text-slate-600 text-center">{b.expected_check_out || "--"}</td>}
                                                                {visibleColumns.creator && <td className="px-5 py-5">
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-[12px] font-bold text-slate-500 uppercase">AD</div>
                                                                        <div>
                                                                            <p className="text-[13px] font-bold text-slate-700">Admin</p>
                                                                            <p className="text-[11px] text-slate-400 font-medium">Hệ thống</p>
                                                                        </div>
                                                                    </div>
                                                                </td>}
                                                                {visibleColumns.createdAt && <td className="px-5 py-5 text-[14px] font-medium text-slate-600 text-center">{format(new Date(b.created_at), "dd/MM/yyyy")}</td>}
                                                                {visibleColumns.actions && <td className="px-5 py-5 text-center sticky right-0 bg-white shadow-[-2px_0_5px_rgba(0,0,0,0.02)] group-hover:bg-slate-50/50 transition-colors">
                                                                    <button className="p-1 px-2 text-slate-400 hover:bg-slate-100 rounded-md transition-all">
                                                                        < MoreHorizontal className="w-4 h-4" />
                                                                    </button>
                                                                </td>}
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        <tr>
                                                            <td colSpan={16} className="px-5 py-10 text-center text-slate-400 font-medium italic bg-white">
                                                                Không tìm thấy dữ liệu phù hợp với bộ lọc
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                        
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

            {/* Advanced Filter Sidebar */}
            <AnimatePresence>
                {isFilterOpen && (
                    <>
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsFilterOpen(false)}
                            className="fixed inset-0 bg-slate-900/40 z-[100]"
                        />
                        <motion.div
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed right-0 top-0 h-full w-[450px] bg-white shadow-2xl z-[101] flex flex-col"
                        >
                            <div className="p-6 border-b border-slate-100 flex items-center justify-between shrink-0">
                                <h2 className="text-[18px] font-bold text-slate-800">Lọc</h2>
                                <button 
                                    onClick={() => setIsFilterOpen(false)}
                                    className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                                >
                                    <X className="w-5 h-5 text-slate-400" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-tab-scrollbar overflow-x-hidden">
                                {/* Dịch vụ */}
                                <div className="space-y-4">
                                    <h3 className="text-[14px] font-bold text-slate-800">Dịch vụ</h3>
                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <div className={`w-5 h-5 rounded border transition-all flex items-center justify-center ${advancedFilters.services.includes('Duplex') ? 'bg-amber-400 border-amber-400 text-white' : 'border-slate-200 bg-white'}`}>
                                            {advancedFilters.services.includes('Duplex') && <Check className="w-3 h-3 stroke-[3]" />}
                                        </div>
                                        <span className="text-[14px] font-medium text-slate-600">Duplex</span>
                                        <input type="checkbox" className="hidden" onChange={() => {
                                            const updated = advancedFilters.services.includes('Duplex') 
                                                ? advancedFilters.services.filter(s => s !== 'Duplex')
                                                : [...advancedFilters.services, 'Duplex'];
                                            setAdvancedFilters(prev => ({ ...prev, services: updated }));
                                        }} />
                                    </label>
                                </div>

                                {/* Trạng thái */}
                                <div className="space-y-4">
                                    <h3 className="text-[14px] font-bold text-slate-800">Trạng thái</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        {['Đã xác nhận', 'Đã hoàn thành', 'Đang sử dụng', 'Đã huỷ'].map((st) => (
                                            <label key={st} className="flex items-center gap-3 cursor-pointer group">
                                                <div className={`w-5 h-5 rounded border transition-all flex items-center justify-center ${advancedFilters.statuses.includes(st) ? 'bg-amber-400 border-amber-400 text-white' : 'border-slate-200 bg-white'}`}>
                                                    {advancedFilters.statuses.includes(st) && <Check className="w-3 h-3 stroke-[3]" />}
                                                </div>
                                                <span className="text-[14px] font-medium text-slate-600">{st}</span>
                                                <input type="checkbox" className="hidden" checked={advancedFilters.statuses.includes(st)} onChange={() => {
                                                    const updated = advancedFilters.statuses.includes(st) 
                                                        ? advancedFilters.statuses.filter(s => s !== st)
                                                        : [...advancedFilters.statuses, st];
                                                    setAdvancedFilters(prev => ({ ...prev, statuses: updated }));
                                                }} />
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Trạng thái thanh toán */}
                                <div className="space-y-4">
                                    <h3 className="text-[14px] font-bold text-slate-800">Trạng thái thanh toán</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        {['Đang nợ', 'Một phần', 'Chờ thanh toán', 'Thu tiền kỳ tới'].map((st) => (
                                            <label key={st} className="flex items-center gap-3 cursor-pointer group">
                                                <div className={`w-5 h-5 rounded border transition-all flex items-center justify-center ${advancedFilters.paymentStatuses.includes(st) ? 'bg-amber-400 border-amber-400 text-white' : 'border-slate-200 bg-white'}`}>
                                                    {advancedFilters.paymentStatuses.includes(st) && <Check className="w-3 h-3 stroke-[3]" />}
                                                </div>
                                                <span className="text-[14px] font-medium text-slate-600">{st}</span>
                                                <input type="checkbox" className="hidden" checked={advancedFilters.paymentStatuses.includes(st)} onChange={() => {
                                                    const updated = advancedFilters.paymentStatuses.includes(st) 
                                                        ? advancedFilters.paymentStatuses.filter(s => s !== st)
                                                        : [...advancedFilters.paymentStatuses, st];
                                                    setAdvancedFilters(prev => ({ ...prev, paymentStatuses: updated }));
                                                }} />
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Gói */}
                                <div className="space-y-4">
                                    <h3 className="text-[14px] font-bold text-slate-800">Gói</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        {['Ngày', 'Tháng'].map((p) => (
                                            <label key={p} className="flex items-center gap-3 cursor-pointer group">
                                                <div className={`w-5 h-5 rounded border transition-all flex items-center justify-center ${advancedFilters.packages.includes(p) ? 'bg-amber-400 border-amber-400 text-white' : 'border-slate-200 bg-white'}`}>
                                                    {advancedFilters.packages.includes(p) && <Check className="w-3 h-3 stroke-[3]" />}
                                                </div>
                                                <span className="text-[14px] font-medium text-slate-600">{p}</span>
                                                <input type="checkbox" className="hidden" checked={advancedFilters.packages.includes(p)} onChange={() => {
                                                    const updated = advancedFilters.packages.includes(p) 
                                                        ? advancedFilters.packages.filter(s => s !== p)
                                                        : [...advancedFilters.packages, p];
                                                    setAdvancedFilters(prev => ({ ...prev, packages: updated }));
                                                }} />
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Khoảng ngày lưu trú */}
                                <div className="space-y-4">
                                    <h3 className="text-[14px] font-bold text-slate-800">Thời gian lưu trú</h3>
                                    <div className="flex items-center gap-3 p-3 border border-slate-200 rounded-xl bg-slate-50/50">
                                        <input 
                                            type="date" 
                                            placeholder="Từ ngày"
                                            className="w-full bg-transparent text-[13px] focus:outline-none" 
                                            value={advancedFilters.stayRange.start}
                                            onChange={(e) => setAdvancedFilters(prev => ({ ...prev, stayRange: { ...prev.stayRange, start: e.target.value } }))}
                                         />
                                        <ArrowRight className="w-4 h-4 text-slate-300" />
                                        <input 
                                            type="date" 
                                            placeholder="Đến ngày"
                                            className="w-full bg-transparent text-[13px] text-right focus:outline-none" 
                                            value={advancedFilters.stayRange.end}
                                            onChange={(e) => setAdvancedFilters(prev => ({ ...prev, stayRange: { ...prev.stayRange, end: e.target.value } }))}
                                         />
                                        <Calendar className="w-4 h-4 text-slate-400" />
                                    </div>
                                </div>

                                {/* Ngày tạo */}
                                <div className="space-y-4">
                                    <h3 className="text-[14px] font-bold text-slate-800">Ngày tạo</h3>
                                    <div className="flex items-center gap-3 p-3 border border-slate-200 rounded-xl bg-slate-50/50">
                                        <input 
                                            type="date" 
                                            placeholder="Từ ngày"
                                            className="w-full bg-transparent text-[13px] focus:outline-none" 
                                            value={advancedFilters.createRange.start}
                                            onChange={(e) => setAdvancedFilters(prev => ({ ...prev, createRange: { ...prev.createRange, start: e.target.value } }))}
                                         />
                                        <ArrowRight className="w-4 h-4 text-slate-300" />
                                        <input 
                                            type="date" 
                                            placeholder="Đến ngày"
                                            className="w-full bg-transparent text-[13px] text-right focus:outline-none" 
                                            value={advancedFilters.createRange.end}
                                            onChange={(e) => setAdvancedFilters(prev => ({ ...prev, createRange: { ...prev.createRange, end: e.target.value } }))}
                                         />
                                        <Calendar className="w-4 h-4 text-slate-400" />
                                    </div>
                                </div>

                                {/* Người tạo */}
                                <div className="space-y-4">
                                    <h3 className="text-[14px] font-bold text-slate-800">Người tạo</h3>
                                    <div className="relative">
                                        <select 
                                            value={advancedFilters.creator}
                                            onChange={(e) => setAdvancedFilters(prev => ({ ...prev, creator: e.target.value }))}
                                            className="w-full p-3 border border-slate-200 rounded-xl appearance-none bg-white text-[14px] focus:outline-none focus:ring-2 focus:ring-amber-400/20"
                                        >
                                            <option value="">Chọn người tạo</option>
                                            <option value="tm">Tra My</option>
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                    </div>
                                </div>

                                {/* Thuế Toggle */}
                                <div className="flex items-center justify-between">
                                    <h3 className="text-[14px] font-bold text-slate-800">Chỉ hiển thị đặt phòng áp dụng thuế</h3>
                                    <button 
                                        onClick={() => setAdvancedFilters(prev => ({ ...prev, taxOnly: !prev.taxOnly }))}
                                        className={`w-12 h-6 rounded-full transition-all relative ${advancedFilters.taxOnly ? 'bg-amber-400' : 'bg-slate-200'}`}
                                    >
                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${advancedFilters.taxOnly ? 'left-7' : 'left-1'}`} />
                                    </button>
                                </div>

                                {/* Tiền phòng Slider */}
                                <div className="space-y-6">
                                    <h3 className="text-[14px] font-bold text-slate-800">Tiền phòng</h3>
                                    <div className="px-2">
                                        <div className="h-1.5 bg-slate-100 rounded-full relative">
                                            <div className="absolute left-0 right-0 h-full bg-amber-400 rounded-full" />
                                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-5 h-5 bg-white border-2 border-slate-800 rounded-full shadow-sm cursor-pointer" />
                                            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-5 h-5 bg-white border-2 border-slate-800 rounded-full shadow-sm cursor-pointer" />
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between text-[13px] font-bold">
                                        <span className="text-slate-400">₫ 0</span>
                                        <span className="text-slate-800">₫ 10,000,000</span>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 border-t border-slate-100 flex items-center justify-end gap-4 shrink-0 bg-slate-50/50">
                                <button 
                                    onClick={() => {
                                        setAdvancedFilters({
                                            services: [], statuses: [], paymentStatuses: [], packages: [],
                                            stayRange: { start: "", end: "" }, createRange: { start: "", end: "" },
                                            creator: "", taxOnly: false, priceRange: [0, 10000000]
                                        });
                                    }}
                                    className="text-[14px] font-bold text-slate-800 hover:underline"
                                >
                                    Đặt lại
                                </button>
                                <button 
                                    onClick={() => setIsFilterOpen(false)}
                                    className="px-8 py-3 bg-amber-400 hover:bg-amber-500 text-slate-900 rounded-xl text-[14px] font-bold shadow-lg shadow-amber-400/20 transition-all"
                                >
                                    Áp dụng
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Footer Copy */}
            <div className="h-10 flex items-center justify-center border-t border-slate-50 italic text-[10px] font-black tracking-widest text-slate-300 select-none mt-auto">
                SMARTOS ©2026.
            </div>
		</div>
	);
}

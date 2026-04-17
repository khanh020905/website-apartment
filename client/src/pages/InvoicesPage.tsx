import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
	Plus,
	ChevronLeft,
	ChevronRight,
	Download,
	CheckCircle2,
	Clock,
	AlertCircle,
	Receipt,
	Search,
	Settings,
	Calendar,
	ChevronDown,
	Filter,
	FileText,
  Edit2,
  Eye,
  Send,
  XCircle,
  MoreVertical
} from "lucide-react";
import { useBuilding } from "../contexts/BuildingContext";
import { api } from "../lib/api";
import Modal from "../components/modals/Modal";
import InvoiceForm from "../components/modals/InvoiceForm";
import FilterDrawer from "../components/modals/FilterDrawer";
import { useNavigate } from "react-router-dom";

interface Invoice {
	id: string;
	invoice_code: string;
	room?: { id: string; room_number: string };
	building: { name: string };
	status: "paid" | "pending" | "overdue" | "cancelled" | "draft" | "partial";
	due_date: string;
	extra_charge: number;
	discount: number;
	total_amount: number;
	customer?: { id: string; tenant_name: string; tenant_phone?: string };
	has_vat: boolean;
	creator: { display_name: string };
	created_at: string;
}

const STATUS_LABELS: Record<string, string> = {
	paid: "Đã thanh toán",
	pending: "Chờ thanh toán",
	overdue: "Quá hạn",
	cancelled: "Đã huỷ",
  draft: "Bản nháp",
  partial: "Một phần"
};

const STATUS_COLORS: Record<string, string> = {
	paid: "bg-emerald-50 text-emerald-600 border-emerald-100",
	pending: "bg-brand-bg text-brand-dark border-brand-primary/20",
	overdue: "bg-rose-50 text-rose-600 border-rose-100",
	cancelled: "bg-slate-50 text-slate-500 border-slate-100",
};

const formatCurrency = (amount: number) =>
	new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);

const formatDate = (iso: string) => {
	if (!iso) return "—";
	return new Date(iso).toLocaleDateString("vi-VN");
};

export default function InvoicesPage() {
	const navigate = useNavigate();
	const { selectedBuildingId } = useBuilding();
	const [loading, setLoading] = useState(true);
	const [invoices, setInvoices] = useState<Invoice[]>([]);
	const [stats, setStats] = useState({ total: 0, paid: 0, pending: 0, overdue: 0 });
	const [search, setSearch] = useState("");
	const [filterStatus, setFilterStatus] = useState("");
	const [page, setPage] = useState(1);
	const [total, setTotal] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isActionDropdownOpen, setIsActionDropdownOpen] = useState(false);
  const [isColumnDropdownOpen, setIsColumnDropdownOpen] = useState(false);
  const [activeActionMenu, setActiveActionMenu] = useState<string | null>(null);
  const [selectedInvoices, setSelectedInvoices] = useState<Set<string>>(new Set());
	const [visibleColumns, setVisibleColumns] = useState<string[]>([
		"invoice_code", "room", "due_date", "total", "customer", "status", "extra_discount", "creator"
	]);

	const toggleColumn = (id: string) => {
		setVisibleColumns(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);
	};

	const fetchInvoices = useCallback(async () => {
		setLoading(true);
		const params = new URLSearchParams({ page: page.toString(), limit: "20" });
		if (search) params.append("search", search);
		if (filterStatus) params.append("status", filterStatus);
		if (selectedBuildingId) params.append("building_id", selectedBuildingId);

		const res = await api.get<any>(`/api/invoices?${params}`);
		if (res.error) {
			alert("Lỗi tải hoá đơn: " + res.error);
			setLoading(false);
			return;
		}
		
		if (res.data) {
			setInvoices(res.data.invoices);
			setTotal(res.data.total);
			setStats(res.data.stats);
		}
		setLoading(false);
	}, [page, search, filterStatus, selectedBuildingId]);

	useEffect(() => {
		fetchInvoices();
	}, [fetchInvoices]);

	const handleUpdateStatus = async (id: string, newStatus: string) => {
		const res = await api.patch(`/api/invoices/${id}`, { status: newStatus });
		if (res.error) {
			alert("Lỗi: " + res.error);
		} else {
			fetchInvoices();
		}
	};

	const handleDelete = async (id: string) => {
		if (confirm("Bạn có chắc chắn muốn xoá hoá đơn này? Hành động này không thể hoàn tác.")) {
			const res = await api.delete(`/api/invoices/${id}`);
			if (res.error) {
				alert("Lỗi xoá: " + res.error);
			} else {
				fetchInvoices();
			}
		}
	};

	const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.checked) setSelectedInvoices(new Set(invoices.map(i => i.id)));
		else setSelectedInvoices(new Set());
	};

	const handleSelectOne = (id: string) => {
		setSelectedInvoices(prev => {
			const next = new Set(prev);
			if (next.has(id)) next.delete(id);
			else next.add(id);
			return next;
		});
	};

	const handleBulkAction = async (action: 'paid' | 'cancelled') => {
		if (selectedInvoices.size === 0) return alert("Vui lòng chọn ít nhất 1 hóa đơn");
		if (confirm(`Bạn có chắc muốn áp dụng thao tác này cho ${selectedInvoices.size} hóa đơn?`)) {
			setLoading(true);
			let successCount = 0;
			for (const id of Array.from(selectedInvoices)) {
				const res = await api.patch(`/api/invoices/${id}`, { status: action });
				if (!res.error) successCount++;
			}
			setSelectedInvoices(new Set());
			setIsActionDropdownOpen(false);
			alert(`Thành công thao tác ${successCount}/${selectedInvoices.size} hóa đơn`);
			fetchInvoices();
		}
	};

	const exportToCSV = () => {
		if (invoices.length === 0) {
			alert("Không có dữ liệu để xuất.");
			return;
		}
		
		const headers = ["Mã hóa đơn", "Kỳ hóa đơn", "Phòng", "Khách hàng", "Ngày phát hành", "Hạn thanh toán", "Trạng thái", "Tổng tiền"];
		const rows = invoices.map(inv => [
			inv.invoice_code,
			`T${inv.billing_month || ""}`,
			inv.room?.room_number || "",
			inv.customer?.tenant_name || "",
			formatDate(inv.created_at),
			formatDate(inv.due_date),
			STATUS_LABELS[inv.status] || inv.status,
			inv.total_amount.toString()
		]);
		
		const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
			+ [headers, ...rows].map(e => e.map(item => `"${(item || "").replace(/"/g, '""')}"`).join(",")).join("\n");
			
		const encodedUri = encodeURI(csvContent);
		const link = document.createElement("a");
		link.setAttribute("href", encodedUri);
		link.setAttribute("download", `hoadon_export_${new Date().toISOString().slice(0, 10)}.csv`);
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	};

	const statCards = [
		{ label: "Tổng số hóa đơn", value: stats.total, icon: Receipt, iconBg: "bg-[#f4e8ff]", iconColor: "text-[#9333ea]" },
		{ label: "Đã thanh toán", value: stats.paid, icon: CheckCircle2, iconBg: "bg-[#e8fbf0]", iconColor: "text-[#10b981]" },
		{ label: "Chờ thanh toán", value: stats.pending, icon: Clock, iconBg: "bg-[#e0f2fe]", iconColor: "text-[#0ea5e9]" },
		{ label: "Quá hạn", value: stats.overdue, icon: AlertCircle, iconBg: "bg-[#ffe4e6]", iconColor: "text-[#f43f5e]" },
	];

	return (
		<div className="flex-1 flex flex-col h-full bg-[#f4f5f6] relative overflow-hidden font-['Plus_Jakarta_Sans',sans-serif]">
			<div className="bg-white px-6 py-5 shrink-0 flex flex-col gap-5">
				{/* Header & Title */}
				<div className="flex justify-between items-center">
					<h1 className="text-[20px] font-black text-slate-800 tracking-tight">Hóa đơn</h1>
				</div>

				{/* Stat Cards */}
				<div className="flex gap-4 overflow-x-auto scrollbar-hide pb-1">
					{statCards.map((stat, i) => (
						<motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="w-1/4 min-w-[220px] bg-white rounded-xl border border-slate-100 p-5 flex items-center gap-4 hover:shadow-[0_4px_20px_rgba(0,0,0,0.03)] transition-all">
							<div className={`w-14 h-14 rounded-2xl flex items-center justify-center relative shrink-0 ${stat.iconBg}`}>
								<div className="absolute inset-0 bg-white/40 mask-hexagon mix-blend-overlay"></div>
								<stat.icon className={`w-6 h-6 ${stat.iconColor} relative z-10`} strokeWidth={2.5} />
							</div>
							<div className="min-w-0">
								<p className="text-[13px] font-bold text-slate-500 mb-1 tracking-wide flex items-center gap-1.5">{stat.label} {i === 0 && <AlertCircle className="w-3.5 h-3.5 text-slate-400" />}</p>
								<p className="text-[24px] font-black text-slate-800 leading-none">{stat.value}</p>
							</div>
						</motion.div>
					))}
				</div>

				{/* Filters Bar */}
				<div className="flex flex-wrap items-center gap-2.5 mt-2">
					<div className="relative w-[280px]">
						<Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
						<input
							type="text"
							placeholder="Tìm kiếm mã hóa đơn, phòng..."
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							className="w-full pl-10 pr-4 h-10 border border-slate-200 rounded-lg text-[13px] font-bold text-slate-700 bg-white focus:outline-none focus:border-brand-primary placeholder:font-medium placeholder:text-slate-400 shadow-sm"
						/>
					</div>

					<div className="relative w-[180px] group cursor-pointer">
						<input readOnly type="text" placeholder="Chọn kỳ hóa đơn" className="w-full pl-3 pr-10 h-10 border border-slate-200 rounded-lg text-[13px] font-bold text-slate-700 bg-white focus:outline-none focus:border-brand-primary cursor-pointer shadow-sm placeholder:font-medium" />
						<Calendar className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
					</div>

					<div className="relative w-[200px] group cursor-pointer">
						<select className="w-full pl-3 pr-10 h-10 border border-slate-200 rounded-lg text-[13px] font-bold text-slate-700 bg-white focus:outline-none appearance-none cursor-pointer shadow-sm" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
							<option value="">Chọn trạng thái hóa đơn</option>
							<option value="pending">Chờ thanh toán</option>
							<option value="paid">Đã thanh toán</option>
						</select>
						<ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
					</div>

					<button onClick={() => setIsFilterOpen(true)} className="h-10 px-4 border border-slate-200 bg-white text-slate-700 rounded-lg text-[13px] font-bold hover:bg-slate-50 shadow-sm flex items-center gap-2 transition-colors">
						<Filter className="w-4 h-4" /> Bộ lọc
					</button>

					<div className="ml-auto flex items-center gap-2.5">
						<button onClick={exportToCSV} title="Xuất ra Excel" className="h-10 w-10 flex items-center justify-center border border-slate-200 bg-white rounded-lg hover:bg-slate-50 shadow-sm transition-colors cursor-pointer">
							<svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="22" height="22" viewBox="0 0 48 48">
								<path fill="#169154" d="M29,6H15.744C14.781,6,14,6.781,14,7.744v7.259h15V6z"></path><path fill="#18482a" d="M14,33.054v7.202C14,41.219,14.781,42,15.743,42H29v-8.946H14z"></path><path fill="#0c8045" d="M14,15.003h15v18.051H14V15.003z"></path><path fill="#17472a" d="M22,18h4v4h-4V18z M22,26h4v4h-4V26z M15,18h4v4h-4V18z M15,26h4v4h-4V26z"></path><path fill="#21a366" d="M29,6v36h14.256C44.219,42,45,41.219,45,40.256V7.744C45,6.781,44.219,6,43.256,6H29z"></path><path fill="#fff" d="M32,15h3.189l1.811,4.368L38.811,15H42l-3.32,6.72L42.235,29h-3.37l-2.05-5.074L34.619,29H31.3l3.52-7.142L32,15z"></path><path fill="#086d38" d="M3,12h26v24H3V12z"></path><path fill="#fff" d="M12.924,24l4.246-6h-3.08l-2.288,3.905L9.63,18H6.551l4.088,5.772L6.151,30h3.208l2.646-4.475L14.717,30h3.161L12.924,24z"></path>
							</svg>
						</button>
						<div className="relative">
							<button onClick={() => setIsActionDropdownOpen(!isActionDropdownOpen)} className="h-10 px-4 border border-slate-200 bg-white text-slate-700 rounded-lg text-[13px] font-bold hover:bg-slate-50 shadow-sm flex items-center gap-2 transition-colors cursor-pointer">
								<FileText className="w-4 h-4 text-green-600" /> Chọn thao tác <ChevronDown className="w-4 h-4 text-slate-400" />
							</button>
							<AnimatePresence>
								{isActionDropdownOpen && (
									<>
										<div className="fixed inset-0 z-40" onClick={() => setIsActionDropdownOpen(false)} />
										<motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }} className="absolute right-0 top-[calc(100%+4px)] w-56 bg-white rounded-lg shadow-[0_4px_20px_rgba(0,0,0,0.1)] border border-slate-100 z-50 py-2">
											<button onClick={() => handleBulkAction('paid')} className="w-full text-left px-4 py-2 hover:bg-slate-50 text-[13px] font-bold text-slate-700 flex items-center gap-2.5 cursor-pointer">
												<CheckCircle2 className="w-4 h-4 text-slate-400" /> Xác nhận
											</button>
											<button onClick={() => setIsActionDropdownOpen(false)} className="w-full text-left px-4 py-2 hover:bg-slate-50 text-[13px] font-bold text-slate-700 flex items-center gap-2.5 cursor-pointer">
												<Edit2 className="w-4 h-4 text-slate-400" /> Chỉnh sửa
											</button>
											<button onClick={() => setIsActionDropdownOpen(false)} className="w-full text-left px-4 py-2 hover:bg-slate-50 text-[13px] font-bold text-slate-700 flex items-center gap-2.5 cursor-pointer">
												<Eye className="w-4 h-4 text-slate-400" /> Xem PDF
											</button>
											<button onClick={() => setIsActionDropdownOpen(false)} className="w-full text-left px-4 py-2 hover:bg-slate-50 text-[13px] font-bold text-slate-700 flex items-center gap-2.5 cursor-pointer">
												<Download className="w-4 h-4 text-slate-400" /> Tải xuống
											</button>
											<button onClick={() => { setIsActionDropdownOpen(false); alert("Đã gửi các hóa đơn được chọn đến HT hóa đơn VAT"); }} className="w-full text-left px-4 py-2 hover:bg-slate-50 text-[13px] font-bold text-slate-700 flex items-center gap-2.5 cursor-pointer">
												<Send className="w-4 h-4 text-slate-400" /> Gửi đến HT hoá đơn VAT
											</button>
											<button onClick={() => handleBulkAction('cancelled')} className="w-full text-left px-4 py-2 hover:bg-rose-50 text-[13px] font-bold text-rose-600 flex items-center gap-2.5 border-t border-slate-100 mt-1 pt-3 cursor-pointer">
												<XCircle className="w-4 h-4" /> Hủy
											</button>
										</motion.div>
									</>
								)}
							</AnimatePresence>
						</div>
						<button onClick={() => navigate('/invoices/batch-create')} className="h-10 px-5 bg-brand-primary text-white rounded-lg text-[13px] font-black transition-colors hover:bg-brand-dark shadow-[0_2px_10px_rgba(15,155,155,0.2)] flex items-center gap-1.5 cursor-pointer">
							<Plus className="w-4 h-4" strokeWidth={3} /> Hóa đơn
						</button>
					</div>
				</div>
			</div>

			<div className="flex-1 overflow-auto bg-white border-t border-slate-200 mt-2 p-5 lg:p-6 flex flex-col gap-6">
				<div className="overflow-hidden h-full flex flex-col">
					<div className="overflow-x-auto flex-1 custom-tab-scrollbar">
						<table className="w-full text-left whitespace-nowrap min-w-max">
							<thead className="bg-[#EDEDED] border-b border-slate-200 sticky top-0 z-10 font-bold uppercase tracking-widest text-[10px] text-slate-500">
								<tr>
									<th className="px-5 py-3.5 w-10"><input type="checkbox" onChange={handleSelectAll} checked={invoices.length > 0 && selectedInvoices.size === invoices.length} className="rounded border-slate-300 text-brand-primary w-4 h-4 cursor-pointer" /></th>
									{visibleColumns.includes("invoice_code") && <th className="px-5 py-3.5">Mã hóa đơn</th>}
									{visibleColumns.includes("period") && <th className="px-5 py-3.5">Kỳ hóa đơn</th>}
									{visibleColumns.includes("room") && <th className="px-5 py-3.5">Phòng</th>}
									{visibleColumns.includes("status") && <th className="px-5 py-3.5">Trạng thái</th>}
									{visibleColumns.includes("issue_date") && <th className="px-5 py-3.5">Ngày phát hành</th>}
									{visibleColumns.includes("due_date") && <th className="px-5 py-3.5">Hạn thanh toán</th>}
									{visibleColumns.includes("extra_discount") && <th className="px-5 py-3.5">Phụ thu/Giảm trừ</th>}
									{visibleColumns.includes("total") && <th className="px-5 py-3.5 text-right">Tổng cộng</th>}
									{visibleColumns.includes("attachment") && <th className="px-5 py-3.5">Tệp đính kèm</th>}
									{visibleColumns.includes("customer") && <th className="px-5 py-3.5">Khách hàng</th>}
									{visibleColumns.includes("vat") && <th className="px-5 py-3.5">HT hoá đơn VAT</th>}
									{visibleColumns.includes("creator") && <th className="px-5 py-3.5">Người tạo</th>}
									{visibleColumns.includes("created_at") && <th className="px-5 py-3.5">Ngày tạo</th>}
									<th className="px-5 py-3.5 w-16 relative">
										<button onClick={() => setIsColumnDropdownOpen(!isColumnDropdownOpen)} className="p-1 hover:bg-slate-200 rounded text-slate-400 hover:text-slate-600 transition-colors">
											<Settings className="w-4 h-4 inline-block" />
										</button>
										<AnimatePresence>
											{isColumnDropdownOpen && (
												<>
													<div className="fixed inset-0 z-40" onClick={() => setIsColumnDropdownOpen(false)} />
													<motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }} className="absolute right-0 top-[calc(100%+4px)] w-56 bg-white rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.12)] border border-slate-100 z-50 text-[13px] font-bold text-slate-600 normal-case tracking-normal">
														<div className="px-5 py-3 border-b border-slate-100 text-slate-800 font-black">Tuỳ chỉnh cột</div>
														<div className="max-h-[300px] overflow-y-auto py-2 custom-tab-scrollbar">
															{[
																{ id: "invoice_code", label: "Mã hóa đơn" },
																{ id: "period", label: "Kỳ hóa đơn" },
																{ id: "room", label: "Phòng" },
																{ id: "status", label: "Trạng thái" },
																{ id: "issue_date", label: "Ngày phát hành" },
																{ id: "due_date", label: "Hạn thanh toán" },
																{ id: "extra_discount", label: "Phụ thu/Giảm trừ" },
																{ id: "total", label: "Tổng cộng" },
																{ id: "attachment", label: "Tệp đính kèm" },
																{ id: "customer", label: "Khách hàng" },
																{ id: "vat", label: "HT hoá đơn VAT" },
																{ id: "creator", label: "Người tạo" },
																{ id: "created_at", label: "Ngày tạo" },
															].map(col => (
																<label key={col.id} className="w-full flex items-center gap-3 px-5 py-2 hover:bg-slate-50 cursor-pointer group">
																	<div className="relative flex items-center justify-center shrink-0">
																		<input 
																			type="checkbox" 
																			checked={visibleColumns.includes(col.id)} 
																			onChange={() => toggleColumn(col.id)} 
																			className="peer w-4 h-4 appearance-none rounded border-2 border-slate-200 checked:bg-[#fbb016] checked:border-[#fbb016] transition-colors cursor-pointer" 
																		/>
																		<svg className="absolute w-2.5 h-2.5 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
																	</div>
																	<span className="group-hover:text-slate-900 transition-colors">{col.label}</span>
																</label>
															))}
														</div>
													</motion.div>
												</>
											)}
										</AnimatePresence>
									</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-slate-100 font-bold text-[13px]">
								{loading ? (
									<tr><td colSpan={15} className="px-6 py-28 text-center text-slate-400 font-black uppercase tracking-widest text-xs">Đang tải biểu mẫu...</td></tr>
								) : invoices.length === 0 ? (
									<tr><td colSpan={15} className="px-6 py-28 text-center text-slate-400 font-bold">Chưa có hóa đơn nào</td></tr>
								) : invoices.map(inv => (
									<tr key={inv.id} className={`hover:bg-slate-50 transition-colors group ${activeActionMenu === inv.id ? 'relative z-[200]' : 'relative z-0'}`}>
										<td className="px-5 py-4"><input type="checkbox" onChange={() => handleSelectOne(inv.id)} checked={selectedInvoices.has(inv.id)} className="rounded border-slate-300 text-brand-primary w-4 h-4 cursor-pointer" /></td>
										{visibleColumns.includes("invoice_code") && <td className="px-5 py-4 font-mono text-blue-600 uppercase">{inv.invoice_code}</td>}
										{visibleColumns.includes("period") && <td className="px-5 py-4">T{inv.billing_month || "—"}</td>}
										{visibleColumns.includes("room") && <td className="px-5 py-4">{inv.room?.room_number || "—"}</td>}
										{visibleColumns.includes("status") && (
											<td className="px-5 py-4">
												<span className={`px-2 py-0.5 rounded text-[10px] uppercase border font-black ${STATUS_COLORS[inv.status]}`}>
													{STATUS_LABELS[inv.status]}
												</span>
											</td>
										)}
										{visibleColumns.includes("issue_date") && <td className="px-5 py-4 text-slate-500">{formatDate(inv.created_at)}</td>}
										{visibleColumns.includes("due_date") && <td className="px-5 py-4 text-slate-400 font-medium">{formatDate(inv.due_date)}</td>}
										{visibleColumns.includes("extra_discount") && (
											<td className="px-5 py-4 text-[11px] font-medium">
												<span className="text-emerald-500 mr-2">+{formatCurrency(inv.extra_charge)}</span>
												<span className="text-rose-500">-{formatCurrency(inv.discount)}</span>
											</td>
										)}
										{visibleColumns.includes("total") && <td className="px-5 py-4 text-right text-slate-900 font-black">{formatCurrency(inv.total_amount)}</td>}
										{visibleColumns.includes("attachment") && <td className="px-5 py-4 text-slate-400 text-center">—</td>}
										{visibleColumns.includes("customer") && (
											<td className="px-5 py-4 min-w-[200px]">
												<div className="flex items-center gap-3">
													<div className="w-8 h-8 rounded-full bg-slate-200 flex-shrink-0 flex items-center justify-center text-slate-500 font-bold text-xs uppercase">
														{inv.customer?.tenant_name ? inv.customer.tenant_name.charAt(0) : "K"}
													</div>
													<div className="flex flex-col">
														<span className="font-bold text-slate-700 whitespace-nowrap">{inv.customer?.tenant_name || "—"}</span>
														<span className="text-slate-400 text-[11px] font-medium">{inv.customer?.tenant_phone || "—"}</span>
													</div>
												</div>
											</td>
										)}
										{visibleColumns.includes("vat") && <td className="px-5 py-4 text-center">{inv.has_vat ? "Có" : "Không"}</td>}
										{visibleColumns.includes("creator") && (
											<td className="px-5 py-4 min-w-[200px]">
												<div className="flex items-center gap-3">
													<div className="w-8 h-8 rounded-full bg-slate-200 flex-shrink-0 flex items-center justify-center text-slate-500 font-bold text-xs uppercase">
														{inv.creator?.display_name ? inv.creator.display_name.charAt(0) : "H"}
													</div>
													<div className="flex flex-col">
														<span className="font-bold text-slate-700 whitespace-nowrap">{inv.creator?.display_name || "Hệ thống"}</span>
														<span className="text-slate-400 text-[11px] font-medium">—</span>
													</div>
												</div>
											</td>
										)}
										{visibleColumns.includes("created_at") && <td className="px-5 py-4 text-slate-500">{formatDate(inv.created_at)}</td>}
										<td className={`px-5 py-4 text-center relative ${activeActionMenu === inv.id ? 'z-[200]' : 'z-0'}`}>
											<button 
												onClick={() => setActiveActionMenu(activeActionMenu === inv.id ? null : inv.id)} 
												className="text-slate-400 hover:text-slate-700 p-1.5 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer inline-flex"
											>
												<MoreVertical className="w-5 h-5" />
											</button>
											<AnimatePresence>
												{activeActionMenu === inv.id && (
													<motion.div 
														initial={{ opacity: 0, scale: 0.95, y: -10 }}
														animate={{ opacity: 1, scale: 1, y: 0 }}
														exit={{ opacity: 0, scale: 0.95, y: -10 }}
														className="absolute right-full top-4 mt-2 w-56 bg-white rounded-xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] border border-slate-100 py-1.5 z-[100] text-left font-medium overflow-hidden"
													>
														<button onClick={() => { setActiveActionMenu(null); handleUpdateStatus(inv.id, 'paid'); }} className="w-full px-4 py-2.5 text-left text-sm text-slate-600 hover:bg-slate-50 hover:text-brand-primary flex items-center gap-3 transition-colors"><CheckCircle2 className="w-4 h-4"/> Thanh toán</button>
														<button onClick={() => { setActiveActionMenu(null); alert("Đã gửi đến Hệ thống hóa đơn VAT"); }} className="w-full px-4 py-2.5 text-left text-sm text-slate-600 hover:bg-slate-50 hover:text-brand-primary flex items-center gap-3 transition-colors"><Send className="w-4 h-4"/> Gửi đến HT hóa đơn VAT</button>
														<button onClick={() => { setActiveActionMenu(null); alert("Đã sao chép liên kết chia sẻ!"); }} className="w-full px-4 py-2.5 text-left text-sm text-slate-600 hover:bg-slate-50 hover:text-brand-primary flex items-center gap-3 transition-colors"><FileText className="w-4 h-4"/> Chia sẻ</button>
														<div className="h-px bg-slate-100 my-1.5"></div>
														<button onClick={() => { setActiveActionMenu(null); handleUpdateStatus(inv.id, 'cancelled'); }} className="w-full px-4 py-2.5 text-left text-sm text-slate-600 hover:bg-slate-50 hover:text-brand-primary flex items-center gap-3 transition-colors"><XCircle className="w-4 h-4"/> Hủy</button>
														<button onClick={() => { setActiveActionMenu(null); handleDelete(inv.id); }} className="w-full px-4 py-2.5 text-left text-sm text-rose-500 hover:bg-rose-50 flex items-center gap-3 transition-colors"><AlertCircle className="w-4 h-4"/> Xóa</button>
													</motion.div>
												)}
											</AnimatePresence>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>

					<div className="mt-auto px-5 py-3 border-t border-slate-200 bg-white flex items-center justify-end gap-4 text-sm text-slate-600">
						<span className="font-bold">{total === 0 ? "0-0/0" : `${(page - 1) * 20 + 1}-${Math.min(page * 20, total)}/${total}`}</span>
						<div className="flex items-center gap-1">
							<button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="p-1 hover:bg-slate-100 rounded disabled:opacity-50 text-slate-400 transition-colors"><ChevronLeft className="w-4 h-4" /></button>
							<button disabled={page * 20 >= total} onClick={() => setPage(p => p + 1)} className="p-1 hover:bg-slate-100 rounded disabled:opacity-50 text-slate-400 transition-colors"><ChevronRight className="w-4 h-4" /></button>
						</div>
					</div>
				</div>
			</div>
			<Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Tạo hoá đơn mới" size="lg">
				<InvoiceForm onSubmit={() => { setIsModalOpen(false); fetchInvoices(); }} onCancel={() => setIsModalOpen(false)} />
			</Modal>
			<FilterDrawer isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)} />
		</div>
	);
}

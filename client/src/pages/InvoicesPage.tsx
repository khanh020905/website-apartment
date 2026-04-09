import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
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
} from "lucide-react";
import { useBuilding } from "../contexts/BuildingContext";
import { api } from "../lib/api";
import Modal from "../components/modals/Modal";
import InvoiceForm from "../components/modals/InvoiceForm";

interface Invoice {
	id: string;
	invoice_code: string;
	room_number: string;
	building: { name: string };
	status: "paid" | "pending" | "overdue" | "cancelled" | "draft" | "partial";
	due_date: string;
	extra_charge: number;
	discount: number;
	total_amount: number;
	customer_name: string;
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
	pending: "bg-brand-bg text-brand-dark border-amber-100",
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
	const { selectedBuildingId } = useBuilding();
	const [loading, setLoading] = useState(true);
	const [invoices, setInvoices] = useState<Invoice[]>([]);
	const [stats, setStats] = useState({ total: 0, paid: 0, pending: 0, overdue: 0 });
	const [search, setSearch] = useState("");
	const [filterStatus, setFilterStatus] = useState("");
	const [page, setPage] = useState(1);
	const [total, setTotal] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

	const fetchInvoices = useCallback(async () => {
		setLoading(true);
		const params = new URLSearchParams({ page: page.toString(), limit: "20" });
		if (search) params.append("search", search);
		if (filterStatus) params.append("status", filterStatus);
		if (selectedBuildingId) params.append("building_id", selectedBuildingId);

		const { data } = await api.get<any>(`/api/invoices?${params}`);
		if (data) {
			setInvoices(data.invoices);
			setTotal(data.total);
			setStats(data.stats);
		}
		setLoading(false);
	}, [page, search, filterStatus, selectedBuildingId]);

	useEffect(() => {
		fetchInvoices();
	}, [fetchInvoices]);

	const statCards = [
		{ label: "Tổng số hóa đơn", value: stats.total, icon: Receipt, iconBg: "bg-violet-100", iconColor: "text-violet-600" },
		{ label: "Đã thanh toán", value: stats.paid, icon: CheckCircle2, iconBg: "bg-emerald-100", iconColor: "text-emerald-600" },
		{ label: "Chờ thanh toán", value: stats.pending, icon: Clock, iconBg: "bg-blue-100", iconColor: "text-blue-600" },
		{ label: "Quá hạn", value: stats.overdue, icon: AlertCircle, iconBg: "bg-rose-100", iconColor: "text-rose-600" },
	];

	return (
		<div className="flex-1 flex flex-col h-full bg-[#f8f9fa] relative overflow-hidden font-['Plus_Jakarta_Sans',sans-serif]">
			<div className="bg-white border-b border-slate-200">
				<div className="px-6 py-4 flex items-center justify-between">
					<h1 className="text-[20px] font-bold text-slate-900 tracking-tight">Hóa đơn công nợ</h1>
					<button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50 shadow-sm transition-all"><Download className="w-4 h-4" /> Xuất dữ liệu</button>
				</div>

				<div className="px-6 pb-4 flex flex-col sm:flex-row items-center gap-3">
					<div className="relative w-full sm:w-[320px] shrink-0">
						<Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
						<input
							type="text"
							placeholder="Tìm mã hóa đơn, phòng, khách hàng..."
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-[13px] font-bold text-slate-700 bg-white focus:outline-none focus:border-brand-primary transition-all shadow-sm"
						/>
					</div>

					<div className="w-full sm:w-44 shrink-0">
						<select
							value={filterStatus}
							onChange={(e) => setFilterStatus(e.target.value)}
							className="w-full px-3 py-2 border border-slate-200 rounded-lg text-[13px] font-bold text-slate-600 bg-white focus:outline-none appearance-none cursor-pointer"
						>
							<option value="">Trạng thái hóa đơn</option>
							<option value="pending">Chờ thanh toán</option>
							<option value="paid">Đã thanh toán</option>
							<option value="overdue">Quá hạn</option>
						</select>
					</div>

					<button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg text-[13px] font-black transition-colors hover:bg-brand-dark shadow-sm ml-auto cursor-pointer">
						<Plus className="w-4 h-4 font-bold" /> Hóa đơn
					</button>
				</div>
			</div>

			<div className="flex-1 overflow-auto bg-[#f8f9fa] p-5 lg:p-6 flex flex-col gap-6">
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 shrink-0">
					{statCards.map((stat, i) => (
						<motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
							<div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${stat.iconBg}`}><stat.icon className={`w-5 h-5 ${stat.iconColor}`} /></div>
							<div className="min-w-0 font-bold">
								<p className="text-[13px] text-slate-400 uppercase tracking-widest">{stat.label}</p>
								<p className="text-[20px] text-slate-900 mt-0.5">{stat.value}</p>
							</div>
						</motion.div>
					))}
				</div>

				<div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm h-full flex flex-col min-h-125">
					<div className="overflow-x-auto flex-1">
						<table className="w-full text-left">
							<thead className="bg-[#EDEDED] border-b border-slate-200 sticky top-0 z-10 font-bold uppercase tracking-widest text-[10px] text-slate-500">
								<tr>
									<th className="px-5 py-3.5 w-10"><input type="checkbox" className="rounded border-slate-300 text-brand-primary w-4 h-4" /></th>
									<th className="px-5 py-3.5">Mã hóa đơn</th>
									<th className="px-5 py-3.5">Phòng</th>
									<th className="px-5 py-3.5">Hạn thanh toán</th>
									<th className="px-5 py-3.5 text-right">Tổng cộng</th>
									<th className="px-5 py-3.5">Khách hàng</th>
									<th className="px-5 py-3.5">Trạng thái</th>
									<th className="px-5 py-3.5">Phụ thu/Giảm</th>
									<th className="px-5 py-3.5">Người tạo</th>
									<th className="px-5 py-3.5 w-10"><Settings className="w-4 h-4 text-slate-400 inline-block" /></th>
								</tr>
							</thead>
							<tbody className="divide-y divide-slate-100 font-bold text-[13px]">
								{loading ? (
									<tr><td colSpan={10} className="px-6 py-28 text-center text-slate-400 font-black uppercase tracking-widest text-xs">Đang tải biểu mẫu...</td></tr>
								) : invoices.length === 0 ? (
									<tr><td colSpan={10} className="px-6 py-28 text-center text-slate-400 font-bold">Chưa có hóa đơn nào</td></tr>
								) : invoices.map(inv => (
									<tr key={inv.id} className="hover:bg-slate-50 transition-colors group">
										<td className="px-5 py-4"><input type="checkbox" className="rounded border-slate-300 text-brand-primary w-4 h-4" /></td>
										<td className="px-5 py-4 font-mono text-blue-600 uppercase">{inv.invoice_code}</td>
										<td className="px-5 py-4">{inv.room_number}</td>
										<td className="px-5 py-4 text-slate-400 font-medium">{formatDate(inv.due_date)}</td>
										<td className="px-5 py-4 text-right text-slate-900 font-black">{formatCurrency(inv.total_amount)}</td>
										<td className="px-5 py-4 text-slate-700">{inv.customer_name}</td>
										<td className="px-5 py-4">
											<span className={`px-2 py-0.5 rounded text-[10px] uppercase border font-black ${STATUS_COLORS[inv.status]}`}>
												{STATUS_LABELS[inv.status]}
											</span>
										</td>
										<td className="px-5 py-4 text-[11px] text-slate-400">+{formatCurrency(inv.extra_charge)} / -{formatCurrency(inv.discount)}</td>
										<td className="px-5 py-4 text-slate-500 font-medium">{inv.creator?.display_name ?? "Hệ thống"}</td>
										<td className="px-5 py-4"></td>
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
		</div>
	);
}

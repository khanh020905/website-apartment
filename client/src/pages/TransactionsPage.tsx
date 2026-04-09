import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
	ArrowLeftRight,
	Plus,
	Download,
	Search,
	ChevronLeft,
	ChevronRight,
	TrendingUp,
	TrendingDown,
	Wallet,
} from "lucide-react";
import { api } from "../lib/api";
import { useBuilding } from "../contexts/BuildingContext";
import Modal from "../components/modals/Modal";
import TransactionForm from "../components/modals/TransactionForm";

interface Transaction {
	id: string;
	transaction_code: string;
	transaction_date: string;
	building: { name: string };
	room: { room_number: string } | null;
	customer_name: string;
	flow: "income" | "expense";
	category: string;
	payment_method: string;
	amount: number;
	status: "confirmed" | "pending" | "cancelled";
	note: string;
}

const formatCurrency = (v: number) =>
	new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(v);

const formatDate = (iso: string) => {
	if (!iso) return "—";
	return new Date(iso).toLocaleDateString("vi-VN");
};

const TX_STATUS: Record<string, { label: string; color: string }> = {
	confirmed: { label: "Đã xác nhận", color: "bg-emerald-50 text-emerald-600 border-emerald-100" },
	pending: { label: "Chờ xử lý", color: "bg-brand-bg text-brand-dark border-brand-primary/20" },
	cancelled: { label: "Đã huỷ", color: "bg-rose-50 text-rose-600 border-rose-100" },
};

const METHOD_LABELS: Record<string, string> = {
  bank_transfer: "Chuyển khoản",
  cash: "Tiền mặt",
  credit_card: "Thẻ ngân hàng"
};

export default function TransactionsPage() {
	const { selectedBuildingId } = useBuilding();
	const [loading, setLoading] = useState(true);
	const [transactions, setTransactions] = useState<Transaction[]>([]);
	const [stats, setStats] = useState({ income: 0, expense: 0, profit: 0 });
	const [search, setSearch] = useState("");
	const [flowFilter, setFlowFilter] = useState("");
	const [page, setPage] = useState(1);
	const [total, setTotal] = useState(0);
	const [isModalOpen, setIsModalOpen] = useState(false);

	const fetchTransactions = useCallback(async () => {
		setLoading(true);
		const params = new URLSearchParams({ page: page.toString(), limit: "20" });
		if (search) params.append("search", search);
		if (flowFilter) params.append("flow", flowFilter);
		if (selectedBuildingId) params.append("building_id", selectedBuildingId);

		const { data } = await api.get<any>(`/api/transactions?${params}`);
		if (data) {
			setTransactions(data.transactions);
			setTotal(data.total);
			setStats(data.stats);
		}
		setLoading(false);
	}, [page, search, flowFilter, selectedBuildingId]);

	useEffect(() => {
		fetchTransactions();
	}, [fetchTransactions]);

	const statCards = [
		{
			label: "Lợi nhuận",
			value: stats.profit,
			icon: Wallet,
			iconBg: "bg-violet-100",
			iconColor: "text-violet-600",
		},
		{
			label: "Tổng thu",
			value: stats.income,
			icon: TrendingUp,
			iconBg: "bg-emerald-100",
			iconColor: "text-emerald-600",
		},
		{
			label: "Tổng chi",
			value: stats.expense,
			icon: TrendingDown,
			iconBg: "bg-rose-100",
			iconColor: "text-rose-600",
		},
		{
			label: "Số giao dịch",
			value: total,
			icon: ArrowLeftRight,
			iconBg: "bg-brand-bg",
			iconColor: "text-brand-dark",
			isCount: true,
		},
	];

	const handleCreateTransaction = async (formData: any) => {
		const { error } = await api.post("/api/transactions", formData);
		if (!error) {
			setIsModalOpen(false);
			fetchTransactions();
		} else {
			alert(error);
		}
	};

	return (
		<div className="flex-1 flex flex-col h-full bg-[#f8f9fa] relative overflow-hidden font-['Plus_Jakarta_Sans',sans-serif]">
			<div className="bg-white border-b border-slate-200">
				<div className="px-6 py-4 flex items-center justify-between">
					<h1 className="text-[20px] font-bold text-slate-900 tracking-tight">Giao dịch thu chi</h1>
					<div className="flex items-center gap-2">
						<button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
							<Download className="w-4 h-4" /> Xuất dữ liệu
						</button>
					</div>
				</div>

				<div className="px-6 pb-4 flex flex-col sm:flex-row items-center gap-3">
					<div className="relative w-full sm:w-[320px] shrink-0">
						<Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
						<input
							type="text"
							placeholder="Tìm mã GD, nội dung, khách hàng..."
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-[13px] font-bold text-slate-700 bg-white focus:outline-none focus:border-brand-primary transition-all shadow-sm"
						/>
					</div>

					<div className="w-full sm:w-40 shrink-0">
						<select
							value={flowFilter}
							onChange={(e) => setFlowFilter(e.target.value)}
							className="w-full px-3 py-2 border border-slate-200 rounded-lg text-[13px] font-bold text-slate-600 bg-white focus:outline-none appearance-none cursor-pointer"
						>
							<option value="">Loại giao dịch</option>
							<option value="income">Thu nhập</option>
							<option value="expense">Chi phí</option>
						</select>
					</div>

					<button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg text-[13px] font-black transition-colors hover:bg-brand-dark shadow-sm ml-auto cursor-pointer">
						<Plus className="w-4 h-4 font-bold" /> Giao dịch
					</button>
				</div>
			</div>

			<div className="flex-1 overflow-auto bg-[#f8f9fa] p-5 lg:p-6 flex flex-col gap-6">
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 shrink-0">
					{statCards.map((s, i) => (
						<motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
							<div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${s.iconBg}`}><s.icon className={`w-5 h-5 ${s.iconColor}`} /></div>
							<div>
								<p className="text-[13px] font-bold text-slate-400 uppercase tracking-wider">{s.label}</p>
								<p className="text-[20px] font-black text-slate-900 mt-0.5">{s.isCount ? s.value : formatCurrency(s.value)}</p>
							</div>
						</motion.div>
					))}
				</div>

				<div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm h-full flex flex-col min-h-125">
					<div className="overflow-x-auto flex-1">
						<table className="w-full text-left">
							<thead className="bg-[#EDEDED] border-b border-slate-200 sticky top-0 z-10 font-bold uppercase tracking-widest text-[10px] text-slate-500">
								<tr>
									<th className="px-5 py-3.5">Mã GD</th>
									<th className="px-5 py-3.5">Ngày</th>
									<th className="px-5 py-3.5">Hạng mục</th>
									<th className="px-5 py-3.5">Phòng</th>
									<th className="px-5 py-3.5">Khách hàng</th>
									<th className="px-5 py-3.5 text-right">Số tiền</th>
									<th className="px-5 py-3.5">Hình thức</th>
									<th className="px-5 py-3.5">Trạng thái</th>
									<th className="px-5 py-3.5 w-10"></th>
								</tr>
							</thead>
							<tbody className="divide-y divide-slate-100 font-bold text-[13px]">
								{loading ? (
									<tr><td colSpan={9} className="px-6 py-28 text-center text-slate-400">Đang tải giao dịch...</td></tr>
								) : transactions.length === 0 ? (
									<tr><td colSpan={9} className="px-6 py-28 text-center text-slate-400 font-bold">Chưa có giao dịch nào</td></tr>
								) : transactions.map(t => (
									<tr key={t.id} className="hover:bg-slate-50/50 transition-colors group">
										<td className="px-5 py-4"><span className="text-blue-600 uppercase">{t.transaction_code}</span></td>
										<td className="px-5 py-4 text-slate-400 font-medium">{formatDate(t.transaction_date)}</td>
										<td className="px-5 py-4 text-slate-700">{t.category}</td>
										<td className="px-5 py-4">{t.room?.room_number ?? "—"}</td>
										<td className="px-5 py-4">{t.customer_name ?? "—"}</td>
										<td className={`px-5 py-4 text-right font-black ${t.flow === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
											{t.flow === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
										</td>
										<td className="px-5 py-4 text-slate-500 font-medium">{METHOD_LABELS[t.payment_method] || t.payment_method}</td>
										<td className="px-5 py-4">
											<span className={`px-2 py-0.5 rounded text-[10px] uppercase border font-black ${TX_STATUS[t.status]?.color}`}>
												{TX_STATUS[t.status]?.label}
											</span>
										</td>
										<td className="px-5 py-4"></td>
									</tr>
								))}
							</tbody>
						</table>
					</div>

					<div className="mt-auto px-5 py-3 border-t border-slate-200 bg-white flex items-center justify-end gap-4 text-sm text-slate-600">
						<span className="font-bold">{total === 0 ? "0-0/0" : `${(page - 1) * 20 + 1}-${Math.min(page * 20, total)}/${total}`}</span>
						<div className="flex items-center gap-1">
							<button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="p-1 hover:bg-slate-100 rounded disabled:opacity-50 text-slate-400"><ChevronLeft className="w-4 h-4" /></button>
							<button disabled={page * 20 >= total} onClick={() => setPage(p => p + 1)} className="p-1 hover:bg-slate-100 rounded disabled:opacity-50 text-slate-400"><ChevronRight className="w-4 h-4" /></button>
						</div>
					</div>
				</div>
			</div>

			<Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Tạo giao dịch mới" size="lg">
				<TransactionForm onSubmit={handleCreateTransaction} onCancel={() => setIsModalOpen(false)} />
			</Modal>
		</div>
	);
}

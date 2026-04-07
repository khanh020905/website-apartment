import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
	ArrowLeftRight,
	Plus,
	Download,
	Upload,
	Search,
	Settings2,
	X,
	ChevronLeft,
	ChevronRight,
	TrendingUp,
	TrendingDown,
	Wallet,
	MoreHorizontal,
	Settings,
} from "lucide-react";
import { useBuilding } from "../contexts/BuildingContext";
import Modal from "../components/modals/Modal";
import TransactionForm from "../components/modals/TransactionForm";

interface Transaction {
	id: string;
	code: string;
	date: string;
	location: string;
	room: string;
	customer: string;
	booking_id: string;
	type: string;
	category: string;
	pay_type: string;
	amount: number;
	flow: "income" | "expense";
	status: "confirmed" | "pending" | "cancelled";
	note: string;
	created_by: string;
}

const formatCurrency = (v: number) =>
	new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(v);

const formatDate = (iso: string) => {
	if (!iso) return "—";
	const d = new Date(iso);
	return d.toLocaleDateString("vi-VN");
};

const MOCK_TRANSACTIONS: Transaction[] = [];

const TX_STATUS: Record<Transaction["status"], { label: string; color: string }> = {
	confirmed: { label: "Đã xác nhận", color: "bg-emerald-100 text-emerald-700" },
	pending: { label: "Chờ xử lý", color: "bg-amber-100 text-amber-700" },
	cancelled: { label: "Đã huỷ", color: "bg-rose-100 text-rose-700" },
};

export default function TransactionsPage() {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const { selectedBuildingId: _ } = useBuilding();
	const [search, setSearch] = useState("");
	const [flowFilter, setFlowFilter] = useState("");
	const [statusFilter, setStatusFilter] = useState("");
	const [page, setPage] = useState(1);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isFilterOpen, setIsFilterOpen] = useState(false);

	// Stats calculation
	const income = MOCK_TRANSACTIONS.filter((t) => t.flow === "income").reduce(
		(s, t) => s + t.amount,
		0,
	);
	const expense = MOCK_TRANSACTIONS.filter((t) => t.flow === "expense").reduce(
		(s, t) => s + t.amount,
		0,
	);
	const profit = income - expense;

	const statCards = [
		{
			label: "Lợi nhuận",
			value: profit,
			icon: Wallet,
			iconBg: "bg-violet-100",
			iconColor: "text-violet-600",
		},
		{
			label: "Tổng thu",
			value: income,
			icon: TrendingUp,
			iconBg: "bg-emerald-100",
			iconColor: "text-emerald-600",
		},
		{
			label: "Tổng chi",
			value: expense,
			icon: TrendingDown,
			iconBg: "bg-rose-100",
			iconColor: "text-rose-600",
		},
		{
			label: "Số giao dịch",
			value: MOCK_TRANSACTIONS.length,
			icon: ArrowLeftRight,
			iconBg: "bg-amber-100",
			iconColor: "text-amber-600",
			isCount: true,
		},
	];

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const handleCreateTransaction = (data: any) => {
		console.log("Creating transaction:", data);
		setIsModalOpen(false);
	};

	const clearFilters = () => {
		setSearch("");
		setFlowFilter("");
		setStatusFilter("");
	};

	return (
		<div className="flex-1 flex flex-col h-full bg-[#f8f9fa] relative overflow-hidden">
			{/* Header */}
			<div className="bg-white border-b border-slate-200">
				<div className="px-6 py-4 flex items-center justify-between">
					<h1 className="text-[20px] font-bold text-slate-900 tracking-tight">Giao dịch</h1>
					<div className="flex items-center gap-2">
						<button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
							<Upload className="w-4 h-4" />
							<span className="hidden sm:inline">Nhập dữ liệu</span>
						</button>
						<button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
							<Download className="w-4 h-4" />
							<span className="hidden sm:inline">Xuất dữ liệu</span>
						</button>
					</div>
				</div>

				{/* Toolbar */}
				<div className="px-6 pb-4 flex flex-col sm:flex-row items-center gap-3">
					<div className="relative w-full sm:w-[320px] shrink-0">
						<Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
						<input
							type="text"
							placeholder="Tìm kiếm mã giao dịch, hoá đơn, khách hàng..."
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-[13px] text-slate-700 bg-white focus:outline-none focus:border-amber-400 hover:border-slate-300 transition-all font-medium"
						/>
					</div>

					<div className="w-full sm:w-40 shrink-0">
						<select
							value={flowFilter}
							onChange={(e) => setFlowFilter(e.target.value)}
							className="w-full px-3 py-2 border border-slate-200 rounded-lg text-[13px] text-slate-600 bg-white focus:outline-none focus:border-amber-400 hover:border-slate-300 transition-all cursor-pointer appearance-none font-medium"
						>
							<option value="">Loại giao dịch</option>
							<option value="income">Thu nhập</option>
							<option value="expense">Chi phí</option>
						</select>
					</div>

					<div className="w-full sm:w-48 shrink-0">
						<select
							value={statusFilter}
							onChange={(e) => setStatusFilter(e.target.value)}
							className="w-full px-3 py-2 border border-slate-200 rounded-lg text-[13px] text-slate-600 bg-white focus:outline-none focus:border-amber-400 hover:border-slate-300 transition-all cursor-pointer appearance-none font-medium"
						>
							<option value="">Hình thức thanh toán</option>
							<option value="bank">Thẻ ngân hàng</option>
							<option value="cash">Tiền mặt</option>
							<option value="transfer">Chuyển khoản</option>
						</select>
					</div>

					<button
						onClick={() => setIsFilterOpen(true)}
						className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg text-[13px] font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm cursor-pointer"
					>
						<Settings2 className="w-4 h-4" />
						Bộ lọc
					</button>

					<button
						onClick={() => setIsModalOpen(true)}
						className="flex items-center gap-2 px-4 py-2 bg-amber-400 text-slate-900 rounded-lg text-[13px] font-bold transition-colors hover:bg-amber-500 shadow-sm ml-auto cursor-pointer"
					>
						<Plus className="w-4 h-4 font-bold" /> Giao dịch
					</button>
				</div>
			</div>

			{/* Main Content Area */}
			<div className="flex-1 overflow-auto bg-[#f8f9fa] p-5 lg:p-6 flex flex-col gap-6">
				{/* Stats Area */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 shrink-0">
					{statCards.map((s, i) => (
						<motion.div
							key={i}
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: i * 0.05 }}
							className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer group"
						>
							<div
								className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${s.iconBg} transition-transform group-hover:scale-110`}
							>
								<s.icon className={`w-5 h-5 ${s.iconColor}`} />
							</div>
							<div className="min-w-0">
								<p className="text-[13px] font-medium text-slate-500">{s.label}</p>
								<p className="text-[20px] font-bold text-slate-900 mt-0.5">
									{"isCount" in s ? s.value : formatCurrency(s.value as number)}
								</p>
							</div>
						</motion.div>
					))}
				</div>

				{/* Table Area */}
				<div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm h-full flex flex-col min-h-100">
					<div className="overflow-x-auto flex-1">
						<table className="w-full h-full text-left">
							<thead className="bg-[#f8f9fa] border-b border-slate-200 sticky top-0 z-10">
								<tr>
									<th className="px-5 py-3.5 w-10">
										<input
											type="checkbox"
											className="rounded border-slate-300 text-amber-500 focus:ring-amber-500 w-4 h-4"
										/>
									</th>
									{[
										"Mã GD",
										"Ngày",
										"Toà nhà",
										"Phòng",
										"Khách hàng",
										"Loại GD",
										"Hình thức",
										"Số tiền",
										"Trạng thái",
										"Ghi chú",
									].map((h, i) => (
										<th
											key={i}
											className="px-5 py-3.5 text-[12px] font-bold text-slate-600 tracking-wide whitespace-nowrap"
										>
											{h} <span className="inline-block ml-1 opacity-50">↕</span>
										</th>
									))}
									<th className="px-5 py-3.5 w-10 text-center">
										<Settings className="w-4 h-4 text-slate-400 inline-block" />
									</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-slate-100">
								{MOCK_TRANSACTIONS.length === 0 && (
									<tr>
										<td
											colSpan={12}
											className="px-6 py-28 text-center bg-white cursor-default"
										>
											<div className="flex flex-col items-center justify-center">
												<div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-4 relative overflow-hidden">
													<svg
														className="w-12 h-12 text-slate-300"
														viewBox="0 0 24 24"
														fill="currentColor"
													>
														<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-2-5.5c-.83 0-1.5-.67-1.5-1.5S9.17 11.5 10 11.5s1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm4 0c-.83 0-1.5-.67-1.5-1.5S13.17 11.5 14 11.5s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
													</svg>
												</div>
												<p className="text-[15px] font-bold text-slate-700">
													Không có dữ liệu giao dịch
												</p>
											</div>
										</td>
									</tr>
								)}
								{MOCK_TRANSACTIONS.map((t) => (
									<tr
										key={t.id}
										className="hover:bg-amber-50/20 transition-colors group cursor-pointer"
									>
										<td className="px-5 py-3.5">
											<input
												type="checkbox"
												className="rounded border-slate-300 text-amber-500 focus:ring-amber-500 w-4 h-4 cursor-pointer"
											/>
										</td>
										<td className="px-5 py-3.5">
											<span className="font-mono text-[13px] font-bold text-blue-600">
												{t.code}
											</span>
										</td>
										<td className="px-5 py-3.5 text-[13px] text-slate-600 font-medium">
											{formatDate(t.date)}
										</td>
										<td className="px-5 py-3.5 text-[13px] text-slate-600 font-medium">
											{t.location}
										</td>
										<td className="px-5 py-3.5 text-[13px] font-bold text-slate-700">
											{t.room || "—"}
										</td>
										<td className="px-5 py-3.5 text-[13px] text-slate-600 font-medium">
											{t.customer || "—"}
										</td>
										<td className="px-5 py-3.5 text-[13px] text-slate-600 font-medium">{t.type}</td>
										<td className="px-5 py-3.5 text-[13px] text-slate-600 font-medium">
											{t.pay_type}
										</td>
										<td className="px-5 py-3.5">
											<span
												className={`text-[13px] font-bold ${t.flow === "income" ? "text-emerald-600" : "text-rose-600"}`}
											>
												{t.flow === "income" ? "+" : "-"}
												{formatCurrency(t.amount)}
											</span>
										</td>
										<td className="px-5 py-3.5">
											<span
												className={`inline-flex px-2 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wide border ${TX_STATUS[t.status].color.replace("bg-", "bg-opacity-20 border-").replace("text-", "text-")}`}
											>
												{TX_STATUS[t.status].label}
											</span>
										</td>
										<td className="px-5 py-3.5 text-[13px] text-slate-500 max-w-30 truncate">
											{t.note || "—"}
										</td>
										<td className="px-5 py-3.5 text-right">
											<button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-amber-600 transition-all">
												<MoreHorizontal className="w-4 h-4" />
											</button>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>

					{/* Pagination Footer */}
					<div className="mt-auto px-5 py-3 border-t border-slate-200 bg-white flex flex-col sm:flex-row items-center justify-between gap-4 text-[13px] text-slate-600 shrink-0">
						<span>
							{MOCK_TRANSACTIONS.length === 0 ?
								"0-0/0"
							:	`1-${MOCK_TRANSACTIONS.length}/${MOCK_TRANSACTIONS.length}`}{" "}
							kết quả
						</span>
						<div className="flex items-center gap-1">
							<button
								onClick={() => setPage((p) => Math.max(1, p - 1))}
								disabled={page === 1}
								className="p-1 hover:bg-slate-100 rounded disabled:opacity-50 text-slate-400 transition-colors"
							>
								<ChevronLeft className="w-4 h-4" />
							</button>
							<button
								disabled
								className="p-1 hover:bg-slate-100 rounded disabled:opacity-50 text-slate-400 transition-colors"
							>
								<ChevronRight className="w-4 h-4" />
							</button>
						</div>
						<select className="px-2 py-1 outline-none border border-slate-200 rounded cursor-pointer text-slate-600 bg-white hover:border-slate-300 appearance-none font-medium text-[13px]">
							<option>20 / trang</option>
							<option>50 / trang</option>
						</select>
					</div>
				</div>
			</div>

			{/* Advanced Filter Sidebar */}
			<AnimatePresence>
				{isFilterOpen && (
					<>
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							onClick={() => setIsFilterOpen(false)}
							className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm z-40 transition-opacity"
						/>
						<motion.div
							initial={{ x: "100%" }}
							animate={{ x: 0 }}
							exit={{ x: "100%" }}
							transition={{ type: "spring", damping: 25, stiffness: 200 }}
							className="absolute top-0 right-0 w-100 h-full bg-white shadow-2xl z-50 flex flex-col border-l border-slate-200"
						>
							<div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
								<h2 className="text-lg font-bold text-slate-900">Bộ lọc nâng cao</h2>
								<button
									onClick={() => setIsFilterOpen(false)}
									className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
								>
									<X className="w-5 h-5" />
								</button>
							</div>

							<div className="flex-1 overflow-y-auto p-5 space-y-6">
								{/* Danh mục giao dịch */}
								<div>
									<h3 className="text-[13px] font-bold text-slate-900 mb-3">Danh mục giao dịch</h3>
									<div className="flex items-center gap-6">
										<label className="flex items-center gap-2 cursor-pointer">
											<input
												type="radio"
												name="flow"
												className="w-4 h-4 text-amber-500 focus:ring-amber-500 border-slate-300"
											/>
											<span className="text-[13px] font-medium text-slate-700">Tất cả</span>
										</label>
										<label className="flex items-center gap-2 cursor-pointer">
											<input
												type="radio"
												name="flow"
												className="w-4 h-4 text-amber-500 focus:ring-amber-500 border-slate-300"
											/>
											<span className="text-[13px] font-medium text-slate-700">Thu nhập</span>
										</label>
										<label className="flex items-center gap-2 cursor-pointer">
											<input
												type="radio"
												name="flow"
												className="w-4 h-4 text-amber-500 focus:ring-amber-500 border-slate-300"
											/>
											<span className="text-[13px] font-medium text-slate-700">Chi phí</span>
										</label>
									</div>
								</div>

								<hr className="border-slate-100" />

								{/* Loại giao dịch */}
								<div>
									<h3 className="text-[13px] font-bold text-slate-900 mb-3">Loại giao dịch</h3>
									<div className="grid grid-cols-2 gap-3">
										{["Thanh toán đặt phòng", "Nhập quỹ", "Rút tiền", "Thuê ngoài", "Khác"].map(
											(st) => (
												<label
													key={st}
													className="flex items-center gap-2 cursor-pointer"
												>
													<input
														type="checkbox"
														className="rounded border-slate-300 text-amber-500 focus:ring-amber-500 w-4 h-4 cursor-pointer"
													/>
													<span className="text-[13px] font-medium text-slate-700">{st}</span>
												</label>
											),
										)}
									</div>
								</div>

								<hr className="border-slate-100" />

								{/* Hình thức thanh toán */}
								<div>
									<h3 className="text-[13px] font-bold text-slate-900 mb-3">
										Hình thức thanh toán
									</h3>
									<div className="flex flex-wrap gap-4">
										{["Thẻ ngân hàng", "Tiền mặt", "Chuyển khoản"].map((st) => (
											<label
												key={st}
												className="flex items-center gap-2 cursor-pointer"
											>
												<input
													type="checkbox"
													className="rounded border-slate-300 text-amber-500 focus:ring-amber-500 w-4 h-4 cursor-pointer"
												/>
												<span className="text-[13px] font-medium text-slate-700">{st}</span>
											</label>
										))}
									</div>
								</div>

								<hr className="border-slate-100" />

								{/* Số tiền */}
								<div>
									<div className="flex items-center justify-between mb-3">
										<h3 className="text-[13px] font-bold text-slate-900">Số tiền</h3>
										<span className="text-[12px] font-bold text-blue-600">0đ - 100.000.000đ</span>
									</div>
									<input
										type="range"
										min="0"
										max="100000000"
										className="w-full accent-amber-500"
									/>
								</div>

								<hr className="border-slate-100" />

								{/* Ngày giao dịch */}
								<div>
									<h3 className="text-[13px] font-bold text-slate-900 mb-3">Ngày giao dịch</h3>
									<div className="flex items-center gap-2">
										<input
											type="date"
											className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-[13px] font-medium text-slate-900 focus:outline-none focus:border-amber-400"
										/>
										<span className="text-slate-400">-</span>
										<input
											type="date"
											className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-[13px] font-medium text-slate-900 focus:outline-none focus:border-amber-400"
										/>
									</div>
								</div>
							</div>

							{/* Slider Footer */}
							<div className="p-5 border-t border-slate-100 bg-white flex items-center justify-end gap-3 shrink-0">
								<button
									onClick={clearFilters}
									className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
								>
									Đặt lại
								</button>
								<button
									onClick={() => setIsFilterOpen(false)}
									className="px-6 py-2.5 text-sm font-bold bg-amber-400 hover:bg-amber-500 text-slate-900 rounded-lg transition-colors shadow-sm cursor-pointer"
								>
									Áp dụng
								</button>
							</div>
						</motion.div>
					</>
				)}
			</AnimatePresence>

			<Modal
				isOpen={isModalOpen}
				onClose={() => setIsModalOpen(false)}
				title="Tạo giao dịch mới"
				size="lg"
			>
				<TransactionForm
					onSubmit={handleCreateTransaction}
					onCancel={() => setIsModalOpen(false)}
				/>
			</Modal>
		</div>
	);
}

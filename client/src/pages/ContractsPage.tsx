import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
	FileText,
	Plus,
	ChevronLeft,
	ChevronRight,
	Calendar,
	Search,
	Download,
	Home,
	User,
	CheckCircle2,
	Clock,
	LogOut,
	RefreshCcw,
	Settings,
	Settings2,
	MoreHorizontal,
	X,
} from "lucide-react";
import Modal from "../components/modals/Modal";
import ContractForm from "../components/modals/ContractForm";

interface Contract {
	id: string;
	contract_number: string;
	contract_name: string;
	room_number: string;
	tenant_name: string;
	start_date: string;
	end_date: string;
	status: "active" | "extended" | "settled" | "pending";
	booking_code: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const STATUS_MAP: Record<Contract["status"], { label: string; color: string; icon: any }> = {
	active: { label: "Đang hiệu lực", color: "bg-emerald-100 text-emerald-700", icon: CheckCircle2 },
	extended: { label: "Đã gia hạn", color: "bg-blue-100 text-blue-700", icon: RefreshCcw },
	settled: { label: "Đã thanh lý", color: "bg-slate-100 text-slate-500", icon: LogOut },
	pending: { label: "Chờ xác nhận", color: "bg-amber-100 text-amber-700", icon: Clock },
};

export default function ContractsPage() {
	const [loading, setLoading] = useState(true);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isFilterOpen, setIsFilterOpen] = useState(false);

	const [contracts] = useState<Contract[]>([
		{
			id: "1",
			contract_number: "HD-2024-001",
			contract_name: "Hợp đồng thuê phòng 201",
			room_number: "201",
			tenant_name: "Nguyễn Văn An",
			start_date: "2024-04-01",
			end_date: "2025-04-01",
			status: "active",
			booking_code: "BK9921",
		},
		{
			id: "2",
			contract_number: "HD-2024-002",
			contract_name: "Hợp đồng thuê phòng 305",
			room_number: "305",
			tenant_name: "Trần Thị Bình",
			start_date: "2024-03-15",
			end_date: "2024-09-15",
			status: "extended",
			booking_code: "BK8842",
		},
	]);
	const [search, setSearch] = useState("");
	const [filterStatus, setFilterStatus] = useState("");

	useEffect(() => {
		const timer = setTimeout(() => setLoading(false), 500);
		return () => clearTimeout(timer);
	}, []);

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const handleCreateContract = (data: any) => {
		console.log("Creating contract:", data);
		setIsModalOpen(false);
	};

	const STATS = [
		{
			label: "Đang hiệu lực",
			value: 124,
			icon: CheckCircle2,
			color: "text-emerald-500",
			bg: "bg-emerald-50",
		},
		{ label: "Chờ xác nhận", value: 8, icon: Clock, color: "text-amber-500", bg: "bg-amber-50" },
		{ label: "Đã thanh lý", value: 45, icon: LogOut, color: "text-slate-400", bg: "bg-slate-50" },
	];

	return (
		<div className="flex-1 flex flex-col h-full bg-[#f8f9fa] relative overflow-hidden">
			{/* Header */}
			<div className="bg-white border-b border-slate-200">
				<div className="px-6 py-4 flex items-center justify-between">
					<h1 className="text-[20px] font-bold text-slate-900 tracking-tight">Hợp đồng</h1>
				</div>

				{/* Toolbar */}
				<div className="px-6 pb-4 flex flex-col sm:flex-row items-center gap-3">
					<div className="relative w-full sm:w-[320px] shrink-0">
						<Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
						<input
							type="text"
							placeholder="Tìm kiếm số hợp đồng, khách hàng theo tên, điện thoại..."
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-[13px] text-slate-700 bg-white focus:outline-none focus:border-amber-400 hover:border-slate-300 transition-all font-medium"
						/>
					</div>

					<div className="flex items-center gap-2">
						<input
							type="date"
							className="w-31.25 px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 bg-white focus:outline-none focus:border-amber-400 hover:border-slate-300 transition-all font-medium text-[13px] "
						/>
						<span className="text-slate-400">-</span>
						<input
							type="date"
							className="w-31.25 px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 bg-white focus:outline-none focus:border-amber-400 hover:border-slate-300 transition-all font-medium text-[13px] "
						/>
					</div>

					<div className="w-full sm:w-44 shrink-0">
						<select
							value={filterStatus}
							onChange={(e) => setFilterStatus(e.target.value)}
							className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 bg-white focus:outline-none focus:border-amber-400 hover:border-slate-300 transition-all cursor-pointer appearance-none font-medium text-[13px]"
						>
							<option value="">Giai đoạn hợp đồng</option>
							<option value="active">Hiệu lực</option>
							<option value="expired">Hết hiệu lực</option>
							<option value="pending">Chờ tái ký</option>
							<option value="cancelled">Đã thanh lý</option>
							<option value="draft">Bản thảo</option>
						</select>
					</div>

					<button
						onClick={() => setIsFilterOpen(true)}
						className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg text-[13px] font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm cursor-pointer"
					>
						<Settings2 className="w-4 h-4" />
						Bộ lọc
					</button>

					<div className="flex items-center gap-2 ml-auto">
						<button className="flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 text-emerald-600 rounded-lg text-[13px] font-bold transition-colors hover:bg-emerald-50 shadow-sm cursor-pointer">
							<Download className="w-4 h-4" /> Xuất Excel
						</button>
						<button
							onClick={() => setIsModalOpen(true)}
							className="flex items-center gap-1.5 px-4 py-2 bg-amber-400 text-slate-900 rounded-lg text-[13px] font-bold transition-colors hover:bg-amber-500 shadow-sm cursor-pointer"
						>
							<Plus className="w-4 h-4 font-bold" /> Tạo
						</button>
					</div>
				</div>
			</div>

			{/* Main Content Area */}
			<div className="flex-1 overflow-auto bg-[#f8f9fa] p-5 lg:p-6 flex flex-col gap-6">
				{/* Stats Cards (Optional for layout) */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6 shrink-0">
					{STATS.map((stat, i) => (
						<div
							key={i}
							className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 group hover:shadow-md hover:border-slate-300 transition-all cursor-pointer"
						>
							<div
								className={`w-12 h-12 ${stat.bg} rounded-xl flex items-center justify-center transition-transform group-hover:scale-110`}
							>
								<stat.icon className={`w-6 h-6 ${stat.color}`} />
							</div>
							<div>
								<p className="text-[13px] font-medium text-slate-500">{stat.label}</p>
								<h3 className="text-[20px] font-bold text-slate-900 mt-0.5">{stat.value}</h3>
							</div>
						</div>
					))}
				</div>

				{/* Table Area */}
				<div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm h-full flex flex-col min-h-100">
					<div className="overflow-x-auto flex-1">
						<table className="w-full h-full text-left">
							<thead className="bg-[#f8f9fa] border-b border-slate-200 sticky top-0 z-10">
								<tr>
									{[
										"Mã hợp đồng",
										"Tên hợp đồng",
										"Phòng",
										"Khách ở",
										"Thời hạn",
										"Trạng thái",
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
								{loading ?
									<tr>
										<td
											colSpan={7}
											className="px-6 py-28 text-center bg-white cursor-default"
										>
											<div className="w-8 h-8 border-4 border-amber-200 border-t-amber-500 rounded-full animate-spin mx-auto mb-3" />
											<p className="text-sm font-medium text-slate-500 uppercase tracking-widest">
												Đang tải...
											</p>
										</td>
									</tr>
								:	contracts.map((c) => (
										<tr
											key={c.id}
											className="hover:bg-amber-50/20 transition-colors group"
										>
											<td className="px-5 py-4 whitespace-nowrap">
												<span className="text-[13px] font-bold text-blue-600 uppercase">
													{c.contract_number}
												</span>
											</td>
											<td className="px-5 py-4">
												<div className="flex items-center gap-2">
													<FileText className="w-4 h-4 text-slate-400" />
													<span className="text-[13px] font-bold text-slate-900 truncate max-w-50">
														{c.contract_name}
													</span>
												</div>
											</td>
											<td className="px-5 py-4 whitespace-nowrap">
												<div className="flex items-center gap-2 text-[13px] font-bold text-slate-700">
													<Home className="w-4 h-4 text-slate-400" />
													{c.room_number}
												</div>
											</td>
											<td className="px-5 py-4 whitespace-nowrap">
												<div className="flex items-center gap-2 text-[13px] font-medium text-slate-600">
													<User className="w-4 h-4 text-slate-400" />
													{c.tenant_name}
												</div>
											</td>
											<td className="px-5 py-4 whitespace-nowrap">
												<div className="flex flex-col text-[11px] font-bold text-slate-500 space-y-1">
													<span className="flex items-center gap-1">
														<Calendar className="w-3 h-3" /> Bắt đầu: {c.start_date}
													</span>
													<span className="flex items-center gap-1">
														<Calendar className="w-3 h-3 text-slate-300" /> Kết thúc: {c.end_date}
													</span>
												</div>
											</td>
											<td className="px-5 py-4 whitespace-nowrap">
												<span
													className={`px-2 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider border ${STATUS_MAP[c.status].color.replace("bg-", "bg-opacity-20 border-").replace("text-", "text-")}`}
												>
													{STATUS_MAP[c.status].label}
												</span>
											</td>
											<td className="px-5 py-4 text-right">
												<button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-amber-600 transition-all">
													<MoreHorizontal className="w-4 h-4" />
												</button>
											</td>
										</tr>
									))
								}
							</tbody>
						</table>
					</div>

					{/* Pagination Footer */}
					<div className="mt-auto px-5 py-3 border-t border-slate-200 bg-white flex items-center justify-end gap-4 text-[13px] text-slate-600">
						<span>
							{contracts.length === 0 ? "0-0/0" : `1-${contracts.length}/${contracts.length}`} kết
							quả
						</span>
						<div className="flex items-center gap-1">
							<button
								disabled
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
								{/* Mẫu hợp đồng */}
								<div>
									<h3 className="text-[13px] font-bold text-slate-900 mb-3">Mẫu hợp đồng</h3>
									<select className="w-full px-3 py-2 border border-slate-200 rounded-lg text-[13px] font-medium text-slate-900 focus:outline-none focus:border-amber-400 appearance-none">
										<option value="">Tất cả mẫu</option>
										<option value="1">Hợp đồng thuê căn hộ</option>
										<option value="2">Hợp đồng thuê mặt bằng</option>
									</select>
								</div>

								<hr className="border-slate-100" />

								{/* Người đảm nhận */}
								<div>
									<h3 className="text-[13px] font-bold text-slate-900 mb-3">Người đảm nhận</h3>
									<select className="w-full px-3 py-2 border border-slate-200 rounded-lg text-[13px] font-medium text-slate-900 focus:outline-none focus:border-amber-400 appearance-none">
										<option value="">Tất cả nhân viên</option>
										<option value="1">Admin</option>
										<option value="2">Nhân viên sale 1</option>
									</select>
								</div>

								<hr className="border-slate-100" />

								{/* Trạng thái ký */}
								<div>
									<h3 className="text-[13px] font-bold text-slate-900 mb-3">Trạng thái ký</h3>
									<div className="grid grid-cols-2 gap-3">
										{["Đã ký", "Chưa ký", "Đã hủy"].map((st) => (
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

								{/* Giai đoạn hợp đồng */}
								<div>
									<h3 className="text-[13px] font-bold text-slate-900 mb-3">Giai đoạn hợp đồng</h3>
									<div className="grid grid-cols-2 gap-3">
										{[
											"Hết hiệu lực",
											"Hiệu lực",
											"Chờ tái ký",
											"Không tái ký",
											"Đã thanh lý",
											"Bản thảo",
										].map((st) => (
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
							</div>

							{/* Slider Footer */}
							<div className="p-5 border-t border-slate-100 bg-white flex items-center justify-end gap-3 shrink-0">
								<button
									onClick={() => {
										setSearch("");
										setFilterStatus("");
									}}
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
				title="Tạo hợp đồng mới"
				size="lg"
			>
				<ContractForm
					onSubmit={handleCreateContract}
					onCancel={() => setIsModalOpen(false)}
				/>
			</Modal>
		</div>
	);
}

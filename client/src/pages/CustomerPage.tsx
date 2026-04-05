import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
	Users,
	Search,
	Filter,
	Upload,
	Plus,
	UserCheck,
	UserMinus,
	Building2,
	Home,
	ChevronLeft,
	ChevronRight,
	X,
	Phone,
	Mail,
	Calendar,
	CreditCard,
	Eye,
	Edit3,
	Trash2,
	Download,
} from "lucide-react";
import { useBuilding } from "../contexts/BuildingContext";
import { api } from "../lib/api";
import * as XLSX from "xlsx";

interface CustomerRoom {
	id: string;
	room_number: string;
	floor: number;
	building_id: string;
	building: {
		id: string;
		name: string;
	};
}

interface Customer {
	id: string;
	tenant_name: string;
	tenant_phone: string | null;
	tenant_email: string | null;
	tenant_gender: "male" | "female" | "other" | null;
	tenant_id_number: string | null;
	residence_status: "pending" | "completed" | "not_registered" | null;
	start_date: string;
	end_date: string | null;
	rent_amount: number;
	deposit_amount: number;
	status: string;
	created_at: string;
	room: CustomerRoom;
}

interface CustomerStats {
	total: number;
	active: number;
	terminated: number;
}

interface CustomerResponse {
	customers: Customer[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
	stats: CustomerStats;
}

interface RoomOption {
	id: string;
	room_number: string;
	floor: number;
	status: string;
	building_id: string;
	buildings: {
		id: string;
		name: string;
	};
}

const CustomerPage = () => {
	const { selectedBuildingId } = useBuilding();
	const [loading, setLoading] = useState(true);
	const [customers, setCustomers] = useState<Customer[]>([]);
	const [stats, setStats] = useState<CustomerStats>({ total: 0, active: 0, terminated: 0 });
	const [search, setSearch] = useState("");
	const [debouncedSearch, setDebouncedSearch] = useState("");
	const [isFilterOpen, setIsFilterOpen] = useState(false);
	const [isAddModalOpen, setIsAddModalOpen] = useState(false);
	const [rooms, setRooms] = useState<RoomOption[]>([]);
	const [exporting, setExporting] = useState(false);

	// Pagination
	const [page, setPage] = useState(1);
	const [limit, setLimit] = useState(20);
	const [totalPages, setTotalPages] = useState(1);
	const [total, setTotal] = useState(0);

	// Filter States
	const [filterStatus, setFilterStatus] = useState("");
	const [filterResidency, setFilterResidency] = useState("");
	const [filterGender, setFilterGender] = useState("");

	// Add customer form
	const [newCustomer, setNewCustomer] = useState({
		room_id: "",
		tenant_name: "",
		tenant_phone: "",
		tenant_email: "",
		tenant_gender: "" as "male" | "female" | "other" | "",
		tenant_id_number: "",
		start_date: new Date().toISOString().split("T")[0],
		end_date: "",
		rent_amount: "",
		deposit_amount: "",
		notes: "",
	});
	const [submitting, setSubmitting] = useState(false);

	// Debounce search
	useEffect(() => {
		const timer = setTimeout(() => setDebouncedSearch(search), 300);
		return () => clearTimeout(timer);
	}, [search]);

	// Reset page when filters change
	useEffect(() => {
		setPage(1);
	}, [debouncedSearch, filterStatus, filterGender, filterResidency, selectedBuildingId]);

	const fetchCustomers = useCallback(async () => {
		setLoading(true);
		const params = new URLSearchParams({
			page: page.toString(),
			limit: limit.toString(),
		});

		if (debouncedSearch) params.append("search", debouncedSearch);
		if (filterStatus) params.append("status", filterStatus);
		if (filterGender) params.append("gender", filterGender);
		if (filterResidency) params.append("residence_status", filterResidency);
		if (selectedBuildingId) params.append("building_id", selectedBuildingId);

		const { data } = await api.get<CustomerResponse>(`/api/customers?${params}`);
		if (data) {
			setCustomers(data.customers);
			setStats(data.stats);
			setTotal(data.total);
			setTotalPages(data.totalPages);
		}
		setLoading(false);
	}, [
		page,
		limit,
		debouncedSearch,
		filterStatus,
		filterGender,
		filterResidency,
		selectedBuildingId,
	]);

	useEffect(() => {
		fetchCustomers();
	}, [fetchCustomers]);

	// Fetch rooms for dropdown
	useEffect(() => {
		const fetchRooms = async () => {
			const { data } = await api.get<{ rooms: RoomOption[] }>("/api/customers/rooms");
			if (data) setRooms(data.rooms);
		};
		fetchRooms();
	}, []);

	const handleExportExcel = async () => {
		setExporting(true);
		try {
			const { data } = await api.get<{ data: Record<string, unknown>[] }>("/api/customers/export");
			if (data?.data) {
				const ws = XLSX.utils.json_to_sheet(data.data);
				const wb = XLSX.utils.book_new();
				XLSX.utils.book_append_sheet(wb, ws, "Khách hàng");
				XLSX.writeFile(wb, `khach-hang-${new Date().toISOString().split("T")[0]}.xlsx`);
			}
		} catch (err) {
			console.error("Export error:", err);
		}
		setExporting(false);
	};

	const handleAddCustomer = async (e: React.FormEvent) => {
		e.preventDefault();
		if (
			!newCustomer.room_id ||
			!newCustomer.tenant_name ||
			!newCustomer.start_date ||
			!newCustomer.rent_amount
		) {
			return;
		}

		setSubmitting(true);
		const { data, error } = await api.post("/api/contracts", {
			room_id: newCustomer.room_id,
			tenant_name: newCustomer.tenant_name,
			tenant_phone: newCustomer.tenant_phone || null,
			tenant_email: newCustomer.tenant_email || null,
			tenant_gender: newCustomer.tenant_gender || null,
			tenant_id_number: newCustomer.tenant_id_number || null,
			start_date: newCustomer.start_date,
			end_date: newCustomer.end_date || null,
			rent_amount: parseInt(newCustomer.rent_amount),
			deposit_amount: parseInt(newCustomer.deposit_amount) || 0,
			notes: newCustomer.notes || null,
		});

		setSubmitting(false);

		if (data) {
			setIsAddModalOpen(false);
			setNewCustomer({
				room_id: "",
				tenant_name: "",
				tenant_phone: "",
				tenant_email: "",
				tenant_gender: "",
				tenant_id_number: "",
				start_date: new Date().toISOString().split("T")[0],
				end_date: "",
				rent_amount: "",
				deposit_amount: "",
				notes: "",
			});
			fetchCustomers();
		} else if (error) {
			alert(error);
		}
	};

	const clearFilters = () => {
		setFilterStatus("");
		setFilterResidency("");
		setFilterGender("");
		setSearch("");
	};

	const statCards = [
		{
			label: "Tổng số khách hàng",
			value: stats.total,
			icon: Users,
			gradient: "from-violet-500 to-purple-600",
			shadowColor: "shadow-violet-500/25",
		},
		{
			label: "Đang ở",
			value: stats.active,
			icon: UserCheck,
			gradient: "from-emerald-500 to-teal-600",
			shadowColor: "shadow-emerald-500/25",
		},
		{
			label: "Đã chuyển đi",
			value: stats.terminated,
			icon: UserMinus,
			gradient: "from-rose-500 to-pink-600",
			shadowColor: "shadow-rose-500/25",
		},
	];

	return (
		<div className="p-6 lg:p-8 space-y-6 bg-linear-to-br from-slate-50 to-slate-100/50 min-h-full">
			{/* Header */}
			<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
				<div>
					<h1 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">
						Khách hàng
					</h1>
					<p className="text-sm text-slate-500 mt-1">Quản lý thông tin khách thuê</p>
				</div>
				<div className="flex items-center gap-2 sm:gap-3">
					<button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm">
						<Upload className="w-4 h-4" />
						<span className="hidden sm:inline">Tải tệp</span>
					</button>
					<button
						onClick={handleExportExcel}
						disabled={exporting}
						className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-emerald-600 hover:bg-emerald-50 hover:border-emerald-200 transition-all shadow-sm disabled:opacity-50"
					>
						{exporting ?
							<div className="w-4 h-4 border-2 border-emerald-600/20 border-t-emerald-600 rounded-full animate-spin" />
						:	<Download className="w-4 h-4" />}
						<span className="hidden sm:inline">Excel</span>
					</button>
					<button
						onClick={() => setIsAddModalOpen(true)}
						className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-900 rounded-xl text-sm font-bold transition-all hover:shadow-lg hover:shadow-amber-500/25 hover:scale-[1.02] active:scale-[0.98]"
					>
						<Plus className="w-5 h-5" />
						<span className="hidden sm:inline">Thêm khách</span>
					</button>
				</div>
			</div>

			{/* Stats Grid - Redesigned */}
			<div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
				{statCards.map((stat, i) => (
					<motion.div
						key={i}
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: i * 0.1, type: "spring", stiffness: 300 }}
						className={`relative overflow-hidden bg-gradient-to-br ${stat.gradient} p-6 rounded-2xl shadow-lg ${stat.shadowColor} group hover:scale-[1.02] transition-transform`}
					>
						<div className="relative z-10">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-4xl lg:text-5xl font-black text-white mb-1">{stat.value}</p>
									<p className="text-sm font-medium text-white/80">{stat.label}</p>
								</div>
								<div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
									<stat.icon className="w-6 h-6 text-white" />
								</div>
							</div>
						</div>
						<div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-xl" />
					</motion.div>
				))}
			</div>

			{/* Table Section */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.3 }}
				className="bg-white rounded-2xl border border-slate-200/60 shadow-xl shadow-slate-200/50 overflow-hidden"
			>
				{/* Search & Filters */}
				<div className="p-4 lg:p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50/50 to-transparent">
					<div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3 lg:gap-4">
						<div className="relative flex-1">
							<input
								type="text"
								placeholder="Tìm kiếm theo tên, điện thoại, email..."
								value={search}
								onChange={(e) => setSearch(e.target.value)}
								className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all placeholder:text-slate-400"
							/>
							<Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
						</div>

						<div className="flex items-center gap-2 lg:gap-3">
							<select
								value={filterStatus}
								onChange={(e) => setFilterStatus(e.target.value)}
								className="px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 min-w-[140px] cursor-pointer"
							>
								<option value="">Tất cả trạng thái</option>
								<option value="active">Đang ở</option>
								<option value="terminated">Đã chuyển đi</option>
							</select>

							<button
								onClick={() => setIsFilterOpen(true)}
								className={`flex items-center gap-2 px-4 py-3 border rounded-xl text-sm font-medium transition-all ${
									filterGender || filterResidency ?
										"bg-amber-50 border-amber-200 text-amber-700"
									:	"bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
								}`}
							>
								<Filter className="w-4 h-4" />
								Bộ lọc
								{(filterGender || filterResidency) && (
									<span className="w-2 h-2 bg-amber-500 rounded-full" />
								)}
							</button>

							{(filterStatus || filterGender || filterResidency || search) && (
								<button
									onClick={clearFilters}
									className="flex items-center gap-1 px-3 py-3 text-sm font-medium text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
								>
									<X className="w-4 h-4" />
									Xoá
								</button>
							)}
						</div>
					</div>
				</div>

				{/* Table */}
				<div className="overflow-x-auto">
					<table className="w-full">
						<thead className="bg-slate-50/80">
							<tr>
								<th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
									Khách hàng
								</th>
								<th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
									Phòng
								</th>
								<th className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">
									Giới tính
								</th>
								<th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
									CCCD/Hộ chiếu
								</th>
								<th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
									Tạm trú
								</th>
								<th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
									Trạng thái
								</th>
								<th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
									Toà nhà
								</th>
								<th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">
									Thao tác
								</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-slate-100">
							{loading ?
								<tr>
									<td
										colSpan={8}
										className="px-6 py-20 text-center"
									>
										<div className="flex flex-col items-center gap-4">
											<div className="w-12 h-12 border-4 border-amber-200 border-t-amber-500 rounded-full animate-spin" />
											<p className="text-sm font-medium text-slate-500">Đang tải dữ liệu...</p>
										</div>
									</td>
								</tr>
							: customers.length === 0 ?
								<tr>
									<td
										colSpan={8}
										className="px-6 py-24 text-center"
									>
										<div className="flex flex-col items-center gap-4">
											<div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center">
												<Users className="w-10 h-10 text-slate-400" />
											</div>
											<div>
												<p className="text-lg font-bold text-slate-700">Chưa có khách hàng</p>
												<p className="text-sm text-slate-500 mt-1">Nhấn "Thêm khách" để bắt đầu</p>
											</div>
										</div>
									</td>
								</tr>
							:	customers.map((c, idx) => (
									<motion.tr
										key={c.id}
										initial={{ opacity: 0, y: 10 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ delay: idx * 0.03 }}
										className="hover:bg-amber-50/30 transition-colors group"
									>
										<td className="px-6 py-4">
											<div className="flex items-center gap-3">
												<div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 text-white rounded-xl flex items-center justify-center font-bold text-sm shadow-sm">
													{c.tenant_name[0]?.toUpperCase() || "K"}
												</div>
												<div>
													<p className="text-sm font-semibold text-slate-900">{c.tenant_name}</p>
													<div className="flex items-center gap-3 mt-0.5">
														{c.tenant_phone && (
															<span className="flex items-center gap-1 text-xs text-slate-500">
																<Phone className="w-3 h-3" />
																{c.tenant_phone}
															</span>
														)}
														{c.tenant_email && (
															<span className="flex items-center gap-1 text-xs text-slate-500">
																<Mail className="w-3 h-3" />
																{c.tenant_email}
															</span>
														)}
													</div>
												</div>
											</div>
										</td>
										<td className="px-6 py-4">
											<div className="flex items-center gap-2">
												<div className="p-1.5 bg-blue-50 rounded-lg">
													<Home className="w-4 h-4 text-blue-600" />
												</div>
												<span className="text-sm font-medium text-slate-700">
													{c.room?.room_number}
												</span>
											</div>
										</td>
										<td className="px-6 py-4 text-center">
											<span
												className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-medium ${
													c.tenant_gender === "male" ? "bg-blue-50 text-blue-700"
													: c.tenant_gender === "female" ? "bg-pink-50 text-pink-700"
													: "bg-slate-100 text-slate-600"
												}`}
											>
												{c.tenant_gender === "male" ?
													"Nam"
												: c.tenant_gender === "female" ?
													"Nữ"
												:	"Khác"}
											</span>
										</td>
										<td className="px-6 py-4">
											<div className="flex items-center gap-2">
												<CreditCard className="w-4 h-4 text-slate-400" />
												<span className="text-sm text-slate-600 font-mono">
													{c.tenant_id_number || "—"}
												</span>
											</div>
										</td>
										<td className="px-6 py-4">
											<div className="flex items-center gap-2">
												<span
													className={`w-2 h-2 rounded-full ${
														c.residence_status === "completed" ? "bg-emerald-500"
														: c.residence_status === "pending" ? "bg-amber-500"
														: "bg-slate-300"
													}`}
												/>
												<span className="text-sm text-slate-600">
													{c.residence_status === "completed" ?
														"Đã đăng ký"
													: c.residence_status === "pending" ?
														"Đang chờ"
													:	"Chưa đăng ký"}
												</span>
											</div>
										</td>
										<td className="px-6 py-4">
											<span
												className={`inline-flex px-3 py-1.5 rounded-full text-xs font-bold ${
													c.status === "active" ?
														"bg-emerald-100 text-emerald-700"
													:	"bg-slate-100 text-slate-600"
												}`}
											>
												{c.status === "active" ? "● Đang ở" : "○ Đã đi"}
											</span>
										</td>
										<td className="px-6 py-4">
											<div className="flex items-center gap-2">
												<Building2 className="w-4 h-4 text-slate-400" />
												<span className="text-sm text-slate-600">{c.room?.building?.name}</span>
											</div>
										</td>
										<td className="px-6 py-4">
											<div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
												<button className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-blue-600 transition-colors">
													<Eye className="w-4 h-4" />
												</button>
												<button className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-amber-600 transition-colors">
													<Edit3 className="w-4 h-4" />
												</button>
												<button className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-rose-600 transition-colors">
													<Trash2 className="w-4 h-4" />
												</button>
											</div>
										</td>
									</motion.tr>
								))
							}
						</tbody>
					</table>
				</div>

				{/* Pagination */}
				<div className="p-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
					<div className="flex items-center gap-2 text-sm text-slate-600">
						<span>Hiển thị</span>
						<select
							value={limit}
							onChange={(e) => {
								setLimit(parseInt(e.target.value));
								setPage(1);
							}}
							className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20"
						>
							<option value={10}>10</option>
							<option value={20}>20</option>
							<option value={50}>50</option>
							<option value={100}>100</option>
						</select>
						<span>
							trên tổng số <strong>{total}</strong> khách hàng
						</span>
					</div>

					<div className="flex items-center gap-2">
						<button
							onClick={() => setPage((p) => Math.max(1, p - 1))}
							disabled={page === 1}
							className="p-2 hover:bg-white border border-transparent hover:border-slate-200 rounded-lg text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
						>
							<ChevronLeft className="w-5 h-5" />
						</button>

						<div className="flex items-center gap-1">
							{Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
								let pageNum: number;
								if (totalPages <= 5) {
									pageNum = i + 1;
								} else if (page <= 3) {
									pageNum = i + 1;
								} else if (page >= totalPages - 2) {
									pageNum = totalPages - 4 + i;
								} else {
									pageNum = page - 2 + i;
								}
								return (
									<button
										key={pageNum}
										onClick={() => setPage(pageNum)}
										className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${
											page === pageNum ?
												"bg-amber-500 text-white shadow-sm"
											:	"hover:bg-white hover:border-slate-200 border border-transparent text-slate-600"
										}`}
									>
										{pageNum}
									</button>
								);
							})}
						</div>

						<button
							onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
							disabled={page === totalPages || totalPages === 0}
							className="p-2 hover:bg-white border border-transparent hover:border-slate-200 rounded-lg text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
						>
							<ChevronRight className="w-5 h-5" />
						</button>
					</div>
				</div>
			</motion.div>

			{/* Filter Drawer */}
			<AnimatePresence>
				{isFilterOpen && (
					<>
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							onClick={() => setIsFilterOpen(false)}
							className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-[100]"
						/>
						<motion.div
							initial={{ x: "100%" }}
							animate={{ x: 0 }}
							exit={{ x: "100%" }}
							transition={{ type: "spring", damping: 25, stiffness: 300 }}
							className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl z-[101] flex flex-col"
						>
							<div className="p-6 flex items-center justify-between border-b border-slate-100">
								<h2 className="text-xl font-bold text-slate-900">Bộ lọc nâng cao</h2>
								<button
									onClick={() => setIsFilterOpen(false)}
									className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition-all"
								>
									<X className="w-5 h-5" />
								</button>
							</div>

							<div className="flex-1 overflow-y-auto p-6 space-y-6">
								<div className="space-y-3">
									<label className="text-sm font-semibold text-slate-700">Giới tính</label>
									<div className="grid grid-cols-3 gap-2">
										{[
											{ value: "", label: "Tất cả" },
											{ value: "male", label: "Nam" },
											{ value: "female", label: "Nữ" },
										].map((opt) => (
											<button
												key={opt.value}
												onClick={() => setFilterGender(opt.value)}
												className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
													filterGender === opt.value ?
														"bg-amber-500 text-white"
													:	"bg-slate-100 text-slate-600 hover:bg-slate-200"
												}`}
											>
												{opt.label}
											</button>
										))}
									</div>
								</div>

								<div className="space-y-3">
									<label className="text-sm font-semibold text-slate-700">Trạng thái tạm trú</label>
									<div className="grid grid-cols-2 gap-2">
										{[
											{ value: "", label: "Tất cả" },
											{ value: "completed", label: "Đã đăng ký" },
											{ value: "pending", label: "Đang chờ" },
											{ value: "not_registered", label: "Chưa đăng ký" },
										].map((opt) => (
											<button
												key={opt.value}
												onClick={() => setFilterResidency(opt.value)}
												className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
													filterResidency === opt.value ?
														"bg-amber-500 text-white"
													:	"bg-slate-100 text-slate-600 hover:bg-slate-200"
												}`}
											>
												{opt.label}
											</button>
										))}
									</div>
								</div>
							</div>

							<div className="p-6 border-t border-slate-100 flex gap-3">
								<button
									onClick={clearFilters}
									className="flex-1 py-3 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
								>
									Đặt lại
								</button>
								<button
									onClick={() => setIsFilterOpen(false)}
									className="flex-1 py-3 bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-900 text-sm font-bold rounded-xl hover:shadow-lg transition-all"
								>
									Áp dụng
								</button>
							</div>
						</motion.div>
					</>
				)}
			</AnimatePresence>

			{/* Add Customer Modal */}
			<AnimatePresence>
				{isAddModalOpen && (
					<>
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							onClick={() => setIsAddModalOpen(false)}
							className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-[100]"
						/>
						<motion.div
							initial={{ opacity: 0, scale: 0.95, y: 20 }}
							animate={{ opacity: 1, scale: 1, y: 0 }}
							exit={{ opacity: 0, scale: 0.95, y: 20 }}
							transition={{ type: "spring", damping: 25, stiffness: 300 }}
							className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl max-h-[90vh] overflow-auto bg-white rounded-2xl shadow-2xl z-[101]"
						>
							<div className="sticky top-0 bg-white p-6 border-b border-slate-100 flex items-center justify-between">
								<div>
									<h2 className="text-xl font-bold text-slate-900">Thêm khách hàng mới</h2>
									<p className="text-sm text-slate-500 mt-1">Điền thông tin để tạo hợp đồng thuê</p>
								</div>
								<button
									onClick={() => setIsAddModalOpen(false)}
									className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition-all"
								>
									<X className="w-5 h-5" />
								</button>
							</div>

							<form
								onSubmit={handleAddCustomer}
								className="p-6 space-y-6"
							>
								{/* Room Selection */}
								<div className="space-y-2">
									<label className="text-sm font-semibold text-slate-700">Phòng *</label>
									<select
										required
										value={newCustomer.room_id}
										onChange={(e) =>
											setNewCustomer((prev) => ({ ...prev, room_id: e.target.value }))
										}
										className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
									>
										<option value="">Chọn phòng</option>
										{rooms
											.filter((r) => r.status === "available")
											.map((r) => (
												<option
													key={r.id}
													value={r.id}
												>
													{r.room_number} - Tầng {r.floor} ({r.buildings.name})
												</option>
											))}
									</select>
								</div>

								{/* Basic Info */}
								<div className="grid grid-cols-2 gap-4">
									<div className="space-y-2">
										<label className="text-sm font-semibold text-slate-700">Họ tên *</label>
										<input
											required
											type="text"
											value={newCustomer.tenant_name}
											onChange={(e) =>
												setNewCustomer((prev) => ({ ...prev, tenant_name: e.target.value }))
											}
											placeholder="Nguyễn Văn A"
											className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
										/>
									</div>
									<div className="space-y-2">
										<label className="text-sm font-semibold text-slate-700">Giới tính</label>
										<select
											value={newCustomer.tenant_gender}
											onChange={(e) =>
												setNewCustomer((prev) => ({
													...prev,
													tenant_gender: e.target.value as "male" | "female" | "other" | "",
												}))
											}
											className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
										>
											<option value="">Chọn giới tính</option>
											<option value="male">Nam</option>
											<option value="female">Nữ</option>
											<option value="other">Khác</option>
										</select>
									</div>
								</div>

								{/* Contact */}
								<div className="grid grid-cols-2 gap-4">
									<div className="space-y-2">
										<label className="text-sm font-semibold text-slate-700">Số điện thoại</label>
										<input
											type="tel"
											value={newCustomer.tenant_phone}
											onChange={(e) =>
												setNewCustomer((prev) => ({ ...prev, tenant_phone: e.target.value }))
											}
											placeholder="0901234567"
											className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
										/>
									</div>
									<div className="space-y-2">
										<label className="text-sm font-semibold text-slate-700">Email</label>
										<input
											type="email"
											value={newCustomer.tenant_email}
											onChange={(e) =>
												setNewCustomer((prev) => ({ ...prev, tenant_email: e.target.value }))
											}
											placeholder="email@example.com"
											className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
										/>
									</div>
								</div>

								{/* ID */}
								<div className="space-y-2">
									<label className="text-sm font-semibold text-slate-700">CCCD/Hộ chiếu</label>
									<input
										type="text"
										value={newCustomer.tenant_id_number}
										onChange={(e) =>
											setNewCustomer((prev) => ({ ...prev, tenant_id_number: e.target.value }))
										}
										placeholder="012345678912"
										className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
									/>
								</div>

								{/* Contract Dates */}
								<div className="grid grid-cols-2 gap-4">
									<div className="space-y-2">
										<label className="text-sm font-semibold text-slate-700">Ngày bắt đầu *</label>
										<div className="relative">
											<input
												required
												type="date"
												value={newCustomer.start_date}
												onChange={(e) =>
													setNewCustomer((prev) => ({ ...prev, start_date: e.target.value }))
												}
												className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
											/>
											<Calendar className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
										</div>
									</div>
									<div className="space-y-2">
										<label className="text-sm font-semibold text-slate-700">Ngày kết thúc</label>
										<div className="relative">
											<input
												type="date"
												value={newCustomer.end_date}
												onChange={(e) =>
													setNewCustomer((prev) => ({ ...prev, end_date: e.target.value }))
												}
												className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
											/>
											<Calendar className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
										</div>
									</div>
								</div>

								{/* Money */}
								<div className="grid grid-cols-2 gap-4">
									<div className="space-y-2">
										<label className="text-sm font-semibold text-slate-700">
											Tiền thuê/tháng *
										</label>
										<div className="relative">
											<input
												required
												type="number"
												value={newCustomer.rent_amount}
												onChange={(e) =>
													setNewCustomer((prev) => ({ ...prev, rent_amount: e.target.value }))
												}
												placeholder="3000000"
												className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
											/>
											<span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-400">
												VNĐ
											</span>
										</div>
									</div>
									<div className="space-y-2">
										<label className="text-sm font-semibold text-slate-700">Tiền cọc</label>
										<div className="relative">
											<input
												type="number"
												value={newCustomer.deposit_amount}
												onChange={(e) =>
													setNewCustomer((prev) => ({ ...prev, deposit_amount: e.target.value }))
												}
												placeholder="3000000"
												className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
											/>
											<span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-400">
												VNĐ
											</span>
										</div>
									</div>
								</div>

								{/* Notes */}
								<div className="space-y-2">
									<label className="text-sm font-semibold text-slate-700">Ghi chú</label>
									<textarea
										value={newCustomer.notes}
										onChange={(e) => setNewCustomer((prev) => ({ ...prev, notes: e.target.value }))}
										placeholder="Ghi chú thêm về khách hàng..."
										rows={3}
										className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 resize-none"
									/>
								</div>

								{/* Actions */}
								<div className="flex gap-3 pt-4">
									<button
										type="button"
										onClick={() => setIsAddModalOpen(false)}
										className="flex-1 py-3 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
									>
										Huỷ
									</button>
									<button
										type="submit"
										disabled={submitting}
										className="flex-1 py-3 bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-900 text-sm font-bold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
									>
										{submitting && (
											<div className="w-4 h-4 border-2 border-slate-900/20 border-t-slate-900 rounded-full animate-spin" />
										)}
										Thêm khách hàng
									</button>
								</div>
							</form>
						</motion.div>
					</>
				)}
			</AnimatePresence>
		</div>
	);
};

export default CustomerPage;

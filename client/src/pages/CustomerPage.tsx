import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
	Search,
	Settings2,
	X,
	ChevronLeft,
	ChevronRight,
	Home,
	Building2,
	Settings,
	Edit3,
	Download,
} from "lucide-react";
import { useBuilding } from "../contexts/BuildingContext";
import { api } from "../lib/api";
import * as XLSX from "xlsx";
import Modal from "../components/modals/Modal";
import CustomerForm from "../components/modals/CustomerForm";

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

export default function CustomerPage() {
	const { selectedBuildingId } = useBuilding();
	const [loading, setLoading] = useState(true);
	const [customers, setCustomers] = useState<Customer[]>([]);
	const [rooms, setRooms] = useState<any[]>([]);
	const [search, setSearch] = useState("");
	const [debouncedSearch, setDebouncedSearch] = useState("");
	const [isFilterOpen, setIsFilterOpen] = useState(false);
	const [isAddModalOpen, setIsAddModalOpen] = useState(false);
	const [exporting, setExporting] = useState(false);

	// Pagination
	const [page, setPage] = useState(1);
	const [limit, setLimit] = useState(20);
	const [total, setTotal] = useState(0);

	// Filter States
	const [filterRoom, setFilterRoom] = useState("");
	const [filterStatus, setFilterStatus] = useState("");
	const [filterResidency, setFilterResidency] = useState("");
	const [filterGender, setFilterGender] = useState("");

	const [, setSubmitting] = useState(false);
	const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

	useEffect(() => {
		if (!selectedBuildingId) return;
		api.get<{rooms: any[]}>(`/api/rooms?building_id=${selectedBuildingId}`)
			.then(res => setRooms(res.data?.rooms || []))
			.catch(console.error);
	}, [selectedBuildingId]);

	useEffect(() => {
		const timer = setTimeout(() => setDebouncedSearch(search), 300);
		return () => clearTimeout(timer);
	}, [search]);

	useEffect(() => {
		// eslint-disable-next-line react-hooks/set-state-in-effect
		setPage(1);
	}, [
		debouncedSearch,
		filterStatus,
		filterGender,
		filterResidency,
		filterRoom,
		selectedBuildingId,
	]);

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

		try {
			const { data } = await api.get<CustomerResponse>(`/api/customers?${params}`);
			if (data) {
				setCustomers(data.customers);
				setTotal(data.total);
			}
		} catch (err) {
			console.error(err);
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
		// eslint-disable-next-line react-hooks/set-state-in-effect
		fetchCustomers();
	}, [fetchCustomers]);

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

	const handleSaveCustomer = async (formData: any) => {
		setSubmitting(true);
		const dataToSave = {
			room_id: formData.room_id || editingCustomer?.room?.id,
			tenant_name: formData.tenant_name,
			tenant_phone: formData.tenant_phone || null,
			tenant_email: formData.tenant_email || null,
			tenant_gender: formData.tenant_gender || null,
			tenant_dob: formData.tenant_dob || null,
			tenant_job: formData.tenant_job || null,
			tenant_nationality: formData.tenant_nationality || 'Việt Nam',
			tenant_city: formData.tenant_city || null,
			tenant_district: formData.tenant_district || null,
			tenant_ward: formData.tenant_ward || null,
			tenant_address: formData.tenant_address || null,
			tenant_avatar: formData.tenant_avatar || null,
			tenant_notes: formData.tenant_notes || null,
			start_date: formData.start_date,
			end_date: formData.end_date || null,
			rent_amount: parseInt(formData.rent_amount) || 0,
			deposit_amount: parseInt(formData.deposit_amount) || 0,
			notes: formData.tenant_notes || null,
		};

		try {
			if (editingCustomer) {
				await api.put(`/api/contracts/${editingCustomer.id}`, dataToSave);
			} else {
				await api.post("/api/contracts", dataToSave);
			}
			setIsAddModalOpen(false);
			setEditingCustomer(null);
			fetchCustomers();
		} catch (err: any) {
			alert(err.response?.data?.error || "Lỗi khi lưu thông tin");
		}
		setSubmitting(false);
	};

	const clearFilters = () => {
		setFilterStatus("");
		setFilterResidency("");
		setFilterGender("");
		setFilterRoom("");
	};

	return (
		<div className="flex-1 flex flex-col h-full bg-[#f8f9fa] relative overflow-hidden">
			{/* Header */}
			<div className="bg-white border-b border-slate-200">
				<div className="px-6 py-4 flex items-center justify-between">
					<h1 className="text-[20px] font-bold text-slate-900 tracking-tight">Khách hàng</h1>
					<button
						onClick={handleExportExcel}
						disabled={exporting}
						className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-50"
					>
						{exporting ?
							<div className="w-4 h-4 border-2 border-emerald-600/20 border-t-emerald-600 rounded-full animate-spin" />
						:	<Download className="w-4 h-4" />}
						<span className="hidden sm:inline">Xuất Excel</span>
					</button>
				</div>

				{/* Toolbar */}
				<div className="px-6 pb-4 flex flex-col sm:flex-row items-center gap-3">
					<div className="relative w-full sm:w-70 shrink-0">
						<Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
						<input
							type="text"
							placeholder="Tìm kiếm bằng tên khách, số điện thoại..."
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-white focus:outline-none focus:border-brand-primary hover:border-slate-300 transition-all"
						/>
					</div>

					<div className="w-full sm:w-40 shrink-0">
						<select
							value={filterRoom}
							onChange={(e) => setFilterRoom(e.target.value)}
							className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 bg-white focus:outline-none focus:border-brand-primary hover:border-slate-300 transition-all cursor-pointer appearance-none"
						>
							<option value="">Tất cả phòng</option>
							{rooms.map(r => (
								<option key={r.id} value={r.id}>{r.room_number}</option>
							))}
						</select>
					</div>

					<div className="w-full sm:w-44 shrink-0">
						<select
							value={filterStatus}
							onChange={(e) => setFilterStatus(e.target.value)}
							className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 bg-white focus:outline-none focus:border-brand-primary hover:border-slate-300 transition-all cursor-pointer appearance-none"
						>
							<option value="">Trạng thái khách hàng</option>
							<option value="active">Đang ở</option>
							<option value="terminated">Đã chuyển đi</option>
						</select>
					</div>

					<button
						onClick={() => setIsFilterOpen(true)}
						className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm cursor-pointer relative"
					>
						<Settings2 className="w-4 h-4" />
						Bộ lọc
						{(filterGender || filterResidency) && (
							<span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-bg0 rounded-full" />
						)}
					</button>

					<button
						onClick={() => setIsAddModalOpen(true)}
						className="flex items-center gap-2 px-5 py-2 bg-brand-primary text-white rounded-lg text-sm font-bold transition-colors hover:bg-brand-dark shadow-sm ml-auto cursor-pointer"
					>
						+ Khách hàng
					</button>
				</div>
			</div>

			{/* Table Area */}
			<div className="flex-1 overflow-auto bg-[#f8f9fa] p-6">
				<div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm h-full flex flex-col">
					<div className="overflow-x-auto">
						<table className="w-full">
							<thead className="bg-[#f8f9fa] border-b border-slate-200">
								<tr>
									<th className="px-5 py-3.5 w-10">
										<input
											type="checkbox"
											className="rounded border-slate-300 text-brand-primary focus:ring-brand-primary/20 w-4 h-4"
										/>
									</th>
									{[
										"Khách hàng",
										"Phòng",
										"Trạng thái khách hàng",
										"Toà nhà",
										"Trạng thái tạm trú",
										"Giới tính",
										"Số CCCD/Hộ chiếu",
									].map((h, i) => (
										<th
											key={i}
											className="px-5 py-3.5 text-left text-[12px] font-bold text-slate-600 tracking-wide whitespace-nowrap"
										>
											{h} <span className="inline-block ml-1 opacity-50">↕</span>
										</th>
									))}
									<th className="px-5 py-3.5 w-10 text-center">
										<Settings className="w-4 h-4 text-slate-400 inline-block" />
									</th>
								</tr>
							</thead>
							<tbody>
								{loading ?
									<tr>
										<td
											colSpan={9}
											className="px-6 py-28 text-center bg-white"
										>
											<div className="w-10 h-10 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin mx-auto mb-3" />
											<p className="text-sm font-bold text-slate-400">Đang tải dữ liệu...</p>
										</td>
									</tr>
								: customers.length === 0 ?
									<tr>
										<td
											colSpan={9}
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
												<p className="text-base font-bold text-slate-700">Không có dữ liệu</p>
											</div>
										</td>
									</tr>
								:	customers.map((c, idx) => (
										<motion.tr
											key={c.id}
											initial={{ opacity: 0, y: 8 }}
											animate={{ opacity: 1, y: 0 }}
											transition={{ delay: idx * 0.04 }}
											className="hover:bg-brand-bg/30 transition-colors group border-b border-slate-50 last:border-0"
										>
											<td className="px-5 py-3">
												<input
													type="checkbox"
													className="rounded border-slate-300 text-brand-primary focus:ring-brand-primary/20 w-4 h-4"
												/>
											</td>
											<td className="px-5 py-3">
												<div className="flex items-center gap-3">
													<div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 overflow-hidden shrink-0">
														<img
															src={`https://ui-avatars.com/api/?name=${encodeURIComponent(c.tenant_name)}&background=random`}
															alt={c.tenant_name}
															className="w-full h-full object-cover"
														/>
													</div>
													<div>
														<p className="text-sm font-bold text-slate-900 truncate max-w-37.5">
															{c.tenant_name}
														</p>
														<p className="text-[11px] text-slate-500 font-medium">
															{c.tenant_phone}
														</p>
													</div>
												</div>
											</td>
											<td className="px-5 py-3">
												<div className="flex items-center gap-2 text-sm font-bold text-slate-700">
													<Home className="w-4 h-4 text-slate-400" />
													{c.room?.room_number}
												</div>
											</td>
											<td className="px-5 py-3">
												<span
													className={`inline-flex px-2 py-1 rounded-md text-[11px] font-bold whitespace-nowrap ${
														c.status === "active" ?
															"bg-emerald-100 text-emerald-700"
														:	"bg-slate-100 text-slate-600"
													}`}
												>
													{c.status === "active" ? "Đang ở" : "Đã dời đi"}
												</span>
											</td>
											<td className="px-5 py-3">
												<div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
													<Building2 className="w-4 h-4 text-slate-400" />
													<span className="truncate max-w-30">{c.room?.building?.name}</span>
												</div>
											</td>
											<td className="px-5 py-3">
												<div className="flex items-center gap-1.5">
													<span
														className={`w-2 h-2 rounded-full ${
															c.residence_status === "completed" ? "bg-emerald-500"
															: c.residence_status === "pending" ? "bg-brand-bg0"
															: "bg-slate-300"
														}`}
													/>
													<span className="text-[11px] font-bold text-slate-600 whitespace-nowrap">
														{c.residence_status === "completed" ?
															"Đã đăng ký"
														: c.residence_status === "pending" ?
															"Đang chờ"
														:	"Chưa đăng ký"}
													</span>
												</div>
											</td>
											<td className="px-5 py-3 text-sm text-slate-600 font-medium whitespace-nowrap">
												{c.tenant_gender === "male" ?
													"Nam"
												: c.tenant_gender === "female" ?
													"Nữ"
												: c.tenant_gender === "other" ?
													"Khác"
												:	"-"}
											</td>
											<td className="px-5 py-3 text-sm text-slate-600 font-medium whitespace-nowrap">
												{c.tenant_id_number || "-"}
											</td>
											<td className="px-5 py-3 text-right">
												<div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
													<button 
														onClick={() => {
															setEditingCustomer(c);
															setIsAddModalOpen(true);
														}}
														className="p-1.5 hover:bg-white rounded-lg text-slate-400 hover:text-brand-dark transition-colors shadow-sm"
													>
														<Edit3 className="w-4 h-4" />
													</button>
												</div>
											</td>
										</motion.tr>
									))
								}
							</tbody>
						</table>
					</div>

					{/* Pagination Footer */}
					<div className="mt-auto px-5 py-3 border-t border-slate-200 bg-white flex items-center justify-end gap-4 text-sm text-slate-600">
						<span>
							{total === 0 ?
								"0-0/0"
							:	`${(page - 1) * limit + 1}-${Math.min(page * limit, total)}/${total}`}
						</span>
						<div className="flex items-center gap-1">
							<button
								onClick={() => setPage((p) => Math.max(1, p - 1))}
								disabled={page === 1}
								className="p-1 hover:bg-slate-100 rounded disabled:opacity-50 text-slate-400"
							>
								<ChevronLeft className="w-4 h-4" />
							</button>
							<button
								onClick={() => setPage((p) => p + 1)}
								disabled={page * limit >= total}
								className="p-1 hover:bg-slate-100 rounded disabled:opacity-50 text-slate-400"
							>
								<ChevronRight className="w-4 h-4" />
							</button>
						</div>
						<select
							value={limit}
							onChange={(e) => {
								setLimit(parseInt(e.target.value));
								setPage(1);
							}}
							className="px-2 py-1 outline-none border border-slate-200 rounded cursor-pointer text-slate-600 bg-white hover:border-slate-300 appearance-none"
						>
							<option value={20}>20 / trang</option>
							<option value={50}>50 / trang</option>
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
							className="absolute inset-0 bg-slate-900/20 z-40 transition-opacity"
						/>
						<motion.div
							initial={{ x: "100%" }}
							animate={{ x: 0 }}
							exit={{ x: "100%" }}
							transition={{ type: "spring", damping: 25, stiffness: 200 }}
							className="absolute top-0 right-0 w-100 h-full bg-white shadow-2xl z-50 flex flex-col border-l border-slate-200"
						>
							<div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
								<h2 className="text-lg font-bold text-slate-900">Lọc nâng cao</h2>
								<button
									onClick={() => setIsFilterOpen(false)}
									className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
								>
									<X className="w-5 h-5" />
								</button>
							</div>

							<div className="flex-1 overflow-y-auto p-5 space-y-6">
								<div>
									<h3 className="text-sm font-semibold text-slate-800 mb-3">Trạng thái tạm trú</h3>
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
												className={`px-3 py-2 rounded-lg text-[13px] font-medium transition-all ${
													filterResidency === opt.value ?
														"bg-brand-primary text-white shadow-sm"
													:	"bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200"
												}`}
											>
												{opt.label}
											</button>
										))}
									</div>
								</div>

								<div>
									<h3 className="text-sm font-semibold text-slate-800 mb-3">Giới tính</h3>
									<div className="grid grid-cols-2 gap-2">
										{[
											{ value: "", label: "Tất cả" },
											{ value: "male", label: "Nam" },
											{ value: "female", label: "Nữ" },
										].map((opt) => (
											<button
												key={opt.value}
												onClick={() => setFilterGender(opt.value)}
												className={`px-3 py-2 rounded-lg text-[13px] font-medium transition-all ${
													filterGender === opt.value ?
														"bg-brand-primary text-white shadow-sm"
													:	"bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200"
												}`}
											>
												{opt.label}
											</button>
										))}
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
									className="px-6 py-2.5 text-sm font-bold bg-brand-primary hover:bg-brand-dark text-white rounded-lg transition-colors shadow-sm cursor-pointer"
								>
									Áp dụng
								</button>
							</div>
						</motion.div>
					</>
				)}
			</AnimatePresence>

			{/* Add Customer Modal */}
			<Modal
				isOpen={isAddModalOpen}
				onClose={() => {
					setIsAddModalOpen(false);
					setEditingCustomer(null);
				}}
				title={editingCustomer ? "Chỉnh sửa thông tin chung" : "Thông tin chung"}
				size="lg"
			>
				<CustomerForm
					onSubmit={handleSaveCustomer}
					onCancel={() => {
						setIsAddModalOpen(false);
						setEditingCustomer(null);
					}}
					initialData={editingCustomer}
				/>
			</Modal>
		</div>
	);
}

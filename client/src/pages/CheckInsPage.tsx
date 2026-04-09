import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
	UserCheck,
	Plus,
	Search,
	Filter,
	X,
	ChevronLeft,
	ChevronRight,
	Calendar,
	Users,
	Zap,
	MoreHorizontal,
	CheckCircle2,
	Trash2,
	Edit2
} from "lucide-react";
import { api } from "../lib/api";

interface CheckIn {
	id: string;
	booking_id: string;
	room: string;
	location: string;
	customer: string;
	checkin_date: string;
	checkout_date: string | null;
	num_people: number;
	electric_meter: number;
	water_meter: number;
	status: "checkedin" | "checkedout" | "pending";
	created_by: string;
}

const STATUS = {
	checkedin: { label: "Đang ở", color: "bg-emerald-100 text-emerald-700" },
	checkedout: { label: "Đã trả phòng", color: "bg-slate-100 text-slate-600" },
	pending: { label: "Chờ nhận phòng", color: "bg-amber-100 text-brand-ink" },
};

const formatDate = (iso: string | null) => {
	if (!iso) return "—";
	return new Date(iso).toLocaleDateString("vi-VN");
};

export default function CheckInsPage() {
	const [checkins, setCheckins] = useState<CheckIn[]>([]);
	const [loading, setLoading] = useState(true);

	const [search, setSearch] = useState("");
	const [statusFilter, setStatusFilter] = useState("");
	const [showModal, setShowModal] = useState(false);
	const [page, setPage] = useState(1);
	
	const [editingItem, setEditingItem] = useState<CheckIn | null>(null);
	const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
	const [buildings, setBuildings] = useState<any[]>([]);

	const fetchCheckins = async () => {
		try {
			const res = await api.get<{ checkins: CheckIn[] }>("/api/checkins");
			setCheckins(res.data?.checkins || []);
		} catch (error) {
			console.error(error);
		} finally {
			setLoading(false);
		}
	};

	const fetchBuildings = async () => {
		const res = await api.get<{ buildings: any[] }>("/api/buildings");
		setBuildings(res.data?.buildings || []);
	};

	useEffect(() => {
		fetchCheckins();
		fetchBuildings();
	}, []);

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const handleCreateOrUpdate = async (e: any) => {
		e.preventDefault();
		const form = new FormData(e.currentTarget);
		
		const payload = {
			booking_id: form.get("booking_id") as string,
			room: form.get("room") as string,
			location: form.get("location") as string, // Mock toà nhà static for now
			customer: form.get("customer") as string,
			checkin_date: form.get("checkin_date") || null,
			checkout_date: form.get("checkout_date") || null,
			num_people: parseInt(form.get("num_people") as string) || 1,
			electric_meter: parseInt(form.get("electric_meter") as string) || 0,
			water_meter: parseInt(form.get("water_meter") as string) || 0,
			status: form.get("status") || "pending"
		};

		try {
			if (editingItem) {
				await api.put(`/api/checkins/${editingItem.id}`, payload);
			} else {
				await api.post("/api/checkins", payload);
			}
			fetchCheckins();
			setShowModal(false);
			setEditingItem(null);
		} catch (error) {
			console.error(error);
			alert("Lưu thông tin thất bại!");
		}
	};

	const handleDelete = async (id: string) => {
		if (!confirm("Bạn có chắc chắn muốn xóa bản ghi này?")) return;
		try {
			await api.delete(`/api/checkins/${id}`);
			fetchCheckins();
			setOpenDropdownId(null);
		} catch (error) {
			console.error(error);
			alert("Xoá thất bại");
		}
	};

	const openEdit = (c: CheckIn) => {
		setEditingItem(c);
		setShowModal(true);
		setOpenDropdownId(null);
	};

	const filtered = checkins.filter((c) => {
		if (
			search &&
			!(c.customer || "").toLowerCase().includes(search.toLowerCase()) &&
			!(c.room || "").toLowerCase().includes(search.toLowerCase()) &&
			!(c.booking_id || "").toLowerCase().includes(search.toLowerCase())
		)
			return false;
		if (statusFilter && c.status !== statusFilter) return false;
		return true;
	});

	const stats = {
		total: checkins.length,
		checkedin: checkins.filter((c) => c.status === "checkedin").length,
		checkedout: checkins.filter((c) => c.status === "checkedout").length,
		pending: checkins.filter((c) => c.status === "pending").length,
	};

	const statCards = [
		{
			label: "Tổng check-in",
			value: stats.total,
			icon: UserCheck,
			gradient: "from-violet-500 to-purple-600",
			shadow: "shadow-violet-500/25",
		},
		{
			label: "Đang ở",
			value: stats.checkedin,
			icon: CheckCircle2,
			gradient: "from-emerald-500 to-teal-600",
			shadow: "shadow-emerald-500/25",
		},
		{
			label: "Đã trả phòng",
			value: stats.checkedout,
			icon: Users,
			gradient: "from-slate-500 to-slate-600",
			shadow: "shadow-slate-500/25",
		},
		{
			label: "Chờ nhận phòng",
			value: stats.pending,
			icon: Calendar,
			gradient: "from-amber-500 to-orange-500",
			shadow: "shadow-amber-500/25",
		},
	];

	return (
		<div className="p-6 lg:p-8 space-y-6 bg-linear-to-br from-slate-50 to-slate-100/50 min-h-full">
			{/* Header */}
			<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
				<div>
					<h1 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">
						Nhận phòng (Check-in)
					</h1>
					<p className="text-sm text-slate-500 mt-1">Quản lý việc nhận và trả phòng của khách</p>
				</div>
				<button
					onClick={() => { setEditingItem(null); setShowModal(true); }}
					className="flex items-center gap-2 px-5 py-2.5 bg-linear-to-r from-amber-400 to-yellow-400 text-slate-900 rounded-xl text-sm font-bold transition-all hover:shadow-lg hover:shadow-amber-500/25 hover:scale-[1.02] cursor-pointer"
				>
					<Plus className="w-5 h-5" />
					Nhận phòng mới
				</button>
			</div>

			{/* Stats */}
			<div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
				{statCards.map((s, i) => (
					<motion.div
						key={i}
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: i * 0.08, type: "spring", stiffness: 300 }}
						className={`relative overflow-hidden bg-linear-to-br ${s.gradient} p-5 rounded-2xl shadow-lg ${s.shadow} hover:scale-[1.02] transition-transform`}
					>
						<div className="flex items-center justify-between">
							<div>
								<p className="text-3xl font-black text-white mb-0.5">{s.value}</p>
								<p className="text-xs font-medium text-white/80">{s.label}</p>
							</div>
							<div className="p-2.5 bg-white/20 rounded-xl">
								<s.icon className="w-5 h-5 text-white" />
							</div>
						</div>
						<div className="absolute -right-3 -bottom-3 w-20 h-20 bg-white/10 rounded-full blur-xl" />
					</motion.div>
				))}
			</div>

			{/* Table */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.35 }}
				className="bg-white rounded-2xl border border-slate-200/60 shadow-xl shadow-slate-200/50 overflow-hidden"
			>
				{/* Filters */}
				<div className="p-4 border-b border-slate-100">
					<div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
						<div className="relative flex-1">
							<Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
							<input
								type="text"
								value={search}
								onChange={(e) => setSearch(e.target.value)}
								placeholder="Tìm khách hàng, phòng, mã đặt phòng..."
								className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
							/>
						</div>
						<div className="flex items-center gap-2">
							<select
								value={statusFilter}
								onChange={(e) => setStatusFilter(e.target.value)}
								className="px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-600 focus:outline-none min-w-40 cursor-pointer"
							>
								<option value="">Tất cả trạng thái</option>
								<option value="checkedin">Đang ở</option>
								<option value="checkedout">Đã trả phòng</option>
								<option value="pending">Chờ nhận phòng</option>
							</select>
							<button className="flex items-center gap-2 px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50">
								<Filter className="w-4 h-4" />
								<span className="hidden sm:inline">Bộ lọc</span>
							</button>
							{(search || statusFilter) && (
								<button
									onClick={() => {
										setSearch("");
										setStatusFilter("");
									}}
									className="p-2.5 text-rose-600 hover:bg-rose-50 rounded-xl cursor-pointer"
								>
									<X className="w-4 h-4" />
								</button>
							)}
						</div>
					</div>
				</div>

				<div className="overflow-x-auto min-h-[300px]">
					{loading ? (
						<div className="p-8 text-center text-slate-500 text-sm">Đang tải dữ liệu...</div>
					) : (
					<table className="w-full">
						<thead className="bg-slate-50/80">
							<tr>
								{[
									"Mã đặt phòng",
									"Phòng",
									"Toà nhà",
									"Khách hàng",
									"Ngày nhận phòng",
									"Ngày trả phòng",
									"Số người",
									"Điện (kWh)",
									"Nước (m³)",
									"Trạng thái",
									"",
								].map((h) => (
									<th
										key={h}
										className="px-4 py-3.5 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap"
									>
										{h}
									</th>
								))}
							</tr>
						</thead>
						<tbody className="divide-y divide-slate-100">
							{filtered.length === 0 ?
								<tr>
									<td
										colSpan={11}
										className="px-6 py-20 text-center text-slate-500"
									>
										Không có dữ liệu
									</td>
								</tr>
							:	filtered.map((c, idx) => (
									<motion.tr
										key={c.id}
										initial={{ opacity: 0, y: 8 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ delay: idx * 0.03 }}
										className="hover:bg-brand-bg/30 transition-colors group relative"
									>
										<td className="px-4 py-3.5">
											<span className="font-mono text-sm font-semibold text-slate-700">
												{c.booking_id || "—"}
											</span>
										</td>
										<td className="px-4 py-3.5 text-sm font-medium text-slate-700">{c.room}</td>
										<td className="px-4 py-3.5 text-sm text-slate-600">{c.location || "Chưa xếp"}</td>
										<td className="px-4 py-3.5 text-sm text-slate-600">{c.customer}</td>
										<td className="px-4 py-3.5 text-sm text-slate-600">
											{formatDate(c.checkin_date)}
										</td>
										<td className="px-4 py-3.5 text-sm text-slate-600">
											{formatDate(c.checkout_date)}
										</td>
										<td className="px-4 py-3.5">
											<div className="flex items-center gap-1 text-sm text-slate-600">
												<Users className="w-3.5 h-3.5 text-slate-400" />
												{c.num_people}
											</div>
										</td>
										<td className="px-4 py-3.5">
											<div className="flex items-center gap-1 text-sm text-slate-600">
												<Zap className="w-3.5 h-3.5 text-yellow-500" />
												{c.electric_meter}
											</div>
										</td>
										<td className="px-4 py-3.5 text-sm text-slate-600">{c.water_meter}</td>
										<td className="px-4 py-3.5">
											<span
												className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${STATUS[c.status]?.color}`}
											>
												{STATUS[c.status]?.label}
											</span>
										</td>
										<td className="px-4 py-3.5 relative">
											<button 
												onClick={() => setOpenDropdownId(openDropdownId === c.id ? null : c.id)}
												className="cursor-pointer opacity-100 lg:opacity-0 lg:group-hover:opacity-100 p-1.5 hover:bg-slate-200 rounded-lg text-slate-400 hover:text-brand-dark transition-all"
											>
												<MoreHorizontal className="w-4 h-4" />
											</button>
											
											{openDropdownId === c.id && (
												<div className="absolute right-8 top-10 w-36 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50 text-left">
													<button 
														onClick={() => openEdit(c)} 
														className="w-full px-4 py-2 text-[13px] font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
													>
														<Edit2 className="w-3.5 h-3.5" /> Sửa thông tin
													</button>
													<button 
														onClick={() => handleDelete(c.id)} 
														className="w-full px-4 py-2 text-[13px] font-medium text-rose-600 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
													>
														<Trash2 className="w-3.5 h-3.5" /> Xóa Check-in
													</button>
												</div>
											)}
										</td>
									</motion.tr>
								))
							}
						</tbody>
					</table>
					)}
				</div>

				{/* Pagination */}
				<div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
					<span className="text-sm text-slate-600">{filtered.length} check-in</span>
					<div className="flex items-center gap-2">
						<button
							onClick={() => setPage((p) => Math.max(1, p - 1))}
							disabled={page === 1}
							className="p-2 hover:bg-white border border-transparent hover:border-slate-200 rounded-lg text-slate-600 disabled:opacity-30 transition-all cursor-pointer"
						>
							<ChevronLeft className="w-4 h-4" />
						</button>
						<button className="w-8 h-8 rounded-lg text-sm font-medium bg-brand-bg0 text-white">
							{page}
						</button>
						<button
							onClick={() => setPage((p) => p + 1)}
							disabled
							className="p-2 hover:bg-white border border-transparent hover:border-slate-200 rounded-lg text-slate-600 disabled:opacity-30 transition-all cursor-pointer"
						>
							<ChevronRight className="w-4 h-4" />
						</button>
					</div>
				</div>
			</motion.div>

			{/* Form Modal */}
			{showModal && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
					<motion.div
						initial={{ opacity: 0, scale: 0.95 }}
						animate={{ opacity: 1, scale: 1 }}
						className="bg-white rounded-2xl shadow-2xl w-full max-w-xl"
					>
						<div className="flex items-center justify-between p-6 border-b border-slate-100">
							<h2 className="text-lg font-bold text-slate-900">
								{editingItem ? "Sửa Check-in" : "Nhận phòng mới"}
							</h2>
							<button
								onClick={() => setShowModal(false)}
								className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 cursor-pointer"
							>
								<X className="w-5 h-5" />
							</button>
						</div>
						<form onSubmit={handleCreateOrUpdate}>
							<div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
								<div className="grid grid-cols-2 gap-4">
									<div>
										<label className="text-sm font-semibold text-slate-700 mb-1.5 block">
											Mã đặt phòng
										</label>
										<input
											type="text"
											name="booking_id"
											defaultValue={editingItem?.booking_id || ""}
											placeholder="Ví dụ: BK-001"
											className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20"
										/>
									</div>
									<div>
										<label className="text-sm font-semibold text-slate-700 mb-1.5 block">
											Toà nhà (Location) *
										</label>
										<select 
											name="location" 
											defaultValue={editingItem?.location || ""} 
											required
											className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20"
										>
											<option value="">Chọn toà nhà</option>
											{buildings.map(b => (
												<option key={b.id} value={b.name}>{b.name}</option>
											))}
										</select>
									</div>
								</div>
								
								<div className="grid grid-cols-2 gap-4">
									<div>
										<label className="text-sm font-semibold text-slate-700 mb-1.5 block">
											Phòng *
										</label>
										<input
											type="text"
											name="room"
											defaultValue={editingItem?.room || ""}
											required
											placeholder="Tên hoặc mã phòng"
											className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20"
										/>
									</div>
									<div>
										<label className="text-sm font-semibold text-slate-700 mb-1.5 block">
											Khách hàng *
										</label>
										<input
											type="text"
											name="customer"
											defaultValue={editingItem?.customer || ""}
											required
											placeholder="Tên khách hàng"
											className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20"
										/>
									</div>
								</div>

								<div className="grid grid-cols-2 gap-4">
									<div>
										<label className="text-sm font-semibold text-slate-700 mb-1.5 block">
											Ngày nhận phòng (Check-in)
										</label>
										<input
											type="date"
											name="checkin_date"
											defaultValue={editingItem?.checkin_date || ""}
											className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20"
										/>
									</div>
									<div>
										<label className="text-sm font-semibold text-slate-700 mb-1.5 block">
											Ngày trả phòng (Check-out)
										</label>
										<input
											type="date"
											name="checkout_date"
											defaultValue={editingItem?.checkout_date || ""}
											className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20"
										/>
									</div>
								</div>

								<div className="grid grid-cols-3 gap-4">
									<div>
										<label className="text-sm font-semibold text-slate-700 mb-1.5 block">
											Số người
										</label>
										<input
											type="number"
											name="num_people"
											defaultValue={editingItem?.num_people || 1}
											min={1}
											className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20"
										/>
									</div>
									<div>
										<label className="text-sm font-semibold text-slate-700 mb-1.5 block">
											Chỉ số điện (kWh)
										</label>
										<input
											type="number"
											name="electric_meter"
											defaultValue={editingItem?.electric_meter || 0}
											placeholder="kWh"
											className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20"
										/>
									</div>
									<div>
										<label className="text-sm font-semibold text-slate-700 mb-1.5 block">
											Chỉ số nước (m³)
										</label>
										<input
											type="number"
											name="water_meter"
											defaultValue={editingItem?.water_meter || 0}
											placeholder="m³"
											className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20"
										/>
									</div>
								</div>
								
								<div>
									<label className="text-sm font-semibold text-slate-700 mb-1.5 block">
										Trạng thái
									</label>
									<select name="status" defaultValue={editingItem?.status || "pending"} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20">
										<option value="checkedin">Đang ở (Checked In)</option>
										<option value="pending">Chờ nhận phòng (Pending)</option>
										<option value="checkedout">Đã trả phòng (Checked Out)</option>
									</select>
								</div>
							</div>
							
							<div className="p-6 border-t border-slate-100 flex gap-3">
								<button
									type="button"
									onClick={() => setShowModal(false)}
									className="flex-1 py-2.5 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all cursor-pointer"
								>
									Huỷ
								</button>
								<button type="submit" className="flex-1 py-2.5 bg-linear-to-r from-amber-400 to-yellow-400 text-slate-900 text-sm font-bold rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer">
									<CheckCircle2 className="w-4 h-4" />
									Lưu thông tin
								</button>
							</div>
						</form>
					</motion.div>
				</div>
			)}
		</div>
	);
}

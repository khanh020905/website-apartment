import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
	Globe,
	Plus,
	Filter,
	X,
	ChevronLeft,
	ChevronRight,
	Search,
	CalendarDays,
	FileText,
	BookOpen,
	Users,
	Tag,
	DollarSign,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { api } from "../lib/api";

interface CommunityEvent {
	id: string;
	cover_url: string;
	name: string;
	start_time: string;
	end_time: string;
	attendees: number;
	interested: number;
	price: number;
	capacity: number;
	created_by: string;
	status: "upcoming" | "ongoing" | "ended" | "cancelled";
}

const STATUS_LABELS: Record<CommunityEvent["status"], string> = {
	upcoming: "Sắp diễn ra",
	ongoing: "Đang diễn ra",
	ended: "Đã kết thúc",
	cancelled: "Đã huỷ",
};

const STATUS_COLORS: Record<CommunityEvent["status"], string> = {
	upcoming: "bg-blue-100 text-blue-700",
	ongoing: "bg-emerald-100 text-emerald-700",
	ended: "bg-slate-100 text-slate-500",
	cancelled: "bg-rose-100 text-rose-700",
};

const formatDateTime = (iso: string) => {
	if (!iso) return "—";
	const d = new Date(iso);
	return d.toLocaleString("vi-VN", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
};

const formatCurrency = (n: number) =>
	n === 0 ? "Miễn phí" : (
		new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n)
	);

const tabs = [
	{ label: "Sự kiện", path: "/events", icon: CalendarDays },
	{ label: "Bài viết", path: "/posts", icon: FileText },
	{ label: "Blogs", path: "/blogs", icon: BookOpen },
];

export default function EventsPage() {
	const navigate = useNavigate();
	const location = useLocation();
	const [loading, setLoading] = useState(true);
	const [events, setEvents] = useState<CommunityEvent[]>([]);
	const [search, setSearch] = useState("");
	const [filterStatus, setFilterStatus] = useState("");
	const [page, setPage] = useState(1);
	const [limit] = useState(20);
	const [total, setTotal] = useState(0);
	const [totalPages, setTotalPages] = useState(1);

	const activeTab = location.pathname;

	const fetchEvents = useCallback(async () => {
		setLoading(true);
		const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
		if (search) params.append("search", search);
		if (filterStatus) params.append("status", filterStatus);

		const endpoint =
			activeTab === "/posts" ? "/api/posts"
			: activeTab === "/blogs" ? "/api/blogs"
			: "/api/events";
		const { data } = await api.get<{ events: CommunityEvent[]; total: number; totalPages: number }>(
			`${endpoint}?${params}`,
		);
		if (data) {
			setEvents(data.events ?? []);
			setTotal(data.total ?? 0);
			setTotalPages(data.totalPages ?? 1);
		}
		setLoading(false);
	}, [page, limit, search, filterStatus, activeTab]);

	useEffect(() => {
		// eslint-disable-next-line react-hooks/set-state-in-effect
		fetchEvents();
	}, [fetchEvents]);

	useEffect(() => {
		// eslint-disable-next-line react-hooks/set-state-in-effect
		setPage(1);
	}, [search, filterStatus, activeTab]);

	const getPageTitle = () => {
		if (activeTab === "/posts") return "Bài viết";
		if (activeTab === "/blogs") return "Blogs";
		return "Sự kiện";
	};

	return (
		<div className="p-6 lg:p-8 space-y-6 bg-linear-to-br from-slate-50 to-slate-100/50 min-h-full">
			{/* Header */}
			<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
				<div>
					<h1 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">
						Cộng đồng
					</h1>
					<p className="text-sm text-slate-500 mt-1">Quản lý sự kiện và nội dung cộng đồng</p>
				</div>
				<button className="flex items-center gap-2 px-5 py-2.5 bg-linear-to-r from-amber-400 to-yellow-400 text-slate-900 rounded-xl text-sm font-bold transition-all hover:shadow-lg hover:shadow-amber-500/25 hover:scale-[1.02]">
					<Plus className="w-5 h-5" />
					<span className="hidden sm:inline">Tạo {getPageTitle().toLowerCase()}</span>
				</button>
			</div>

			{/* Table section */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.15 }}
				className="bg-white rounded-2xl border border-slate-200/60 shadow-xl shadow-slate-200/50 overflow-hidden"
			>
				{/* Tabs */}
				<div className="flex items-center gap-1 p-3 border-b border-slate-100 bg-slate-50/50">
					{tabs.map((tab) => (
						<button
							key={tab.path}
							onClick={() => navigate(tab.path)}
							className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
								activeTab === tab.path ?
									"bg-white text-slate-900 shadow-sm"
								:	"text-slate-500 hover:text-slate-700 hover:bg-white/50"
							}`}
						>
							<tab.icon className="w-4 h-4" />
							{tab.label}
						</button>
					))}
				</div>

				{/* Filters */}
				<div className="p-4 border-b border-slate-100">
					<div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
						<div className="relative flex-1">
							<Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
							<input
								type="text"
								value={search}
								onChange={(e) => setSearch(e.target.value)}
								placeholder={`Tìm kiếm ${getPageTitle().toLowerCase()}...`}
								className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
							/>
						</div>
						<div className="flex items-center gap-2">
							<select
								value={filterStatus}
								onChange={(e) => setFilterStatus(e.target.value)}
								className="px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-600 focus:outline-none min-w-37.5"
							>
								<option value="">Tất cả trạng thái</option>
								<option value="upcoming">Sắp diễn ra</option>
								<option value="ongoing">Đang diễn ra</option>
								<option value="ended">Đã kết thúc</option>
								<option value="cancelled">Đã huỷ</option>
							</select>
							<button className="flex items-center gap-2 px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-all">
								<Filter className="w-4 h-4" />
								<span className="hidden sm:inline">Bộ lọc</span>
							</button>
							{(search || filterStatus) && (
								<button
									onClick={() => {
										setSearch("");
										setFilterStatus("");
									}}
									className="p-2.5 text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
								>
									<X className="w-4 h-4" />
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
								{[
									"Cover",
									"Tên",
									"Thời gian sự kiện",
									"Sẽ tham gia",
									"Quan tâm",
									"Giá",
									"Sức chứa",
									"Tổ chức bởi",
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
							{loading ?
								<tr>
									<td
										colSpan={10}
										className="px-6 py-20 text-center"
									>
										<div className="flex flex-col items-center gap-3">
											<div className="w-10 h-10 border-4 border-amber-200 border-t-amber-500 rounded-full animate-spin" />
											<p className="text-sm text-slate-500">Đang tải dữ liệu...</p>
										</div>
									</td>
								</tr>
							: events.length === 0 ?
								<tr>
									<td
										colSpan={10}
										className="px-6 py-24 text-center"
									>
										<div className="flex flex-col items-center gap-4">
											<div className="w-20 h-20 bg-linear-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center">
												<Globe className="w-10 h-10 text-slate-400" />
											</div>
											<div>
												<p className="text-lg font-bold text-slate-700">Không có dữ liệu</p>
												<p className="text-sm text-slate-500 mt-1">
													Chưa có {getPageTitle().toLowerCase()} nào
												</p>
											</div>
										</div>
									</td>
								</tr>
							:	events.map((evt, idx) => (
									<motion.tr
										key={evt.id}
										initial={{ opacity: 0, y: 8 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ delay: idx * 0.03 }}
										className="hover:bg-amber-50/30 transition-colors group"
									>
										<td className="px-4 py-3.5">
											{evt.cover_url ?
												<img
													src={evt.cover_url}
													alt={evt.name}
													className="w-12 h-9 object-cover rounded-lg"
												/>
											:	<div className="w-12 h-9 bg-slate-100 rounded-lg flex items-center justify-center">
													<CalendarDays className="w-4 h-4 text-slate-400" />
												</div>
											}
										</td>
										<td className="px-4 py-3.5 text-sm font-semibold text-slate-800 max-w-45 truncate">
											{evt.name}
										</td>
										<td className="px-4 py-3.5 text-sm text-slate-600 whitespace-nowrap">
											{formatDateTime(evt.start_time)}
										</td>
										<td className="px-4 py-3.5">
											<div className="flex items-center gap-1">
												<Users className="w-3.5 h-3.5 text-slate-400" />
												<span className="text-sm text-slate-700 font-medium">{evt.attendees}</span>
											</div>
										</td>
										<td className="px-4 py-3.5 text-sm text-slate-600">{evt.interested}</td>
										<td className="px-4 py-3.5">
											<div className="flex items-center gap-1">
												<DollarSign className="w-3.5 h-3.5 text-slate-400" />
												<span className="text-sm text-slate-700">{formatCurrency(evt.price)}</span>
											</div>
										</td>
										<td className="px-4 py-3.5">
											<div className="flex items-center gap-1">
												<Tag className="w-3.5 h-3.5 text-slate-400" />
												<span className="text-sm text-slate-600">{evt.capacity || "—"}</span>
											</div>
										</td>
										<td className="px-4 py-3.5 text-sm text-slate-600">{evt.created_by || "—"}</td>
										<td className="px-4 py-3.5">
											<span
												className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${STATUS_COLORS[evt.status]}`}
											>
												{STATUS_LABELS[evt.status]}
											</span>
										</td>
										<td className="px-4 py-3.5">
											<div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
												<button className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-amber-600 transition-colors text-xs font-medium">
													Chi tiết
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
				<div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
					<span className="text-sm text-slate-600">
						{total === 0 ?
							"0-0/0"
						:	`${(page - 1) * limit + 1}-${Math.min(page * limit, total)}/${total}`}{" "}
						{getPageTitle().toLowerCase()}
					</span>
					<div className="flex items-center gap-2">
						<button
							onClick={() => setPage((p) => Math.max(1, p - 1))}
							disabled={page === 1}
							className="p-2 hover:bg-white border border-transparent hover:border-slate-200 rounded-lg text-slate-600 disabled:opacity-30 transition-all"
						>
							<ChevronLeft className="w-4 h-4" />
						</button>
						{Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
							let pn: number;
							if (totalPages <= 5) pn = i + 1;
							else if (page <= 3) pn = i + 1;
							else if (page >= totalPages - 2) pn = totalPages - 4 + i;
							else pn = page - 2 + i;
							return (
								<button
									key={pn}
									onClick={() => setPage(pn)}
									className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${page === pn ? "bg-amber-500 text-white" : "text-slate-600 hover:bg-white"}`}
								>
									{pn}
								</button>
							);
						})}
						<button
							onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
							disabled={page === totalPages || totalPages === 0}
							className="p-2 hover:bg-white border border-transparent hover:border-slate-200 rounded-lg text-slate-600 disabled:opacity-30 transition-all"
						>
							<ChevronRight className="w-4 h-4" />
						</button>
					</div>
				</div>
			</motion.div>
		</div>
	);
}

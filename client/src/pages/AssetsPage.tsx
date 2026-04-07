import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
	Package,
	Plus,
	Filter,
	X,
	ChevronLeft,
	ChevronRight,
	Search,
	BarChart3,
	Building2,
	Home,
	User,
	Tag,
	Truck,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useBuilding } from "../contexts/BuildingContext";
import { api } from "../lib/api";

interface Asset {
	id: string;
	code: string;
	name: string;
	asset_type: string;
	status: "active" | "broken" | "maintenance" | "disposed";
	condition: "good" | "fair" | "poor";
	building_name: string;
	room_number: string;
	customer_name: string;
	unit: string;
	value: number;
	supplier: string;
	brand: string;
	product_line: string;
	storage: string;
	manager: string;
	purchase_date: string;
}

const STATUS_LABELS: Record<Asset["status"], string> = {
	active: "Đang sử dụng",
	broken: "Hỏng",
	maintenance: "Bảo trì",
	disposed: "Đã thanh lý",
};

const STATUS_COLORS: Record<Asset["status"], string> = {
	active: "bg-emerald-100 text-emerald-700",
	broken: "bg-rose-100 text-rose-700",
	maintenance: "bg-amber-100 text-amber-700",
	disposed: "bg-slate-100 text-slate-500",
};

const CONDITION_LABELS: Record<Asset["condition"], string> = {
	good: "Tốt",
	fair: "Khá",
	poor: "Kém",
};

const CONDITION_COLORS: Record<Asset["condition"], string> = {
	good: "text-emerald-600",
	fair: "text-amber-600",
	poor: "text-rose-600",
};

const formatCurrency = (n: number) => new Intl.NumberFormat("vi-VN").format(n);

const formatDate = (iso: string) => {
	if (!iso) return "—";
	const [y, m, d] = iso.split("T")[0].split("-");
	return `${d}/${m}/${y}`;
};

const tabs = [
	{ label: "Tài sản", path: "/assets/id-base", icon: Package },
	{ label: "Tài sản (số lượng)", path: "/assets/quantity-base", icon: BarChart3 },
];

export default function AssetsPage() {
	const navigate = useNavigate();
	const location = useLocation();
	const { selectedBuildingId } = useBuilding();
	const [loading, setLoading] = useState(true);
	const [assets, setAssets] = useState<Asset[]>([]);
	const [search, setSearch] = useState("");
	const [filterStatus, setFilterStatus] = useState("");
	const [filterType, setFilterType] = useState("");
	const [page, setPage] = useState(1);
	const [limit] = useState(20);
	const [total, setTotal] = useState(0);
	const [totalPages, setTotalPages] = useState(1);

	const activeTab = location.pathname;

	const fetchAssets = useCallback(async () => {
		setLoading(true);
		const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
		if (search) params.append("search", search);
		if (filterStatus) params.append("status", filterStatus);
		if (filterType) params.append("type", filterType);
		if (selectedBuildingId) params.append("building_id", selectedBuildingId);

		const endpoint = activeTab === "/assets/quantity-base" ? "/api/assets/quantity" : "/api/assets";
		const { data } = await api.get<{ assets: Asset[]; total: number; totalPages: number }>(
			`${endpoint}?${params}`,
		);
		if (data) {
			setAssets(data.assets ?? []);
			setTotal(data.total ?? 0);
			setTotalPages(data.totalPages ?? 1);
		}
		setLoading(false);
	}, [page, limit, search, filterStatus, filterType, selectedBuildingId, activeTab]);

	useEffect(() => {
		// eslint-disable-next-line react-hooks/set-state-in-effect
		fetchAssets();
	}, [fetchAssets]);

	useEffect(() => {
		// eslint-disable-next-line react-hooks/set-state-in-effect
		setPage(1);
	}, [search, filterStatus, filterType, selectedBuildingId]);

	return (
		<div className="p-6 lg:p-8 space-y-6 bg-linear-to-br from-slate-50 to-slate-100/50 min-h-full">
			{/* Header */}
			<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
				<div>
					<h1 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">
						Quản lý tài sản
					</h1>
					<p className="text-sm text-slate-500 mt-1">Theo dõi tài sản và thiết bị</p>
				</div>
				<button className="flex items-center gap-2 px-5 py-2.5 bg-linear-to-r from-amber-400 to-yellow-400 text-slate-900 rounded-xl text-sm font-bold transition-all hover:shadow-lg hover:shadow-amber-500/25 hover:scale-[1.02]">
					<Plus className="w-5 h-5" />
					<span className="hidden sm:inline">Thêm tài sản</span>
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
								placeholder="Tìm kiếm mã tài sản, tên..."
								className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
							/>
						</div>
						<div className="flex items-center gap-2">
							<select
								value={filterStatus}
								onChange={(e) => setFilterStatus(e.target.value)}
								className="px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-600 focus:outline-none min-w-37.5"
							>
								<option value="">Trạng thái tài sản</option>
								<option value="active">Đang sử dụng</option>
								<option value="broken">Hỏng</option>
								<option value="maintenance">Bảo trì</option>
								<option value="disposed">Đã thanh lý</option>
							</select>
							<select
								value={filterType}
								onChange={(e) => setFilterType(e.target.value)}
								className="px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-600 focus:outline-none min-w-37.5"
							>
								<option value="">Chọn loại tài sản</option>
								<option value="furniture">Nội thất</option>
								<option value="electronics">Điện tử</option>
								<option value="appliance">Thiết bị</option>
							</select>
							<button className="flex items-center gap-2 px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-all">
								<Filter className="w-4 h-4" />
								<span className="hidden sm:inline">Bộ lọc</span>
							</button>
							{(search || filterStatus || filterType) && (
								<button
									onClick={() => {
										setSearch("");
										setFilterStatus("");
										setFilterType("");
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
									"Mã tài sản",
									"Tên tài sản",
									"Loại tài sản",
									"Trạng thái",
									"Tình trạng",
									"Toà nhà",
									"Phòng",
									"Khách hàng",
									"Giá trị (VND)",
									"Nhà cung cấp",
									"Ngày mua",
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
										colSpan={12}
										className="px-6 py-20 text-center"
									>
										<div className="flex flex-col items-center gap-3">
											<div className="w-10 h-10 border-4 border-amber-200 border-t-amber-500 rounded-full animate-spin" />
											<p className="text-sm text-slate-500">Đang tải dữ liệu...</p>
										</div>
									</td>
								</tr>
							: assets.length === 0 ?
								<tr>
									<td
										colSpan={12}
										className="px-6 py-24 text-center"
									>
										<div className="flex flex-col items-center gap-4">
											<div className="w-20 h-20 bg-linear-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center">
												<Package className="w-10 h-10 text-slate-400" />
											</div>
											<div>
												<p className="text-lg font-bold text-slate-700">Không có dữ liệu</p>
												<p className="text-sm text-slate-500 mt-1">Chưa có tài sản nào được thêm</p>
											</div>
										</div>
									</td>
								</tr>
							:	assets.map((asset, idx) => (
									<motion.tr
										key={asset.id}
										initial={{ opacity: 0, y: 8 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ delay: idx * 0.03 }}
										className="hover:bg-amber-50/30 transition-colors group"
									>
										<td className="px-4 py-3.5">
											<span className="font-mono text-sm font-semibold text-slate-700">
												{asset.code}
											</span>
										</td>
										<td className="px-4 py-3.5 text-sm font-medium text-slate-700 max-w-35 truncate">
											{asset.name}
										</td>
										<td className="px-4 py-3.5">
											<div className="flex items-center gap-1.5">
												<Tag className="w-3.5 h-3.5 text-slate-400" />
												<span className="text-sm text-slate-600">{asset.asset_type || "—"}</span>
											</div>
										</td>
										<td className="px-4 py-3.5">
											<span
												className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${STATUS_COLORS[asset.status]}`}
											>
												{STATUS_LABELS[asset.status]}
											</span>
										</td>
										<td className="px-4 py-3.5">
											<span
												className={`text-sm font-semibold ${CONDITION_COLORS[asset.condition]}`}
											>
												{CONDITION_LABELS[asset.condition]}
											</span>
										</td>
										<td className="px-4 py-3.5">
											<div className="flex items-center gap-1.5">
												<Building2 className="w-3.5 h-3.5 text-slate-400" />
												<span className="text-sm text-slate-600">{asset.building_name || "—"}</span>
											</div>
										</td>
										<td className="px-4 py-3.5">
											<div className="flex items-center gap-1.5">
												<Home className="w-3.5 h-3.5 text-slate-400" />
												<span className="text-sm text-slate-600">{asset.room_number || "—"}</span>
											</div>
										</td>
										<td className="px-4 py-3.5">
											<div className="flex items-center gap-1.5">
												<User className="w-3.5 h-3.5 text-slate-400" />
												<span className="text-sm text-slate-600">{asset.customer_name || "—"}</span>
											</div>
										</td>
										<td className="px-4 py-3.5">
											<span className="text-sm font-semibold text-slate-800">
												{asset.value > 0 ? formatCurrency(asset.value) : "—"}
											</span>
										</td>
										<td className="px-4 py-3.5">
											<div className="flex items-center gap-1.5">
												<Truck className="w-3.5 h-3.5 text-slate-400" />
												<span className="text-sm text-slate-600">{asset.supplier || "—"}</span>
											</div>
										</td>
										<td className="px-4 py-3.5 text-sm text-slate-600">
											{formatDate(asset.purchase_date)}
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
						tài sản
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

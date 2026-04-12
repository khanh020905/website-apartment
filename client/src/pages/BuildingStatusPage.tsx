import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
	AlertCircle,
	Building2,
	Filter,
	MapPin,
	MessageCircle,
	Phone,
	RefreshCw,
	Search,
	Users,
	X,
} from "lucide-react";
import { api } from "../lib/api";
import type { Room, RoomStatus } from "../../../shared/types";

interface QrBuilding {
	id: string;
	name: string;
	address: string;
	ward: string | null;
	district: string | null;
	city: string | null;
	floors: number;
	description: string | null;
	phone: string | null;
	rooms: Room[];
}

interface QrContact {
	full_name: string | null;
	phone: string | null;
	email: string | null;
	avatar_url: string | null;
}

interface QrResponse {
	building: QrBuilding;
	contact: QrContact | null;
}

type StatusFilter = RoomStatus | "all";
type FloorFilter = number | "all";

const ROOM_STATUS_META: Record<
	RoomStatus,
	{ label: string; shortLabel: string; chip: string; card: string; dot: string }
> = {
	available: {
		label: "Còn trống",
		shortLabel: "Trống",
		chip: "bg-emerald-50 text-emerald-700 border-emerald-200",
		card: "border-emerald-200 bg-emerald-50/40",
		dot: "bg-emerald-500",
	},
	reserved: {
		label: "Đã cọc",
		shortLabel: "Đã cọc",
		chip: "bg-amber-50 text-amber-700 border-amber-200",
		card: "border-amber-200 bg-amber-50/40",
		dot: "bg-amber-500",
	},
	occupied: {
		label: "Đang sử dụng",
		shortLabel: "Đã thuê",
		chip: "bg-rose-50 text-rose-700 border-rose-200",
		card: "border-rose-200 bg-rose-50/40",
		dot: "bg-rose-500",
	},
	maintenance: {
		label: "Đang bảo trì",
		shortLabel: "Bảo trì",
		chip: "bg-slate-100 text-slate-700 border-slate-200",
		card: "border-slate-200 bg-slate-50/60",
		dot: "bg-slate-400",
	},
};

const formatCurrency = (value: number | null) => {
	if (!value || value <= 0) return "Chưa cập nhật";
	return `${new Intl.NumberFormat("vi-VN").format(value)} đ/tháng`;
};

const buildAddress = (building: QrBuilding) =>
	[building.address, building.ward, building.district, building.city].filter(Boolean).join(", ");

const normalizePhoneForUrl = (phone: string) => phone.replace(/[^\d+]/g, "");
const normalizePhoneForZalo = (phone: string) => phone.replace(/\D/g, "");

export default function BuildingStatusPage() {
	const { code } = useParams();
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [data, setData] = useState<QrResponse | null>(null);
	const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
	const [searchKeyword, setSearchKeyword] = useState("");
	const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
	const [floorFilter, setFloorFilter] = useState<FloorFilter>("all");

	useEffect(() => {
		let mounted = true;

		const loadStatus = async () => {
			setLoading(true);
			setError(null);
			const { data, error } = await api.get<QrResponse>(`/api/qr/${code}`);
			if (!mounted) return;
			if (error || !data) {
				setError(error || "Không thể tải thông tin từ mã QR.");
				setData(null);
			} else {
				setData(data);
			}
			setLoading(false);
		};

		loadStatus();
		return () => {
			mounted = false;
		};
	}, [code]);

	const building = data?.building;
	const contact = data?.contact;

	const allRooms = useMemo(() => {
		if (!building?.rooms) return [];
		return [...building.rooms].sort((a, b) => {
			if (a.floor !== b.floor) return a.floor - b.floor;
			return a.room_number.localeCompare(b.room_number, "vi", { numeric: true });
		});
	}, [building?.rooms]);

	const floorOptions = useMemo(() => Array.from(new Set(allRooms.map((room) => room.floor))).sort((a, b) => a - b), [allRooms]);

	const roomStats = useMemo(
		() => ({
			total: allRooms.length,
			available: allRooms.filter((room) => room.status === "available").length,
			reserved: allRooms.filter((room) => room.status === "reserved").length,
			occupied: allRooms.filter((room) => room.status === "occupied").length,
			maintenance: allRooms.filter((room) => room.status === "maintenance").length,
		}),
		[allRooms],
	);

	const filteredRooms = useMemo(() => {
		const keyword = searchKeyword.trim().toLowerCase();
		return allRooms.filter((room) => {
			if (statusFilter !== "all" && room.status !== statusFilter) return false;
			if (floorFilter !== "all" && room.floor !== floorFilter) return false;
			if (!keyword) return true;
			return room.room_number.toLowerCase().includes(keyword);
		});
	}, [allRooms, statusFilter, floorFilter, searchKeyword]);

	const contactPhone = contact?.phone || building?.phone || "";
	const telPhone = contactPhone ? normalizePhoneForUrl(contactPhone) : "";
	const zaloPhone = contactPhone ? normalizePhoneForZalo(contactPhone) : "";

	if (loading) {
		return (
			<div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4 p-8">
				<RefreshCw className="w-10 h-10 text-brand-primary animate-spin" />
				<p className="text-sm font-semibold text-slate-500">Đang tải thông tin tòa nhà từ QR...</p>
			</div>
		);
	}

	if (error || !building) {
		return (
			<div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
				<div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-8 text-center shadow-sm">
					<div className="w-16 h-16 mx-auto rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
						<AlertCircle className="w-8 h-8" />
					</div>
					<h2 className="text-xl font-bold text-slate-900 mb-2">QR không hợp lệ</h2>
					<p className="text-sm text-slate-500 mb-6">{error || "Mã QR đã hết hiệu lực hoặc không tồn tại."}</p>
					<Link
						to="/"
						className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-brand-primary text-white text-sm font-semibold hover:bg-brand-dark"
					>
						Về trang chủ
					</Link>
				</div>
			</div>
		);
	}

	return (
		<div className="w-full min-h-full bg-slate-50">
			<div className="w-full max-w-7xl mx-auto px-4 py-6 lg:py-8 space-y-6">
				<div className="bg-white border border-slate-200 rounded-2xl p-5 lg:p-6 shadow-sm">
					<div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
						<div className="space-y-3">
							<div className="inline-flex items-center gap-2 rounded-full border border-brand-primary/20 bg-brand-bg px-3 py-1">
								<Building2 className="w-4 h-4 text-brand-primary" />
								<span className="text-xs font-semibold text-brand-dark">Trang thông tin từ mã QR</span>
							</div>
							<h1 className="text-2xl lg:text-3xl font-bold text-slate-900">{building.name}</h1>
							<div className="flex items-start gap-2 text-slate-600">
								<MapPin className="w-4 h-4 mt-0.5 shrink-0 text-slate-400" />
								<span className="text-sm leading-relaxed">{buildAddress(building) || "Chưa cập nhật địa chỉ"}</span>
							</div>
							{building.description && <p className="text-sm text-slate-500 max-w-3xl">{building.description}</p>}
						</div>

						<div className="grid grid-cols-2 sm:grid-cols-4 gap-3 min-w-0">
							<div className="rounded-xl border border-slate-200 p-3">
								<p className="text-xs text-slate-400">Tổng phòng</p>
								<p className="text-lg font-bold text-slate-900">{roomStats.total}</p>
							</div>
							<div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-3">
								<p className="text-xs text-emerald-700">Còn trống</p>
								<p className="text-lg font-bold text-emerald-700">{roomStats.available}</p>
							</div>
							<div className="rounded-xl border border-rose-200 bg-rose-50/40 p-3">
								<p className="text-xs text-rose-700">Đang sử dụng</p>
								<p className="text-lg font-bold text-rose-700">{roomStats.occupied}</p>
							</div>
							<div className="rounded-xl border border-slate-200 p-3">
								<p className="text-xs text-slate-400">Tầng</p>
								<p className="text-lg font-bold text-slate-900">{building.floors || floorOptions.length || 0}</p>
							</div>
						</div>
					</div>

					<div className="mt-5 pt-5 border-t border-slate-100 flex flex-wrap items-center gap-3">
						<div className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 bg-slate-50">
							<Users className="w-4 h-4 text-slate-500" />
							<span className="text-sm font-semibold text-slate-700">{contact?.full_name || "Chủ tòa nhà"}</span>
						</div>
						<a
							href={telPhone ? `tel:${telPhone}` : undefined}
							className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
								telPhone ? "bg-brand-primary text-white hover:bg-brand-dark" : "bg-slate-100 text-slate-400 cursor-not-allowed"
							}`}
						>
							<Phone className="w-4 h-4" />
							Gọi ngay
						</a>
						<a
							href={zaloPhone ? `https://zalo.me/${zaloPhone}` : undefined}
							target="_blank"
							rel="noreferrer noopener"
							className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
								zaloPhone ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-slate-100 text-slate-400 cursor-not-allowed"
							}`}
						>
							<MessageCircle className="w-4 h-4" />
							Nhắn Zalo
						</a>
					</div>
				</div>

				<div className="bg-white border border-slate-200 rounded-2xl p-4 lg:p-5 shadow-sm space-y-4">
					<div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
						<Filter className="w-4 h-4 text-slate-500" />
						Lọc phòng
					</div>

					<div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
						<div className="relative">
							<Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
							<input
								value={searchKeyword}
								onChange={(e) => setSearchKeyword(e.target.value)}
								placeholder="Tìm theo số phòng (VD: 101)"
								className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-brand-primary"
							/>
						</div>

						<select
							value={floorFilter}
							onChange={(e) => {
								const value = e.target.value;
								setFloorFilter(value === "all" ? "all" : Number(value));
							}}
							className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-brand-primary"
						>
							<option value="all">Tất cả tầng</option>
							{floorOptions.map((floor) => (
								<option
									key={floor}
									value={floor}
								>
									Tầng {floor}
								</option>
							))}
						</select>

						<select
							value={statusFilter}
							onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
							className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-brand-primary"
						>
							<option value="all">Tất cả trạng thái</option>
							<option value="available">Còn trống</option>
							<option value="reserved">Đã cọc</option>
							<option value="occupied">Đang sử dụng</option>
							<option value="maintenance">Đang bảo trì</option>
						</select>
					</div>

					<div className="flex flex-wrap gap-2">
						{(["all", "available", "reserved", "occupied", "maintenance"] as StatusFilter[]).map((status) => (
							<button
								key={status}
								onClick={() => setStatusFilter(status)}
								className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
									statusFilter === status ?
										"border-brand-primary bg-brand-bg text-brand-dark"
									:	"border-slate-200 bg-white text-slate-600 hover:border-slate-300"
								}`}
							>
								{status === "all" ? "Tất cả" : ROOM_STATUS_META[status].shortLabel}
							</button>
						))}
					</div>
				</div>

				<div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
					<div className="px-4 lg:px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-3">
						<div>
							<h2 className="text-base lg:text-lg font-bold text-slate-900">Danh sách phòng tòa {building.name}</h2>
							<p className="text-xs lg:text-sm text-slate-500 mt-0.5">
								Hiển thị trạng thái phòng theo thời gian thực
							</p>
						</div>
						<span className="text-xs lg:text-sm font-semibold text-slate-600">{filteredRooms.length} phòng</span>
					</div>

					<div className="overflow-x-auto">
						<table className="w-full min-w-[920px]">
							<thead className="bg-[#EDEDED] border-b border-slate-200 text-[10px] font-bold uppercase tracking-widest text-slate-500">
								<tr>
									<th className="px-5 py-3.5 text-left">Phòng</th>
									<th className="px-5 py-3.5 text-left">Tầng</th>
									<th className="px-5 py-3.5 text-left">Trạng thái</th>
									<th className="px-5 py-3.5 text-left">Giá thuê</th>
									<th className="px-5 py-3.5 text-left">Diện tích</th>
									<th className="px-5 py-3.5 text-left">Sức chứa</th>
									<th className="px-5 py-3.5 text-left">Liên hệ</th>
									<th className="px-5 py-3.5 text-right">Chi tiết</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-slate-100">
								{filteredRooms.length === 0 ?
									<tr>
										<td
											colSpan={8}
											className="px-6 py-20 text-center text-slate-500 text-sm"
										>
											Không có phòng phù hợp với điều kiện lọc.
										</td>
									</tr>
								:	filteredRooms.map((room) => {
										const meta = ROOM_STATUS_META[room.status];
										return (
											<tr
												key={room.id}
												className={`hover:bg-slate-50/70 transition-colors ${meta.card}`}
											>
												<td className="px-5 py-4">
													<div className="font-extrabold text-slate-900">Phòng {room.room_number}</div>
												</td>
												<td className="px-5 py-4 text-slate-700 font-semibold">Tầng {room.floor}</td>
												<td className="px-5 py-4">
													<span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${meta.chip}`}>
														<span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
														{meta.label}
													</span>
												</td>
												<td className="px-5 py-4 text-slate-700 font-semibold whitespace-nowrap">
													{formatCurrency(room.price)}
												</td>
												<td className="px-5 py-4 text-slate-700 font-semibold whitespace-nowrap">
													{room.area || 0} m²
												</td>
												<td className="px-5 py-4 text-slate-700 font-semibold whitespace-nowrap">
													{room.current_occupants || 0}/{room.max_occupants || 0} người
												</td>
												<td className="px-5 py-4">
													{room.status === "available" && telPhone ?
														<a
															href={`tel:${telPhone}`}
															className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-brand-primary text-white hover:bg-brand-dark text-xs font-semibold whitespace-nowrap"
														>
															<Phone className="w-3.5 h-3.5" />
															Gọi ngay
														</a>
													:	<span className="text-xs font-semibold text-slate-400">Không khả dụng</span>}
												</td>
												<td className="px-5 py-4 text-right">
													<button
														onClick={() => setSelectedRoom(room)}
														className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50"
													>
														Xem chi tiết
													</button>
												</td>
											</tr>
										);
									})
								}
							</tbody>
						</table>
					</div>
				</div>
			</div>

			<AnimatePresence>
				{selectedRoom && (
					<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50">
						<motion.div
							initial={{ opacity: 0, scale: 0.95, y: 8 }}
							animate={{ opacity: 1, scale: 1, y: 0 }}
							exit={{ opacity: 0, scale: 0.95, y: 8 }}
							className="w-full max-w-md bg-white rounded-2xl border border-slate-200 p-5 shadow-xl"
						>
							<div className="flex items-start justify-between gap-3">
								<div>
									<h3 className="text-xl font-bold text-slate-900">Phòng {selectedRoom.room_number}</h3>
									<div
										className={`mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${ROOM_STATUS_META[selectedRoom.status].chip}`}
									>
										<span className={`w-1.5 h-1.5 rounded-full ${ROOM_STATUS_META[selectedRoom.status].dot}`} />
										{ROOM_STATUS_META[selectedRoom.status].label}
									</div>
								</div>
								<button
									onClick={() => setSelectedRoom(null)}
									className="w-9 h-9 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 flex items-center justify-center"
								>
									<X className="w-4 h-4" />
								</button>
							</div>

							<div className="grid grid-cols-2 gap-3 mt-4">
								<div className="rounded-lg border border-slate-200 p-3">
									<p className="text-xs text-slate-400">Giá thuê</p>
									<p className="text-sm font-semibold text-slate-800 mt-0.5">{formatCurrency(selectedRoom.price)}</p>
								</div>
								<div className="rounded-lg border border-slate-200 p-3">
									<p className="text-xs text-slate-400">Diện tích</p>
									<p className="text-sm font-semibold text-slate-800 mt-0.5">{selectedRoom.area || 0} m²</p>
								</div>
								<div className="rounded-lg border border-slate-200 p-3">
									<p className="text-xs text-slate-400">Sức chứa</p>
									<p className="text-sm font-semibold text-slate-800 mt-0.5">{selectedRoom.max_occupants || 0} người</p>
								</div>
								<div className="rounded-lg border border-slate-200 p-3">
									<p className="text-xs text-slate-400">Hiện tại</p>
									<p className="text-sm font-semibold text-slate-800 mt-0.5">{selectedRoom.current_occupants || 0} người</p>
								</div>
							</div>

							<div className="mt-5 flex gap-2">
								<a
									href={telPhone ? `tel:${telPhone}` : undefined}
									className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold ${
										telPhone ? "bg-brand-primary text-white hover:bg-brand-dark" : "bg-slate-100 text-slate-400 cursor-not-allowed"
									}`}
								>
									<Phone className="w-4 h-4" />
									Gọi tư vấn
								</a>
								<a
									href={zaloPhone ? `https://zalo.me/${zaloPhone}` : undefined}
									target="_blank"
									rel="noreferrer noopener"
									className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold ${
										zaloPhone ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-slate-100 text-slate-400 cursor-not-allowed"
									}`}
								>
									<MessageCircle className="w-4 h-4" />
									Nhắn Zalo
								</a>
							</div>
						</motion.div>
					</div>
				)}
			</AnimatePresence>
		</div>
	);
}

import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
	Building2,
	Phone,
	User,
	AlertCircle,
	MapPin,
	RefreshCw,
	MessageCircle,
} from "lucide-react";
import { api } from "../lib/api";
import type { Room, RoomStatus } from "../../../shared/types";

const PUBLIC_STATUS_CONFIG: Record<
	RoomStatus,
	{ color: string; bg: string; border: string; dot: string }
> = {
	available: {
		color: "text-emerald-700",
		bg: "bg-emerald-50",
		border: "border-emerald-200",
		dot: "bg-emerald-500",
	},
	reserved: {
		color: "text-amber-700",
		bg: "bg-amber-50",
		border: "border-amber-200",
		dot: "bg-amber-500",
	},
	occupied: {
		color: "text-rose-700",
		bg: "bg-rose-50",
		border: "border-rose-200",
		dot: "bg-rose-500",
	},
	maintenance: {
		color: "text-brand-ink",
		bg: "bg-brand-bg",
		border: "border-brand-primary/20",
		dot: "bg-brand-bg0",
	},
};

export default function BuildingStatusPage() {
	const { code } = useParams();
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [data, setData] = useState<{ building: any; contact: any } | null>(null);
	const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

	useEffect(() => {
		loadStatus();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [code]);

	const loadStatus = async () => {
		setLoading(true);
		try {
			const { data, error } = await api.get<{ building: any; contact: any }>(`/api/qr/${code}`);
			if (error) setError(error);
			else if (data) setData(data);
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
		} catch (err) {
			setError("Không thể tải thông tin. Vui lòng quét lại mã QR.");
		} finally {
			setLoading(false);
		}
	};

	if (loading)
		return (
			<div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-10 space-y-6">
				<RefreshCw className="w-12 h-12 text-indigo-500 animate-spin" />
				<p className="text-xs font-black text-slate-400 uppercase tracking-widest">
					Đang tải trạng thái phòng...
				</p>
			</div>
		);

	if (error || !data)
		return (
			<div className="min-h-screen bg-white flex flex-col items-center justify-center p-10 text-center">
				<div className="w-24 h-24 bg-rose-50 rounded-[40px] flex items-center justify-center mb-8 border-4 border-white shadow-xl rotate-6">
					<AlertCircle className="w-12 h-12 text-rose-500" />
				</div>
				<h2 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">QR Không tồn tại</h2>
				<p className="text-slate-400 font-bold mb-10 max-w-xs">
					{error || "Mã QR đã hết hiệu lực hoặc không chính xác."}
				</p>
				<button
					onClick={() => (window.location.href = "/")}
					className="px-10 py-4 bg-slate-900 text-white rounded-3xl font-black uppercase tracking-widest text-xs"
				>
					Quay lại trang chủ
				</button>
			</div>
		);

	const { building, contact } = data;
	const rooms: Room[] = building.rooms || [];

	const floorGroups: Record<number, Room[]> = {};
	rooms.forEach((room) => {
		if (!floorGroups[room.floor]) floorGroups[room.floor] = [];
		floorGroups[room.floor].push(room);
	});
	const sortedFloors = Object.keys(floorGroups)
		.map(Number)
		.sort((a, b) => b - a);

	return (
		<div className="min-h-screen bg-slate-50 flex flex-col items-center pb-20">
			<div className="w-full max-w-md bg-white border-b border-slate-100 p-8 shadow-sm relative overflow-hidden">
				{/* HomeSpot Branding */}
				<Link
					to="/"
					className="absolute top-4 left-6 flex items-center gap-2 group"
				>
					<div className="w-6 h-6 bg-slate-900 rounded-lg flex items-center justify-center overflow-hidden transition-transform group-hover:scale-110">
						<img
							src="/logo.jpg"
							alt="HomeSpot"
							className="w-full h-full object-cover"
						/>
					</div>
					<span className="text-[10px] font-black text-slate-900 uppercase tracking-widest opacity-40 group-hover:opacity-100 transition-opacity">
						HomeSpot
					</span>
				</Link>

				{/* Abstract background shape */}
				<div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-50 rounded-full blur-[80px] opacity-60" />

				<div className="relative z-10 flex flex-col items-center text-center mt-6">
					<div className="w-16 h-16 bg-white rounded-[28px] flex items-center justify-center shadow-xl shadow-indigo-900/5 mb-6 border-2 border-slate-50 overflow-hidden">
						<div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white">
							<Building2 size={24} />
						</div>
					</div>
					<h1 className="text-2xl font-black text-slate-900 tracking-tight mb-2 uppercase leading-none">
						{building.name}
					</h1>
					<div className="flex items-start justify-center gap-1 text-slate-400 font-black text-[10px] uppercase tracking-widest px-4">
						<MapPin className="w-3.5 h-3.5 shrink-0" />
						<span className="line-clamp-2">{building.address}</span>
					</div>
				</div>
			</div>

			<div className="w-full max-w-md px-4 mt-8 space-y-10">
				<div className="flex items-center justify-around p-4 bg-white/60 backdrop-blur-md rounded-3xl border border-white shadow-xl shadow-slate-900/3">
					{Object.entries(PUBLIC_STATUS_CONFIG).map(([key, cfg]) => (
						<div
							key={key}
							className="flex flex-col items-center gap-2"
						>
							<div className={`w-3 h-3 rounded-full ${cfg.dot} shadow-lg shadow-black/10`} />
							<span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
								{key === "available" ?
									"Trống"
								: key === "reserved" ?
									"Đã cọc"
								: key === "occupied" ?
									"Đã thuê"
								:	"Đang sửa"}
							</span>
						</div>
					))}
				</div>

				<div className="space-y-12 pb-10">
					{sortedFloors.length > 0 ?
						sortedFloors.map((floor) => (
							<div
								key={floor}
								className="space-y-6"
							>
								<div className="flex items-center gap-4">
									<div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-md border border-slate-50">
										<span className="text-lg font-black text-slate-900">{floor}</span>
									</div>
									<div className="flex-1 h-px bg-slate-200/50" />
								</div>

								<div className="grid grid-cols-4 gap-3">
									{floorGroups[floor]
										.sort((a, b) => a.room_number.localeCompare(b.room_number))
										.map((room) => {
											const cfg = PUBLIC_STATUS_CONFIG[room.status];
											return (
												<motion.button
													key={room.id}
													onClick={() => setSelectedRoom(room)}
													initial={{ scale: 0.9, opacity: 0 }}
													animate={{ scale: 1, opacity: 1 }}
													whileTap={{ scale: 0.95 }}
													className={`aspect-square ${cfg.bg} border ${cfg.border} rounded-2xl flex flex-col items-center justify-center gap-1 shadow-sm relative overflow-hidden group cursor-pointer`}
												>
													<span className={`text-base font-black ${cfg.color}`}>
														{room.room_number}
													</span>
													<div className={`w-1 h-1 rounded-full ${cfg.dot}`} />
												</motion.button>
											);
										})}
								</div>
							</div>
						))
					:	<div className="py-20 text-center font-bold text-slate-400">Không có dữ liệu phòng</div>}
				</div>
			</div>

			<div className="fixed bottom-0 left-0 right-0 p-4 z-100 flex justify-center">
				<motion.div
					initial={{ y: 100 }}
					animate={{ y: 0 }}
					className="w-full max-w-sm bg-slate-900/95 backdrop-blur-xl rounded-[40px] p-4 flex items-center shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-white/10"
				>
					<div className="flex-1 flex items-center gap-4 pl-2">
						<div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center overflow-hidden border border-white/20">
							<User className="w-6 h-6 text-white/40" />
						</div>
						<div>
							<p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">
								Chủ tòa nhà
							</p>
							<h5 className="text-sm font-black text-white">
								{contact?.full_name || "Chưa cập nhật"}
							</h5>
						</div>
					</div>
					<a
						href={`tel:${contact?.phone}`}
						className="w-20 h-14 bg-white/10 text-white rounded-2xl flex items-center justify-center hover:bg-white/20 transition-colors"
					>
						<Phone className="w-6 h-6" />
					</a>
					<a
						href={`https://zalo.me/${contact?.phone}`}
						target="_blank"
						rel="noopener noreferrer"
						className="w-14 h-14 ml-2 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-900/40"
					>
						<MessageCircle className="w-6 h-6" />
					</a>
				</motion.div>
			</div>

			<AnimatePresence>
				{selectedRoom && (
					<div className="fixed inset-0 z-200 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
						<motion.div
							initial={{ opacity: 0, scale: 0.9, y: 20 }}
							animate={{ opacity: 1, scale: 1, y: 0 }}
							exit={{ opacity: 0, scale: 0.9, y: 20 }}
							className="w-full max-w-sm bg-white rounded-[40px] p-8 shadow-2xl relative overflow-hidden"
						>
							<div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full -mr-16 -mt-16" />
							<button
								onClick={() => setSelectedRoom(null)}
								className="absolute top-6 right-6 w-10 h-10 border border-slate-100 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-50 transition-colors cursor-pointer"
							>
								×
							</button>

							<div className="relative z-10">
								<div className="flex items-center gap-4 mb-8">
									<div
										className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${PUBLIC_STATUS_CONFIG[selectedRoom.status].bg} ${PUBLIC_STATUS_CONFIG[selectedRoom.status].border} border-2`}
									>
										<span
											className={`text-xl font-black ${PUBLIC_STATUS_CONFIG[selectedRoom.status].color}`}
										>
											{selectedRoom.room_number}
										</span>
									</div>
									<div>
										<h3 className="text-xl font-black text-slate-900 leading-none mb-1">
											Chi tiết phòng
										</h3>
										<span
											className={`text-[10px] font-black uppercase tracking-widest ${PUBLIC_STATUS_CONFIG[selectedRoom.status].color}`}
										>
											{selectedRoom.status === "available" ?
												"Đang trống"
											: selectedRoom.status === "occupied" ?
												"Đã có người"
											:	"Bảo trì"}
										</span>
									</div>
								</div>

								<div className="grid grid-cols-2 gap-4 mb-8">
									<div className="p-4 bg-slate-50 rounded-3xl border border-slate-100">
										<p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 opacity-50">
											Giá thuê
										</p>
										<p className="text-sm font-black text-slate-900">
											{((selectedRoom.price || 0) / 1000000).toFixed(1)}{" "}
											<span className="text-xs">Trđ/th</span>
										</p>
									</div>
									<div className="p-4 bg-slate-50 rounded-3xl border border-slate-100">
										<p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 opacity-50">
											Diện tích
										</p>
										<p className="text-sm font-black text-slate-900">{selectedRoom.area} m²</p>
									</div>
									<div className="p-4 bg-slate-50 rounded-3xl border border-slate-100">
										<p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 opacity-50">
											Sức chứa
										</p>
										<p className="text-sm font-black text-slate-900">
											{selectedRoom.max_occupants || "--"} người
										</p>
									</div>
									<div className="p-4 bg-slate-50 rounded-3xl border border-slate-100">
										<p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 opacity-50">
											Hiện tại
										</p>
										<p className="text-sm font-black text-slate-900">
											{selectedRoom.current_occupants || 0} người
										</p>
									</div>
								</div>

								{selectedRoom.status === "available" ?
									<div className="flex flex-col gap-3">
										<button
											onClick={() => {
												setSelectedRoom(null);
												window.location.href = `tel:${contact?.phone}`;
											}}
											className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs shadow-xl shadow-slate-900/20 hover:bg-slate-800 transition-all flex items-center justify-center gap-3 active:scale-95 uppercase tracking-widest cursor-pointer"
										>
											<Phone className="w-4 h-4" />
											Gọi ngay
										</button>
										<button
											onClick={() => {
												setSelectedRoom(null);
												window.open(`https://zalo.me/${contact?.phone}`, "_blank");
											}}
											className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs shadow-xl shadow-indigo-900/20 hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 active:scale-95 uppercase tracking-widest cursor-pointer"
										>
											<MessageCircle className="w-4 h-4" />
											Nhắn qua Zalo
										</button>
									</div>
								:	<div className="py-4 text-center border-2 border-dashed border-slate-100 rounded-3xl">
										<p className="text-xs font-bold text-slate-300 italic uppercase tracking-widest">
											Phòng này hiện không sẵn sàng
										</p>
									</div>
								}
							</div>
						</motion.div>
					</div>
				)}
			</AnimatePresence>

			<p className="mt-10 mb-20 text-[10px] font-black text-slate-300 uppercase tracking-widest text-center px-10 leading-relaxed">
				* Dữ liệu cập nhật thời gian thực từ hệ thống HomeSpot. Quét mã QR tại tòa nhà để xem lại.
			</p>
		</div>
	);
}

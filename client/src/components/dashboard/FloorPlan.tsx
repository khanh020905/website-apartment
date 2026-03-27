import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
	Users,
	LayoutGrid,
	Trash2,
	Edit3,
	Wrench,
	CheckCircle,
	ExternalLink,
	FilePlus,
} from "lucide-react";
import type { Room, RoomStatus, BuildingWithRooms } from "../../../../shared/types";
import { ROOM_STATUS_LABELS } from "../../../../shared/types";
import { useState } from "react";

const STATUS_CONFIG: Record<
	RoomStatus,
	{ color: string; bg: string; border: string; icon: React.ReactNode }
> = {
	available: {
		color: "text-brand-primary",
		bg: "bg-linear-to-br from-brand-primary/5 to-brand-primary/10",
		border: "border-brand-primary/20 ring-1 ring-inset ring-brand-primary/10",
		icon: <CheckCircle className="w-3 h-3" />,
	},
	occupied: {
		color: "text-brand-ink",
		bg: "bg-linear-to-br from-brand-ink/5 to-brand-ink/10",
		border: "border-brand-ink/20 ring-1 ring-inset ring-brand-ink/10",
		icon: <Users className="w-3 h-3" />,
	},
	maintenance: {
		color: "text-slate-500",
		bg: "bg-linear-to-br from-slate-100 to-slate-200",
		border: "border-slate-300 ring-1 ring-inset ring-slate-200",
		icon: <Wrench className="w-3 h-3" />,
	},
};

interface FloorPlanProps {
	building: BuildingWithRooms;
	onStatusChange: (roomId: string, status: RoomStatus) => void;
	onDeleteRoom: (roomId: string) => void;
	onEditRoom: (room: Room) => void;
	onAddRoom: () => void;
	onAddContract: (room: Room) => void;
}

export const FloorPlan = ({
	building,
	onStatusChange,
	onDeleteRoom,
	onEditRoom,
	onAddRoom,
	onAddContract,
}: FloorPlanProps) => {
	const navigate = useNavigate();
	const [filter, setFilter] = useState<RoomStatus | "all">("all");

	const rooms = building.rooms || [];
	const filteredRooms = filter === "all" ? rooms : rooms.filter((r) => r.status === filter);

	// Group by floor
	const floorGroups: Record<number, Room[]> = {};
	filteredRooms.forEach((room) => {
		const floorNum = room.floor || 1;
		if (!floorGroups[floorNum]) floorGroups[floorNum] = [];
		floorGroups[floorNum].push(room);
	});

	// Sort floors descending
	const sortedFloors = Object.keys(floorGroups)
		.map(Number)
		.sort((a, b) => b - a);

	return (
		<div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm min-h-125">
			{/* Header & Controls */}
			<div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
				<div>
					<h3 className="text-xl font-black text-brand-ink tracking-tight flex items-center gap-2">
						<LayoutGrid className="w-6 h-6 text-brand-primary" />
						Sơ đồ phòng tòa {building.name}
					</h3>
					<p className="text-sm font-bold text-slate-400 mt-1 uppercase tracking-widest">
						{building.address}
					</p>
				</div>

				<div className="flex items-center gap-3 overflow-x-auto pb-2 md:pb-0">
					<div className="flex bg-slate-50 p-1.5 rounded-[18px] border border-slate-100 shadow-inner">
						{(["all", "available", "occupied", "maintenance"] as const).map((f) => (
							<button
								key={f}
								onClick={() => setFilter(f)}
								className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 whitespace-nowrap cursor-pointer ${
									filter === f ?
										"bg-white text-brand-ink shadow-sm ring-1 ring-slate-900/5"
									:	"text-slate-400 hover:text-slate-600 hover:bg-slate-100"
								}`}
							>
								{f === "all" ? "Tất cả" : ROOM_STATUS_LABELS[f]}
							</button>
						))}
					</div>
					<button
						onClick={onAddRoom}
						className="px-6 py-2.5 bg-brand-primary text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-brand-primary/20 hover:bg-brand-dark transition-colors cursor-pointer"
					>
						+ Phòng mới
					</button>
				</div>
			</div>

			{/* Grid Rendering */}
			<div className="space-y-12">
				{sortedFloors.length > 0 ?
					sortedFloors.map((floor) => (
						<div
							key={floor}
							className="relative"
						>
							<div className="flex items-start gap-8">
								{/* Floor Indicator */}
								<div className="w-16 h-16 flex flex-col items-center justify-center bg-slate-50 border border-slate-100 rounded-3xl shrink-0">
									<span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
										Tầng
									</span>
									<span className="text-2xl font-black text-slate-900 leading-tight">{floor}</span>
								</div>

								{/* Rooms Row */}
								<div className="flex-1 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
									{floorGroups[floor]
										.sort((a, b) => a.room_number.localeCompare(b.room_number))
										.map((room) => {
											const cfg = STATUS_CONFIG[room.status] || STATUS_CONFIG["available"];
											const statusLabel = ROOM_STATUS_LABELS[room.status] || "Trống";
											return (
												<motion.div
													initial={{ scale: 0.9, opacity: 0 }}
													animate={{ scale: 1, opacity: 1 }}
													key={room.id}
													className="group relative"
												>
													<div
														className={`aspect-5/4 ${cfg.bg} border ${cfg.border} rounded-3xl p-4 flex flex-col items-center justify-center gap-1.5 transition-all duration-300 hover:shadow-2xl hover:shadow-brand-ink/10 hover:-translate-y-1 cursor-pointer overflow-hidden relative group/card`}
													>
														<div className="absolute inset-x-0 -top-px h-px bg-linear-to-r from-transparent via-white/50 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity" />
														<span className="text-base font-black text-brand-ink tracking-tight z-10">
															{room.room_number}
														</span>
														<button
															onClick={(e) => {
																e.stopPropagation();
																const statuses: RoomStatus[] = [
																	"available",
																	"occupied",
																	"maintenance",
																];
																const currentIndex = statuses.indexOf(room.status);
																const next =
																	statuses[Math.max(0, currentIndex + 1) % statuses.length];
																onStatusChange(room.id, next);
															}}
															className={`flex items-center gap-1.5 ${cfg.color} text-[10px] font-black uppercase tracking-widest bg-white/60 px-2 py-1 rounded-lg backdrop-blur-sm cursor-pointer hover:bg-white transition-colors`}
														>
															{cfg.icon}
															{statusLabel.split(" ")[1] || statusLabel}
														</button>
														<p className="text-[10px] text-slate-400 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
															{room.area}m² • {room.current_occupants}/{room.max_occupants}
														</p>

														{/* Corner actions for desktop hover */}
														<div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1 translate-x-2 group-hover:translate-x-0">
															{room.status === "available" && (
																<>
																	<button
																		onClick={(e) => {
																			e.stopPropagation();
																			navigate(
																				`/create-listing?room_id=${room.id}&building_id=${building.id}`,
																			);
																		}}
																		title="Đăng tin cho thuê"
																		className="p-1 text-brand-primary hover:text-brand-dark bg-white rounded-lg shadow-sm cursor-pointer"
																	>
																		<ExternalLink className="w-3 h-3" />
																	</button>
																	<button
																		onClick={(e) => {
																			e.stopPropagation();
																			onAddContract(room);
																		}}
																		title="Lập hợp đồng"
																		className="p-1 text-brand-ink hover:text-brand-primary bg-white rounded-lg shadow-sm cursor-pointer"
																	>
																		<FilePlus className="w-3 h-3" />
																	</button>
																</>
															)}
															<button
																onClick={(e) => {
																	e.stopPropagation();
																	onEditRoom(room);
																}}
																className="p-1 text-slate-400 hover:text-indigo-600 bg-white rounded-lg shadow-sm"
															>
																<Edit3 className="w-3 h-3" />
															</button>
															<button
																onClick={(e) => {
																	e.stopPropagation();
																	onDeleteRoom(room.id);
																}}
																className="p-1 text-slate-400 hover:text-rose-600 bg-white rounded-lg shadow-sm"
															>
																<Trash2 className="w-3 h-3" />
															</button>
														</div>
													</div>

													{/* Dropdown / Popover Placeholder - implemented via click & selection */}
												</motion.div>
											);
										})}
								</div>
							</div>

							{/* Floor Divider */}
							<div className="absolute left-8 right-0 -bottom-6 border-t border-slate-50 border-dashed" />
						</div>
					))
				:	<div className="py-20 text-center space-y-4">
						<div className="w-20 h-20 bg-slate-50 text-slate-200 rounded-[40px] flex items-center justify-center mx-auto">
							<LayoutGrid className="w-10 h-10" />
						</div>
						<div>
							<p className="text-lg font-black text-slate-900">Không tìm thấy phòng phù hợp</p>
							<p className="text-sm font-bold text-slate-400">
								Hãy thử thay đổi bộ lọc hoặc thêm phòng mới
							</p>
						</div>
					</div>
				}
			</div>

			{/* Legend */}
			<div className="mt-20 pt-10 border-t border-slate-50 flex flex-wrap gap-8 justify-center opacity-70 grayscale hover:grayscale-0 transition-all">
				{Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
					<div
						key={key}
						className="flex items-center gap-2"
					>
						<div
							className={`w-3 h-3 rounded-full ${
								cfg.bg.includes("slate") ? "bg-slate-400"
								: cfg.bg.includes("brand-primary") ? "bg-brand-primary"
								: "bg-brand-ink"
							}`}
						/>
						<span className="text-[10px] font-black text-brand-ink uppercase tracking-[0.2em]">
							{ROOM_STATUS_LABELS[key as RoomStatus]}
						</span>
					</div>
				))}
			</div>
		</div>
	);
};

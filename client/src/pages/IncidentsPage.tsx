import { useState, useEffect } from "react";
import { api } from "../lib/api";
import { motion, AnimatePresence } from "framer-motion";
import {
	Plus,
	Search,
	ChevronLeft,
	ChevronRight,
	Settings,
	MoreHorizontal,
	Settings2,
	X,
	FileSpreadsheet,
	Calendar,
	ChevronDown,
	Eye,
	Edit2,
	Trash2,
	Flag,
} from "lucide-react";
import Modal from "../components/modals/Modal";
import IncidentForm from "../components/modals/IncidentForm";
import * as XLSX from 'xlsx';

interface Incident {
	id: string;
	type: string | { name: string, icon: string };
	priority: string;
	location: string;
	status: string;
	reportedBy: string;
	assignee?: string;
	created_at?: string;
	due_date?: string;
	description?: string;
	building?: { name: string };
	room?: { room_number: string };
}

const ALL_COLUMNS = [
	{ id: 'type', label: 'Loại sự cố' },
	{ id: 'priority', label: 'Ưu tiên' },
	{ id: 'location', label: 'Vị trí sự cố' },
	{ id: 'building', label: 'Toà nhà' },
	{ id: 'status', label: 'Trạng thái' },
	{ id: 'reportedBy', label: 'Báo cáo bởi' },
	{ id: 'assignee', label: 'Người đảm nhận' },
	{ id: 'dueDate', label: 'Ngày đến hạn' },
	{ id: 'description', label: 'Mô tả' },
	{ id: 'createdAt', label: 'Ngày tạo' },
	{ id: 'actions', label: 'Thao tác' },
];

export default function IncidentsPage() {
	const [search, setSearch] = useState("");
	const [typeFilter, setTypeFilter] = useState("");
	const [priorityFilter] = useState("");
	const [isFilterOpen, setIsFilterOpen] = useState(false);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [loading, setLoading] = useState(true);
	const [incidents, setIncidents] = useState<Incident[]>([]);
	const [incidentTypes, setIncidentTypes] = useState<{ id: string, name: string }[]>([]);
	const [buildings, setBuildings] = useState<any[]>([]);
	const [staff, setStaff] = useState<any[]>([]);

	// Sidebar filter states
	const [filterStatus, setFilterStatus] = useState<string[]>([]);
	const [filterPriority, setFilterPriority] = useState<string[]>([]);
	const [activeMenu, setActiveMenu] = useState<string | null>(null);
	const [visibleColumns, setVisibleColumns] = useState<string[]>(['type', 'priority', 'location', 'status', 'reportedBy', 'assignee', 'actions']);
	const [isColumnConfigOpen, setIsColumnConfigOpen] = useState(false);
	const [editingIncident, setEditingIncident] = useState<any>(null);

	const fetchIncidents = async () => {
		try {
			setLoading(true);
			const { data } = await api.get("/api/incidents");
			if (data) setIncidents(data as Incident[]);
		} catch (error) {
			console.error(error);
		} finally {
			setLoading(false);
		}
	};

	const fetchTypes = async () => {
		try {
			const { data } = await api.get("/api/incident-types");
			if (data) setIncidentTypes(data as any[]);
		} catch (error) {
			console.error(error);
		}
	};

	const fetchBuildings = async () => {
		try {
			const { data }: any = await api.get("/api/buildings");
			if (data?.buildings) setBuildings(data.buildings);
		} catch (error) {
			console.error(error);
		}
	};

	const fetchStaff = async () => {
		try {
			const { data }: any = await api.get("/api/admin/staff");
			if (data?.staff) setStaff(data.staff);
		} catch (error) {
			console.error(error);
		}
	};

	useEffect(() => {
		fetchIncidents();
		fetchTypes();
		fetchBuildings();
		fetchStaff();
	}, []);

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const handleCreateOrUpdateIncident = async (data: any) => {
		try {
			if (editingIncident) {
				await api.put(`/api/incidents/${editingIncident.id}`, data);
			} else {
				await api.post("/api/incidents", data);
			}
			fetchIncidents();
			setIsModalOpen(false);
			setEditingIncident(null);
		} catch (error) {
			console.error(error);
			alert(editingIncident ? "Lỗi cập nhật sự cố" : "Lỗi tạo sự cố");
		}
	};

	const handleExportExcel = () => {
		const excelData = filteredData.map((row, index) => ({
			"STT": index + 1,
			"Loại sự cố": typeof row.type === 'object' ? row.type?.name : row.type,
			"Ưu tiên": row.priority === "emergency" ? "Khẩn cấp" : row.priority === "high" ? "Cao" : row.priority === "medium" ? "Trung bình" : "Thấp",
			"Vị trí": row.building?.name || "—",
			"Vị trí sự cố": row.room?.room_number ? `P${row.room.room_number}` : row.location || "—",
			"Trạng thái": row.status === "pending" ? "Cần thực hiện" : row.status === "completed" ? "Đã hoàn thành" : "Đã huỷ",
			"Báo cáo bởi": row.reportedBy || "Hệ thống",
			"Người đảm nhận": row.assignee || "—",
			"Ngày đến hạn": row.due_date ? new Date(row.due_date).toLocaleDateString('vi-VN') : "—",
			"Mô tả": row.description || "—",
			"Tạo lúc": row.created_at ? new Date(row.created_at).toLocaleDateString('vi-VN') : "—",
			"Cập nhật lúc": new Date().toLocaleDateString('vi-VN'),
			"Tạo bởi": "Quản trị viên"
		}));

		const worksheet = XLSX.utils.json_to_sheet(excelData, { origin: "A4" } as any);
		
		// Add title and metadata
		XLSX.utils.sheet_add_aoa(worksheet, [
			["Danh sách sự cố"],
			[`Thời gian báo cáo: ${new Date().toLocaleDateString('vi-VN')}`]
		], { origin: "A1" } as any);

		// Manual Merge (roughly for 15 columns)
		worksheet['!merges'] = [
			{ s: { r: 0, c: 0 }, e: { r: 0, c: 14 } }, // Title
			{ s: { r: 1, c: 0 }, e: { r: 1, c: 14 } }  // Subtitle
		];

		const workbook = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(workbook, worksheet, "Incidents");

		// Set column widths for a "beautiful" look
		worksheet['!cols'] = [
			{ wch: 6 },   // STT
			{ wch: 18 },  // Loại sự cố
			{ wch: 12 },  // Ưu tiên
			{ wch: 15 },  // Vị trí (Building)
			{ wch: 15 },  // Vị trí sự cố (Room)
			{ wch: 15 },  // Trạng thái
			{ wch: 20 },  // Báo cáo bởi
			{ wch: 20 },  // Người đảm nhận
			{ wch: 15 },  // Ngày đến hạn
			{ wch: 45 },  // Mô tả
			{ wch: 15 },  // Tạo lúc
			{ wch: 15 },  // Cập nhật lúc
			{ wch: 15 }   // Tạo bởi
		];

		XLSX.writeFile(workbook, `Danh_sach_su_co_${new Date().getTime()}.xlsx`);
	};

	const filteredData = incidents.filter((t) => {
		if (
			search &&
			!t.location?.toLowerCase().includes(search.toLowerCase()) &&
			!t.reportedBy?.toLowerCase().includes(search.toLowerCase()) &&
			!t.room?.room_number?.toLowerCase().includes(search.toLowerCase()) &&
			!t.description?.toLowerCase().includes(search.toLowerCase())
		)
			return false;
		
		if (typeFilter) {
			const typeId = typeof t.type === 'object' ? (t as any).type_id : t.type;
			const typeName = typeof t.type === 'object' ? t.type.name : t.type;
			if (typeId !== typeFilter && typeName !== typeFilter) return false;
		}

		if (priorityFilter && t.priority !== priorityFilter) return false;
		if (filterStatus.length > 0 && !filterStatus.includes(t.status)) return false;
		if (filterPriority.length > 0 && !filterPriority.includes(t.priority)) return false;
		
		return true;
	});

	return (
		<div className="flex-1 flex flex-col h-full bg-[#F0F2F5] relative overflow-hidden font-sans">
			{/* Page Header */}
			<div className="bg-white border-b border-slate-200">
				<div className="px-6 py-4 flex items-center justify-between">
					<div className="flex items-center gap-2">
						<h1 className="text-[20px] font-bold text-[#1A1A1A] tracking-tight">Sự cố</h1>
					</div>
				</div>

				{/* Toolbar */}
				<div className="px-6 pb-4 flex flex-col lg:flex-row items-center gap-3">
					<div className="relative w-full lg:w-[400px] shrink-0">
						<Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
						<input
							type="text"
							placeholder="Tìm kiếm sự cố theo khách hàng, vị trí, mô tả"
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-[8px] text-[14px] text-slate-700 bg-white focus:outline-none focus:border-brand-primary hover:border-slate-300 transition-all font-medium"
						/>
					</div>

					<div className="flex items-center gap-3 w-full lg:w-auto">
						<div className="w-full sm:w-44 shrink-0 relative">
							<select
								className="w-full pl-3 pr-10 py-2 border border-slate-200 rounded-[8px] text-[14px] text-slate-600 bg-white focus:outline-none focus:border-brand-primary font-medium hover:border-slate-300 transition-all cursor-pointer appearance-none"
							>
								<option value="">Tất cả toà nhà</option>
								{buildings.map(b => (
									<option key={b.id} value={b.id}>{b.name}</option>
								))}
							</select>
							<ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
						</div>

						<div className="w-full sm:w-44 shrink-0 relative">
							<select
								value={typeFilter}
								onChange={(e) => setTypeFilter(e.target.value)}
								className="w-full pl-3 pr-10 py-2 border border-slate-200 rounded-[8px] text-[14px] text-slate-600 bg-white focus:outline-none focus:border-brand-primary font-medium hover:border-slate-300 transition-all cursor-pointer appearance-none"
							>
								<option value="">Loại sự cố</option>
								{incidentTypes.map(t => (
									<option key={t.id} value={t.id}>{t.name}</option>
								))}
							</select>
							<ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
						</div>

						<button
							onClick={() => setIsFilterOpen(true)}
							className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-[8px] text-[14px] font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm cursor-pointer whitespace-nowrap"
						>
							<Settings2 className="w-4 h-4" />
							Bộ lọc
						</button>
					</div>

					<div className="flex items-center gap-2 ml-auto">
						<button 
							onClick={handleExportExcel}
							className="flex items-center justify-center w-9 h-9 border border-slate-200 bg-white text-slate-600 rounded-[8px] hover:bg-slate-50 transition-colors cursor-pointer"
						>
							<FileSpreadsheet className="w-5 h-5" />
						</button>
						<button
							onClick={() => {
								setEditingIncident(null);
								setIsModalOpen(true);
							}}
							className="flex items-center gap-1.5 px-6 py-2 bg-brand-primary text-white rounded-[8px] text-[14px] font-bold transition-colors hover:bg-brand-dark shadow-sm cursor-pointer"
						>
							<Plus className="w-4 h-4" /> Tạo
						</button>
					</div>
				</div>
			</div>

			{/* Main Content Area */}
			<div className="flex-1 overflow-auto p-6 flex flex-col gap-6">
				{/* Table Area */}
				<div className="bg-white border border-slate-200 rounded-[8px] overflow-hidden shadow-sm h-full flex flex-col">
					<div className="overflow-x-auto flex-1">
						<table className="w-full text-left border-collapse">
							<thead className="bg-slate-50 border-b border-slate-100 sticky top-0 z-10">
								<tr>
									{ALL_COLUMNS.filter(col => visibleColumns.includes(col.id)).map((col) => (
										<th
											key={col.id}
											className={`px-4 py-3 text-[14px] font-bold text-[#1A1A1A] whitespace-nowrap ${col.id === 'actions' ? 'w-10 text-center' : ''}`}
										>
											{col.id === 'actions' ? (
												<div className="relative inline-block">
													<button 
														onClick={() => setIsColumnConfigOpen(!isColumnConfigOpen)}
														className="p-1 hover:bg-slate-200 rounded transition-colors cursor-pointer"
													>
														<Settings className="w-4 h-4 text-slate-400" />
													</button>
													
													<AnimatePresence>
														{isColumnConfigOpen && (
															<>
																<div className="fixed inset-0 z-[60]" onClick={() => setIsColumnConfigOpen(false)} />
																<motion.div
																	initial={{ opacity: 0, y: 10, scale: 0.95 }}
																	animate={{ opacity: 1, y: 0, scale: 1 }}
																	exit={{ opacity: 0, y: 10, scale: 0.95 }}
																	className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-2xl z-[70] p-4 text-left font-sans"
																>
																	<h3 className="text-[15px] font-bold text-slate-800 mb-4">Tuỳ chỉnh cột</h3>
																	<div className="space-y-3 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
																		{ALL_COLUMNS.map(column => (
																			<label key={column.id} className="flex items-center gap-3 cursor-pointer group">
																				<input 
																					type="checkbox" 
																					disabled={column.id === 'type' || column.id === 'actions'}
																					checked={visibleColumns.includes(column.id)}
																					onChange={() => {
																						setVisibleColumns(prev => 
																							prev.includes(column.id) 
																								? prev.filter(id => id !== column.id)
																								: [...prev, column.id]
																						);
																					}}
																					className="w-4.5 h-4.5 rounded border-slate-300 text-brand-primary focus:ring-brand-primary cursor-pointer disabled:opacity-30" 
																				/>
																				<span className={`text-[14px] font-medium transition-colors ${visibleColumns.includes(column.id) ? 'text-slate-900' : 'text-slate-400'} group-hover:text-slate-900`}>
																					{column.label}
																				</span>
																			</label>
																		))}
																	</div>
																</motion.div>
															</>
														)}
													</AnimatePresence>
												</div>
											) : col.label}
										</th>
									))}
								</tr>
							</thead>
							<tbody className="divide-y divide-[#F0F0F0]">
								{loading ? (
									<tr><td colSpan={visibleColumns.length} className="px-6 py-28 text-center text-slate-500">Đang tải dữ liệu...</td></tr>
								) : filteredData.length === 0 ?
									<tr>
										<td
											colSpan={visibleColumns.length}
											className="px-6 py-28 text-center bg-white"
										>
											<div className="flex flex-col items-center justify-center text-slate-400">
												<div className="w-20 h-20 mb-4 opacity-20">
													<svg viewBox="0 0 64 64" fill="currentColor">
														<path d="M32 2C15.432 2 2 15.432 2 32s13.432 30 30 30 30-13.432 30-30S48.568 2 32 2zm0 54c-13.255 0-24-10.745-24-24S18.745 8 32 8s24 10.745 24 24-10.745 24-24 24zm-4-34c0-2.209 1.791-4 4-4s4 1.791 4 4-1.791 4-4 4-4-1.791-4-4zm4 12c-6.627 0-12 5.373-12 12h24c0-6.627-5.373-12-12-12z" />
													</svg>
												</div>
												<p className="text-[14px] font-medium">Không có dữ liệu</p>
											</div>
										</td>
									</tr>
								:	filteredData.map((row: Incident) => (
										<tr
											key={row.id}
											className="hover:bg-[#FAFAFA] transition-colors group"
										>
											{visibleColumns.includes('type') && (
												<td className="px-4 py-3.5">
													<div className="flex items-center gap-3">
														{typeof row.type === 'object' && row.type?.icon && (
															<div className="w-8 h-8 rounded-lg overflow-hidden bg-slate-50 flex items-center justify-center border border-slate-200 shrink-0">
																{row.type.icon.includes('http') ? (
																	<img src={row.type.icon} className="w-full h-full object-cover" />
																) : (
																	<span className="text-lg">{row.type.icon}</span>
																)}
															</div>
														)}
														<span className="text-[14px] text-slate-700 font-bold">
															{typeof row.type === 'object' ? row.type?.name : row.type}
														</span>
													</div>
												</td>
											)}

											{visibleColumns.includes('priority') && (
												<td className="px-4 py-3.5">
													<div className="flex items-center gap-2">
														<Flag className={`w-4 h-4 ${
															row.priority === "emergency" || row.priority === "Khẩn cấp" ? "text-red-500 fill-red-500" :
															row.priority === "high" || row.priority === "Cao" ? "text-orange-500 fill-orange-500" :
															row.priority === "medium" || row.priority === "Trung bình" ? "text-blue-500 fill-blue-500" :
															"text-slate-400 fill-slate-400"
														}`} />
														<span className={`text-[13px] font-bold ${
															row.priority === "emergency" || row.priority === "Khẩn cấp" ? "text-red-500" :
															row.priority === "high" || row.priority === "Cao" ? "text-orange-500" :
															row.priority === "medium" || row.priority === "Trung bình" ? "text-blue-500" :
															"text-slate-700"
														}`}>
															{row.priority === "emergency" ? "Khẩn cấp" : 
															 row.priority === "high" ? "Cao" : 
															 row.priority === "medium" ? "Trung bình" : 
															 row.priority === "low" ? "Thấp" : row.priority}
														</span>
													</div>
												</td>
											)}

											{visibleColumns.includes('location') && (
												<td className="px-4 py-3.5">
													<span className="text-[14px] text-slate-700">
														{row.room?.room_number ? `P${row.room.room_number}` : row.location || "—"}
													</span>
												</td>
											)}

											{visibleColumns.includes('building') && (
												<td className="px-4 py-3.5">
													<span className="text-[14px] text-slate-600">
														{row.building?.name || "—"}
													</span>
												</td>
											)}

											{visibleColumns.includes('status') && (
												<td className="px-4 py-3.5">
													<div className="relative inline-block">
														<button
															onClick={(e) => {
																e.stopPropagation();
																setActiveMenu(activeMenu === `status-${row.id}` ? null : `status-${row.id}`);
															}}
															className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] text-[12px] font-bold border transition-all hover:opacity-80 cursor-pointer ${
																row.status === "Đã hoàn thành" || row.status === "completed" ?
																	"bg-[#F6FFED] text-[#52C41A] border-[#B7EB8F]"
																: row.status === "Cần thực hiện" || row.status === "pending" ?
																	"bg-[#F5F5F5] text-[#595959] border-[#D9D9D9]"
																: row.status === "Đã huỷ" || row.status === "cancelled" ?
																	"bg-[#FFF1F0] text-[#F5222D] border-[#FFA39E]"
																:	"bg-slate-50 text-slate-500 border-[#D9D9D9]"
															}`}
														>
															{row.status === "pending" ? "Cần thực hiện" : 
															 row.status === "completed" ? "Đã hoàn thành" :
															 row.status === "cancelled" ? "Đã huỷ" : row.status}
															<ChevronDown className="w-3 h-3 opacity-50" />
														</button>

														<AnimatePresence>
															{activeMenu === `status-${row.id}` && (
																<>
																	<div className="fixed inset-0 z-[60]" onClick={() => setActiveMenu(null)} />
																	<motion.div
																		initial={{ opacity: 0, scale: 0.95, y: -10 }}
																		animate={{ opacity: 1, scale: 1, y: 0 }}
																		exit={{ opacity: 0, scale: 0.95, y: -10 }}
																		className="absolute left-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-2xl z-[70] py-2 font-sans overflow-hidden"
																	>
																		{[
																			{ id: 'pending', label: 'Cần thực hiện', color: 'bg-[#F5F5F5] text-[#595959] border-[#D9D9D9]' },
																			{ id: 'completed', label: 'Đã hoàn thành', color: 'bg-[#F6FFED] text-[#52C41A] border-[#B7EB8F]' },
																			{ id: 'cancelled', label: 'Đã huỷ', color: 'bg-[#FFF1F0] text-[#F5222D] border-[#FFA39E]' }
																		].map(s => (
																			<button
																				key={s.id}
																				onClick={async () => {
																					await api.put(`/api/incidents/${row.id}`, { status: s.id });
																					fetchIncidents();
																					setActiveMenu(null);
																				}}
																				className="w-full px-4 py-2.5 text-left hover:bg-slate-50 flex items-center justify-between group transition-colors"
																			>
																				<span className={`inline-flex px-2 py-0.5 rounded-[4px] text-[12px] font-bold border ${s.color}`}>
																					{s.label}
																				</span>
																				{(row.status === s.id) && (
																					<div className="w-4 h-4 bg-slate-800 rounded-full flex items-center justify-center">
																						<div className="w-1.5 h-1.5 bg-white rounded-full" />
																					</div>
																				)}
																			</button>
																		))}
																	</motion.div>
																</>
															)}
														</AnimatePresence>
													</div>
												</td>
											)}

											{visibleColumns.includes('reportedBy') && (
												<td className="px-4 py-3.5">
													<span className="text-[14px] text-slate-600">
														{row.reportedBy || "Hệ thống"}
													</span>
												</td>
											)}

											{visibleColumns.includes('assignee') && (
												<td className="px-4 py-3.5">
													<span className="text-[14px] text-slate-600">
														{row.assignee || "—"}
													</span>
												</td>
											)}

											{visibleColumns.includes('dueDate') && (
												<td className="px-4 py-3.5">
													<span className="text-[14px] text-slate-600 text-red-500">
														{row.due_date ? new Date(row.due_date).toLocaleDateString('vi-VN') : "—"}
													</span>
												</td>
											)}

											{visibleColumns.includes('description') && (
												<td className="px-4 py-3.5 max-w-[200px]">
													<span className="text-[13px] text-slate-500 line-clamp-1">
														{row.description || "—"}
													</span>
												</td>
											)}

											{visibleColumns.includes('createdAt') && (
												<td className="px-4 py-3.5">
													<span className="text-[14px] text-slate-500">
														{row.created_at ? new Date(row.created_at).toLocaleDateString('vi-VN') : "—"}
													</span>
												</td>
											)}

											{visibleColumns.includes('actions') && (
												<td className="px-4 py-3.5 text-center relative">
													<button 
														onClick={(e) => {
															e.stopPropagation();
															setActiveMenu(activeMenu === row.id ? null : row.id);
														}}
														className="p-1 hover:bg-slate-100 rounded-[4px] text-slate-400 hover:text-slate-600 transition-all cursor-pointer"
													>
														<MoreHorizontal className="w-4 h-4" />
													</button>

													<AnimatePresence>
														{activeMenu === row.id && (
															<>
																<div className="fixed inset-0 z-40" onClick={() => setActiveMenu(null)} />
																<motion.div
																	initial={{ opacity: 0, scale: 0.95, y: -10 }}
																	animate={{ opacity: 1, scale: 1, y: 0 }}
																	exit={{ opacity: 0, scale: 0.95, y: -10 }}
																	className="absolute right-10 top-0 mt-2 w-48 bg-white border border-slate-200 rounded-lg shadow-xl z-50 py-1 font-sans text-left overflow-hidden"
																>
																	<button className="w-full px-4 py-2.5 text-[13px] font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors">
																		<Eye className="w-4 h-4 text-slate-400" /> Xem chi tiết
																	</button>
																	<button 
																		onClick={() => {
																			setEditingIncident(row);
																			setIsModalOpen(true);
																			setActiveMenu(null);
																		}}
																		className="w-full px-4 py-2.5 text-[13px] font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors"
																	>
																		<Edit2 className="w-4 h-4 text-slate-400" /> Chỉnh sửa
																	</button>
																	<div className="border-t border-slate-100 my-1" />
																	<button 
																		onClick={async () => {
																			if (confirm("Bạn có chắc chắn muốn xóa sự cố này?")) {
																				await api.delete(`/api/incidents/${row.id}`);
																				fetchIncidents();
																				setActiveMenu(null);
																			}
																		}}
																		className="w-full px-4 py-2.5 text-[13px] font-medium text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
																	>
																		<Trash2 className="w-4 h-4" /> Xóa sự cố
																	</button>
																</motion.div>
															</>
														)}
													</AnimatePresence>
												</td>
											)}
										</tr>
									))
								}
							</tbody>
						</table>
					</div>

					{/* Pagination Footer */}
					<div className="mt-auto px-5 py-3 border-t border-slate-100 bg-white flex items-center justify-end gap-4 text-[13px] text-slate-600 shadow-[0_-2px_8px_rgba(0,0,0,0.02)]">
						<span className="text-[13px]">1-1/1</span>
						<div className="flex items-center gap-1">
							<button disabled className="p-1 hover:bg-slate-100 rounded disabled:opacity-30 text-slate-400 transition-colors cursor-pointer">
								<ChevronLeft className="w-4 h-4" />
							</button>
							<button disabled className="p-1 hover:bg-slate-100 rounded disabled:opacity-30 text-slate-400 transition-colors cursor-pointer">
								<ChevronRight className="w-4 h-4" />
							</button>
						</div>
						<div className="relative">
							<select className="pl-3 pr-8 py-1.5 outline-none border border-slate-200 rounded-[8px] cursor-pointer text-slate-600 bg-white hover:border-slate-300 appearance-none font-medium text-[13px]">
								<option>20 / trang</option>
								<option>50 / trang</option>
							</select>
							<ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
						</div>
					</div>
				</div>
			</div>

			{/* Filter Sidebar */}
			<AnimatePresence>
				{isFilterOpen && (
					<>
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							onClick={() => setIsFilterOpen(false)}
							className="fixed inset-0 bg-black/45 z-[2000] transition-opacity"
						/>
						<motion.div
							initial={{ x: "100%" }}
							animate={{ x: 0 }}
							exit={{ x: "100%" }}
							transition={{ type: "tween", duration: 0.3 }}
							className="fixed top-0 right-0 w-[420px] h-full bg-white shadow-2xl z-[2001] flex flex-col font-sans"
						>
							<div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
								<h2 className="text-[16px] font-bold text-[#1A1A1A]">Bộ lọc nâng cao</h2>
								<button
									onClick={() => setIsFilterOpen(false)}
									className="p-1.5 hover:bg-slate-100 rounded-[4px] text-slate-500 transition-colors cursor-pointer"
								>
									<X className="w-5 h-5" />
								</button>
							</div>

							<div className="flex-1 overflow-y-auto p-6 space-y-8">
								{/* 1. Toà nhà */}
								<div className="space-y-4">
									<label className="text-[14px] font-bold text-[#1A1A1A]">Toà nhà</label>
									<div className="relative">
										<select 
											className="w-full px-3 py-2 border border-slate-200 rounded-[8px] text-[14px] font-medium text-slate-700 focus:outline-none focus:border-brand-primary hover:border-slate-300 transition-all appearance-none bg-white cursor-pointer"
										>
											<option value="">Chọn toà nhà</option>
											{buildings.map(b => (
												<option key={b.id} value={b.id}>{b.name}</option>
											))}
										</select>
										<ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
									</div>
								</div>

								{/* 2. Loại sự cố */}
								<div className="space-y-4">
									<label className="text-[14px] font-bold text-[#1A1A1A]">Loại sự cố</label>
									<div className="relative">
										<select 
											value={typeFilter}
											onChange={(e) => setTypeFilter(e.target.value)}
											className="w-full px-3 py-2 border border-slate-200 rounded-[8px] text-[14px] font-medium text-slate-700 focus:outline-none focus:border-brand-primary hover:border-slate-300 transition-all appearance-none bg-white cursor-pointer"
										>
											<option value="">Chọn loại sự cố</option>
											{incidentTypes.map(t => (
												<option key={t.id} value={t.id}>{t.name}</option>
											))}
										</select>
										<ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
									</div>
								</div>

								{/* 3. Trạng thái */}
								<div className="space-y-4">
									<label className="text-[14px] font-bold text-[#1A1A1A]">Trạng thái</label>
									<div className="grid grid-cols-2 gap-x-4 gap-y-3">
										{["pending", "completed", "cancelled"].map((status) => (
											<label key={status} className="flex items-center gap-3 cursor-pointer group">
												<input 
													type="checkbox" 
													checked={filterStatus.includes(status)}
													onChange={() => {
														setFilterStatus(prev => 
															prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]
														);
													}}
													className="w-4.5 h-4.5 rounded border-slate-300 text-brand-primary focus:ring-brand-primary cursor-pointer" 
												/>
												<span className="text-[14px] font-medium text-slate-600 group-hover:text-slate-900 transition-colors">
													{status === 'pending' ? 'Cần thực hiện' : status === 'completed' ? 'Đã hoàn thành' : 'Đã huỷ'}
												</span>
											</label>
										))}
									</div>
								</div>

								{/* 4. Người đảm nhận */}
								<div className="space-y-4">
									<label className="text-[14px] font-bold text-[#1A1A1A]">Người đảm nhận</label>
									<div className="grid grid-cols-2 gap-3">
										{staff.map((s) => (
											<label key={s.id} className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-100 hover:border-brand-primary/30 hover:bg-brand-primary/[0.02] cursor-pointer transition-all group">
												<div className="relative flex items-center justify-center">
													<input type="checkbox" className="w-4.5 h-4.5 rounded border-slate-300 text-brand-primary focus:ring-brand-primary cursor-pointer" />
												</div>
												<div className="flex flex-col">
													<span className="text-[13px] font-bold text-slate-700 group-hover:text-brand-primary transition-colors">{s.full_name}</span>
													<span className="text-[11px] text-slate-400 uppercase tracking-wider font-medium">{s.role}</span>
												</div>
											</label>
										))}
									</div>
								</div>

								{/* 5. Ngày tạo */}
								<div className="space-y-4 text-slate-400">
									<label className="text-[14px] font-bold text-[#1A1A1A]">Ngày tạo</label>
									<div className="flex items-center border border-slate-200 rounded-[8px] px-3 py-2 bg-white transition-all hover:border-slate-300 group">
										<input 
											type="text" 
											placeholder="Từ ngày" 
											className="w-24 bg-transparent outline-none text-[14px] placeholder-slate-300 text-slate-700" 
										/>
										<span className="mx-2 flex-1 flex justify-center text-slate-300">
											<ChevronRight className="w-4 h-4" />
										</span>
										<input 
											type="text" 
											placeholder="Đến ngày" 
											className="w-24 bg-transparent outline-none text-[14px] text-right placeholder-slate-300 text-slate-700" 
										/>
										<Calendar className="w-4 h-4 ml-2 text-slate-300 group-hover:text-slate-400 transition-colors cursor-pointer" />
									</div>
								</div>
							</div>

							<div className="p-6 border-t border-slate-100 bg-white grid grid-cols-2 gap-3 shrink-0">
								<button
									onClick={() => {
										setFilterStatus([]);
										setFilterPriority([]);
										setIsFilterOpen(false);
									}}
									className="px-6 py-2 text-[14px] font-bold text-slate-600 bg-white border border-slate-200 rounded-[8px] hover:bg-slate-50 transition-colors shadow-sm cursor-pointer"
								>
									Đặt lại
								</button>
								<button
									onClick={() => setIsFilterOpen(false)}
									className="px-6 py-2 text-[14px] font-bold bg-brand-primary hover:bg-brand-dark text-white rounded-[8px] transition-colors shadow-sm cursor-pointer"
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
				onClose={() => {
					setIsModalOpen(false);
					setEditingIncident(null);
				}}
				title={editingIncident ? "Chỉnh sửa sự cố" : "Tạo sự cố"}
				size="lg"
			>
				<IncidentForm
					onSubmit={handleCreateOrUpdateIncident}
					onCancel={() => {
						setIsModalOpen(false);
						setEditingIncident(null);
					}}
					initialData={editingIncident}
				/>
			</Modal>
		</div>
	);
}

import { useState, useEffect, useCallback, useRef } from "react";
import { 
	Plus, 
	Search, 
	Settings, 
	MoreHorizontal, 
	Trash2, 
	Edit2, 
	X, 
	ChevronDown, 
	ChevronLeft, 
	ChevronRight,
	Upload,
	Power
} from "lucide-react";
import { api } from "../lib/api";
import { useBuilding } from "../contexts/BuildingContext";
import { motion, AnimatePresence } from "framer-motion";

interface IncidentType {
	id: string;
	name: string;
	name_en?: string;
	description?: string;
	icon: string;
	default_assignee: string | null;
	status: "active" | "inactive";
	created_at: string;
}

export default function IncidentTypesPage() {
	const { selectedBuildingId } = useBuilding();
	const [search, setSearch] = useState("");
	const [statusFilter, setStatusFilter] = useState("");
	const [types, setTypes] = useState<IncidentType[]>([]);
	const [loading, setLoading] = useState(true);
	
	const [isDrawerOpen, setIsDrawerOpen] = useState(false);
	const [editingType, setEditingType] = useState<IncidentType | null>(null);
	const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

	// Form states
	const [name, setName] = useState("");
	const [nameEn, setNameEn] = useState("");
	const [description, setDescription] = useState("");
	const [icon, setIcon] = useState("🛠️");
	const [defaultAssignee, setDefaultAssignee] = useState("");
	const [uploading, setUploading] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		setUploading(true);
		const uploadData = new FormData();
		uploadData.append("file", file);

		try {
			const res = await api.upload<{ url: string }>("/api/incidents/upload", uploadData);
			if (res.data?.url) {
				setIcon(res.data.url);
			}
		} catch (err) {
			console.error("Icon upload failed:", err);
			alert("Tải lên biểu tượng thất bại");
		} finally {
			setUploading(false);
		}
	};

	const fetchTypes = useCallback(async () => {
		setLoading(true);
		const { data, error } = await api.get<IncidentType[]>(`/api/incident-types?building_id=${selectedBuildingId || ""}`);
		if (data) setTypes(data);
		if (error) console.error(error);
		setLoading(false);
	}, [selectedBuildingId]);

	useEffect(() => {
		fetchTypes();
	}, [fetchTypes]);

	const handleSave = async (e: React.FormEvent) => {
		e.preventDefault();
		// Removed mandatory building check to allow global types

		const payload = { 
			building_id: selectedBuildingId || null, 
			name, 
			name_en: nameEn,
			description,
			icon, 
			default_assignee: defaultAssignee 
		};
		
		let res;
		if (editingType) {
			res = await api.put(`/api/incident-types/${editingType.id}`, payload);
		} else {
			res = await api.post("/api/incident-types", payload);
		}

		if (res.error) {
			alert(res.error);
		} else {
			handleCloseDrawer();
			fetchTypes();
		}
	};

	const handleDelete = async (id: string) => {
		if (!confirm("Bạn có chắc chắn xoá loại sự cố này?")) return;
		const { error } = await api.delete(`/api/incident-types/${id}`);
		if (error) alert("Không thể xoá. Có thể đã phát sinh sự cố thuộc loại này.");
		else fetchTypes();
		setOpenDropdownId(null);
	};

	const handleToggleStatus = async (type: IncidentType) => {
		const newStatus = type.status === "active" ? "inactive" : "active";
		await api.put(`/api/incident-types/${type.id}`, { status: newStatus });
		fetchTypes();
		setOpenDropdownId(null);
	};

	const openDrawer = (t?: IncidentType) => {
		if (t) {
			setEditingType(t);
			setName(t.name);
			setNameEn(t.name_en || "");
			setDescription(t.description || "");
			setIcon(t.icon || "🛠️");
			setDefaultAssignee(t.default_assignee || "");
		} else {
			setEditingType(null);
			setName("");
			setNameEn("");
			setDescription("");
			setIcon("🛠️");
			setDefaultAssignee("");
		}
		setIsDrawerOpen(true);
		setOpenDropdownId(null);
	};

	const handleCloseDrawer = () => {
		setIsDrawerOpen(false);
		setEditingType(null);
	};

	const filteredData = types.filter(t => {
		const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase());
		const matchesStatus = statusFilter === "" || t.status === statusFilter;
		return matchesSearch && matchesStatus;
	});

	return (
		<div className="flex-1 flex flex-col h-full bg-[#F0F2F5] relative overflow-hidden font-sans">
			{/* Page Header */}
			<div className="bg-white border-b border-slate-200">
				<div className="px-6 py-4 flex items-center justify-between">
					<h1 className="text-[20px] font-bold text-[#1A1A1A] tracking-tight">Loại sự cố</h1>
				</div>

				{/* Toolbar */}
				<div className="px-6 pb-4 flex flex-col sm:flex-row items-center gap-3">
					<div className="relative w-full sm:w-[400px] shrink-0">
						<Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
						<input
							type="text"
							placeholder="Tìm kiếm loại sự cố..."
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-[8px] text-[14px] text-slate-700 bg-white focus:outline-none focus:border-brand-primary transition-all hover:border-slate-300 shadow-sm"
						/>
					</div>

					<div className="w-full sm:w-48 shrink-0 relative">
						<select
							value={statusFilter}
							onChange={(e) => setStatusFilter(e.target.value)}
							className="w-full pl-3 pr-10 py-2 border border-slate-200 rounded-[8px] text-[14px] text-slate-600 bg-white focus:outline-none focus:border-brand-primary hover:border-slate-300 transition-all cursor-pointer appearance-none"
						>
							<option value="">Trạng thái</option>
							<option value="active">Đang hoạt động</option>
							<option value="inactive">Dừng hoạt động</option>
						</select>
						<ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
					</div>

					<div className="ml-auto">
						<button 
							onClick={() => openDrawer()} 
							className="flex items-center gap-1.5 px-6 py-2 bg-brand-primary text-white rounded-[8px] text-[14px] font-bold transition-colors hover:bg-brand-dark shadow-sm cursor-pointer whitespace-nowrap"
						>
							<Plus className="w-4 h-4" /> Tạo
						</button>
					</div>
				</div>
			</div>

			{/* Main Content Area */}
			<div className="flex-1 overflow-auto p-6 flex flex-col gap-6">
				<div className="bg-white border border-slate-200 rounded-[8px] overflow-hidden shadow-sm flex flex-col h-full min-h-[400px]">
					<div className="overflow-x-auto flex-1">
						<table className="w-full text-left border-collapse">
							<thead className="bg-slate-50 border-b border-slate-100 sticky top-0 z-10 font-bold text-[14px] text-[#1A1A1A]">
								<tr>
									<th className="px-6 py-4 w-1/4 text-center">Biểu tượng</th>
									<th className="px-6 py-4 w-1/4 uppercase tracking-wider text-[12px]">Tên</th>
									<th className="px-6 py-4 w-1/4 uppercase tracking-wider text-[12px]">Người đảm nhận</th>
									<th className="px-6 py-4 w-1/4 uppercase tracking-wider text-[12px]">Trạng thái</th>
									<th className="px-6 py-4 w-10 text-center">
										<Settings className="w-4 h-4 text-slate-400 inline-block" />
									</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-[#F0F0F0] text-[14px]">
								{loading ? (
									<tr><td colSpan={5} className="px-6 py-28 text-center text-slate-400 font-medium">Đang tải dữ liệu...</td></tr>
								) : filteredData.length === 0 ? (
									<tr><td colSpan={5} className="px-6 py-28 text-center text-slate-400 font-medium">Không tìm thấy loại sự cố nào</td></tr>
								) : filteredData.map((row) => (
									<tr key={row.id} className="hover:bg-[#FAFAFA] transition-colors group">
										<td className="px-4 py-4 text-center">
											<div className="w-9 h-9 rounded-[8px] bg-slate-100 mx-auto flex items-center justify-center text-xl shadow-sm border border-slate-200">
                                                {row.icon && row.icon.includes('http') ? (
                                                    <img src={row.icon} className="w-full h-full object-contain p-1" />
                                                ) : (
                                                    row.icon || "🛠️"
                                                )}
											</div>
										</td>
										<td className="px-4 py-4 font-bold text-[#1A1A1A]">{row.name}</td>
										<td className="px-4 py-4 text-slate-600">
											{row.default_assignee ? (
												<div className="flex items-center gap-2">
													<div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500">
														{row.default_assignee[0].toUpperCase()}
													</div>
													<span>{row.default_assignee}</span>
												</div>
											) : (
												<span className="text-slate-400">—</span>
											)}
										</td>
										<td className="px-4 py-4">
											<span className={`inline-flex px-2 py-0.5 rounded-[4px] text-[12px] font-medium border ${
												row.status === "active" ? 
													"bg-emerald-50 text-emerald-600 border-emerald-100" : 
													"bg-rose-50 text-rose-600 border-rose-100"
											}`}>
												{row.status === "active" ? "Đang hoạt động" : "Dừng hoạt động"}
											</span>
										</td>
										<td className="px-4 py-4 text-center relative overflow-visible">
											<button 
												onClick={() => setOpenDropdownId(openDropdownId === row.id ? null : row.id)}
												className="p-1 hover:bg-slate-100 rounded-[4px] text-slate-400 hover:text-slate-600 transition-all cursor-pointer"
											>
												<MoreHorizontal className="w-5 h-5" />
											</button>

											<AnimatePresence>
												{openDropdownId === row.id && (
													<motion.div 
														initial={{ opacity: 0, scale: 0.95, y: -5 }}
														animate={{ opacity: 1, scale: 1, y: 0 }}
														exit={{ opacity: 0, scale: 0.95, y: -5 }}
														className="absolute right-10 top-1/2 -translate-y-1/2 w-48 bg-white rounded-[8px] shadow-xl border border-slate-100 py-1.5 z-[100] text-left"
													>
														<button 
															onClick={() => openDrawer(row)} 
															className="w-full px-4 py-2 text-[14px] font-medium text-slate-700 hover:bg-slate-50 hover:text-brand-primary flex items-center gap-2 cursor-pointer transition-colors"
														>
															<Edit2 className="w-4 h-4" /> Chỉnh sửa
														</button>
														<button 
															onClick={() => handleToggleStatus(row)} 
															className="w-full px-4 py-2 text-[14px] font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer transition-colors"
														>
															<Power className="w-4 h-4" /> 
															{row.status === 'active' ? 'Dừng hoạt động' : 'Kích hoạt lại'}
														</button>
														<div className="border-t border-slate-100 my-1"></div>
														<button 
															onClick={() => handleDelete(row.id)} 
															className="w-full px-4 py-2 text-[14px] font-medium text-red-500 hover:bg-red-50 flex items-center gap-2 cursor-pointer transition-colors"
														>
															<Trash2 className="w-4 h-4" /> Xóa
														</button>
													</motion.div>
												)}
											</AnimatePresence>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>

					{/* Pagination Footer */}
					<div className="mt-auto px-5 py-3 border-t border-slate-100 bg-white flex items-center justify-end gap-4 text-[14px] text-slate-600">
						<span className="text-[14px]">
							{filteredData.length === 0 ? "0-0/0" : `1-${filteredData.length}/${filteredData.length}`}
						</span>
						<div className="flex items-center gap-1">
							<button disabled className="p-1 hover:bg-slate-100 rounded disabled:opacity-30 text-slate-400 transition-colors cursor-pointer">
								<ChevronLeft className="w-4 h-4" />
							</button>
							<button disabled className="p-1 hover:bg-slate-100 rounded disabled:opacity-30 text-slate-400 transition-colors cursor-pointer">
								<ChevronRight className="w-4 h-4" />
							</button>
						</div>
						<div className="relative">
							<select className="pl-3 pr-8 py-1.5 outline-none border border-slate-200 rounded-[8px] cursor-pointer text-slate-600 bg-white hover:border-slate-300 appearance-none font-medium text-[14px]">
								<option>20 / trang</option>
								<option>50 / trang</option>
							</select>
							<ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
						</div>
					</div>
				</div>
			</div>

			{/* Create/Edit Drawer */}
			<AnimatePresence>
				{isDrawerOpen && (
					<>
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							onClick={handleCloseDrawer}
							className="fixed inset-0 bg-black/45 z-[2000] transition-opacity"
						/>
						<motion.div
							initial={{ x: "100%" }}
							animate={{ x: 0 }}
							exit={{ x: "100%" }}
							transition={{ type: "tween", duration: 0.3 }}
							className="fixed top-0 right-0 w-[500px] h-full bg-white shadow-2xl z-[2001] flex flex-col"
						>
							<div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
								<h2 className="text-[16px] font-bold text-[#1A1A1A]">
									{editingType ? "Chỉnh sửa loại sự cố" : "Tạo loại sự cố"}
								</h2>
								<button
									onClick={handleCloseDrawer}
									className="p-1.5 hover:bg-slate-100 rounded-[4px] text-slate-500 transition-colors cursor-pointer"
								>
									<X className="w-5 h-5" />
								</button>
							</div>

							<form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-6">
								{/* Icon Upload Real */}
								<div className="space-y-2">
									<label className="block text-[14px] font-bold text-[#1A1A1A]">Biểu tượng</label>
									<div 
										onClick={() => fileInputRef.current?.click()}
										className="text-center py-6 bg-[#F8FAFC] border border-dashed border-slate-200 rounded-[8px] group cursor-pointer hover:bg-slate-50 hover:border-brand-primary/50 transition-all relative overflow-hidden"
									>
										<div className="w-16 h-16 rounded-[12px] bg-white border border-slate-200 mx-auto flex items-center justify-center shadow-sm mb-3 group-hover:scale-105 transition-transform overflow-hidden relative">
											{icon && icon !== "🛠️" ? (
												<img src={icon} alt="Icon" className="w-full h-full object-contain p-3" />
											) : (
												<span className="text-3xl">🛠️</span>
											)}
											{uploading && (
												<div className="absolute inset-0 bg-white/80 flex items-center justify-center">
													<div className="w-5 h-5 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
												</div>
											)}
										</div>
										<div className="flex flex-col items-center">
											<Upload className="w-5 h-5 text-brand-primary mb-1.5" />
											<p className="text-[14px] font-bold text-brand-ink">
												{icon !== "🛠️" ? "Thay đổi biểu tượng" : "Thêm biểu tượng"}
											</p>
											<p className="text-[12px] text-slate-500 mt-1">Ảnh (Tối đa 5MB)</p>
										</div>
									</div>
									<input 
										type="file" 
										ref={fileInputRef} 
										className="hidden" 
										accept="image/*"
										onChange={handleUpload} 
									/>
								</div>

								{/* Tên */}
								<div>
									<label className="block text-[14px] font-bold text-[#1A1A1A] mb-1.5">
										Tên <span className="text-red-500">*</span>
									</label>
									<input 
										required 
										type="text" 
										value={name} 
										onChange={e => setName(e.target.value)} 
										placeholder="Nhập tên" 
										className="w-full px-3 py-2 border border-slate-200 rounded-[8px] text-[14px] font-medium text-slate-900 focus:outline-none focus:border-brand-primary hover:border-slate-300 transition-all placeholder-slate-300" 
									/>
								</div>

								{/* Tên tiếng Anh */}
								<div>
									<label className="block text-[14px] font-bold text-[#1A1A1A] mb-1.5">
										Tên tiếng Anh
									</label>
									<input 
										type="text" 
										value={nameEn} 
										onChange={e => setNameEn(e.target.value)} 
										placeholder="Nhập tên tiếng Anh" 
										className="w-full px-3 py-2 border border-slate-200 rounded-[8px] text-[14px] font-medium text-slate-900 focus:outline-none focus:border-brand-primary hover:border-slate-300 transition-all placeholder-slate-300" 
									/>
								</div>

								{/* Mô tả */}
								<div>
									<label className="block text-[14px] font-bold text-[#1A1A1A] mb-1.5">
										Mô tả
									</label>
									<textarea 
										value={description} 
										onChange={e => setDescription(e.target.value)} 
										placeholder="Mô tả" 
										className="w-full h-24 px-3 py-2 border border-slate-200 rounded-[8px] text-[14px] font-medium text-slate-900 focus:outline-none focus:border-brand-primary hover:border-slate-300 transition-all resize-none placeholder-slate-300" 
									/>
								</div>

								{/* Assignee */}
								<div>
									<label className="block text-[14px] font-bold text-[#1A1A1A] mb-1.5">
										Người đảm nhận mặc định
									</label>
									<button
										type="button"
										className="w-full flex items-center justify-between px-3 py-2 bg-white border border-slate-200 rounded-[8px] text-[14px] hover:border-slate-300 transition-all group"
									>
										<span className="font-medium text-slate-400">Thêm người đảm nhận</span>
										<div className="w-5 h-5 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 group-hover:bg-brand-primary group-hover:text-white transition-all">
											<Plus className="w-3.5 h-3.5" />
										</div>
									</button>
								</div>
							</form>

							{/* Drawer Footer */}
							<div className="p-6 border-t border-slate-100 bg-white grid grid-cols-2 gap-3 shrink-0">
								<button
									type="button"
									onClick={handleCloseDrawer}
									className="px-6 py-2.5 text-[14px] font-bold text-slate-600 bg-white border border-slate-200 rounded-[8px] hover:bg-slate-50 transition-colors shadow-sm cursor-pointer"
								>
									Hủy
								</button>
								<button
									type="submit"
									onClick={handleSave}
									className="px-6 py-2.5 text-[14px] font-bold bg-brand-primary hover:bg-brand-dark text-white rounded-[8px] transition-colors shadow-sm cursor-pointer"
								>
									{editingType ? 'Lưu' : 'Tạo'}
								</button>
							</div>
						</motion.div>
					</>
				)}
			</AnimatePresence>
		</div>
	);
}

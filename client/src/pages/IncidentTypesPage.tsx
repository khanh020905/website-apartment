import { useState, useEffect, useCallback } from "react";
import { Plus, Search, Settings, MoreHorizontal, FileText, Trash2, Edit2 } from "lucide-react";
import { api } from "../lib/api";
import { useBuilding } from "../contexts/BuildingContext";
import Modal from "../components/modals/Modal";

interface IncidentType {
	id: string;
	name: string;
	icon: string;
	default_assignee: string | null;
	status: "active" | "inactive";
	created_at: string;
}

export default function IncidentTypesPage() {
	const { selectedBuildingId } = useBuilding();
	const [search, setSearch] = useState("");
	const [types, setTypes] = useState<IncidentType[]>([]);
	const [loading, setLoading] = useState(true);
	
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [editingType, setEditingType] = useState<IncidentType | null>(null);
	const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

	// Form states
	const [name, setName] = useState("");
	const [icon, setIcon] = useState("🛠️");
	const [defaultAssignee, setDefaultAssignee] = useState("");

	const fetchTypes = useCallback(async () => {
		if (!selectedBuildingId) return;
		setLoading(true);
		const { data, error } = await api.get<IncidentType[]>(`/api/incident-types?building_id=${selectedBuildingId}`);
		if (data) setTypes(data);
		if (error) console.error(error);
		setLoading(false);
	}, [selectedBuildingId]);

	useEffect(() => {
		fetchTypes();
	}, [fetchTypes]);

	const handleSave = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!selectedBuildingId) return;

		const payload = { building_id: selectedBuildingId, name, icon, default_assignee: defaultAssignee };
		
		let res;
		if (editingType) {
			res = await api.put(`/api/incident-types/${editingType.id}`, payload);
		} else {
			res = await api.post("/api/incident-types", payload);
		}

		if (res.error) {
			alert(res.error);
		} else {
			handleCloseModal();
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

	const openModal = (t?: IncidentType) => {
		if (t) {
			setEditingType(t);
			setName(t.name);
			setIcon(t.icon || "🛠️");
			setDefaultAssignee(t.default_assignee || "");
		} else {
			setEditingType(null);
			setName("");
			setIcon("🛠️");
			setDefaultAssignee("");
		}
		setIsModalOpen(true);
		setOpenDropdownId(null);
	};

	const handleCloseModal = () => {
		setIsModalOpen(false);
		setEditingType(null);
	};

	const filteredData = types.filter(t => 
		t.name.toLowerCase().includes(search.toLowerCase())
	);

	return (
		<div className="flex-1 flex flex-col h-full bg-[#f8f9fa] relative overflow-hidden font-['Plus_Jakarta_Sans',sans-serif]">
			<div className="bg-white border-b border-slate-200">
				<div className="px-6 py-4 flex items-center justify-between">
					<h1 className="text-[20px] font-bold text-slate-900 tracking-tight">Cấu hình loại sự cố</h1>
					<button onClick={() => openModal()} className="flex items-center gap-1.5 px-4 py-2 bg-brand-primary text-white rounded-lg text-[13px] font-bold transition-colors hover:bg-brand-dark shadow-sm cursor-pointer">
						<Plus className="w-4 h-4 font-bold" /> Thêm danh mục
					</button>
				</div>

				<div className="px-6 pb-4 flex flex-col sm:flex-row items-center gap-3">
					<div className="relative w-full sm:w-[360px] shrink-0">
						<Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
						<input
							type="text"
							placeholder="Tìm kiếm loại sự cố..."
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-[13px] font-bold text-slate-700 bg-white focus:outline-none focus:border-brand-primary transition-all shadow-sm"
						/>
					</div>
				</div>
			</div>

			<div className="flex-1 overflow-auto bg-[#f8f9fa] p-5 lg:p-6 flex flex-col gap-6">
				<div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col h-full min-h-[400px]">
					<div className="overflow-x-auto flex-1">
						<table className="w-full text-left">
							<thead className="bg-[#EDEDED] border-b border-slate-200 sticky top-0 z-10 font-bold uppercase tracking-widest text-[10px] text-slate-500">
								<tr>
									<th className="px-5 py-4 w-12 text-center"><FileText className="w-4 h-4 mx-auto"/></th>
									<th className="px-5 py-4">Tên loại sự cố</th>
									<th className="px-5 py-4">Icon hiển thị</th>
									<th className="px-5 py-4">Người chịu trách nhiệm mặc định</th>
									<th className="px-5 py-4">Trạng thái</th>
									<th className="px-5 py-4 w-10 text-center"><Settings className="w-4 h-4 mx-auto" /></th>
								</tr>
							</thead>
							<tbody className="divide-y divide-slate-100 font-medium text-[13px]">
								{loading ? (
									<tr><td colSpan={6} className="px-6 py-28 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">Đang tải biểu mẫu...</td></tr>
								) : filteredData.length === 0 ? (
									<tr><td colSpan={6} className="px-6 py-28 text-center text-slate-400 font-bold">Chưa có loại sự cố nào</td></tr>
								) : filteredData.map((row) => (
									<tr key={row.id} className="hover:bg-slate-50 transition-colors group">
										<td className="px-5 py-4 text-center">
											<div className="w-8 h-8 rounded-lg bg-brand-bg mx-auto flex items-center justify-center text-lg shadow-sm">
												{row.icon || "🛠️"}
											</div>
										</td>
										<td className="px-5 py-4 font-bold text-slate-900">{row.name}</td>
										<td className="px-5 py-4 text-slate-500 font-mono text-xs">{row.icon || "N/A"}</td>
										<td className="px-5 py-4 text-slate-600">
											{row.default_assignee ? (
												<div className="flex items-center gap-2">
													<div className="w-5 h-5 rounded-full bg-slate-200" />
													<span>{row.default_assignee}</span>
												</div>
											) : (
												<span className="text-slate-400 italic">Không chỉ định</span>
											)}
										</td>
										<td className="px-5 py-4">
											<span className={`px-2 py-1 rounded text-[10px] uppercase font-bold tracking-widest ${
												row.status === "active" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-slate-50 text-slate-500 border border-slate-200"
											}`}>
												{row.status === "active" ? "Kích hoạt" : "Vô hiệu"}
											</span>
										</td>
										<td className="px-5 py-4 text-center relative">
											<button 
												onClick={() => setOpenDropdownId(openDropdownId === row.id ? null : row.id)}
												className="p-1 hover:bg-slate-200 rounded-lg text-slate-500 transition-all cursor-pointer"
											>
												<MoreHorizontal className="w-5 h-5" />
											</button>

											{openDropdownId === row.id && (
												<div className="absolute right-10 top-10 w-44 bg-white rounded-lg shadow-xl border border-slate-100 py-1.5 z-50 text-left">
													<button onClick={() => openModal(row)} className="w-full px-4 py-2 text-[13px] font-bold text-slate-700 hover:bg-slate-50 hover:text-brand-dark flex items-center gap-2 cursor-pointer transition-colors">
														<Edit2 className="w-4 h-4" /> Chỉnh sửa
													</button>
													<button onClick={() => handleToggleStatus(row)} className="w-full px-4 py-2 text-[13px] font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer transition-colors">
														<Settings className="w-4 h-4" /> 
														{row.status === 'active' ? 'Vô hiệu hóa' : 'Kích hoạt lại'}
													</button>
													<div className="border-t border-slate-100 my-1"></div>
													<button onClick={() => handleDelete(row.id)} className="w-full px-4 py-2 text-[13px] font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer transition-colors">
														<Trash2 className="w-4 h-4" /> Xóa danh mục
													</button>
												</div>
											)}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			</div>

			<Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingType ? "Sửa loại sự cố" : "Tạo loại sự cố mới"} size="md">
				<form onSubmit={handleSave} className="p-6 space-y-5">
					<div>
						<label className="block text-[13px] font-bold text-slate-700 mb-1.5">Tên danh mục sự cố <span className="text-rose-500">*</span></label>
						<input required type="text" value={name} onChange={e => setName(e.target.value)} placeholder="VD: Điện nổi, Điện lạnh, Rò rỉ nước..." className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-900 font-medium focus:outline-none focus:border-brand-primary shadow-sm" />
					</div>
					<div>
						<label className="block text-[13px] font-bold text-slate-700 mb-1.5">Biểu tượng (Icon)</label>
						<input type="text" value={icon} onChange={e => setIcon(e.target.value)} placeholder="Emoji (vd: ⚡, 💧, 🔑)" className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-900 font-medium focus:outline-none focus:border-brand-primary shadow-sm" />
					</div>
					<div>
						<label className="block text-[13px] font-bold text-slate-700 mb-1.5">Tên người chịu trách nhiệm mặc định</label>
						<input type="text" value={defaultAssignee} onChange={e => setDefaultAssignee(e.target.value)} placeholder="Nhập tên nhân sự..." className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-900 font-medium focus:outline-none focus:border-brand-primary shadow-sm" />
						<p className="mt-1.5 text-[11px] text-slate-400 italic">Nếu để trống, sự cố tạo mới sẽ cần phân công tay.</p>
					</div>

					<div className="flex justify-end gap-3 mt-8 pt-5 border-t border-slate-100">
						<button type="button" onClick={handleCloseModal} className="px-5 py-2 text-[13px] font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer">
							Hủy bỏ
						</button>
						<button type="submit" className="px-6 py-2 text-[13px] font-bold bg-brand-primary text-white hover:bg-brand-dark rounded-lg shadow-sm transition-all cursor-pointer hover:scale-105 active:scale-95">
							{editingType ? 'Lưu cập nhật' : 'Tạo mới'}
						</button>
					</div>
				</form>
			</Modal>
		</div>
	);
}

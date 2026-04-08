import { useState, useEffect } from "react";
import {
	Search,
	ChevronLeft,
	ChevronRight,
	Settings,
	MoreHorizontal,
	Download,
	Edit2,
	Trash2,
	FileText
} from "lucide-react";
import Modal from "../components/modals/Modal";
import ContractTemplateForm from "../components/modals/ContractTemplateForm";
import { api } from "../lib/api";

interface ContractTemplate {
	id: string;
	name: string;
	short_name: string;
	prefix_code: string;
	reminder_days: number;
	file_name: string | null;
	status: "active" | "inactive";
}

export default function ContractTemplatesPage() {
	const [templates, setTemplates] = useState<ContractTemplate[]>([]);
	const [loading, setLoading] = useState(true);
	
	const [search, setSearch] = useState("");
	const [statusFilter, setStatusFilter] = useState("");
	
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [editingTemplate, setEditingTemplate] = useState<ContractTemplate | null>(null);
	const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

	const fetchTemplates = async () => {
		try {
			const res = await api.get<{ templates: ContractTemplate[] }>("/api/contract-templates");
			setTemplates(res.data?.templates || []);
		} catch (error) {
			console.error("Lỗi khi tải mẫu hợp đồng:", error);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchTemplates();
	}, []);

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const handleCreateOrUpdateTemplate = async (data: any) => {
		try {
			// Extract file safely (we won't upload for this demo, just keep file_name if any)
			const payload = {
				name: data.name,
				short_name: data.short_name,
				prefix_code: data.prefix_code,
				reminder_days: data.reminder_days,
				file_name: data.file?.name || data.file_name || null,
			};

			if (editingTemplate) {
				await api.put(`/api/contract-templates/${editingTemplate.id}`, payload);
			} else {
				await api.post("/api/contract-templates", payload);
			}

			fetchTemplates();
			setIsModalOpen(false);
			setEditingTemplate(null);
		} catch (error) {
			console.error(error);
			alert("Có lỗi xảy ra khi lưu mẫu hợp đồng!");
		}
	};

	const handleDelete = async (id: string) => {
		if (!confirm("Bạn có chắc chắn muốn xoá mẫu hợp đồng này không?")) return;
		try {
			await api.delete(`/api/contract-templates/${id}`);
			fetchTemplates();
			setOpenDropdownId(null);
		} catch (error) {
			console.error(error);
			alert("Xoá thất bại!");
		}
	};

	const handleToggleStatus = async (template: ContractTemplate) => {
		try {
			const newStatus = template.status === "active" ? "inactive" : "active";
			await api.put(`/api/contract-templates/${template.id}`, { status: newStatus });
			fetchTemplates();
			setOpenDropdownId(null);
		} catch (error) {
			console.error(error);
			alert("Cập nhật trạng thái thất bại!");
		}
	};

	const openEditModal = (t: ContractTemplate) => {
		setEditingTemplate(t);
		setIsModalOpen(true);
		setOpenDropdownId(null);
	};

	const filteredData = templates.filter((t) => {
		if (search && !t.name.toLowerCase().includes(search.toLowerCase())) return false;
		if (statusFilter && t.status !== statusFilter) return false;
		return true;
	});

	return (
		<div className="flex-1 flex flex-col h-full bg-[#f8f9fa] relative overflow-hidden">
			{/* Header */}
			<div className="bg-white border-b border-slate-200">
				<div className="px-6 py-4 flex items-center justify-between">
					<h1 className="text-[20px] font-bold text-slate-900 tracking-tight">Mẫu hợp đồng</h1>
				</div>

				{/* Toolbar */}
				<div className="px-6 pb-4 flex flex-col sm:flex-row items-center gap-3">
					<div className="relative w-full sm:w-[320px] shrink-0">
						<Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
						<input
							type="text"
							placeholder="Tìm kiếm mẫu hợp đồng..."
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-white focus:outline-none focus:border-amber-400 hover:border-slate-300 transition-all"
						/>
					</div>

					<div className="w-full sm:w-44 shrink-0">
						<select
							value={statusFilter}
							onChange={(e) => setStatusFilter(e.target.value)}
							className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 bg-white focus:outline-none focus:border-amber-400 hover:border-slate-300 transition-all cursor-pointer appearance-none"
						>
							<option value="">Trạng thái</option>
							<option value="active">Hoạt động</option>
							<option value="inactive">Không hoạt động</option>
						</select>
					</div>

					<button
						onClick={() => { setEditingTemplate(null); setIsModalOpen(true); }}
						className="flex items-center gap-2 px-5 py-2 bg-amber-400 text-slate-900 rounded-lg text-sm font-bold transition-colors hover:bg-amber-500 shadow-sm ml-auto cursor-pointer"
					>
						+ Tạo mẫu hợp đồng
					</button>
				</div>
			</div>

			{/* Main Content Area */}
			<div className="flex-1 overflow-auto bg-[#f8f9fa] p-6 lg:p-8 flex flex-col gap-6">
				{/* Table Area */}
				<div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm h-full flex flex-col min-h-100">
					<div className="overflow-x-auto flex-1">
						{loading ? (
							<div className="p-8 text-center text-slate-500 text-sm">Đang tải dữ liệu...</div>
						) : (
						<table className="w-full h-full text-left">
							<thead className="bg-[#f8f9fa] border-b border-slate-200 sticky top-0 z-10">
								<tr>
									<th className="px-5 py-3.5 w-10">
									</th>
									{[
										"Tên mẫu hợp đồng",
										"Tên viết tắt",
										"Mẫu số hợp đồng",
										"Nhắc nhở kỳ hạn",
										"File mẫu hợp đồng",
										"Trạng thái",
									].map((h, i) => (
										<th
											key={i}
											className="px-5 py-3.5 text-[12px] font-bold text-slate-600 tracking-wide whitespace-nowrap"
										>
											{h} <span className="inline-block ml-1 opacity-50">↕</span>
										</th>
									))}
									<th className="px-5 py-3.5 w-10 text-center">
										<Settings className="w-4 h-4 text-slate-400 inline-block" />
									</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-slate-100">
								{filteredData.length === 0 ?
									<tr>
										<td
											colSpan={8}
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
								:	filteredData.map((row) => (
										<tr
											key={row.id}
											className="hover:bg-amber-50/20 transition-colors group relative"
										>
											<td className="px-5 py-3.5">
												<FileText className="w-4 h-4 text-slate-400" />
											</td>
											<td className="px-5 py-3.5">
												<span
													className="text-[13px] font-bold text-blue-600 truncate max-w-50 block"
													title={row.name}
												>
													{row.name}
												</span>
											</td>
											<td className="px-5 py-3.5">
												<span className="font-mono text-[12px] font-bold text-slate-700">
													{row.short_name || "—"}
												</span>
											</td>
											<td className="px-5 py-3.5">
												<span className="font-mono text-[12px] font-bold text-slate-700">
													{row.prefix_code || "—"}
												</span>
											</td>
											<td className="px-5 py-3.5 text-[13px] font-medium text-slate-600">
												{row.reminder_days} ngày
											</td>
											<td className="px-5 py-3.5">
												{row.file_name ?
													<button className="cursor-pointer flex items-center gap-1.5 text-blue-600 hover:text-blue-700 transition-colors text-[12px] font-bold bg-blue-50 hover:bg-blue-100 px-2.5 py-1.5 rounded-lg border border-blue-100">
														<Download className="w-3.5 h-3.5" />
														{row.file_name}
													</button>
												:	<span className="text-[12px] text-slate-400 italic">Chưa có tệp</span>}
											</td>
											<td className="px-5 py-3.5">
												<span
													className={`inline-flex px-2 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wide border ${
														row.status === "active" ?
															"bg-emerald-50 text-emerald-700 border-emerald-200"
														:	"bg-slate-50 text-slate-500 border-slate-200"
													}`}
												>
													{row.status === "active" ? "Hoạt động" : "Không hoạt động"}
												</span>
											</td>
											<td className="px-5 py-3.5 text-right relative">
												<button 
													onClick={() => setOpenDropdownId(openDropdownId === row.id ? null : row.id)}
													className="cursor-pointer opacity-100 lg:opacity-0 lg:group-hover:opacity-100 p-1 hover:bg-slate-200 rounded-lg text-slate-400 hover:text-amber-600 transition-all"
												>
													<MoreHorizontal className="w-4 h-4" />
												</button>

												{openDropdownId === row.id && (
													<div className="absolute right-8 top-10 w-44 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50 text-left">
														<button 
															onClick={() => handleToggleStatus(row)} 
															className="w-full px-4 py-2 text-[13px] font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
														>
															<Settings className="w-3.5 h-3.5" /> 
															{row.status === 'active' ? 'Ngưng hoạt động' : 'Kích hoạt lại'}
														</button>
														<button 
															onClick={() => openEditModal(row)} 
															className="w-full px-4 py-2 text-[13px] font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
														>
															<Edit2 className="w-3.5 h-3.5" /> Sửa thông tin
														</button>
														<button 
															onClick={() => handleDelete(row.id)} 
															className="w-full px-4 py-2 text-[13px] font-medium text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
														>
															<Trash2 className="w-3.5 h-3.5" /> Xóa biểu mẫu
														</button>
													</div>
												)}
											</td>
										</tr>
									))
								}
							</tbody>
						</table>
						)}
					</div>

					{/* Pagination Footer */}
					<div className="mt-auto px-5 py-3 border-t border-slate-200 bg-white flex items-center justify-end gap-4 text-[13px] text-slate-600">
						<span>
							{filteredData.length === 0 ?
								"0-0/0"
							:	`1-${filteredData.length}/${filteredData.length}`}
						</span>
						<div className="flex items-center gap-1">
							<button
								disabled
								className="p-1 hover:bg-slate-100 rounded disabled:opacity-50 text-slate-400 transition-colors"
							>
								<ChevronLeft className="w-4 h-4" />
							</button>
							<button
								disabled
								className="p-1 hover:bg-slate-100 rounded disabled:opacity-50 text-slate-400 transition-colors"
							>
								<ChevronRight className="w-4 h-4" />
							</button>
						</div>
					</div>
				</div>
			</div>

			<Modal
				isOpen={isModalOpen}
				onClose={() => { setIsModalOpen(false); setEditingTemplate(null); setOpenDropdownId(null); }}
				title={editingTemplate ? "Sửa biểu mẫu" : "Tạo biểu mẫu"}
				size="lg"
			>
				{/* Recreate form component inside or pass initialData */}
				<ContractTemplateForm
					initialData={editingTemplate}
					onSubmit={handleCreateOrUpdateTemplate}
					onCancel={() => { setIsModalOpen(false); setEditingTemplate(null); setOpenDropdownId(null); }}
				/>
			</Modal>
		</div>
	);
}

import { useState } from "react";
import {
	Plus,
	Search,
	ChevronLeft,
	ChevronRight,
	Settings,
	MoreHorizontal,
	FileSpreadsheet,
} from "lucide-react";
import Modal from "../components/modals/Modal";
import IncidentTypeForm from "../components/modals/IncidentTypeForm";

interface IncidentType {
	id: string;
	name: string;
	icon: string | null;
	status: "active" | "inactive";
	assignee: string | null;
}

const MOCK_TYPES: IncidentType[] = [
	{ id: "1", name: "Điện & Nước", icon: "💧", status: "active", assignee: null },
	{
		id: "2",
		name: "Nội thất & Thiết bị",
		icon: "🛋️",
		status: "active",
		assignee: "Kỹ thuật viên 1",
	},
	{ id: "3", name: "An ninh & Chìa khoá", icon: "🔑", status: "active", assignee: "Bảo vệ" },
	{ id: "4", name: "Vệ sinh & Môi trường", icon: "🧹", status: "active", assignee: "Lao công" },
];

export default function IncidentTypesPage() {
	const [search, setSearch] = useState("");
	const [statusFilter, setStatusFilter] = useState("");
	const [isModalOpen, setIsModalOpen] = useState(false);

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const handleCreateType = (data: any) => {
		console.log("Creating Type:", data);
		setIsModalOpen(false);
	};

	const filteredData = MOCK_TYPES.filter((t) => {
		if (search && !t.name.toLowerCase().includes(search.toLowerCase())) return false;
		if (statusFilter && t.status !== statusFilter) return false;
		return true;
	});

	return (
		<div className="flex-1 flex flex-col h-full bg-[#f8f9fa] relative overflow-hidden">
			{/* Header */}
			<div className="bg-white border-b border-slate-200">
				<div className="px-6 py-4 flex items-center justify-between">
					<h1 className="text-[20px] font-bold text-slate-900 tracking-tight">Loại sự cố</h1>
				</div>

				{/* Toolbar */}
				<div className="px-6 pb-4 flex flex-col sm:flex-row items-center gap-3">
					<div className="relative w-full sm:w-[320px] shrink-0">
						<Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
						<input
							type="text"
							placeholder="Tên"
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-[13px] text-slate-700 bg-white focus:outline-none focus:border-amber-400 hover:border-slate-300 transition-all font-medium"
						/>
					</div>

					<div className="w-full sm:w-40 shrink-0">
						<select
							value={statusFilter}
							onChange={(e) => setStatusFilter(e.target.value)}
							className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 bg-white focus:outline-none focus:border-amber-400 hover:border-slate-300 transition-all cursor-pointer appearance-none font-medium text-[13px]"
						>
							<option value="">Trạng thái</option>
							<option value="active">Hoạt động</option>
							<option value="inactive">Không hoạt động</option>
						</select>
					</div>

					<div className="flex items-center gap-2 ml-auto">
						<button className="flex items-center justify-center w-9 h-9 border border-green-200 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors">
							<FileSpreadsheet className="w-5 h-5" />
						</button>
						<button
							onClick={() => setIsModalOpen(true)}
							className="flex items-center gap-1.5 px-4 py-2 bg-amber-400 text-slate-900 rounded-lg text-[13px] font-bold transition-colors hover:bg-amber-500 shadow-sm cursor-pointer"
						>
							<Plus className="w-4 h-4 font-bold" /> Tạo
						</button>
					</div>
				</div>
			</div>

			{/* Main Content Area */}
			<div className="flex-1 overflow-auto bg-[#f8f9fa] p-5 lg:p-6 flex flex-col gap-6">
				{/* Table Area */}
				<div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm h-full flex flex-col min-h-100">
					<div className="overflow-x-auto flex-1">
						<table className="w-full h-full text-left">
							<thead className="bg-[#f8f9fa] border-b border-slate-200 sticky top-0 z-10">
								<tr>
									{["Biểu tượng", "Tên", "Người đảm nhận mặc định", "Trạng thái"].map((h, i) => (
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
											colSpan={3}
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
											className="hover:bg-amber-50/20 transition-colors group"
										>
											<td className="px-5 py-3.5">
												<div className="w-10 h-10 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-center text-lg">
													{row.icon}
												</div>
											</td>
											<td className="px-5 py-3.5">
												<span className="text-[13px] font-bold text-slate-700">{row.name}</span>
											</td>
											<td className="px-5 py-3.5">
												<span className="text-[13px] font-medium text-slate-600">
													{row.assignee || "—"}
												</span>
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
											<td className="px-5 py-3.5 text-right">
												<button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-amber-600 transition-all">
													<MoreHorizontal className="w-4 h-4" />
												</button>
											</td>
										</tr>
									))
								}
							</tbody>
						</table>
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
						<select className="px-2 py-1 outline-none border border-slate-200 rounded cursor-pointer text-slate-600 bg-white hover:border-slate-300 appearance-none font-medium text-[13px]">
							<option>20 / trang</option>
							<option>50 / trang</option>
						</select>
					</div>
				</div>
			</div>

			<Modal
				isOpen={isModalOpen}
				onClose={() => setIsModalOpen(false)}
				title="Tạo loại sự cố"
				size="lg"
			>
				<IncidentTypeForm
					onSubmit={handleCreateType}
					onCancel={() => setIsModalOpen(false)}
				/>
			</Modal>
		</div>
	);
}

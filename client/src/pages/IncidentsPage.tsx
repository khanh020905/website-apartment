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
} from "lucide-react";
import Modal from "../components/modals/Modal";
import IncidentForm from "../components/modals/IncidentForm";

interface Incident {
	id: string;
	type: string;
	priority: string;
	location: string;
	status: string;
	reportedBy: string;
	assignee?: string;
	created_at?: string;
	room?: { room_number: string };
}

export default function IncidentsPage() {
	const [search, setSearch] = useState("");
	const [typeFilter, setTypeFilter] = useState("");
	const [priorityFilter, setPriorityFilter] = useState("");
	const [isFilterOpen, setIsFilterOpen] = useState(false);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [loading, setLoading] = useState(true);
	const [incidents, setIncidents] = useState<Incident[]>([]);

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

	useEffect(() => {
		fetchIncidents();
	}, []);

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const handleCreateIncident = async (data: any) => {
		try {
			await api.post("/api/incidents", data);
			fetchIncidents();
			setIsModalOpen(false);
		} catch (error) {
			console.error(error);
			alert("Lỗi tạo sự cố");
		}
	};

	const filteredData = incidents.filter((t) => {
		if (
			search &&
			!t.location?.toLowerCase().includes(search.toLowerCase()) &&
			!t.reportedBy?.toLowerCase().includes(search.toLowerCase()) &&
			!t.room?.room_number?.toLowerCase().includes(search.toLowerCase())
		)
			return false;
		if (typeFilter && t.type !== typeFilter) return false;
		if (priorityFilter && t.priority !== priorityFilter) return false;
		return true;
	});

	return (
		<div className="flex-1 flex flex-col h-full bg-[#f8f9fa] relative overflow-hidden">
			{/* Header */}
			<div className="bg-white border-b border-slate-200">
				<div className="px-6 py-4 flex items-center justify-between">
					<h1 className="text-[20px] font-bold text-slate-900 tracking-tight">Sự cố</h1>
				</div>

				{/* Toolbar */}
				<div className="px-6 pb-4 flex flex-col sm:flex-row items-center gap-3">
					<div className="relative w-full sm:w-[320px] shrink-0">
						<Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
						<input
							type="text"
							placeholder="Tìm kiếm sự cố theo khách hàng, vị trí sự cố"
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-[13px] text-slate-700 bg-white focus:outline-none focus:border-brand-primary hover:border-slate-300 transition-all font-medium"
						/>
					</div>

					<div className="w-full sm:w-40 shrink-0">
						<select
							value={typeFilter}
							onChange={(e) => setTypeFilter(e.target.value)}
							className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 bg-white focus:outline-none focus:border-brand-primary hover:border-slate-300 transition-all cursor-pointer appearance-none font-medium text-[13px]"
						>
							<option value="">Loại sự cố</option>
							<option value="DienNuoc">Điện nước</option>
							<option value="Wifi">Internet/Wifi</option>
						</select>
					</div>

					<div className="w-full sm:w-32 shrink-0">
						<select
							value={priorityFilter}
							onChange={(e) => setPriorityFilter(e.target.value)}
							className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 bg-white focus:outline-none focus:border-brand-primary hover:border-slate-300 transition-all cursor-pointer appearance-none font-medium text-[13px]"
						>
							<option value="">Ưu tiên</option>
							<option value="Thap">Thấp</option>
							<option value="Cao">Cao</option>
						</select>
					</div>

					<button
						onClick={() => setIsFilterOpen(true)}
						className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg text-[13px] font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm cursor-pointer"
					>
						<Settings2 className="w-4 h-4" />
						Bộ lọc
					</button>

					<div className="flex items-center gap-2 ml-auto">
						<button className="flex items-center justify-center w-9 h-9 border border-green-200 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors">
							<FileSpreadsheet className="w-5 h-5" />
						</button>
						<button
							onClick={() => setIsModalOpen(true)}
							className="flex items-center gap-1.5 px-4 py-2 bg-brand-primary text-white rounded-lg text-[13px] font-bold transition-colors hover:bg-brand-dark shadow-sm cursor-pointer"
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
									{[
										"Loại sự cố",
										"Ưu tiên",
										"Vị trí sự cố",
										"Trạng thái",
										"Báo cáo bởi",
										"Người đảm nhận",
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
								{loading ? (
									<tr><td colSpan={7} className="px-6 py-28 text-center text-slate-500">Đang tải biểu đồ...</td></tr>
								) : filteredData.length === 0 ?
									<tr>
										<td
											colSpan={7}
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
								:	filteredData.map((row: Incident) => (
										<tr
											key={row.id}
											className="hover:bg-brand-bg/20 transition-colors group"
										>
											<td className="px-5 py-3.5">
												<span className="text-[13px] font-bold text-slate-700">{row.type}</span>
											</td>
											<td className="px-5 py-3.5">
												<span className="text-[13px] font-medium text-slate-600">
													{row.priority}
												</span>
											</td>
											<td className="px-5 py-3.5">
												<span className="text-[13px] font-medium text-slate-600">
													{row.room?.room_number || row.location || "—"}
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
													{row.status}
												</span>
											</td>
											<td className="px-5 py-3.5">
												<span className="text-[13px] font-medium text-slate-600">
													{row.reportedBy || "Hệ thống"}
												</span>
											</td>
											<td className="px-5 py-3.5">
												<span className="text-[13px] font-medium text-slate-600">
													{row.assignee || "Chưa giao"}
												</span>
											</td>
											<td className="px-5 py-3.5 text-right">
												<button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-brand-dark transition-all">
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

			{/* Advanced Filter Sidebar */}
			<AnimatePresence>
				{isFilterOpen && (
					<>
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							onClick={() => setIsFilterOpen(false)}
							className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm z-40 transition-opacity"
						/>
						<motion.div
							initial={{ x: "100%" }}
							animate={{ x: 0 }}
							exit={{ x: "100%" }}
							transition={{ type: "spring", damping: 25, stiffness: 200 }}
							className="absolute top-0 right-0 w-100 h-full bg-white shadow-2xl z-50 flex flex-col border-l border-slate-200"
						>
							<div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
								<h2 className="text-lg font-bold text-slate-900">Bộ lọc nâng cao</h2>
								<button
									onClick={() => setIsFilterOpen(false)}
									className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
								>
									<X className="w-5 h-5" />
								</button>
							</div>

							<div className="flex-1 overflow-y-auto p-5 space-y-6">
								{/* Loại sự cố */}
								<div>
									<h3 className="text-[13px] font-bold text-slate-900 mb-3">Loại sự cố</h3>
									<select className="w-full px-3 py-2 border border-slate-200 rounded-lg text-[13px] font-medium text-slate-900 focus:outline-none focus:border-brand-primary appearance-none bg-white cursor-pointer">
										<option value="">Chọn loại sự cố</option>
										<option value="diennuoc">Điện nước</option>
										<option value="wifi">Internet/Wifi</option>
										<option value="khac">Khác</option>
									</select>
								</div>

								<hr className="border-slate-100" />

								{/* Trạng thái */}
								<div>
									<h3 className="text-[13px] font-bold text-slate-900 mb-3">Trạng thái</h3>
									<div className="grid grid-cols-2 gap-3">
										{["Cần thực hiện", "Đã hoàn thành", "Đã huỷ"].map((st) => (
											<label
												key={st}
												className="flex items-center gap-2 cursor-pointer"
											>
												<input
													type="checkbox"
													className="rounded border-slate-300 text-brand-primary focus:ring-brand-primary/20 w-4 h-4 cursor-pointer"
												/>
												<span className="text-[13px] font-medium text-slate-700">{st}</span>
											</label>
										))}
									</div>
								</div>

								<hr className="border-slate-100" />

								{/* Ưu tiên */}
								<div>
									<h3 className="text-[13px] font-bold text-slate-900 mb-3">Sự ưu tiên</h3>
									<div className="grid grid-cols-2 gap-3">
										{["Khẩn cấp", "Cao", "Trung bình", "Thấp"].map((st) => (
											<label
												key={st}
												className="flex items-center gap-2 cursor-pointer"
											>
												<input
													type="checkbox"
													className="rounded border-slate-300 text-brand-primary focus:ring-brand-primary/20 w-4 h-4 cursor-pointer"
												/>
												<span className="text-[13px] font-medium text-slate-700">{st}</span>
											</label>
										))}
									</div>
								</div>

								<hr className="border-slate-100" />

								{/* Người đảm nhận */}
								<div>
									<h3 className="text-[13px] font-bold text-slate-900 mb-3">Người đảm nhận</h3>
									<select className="w-full px-3 py-2 border border-slate-200 rounded-lg text-[13px] font-medium text-slate-900 focus:outline-none focus:border-brand-primary appearance-none bg-white cursor-pointer">
										<option value="">Chọn người đảm nhận</option>
										<option value="1">Kỹ thuật viên 1</option>
										<option value="2">Kỹ thuật viên 2</option>
									</select>
								</div>

								<hr className="border-slate-100" />

								{/* Ngày tạo */}
								<div>
									<h3 className="text-[13px] font-bold text-slate-900 mb-3">Ngày tạo</h3>
									<div className="flex items-center gap-2">
										<input
											type="date"
											className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-[13px] font-medium text-slate-900 focus:outline-none focus:border-brand-primary"
										/>
										<span className="text-slate-400">-</span>
										<input
											type="date"
											className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-[13px] font-medium text-slate-900 focus:outline-none focus:border-brand-primary"
										/>
									</div>
								</div>
							</div>

							{/* Slider Footer */}
							<div className="p-5 border-t border-slate-100 bg-white flex items-center justify-between gap-3 shrink-0">
								<button
									onClick={() => {
										setSearch("");
										setTypeFilter("");
										setPriorityFilter("");
									}}
									className="px-5 py-2.5 text-[13px] font-bold text-blue-600 hover:underline transition-colors cursor-pointer"
								>
									Đặt lại
								</button>
								<button
									onClick={() => setIsFilterOpen(false)}
									className="px-6 py-2.5 text-[13px] font-bold bg-brand-primary hover:bg-brand-dark text-white rounded-lg transition-colors shadow-sm cursor-pointer"
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
				onClose={() => setIsModalOpen(false)}
				title="Tạo sự cố"
				size="lg"
			>
				<IncidentForm
					onSubmit={handleCreateIncident}
					onCancel={() => setIsModalOpen(false)}
				/>
			</Modal>
		</div>
	);
}

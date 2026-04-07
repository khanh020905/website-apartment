import { useState, useEffect, useCallback } from "react";
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
	Trash2,
} from "lucide-react";
import { api } from "../lib/api";
import { useBuilding } from "../contexts/BuildingContext";
import Modal from "../components/modals/Modal";
import IncidentForm from "../components/modals/IncidentForm";

interface Incident {
	id: string;
	type: { name: string; icon: string };
	priority: "emergency" | "high" | "medium" | "low";
	location: string;
	status: "pending" | "processing" | "completed" | "cancelled";
	reporter_name: string;
	assignee_name: string;
	created_at: string;
}

const PRIORITY_LABELS: Record<string, string> = {
  emergency: "Khẩn cấp",
  high: "Cao",
  medium: "Trung bình",
  low: "Thấp"
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Cần thực hiện",
  processing: "Đang xử lý",
  completed: "Đã hoàn thành",
  cancelled: "Đã hủy"
};

const PRIORITY_COLORS: Record<string, string> = {
  emergency: "bg-rose-50 text-rose-600 border-rose-100",
  high: "bg-orange-50 text-orange-600 border-orange-100",
  medium: "bg-blue-50 text-blue-600 border-blue-100",
  low: "bg-slate-50 text-slate-500 border-slate-100"
};

export default function IncidentsPage() {
	const { selectedBuildingId } = useBuilding();
	const [search, setSearch] = useState("");
	const [incidents, setIncidents] = useState<Incident[]>([]);
	const [loading, setLoading] = useState(true);
	const [isModalOpen, setIsModalOpen] = useState(false);

	const fetchIncidents = useCallback(async () => {
		if (!selectedBuildingId) return;
		setLoading(true);
		const { data } = await api.get<Incident[]>(`/api/incidents?building_id=${selectedBuildingId}`);
		if (data) setIncidents(data);
		setLoading(false);
	}, [selectedBuildingId]);

	useEffect(() => {
		fetchIncidents();
	}, [fetchIncidents]);

	const handleCreateIncident = async (formData: any) => {
		const { error } = await api.post("/api/incidents", { ...formData, building_id: selectedBuildingId });
		if (!error) {
			setIsModalOpen(false);
			fetchIncidents();
		} else {
			alert(error);
		}
	};

	const filteredData = incidents.filter((t) => {
		if (search && !t.location.toLowerCase().includes(search.toLowerCase()) && !t.reporter_name?.toLowerCase().includes(search.toLowerCase()))
			return false;
		return true;
	});

	return (
		<div className="flex-1 flex flex-col h-full bg-[#f8f9fa] relative overflow-hidden font-['Plus_Jakarta_Sans',sans-serif]">
			<div className="bg-white border-b border-slate-200">
				<div className="px-6 py-4 flex items-center justify-between">
					<h1 className="text-[20px] font-bold text-slate-900 tracking-tight">Nhật ký sự cố</h1>
					<div className="flex items-center gap-2">
						<button className="flex items-center justify-center w-9 h-9 border border-green-200 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors">
							<FileSpreadsheet className="w-5 h-5" />
						</button>
						<button onClick={() => setIsModalOpen(true)} className="flex items-center gap-1.5 px-4 py-2 bg-amber-400 text-slate-900 rounded-lg text-[13px] font-bold transition-colors hover:bg-amber-500 shadow-sm cursor-pointer">
							<Plus className="w-4 h-4 font-bold" /> Tạo sự cố
						</button>
					</div>
				</div>

				<div className="px-6 pb-4 flex flex-col sm:flex-row items-center gap-3">
					<div className="relative w-full sm:w-[360px] shrink-0">
						<Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
						<input
							type="text"
							placeholder="Tìm kiếm vị trí, khách hàng báo..."
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-[13px] font-bold text-slate-700 bg-white focus:outline-none focus:border-amber-400 transition-all shadow-sm"
						/>
					</div>
				</div>
			</div>

			<div className="flex-1 overflow-auto bg-[#f8f9fa] p-5 lg:p-6 flex flex-col gap-6">
				<div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm h-full flex flex-col min-h-125">
					<div className="overflow-x-auto flex-1">
						<table className="w-full text-left">
							<thead className="bg-[#EDEDED] border-b border-slate-200 sticky top-0 z-10 font-bold uppercase tracking-widest text-[10px] text-slate-500">
								<tr>
									<th className="px-5 py-4">Loại sự cố</th>
									<th className="px-5 py-4">Ưu tiên</th>
									<th className="px-5 py-4">Vị trí</th>
									<th className="px-5 py-4">Trạng thái</th>
									<th className="px-5 py-4">Người báo</th>
									<th className="px-5 py-4">Người đảm nhận</th>
									<th className="px-5 py-4 w-10"><Settings className="w-4 h-4" /></th>
								</tr>
							</thead>
							<tbody className="divide-y divide-slate-100 font-bold text-[13px]">
								{loading ? (
									<tr><td colSpan={7} className="px-6 py-28 text-center text-slate-400 font-black tracking-widest uppercase text-xs">Đang tải biểu mẫu...</td></tr>
								) : filteredData.length === 0 ? (
									<tr><td colSpan={7} className="px-6 py-28 text-center text-slate-400 font-bold">Chưa có sự cố nào</td></tr>
								) : filteredData.map((row) => (
									<tr key={row.id} className="hover:bg-slate-50 transition-colors group">
										<td className="px-5 py-4 flex items-center gap-2">
											<span className="text-lg">{row.type?.icon || "🛠️"}</span>
											<span className="text-slate-900">{row.type?.name}</span>
										</td>
										<td className="px-5 py-4">
											<span className={`px-2 py-0.5 rounded text-[10px] uppercase border font-black ${PRIORITY_COLORS[row.priority]}`}>
												{PRIORITY_LABELS[row.priority]}
											</span>
										</td>
										<td className="px-5 py-4 text-slate-700">{row.location}</td>
										<td className="px-5 py-4">
											<span className="text-slate-600">{STATUS_LABELS[row.status]}</span>
										</td>
										<td className="px-5 py-4 text-slate-500 font-medium">{row.reporter_name || "—"}</td>
										<td className="px-5 py-4 text-slate-500 font-medium">{row.assignee_name || "—"}</td>
										<td className="px-5 py-4">
											<button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-amber-600 transition-all cursor-pointer"><MoreHorizontal className="w-4 h-4" /></button>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>

					<div className="mt-auto px-5 py-3 border-t border-slate-200 bg-white flex items-center justify-end gap-4 text-sm text-slate-600">
						<span className="font-bold">{filteredData.length}/{filteredData.length}</span>
						<div className="flex items-center gap-1">
							<button disabled className="p-1 hover:bg-slate-100 rounded text-slate-300"><ChevronLeft className="w-4 h-4" /></button>
							<button disabled className="p-1 hover:bg-slate-100 rounded text-slate-300"><ChevronRight className="w-4 h-4" /></button>
						</div>
					</div>
				</div>
			</div>

			<Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Tạo sự cố mới" size="lg">
				<IncidentForm onSubmit={handleCreateIncident} onCancel={() => setIsModalOpen(false)} />
			</Modal>
		</div>
	);
}

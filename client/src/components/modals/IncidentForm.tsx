import { useEffect, useState } from "react";
import { Calendar, Upload } from "lucide-react";
import { api } from "../../lib/api";

interface IncidentFormProps {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	onSubmit: (data: any) => void;
	onCancel: () => void;
}

export default function IncidentForm({ onSubmit, onCancel }: IncidentFormProps) {
	const [buildings, setBuildings] = useState<any[]>([]);
	const [incidentTypes, setIncidentTypes] = useState<any[]>([]);
	const [rooms, setRooms] = useState<any[]>([]);
	const [loading, setLoading] = useState(false);

	const [formData, setFormData] = useState({
		locationId: "",
		issueLocation: "",
		customerId: "",
		contactPhone: "",
		incidentType: "",
		priority: "Thấp",
		description: "",
		dueDate: "",
		assignee: "",
	});

	useEffect(() => {
		const fetchData = async () => {
			setLoading(true);
			try {
				const [bRes, tRes] = await Promise.all([
					api.get<any>("/api/buildings"),
					api.get<any>("/api/incident-types")
				]);
				setBuildings(bRes.data?.buildings || []);
				setIncidentTypes(tRes.data || []);
			} catch (err) {
				console.error(err);
			}
			setLoading(false);
		};
		fetchData();
	}, []);

	useEffect(() => {
		if (formData.locationId) {
			api.get<any>(`/api/rooms?building_id=${formData.locationId}`)
				.then(res => setRooms(res.data?.rooms || []))
				.catch(console.error);
		} else {
			setRooms([]);
		}
	}, [formData.locationId]);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		onSubmit(formData);
	};

	return (
		<form
			onSubmit={handleSubmit}
			className="flex flex-col h-[calc(100vh-140px)] max-h-175"
		>
			<div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-slate-200">
				{/* Basic Information */}
				<div className="grid grid-cols-2 gap-4">
					<div className="space-y-1.5">
						<label className="text-[13px] font-semibold text-slate-700">
							Toà nhà <span className="text-rose-500">*</span>
						</label>
						<select
							required
							value={formData.locationId}
							onChange={(e) => setFormData({ ...formData, locationId: e.target.value, issueLocation: "" })}
							className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-medium text-slate-900 cursor-pointer appearance-none"
						>
							<option value="">Chọn toà nhà</option>
							{buildings.map(b => (
								<option key={b.id} value={b.id}>{b.name}</option>
							))}
						</select>
					</div>

					<div className="space-y-1.5">
						<label className="text-[13px] font-semibold text-slate-700">
							Vị trí sự cố <span className="text-rose-500">*</span>
						</label>
						<select
							required
							value={formData.issueLocation}
							onChange={(e) => setFormData({ ...formData, issueLocation: e.target.value })}
							disabled={!formData.locationId}
							className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-medium text-slate-900 cursor-pointer appearance-none disabled:opacity-50"
						>
							<option value="">Chọn vị trí sự cố</option>
							<option value="COMMON">Khu vực chung</option>
							{rooms.map(r => (
								<option key={r.id} value={r.room_number}>Phòng {r.room_number}</option>
							))}
						</select>
					</div>

					<div className="space-y-1.5">
						<label className="text-[13px] font-semibold text-slate-700">Khách hàng</label>
						<button
							type="button"
							className="w-full flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm hover:bg-slate-50 hover:border-slate-300 transition-colors"
						>
							<div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
								<span className="text-[10px] font-bold">+</span>
							</div>
							<span className="font-medium text-slate-600">Chọn khách hàng</span>
						</button>
					</div>

					<div className="space-y-1.5">
						<label className="text-[13px] font-semibold text-slate-700">Số liên hệ</label>
						<input
							type="text"
							value={formData.contactPhone}
							onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
							placeholder="Số liên hệ"
							className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-medium text-slate-900"
						/>
					</div>

					<div className="space-y-1.5">
						<label className="text-[13px] font-semibold text-slate-700">
							Loại sự cố <span className="text-rose-500">*</span>
						</label>
						<select
							required
							value={formData.incidentType}
							onChange={(e) => setFormData({ ...formData, incidentType: e.target.value })}
							className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-medium text-slate-900 cursor-pointer appearance-none"
						>
							<option value="">Chọn loại sự cố</option>
							{incidentTypes.map(t => (
								<option key={t.id} value={t.id}>{t.name}</option>
							))}
						</select>
					</div>

					<div className="space-y-1.5">
						<label className="text-[13px] font-semibold text-slate-700">Ưu tiên</label>
						<select
							value={formData.priority}
							onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
							className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-medium text-slate-900 cursor-pointer appearance-none"
						>
							<option value="Thấp">Thấp</option>
							<option value="Trung bình">Trung bình</option>
							<option value="Cao">Cao</option>
							<option value="Nghiêm trọng">Nghiêm trọng</option>
						</select>
					</div>
				</div>

				<div className="space-y-1.5">
					<label className="text-[13px] font-semibold text-slate-700">
						Mô tả <span className="text-rose-500">*</span>
					</label>
					<div className="relative">
						<textarea
							required
							value={formData.description}
							onChange={(e) => setFormData({ ...formData, description: e.target.value })}
							placeholder="Mô tả chi tiết sự cố..."
							className="w-full h-24 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-medium text-slate-900 resize-none"
							maxLength={255}
						/>
						<div className="absolute bottom-3 right-3 text-[11px] font-semibold text-slate-400">
							{formData.description.length}/255
						</div>
					</div>
				</div>

				<div className="space-y-1.5">
					<label className="text-[13px] font-semibold text-slate-700">Tệp đính kèm</label>
					<div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center hover:bg-slate-50 hover:border-amber-400 transition-colors cursor-pointer group">
						<div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-2 group-hover:text-amber-500 transition-colors">
							<Upload className="w-5 h-5" />
						</div>
						<p className="text-[13px] font-medium text-slate-600 mb-1">
							Tải lên hình ảnh hoặc video.
						</p>
						<p className="text-[11px] font-medium text-slate-400">Kích thước tệp tối đa: 50 MB</p>
					</div>
				</div>

				<div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-6">
					<div className="space-y-1.5">
						<label className="text-[13px] font-semibold text-slate-700">Ngày đến hạn</label>
						<div className="relative">
							<Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
							<input
								type="date"
								value={formData.dueDate}
								onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
								className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-medium text-slate-900 cursor-pointer"
							/>
						</div>
					</div>

					<div className="space-y-1.5">
						<label className="text-[13px] font-semibold text-slate-700">Người đảm nhận</label>
						<button
							type="button"
							className="w-full flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm hover:bg-slate-50 hover:border-slate-300 transition-colors"
						>
							<div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
								<span className="text-[10px] font-bold">+</span>
							</div>
							<span className="font-medium text-slate-600">Thêm người đảm nhận</span>
						</button>
					</div>
				</div>
			</div>

			<div className="p-4 border-t border-slate-100 bg-slate-50/80 flex items-center justify-end gap-3 shrink-0">
				<button
					type="button"
					onClick={onCancel}
					className="px-6 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-200 bg-slate-100 rounded-xl transition-colors"
				>
					Hủy
				</button>
				<button
					type="submit"
					className="px-8 py-2.5 text-sm font-bold text-slate-900 bg-amber-400 hover:bg-amber-500 rounded-xl shadow-sm transition-all active:scale-[0.98]"
				>
					Tạo
				</button>
			</div>
		</form>
	);
}

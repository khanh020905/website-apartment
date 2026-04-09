import { Calendar, User, Building2, Users, FileText, ClipboardList } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { useBuilding } from "../../contexts/BuildingContext";

interface ContractFormProps {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	onSubmit: (data: any) => void;
	onCancel: () => void;
}

const ContractForm = ({ onSubmit, onCancel }: ContractFormProps) => {
	const { selectedBuildingId } = useBuilding();
	const [rooms, setRooms] = useState<any[]>([]);
	const [customers, setCustomers] = useState<any[]>([]);
	const [templates, setTemplates] = useState<any[]>([]);
	const [loading, setLoading] = useState(false);

	const [formData, setFormData] = useState({
		contractTemplateId: "",
		contractName: "",
		contractNumber:
			"NTSMT" +
			// eslint-disable-next-line react-hooks/purity
			Math.floor(Math.random() * 100000)
				.toString()
				.padStart(5, "0"),
		effectiveDate: "",
		startDate: "",
		endDate: "",
		room_id: "",
		guestCount: 1,
		customer_id: "",
		roommates: [],
		notes: "",
		isSigned: false,
		manager: "Lê Trần Bảo Phúc",
	});

	useEffect(() => {
		const fetchData = async () => {
			setLoading(true);
			try {
				const [roomsRes, customersRes, templatesRes] = await Promise.all([
					api.get<any>(`/api/rooms?building_id=${selectedBuildingId || ""}`),
					api.get<any>(`/api/customers?building_id=${selectedBuildingId || ""}`),
					api.get<any>("/api/contract-templates")
				]);
				setRooms(roomsRes.data?.rooms || []);
				setCustomers(customersRes.data?.customers || []);
				setTemplates(templatesRes.data || []);
			} catch (err) {
				console.error(err);
			}
			setLoading(false);
		};
		fetchData();
	}, [selectedBuildingId]);

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
	) => {
		const { name, value, type } = e.target as HTMLInputElement;
		setFormData((prev) => ({
			...prev,
			[name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
		}));
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		onSubmit(formData);
	};

	return (
		<form
			id="contract-form"
			onSubmit={handleSubmit}
			className="space-y-6"
		>
			{/* Basic Info Section */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				<div className="space-y-2">
					<label className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
						<ClipboardList className="w-3.5 h-3.5" />
						Mẫu hợp đồng <span className="text-rose-500">*</span>
					</label>
					<select
						name="contractTemplateId"
						value={formData.contractTemplateId}
						onChange={handleChange}
						required
						className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-4 focus:ring-amber-400/10 focus:border-brand-primary transition-all outline-none"
					>
						<option value="">Chọn mẫu hợp đồng</option>
						{templates.map(t => (
							<option key={t.id} value={t.id}>{t.name}</option>
						))}
					</select>
				</div>

				<div className="space-y-2">
					<label className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
						<FileText className="w-3.5 h-3.5" />
						Tên hợp đồng <span className="text-rose-500">*</span>
					</label>
					<input
						type="text"
						name="contractName"
						value={formData.contractName}
						onChange={handleChange}
						required
						placeholder="VD: HĐ Thuê phòng P101 - Nguyễn Văn A"
						className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-4 focus:ring-amber-400/10 focus:border-brand-primary transition-all outline-none"
					/>
				</div>

				<div className="space-y-2">
					<label className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
						<FileText className="w-3.5 h-3.5" />
						Số hợp đồng <span className="text-rose-500">*</span>
					</label>
					<input
						type="text"
						name="contractNumber"
						value={formData.contractNumber}
						onChange={handleChange}
						required
						className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-4 focus:ring-amber-400/10 focus:border-brand-primary transition-all outline-none"
					/>
				</div>

				<div className="space-y-2">
					<label className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
						<Calendar className="w-3.5 h-3.5" />
						Ngày hiệu lực <span className="text-rose-500">*</span>
					</label>
					<input
						type="date"
						name="effectiveDate"
						value={formData.effectiveDate}
						onChange={handleChange}
						required
						className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-4 focus:ring-amber-400/10 focus:border-brand-primary transition-all outline-none"
					/>
				</div>
			</div>

			<div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
				<input
					type="checkbox"
					id="isSigned"
					name="isSigned"
					checked={formData.isSigned}
					onChange={handleChange}
					className="w-5 h-5 rounded border-slate-300 text-brand-primary focus:ring-amber-500"
				/>
				<label
					htmlFor="isSigned"
					className="text-sm font-bold text-slate-700"
				>
					Đã ký hợp đồng
				</label>
			</div>

			{/* Date & Room Section */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				<div className="space-y-2">
					<label className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
						<Calendar className="w-3.5 h-3.5" />
						Ngày bắt đầu <span className="text-rose-500">*</span>
					</label>
					<input
						type="date"
						name="startDate"
						value={formData.startDate}
						onChange={handleChange}
						required
						className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-4 focus:ring-amber-400/10 focus:border-brand-primary transition-all outline-none"
					/>
				</div>

				<div className="space-y-2">
					<label className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
						<Calendar className="w-3.5 h-3.5" />
						Ngày kết thúc <span className="text-rose-500">*</span>
					</label>
					<input
						type="date"
						name="endDate"
						value={formData.endDate}
						onChange={handleChange}
						required
						className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-4 focus:ring-amber-400/10 focus:border-brand-primary transition-all outline-none"
					/>
				</div>

				<div className="space-y-2">
					<label className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
						<Building2 className="w-3.5 h-3.5" />
						Phòng <span className="text-rose-500">*</span>
					</label>
					<select
						name="room_id"
						value={formData.room_id}
						onChange={handleChange}
						required
						className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-4 focus:ring-amber-400/10 focus:border-brand-primary transition-all outline-none"
					>
						<option value="">Chọn phòng</option>
						{rooms.map(r => (
							<option key={r.id} value={r.id}>{r.room_number}</option>
						))}
					</select>
				</div>

				<div className="space-y-2">
					<label className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
						<Users className="w-3.5 h-3.5" />
						Số khách ở <span className="text-rose-500">*</span>
					</label>
					<input
						type="number"
						name="guestCount"
						min="1"
						value={formData.guestCount}
						onChange={handleChange}
						required
						className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-4 focus:ring-amber-400/10 focus:border-brand-primary transition-all outline-none"
					/>
				</div>
			</div>

			{/* Customer Section */}
			<div className="space-y-2">
				<label className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
					<User className="w-3.5 h-3.5" />
					Khách đại diện <span className="text-rose-500">*</span>
				</label>
				<select
					name="customer_id"
					value={formData.customer_id}
					onChange={handleChange}
					required
					className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-4 focus:ring-amber-400/10 focus:border-brand-primary transition-all outline-none"
				>
					<option value="">Chọn khách hàng</option>
					{customers.map(c => (
						<option key={c.id} value={c.id}>{c.tenant_name}</option>
					))}
				</select>
			</div>

			<div className="space-y-2">
				<label className="text-[11px] font-black uppercase tracking-wider text-slate-400">
					Ghi chú
				</label>
				<textarea
					name="notes"
					value={formData.notes}
					onChange={handleChange}
					rows={3}
					placeholder="Nhập ghi chú cho hợp đồng..."
					className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-4 focus:ring-amber-400/10 focus:border-brand-primary transition-all outline-none resize-none"
				/>
			</div>

			<div className="flex items-center justify-end gap-3 pt-4">
				<button
					type="button"
					onClick={onCancel}
					className="px-6 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-200 transition-all"
				>
					Hủy
				</button>
				<button
					type="submit"
					disabled={loading}
					className={`px-8 py-2.5 bg-brand-primary text-white rounded-xl text-sm font-bold hover:bg-brand-dark shadow-lg shadow-brand-primary/20 transition-all active:scale-95 ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
				>
					{loading ? "Đang tải..." : "Tạo hợp đồng"}
				</button>
			</div>
		</form>
	);
};

export default ContractForm;

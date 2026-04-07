import { useState } from "react";
import { Calendar, User, Building2, Users, FileText, ClipboardList } from "lucide-react";

interface ContractFormProps {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	onSubmit: (data: any) => void;
	onCancel: () => void;
}

const ContractForm = ({ onSubmit, onCancel }: ContractFormProps) => {
	const [formData, setFormData] = useState({
		contractTemplate: "Mẫu hợp đồng Smartos",
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
		room: "",
		guestCount: 1,
		representativeGuest: "",
		roommates: [],
		notes: "",
		isSigned: false,
		manager: "Lê Trần Bảo Phúc",
	});

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
						name="contractTemplate"
						value={formData.contractTemplate}
						onChange={handleChange}
						required
						className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-4 focus:ring-amber-400/10 focus:border-amber-400 transition-all outline-none"
					>
						<option>Mẫu hợp đồng Smartos</option>
						<option>Hợp đồng thuê nhà dài hạn</option>
						<option>Hợp đồng thuê văn phòng</option>
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
						className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-4 focus:ring-amber-400/10 focus:border-amber-400 transition-all outline-none"
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
						className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-4 focus:ring-amber-400/10 focus:border-amber-400 transition-all outline-none"
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
						className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-4 focus:ring-amber-400/10 focus:border-amber-400 transition-all outline-none"
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
					className="w-5 h-5 rounded border-slate-300 text-amber-500 focus:ring-amber-500"
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
						className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-4 focus:ring-amber-400/10 focus:border-amber-400 transition-all outline-none"
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
						className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-4 focus:ring-amber-400/10 focus:border-amber-400 transition-all outline-none"
					/>
				</div>

				<div className="space-y-2">
					<label className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
						<Building2 className="w-3.5 h-3.5" />
						Phòng <span className="text-rose-500">*</span>
					</label>
					<select
						name="room"
						value={formData.room}
						onChange={handleChange}
						required
						className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-4 focus:ring-amber-400/10 focus:border-amber-400 transition-all outline-none"
					>
						<option value="">Chọn phòng</option>
						<option value="P101">P101</option>
						<option value="P102">P102</option>
						<option value="P103">P103</option>
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
						className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-4 focus:ring-amber-400/10 focus:border-amber-400 transition-all outline-none"
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
					name="representativeGuest"
					value={formData.representativeGuest}
					onChange={handleChange}
					required
					className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-4 focus:ring-amber-400/10 focus:border-amber-400 transition-all outline-none"
				>
					<option value="">Chọn khách hàng</option>
					<option value="Nguyễn Văn A">Nguyễn Văn A</option>
					<option value="Trần Thị B">Trần Thị B</option>
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
					className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-4 focus:ring-amber-400/10 focus:border-amber-400 transition-all outline-none resize-none"
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
					className="px-8 py-2.5 bg-[#fcd34d] text-slate-900 rounded-xl text-sm font-bold hover:bg-amber-400 shadow-lg shadow-amber-200/50 transition-all active:scale-95"
				>
					Tạo hợp đồng
				</button>
			</div>
		</form>
	);
};

export default ContractForm;

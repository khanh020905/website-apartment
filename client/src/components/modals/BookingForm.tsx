import { useState } from "react";
import { User, Phone, Calendar, Wallet, FileText, Building2 } from "lucide-react";

interface BookingFormProps {
	roomNumber: string;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	onSubmit: (data: any) => void;
	onCancel: () => void;
}

const BookingForm = ({ roomNumber, onSubmit, onCancel }: BookingFormProps) => {
	const [formData, setFormData] = useState({
		roomNumber: roomNumber || "",
		customerName: "",
		phone: "",
		email: "",
		checkInDate: new Date().toISOString().split("T")[0],
		expectedCheckOut: "",
		depositAmount: "",
		rentAmount: "",
		notes: "",
	});

	const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		onSubmit(formData);
	};

	return (
		<form
			onSubmit={handleSubmit}
			className="space-y-6"
		>
			<div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex items-center gap-3">
				<Building2 className="w-5 h-5 text-amber-600" />
				<div>
					<p className="text-[10px] font-black uppercase tracking-widest text-amber-600/60 leading-none mb-1">
						Đang đặt cho phòng
					</p>
					<p className="text-lg font-black text-amber-900 leading-none">{formData.roomNumber}</p>
				</div>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				<div className="space-y-2">
					<label className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
						<User className="w-3.5 h-3.5" />
						Họ và tên khách hàng <span className="text-rose-500">*</span>
					</label>
					<input
						type="text"
						name="customerName"
						value={formData.customerName}
						onChange={handleChange}
						required
						placeholder="VD: Nguyễn Văn A"
						className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-4 focus:ring-amber-400/10 focus:border-amber-400 transition-all outline-none"
					/>
				</div>

				<div className="space-y-2">
					<label className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
						<Phone className="w-3.5 h-3.5" />
						Số điện thoại <span className="text-rose-500">*</span>
					</label>
					<input
						type="tel"
						name="phone"
						value={formData.phone}
						onChange={handleChange}
						required
						placeholder="09xx xxx xxx"
						className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-4 focus:ring-amber-400/10 focus:border-amber-400 transition-all outline-none"
					/>
				</div>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				<div className="space-y-2">
					<label className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
						<Calendar className="w-3.5 h-3.5" />
						Ngày dự kiến nhận phòng <span className="text-rose-500">*</span>
					</label>
					<input
						type="date"
						name="checkInDate"
						value={formData.checkInDate}
						onChange={handleChange}
						required
						className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-4 focus:ring-amber-400/10 focus:border-amber-400 transition-all outline-none"
					/>
				</div>

				<div className="space-y-2">
					<label className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
						<Wallet className="w-3.5 h-3.5" />
						Tiền cọc giữ chỗ (VNĐ) <span className="text-rose-500">*</span>
					</label>
					<input
						type="number"
						name="depositAmount"
						value={formData.depositAmount}
						onChange={handleChange}
						required
						placeholder="0"
						className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-4 focus:ring-amber-400/10 focus:border-amber-400 transition-all outline-none"
					/>
				</div>
			</div>

			<div className="space-y-2">
				<label className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
					<FileText className="w-3.5 h-3.5" />
					Ghi chú đặt phòng
				</label>
				<textarea
					name="notes"
					value={formData.notes}
					onChange={handleChange}
					rows={3}
					placeholder="Nhập thông tin bổ sung..."
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
					className="px-8 py-2.5 bg-amber-400 text-slate-900 rounded-xl text-sm font-bold hover:bg-amber-500 shadow-lg shadow-amber-200/50 transition-all active:scale-95"
				>
					Xác nhận đặt phòng
				</button>
			</div>
		</form>
	);
};

export default BookingForm;

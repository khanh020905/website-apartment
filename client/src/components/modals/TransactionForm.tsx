import { Calendar, Building2, User, Wallet, FileText, Tag, CreditCard } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { useBuilding } from "../../contexts/BuildingContext";

interface TransactionFormProps {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	onSubmit: (data: any) => void;
	onCancel: () => void;
}

const TransactionForm = ({ onSubmit, onCancel }: TransactionFormProps) => {
	const { selectedBuildingId } = useBuilding();
	const [buildings, setBuildings] = useState<any[]>([]);
	const [customers, setCustomers] = useState<any[]>([]);
	const [loading, setLoading] = useState(false);

	const [formData, setFormData] = useState({
		// eslint-disable-next-line react-hooks/purity
		code: `GD-${Math.floor(Math.random() * 10000)
			.toString()
			.padStart(4, "0")}`,
		date: new Date().toISOString().split("T")[0],
		building_id: selectedBuildingId || "",
		room_id: "",
		customer_id: "",
		flow: "income", // income | expense
		category: "",
		payment_method: "bank_transfer", // cash | bank_transfer | credit_card
		amount: "",
		note: "",
	});

	useEffect(() => {
		const fetchData = async () => {
			setLoading(true);
			try {
				const [bRes, cRes] = await Promise.all([
					api.get<any>("/api/buildings"),
					api.get<any>(`/api/customers?building_id=${formData.building_id || ""}`)
				]);
				setBuildings(bRes.data?.buildings || []);
				setCustomers(cRes.data?.customers || []);
			} catch (err) {
				console.error(err);
			}
			setLoading(false);
		};
		fetchData();
	}, [formData.building_id]);

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
	) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		const amount = Number(formData.amount);
		if (!Number.isFinite(amount) || amount <= 0) return;

		const selectedCustomer = customers.find((c) => c.id === formData.customer_id);
		onSubmit({
			building_id: formData.building_id,
			room_id: formData.room_id || null,
			customer_name: selectedCustomer?.tenant_name || null,
			flow: formData.flow,
			category: formData.category,
			payment_method: formData.payment_method,
			amount,
			note: formData.note.trim() || null,
			transaction_date: formData.date,
		});
	};

	return (
		<form
			onSubmit={handleSubmit}
			className="space-y-6"
		>
			<div className="flex p-1 bg-slate-100 rounded-2xl w-fit">
				<button
					type="button"
					onClick={() => setFormData((prev) => ({ ...prev, flow: "income" }))}
					className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${formData.flow === "income" ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
				>
					Phiếu nạp
				</button>
				<button
					type="button"
					onClick={() => setFormData((prev) => ({ ...prev, flow: "expense" }))}
					className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${formData.flow === "expense" ? "bg-white text-rose-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
				>
					Phiếu rút
				</button>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				<div className="space-y-2">
					<label className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
						<Calendar className="w-3.5 h-3.5" />
						Ngày giao dịch <span className="text-rose-500">*</span>
					</label>
					<input
						type="date"
						name="date"
						value={formData.date}
						onChange={handleChange}
						required
						className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary transition-all outline-none"
					/>
				</div>

				<div className="space-y-2">
					<label className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
						<Wallet className="w-3.5 h-3.5" />
						Số tiền (VNĐ) <span className="text-rose-500">*</span>
					</label>
					<input
						type="number"
						name="amount"
						value={formData.amount}
						onChange={handleChange}
						required
						placeholder="0"
						className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary transition-all outline-none"
					/>
				</div>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				<div className="space-y-2">
					<label className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
						<Building2 className="w-3.5 h-3.5" />
						Toà nhà
					</label>
					<select
						name="building_id"
						value={formData.building_id}
						onChange={handleChange}
						className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary transition-all outline-none appearance-none"
					>
						<option value="">Tất cả toà nhà</option>
						{buildings.map(b => (
							<option key={b.id} value={b.id}>{b.name}</option>
						))}
					</select>
				</div>

				<div className="space-y-2">
					<label className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
						<Tag className="w-3.5 h-3.5" />
						Nhóm giao dịch <span className="text-rose-500">*</span>
					</label>
					<select
						name="category"
						value={formData.category}
						onChange={handleChange}
						required
						className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary transition-all outline-none appearance-none"
					>
						<option value="">Chọn nhóm giao dịch</option>
						<option value="rent">Tiền thuê phòng</option>
						<option value="utilities">Tiện ích (Điện/Nước)</option>
						<option value="service">Dịch vụ</option>
						<option value="other">Nạp/Rút khác</option>
					</select>
				</div>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				<div className="space-y-2">
					<label className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
						<User className="w-3.5 h-3.5" />
						Đối tượng
					</label>
					<select
						name="customer_id"
						value={formData.customer_id}
						onChange={handleChange}
						className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary transition-all outline-none appearance-none"
					>
						<option value="">Chọn khách hàng (tuỳ chọn)</option>
						{customers.map(c => (
							<option key={c.id} value={c.id}>{c.tenant_name}</option>
						))}
					</select>
				</div>

				<div className="space-y-2">
					<label className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
						<CreditCard className="w-3.5 h-3.5" />
						Hình thức thanh toán <span className="text-rose-500">*</span>
					</label>
					<select
						name="payment_method"
						value={formData.payment_method}
						onChange={handleChange}
						required
						className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary transition-all outline-none appearance-none"
					>
						<option value="bank_transfer">Chuyển khoản</option>
						<option value="cash">Tiền mặt</option>
						<option value="credit_card">Thẻ ngân hàng</option>
					</select>
				</div>
			</div>

			<div className="space-y-2">
				<label className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
					<FileText className="w-3.5 h-3.5" />
					Ghi chú
				</label>
				<textarea
					name="note"
					value={formData.note}
					onChange={handleChange}
					rows={3}
					placeholder="Nội dung giao dịch..."
					className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary transition-all outline-none resize-none"
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
					{loading ? "Đang xử lý..." : "Xác nhận tạo"}
				</button>
			</div>
		</form>
	);
};

export default TransactionForm;

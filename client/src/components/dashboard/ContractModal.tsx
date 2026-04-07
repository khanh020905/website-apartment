import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, User, Phone, Mail, Calendar, CreditCard, Notebook, ShieldCheck } from "lucide-react";
import type { ContractWithRoom, Room, Building } from "../../../../shared/types";

interface ContractModalProps {
	isOpen: boolean;
	onClose: () => void;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	onSave: (data: any) => void;
	initialData?: ContractWithRoom;
	room?: Room & { building?: Building };
}

export function ContractModal({ isOpen, onClose, onSave, initialData, room }: ContractModalProps) {
	const [formData, setFormData] = useState({
		tenant_name: "",
		tenant_phone: "",
		tenant_email: "",
		start_date: new Date().toISOString().split("T")[0],
		end_date: "",
		rent_amount: "",
		deposit_amount: "",
		notes: "",
	});

	useEffect(() => {
		if (initialData) {
			// eslint-disable-next-line react-hooks/set-state-in-effect
			setFormData({
				tenant_name: initialData.tenant_name,
				tenant_phone: initialData.tenant_phone || "",
				tenant_email: initialData.tenant_email || "",
				start_date: initialData.start_date.split("T")[0],
				end_date: initialData.end_date ? initialData.end_date.split("T")[0] : "",
				rent_amount: (initialData.rent_amount / 1000000).toString(),
				deposit_amount: (initialData.deposit_amount / 1000000).toString(),
				notes: initialData.notes || "",
			});
		} else if (room) {
			setFormData((prev) => ({
				...prev,
				rent_amount: (room.price ? room.price / 1000000 : 0).toString(),
			}));
		}
	}, [initialData, room, isOpen]);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		onSave({
			...formData,
			room_id: room?.id || initialData?.room_id,
			rent_amount: Number(formData.rent_amount) * 1000000,
			deposit_amount: Number(formData.deposit_amount) * 1000000,
		});
	};

	if (!isOpen) return null;

	return (
		<AnimatePresence>
			<div className="fixed inset-0 z-60 flex items-center justify-center p-4">
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
					onClick={onClose}
				/>

				<motion.div
					initial={{ opacity: 1, scale: 1, y: 0 }}
					animate={{ opacity: 1, scale: 1, y: 0 }}
					exit={{ opacity: 0, scale: 0.95, y: 20 }}
					className="relative w-full max-w-2xl bg-white rounded-[40px] shadow-2xl shadow-brand-ink/20 overflow-hidden"
				>
					{/* Header */}
					<div className="p-8 border-b border-slate-50 flex items-center justify-between bg-linear-to-r from-brand-primary/5 to-transparent">
						<div>
							<div className="flex items-center gap-2 mb-1">
								<ShieldCheck className="w-5 h-5 text-brand-primary" />
								<span className="text-[10px] font-black uppercase tracking-widest text-brand-primary/60">
									Rental Agreement
								</span>
							</div>
							<h2 className="text-3xl font-black text-brand-ink tracking-tight">
								{initialData ? "Chi tiết hợp đồng" : `Tạo hợp đồng - Phòng ${room?.room_number}`}
							</h2>
						</div>
						<button
							onClick={onClose}
							className="p-3 hover:bg-brand-primary/5 rounded-2xl transition-colors cursor-pointer"
						>
							<X className="w-6 h-6 text-slate-400" />
						</button>
					</div>

					<form
						onSubmit={handleSubmit}
						className="p-4 md:p-8 overflow-y-auto max-h-[70vh] grid grid-cols-1 md:grid-cols-2 gap-6 scrollbar-hide"
					>
						{/* Tenant Info */}
						<div className="col-span-full mb-2">
							<h3 className="text-xs font-black text-slate-300 uppercase tracking-widest flex items-center gap-2 mb-4">
								<User className="w-4 h-4" /> Thông tin khách thuê
							</h3>
						</div>

						<div className="space-y-1">
							<label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
								Họ tên khách *
							</label>
							<div className="relative group">
								<input
									type="text"
									required
									value={formData.tenant_name}
									onChange={(e) => setFormData({ ...formData, tenant_name: e.target.value })}
									className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:outline-none focus:border-brand-primary focus:bg-white transition-all pl-11"
									placeholder="Nguyễn Văn A"
								/>
								<User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-brand-primary transition-colors" />
							</div>
						</div>

						<div className="space-y-1">
							<label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
								Số điện thoại
							</label>
							<div className="relative group">
								<input
									type="tel"
									value={formData.tenant_phone}
									onChange={(e) => setFormData({ ...formData, tenant_phone: e.target.value })}
									className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:outline-none focus:border-brand-primary focus:bg-white transition-all pl-11"
									placeholder="09xx xxx xxx"
								/>
								<Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-brand-primary transition-colors" />
							</div>
						</div>

						<div className="space-y-1 col-span-full">
							<label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
								Email
							</label>
							<div className="relative group">
								<input
									type="email"
									value={formData.tenant_email}
									onChange={(e) => setFormData({ ...formData, tenant_email: e.target.value })}
									className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:outline-none focus:border-brand-primary focus:bg-white transition-all pl-11"
									placeholder="tenant@example.com"
								/>
								<Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-brand-primary transition-colors" />
							</div>
						</div>

						{/* Terms */}
						<div className="col-span-full mt-4 mb-2">
							<h3 className="text-xs font-black text-slate-300 uppercase tracking-widest flex items-center gap-2 mb-4">
								<Calendar className="w-4 h-4" /> Thời hạn & Tài chính
							</h3>
						</div>

						<div className="space-y-1">
							<label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
								Ngày bắt đầu *
							</label>
							<div className="relative group">
								<input
									type="date"
									required
									value={formData.start_date}
									onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
									className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:outline-none focus:border-brand-primary focus:bg-white transition-all pl-11"
								/>
								<Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-brand-primary transition-colors" />
							</div>
						</div>

						<div className="space-y-1">
							<label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
								Ngày kết thúc
							</label>
							<div className="relative group">
								<input
									type="date"
									value={formData.end_date}
									onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
									className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:outline-none focus:border-brand-primary focus:bg-white transition-all pl-11"
								/>
								<Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-brand-primary transition-colors" />
							</div>
						</div>

						<div className="space-y-1">
							<label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
								Tiền thuê (triệu/tháng) *
							</label>
							<div className="relative group">
								<input
									type="number"
									step="0.1"
									required
									value={formData.rent_amount}
									onChange={(e) => setFormData({ ...formData, rent_amount: e.target.value })}
									className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:outline-none focus:border-brand-primary focus:bg-white transition-all pl-11"
									placeholder="3.5"
								/>
								<CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-brand-primary transition-colors" />
							</div>
						</div>

						<div className="space-y-1">
							<label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
								Tiền cọc (triệu)
							</label>
							<div className="relative group">
								<input
									type="number"
									step="0.1"
									value={formData.deposit_amount}
									onChange={(e) => setFormData({ ...formData, deposit_amount: e.target.value })}
									className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:outline-none focus:border-brand-primary focus:bg-white transition-all pl-11"
									placeholder="3.5"
								/>
								<ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-brand-primary transition-colors" />
							</div>
						</div>

						<div className="col-span-full space-y-1 mt-4">
							<label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
								Ghi chú bổ sung
							</label>
							<div className="relative group">
								<textarea
									rows={2}
									value={formData.notes}
									onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
									className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:outline-none focus:border-brand-primary focus:bg-white transition-all resize-none pl-11"
									placeholder="Ghi chú về cọc, điện nước, xe cộ..."
								/>
								<Notebook className="absolute left-4 top-6 w-4 h-4 text-slate-300 group-focus-within:text-brand-primary transition-colors" />
							</div>
						</div>

						{/* Actions */}
						<div className="col-span-full pt-8 flex gap-4">
							<button
								type="button"
								onClick={onClose}
								className="flex-1 py-4 border-2 border-slate-100 text-slate-400 rounded-3xl text-sm font-black uppercase tracking-widest hover:bg-slate-50 hover:border-slate-200 transition-all cursor-pointer"
							>
								Hủy bỏ
							</button>
							<button
								type="submit"
								className="flex-1 py-4 bg-brand-primary text-white rounded-3xl text-sm font-black uppercase tracking-widest hover:bg-brand-dark shadow-xl shadow-brand-primary/20 hover:scale-[1.02] transition-all cursor-pointer"
							>
								{initialData ? "Cập nhật" : "Tạo hợp đồng"}
							</button>
						</div>
					</form>
				</motion.div>
			</div>
		</AnimatePresence>
	);
}

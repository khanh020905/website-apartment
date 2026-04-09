import { useState } from "react";
import { FileText, Upload, Info } from "lucide-react";

interface ContractTemplateFormProps {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	initialData?: any;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	onSubmit: (data: any) => void;
	onCancel: () => void;
}

export default function ContractTemplateForm({ initialData, onSubmit, onCancel }: ContractTemplateFormProps) {
	const [formData, setFormData] = useState({
		name: initialData?.name || "",
		short_name: initialData?.short_name || "",
		prefix_code: initialData?.prefix_code || "",
		reminder_days: initialData?.reminder_days ?? 30,
		file: null as File | null,
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		onSubmit(formData);
	};

	const TAGS = [
		"{ContractName} - Tên hợp đồng",
		"{ContractCode} - Số hợp đồng",
		"{CurrentDate} - Ngày tạo hợp đồng",
		"{LessorName} - Tên bên cho thuê",
		"{CustomerName} - Tên khách hàng",
		"{CustomerPhone} - Số điện thoại khách",
		"{RoomNumber} - Số phòng",
		"{Price} - Giá thuê",
		"{Deposit} - Tiền cọc",
		"{StartDate} - Ngày bắt đầu",
		"{EndDate} - Ngày kết thúc",
	];

	return (
		<form
			onSubmit={handleSubmit}
			className="flex flex-col h-[calc(100vh-140px)] max-h-175"
		>
			<div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-thin scrollbar-thumb-slate-200">
				{/* Basic Information */}
				<section className="space-y-4">
					<div className="flex items-center gap-2 pb-2 border-b border-slate-100">
						<div className="w-8 h-8 rounded-lg bg-brand-bg text-brand-dark flex items-center justify-center">
							<FileText className="w-4 h-4" />
						</div>
						<h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight">
							Thông tin cơ bản
						</h3>
					</div>

					<div className="space-y-4">
						<div className="space-y-1.5">
							<label className="text-[13px] font-semibold text-slate-700">
								Tên mẫu hợp đồng <span className="text-rose-500">*</span>
							</label>
							<input
								required
								type="text"
								value={formData.name}
								onChange={(e) => setFormData({ ...formData, name: e.target.value })}
								placeholder="Nhập tên mẫu hợp đồng..."
								className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20/20 focus:border-brand-primary transition-all font-medium text-slate-900"
							/>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-1.5">
								<label className="text-[13px] font-semibold text-slate-700">Tên viết tắt</label>
								<input
									type="text"
									value={formData.short_name}
									onChange={(e) => setFormData({ ...formData, short_name: e.target.value })}
									placeholder="Ví dụ: HD-STUDIO"
									className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20/20 focus:border-brand-primary transition-all text-slate-900 font-medium"
								/>
							</div>
							<div className="space-y-1.5">
								<label className="text-[13px] font-semibold text-slate-700">Mẫu số hợp đồng</label>
								<input
									type="text"
									value={formData.prefix_code}
									onChange={(e) => setFormData({ ...formData, prefix_code: e.target.value })}
									placeholder="Ví dụ: HD{YYYY}{MM}"
									className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20/20 focus:border-brand-primary transition-all text-slate-900 font-medium"
								/>
							</div>
						</div>

						<div className="space-y-1.5">
							<label className="text-[13px] font-semibold text-slate-700">
								Nhắc nhở kỳ hạn (ngày) <span className="text-rose-500">*</span>
							</label>
							<input
								required
								type="number"
								min="0"
								value={formData.reminder_days}
								onChange={(e) =>
									setFormData({ ...formData, reminder_days: parseInt(e.target.value) || 0 })
								}
								className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20/20 focus:border-brand-primary transition-all text-slate-900 font-medium"
							/>
							<p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
								<Info className="w-3.5 h-3.5" />
								Hệ thống sẽ thông báo trước khi hợp đồng hết hạn.
							</p>
						</div>
					</div>
				</section>

				{/* File Upload Section */}
				<section className="space-y-4">
					<div className="flex items-center gap-2 pb-2 border-b border-slate-100">
						<div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
							<Upload className="w-4 h-4" />
						</div>
						<h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight">
							File mẫu hợp đồng
						</h3>
					</div>

					<div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center text-center hover:bg-slate-50/50 hover:border-brand-primary transition-colors cursor-pointer group">
						<div className="w-12 h-12 bg-white border border-slate-200 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
							<FileText className="w-6 h-6 text-slate-400 group-hover:text-brand-primary transition-colors" />
						</div>
						<p className="text-sm font-bold text-slate-700 mb-1">
							Kéo thả tệp vào đây hoặc click để tải lên
						</p>
						<p className="text-xs font-medium text-slate-500">
							Chỉ hỗ trợ tệp định dạng .docx (Word)
						</p>
						<button
							type="button"
							className="mt-4 px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 shadow-sm hover:border-brand-primary hover:text-brand-dark transition-all"
						>
							Chọn tệp từ máy tính
						</button>
					</div>
				</section>

				{/* Tags Guide */}
				<section className="space-y-4">
					<div className="flex items-center justify-between pb-2 border-b border-slate-100">
						<div className="flex items-center gap-2">
							<div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
								<Info className="w-4 h-4" />
							</div>
							<h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight">
								Danh sách thẻ dữ liệu (Tags)
							</h3>
						</div>
					</div>

					<div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
						<p className="text-xs text-slate-600 font-medium mb-3">
							Vui lòng chèn các nhãn chính xác (bao gồm cả dấu ngoặc nhọn) vào nội dung file Word
							của bạn. Hệ thống sẽ tự động thay thế bằng dữ liệu thực tế khi xuất hợp đồng:
						</p>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-2">
							{TAGS.map((tag, idx) => (
								<div
									key={idx}
									className="flex items-center gap-2 p-2 bg-white border border-slate-100 rounded-lg text-xs font-medium text-slate-700 hover:border-brand-primary/20 transition-colors cursor-default"
								>
									<span className="w-1.5 h-1.5 rounded-full bg-brand-primary shrink-0"></span>
									<code className="font-mono text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded text-[11px] font-bold">
										{tag.split(" - ")[0]}
									</code>
									<span className="text-slate-500 text-[11px] truncate">{tag.split(" - ")[1]}</span>
								</div>
							))}
						</div>
					</div>
				</section>
			</div>

			<div className="p-4 border-t border-slate-100 bg-slate-50/80 flex items-center justify-end gap-3 shrink-0">
				<button
					type="button"
					onClick={onCancel}
					className="px-6 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-200 bg-slate-100 rounded-xl transition-colors"
				>
					Hủy bỏ
				</button>
				<button
					type="submit"
					className="px-8 py-2.5 text-sm font-bold text-white bg-brand-primary hover:bg-brand-dark rounded-xl shadow-sm transition-all active:scale-[0.98]"
				>
					Xác nhận
				</button>
			</div>
		</form>
	);
}

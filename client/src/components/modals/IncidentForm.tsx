import { useEffect, useState, useRef } from "react";
import { Calendar, Upload, ChevronDown, Plus, X } from "lucide-react";
import { api } from "../../lib/api";

interface IncidentFormProps {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	onSubmit: (data: any) => void;
	onCancel: () => void;
	initialData?: any;
}

export default function IncidentForm({ onSubmit, onCancel, initialData }: IncidentFormProps) {
	const [buildings, setBuildings] = useState<any[]>([]);
	const [incidentTypes, setIncidentTypes] = useState<any[]>([]);
	const [rooms, setRooms] = useState<any[]>([]);
	const [customers, setCustomers] = useState<any[]>([]);
	const [loading, setLoading] = useState(false);
	const [uploading, setUploading] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [attachments, setAttachments] = useState<string[]>([]);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const [formData, setFormData] = useState({
		locationId: initialData?.building_id || "",
		issueLocation: initialData?.room_id || "",
		customerId: initialData?.customer_id || "",
		contactPhone: initialData?.contact_phone || "",
		incidentType: initialData?.type_id || "",
		priority: initialData?.priority || "Thấp",
		description: initialData?.description || "",
		dueDate: initialData?.due_date ? initialData.due_date.split('T')[0] : "",
		assignee: initialData?.assignee_name || "",
	});

	useEffect(() => {
		if (initialData?.images && Array.isArray(initialData.images)) {
			setAttachments(initialData.images);
		}
	}, [initialData]);

	useEffect(() => {
		const fetchData = async () => {
			setLoading(true);
			try {
				const [bRes, tRes, cRes] = await Promise.all([
					api.get<any>("/api/buildings"),
					api.get<any>("/api/incident-types"),
					api.get<any>("/api/customers?limit=1000")
				]);
				setBuildings(bRes.data?.buildings || []);
				setIncidentTypes(tRes.data || []);
				setCustomers(cRes.data?.customers || []);
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

	const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		setUploading(true);
		const uploadData = new FormData();
		uploadData.append("file", file);

		try {
			const res = await api.upload<{ url: string }>("/api/incidents/upload", uploadData);
			if (res.data?.url) {
				setAttachments(prev => [...prev, res.data!.url]);
			}
		} catch (err) {
			console.error("Upload failed:", err);
			alert("Tải lên thất bại");
		} finally {
			setUploading(false);
		}
	};

	const removeAttachment = (url: string) => {
		setAttachments(prev => prev.filter(a => a !== url));
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (isSubmitting) return;
		setIsSubmitting(true);
		
		const priorityMap: Record<string, string> = {
			'Khẩn cấp': 'emergency',
			'Cao': 'high',
			'Trung bình': 'medium',
			'Thấp': 'low'
		};

		const selectedRoom = rooms.find(r => r.id === formData.issueLocation);
		const selectedCustomer = customers.find(c => c.id === formData.customerId);
		const selectedType = incidentTypes.find(t => t.id === formData.incidentType);

		const submissionData = {
			building_id: formData.locationId,
			room_id: selectedRoom ? selectedRoom.id : null,
			customer_id: formData.customerId || null,
			contact_phone: formData.contactPhone,
			location: selectedRoom ? `Phòng ${selectedRoom.room_number}` : (formData.issueLocation === 'COMMON' ? 'Khu vực chung' : 'Khác'),
			type_id: formData.incidentType,
			priority: priorityMap[formData.priority] || 'low',
			description: formData.description,
			due_date: formData.dueDate || null,
			reporter_name: selectedCustomer ? selectedCustomer.tenant_name || selectedCustomer.full_name : 'Khách vãng lai',
			assignee_name: formData.assignee || (selectedType?.default_assignee || ''),
			images: attachments,
			status: initialData ? initialData.status : 'pending'
		};

		onSubmit(submissionData);
	};

	return (
		<form
			onSubmit={handleSubmit}
			className="flex flex-col h-[calc(100vh-140px)] max-h-175 bg-white font-sans"
		>
			<div className="flex-1 overflow-y-auto p-6 space-y-6">
				{/* Basic Information */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
					<div className="space-y-1">
						<label className="text-[14px] font-bold text-[#1A1A1A]">
							Toà nhà <span className="text-red-500">*</span>
						</label>
						<div className="relative">
							<select
								required
								value={formData.locationId}
								onChange={(e) => setFormData({ ...formData, locationId: e.target.value, issueLocation: "" })}
								className="w-full px-3 py-2 border border-slate-200 rounded-[8px] text-[14px] font-medium text-slate-900 focus:outline-none focus:border-brand-primary hover:border-slate-300 transition-all appearance-none bg-white cursor-pointer"
							>
								<option value="">Chọn toà nhà</option>
								{buildings.map(b => (
									<option key={b.id} value={b.id}>{b.name}</option>
								))}
							</select>
							<ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
						</div>
					</div>

					<div className="space-y-1">
						<label className="text-[14px] font-bold text-[#1A1A1A]">
							Vị trí sự cố <span className="text-red-500">*</span>
						</label>
						<div className="relative">
							<select
								required
								value={formData.issueLocation}
								onChange={(e) => setFormData({ ...formData, issueLocation: e.target.value })}
								disabled={!formData.locationId}
								className="w-full px-3 py-2 border border-slate-200 rounded-[8px] text-[14px] font-medium text-slate-900 focus:outline-none focus:border-brand-primary hover:border-slate-300 transition-all appearance-none bg-white cursor-pointer disabled:bg-slate-50 disabled:cursor-not-allowed"
							>
								<option value="">Chọn vị trí sự cố</option>
								<option value="COMMON">Khu vực chung</option>
								{rooms.map(r => (
									<option key={r.id} value={r.id}>P{r.room_number}</option>
								))}
							</select>
							<ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
						</div>
					</div>

					<div className="space-y-1">
						<label className="text-[14px] font-bold text-[#1A1A1A]">Khách hàng</label>
						<div className="relative">
							<select
								value={formData.customerId}
								onChange={(e) => {
									const customerId = e.target.value;
									const customer = customers.find(c => c.id === customerId);
									setFormData({ 
										...formData, 
										customerId, 
										contactPhone: customer?.tenant_phone || "" 
									});
								}}
								className="w-full px-3 py-2 border border-slate-200 rounded-[8px] text-[14px] font-medium text-slate-900 focus:outline-none focus:border-brand-primary hover:border-slate-300 transition-all appearance-none bg-white cursor-pointer"
							>
								<option value="">Chọn khách hàng</option>
								{customers
									.filter(c => !formData.locationId || c.room?.building_id === formData.locationId)
									.map(c => (
									<option key={c.id} value={c.id}>
										{c.tenant_name} {c.tenant_phone ? `(${c.tenant_phone})` : ""}
									</option>
								))}
							</select>
							<ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
						</div>
					</div>

					<div className="space-y-1">
						<label className="text-[14px] font-bold text-[#1A1A1A]">Số liên hệ</label>
						<input
							type="text"
							value={formData.contactPhone}
							onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
							placeholder="Số liên hệ"
							className="w-full px-3 py-2 border border-slate-200 rounded-[8px] text-[14px] font-medium text-slate-900 focus:outline-none focus:border-brand-primary hover:border-slate-300 transition-all placeholder-slate-300"
						/>
					</div>

					<div className="space-y-1">
						<label className="text-[14px] font-bold text-[#1A1A1A]">
							Loại sự cố <span className="text-red-500">*</span>
						</label>
						<div className="relative">
							<select
								required
								value={formData.incidentType}
								onChange={(e) => setFormData({ ...formData, incidentType: e.target.value })}
								className="w-full px-3 py-2 border border-slate-200 rounded-[8px] text-[14px] font-medium text-slate-900 focus:outline-none focus:border-brand-primary hover:border-slate-300 transition-all appearance-none bg-white cursor-pointer"
							>
								<option value="">Chọn loại sự cố</option>
								{incidentTypes.map(t => (
									<option key={t.id} value={t.id}>{t.name}</option>
								))}
							</select>
							<ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
						</div>
					</div>

					<div className="space-y-1">
						<label className="text-[14px] font-bold text-[#1A1A1A]">Ưu tiên</label>
						<div className="relative">
							<select
								value={formData.priority}
								onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
								className="w-full px-3 py-2 border border-slate-200 rounded-[8px] text-[14px] font-medium text-slate-900 focus:outline-none focus:border-brand-primary hover:border-slate-300 transition-all appearance-none bg-white cursor-pointer"
							>
								<option value="Khẩn cấp">Khẩn cấp</option>
								<option value="Cao">Cao</option>
								<option value="Trung bình">Trung bình</option>
								<option value="Thấp">Thấp</option>
							</select>
							<ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
						</div>
					</div>
				</div>

				<div className="space-y-1">
					<label className="text-[14px] font-bold text-[#1A1A1A]">
						Mô tả <span className="text-red-500">*</span>
					</label>
					<textarea
						required
						value={formData.description}
						onChange={(e) => setFormData({ ...formData, description: e.target.value })}
						placeholder="Mô tả"
						className="w-full h-[100px] px-3 py-2 border border-slate-200 rounded-[8px] text-[14px] font-medium text-slate-900 focus:outline-none focus:border-brand-primary hover:border-slate-300 transition-all resize-none placeholder-slate-300"
					/>
				</div>

				<div className="space-y-2">
					<label className="text-[14px] font-bold text-[#1A1A1A]">Tệp đính kèm</label>
					
					<div className="flex flex-wrap gap-3 mb-3">
						{attachments.map((url, idx) => (
							<div key={idx} className="relative w-20 h-20 rounded-lg border border-slate-200 overflow-hidden group bg-slate-50">
								<img src={url} alt="Attachment" className="w-full h-full object-contain" />
								<button
									type="button"
									onClick={() => removeAttachment(url)}
									className="absolute top-1 right-1 p-1 bg-white/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
								>
									<X className="w-3.5 h-3.5 text-red-500" />
								</button>
							</div>
						))}
						{uploading && (
							<div className="w-20 h-20 rounded-lg border border-slate-200 flex items-center justify-center bg-slate-50">
								<div className="w-5 h-5 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
							</div>
						)}
					</div>

					<div 
						onClick={() => fileInputRef.current?.click()}
						className="border border-dashed border-slate-200 rounded-[8px] p-8 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer group"
					>
						<Upload className="w-8 h-8 text-slate-300 mb-2 group-hover:text-brand-primary transition-colors" />
						<p className="text-[14px] font-medium text-slate-600 mb-1">
							Tải lên hình ảnh hoặc video.
						</p>
						<p className="text-[12px] text-slate-400">Kích thước tệp tối đa: 50 MB</p>
					</div>
					<input 
						type="file" 
						ref={fileInputRef} 
						className="hidden" 
						accept="image/*,video/*"
						onChange={handleFileUpload} 
					/>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 pt-4 border-t border-slate-100">
					<div className="space-y-1">
						<label className="text-[14px] font-bold text-[#1A1A1A]">Ngày đến hạn</label>
						<div className="relative">
							<input
								type="date"
								value={formData.dueDate}
								onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
								className="w-full px-3 py-2 border border-slate-200 rounded-[8px] text-[14px] font-medium text-slate-900 focus:outline-none focus:border-brand-primary hover:border-slate-300 transition-all cursor-pointer bg-white"
							/>
							<Calendar className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
						</div>
					</div>

					<div className="space-y-1">
						<label className="text-[14px] font-bold text-[#1A1A1A]">Người đảm nhận</label>
						<button
							type="button"
							className="w-full flex items-center justify-between px-3 py-2 bg-white border border-slate-200 rounded-[8px] text-[14px] hover:border-slate-300 transition-all group"
						>
							<span className="font-medium text-slate-400">Chọn người đảm nhận</span>
							<div className="w-5 h-5 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 group-hover:bg-brand-primary group-hover:text-white transition-all">
								<Plus className="w-3.5 h-3.5" />
							</div>
						</button>
					</div>
				</div>
			</div>

			<div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3 shrink-0">
				<button
					type="button"
					onClick={onCancel}
					className="px-8 py-2 text-[14px] font-bold text-slate-600 bg-white border border-slate-200 rounded-[8px] hover:bg-slate-50 transition-colors shadow-sm cursor-pointer"
				>
					Hủy
				</button>
				<button
					type="submit"
					disabled={loading || isSubmitting}
					className={`px-8 py-2 text-[14px] font-bold text-white bg-brand-primary hover:bg-brand-dark rounded-[8px] transition-colors shadow-sm cursor-pointer shadow-brand-primary/20 ${(loading || isSubmitting) ? "opacity-50 cursor-not-allowed" : ""}`}
				>
					{(loading || isSubmitting) ? "Đang xử lý..." : initialData ? "Cập nhật" : "Xác nhận"}
				</button>
			</div>
		</form>
	);
}

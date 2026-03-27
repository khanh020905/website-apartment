import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Home, Layers, Maximize, DollarSign, Users, AlertCircle } from "lucide-react";
import { api } from "../../lib/api";
import type {
	Room,
	CreateRoomInput,
	RoomStatus,
	FurnitureStatus,
	Amenity,
} from "../../../../shared/types";
import { ROOM_STATUS_LABELS, FURNITURE_LABELS } from "../../../../shared/types";

interface RoomModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSave: (data: CreateRoomInput) => void;
	initialData?: Room;
	amenities: Amenity[];
}

export const RoomModal = ({ isOpen, onClose, onSave, initialData, amenities }: RoomModalProps) => {
	const [formData, setFormData] = useState<CreateRoomInput>({
		building_id: "",
		room_number: "",
		floor: 1,
		area: 0,
		price: 0,
		max_occupants: 1,
		status: "available",
		furniture: "none",
		amenity_ids: [],
		images: [],
		description: "",
	});
	const [uploadingImages, setUploadingImages] = useState(false);
	const [error, setError] = useState("");
	const [dragIndex, setDragIndex] = useState<number | null>(null);
	const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

	useEffect(() => {
		if (initialData) {
			// eslint-disable-next-line react-hooks/set-state-in-effect
			setFormData({
				building_id: initialData.building_id,
				room_number: initialData.room_number,
				floor: initialData.floor,
				area: initialData.area || 0,
				price: initialData.price ? initialData.price / 1000000 : 0, // Assume client works in " triệu"
				max_occupants: initialData.max_occupants,
				status: initialData.status,
				furniture: initialData.furniture,
				amenity_ids: initialData.amenity_ids || [],
				images: initialData.images || [],
				description: initialData.description || "",
			});
		} else {
			setFormData((prev) => ({
				...prev,
				room_number: "",
				floor: 1,
				area: 0,
				price: 0,
				amenity_ids: [],
				images: [],
				description: "",
			}));
		}
	}, [initialData, isOpen]);

	const toggleAmenity = (id: number) => {
		setFormData((prev) => ({
			...prev,
			amenity_ids:
				prev.amenity_ids?.includes(id) ?
					prev.amenity_ids.filter((i) => i !== id)
				:	[...(prev.amenity_ids || []), id],
		}));
	};

	const handleImageFiles = async (files: FileList | null) => {
		if (!files || files.length === 0) return;
		const incoming = Array.from(files);
		const nextCount = (formData.images || []).length + incoming.length;
		if (nextCount > 10) {
			setError("Tối đa 10 ảnh");
			return;
		}

		for (const file of incoming) {
			if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
				setError("Chỉ chấp nhận JPG, PNG, WebP");
				return;
			}
			if (file.size > 5 * 1024 * 1024) {
				setError("Mỗi ảnh tối đa 5MB");
				return;
			}
		}

		setError("");
		setUploadingImages(true);
		const uploadData = new FormData();
		incoming.forEach((file) => uploadData.append("images", file));

		const { data, error: uploadError } = await api.upload<{
			images: { url: string; order: number }[];
		}>("/api/listings/upload-images", uploadData);
		setUploadingImages(false);

		if (uploadError || !data) {
			setError(uploadError || "Upload ảnh thất bại");
			return;
		}
		if (!Array.isArray(data.images) || data.images.length === 0) {
			setError("Upload ảnh không thành công, vui lòng thử lại.");
			return;
		}
		const sorted = [...data.images].sort((a, b) => a.order - b.order).map((img) => img.url);
		setFormData((prev) => ({ ...prev, images: [...(prev.images || []), ...sorted] }));
	};

	const moveImage = (from: number, to: number) => {
		if (from === to) return;
		setFormData((prev) => {
			const next = [...(prev.images || [])];
			const [item] = next.splice(from, 1);
			next.splice(to, 0, item);
			return { ...prev, images: next };
		});
	};

	const handleSave = (e: React.FormEvent) => {
		e.preventDefault();
		onSave({
			...formData,
			price: (formData.price || 0) * 1000000, // Convert back to VND
		});
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-100 flex items-center justify-center p-4">
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				exit={{ opacity: 0 }}
				onClick={onClose}
				className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
			/>

			<motion.div
				initial={{ scale: 0.95, opacity: 0, y: 20 }}
				animate={{ scale: 1, opacity: 1, y: 0 }}
				exit={{ scale: 0.95, opacity: 0, y: 20 }}
				className="relative bg-white w-full max-w-2xl rounded-[48px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
			>
				{/* Header */}
				<div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
					<div>
						<h3 className="text-xl font-black text-brand-ink tracking-tight flex items-center gap-2">
							<Home className="w-6 h-6 text-brand-primary" />
							{initialData ? "Chỉnh sửa phòng" : "Thêm phòng mới"}
						</h3>
						<p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
							Cung cấp thông tin chi tiết cho phòng trọ
						</p>
					</div>
					<button
						onClick={onClose}
						className="p-3 bg-white hover:bg-slate-100 rounded-2xl transition-colors shadow-sm cursor-pointer"
					>
						<X className="w-5 h-5 text-slate-400" />
					</button>
				</div>

				{/* Content */}
				<form
					onSubmit={handleSave}
					className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide"
				>
					<div className="grid grid-cols-2 gap-6">
						{/* Room ID / Number */}
						<div className="space-y-3">
							<label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">
								Số phòng *
							</label>
							<div className="relative">
								<Home className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
								<input
									required
									type="text"
									placeholder="VD: 101, P.01"
									value={formData.room_number}
									onChange={(e) => setFormData({ ...formData, room_number: e.target.value })}
									className="w-full h-14 pl-12 pr-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold placeholder-slate-300 focus:bg-white focus:border-brand-primary transition-all outline-none"
								/>
							</div>
						</div>

						{/* Floor */}
						<div className="space-y-3">
							<label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">
								Tầng *
							</label>
							<div className="relative">
								<Layers className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
								<input
									required
									type="number"
									placeholder="1"
									value={formData.floor}
									onChange={(e) => setFormData({ ...formData, floor: Number(e.target.value) })}
									className="w-full h-14 pl-12 pr-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold placeholder-slate-300 focus:bg-white focus:border-brand-primary transition-all outline-none"
								/>
							</div>
						</div>

						{/* Area */}
						<div className="space-y-3">
							<label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">
								Diện tích (m²)
							</label>
							<div className="relative">
								<Maximize className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
								<input
									type="number"
									placeholder="25"
									value={formData.area}
									onChange={(e) => setFormData({ ...formData, area: Number(e.target.value) })}
									className="w-full h-14 pl-12 pr-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold placeholder-slate-300 focus:bg-white focus:border-brand-primary transition-all outline-none"
								/>
							</div>
						</div>

						{/* Price */}
						<div className="space-y-3">
							<label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">
								Giá thuê (triệu/tháng)
							</label>
							<div className="relative">
								<DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
								<input
									type="number"
									step="0.1"
									placeholder="3.5"
									value={formData.price}
									onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
									className="w-full h-14 pl-12 pr-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold placeholder-slate-300 focus:bg-white focus:border-brand-primary transition-all outline-none text-brand-ink"
								/>
							</div>
						</div>
					</div>

					<div className="grid grid-cols-2 gap-6">
						{/* Furniture */}
						<div className="space-y-3">
							<label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">
								Nội thất
							</label>
							<div className="grid grid-cols-2 gap-2">
								{(["none", "basic", "full"] as FurnitureStatus[]).map((f) => (
									<button
										key={f}
										type="button"
										onClick={() => setFormData({ ...formData, furniture: f })}
										className={`h-12 rounded-xl text-xs font-black uppercase tracking-tight transition-all border-2 cursor-pointer ${
											formData.furniture === f ?
												"bg-brand-primary/10 border-brand-primary text-brand-ink"
											:	"bg-slate-50 border-transparent text-slate-400"
										}`}
									>
										{FURNITURE_LABELS[f].split(" ")[0]}
									</button>
								))}
							</div>
						</div>

						{/* Max Occupants */}
						<div className="space-y-3">
							<label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">
								Sức chứa (người)
							</label>
							<div className="relative">
								<Users className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
								<input
									type="number"
									value={formData.max_occupants || 1}
									onChange={(e) =>
										setFormData({ ...formData, max_occupants: Number(e.target.value) })
									}
									className="w-full h-14 pl-12 pr-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold focus:bg-white focus:border-brand-primary transition-all outline-none"
								/>
							</div>
						</div>
					</div>

					{/* Status Select */}
					<div className="space-y-3">
						<label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">
							Trạng thái phòng
						</label>
						<div className="grid grid-cols-3 gap-3">
							{(["available", "occupied", "maintenance"] as RoomStatus[]).map((s) => (
								<button
									key={s}
									type="button"
									onClick={() => setFormData({ ...formData, status: s })}
									className={`flex flex-col items-center justify-center p-4 rounded-3xl border-2 transition-all gap-1 cursor-pointer ${
										formData.status === s ?
											s === "available" ? "bg-brand-primary/10 border-brand-primary text-brand-ink"
											: s === "occupied" ? "bg-orange-50 border-orange-600 text-orange-700"
											: "bg-slate-50 border-slate-600 text-slate-700"
										:	"bg-white border-slate-100 text-slate-400"
									}`}
								>
									<span
										className={`w-2 h-2 rounded-full mb-1 ${
											s === "available" ? "bg-brand-primary"
											: s === "occupied" ? "bg-orange-500"
											: "bg-slate-400"
										}`}
									/>
									<span className="text-[10px] font-black uppercase tracking-widest leading-none">
										{ROOM_STATUS_LABELS[s]}
									</span>
								</button>
							))}
						</div>
					</div>

					{/* Amenities Multi-select */}
					<div className="space-y-3">
						<label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">
							Tiện nghi có sẵn
						</label>
						<div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2">
							{amenities.map((item) => {
								const isSelected = formData.amenity_ids?.includes(item.id);
								return (
									<button
										key={item.id}
										type="button"
										onClick={() => toggleAmenity(item.id)}
										className={`p-3 rounded-2xl flex flex-col items-center gap-1.5 transition-all text-center border-2 cursor-pointer ${
											isSelected ?
												"bg-brand-primary/10 border-brand-primary text-brand-ink"
											:	"bg-slate-50 border-transparent text-slate-400"
										}`}
									>
										<span className="text-xl opacity-60">
											{item.icon === "wifi" ?
												"📶"
											: item.icon === "snowflake" ?
												"❄️"
											: item.icon === "bed" ?
												"🛏️"
											: item.icon === "parking" ?
												"🅿️"
											:	"✨"}
										</span>
										<span className="text-[9px] font-black uppercase tracking-tight leading-tight">
											{item.name_vi.split(" ")[0]}
										</span>
									</button>
								);
							})}
						</div>
					</div>

					{/* Images Upload */}
					<div className="space-y-3">
						<div className="flex items-center justify-between">
							<label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">
								Hình ảnh phòng
							</label>
							<span className="text-[10px] font-bold text-slate-400">
								{(formData.images || []).length}/10 ảnh
							</span>
						</div>

						{error && (
							<div className="p-3 bg-red-50 text-red-600 rounded-xl text-xs font-bold flex items-center gap-2">
								<AlertCircle className="w-4 h-4" /> {error}
							</div>
						)}

						<div className="p-4 rounded-xl border border-dashed border-slate-300 bg-slate-50">
							<label className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-primary text-white rounded-lg text-sm font-semibold cursor-pointer hover:bg-brand-dark transition-colors">
								<input
									type="file"
									accept="image/jpeg,image/png,image/webp"
									multiple
									className="hidden"
									onChange={(e) => {
										handleImageFiles(e.target.files);
										e.currentTarget.value = "";
									}}
								/>
								{uploadingImages ? "Đang tải lên..." : "Thêm hình ảnh từ máy"}
							</label>
						</div>

						{(formData.images || []).length > 0 && (
							<div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 mt-4">
								{(formData.images || []).map((url, i) => (
									<div
										key={`${url}-${i}`}
										draggable
										onDragStart={() => setDragIndex(i)}
										onDragOver={(e) => {
											e.preventDefault();
											setDragOverIndex(i);
										}}
										onDrop={(e) => {
											e.preventDefault();
											if (dragIndex !== null) moveImage(dragIndex, i);
											setDragIndex(null);
											setDragOverIndex(null);
										}}
										onDragEnd={() => {
											setDragIndex(null);
											setDragOverIndex(null);
										}}
										className={`relative group aspect-square rounded-xl overflow-hidden border-2 ${dragOverIndex === i ? "border-indigo-500" : "border-slate-200"}`}
									>
										<img
											src={url}
											alt={`Phòng ${i + 1}`}
											className="w-full h-full object-cover"
										/>
										{i === 0 && (
											<span className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-brand-primary text-white text-[9px] font-black uppercase tracking-tight rounded">
												Ảnh chính
											</span>
										)}
										<button
											type="button"
											onClick={() =>
												setFormData((prev) => ({
													...prev,
													images: (prev.images || []).filter((_, j) => j !== i),
												}))
											}
											className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-xs font-black shadow-md"
										>
											×
										</button>
									</div>
								))}
							</div>
						)}
					</div>

					{/* Description */}
					<div className="space-y-3">
						<label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">
							Ghi chú / Mô tả thêm
						</label>
						<textarea
							rows={4}
							placeholder="VD: Phòng có cửa sổ lớn, WC riêng biệt, giờ giấc tự do..."
							value={formData.description}
							onChange={(e) => setFormData({ ...formData, description: e.target.value })}
							className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold placeholder-slate-300 focus:bg-white focus:border-brand-primary transition-all outline-none resize-none text-sm"
						/>
					</div>
				</form>

				{/* Footer */}
				<div className="p-8 border-t border-slate-50 flex gap-4 bg-slate-50/20">
					<button
						onClick={onClose}
						className="flex-1 h-14 rounded-2xl bg-white border border-slate-200 text-slate-500 font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-colors cursor-pointer"
					>
						Hủy bỏ
					</button>
					<button
						onClick={handleSave}
						className="flex-1 h-14 rounded-2xl bg-brand-ink text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-brand-ink/10 hover:bg-brand-primary transition-colors cursor-pointer"
					>
						{initialData ? "Lưu thay đổi" : "Tạo phòng ngay"}
					</button>
				</div>
			</motion.div>
		</div>
	);
};

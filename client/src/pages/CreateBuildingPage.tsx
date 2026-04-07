import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../lib/api";
import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const markerIcon = L.divIcon({
	className: "custom-location-marker",
	html: `
    <div style="width: 24px; height: 24px; border-radius: 9999px; background: #059669; border: 3px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.25);"></div>
  `,
	iconSize: [24, 24],
	iconAnchor: [12, 12],
});

interface LocationPickerProps {
	value: { lat: number; lng: number };
	onPick: (lat: number, lng: number) => void;
}

function LocationPicker({ value, onPick }: LocationPickerProps) {
	useMapEvents({
		click: (e) => {
			onPick(e.latlng.lat, e.latlng.lng);
		},
	});

	return (
		<Marker
			position={[value.lat, value.lng]}
			icon={markerIcon}
		/>
	);
}

export default function CreateBuildingPage() {
	const navigate = useNavigate();
	const { canPost } = useAuth();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");
	const [step, setStep] = useState(1); // 1=basic, 2=location, 3=images, 4=preview
	const [uploadingImages, setUploadingImages] = useState(false);
	const [reverseLoading, setReverseLoading] = useState(false);
	const [dragIndex, setDragIndex] = useState<number | null>(null);
	const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
	// Form state
	const [form, setForm] = useState({
		name: "",
		floors: "1",
		description: "",
		address: "",
		ward: "",
		district: "",
		city: "",
		lat: 0,
		lng: 0,
	});
	const [imageUrls, setImageUrls] = useState<string[]>([]);

	const updateForm = useCallback((field: string, value: unknown) => {
		setForm((prev) => ({ ...prev, [field]: value }));
	}, []);

	const handleSubmit = async () => {
		setError("");
		if (!form.name || !form.address) {
			setError("Vui lòng điền đủ: Tên tòa nhà và địa chỉ");
			return;
		}
		if (form.name.trim().length > 100) {
			setError("Tên tòa nhà tối đa 100 ký tự");
			return;
		}

		setLoading(true);
		const payload = {
			...form,
			floors: Number(form.floors),
			images: imageUrls,
		};

		const { data, error: apiError } = await api.post<{ building: unknown; message?: string }>(
			"/api/buildings",
			payload,
		);
		setLoading(false);

		if (apiError) {
			setError(apiError);
		} else if (data) {
			setSuccess("Tòa nhà đã được tạo thành công!");
			setTimeout(() => navigate("/dashboard"), 2000); // Back to dashboard or building list
		}
	};

	const handleImageFiles = async (files: FileList | null) => {
		if (!files || files.length === 0) return;
		const incoming = Array.from(files);
		const nextCount = imageUrls.length + incoming.length;
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
		const formData = new FormData();
		incoming.forEach((file) => formData.append("images", file));
		// Reuse listing image upload API for now
		const { data, error: uploadError } = await api.upload<{
			images: { url: string; order: number }[];
		}>("/api/listings/upload-images", formData);
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
		setImageUrls((prev) => [...prev, ...sorted]);
	};

	const moveImage = (from: number, to: number) => {
		if (from === to) return;
		setImageUrls((prev) => {
			const next = [...prev];
			const [item] = next.splice(from, 1);
			next.splice(to, 0, item);
			return next;
		});
	};

	const handleMapPick = async (lat: number, lng: number) => {
		updateForm("lat", lat);
		updateForm("lng", lng);
		setReverseLoading(true);
		const { data } = await api.get<{
			address: string;
			ward: string;
			district: string;
			city: string;
		}>(`/api/map/reverse-geocode?lat=${lat}&lng=${lng}`);
		setReverseLoading(false);

		if (!data) return;
		if (data.address) updateForm("address", data.address);
		if (data.ward) updateForm("ward", data.ward);
		if (data.district) updateForm("district", data.district);
		if (data.city) updateForm("city", data.city);
	};

	if (!canPost) {
		return (
			<div className="flex-1 overflow-y-auto bg-slate-50">
				<div className="max-w-4xl mx-auto p-6">
					<div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8">
						<h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-2">
							Tạo tòa nhà mới
						</h1>
						<p className="text-slate-500 mb-6">
							Bạn cần tài khoản Chủ trọ hoặc Môi giới để tạo hệ thống tòa nhà.
						</p>
						<div className="flex flex-wrap gap-3">
							<button
								onClick={() => navigate("/register")}
								className="px-5 py-2.5 bg-teal-700 text-white rounded-xl font-semibold cursor-pointer hover:bg-teal-800 transition-colors"
							>
								Đăng ký để sử dụng
							</button>
							<Link
								to="/"
								className="px-5 py-2.5 border border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-colors"
							>
								Quay lại trang chủ
							</Link>
						</div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="flex-1 overflow-y-auto bg-slate-50">
			<div className="max-w-3xl mx-auto p-6 pb-20">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					className="mb-8"
				>
					<h1 className="text-3xl font-extrabold text-slate-900">Tạo tòa nhà mới</h1>
					<p className="text-slate-500 mt-1">
						Hệ thống hóa các phòng, căn hộ thuộc quyền quản lý của bạn
					</p>
				</motion.div>

				<div className="flex gap-2 mb-8">
					{["Thông tin cơ bản", "Định vị & Địa chỉ", "Hình ảnh tòa nhà", "Hoàn tất"].map(
						(label, i) => (
							<button
								key={i}
								onClick={() => setStep(i + 1)}
								className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
									step === i + 1 ? "bg-teal-700 text-white shadow-lg shadow-teal-900/20"
									: step > i + 1 ? "bg-teal-100 text-teal-700"
									: "bg-slate-200 text-slate-500"
								}`}
							>
								{label}
							</button>
						),
					)}
				</div>

				<AnimatePresence>
					{error && (
						<motion.div
							initial={{ opacity: 0, y: -10 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0 }}
							className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600"
						>
							{error}
						</motion.div>
					)}
					{success && (
						<motion.div
							initial={{ opacity: 0, y: -10 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0 }}
							className="mb-4 p-4 bg-teal-50 border border-teal-200 rounded-xl text-sm text-teal-700"
						>
							✅ {success}
						</motion.div>
					)}
				</AnimatePresence>

				{/* Step 1: Basic info */}
				{step === 1 && (
					<motion.div
						initial={{ opacity: 0, x: 20 }}
						animate={{ opacity: 1, x: 0 }}
						className="space-y-5"
					>
						<div className="bg-white rounded-2xl p-6 border border-slate-200 space-y-4">
							<h3 className="font-bold text-slate-800">Thông tin cơ bản</h3>
							<div>
								<label className="block text-sm font-semibold text-slate-600 mb-1">
									Tên tòa nhà (hoặc khu trọ) <span className="text-red-400">*</span>
								</label>
								<input
									type="text"
									maxLength={100}
									value={form.name}
									onChange={(e) => updateForm("name", e.target.value)}
									placeholder="VD: HomeSpot Tower A"
									className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-700/10"
								/>
							</div>
							<div>
								<label className="block text-sm font-semibold text-slate-600 mb-1">Số tầng</label>
								<input
									type="number"
									min="1"
									max="100"
									value={form.floors}
									onChange={(e) => updateForm("floors", e.target.value)}
									placeholder="VD: 5"
									className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-700/10"
								/>
							</div>
							<div>
								<label className="block text-sm font-semibold text-slate-600 mb-1">
									Mô tả chung (tiện ích khối đế, hầm xe, bảo vệ...)
								</label>
								<textarea
									rows={4}
									value={form.description}
									onChange={(e) => updateForm("description", e.target.value)}
									placeholder="Mô tả tổng quản về tòa nhà..."
									className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-700/10 resize-none"
								/>
							</div>
						</div>
						<button
							onClick={() => setStep(2)}
							className="w-full py-3 bg-teal-700 text-white rounded-xl font-bold cursor-pointer hover:bg-teal-800 transition-colors"
						>
							Tiếp theo →
						</button>
					</motion.div>
				)}

				{/* Step 2: Location */}
				{step === 2 && (
					<motion.div
						initial={{ opacity: 0, x: 20 }}
						animate={{ opacity: 1, x: 0 }}
						className="space-y-5"
					>
						<div className="bg-white rounded-2xl p-6 border border-slate-200 space-y-4">
							<h3 className="font-bold text-slate-800">Định vị & Địa chỉ</h3>
							<div>
								<p className="text-xs text-slate-500 mb-2">
									Chọn vị trí trực tiếp trên bản đồ (click vào vị trí tòa nhà)
								</p>
								<div className="h-72 rounded-xl overflow-hidden border border-slate-200">
									<MapContainer
										center={[form.lat || 16.047079, form.lng || 108.20623]}
										zoom={13}
										className="w-full h-full"
										scrollWheelZoom
										attributionControl={false}
									>
										<TileLayer
											url="https://mt1.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}"
											attribution="Dữ liệu bản đồ &copy;2026 Google, Hình ảnh &copy;2026 Airbus, CNES / Airbus, Maxar Technologies"
											maxZoom={20}
											subdomains={["mt0", "mt1", "mt2", "mt3"]}
										/>
										<LocationPicker
											value={{ lat: form.lat, lng: form.lng }}
											onPick={handleMapPick}
										/>
									</MapContainer>
								</div>
								<p className="mt-2 text-xs text-slate-600">
									Tọa độ GPS: <span className="font-semibold">{Number(form.lat).toFixed(6)}</span>,{" "}
									<span className="font-semibold">{Number(form.lng).toFixed(6)}</span>
								</p>
								{reverseLoading && (
									<p className="text-xs text-teal-700 mt-1">Đang lấy địa chỉ từ tọa độ...</p>
								)}
							</div>
							<input
								type="text"
								value={form.address}
								onChange={(e) => updateForm("address", e.target.value)}
								placeholder="Số nhà, đường... *"
								className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-700/10"
							/>
							<div className="grid grid-cols-3 gap-3">
								<input
									type="text"
									value={form.city}
									onChange={(e) => updateForm("city", e.target.value)}
									placeholder="Tỉnh/TP"
									className="px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-700/10"
								/>
								<input
									type="text"
									value={form.district}
									onChange={(e) => updateForm("district", e.target.value)}
									placeholder="Quận/Huyện"
									className="px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-700/10"
								/>
								<input
									type="text"
									value={form.ward}
									onChange={(e) => updateForm("ward", e.target.value)}
									placeholder="Phường/Xã"
									className="px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-700/10"
								/>
							</div>
						</div>
						<div className="flex gap-3">
							<button
								onClick={() => setStep(1)}
								className="flex-1 py-3 border-2 border-slate-300 text-slate-700 rounded-xl font-bold cursor-pointer hover:bg-slate-50 transition-colors"
							>
								← Quay lại
							</button>
							<button
								onClick={() => setStep(3)}
								className="flex-1 py-3 bg-teal-700 text-white rounded-xl font-bold cursor-pointer hover:bg-teal-800 transition-colors"
							>
								Tiếp theo →
							</button>
						</div>
					</motion.div>
				)}

				{/* Step 3: Images */}
				{step === 3 && (
					<motion.div
						initial={{ opacity: 0, x: 20 }}
						animate={{ opacity: 1, x: 0 }}
						className="space-y-5"
					>
						<div className="bg-white rounded-2xl p-6 border border-slate-200 space-y-4">
							<h3 className="font-bold text-slate-800">Hình ảnh tòa nhà</h3>
							<p className="text-xs text-slate-400">
								Hình ảnh mặt tiền, hầm để xe, tiện ích chung (tối đa 10 ảnh).
							</p>
							<div className="p-4 rounded-xl border border-dashed border-slate-300 bg-slate-50">
								<label className="inline-flex items-center gap-2 px-4 py-2.5 bg-teal-700 text-white rounded-lg text-sm font-semibold cursor-pointer hover:bg-teal-800 transition-colors">
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
									{uploadingImages ? "Đang upload..." : "Chọn ảnh từ máy"}
								</label>
								<p className="text-xs text-slate-500 mt-2">{imageUrls.length}/10 ảnh</p>
							</div>
							<div className="grid grid-cols-3 gap-3">
								{imageUrls.map((url, i) => (
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
										className={`relative group aspect-4/3 rounded-xl overflow-hidden border-2 ${dragOverIndex === i ? "border-teal-500" : "border-slate-200"}`}
									>
										<img
											src={url}
											alt={`Ảnh ${i + 1}`}
											className="w-full h-full object-cover"
										/>
										{i === 0 && (
											<span className="absolute top-2 left-2 px-2 py-0.5 bg-teal-600 text-white text-[10px] font-bold rounded-full">
												Ảnh chính
											</span>
										)}
										<button
											onClick={() => setImageUrls((prev) => prev.filter((_, j) => j !== i))}
											className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-xs font-bold"
										>
											×
										</button>
									</div>
								))}
							</div>
						</div>
						<div className="flex gap-3">
							<button
								onClick={() => setStep(2)}
								className="flex-1 py-3 border-2 border-slate-300 text-slate-700 rounded-xl font-bold cursor-pointer hover:bg-slate-50 transition-colors"
							>
								← Quay lại
							</button>
							<button
								onClick={() => setStep(4)}
								className="flex-1 py-3 bg-teal-700 text-white rounded-xl font-bold cursor-pointer hover:bg-teal-800 transition-colors"
							>
								Xem trước →
							</button>
						</div>
					</motion.div>
				)}

				{/* Step 4: Preview */}
				{step === 4 && (
					<motion.div
						initial={{ opacity: 0, x: 20 }}
						animate={{ opacity: 1, x: 0 }}
						className="space-y-5"
					>
						<div className="bg-white rounded-2xl p-6 border border-slate-200 space-y-4">
							<h3 className="font-bold text-slate-800 text-lg">Xác nhận tạo Tòa nhà</h3>
							{imageUrls.length > 0 && (
								<img
									src={imageUrls[0]}
									alt="Preview"
									className="w-full h-48 object-cover rounded-xl"
								/>
							)}
							<h2 className="text-xl font-bold text-slate-900">
								{form.name || "Chưa có tên tòa nhà"}
							</h2>
							<div className="flex items-center gap-4 text-sm text-slate-500">
								<span className="font-medium">{form.floors} tầng</span>
							</div>
							<p className="text-sm text-slate-500">
								{form.address}
								{form.ward && `, ${form.ward}`}
								{form.district && `, ${form.district}`}
								{form.city && `, ${form.city}`}
							</p>
							{form.description && (
								<p className="text-sm text-slate-600 whitespace-pre-wrap">{form.description}</p>
							)}
						</div>
						<div className="flex gap-3">
							<button
								onClick={() => setStep(3)}
								className="flex-1 py-3 border-2 border-slate-300 text-slate-700 rounded-xl font-bold cursor-pointer hover:bg-slate-50 transition-colors"
							>
								← Chỉnh sửa
							</button>
							<button
								onClick={handleSubmit}
								disabled={loading}
								className="flex-1 py-3 bg-teal-700 text-white rounded-xl font-bold cursor-pointer hover:bg-teal-800 transition-colors disabled:opacity-60"
							>
								{loading ? "Đang tạo..." : "🏢 Tạo Tòa nhà"}
							</button>
						</div>
					</motion.div>
				)}
			</div>
		</div>
	);
}

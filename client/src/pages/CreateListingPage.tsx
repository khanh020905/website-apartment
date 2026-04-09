/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../lib/api";
import type { Amenity, BuildingWithRooms, Room } from "../../../shared/types";
import { LayoutGrid, Home, AlertCircle } from "lucide-react";

export default function CreateListingPage() {
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const roomIdParam = searchParams.get("room_id");
	const buildingIdParam = searchParams.get("building_id");
	const { canPost, role, user } = useAuth();
	const isBroker = role === "broker";

	const [buildings, setBuildings] = useState<BuildingWithRooms[]>([]);
	const [amenities, setAmenities] = useState<Amenity[]>([]);

	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");
	const [step, setStep] = useState(1); // 1=building, 2=room, 3=details, 4=preview

	// Form state
	const [form, setForm] = useState({
		building_id: buildingIdParam || "",
		room_id: roomIdParam || "",
		title: "",
		description: "",
		contact_phone: "",
		contact_name: "",
		available_date: "",
		// Room info snapshot
		price: "",
		area: "",
		furniture: "none",
		amenity_ids: [] as number[],
		property_type: "phong_tro",
		// Broker CRM fields
		target_audience: "",
		commission_rate: "",
		booking_note: "",
	});
	const [imageUrls, setImageUrls] = useState<string[]>([]);

	useEffect(() => {
		// Sync contact info
		setForm((prev) => ({
			...prev,
			contact_name: prev.contact_name || user?.user_metadata?.full_name || "",
			contact_phone: prev.contact_phone || user?.profile?.phone || "",
		}));

		api.get<{ amenities: Amenity[] }>("/api/search/amenities").then(({ data }) => {
			if (data) setAmenities(data.amenities);
		});

		if (canPost) {
			api.get<{ buildings: BuildingWithRooms[] }>("/api/buildings").then(({ data }) => {
				if (data && Array.isArray(data.buildings)) {
					setBuildings(data.buildings);

					if (roomIdParam && buildingIdParam) {
						const b = data.buildings.find((x) => x.id === buildingIdParam);
						const r = b?.rooms?.find((x) => x.id === roomIdParam);
						if (r) {
							selectRoom(r);
							setStep(3); // Jump to details
						}
					}
				}
			});
		}
	}, [user, canPost]);

	const updateForm = useCallback((field: string, value: unknown) => {
		setForm((prev) => ({ ...prev, [field]: value }));
	}, []);

	const selectRoom = (room: Room) => {
		setForm((prev) => ({
			...prev,
			room_id: room.id,
			price: room.price ? (room.price / 1_000_000).toString() : "",
			area: room.area ? room.area.toString() : "",
			furniture: room.furniture,
			amenity_ids: room.amenity_ids || [],
			description: prev.description || room.description || "", // init listing description with room description
			property_type: room.furniture === "full" ? "can_ho_mini" : "phong_tro",
		}));
		setImageUrls(room.images || []);
		setError("");
		setStep(3);
	};

	const selectedBuilding = buildings.find((b) => b.id === form.building_id);
	const selectedRoom = selectedBuilding?.rooms?.find((r) => r.id === form.room_id);

	const handleSubmit = async () => {
		setError("");
		if (!form.building_id || !form.room_id) {
			setError("Vui lòng chọn tòa nhà và phòng");
			return;
		}
		if (!form.title || !form.contact_phone) {
			setError("Vui lòng điền đủ tiêu đề và số điện thoại liên hệ");
			return;
		}
		if (!form.price || !form.area) {
			setError("Phòng này thiếu thông tin giá thuê hoặc diện tích. Vui lòng cập nhật phòng trước.");
			return;
		}
		if (imageUrls.length < 3) {
			setError("Phòng này cần ít nhất 3 ảnh. Vui lòng vào trang quản lý phòng để thêm ảnh.");
			return;
		}

		setLoading(true);
		const payload = {
			...form,
			price: Number(form.price) * 1000000,
			area: Number(form.area),
			bedrooms: 1, // default for room
			bathrooms: 1, // default for room
			images: imageUrls.map((url, i) => ({ url, order: i })),

			// Auto-fill address parts from selected building
			address: selectedBuilding?.address || "",
			ward: selectedBuilding?.ward || null,
			district: selectedBuilding?.district || null,
			city: selectedBuilding?.city || null,
			lat: selectedBuilding?.lat || null,
			lng: selectedBuilding?.lng || null,
		};

		const { data, error: apiError } = await api.post<{ listing: unknown; message?: string }>(
			"/api/listings",
			payload,
		);
		setLoading(false);

		if (apiError) {
			setError(apiError);
		} else if (data) {
			setSuccess(data.message || "Tin đăng đã được gửi!");
			setTimeout(() => navigate("/my-listings"), 2500);
		}
	};

	if (!canPost) {
		return (
			<div className="flex-1 overflow-y-auto bg-slate-50">
				<div className="max-w-4xl mx-auto p-6">
					<div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8">
						<h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-2">
							Đăng tin cho thuê
						</h1>
						<p className="text-slate-500 mb-6">Để đăng tin, bạn cần mua gói Chủ trọ/Môi giới.</p>
						<div className="flex flex-wrap gap-3">
							<button
								onClick={() => navigate(user && role === "user" ? "/pricing" : "/register")}
								className="px-5 py-2.5 bg-teal-700 text-white rounded-xl font-semibold cursor-pointer hover:bg-teal-800 transition-colors"
							>
								Mua ngay
							</button>
							<Link
								to="/search"
								className="px-5 py-2.5 border border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-colors"
							>
								Xem danh sách phòng
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
					<h1 className="text-3xl font-extrabold text-slate-900">Đăng tin cho thuê</h1>
					<p className="text-slate-500 mt-1">
						Chọn phòng từ các Tòa nhà của bạn để đăng tải nhanh chóng
					</p>
				</motion.div>

				<div className="flex gap-2 mb-8">
					{["Chọn Tòa nhà", "Chọn Phòng", "Thông tin tin đăng", "Xem trước"].map((label, i) => (
						<button
							key={i}
							onClick={() => {
								if (i + 1 > step && !form.building_id && i > 0)
									return setError("Vui lòng chọn Tòa nhà");
								if (i + 1 > step && !form.room_id && i > 1) return setError("Vui lòng chọn Phòng");
								setStep(i + 1);
							}}
							className={`flex-1 py-2 rounded-xl text-[10px] md:text-xs font-bold transition-all uppercase tracking-widest cursor-pointer ${
								step === i + 1 ? "bg-teal-700 text-white shadow-lg shadow-teal-900/20"
								: step > i + 1 ? "bg-teal-100 text-teal-700"
								: "bg-slate-200 text-slate-500"
							}`}
						>
							<span className="hidden md:inline">{label}</span>
							<span className="md:hidden">{i + 1}</span>
						</button>
					))}
				</div>

				<AnimatePresence>
					{error && (
						<motion.div
							initial={{ opacity: 0, y: -10 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0 }}
							className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 flex items-center gap-2"
						>
							<AlertCircle className="w-5 h-5" /> {error}
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

				{/* Step 1: Select Building */}
				{step === 1 && (
					<motion.div
						initial={{ opacity: 0, x: 20 }}
						animate={{ opacity: 1, x: 0 }}
						className="space-y-5"
					>
						<div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm space-y-4">
							<div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
								<div>
									<h3 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
										<Home className="w-6 h-6 text-teal-500" />
										Tòa nhà của bạn
									</h3>
									<p className="text-sm text-slate-400 font-medium">
										Bắt đầu bằng việc chọn tòa nhà chứa phòng cần đăng
									</p>
								</div>
								<Link
									to="/create-building"
									className="px-4 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs text-teal-700 font-bold uppercase tracking-widest transition-colors flex shrink-0"
								>
									+ Tạo mới
								</Link>
							</div>

							{buildings.length === 0 ?
								<div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-3xl text-slate-500 bg-slate-50">
									<p className="mb-4 font-bold text-slate-600">Bạn chưa có tòa nhà nào.</p>
									<Link
										to="/create-building"
										className="px-6 py-3 bg-teal-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-teal-600/20 inline-block uppercase tracking-widest"
									>
										Tạo Tòa nhà đầu tiên
									</Link>
								</div>
							:	<div className="grid sm:grid-cols-2 gap-4">
									{buildings.map((b) => (
										<div
											key={b.id}
											onClick={() => {
												updateForm("building_id", b.id);
												setForm((prev) => ({ ...prev, room_id: "" })); // reset room
												setError("");
											}}
											className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${
												form.building_id === b.id ?
													"border-teal-600 bg-teal-50 shadow-md shadow-teal-900/5"
												:	"border-slate-100 bg-white hover:border-teal-200 hover:bg-slate-50"
											}`}
										>
											<h4
												className={`font-black text-lg tracking-tight ${form.building_id === b.id ? "text-teal-800" : "text-slate-800"}`}
											>
												{b.name}
											</h4>
											<p className="text-xs font-semibold text-slate-400 mt-2 flex items-center gap-1 opacity-80">
												{b.address}, {b.district}
											</p>
											<div className="mt-3 inline-flex px-2 py-1 bg-white border border-slate-200 rounded-md text-[10px] font-bold text-slate-500 uppercase tracking-widest">
												{(b.rooms || []).filter((r) => r.status === "available").length} phòng trống
											</div>
										</div>
									))}
								</div>
							}
						</div>
						<button
							onClick={() => {
								if (!form.building_id) setError("Vui lòng chọn 1 tòa nhà");
								else setStep(2);
							}}
							className="w-full h-14 bg-teal-700 text-white rounded-2xl text-sm font-black uppercase tracking-widest shadow-xl shadow-teal-900/10 cursor-pointer hover:bg-teal-800 hover:-translate-y-0.5 transition-all"
						>
							Tiếp theo
						</button>
					</motion.div>
				)}

				{/* Step 2: Select Room */}
				{step === 2 && (
					<motion.div
						initial={{ opacity: 0, x: 20 }}
						animate={{ opacity: 1, x: 0 }}
						className="space-y-5"
					>
						<div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm space-y-6">
							<div>
								<h3 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
									<LayoutGrid className="w-6 h-6 text-indigo-500" />
									Phòng trống tại {selectedBuilding?.name}
								</h3>
								<p className="text-sm text-slate-400 font-medium">
									Bạn có thể quản lý chi tiết phòng trong Dashboard
								</p>
							</div>

							{(
								!selectedBuilding?.rooms ||
								selectedBuilding.rooms.filter((r) => r.status === "available").length === 0
							) ?
								<div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-3xl text-slate-500 bg-slate-50">
									<p className="mb-4 font-bold text-slate-600">Không có phòng nào đang trống.</p>
									<Link
										to={`/dashboard`}
										className="px-6 py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-600/20 inline-block uppercase tracking-widest"
									>
										Vào Dashboard để quản lý
									</Link>
								</div>
							:	<div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
									{selectedBuilding.rooms
										.filter((r) => r.status === "available")
										.map((room) => (
											<div
												key={room.id}
												onClick={() => selectRoom(room)}
												className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
													form.room_id === room.id ?
														"border-indigo-500 bg-indigo-50 shadow-md shadow-indigo-500/10"
													:	"border-slate-100 bg-white hover:border-indigo-200"
												}`}
											>
												<div className="flex justify-between items-start mb-2">
													<span
														className={`text-xl font-black ${form.room_id === room.id ? "text-indigo-700" : "text-slate-800"}`}
													>
														{room.room_number}
													</span>
													{(room.images || []).length > 0 ?
														<span className="text-xs bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.5 rounded">
															📸
														</span>
													:	<span className="text-[9px] bg-amber-100 text-brand-ink font-bold px-1.5 py-0.5 rounded uppercase">
															Thiếu ảnh
														</span>
													}
												</div>
												<p className="text-xs font-semibold text-slate-500">
													{room.area}m² • {room.price ? room.price / 1000000 : "?"} Tr
												</p>
											</div>
										))}
								</div>
							}
						</div>
						<div className="flex gap-3">
							<button
								onClick={() => setStep(1)}
								className="flex-1 h-14 border-2 border-slate-200 text-slate-500 rounded-2xl text-xs font-black uppercase tracking-widest cursor-pointer hover:bg-slate-50 transition-colors"
							>
								Quay lại
							</button>
						</div>
					</motion.div>
				)}

				{/* Step 3: Details */}
				{step === 3 && (
					<motion.div
						initial={{ opacity: 0, x: 20 }}
						animate={{ opacity: 1, x: 0 }}
						className="space-y-6"
					>
						<div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm space-y-6">
							<div>
								<h3 className="font-black text-slate-800 text-lg">Thông tin hiển thị tin đăng</h3>
								<p className="text-xs text-slate-400 font-medium">
									Tin đăng đã kế thừa: {form.price} Triệu, {form.area}m², {imageUrls.length} ảnh từ
									thông tin phòng.
								</p>
							</div>

							<div>
								<label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2 mb-2">
									Tiêu đề tin đăng <span className="text-red-400">*</span>
								</label>
								<input
									type="text"
									maxLength={100}
									value={form.title}
									onChange={(e) => updateForm("title", e.target.value)}
									placeholder="VD: Căn hộ studio trung tâm, tiện nghi cao cấp..."
									className="w-full h-14 px-5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold focus:outline-none focus:border-teal-500 focus:bg-white transition-colors"
								/>
								<p className="text-xs text-slate-400 mt-2 font-medium">
									{form.title.length}/100 ký tự
								</p>
							</div>

							<div>
								<label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2 mb-2">
									Mô tả bán hàng / giới thiệu chung
								</label>
								<textarea
									rows={5}
									value={form.description}
									onChange={(e) => updateForm("description", e.target.value)}
									placeholder="Mô tả các ưu điểm cực tốt thu hút người thuê (Gần trường, giờ giấc, an ninh...)"
									className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold focus:outline-none focus:border-teal-500 focus:bg-white transition-colors resize-none"
								/>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<div>
									<label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2 mb-2">
										Tên liên hệ
									</label>
									<input
										type="text"
										value={form.contact_name}
										onChange={(e) => updateForm("contact_name", e.target.value)}
										className="w-full h-14 px-5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold focus:outline-none focus:border-teal-500 focus:bg-white transition-colors"
									/>
								</div>
								<div>
									<label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2 mb-2">
										Điện thoại <span className="text-red-400">*</span>
									</label>
									<input
										type="tel"
										value={form.contact_phone}
										onChange={(e) => updateForm("contact_phone", e.target.value)}
										className="w-full h-14 px-5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold focus:outline-none focus:border-teal-500 focus:bg-white transition-colors"
									/>
								</div>
							</div>
						</div>

						{/* Broker CRM Fields */}
						{isBroker && (
							<div className="bg-linear-to-br from-indigo-50 to-blue-50 rounded-3xl p-8 border border-indigo-100 shadow-sm space-y-6">
								<div>
									<h3 className="font-black text-indigo-900 text-lg flex items-center gap-2">
										🤝 Công cụ Môi giới
									</h3>
									<p className="text-xs text-indigo-500/70 font-bold uppercase tracking-widest mt-1">
										Thông tin quản lý nội bộ
									</p>
								</div>
								<div>
									<label className="block text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 ml-2 mb-2">
										Đối tượng khách hàng
									</label>
									<input
										type="text"
										value={form.target_audience}
										onChange={(e) => updateForm("target_audience", e.target.value)}
										placeholder="VD: Sinh viên, gia đình trẻ..."
										className="w-full h-14 px-5 bg-white border border-indigo-200 rounded-2xl text-sm font-semibold focus:outline-none focus:border-indigo-500 transition-colors"
									/>
								</div>
								<div className="grid grid-cols-2 gap-4">
									<div>
										<label className="block text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 ml-2 mb-2">
											Hoa hồng (%)
										</label>
										<input
											type="number"
											step="0.5"
											value={form.commission_rate}
											onChange={(e) => updateForm("commission_rate", e.target.value)}
											placeholder="5"
											className="w-full h-14 px-5 bg-white border border-indigo-200 rounded-2xl text-sm font-semibold focus:outline-none focus:border-indigo-500 transition-colors"
										/>
									</div>
									<div>
										<label className="block text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 ml-2 mb-2">
											Ghi chú đặt cọc
										</label>
										<input
											type="text"
											value={form.booking_note}
											onChange={(e) => updateForm("booking_note", e.target.value)}
											placeholder="VD: Cọc 1 tháng"
											className="w-full h-14 px-5 bg-white border border-indigo-200 rounded-2xl text-sm font-semibold focus:outline-none focus:border-indigo-500 transition-colors"
										/>
									</div>
								</div>
							</div>
						)}

						<div className="flex gap-3">
							<button
								onClick={() => setStep(2)}
								className="flex-1 h-14 border-2 border-slate-200 text-slate-500 rounded-2xl text-xs font-black uppercase tracking-widest cursor-pointer hover:bg-slate-50 transition-colors"
							>
								Quay lại
							</button>
							<button
								onClick={() => {
									if (!form.title) setError("Vui lòng nhập tiêu đề");
									else setStep(4);
								}}
								className="flex-1 h-14 bg-teal-700 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-teal-900/10 cursor-pointer hover:bg-teal-800 transition-colors"
							>
								Xem trước
							</button>
						</div>
					</motion.div>
				)}

				{/* Step 4: Preview */}
				{step === 4 && (
					<motion.div
						initial={{ opacity: 0, x: 20 }}
						animate={{ opacity: 1, x: 0 }}
						className="space-y-6"
					>
						<div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm space-y-6">
							<h3 className="font-black text-slate-800 text-xl border-b border-slate-100 pb-4">
								Kiểm tra tin trước khi đăng
							</h3>

							{imageUrls.length > 0 ?
								<div className="relative aspect-21/9 rounded-2xl overflow-hidden shadow-inner">
									<img
										src={imageUrls[0]}
										alt="Preview"
										className="w-full h-full object-cover"
									/>
									<div className="absolute inset-0 bg-linear-to-t from-slate-900/60 to-transparent" />
									<div className="absolute bottom-4 left-6">
										<span className="px-2 py-1 bg-white/20 backdrop-blur-md rounded-lg text-xs font-black text-white tracking-widest uppercase">
											{imageUrls.length} Hình ảnh
										</span>
									</div>
								</div>
							:	<div className="aspect-21/9 rounded-2xl bg-brand-bg text-brand-dark border border-amber-200 flex flex-col items-center justify-center font-bold">
									Phòng này chưa được gán hình ảnh trong hệ thống!
								</div>
							}

							<div>
								<h2 className="text-2xl font-black text-slate-900 leading-tight">
									{form.title || "Chưa có tiêu đề"}
								</h2>
								<p className="text-sm font-bold text-slate-500 mt-2 flex items-center gap-2">
									📍 {selectedBuilding?.name} — Phòng {selectedRoom?.room_number} <br />
									<span className="opacity-70">
										{selectedBuilding?.address}, {selectedBuilding?.ward},{" "}
										{selectedBuilding?.district}
									</span>
								</p>
							</div>

							<div className="flex flex-wrap gap-4 text-sm">
								<div className="px-4 py-3 rounded-2xl bg-teal-50 border border-teal-100">
									<p className="text-[10px] font-black uppercase text-teal-600 tracking-widest opacity-70 mb-0.5">
										Giá cho thuê
									</p>
									<span className="text-teal-700 font-black text-lg">
										{form.price ? `${form.price} Triệu` : "Thỏa thuận"}
									</span>
								</div>
								{form.area && (
									<div className="px-4 py-3 rounded-2xl bg-slate-50 border border-slate-100">
										<p className="text-[10px] font-black uppercase text-slate-500 tracking-widest opacity-70 mb-0.5">
											Diện tích
										</p>
										<span className="text-slate-800 font-black text-lg">{form.area} m²</span>
									</div>
								)}
							</div>

							{form.description && (
								<div className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
									<p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-3">
										Thông tin mô tả
									</p>
									<p className="text-sm text-slate-700 font-semibold leading-relaxed whitespace-pre-wrap">
										{form.description}
									</p>
								</div>
							)}

							{form.amenity_ids.length > 0 && (
								<div>
									<p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-3 ml-1">
										Tiện nghi sẵn có (kế thừa từ phòng)
									</p>
									<div className="flex flex-wrap gap-2">
										{form.amenity_ids.map((id) => {
											const am = amenities.find((a) => a.id === id);
											return am ?
													<span
														key={id}
														className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 text-xs font-bold rounded-xl shadow-sm"
													>
														{am.name_vi}
													</span>
												:	null;
										})}
									</div>
								</div>
							)}

							<div className="pt-4 border-t border-slate-100">
								<p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2 ml-1">
									Liên hệ
								</p>
								<p className="text-base font-black text-slate-800 flex items-center gap-2">
									📞 {form.contact_phone}{" "}
									<span className="text-sm font-semibold opacity-60">({form.contact_name})</span>
								</p>
							</div>
						</div>
						<div className="flex gap-3">
							<button
								onClick={() => setStep(3)}
								className="flex-1 h-14 border-2 border-slate-200 text-slate-500 rounded-2xl text-xs font-black uppercase tracking-widest cursor-pointer hover:bg-slate-50 transition-colors"
							>
								Chỉnh sửa
							</button>
							<button
								onClick={handleSubmit}
								disabled={loading}
								className="flex-1 h-14 bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-indigo-900/10 cursor-pointer hover:bg-indigo-700 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
							>
								{loading ? "Đang xuất bản..." : "🚀 Xuất bản ngay"}
							</button>
						</div>
					</motion.div>
				)}
			</div>
		</div>
	);
}

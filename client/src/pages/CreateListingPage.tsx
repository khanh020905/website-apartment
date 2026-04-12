import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
	AlertCircle,
	ImagePlus,
	MinusCircle,
	PlusCircle,
	Video,
	X,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../lib/api";
import type { Amenity, BuildingWithRooms, Listing, PropertyType } from "../../../shared/types";

type UploadedImage = { url: string; order: number };

interface ListingForm {
	building_id: string;
	room_id: string;
	title: string;
	description: string;
	price: string;
	contact_name: string;
	contact_phone: string;
	property_type: PropertyType;
	amenity_ids: number[];
	room_features: string[];
	interior_features: string[];
	custom_amenities: string[];
	max_people: number;
	max_vehicles: number;
	length_m: string;
	width_m: string;
	area: string;
	guest_note: string;
	is_discounted: boolean;
	is_newly_built: boolean;
}

const RENTAL_TYPES: Array<{ key: PropertyType; label: string }> = [
	{ key: "can_ho_mini", label: "Căn hộ dịch vụ" },
	{ key: "phong_tro", label: "KTX / Sleep Box" },
	{ key: "nha_nguyen_can", label: "Nhà trọ" },
];

const ROOM_FEATURES = [
	"Full nội thất",
	"Không nội thất",
	"Duplex",
	"Phòng Studio",
	"Ban công",
	"Tách bếp",
	"Cửa sổ trời",
	"Cửa sổ hành lang",
	"Giếng trời",
	"1 Phòng Ngủ",
	"2 Phòng Ngủ",
	"3 Phòng Ngủ",
	"View kính",
	"Penthouse",
];

const INTERIOR_FEATURES = [
	"Máy lạnh",
	"Tủ lạnh",
	"Máy giặt",
	"Quạt điện",
	"Tủ quần áo",
	"Máy nước nóng",
	"Kệ bếp",
	"Ghế Sofa",
	"Giường",
	"Nệm",
];

const toVnd = (raw: string) => Number(raw.replace(/[^\d]/g, ""));

const formatVnd = (raw: string) => {
	const value = toVnd(raw);
	return value > 0 ? value.toLocaleString("vi-VN") : "";
};

const getVideoDuration = (file: File) =>
	new Promise<number>((resolve, reject) => {
		const objectUrl = URL.createObjectURL(file);
		const video = document.createElement("video");

		video.preload = "metadata";
		video.onloadedmetadata = () => {
			URL.revokeObjectURL(objectUrl);
			resolve(video.duration);
		};
		video.onerror = () => {
			URL.revokeObjectURL(objectUrl);
			reject(new Error("Không đọc được thời lượng video"));
		};
		video.src = objectUrl;
	});

export default function CreateListingPage() {
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const roomIdParam = searchParams.get("room_id");
	const buildingIdParam = searchParams.get("building_id");
	const listingIdParam = searchParams.get("listing_id");
	const { canPost, role, user } = useAuth();

	const [buildings, setBuildings] = useState<BuildingWithRooms[]>([]);
	const [amenities, setAmenities] = useState<Amenity[]>([]);
	const [imageUploads, setImageUploads] = useState<UploadedImage[]>([]);
	const [videoUrl, setVideoUrl] = useState("");
	const [loading, setLoading] = useState(false);
	const [uploadingImages, setUploadingImages] = useState(false);
	const [uploadingVideo, setUploadingVideo] = useState(false);
	const [loadingInitialData, setLoadingInitialData] = useState(false);
	const [didAutoRecover, setDidAutoRecover] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");
	const [customAmenityDraft, setCustomAmenityDraft] = useState("");

	const imageInputRef = useRef<HTMLInputElement | null>(null);
	const videoInputRef = useRef<HTMLInputElement | null>(null);

	const [form, setForm] = useState<ListingForm>({
		building_id: buildingIdParam || "",
		room_id: roomIdParam || "",
		title: "",
		description: "",
		price: "",
		contact_name: "",
		contact_phone: "",
		property_type: "can_ho_mini",
		amenity_ids: [],
		room_features: [],
		interior_features: [],
		custom_amenities: [],
		max_people: 1,
		max_vehicles: 1,
		length_m: "",
		width_m: "",
		area: "",
		guest_note: "",
		is_discounted: false,
		is_newly_built: false,
	});

	useEffect(() => {
		if (!canPost) return;
		let mounted = true;
		Promise.all([
			api.get<{ buildings: BuildingWithRooms[] }>("/api/buildings"),
			api.get<{ amenities: Amenity[] }>("/api/search/amenities"),
		]).then(([buildingsRes, amenitiesRes]) => {
			if (!mounted) return;
			if (buildingsRes.data?.buildings) {
				setBuildings(buildingsRes.data.buildings);
			}
			if (amenitiesRes.data?.amenities) {
				setAmenities(amenitiesRes.data.amenities);
			}
		});

		return () => {
			mounted = false;
		};
	}, [canPost]);

	useEffect(() => {
		if (!canPost || !listingIdParam) return;
		setLoadingInitialData(true);
		api.get<{ listing: Listing }>(`/api/listings/${listingIdParam}`).then(({ data, error: listingError }) => {
			if (listingError || !data?.listing) {
				setError(listingError || "Không thể tải tin đăng để chỉnh sửa");
				setLoadingInitialData(false);
				return;
			}
			const listing = data.listing;
			const customRoomFeatures = (listing.room_features || []).filter(
				(feature) => !ROOM_FEATURES.includes(feature),
			);
			const builtInRoomFeatures = (listing.room_features || []).filter((feature) =>
				ROOM_FEATURES.includes(feature),
			);

			setForm((prev) => ({
				...prev,
				building_id: prev.building_id || buildingIdParam || "",
				room_id: listing.room_id || prev.room_id || roomIdParam || "",
				title: listing.title || "",
				description: listing.description || "",
				price: listing.price ? String(listing.price) : "",
				contact_name: listing.contact_name || "",
				contact_phone: listing.contact_phone || "",
				property_type: listing.property_type || "can_ho_mini",
				amenity_ids: listing.amenity_ids || [],
				room_features: builtInRoomFeatures,
				interior_features: listing.interior_features || [],
				custom_amenities: customRoomFeatures,
				max_people: listing.max_people || 1,
				max_vehicles: listing.max_vehicles || 1,
				length_m: listing.length_m ? String(listing.length_m) : "",
				width_m: listing.width_m ? String(listing.width_m) : "",
				area: listing.area ? String(listing.area) : "",
				guest_note: listing.guest_note || "",
				is_discounted: Boolean(listing.is_discounted),
				is_newly_built: Boolean(listing.is_newly_built),
			}));

			setImageUploads(
				(listing.images || [])
					.slice()
					.sort((a, b) => a.order - b.order)
					.map((img, index) => ({ url: img.url, order: index })),
			);
			setVideoUrl(listing.video_url || "");
			setLoadingInitialData(false);
		});
	}, [buildingIdParam, canPost, listingIdParam, roomIdParam]);

	useEffect(() => {
		setForm((prev) => ({
			...prev,
			contact_name: prev.contact_name || user?.user_metadata?.full_name || "",
			contact_phone: prev.contact_phone || user?.profile?.phone || "",
		}));
	}, [user]);

	const selectedRoomContext = (() => {
		for (const building of buildings) {
			const room = (building.rooms || []).find((item) => item.id === form.room_id);
			if (room) return { building, room };
		}
		return null;
	})();

	const selectedBuilding =
		selectedRoomContext?.building || buildings.find((b) => b.id === form.building_id) || null;

	const selectedRoom = selectedRoomContext?.room || null;

	useEffect(() => {
		if (!roomIdParam || form.room_id === roomIdParam) return;
		setForm((prev) => ({ ...prev, room_id: roomIdParam }));
	}, [form.room_id, roomIdParam]);

	useEffect(() => {
		if (!selectedRoomContext || form.building_id === selectedRoomContext.building.id) return;
		setForm((prev) => ({ ...prev, building_id: selectedRoomContext.building.id }));
	}, [form.building_id, selectedRoomContext]);

	useEffect(() => {
		if (!canPost || didAutoRecover || loadingInitialData || buildings.length === 0) return;
		if (listingIdParam && !form.room_id) return;
		if (!form.room_id) {
			setDidAutoRecover(true);
			navigate("/my-listings", {
				replace: true,
				state: {
					openPostRoomPicker: true,
					notice: "Hãy chọn mã phòng trước khi tạo tin đăng.",
				},
			});
			return;
		}
		if (!selectedRoom) {
			setDidAutoRecover(true);
			navigate("/my-listings", {
				replace: true,
				state: {
					openPostRoomPicker: true,
					notice: "Mã phòng đã chọn không còn hợp lệ, vui lòng chọn lại.",
				},
			});
		}
	}, [
		buildings.length,
		canPost,
		didAutoRecover,
		form.room_id,
		listingIdParam,
		loadingInitialData,
		navigate,
		selectedRoom,
	]);

	useEffect(() => {
		if (!selectedRoom) return;
		setForm((prev) => ({
			...prev,
			price: prev.price || (selectedRoom.price ? String(selectedRoom.price) : ""),
			area: prev.area || (selectedRoom.area ? String(selectedRoom.area) : ""),
			amenity_ids: prev.amenity_ids.length > 0 ? prev.amenity_ids : selectedRoom.amenity_ids || [],
			description: prev.description || selectedRoom.description || "",
		}));
		if (imageUploads.length === 0 && selectedRoom.images && selectedRoom.images.length > 0) {
			setImageUploads(
				selectedRoom.images.map((url, index) => ({
					url,
					order: index,
				})),
			);
		}
	}, [imageUploads.length, selectedRoom]);

	const computedArea = useMemo(() => {
		const length = Number(form.length_m);
		const width = Number(form.width_m);
		if (Number.isFinite(length) && Number.isFinite(width) && length > 0 && width > 0) {
			return Number((length * width).toFixed(2));
		}
		const area = Number(form.area);
		return Number.isFinite(area) && area > 0 ? area : 0;
	}, [form.length_m, form.width_m, form.area]);

	const toggleStringArray = (field: "room_features" | "interior_features", value: string) => {
		setForm((prev) => ({
			...prev,
			[field]:
				prev[field].includes(value) ?
					prev[field].filter((item) => item !== value)
				:	[...prev[field], value],
		}));
	};

	const toggleAmenity = (id: number) => {
		setForm((prev) => ({
			...prev,
			amenity_ids:
				prev.amenity_ids.includes(id) ?
					prev.amenity_ids.filter((item) => item !== id)
				:	[...prev.amenity_ids, id],
		}));
	};

	const handleImageUpload = async (files: FileList | null) => {
		if (!files || files.length === 0) return;
		setError("");
		setUploadingImages(true);
		const formData = new FormData();
		Array.from(files).forEach((file) => {
			formData.append("images", file);
		});
		const { data, error: uploadError } = await api.upload<{ images: UploadedImage[] }>(
			"/api/listings/upload-images",
			formData,
		);
		setUploadingImages(false);
		if (uploadError || !data) {
			setError(uploadError || "Không thể tải ảnh lên");
			return;
		}
		setImageUploads((prev) => {
			const start = prev.length;
			const merged = [...prev, ...data.images.map((img, idx) => ({ ...img, order: start + idx }))];
			return merged.slice(0, 15);
		});
		if (imageInputRef.current) imageInputRef.current.value = "";
	};

	const handleVideoUpload = async (file: File | null) => {
		if (!file) return;
		setError("");
		try {
			const duration = await getVideoDuration(file);
			if (duration > 60) {
				setError("Video phải có thời lượng dưới 60 giây");
				if (videoInputRef.current) videoInputRef.current.value = "";
				return;
			}
		} catch {
			setError("Không thể đọc video, vui lòng thử lại");
			return;
		}

		setUploadingVideo(true);
		const formData = new FormData();
		formData.append("video", file);
		const { data, error: uploadError } = await api.upload<{ video_url: string }>(
			"/api/listings/upload-video",
			formData,
		);
		setUploadingVideo(false);
		if (uploadError || !data?.video_url) {
			setError(uploadError || "Không thể tải video lên");
			return;
		}
		setVideoUrl(data.video_url);
		if (videoInputRef.current) videoInputRef.current.value = "";
	};

	const handleAddCustomAmenity = () => {
		const trimmed = customAmenityDraft.trim();
		if (!trimmed) return;
		setForm((prev) => ({
			...prev,
			custom_amenities:
				prev.custom_amenities.includes(trimmed) ? prev.custom_amenities : [...prev.custom_amenities, trimmed],
		}));
		setCustomAmenityDraft("");
	};

	const handleRemoveImage = (url: string) => {
		setImageUploads((prev) =>
			prev
				.filter((img) => img.url !== url)
				.map((img, index) => ({
					...img,
					order: index,
				})),
		);
	};

	const handleSubmit = async () => {
		setError("");
		setSuccess("");
		if (!form.room_id) {
			setError("Vui lòng chọn mã phòng");
			return;
		}
		if (!form.title.trim()) {
			setError("Vui lòng nhập tiêu đề tin đăng");
			return;
		}
		if (!form.contact_phone.trim()) {
			setError("Vui lòng nhập số điện thoại liên hệ");
			return;
		}
		if (toVnd(form.price) <= 0) {
			setError("Phí thuê không hợp lệ");
			return;
		}
		if (computedArea <= 0) {
			setError("Vui lòng nhập kích thước hoặc diện tích hợp lệ");
			return;
		}
		if (imageUploads.length < 1) {
			setError("Cần ít nhất 1 hình ảnh");
			return;
		}

		const bedroomsFromFeatures = form.room_features.find((feature) => feature.includes("Phòng Ngủ"));
		const bedrooms = bedroomsFromFeatures ? Number(bedroomsFromFeatures.match(/\d+/)?.[0] || "1") : 0;
		const furniture =
			form.room_features.includes("Full nội thất") ? "full"
			: form.room_features.includes("Không nội thất") ? "none"
			: "basic";

		const payload = {
			room_id: form.room_id,
			title: form.title.trim(),
			description: form.description.trim(),
			price: toVnd(form.price),
			area: computedArea,
			bedrooms,
			bathrooms: 1,
			property_type: form.property_type,
			furniture,
			address: selectedBuilding?.address || null,
			ward: selectedBuilding?.ward || null,
			district: selectedBuilding?.district || null,
			city: selectedBuilding?.city || null,
			lat: selectedBuilding?.lat || null,
			lng: selectedBuilding?.lng || null,
			contact_phone: form.contact_phone.trim(),
			contact_name: form.contact_name.trim() || null,
			images: imageUploads.map((img, order) => ({ url: img.url, order })),
			video_url: videoUrl || null,
			amenity_ids: form.amenity_ids,
			room_features: [...form.room_features, ...form.custom_amenities],
			interior_features: form.interior_features,
			is_discounted: form.is_discounted,
			is_newly_built: form.is_newly_built,
			max_people: form.max_people,
			max_vehicles: form.max_vehicles,
			length_m: form.length_m ? Number(form.length_m) : null,
			width_m: form.width_m ? Number(form.width_m) : null,
			guest_note: form.guest_note.trim() || null,
			available_date: selectedRoom?.available_from || null,
			target_audience: null,
			commission_rate: null,
			booking_note: null,
		};

		setLoading(true);
		const { data, error: apiError } =
			listingIdParam ?
				await api.put<{ message?: string }>(`/api/listings/${listingIdParam}`, payload)
			:	await api.post<{ message?: string }>("/api/listings", payload);
		setLoading(false);
		if (apiError) {
			setError(apiError);
			return;
		}
		setSuccess(data?.message || (listingIdParam ? "Cập nhật tin thành công" : "Tạo tin thành công"));
		setTimeout(() => navigate("/my-listings"), 1200);
	};

	if (!canPost) {
		return (
			<div className="flex-1 overflow-y-auto bg-slate-50">
				<div className="max-w-3xl mx-auto p-6">
					<div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8">
						<h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-2">Đăng tin cho thuê</h1>
						<p className="text-slate-500 mb-6">Để đăng tin, bạn cần mua gói Chủ trọ/Môi giới.</p>
						<div className="flex flex-wrap gap-3">
							<button
								onClick={() => navigate(user && role === "user" ? "/pricing" : "/register")}
								className="px-5 py-2.5 bg-teal-700 text-white rounded-xl font-semibold cursor-pointer hover:bg-teal-800 transition-colors"
							>
								Mua ngay
							</button>
							<Link
								to="/"
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
			<div className="max-w-7xl mx-auto p-4 sm:p-6 pb-28 lg:pb-10">
				<div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
					<div className="px-5 sm:px-6 py-4 border-b border-slate-100 sticky top-0 bg-white z-10">
						<h1 className="text-2xl font-black text-amber-700 tracking-tight">
							{listingIdParam ? "Sửa tin đăng" : "Tạo tin đăng"}
						</h1>
					</div>

					<div className="p-5 sm:p-6 lg:p-8 space-y-8 lg:space-y-10">
						{error && (
							<div className="p-3 rounded-xl border border-red-200 bg-red-50 text-sm text-red-600 flex items-center gap-2">
								<AlertCircle className="w-4 h-4" /> {error}
							</div>
						)}
						{success && (
							<div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50 text-sm text-emerald-700">
								{success}
							</div>
						)}

						<section className="space-y-4">
							<h2 className="text-2xl font-black text-slate-900">Hình ảnh và video</h2>
							<div className="grid gap-6 lg:grid-cols-2">
								<div>
								<p className="text-lg font-bold mb-2">
									Hình ảnh <span className="text-red-500">*</span>
								</p>
								<input
									ref={imageInputRef}
									type="file"
									multiple
									accept="image/png,image/jpeg,image/webp"
									className="hidden"
									onChange={(e) => handleImageUpload(e.target.files)}
								/>
								<button
									onClick={() => imageInputRef.current?.click()}
									disabled={uploadingImages || imageUploads.length >= 15}
									className="w-44 h-44 border border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center gap-2 text-slate-500 hover:border-amber-400 hover:text-amber-700 transition-all disabled:opacity-50 cursor-pointer"
								>
									<ImagePlus className="w-8 h-8" />
									<span className="font-semibold">{uploadingImages ? "Đang tải..." : "Thêm ảnh"}</span>
								</button>
								{imageUploads.length > 0 && (
									<div className="mt-3 grid grid-cols-3 sm:grid-cols-5 gap-3">
										{imageUploads.map((img) => (
											<div key={img.url} className="relative aspect-square rounded-xl overflow-hidden border border-slate-200">
												<img src={img.url} alt="listing" className="w-full h-full object-cover" />
												<button
													onClick={() => handleRemoveImage(img.url)}
													className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 cursor-pointer"
												>
													<X className="w-3 h-3" />
												</button>
											</div>
										))}
									</div>
								)}
								</div>

								<div>
								<p className="text-lg font-bold mb-2">Video</p>
								<input
									ref={videoInputRef}
									type="file"
									accept="video/mp4,video/webm,video/quicktime"
									className="hidden"
									onChange={(e) => handleVideoUpload(e.target.files?.[0] || null)}
								/>
								<button
									onClick={() => videoInputRef.current?.click()}
									disabled={uploadingVideo}
									className="w-full max-w-lg border border-dashed border-slate-300 rounded-2xl py-5 px-4 text-left flex items-center gap-3 hover:border-amber-400 transition-all disabled:opacity-50 cursor-pointer"
								>
									<Video className="w-6 h-6 text-slate-500" />
									<span className="font-semibold text-slate-700">
										{uploadingVideo ?
											"Đang tải video..."
										: videoUrl ?
											"Đã tải video thành công"
										:	"Thêm video quay thực tế (thời gian dưới 60 giây)"}
									</span>
								</button>
								</div>
							</div>
						</section>

						<section className="space-y-4">
							<h2 className="text-2xl font-black text-slate-900">Mã phòng chung giá</h2>
							<p className="text-slate-500">Chọn mã phòng giống nhau về hình ảnh và giá</p>
							{loadingInitialData ?
								<div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-slate-500 font-semibold">
									Đang tải thông tin tin đăng...
								</div>
							: selectedRoom ?
								<div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 flex flex-wrap items-center gap-3">
									<span className="inline-flex px-4 py-2 rounded-xl border border-slate-300 bg-white text-lg font-black text-slate-800">
										{selectedRoom.room_number}
									</span>
									<span className="text-sm font-semibold text-slate-500">{selectedBuilding?.name}</span>
									<button
										onClick={() => navigate("/my-listings")}
										className="ml-auto px-4 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 font-bold cursor-pointer"
									>
										Chọn mã khác
									</button>
								</div>
							:	<div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 space-y-3">
									<p className="text-amber-800 font-bold">Bạn chưa chọn mã phòng để đăng tin.</p>
									<div className="flex flex-wrap gap-2">
										<button
											onClick={() => navigate("/my-listings")}
											className="px-4 py-2 rounded-xl bg-amber-700 text-white font-bold cursor-pointer"
										>
											Chọn phòng để đăng tin
										</button>
										<button
											onClick={() => navigate("/my-listings")}
											className="px-4 py-2 rounded-xl border border-amber-400 text-amber-700 bg-white font-bold cursor-pointer"
										>
											Thêm mã phòng
										</button>
									</div>
								</div>
							}
						</section>

						<section className="space-y-4">
							<input
								value={form.title}
								onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
								placeholder="Tiêu đề tin đăng *"
								className="w-full h-14 rounded-2xl border border-slate-300 px-5 text-lg font-semibold"
								maxLength={100}
							/>
							<div className="relative">
								<input
									value={formatVnd(form.price)}
									onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))}
									placeholder="Phí thuê *"
									className="w-full h-16 rounded-2xl border border-slate-300 px-5 text-[38px] font-black tracking-tight text-slate-800"
								/>
								<span className="absolute right-5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">VNĐ/tháng</span>
							</div>
							<label className="flex items-center gap-3 text-2xl font-semibold text-slate-800">
								<input
									type="checkbox"
									checked={form.is_discounted}
									onChange={(e) => setForm((prev) => ({ ...prev, is_discounted: e.target.checked }))}
									className="w-6 h-6 rounded border-slate-300"
								/>
								Đang có giảm giá tiền thuê
							</label>
							<label className="flex items-center gap-3 text-2xl font-semibold text-slate-800">
								<input
									type="checkbox"
									checked={form.is_newly_built}
									onChange={(e) => setForm((prev) => ({ ...prev, is_newly_built: e.target.checked }))}
									className="w-6 h-6 rounded border-slate-300"
								/>
								Mới xây chưa qua sử dụng
							</label>
						</section>

						<section className="space-y-4">
							<h2 className="text-2xl font-black text-slate-900">Loại hình</h2>
							<div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
								{RENTAL_TYPES.map((type) => (
									<button
										key={type.key}
										onClick={() => setForm((prev) => ({ ...prev, property_type: type.key }))}
										className={`h-24 rounded-2xl border text-lg font-bold transition-all cursor-pointer ${
											form.property_type === type.key ?
												"bg-slate-700 text-white border-slate-700"
											:	"bg-white border-slate-200 text-slate-700"
										}`}
									>
										{type.label}
									</button>
								))}
							</div>
						</section>

						<section className="space-y-4">
							<h2 className="text-2xl font-black text-slate-900">Loại phòng</h2>
							<div className="flex flex-wrap gap-3">
								{ROOM_FEATURES.map((feature) => (
									<button
										key={feature}
										onClick={() => toggleStringArray("room_features", feature)}
										className={`px-4 py-2.5 rounded-full border text-sm md:text-base font-semibold cursor-pointer ${
											form.room_features.includes(feature) ?
												"bg-amber-50 border-amber-400 text-amber-700"
											:	"bg-white border-slate-200 text-slate-700"
										}`}
									>
										{feature}
									</button>
								))}
							</div>
						</section>

						<section className="space-y-4">
							<h2 className="text-2xl font-black text-slate-900">Nội thất</h2>
							<div className="flex flex-wrap gap-3">
								{INTERIOR_FEATURES.map((feature) => (
									<button
										key={feature}
										onClick={() => toggleStringArray("interior_features", feature)}
										className={`px-4 py-2.5 rounded-full border text-sm md:text-base font-semibold cursor-pointer ${
											form.interior_features.includes(feature) ?
												"bg-amber-50 border-amber-400 text-amber-700"
											:	"bg-white border-slate-200 text-slate-700"
										}`}
									>
										{feature}
									</button>
								))}
							</div>
						</section>

						<section className="space-y-4">
							<h2 className="text-2xl font-black text-slate-900">Tiện ích</h2>
							<div className="flex flex-wrap gap-3">
								{amenities.map((am) => (
									<button
										key={am.id}
										onClick={() => toggleAmenity(am.id)}
										className={`px-4 py-2.5 rounded-full border text-sm md:text-base font-semibold cursor-pointer ${
											form.amenity_ids.includes(am.id) ?
												"bg-amber-50 border-amber-400 text-amber-700"
											:	"bg-white border-slate-200 text-slate-700"
										}`}
									>
										{am.name_vi}
									</button>
								))}
								<button
									onClick={handleAddCustomAmenity}
									className="px-4 py-2.5 rounded-full border border-amber-500 text-amber-700 font-bold flex items-center gap-1 cursor-pointer"
								>
									<PlusCircle className="w-4 h-4" /> Thêm tiện ích
								</button>
							</div>
							<div className="flex gap-2">
								<input
									value={customAmenityDraft}
									onChange={(e) => setCustomAmenityDraft(e.target.value)}
									placeholder="Nhập tiện ích tùy chỉnh..."
									className="flex-1 h-12 rounded-xl border border-slate-300 px-4"
								/>
								<button
									onClick={handleAddCustomAmenity}
									className="px-4 rounded-xl border border-slate-300 text-slate-700 font-semibold cursor-pointer"
								>
									Thêm
								</button>
							</div>
							{form.custom_amenities.length > 0 && (
								<div className="flex flex-wrap gap-2">
									{form.custom_amenities.map((item) => (
										<span key={item} className="px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 text-sm font-semibold flex items-center gap-1">
											{item}
											<button
												onClick={() =>
													setForm((prev) => ({
														...prev,
														custom_amenities: prev.custom_amenities.filter((x) => x !== item),
													}))
												}
												className="cursor-pointer"
											>
												<MinusCircle className="w-3.5 h-3.5" />
											</button>
										</span>
									))}
								</div>
							)}
						</section>

						<section className="space-y-4">
							<h2 className="text-2xl font-black text-slate-900">Số người tối đa</h2>
							<div className="flex flex-wrap gap-3">
								{Array.from({ length: 10 }).map((_, idx) => {
									const value = idx + 1;
									return (
										<button
											key={value}
											onClick={() => setForm((prev) => ({ ...prev, max_people: value }))}
											className={`w-14 h-14 rounded-full border text-xl font-bold cursor-pointer ${
												form.max_people === value ?
													"bg-amber-50 border-amber-500 text-amber-700"
												:	"border-slate-200 text-slate-700"
											}`}
										>
											{value}
										</button>
									);
								})}
							</div>
						</section>

						<section className="space-y-4">
							<h2 className="text-2xl font-black text-slate-900">Số xe tối đa</h2>
							<div className="flex flex-wrap gap-3">
								{Array.from({ length: 10 }).map((_, idx) => {
									const value = idx + 1;
									return (
										<button
											key={value}
											onClick={() => setForm((prev) => ({ ...prev, max_vehicles: value }))}
											className={`w-14 h-14 rounded-full border text-xl font-bold cursor-pointer ${
												form.max_vehicles === value ?
													"bg-amber-50 border-amber-500 text-amber-700"
												:	"border-slate-200 text-slate-700"
											}`}
										>
											{value}
										</button>
									);
								})}
							</div>
						</section>

						<section className="space-y-4">
							<h2 className="text-2xl font-black text-slate-900">Diện tích</h2>
							<div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-center">
								<input
									value={form.length_m}
									onChange={(e) => setForm((prev) => ({ ...prev, length_m: e.target.value }))}
									placeholder="Chiều dài (m)"
									className="h-14 rounded-xl border border-slate-300 px-4 text-lg font-semibold"
								/>
								<span className="text-2xl font-black text-slate-700">x</span>
								<input
									value={form.width_m}
									onChange={(e) => setForm((prev) => ({ ...prev, width_m: e.target.value }))}
									placeholder="Chiều rộng (m)"
									className="h-14 rounded-xl border border-slate-300 px-4 text-lg font-semibold"
								/>
							</div>
							<div className="max-w-sm rounded-2xl border border-slate-300 px-4 py-3">
								<p className="text-sm font-semibold text-slate-500">Tổng diện tích</p>
								<p className="text-3xl font-black text-slate-800">{computedArea.toFixed(2)} m²</p>
							</div>
						</section>

						<section className="space-y-4">
							<h2 className="text-2xl font-black text-slate-900">Lưu ý cho khách</h2>
							<textarea
								rows={4}
								value={form.guest_note}
								onChange={(e) => setForm((prev) => ({ ...prev, guest_note: e.target.value }))}
								placeholder="Thông tin dành cho khách thuê, ví dụ: giảm giá nếu ở 1 mình..."
								className="w-full rounded-2xl border border-slate-300 p-4 text-lg"
							/>
							<textarea
								rows={4}
								value={form.description}
								onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
								placeholder="Mô tả chi tiết thêm..."
								className="w-full rounded-2xl border border-slate-300 p-4 text-lg"
							/>
						</section>

						<section className="space-y-3">
							<h2 className="text-2xl font-black text-slate-900">Thông tin liên hệ</h2>
							<div className="grid sm:grid-cols-2 gap-3">
								<input
									value={form.contact_name}
									onChange={(e) => setForm((prev) => ({ ...prev, contact_name: e.target.value }))}
									placeholder="Họ và tên"
									className="h-14 rounded-xl border border-slate-300 px-4 text-lg font-semibold"
								/>
								<input
									value={form.contact_phone}
									onChange={(e) => setForm((prev) => ({ ...prev, contact_phone: e.target.value }))}
									placeholder="Số điện thoại *"
									className="h-14 rounded-xl border border-slate-300 px-4 text-lg font-semibold"
								/>
							</div>
						</section>
					</div>
				</div>

				<div className="fixed bottom-0 left-0 right-0 z-20 bg-slate-50/95 backdrop-blur border-t border-slate-200 p-4 lg:static lg:bg-transparent lg:border-t-0 lg:backdrop-blur-none lg:p-0 lg:mt-6">
					<div className="max-w-3xl mx-auto lg:max-w-none">
						<button
							onClick={handleSubmit}
							disabled={loading}
							className="w-full h-14 rounded-full bg-amber-700 text-white text-2xl lg:text-lg font-black tracking-tight disabled:opacity-60 cursor-pointer"
						>
							{loading ?
								(listingIdParam ? "Đang cập nhật..." : "Đang tạo...")
							: listingIdParam ?
								"Cập nhật tin"
							:	"Tạo tin"}
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}


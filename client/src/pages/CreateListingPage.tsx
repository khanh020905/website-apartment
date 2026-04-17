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
	commission_rate?: string;
	
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
	const [otherListings, setOtherListings] = useState<Listing[]>([]);
	const [didAutoRecover, setDidAutoRecover] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");
	const [customAmenityDraft, setCustomAmenityDraft] = useState("");
	const [amenityKeyword, setAmenityKeyword] = useState("");
	const [showCustomAmenityInput, setShowCustomAmenityInput] = useState(false);

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
		commission_rate: "",
	});

	useEffect(() => {
		if (!canPost) return;
		let mounted = true;
		
		Promise.all([
			api.get<{ buildings: BuildingWithRooms[] }>("/api/buildings"),
			api.get<{ amenities: Amenity[] }>("/api/search/amenities"),
			api.get<{ listings: Listing[] }>("/api/listings/my")
		]).then(([buildingsRes, amenitiesRes, listingsRes]) => {
			if (!mounted) return;
			if (buildingsRes.data?.buildings) {
				setBuildings(buildingsRes.data.buildings);
			}
			if (amenitiesRes.data?.amenities) {
				setAmenities(amenitiesRes.data.amenities);
			}
			if (listingsRes.data?.listings) {
				setOtherListings(listingsRes.data.listings);
			}
		});

		return () => {
			mounted = false;
		};
	}, [canPost]);

	useEffect(() => {
		// Auto-detect if we entered create mode but a listing actually exists for this room
		if (!listingIdParam && roomIdParam && otherListings.length > 0) {
			const existingListing = otherListings.find(l => l.room_id === roomIdParam);
			if (existingListing) {
				navigate(`/create-listing?listing_id=${existingListing.id}&building_id=${buildingIdParam || form.building_id}&room_id=${roomIdParam}`, { replace: true });
			}
		}
	}, [listingIdParam, roomIdParam, otherListings, navigate, buildingIdParam, form.building_id]);

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
				commission_rate: (listing as any).commission_rate != null ? String((listing as any).commission_rate) : "",
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

	const filteredAmenities = useMemo(() => {
		const keyword = amenityKeyword.trim().toLowerCase();
		if (!keyword) return amenities;
		return amenities.filter((am) => am.name_vi.toLowerCase().includes(keyword));
	}, [amenities, amenityKeyword]);

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
		setShowCustomAmenityInput(false);
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
		setTimeout(() => {
			if (form.building_id) navigate(`/locations/${form.building_id}?tab=phong`);
			else navigate(-1);
		}, 1200);
	};

	if (!canPost) {
		return (
			<div className="flex-1 overflow-y-auto bg-slate-50">
				<div className="max-w-3xl mx-auto p-6">
					<div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8">
						<h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-2">Thêm thông tin phòng</h1>
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
				<div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
					<div className="px-5 sm:px-6 py-4 border-b border-slate-100 sticky top-0 bg-white z-10">
						<h1 className="text-[20px] font-bold text-slate-900 tracking-tight">
							{listingIdParam ? "Sửa thông tin phòng" : "Thêm thông tin phòng"}
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
							<h2 className="text-[20px] font-bold text-slate-900">Hình ảnh và video</h2>
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
									className="w-40 h-40 border border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center gap-2 text-slate-500 hover:border-[#14B8A6] hover:text-[#14B8A6] transition-all disabled:opacity-50 cursor-pointer"
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
									className="w-full max-w-lg border border-dashed border-slate-300 rounded-xl py-4 px-4 text-left flex items-center gap-3 hover:border-[#14B8A6] transition-all disabled:opacity-50 cursor-pointer"
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
							<div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
								<div>
									<h2 className="text-[20px] font-bold text-slate-900">Mã phòng chung giá</h2>
									<p className="text-slate-500">Chọn mã phòng giống nhau về hình ảnh và giá</p>
								</div>
								
								{selectedBuilding && otherListings.filter(l => l.room_id && l.room_id !== selectedRoom?.id && selectedBuilding.rooms?.some(r => r.id === l.room_id)).length > 0 && (
									<div className="flex flex-col items-start sm:items-end gap-1.5">
										<label className="text-xs font-bold text-slate-600">Sao chép nhanh thiết lập:</label>
										<select
											className="border border-brand-primary/30 rounded-xl px-4 py-2 text-sm font-bold text-brand-primary bg-brand-bg cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
											value=""
											onChange={(e) => {
												const lId = e.target.value;
												if (!lId) return;
												const l = otherListings.find(x => x.id === lId);
												if (l && window.confirm("Bạn có chắc muốn sao chép toàn bộ cấu hình từ phòng này? Dữ liệu đang nhập sẽ bị ghi đè!")) {
													setForm((prev) => ({
														...prev,
														title: l.title ?? prev.title,
														description: l.description ?? prev.description,
														price: l.price != null ? String(l.price) : prev.price,
														contact_name: l.contact_name || prev.contact_name,
														contact_phone: l.contact_phone || prev.contact_phone,
														property_type: l.property_type || prev.property_type,
														
														amenity_ids: l.amenity_ids || prev.amenity_ids,
														max_people: l.max_people ?? prev.max_people,
														max_vehicles: l.max_vehicles ?? prev.max_vehicles,
														length_m: l.length_m != null ? String(l.length_m) : prev.length_m,
														width_m: l.width_m != null ? String(l.width_m) : prev.width_m,
														area: l.area != null ? String(l.area) : prev.area,
														guest_note: l.guest_note ?? prev.guest_note,
														is_discounted: Boolean(l.is_discounted),
														is_newly_built: Boolean(l.is_newly_built),
														commission_rate: (l as any).commission_rate != null ? String((l as any).commission_rate) : prev.commission_rate,
														room_features: l.room_features?.filter((v:string) => ROOM_FEATURES.includes(v)) || prev.room_features,
														custom_amenities: l.room_features?.filter((v:string) => !ROOM_FEATURES.includes(v)) || prev.custom_amenities,
														interior_features: l.interior_features || prev.interior_features,
													}));
													if (l.images && Array.isArray(l.images)) {
														// @ts-ignore - Supabase JSONB returns any object
														setImageUploads(l.images.slice().sort((a:any,b:any) => a.order - b.order).map((img:any, index:number) => ({ url: img.url, order: index })));
													}
													if (l.video_url) setVideoUrl(l.video_url);
												}
											}}
										>
											<option value="">-- Chọn một phòng --</option>
											{otherListings.filter(l => l.room_id && l.room_id !== selectedRoom?.id && selectedBuilding.rooms?.some(r => r.id === l.room_id)).map(l => {
												const rm = selectedBuilding?.rooms?.find(r => r.id === l.room_id);
												return <option key={l.id} value={l.id}>Sao chép form của phòng {rm?.room_number}</option>
											})}
										</select>
									</div>
								)}
							</div>
							
							{loadingInitialData ?
								<div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-slate-500 font-semibold">
									Đang tải thông tin tin đăng...
								</div>
							: selectedRoom ?
								<div className="rounded-xl border border-slate-200 bg-slate-50 p-4 flex flex-wrap items-center gap-3">
									<span className="inline-flex px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-base font-bold text-slate-800">
										{selectedRoom.room_number}
									</span>
									<span className="text-sm font-semibold text-slate-500">{selectedBuilding?.name}</span>
									<button
										onClick={() => {
											if (form.building_id) navigate(`/locations/${form.building_id}?tab=phong`);
											else navigate(-1);
										}}
										className="ml-auto px-4 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 font-bold cursor-pointer"
									>
										Trở về Tòa nhà
									</button>
								</div>
							:	<div className="rounded-xl border border-[#14B8A6]/30 bg-[#14B8A6]/5 p-4 space-y-3">
									<p className="text-brand-dark font-bold">Bạn chưa chọn mã phòng.</p>
									<div className="flex flex-wrap gap-2">
										<button
											onClick={() => {
												if (form.building_id) navigate(`/locations/${form.building_id}?tab=phong`);
												else navigate('/');
											}}
											className="px-4 py-2 rounded-lg bg-brand-primary text-white text-sm font-bold cursor-pointer hover:bg-brand-dark"
										>
											Trở về Sơ đồ phòng
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
								className="w-full h-12 rounded-xl border border-slate-300 px-4 text-base font-semibold focus:outline-none focus:border-[#14B8A6]"
								maxLength={100}
							/>
							<div className="relative">
								<input
									value={formatVnd(form.price)}
									onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))}
									placeholder="Phí thuê *"
									className="w-full h-14 rounded-xl border border-slate-300 px-4 text-2xl font-bold tracking-tight text-slate-800 focus:outline-none focus:border-[#14B8A6]"
								/>
								<span className="absolute right-5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">VNĐ/tháng</span>
							</div>
							<label className="flex items-center gap-2.5 text-base font-semibold text-slate-800">
								<input
									type="checkbox"
									checked={form.is_discounted}
									onChange={(e) => setForm((prev) => ({ ...prev, is_discounted: e.target.checked }))}
									className="w-4 h-4 rounded border-slate-300"
								/>
								Đang có giảm giá tiền thuê
							</label>
							<label className="flex items-center gap-2.5 text-base font-semibold text-slate-800">
								<input
									type="checkbox"
									checked={form.is_newly_built}
									onChange={(e) => setForm((prev) => ({ ...prev, is_newly_built: e.target.checked }))}
									className="w-4 h-4 rounded border-slate-300"
								/>
								Mới xây chưa qua sử dụng
							</label>
						</section>

						<section className="space-y-4">
							<h2 className="text-[20px] font-bold text-slate-900">Loại hình</h2>
							<div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
								{RENTAL_TYPES.map((type) => (
									<button
										key={type.key}
										onClick={() => setForm((prev) => ({ ...prev, property_type: type.key }))}
										className={`h-14 rounded-xl border text-sm font-semibold transition-all cursor-pointer ${
											form.property_type === type.key ?
												"bg-brand-primary text-white border-[#14B8A6]"
											:	"bg-white border-slate-200 text-slate-700 hover:border-slate-300"
										}`}
									>
										{type.label}
									</button>
								))}
							</div>
						</section>

						<section className="space-y-4">
							<div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5 md:p-6 space-y-6">
								<div className="flex flex-wrap items-start justify-between gap-3">
									<div>
										<h2 className="text-[20px] font-bold text-slate-900">Chi tiết phòng</h2>
										<p className="text-sm font-medium text-slate-500 mt-1">
											Chọn thông tin giúp khách lọc phòng nhanh và chính xác hơn.
										</p>
									</div>
									<span className="px-3 py-1.5 rounded-full border border-[#14B8A6]/20 bg-[#14B8A6]/5 text-[#14B8A6] text-xs font-bold">
										{form.room_features.length + form.interior_features.length + form.amenity_ids.length + form.custom_amenities.length} mục đã chọn
									</span>
								</div>

								<div className="space-y-3">
									<div className="flex items-center justify-between">
										<h3 className="text-base font-bold text-slate-800">Loại phòng</h3>
										<span className="text-xs font-bold text-slate-500">
											{form.room_features.length} đã chọn
										</span>
									</div>
									<div className="flex flex-wrap gap-2.5">
										{ROOM_FEATURES.map((feature) => (
											<button
												key={feature}
												type="button"
												onClick={() => toggleStringArray("room_features", feature)}
												className={`px-3.5 py-2 rounded-xl border text-sm font-semibold cursor-pointer transition-colors ${
													form.room_features.includes(feature) ?
														"bg-[#14B8A6]/5 border-[#14B8A6]/40 text-brand-dark"
													:	"bg-white border-slate-200 text-slate-700 hover:border-slate-300"
												}`}
											>
												{feature}
											</button>
										))}
									</div>
								</div>

								<div className="space-y-3">
									<div className="flex items-center justify-between">
										<h3 className="text-base font-bold text-slate-800">Nội thất</h3>
										<span className="text-xs font-bold text-slate-500">
											{form.interior_features.length} đã chọn
										</span>
									</div>
									<div className="flex flex-wrap gap-2.5">
										{INTERIOR_FEATURES.map((feature) => (
											<button
												key={feature}
												type="button"
												onClick={() => toggleStringArray("interior_features", feature)}
												className={`px-3.5 py-2 rounded-xl border text-sm font-semibold cursor-pointer transition-colors ${
													form.interior_features.includes(feature) ?
														"bg-[#14B8A6]/5 border-[#14B8A6]/40 text-brand-dark"
													:	"bg-white border-slate-200 text-slate-700 hover:border-slate-300"
												}`}
											>
												{feature}
											</button>
										))}
									</div>
								</div>

								<div className="space-y-3">
									<div className="flex flex-wrap items-center justify-between gap-2">
										<h3 className="text-base font-bold text-slate-800">Tiện ích</h3>
										<span className="text-xs font-bold text-slate-500">
											{form.amenity_ids.length + form.custom_amenities.length} đã chọn
										</span>
									</div>

									<input
										value={amenityKeyword}
										onChange={(e) => setAmenityKeyword(e.target.value)}
										placeholder="Tìm nhanh tiện ích..."
										className="w-full h-11 rounded-xl border border-slate-300 px-4 text-sm font-medium bg-white"
									/>

									<div className="flex flex-wrap gap-2.5">
										{filteredAmenities.map((am) => (
											<button
												key={am.id}
												type="button"
												onClick={() => toggleAmenity(am.id)}
												className={`px-3.5 py-2 rounded-xl border text-sm font-semibold cursor-pointer transition-colors ${
													form.amenity_ids.includes(am.id) ?
														"bg-[#14B8A6]/5 border-[#14B8A6]/40 text-brand-dark"
													:	"bg-white border-slate-200 text-slate-700 hover:border-slate-300"
												}`}
											>
												{am.name_vi}
											</button>
										))}
										{filteredAmenities.length === 0 && (
											<p className="text-sm text-slate-500">Không tìm thấy tiện ích phù hợp.</p>
										)}
									</div>

									<div className="space-y-2">
										<button
											type="button"
											onClick={() => setShowCustomAmenityInput((prev) => !prev)}
											className="px-4 py-2.5 rounded-xl border border-[#14B8A6]/40 text-[#14B8A6] text-sm font-bold flex items-center gap-1.5 hover:bg-[#14B8A6]/5 cursor-pointer"
										>
											<PlusCircle className="w-4 h-4" />
											Thêm tiện ích tùy chỉnh
										</button>
										{showCustomAmenityInput && (
											<div className="flex gap-2">
												<input
													value={customAmenityDraft}
													onChange={(e) => setCustomAmenityDraft(e.target.value)}
													placeholder="Nhập tiện ích mới..."
													className="flex-1 h-11 rounded-xl border border-slate-300 px-4 text-sm font-medium bg-white"
												/>
												<button
													type="button"
													onClick={handleAddCustomAmenity}
													className="px-4 rounded-xl border border-slate-300 text-slate-700 text-sm font-semibold cursor-pointer hover:bg-slate-100"
												>
													Thêm
												</button>
											</div>
										)}
									</div>

									{form.custom_amenities.length > 0 && (
										<div className="flex flex-wrap gap-2">
											{form.custom_amenities.map((item) => (
												<span
													key={item}
													className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-sm font-semibold flex items-center gap-1.5"
												>
													{item}
													<button
														type="button"
														onClick={() =>
															setForm((prev) => ({
																...prev,
																custom_amenities: prev.custom_amenities.filter((x) => x !== item),
															}))
														}
														className="cursor-pointer text-slate-400 hover:text-rose-500"
													>
														<MinusCircle className="w-3.5 h-3.5" />
													</button>
												</span>
											))}
										</div>
									)}
								</div>
							</div>
						</section>

						<section className="space-y-4">
							<h2 className="text-[20px] font-bold text-slate-900">Số người tối đa</h2>
							<div className="flex flex-wrap gap-3">
								{Array.from({ length: 10 }).map((_, idx) => {
									const value = idx + 1;
									return (
										<button
											key={value}
											onClick={() => setForm((prev) => ({ ...prev, max_people: value }))}
											className={`w-12 h-12 rounded-xl border text-base font-bold cursor-pointer ${
												form.max_people === value ?
													"bg-[#14B8A6]/5 border-[#14B8A6]/40 text-brand-dark"
												:	"border-slate-200 text-slate-700 hover:border-slate-300"
											}`}
										>
											{value}
										</button>
									);
								})}
							</div>
						</section>

						<section className="space-y-4">
							<h2 className="text-[20px] font-bold text-slate-900">Số xe tối đa</h2>
							<div className="flex flex-wrap gap-3">
								{Array.from({ length: 10 }).map((_, idx) => {
									const value = idx + 1;
									return (
										<button
											key={value}
											onClick={() => setForm((prev) => ({ ...prev, max_vehicles: value }))}
											className={`w-12 h-12 rounded-xl border text-base font-bold cursor-pointer ${
												form.max_vehicles === value ?
													"bg-[#14B8A6]/5 border-[#14B8A6]/40 text-brand-dark"
												:	"border-slate-200 text-slate-700 hover:border-slate-300"
											}`}
										>
											{value}
										</button>
									);
								})}
							</div>
						</section>

						<section className="space-y-4">
							<h2 className="text-[20px] font-bold text-slate-900">Diện tích</h2>
							<div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-center">
								<input
									value={form.length_m}
									onChange={(e) => setForm((prev) => ({ ...prev, length_m: e.target.value }))}
									placeholder="Chiều dài (m)"
									className="h-12 rounded-xl border border-slate-300 px-4 text-base font-semibold focus:outline-none focus:border-[#14B8A6]"
								/>
								<span className="text-xl font-bold text-slate-700">x</span>
								<input
									value={form.width_m}
									onChange={(e) => setForm((prev) => ({ ...prev, width_m: e.target.value }))}
									placeholder="Chiều rộng (m)"
									className="h-12 rounded-xl border border-slate-300 px-4 text-base font-semibold focus:outline-none focus:border-[#14B8A6]"
								/>
							</div>
							<div className="max-w-sm rounded-2xl border border-slate-300 px-4 py-3">
								<p className="text-sm font-semibold text-slate-500">Tổng diện tích</p>
								<p className="text-2xl font-bold text-slate-800">{computedArea.toFixed(2)} m²</p>
							</div>
						</section>

						<section className="space-y-4">
							<h2 className="text-[20px] font-bold text-slate-900">Lưu ý cho khách</h2>
							<textarea
								rows={4}
								value={form.guest_note}
								onChange={(e) => setForm((prev) => ({ ...prev, guest_note: e.target.value }))}
								placeholder="Thông tin dành cho khách thuê, ví dụ: giảm giá nếu ở 1 mình..."
								className="w-full rounded-xl border border-slate-300 p-4 text-sm focus:outline-none focus:border-[#14B8A6]"
							/>
							<textarea
								rows={4}
								value={form.description}
								onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
								placeholder="Mô tả chi tiết thêm..."
								className="w-full rounded-xl border border-slate-300 p-4 text-sm focus:outline-none focus:border-[#14B8A6]"
							/>
						</section>

						<section className="space-y-3">
							<h2 className="text-[20px] font-bold text-slate-900">Thông tin liên hệ</h2>
							<div className="grid sm:grid-cols-2 gap-3">
								<input
									value={form.contact_name}
									onChange={(e) => setForm((prev) => ({ ...prev, contact_name: e.target.value }))}
									placeholder="Họ và tên"
									className="h-12 rounded-xl border border-slate-300 px-4 text-base font-semibold focus:outline-none focus:border-[#14B8A6]"
								/>
								<input
									value={form.contact_phone}
									onChange={(e) => setForm((prev) => ({ ...prev, contact_phone: e.target.value }))}
									placeholder="Số điện thoại *"
									className="h-12 rounded-xl border border-slate-300 px-4 text-base font-semibold focus:outline-none focus:border-[#14B8A6]"
								/>
							</div>
						</section>
						
						{/* Commission Block (Nguồn trọ môi giới) */}
						<section className="bg-brand-bg/50 border border-brand-primary/20 rounded-2xl p-5 sm:p-6 space-y-4">
							<div className="flex gap-4">
								<div className="w-12 h-12 rounded-full bg-brand-bg flex items-center justify-center flex-shrink-0">
									<svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
										<path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
									</svg>
								</div>
								<div>
									<h2 className="text-[18px] font-bold text-slate-900 leading-tight">Ký gửi phòng lên Nguồn Trọ Môi Giới</h2>
									<ul className="mt-2 space-y-1 text-sm text-slate-600">
										<li className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-slate-400" /> Cho môi giới biết bạn đang có phòng trống</li>
										<li className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-slate-400" /> Môi giới có khách sẽ liên hệ bạn</li>
										<li className="flex items-center gap-2"><span className="w-4 h-4 rounded-full bg-brand-primary text-white flex items-center justify-center text-[10px] font-bold">+</span> Tăng cơ hội lấp phòng nhanh</li>
									</ul>
								</div>
							</div>
							<div className="pt-2">
								<label className="block text-sm font-bold text-slate-700 mb-2">Mức hoa hồng cho môi giới (%)</label>
								<div className="relative">
									<input
										type="number"
										min="0"
										max="100"
										value={form.commission_rate}
										onChange={(e) => setForm(prev => ({ ...prev, commission_rate: e.target.value }))}
										placeholder="Vd: 50"
										className="w-full h-12 rounded-xl border border-brand-primary/30 px-4 text-base font-semibold focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
									/>
								</div>
							</div>
						</section>
					</div>
				</div>

				<div className="fixed bottom-0 left-0 right-0 z-20 bg-slate-50/95 backdrop-blur border-t border-slate-200 p-4 lg:static lg:bg-transparent lg:border-t-0 lg:backdrop-blur-none lg:p-0 lg:mt-6">
					<div className="max-w-3xl mx-auto lg:max-w-none flex gap-3">
						<button
							onClick={() => {
								if (form.building_id) navigate(`/locations/${form.building_id}?tab=phong`);
								else navigate(-1);
							}}
							className="flex-1 lg:flex-none lg:w-40 h-12 rounded-xl border border-slate-300 bg-white text-slate-700 font-bold hover:bg-slate-50 transition-colors"
						>
							Trở về
						</button>
						<button
							onClick={handleSubmit}
							disabled={loading}
							className="flex-[2] lg:flex-1 h-12 rounded-xl bg-brand-primary text-white text-lg lg:text-base font-bold tracking-tight disabled:opacity-60 cursor-pointer hover:bg-brand-dark transition-colors"
						>
							{loading ? (listingIdParam ? "Đang cập nhật..." : "Đang tạo...") : (listingIdParam ? "Cập nhật & Ký gửi ngay" : "Ký gửi ngay")}
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}


import { useEffect, useState } from "react";
import { useParams, Link, useSearchParams } from "react-router-dom";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import L from "leaflet";
import {
	Calendar,
	Phone,
	Bed,
	Home,
	Check,
	Layers,
	Maximize,
	Droplet,
	Zap,
	MapPin,
	CircleDollarSign,
	CalendarClock,
	Send,
	ShieldCheck,
} from "lucide-react";
import { api } from "../lib/api";
import { useAuth } from "../contexts/AuthContext";
import Modal from "../components/modals/Modal";
import type { Listing, Amenity } from "../../../shared/types";
import "leaflet/dist/leaflet.css";

const DefaultIcon = L.icon({
	iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
	shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
	iconSize: [25, 41],
	iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

const SATELLITE_URL = "https://mt1.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}";
const ROADMAP_URL = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
const FALLBACK_IMAGE =
	"https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&h=800&fit=crop";

interface ListingWithProfile extends Listing {
	profiles?: { full_name: string; phone: string; avatar_url: string | null };
}

interface ReservationResponse {
	message: string;
	reservation?: {
		id: string;
		reservation_code: string;
		check_in_date: string;
		status: string;
	};
}

interface TourResponse {
	message: string;
	tour?: {
		id: string;
		tour_code: string;
		appointment_date: string;
		appointment_time: string;
		status: string;
	};
}

const getToday = () => new Date().toISOString().split("T")[0];
const getTomorrow = () => {
	const date = new Date();
	date.setDate(date.getDate() + 1);
	return date.toISOString().split("T")[0];
};

const formatCurrency = (value: number) => new Intl.NumberFormat("vi-VN").format(Number(value || 0));

export default function ListingDetailPage() {
	const { id } = useParams<{ id: string }>();
	const [searchParams] = useSearchParams();
	const { user } = useAuth();

	const [listing, setListing] = useState<ListingWithProfile | null>(null);
	const [amenities, setAmenities] = useState<Amenity[]>([]);
	const [loading, setLoading] = useState(true);

	const [isReserveOpen, setIsReserveOpen] = useState(false);
	const [isTourOpen, setIsTourOpen] = useState(false);
	const [handledDeepLinkAction, setHandledDeepLinkAction] = useState(false);
	const [mapMode, setMapMode] = useState<"roadmap" | "satellite">("satellite");

	const [reserveSubmitting, setReserveSubmitting] = useState(false);
	const [tourSubmitting, setTourSubmitting] = useState(false);
	const [reserveError, setReserveError] = useState("");
	const [tourError, setTourError] = useState("");
	const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

	const [reserveForm, setReserveForm] = useState({
		customer_name: "",
		customer_phone: "",
		customer_email: "",
		check_in_date: getToday(),
		expected_check_out: "",
		deposit_amount: "",
		notes: "",
	});

	const [tourForm, setTourForm] = useState({
		customer_name: "",
		customer_phone: "",
		customer_email: "",
		appointment_date: getTomorrow(),
		appointment_time: "09:00",
		message: "",
	});

	useEffect(() => {
		if (!id) return;
		let mounted = true;

		Promise.all([
			api.get<{ listing: ListingWithProfile }>(`/api/listings/${id}`),
			api.get<{ amenities: Amenity[] }>("/api/search/amenities"),
		]).then(([listingRes, amenityRes]) => {
			if (!mounted) return;
			if (listingRes.data) setListing(listingRes.data.listing);
			if (amenityRes.data) setAmenities(amenityRes.data.amenities);
			setLoading(false);
		});

		return () => {
			mounted = false;
		};
	}, [id]);

	useEffect(() => {
		const profileName = user?.profile?.full_name || "";
		const profilePhone = user?.profile?.phone || "";
		const profileEmail = user?.email || "";

		setReserveForm((prev) => ({
			...prev,
			customer_name: prev.customer_name || profileName,
			customer_phone: prev.customer_phone || profilePhone,
			customer_email: prev.customer_email || profileEmail,
		}));
		setTourForm((prev) => ({
			...prev,
			customer_name: prev.customer_name || profileName,
			customer_phone: prev.customer_phone || profilePhone,
			customer_email: prev.customer_email || profileEmail,
		}));
	}, [user?.email, user?.profile?.full_name, user?.profile?.phone]);

	useEffect(() => {
		if (!listing || handledDeepLinkAction) return;
		const action = searchParams.get("action");
		if (action === "reserve") setIsReserveOpen(true);
		if (action === "tour") setIsTourOpen(true);
		setHandledDeepLinkAction(true);
	}, [handledDeepLinkAction, listing, searchParams]);

	const handleSubmitReserve = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!id) return;
		setReserveError("");
		setFeedback(null);
		setReserveSubmitting(true);

		const payload = {
			listing_id: id,
			...reserveForm,
			deposit_amount:
				reserveForm.deposit_amount.trim().length > 0 ? Number(reserveForm.deposit_amount) : 0,
		};
		const { data, error } = await api.post<ReservationResponse>("/api/reservations/public", payload);

		if (error) {
			setReserveError(error);
			setReserveSubmitting(false);
			return;
		}

		setReserveSubmitting(false);
		setIsReserveOpen(false);
		setFeedback({
			type: "success",
			message:
				data?.reservation?.reservation_code ?
					`Giữ chỗ thành công (${data.reservation.reservation_code}). Chủ trọ sẽ liên hệ bạn sớm.`
				:	"Giữ chỗ thành công. Chủ trọ sẽ liên hệ bạn sớm.",
		});
	};

	const handleSubmitTour = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!id) return;
		setTourError("");
		setFeedback(null);
		setTourSubmitting(true);

		const payload = {
			listing_id: id,
			...tourForm,
		};
		const { data, error } = await api.post<TourResponse>("/api/visit-tours/public", payload);

		if (error) {
			setTourError(error);
			setTourSubmitting(false);
			return;
		}

		setTourSubmitting(false);
		setIsTourOpen(false);
		setFeedback({
			type: "success",
			message:
				data?.tour?.tour_code ?
					`Đặt lịch xem thành công (${data.tour.tour_code}). Nhân viên sẽ xác nhận lại với bạn.`
				:	"Đặt lịch xem thành công. Nhân viên sẽ xác nhận lại với bạn.",
		});
	};

	if (loading) {
		return (
			<div className="flex-1 flex items-center justify-center bg-white">
				<div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-primary" />
			</div>
		);
	}

	if (!listing) {
		return (
			<div className="flex-1 flex items-center justify-center bg-white">
				<p className="text-slate-500 font-medium">Không tìm thấy tin đăng</p>
			</div>
		);
	}

	const images =
		listing.images?.length ?
			listing.images.map((img: { url: string } | string) => (typeof img === "string" ? img : img.url))
		:	[FALLBACK_IMAGE];
	const listingAmenities = amenities.filter((a) => listing.amenity_ids?.includes(a.id));
	const fullAddress = [listing.address, listing.ward, listing.district, listing.city].filter(Boolean).join(", ");
	const contactPhone = listing.contact_phone || listing.profiles?.phone || "";
	const activeTileUrl = mapMode === "satellite" ? SATELLITE_URL : ROADMAP_URL;

	return (
		<div className="flex-1 overflow-y-auto bg-white pb-20">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
				<div className="flex items-center gap-2 text-[13px] text-slate-400 font-medium mb-3">
					<Link
						to="/"
						className="hover:text-brand-primary transition-colors"
					>
						Thuê trọ
					</Link>
					<span className="opacity-30">/</span>
					<span className="truncate">{listing.title}</span>
				</div>

				<header className="mb-6">
					<h1 className="text-3xl font-extrabold text-slate-900 mb-2 leading-tight">{listing.title}</h1>
					<div className="flex flex-col gap-1.5">
						<div className="flex items-center gap-2 text-slate-700 text-[15px] font-medium">
							<div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
								<MapPin className="w-3 h-3" />
							</div>
							<p>{fullAddress}</p>
						</div>
						<div className="flex items-center gap-2 text-brand-primary text-[16px] font-bold">
							<div className="w-5 h-5 rounded-full bg-brand-primary/10 flex items-center justify-center shrink-0">
								<CircleDollarSign className="w-3 h-3" />
							</div>
							<p>{formatCurrency(listing.price)} VND / tháng</p>
						</div>
					</div>
				</header>

				<section className="mb-8 rounded-2xl border border-brand-primary/20 bg-brand-bg/60 p-5">
					<div className="flex flex-wrap items-start justify-between gap-4">
						<div>
							<p className="text-[11px] font-bold uppercase tracking-widest text-brand-dark/70 mb-1">
								Luồng thuê nhanh
							</p>
							<h2 className="text-lg font-bold text-slate-900">Xem phòng - Giữ chỗ - Ký hợp đồng</h2>
							<p className="text-sm text-slate-600 mt-1">
								Hoàn tất bước đầu ngay trên trang tin đăng, không cần chuyển trang.
							</p>
						</div>
						<div className="inline-flex items-center gap-2 rounded-full bg-white border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600">
							<ShieldCheck className="w-4 h-4 text-brand-primary" />
							Tin đã duyệt và còn trống
						</div>
					</div>

					<div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
						<a
							href={contactPhone ? `tel:${contactPhone}` : "#"}
							className={`h-11 inline-flex items-center justify-center gap-2 rounded-xl border text-sm font-bold transition-colors ${
								contactPhone ?
									"border-slate-200 bg-white text-slate-700 hover:border-brand-primary hover:text-brand-primary"
								:	"border-slate-200 bg-slate-100 text-slate-400 pointer-events-none"
							}`}
						>
							<Phone className="w-4 h-4" />
							Gọi ngay
						</a>
						<button
							type="button"
							onClick={() => {
								setFeedback(null);
								setIsTourOpen(true);
							}}
							className="h-11 inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-bold hover:border-brand-primary hover:text-brand-primary transition-colors cursor-pointer"
						>
							<CalendarClock className="w-4 h-4" />
							Đặt lịch xem
						</button>
						<button
							type="button"
							onClick={() => {
								setFeedback(null);
								setIsReserveOpen(true);
							}}
							className="h-11 inline-flex items-center justify-center gap-2 rounded-xl bg-brand-primary text-white text-sm font-bold hover:bg-brand-dark transition-colors cursor-pointer"
						>
							<Send className="w-4 h-4" />
							Giữ chỗ online
						</button>
					</div>
				</section>

				{feedback && (
					<div
						className={`mb-7 rounded-xl border px-4 py-3 text-sm font-medium ${
							feedback.type === "success" ?
								"border-emerald-200 bg-emerald-50 text-emerald-700"
							:	"border-rose-200 bg-rose-50 text-rose-700"
						}`}
					>
						{feedback.message}
					</div>
				)}

				<div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-10">
					<div className="lg:col-span-8 flex flex-col gap-4">
						<div className="aspect-[16/9] w-full rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 shadow-sm">
							<img
								src={images[0]}
								alt={listing.title}
								className="w-full h-full object-cover"
							/>
						</div>
						<div className="grid grid-cols-2 gap-4">
							<div className="aspect-[3/2] rounded-2xl overflow-hidden border border-slate-100 shadow-sm">
								<img
									src={images[1] || images[0]}
									alt={listing.title}
									className="w-full h-full object-cover"
								/>
							</div>
							<div className="aspect-[3/2] rounded-2xl overflow-hidden border border-slate-100 shadow-sm">
								<img
									src={images[2] || images[0]}
									alt={listing.title}
									className="w-full h-full object-cover"
								/>
							</div>
						</div>
					</div>

					<div className="lg:col-span-4 min-h-[400px] flex flex-col gap-4">
						<div className="flex-1 rounded-2xl overflow-hidden border-2 border-slate-100 shadow-sm relative">
							{listing.lat && listing.lng ?
								<MapContainer
									center={[listing.lat, listing.lng]}
									zoom={15}
									className="w-full h-full z-0"
									scrollWheelZoom={false}
								>
									<TileLayer
										key={mapMode}
										url={activeTileUrl}
									/>
									<Marker position={[listing.lat, listing.lng]} />
								</MapContainer>
							:	<div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400">
									Không có tọa độ bản đồ
								</div>
							}
							<div className="absolute top-4 left-4 z-20 bg-white rounded-lg shadow-md flex overflow-hidden border border-slate-200">
								<button
									type="button"
									onClick={() => setMapMode("roadmap")}
									className={`px-3 py-1.5 text-[12px] font-bold border-r border-slate-200 transition-colors cursor-pointer ${
										mapMode === "roadmap" ? "bg-white text-slate-900" : "bg-slate-100 text-slate-600"
									}`}
								>
									Bản đồ
								</button>
								<button
									type="button"
									onClick={() => setMapMode("satellite")}
									className={`px-3 py-1.5 text-[12px] font-bold transition-colors cursor-pointer ${
										mapMode === "satellite" ? "bg-white text-slate-900" : "bg-slate-100 text-slate-600"
									}`}
								>
									Vệ tinh
								</button>
							</div>
							<div className="absolute bottom-4 right-4 z-20">
								<div className="w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center cursor-pointer hover:bg-slate-50">
									<Maximize className="w-4 h-4 text-slate-600" />
								</div>
							</div>
						</div>

						<div className="rounded-2xl border border-slate-200 bg-white p-4">
							<p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Liên hệ</p>
							<p className="text-base font-bold text-slate-900">
								{listing.contact_name || listing.profiles?.full_name || "Chủ tin đăng"}
							</p>
							<p className="text-sm text-slate-600 mt-1">{contactPhone || "Đang cập nhật"}</p>
						</div>
					</div>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-slate-100 rounded-3xl overflow-hidden border border-slate-100 shadow-sm mb-12">
					<div className="bg-white p-6 flex flex-col items-center gap-2">
						<Calendar className="w-6 h-6 text-slate-400" />
						<p className="text-[12px] font-bold text-slate-400 uppercase tracking-widest">Ngày sẵn sàng</p>
						<p className="text-[18px] font-extrabold text-slate-900">
							{listing.available_date ? new Date(listing.available_date).toLocaleDateString("vi-VN") : "Ở ngay"}
						</p>
					</div>
					<div className="bg-white p-6 flex flex-col items-center gap-2">
						<Phone className="w-6 h-6 text-slate-400" />
						<p className="text-[12px] font-bold text-slate-400 uppercase tracking-widest">Số điện thoại</p>
						<p className="text-[18px] font-extrabold text-slate-900">{contactPhone || "Đang cập nhật"}</p>
					</div>
				</div>

				<div className="mb-12">
					<h2 className="text-[20px] font-bold text-slate-900 mb-8 pb-4 border-b border-slate-100">
						Tiện nghi / Đặc điểm nổi bật
					</h2>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-6 gap-x-12">
						<div className="flex items-center justify-between pb-3 border-b border-slate-50">
							<div className="flex items-center gap-3">
								<Bed className="w-5 h-5 text-slate-300" />
								<span className="text-[14px] font-bold text-slate-600">Số phòng ngủ:</span>
							</div>
							<span className="text-[15px] font-extrabold text-slate-900">{listing.bedrooms || 0} PN</span>
						</div>
						<div className="flex items-center justify-between pb-3 border-b border-slate-50">
							<div className="flex items-center gap-3">
								<Maximize className="w-5 h-5 text-slate-300" />
								<span className="text-[14px] font-bold text-slate-600">Diện tích:</span>
							</div>
							<span className="text-[15px] font-extrabold text-slate-900">{listing.area || "--"} m²</span>
						</div>
						<div className="flex items-center justify-between pb-3 border-b border-slate-50">
							<div className="flex items-center gap-3">
								<Droplet className="w-5 h-5 text-slate-300" />
								<span className="text-[14px] font-bold text-slate-600">Vệ sinh:</span>
							</div>
							<span className="text-[15px] font-extrabold text-slate-900">{listing.bathrooms || 0} WC</span>
						</div>
						<div className="flex items-center justify-between pb-3 border-b border-slate-50">
							<div className="flex items-center gap-3">
								<Home className="w-5 h-5 text-slate-300" />
								<span className="text-[14px] font-bold text-slate-600">Loại hình:</span>
							</div>
							<span className="text-[15px] font-extrabold text-slate-900">
								{listing.property_type === "phong_tro" ? "Phòng trọ"
								: listing.property_type === "can_ho_mini" ? "Căn hộ mini"
								: listing.property_type === "chung_cu" ? "Căn hộ chung cư"
								: "Nhà nguyên căn"}
							</span>
						</div>
						{listing.direction && (
							<div className="flex items-center justify-between pb-3 border-b border-slate-50">
								<div className="flex items-center gap-3">
									<Zap className="w-5 h-5 text-slate-300" />
									<span className="text-[14px] font-bold text-slate-600">Hướng nhà:</span>
								</div>
								<span className="text-[15px] font-extrabold text-slate-900">{listing.direction}</span>
							</div>
						)}
						<div className="flex items-center justify-between pb-3 border-b border-slate-50">
							<div className="flex items-center gap-3">
								<Layers className="w-5 h-5 text-slate-300" />
								<span className="text-[14px] font-bold text-slate-600">Nội thất:</span>
							</div>
							<span className="text-[15px] font-extrabold text-slate-900">
								{listing.furniture === "full" ? "Đầy đủ"
								: listing.furniture === "basic" ? "Cơ bản"
								: "Không nội thất"}
							</span>
						</div>

						{listingAmenities.map((am) => (
							<div
								key={am.id}
								className="flex items-center gap-4 py-1"
							>
								<div className="w-5 h-5 rounded-full bg-green-50 flex items-center justify-center shrink-0">
									<Check className="w-3.5 h-3.5 text-green-600" />
								</div>
								<span className="text-[14px] font-bold text-slate-600">{am.name_vi}</span>
							</div>
						))}
					</div>
				</div>

				<div className="mb-20">
					<h2 className="text-[20px] font-bold text-slate-900 mb-6">Ghi chú khác</h2>
					<div className="bg-slate-50/50 p-8 rounded-3xl border border-dotted border-slate-200">
						<p className="text-[16px] text-slate-600 leading-relaxed italic whitespace-pre-wrap">
							"{listing.description || "Chưa có thêm ghi chú chi tiết cho tin đăng này."}"
						</p>
					</div>
				</div>
			</div>

			<Modal
				isOpen={isReserveOpen}
				onClose={() => {
					setIsReserveOpen(false);
					setReserveError("");
				}}
				title="Giữ chỗ online"
				size="lg"
			>
				<form
					onSubmit={handleSubmitReserve}
					className="space-y-4"
				>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div className="space-y-1.5">
							<label className="text-xs font-bold uppercase tracking-wider text-slate-500">
								Họ và tên *
							</label>
							<input
								required
								value={reserveForm.customer_name}
								onChange={(e) =>
									setReserveForm((prev) => ({ ...prev, customer_name: e.target.value }))
								}
								className="w-full h-11 rounded-xl border border-slate-300 px-3.5 text-sm focus:outline-none focus:border-brand-primary"
								placeholder="Nguyễn Văn A"
							/>
						</div>
						<div className="space-y-1.5">
							<label className="text-xs font-bold uppercase tracking-wider text-slate-500">
								Số điện thoại *
							</label>
							<input
								required
								value={reserveForm.customer_phone}
								onChange={(e) =>
									setReserveForm((prev) => ({ ...prev, customer_phone: e.target.value }))
								}
								className="w-full h-11 rounded-xl border border-slate-300 px-3.5 text-sm focus:outline-none focus:border-brand-primary"
								placeholder="09xx xxx xxx"
							/>
						</div>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div className="space-y-1.5">
							<label className="text-xs font-bold uppercase tracking-wider text-slate-500">
								Email
							</label>
							<input
								type="email"
								value={reserveForm.customer_email}
								onChange={(e) =>
									setReserveForm((prev) => ({ ...prev, customer_email: e.target.value }))
								}
								className="w-full h-11 rounded-xl border border-slate-300 px-3.5 text-sm focus:outline-none focus:border-brand-primary"
								placeholder="email@example.com"
							/>
						</div>
						<div className="space-y-1.5">
							<label className="text-xs font-bold uppercase tracking-wider text-slate-500">
								Tiền cọc dự kiến
							</label>
							<input
								type="number"
								min={0}
								value={reserveForm.deposit_amount}
								onChange={(e) =>
									setReserveForm((prev) => ({ ...prev, deposit_amount: e.target.value }))
								}
								className="w-full h-11 rounded-xl border border-slate-300 px-3.5 text-sm focus:outline-none focus:border-brand-primary"
								placeholder="0"
							/>
						</div>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div className="space-y-1.5">
							<label className="text-xs font-bold uppercase tracking-wider text-slate-500">
								Ngày nhận phòng *
							</label>
							<input
								type="date"
								required
								value={reserveForm.check_in_date}
								onChange={(e) =>
									setReserveForm((prev) => ({ ...prev, check_in_date: e.target.value }))
								}
								className="w-full h-11 rounded-xl border border-slate-300 px-3.5 text-sm focus:outline-none focus:border-brand-primary"
							/>
						</div>
						<div className="space-y-1.5">
							<label className="text-xs font-bold uppercase tracking-wider text-slate-500">
								Ngày trả dự kiến
							</label>
							<input
								type="date"
								value={reserveForm.expected_check_out}
								onChange={(e) =>
									setReserveForm((prev) => ({ ...prev, expected_check_out: e.target.value }))
								}
								className="w-full h-11 rounded-xl border border-slate-300 px-3.5 text-sm focus:outline-none focus:border-brand-primary"
							/>
						</div>
					</div>

					<div className="space-y-1.5">
						<label className="text-xs font-bold uppercase tracking-wider text-slate-500">
							Ghi chú thêm
						</label>
						<textarea
							rows={3}
							value={reserveForm.notes}
							onChange={(e) => setReserveForm((prev) => ({ ...prev, notes: e.target.value }))}
							className="w-full rounded-xl border border-slate-300 p-3.5 text-sm focus:outline-none focus:border-brand-primary resize-none"
							placeholder="Thông tin thêm để chủ trọ xử lý nhanh hơn..."
						/>
					</div>

					{reserveError && <p className="text-sm font-medium text-rose-600">{reserveError}</p>}

					<div className="flex items-center justify-end gap-3 pt-2">
						<button
							type="button"
							onClick={() => setIsReserveOpen(false)}
							className="h-10 px-4 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
						>
							Hủy
						</button>
						<button
							type="submit"
							disabled={reserveSubmitting}
							className="h-10 px-5 rounded-xl bg-brand-primary text-white text-sm font-bold hover:bg-brand-dark transition-colors disabled:opacity-70 cursor-pointer"
						>
							{reserveSubmitting ? "Đang gửi..." : "Xác nhận giữ chỗ"}
						</button>
					</div>
				</form>
			</Modal>

			<Modal
				isOpen={isTourOpen}
				onClose={() => {
					setIsTourOpen(false);
					setTourError("");
				}}
				title="Đặt lịch xem phòng"
				size="lg"
			>
				<form
					onSubmit={handleSubmitTour}
					className="space-y-4"
				>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div className="space-y-1.5">
							<label className="text-xs font-bold uppercase tracking-wider text-slate-500">
								Họ và tên *
							</label>
							<input
								required
								value={tourForm.customer_name}
								onChange={(e) =>
									setTourForm((prev) => ({ ...prev, customer_name: e.target.value }))
								}
								className="w-full h-11 rounded-xl border border-slate-300 px-3.5 text-sm focus:outline-none focus:border-brand-primary"
								placeholder="Nguyễn Văn A"
							/>
						</div>
						<div className="space-y-1.5">
							<label className="text-xs font-bold uppercase tracking-wider text-slate-500">
								Số điện thoại *
							</label>
							<input
								required
								value={tourForm.customer_phone}
								onChange={(e) =>
									setTourForm((prev) => ({ ...prev, customer_phone: e.target.value }))
								}
								className="w-full h-11 rounded-xl border border-slate-300 px-3.5 text-sm focus:outline-none focus:border-brand-primary"
								placeholder="09xx xxx xxx"
							/>
						</div>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div className="space-y-1.5">
							<label className="text-xs font-bold uppercase tracking-wider text-slate-500">
								Email
							</label>
							<input
								type="email"
								value={tourForm.customer_email}
								onChange={(e) =>
									setTourForm((prev) => ({ ...prev, customer_email: e.target.value }))
								}
								className="w-full h-11 rounded-xl border border-slate-300 px-3.5 text-sm focus:outline-none focus:border-brand-primary"
								placeholder="email@example.com"
							/>
						</div>
						<div className="grid grid-cols-2 gap-3">
							<div className="space-y-1.5">
								<label className="text-xs font-bold uppercase tracking-wider text-slate-500">
									Ngày hẹn *
								</label>
								<input
									type="date"
									required
									value={tourForm.appointment_date}
									onChange={(e) =>
										setTourForm((prev) => ({ ...prev, appointment_date: e.target.value }))
									}
									className="w-full h-11 rounded-xl border border-slate-300 px-3.5 text-sm focus:outline-none focus:border-brand-primary"
								/>
							</div>
							<div className="space-y-1.5">
								<label className="text-xs font-bold uppercase tracking-wider text-slate-500">
									Giờ *
								</label>
								<input
									type="time"
									required
									value={tourForm.appointment_time}
									onChange={(e) =>
										setTourForm((prev) => ({ ...prev, appointment_time: e.target.value }))
									}
									className="w-full h-11 rounded-xl border border-slate-300 px-3.5 text-sm focus:outline-none focus:border-brand-primary"
								/>
							</div>
						</div>
					</div>

					<div className="space-y-1.5">
						<label className="text-xs font-bold uppercase tracking-wider text-slate-500">
							Lời nhắn
						</label>
						<textarea
							rows={3}
							value={tourForm.message}
							onChange={(e) => setTourForm((prev) => ({ ...prev, message: e.target.value }))}
							className="w-full rounded-xl border border-slate-300 p-3.5 text-sm focus:outline-none focus:border-brand-primary resize-none"
							placeholder="Ví dụ: Tôi có thể qua xem sau 18:00."
						/>
					</div>

					{tourError && <p className="text-sm font-medium text-rose-600">{tourError}</p>}

					<div className="flex items-center justify-end gap-3 pt-2">
						<button
							type="button"
							onClick={() => setIsTourOpen(false)}
							className="h-10 px-4 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
						>
							Hủy
						</button>
						<button
							type="submit"
							disabled={tourSubmitting}
							className="h-10 px-5 rounded-xl bg-brand-primary text-white text-sm font-bold hover:bg-brand-dark transition-colors disabled:opacity-70 cursor-pointer"
						>
							{tourSubmitting ? "Đang gửi..." : "Xác nhận lịch xem"}
						</button>
					</div>
				</form>
			</Modal>
		</div>
	);
}

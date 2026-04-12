import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import L from "leaflet";
import { api } from "../lib/api";
import type { Listing, Amenity } from "../../../shared/types";
import "leaflet/dist/leaflet.css";
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
	CircleDollarSign
} from "lucide-react";

// Fix Leaflet icon issue
const DefaultIcon = L.icon({
	iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
	shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
	iconSize: [25, 41],
	iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

const SATELLITE_URL = "https://mt1.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}";

interface ListingWithProfile extends Listing {
	profiles?: { full_name: string; phone: string; avatar_url: string | null };
}

export default function ListingDetailPage() {
	const { id } = useParams<{ id: string }>();
	const [listing, setListing] = useState<ListingWithProfile | null>(null);
	const [amenities, setAmenities] = useState<Amenity[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (!id) return;
		Promise.all([
			api.get<{ listing: ListingWithProfile }>(`/api/listings/${id}`),
			api.get<{ amenities: Amenity[] }>("/api/search/amenities"),
		]).then(([listingRes, amenityRes]) => {
			if (listingRes.data) setListing(listingRes.data.listing);
			if (amenityRes.data) setAmenities(amenityRes.data.amenities);
			setLoading(false);
		});
	}, [id]);

	if (loading)
		return (
			<div className="flex-1 flex items-center justify-center bg-white">
				<div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-primary" />
			</div>
		);
	if (!listing)
		return (
			<div className="flex-1 flex items-center justify-center bg-white">
				<p className="text-slate-500 font-medium">Không tìm thấy tin đăng</p>
			</div>
		);

	const images =
		listing.images?.length > 0 ?
			listing.images.map((img: { url: string } | string) =>
				typeof img === "string" ? img : img.url,
			)
		:	["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&h=800&fit=crop"];

	const listingAmenities = amenities.filter((a) => listing.amenity_ids?.includes(a.id));

	return (
		<div className="flex-1 overflow-y-auto bg-white scroll-smooth pb-20">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
				{/* Breadcrumb / Category */}
				<div className="flex items-center gap-2 text-[13px] text-slate-400 font-medium mb-2">
					<Link to="/" className="hover:text-brand-primary transition-colors">Thuê trọ</Link>
					<span className="opacity-30">/</span>
					<span className="truncate">{listing.title}</span>
				</div>

				{/* Header Section */}
				<header className="mb-8">
					<h1 className="text-3xl font-extrabold text-[#111] mb-2 leading-tight">
						{listing.title}
					</h1>
					<div className="flex flex-col gap-1.5">
						<div className="flex items-center gap-2 text-[#444] text-[15px] font-medium">
							<div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
								<MapPin className="w-3 h-3" />
							</div>
							<p>{listing.address}{listing.ward && `, ${listing.ward}`}{listing.district && `, ${listing.district}`}{listing.city && `, ${listing.city}`}</p>
						</div>
						<div className="flex items-center gap-2 text-brand-primary text-[16px] font-bold">
							<div className="w-5 h-5 rounded-full bg-brand-primary/10 flex items-center justify-center shrink-0">
								<CircleDollarSign className="w-3 h-3" />
							</div>
							<p>{new Intl.NumberFormat('vi-VN').format(listing.price)} VND / tháng</p>
						</div>
					</div>
				</header>

				{/* Media Grid: Gallery Left, Map Right */}
				<div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-10">
					{/* Gallery (Left 8 cols) */}
					<div className="lg:col-span-8 flex flex-col gap-4">
						<div className="aspect-[16/9] w-full rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 shadow-sm relative group">
							<img 
								src={images[0]} 
								alt="" 
								className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
							/>
						</div>
						<div className="grid grid-cols-2 gap-4">
							<div className="aspect-[3/2] rounded-2xl overflow-hidden border border-slate-100 shadow-sm">
								<img src={images[1] || images[0]} alt="" className="w-full h-full object-cover" />
							</div>
							<div className="aspect-[3/2] rounded-2xl overflow-hidden border border-slate-100 shadow-sm">
								<img src={images[2] || images[0]} alt="" className="w-full h-full object-cover" />
							</div>
						</div>
					</div>

					{/* Map (Right 4 cols) */}
					<div className="lg:col-span-4 h-full min-h-[400px]">
						<div className="h-full rounded-2xl overflow-hidden border-2 border-slate-100 shadow-sm relative group">
							{listing.lat && listing.lng ? (
								<MapContainer
									center={[listing.lat, listing.lng]}
									zoom={15}
									className="w-full h-full z-0"
									scrollWheelZoom={false}
								>
									<TileLayer url={SATELLITE_URL} />
									<Marker position={[listing.lat, listing.lng]} />
								</MapContainer>
							) : (
								<div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400">
									Không có tọa độ bản đồ
								</div>
							)}
							{/* Switch Map/Satellite buttons (Static UI similar to screenshot) */}
							<div className="absolute top-4 left-4 z-[400] bg-white rounded shadow-md flex overflow-hidden border border-slate-200">
								<button className="px-3 py-1.5 text-[12px] font-bold bg-white text-slate-900 border-r border-slate-200">Bản đồ</button>
								<button className="px-3 py-1.5 text-[12px] font-bold bg-[#f1f5f9] text-slate-600">Vệ tinh</button>
							</div>
							<div className="absolute bottom-4 right-4 z-[400]">
								<div className="w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center cursor-pointer hover:bg-slate-50">
									<Maximize className="w-4 h-4 text-slate-600" />
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Important Info Bar */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-slate-100 rounded-3xl overflow-hidden border border-slate-100 shadow-sm mb-12">
					<div className="bg-white p-6 flex flex-col items-center gap-2 group transition-all hover:bg-slate-50">
						<Calendar className="w-6 h-6 text-slate-400 group-hover:text-brand-primary transition-colors" />
						<p className="text-[12px] font-bold text-slate-400 uppercase tracking-widest">Ngày sẵn sàng</p>
						<p className="text-[18px] font-extrabold text-[#111]">
							{listing.available_date ? new Date(listing.available_date).toLocaleDateString("vi-VN") : "Ở ngay"}
						</p>
					</div>
					<div className="bg-white p-6 flex flex-col items-center gap-2 group transition-all hover:bg-slate-50">
						<Phone className="w-6 h-6 text-slate-400 group-hover:text-brand-primary transition-colors" />
						<p className="text-[12px] font-bold text-slate-400 uppercase tracking-widest">Số điện thoại</p>
						<p className="text-[18px] font-extrabold text-[#111]">{listing.contact_phone || "Đang cập nhật"}</p>
					</div>
				</div>

				{/* Detailed Specs Grid */}
				<div className="mb-12">
					<h2 className="text-[20px] font-black text-[#111] mb-8 pb-4 border-b border-slate-100">
						Tiện nghi / Đặc điểm nổi bật
					</h2>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-6 gap-x-12">
						{/* Core Stats */}
						<div className="flex items-center justify-between pb-3 border-b border-slate-50">
							<div className="flex items-center gap-3">
								<Bed className="w-5 h-5 text-slate-300" />
								<span className="text-[14px] font-bold text-slate-600">Số phòng ngủ:</span>
							</div>
							<span className="text-[15px] font-extrabold text-[#111]">{listing.bedrooms || 0} PN</span>
						</div>
						<div className="flex items-center justify-between pb-3 border-b border-slate-50">
							<div className="flex items-center gap-3">
								<Maximize className="w-5 h-5 text-slate-300" />
								<span className="text-[14px] font-bold text-slate-600">Diện tích:</span>
							</div>
							<span className="text-[15px] font-extrabold text-[#111]">{listing.area || "--"} m²</span>
						</div>
						<div className="flex items-center justify-between pb-3 border-b border-slate-50">
							<div className="flex items-center gap-3">
								<Droplet className="w-5 h-5 text-slate-300" />
								<span className="text-[14px] font-bold text-slate-600">Vệ sinh:</span>
							</div>
							<span className="text-[15px] font-extrabold text-[#111]">{listing.bathrooms || 0} WC</span>
						</div>
						<div className="flex items-center justify-between pb-3 border-b border-slate-50">
							<div className="flex items-center gap-3">
								<Home className="w-5 h-5 text-slate-300" />
								<span className="text-[14px] font-bold text-slate-600">Loại hình:</span>
							</div>
							<span className="text-[15px] font-extrabold text-[#111]">
								{listing.property_type === 'phong_tro' ? 'Phòng trọ' : listing.property_type === 'can_ho_mini' ? 'Căn hộ mini' : 'Nhà nguyên căn'}
							</span>
						</div>
						{listing.direction && (
							<div className="flex items-center justify-between pb-3 border-b border-slate-50">
								<div className="flex items-center gap-3">
									<Zap className="w-5 h-5 text-slate-300" />
									<span className="text-[14px] font-bold text-slate-600">Hướng nhà:</span>
								</div>
								<span className="text-[15px] font-extrabold text-[#111]">{listing.direction}</span>
							</div>
						)}
						<div className="flex items-center justify-between pb-3 border-b border-slate-50">
							<div className="flex items-center gap-3">
								<Layers className="w-5 h-5 text-slate-300" />
								<span className="text-[14px] font-bold text-slate-600">Nội thất:</span>
							</div>
							<span className="text-[15px] font-extrabold text-[#111]">
								{listing.furniture === 'full' ? 'Đầy đủ' : listing.furniture === 'basic' ? 'Cơ bản' : 'Không nội thất'}
							</span>
						</div>
						
						{/* Checkbox Amenities */}
						{listingAmenities.map((am) => (
							<div key={am.id} className="flex items-center gap-4 py-1">
								<div className="w-5 h-5 rounded-full bg-green-50 flex items-center justify-center shrink-0">
									<Check className="w-3.5 h-3.5 text-green-600" />
								</div>
								<span className="text-[14px] font-bold text-slate-600">{am.name_vi}</span>
							</div>
						))}
					</div>
				</div>

				{/* Additional Notes */}
				<div className="mb-20">
					<h2 className="text-[20px] font-black text-[#111] mb-6">
						Ghi chú khác
					</h2>
					<div className="bg-slate-50/50 p-8 rounded-3xl border border-dotted border-slate-200">
						<p className="text-[16px] text-slate-600 leading-relaxed italic whitespace-pre-wrap">
							"{listing.description || "Chưa có thêm ghi chú chi tiết cho tin đăng này."}"
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}

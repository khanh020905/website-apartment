import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../lib/api";
import type { Listing } from "../../../shared/types";
import { useAuth } from "../contexts/AuthContext";
import { Store, Bell, Settings as SettingsIcon, QrCode, User, CheckCircle2, Share2, Plus, X } from "lucide-react";

export default function Storefront() {
	const { brokerId } = useParams();
	const { user } = useAuth();
	const [listings, setListings] = useState<Listing[]>([]);
	const [loading, setLoading] = useState(true);
	const [showQr, setShowQr] = useState(false);

	// Mocking broker profile data
	const brokerPhone = "0901234567";
	const brokerName = "GenHouse";
	const brokerHandle = "@GenHousee";
	const isOwner = user?.id === brokerId || true; // Mock true for demo structure
	const storeLink = `${window.location.origin}/store/${brokerId || 'demo'}`;

	useEffect(() => {
		const fetchBrokerListings = async () => {
			setLoading(true);
			const res = await api.get<{ data: Listing[] }>('/api/listings?status=approved');
			if (!res.error && res.data) {
				const dataArray = Array.isArray(res.data) ? res.data : (res.data as any).data || (res.data as any).listings || [];
				setListings(dataArray.slice(0, 6)); 
			}
			setLoading(false);
		};
		fetchBrokerListings();
	}, [brokerId]);

	return (
		<div className="min-h-screen bg-slate-50 flex flex-col font-sans">
			{/* Header */}
			<header className="px-6 py-4 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md z-40 border-b border-slate-200 shadow-sm">
				<h1 className="font-bold text-xl text-slate-900">{brokerName}</h1>
				<div className="flex items-center gap-4">
					<button className="relative">
						<Bell className="w-6 h-6 text-slate-700" />
						<span className="absolute 0 top-0 right-0 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
					</button>
					<Link to="/broker/cart">
						<SettingsIcon className="w-6 h-6 text-slate-700" />
					</Link>
				</div>
			</header>

			<main className="flex-1 pb-20 max-w-6xl mx-auto w-full px-4 md:px-8 mt-6">
				{/* Profile Container (Desktop: Horizontal, Mobile: Vertical) */}
				<div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8 flex flex-col md:flex-row items-center md:items-start gap-8 mb-8">
					{/* Avatar */}
					<div className="w-28 h-28 md:w-36 md:h-36 shrink-0 rounded-full border-4 border-slate-50 shadow-sm p-1">
						<div className="w-full h-full rounded-full bg-cyan-50 flex items-center justify-center text-cyan-600 font-black text-3xl md:text-5xl overflow-hidden relative">
							<Store className="w-12 h-12 md:w-16 md:h-16 text-teal-400 absolute opacity-20" />
							<span>{brokerName.substring(0, 2).toUpperCase()}</span>
						</div>
					</div>
					
					{/* Info Area */}
					<div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left">
						<div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-2">
							<h2 className="font-black text-2xl md:text-3xl text-slate-900">{brokerHandle}</h2>
							{isOwner && (
								<div className="hidden md:flex items-center gap-2">
									<Link to="/profile" className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold text-sm rounded-xl transition-colors">
										Chỉnh sửa hồ sơ
									</Link>
									<button onClick={() => setShowQr(true)} className="w-10 h-10 bg-slate-100 hover:bg-slate-200 text-slate-900 flex items-center justify-center rounded-xl transition-colors">
										<QrCode className="w-4 h-4" />
									</button>
								</div>
							)}
						</div>
						
						<div className="flex items-center justify-center md:justify-start gap-2 text-[14px] text-slate-500 font-medium mb-4">
							<span>Môi giới</span>
							<span className="w-1 h-1 bg-slate-300 rounded-full" />
							<span className="text-amber-500 font-bold flex items-center gap-0.5">0 <span className="text-xl leading-none -mt-1">★</span></span>
							<span className="w-1 h-1 bg-slate-300 rounded-full" />
							<span>0 đánh giá</span>
						</div>

						{/* Quick Attributes */}
						<div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-1 text-[13px] font-bold mb-5">
							<div className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 rounded-lg text-slate-600 bg-slate-50">
								<User className="w-4 h-4 text-slate-400" />
								Chủ nhà
							</div>
							<div className="flex items-center gap-1.5 px-3 py-1.5 border border-teal-200 bg-teal-50 rounded-lg text-teal-700">
								<CheckCircle2 className="w-4 h-4 text-teal-500" />
								Tự động nạp hàng
							</div>
						</div>
						<p className="text-sm font-bold text-slate-800">Chuyên khu vực Quận Ngũ Hành Sơn.</p>
					</div>

					{/* Stats & Link Box Area */}
					<div className="flex flex-col w-full md:w-80 shrink-0 gap-6">
						{/* Stats */}
						<div className="flex justify-between divide-x divide-slate-100 bg-slate-50 rounded-2xl p-4 border border-slate-100">
							<div className="flex flex-col items-center flex-1">
								<span className="font-black text-xl text-slate-900">0</span>
								<span className="text-xs text-slate-500 font-bold whitespace-nowrap mt-1">Đang follow</span>
							</div>
							<div className="flex flex-col items-center flex-1">
								<span className="font-black text-xl text-slate-900">3</span>
								<span className="text-xs text-slate-500 font-bold whitespace-nowrap mt-1">Follower</span>
							</div>
							<div className="flex flex-col items-center flex-1">
								<span className="font-black text-xl text-slate-900">1</span>
								<span className="text-xs text-slate-500 font-bold whitespace-nowrap mt-1">Yêu thích</span>
							</div>
						</div>

						{/* Action Buttons (Mobile only) */}
						{isOwner && (
							<div className="flex md:hidden items-center gap-3 w-full">
								<Link to="/profile" className="flex-1 h-11 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold text-sm rounded-xl transition-colors">
									Chỉnh sửa hồ sơ
								</Link>
								<button onClick={() => setShowQr(true)} className="w-11 h-11 bg-slate-100 hover:bg-slate-200 text-slate-900 flex items-center justify-center rounded-xl transition-colors">
									<QrCode className="w-5 h-5" />
								</button>
							</div>
						)}

						{/* Cart Link Box */}
						{isOwner && (
							<div className="bg-indigo-50/50 p-4 rounded-xl flex items-start gap-3 relative border border-indigo-100">
							<div className="flex-1">
									<p className="text-[13px] text-slate-600 font-bold mb-1">Link giỏ hàng của bạn</p>
									<a href={storeLink} className="text-brand-primary text-[14px] font-black hover:underline break-all block mb-2">{brokerHandle}</a>
									<p className="text-[11px] text-slate-500 leading-relaxed font-medium">Bạn có thể gửi đường link bên trên để khách xem phòng.</p>
								</div>
								<button onClick={() => navigator.clipboard.writeText(storeLink)} className="text-indigo-400 hover:text-brand-primary p-2 bg-white rounded-lg shadow-sm border border-indigo-50 shrink-0">
									<Share2 className="w-4 h-4" />
								</button>
							</div>
						)}
					</div>
				</div>

				{/* Tabs */}
				<div className="flex border-b border-slate-200 font-bold text-[15px] mb-6">
					<button className="px-8 pb-3 pt-2 text-center border-b-[3px] border-brand-primary text-brand-primary uppercase tracking-wide">Giỏ hàng</button>
					<button className="px-8 pb-3 pt-2 text-center border-b-[3px] border-transparent text-slate-400 hover:text-slate-600 uppercase tracking-wide">Đã ẩn</button>
					<button className="px-8 pb-3 pt-2 text-center border-b-[3px] border-transparent text-slate-400 hover:text-slate-600 uppercase tracking-wide">Đã lưu</button>
				</div>

				{/* Grid */}
				<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
					{/* Create Room Button (First slot) */}
					{isOwner && (
						<div className="aspect-[3/4] bg-white rounded-2xl flex flex-col items-center justify-center border-2 border-dashed border-slate-200 hover:border-brand-primary hover:bg-indigo-50/50 transition-colors cursor-pointer relative group shadow-sm">
							<div className="w-14 h-14 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-white transition-all mb-3 text-slate-400 group-hover:text-brand-primary shadow-sm border border-slate-100">
								<Plus className="w-6 h-6" />
							</div>
							<span className="font-bold text-[13px] text-slate-700">Tạo phòng</span>
							<p className="absolute bottom-4 left-4 right-4 text-center text-[10px] text-slate-400 font-medium px-2 leading-tight opacity-0 group-hover:opacity-100 transition-opacity">Tin này sẽ không lên bản đồ GenHouse</p>
						</div>
					)}

					{loading ? (
						[1, 2, 3, 4, 5].map(i => <div key={i} className="aspect-[3/4] bg-slate-100 rounded-2xl animate-pulse" />)
					) : (
						listings.map((l, _i) => (
							<BrokerPropertyCard key={l.id} listing={l} brokerPhone={brokerPhone} />
						))
					)}
				</div>
			</main>

			{/* QR Modal */}
			{showQr && (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowQr(false)}>
					<div className="bg-white rounded-[32px] p-8 max-w-sm w-full shadow-2xl relative animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
						<button 
							onClick={() => setShowQr(false)}
							className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
						>
							<X className="w-4 h-4" />
						</button>
						
						<div className="text-center mb-6 mt-2">
							<h3 className="font-black text-xl text-slate-900 mb-1">Mã QR Cửa hàng</h3>
							<p className="text-sm font-medium text-slate-500">Quét mã để truy cập giỏ hàng của {brokerName}</p>
						</div>

						<div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 flex items-center justify-center mb-6">
							<img 
								src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(storeLink)}`} 
								alt="Store QR Code"
								className="w-48 h-48 rounded-xl shadow-sm"
							/>
						</div>

						<button 
							onClick={() => {
								navigator.clipboard.writeText(storeLink);
								setShowQr(false);
							}}
							className="w-full h-12 bg-brand-primary hover:bg-brand-primary/90 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors"
						>
							<Share2 className="w-4 h-4" />
							Sao chép đường liên kết
						</button>
					</div>
				</div>
			)}
		</div>
	);
}

// A customized property card just for the public storefront to force Call/Zalo buttons
function BrokerPropertyCard({ listing, brokerPhone: _brokerPhone }: { listing: Listing, brokerPhone: string }) {
	const imageUrl = listing.images?.[0]?.url || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=300&h=200&fit=crop";
	const displayAddress = [listing.ward, listing.district, listing.city].filter(Boolean).join(", ");


	return (
		<div className="relative aspect-[3/4] bg-slate-100 flex flex-col overflow-hidden group cursor-pointer border border-slate-200 rounded-2xl shadow-sm hover:shadow-md hover:border-brand-primary transition-all">
			{/* Tag Tin chủ */}
			<div className="absolute top-2 right-2 bg-[#FFD12A] text-slate-900 text-[10px] font-black px-2 py-0.5 rounded shadow-sm z-10">
				Tin chủ
			</div>
			
			<div className="absolute inset-0 z-0">
				<img src={imageUrl} alt={listing.title} className="w-full h-full object-cover" />
				<div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
			</div>

			<div className="absolute bottom-0 left-0 right-0 p-3 z-10">
				<div className="flex flex-col text-white font-bold mb-1">
					<h3 className="line-clamp-2 text-[13px] leading-snug drop-shadow-md">
						<span className="text-[#FFD12A]">{(Number(listing.price) / 1_000_000).toFixed(1)}Tr</span> • {displayAddress}
					</h3>
				</div>
				<div className="flex items-center text-white/90 text-xs font-semibold gap-1">
					<span>▶</span> 35
				</div>
			</div>
		</div>
	);
}

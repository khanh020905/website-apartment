import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Calendar, Home, Bed, Phone, X } from "lucide-react";
import { PROPERTY_TYPE_LABELS, type Listing } from "../../../shared/types";

interface ListingInfoPanelProps {
	listing: Listing;
	listings: Listing[];
	onClose: () => void;
	onSelectListing?: (listingId: string) => void;
}

const FALLBACK_IMAGE =
	"https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=900&h=600&fit=crop";

const formatDate = (value: string | null) => {
	if (!value) return "Sẵn ngay";
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return "Sẵn ngay";
	return date.toLocaleDateString("vi-VN");
};

const formatPostedTime = (value: string) => {
	const createdAt = new Date(value).getTime();
	if (Number.isNaN(createdAt)) return "Mới đăng";
	const diffMs = Date.now() - createdAt;
	const diffDays = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
	if (diffDays === 0) return "Đăng hôm nay";
	if (diffDays === 1) return "Đăng cách đây 1 ngày";
	return `Đăng cách đây ${diffDays} ngày`;
};

const formatPrice = (value: number) => `${(Number(value) / 1_000_000).toFixed(1)} Trđ`;

const ListingInfoPanel = ({ listing, listings, onClose, onSelectListing }: ListingInfoPanelProps) => {
	const coverImage = listing.images?.[0]?.url || FALLBACK_IMAGE;
	const displayAddress = [listing.address, listing.ward, listing.district, listing.city]
		.filter(Boolean)
		.join(", ");

	const recentListings = useMemo(
		() =>
			listings
				.filter((item) => item.id !== listing.id)
				.sort((a, b) => {
					const dateA = new Date(a.created_at).getTime();
					const dateB = new Date(b.created_at).getTime();
					return (Number.isNaN(dateB) ? 0 : dateB) - (Number.isNaN(dateA) ? 0 : dateA);
				})
				.slice(0, 4),
		[listings, listing.id],
	);

	return (
		<div className="h-full p-4">
			<div className="h-full rounded-3xl border border-slate-200 bg-slate-100/95 backdrop-blur overflow-hidden shadow-xl shadow-brand-ink/10">
				<div className="h-full overflow-y-auto px-5 py-6 hide-scrollbar">
					<div className="flex items-start justify-between gap-3">
						<div>
							<h2 className="text-2xl leading-tight font-extrabold text-brand-primary">{listing.title}</h2>
							<p className="mt-1 text-xs font-medium text-slate-600">{displayAddress}</p>
						</div>
						<button
							type="button"
							onClick={onClose}
							className="mt-1 rounded-md p-1 text-slate-500 hover:bg-white hover:text-slate-700 transition-colors cursor-pointer"
							aria-label="Đóng chi tiết"
						>
							<X className="w-4 h-4" />
						</button>
					</div>

					<div className="mt-5 grid grid-cols-[1fr_auto] gap-4 items-center rounded-2xl border border-slate-300/70 bg-white/80 p-3">
						<img
							src={coverImage}
							alt={listing.title}
							className="h-34 w-full rounded-xl object-cover"
						/>
						<div className="flex flex-col items-end gap-3">
							<p className="text-3xl leading-none font-extrabold text-slate-900">
								{formatPrice(listing.price)}
							</p>
							<div className="flex items-center gap-2">
								<Link
									to={`/listings/${listing.id}`}
									className="rounded-xl bg-brand-primary px-4 py-2 text-sm font-bold text-white hover:bg-brand-dark transition-colors"
								>
									Xem chi tiết
								</Link>
								<Link
									to={`/listings/${listing.id}?action=reserve`}
									className="rounded-xl border border-brand-primary/25 bg-white px-4 py-2 text-sm font-bold text-brand-primary hover:bg-brand-bg transition-colors"
								>
									Thuê ngay
								</Link>
							</div>
						</div>
					</div>

					<div className="mt-6">
						<h3 className="text-lg font-extrabold text-slate-900">Đặc điểm thuê trọ</h3>
						<div className="mt-3 space-y-2.5 text-sm text-slate-700">
							<div className="flex items-center justify-between gap-3">
								<p className="inline-flex items-center gap-2">
									<Calendar className="w-3.5 h-3.5 text-slate-500" />
									<span>Sẵn sàng:</span>
								</p>
								<p className="font-semibold text-slate-900">{formatDate(listing.available_date)}</p>
							</div>
							<div className="flex items-center justify-between gap-3">
								<p className="inline-flex items-center gap-2">
									<Home className="w-3.5 h-3.5 text-slate-500" />
									<span>Loại hình:</span>
								</p>
								<p className="font-semibold text-slate-900">{PROPERTY_TYPE_LABELS[listing.property_type]}</p>
							</div>
							<div className="flex items-center justify-between gap-3">
								<p className="inline-flex items-center gap-2">
									<Bed className="w-3.5 h-3.5 text-slate-500" />
									<span>Số phòng ngủ:</span>
								</p>
								<p className="font-semibold text-slate-900">{listing.bedrooms} PN</p>
							</div>
						</div>
					</div>

					<div className="mt-6 border-t border-slate-300 pt-5">
						<h3 className="text-lg font-extrabold text-slate-900">Liên hệ</h3>
						<div className="mt-3 flex items-center justify-between gap-3">
							<p className="inline-flex items-center gap-2 text-sm text-slate-700">
								<Phone className="w-3.5 h-3.5 text-slate-500" />
								Số điện thoại:
							</p>
							<a
								href={`tel:${listing.contact_phone}`}
								className="text-xl font-bold text-slate-900 underline decoration-slate-300 hover:text-brand-primary transition-colors"
							>
								{listing.contact_phone}
							</a>
						</div>
					</div>

					<div className="mt-6 border-t border-slate-300 pt-5">
						<h3 className="text-lg font-extrabold text-slate-900">Tin mới đăng</h3>
						<div className="mt-4 space-y-4">
							{recentListings.map((item) => {
								const itemImage = item.images?.[0]?.url || FALLBACK_IMAGE;
								const itemAddress = [item.address, item.ward, item.district, item.city]
									.filter(Boolean)
									.join(", ");
								return (
									<div
										key={item.id}
										className="rounded-2xl border border-slate-300/70 bg-white p-3 shadow-sm"
									>
										<div className="flex gap-3">
											<button
												type="button"
												onClick={() => onSelectListing?.(item.id)}
												className="cursor-pointer"
												aria-label={`Xem vị trí ${item.title}`}
											>
												<img
													src={itemImage}
													alt={item.title}
													className="h-22 w-22 rounded-xl object-cover"
												/>
											</button>
											<div className="min-w-0 flex-1">
												<button
													type="button"
													onClick={() => onSelectListing?.(item.id)}
													className="text-left text-base leading-tight font-bold text-brand-primary hover:underline cursor-pointer"
												>
													{item.title}
												</button>
												<p className="mt-1 line-clamp-2 text-sm text-slate-600">{itemAddress}</p>
												<p className="mt-1 text-xl leading-none font-bold text-slate-900">
													{formatPrice(item.price)}
													<span className="ml-2 text-sm font-semibold text-slate-700">
														{item.bedrooms} PN
													</span>
												</p>
												<p className="mt-1 text-xs italic text-slate-500">
													{formatPostedTime(item.created_at)}
												</p>
											</div>
										</div>
										<div className="mt-3">
											<Link
												to={`/listings/${item.id}`}
												className="inline-flex items-center rounded-xl bg-brand-primary px-3.5 py-1.5 text-xs font-bold text-white hover:bg-brand-dark transition-colors"
											>
												Xem chi tiết
											</Link>
										</div>
									</div>
								);
							})}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ListingInfoPanel;

import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import type { Listing } from "../../../shared/types";
import { maskAddress } from "../lib/utils";

interface PropertyCardProps {
	listing: Listing;
	index: number;
	isActive?: boolean;
	onSelect?: (listingId: string) => void;
}

const PropertyCard = ({ listing, index, isActive = false, onSelect }: PropertyCardProps) => {
	const imageUrl =
		listing.images?.[0]?.url ||
		"https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=300&h=200&fit=crop";
	const displayAddress = [maskAddress(listing.address || ""), listing.ward, listing.district, listing.city]
		.filter(Boolean)
		.join(", ");
	const createdAt = listing.created_at ? new Date(listing.created_at) : null;
	const postedTime = createdAt ? createdAt.toLocaleDateString("vi-VN") : "Mới đăng";

	return (
		<motion.div
			initial={{ opacity: 0, y: 12 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.3, delay: index * 0.04, ease: "easeOut" }}
			onClick={() => onSelect?.(listing.id)}
			role="button"
			tabIndex={0}
			onKeyDown={(e) => {
				if (e.key === "Enter" || e.key === " ") {
					e.preventDefault();
					onSelect?.(listing.id);
				}
			}}
			className={`bg-white/95 backdrop-blur border rounded-2xl p-3 flex gap-3 cursor-pointer group hover:shadow-lg hover:shadow-cyan-900/10 transition-all duration-300 ${
				isActive ?
					"border-brand-primary ring-2 ring-brand-primary/20"
				:	"border-slate-200 hover:border-cyan-200"
			}`}
			aria-label={`Xem vị trí trên bản đồ: ${listing.title}`}
		>
			<div className="w-24 h-20 rounded-xl overflow-hidden shrink-0 bg-slate-100">
				<img
					src={imageUrl}
					alt={listing.title}
					className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
				/>
			</div>

			<div className="flex flex-col flex-1 min-w-0">
				<div className="min-w-0">
					<h3 className="text-brand-ink font-bold text-[15px] leading-tight line-clamp-1 group-hover:text-brand-dark transition-colors mb-1">
						{listing.title}
					</h3>
					<p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
						{displayAddress}
					</p>
				</div>

				<div className="mt-2 flex items-end justify-between gap-2 flex-wrap">
					<div className="shrink-0">
						<p className="inline-flex items-baseline gap-1 whitespace-nowrap text-slate-900">
							<span className="text-xl leading-none font-extrabold">
								{(Number(listing.price) / 1_000_000).toFixed(1)}
							</span>
							<span className="text-sm font-bold">Trđ</span>
						</p>
						<p className="text-[11px] text-slate-400 mt-1">{postedTime}</p>
					</div>

					<div className="ml-auto flex items-center gap-1.5 shrink-0">
						<Link
							to={`/listings/${listing.id}`}
							onClick={(e) => e.stopPropagation()}
							className="h-8 px-2.5 inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white text-[12px] font-bold text-slate-700 hover:border-brand-primary hover:text-brand-primary transition-colors whitespace-nowrap"
						>
							Chi tiết
						</Link>
						<Link
							to={`/listings/${listing.id}?action=reserve`}
							onClick={(e) => e.stopPropagation()}
							className="h-8 px-2.5 inline-flex items-center justify-center rounded-lg bg-brand-primary text-[12px] font-bold text-white hover:bg-brand-dark transition-colors whitespace-nowrap"
						>
							Thuê ngay
						</Link>
					</div>
				</div>
			</div>
		</motion.div>
	);
};

export default PropertyCard;

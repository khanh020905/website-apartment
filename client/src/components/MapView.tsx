import { useEffect, useMemo, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { Link } from "react-router-dom";
import type { Marker as LeafletMarker } from "leaflet";
import { createPriceIcon } from "./PriceMarker";
import { PROPERTY_TYPE_LABELS, type Listing } from "../../../shared/types";
import "leaflet/dist/leaflet.css";

interface MapViewProps {
	listings: Listing[];
	selectedListingId?: string | null;
	onSelectListing?: (listingId: string) => void;
}

interface FocusOnListingProps {
	selectedListing: Listing | null;
	markerRef?: LeafletMarker | null;
}

function FocusOnListing({ selectedListing, markerRef }: FocusOnListingProps) {
	const map = useMap();

	useEffect(() => {
		if (!selectedListing || selectedListing.lat === null || selectedListing.lng === null) return;

		map.flyTo([selectedListing.lat, selectedListing.lng], Math.max(map.getZoom(), 16), {
			duration: 0.6,
		});
		markerRef?.openPopup();
	}, [map, markerRef, selectedListing]);

	return null;
}

// Google Satellite tiles (matching reference design)
const SATELLITE_URL = "https://mt1.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}";
const SATELLITE_ATTR =
	"Dữ liệu bản đồ &copy;2026 Google, Hình ảnh &copy;2026 Airbus, CNES / Airbus, Maxar Technologies";

const MapView = ({ listings, selectedListingId = null, onSelectListing }: MapViewProps) => {
	const mapListings = listings.filter((listing) => listing.lat !== null && listing.lng !== null);
	const selectedListing = useMemo(
		() => mapListings.find((listing) => listing.id === selectedListingId) || null,
		[mapListings, selectedListingId],
	);
	const selectedMarkerRef = useRef<LeafletMarker | null>(null);

	return (
		<div className="flex-1 h-full relative bg-[#e8f7f8]">
			<div className="absolute top-4 left-4 z-500 bg-white/95 backdrop-blur border border-cyan-100 rounded-2xl px-4 py-3 shadow-lg shadow-cyan-900/10">
				<p className="text-xs font-bold uppercase tracking-wider text-brand-primary">
					Bản đồ căn hộ
				</p>
				<p className="text-sm font-semibold text-slate-700">
					{mapListings.length} vị trí đang hiển thị
				</p>
			</div>
			<MapContainer
				center={[10.79, 106.685]}
				zoom={14}
				className="w-full h-full z-0"
				zoomControl={true}
				scrollWheelZoom={true}
				attributionControl={false}
			>
				{/* Google Satellite + Labels hybrid */}
				<TileLayer
					url={SATELLITE_URL}
					attribution={SATELLITE_ATTR}
					maxZoom={20}
					subdomains={["mt0", "mt1", "mt2", "mt3"]}
				/>

				<FocusOnListing
					selectedListing={selectedListing}
					// eslint-disable-next-line react-hooks/refs
					markerRef={selectedMarkerRef.current}
				/>

				{/* Price markers */}
				{mapListings.map((listing) => (
					<Marker
						key={listing.id}
						position={[listing.lat as number, listing.lng as number]}
						icon={createPriceIcon(listing)}
						ref={(el) => {
							if (listing.id === selectedListingId) {
								selectedMarkerRef.current = el;
							}
						}}
						eventHandlers={{
							click: () => onSelectListing?.(listing.id),
						}}
					>
						<Popup
							closeButton={false}
							offset={[0, -10]}
						>
							<div className="text-left w-60 flex flex-col group">
								<div className="relative w-full h-40 mb-3 rounded-xl overflow-hidden shadow-sm">
									<img
										src={
											listing.images?.[0]?.url ||
											"https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=300&h=200&fit=crop"
										}
										alt={listing.title}
										className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
									/>
									<div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-0.5 rounded-full text-[10px] font-bold text-teal-700 shadow-sm">
										Mới
									</div>
								</div>

								<h3 className="font-extrabold text-base text-slate-900 leading-tight mb-1">
									{listing.title}
								</h3>
								<p className="text-xs text-slate-500 mb-2 line-clamp-1">
									{[listing.address, listing.district, listing.city].filter(Boolean).join(", ")}
								</p>
								<div className="flex justify-between items-end mt-1">
									<div className="flex items-baseline gap-1">
										<span className="font-extrabold text-xl text-slate-900">
											{(Number(listing.price) / 1_000_000).toFixed(1)}
										</span>
										<span className="text-slate-600 text-sm font-semibold">
											Trđ<span className="text-slate-400 font-normal">/tháng</span>
										</span>
									</div>
								</div>
								<div className="mt-2 flex flex-wrap gap-1">
									<span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
										{PROPERTY_TYPE_LABELS[listing.property_type]}
									</span>
									{listing.area ?
										<span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
											{listing.area} m²
										</span>
									:	null}
									<span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
										{listing.bedrooms} PN
									</span>
									<span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
										{listing.bathrooms} WC
									</span>
								</div>
								<div className="mt-3 grid grid-cols-2 gap-2">
									<a
										href={`tel:${listing.contact_phone}`}
										className="text-center px-3 py-2 rounded-lg text-sm font-semibold bg-teal-600 text-white hover:bg-teal-700 transition-colors"
									>
										Thuê ngay
									</a>
									<Link
										to={`/listings/${listing.id}`}
										className="text-center px-3 py-2 rounded-lg text-sm font-semibold border border-slate-300 text-slate-700 hover:bg-slate-100 transition-colors"
									>
										Xem chi tiết
									</Link>
								</div>
							</div>
						</Popup>
					</Marker>
				))}
			</MapContainer>
		</div>
	);
};

export default MapView;

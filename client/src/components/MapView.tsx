import { useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from "react-leaflet";
import type { Marker as LeafletMarker } from "leaflet";
import { createPriceIcon } from "./PriceMarker";
import type { Listing } from "../../../shared/types";
import "leaflet/dist/leaflet.css";

interface MapViewProps {
	listings: Listing[];
	selectedListingId?: string | null;
	onSelectListing?: (listingId: string | null) => void;
}

interface FocusOnListingProps {
	selectedListing: Listing | null;
	markerRef?: LeafletMarker | null;
}

interface ListingPopupContentProps {
	listing: Listing;
}

interface FocusOnUserLocationProps {
	userCenter: [number, number] | null;
	fallbackCenter: [number, number];
	hasSelectedListing: boolean;
	mapListings: Listing[];
}

interface ClearSelectionOnMapClickProps {
	onClear?: () => void;
}

interface SyncPopupWithSelectionProps {
	hasSelectedListing: boolean;
}

const MAP_DEFAULT_ZOOM = 14;
const MAP_USER_ZOOM = 15;
const MAP_SELECTED_ZOOM = 16;

const toRadians = (value: number) => (value * Math.PI) / 180;

const distanceInKm = (from: [number, number], to: [number, number]) => {
	const earthRadius = 6371;
	const dLat = toRadians(to[0] - from[0]);
	const dLng = toRadians(to[1] - from[1]);
	const lat1 = toRadians(from[0]);
	const lat2 = toRadians(to[0]);

	const a =
		Math.sin(dLat / 2) * Math.sin(dLat / 2) +
		Math.sin(dLng / 2) * Math.sin(dLng / 2) * Math.cos(lat1) * Math.cos(lat2);
	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	return earthRadius * c;
};

const findNearestListingPosition = (
	userCenter: [number, number],
	mapListings: Listing[],
): [number, number] | null => {
	let nearest: [number, number] | null = null;
	let nearestDistance = Number.POSITIVE_INFINITY;

	for (const listing of mapListings) {
		if (listing.lat === null || listing.lng === null) continue;
		const position: [number, number] = [listing.lat, listing.lng];
		const currentDistance = distanceInKm(userCenter, position);
		if (currentDistance < nearestDistance) {
			nearestDistance = currentDistance;
			nearest = position;
		}
	}

	return nearest;
};

function FocusOnListing({ selectedListing, markerRef }: FocusOnListingProps) {
	const map = useMap();

	useEffect(() => {
		// Fix for map not rendering correctly on initial load
		setTimeout(() => {
			map.invalidateSize();
		}, 200);
	}, [map]);

	useEffect(() => {
		if (!selectedListing || selectedListing.lat === null || selectedListing.lng === null) return;

		map.flyTo([selectedListing.lat, selectedListing.lng], Math.max(map.getZoom(), MAP_SELECTED_ZOOM), {
			duration: 0.6,
		});
		markerRef?.openPopup();
	}, [map, markerRef, selectedListing]);

	return null;
}

function FocusOnUserLocation({
	userCenter,
	fallbackCenter,
	hasSelectedListing,
	mapListings,
}: FocusOnUserLocationProps) {
	const map = useMap();
	const centeredFallbackRef = useRef(false);
	const centeredNearbyRef = useRef(false);
	const hadSelectedRef = useRef(false);

	useEffect(() => {
		if (hasSelectedListing) {
			hadSelectedRef.current = true;
			return;
		}

		if (userCenter) {
			const nearestPosition = findNearestListingPosition(userCenter, mapListings);
			const targetCenter = nearestPosition ?? userCenter;
			const shouldCenterNearby = !centeredNearbyRef.current || hadSelectedRef.current;
			if (!shouldCenterNearby) return;

			map.flyTo(targetCenter, MAP_USER_ZOOM, { duration: 0.6 });
			centeredNearbyRef.current = true;
			hadSelectedRef.current = false;
			return;
		}

		const shouldCenterFallback = !centeredFallbackRef.current || hadSelectedRef.current;
		if (!shouldCenterFallback) return;

		map.flyTo(fallbackCenter, MAP_DEFAULT_ZOOM, { duration: 0.6 });
		centeredFallbackRef.current = true;
		hadSelectedRef.current = false;
	}, [fallbackCenter, hasSelectedListing, map, mapListings, userCenter]);

	return null;
}

function ClearSelectionOnMapClick({ onClear }: ClearSelectionOnMapClickProps) {
	useMapEvents({
		click: () => onClear?.(),
	});

	return null;
}

function SyncPopupWithSelection({ hasSelectedListing }: SyncPopupWithSelectionProps) {
	const map = useMap();

	useEffect(() => {
		if (!hasSelectedListing) {
			map.closePopup();
		}
	}, [hasSelectedListing, map]);

	return null;
}

// Google Satellite tiles (matching reference design)
const SATELLITE_URL = "https://mt1.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}";
const SATELLITE_ATTR =
	"Dữ liệu bản đồ &copy;2026 Google, Hình ảnh &copy;2026 Airbus, CNES / Airbus, Maxar Technologies";
const FALLBACK_IMAGE =
	"https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=900&h=600&fit=crop";
const DEFAULT_CENTER: [number, number] = [10.79, 106.685];

function ListingPopupContent({ listing }: ListingPopupContentProps) {
	const images = useMemo(() => {
		const validImages =
			listing.images
				?.map((image) => image.url)
				.filter((url): url is string => Boolean(url && url.trim().length > 0)) || [];
		return validImages.length > 0 ? validImages : [FALLBACK_IMAGE];
	}, [listing.images]);
	const [activeImageIndex, setActiveImageIndex] = useState(0);
	const canSlide = images.length > 1;
	const safeIndex = Math.min(activeImageIndex, images.length - 1);
	const activeImage = images[safeIndex];

	return (
		<div className="w-[min(44rem,84vw)] rounded-2xl bg-slate-200/95 p-3 md:p-4">
			<div className="relative flex h-[26rem] items-center justify-center overflow-hidden rounded-xl bg-slate-200">
				<img
					src={activeImage}
					alt={listing.title}
					className="h-full w-auto max-w-full rounded-lg object-contain"
				/>
				{canSlide && (
					<>
						<button
							type="button"
							onClick={() =>
								setActiveImageIndex((current) => (current === 0 ? images.length - 1 : current - 1))
							}
							className="absolute left-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/95 text-brand-primary shadow-md transition-colors hover:bg-white cursor-pointer"
							aria-label="Ảnh trước"
						>
							‹
						</button>
						<button
							type="button"
							onClick={() =>
								setActiveImageIndex((current) => (current + 1) % images.length)
							}
							className="absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/95 text-brand-primary shadow-md transition-colors hover:bg-white cursor-pointer"
							aria-label="Ảnh tiếp theo"
						>
							›
						</button>
					</>
				)}
			</div>

			{canSlide && (
				<div className="mt-2 flex gap-2 overflow-x-auto hide-scrollbar">
					{images.map((image, index) => (
						<button
							key={`${listing.id}-${image}-${index}`}
							type="button"
							onClick={() => setActiveImageIndex(index)}
							className={`shrink-0 h-17 w-24 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
								safeIndex === index ?
									"border-brand-primary"
								:	"border-transparent opacity-80 hover:opacity-100"
							}`}
							aria-label={`Xem ảnh ${index + 1}`}
						>
							<img
								src={image}
								alt={`${listing.title} ${index + 1}`}
								className="h-full w-full object-cover"
							/>
						</button>
					))}
				</div>
			)}
		</div>
	);
}

const MapView = ({ listings, selectedListingId = null, onSelectListing }: MapViewProps) => {
	const mapListings = listings.filter((listing) => listing.lat !== null && listing.lng !== null);
	const selectedListing = useMemo(
		() => mapListings.find((listing) => listing.id === selectedListingId) || null,
		[mapListings, selectedListingId],
	);
	const selectedMarkerRef = useRef<LeafletMarker | null>(null);
	const [userCenter, setUserCenter] = useState<[number, number] | null>(null);

	useEffect(() => {
		if (typeof window === "undefined" || !("geolocation" in navigator)) return;

		let watchId: number | null = null;

		navigator.geolocation.getCurrentPosition(
			(position) => {
				setUserCenter([position.coords.latitude, position.coords.longitude]);
			},
			() => {
				// keep default center when location is unavailable
			},
			{
				enableHighAccuracy: true,
				timeout: 10000,
				maximumAge: 300000,
			},
		);

		watchId = navigator.geolocation.watchPosition(
			(position) => {
				setUserCenter([position.coords.latitude, position.coords.longitude]);
			},
			() => {
				// keep previous center when watch position is unavailable
			},
			{
				enableHighAccuracy: true,
				timeout: 20000,
				maximumAge: 60000,
			},
		);

		return () => {
			if (watchId !== null) {
				navigator.geolocation.clearWatch(watchId);
			}
		};
	}, []);

	return (
		<div className="flex-1 h-full relative bg-brand-bg">
			<div className="absolute top-4 right-4 z-[500] bg-white/95 backdrop-blur border border-slate-200 rounded-2xl px-4 py-3 shadow-lg shadow-brand-ink/10">
				<p className="text-xs font-bold uppercase tracking-wider text-brand-primary">
					Bản đồ căn hộ
				</p>
				<p className="text-sm font-semibold text-slate-700">
					{mapListings.length} vị trí đang hiển thị
				</p>
			</div>
			<MapContainer
				center={userCenter || DEFAULT_CENTER}
				zoom={MAP_DEFAULT_ZOOM}
				className="w-full h-full"
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
				<FocusOnUserLocation
					userCenter={userCenter}
					fallbackCenter={DEFAULT_CENTER}
					hasSelectedListing={Boolean(selectedListing)}
					mapListings={mapListings}
				/>
				<SyncPopupWithSelection hasSelectedListing={Boolean(selectedListing)} />
				<ClearSelectionOnMapClick onClear={() => onSelectListing?.(null)} />

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
							popupclose: () => {
								if (selectedListingId === listing.id) {
									onSelectListing?.(null);
								}
							},
						}}
					>
						<Popup
							closeButton={true}
							offset={[0, -10]}
							maxWidth={760}
							minWidth={320}
							className="map-gallery-popup"
						>
							<div className="text-left">
								<ListingPopupContent listing={listing} />
							</div>
						</Popup>
					</Marker>
				))}
			</MapContainer>
		</div>
	);
};

export default MapView;

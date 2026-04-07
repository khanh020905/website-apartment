import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import PropertyCard from "./PropertyCard";
import type { Listing, PropertyType, Amenity } from "../../../shared/types";

interface SidebarProps {
	listings: Listing[];
	amenities: Amenity[];
	onFilterChange: (filtered: Listing[]) => void;
	selectedListingId?: string | null;
	onSelectListing?: (listingId: string) => void;
}

const Sidebar = ({
	listings,
	amenities,
	onFilterChange,
	selectedListingId = null,
	onSelectListing,
}: SidebarProps) => {
	const [search, setSearch] = useState("");
	const [propertyType, setPropertyType] = useState<"all" | PropertyType>("all");
	const [budgetMin, setBudgetMin] = useState(0);
	const [budgetMax, setBudgetMax] = useState(30);
	const [areaMin, setAreaMin] = useState(0);
	const [areaMax, setAreaMax] = useState(100);
	const [selectedAmenities, setSelectedAmenities] = useState<number[]>([]);
	const [showAllFilters, setShowAllFilters] = useState(false);

	const filteredListings = useMemo(() => {
		const filtered = listings.filter((l) => {
			const fullAddress = [l.address, l.ward, l.district, l.city].filter(Boolean).join(" ");
			const matchSearch =
				search === "" ||
				l.title.toLowerCase().includes(search.toLowerCase()) ||
				fullAddress.toLowerCase().includes(search.toLowerCase());
			const matchPropertyType = propertyType === "all" || l.property_type === propertyType;
			const priceInMillion = Number(l.price) / 1_000_000;
			const matchBudget = priceInMillion >= budgetMin && priceInMillion <= budgetMax;

			const area = Number(l.area) || 0;
			const matchArea = area >= areaMin && (areaMax === 100 ? true : area <= areaMax);

			const matchAmenities =
				selectedAmenities.length === 0 ||
				selectedAmenities.every((id) => l.amenity_ids?.includes(id));

			return matchSearch && matchPropertyType && matchBudget && matchArea && matchAmenities;
		});
		onFilterChange(filtered);
		return filtered;
	}, [
		search,
		propertyType,
		budgetMin,
		budgetMax,
		areaMin,
		areaMax,
		selectedAmenities,
		listings,
		onFilterChange,
	]);

	const toggleAmenity = (id: number) => {
		setSelectedAmenities((prev) =>
			prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
		);
	};

	return (
		<motion.div
			initial={{ x: -400, opacity: 0 }}
			animate={{ x: 0, opacity: 1 }}
			transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
			className="w-107.5 min-w-107.5 h-full bg-white border-r border-slate-200 flex flex-col overflow-hidden"
		>
			{/* Header & Main Search */}
			<div className="px-5 pt-6 pb-4 border-b border-slate-100 shrink-0 bg-white z-10">
				<div className="relative mb-4">
					<input
						type="text"
						placeholder="Tìm theo khu vực, dự án, tên đường..."
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						className="w-full pl-11 pr-4 py-3 bg-slate-100/80 border-transparent rounded-2xl text-sm font-medium text-slate-800 placeholder-slate-500 focus:bg-white focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/5 transition-all outline-none"
					/>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						strokeWidth={2}
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
						/>
					</svg>
				</div>

				<div className="flex items-center gap-2">
					<button
						onClick={() => setShowAllFilters(!showAllFilters)}
						className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border text-xs font-bold transition-all ${
							showAllFilters ?
								"bg-teal-700 border-teal-700 text-white"
							:	"bg-white border-slate-200 text-slate-600 hover:border-teal-600 hover:text-teal-700"
						}`}
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							className="w-4 h-4"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							strokeWidth={2}
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
							/>
						</svg>
						Bộ lọc nâng cao
					</button>

					<div className="flex bg-slate-100 p-1 rounded-xl">
						{["all", "phong_tro", "can_ho_mini"].map((type) => (
							<button
								key={type}
								// eslint-disable-next-line @typescript-eslint/no-explicit-any
								onClick={() => setPropertyType(type as any)}
								className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
									propertyType === type ?
										"bg-white text-teal-800 shadow-sm"
									:	"text-slate-500 hover:text-slate-700"
								}`}
							>
								{type === "all" ?
									"Tất cả"
								: type === "phong_tro" ?
									"Phòng trọ"
								:	"Căn hộ"}
							</button>
						))}
					</div>
				</div>
			</div>

			<div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide">
				{/* Expanded Filters */}
				<AnimatePresence>
					{showAllFilters && (
						<motion.div
							initial={{ height: 0, opacity: 0 }}
							animate={{ height: "auto", opacity: 1 }}
							exit={{ height: 0, opacity: 0 }}
							className="bg-slate-50/50 border-b border-slate-100 overflow-hidden"
						>
							<div className="p-5 space-y-6">
								{/* Budget Range */}
								<div>
									<div className="flex justify-between items-center mb-4">
										<label className="text-xs font-black text-slate-800 uppercase tracking-widest">
											Ngân sách (Trđ)
										</label>
										<span className="text-xs font-bold text-teal-700">
											{budgetMin} — {budgetMax === 30 ? "30+" : budgetMax}
										</span>
									</div>
									<div className="relative h-6 flex items-center px-1">
										<div className="absolute w-full h-1.5 bg-slate-200 rounded-full" />
										<div
											className="absolute h-1.5 bg-teal-600 rounded-full"
											style={{
												left: `${(budgetMin / 30) * 100}%`,
												right: `${100 - (budgetMax / 30) * 100}%`,
											}}
										/>
										<input
											type="range"
											min="0"
											max="30"
											step="0.5"
											value={budgetMin}
											onChange={(e) =>
												setBudgetMin(Math.min(Number(e.target.value), budgetMax - 1))
											}
											className="dual-range-sidebar"
										/>
										<input
											type="range"
											min="0"
											max="30"
											step="0.5"
											value={budgetMax}
											onChange={(e) =>
												setBudgetMax(Math.max(Number(e.target.value), budgetMin + 1))
											}
											className="dual-range-sidebar"
										/>
									</div>
								</div>

								{/* Area Range */}
								<div>
									<div className="flex justify-between items-center mb-4">
										<label className="text-xs font-black text-slate-800 uppercase tracking-widest">
											Diện tích (m²)
										</label>
										<span className="text-xs font-bold text-teal-700">
											{areaMin} — {areaMax === 100 ? "100+" : areaMax}
										</span>
									</div>
									<div className="relative h-6 flex items-center px-1">
										<div className="absolute w-full h-1.5 bg-slate-200 rounded-full" />
										<div
											className="absolute h-1.5 bg-purple-600 rounded-full"
											style={{
												left: `${(areaMin / 100) * 100}%`,
												right: `${100 - (areaMax / 100) * 100}%`,
											}}
										/>
										<input
											type="range"
											min="0"
											max="100"
											step="5"
											value={areaMin}
											onChange={(e) => setAreaMin(Math.min(Number(e.target.value), areaMax - 10))}
											className="dual-range-sidebar purple"
										/>
										<input
											type="range"
											min="0"
											max="100"
											step="5"
											value={areaMax}
											onChange={(e) => setAreaMax(Math.max(Number(e.target.value), areaMin + 10))}
											className="dual-range-sidebar purple"
										/>
									</div>
								</div>

								{/* Amenities */}
								<div>
									<label className="block text-xs font-black text-slate-800 uppercase tracking-widest mb-3">
										Tiện nghi phổ biến
									</label>
									<div className="flex flex-wrap gap-2">
										{amenities.slice(0, 8).map((am) => (
											<button
												key={am.id}
												onClick={() => toggleAmenity(am.id)}
												className={`px-3 py-1.5 rounded-full text-[10px] font-bold border transition-all ${
													selectedAmenities.includes(am.id) ?
														"bg-teal-50 border-teal-600 text-teal-700"
													:	"bg-white border-slate-200 text-slate-500 hover:border-slate-400"
												}`}
											>
												{am.name_vi}
											</button>
										))}
									</div>
								</div>
							</div>
						</motion.div>
					)}
				</AnimatePresence>

				{/* Listings Section */}
				<div className="px-5 py-6">
					<div className="flex items-center justify-between mb-6">
						<h3 className="text-base font-black text-slate-900">Kết quả tìm thấy</h3>
						<span className="text-[10px] font-black uppercase tracking-widest text-brand-dark bg-cyan-50 px-3 py-1.5 rounded-full">
							{filteredListings.length} tin đăng
						</span>
					</div>

					<div className="flex flex-col gap-5">
						{filteredListings.map((listing, i) => (
							<PropertyCard
								key={listing.id}
								listing={listing}
								index={i}
								isActive={selectedListingId === listing.id}
								onSelect={onSelectListing}
							/>
						))}

						{filteredListings.length === 0 && (
							<div className="text-center py-20 bg-slate-50/50 rounded-4xl border-2 border-dashed border-slate-200">
								<div className="w-16 h-16 mx-auto mb-4 bg-white rounded-2xl shadow-sm flex items-center justify-center">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										className="w-8 h-8 text-slate-300"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
										strokeWidth={1.5}
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
										/>
									</svg>
								</div>
								<p className="text-sm text-slate-400 font-bold">
									Rất tiếc, chưa tìm thấy kết quả phù hợp
								</p>
								<button
									onClick={() => {
										setSearch("");
										setPropertyType("all");
										setBudgetMin(0);
										setBudgetMax(30);
										setAreaMin(0);
										setAreaMax(100);
										setSelectedAmenities([]);
									}}
									className="mt-4 text-xs font-black text-teal-700 uppercase tracking-widest hover:text-teal-800"
								>
									Xóa tất cả bộ lọc
								</button>
							</div>
						)}

						<div className="pt-4 text-center">
							<Link
								to="/search"
								className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] hover:text-teal-700 transition-colors"
							>
								Xem thêm tin đăng khác →
							</Link>
						</div>
					</div>
				</div>
			</div>

			<style>{`
        .dual-range-sidebar {
          position: absolute;
          width: 100%;
          pointer-events: none;
          appearance: none;
          background: transparent;
          z-index: 2;
          height: 0;
        }
        .dual-range-sidebar::-webkit-slider-thumb {
          pointer-events: auto;
          appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: white;
          border: 3px solid #0d9488;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .dual-range-sidebar.purple::-webkit-slider-thumb {
          border-color: #9333ea;
        }
      `}</style>
		</motion.div>
	);
};

export default Sidebar;

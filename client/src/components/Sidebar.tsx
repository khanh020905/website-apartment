import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import PropertyCard from "./PropertyCard";
import type { Listing, Amenity } from "../../../shared/types";
import { Filter, X, Search, Check, Home, Layout, Columns, Layers, Maximize, Briefcase, Wind, ShieldCheck, Car, Globe, Bed, Microwave, Sun, Refrigerator, WashingMachine, Zap, Bike, UtensilsCrossed, PawPrint } from "lucide-react";

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
	const [showFilters, setShowFilters] = useState(false);
	const [appliedAmenities, setAppliedAmenities] = useState<(number | string)[]>([]);
	const [appliedOtherFilters, setAppliedOtherFilters] = useState<Record<string, any>>({});
	const filterCategories = [
		{
			title: "Loại phòng",
			tags: [
				{ label: "Full nội thất", icon: Home, type: "furniture", value: "full" },
				{ label: "Không nội thất", icon: X, type: "furniture", value: "none" },
				{ label: "Gác lửng", icon: Layers, type: "amenity", value: amenities.find(a => a.name_vi === "Gác lửng")?.id || "Gác lửng" },
				{ label: "Duplex", icon: Columns, type: "amenity", value: amenities.find(a => a.name_vi === "Duplex")?.id || "Duplex" },
				{ label: "Phòng Studio", icon: Layout, type: "amenity", value: amenities.find(a => a.name_vi === "Phòng Studio")?.id || "Phòng Studio" },
				{ label: "Ban công", icon: Maximize, type: "amenity", value: amenities.find(a => a.name_vi === "Ban công")?.id || "Ban công" },
				{ label: "Sleep box", icon: Bed, type: "amenity", value: amenities.find(a => a.name_vi === "Sleep box")?.id || "Sleep box" },
				{ label: "Tách bếp", icon: Microwave, type: "amenity", value: amenities.find(a => a.name_vi === "Tách bếp")?.id || "Tách bếp" },
				{ label: "Cửa sổ trời", icon: Sun, type: "amenity", value: amenities.find(a => a.name_vi === "Cửa sổ trời")?.id || "Cửa sổ trời" },
				{ label: "1 Phòng Ngủ", icon: Bed, type: "bedrooms", value: 1 },
				{ label: "Mặt bằng", icon: Layout, type: "amenity", value: amenities.find(a => a.name_vi === "Mặt bằng")?.id || "Mặt bằng" },
				{ label: "2 Phòng Ngủ", icon: Bed, type: "bedrooms", value: 2 },
			]
		},
		{
			title: "Nội thất",
			tags: [
				{ label: "Máy lạnh", icon: Wind, type: "amenity", value: amenities.find(a => a.name_vi === "Máy lạnh")?.id || "Máy lạnh" },
				{ label: "Tủ lạnh", icon: Refrigerator, type: "amenity", value: amenities.find(a => a.name_vi === "Tủ lạnh")?.id || "Tủ lạnh" },
				{ label: "Máy giặt", icon: WashingMachine, type: "amenity", value: amenities.find(a => a.name_vi === "Máy giặt")?.id || "Máy giặt" },
				{ label: "Tủ quần áo", icon: Briefcase, type: "amenity", value: amenities.find(a => a.name_vi === "Tủ quần áo")?.id || "Tủ quần áo" },
				{ label: "Máy nước nóng", icon: Zap, type: "amenity", value: amenities.find(a => a.name_vi === "Máy nước nóng")?.id || "Máy nước nóng" },
				{ label: "Kệ bếp", icon: UtensilsCrossed, type: "amenity", value: amenities.find(a => a.name_vi === "Kệ bếp")?.id || "Kệ bếp" },
			]
		},
		{
			title: "Tiện ích",
			tags: [
				{ label: "Có thang máy", icon: Layers, type: "amenity", value: amenities.find(a => a.name_vi === "Có thang máy")?.id || "Có thang máy" },
				{ label: "Giữ xe máy", icon: Bike, type: "amenity", value: amenities.find(a => a.name_vi === "Giữ xe máy")?.id || "Giữ xe máy" },
				{ label: "Giữ xe điện", icon: Bike, type: "amenity", value: amenities.find(a => a.name_vi === "Giữ xe điện")?.id || "Giữ xe điện" },
				{ label: "Đậu xe ô tô", icon: Car, type: "amenity", value: amenities.find(a => a.name_vi === "Đậu xe ô tô")?.id || "Đậu xe ô tô" },
				{ label: "Nuôi thú cưng", icon: PawPrint, type: "amenity", value: amenities.find(a => a.name_vi === "Nuôi thú cưng")?.id || "Nuôi thú cưng" },
				{ label: "Bảo vệ 24/24", icon: ShieldCheck, type: "amenity", value: amenities.find(a => a.name_vi === "Bảo vệ 24/24")?.id || "Bảo vệ 24/24" },
				{ label: "Nhận khách nước ngoài", icon: Globe, type: "amenity", value: amenities.find(a => a.name_vi === "Nhận khách nước ngoài")?.id || "Nhận khách nước ngoài" },
			]
		}
	];



	const filteredListings = useMemo(() => {
		const filtered = listings.filter((l) => {
			const fullAddress = [l.address, l.ward, l.district, l.city].filter(Boolean).join(" ");
			const matchSearch =
				search === "" ||
				l.title.toLowerCase().includes(search.toLowerCase()) ||
				fullAddress.toLowerCase().includes(search.toLowerCase());

			const matchAmenities =
				appliedAmenities.length === 0 ||
				appliedAmenities.every((val) => {
					if (typeof val === "number") return l.amenity_ids?.includes(val);
					const searchStr = val.toLowerCase();
					return (
						l.title.toLowerCase().includes(searchStr) ||
						l.description?.toLowerCase().includes(searchStr)
					);
				});

			const matchFurniture = !appliedOtherFilters.furniture || l.furniture === appliedOtherFilters.furniture;
			const matchBedrooms = !appliedOtherFilters.bedrooms || l.bedrooms === appliedOtherFilters.bedrooms;

			return matchSearch && matchAmenities && matchFurniture && matchBedrooms;
		});
		onFilterChange(filtered);
		return filtered;
	}, [search, appliedAmenities, appliedOtherFilters, listings, onFilterChange]);

	const toggleTag = (tag: any) => {
		if (tag.type === "amenity") {
			setAppliedAmenities(prev =>
				prev.includes(tag.value) ? prev.filter(a => a !== tag.value) : [...prev, tag.value]
			);
		} else {
			setAppliedOtherFilters(prev => ({
				...prev,
				[tag.type]: prev[tag.type] === tag.value ? undefined : tag.value
			}));
		}
	};

	const clearFilters = () => {
		setAppliedAmenities([]);
		setAppliedOtherFilters({});
		setSearch("");
	};



	return (
		<motion.div
			initial={{ x: -400, opacity: 0 }}
			animate={{ x: 0, opacity: 1 }}
			transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
			className="w-107.5 min-w-107.5 h-full bg-white border-r border-slate-200 flex flex-col overflow-hidden"
		>
			{/* Header & Main Search */}
			<div className="px-5 pt-6 pb-4 border-b border-slate-100 shrink-0 bg-white z-20">
				<div className="flex items-center gap-3">
					<div className="relative flex-1">
						<input
							type="text"
							placeholder="Tìm theo khu vực, dự án, tên đường..."
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							className="w-full pl-11 pr-4 py-3 bg-slate-100 border-none rounded-2xl text-sm font-medium text-slate-800 placeholder-slate-500 focus:bg-white focus:ring-4 focus:ring-brand-primary/5 transition-all outline-none"
						/>
						<Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
					</div>
					<button
						onClick={() => setShowFilters(!showFilters)}
						className={`w-11 h-11 flex items-center justify-center rounded-2xl transition-all cursor-pointer ${
							showFilters || appliedAmenities.length > 0 ?
								"bg-brand-primary text-white shadow-lg shadow-brand-primary/20"
							:	"bg-slate-100 text-slate-600 hover:bg-slate-200"
						}`}
					>
						<Filter className="w-5 h-5" />
					</button>
				</div>

				{/* Filter Panel */}
				{showFilters && (
					<motion.div
						initial={{ height: 0, opacity: 0 }}
						animate={{ height: "auto", opacity: 1 }}
						exit={{ height: 0, opacity: 0 }}
						className="mt-6 pt-6 border-t border-slate-100 overflow-hidden"
					>
						<div className="flex items-center justify-between mb-4">
							<h4 className="text-xl font-black text-slate-900">Tìm kiếm</h4>
							<button onClick={() => setShowFilters(false)} className="p-2 -mr-2 text-slate-400 hover:text-slate-600">
								<X className="w-5 h-5" />
							</button>
						</div>

						{/* Scrollable Container for Filters */}
						<div className="max-h-[60vh] overflow-y-auto pr-2 space-y-8 scrollbar-hide py-2">
							{filterCategories.map((category) => (
								<div key={category.title} className="space-y-4 px-1">
									<h5 className="text-base font-black text-slate-800">{category.title}</h5>
									<div className="flex flex-wrap gap-2">
										{category.tags.map((tag) => {
											const isSelected = tag.type === "amenity" ? appliedAmenities.includes(tag.value) : appliedOtherFilters[tag.type] === tag.value;
											return (
												<button
													key={tag.label}
													onClick={() => toggleTag(tag)}
													className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-[13px] font-bold transition-all border-2 ${
														isSelected ?
															"bg-brand-primary/5 border-brand-primary text-brand-primary shadow-sm shadow-brand-primary/5"
														:	"bg-white border-slate-100 text-slate-500 hover:border-slate-200"
													}`}
												>
													{tag.icon && <tag.icon className="w-4 h-4 opacity-70" />}
													{tag.label}
													{isSelected && <Check className="w-3.5 h-3.5" />}
												</button>
											);
										})}
									</div>
								</div>
							))}
						</div>

						<div className="pt-4 pb-2">
							<button
								onClick={clearFilters}
								className="w-full h-14 rounded-2xl border-2 border-rose-100 text-rose-600 text-sm font-black uppercase tracking-widest hover:bg-rose-50 transition-all cursor-pointer"
							>
								Xóa tất cả bộ lọc
							</button>
						</div>
					</motion.div>
				)}
			</div>

			<div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide">


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
									}}
									className="mt-4 text-xs font-black text-teal-700 uppercase tracking-widest hover:text-teal-800"
								>
									Xóa tất cả bộ lọc
								</button>
							</div>
						)}


					</div>
				</div>
			</div>


			<style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
		</motion.div>
	);
};

export default Sidebar;

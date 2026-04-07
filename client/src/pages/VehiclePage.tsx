import { useState } from "react";
import { Search, Settings2, X, ChevronLeft, ChevronRight, Settings, Download } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function VehiclePage() {
	const [search, setSearch] = useState("");
	const [vehicleType, setVehicleType] = useState("");
	const [status, setStatus] = useState("");
	const [isFilterOpen, setIsFilterOpen] = useState(false);

	// MOCK DATA is empty to show empty state like image
	const MOCK_VEHICLES: unknown[] = [];

	const clearFilters = () => {
		setSearch("");
		setVehicleType("");
		setStatus("");
	};

	return (
		<div className="flex-1 flex flex-col h-full bg-[#f8f9fa] relative overflow-hidden">
			{/* Header */}
			<div className="bg-white border-b border-slate-200">
				<div className="px-6 py-4 flex items-center justify-between">
					<h1 className="text-[20px] font-bold text-slate-900 tracking-tight">Phương tiện</h1>
					<button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
						<Download className="w-4 h-4" />
						<span className="hidden sm:inline">Xuất Excel</span>
					</button>
				</div>

				{/* Toolbar */}
				<div className="px-6 pb-4 flex flex-col sm:flex-row items-center gap-3">
					<div className="relative w-full sm:w-70 shrink-0">
						<Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
						<input
							type="text"
							placeholder="Tìm kiếm theo phòng, khách hàng, biển số..."
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-white focus:outline-none focus:border-amber-400 hover:border-slate-300 transition-all"
						/>
					</div>

					<div className="w-full sm:w-44 shrink-0">
						<select
							value={vehicleType}
							onChange={(e) => setVehicleType(e.target.value)}
							className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 bg-white focus:outline-none focus:border-amber-400 hover:border-slate-300 transition-all cursor-pointer appearance-none"
						>
							<option value="">Loại phương tiện</option>
							<option value="xe_may">Xe máy</option>
							<option value="xe_hoi">Ô tô</option>
							<option value="xe_dap">Xe đạp</option>
							<option value="xe_dien">Xe điện</option>
						</select>
					</div>

					<div className="w-full sm:w-40 shrink-0">
						<select
							value={status}
							onChange={(e) => setStatus(e.target.value)}
							className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 bg-white focus:outline-none focus:border-amber-400 hover:border-slate-300 transition-all cursor-pointer appearance-none"
						>
							<option value="">Trạng thái</option>
							<option value="active">Hoạt động</option>
							<option value="inactive">Ngừng</option>
						</select>
					</div>

					<button
						onClick={() => setIsFilterOpen(true)}
						className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm cursor-pointer"
					>
						<Settings2 className="w-4 h-4" />
						Bộ lọc
					</button>

					<button className="flex items-center gap-2 px-5 py-2 bg-amber-400 text-slate-900 rounded-lg text-sm font-bold transition-colors hover:bg-amber-500 shadow-sm ml-auto cursor-pointer">
						+ Phương tiện
					</button>
				</div>
			</div>

			{/* Table Area */}
			<div className="flex-1 overflow-auto bg-[#f8f9fa] p-6">
				<div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm h-full flex flex-col">
					<div className="overflow-x-auto">
						<table className="w-full">
							<thead className="bg-[#f8f9fa] border-b border-slate-200">
								<tr>
									<th className="px-5 py-3.5 w-10">
										<input
											type="checkbox"
											className="rounded border-slate-300 text-amber-500 focus:ring-amber-500 w-4 h-4"
										/>
									</th>
									{[
										"Khách hàng",
										"Phòng",
										"Toà nhà",
										"Loại xe",
										"Biển số",
										"Tên xe",
										"Màu sắc",
										"Trạng thái",
									].map((h, i) => (
										<th
											key={i}
											className="px-5 py-3.5 text-left text-[12px] font-bold text-slate-600 tracking-wide whitespace-nowrap"
										>
											{h} <span className="inline-block ml-1 opacity-50">↕</span>
										</th>
									))}
									<th className="px-5 py-3.5 w-10 text-center">
										<Settings className="w-4 h-4 text-slate-400 inline-block" />
									</th>
								</tr>
							</thead>
							<tbody>
								{MOCK_VEHICLES.length === 0 && (
									<tr>
										<td
											colSpan={10}
											className="px-6 py-28 text-center bg-white cursor-default"
										>
											<div className="flex flex-col items-center justify-center">
												<div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-4 relative overflow-hidden">
													<svg
														className="w-12 h-12 text-slate-300"
														viewBox="0 0 24 24"
														fill="currentColor"
													>
														<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-2-5.5c-.83 0-1.5-.67-1.5-1.5S9.17 11.5 10 11.5s1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm4 0c-.83 0-1.5-.67-1.5-1.5S13.17 11.5 14 11.5s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
													</svg>
												</div>
												<p className="text-base font-bold text-slate-700">Không có dữ liệu</p>
											</div>
										</td>
									</tr>
								)}
							</tbody>
						</table>
					</div>

					{/* Pagination Footer */}
					<div className="mt-auto px-5 py-3 border-t border-slate-200 bg-white flex items-center justify-end gap-4 text-sm text-slate-600">
						<span>0-0/0</span>
						<div className="flex items-center gap-1">
							<button
								className="p-1 hover:bg-slate-100 rounded disabled:opacity-50 text-slate-400"
								disabled
							>
								<ChevronLeft className="w-4 h-4" />
							</button>
							<button
								className="p-1 hover:bg-slate-100 rounded disabled:opacity-50 text-slate-400"
								disabled
							>
								<ChevronRight className="w-4 h-4" />
							</button>
						</div>
						<select className="px-2 py-1 outline-none border border-slate-200 rounded cursor-pointer text-slate-600 bg-white hover:border-slate-300 appearance-none">
							<option>20 / trang</option>
							<option>50 / trang</option>
						</select>
					</div>
				</div>
			</div>

			{/* Advanced Filter Sidebar */}
			<AnimatePresence>
				{isFilterOpen && (
					<>
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							onClick={() => setIsFilterOpen(false)}
							className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm z-40 transition-opacity"
						/>
						<motion.div
							initial={{ x: "100%" }}
							animate={{ x: 0 }}
							exit={{ x: "100%" }}
							transition={{ type: "spring", damping: 25, stiffness: 200 }}
							className="absolute top-0 right-0 w-100 h-full bg-white shadow-2xl z-50 flex flex-col border-l border-slate-200"
						>
							<div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
								<h2 className="text-lg font-bold text-slate-900">Lọc nâng cao</h2>
								<button
									onClick={() => setIsFilterOpen(false)}
									className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
								>
									<X className="w-5 h-5" />
								</button>
							</div>

							<div className="flex-1 overflow-y-auto p-5 space-y-6">
								<div>
									<h3 className="text-sm font-semibold text-slate-800 mb-3">Toà nhà</h3>
									<p className="text-sm text-slate-500">Bộ lọc theo toà nhà</p>
								</div>
							</div>

							{/* Slider Footer */}
							<div className="p-5 border-t border-slate-100 bg-white flex items-center justify-end gap-3 shrink-0">
								<button
									onClick={clearFilters}
									className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
								>
									Đặt lại
								</button>
								<button
									onClick={() => setIsFilterOpen(false)}
									className="px-6 py-2.5 text-sm font-bold bg-amber-400 hover:bg-amber-500 text-slate-900 rounded-lg transition-colors shadow-sm cursor-pointer"
								>
									Áp dụng
								</button>
							</div>
						</motion.div>
					</>
				)}
			</AnimatePresence>
		</div>
	);
}

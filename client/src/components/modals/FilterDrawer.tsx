import { useState } from "react";
import { X, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface FilterDrawerProps {
	isOpen: boolean;
	onClose: () => void;
}

export default function FilterDrawer({ isOpen, onClose }: FilterDrawerProps) {
	const [value, setValue] = useState(80000000);

	return (
		<AnimatePresence>
			{isOpen && (
				<>
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						onClick={onClose}
						className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-[100] transition-opacity"
					/>
					<motion.div
						initial={{ x: "100%" }}
						animate={{ x: 0 }}
						exit={{ x: "100%" }}
						transition={{ type: "spring", damping: 30, stiffness: 300 }}
						className="fixed top-0 right-0 w-full max-w-[400px] h-full bg-white shadow-2xl z-[101] flex flex-col font-['Plus_Jakarta_Sans',sans-serif]"
					>
						<div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
							<h2 className="text-[18px] font-black text-slate-900">Lọc</h2>
							<button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors">
								<X className="w-5 h-5" />
							</button>
						</div>

						<div className="flex-1 overflow-y-auto p-6 space-y-6">
							{/* Kỳ hóa đơn */}
							<div className="space-y-2">
								<label className="text-[13px] font-black text-slate-700">Kỳ hóa đơn</label>
								<div className="relative">
									<input
										readOnly
										type="text"
										placeholder="Chọn kỳ hóa đơn"
										className="w-full pl-4 pr-10 h-10 border border-slate-200 rounded-lg text-[13px] font-bold text-slate-700 bg-white focus:outline-none focus:border-brand-primary placeholder:font-medium placeholder:text-slate-400 shadow-sm cursor-pointer"
									/>
									<Calendar className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
								</div>
							</div>

							{/* Trạng thái */}
							<div className="space-y-3">
								<label className="text-[13px] font-black text-slate-700">Trạng thái</label>
								<div className="grid grid-cols-2 gap-3">
									{[
										{ label: "Bản nháp", value: "draft" },
										{ label: "Đã xác nhận", value: "confirmed" },
										{ label: "Quá hạn", value: "overdue" },
										{ label: "Đã huỷ", value: "cancelled" },
										{ label: "Đã thanh toán", value: "paid" },
										{ label: "Một phần", value: "partial" },
									].map((st) => (
										<label key={st.value} className="flex items-center gap-2.5 cursor-pointer group">
											<div className="relative flex items-center justify-center">
												<input type="checkbox" className="peer w-4 h-4 appearance-none rounded border-2 border-slate-200 checked:bg-brand-primary checked:border-brand-primary transition-colors cursor-pointer" />
												<svg className="absolute w-2.5 h-2.5 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
											</div>
											<span className="text-[13px] font-medium text-slate-600 group-hover:text-slate-900 transition-colors">{st.label}</span>
										</label>
									))}
								</div>
							</div>

							{/* Ngày phát hành */}
							<div className="space-y-2">
								<label className="text-[13px] font-black text-slate-700">Ngày phát hành</label>
								<div className="flex items-center gap-2 bg-slate-50 border border-slate-200 p-1 rounded-lg">
									<input type="date" className="flex-1 bg-transparent border-none focus:ring-0 text-[13px] font-medium px-2 py-1 outline-none text-slate-700" placeholder="Từ ngày" />
									<span className="text-slate-400 text-sm">→</span>
									<input type="date" className="flex-1 bg-transparent border-none focus:ring-0 text-[13px] font-medium px-2 py-1 outline-none text-slate-700" placeholder="Đến ngày" />
									<Calendar className="w-4 h-4 text-slate-400 mr-2" />
								</div>
							</div>

							{/* Hạn thanh toán */}
							<div className="space-y-2">
								<label className="text-[13px] font-black text-slate-700">Hạn thanh toán</label>
								<div className="flex items-center gap-2 bg-slate-50 border border-slate-200 p-1 rounded-lg">
									<input type="date" className="flex-1 bg-transparent border-none focus:ring-0 text-[13px] font-medium px-2 py-1 outline-none text-slate-700" placeholder="Từ ngày" />
									<span className="text-slate-400 text-sm">→</span>
									<input type="date" className="flex-1 bg-transparent border-none focus:ring-0 text-[13px] font-medium px-2 py-1 outline-none text-slate-700" placeholder="Đến ngày" />
									<Calendar className="w-4 h-4 text-slate-400 mr-2" />
								</div>
							</div>

							{/* Tổng cộng */}
							<div className="space-y-4">
								<label className="text-[13px] font-black text-slate-700">Tổng cộng</label>
								<div className="px-1 relative">
									<input
										type="range"
										min={0}
										max={80000000}
										value={value}
										onChange={(e) => setValue(parseInt(e.target.value))}
										className="dual-slider"
									/>
									{/* Track background */}
									<div className="absolute top-1/2 left-1 right-1 h-1.5 -translate-y-1/2 bg-slate-200 rounded-full pointer-events-none">
										<div className="absolute top-0 bottom-0 left-0 bg-brand-primary rounded-full" style={{ width: `${(value / 80000000) * 100}%` }}></div>
									</div>
								</div>
								<div className="flex justify-between text-[12px] font-bold text-slate-500">
									<span>đ 0</span>
									<span>đ {new Intl.NumberFormat("vi-VN").format(80000000)}</span>
								</div>
							</div>

							{/* Người tạo */}
							<div className="space-y-2">
								<label className="text-[13px] font-black text-slate-700">Người tạo</label>
								<select className="w-full px-4 h-10 border border-slate-200 rounded-lg text-[13px] font-medium text-slate-700 bg-white outline-none cursor-pointer">
									<option>Chọn người tạo</option>
								</select>
							</div>

							{/* Tạo từ hệ thống */}
							<div className="flex items-center justify-between pt-2">
								<span className="text-[13px] font-black text-slate-700">Tạo từ hệ thống</span>
								<label className="relative inline-flex items-center cursor-pointer">
									<input type="checkbox" className="sr-only peer" />
									<div className="w-10 h-5.5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-brand-primary"></div>
								</label>
							</div>
						</div>

						<div className="p-5 border-t border-slate-100 bg-white grid grid-cols-2 gap-3 shrink-0">
							<button onClick={onClose} className="h-10 border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors">Thiết lập lại</button>
							<button className="h-10 bg-brand-primary text-white rounded-lg text-sm font-bold hover:bg-brand-dark transition-colors shadow-md">Lọc</button>
						</div>
					</motion.div>
				</>
			)}
		</AnimatePresence>
	);
}

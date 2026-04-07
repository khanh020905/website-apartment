import { useState } from "react";
import { Search, ChevronLeft, ChevronRight, Download, Settings } from "lucide-react";

export default function ProofOfPaymentPage() {
	const [search, setSearch] = useState("");
	const [status, setStatus] = useState("");
	const [room, setRoom] = useState("");

	// MOCK DATA is empty to show empty state like image
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const MOCK_PROOFS: any[] = [];

	return (
		<div className="flex-1 flex flex-col h-full bg-[#f8f9fa] relative overflow-hidden">
			{/* Header */}
			<div className="bg-white border-b border-slate-200">
				<div className="px-6 py-4 flex items-center justify-between">
					<h1 className="text-[20px] font-bold text-slate-900 tracking-tight flex items-center gap-2">
						Minh chứng thanh toán
					</h1>
					<button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
						<Download className="w-4 h-4" />
						<span className="hidden sm:inline">Xuất báo cáo</span>
					</button>
				</div>

				{/* Toolbar */}
				<div className="px-6 pb-4 flex flex-col sm:flex-row items-center gap-3">
					<div className="relative w-full sm:w-70 shrink-0">
						<Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
						<input
							type="text"
							placeholder="Tìm theo khách hàng, hoá đơn..."
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-white focus:outline-none focus:border-amber-400 hover:border-slate-300 transition-all"
						/>
					</div>

					<div className="w-full sm:w-40 shrink-0">
						<select
							value={room}
							onChange={(e) => setRoom(e.target.value)}
							className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 bg-white focus:outline-none focus:border-amber-400 hover:border-slate-300 transition-all cursor-pointer appearance-none"
						>
							<option value="">Tất cả phòng</option>
							<option value="101">P.101</option>
							<option value="102">P.102</option>
						</select>
					</div>

					<div className="w-full sm:w-40 shrink-0">
						<select
							value={status}
							onChange={(e) => setStatus(e.target.value)}
							className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 bg-white focus:outline-none focus:border-amber-400 hover:border-slate-300 transition-all cursor-pointer appearance-none"
						>
							<option value="">Trạng thái</option>
							<option value="pending">Chờ duyệt</option>
							<option value="approved">Đã duyệt</option>
							<option value="rejected">Từ chối</option>
						</select>
					</div>
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
										"Số tiền (VND)",
										"Hoá đơn",
										"Minh chứng",
										"Ngày gửi",
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
								{MOCK_PROOFS.length === 0 && (
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
		</div>
	);
}

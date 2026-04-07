import { RefreshCw, Maximize2, Download } from "lucide-react";

const CustomerReportPage = () => {
	const STATS = [
		{ label: "Tổng tiền", value: "0", color: "text-amber-500", bg: "bg-amber-50" },
		{ label: "Đã thu", value: "0", color: "text-emerald-500", bg: "bg-emerald-50" },
		{ label: "Chưa thu", value: "0", color: "text-rose-500", bg: "bg-rose-50" },
	];

	return (
		<div className="flex-1 flex flex-col h-full bg-[#f8f9fa] relative overflow-hidden">
			{/* Header */}
			<div className="bg-white border-b border-slate-200">
				<div className="px-6 py-4">
					<h1 className="text-[20px] font-bold text-slate-900 tracking-tight">
						Báo cáo khách hàng
					</h1>
				</div>
				<div className="px-6 flex items-center justify-between border-t border-slate-100 py-3">
					<div className="flex gap-6">
						<button className="text-[14px] font-bold text-amber-600 border-b-2 border-amber-500 pb-3 -mb-3">
							Quản lý nợ
						</button>
					</div>
					<div className="w-75">
						<select className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 bg-white focus:outline-none focus:border-amber-400 hover:border-slate-300 transition-all font-medium appearance-none">
							<option>Chọn toà nhà</option>
							<option>Toà nhà A</option>
						</select>
					</div>
				</div>
			</div>

			{/* Main Content */}
			<div className="flex-1 overflow-auto bg-[#f8f9fa] p-5 lg:p-6 flex flex-col gap-6">
				<div className="text-[13px] text-slate-500 font-medium">
					Cập nhật lần cuối lúc: 07/04/2026 03:10{" "}
					<RefreshCw className="w-3 h-3 inline-block ml-1 cursor-pointer hover:text-slate-900" />
				</div>

				{/* Quick Stats */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0">
					{STATS.map((stat, i) => (
						<div
							key={i}
							className="bg-white px-5 py-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center gap-1.5 min-h-22.5"
						>
							<span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
								{stat.label}
							</span>
							<span className="text-xl font-black text-slate-900 mt-0.5">{stat.value}</span>
						</div>
					))}
				</div>

				{/* Charts */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-87.5 shrink-0">
					{/* Chart 1 */}
					<div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-full">
						<div className="p-5 border-b border-slate-100 flex items-center justify-between">
							<h3 className="text-[14px] font-bold text-slate-800">Xu hướng thanh toán</h3>
							<div className="flex items-center gap-4">
								<select className="px-3 py-1.5 border border-slate-200 rounded-lg text-[13px] font-medium text-slate-600 bg-white focus:outline-none">
									<option>2026</option>
									<option>2025</option>
								</select>
								<div className="flex items-center gap-2 opacity-50">
									<button className="p-1 hover:bg-slate-100 rounded text-slate-500">
										<Maximize2 className="w-4 h-4" />
									</button>
									<button className="p-1 hover:bg-slate-100 rounded text-slate-500">
										<Download className="w-4 h-4" />
									</button>
								</div>
							</div>
						</div>
						<div className="flex-1 p-5 flex items-center justify-center text-sm font-medium text-slate-500">
							Chưa có dữ liệu
						</div>
					</div>

					{/* Chart 2 */}
					<div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-full">
						<div className="p-5 border-b border-slate-100 flex items-center justify-between">
							<h3 className="text-[14px] font-bold text-slate-800">Phân tích thời gian nợ</h3>
							<div className="flex items-center gap-2 opacity-50">
								<button className="p-1 hover:bg-slate-100 rounded text-slate-500">
									<Maximize2 className="w-4 h-4" />
								</button>
								<button className="p-1 hover:bg-slate-100 rounded text-slate-500">
									<Download className="w-4 h-4" />
								</button>
							</div>
						</div>
						<div className="flex-1 p-5 flex items-center justify-center text-sm font-medium text-slate-500">
							Chưa có dữ liệu
						</div>
					</div>
				</div>

				{/* Table */}
				<div className="bg-white p-5 lg:p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col flex-1 min-h-100">
					<div className="flex items-center justify-between mb-4">
						<h3 className="text-[15px] font-bold text-slate-900">
							Chi tiết thanh toán của khách hàng
						</h3>
					</div>
					{/* Table filters */}
					<div className="flex flex-wrap items-center gap-3 mb-4">
						<input
							type="text"
							placeholder="Tìm kiếm"
							className="px-3 py-1.5 border border-slate-200 rounded-lg text-[13px] outline-none focus:border-amber-400 w-64"
						/>
						<select className="px-3 py-1.5 border border-slate-200 rounded-lg text-[13px] outline-none">
							<option>Kỳ hóa đơn</option>
						</select>
						<select className="px-3 py-1.5 border border-slate-200 rounded-lg text-[13px] outline-none">
							<option>Tất cả trạng thái</option>
						</select>
					</div>

					<div className="overflow-x-auto flex-1">
						<table className="w-full text-left">
							<thead className="bg-[#f8f9fa] border-y border-slate-200">
								<tr>
									{[
										"Khách hàng",
										"Toà nhà",
										"Phòng",
										"Mã hóa đơn",
										"Trạng thái",
										"Tổng tiền",
										"Tiền đã thanh toán",
										"Tiền chưa thanh toán",
									].map((h, i) => (
										<th
											key={i}
											className="px-4 py-3 text-[12px] font-bold text-slate-600 tracking-wide whitespace-nowrap"
										>
											{h}
										</th>
									))}
								</tr>
							</thead>
							<tbody>
								<tr>
									<td
										colSpan={8}
										className="text-center py-12 text-[13px] font-medium text-slate-500"
									>
										Không có dữ liệu
									</td>
								</tr>
							</tbody>
						</table>
					</div>
				</div>
			</div>
		</div>
	);
};

export default CustomerReportPage;

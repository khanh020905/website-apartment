import { Download, RefreshCw } from "lucide-react";

const OwnerReportPage = () => {
	return (
		<div className="flex-1 flex flex-col h-full bg-[#f8f9fa] relative overflow-hidden">
			{/* Header */}
			<div className="bg-white border-b border-slate-200">
				<div className="px-6 py-4">
					<h1 className="text-[20px] font-bold text-slate-900 tracking-tight">
						Theo dõi thu tiền tháng
					</h1>
				</div>
				<div className="px-6 flex flex-wrap items-center gap-3 border-t border-slate-100 py-3">
					<div className="flex items-center gap-3 w-full sm:w-auto">
						<div className="w-37.5">
							<select className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 bg-white focus:outline-none focus:border-amber-400 hover:border-slate-300 transition-all font-medium appearance-none">
								<option>Tháng 04/2026</option>
							</select>
						</div>
						<div className="w-50">
							<select className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 bg-white focus:outline-none focus:border-amber-400 hover:border-slate-300 transition-all font-medium appearance-none">
								<option>Toà nhà A</option>
							</select>
						</div>
					</div>
				</div>
			</div>

			{/* Main Content */}
			<div className="flex-1 overflow-auto bg-[#f8f9fa] p-5 lg:p-6 flex flex-col gap-6">
				<div className="text-[13px] text-slate-500 font-medium">
					Cập nhật lần cuối lúc: 07/04/2026 03:20{" "}
					<RefreshCw className="w-3 h-3 inline-block ml-1 cursor-pointer hover:text-slate-900" />
				</div>

				{/* Table */}
				<div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col flex-1 min-h-100">
					<div className="p-5 border-b border-slate-100 flex items-center justify-between">
						<h3 className="text-[15px] font-bold text-slate-900">Chi tiết thanh toán</h3>
						<button className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 bg-white text-emerald-600 rounded-lg text-[13px] font-bold hover:bg-emerald-50 transition-colors shadow-sm cursor-pointer">
							<Download className="w-4 h-4" /> Xuất Excel
						</button>
					</div>

					<div className="overflow-x-auto flex-1">
						<table className="w-full text-left">
							<thead className="bg-[#f8f9fa] border-b border-slate-200">
								<tr>
									{[
										"Toà nhà",
										"Phòng",
										"Tiền phòng",
										"Nợ cũ",
										"Tiền cọc",
										"Tiền phát sinh",
										"Khuyến mãi",
										"Thanh toán cho chủ nhà",
										"Smartos đã thu",
										"Smartos chưa thu",
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
										colSpan={10}
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

export default OwnerReportPage;

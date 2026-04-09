import { useState, useEffect } from "react";
import { RefreshCw, Maximize2, Download } from "lucide-react";
import { api } from "../lib/api";

const CustomerReportPage = () => {
	const [loading, setLoading] = useState(true);
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const [reportData, setReportData] = useState<any>(null);

	const fetchReports = async () => {
		setLoading(true);
		try {
			const { data } = await api.get("/api/reports/customer");
			if (data) {
				setReportData(data);
			}
		} catch (error) {
			console.error(error);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchReports();
	}, []);

	const numFormat = new Intl.NumberFormat("vi-VN");

	const summary = reportData?.summary || { total: 0, paid: 0, pending: 0 };
	const invoices = reportData?.invoices || [];

	const STATS = [
		{ label: "Tổng tiền", value: numFormat.format(summary.total), color: "text-brand-primary", bg: "bg-brand-bg" },
		{ label: "Đã thu", value: numFormat.format(summary.paid), color: "text-emerald-500", bg: "bg-emerald-50" },
		{ label: "Chưa thu", value: numFormat.format(summary.pending), color: "text-rose-500", bg: "bg-rose-50" },
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
						<button className="text-[14px] font-bold text-brand-dark border-b-2 border-amber-500 pb-3 -mb-3 cursor-pointer">
							Quản lý nợ
						</button>
					</div>
					<div className="w-[300px]">
						<select className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 bg-white focus:outline-none focus:border-brand-primary hover:border-slate-300 transition-all font-medium appearance-none cursor-pointer">
							<option>Tất cả toà nhà</option>
						</select>
					</div>
				</div>
			</div>

			{/* Main Content */}
			<div className="flex-1 overflow-auto bg-[#f8f9fa] p-5 lg:p-6 flex flex-col gap-6">
				<div className="text-[13px] text-slate-500 font-medium">
					Cập nhật lần cuối lúc: {new Date().toLocaleTimeString("vi-VN").slice(0, 5)}{" "}
					<RefreshCw onClick={fetchReports} className={`w-3 h-3 inline-block ml-1 cursor-pointer hover:text-slate-900 ${loading ? "animate-spin" : ""}`} />
				</div>

				{/* Quick Stats */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0">
					{STATS.map((stat, i) => (
						<div
							key={i}
							className="bg-white px-5 py-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center gap-1.5 min-h-[90px]"
						>
							<span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
								{stat.label}
							</span>
							<span className="text-xl font-black text-slate-900 mt-0.5">₫ {stat.value}</span>
						</div>
					))}
				</div>

				{/* Charts */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[350px] shrink-0">
					{/* Chart 1 */}
					<div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-full">
						<div className="p-5 border-b border-slate-100 flex items-center justify-between">
							<h3 className="text-[14px] font-bold text-slate-800">Xu hướng thanh toán</h3>
							<div className="flex items-center gap-4">
								<select className="px-3 py-1.5 border border-slate-200 rounded-lg text-[13px] font-medium text-slate-600 bg-white focus:outline-none cursor-pointer">
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
							Tính năng Đang phát triển
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
							Tính năng Đang phát triển
						</div>
					</div>
				</div>

				{/* Table */}
				<div className="bg-white p-5 lg:p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col flex-1 min-h-[400px]">
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
							className="px-3 py-1.5 border border-slate-200 rounded-lg text-[13px] outline-none focus:border-brand-primary w-64"
						/>
						<select className="px-3 py-1.5 border border-slate-200 rounded-lg text-[13px] outline-none cursor-pointer">
							<option>Kỳ hóa đơn</option>
						</select>
						<select className="px-3 py-1.5 border border-slate-200 rounded-lg text-[13px] outline-none cursor-pointer">
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
										"Kỳ hóa đơn",
										"Trạng thái",
										"Tổng tiền",
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
								{loading ? (
									<tr>
										<td colSpan={7} className="text-center py-12">
											<div className="w-6 h-6 border-2 border-amber-300 border-t-amber-500 rounded-full animate-spin mx-auto"></div>
										</td>
									</tr>
								) : invoices.length === 0 ? (
									<tr>
										<td
											colSpan={7}
											className="text-center py-12 text-[13px] font-medium text-slate-500"
										>
											Không có dữ liệu hóa đơn nào
										</td>
									</tr>
								) : (
									invoices.map((inv: any) => (
										<tr key={inv.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
											<td className="px-4 py-3 text-[13px] font-bold text-slate-900">{inv.customer_name || "—"}</td>
											<td className="px-4 py-3 text-[13px] text-slate-600">{inv.building?.name || "—"}</td>
											<td className="px-4 py-3 text-[13px] font-medium text-slate-700">{inv.room?.room_number || "—"}</td>
											<td className="px-4 py-3 text-[12px] font-medium text-slate-500">{inv.invoice_code}</td>
											<td className="px-4 py-3 text-[13px] text-slate-600">{inv.billing_month || "—"}</td>
											<td className="px-4 py-3">
												<span className={`inline-flex px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wide border
													${inv.status === 'paid' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' 
														: inv.status === 'overdue' ? 'bg-rose-50 text-rose-600 border-rose-200'
														: 'bg-brand-bg text-brand-dark border-amber-200'}`}
												>
													{inv.status === 'paid' ? 'Đã thu' : inv.status === 'overdue' ? 'Quá hạn' : 'Chưa thu'}
												</span>
											</td>
											<td className="px-4 py-3 text-[13px] font-bold text-slate-900">₫ {numFormat.format(inv.total_amount)}</td>
										</tr>
									))
								)}
							</tbody>
						</table>
					</div>
				</div>
			</div>
		</div>
	);
};

export default CustomerReportPage;

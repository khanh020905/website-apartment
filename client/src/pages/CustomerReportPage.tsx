import { useState, useEffect } from "react";
import { RefreshCw, FileSpreadsheet, Settings } from "lucide-react";
import {
	CartesianGrid,
	Line,
	BarChart,
	Bar,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
	ComposedChart,
	Legend,
} from "recharts";

const MOCK_MONTHLY_TREND = [
	{ name: "Tháng 1", paid: 154000, debt: 20000, customers: 10 },
	{ name: "Tháng 2", paid: 184000, debt: 50000, customers: 15 },
	{ name: "Tháng 3", paid: 120000, debt: 0, customers: 8 },
	{ name: "Tháng 4", paid: 272000, debt: 80000, customers: 25 },
];

const MOCK_AGING_REPORT = [
	{ name: "8-14 ngày", amount: 20000000 },
	{ name: "15-21 ngày", amount: 15000000 },
	{ name: "22-28 ngày", amount: 50000000 },
	{ name: ">28 ngày", amount: 8000000 },
];

const MOCK_USERS = [
	{ id: 1, name: "Nguyễn Tấn Tài", phone: "0387596966", building: "Trường Chinh", room: "P101", inv: "#INV0006", status: "Quá hạn", total: "71,750,005", paid: "0", unpaid: "71,750,005", overdue: "71,750,005" },
	{ id: 2, name: "Trần Hùng Quân", phone: "0963745887", building: "Trường Chinh", room: "P301", inv: "#INV0005", status: "Quá hạn", total: "88,000,000", paid: "0", unpaid: "88,000,000", overdue: "88,000,000" },
	{ id: 3, name: "Nguyễn Tấn Phát", phone: "0963855744", building: "Trường Chinh", room: "P102", inv: "#INV0004", status: "Quá hạn", total: "67,200,000", paid: "0", unpaid: "67,200,000", overdue: "67,200,000" },
	{ id: 4, name: "Nguyễn Như Lan", phone: "0375639665", building: "Trường Chinh", room: "P103", inv: "#INV0003", status: "Quá hạn", total: "70,400,000", paid: "0", unpaid: "70,400,000", overdue: "70,400,000" },
];

const CustomerReportPage = () => {
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const timer = setTimeout(() => setLoading(false), 800);
		return () => clearTimeout(timer);
	}, []);

	return (
		<div className="flex-1 flex flex-col h-full bg-[#f4f5f7] relative overflow-hidden font-sans">
			{/* Header */}
			<div className="bg-[#f4f5f7] px-6 py-5 shrink-0 border-b border-slate-200 shadow-sm z-10">
				<h1 className="text-[20px] font-bold text-slate-800 tracking-tight mb-4">Báo cáo khách hàng</h1>
				
				<div className="flex items-center justify-between">
					<div className="flex gap-6">
						<button className="text-[14px] font-bold text-slate-800 border-b-[3px] border-amber-500 pb-2 -mb-[1px]">
							Quản lý nợ
						</button>
					</div>
					<div className="w-[300px]">
						<select className="w-full px-3 py-2 border border-slate-300 rounded-lg text-[13px] text-slate-600 bg-[#f8f9fa] focus:outline-none focus:border-amber-500 transition-all font-medium appearance-none cursor-pointer">
							<option>Chọn toà nhà</option>
						</select>
					</div>
				</div>
			</div>

			{/* Main Content Area */}
			<div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
				{/* Timestamp */}
				<div className="text-[13px] text-slate-500 font-medium flex items-center gap-2">
					Cập nhật lần cuối lúc: 17/04/2026 - 09:41
					<RefreshCw className={`w-3.5 h-3.5 cursor-pointer hover:text-slate-800 ${loading ? "animate-spin" : ""}`} />
				</div>

				{/* Charts Grid */}
				<div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6 shrink-0 h-[380px]">
					
					{/* Xu hướng thanh toán */}
					<div className="bg-white rounded-md border border-slate-200 shadow-sm flex flex-col h-full">
						<div className="px-5 py-4 flex items-center justify-between">
							<h3 className="text-[14px] font-bold text-slate-700">Xu hướng thanh toán</h3>
						</div>
						<div className="flex-1 px-5 pb-6">
							<ResponsiveContainer width="100%" height="100%">
								<ComposedChart data={MOCK_MONTHLY_TREND} margin={{ top: 20, right: 20, left: 10, bottom: 20 }}>
									<CartesianGrid vertical={false} stroke="#f1f5f9" />
									<XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} dy={10} />
									<YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} tickFormatter={(val) => `${val/1000}Tr`} />
									<YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} />
									<Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0" }} />
									<Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ paddingTop: "20px" }} />
									<Bar yAxisId="left" dataKey="paid" name="Đã thanh toán" fill="#22c55e" barSize={12} radius={[2, 2, 0, 0]} />
									<Bar yAxisId="left" dataKey="debt" name="Nợ" fill="#ef4444" barSize={12} radius={[2, 2, 0, 0]} />
									<Line yAxisId="right" type="monotone" dataKey="customers" name="Khách hàng" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4, fill: "#3b82f6" }} />
								</ComposedChart>
							</ResponsiveContainer>
						</div>
					</div>

					{/* Chi tiết (Ageing Report) */}
					<div className="bg-white rounded-md border border-slate-200 shadow-sm flex flex-col h-full relative">
						<div className="absolute top-4 right-4 z-10">
							<button className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[12px] font-medium rounded-md transition-colors border border-slate-200">
								Xem chi tiết
							</button>
						</div>
						<div className="flex-1 px-5 pt-12 pb-6">
							<ResponsiveContainer width="100%" height="100%">
								<BarChart data={MOCK_AGING_REPORT} margin={{ top: 20, right: 0, left: 0, bottom: 20 }}>
									<CartesianGrid vertical={false} stroke="#f1f5f9" />
									<XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 11 }} dy={10} interval={0} />
									<YAxis hide domain={[0, 'dataMax + 10000000']} />
									<Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0" }} formatter={(value: number) => [`${(value/1000000).toFixed(1)}Tr`, "Số tiền"]} />
									<Bar dataKey="amount" fill="#d97706" barSize={16} radius={[2, 2, 0, 0]} />
								</BarChart>
							</ResponsiveContainer>
						</div>
					</div>

				</div>

				{/* Chi tiết thanh toán của khách hàng Table */}
				<div className="bg-white rounded-md border border-slate-200 shadow-sm flex flex-col flex-1 min-h-[400px]">
					<div className="px-5 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
						<h3 className="text-[14px] font-bold text-slate-700">Chi tiết thanh toán của khách hàng</h3>
						<div className="flex items-center gap-3">
							<select className="px-3 py-1.5 border border-slate-200 rounded text-[13px] text-slate-600 bg-white focus:outline-none cursor-pointer">
								<option>Chọn trạng thái thanh toán</option>
							</select>
							<div className="relative">
								<input type="month" defaultValue="2026-04" className="px-3 py-1.5 border border-slate-200 rounded text-[13px] text-slate-600 bg-white focus:outline-none cursor-pointer" />
							</div>
							<button className="p-1.5 hover:bg-slate-100 border border-transparent hover:border-slate-200 rounded text-green-600 transition-colors">
								<FileSpreadsheet className="w-5 h-5" />
							</button>
						</div>
					</div>
					
					{/* Table Wrapper */}
					<div className="overflow-x-auto">
						<table className="w-full text-left border-collapse">
							<thead>
								<tr className="bg-[#f8f9fa] border-b border-slate-200">
									<th className="py-3 px-5 text-[12px] font-bold text-slate-600">Khách hàng</th>
									<th className="py-3 px-3 text-[12px] font-bold text-slate-600">Toà nhà</th>
									<th className="py-3 px-3 text-[12px] font-bold text-slate-600 text-center">Phòng</th>
									<th className="py-3 px-3 text-[12px] font-bold text-slate-600 text-center">Mã</th>
									<th className="py-3 px-3 text-[12px] font-bold text-slate-600 text-center">Trạng thái</th>
									<th className="py-3 px-3 text-[12px] font-bold text-slate-600 text-right">Tổng tiền</th>
									<th className="py-3 px-3 text-[12px] font-bold text-slate-600 text-right">Tổng tiền đã thanh toán</th>
									<th className="py-3 px-3 text-[12px] font-bold text-slate-600 text-right">Tổng tiền chưa thanh toán</th>
									<th className="py-3 px-5 text-[12px] font-bold text-slate-600 text-right flex justify-end items-center gap-2">
										Tổng tiền quá hạn <Settings className="w-3.5 h-3.5 cursor-pointer text-slate-400" />
									</th>
								</tr>
							</thead>
							<tbody>
								{MOCK_USERS.map((user, idx) => (
									<tr key={user.id} className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-[#fafafa]'}`}>
										<td className="py-3 px-5">
											<div className="flex items-center gap-3">
												<div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden shrink-0 border border-slate-300">
													<img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${user.name}`} alt={user.name} className="w-full h-full object-cover" />
												</div>
												<div className="flex flex-col">
													<span className="text-[13px] font-semibold text-slate-800">{user.name}</span>
													<span className="text-[12px] text-slate-500">{user.phone}</span>
												</div>
											</div>
										</td>
										<td className="py-3 px-3 text-[13px] text-slate-700">{user.building}</td>
										<td className="py-3 px-3 text-[13px] text-slate-700 text-center">{user.room}</td>
										<td className="py-3 px-3 text-[13px] text-center">
											<button className="text-blue-500 hover:underline font-medium">{user.inv}</button>
										</td>
										<td className="py-3 px-3 text-[13px] text-center">
											<span className="inline-flex items-center px-2 py-0.5 rounded text-[12px] font-medium bg-red-50 text-red-600">
												{user.status}
											</span>
										</td>
										<td className="py-3 px-3 text-[13px] text-slate-700 text-right">₫ {user.total}</td>
										<td className="py-3 px-3 text-[13px] text-slate-700 text-right">₫ {user.paid}</td>
										<td className="py-3 px-3 text-[13px] text-slate-700 text-right">₫ {user.unpaid}</td>
										<td className="py-3 px-5 text-[13px] text-slate-700 text-right">₫ {user.overdue}</td>
									</tr>
								))}
								
								{/* Placeholder for more rows to fill space */}
								{[5, 6, 7].map(i => (
									<tr key={i} className="border-b border-slate-100">
										<td className="py-3 px-5"><div className="h-4 bg-slate-100 rounded w-32"></div></td>
										<td className="py-3 px-3"><div className="h-4 bg-slate-100 rounded w-20"></div></td>
										<td className="py-3 px-3"><div className="h-4 bg-slate-100 rounded w-10 mx-auto"></div></td>
										<td className="py-3 px-3"><div className="h-4 bg-slate-100 rounded w-16 mx-auto"></div></td>
										<td className="py-3 px-3"><div className="h-4 bg-slate-100 rounded w-16 mx-auto"></div></td>
										<td className="py-3 px-3"><div className="h-4 bg-slate-100 rounded w-24 ml-auto"></div></td>
										<td className="py-3 px-3"><div className="h-4 bg-slate-100 rounded w-24 ml-auto"></div></td>
										<td className="py-3 px-3"><div className="h-4 bg-slate-100 rounded w-24 ml-auto"></div></td>
										<td className="py-3 px-5"><div className="h-4 bg-slate-100 rounded w-24 ml-auto"></div></td>
									</tr>
								))}
							</tbody>
						</table>
					</div>

					<div className="p-4 border-t border-slate-100 flex items-center justify-end text-[13px] text-slate-500 bg-[#f8f9fa] mt-auto">
						Tổng cộng: <span className="font-bold text-slate-800 ml-1">₫ 297,350,005</span>
					</div>
				</div>

			</div>
		</div>
	);
};

export default CustomerReportPage;

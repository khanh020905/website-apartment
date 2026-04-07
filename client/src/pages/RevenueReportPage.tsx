/* eslint-disable react-hooks/purity */
import { useState } from "react";
import { Download, RefreshCw, Maximize2, MoreHorizontal } from "lucide-react";
import {
	BarChart,
	Bar,
	LineChart,
	Line,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Legend,
	ResponsiveContainer,
	PieChart,
	Pie,
	Cell,
} from "recharts";

const TABS = [
	{ id: "service", label: "Doanh thu theo dịch vụ" },
	{ id: "rental", label: "Doanh thu cho thuê" },
	{ id: "invoices", label: "Hóa đơn" },
	{ id: "cashflow", label: "Dòng tiền" },
];

const MOCK_MONTHLY = Array.from({ length: 12 }).map((_, i) => ({
	name: `Th ${i + 1}`,
	room: Math.floor(Math.random() * 500) + 200,
	service: Math.floor(Math.random() * 100) + 20,
	utility: Math.floor(Math.random() * 150) + 50,
	total: 0,
}));

MOCK_MONTHLY.forEach((m) => (m.total = m.room + m.service + m.utility));

const PIE_DATA = [
	{ name: "Tiền phòng", value: 70, color: "#3b82f6" },
	{ name: "Dịch vụ", value: 15, color: "#f59e0b" },
	{ name: "Tiện ích", value: 15, color: "#10b981" },
];

const RevenueReportPage = () => {
	const [activeTab, setActiveTab] = useState("service");

	const renderTabContent = () => {
		switch (activeTab) {
			case "service":
				return <ServiceRevenueTab />;
			case "rental":
				return <RentalRevenueTab />;
			case "invoices":
				return <InvoicesTab />;
			case "cashflow":
				return <CashFlowTab />;
			default:
				return null;
		}
	};

	return (
		<div className="flex-1 flex flex-col h-full bg-[#f8f9fa] relative overflow-hidden">
			{/* Header */}
			<div className="bg-white border-b border-slate-200">
				<div className="px-6 py-4">
					<h1 className="text-[20px] font-bold text-slate-900 tracking-tight">Báo cáo doanh thu</h1>
				</div>
				<div className="px-6 flex items-center justify-between border-t border-slate-100 pt-3">
					<div className="flex gap-6 overflow-x-auto scrollbar-hide">
						{TABS.map((tab) => (
							<button
								key={tab.id}
								onClick={() => setActiveTab(tab.id)}
								className={`text-[14px] font-bold pb-3 border-b-2 whitespace-nowrap transition-colors outline-none ${
									activeTab === tab.id ?
										"text-amber-600 border-amber-500"
									:	"text-slate-500 border-transparent hover:text-slate-800"
								}`}
							>
								{tab.label}
							</button>
						))}
					</div>
					<div className="flex items-center gap-3 pb-3">
						<div className="w-30">
							<select className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 bg-white focus:outline-none focus:border-amber-400 hover:border-slate-300 transition-all font-medium appearance-none">
								<option>2026</option>
								<option>2025</option>
							</select>
						</div>
						<div className="w-50">
							<select className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 bg-white focus:outline-none focus:border-amber-400 hover:border-slate-300 transition-all font-medium appearance-none">
								<option>Tất cả toà nhà</option>
								<option>Toà nhà A</option>
							</select>
						</div>
					</div>
				</div>
			</div>

			{/* Main Content */}
			<div className="flex-1 overflow-auto bg-[#f8f9fa] p-5 lg:p-6 flex flex-col gap-6">
				<div className="text-[13px] text-slate-500 font-medium shrink-0 flex items-center gap-1.5">
					Cập nhật lần cuối lúc: 07/04/2026 03:15
					<button className="hover:bg-slate-200 p-1 rounded transition-colors text-slate-400 hover:text-slate-900">
						<RefreshCw className="w-3.5 h-3.5" />
					</button>
				</div>

				{renderTabContent()}
			</div>
		</div>
	);
};

// --- SUB-COMPONENTS FOR TABS ---

const ServiceRevenueTab = () => {
	const STATS = [
		{ label: "Tiền phòng", value: "850,000,000", color: "text-blue-600", bg: "bg-blue-50" },
		{ label: "Dịch vụ bổ sung", value: "125,500,000", color: "text-amber-600", bg: "bg-amber-50" },
		{ label: "Tiện ích", value: "210,000,000", color: "text-emerald-600", bg: "bg-emerald-50" },
		{ label: "Doanh thu khác", value: "15,000,000", color: "text-slate-600", bg: "bg-slate-50" },
	];

	return (
		<div className="flex flex-col gap-6">
			{/* Quick Stats */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-4 shrink-0">
				{STATS.map((stat, i) => (
					<div
						key={i}
						className="bg-white px-5 py-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center gap-1.5 min-h-22.5"
					>
						<span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
							{stat.label}
						</span>
						<span className={`text-xl font-black ${stat.color} mt-0.5`}>{stat.value}</span>
					</div>
				))}
			</div>

			{/* Charts */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-100 shrink-0">
				<div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-full">
					<div className="p-5 border-b border-slate-100 flex items-center justify-between">
						<h3 className="text-[14px] font-bold text-slate-800">
							Doanh thu theo dịch vụ (Triệu VNĐ)
						</h3>
						<div className="flex items-center gap-2 opacity-50">
							<button className="p-1 hover:bg-slate-100 rounded text-slate-500">
								<Maximize2 className="w-4 h-4" />
							</button>
						</div>
					</div>
					<div className="flex-1 p-5">
						<ResponsiveContainer
							width="100%"
							height="100%"
						>
							<BarChart
								data={MOCK_MONTHLY}
								margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
							>
								<CartesianGrid
									strokeDasharray="3 3"
									vertical={false}
									stroke="#e2e8f0"
								/>
								<XAxis
									dataKey="name"
									axisLine={false}
									tickLine={false}
									tick={{ fontSize: 12, fill: "#64748b" }}
									dy={10}
								/>
								<YAxis
									axisLine={false}
									tickLine={false}
									tick={{ fontSize: 12, fill: "#64748b" }}
								/>
								<Tooltip
									cursor={{ fill: "#f1f5f9" }}
									contentStyle={{
										borderRadius: "8px",
										border: "none",
										boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
									}}
								/>
								<Legend
									iconType="circle"
									wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }}
								/>
								<Bar
									dataKey="room"
									name="Tiền phòng"
									stackId="a"
									fill="#3b82f6"
									radius={[0, 0, 4, 4]}
									barSize={30}
								/>
								<Bar
									dataKey="utility"
									name="Tiện ích"
									stackId="a"
									fill="#10b981"
								/>
								<Bar
									dataKey="service"
									name="Dịch vụ bổ sung"
									stackId="a"
									fill="#f59e0b"
									radius={[4, 4, 0, 0]}
								/>
							</BarChart>
						</ResponsiveContainer>
					</div>
				</div>

				<div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-full">
					<div className="p-5 border-b border-slate-100 flex items-center justify-between">
						<h3 className="text-[14px] font-bold text-slate-800">Tỷ lệ theo dịch vụ</h3>
					</div>
					<div className="flex-1 px-5 pb-5">
						<ResponsiveContainer
							width="100%"
							height="100%"
						>
							<PieChart>
								<Pie
									data={PIE_DATA}
									innerRadius={60}
									outerRadius={80}
									paddingAngle={5}
									dataKey="value"
								>
									{PIE_DATA.map((entry, index) => (
										<Cell
											key={`cell-${index}`}
											fill={entry.color}
											stroke="transparent"
										/>
									))}
								</Pie>
								<Tooltip
									contentStyle={{
										borderRadius: "8px",
										border: "none",
										boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
									}}
								/>
								<Legend
									iconType="circle"
									layout="vertical"
									verticalAlign="middle"
									align="right"
									wrapperStyle={{ fontSize: "12px" }}
								/>
							</PieChart>
						</ResponsiveContainer>
					</div>
				</div>
			</div>

			{/* Table */}
			<div className="bg-white p-5 lg:p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col flex-1 min-h-100">
				<div className="flex items-center justify-between mb-4">
					<h3 className="text-[15px] font-bold text-slate-900">Chi tiết doanh thu dịch vụ</h3>
					<button className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 bg-white text-emerald-600 rounded-lg text-[13px] font-bold hover:bg-emerald-50 transition-colors shadow-sm cursor-pointer">
						<Download className="w-4 h-4" /> Xuất Excel
					</button>
				</div>

				<div className="overflow-x-auto flex-1 border border-slate-200 rounded-lg">
					<table className="w-full text-left">
						<thead className="bg-[#f8f9fa] border-b border-slate-200">
							<tr>
								<th className="px-4 py-3 text-[12px] font-bold text-slate-600 tracking-wide whitespace-nowrap border-r border-slate-200 sticky left-0 z-10 bg-[#f8f9fa]">
									Nhóm dịch vụ
								</th>
								{Array.from({ length: 12 }).map((_, i) => (
									<th
										key={i}
										className="px-4 py-3 text-[12px] font-bold text-slate-600 tracking-wide whitespace-nowrap text-right"
									>
										T{i + 1}
									</th>
								))}
								<th className="px-4 py-3 text-[12px] font-bold text-slate-600 tracking-wide whitespace-nowrap text-right bg-amber-50">
									Tổng cộng
								</th>
								<th className="px-4 py-3 text-[12px] font-bold text-slate-600 tracking-wide whitespace-nowrap text-right">
									% Tổng
								</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-slate-100">
							{["Tiền phòng", "Tiện ích (Điện, Nước)", "Dịch vụ bổ sung", "Khác"].map((s, idx) => (
								<tr
									key={idx}
									className="hover:bg-slate-50 transition-colors"
								>
									<td className="px-4 py-3 text-[13px] font-bold text-slate-900 whitespace-nowrap border-r border-slate-200 sticky left-0 z-10 bg-white">
										{s}
									</td>
									{Array.from({ length: 12 }).map((_, i) => (
										<td
											key={i}
											className="px-4 py-3 text-[12px] text-slate-600 whitespace-nowrap text-right font-medium"
										>
											{(Math.random() * 50 + 10).toFixed(1)}M
										</td>
									))}
									<td className="px-4 py-3 text-[13px] font-bold text-slate-900 whitespace-nowrap text-right bg-amber-50/30">
										{}
										{(Math.random() * 500 + 100).toFixed(1)}M
									</td>
									<td className="px-4 py-3 text-[12px] font-bold text-slate-600 whitespace-nowrap text-right">
										{}
										{(Math.random() * 30 + 10).toFixed(1)}%
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
};

const RentalRevenueTab = () => {
	return (
		<div className="flex flex-col gap-6">
			{/* Charts */}
			<div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-100 shrink-0">
				<div className="p-5 border-b border-slate-100 flex items-center justify-between">
					<h3 className="text-[14px] font-bold text-slate-800">
						Tổng doanh thu theo tháng (Triệu VNĐ)
					</h3>
				</div>
				<div className="flex-1 p-5">
					<ResponsiveContainer
						width="100%"
						height="100%"
					>
						<LineChart
							data={MOCK_MONTHLY}
							margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
						>
							<CartesianGrid
								strokeDasharray="3 3"
								vertical={false}
								stroke="#e2e8f0"
							/>
							<XAxis
								dataKey="name"
								axisLine={false}
								tickLine={false}
								tick={{ fontSize: 12, fill: "#64748b" }}
								dy={10}
							/>
							<YAxis
								axisLine={false}
								tickLine={false}
								tick={{ fontSize: 12, fill: "#64748b" }}
							/>
							<Tooltip
								cursor={{ stroke: "#cbd5e1", strokeWidth: 1, strokeDasharray: "4 4" }}
								contentStyle={{
									borderRadius: "8px",
									border: "none",
									boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
								}}
							/>
							<Line
								type="monotone"
								dataKey="total"
								name="Tổng doanh thu"
								stroke="#f59e0b"
								strokeWidth={3}
								dot={{ r: 4, strokeWidth: 2 }}
								activeDot={{ r: 6 }}
							/>
						</LineChart>
					</ResponsiveContainer>
				</div>
			</div>

			{/* Table */}
			<div className="bg-white p-5 lg:p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col flex-1 min-h-100">
				<div className="flex items-center justify-between mb-4">
					<h3 className="text-[15px] font-bold text-slate-900">Tổng doanh thu theo tòa nhà</h3>
					<button className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 bg-white text-emerald-600 rounded-lg text-[13px] font-bold hover:bg-emerald-50 transition-colors shadow-sm cursor-pointer">
						<Download className="w-4 h-4" /> Xuất Excel
					</button>
				</div>

				<div className="overflow-x-auto flex-1 border border-slate-200 rounded-lg">
					<table className="w-full text-left">
						<thead className="bg-[#f8f9fa] border-b border-slate-200">
							<tr>
								<th className="px-4 py-3 text-[12px] font-bold text-slate-600 tracking-wide whitespace-nowrap border-r border-slate-200 sticky left-0 z-10 bg-[#f8f9fa]">
									Tòa nhà
								</th>
								{Array.from({ length: 12 }).map((_, i) => (
									<th
										key={i}
										className="px-4 py-3 text-[12px] font-bold text-slate-600 tracking-wide whitespace-nowrap text-right"
									>
										T{i + 1}
									</th>
								))}
								<th className="px-4 py-3 text-[12px] font-bold text-slate-600 tracking-wide whitespace-nowrap text-right bg-amber-50">
									Tổng cộng
								</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-slate-100">
							{["Toà nhà Central", "Khu biệt thự Nam", "Sunrise Apartment"].map((s, idx) => (
								<tr
									key={idx}
									className="hover:bg-slate-50 transition-colors"
								>
									<td className="px-4 py-3 text-[13px] font-bold text-slate-900 whitespace-nowrap border-r border-slate-200 sticky left-0 z-10 bg-white flex items-center gap-2">
										<div className="w-2 h-2 rounded-full bg-amber-500"></div>
										{s}
									</td>
									{Array.from({ length: 12 }).map((_, i) => (
										<td
											key={i}
											className="px-4 py-3 text-[12px] text-slate-600 whitespace-nowrap text-right font-medium"
										>
											{(Math.random() * 200 + 50).toFixed(1)}M
										</td>
									))}
									<td className="px-4 py-3 text-[13px] font-bold text-slate-900 whitespace-nowrap text-right bg-amber-50/30">
										{}
										{(Math.random() * 2000 + 500).toFixed(1)}M
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
};

const InvoicesTab = () => {
	const STATS = [
		{ label: "Tổng số hóa đơn", value: "1,250", color: "text-slate-800", bg: "bg-slate-50" },
		{ label: "Đã thanh toán", value: "480", color: "text-emerald-600", bg: "bg-emerald-50" },
		{ label: "Chờ thanh toán", value: "750", color: "text-amber-600", bg: "bg-amber-50" },
		{ label: "Quá hạn", value: "20", color: "text-rose-600", bg: "bg-rose-50" },
	];

	return (
		<div className="flex flex-col gap-6">
			{/* Quick Stats */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-4 shrink-0">
				{STATS.map((stat, i) => (
					<div
						key={i}
						className="bg-white px-5 py-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center gap-1.5 min-h-22.5"
					>
						<span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
							{stat.label}
						</span>
						<span className={`text-xl font-black ${stat.color} mt-0.5`}>{stat.value}</span>
					</div>
				))}
			</div>

			{/* Chart */}
			<div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-100 shrink-0">
				<div className="p-5 border-b border-slate-100 flex items-center justify-between">
					<h3 className="text-[14px] font-bold text-slate-800">Tình trạng hóa đơn</h3>
				</div>
				<div className="flex-1 p-5">
					<ResponsiveContainer
						width="100%"
						height="100%"
					>
						<BarChart
							data={MOCK_MONTHLY.slice(0, 6)}
							margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
						>
							<CartesianGrid
								strokeDasharray="3 3"
								vertical={false}
								stroke="#e2e8f0"
							/>
							<XAxis
								dataKey="name"
								axisLine={false}
								tickLine={false}
								tick={{ fontSize: 12, fill: "#64748b" }}
								dy={10}
							/>
							<YAxis
								axisLine={false}
								tickLine={false}
								tick={{ fontSize: 12, fill: "#64748b" }}
							/>
							<Tooltip
								cursor={{ fill: "#f1f5f9" }}
								contentStyle={{
									borderRadius: "8px",
									border: "none",
									boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
								}}
							/>
							<Legend
								iconType="circle"
								wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }}
							/>
							<Bar
								dataKey="room"
								name="Đã thanh toán"
								fill="#10b981"
								radius={[4, 4, 0, 0]}
								barSize={20}
							/>
							<Bar
								dataKey="service"
								name="Chờ thanh toán"
								fill="#f59e0b"
								radius={[4, 4, 0, 0]}
								barSize={20}
							/>
							<Bar
								dataKey="utility"
								name="Quá hạn"
								fill="#ef4444"
								radius={[4, 4, 0, 0]}
								barSize={20}
							/>
						</BarChart>
					</ResponsiveContainer>
				</div>
			</div>

			{/* Table */}
			<div className="bg-white p-5 lg:p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col flex-1 min-h-100">
				<div className="flex items-center justify-between mb-4">
					<h3 className="text-[15px] font-bold text-slate-900">Danh sách hóa đơn</h3>
				</div>

				<div className="overflow-x-auto flex-1 border border-slate-200 rounded-lg">
					<table className="w-full text-left">
						<thead className="bg-[#f8f9fa] border-b border-slate-200">
							<tr>
								{[
									"Mã hóa đơn",
									"Khách hàng",
									"Toà nhà/Phòng",
									"Số tiền (VNĐ)",
									"Trạng thái",
									"Ngày tạo",
									"",
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
						<tbody className="divide-y divide-slate-100">
							{[
								{
									id: "INV-2604-001",
									cust: "Nguyễn Văn A",
									room: "Central - 101",
									amt: "5,500,000",
									status: "Đã thanh toán",
									date: "01/04/2026",
								},
								{
									id: "INV-2604-002",
									cust: "Trần Thị B",
									room: "Sunrise - 305",
									amt: "7,200,000",
									status: "Chờ thanh toán",
									date: "02/04/2026",
								},
								{
									id: "INV-2604-003",
									cust: "Lê Hoàng C",
									room: "Biệt thự B - 02",
									amt: "15,000,000",
									status: "Quá hạn",
									date: "25/03/2026",
								},
							].map((row, idx) => (
								<tr
									key={idx}
									className="hover:bg-slate-50"
								>
									<td className="px-4 py-3 text-[13px] font-bold text-slate-900">{row.id}</td>
									<td className="px-4 py-3 text-[13px] text-slate-700">{row.cust}</td>
									<td className="px-4 py-3 text-[13px] text-slate-600">{row.room}</td>
									<td className="px-4 py-3 text-[13px] font-bold text-slate-900">{row.amt}</td>
									<td className="px-4 py-3">
										<span
											className={`inline-flex px-2 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider border ${
												row.status === "Đã thanh toán" ?
													"bg-emerald-50 text-emerald-700 border-emerald-200"
												: row.status === "Quá hạn" ? "bg-rose-50 text-rose-700 border-rose-200"
												: "bg-amber-50 text-amber-700 border-amber-200"
											}`}
										>
											{row.status}
										</span>
									</td>
									<td className="px-4 py-3 text-[13px] text-slate-500">{row.date}</td>
									<td className="px-4 py-3 text-right">
										<button className="p-1 hover:bg-slate-200 rounded text-slate-400">
											<MoreHorizontal className="w-4 h-4" />
										</button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
};

const CashFlowTab = () => {
	const STATS = [
		{ label: "Số dư tiền mặt", value: "245,000,000", color: "text-blue-600", bg: "bg-blue-50" },
		{
			label: "Tổng tiền vào",
			value: "850,000,000",
			color: "text-emerald-600",
			bg: "bg-emerald-50",
		},
		{ label: "Tổng tiền ra", value: "-605,000,000", color: "text-rose-600", bg: "bg-rose-50" },
		{ label: "Tiền cọc còn lại", value: "120,000,000", color: "text-amber-600", bg: "bg-amber-50" },
	];

	const DAILY_FLOW = Array.from({ length: 10 }).map((_, i) => ({
		name: `0${i + 1}/04`,
		in: Math.floor(Math.random() * 50) + 10,
		out: Math.floor(Math.random() * 30) + 5,
	}));

	return (
		<div className="flex flex-col gap-6">
			{/* Quick Stats */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-4 shrink-0">
				{STATS.map((stat, i) => (
					<div
						key={i}
						className="bg-white px-5 py-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center gap-1.5 min-h-22.5"
					>
						<span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
							{stat.label}
						</span>
						<span className={`text-xl font-black ${stat.color} mt-0.5`}>{stat.value}</span>
					</div>
				))}
			</div>

			{/* Chart */}
			<div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-100 shrink-0">
				<div className="p-5 border-b border-slate-100 flex items-center justify-between">
					<h3 className="text-[14px] font-bold text-slate-800">
						Biểu đồ dòng tiền (In/Out) - Triệu VNĐ
					</h3>
				</div>
				<div className="flex-1 p-5">
					<ResponsiveContainer
						width="100%"
						height="100%"
					>
						<LineChart
							data={DAILY_FLOW}
							margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
						>
							<CartesianGrid
								strokeDasharray="3 3"
								vertical={false}
								stroke="#e2e8f0"
							/>
							<XAxis
								dataKey="name"
								axisLine={false}
								tickLine={false}
								tick={{ fontSize: 12, fill: "#64748b" }}
								dy={10}
							/>
							<YAxis
								axisLine={false}
								tickLine={false}
								tick={{ fontSize: 12, fill: "#64748b" }}
							/>
							<Tooltip
								cursor={{ stroke: "#cbd5e1", strokeWidth: 1, strokeDasharray: "4 4" }}
								contentStyle={{ borderRadius: "8px", border: "none" }}
							/>
							<Legend
								iconType="circle"
								wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }}
							/>
							<Line
								type="monotone"
								dataKey="in"
								name="Tiền vào (In)"
								stroke="#10b981"
								strokeWidth={3}
								dot={{ r: 4, fill: "#10b981" }}
								activeDot={{ r: 6 }}
							/>
							<Line
								type="monotone"
								dataKey="out"
								name="Tiền ra (Out)"
								stroke="#ef4444"
								strokeWidth={3}
								dot={{ r: 4, fill: "#ef4444" }}
								activeDot={{ r: 6 }}
							/>
						</LineChart>
					</ResponsiveContainer>
				</div>
			</div>

			{/* Table */}
			<div className="bg-white p-5 lg:p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col flex-1 min-h-100">
				<div className="flex items-center justify-between mb-4">
					<h3 className="text-[15px] font-bold text-slate-900">Chi tiết giao dịch</h3>
				</div>

				<div className="overflow-x-auto flex-1 border border-slate-200 rounded-lg">
					<table className="w-full text-left">
						<thead className="bg-[#f8f9fa] border-b border-slate-200">
							<tr>
								{[
									"Tòa nhà",
									"Phòng",
									"Dòng tiền",
									"Nhóm giao dịch",
									"Loại",
									"Số tiền (VNĐ)",
									"Ngày",
									"Hình thức",
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
						<tbody className="divide-y divide-slate-100">
							{[
								{
									build: "Central",
									room: "101",
									flow: "IN",
									group: "Thu tiền khách",
									type: "Tiền phòng",
									amt: "5,500,000",
									date: "01/04",
									method: "Chuyển khoản",
								},
								{
									build: "Sunrise",
									room: "305",
									flow: "IN",
									group: "Thu tiền khách",
									type: "Dịch vụ",
									amt: "1,200,000",
									date: "02/04",
									method: "Tiền mặt",
								},
								{
									build: "Central",
									room: "Chung",
									flow: "OUT",
									group: "Chi phí",
									type: "Bảo trì",
									amt: "-2,500,000",
									date: "03/04",
									method: "Chuyển khoản",
								},
							].map((row, idx) => (
								<tr
									key={idx}
									className="hover:bg-slate-50"
								>
									<td className="px-4 py-3 text-[13px] font-bold text-slate-900">{row.build}</td>
									<td className="px-4 py-3 text-[13px] text-slate-600">{row.room}</td>
									<td className="px-4 py-3">
										<span
											className={`inline-flex px-2 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider border opacity-90 ${row.flow === "IN" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-rose-50 text-rose-700 border-rose-200"}`}
										>
											{row.flow}
										</span>
									</td>
									<td className="px-4 py-3 text-[13px] text-slate-700">{row.group}</td>
									<td className="px-4 py-3 text-[13px] text-slate-500">{row.type}</td>
									<td
										className={`px-4 py-3 text-[13px] font-bold ${row.flow === "IN" ? "text-emerald-600" : "text-rose-600"}`}
									>
										{row.amt}
									</td>
									<td className="px-4 py-3 text-[13px] text-slate-500">{row.date}</td>
									<td className="px-4 py-3 text-[13px] text-slate-600">{row.method}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
};

export default RevenueReportPage;

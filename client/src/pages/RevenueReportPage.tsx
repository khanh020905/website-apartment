/* eslint-disable react-hooks/purity */
import { useState } from "react";
import { Download, RefreshCw, Maximize2, MoreHorizontal, ChevronDown, Filter, HelpCircle, Trash2, Settings, Search } from "lucide-react";
import {
	BarChart,
	Bar,
	LineChart,
	Line,
	AreaChart,
	Area,
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
			case "service": return <ServiceRevenueTab />;
			case "rental": return <RentalRevenueTab />;
			case "invoices": return <InvoicesTab />;
			case "cashflow": return <CashFlowTab />;
			default: return null;
		}
	};

	return (
		<div className="flex-1 flex flex-col h-full bg-[#f8f9fa] relative overflow-hidden font-['Plus_Jakarta_Sans',sans-serif]">
			{/* Shared Header */}
			<div className="bg-white border-b border-slate-200">
				<div className="px-6 py-4 flex items-center justify-between">
					<h1 className="text-[18px] font-black text-slate-900 tracking-tight">Báo cáo doanh thu</h1>
					<div className="flex items-center gap-3">
						{(activeTab === 'service' || activeTab === 'rental') ? (
							<div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[13px] font-bold text-slate-600 cursor-pointer">
								2026 <ChevronDown className="w-4 h-4 opacity-50" />
							</div>
						) : (
							<div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[13px] font-bold text-slate-600 cursor-pointer">
								01/04/2026 - 30/04/2026 <ChevronDown className="w-4 h-4 opacity-50" />
							</div>
						)}
					</div>
				</div>
				<div className="px-6 flex items-center justify-between border-t border-slate-100 pt-3 shadow-sm">
					<div className="flex gap-8 overflow-x-auto scrollbar-hide">
						{TABS.map((tab) => (
							<button
								key={tab.id}
								onClick={() => setActiveTab(tab.id)}
								className={`text-[15px] font-black pb-3 border-b-2 whitespace-nowrap transition-colors outline-none px-1 ${
									activeTab === tab.id ?
										"text-amber-600 border-amber-500"
									:	"text-slate-400 border-transparent hover:text-slate-700 hover:border-slate-200"
								}`}
							>
								{tab.label}
							</button>
						))}
					</div>
					<div className="flex items-center gap-4 pb-3">
						<div className="flex items-center gap-2 text-[12px] font-bold text-slate-400 italic">
							Cập nhật lần cuối lúc: 07/04/2026 17:00
							<RefreshCw className="w-3.5 h-3.5 cursor-pointer hover:rotate-180 transition-transform duration-500" />
						</div>
						<div className="w-48 relative group">
							<Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
							<select className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[13px] font-bold text-slate-600 outline-none focus:border-amber-400 appearance-none">
								<option>Chọn tòa nhà</option>
							</select>
						</div>
					</div>
				</div>
			</div>

			{/* Main Content */}
			<div className="flex-1 overflow-auto bg-[#f8f9fa] p-5 lg:p-6">
				{renderTabContent()}
			</div>
		</div>
	);
};

/* --- TAB 1: Revenue by Service --- */
const ServiceRevenueTab = () => {
	const STATS = [
		{ label: "Tiền phòng", value: "850,000,000", color: "text-blue-600" },
		{ label: "Dịch vụ bổ sung", value: "125,500,000", color: "text-amber-600" },
		{ label: "Tiện ích", value: "210,000,000", color: "text-emerald-600" },
		{ label: "Doanh thu khác", value: "15,000,000", color: "text-slate-600" },
	];

	return (
		<div className="flex flex-col gap-6">
			<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
				{STATS.map((stat, i) => (
					<div key={i} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-1.5">
						<span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">{stat.label}</span>
						<span className={`text-xl font-black ${stat.color}`}>₫ {stat.value}</span>
					</div>
				))}
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-100">
				<div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-full overflow-hidden">
					<div className="p-4 border-b border-slate-100 flex items-center justify-between">
						<h3 className="text-[14px] font-bold text-slate-800">Doanh thu theo dịch vụ (Triệu VNĐ)</h3>
					</div>
					<div className="flex-1 p-5">
						<ResponsiveContainer width="100%" height="100%">
							<BarChart data={MOCK_MONTHLY} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
								<CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
								<XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748b" }} />
								<YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748b" }} />
								<Tooltip cursor={{ fill: "#f1f5f9" }} />
								<Legend iconType="circle" wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
								<Bar dataKey="room" name="Tiền phòng" stackId="a" fill="#3b82f6" barSize={30} />
								<Bar dataKey="utility" name="Tiện ích" stackId="a" fill="#10b981" />
								<Bar dataKey="service" name="Dịch vụ bổ sung" stackId="a" fill="#f59e0b" radius={[4, 4, 0, 0]} />
							</BarChart>
						</ResponsiveContainer>
					</div>
				</div>

				<div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-full overflow-hidden">
					<div className="p-4 border-b border-slate-100"><h3 className="text-[14px] font-bold text-slate-800">Tỷ lệ theo dịch vụ</h3></div>
					<div className="flex-1 p-5">
						<ResponsiveContainer width="100%" height="100%">
							<PieChart>
								<Pie data={PIE_DATA} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
									{PIE_DATA.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />)}
								</Pie>
								<Tooltip />
								<Legend iconType="circle" wrapperStyle={{ fontSize: "12px" }} />
							</PieChart>
						</ResponsiveContainer>
					</div>
				</div>
			</div>

			<div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
				<div className="p-4 border-b border-slate-100 flex items-center justify-between">
					<h3 className="text-[15px] font-bold text-slate-900">Chi tiết</h3>
					<button className="flex items-center gap-1.5 px-4 h-9 border border-slate-200 text-emerald-600 rounded-lg text-[13px] font-bold hover:bg-emerald-50 transition-all shadow-sm">
						<Download className="w-4 h-4" /> Xuất Excel
					</button>
				</div>
				<div className="overflow-x-auto">
					<table className="w-full text-left">
						<thead>
							<tr className="bg-[#EDEDED]">
								<th className="px-4 py-3 text-[11px] font-black uppercase text-slate-700 tracking-wider">Nhóm dịch vụ</th>
								{Array.from({ length: 12 }).map((_, i) => <th key={i} className="px-4 py-3 text-[11px] font-black uppercase text-slate-700 text-right">T{i+1}</th>)}
								<th className="px-4 py-3 text-[11px] font-black uppercase text-slate-700 text-right bg-amber-50/50">Tổng cộng</th>
								<th className="px-4 py-3 text-[11px] font-black uppercase text-slate-700 text-right">% Tổng</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-slate-100">
							{["Tiền phòng", "Tiện ích (Điện, Nước)", "Dịch vụ bổ sung", "Khác"].map((s, idx) => (
								<tr key={idx} className="hover:bg-slate-50">
									<td className="px-4 py-3 text-[13px] font-bold text-slate-900">{s}</td>
									{Array.from({ length: 12 }).map((_, i) => <td key={i} className="px-4 py-3 text-[12px] text-slate-600 text-right font-medium">0</td>)}
									<td className="px-4 py-3 text-[13px] font-bold text-slate-900 text-right bg-amber-50/20">0</td>
									<td className="px-4 py-3 text-[12px] font-bold text-slate-600 text-right">0%</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
};

/* --- TAB 2: Revenues Report --- */
const RentalRevenueTab = () => {
	const chartData = MOCK_MONTHLY.map(m => ({ ...m, total: m.total / 10 }));

	return (
		<div className="flex flex-col gap-6">
			<div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-100 overflow-hidden">
				<div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white">
					<h3 className="text-[14px] font-bold text-slate-800">Tổng doanh thu theo tháng (Triệu VNĐ)</h3>
					<div className="flex items-center gap-2 border border-slate-200 rounded-lg overflow-hidden h-9">
						<button className="p-2 hover:bg-slate-50 text-slate-400 border-r border-slate-100"><Maximize2 className="w-4 h-4" /></button>
						<button className="p-2 hover:bg-slate-50 text-slate-400 border-r border-slate-100"><RefreshCw className="w-4 h-4" /></button>
						<button className="p-2 hover:bg-slate-50 text-slate-400"><Download className="w-4 h-4" /></button>
					</div>
				</div>
				<div className="flex-1 p-5">
					<ResponsiveContainer width="100%" height="100%">
						<AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
							<defs>
								<linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
									<stop offset="5%" stopColor="#f59e0b" stopOpacity={0.1}/>
									<stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
								</linearGradient>
							</defs>
							<CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
							<XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748b" }} />
							<YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748b" }} />
							<Tooltip />
							<Area type="monotone" dataKey="total" name="Tổng doanh thu" stroke="#f59e0b" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
						</AreaChart>
					</ResponsiveContainer>
				</div>
			</div>

			<div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
				<div className="p-4 border-b border-slate-100 flex items-center justify-between">
					<h3 className="text-[15px] font-bold text-slate-900">Tổng doanh thu theo tòa nhà (Triệu VNĐ)</h3>
					<button className="flex items-center gap-1.5 px-4 h-9 border border-slate-200 text-emerald-600 rounded-lg text-[13px] font-bold hover:bg-emerald-50 shadow-sm transition-all">
						<Download className="w-4 h-4" /> Xuất Excel
					</button>
				</div>
				<div className="overflow-x-auto">
					<table className="w-full text-left">
						<thead>
							<tr className="bg-[#EDEDED]">
								<th className="px-4 py-3 text-[11px] font-black uppercase text-slate-700 tracking-wider">Toà nhà</th>
								{Array.from({ length: 12 }).map((_, i) => <th key={i} className="px-4 py-3 text-[11px] font-black uppercase text-slate-700 text-right">T{i+1}</th>)}
								<th className="px-4 py-3 text-[11px] font-black uppercase text-slate-700 text-right bg-amber-50/50">Tổng</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-slate-100 text-slate-600 text-[12px] font-medium">
							{["Toà nhà Central", "Khu biệt thự Nam", "Sunrise Apartment"].map((s, idx) => (
								<tr key={idx} className="hover:bg-slate-50">
									<td className="px-4 py-3 text-[13px] font-bold text-slate-900 border-r border-slate-50">{s}</td>
									{Array.from({ length: 12 }).map((_, i) => <td key={i} className="px-4 py-3 text-right">0</td>)}
									<td className="px-4 py-3 text-right font-bold text-slate-900 bg-amber-50/20">0</td>
								</tr>
							))}
							<tr className="bg-slate-50 text-slate-900 font-bold border-t-2 border-slate-100">
								<td className="px-4 py-4 text-[13px]">TỔNG</td>
								{Array.from({ length: 12 }).map((_, i) => <td key={i} className="px-4 py-4 text-right">0</td>)}
								<td className="px-4 py-4 text-right bg-amber-100/30">0</td>
							</tr>
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
};

/* --- TAB 3: Invoice Report --- */
const InvoicesTab = () => {
	const STATS = [
		{ label: "Tổng tiền", value: "0", color: "text-slate-700", desc: "Tổng tiền hoá đơn" },
		{ label: "Đã trả", value: "0", color: "text-emerald-500", desc: "Tổng tiền đã trả" },
		{ label: "Chưa trả", value: "0", color: "text-amber-500", desc: "Tổng tiền chưa trả" },
		{ label: "Quá hạn", value: "0", color: "text-rose-500", desc: "Tổng tiền quá hạn", count: "0/0" }
	];

	return (
		<div className="flex flex-col gap-6">
			<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
				{STATS.map((stat, i) => (
					<div key={i} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-1">
						<div className="flex items-center justify-between">
							<span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">{stat.label}</span>
							{stat.count && <span className="text-[11px] font-bold text-rose-500">{stat.count}</span>}
						</div>
						<span className={`text-[17px] font-black ${stat.color}`}>₫ {stat.value}</span>
						<span className="text-[11px] font-medium text-slate-400">{stat.desc}</span>
					</div>
				))}
			</div>

			<div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden flex-1 min-h-[400px]">
				<div className="p-4 border-b border-slate-100 flex items-center justify-between">
					<h3 className="text-[15px] font-bold text-slate-900">Chi tiết hóa đơn</h3>
					<div className="flex items-center gap-3">
						<button className="flex items-center gap-2 px-4 h-9 border border-slate-200 text-emerald-600 rounded-lg text-[13px] font-bold hover:bg-emerald-50 shadow-sm transition-all">
							<Download className="w-4 h-4" /> Xuất Excel
						</button>
						<button className="p-2 border border-slate-200 rounded-lg text-slate-400 hover:bg-slate-50 transition-colors">
							<Settings className="w-4 h-4" />
						</button>
					</div>
				</div>
				<div className="overflow-x-auto flex-1">
					<table className="w-full text-left">
						<thead>
							<tr className="bg-[#EDEDED]">
								{["Thời gian", "Số lượng hóa đơn", "Tổng tiền (₫)", "Đã trả (₫)", "Chưa trả (₫)", "Quá hạn (₫)"].map((h, i) => (
									<th key={i} className="px-4 py-3 text-[11px] font-black uppercase text-slate-700 tracking-wider">
										{h}
									</th>
								))}
							</tr>
						</thead>
						<tbody>
							<tr>
								<td colSpan={6} className="px-4 py-20 text-center">
									<div className="flex flex-col items-center gap-2">
										<div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 text-3xl">📥</div>
										<p className="text-[13px] font-medium text-slate-400">Không có dữ liệu hiển thị</p>
									</div>
								</td>
							</tr>
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
};

/* --- TAB 4: Cash Flow --- */
const CashFlowTab = () => {
	const DAILY_FLOW_EMPTY = Array.from({ length: 7 }).map((_, i) => ({ name: `0${i+1}/04`, in: 0, out: 0 }));

	return (
		<div className="flex flex-col gap-6">
			{/* Summary Cards */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
				<div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
					<div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-xl">🏦</div>
					<div className="flex flex-col">
						<span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Số dư tiền mặt</span>
						<span className="text-[18px] font-black text-emerald-600">₫ 0</span>
					</div>
				</div>

				<div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-3">
					<div className="flex items-center gap-3">
						<div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-sm">📥</div>
						<div className="flex flex-col"><span className="text-[10px] font-bold text-slate-400 uppercase">Tổng tiền vào</span><span className="text-[14px] font-bold text-blue-600">₫ 0</span></div>
					</div>
					<div className="flex items-center gap-3 border-t border-slate-50 pt-2">
						<div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center text-sm">📤</div>
						<div className="flex flex-col"><span className="text-[10px] font-bold text-slate-400 uppercase">Tổng tiền ra</span><span className="text-[14px] font-bold text-orange-600">₫ 0</span></div>
					</div>
				</div>

				<div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
					<div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-xl">💰</div>
					<div className="flex flex-col flex-1">
						<div className="flex items-center gap-1.5"><span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Tiền cọc còn lại</span><HelpCircle className="w-3.5 h-3.5 text-slate-300" /></div>
						<span className="text-[18px] font-black text-slate-700">₫ 0</span>
					</div>
				</div>

				<div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-3">
					<div className="flex items-center gap-3">
						<div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-sm opacity-60">💰</div>
						<div className="flex flex-col"><span className="text-[10px] font-bold text-slate-400 uppercase whitespace-nowrap">Tổng tiền cọc ghi nhận</span><span className="text-[14px] font-bold text-slate-600">₫ 0</span></div>
					</div>
					<div className="flex items-center gap-3 border-t border-slate-50 pt-2">
						<div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-sm opacity-60">↩️</div>
						<div className="flex flex-col"><span className="text-[10px] font-bold text-slate-400 uppercase whitespace-nowrap">Tổng tiền cọc đã hoàn</span><span className="text-[14px] font-bold text-slate-600">₫ 0</span></div>
					</div>
				</div>
			</div>

			{/* Chart */}
			<div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
				<div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white">
					<div className="flex items-center gap-4">
						<h3 className="text-[14px] font-bold text-slate-800">Biểu đồ dòng tiền</h3>
						<div className="flex items-center gap-4 text-[12px] font-medium">
							<div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#1890ff]"></div> Tiền vào</div>
							<div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#fa8c16]"></div> Tiền ra</div>
						</div>
					</div>
					<div className="flex items-center gap-3">
						<select className="h-9 px-3 border border-slate-200 rounded-lg text-[13px] font-medium text-slate-600 outline-none min-w-40 appearance-none bg-white">
							<option>Tất cả loại giao dịch</option>
						</select>
						<div className="flex items-center border border-slate-200 rounded-lg overflow-hidden h-9">
							<button className="p-2 hover:bg-slate-50 text-slate-400 border-r border-slate-100"><Trash2 className="w-4 h-4" /></button>
							<button className="p-2 hover:bg-slate-50 text-slate-400 border-r border-slate-100"><Maximize2 className="w-4 h-4" /></button>
							<button className="p-2 hover:bg-slate-50 text-slate-400 border-r border-slate-100"><RefreshCw className="w-4 h-4" /></button>
							<button className="p-2 hover:bg-slate-50 text-slate-400"><Download className="w-4 h-4" /></button>
						</div>
					</div>
				</div>
				<div className="h-80 p-6">
					<ResponsiveContainer width="100%" height="100%">
						<LineChart data={DAILY_FLOW_EMPTY} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
							<CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
							<XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#8c8c8c'}} dy={10} />
							<YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#8c8c8c'}} />
							<Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
							<Line type="monotone" dataKey="in" name="Tiền vào" stroke="#1890ff" strokeWidth={3} dot={{ r: 4, fill: "#1890ff", strokeWidth: 2, stroke: "#fff" }} activeDot={{ r: 6 }} />
							<Line type="monotone" dataKey="out" name="Tiền ra" stroke="#fa8c16" strokeWidth={3} dot={{ r: 4, fill: "#fa8c16", strokeWidth: 2, stroke: "#fff" }} activeDot={{ r: 6 }} />
						</LineChart>
					</ResponsiveContainer>
				</div>
			</div>

			{/* Detailed Table */}
			<div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col flex-1 overflow-hidden">
				<div className="p-4 border-b border-slate-100 flex items-center justify-between">
					<div className="flex items-center gap-2">
						<h3 className="text-[15px] font-bold text-slate-900">Chi tiết</h3>
						<span className="text-[13px] font-bold text-emerald-600">(Tổng cộng: ± ₫ 0)</span>
					</div>
					<div className="flex items-center gap-3">
						<div className="relative">
							<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
							<input type="text" placeholder="Tìm kiếm..." className="pl-10 pr-4 h-9 border border-slate-200 rounded-lg text-[13px] outline-none focus:border-amber-400 w-64" />
						</div>
						<button className="flex items-center gap-2 px-4 h-9 bg-emerald-500 text-white rounded-lg text-[13px] font-bold hover:bg-emerald-600 shadow-sm">
							<Download className="w-4 h-4" /> Xuất Excel
						</button>
						<button className="p-2 border border-slate-200 rounded-lg text-slate-400 hover:bg-slate-50 transition-colors"><Settings className="w-4 h-4" /></button>
					</div>
				</div>
				<div className="overflow-x-auto">
					<table className="w-full text-left">
						<thead>
							<tr className="bg-[#EDEDED]">
								{["Toà nhà", "Phòng", "Dòng tiền", "Nhóm GD", "Loại GD", "Số tiền (₫)", "Ngày GD", "Hình thức", "Khách hàng", "Mã GD", "Mã đặt phòng"].map((h, i) => (
									<th key={i} className="px-4 py-3 text-[11px] font-black uppercase text-slate-700 whitespace-nowrap border-r border-white last:border-0">{h}</th>
								))}
							</tr>
						</thead>
						<tbody>
							<tr><td colSpan={11} className="px-4 py-20 text-center"><p className="text-[13px] text-slate-400">Không có dữ liệu</p></td></tr>
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
};

export default RevenueReportPage;

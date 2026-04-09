/* eslint-disable react-hooks/purity */
import { useState, useEffect } from "react";
import { RefreshCw, ChevronDown, Filter } from "lucide-react";
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
import { api } from "../lib/api";

const TABS = [
	{ id: "service", label: "Doanh thu theo dịch vụ" },
	{ id: "rental", label: "Doanh thu cho thuê" },
	{ id: "invoices", label: "Hóa đơn" },
	{ id: "cashflow", label: "Dòng tiền" },
];

export default function RevenueReportPage() {
	const [activeTab, setActiveTab] = useState("service");
	const [loading, setLoading] = useState(true);
	
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const [reportData, setReportData] = useState<any>(null);

	const fetchReports = async () => {
		setLoading(true);
		try {
			const { data } = await api.get<{ monthly: any[], pie: any[], stats: any }>("/api/reports/revenue");
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

	const renderTabContent = () => {
		if (loading) {
			return (
				<div className="flex h-full items-center justify-center">
					<div className="flex flex-col items-center gap-3">
						<div className="w-8 h-8 border-4 border-amber-200 border-t-amber-500 rounded-full animate-spin" />
						<p className="text-sm font-medium text-slate-500">Đang tải biểu đồ...</p>
					</div>
				</div>
			);
		}
		
		if (!reportData) return null;

		switch (activeTab) {
			case "service": return <ServiceRevenueTab data={reportData} />;
			case "rental": return <RentalRevenueTab data={reportData} />;
			case "invoices": return <InvoicesTab data={reportData} />;
			case "cashflow": return <CashFlowTab data={reportData} />;
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
										"text-brand-dark border-amber-500"
									:	"text-slate-400 border-transparent hover:text-slate-700 hover:border-slate-200"
								}`}
							>
								{tab.label}
							</button>
						))}
					</div>
					<div className="flex items-center gap-4 pb-3">
						<div className="flex items-center gap-2 text-[12px] font-bold text-slate-400 italic">
							Cập nhật lần cuối lúc: {new Date().toLocaleTimeString("vi-VN").slice(0, 5)}
							<button onClick={fetchReports} className="cursor-pointer border-0 bg-transparent p-1"><RefreshCw className={`w-3.5 h-3.5 hover:rotate-180 transition-transform duration-500 text-brand-primary`} /></button>
						</div>
						<div className="w-48 relative group">
							<Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
							<select className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[13px] font-bold text-slate-600 outline-none focus:border-brand-primary appearance-none">
								<option>Tất cả tòa nhà</option>
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
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ServiceRevenueTab = ({ data }: { data: any }) => {
	const numFormat = new Intl.NumberFormat("vi-VN", { notation: "compact" });
	const fullFormat = new Intl.NumberFormat("vi-VN");

	const STATS = [
		{ label: "Tiền phòng", value: fullFormat.format(data.stats?.room || 0), color: "text-blue-600" },
		{ label: "Dịch vụ bổ sung", value: fullFormat.format(data.stats?.service || 0), color: "text-brand-dark" },
		{ label: "Tiện ích", value: fullFormat.format(data.stats?.utility || 0), color: "text-emerald-600" },
		{ label: "Doanh thu khác", value: fullFormat.format(data.stats?.other || 0), color: "text-slate-600" },
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
						<h3 className="text-[14px] font-bold text-slate-800">Doanh thu theo tháng</h3>
					</div>
					<div className="flex-1 p-5">
						<ResponsiveContainer width="100%" height="100%">
							<BarChart data={data.monthly} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
								<CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
								<XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748b" }} />
								<YAxis tickFormatter={(val) => numFormat.format(val)} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748b" }} />
								<Tooltip formatter={(value: any) => [`${fullFormat.format(value)} ₫`, ""]} cursor={{ fill: "#f1f5f9" }} />
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
								<Pie data={data.pie} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
									{data.pie.map((entry: any, index: number) => <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />)}
								</Pie>
								<Tooltip formatter={(value: any) => `${fullFormat.format(value)} ₫`} />
								<Legend iconType="circle" wrapperStyle={{ fontSize: "12px" }} />
							</PieChart>
						</ResponsiveContainer>
					</div>
				</div>
			</div>

			<div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
				<div className="p-4 border-b border-slate-100 flex items-center justify-between">
					<h3 className="text-[15px] font-bold text-slate-900">Chi tiết</h3>
				</div>
				<div className="overflow-x-auto">
					<table className="w-full text-left">
						<thead>
							<tr className="bg-[#EDEDED]">
								<th className="px-4 py-3 text-[11px] font-black uppercase text-slate-700 tracking-wider">Nhóm dịch vụ</th>
								{Array.from({ length: 12 }).map((_, i) => <th key={i} className="px-4 py-3 text-[11px] font-black uppercase text-slate-700 text-right">T{i+1}</th>)}
								<th className="px-4 py-3 text-[11px] font-black uppercase text-slate-700 text-right bg-brand-bg/50">Tổng cộng</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-slate-100">
							{["room", "utility", "service"].map((key, idx) => {
								const labels: Record<string, string> = { room: "Tiền phòng", utility: "Tiện ích (Điện, Nước)", service: "Dịch vụ" };
								const totalRow = data.monthly.reduce((sum: number, m: any) => sum + m[key], 0);

								return (
									<tr key={idx} className="hover:bg-slate-50">
										<td className="px-4 py-3 text-[13px] font-bold text-slate-900">{labels[key]}</td>
										{data.monthly.map((m: any, i: number) => <td key={i} className="px-4 py-3 text-[12px] text-slate-600 text-right font-medium">{numFormat.format(m[key])}</td>)}
										<td className="px-4 py-3 text-[13px] font-bold text-slate-900 text-right bg-brand-bg/20">{fullFormat.format(totalRow)}</td>
									</tr>
								)
							})}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
};

/* --- TAB 2: Revenues Report --- */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const RentalRevenueTab = ({ data }: { data: any }) => {
	const numFormat = new Intl.NumberFormat("vi-VN", { notation: "compact" });
	const fullFormat = new Intl.NumberFormat("vi-VN");

	return (
		<div className="flex flex-col gap-6">
			<div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-100 overflow-hidden">
				<div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white">
					<h3 className="text-[14px] font-bold text-slate-800">Tổng doanh thu theo tháng</h3>
				</div>
				<div className="flex-1 p-5">
					<ResponsiveContainer width="100%" height="100%">
						<AreaChart data={data.monthly} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
							<defs>
								<linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
									<stop offset="5%" stopColor="#f59e0b" stopOpacity={0.1}/>
									<stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
								</linearGradient>
							</defs>
							<CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
							<XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748b" }} />
							<YAxis tickFormatter={(val) => numFormat.format(val)} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748b" }} />
							<Tooltip formatter={(val: any) => [`${fullFormat.format(val)} ₫`, "Doanh thu"]} />
							<Area type="monotone" dataKey="total" name="Tổng doanh thu" stroke="#f59e0b" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
						</AreaChart>
					</ResponsiveContainer>
				</div>
			</div>
		</div>
	);
};

/* --- TAB 3: Invoice Report --- */
const InvoicesTab = ({ data }: { data: any }) => {
	const numFormat = new Intl.NumberFormat("vi-VN");
	const stats = data.invoiceStats || {};

	const STATS = [
		{ label: "Tổng tiền", value: numFormat.format(stats.total || 0), color: "text-slate-700", desc: "Tổng tiền hoá đơn" },
		{ label: "Đã trả", value: numFormat.format(stats.paid || 0), color: "text-emerald-500", desc: "Tổng tiền đã trả" },
		{ label: "Chưa trả", value: numFormat.format(stats.pending || 0), color: "text-brand-primary", desc: "Tổng tiền chưa trả" },
		{ label: "Quá hạn", value: numFormat.format(stats.overdue || 0), color: "text-rose-500", desc: "Tổng tiền quá hạn", count: `${stats.overdueCount || 0}/${stats.totalCount || 0}` }
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
										<p className="text-[13px] font-medium text-slate-400">Không có dữ liệu trong kỳ báo cáo</p>
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
const CashFlowTab = ({ data }: { data: any }) => {
	const numFormat = new Intl.NumberFormat("vi-VN");
	const flow = data.cashflow || {};
	const dailyFlow = flow.daily || Array.from({ length: 7 }).map((_, i) => ({ name: `0${i+1}/04`, in: 0, out: 0 }));

	return (
		<div className="flex flex-col gap-6">
			{/* Summary Cards */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
				<div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
					<div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-xl">🏦</div>
					<div className="flex flex-col">
						<span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Số dư tiền mặt</span>
						<span className="text-[18px] font-black text-emerald-600">₫ {numFormat.format(flow.balance || 0)}</span>
					</div>
				</div>

				<div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-3">
					<div className="flex items-center gap-3">
						<div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-sm">📥</div>
						<div className="flex flex-col"><span className="text-[10px] font-bold text-slate-400 uppercase">Tổng tiền vào</span><span className="text-[14px] font-bold text-blue-600">₫ {numFormat.format(flow.in || 0)}</span></div>
					</div>
					<div className="flex items-center gap-3 border-t border-slate-50 pt-2">
						<div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center text-sm">📤</div>
						<div className="flex flex-col"><span className="text-[10px] font-bold text-slate-400 uppercase">Tổng tiền ra</span><span className="text-[14px] font-bold text-orange-600">₫ {numFormat.format(flow.out || 0)}</span></div>
					</div>
				</div>
			</div>

			{/* Chart */}
			<div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
				<div className="p-4 border-b border-slate-100 flex items-center gap-4 bg-white">
					<h3 className="text-[14px] font-bold text-slate-800">Biểu đồ dòng tiền</h3>
					<div className="flex items-center gap-4 text-[12px] font-medium ml-auto">
						<div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#1890ff]"></div> Tiền vào</div>
						<div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#fa8c16]"></div> Tiền ra</div>
					</div>
				</div>
				<div className="h-80 p-6">
					<ResponsiveContainer width="100%" height="100%">
						<LineChart data={dailyFlow} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
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
		</div>
	);
};

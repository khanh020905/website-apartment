import { useState, useEffect } from "react";
import { RefreshCw, FileSpreadsheet, Plus, ArrowUpRight, ArrowDownRight, Wallet, Info, FileText, CheckCircle, Clock, AlertCircle } from "lucide-react";
import {
	CartesianGrid,
	BarChart,
	Bar,
	PieChart,
	Pie,
	Cell,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
	Legend,
	LineChart,
	Line,
	LabelList
} from "recharts";

// --- Tab 1 Data (Doanh thu dịch vụ) ---
const MOCK_SERVICES = [
	{ name: "Tiền phòng", value: 153605584, pct: 91.81, color: "#3b82f6" },
	{ name: "Dịch vụ bổ sung", value: 10120000, pct: 6.05, color: "#22c55e" },
	{ name: "Tiện ích", value: 3591000, pct: 2.15, color: "#f59e0b" },
	{ name: "Doanh thu khác", value: 0, pct: 0, color: "#cbd5e1" },
];

const MOCK_MONTHLY_REVENUE = [
	{ month: "Tháng 1", "Tiền phòng": 3000000, "Dịch vụ bổ sung": 0, "Tiện ích": 0, "Doanh thu khác": 0, total: 3000000 },
	{ month: "Tháng 2", "Tiền phòng": 3000000, "Dịch vụ bổ sung": 0, "Tiện ích": 0, "Doanh thu khác": 0, total: 3000000 },
	{ month: "Tháng 3", "Tiền phòng": 3000000, "Dịch vụ bổ sung": 0, "Tiện ích": 0, "Doanh thu khác": 0, total: 3000000 },
	{ month: "Tháng 4", "Tiền phòng": 11473323, "Dịch vụ bổ sung": 10120000, "Tiện ích": 3591000, "Doanh thu khác": 0, total: 25184323 },
	{ month: "Tháng 5", "Tiền phòng": 19400000, "Dịch vụ bổ sung": 0, "Tiện ích": 0, "Doanh thu khác": 0, total: 19400000 },
	{ month: "Tháng 6", "Tiền phòng": 19400000, "Dịch vụ bổ sung": 0, "Tiện ích": 0, "Doanh thu khác": 0, total: 19400000 },
	{ month: "Tháng 7", "Tiền phòng": 19400000, "Dịch vụ bổ sung": 0, "Tiện ích": 0, "Doanh thu khác": 0, total: 19400000 },
	{ month: "Tháng 8", "Tiền phòng": 19400000, "Dịch vụ bổ sung": 0, "Tiện ích": 0, "Doanh thu khác": 0, total: 19400000 },
	{ month: "Tháng 9", "Tiền phòng": 19400000, "Dịch vụ bổ sung": 0, "Tiện ích": 0, "Doanh thu khác": 0, total: 19400000 },
	{ month: "Tháng 10", "Tiền phòng": 16000000, "Dịch vụ bổ sung": 0, "Tiện ích": 0, "Doanh thu khác": 0, total: 16000000 },
	{ month: "Tháng 11", "Tiền phòng": 10000000, "Dịch vụ bổ sung": 0, "Tiện ích": 0, "Doanh thu khác": 0, total: 10000000 },
	{ month: "Tháng 12", "Tiền phòng": 9000000, "Dịch vụ bổ sung": 0, "Tiện ích": 0, "Doanh thu khác": 0, total: 9000000 },
];

const renderCustomizedLabel = (props: any) => {
	const { x, y, width, value } = props;
	if (value === 0) return null;
	const formatted = (value / 1000000).toFixed(0);
	return (
		<text x={x + width / 2} y={y - 10} fill="#64748b" fontSize={11} fontWeight={500} textAnchor="middle">
			{formatted}Tr
		</text>
	);
};

// --- Tab 2 Data (Doanh thu cho thuê) ---
const MOCK_RENTAL_BUILDINGS = [
	{ name: "Trà My", m1: 0, m2: 0, m3: 0, m4: 5166646, m5: 10000000, m6: 10000000, m7: 10000000, total: 77666641 },
	{ name: "Trương Quyền", m1: 0, m2: 0, m3: 0, m4: 3306677, m5: 6400000, m6: 6400000, m7: 6400000, total: 45938943 },
	{ name: "Trường Chinh", m1: 3000000, m2: 3000000, m3: 3000000, m4: 3000000, m5: 3000000, m6: 3000000, m7: 3000000, total: 30000000 },
	{ name: "Trần Văn Dư", m1: 0, m2: 0, m3: 0, m4: 0, m5: 0, m6: 0, m7: 0, total: 0 },
	{ name: "ttt", m1: 0, m2: 0, m3: 0, m4: 0, m5: 0, m6: 0, m7: 0, total: 0 },
	{ name: "vb", m1: 0, m2: 0, m3: 0, m4: 0, m5: 0, m6: 0, m7: 0, total: 0 },
];

// --- Tab 3 Data (Hóa đơn) ---
const MOCK_INVOICE_CHART = [
	{ date: "01/04", value: 209200000 },
	{ date: "02/04", value: 0 },
	{ date: "03/04", value: 0 },
	{ date: "04/04", value: 335750005 },
	{ date: "05/04", value: 0 },
	{ date: "06/04", value: 0 },
	{ date: "07/04", value: 0 },
	{ date: "08/04", value: 0 },
	{ date: "09/04", value: 0 },
	{ date: "10/04", value: 0 },
	{ date: "11/04", value: 0 },
	{ date: "12/04", value: 0 },
	{ date: "13/04", value: 0 },
	{ date: "14/04", value: 6200000 },
];
const MOCK_INVOICE_TABLE = [
	{ date: "01/04", count: 4, total: 209200000, paid: 0, unpaid: 209200000, overdue: 209200000 },
	{ date: "02/04", count: 0, total: 0, paid: 0, unpaid: 0, overdue: 0 },
	{ date: "03/04", count: 0, total: 0, paid: 0, unpaid: 0, overdue: 0 },
	{ date: "04/04", count: 4, total: 335750005, paid: 0, unpaid: 335750005, overdue: 335750005 },
	{ date: "05/04", count: 0, total: 0, paid: 0, unpaid: 0, overdue: 0 },
];


// --- Tab 4 Data (Dòng tiền) ---
const MOCK_CASHFLOW_CHART = Array.from({ length: 30 }, (_, i) => ({
	date: `${(i+1).toString().padStart(2, '0')}/04`,
	inFlow: 0,
	outFlow: 0
}));

const MOCK_CASHFLOW_TABLE = [
	{ building: "Trà My", room: "P104", typeBg: "bg-emerald-50", typeText: "text-emerald-600", type: "Dòng tiền vào", group: "Tiền thu khác từ hoạt động kinh doanh", category: "Đặt cọc", amount: 2500000, amountColor: "text-emerald-500", date: "16/04/2026, 12:15", paymentMethod: "Thanh toán bằng tiền mặt" },
	{ building: "Trà My", room: "P105", typeBg: "bg-emerald-50", typeText: "text-emerald-600", type: "Dòng tiền vào", group: "Tiền thu khác từ hoạt động kinh doanh", category: "Đặt cọc", amount: 2500000, amountColor: "text-emerald-500", date: "16/04/2026, 12:14", paymentMethod: "Thanh toán bằng tiền mặt" },
];


const RevenueReportPage = () => {
	const [loading, setLoading] = useState(true);
	const [activeTab, setActiveTab] = useState("Doanh thu theo dịch vụ");

	const TABS = ["Doanh thu theo dịch vụ", "Doanh thu cho thuê", "Hóa đơn", "Dòng tiền"];

	useEffect(() => {
		setLoading(true);
		const timer = setTimeout(() => setLoading(false), 400);
		return () => clearTimeout(timer);
	}, [activeTab]);

	const formatCurrency = (val: number) => `₫ ${val.toLocaleString()}`;

	return (
		<div className="flex-1 flex flex-col h-full bg-white relative overflow-hidden font-sans">
			{/* Header */}
			<div className="bg-white px-6 pt-5 pb-0 shrink-0 shadow-sm z-10 border-b border-slate-200">
				<h1 className="text-[20px] font-bold text-slate-800 tracking-tight mb-6">Doanh thu cho thuê</h1>
				
				<div className="flex items-end justify-between">
					<div className="flex gap-6 overflow-x-auto mb-[-1px]">
						{TABS.map((tab) => (
							<button 
								key={tab} 
								onClick={() => setActiveTab(tab)}
								className={`text-[14px] font-bold whitespace-nowrap border-b-[3px] pb-3 transition-all
									${activeTab === tab 
										? "text-slate-800 border-amber-400" 
										: "text-slate-500 border-transparent hover:text-slate-700"}`}
							>
								{tab}
							</button>
						))}
					</div>
					<div className="flex items-center gap-3 pb-3">
						<div className="flex bg-white border border-slate-300 rounded-lg overflow-hidden h-9">
							<span className="px-3 py-1.5 text-[13px] text-slate-600 flex items-center border-r border-slate-200 whitespace-nowrap">
								01/04/2026 ➔ 30/04/2026
							</span>
							<button className="px-2 hover:bg-slate-50 flex items-center justify-center transition-colors">
								<Clock className="w-4 h-4 text-slate-500" />
							</button>
						</div>
						<select className="px-3 py-1.5 border border-slate-300 rounded-lg text-[13px] text-slate-400 focus:outline-none transition-all font-medium appearance-none bg-transparent w-[160px] h-9">
							<option>Chọn toà nhà</option>
						</select>
					</div>
				</div>
			</div>

			{/* Main Content Area */}
			<div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 bg-[#f4f5f7]">
				{/* Timestamp */}
				<div className="text-[12px] text-slate-500 font-medium flex items-center gap-2 mb-2">
					Cập nhật lần cuối lúc: 17/04/2026 10:07
					<RefreshCw className={`w-3.5 h-3.5 cursor-pointer hover:text-slate-800 ${loading ? "animate-spin" : ""}`} />
				</div>

				{/* ======== TAB 1: DOANH THU THEO DỊCH VỤ ======== */}
				{activeTab === "Doanh thu theo dịch vụ" && (
					<div className={`flex flex-col gap-6 transition-opacity duration-300 ${loading ? 'opacity-50' : 'opacity-100'}`}>
						{/* KPI Row */}
						<div className="grid grid-cols-1 md:grid-cols-4 gap-4 shrink-0">
							<div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-col justify-between h-[100px]">
								<div className="flex items-center justify-between text-slate-500 text-[13px]">
									<span>Tiền phòng</span>
									<span className="text-[11px] font-bold bg-red-100 text-red-500 px-1.5 py-0.5 rounded flex items-center gap-0.5">
										↓ 50%
									</span>
								</div>
								<span className="text-[20px] font-bold text-slate-800">{formatCurrency(153605584)}</span>
							</div>
							<div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-col justify-between h-[100px]">
								<div className="flex items-center justify-between text-slate-500 text-[13px]">
									<span>Dịch vụ bổ sung</span>
									<span className="text-[14px] text-slate-300">-</span>
								</div>
								<span className="text-[20px] font-bold text-slate-800">{formatCurrency(10120000)}</span>
							</div>
							<div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-col justify-between h-[100px]">
								<div className="flex items-center justify-between text-slate-500 text-[13px]">
									<span>Tiện ích</span>
									<span className="text-[14px] text-slate-300">-</span>
								</div>
								<span className="text-[20px] font-bold text-slate-800">{formatCurrency(3591000)}</span>
							</div>
							<div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-col justify-between h-[100px]">
								<div className="flex items-center justify-between text-slate-500 text-[13px]">
									<span>Doanh thu khác</span>
									<span className="text-[14px] text-slate-300">-</span>
								</div>
								<span className="text-[20px] font-bold text-slate-800">₫ 0</span>
							</div>
						</div>

						<div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6 shrink-0 min-h-[420px]">
							{/* Stacked Bar Chart */}
							<div className="bg-white rounded-lg border border-slate-200 shadow-sm flex flex-col h-full relative">
								<div className="px-5 py-4 border-b border-transparent">
									<h3 className="text-[14px] font-bold text-slate-700">
										Doanh thu theo dịch vụ <span className="text-blue-500 font-normal ml-1">(Tổng: ₫ 167,316,584)</span>
									</h3>
								</div>
								<div className="flex-1 px-5 pt-4 pb-0 relative max-h-[300px]">
									<ResponsiveContainer width="100%" height="100%">
										<BarChart data={MOCK_MONTHLY_REVENUE} margin={{ top: 35, right: 0, left: -20, bottom: 20 }}>
											<CartesianGrid vertical={false} stroke="#e2e8f0" />
											<XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 11 }} dy={10} />
											<YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 11 }} tickFormatter={(val) => `${val/1000000}Tr`} />
											<Tooltip cursor={{fill: '#f8fafc'}} formatter={(value: any) => formatCurrency(value)} />
											
											{/* Use custom shape with LabelList for "Total" value on top of stack */}
											<Bar dataKey="Tiền phòng" stackId="a" fill="#3b82f6" barSize={18} />
											<Bar dataKey="Dịch vụ bổ sung" stackId="a" fill="#22c55e" />
											<Bar dataKey="Tiện ích" stackId="a" fill="#f59e0b" />
											<Bar dataKey="Doanh thu khác" stackId="a" fill="#cbd5e1" radius={[2, 2, 0, 0]}>
												<LabelList dataKey="total" content={renderCustomizedLabel} />
											</Bar>
										</BarChart>
									</ResponsiveContainer>
								</div>
								<div className="flex items-center justify-center gap-6 py-4 border-t border-slate-100">
									<span className="flex items-center gap-2 text-[12px] text-slate-600"><span className="w-2 h-2 rounded-full bg-blue-500"></span> Tiền phòng</span>
									<span className="flex items-center gap-2 text-[12px] text-slate-600"><span className="w-2 h-2 rounded-full bg-green-500"></span> Dịch vụ bổ sung</span>
									<span className="flex items-center gap-2 text-[12px] text-slate-600"><span className="w-2 h-2 rounded-full bg-amber-500"></span> Tiện ích</span>
									<span className="flex items-center gap-2 text-[12px] text-slate-600"><span className="w-2 h-2 rounded-full bg-slate-300"></span> Doanh thu khác</span>
								</div>
							</div>

							{/* Pie Chart */}
							<div className="bg-white rounded-lg border border-slate-200 shadow-sm flex flex-col h-full">
								<div className="px-5 py-4 flex items-center justify-between">
									<h3 className="text-[14px] font-bold text-slate-700">Tỷ lệ doanh thu theo dịch vụ</h3>
									<select className="border border-slate-200 text-[12px] text-slate-600 py-1 px-2 rounded outline-none h-8 min-w-[120px]">
										<option>Tất cả dịch vụ</option>
									</select>
								</div>
								<div className="flex-1 flex flex-col items-center justify-center p-5 pt-0">
									<div className="h-[220px] w-full relative">
										<ResponsiveContainer width="100%" height="100%">
											<PieChart>
												<Pie data={MOCK_SERVICES} innerRadius={60} outerRadius={90} dataKey="value" stroke="white" strokeWidth={3} paddingAngle={0}>
													{MOCK_SERVICES.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
												</Pie>
												<Tooltip formatter={(value: any) => formatCurrency(value)} />
											</PieChart>
										</ResponsiveContainer>
									</div>
									<div className="grid grid-cols-2 gap-y-3 gap-x-2 w-full mt-4">
										{MOCK_SERVICES.map((srv, i) => (
											<div key={i} className="flex items-center gap-2 text-[11px] text-slate-600">
												<span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: srv.color }}></span>
												<span className="truncate">{srv.name} <span className="font-bold text-slate-800">{formatCurrency(srv.value).replace('₫', '')}</span> <span className="text-blue-500">({srv.pct}%)</span></span>
											</div>
										))}
									</div>
								</div>
							</div>
						</div>

						{/* Table */}
						<div className="bg-white rounded-lg border border-slate-200 shadow-sm flex flex-col mb-4">
							<div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
								<h3 className="text-[14px] font-bold text-slate-700">Doanh thu theo dịch vụ</h3>
								<button className="p-1 border border-slate-200 rounded text-green-600 hover:bg-slate-50 transition">
									<FileSpreadsheet className="w-4 h-4" />
								</button>
							</div>
							<div className="overflow-x-auto">
								<table className="w-full text-left border-collapse min-w-[800px]">
									<thead>
										<tr className="bg-[#f8f9fa] border-b border-slate-200">
											<th className="py-3 px-5 text-[12px] font-bold text-slate-800 w-[40px]"></th>
											<th className="py-3 px-2 text-[12px] font-bold text-slate-800">Nhóm dịch vụ</th>
											<th className="py-3 px-4 text-[12px] font-bold text-slate-800 text-right">Tháng 1</th>
											<th className="py-3 px-4 text-[12px] font-bold text-slate-800 text-right">Tháng 2</th>
											<th className="py-3 px-4 text-[12px] font-bold text-slate-800 text-right">Tháng 3</th>
											<th className="py-3 px-4 text-[12px] font-bold text-slate-800 text-right">Tháng 4</th>
											<th className="py-3 px-4 text-[12px] font-bold text-slate-800 text-right">Tháng 5</th>
											<th className="py-3 px-4 text-[12px] font-bold text-slate-800 text-right">Tháng 6</th>
											<th className="py-3 px-4 text-[12px] font-bold text-slate-800 text-right border-l border-slate-200">Tổng cộng</th>
											<th className="py-3 px-4 text-[12px] font-bold text-slate-800 text-right border-l border-slate-200">% Tổng</th>
										</tr>
									</thead>
									<tbody>
										{MOCK_SERVICES.map((srv, idx) => (
											<tr key={idx} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
												<td className="py-3 px-5 text-center"><Plus className="w-4 h-4 text-slate-400 cursor-pointer hover:text-slate-700" /></td>
												<td className="py-3 px-2 text-[12.5px] text-slate-700">{srv.name}</td>
												<td className="py-3 px-4 text-[12px] text-slate-600 font-medium text-right">{idx === 0 ? "₫ 3,000,000" : "₫ 0"}</td>
												<td className="py-3 px-4 text-[12px] text-slate-600 font-medium text-right">{idx === 0 ? "₫ 3,000,000" : "₫ 0"}</td>
												<td className="py-3 px-4 text-[12px] text-slate-600 font-medium text-right">{idx === 0 ? "₫ 3,000,000" : "₫ 0"}</td>
												<td className="py-3 px-4 text-[12px] text-slate-600 font-medium text-right">{idx === 0 ? "₫ 11,473,323" : (idx===1 ? "₫ 10,120,000" : (idx===2 ? "₫ 3,591,000" : "₫ 0"))}</td>
												<td className="py-3 px-4 text-[12px] text-slate-600 font-medium text-right">{idx === 0 ? "₫ 19,400,000" : "₫ 0"}</td>
												<td className="py-3 px-4 text-[12px] text-slate-600 font-medium text-right">{idx === 0 ? "₫ 19,400,000" : "₫ 0"}</td>
												<td className="py-3 px-4 text-[12px] text-slate-800 font-semibold text-right border-l border-slate-200 bg-slate-50/50">{formatCurrency(srv.value)}</td>
												<td className="py-3 px-4 text-[12px] text-slate-600 font-medium text-right border-l border-slate-200 bg-slate-50/50">{srv.pct}%</td>
											</tr>
										))}
									</tbody>
									<tfoot>
										<tr className="bg-[#f8f9fa] border-t-2 border-slate-200">
											<td className="py-3 px-5"></td>
											<td className="py-3 px-2 text-[12.5px] font-bold text-slate-800">Tổng cộng</td>
											<td className="py-3 px-4 text-[12px] font-bold text-slate-800 text-right">₫ 3,000,000</td>
											<td className="py-3 px-4 text-[12px] font-bold text-slate-800 text-right">₫ 3,000,000</td>
											<td className="py-3 px-4 text-[12px] font-bold text-slate-800 text-right">₫ 3,000,000</td>
											<td className="py-3 px-4 text-[12px] font-bold text-slate-800 text-right">₫ 25,184,323</td>
											<td className="py-3 px-4 text-[12px] font-bold text-slate-800 text-right">₫ 19,400,000</td>
											<td className="py-3 px-4 text-[12px] font-bold text-slate-800 text-right">₫ 19,400,000</td>
											<td className="py-3 px-4 text-[12px] font-bold text-slate-800 text-right border-l border-slate-200">₫ 167,316,584</td>
											<td className="py-3 px-4 text-[12px] font-bold text-slate-800 text-right border-l border-slate-200">100 %</td>
										</tr>
									</tfoot>
								</table>
							</div>
						</div>
					</div>
				)}

				{/* ======== TAB 2: DOANH THU CHO THUÊ ======== */}
				{activeTab === "Doanh thu cho thuê" && (
					<div className={`flex flex-col gap-6 transition-opacity duration-300 ${loading ? 'opacity-50' : 'opacity-100'}`}>
						
						{/* Chart */}
						<div className="bg-white rounded-lg border border-slate-200 shadow-sm flex flex-col h-[400px]">
							<div className="px-5 py-4 flex items-center justify-between border-b border-white">
								<h3 className="text-[14px] font-bold text-slate-700">Tổng doanh thu theo tháng <span className="text-blue-500 font-normal ml-1">(Tổng: ₫ 153,605,584)</span></h3>
								<div className="flex gap-2">
									<button className="text-slate-400 hover:text-slate-600"><RefreshCw className="w-4 h-4"/></button>
									<button className="text-slate-400 hover:text-slate-600"><FileSpreadsheet className="w-4 h-4"/></button>
								</div>
							</div>
							<div className="flex-1 px-5 pb-6 pt-2 h-full max-h-[300px]">
								<ResponsiveContainer width="100%" height="100%">
									<BarChart data={MOCK_MONTHLY_REVENUE} margin={{ top: 35, right: 0, left: -20, bottom: 0 }}>
										<CartesianGrid vertical={false} stroke="#e2e8f0" />
										<XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 11 }} dy={10} />
										<YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 11 }} tickFormatter={(val) => `${val/1000000}Tr`} />
										<Tooltip cursor={{fill: '#f8fafc'}} formatter={(value: any) => formatCurrency(value)} />
										<Bar dataKey="total" fill="#3b82f6" barSize={32} radius={[2, 2, 0, 0]}>
											<LabelList dataKey="total" content={renderCustomizedLabel} />
										</Bar>
									</BarChart>
								</ResponsiveContainer>
							</div>
						</div>

						{/* Table */}
						<div className="bg-white rounded-lg border border-slate-200 shadow-sm flex flex-col mb-4">
							<div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
								<h3 className="text-[14px] font-bold text-slate-700">Tổng doanh thu theo toà nhà</h3>
								<button className="p-1 border border-slate-200 rounded text-green-600 hover:bg-slate-50 transition">
									<FileSpreadsheet className="w-4 h-4" />
								</button>
							</div>
							<div className="overflow-x-auto relative">
								<table className="w-full text-left border-collapse min-w-[1000px]">
									<thead>
										<tr className="bg-[#f8f9fa] border-b border-slate-200">
											<th className="py-3 px-5 text-[12px] font-bold text-slate-800 w-[40px] sticky left-0 bg-[#f8f9fa] z-10 border-r border-[#f8f9fa]"></th>
											<th className="py-3 px-2 text-[12px] font-bold text-slate-800 sticky left-[40px] bg-[#f8f9fa] z-10 w-[150px]">Toà nhà</th>
											<th className="py-3 px-4 text-[12px] font-bold text-slate-800 text-right">Tháng 1</th>
											<th className="py-3 px-4 text-[12px] font-bold text-slate-800 text-right">Tháng 2</th>
											<th className="py-3 px-4 text-[12px] font-bold text-slate-800 text-right">Tháng 3</th>
											<th className="py-3 px-4 text-[12px] font-bold text-slate-800 text-right">Tháng 4</th>
											<th className="py-3 px-4 text-[12px] font-bold text-slate-800 text-right">Tháng 5</th>
											<th className="py-3 px-4 text-[12px] font-bold text-slate-800 text-right">Tháng 6</th>
											<th className="py-3 px-4 text-[12px] font-bold text-slate-800 text-right">Tháng 7</th>
											<th className="py-3 px-4 text-[12px] font-bold text-slate-800 text-right sticky right-0 bg-[#f8f9fa] z-10 shadow-[-4px_0_6px_-1px_rgb(0,0,0,0.05)] border-l border-slate-200">Tổng</th>
										</tr>
									</thead>
									<tbody>
										{MOCK_RENTAL_BUILDINGS.map((bldg, idx) => (
											<tr key={idx} className="border-b border-slate-100 hover:bg-slate-50 transition-colors group">
												<td className="py-3 px-5 text-center sticky left-0 bg-white group-hover:bg-slate-50 z-10">
													<Plus className="w-4 h-4 text-slate-400 cursor-pointer hover:text-slate-700" />
												</td>
												<td className="py-3 px-2 text-[12.5px] text-slate-700 sticky left-[40px] bg-white group-hover:bg-slate-50 z-10">{bldg.name}</td>
												<td className="py-3 px-4 text-[12px] text-slate-600 font-medium text-right">{formatCurrency(bldg.m1)}</td>
												<td className="py-3 px-4 text-[12px] text-slate-600 font-medium text-right">{formatCurrency(bldg.m2)}</td>
												<td className="py-3 px-4 text-[12px] text-slate-600 font-medium text-right">{formatCurrency(bldg.m3)}</td>
												<td className="py-3 px-4 text-[12px] text-slate-600 font-medium text-right">{formatCurrency(bldg.m4)}</td>
												<td className="py-3 px-4 text-[12px] text-slate-600 font-medium text-right">{formatCurrency(bldg.m5)}</td>
												<td className="py-3 px-4 text-[12px] text-slate-600 font-medium text-right">{formatCurrency(bldg.m6)}</td>
												<td className="py-3 px-4 text-[12px] text-slate-600 font-medium text-right">{formatCurrency(bldg.m7)}</td>
												<td className="py-3 px-4 text-[12px] text-slate-800 font-semibold text-right sticky right-0 bg-slate-50 shadow-[-4px_0_6px_-1px_rgb(0,0,0,0.05)] z-10 border-l border-slate-200">{formatCurrency(bldg.total)}</td>
											</tr>
										))}
									</tbody>
									<tfoot>
										<tr className="bg-[#f8f9fa] border-t-2 border-slate-200">
											<td className="py-3 px-5 sticky left-0 bg-[#f8f9fa] z-10 border-t border-slate-300"></td>
											<td className="py-3 px-2 text-[12.5px] font-bold text-slate-800 sticky left-[40px] bg-[#f8f9fa] z-10 border-t border-slate-300">Tổng</td>
											<td className="py-3 px-4 text-[12px] font-bold text-slate-800 text-right border-t border-slate-300">₫ 3,000,000</td>
											<td className="py-3 px-4 text-[12px] font-bold text-slate-800 text-right border-t border-slate-300">₫ 3,000,000</td>
											<td className="py-3 px-4 text-[12px] font-bold text-slate-800 text-right border-t border-slate-300">₫ 3,000,000</td>
											<td className="py-3 px-4 text-[12px] font-bold text-slate-800 text-right border-t border-slate-300">₫ 11,473,323</td>
											<td className="py-3 px-4 text-[12px] font-bold text-slate-800 text-right border-t border-slate-300">₫ 19,400,000</td>
											<td className="py-3 px-4 text-[12px] font-bold text-slate-800 text-right border-t border-slate-300">₫ 19,400,000</td>
											<td className="py-3 px-4 text-[12px] font-bold text-slate-800 text-right border-t border-slate-300">₫ 19,400,000</td>
											<td className="py-3 px-4 text-[12px] font-bold text-slate-800 text-right sticky right-0 bg-slate-100 z-10 border-l border-t border-slate-300 shadow-[-4px_0_6px_-1px_rgb(0,0,0,0.05)]">₫ 153,605,584</td>
										</tr>
									</tfoot>
								</table>
							</div>
						</div>
					</div>
				)}

				{/* ======== TAB 3: HÓA ĐƠN ======== */}
				{activeTab === "Hóa đơn" && (
					<div className={`flex flex-col gap-6 transition-opacity duration-300 ${loading ? 'opacity-50' : 'opacity-100'}`}>
						
						{/* KPI Cards */}
						<div className="grid grid-cols-1 md:grid-cols-4 gap-4 shrink-0">
							<div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex items-center gap-4">
								<div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
									<FileText className="w-5 h-5 text-slate-500" />
								</div>
								<div className="flex flex-col">
									<span className="text-[12px] font-medium text-slate-500">Tổng tiền (9)</span>
									<span className="text-[18px] font-bold text-slate-800">₫ 551,233,005</span>
								</div>
							</div>
							<div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex items-center gap-4">
								<div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center border border-emerald-100">
									<CheckCircle className="w-5 h-5 text-emerald-500" />
								</div>
								<div className="flex flex-col">
									<span className="text-[12px] font-medium text-slate-500">Tổng tiền đã trả (0/9)</span>
									<span className="text-[18px] font-bold text-slate-800">₫ 0</span>
								</div>
							</div>
							<div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex items-center gap-4">
								<div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center border border-orange-100">
									<Clock className="w-5 h-5 text-orange-400" />
								</div>
								<div className="flex flex-col">
									<span className="text-[12px] font-medium text-slate-500">Tổng tiền chưa trả (9/9)</span>
									<span className="text-[18px] font-bold text-slate-800">₫ 551,233,005</span>
								</div>
							</div>
							<div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex items-center gap-4">
								<div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center border border-red-100">
									<AlertCircle className="w-5 h-5 text-red-500" />
								</div>
								<div className="flex flex-col">
									<span className="text-[12px] font-medium text-slate-500">Tổng tiền quá hạn (9/9)</span>
									<span className="text-[18px] font-bold text-slate-800">₫ 551,233,005</span>
								</div>
							</div>
						</div>

						{/* Chart */}
						<div className="bg-white rounded-lg border border-slate-200 shadow-sm flex flex-col h-[350px]">
							<div className="px-5 py-4 flex items-center justify-between border-b border-white">
								<h3 className="text-[14px] font-bold text-slate-700">Tổng số tiền hóa đơn theo thời gian</h3>
							</div>
							<div className="flex-1 px-5 pb-6 pt-2 h-full max-h-[250px]">
								<ResponsiveContainer width="100%" height="100%">
									<BarChart data={MOCK_INVOICE_CHART} margin={{ top: 35, right: 0, left: -20, bottom: 0 }}>
										<CartesianGrid vertical={false} stroke="#e2e8f0" />
										<XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 11 }} dy={10} />
										<YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 11 }} tickFormatter={(val) => `${val/1000000}Tr`} />
										<Tooltip cursor={{fill: '#f8fafc'}} formatter={(value: any) => formatCurrency(value)} />
										<Bar dataKey="value" fill="#fed7aa" barSize={16}>
											<LabelList dataKey="value" content={renderCustomizedLabel} />
										</Bar>
									</BarChart>
								</ResponsiveContainer>
							</div>
						</div>

						{/* Table */}
						<div className="bg-white rounded-lg border border-slate-200 shadow-sm flex flex-col mb-4">
							<div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
								<h3 className="text-[14px] font-bold text-slate-700">Chi tiết</h3>
								<button className="p-1 border border-slate-200 rounded text-green-600 hover:bg-slate-50 transition">
									<FileSpreadsheet className="w-4 h-4" />
								</button>
							</div>
							<div className="overflow-x-auto">
								<table className="w-full text-left border-collapse min-w-[800px]">
									<thead>
										<tr className="bg-[#f8f9fa] border-b border-slate-200">
											<th className="py-3 px-5 text-[12px] font-bold text-slate-800">Thời gian</th>
											<th className="py-3 px-4 text-[12px] font-bold text-slate-800">Số lượng hóa đơn</th>
											<th className="py-3 px-4 text-[12px] font-bold text-slate-800">Tổng tiền</th>
											<th className="py-3 px-4 text-[12px] font-bold text-slate-800">Tổng tiền đã trả</th>
											<th className="py-3 px-4 text-[12px] font-bold text-slate-800">Tổng tiền chưa trả</th>
											<th className="py-3 px-5 text-[12px] font-bold text-slate-800">Tổng tiền quá hạn</th>
										</tr>
									</thead>
									<tbody>
										{MOCK_INVOICE_TABLE.map((row, idx) => (
											<tr key={idx} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
												<td className="py-3 px-5 text-[13px] text-slate-700 font-medium">{row.date}</td>
												<td className="py-3 px-4 text-[13px] text-slate-600">{row.count}</td>
												<td className="py-3 px-4 text-[13px] text-slate-800 font-semibold">{formatCurrency(row.total)}</td>
												<td className="py-3 px-4 text-[13px] text-slate-500">{formatCurrency(row.paid)}</td>
												<td className="py-3 px-4 text-[13px] text-slate-800 font-semibold">{formatCurrency(row.unpaid)}</td>
												<td className="py-3 px-5 text-[13px] text-slate-800 font-semibold">{formatCurrency(row.overdue)}</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						</div>
					</div>
				)}

				{/* ======== TAB 4: DÒNG TIỀN ======== */}
				{activeTab === "Dòng tiền" && (
					<div className={`flex flex-col gap-6 transition-opacity duration-300 ${loading ? 'opacity-50' : 'opacity-100'}`}>
						
						{/* KPI Cards for Cashflow */}
						<div className="grid grid-cols-1 md:grid-cols-3 gap-0 bg-white rounded-lg border border-slate-200 shadow-sm shrink-0 divide-y md:divide-y-0 md:divide-x divide-slate-100">
							{/* Card 1 */}
							<div className="p-6 flex items-center gap-5">
								<div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center border border-emerald-100 shadow-[inset_0_1px_3px_rgb(0,0,0,0.05)]">
									<Wallet className="w-6 h-6 text-emerald-500" />
								</div>
								<div className="flex flex-col">
									<span className="text-[13px] font-medium text-slate-600">Số dư tiền mặt</span>
									<span className="text-[24px] font-bold text-slate-800 mt-0.5">₫ 0</span>
								</div>
							</div>
							
							{/* Card 2 */}
							<div className="p-6 flex flex-col justify-center gap-4">
								<div className="flex items-center gap-3">
									<div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center border border-blue-100">
										<ArrowUpRight className="w-4 h-4 text-blue-500" />
									</div>
									<div className="flex flex-col">
										<span className="text-[12px] text-slate-500">Tổng tiền vào</span>
										<span className="text-[15px] font-bold text-slate-800 leading-tight">₫ 0</span>
									</div>
								</div>
								<div className="flex items-center gap-3">
									<div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center border border-orange-100">
										<ArrowDownRight className="w-4 h-4 text-orange-400" />
									</div>
									<div className="flex flex-col">
										<span className="text-[12px] text-slate-500">Tổng tiền ra</span>
										<span className="text-[15px] font-bold text-slate-800 leading-tight">₫ 0</span>
									</div>
								</div>
							</div>

							{/* Card 3 */}
							<div className="p-6 grid grid-cols-[1fr_1fr] gap-6">
								<div className="flex items-center gap-3">
									<div className="w-10 h-10 bg-slate-50 rounded flex items-center justify-center border border-slate-200">
										<Wallet className="w-5 h-5 text-slate-500" />
									</div>
									<div className="flex flex-col">
										<span className="text-[12px] text-slate-500 flex items-center gap-1">Tiền cọc còn lại <Info className="w-3.5 h-3.5 text-slate-400" /></span>
										<span className="text-[18px] font-bold text-slate-800">₫ 59,600,000</span>
									</div>
								</div>
								<div className="flex flex-col justify-center gap-3 border-l border-slate-100 pl-6">
									<div className="flex items-center gap-2">
										<div className="w-6 h-6 rounded-full bg-slate-50 flex items-center justify-center border border-slate-200">
											<span className="text-[10px] font-bold text-slate-500">C</span>
										</div>
										<div className="flex flex-col">
											<span className="text-[11px] text-slate-500">Tổng tiền cọc ghi nhận</span>
											<span className="text-[13px] font-bold text-slate-800 leading-tight">₫ 16,400,000</span>
										</div>
									</div>
									<div className="flex items-center gap-2">
										<div className="w-6 h-6 rounded-full bg-slate-50 flex items-center justify-center border border-slate-200">
											<span className="text-[10px] font-bold text-slate-500">H</span>
										</div>
										<div className="flex flex-col">
											<span className="text-[11px] text-slate-500">Tổng tiền cọc đã hoàn</span>
											<span className="text-[13px] font-bold text-slate-800 leading-tight">₫ 0</span>
										</div>
									</div>
								</div>
							</div>
						</div>

						{/* Chart */}
						<div className="bg-white rounded-lg border border-slate-200 shadow-sm flex flex-col h-[400px]">
							<div className="px-5 py-4 border-b border-white flex items-center justify-between">
								<h3 className="text-[14px] font-bold text-slate-700">Biểu đồ dòng tiền</h3>
								<div className="flex items-center gap-3">
									<input type="text" placeholder="Tất cả loại giao dịch" className="px-3 py-1 text-[12px] border border-slate-300 rounded outline-none w-[200px]" readOnly />
									<button className="text-slate-400 hover:text-slate-600"><FileSpreadsheet className="w-4 h-4"/></button>
								</div>
							</div>
							<div className="flex-1 px-5 pb-6 pt-2 h-full max-h-[300px]">
								<ResponsiveContainer width="100%" height="100%">
									<LineChart data={MOCK_CASHFLOW_CHART} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
										<CartesianGrid vertical={false} stroke="#e2e8f0" />
										<XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 11 }} tickMargin={10} minTickGap={30} />
										<YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 11 }} tickFormatter={(val) => `${val/1000}K`} />
										<Tooltip cursor={{fill: '#f8fafc'}} formatter={(value: any) => formatCurrency(value)} />
										<Legend verticalAlign="bottom" iconType="circle" />
										<Line type="step" dataKey="inFlow" name="Dòng tiền vào" stroke="#3b82f6" strokeWidth={2} dot={{r: 2}} activeDot={{r: 4}} />
										<Line type="step" dataKey="outFlow" name="Dòng tiền ra" stroke="#f97316" strokeWidth={2} dot={{r: 2}} activeDot={{r: 4}} />
									</LineChart>
								</ResponsiveContainer>
							</div>
						</div>

						{/* Table */}
						<div className="bg-white rounded-lg border border-slate-200 shadow-sm flex flex-col mb-4">
							<div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
								<h3 className="text-[14px] font-bold text-slate-800">Chi tiết <span className="text-emerald-500 text-[13px] font-normal ml-1">(Tổng tiền: +₫ 16,500,000)</span></h3>
								<div className="flex items-center gap-2">
									<input type="text" placeholder="Tìm kiếm tòa nhà, khu..." className="px-3 py-1.5 text-[12px] border border-slate-300 rounded outline-none w-[200px]" />
									<button className="p-1 border border-slate-200 rounded text-green-600 hover:bg-slate-50 transition">
										<FileSpreadsheet className="w-5 h-5" />
									</button>
								</div>
							</div>
							<div className="overflow-x-auto">
								<table className="w-full text-left border-collapse min-w-[1000px]">
									<thead>
										<tr className="bg-[#f8f9fa] border-b border-slate-200">
											<th className="py-3 px-5 text-[12px] font-bold text-slate-800">Toà nhà</th>
											<th className="py-3 px-4 text-[12px] font-bold text-slate-800">Phòng</th>
											<th className="py-3 px-4 text-[12px] font-bold text-slate-800">Dòng tiền</th>
											<th className="py-3 px-4 text-[12px] font-bold text-slate-800">Nhóm giao dịch</th>
											<th className="py-3 px-4 text-[12px] font-bold text-slate-800">Loại giao dịch</th>
											<th className="py-3 px-4 text-[12px] font-bold text-slate-800">Số tiền</th>
											<th className="py-3 px-4 text-[12px] font-bold text-slate-800">Ngày giao dịch</th>
											<th className="py-3 px-5 text-[12px] font-bold text-slate-800">Hình thức thanh toán</th>
										</tr>
									</thead>
									<tbody>
										{MOCK_CASHFLOW_TABLE.map((row, idx) => (
											<tr key={idx} className="border-b border-slate-100 hover:bg-slate-50 transition-colors bg-white">
												<td className="py-4 px-5 text-[13px] text-slate-700 font-medium">{row.building}</td>
												<td className="py-4 px-4 text-[13px] text-slate-700">{row.room}</td>
												<td className="py-4 px-4">
													<span className={`inline-flex items-center px-2 py-0.5 rounded text-[12px] font-medium ${row.typeBg} ${row.typeText}`}>
														{row.type}
													</span>
												</td>
												<td className="py-4 px-4 text-[13px] text-slate-600 leading-tight pr-6">{row.group}</td>
												<td className="py-4 px-4 text-[13px] text-slate-600">{row.category}</td>
												<td className={`py-4 px-4 text-[13px] font-semibold ${row.amountColor}`}>+{formatCurrency(row.amount)}</td>
												<td className="py-4 px-4 text-[13px] text-slate-600">{row.date}</td>
												<td className="py-4 px-5 text-[13px] text-slate-600">{row.paymentMethod}</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						</div>
					</div>
				)}

			</div>
		</div>
	);
};

export default RevenueReportPage;

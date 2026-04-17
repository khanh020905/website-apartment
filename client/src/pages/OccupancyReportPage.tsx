import { useState, useEffect } from "react";
import { RefreshCw, Download, Maximize2 } from "lucide-react";
import {
	CartesianGrid,
	Line,
	LineChart,
	BarChart,
	Bar,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
	Cell
} from "recharts";

const MOCK_STATS = {
	rate: 16,
	occupied: 7,
	empty: 37,
	total: 44,
	new_checkins: 4,
};

const MOCK_TIME_CHART = [
	{ name: "13/04", value: 2 },
	{ name: "14/04", value: 5 },
	{ name: "15/04", value: 8 },
	{ name: "16/04", value: 16 },
	{ name: "17/04", value: 16 },
	{ name: "18/04", value: 16 },
	{ name: "19/04", value: 16 },
];

const MOCK_BUILDING_CHART = [
	{ name: "Trà My", value: 25 },
	{ name: "Phòng Q...", value: 20 },
	{ name: "Phòng C...", value: 15 },
	{ name: "Vân Dư", value: 0 },
	{ name: "vb", value: 0 },
	{ name: "ttt", value: 0 },
];

const OccupancyReportPage = () => {
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const timer = setTimeout(() => setLoading(false), 800);
		return () => clearTimeout(timer);
	}, []);

	const STATS = [
		{
			label: "Tỷ lệ lấp đầy",
			value: `${MOCK_STATS.rate}%`,
			iconNode: (
				<div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center border border-amber-200">
					<span className="text-amber-500 font-bold text-[14px]">%</span>
				</div>
			),
		},
		{
			label: "Phòng đang sử dụng / Tổng phòng",
			value: `${MOCK_STATS.occupied}/${MOCK_STATS.total}`,
			iconNode: (
				<div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center border border-blue-100">
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-500">
						<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
						<polyline points="9 22 9 12 15 12 15 22"></polyline>
					</svg>
				</div>
			),
		},
		{
			label: "Phòng trống / Tổng phòng",
			value: `${MOCK_STATS.empty}/${MOCK_STATS.total}`,
			iconNode: (
				<div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center border border-slate-200">
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-500">
						<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
					</svg>
				</div>
			),
		},
		{
			label: "Nhận phòng tháng này",
			value: `${MOCK_STATS.new_checkins}`,
			iconNode: (
				<div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center border border-emerald-100">
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-emerald-500">
						<line x1="5" y1="12" x2="19" y2="12"></line>
						<polyline points="12 5 19 12 12 19"></polyline>
					</svg>
				</div>
			),
		},
	];

	return (
		<div className="flex-1 flex flex-col h-full bg-[#f4f5f7] relative overflow-hidden font-sans">
			{/* Header */}
			<div className="bg-[#f4f5f7] px-6 py-5 shrink-0 border-b border-slate-200 shadow-sm z-10">
				<h1 className="text-[20px] font-bold text-slate-800 tracking-tight mb-4">Báo cáo vận hành</h1>
				
				<div className="flex items-center justify-between">
					<div className="flex gap-6">
						<button className="text-[14px] font-bold text-slate-800 border-b-[3px] border-amber-500 pb-2 -mb-[1px]">
							Vận hành
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
					Cập nhật lần cuối lúc: 17/04/2026 09:42
					<RefreshCw className={`w-3.5 h-3.5 cursor-pointer hover:text-slate-800 ${loading ? "animate-spin" : ""}`} />
				</div>

				{/* KPI Cards */}
				<div className="grid grid-cols-1 md:grid-cols-4 gap-4 shrink-0">
					{STATS.map((stat, i) => (
						<div
							key={i}
							className="bg-white px-5 py-5 rounded-md border border-slate-200 shadow-sm flex items-center gap-4 min-h-[90px]"
						>
							{stat.iconNode}
							<div className="flex flex-col">
								<span className="text-[12px] font-medium text-slate-500">
									{stat.label}
								</span>
								<span className="text-[20px] font-bold text-slate-800 mt-0.5">{stat.value}</span>
							</div>
						</div>
					))}
				</div>

				{/* Line Chart: Thống kê theo thời gian */}
				<div className="bg-white rounded-md border border-slate-200 shadow-sm flex flex-col h-[420px]">
					<div className="px-5 py-4 flex items-center justify-between border-b border-slate-100">
						<h3 className="text-[14px] font-bold text-slate-700">
							Tỷ lệ lấp đầy theo thời gian <span className="text-blue-500 font-medium">(trung bình 11%)</span>
						</h3>
						<div className="flex items-center gap-4">
							<select className="px-3 py-1.5 border border-slate-200 rounded text-[13px] text-slate-600 bg-white focus:outline-none cursor-pointer">
								<option>Tuần này</option>
							</select>
							<div className="flex items-center gap-2 opacity-50">
								<button className="p-1 hover:bg-slate-100 rounded text-slate-500"><RefreshCw className="w-4 h-4" /></button>
								<button className="p-1 hover:bg-slate-100 rounded text-slate-500"><Maximize2 className="w-4 h-4" /></button>
								<button className="p-1 hover:bg-slate-100 rounded text-slate-500"><Download className="w-4 h-4" /></button>
							</div>
						</div>
					</div>
					<div className="flex-1 p-5 pb-8">
						<ResponsiveContainer width="100%" height="100%">
							<LineChart data={MOCK_TIME_CHART} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
								<CartesianGrid strokeDasharray="0" vertical={false} stroke="#ecfeff" strokeWidth={0} />
								{/* YAxis grid lines explicitly added back as solid line */}
								<CartesianGrid vertical={false} stroke="#f1f5f9" />
								<XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} dy={15} />
								<YAxis axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} tickFormatter={(val) => `${val}%`} domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} />
								<Tooltip 
									contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
									formatter={(value: any) => [`${value}%`, "Tỷ lệ"]}
								/>
								<Line type="linear" dataKey="value" stroke="#fbbf24" strokeWidth={2} dot={{ r: 3, fill: "#fbbf24", strokeWidth: 0 }} activeDot={{ r: 5 }} />
							</LineChart>
						</ResponsiveContainer>
					</div>
				</div>

				{/* Bar Chart: Thống kê theo toà nhà */}
				<div className="bg-white rounded-md border border-slate-200 shadow-sm flex flex-col h-[420px]">
					<div className="px-5 py-4 flex items-center justify-between border-b border-slate-100">
						<h3 className="text-[14px] font-bold text-slate-700">
							Tỷ lệ lấp đầy theo tòa nhà <span className="text-blue-500 font-medium">(trung bình 9%)</span>
						</h3>
						<div className="flex items-center gap-2 opacity-50">
							<button className="p-1 hover:bg-slate-100 rounded text-slate-500"><RefreshCw className="w-4 h-4" /></button>
							<button className="p-1 hover:bg-slate-100 rounded text-slate-500"><Maximize2 className="w-4 h-4" /></button>
							<button className="p-1 hover:bg-slate-100 rounded text-slate-500"><Download className="w-4 h-4" /></button>
						</div>
					</div>
					<div className="flex-1 p-5 pb-12">
						<ResponsiveContainer width="100%" height="100%">
							<BarChart data={MOCK_BUILDING_CHART} margin={{ top: 20, right: 20, left: -20, bottom: 20 }}>
								<CartesianGrid vertical={false} stroke="#f1f5f9" />
								<XAxis 
									dataKey="name" 
									axisLine={false} 
									tickLine={false} 
									tick={{ fill: "#94a3b8", fontSize: 12 }} 
									dy={15} 
									angle={-45} 
									textAnchor="end"
									interval={0}
								/>
								<YAxis axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} tickFormatter={(val) => `${val}%`} domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} />
								<Tooltip 
									cursor={{fill: 'transparent'}}
									contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
									formatter={(value: any) => [`${value}%`, "Tỷ lệ"]}
								/>
								<Bar dataKey="value" radius={[2, 2, 0, 0]} barSize={24}>
									{MOCK_BUILDING_CHART.map((_, index) => (
										<Cell key={`cell-${index}`} fill="#66a1ff" />
									))}
								</Bar>
							</BarChart>
						</ResponsiveContainer>
					</div>
				</div>

			</div>
		</div>
	);
};

export default OccupancyReportPage;

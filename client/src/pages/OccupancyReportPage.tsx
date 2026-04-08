import { useState, useEffect } from "react";
import { Percent, LogIn, RefreshCw, Maximize2, Home, Download } from "lucide-react";
import {
	CartesianGrid,
	Line,
	LineChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import { api } from "../lib/api";

const OccupancyReportPage = () => {
	const [loading, setLoading] = useState(true);
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const [reportData, setReportData] = useState<any>(null);

	const fetchReports = async () => {
		setLoading(true);
		try {
			const { data } = await api.get("/api/reports/occupancy");
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

	const stats = reportData?.stats || { rate: 0, occupied: 0, total: 0, available: 0, new_checkins: 0 };
	const chartData = reportData?.chart || [
		{ name: "06/04", value: 0 },
		{ name: "07/04", value: 0 },
		{ name: "08/04", value: 0 },
		{ name: "09/04", value: 0 },
		{ name: "10/04", value: 0 },
		{ name: "11/04", value: 0 },
		{ name: "12/04", value: 0 },
	];

	const STATS = [
		{
			label: "Tỷ lệ lấp đầy",
			value: `${stats.rate}%`,
			icon: Percent,
			color: "text-amber-500",
			bg: "bg-amber-50",
		},
		{
			label: "Phòng đang sử dụng / Tổng phòng",
			value: `${stats.occupied}/${stats.total}`,
			icon: Home,
			color: "text-blue-500",
			bg: "bg-blue-50",
		},
		{
			label: "Phòng trống / Tổng phòng",
			value: `${stats.available}/${stats.total}`,
			icon: Home,
			color: "text-slate-500",
			bg: "bg-slate-50",
		},
		{
			label: "Nhận phòng tháng này",
			value: `${stats.new_checkins}`,
			icon: LogIn,
			color: "text-emerald-500",
			bg: "bg-emerald-50",
		},
	];

	return (
		<div className="flex-1 flex flex-col h-full bg-[#f8f9fa] relative overflow-hidden">
			{/* Header */}
			<div className="bg-white border-b border-slate-200">
				<div className="px-6 py-4">
					<h1 className="text-[20px] font-bold text-slate-900 tracking-tight">Báo cáo vận hành</h1>
				</div>
				<div className="px-6 flex items-center justify-between border-t border-slate-100 py-3">
					<div className="flex gap-6">
						<button className="text-[14px] font-bold text-amber-600 border-b-2 border-amber-500 pb-3 -mb-3 cursor-pointer">
							Vận hành
						</button>
					</div>
					<div className="w-[300px]">
						<select className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 bg-white focus:outline-none focus:border-amber-400 hover:border-slate-300 transition-all font-medium appearance-none cursor-pointer">
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
				<div className="grid grid-cols-1 md:grid-cols-4 gap-4 shrink-0">
					{STATS.map((stat, i) => (
						<div
							key={i}
							className="bg-white px-5 py-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center gap-1.5 min-h-[90px]"
						>
							<div className="flex items-start gap-4">
								<div
									className={`w-10 h-10 ${stat.bg} rounded-full flex items-center justify-center shrink-0`}
								>
									<stat.icon className={`w-5 h-5 ${stat.color}`} />
								</div>
								<div className="flex flex-col">
									<span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
										{stat.label}
									</span>
									<span className="text-xl font-black text-slate-900 mt-0.5">{stat.value}</span>
								</div>
							</div>
						</div>
					))}
				</div>

				{/* Chart 1 */}
				<div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-[400px]">
					<div className="p-5 border-b border-slate-100 flex items-center justify-between">
						<h3 className="text-[14px] font-bold text-slate-800">
							Tỷ lệ lấp đầy theo thời gian{" "}
							<span className="text-blue-500 font-medium">(trung bình {stats.rate}%)</span>
						</h3>
						<div className="flex items-center gap-4">
							<select className="px-3 py-1.5 border border-slate-200 rounded-lg text-[13px] font-medium text-slate-600 bg-white focus:outline-none cursor-pointer">
								<option>7 ngày qua</option>
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
					<div className="flex-1 p-5">
						<ResponsiveContainer width="100%" height="100%">
							<LineChart
								data={chartData}
								margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
							>
								<CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
								<XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 12, fontWeight: 500 }} dy={10} />
								<YAxis axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 12, fontWeight: 500 }} tickFormatter={(val) => `${val}%`} domain={[0, 100]} />
								<Tooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }} />
								<Line type="monotone" dataKey="value" name="Tỷ lệ lấp đầy" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4, fill: "#f59e0b", strokeWidth: 2, stroke: "#fff" }} activeDot={{ r: 6 }} />
							</LineChart>
						</ResponsiveContainer>
					</div>
				</div>

			</div>
		</div>
	);
};

export default OccupancyReportPage;

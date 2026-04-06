import React from "react";
import { motion } from "framer-motion";
import {
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
	AreaChart,
	Area,
} from "recharts";
import {
	Home,
	Users,
	TrendingUp,
	Calendar,
	AlertCircle,
	DollarSign,
} from "lucide-react";
import type { DashboardStats } from "../../../../shared/types";
import { SmartosStatCard } from "./SmartosStatCard";

interface OverviewProps {
	stats: DashboardStats;
}

export const Overview = ({ stats }: OverviewProps) => {
	// Replicate the Smartos chart style with Recharts
	const chartData = [
		{ day: "01/04", rate: 5 },
		{ day: "03/04", rate: 8 },
		{ day: "05/04", rate: 6 },
		{ day: "07/04", rate: 10 },
		{ day: "09/04", rate: 12 },
		{ day: "11/04", rate: 15 },
		{ day: "13/04", rate: 13 },
		{ day: "15/04", rate: 18 },
		{ day: "17/04", rate: 16 },
		{ day: "19/04", rate: 20 },
		{ day: "21/04", rate: 22 },
    { day: "23/04", rate: 18 },
    { day: "25/04", rate: 25 },
    { day: "27/04", rate: 30 },
    { day: "29/04", rate: 28 },
	];

	return (
		<div className="space-y-6">
			{/* Quick Stats Grid — Row 1 */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				<SmartosStatCard
					value={`${stats.statusCounts.occupied}/${stats.totalRooms}`}
					icon={<Users className="w-5 h-5 text-emerald-600" />}
					iconBg="bg-emerald-50"
					subtitle="Phòng đang sử dụng"
				/>
				<SmartosStatCard
					value={`${stats.statusCounts.available}/${stats.totalRooms}`}
					icon={<Home className="w-5 h-5 text-slate-500" />}
					iconBg="bg-slate-100"
					subtitle="Phòng trống"
				/>
				<SmartosStatCard
					value="0"
					icon={<Calendar className="w-5 h-5 text-amber-500" />}
					iconBg="bg-amber-50"
					subtitle="Phòng sắp bắt đầu"
					badge={{ text: "Hôm nay", type: "amber" }}
				/>
			</div>

			{/* Row 2 */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				<SmartosStatCard
					value="0"
					icon={<TrendingUp className="w-5 h-5 text-blue-500" />}
					iconBg="bg-blue-50"
					subtitle="Phòng sắp đến hạn trả"
					badge={{ text: "Hôm nay", type: "blue" }}
				/>
				<SmartosStatCard
					value={stats.expiringContracts.d7.length}
					icon={<DollarSign className="w-5 h-5 text-orange-500" />}
					iconBg="bg-orange-50"
					subtitle="Hoá đơn sắp hết hạn"
					badge={{ text: "3 ngày tới", type: "orange" }}
				/>
				<SmartosStatCard
					value="0"
					icon={<Users className="w-5 h-5 text-purple-500" />}
					iconBg="bg-purple-50"
					subtitle="Visa sắp hết hạn"
					badge={{ text: "Tháng này", type: "purple" }}
				/>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Occupancy Chart */}
				<motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-100 shadow-sm"
        >
					<div className="flex items-center justify-between mb-8">
						<div>
							<h3 className="text-sm font-black text-slate-800 uppercase tracking-tighter">Tỷ lệ lấp đầy theo thời gian</h3>
              <p className="text-[10px] font-bold text-emerald-600 mt-0.5">(trung bình {Math.round(stats.occupancyRate)}%)</p>
						</div>
						<select className="text-[11px] font-bold border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-600 bg-white cursor-pointer">
							<option>Tháng này</option>
							<option>Tháng trước</option>
							<option>3 tháng</option>
						</select>
					</div>

					<div className="h-64 w-full">
						<ResponsiveContainer width="100%" height="100%">
							<AreaChart data={chartData}>
								<defs>
									<linearGradient id="colorO" x1="0" y1="0" x2="0" y2="1">
										<stop offset="5%" stopColor="#f59e0b" stopOpacity={0.05} />
										<stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
									</linearGradient>
								</defs>
								<CartesianGrid strokeDasharray="0" vertical={false} stroke="#f1f5f9" />
								<XAxis
									dataKey="day"
									axisLine={false}
									tickLine={false}
									tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: 700 }}
								/>
								<YAxis
									axisLine={false}
									tickLine={false}
									tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: 700 }}
									tickFormatter={(v) => `${v}%`}
								/>
								<Tooltip
									contentStyle={{
										borderRadius: "12px",
										border: "none",
										boxShadow: "0 10px 25px rgba(0,0,0,0.05)",
										padding: "8px 12px",
									}}
								/>
								<Area
									type="monotone"
									dataKey="rate"
									stroke="#f59e0b"
									strokeWidth={3}
									fill="url(#colorO)"
									dot={{ fill: "#f59e0b", stroke: "#fff", strokeWidth: 2, r: 4 }}
									activeDot={{ r: 6, strokeWidth: 0 }}
								/>
							</AreaChart>
						</ResponsiveContainer>
					</div>
				</motion.div>

				{/* Overdue/Notices (Secondary content) */}
				<motion.div 
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm h-full"
        >
					<h3 className="text-sm font-black text-slate-800 uppercase tracking-tighter mb-6">
						Sự cố cần xử lý (0)
					</h3>
					<div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="w-16 h-16 bg-slate-50 flex items-center justify-center rounded-full mb-4 text-slate-200">
              <AlertCircle className="w-8 h-8" />
            </div>
						<p className="text-xs font-bold text-slate-700">Không có sự cố nào cần xử lý</p>
						<p className="text-[11px] text-slate-400 mt-1 max-w-[180px]">
							Khi có báo cáo sự cố, bạn có thể xử lý ở đây.
						</p>
					</div>
				</motion.div>
			</div>
		</div>
	);
};

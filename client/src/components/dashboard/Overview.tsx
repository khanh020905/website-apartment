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
import { Home, Users, TrendingUp, Calendar, AlertCircle, DollarSign } from "lucide-react";
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
					icon={<Calendar className="w-5 h-5 text-brand-primary" />}
					iconBg="bg-brand-bg"
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

			{/* Occupancy Chart - RESTORED */}
			<motion.div
				initial={{ opacity: 0, y: 10 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.15 }}
				className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm"
			>
				<div className="flex items-center justify-between mb-8">
					<div>
						<h3 className="text-sm font-black text-slate-800 uppercase tracking-tighter">
							Tỷ lệ lấp đầy theo thời gian
						</h3>
						<p className="text-[10px] font-bold text-emerald-600 mt-0.5">
							(trung bình {Math.round(stats.occupancyRate)}%)
						</p>
					</div>
					<select className="text-[11px] font-bold border border-slate-200 rounded-xl px-3 py-1.5 text-slate-600 bg-white cursor-pointer hover:border-brand-primary/30 transition-all outline-none">
						<option>Tháng này</option>
						<option>Tháng trước</option>
						<option>3 tháng</option>
					</select>
				</div>

				<div className="h-64 w-full">
					<ResponsiveContainer
						width="100%"
						height="100%"
					>
						<AreaChart data={chartData}>
							<defs>
								<linearGradient
									id="colorO"
									x1="0"
									y1="0"
									x2="0"
									y2="1"
								>
									<stop
										offset="5%"
										stopColor="#0f9b9b"
										stopOpacity={0.05}
									/>
									<stop
										offset="95%"
										stopColor="#0f9b9b"
										stopOpacity={0}
									/>
								</linearGradient>
							</defs>
							<CartesianGrid
								strokeDasharray="0"
								vertical={false}
								stroke="#f1f5f9"
							/>
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
								stroke="#0f9b9b"
								strokeWidth={3}
								fill="url(#colorO)"
								dot={{ fill: "#0f9b9b", stroke: "#fff", strokeWidth: 2, r: 4 }}
								activeDot={{ r: 6, strokeWidth: 0 }}
							/>
						</AreaChart>
					</ResponsiveContainer>
				</div>
			</motion.div>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{/* Section: Incidents */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.2 }}
					className="bg-white rounded-[24px] border border-slate-100 shadow-sm overflow-hidden flex flex-col min-h-[400px]"
				>
					<div className="px-6 py-5 flex items-center justify-between border-b border-slate-50">
						<h3 className="text-[14px] font-bold text-slate-900 tracking-tight">
							Sự cố cần xử lý ({stats.upcomingStats?.incidents || 0})
						</h3>
						<div className="flex items-center gap-3">
							<div className="relative">
								<select className="text-[12px] font-bold border border-slate-200 rounded-xl px-3 py-1.5 text-slate-500 bg-white cursor-pointer hover:border-brand-primary/30 transition-all outline-none appearance-none pr-8">
									<option>Hôm nay</option>
									<option>3 ngày trước</option>
									<option>7 ngày trước</option>
								</select>
								<Calendar className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
							</div>
							<div className="w-8 h-8 flex items-center justify-center text-slate-300 hover:text-slate-500 transition-colors cursor-pointer">
								<TrendingUp className="w-4 h-4" />
							</div>
						</div>
					</div>

					<div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[#fdfdfd]">
						<div className="relative mb-8">
							<div className="w-32 h-32 bg-linear-to-b from-slate-50 to-white rounded-full flex items-center justify-center relative z-10">
								<div className="w-24 h-24 bg-white rounded-full shadow-lg shadow-slate-100 flex items-center justify-center">
									<AlertCircle className="w-12 h-12 text-slate-100" />
								</div>
							</div>
							<div className="absolute -bottom-2 -right-2 w-10 h-10 bg-brand-bg rounded-2xl flex items-center justify-center animate-bounce duration-3000">
								<div className="w-2 h-2 bg-brand-primary rounded-full" />
							</div>
						</div>
						<h4 className="text-[18px] font-black text-slate-800 mb-2">Không có sự cố nào cần xử lý</h4>
						<p className="text-[13px] font-medium text-slate-400 max-w-64 leading-relaxed">
							Khi có báo cáo về sự cố, bạn có thể kiểm tra và xử lý ở đây.
						</p>
					</div>
				</motion.div>

				{/* Section: Overdue Invoices */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.3 }}
					className="bg-white rounded-[24px] border border-slate-100 shadow-sm overflow-hidden flex flex-col min-h-[400px]"
				>
					<div className="px-6 py-5 flex items-center justify-between border-b border-slate-50">
						<h3 className="text-[14px] font-bold text-slate-900 tracking-tight">
							Hoá đơn quá hạn chưa thanh toán ({stats.upcomingStats?.overdueInvoices || 0})
						</h3>
					</div>

					<div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[#fdfdfd]">
						<div className="relative mb-8">
							<div className="w-32 h-32 bg-linear-to-b from-slate-50 to-white rounded-full flex items-center justify-center relative z-10">
								<div className="w-24 h-24 bg-white rounded-full shadow-lg shadow-slate-100 flex items-center justify-center">
									<DollarSign className="w-12 h-12 text-slate-100" />
								</div>
							</div>
						</div>
						<h4 className="text-[18px] font-black text-slate-800 mb-2">Không hoá đơn quá hạn nào</h4>
						<p className="text-[13px] font-medium text-slate-400 max-w-64 leading-relaxed">
							Khi có hoá đơn quá hạn chưa thanh toán, bạn có thể kiểm tra và xử lý ở đây.
						</p>
					</div>
				</motion.div>
			</div>

			{/* Section: Today's Appointments */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.4 }}
				className="bg-white rounded-[24px] border border-slate-100 shadow-sm overflow-hidden"
			>
				<div className="px-6 py-5 border-b border-slate-50">
					<h3 className="text-[14px] font-bold text-slate-900 tracking-tight">
						Xem phòng hôm nay ({stats.upcomingStats?.todayAppointments || 0})
					</h3>
				</div>
				<div className="p-12 flex flex-col items-center justify-center text-center">
					<div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center mb-4 text-slate-300">
						<Calendar className="w-8 h-8" />
					</div>
					<p className="text-[13px] font-bold text-slate-400">Hôm nay chưa có lịch hẹn xem phòng nào.</p>
				</div>
			</motion.div>
		</div>
	);
};

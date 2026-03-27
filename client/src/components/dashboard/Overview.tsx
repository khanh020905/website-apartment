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
	Building2,
	Home,
	Users,
	TrendingUp,
	Calendar,
	AlertCircle,
	ArrowUpRight,
	ArrowDownRight,
	DollarSign,
} from "lucide-react";
import type { DashboardStats, Contract } from "../../../../shared/types";

interface SummaryCardProps {
	label: string;
	value: string | number;
	icon: React.ReactNode;
	color: string;
	trend?: {
		value: number;
		isUp: boolean;
	};
}

const SummaryCard = ({ label, value, icon, color, trend }: SummaryCardProps) => (
	<motion.div
		initial={{ opacity: 0, y: 10 }}
		animate={{ opacity: 1, y: 0 }}
		className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
	>
		<div className="flex items-center justify-between mb-4">
			<div className={`p-4 rounded-2xl ${color} bg-opacity-10 text-${color.split("-")[1]}-600`}>
				{icon}
			</div>
			{trend && (
				<div
					className={`flex items-center text-xs font-bold ${trend.isUp ? "text-emerald-500" : "text-rose-500"}`}
				>
					{trend.isUp ?
						<ArrowUpRight className="w-3 h-3 mr-0.5" />
					:	<ArrowDownRight className="w-3 h-3 mr-0.5" />}
					{trend.value}%
				</div>
			)}
		</div>
		<div className="space-y-1">
			<h3 className="text-3xl font-black text-slate-900 tracking-tight">{value}</h3>
			<p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{label}</p>
		</div>
	</motion.div>
);

interface OverviewProps {
	stats: DashboardStats;
}

export const Overview = ({ stats }: OverviewProps) => {
	// Mock data for occupancy chart (last 6 months)
	const chartData = [
		{ month: "T10", rate: 82 },
		{ month: "T11", rate: 85 },
		{ month: "T12", rate: 80 },
		{ month: "T1", rate: 88 },
		{ month: "T2", rate: 92 },
		{ month: "T3", rate: Math.round(stats.occupancyRate) },
	];

	const formatPrice = (p: number) => {
		return (
			new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" })
				.format(p)
				.replace("₫", "")
				.trim() + " ₫"
		);
	};

	const revTrend =
		stats.revenue.last > 0 ?
			{
				value: Math.round(
					((stats.revenue.current - stats.revenue.last) / stats.revenue.last) * 100,
				),
				isUp: stats.revenue.current >= stats.revenue.last,
			}
		:	undefined;

	return (
		<div className="space-y-6">
			{/* Quick Stats Grid */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
				<SummaryCard
					label="Tổng phòng"
					value={stats.totalRooms}
					icon={<Building2 className="w-6 h-6" />}
					color="bg-blue-500"
				/>
				<SummaryCard
					label="Đang sử dụng"
					value={stats.statusCounts.occupied}
					icon={<Users className="w-6 h-6" />}
					color="bg-orange-500"
					trend={{ value: 4, isUp: true }}
				/>
				<SummaryCard
					label="Phòng trống"
					value={stats.statusCounts.available}
					icon={<Home className="w-6 h-6" />}
					color="bg-emerald-500"
				/>
				<SummaryCard
					label="Doanh thu dự kiến"
					value={formatPrice(stats.revenue.current)}
					icon={<DollarSign className="w-6 h-6" />}
					color="bg-indigo-500"
					trend={revTrend}
				/>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Occupancy Chart */}
				<div className="lg:col-span-2 bg-white p-6 rounded-4xl border border-slate-100 shadow-sm">
					<div className="flex items-center justify-between mb-8">
						<div>
							<h3 className="text-lg font-black text-slate-900">Tỷ lệ lấp đầy</h3>
							<p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
								Xu hướng 6 tháng gần nhất
							</p>
						</div>
						<div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-xl">
							<TrendingUp className="w-4 h-4 text-emerald-600" />
							<span className="text-sm font-black text-emerald-700">
								{Math.round(stats.occupancyRate)}%
							</span>
						</div>
					</div>

					<div className="h-75 w-full min-w-0">
						<ResponsiveContainer
							width="100%"
							height="100%"
							minWidth={0}
						>
							<AreaChart
								data={chartData}
								margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
							>
								<defs>
									<linearGradient
										id="colorRate"
										x1="0"
										y1="0"
										x2="0"
										y2="1"
									>
										<stop
											offset="5%"
											stopColor="#10b981"
											stopOpacity={0.1}
										/>
										<stop
											offset="95%"
											stopColor="#10b981"
											stopOpacity={0}
										/>
									</linearGradient>
								</defs>
								<CartesianGrid
									strokeDasharray="3 3"
									vertical={false}
									stroke="#f1f5f9"
								/>
								<XAxis
									dataKey="month"
									axisLine={false}
									tickLine={false}
									tick={{ fill: "#94a3b8", fontSize: 12, fontWeight: 700 }}
									dy={10}
								/>
								<YAxis
									hide={true}
									domain={[0, 100]}
								/>
								<Tooltip
									contentStyle={{
										borderRadius: "16px",
										border: "none",
										boxShadow: "0 20px 50px rgba(0,0,0,0.05)",
										padding: "12px 16px",
									}}
									labelStyle={{ fontWeight: 800, marginBottom: "4px", color: "#1e293b" }}
								/>
								<Area
									type="monotone"
									dataKey="rate"
									stroke="#10b981"
									strokeWidth={4}
									fillOpacity={1}
									fill="url(#colorRate)"
									animationDuration={1500}
								/>
							</AreaChart>
						</ResponsiveContainer>
					</div>
				</div>

				{/* Expiring Contracts / Notifications */}
				<div className="space-y-6">
					<div className="bg-white p-6 rounded-4xl border border-slate-100 shadow-sm h-full">
						<h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
							<Calendar className="w-5 h-5 text-indigo-500" />
							Sắp hết hạn
						</h3>

						<div className="space-y-4">
							{stats.expiringContracts.d7.length > 0 && (
								<div className="p-4 bg-rose-50 rounded-2xl border border-rose-100">
									<div className="flex items-center justify-between mb-1">
										<span className="text-[10px] font-black text-rose-600 uppercase tracking-widest">
											Trong 7 ngày tới
										</span>
										<AlertCircle className="w-4 h-4 text-rose-500" />
									</div>
									<p className="text-sm font-black text-rose-900">
										{stats.expiringContracts.d7.length} hợp đồng cần gia hạn
									</p>
								</div>
							)}

							{stats.expiringContracts.d30.length > 0 ?
								<div className="space-y-2">
									{stats.expiringContracts.d30.slice(0, 4).map((c: Contract) => (
										<div
											key={c.id}
											className="flex items-center justify-between p-3 rounded-xl border border-slate-50 hover:bg-slate-50 transition-colors"
										>
											<div>
												<p className="text-sm font-bold text-slate-800">{c.tenant_name}</p>
												<p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">
													{c.end_date}
												</p>
											</div>
											<button className="text-[10px] font-black text-indigo-600 hover:text-indigo-800 uppercase tracking-widest px-3 py-1 bg-indigo-50 rounded-lg">
												Gia hạn
											</button>
										</div>
									))}
									{stats.expiringContracts.d30.length > 4 && (
										<button className="w-full py-2 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors">
											Xem tất cả ({stats.expiringContracts.d30.length})
										</button>
									)}
								</div>
							:	<div className="py-10 text-center space-y-3">
									<div className="w-12 h-12 bg-slate-50 text-slate-300 rounded-2xl flex items-center justify-center mx-auto">
										<Calendar className="w-6 h-6" />
									</div>
									<p className="text-sm font-bold text-slate-400">
										Không có hợp đồng nào sắp hết hạn
									</p>
								</div>
							}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

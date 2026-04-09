import { useState } from "react";
import { motion } from "framer-motion";
import { Check, X, Shield, Users, Home, ArrowRight, Minus } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import type { UserRole, SubscriptionTier } from "../../../shared/types";

const PRICING_PLANS = [
	{
		id: "user",
		name: "Gói Miễn phí (User)",
		price: "0đ",
		role: "user" as UserRole,
		tier: "free" as SubscriptionTier,
		description: "Dành cho khách hàng tìm kiếm phòng trọ.",
		icon: Users,
		color: "slate",
		features: {
			rooms: "Co",
			filters: "Co",
			map: "Co",
			view_qr: "Co",
			posting: "Khong",
			buildings: "Khong",
			create_qr: "Khong",
			contracts: "Khong",
			revenue: "Khong",
			verification: "Khong cần",
		},
	},
	{
		id: "broker",
		name: "Gói Môi giới (Broker)",
		price: "199.000đ",
		period: "/tháng",
		role: "broker" as UserRole,
		tier: "broker_basic" as SubscriptionTier,
		description: "Dành cho cá nhân/tổ chức môi giới chuyên nghiệp.",
		icon: Shield,
		color: "teal",
		features: {
			rooms: "Co",
			filters: "Co",
			map: "Co",
			view_qr: "Co",
			posting: "Co",
			buildings: "Co",
			create_qr: "Co",
			contracts: "Han che",
			revenue: "Co",
			verification: "Cần (Admin duyệt)",
		},
	},
	{
		id: "landlord",
		name: "Gói Chủ nhà (Landlord)",
		price: "499.000đ",
		period: "/tháng",
		role: "landlord" as UserRole,
		tier: "landlord_basic" as SubscriptionTier,
		description: "Giải pháp quản lý tòa nhà và dòng tiền toàn diện.",
		icon: Home,
		color: "indigo",
		features: {
			rooms: "Co",
			filters: "Co",
			map: "Co",
			view_qr: "Co",
			posting: "Co",
			buildings: "Co",
			create_qr: "Co",
			contracts: "Co",
			revenue: "Co",
			verification: "Cần (Admin duyệt)",
		},
	},
];

const FEATURE_LABELS = [
	{ key: "rooms", label: "Xem danh sách & chi tiết phòng" },
	{ key: "filters", label: "Tìm kiếm & bộ lọc nâng cao" },
	{ key: "map", label: "Xem bản đồ địa điểm" },
	{ key: "view_qr", label: "Xem QR trạng thái tòa" },
	{ key: "posting", label: "Đăng tin cho thuê" },
	{ key: "buildings", label: "Tạo/sửa/xóa tòa nhà" },
	{ key: "create_qr", label: "Tạo mã QR tòa nhà" },
	{ key: "contracts", label: "Quản lý đặt phòng & hợp đồng" },
	{ key: "revenue", label: "Xem báo cáo doanh thu" },
	{ key: "verification", label: "Kiểm duyệt tài khoản" },
];

const PricingPage = () => {
	const { user, upgradeAccount } = useAuth();
	const navigate = useNavigate();
	const [loading, setLoading] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);

	const handleUpgrade = async (role: UserRole, tier: SubscriptionTier) => {
		if (!user) {
			navigate("/login");
			return;
		}

		setLoading(role);
		setError(null);

		const result = await upgradeAccount(role, tier);
		setLoading(null);

		if (result.error) {
			setError(result.error);
		} else {
			if (role !== "user") navigate("/dashboard");
			else navigate("/");
		}
	};

	return (
		<div className="flex-1 overflow-y-auto bg-slate-50 font-sans">
			<div className="max-w-7xl mx-auto px-6 py-12 md:py-20">
				{/* Header */}
				<div className="text-center mb-16">
					<motion.h1
						initial={{ opacity: 0, y: -20 }}
						animate={{ opacity: 1, y: 0 }}
						className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight"
					>
						Bảng so sánh tính năng <span className="text-brand-primary">HomeSpot</span>
					</motion.h1>
					<motion.p
						initial={{ opacity: 0, y: -10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.1 }}
						className="text-lg text-slate-500 max-w-2xl mx-auto font-medium"
					>
						Lựa chọn gói dịch vụ phù hợp với nhu cầu của bạn.
					</motion.p>

					{error && (
						<motion.div
							initial={{ opacity: 0, scale: 0.9 }}
							animate={{ opacity: 1, scale: 1 }}
							className="mt-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm font-bold inline-block"
						>
							{error}
						</motion.div>
					)}
				</div>

				{/* Pricing Cards */}
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-20">
					{PRICING_PLANS.map((plan, idx) => {
						const isCurrentPlan =
							user?.profile?.role === plan.role &&
							(user?.profile?.subscription === plan.tier ||
								(!user?.profile?.subscription && plan.tier === "free"));

						return (
							<motion.div
								key={plan.id}
								initial={{ opacity: 0, y: 30 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: idx * 0.1 + 0.2 }}
								className={`relative bg-white rounded-[40px] p-8 transition-all duration-300 flex flex-col ${
									isCurrentPlan ?
										plan.color === "teal" || plan.color === "indigo" ?
											"border-4 border-brand-primary shadow-2xl shadow-brand-primary/10 scale-105 z-10"
										:	"border-4 border-slate-900 shadow-2xl shadow-slate-900/10 scale-105 z-10"
									:	"border-2 border-slate-100 hover:border-slate-300 hover:shadow-xl hover:shadow-slate-900/3"
								}`}
							>
								{isCurrentPlan && (
									<div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-1.5 rounded-full text-xs font-black uppercase tracking-widest shadow-lg flex items-center gap-2 whitespace-nowrap">
										<Check
											size={12}
											strokeWidth={4}
										/>
										Gói của bạn
									</div>
								)}

								<div className="mb-8">
									<div
										className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-sm border ${
											plan.color === "teal" ? "bg-teal-50 text-teal-600 border-teal-100"
											: plan.color === "indigo" ? "bg-indigo-50 text-indigo-600 border-indigo-100"
											: "bg-slate-50 text-slate-600 border-slate-100"
										}`}
									>
										<plan.icon size={28} />
									</div>
									<h3 className="text-xl font-black text-slate-900 mb-2">{plan.name}</h3>
									<p className="text-sm text-slate-500 font-medium leading-relaxed min-h-10">
										{plan.description}
									</p>
								</div>

								<div className="mb-8 flex items-baseline gap-1">
									<span className="text-4xl font-black text-slate-900">{plan.price}</span>
									{plan.period && (
										<span className="text-sm text-slate-400 font-bold">{plan.period}</span>
									)}
								</div>

								<div className="space-y-4 mb-10 flex-1">
									{FEATURE_LABELS.slice(0, 6).map((f) => {
										const val = plan.features[f.key as keyof typeof plan.features];
										return (
											<div
												key={f.key}
												className="flex items-start gap-3"
											>
												<div
													className={`mt-0.5 rounded-full p-0.5 ${val === "Khong" ? "text-slate-300" : "text-brand-primary bg-brand-bg uppercase"}`}
												>
													{val === "Khong" ?
														<X size={14} />
													: val === "Han che" ?
														<Minus size={14} />
													:	<Check
															size={14}
															strokeWidth={4}
														/>
													}
												</div>
												<div className="flex flex-col">
													<span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
														{f.label}
													</span>
													<span
														className={`text-sm font-black ${val === "Khong" ? "text-slate-400 line-through opacity-50" : "text-slate-800"}`}
													>
														{val === "Co" ?
															"Có"
														: val === "Khong" ?
															"Không"
														:	"Hạn chế"}
													</span>
												</div>
											</div>
										);
									})}
								</div>

								<button
									onClick={() => handleUpgrade(plan.role, plan.tier)}
									disabled={loading !== null || isCurrentPlan}
									className={`w-full py-4 rounded-2xl font-black text-sm transition-all duration-300 flex items-center justify-center gap-2 group ${
										isCurrentPlan ?
											"bg-slate-100 text-slate-400 border-2 border-slate-200 cursor-default"
										: plan.color === "teal" || plan.color === "indigo" ?
											"bg-brand-primary text-white hover:bg-brand-dark shadow-xl shadow-brand-primary/20 active:scale-95"
										:	"bg-white text-slate-900 border-2 border-slate-200 hover:border-slate-300 active:scale-95"
									}`}
								>
									{loading === plan.role ?
										<div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
									: isCurrentPlan ?
										"Đang sử dụng"
									:	<>
											<span>Bắt đầu ngay</span>
											<ArrowRight
												size={18}
												className="transition-transform group-hover:translate-x-1"
											/>
										</>
									}
								</button>
							</motion.div>
						);
					})}
				</div>

				{/* Feature Comparison Table (Desktop visual) */}
				<div className="hidden md:block">
					<motion.h2
						initial={{ opacity: 0 }}
						whileInView={{ opacity: 1 }}
						className="text-2xl font-black text-slate-900 mb-10 text-center"
					>
						So sánh chi tiết tính năng
					</motion.h2>

					<motion.div
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						className="bg-white rounded-[40px] border border-slate-100 overflow-hidden shadow-sm overflow-x-auto"
					>
						<table className="w-full text-left min-w-200">
							<thead>
								<tr className="bg-slate-900 text-white">
									<th className="p-6 font-black text-sm uppercase tracking-widest border-r border-white/10">
										Tính năng
									</th>
									{PRICING_PLANS.map((p) => (
										<th
											key={p.id}
											className="p-6 text-center font-black text-sm uppercase tracking-widest border-r border-white/10 last:border-0"
										>
											{p.name}
										</th>
									))}
								</tr>
							</thead>
							<tbody>
								{FEATURE_LABELS.map((f, idx) => (
									<tr
										key={f.key}
										className={idx % 2 === 0 ? "bg-white" : "bg-slate-50/50"}
									>
										<td className="p-6 text-sm font-bold text-slate-600 border-r border-slate-100">
											{f.label}
										</td>
										{PRICING_PLANS.map((p) => {
											const val = p.features[f.key as keyof typeof p.features];
											const isCurrentPackage =
												user?.profile?.role === p.role &&
												(user?.profile?.subscription === p.tier ||
													(!user?.profile?.subscription && p.tier === "free"));
											return (
												<td
													key={p.id}
													className={`p-6 text-center border-r border-slate-100 last:border-0 ${isCurrentPackage ? "bg-slate-50/50" : ""}`}
												>
													{val === "Co" ?
														<div className="flex justify-center">
															<Check
																className="text-teal-600"
																size={20}
																strokeWidth={3}
															/>
														</div>
													: val === "Khong" ?
														<div className="flex justify-center">
															<X
																className="text-slate-300"
																size={20}
															/>
														</div>
													: val === "Han che" ?
														<div className="flex justify-center">
															<Minus
																className="text-brand-primary"
																size={20}
																strokeWidth={3}
															/>
														</div>
													:	<span className="text-[10px] font-black text-slate-400 uppercase tracking-tight">
															{val}
														</span>
													}
												</td>
											);
										})}
									</tr>
								))}
								{/* Special Row for Verification Logic */}
								<tr className="bg-indigo-50/30">
									<td className="p-6 text-sm font-bold text-slate-600 border-r border-slate-100">
										Cơ chế kiểm duyệt
									</td>
									<td className="p-6 text-center border-r border-slate-100 italic text-[10px] text-slate-400 font-bold px-4">
										Tìm kiếm công khai
									</td>
									<td
										colSpan={2}
										className="p-6 text-center italic text-[10px] text-indigo-600 font-bold px-10 leading-relaxed uppercase tracking-wider"
									>
										"Kiểm duyệt tài khoản chủ nhà hay môi giới, nếu thông qua kiểm duyệt thì không
										cần kiểm duyệt tin đăng"
									</td>
								</tr>
							</tbody>
						</table>
					</motion.div>
				</div>
			</div>
		</div>
	);
};

export default PricingPage;

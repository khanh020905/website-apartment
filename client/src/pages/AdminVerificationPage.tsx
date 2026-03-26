import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../lib/api";
import {
	LISTING_STATUS_LABELS,
	PROPERTY_TYPE_LABELS,
	type Listing,
	type ListingReview,
	type ListingReviewChecklist,
	type ListingStatus,
	type PropertyType,
	type UserRole,
} from "../../../shared/types";

interface ListingWithProfile extends Listing {
	profiles?: { full_name: string; phone: string; email: string };
	assigned_inspector?: { full_name: string; email: string };
}

interface StaffProfile {
	id: string;
	full_name: string | null;
	email: string | null;
	role: UserRole;
}

interface Stats {
	totalUsers: number;
	totalListings: number;
	pendingListings: number;
	approvedListings: number;
	totalBuildings: number;
	totalRooms: number;
}

interface ReviewStats {
	reviewedThisWeek: number;
	reviewedThisMonth: number;
	approvedThisWeek: number;
	approvedThisMonth: number;
	rejectedThisWeek: number;
	rejectedThisMonth: number;
}

interface UserProfile {
	id: string;
	full_name: string;
	email: string;
	phone: string;
	role: string;
	is_verified: boolean;
	subscription_tier: string;
	created_at: string;
}

interface ListingFilters {
	city: string;
	district: string;
	ward: string;
	property_type: "" | PropertyType;
	submitter: string;
	created_from: string;
	created_to: string;
}

const DEFAULT_FILTERS: ListingFilters = {
	city: "",
	district: "",
	ward: "",
	property_type: "",
	submitter: "",
	created_from: "",
	created_to: "",
};

const CHECKLIST_ITEMS: Array<{ key: keyof ListingReviewChecklist; label: string }> = [
	{ key: "addressMatched", label: "Địa chỉ khớp thực tế" },
	{ key: "roomConditionMatched", label: "Tình trạng phòng khớp" },
	{ key: "amenitiesMatched", label: "Tiện nghi khớp thực tế" },
	{ key: "imagesMatched", label: "Ảnh đúng hiện trạng" },
];

const STATUS_STYLES: Record<ListingStatus, string> = {
	draft: "bg-slate-100 text-slate-600",
	pending: "bg-yellow-100 text-yellow-700",
	approved: "bg-emerald-100 text-emerald-700",
	rejected: "bg-red-100 text-red-700",
};

export default function AdminVerificationPage() {
	const [tab, setTab] = useState<"pending" | "all" | "stats" | "users">("pending");
	const [pending, setPending] = useState<ListingWithProfile[]>([]);
	const [allListings, setAllListings] = useState<ListingWithProfile[]>([]);
	const [stats, setStats] = useState<Stats | null>(null);
	const [reviewStats, setReviewStats] = useState<ReviewStats | null>(null);
	const [loading, setLoading] = useState(true);
	const [filters, setFilters] = useState<ListingFilters>(DEFAULT_FILTERS);
	const [reviewNotes, setReviewNotes] = useState<Record<string, string>>({});
	const [reviewChecklist, setReviewChecklist] = useState<Record<string, ListingReviewChecklist>>(
		{},
	);
	const [reviewingId, setReviewingId] = useState<string | null>(null);
	const [users, setUsers] = useState<UserProfile[]>([]);
	const [staff, setStaff] = useState<StaffProfile[]>([]);
	const [assigning, setAssigning] = useState<Record<string, string>>({});
	const [reviewHistory, setReviewHistory] = useState<Record<string, ListingReview[]>>({});

	useEffect(() => {
		void loadData();

		void loadStaff();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const buildQuery = (targetFilters: ListingFilters) => {
		const params = new URLSearchParams();
		if (targetFilters.city) params.set("city", targetFilters.city);
		if (targetFilters.district) params.set("district", targetFilters.district);
		if (targetFilters.ward) params.set("ward", targetFilters.ward);
		if (targetFilters.property_type) params.set("property_type", targetFilters.property_type);
		if (targetFilters.submitter) params.set("submitter", targetFilters.submitter);
		if (targetFilters.created_from) params.set("created_from", targetFilters.created_from);
		if (targetFilters.created_to) params.set("created_to", targetFilters.created_to);
		return params.toString();
	};

	const loadData = async (targetFilters: ListingFilters = filters) => {
		setLoading(true);
		const query = buildQuery(targetFilters);
		const [pendingRes, statsRes, reviewStatsRes] = await Promise.all([
			api.get<{ listings: ListingWithProfile[] }>(
				`/api/admin/listings/pending${query ? `?${query}` : ""}`,
			),
			api.get<{ stats: Stats }>("/api/admin/stats"),
			api.get<{ stats: ReviewStats }>("/api/admin/reviews/stats"),
		]);
		if (pendingRes.data) setPending(pendingRes.data.listings);
		if (statsRes.data) setStats(statsRes.data.stats);
		if (reviewStatsRes.data) setReviewStats(reviewStatsRes.data.stats);
		setLoading(false);
	};

	const loadAllListings = async (targetFilters: ListingFilters = filters) => {
		const query = buildQuery(targetFilters);
		const { data } = await api.get<{ listings: ListingWithProfile[] }>(
			`/api/admin/listings/all${query ? `?${query}` : ""}`,
		);
		if (data) setAllListings(data.listings);
	};

	const loadStaff = async () => {
		const { data } = await api.get<{ staff: StaffProfile[] }>("/api/admin/staff");
		if (data) setStaff(data.staff);
	};

	const loadUsers = async () => {
		const { data } = await api.get<{ users: UserProfile[] }>("/api/admin/users");
		if (data) setUsers(data.users);
	};

	const loadReviewHistory = async (listingId: string) => {
		const { data } = await api.get<{ reviews: ListingReview[] }>(
			`/api/admin/listings/${listingId}/reviews`,
		);
		if (data) {
			setReviewHistory((prev) => ({ ...prev, [listingId]: data.reviews }));
		}
	};

	const handleReview = async (listingId: string, action: "approved" | "rejected") => {
		await api.post(`/api/admin/listings/${listingId}/review`, {
			action,
			notes: reviewNotes[listingId] || "",
			checklist: reviewChecklist[listingId] || null,
		});
		setReviewingId(null);
		await loadData();
		if (tab === "all") {
			await loadAllListings();
		}
	};

	const handleVerifyUser = async (userId: string, isVerified: boolean) => {
		await api.put(`/api/admin/users/${userId}/verify`, { is_verified: isVerified });
		await loadUsers();
	};

	const handleAssign = async (listingId: string) => {
		const selectedInspectorId = assigning[listingId];
		if (!selectedInspectorId) {
			return;
		}
		await api.put(`/api/admin/listings/${listingId}/assign`, { inspector_id: selectedInspectorId });
		await loadData();
	};

	const onApplyFilters = async () => {
		await loadData(filters);
		if (tab === "all") {
			await loadAllListings(filters);
		}
	};

	return (
		<div className="flex-1 overflow-y-auto bg-slate-50">
			<div className="max-w-6xl mx-auto p-6">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
				>
					<h1 className="text-3xl font-extrabold text-slate-900 mb-2">Quản trị Check Legit</h1>
					<p className="text-slate-500 mb-6">
						Duyệt tin đăng, phân công kiểm tra thực tế và theo dõi lịch sử duyệt
					</p>
				</motion.div>

				<div className="bg-white border border-slate-200 rounded-2xl p-4 mb-5">
					<h2 className="font-semibold text-slate-800 mb-3">Bộ lọc kiểm duyệt</h2>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-3">
						<input
							value={filters.city}
							onChange={(e) => setFilters((prev) => ({ ...prev, city: e.target.value }))}
							placeholder="Tỉnh/TP"
							className="px-3 py-2 border border-slate-200 rounded-lg text-sm"
						/>
						<input
							value={filters.district}
							onChange={(e) => setFilters((prev) => ({ ...prev, district: e.target.value }))}
							placeholder="Quận/Huyện"
							className="px-3 py-2 border border-slate-200 rounded-lg text-sm"
						/>
						<input
							value={filters.ward}
							onChange={(e) => setFilters((prev) => ({ ...prev, ward: e.target.value }))}
							placeholder="Phường/Xã"
							className="px-3 py-2 border border-slate-200 rounded-lg text-sm"
						/>
						<select
							value={filters.property_type}
							onChange={(e) =>
								setFilters((prev) => ({
									...prev,
									property_type: e.target.value as "" | PropertyType,
								}))
							}
							className="px-3 py-2 border border-slate-200 rounded-lg text-sm"
						>
							<option value="">Loại hình bất kỳ</option>
							{Object.entries(PROPERTY_TYPE_LABELS).map(([key, label]) => (
								<option
									key={key}
									value={key}
								>
									{label}
								</option>
							))}
						</select>
						<input
							value={filters.submitter}
							onChange={(e) => setFilters((prev) => ({ ...prev, submitter: e.target.value }))}
							placeholder="Người nộp (tên/email)"
							className="px-3 py-2 border border-slate-200 rounded-lg text-sm"
						/>
						<div className="grid grid-cols-2 gap-2">
							<input
								type="date"
								value={filters.created_from}
								onChange={(e) => setFilters((prev) => ({ ...prev, created_from: e.target.value }))}
								className="px-3 py-2 border border-slate-200 rounded-lg text-sm"
							/>
							<input
								type="date"
								value={filters.created_to}
								onChange={(e) => setFilters((prev) => ({ ...prev, created_to: e.target.value }))}
								className="px-3 py-2 border border-slate-200 rounded-lg text-sm"
							/>
						</div>
					</div>
					<div className="flex items-center gap-2 mt-3">
						<button
							onClick={() => void onApplyFilters()}
							className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold cursor-pointer hover:bg-emerald-700"
						>
							Áp dụng lọc
						</button>
						<button
							onClick={() => {
								setFilters(DEFAULT_FILTERS);
								void loadData(DEFAULT_FILTERS);
								if (tab === "all") {
									void loadAllListings(DEFAULT_FILTERS);
								}
							}}
							className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-semibold cursor-pointer"
						>
							Xóa lọc
						</button>
					</div>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
					<div className="rounded-2xl p-4 border bg-yellow-50 border-yellow-200">
						<p className="text-sm text-yellow-700 font-semibold">Chờ duyệt</p>
						<p className="text-2xl font-extrabold text-slate-900">{stats?.pendingListings || 0}</p>
					</div>
					<div className="rounded-2xl p-4 border bg-blue-50 border-blue-200">
						<p className="text-sm text-blue-700 font-semibold">Đã duyệt 7 ngày</p>
						<p className="text-2xl font-extrabold text-slate-900">
							{reviewStats?.reviewedThisWeek || 0}
						</p>
					</div>
					<div className="rounded-2xl p-4 border bg-indigo-50 border-indigo-200">
						<p className="text-sm text-indigo-700 font-semibold">Đã duyệt 30 ngày</p>
						<p className="text-2xl font-extrabold text-slate-900">
							{reviewStats?.reviewedThisMonth || 0}
						</p>
					</div>
				</div>

				<div className="flex gap-2 mb-6">
					{[
						{
							key: "pending",
							label: `Chờ duyệt (${pending.length})`,
							onClick: () => setTab("pending"),
						},
						{
							key: "all",
							label: "Tất cả tin",
							onClick: () => {
								setTab("all");
								void loadAllListings();
							},
						},
						{
							key: "users",
							label: "Người dùng",
							onClick: () => {
								setTab("users");
								void loadUsers();
							},
						},
						{ key: "stats", label: "Thống kê", onClick: () => setTab("stats") },
					].map((t) => (
						<button
							key={t.key}
							onClick={t.onClick}
							className={`px-5 py-2.5 rounded-xl text-sm font-semibold cursor-pointer transition-all ${
								tab === t.key ?
									"bg-emerald-700 text-white shadow-lg shadow-emerald-900/20"
								:	"bg-white text-slate-600 border border-slate-200"
							}`}
						>
							{t.label}
						</button>
					))}
				</div>

				{tab === "stats" && stats && reviewStats && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						className="grid grid-cols-1 md:grid-cols-3 gap-4"
					>
						{[
							{
								label: "Tổng người dùng",
								value: stats.totalUsers,
								icon: "👥",
								color: "bg-blue-50 border-blue-200",
							},
							{
								label: "Tổng tin đăng",
								value: stats.totalListings,
								icon: "📋",
								color: "bg-emerald-50 border-emerald-200",
							},
							{
								label: "Đã duyệt 7 ngày",
								value: reviewStats.reviewedThisWeek,
								icon: "📆",
								color: "bg-purple-50 border-purple-200",
							},
							{
								label: "Đã duyệt 30 ngày",
								value: reviewStats.reviewedThisMonth,
								icon: "🗓️",
								color: "bg-indigo-50 border-indigo-200",
							},
							{
								label: "Từ chối 7 ngày",
								value: reviewStats.rejectedThisWeek,
								icon: "❌",
								color: "bg-red-50 border-red-200",
							},
							{
								label: "Từ chối 30 ngày",
								value: reviewStats.rejectedThisMonth,
								icon: "⛔",
								color: "bg-rose-50 border-rose-200",
							},
						].map((s) => (
							<div
								key={s.label}
								className={`rounded-2xl p-5 border-2 ${s.color}`}
							>
								<span className="text-2xl">{s.icon}</span>
								<p className="text-3xl font-extrabold text-slate-900 mt-2">{s.value}</p>
								<p className="text-sm text-slate-500">{s.label}</p>
							</div>
						))}
					</motion.div>
				)}

				{tab === "pending" && (
					<div>
						{loading ?
							<p className="text-center text-slate-400 py-10">Đang tải...</p>
						: pending.length === 0 ?
							<div className="text-center py-20">
								<div className="text-6xl mb-4">🎉</div>
								<h2 className="text-xl font-bold text-slate-700">Không có tin nào cần duyệt</h2>
							</div>
						:	<div className="space-y-4">
								{pending.map((listing, i) => (
									<motion.div
										key={listing.id}
										initial={{ opacity: 0, y: 20 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ delay: i * 0.05 }}
										className="bg-white rounded-2xl border border-slate-200 overflow-hidden"
									>
										<div className="flex">
											<div className="w-56 h-44 shrink-0">
												<img
													src={
														listing.images?.[0]?.url ||
														(listing.images?.[0] as unknown as string) ||
														"https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=300&h=200&fit=crop"
													}
													alt={listing.title}
													className="w-full h-full object-cover"
												/>
											</div>
											<div className="flex-1 p-5">
												<div className="flex items-start justify-between">
													<div>
														<h3 className="font-bold text-slate-800 text-lg">{listing.title}</h3>
														<p className="text-sm text-slate-500">{listing.address}</p>
													</div>
													<span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-bold rounded-full">
														Chờ duyệt
													</span>
												</div>
												<div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
													<span className="font-bold text-emerald-700">
														{(listing.price / 1000000).toFixed(1)} triệu/th
													</span>
													{listing.area && <span>{listing.area} m²</span>}
													<span>{PROPERTY_TYPE_LABELS[listing.property_type]}</span>
													<span>{listing.bedrooms} PN</span>
												</div>
												{listing.profiles && (
													<p className="text-xs text-slate-400 mt-2">
														Đăng bởi: {listing.profiles.full_name} —{" "}
														{listing.profiles.phone || listing.profiles.email}
													</p>
												)}

												<div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-2 items-center">
													<select
														value={assigning[listing.id] || listing.assigned_inspector_id || ""}
														onChange={(e) =>
															setAssigning((prev) => ({ ...prev, [listing.id]: e.target.value }))
														}
														className="px-3 py-2 border border-slate-200 rounded-lg text-sm"
													>
														<option value="">Chọn người kiểm tra thực tế</option>
														{staff.map((member) => (
															<option
																key={member.id}
																value={member.id}
															>
																{member.full_name || member.email || member.id} ({member.role})
															</option>
														))}
													</select>
													<button
														onClick={() => void handleAssign(listing.id)}
														className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold cursor-pointer hover:bg-blue-700"
													>
														Phân công
													</button>
													<p className="text-xs text-slate-500">
														{listing.assigned_inspector ?
															`Đã giao: ${listing.assigned_inspector.full_name || listing.assigned_inspector.email}`
														:	"Chưa phân công"}
													</p>
												</div>

												<AnimatePresence>
													{reviewingId === listing.id ?
														<motion.div
															initial={{ opacity: 0, height: 0 }}
															animate={{ opacity: 1, height: "auto" }}
															exit={{ opacity: 0, height: 0 }}
															className="mt-3 border border-slate-200 rounded-xl p-3 bg-slate-50"
														>
															<p className="text-sm font-semibold text-slate-700 mb-2">
																Checklist kiểm tra tại chỗ
															</p>
															<div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
																{CHECKLIST_ITEMS.map((item) => (
																	<label
																		key={item.key}
																		className="flex items-center gap-2 text-sm text-slate-700"
																	>
																		<input
																			type="checkbox"
																			checked={!!reviewChecklist[listing.id]?.[item.key]}
																			onChange={(e) => {
																				setReviewChecklist((prev) => ({
																					...prev,
																					[listing.id]: {
																						...prev[listing.id],
																						[item.key]: e.target.checked,
																					},
																				}));
																			}}
																		/>
																		{item.label}
																	</label>
																))}
															</div>
															<textarea
																rows={2}
																placeholder="Ghi chú kiểm duyệt..."
																value={reviewNotes[listing.id] || ""}
																onChange={(e) =>
																	setReviewNotes((prev) => ({
																		...prev,
																		[listing.id]: e.target.value,
																	}))
																}
																className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-600 resize-none mb-2"
															/>
															<div className="flex gap-2">
																<button
																	onClick={() => void handleReview(listing.id, "approved")}
																	className="px-5 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold cursor-pointer hover:bg-emerald-700"
																>
																	✅ Duyệt
																</button>
																<button
																	onClick={() => void handleReview(listing.id, "rejected")}
																	className="px-5 py-2 bg-red-500 text-white rounded-lg text-sm font-semibold cursor-pointer hover:bg-red-600"
																>
																	❌ Từ chối
																</button>
																<button
																	onClick={() => setReviewingId(null)}
																	className="px-5 py-2 border border-slate-300 rounded-lg text-sm font-semibold cursor-pointer"
																>
																	Hủy
																</button>
															</div>
															<div className="mt-3">
																<button
																	onClick={() => void loadReviewHistory(listing.id)}
																	className="text-xs font-semibold text-indigo-600 cursor-pointer hover:underline"
																>
																	Tải lịch sử duyệt
																</button>
																{reviewHistory[listing.id] && (
																	<div className="mt-2 space-y-2">
																		{reviewHistory[listing.id].map((review) => (
																			<div
																				key={review.id}
																				className="text-xs bg-white border border-slate-200 rounded-lg p-2"
																			>
																				<div className="font-semibold text-slate-700">
																					{review.action === "approved" ? "Đã duyệt" : "Đã từ chối"}{" "}
																					— {new Date(review.reviewed_at).toLocaleString("vi-VN")}
																				</div>
																				{review.notes && (
																					<p className="text-slate-500 mt-1">{review.notes}</p>
																				)}
																			</div>
																		))}
																	</div>
																)}
															</div>
														</motion.div>
													:	<div className="mt-3 flex items-center gap-3">
															<button
																onClick={() => setReviewingId(listing.id)}
																className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg text-sm font-semibold cursor-pointer hover:bg-emerald-200 transition-colors"
															>
																📋 Xem xét
															</button>
															<button
																onClick={() => void loadReviewHistory(listing.id)}
																className="text-sm text-indigo-600 font-semibold cursor-pointer hover:underline"
															>
																Lịch sử duyệt
															</button>
														</div>
													}
												</AnimatePresence>

												{reviewHistory[listing.id] && reviewingId !== listing.id && (
													<div className="mt-2 space-y-2">
														{reviewHistory[listing.id].slice(0, 2).map((review) => (
															<div
																key={review.id}
																className="text-xs bg-slate-50 border border-slate-200 rounded-lg p-2"
															>
																<div className="font-semibold text-slate-700">
																	{review.action === "approved" ? "Đã duyệt" : "Đã từ chối"} —{" "}
																	{new Date(review.reviewed_at).toLocaleString("vi-VN")}
																</div>
																{review.notes && (
																	<p className="text-slate-500 mt-1">{review.notes}</p>
																)}
															</div>
														))}
													</div>
												)}
											</div>
										</div>
									</motion.div>
								))}
							</div>
						}
					</div>
				)}

				{tab === "all" && (
					<div className="space-y-3">
						{allListings.length === 0 ?
							<p className="text-center text-slate-400 py-10">Đang tải...</p>
						:	allListings.map((listing) => (
								<div
									key={listing.id}
									className="bg-white rounded-xl p-4 border border-slate-200 flex items-center gap-4"
								>
									<img
										src={
											listing.images?.[0]?.url ||
											(listing.images?.[0] as unknown as string) ||
											"https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=100&h=70&fit=crop"
										}
										alt={listing.title}
										className="w-16 h-12 rounded-lg object-cover shrink-0"
									/>
									<div className="flex-1 min-w-0">
										<p className="font-semibold text-sm text-slate-800 truncate">{listing.title}</p>
										<p className="text-xs text-slate-500">
											{listing.profiles?.full_name} • {PROPERTY_TYPE_LABELS[listing.property_type]}{" "}
											• {listing.city || "N/A"}
										</p>
									</div>
									<span
										className={`px-3 py-1 rounded-full text-xs font-bold ${STATUS_STYLES[listing.status]}`}
									>
										{LISTING_STATUS_LABELS[listing.status]}
									</span>
									<span className="text-xs text-slate-400">
										{new Date(listing.created_at).toLocaleDateString("vi-VN")}
									</span>
								</div>
							))
						}
					</div>
				)}

				{tab === "users" && (
					<div className="space-y-3">
						{users.length === 0 ?
							<p className="text-center text-slate-400 py-10">Đang tải...</p>
						:	users.map((u) => {
								const roleStyle: Record<string, string> = {
									user: "bg-slate-100 text-slate-600",
									landlord: "bg-emerald-100 text-emerald-700",
									broker: "bg-blue-100 text-blue-700",
									admin: "bg-purple-100 text-purple-700",
								};
								return (
									<div
										key={u.id}
										className="bg-white rounded-xl p-4 border border-slate-200 flex items-center gap-4"
									>
										<div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 font-bold text-sm shrink-0">
											{(u.full_name?.[0] || "?").toUpperCase()}
										</div>
										<div className="flex-1 min-w-0">
											<p className="font-semibold text-sm text-slate-800">{u.full_name}</p>
											<p className="text-xs text-slate-500">
												{u.email} • {u.phone || "N/A"}
											</p>
										</div>
										<span
											className={`px-3 py-1 rounded-full text-xs font-bold ${roleStyle[u.role] || "bg-slate-100"}`}
										>
											{u.role}
										</span>
										{(u.role === "landlord" || u.role === "broker") && (
											<button
												onClick={() => void handleVerifyUser(u.id, !u.is_verified)}
												className={`px-4 py-2 rounded-lg text-xs font-bold cursor-pointer transition-all ${
													u.is_verified ?
														"bg-emerald-600 text-white hover:bg-emerald-700"
													:	"bg-slate-200 text-slate-600 hover:bg-slate-300"
												}`}
											>
												{u.is_verified ? "✅ Đã xác minh" : "Xác minh"}
											</button>
										)}
										<span className="text-xs text-slate-400">
											{new Date(u.created_at).toLocaleDateString("vi-VN")}
										</span>
									</div>
								);
							})
						}
					</div>
				)}
			</div>
		</div>
	);
}

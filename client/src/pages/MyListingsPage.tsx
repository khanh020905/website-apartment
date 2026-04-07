import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../lib/api";
import type { Listing, ListingStatus } from "../../../shared/types";

const STATUS_STYLES: Record<ListingStatus, { bg: string; text: string; label: string }> = {
	draft: { bg: "bg-slate-100", text: "text-slate-600", label: "Bản nháp" },
	pending: { bg: "bg-yellow-100", text: "text-yellow-700", label: "Chờ duyệt" },
	approved: { bg: "bg-teal-100", text: "text-teal-700", label: "Đã duyệt" },
	rejected: { bg: "bg-red-100", text: "text-red-700", label: "Từ chối" },
};

export default function MyListingsPage() {
	const { isAuthenticated } = useAuth();
	const [listings, setListings] = useState<
		(Listing & {
			listing_reviews?: {
				action: "approved" | "rejected";
				notes: string | null;
				reviewed_at: string;
			}[];
		})[]
	>([]);
	const [loading, setLoading] = useState(true);
	const [filter, setFilter] = useState<ListingStatus | "all">("all");

	useEffect(() => {
		if (!isAuthenticated) return;
		api.get<{ listings: Listing[] }>("/api/listings/my").then(({ data }) => {
			if (data) setListings(data.listings);
			setLoading(false);
		});
	}, [isAuthenticated]);

	const filtered = filter === "all" ? listings : listings.filter((l) => l.status === filter);

	const handleDelete = async (id: string) => {
		if (!confirm("Bạn có chắc muốn xóa tin đăng này?")) return;
		await api.delete(`/api/listings/${id}`);
		setListings((prev) => prev.filter((l) => l.id !== id));
	};

	return (
		<div className="flex-1 overflow-y-auto bg-slate-50">
			<div className="max-w-5xl mx-auto p-6">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					className="flex items-center justify-between mb-6"
				>
					<div>
						<h1 className="text-3xl font-extrabold text-slate-900">Tin đăng của tôi</h1>
						<p className="text-slate-500 mt-1">{listings.length} tin đăng</p>
					</div>
					<Link
						to="/create-listing"
						className="px-5 py-2.5 bg-teal-700 text-white rounded-xl font-semibold text-sm hover:bg-teal-800 transition-colors"
					>
						+ Đăng tin mới
					</Link>
				</motion.div>

				{/* Filter tabs */}
				<div className="flex gap-2 mb-6">
					{[
						{ value: "all", label: "Tất cả" },
						...Object.entries(STATUS_STYLES).map(([value, s]) => ({ value, label: s.label })),
					].map((opt) => (
						<button
							key={opt.value}
							onClick={() => setFilter(opt.value as ListingStatus | "all")}
							className={`px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer transition-all ${
								filter === opt.value ?
									"bg-teal-700 text-white"
								:	"bg-white text-slate-600 border border-slate-200 hover:border-teal-300"
							}`}
						>
							{opt.label}
						</button>
					))}
				</div>

				{loading ?
					<p className="text-center text-slate-400 py-20">Đang tải...</p>
				: filtered.length === 0 ?
					<div className="text-center py-20">
						<div className="text-6xl mb-4">📝</div>
						<h2 className="text-xl font-bold text-slate-700 mb-2">Chưa có tin đăng nào</h2>
						<Link
							to="/create-listing"
							className="text-teal-700 font-semibold hover:underline"
						>
							Đăng tin ngay →
						</Link>
					</div>
				:	<div className="space-y-4">
						{filtered.map((listing, i) => (
							<motion.div
								key={listing.id}
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: i * 0.05 }}
								className="bg-white rounded-2xl border border-slate-200 overflow-hidden flex hover:shadow-lg transition-shadow"
							>
								{/* Image */}
								<div className="w-48 h-36 flex-shrink-0">
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
								{/* Info */}
								<div className="flex-1 p-4 flex flex-col">
									<div className="flex items-start justify-between">
										<div>
											<h3 className="font-bold text-slate-800">{listing.title}</h3>
											<p className="text-sm text-slate-500">{listing.address}</p>
										</div>
										<span
											className={`px-3 py-1 rounded-full text-xs font-bold ${STATUS_STYLES[listing.status].bg} ${STATUS_STYLES[listing.status].text}`}
										>
											{STATUS_STYLES[listing.status].label}
										</span>
									</div>
									<div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
										<span className="text-teal-700 font-bold">
											{(listing.price / 1000000).toFixed(1)} triệu/th
										</span>
										{listing.area && <span>{listing.area} m²</span>}
										<span>
											{listing.bedrooms} PN • {listing.bathrooms} WC
										</span>
										<span>👁 {listing.view_count}</span>
									</div>
									{listing.status === "rejected" &&
										listing.listing_reviews &&
										listing.listing_reviews.length > 0 && (
											<div className="mt-2 p-2 bg-red-50 border border-red-100 rounded-lg text-xs text-red-700">
												<span className="font-semibold">Lý do từ chối:</span>{" "}
												{listing.listing_reviews[0].notes || "Không có ghi chú từ quản trị viên"}
											</div>
										)}
									<div className="flex-1" />
									<div className="flex gap-2 mt-2">
										<button
											onClick={() => handleDelete(listing.id)}
											className="px-3 py-1.5 text-xs text-red-500 hover:bg-red-50 rounded-lg cursor-pointer font-semibold"
										>
											Xóa
										</button>
									</div>
								</div>
							</motion.div>
						))}
					</div>
				}
			</div>
		</div>
	);
}

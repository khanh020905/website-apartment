import { useState, useEffect, useCallback } from "react";
import { Search, ChevronLeft, ChevronRight, Download, Settings, Image as ImageIcon } from "lucide-react";
import { api } from "../lib/api";

type ProofStatus = 'pending' | 'approved' | 'rejected';

interface PaymentProof {
	id: string;
	customer_name: string;
	amount: number;
	image_url: string;
	status: ProofStatus;
	created_at: string;
	invoice?: {
		invoice_code: string;
	};
}

export default function ProofOfPaymentPage() {
	const [search, setSearch] = useState("");
	const [status, setStatus] = useState("");
	const [loading, setLoading] = useState(true);
	const [proofs, setProofs] = useState<PaymentProof[]>([]);
	const [page, setPage] = useState(1);
	const [total, setTotal] = useState(0);

	const fetchProofs = useCallback(async () => {
		setLoading(true);
		const params = new URLSearchParams({
			page: page.toString(),
			limit: "20"
		});
		if (search) params.append("search", search);
		if (status) params.append("status", status);

		try {
			const { data } = await api.get<any>(`/api/payment-proofs?${params.toString()}`);
			if (data) {
				setProofs(data.proofs);
				setTotal(data.total);
			}
		} catch (error) {
			console.error("Lỗi lấy minh chứng:", error);
		}
		setLoading(false);
	}, [page, search, status]);

	useEffect(() => {
		fetchProofs();
	}, [fetchProofs]);

	const updateStatus = async (id: string, newStatus: ProofStatus) => {
		const { error } = await api.put(`/api/payment-proofs/${id}`, { status: newStatus });
		if (!error) {
			fetchProofs();
		} else {
			alert(error);
		}
	};

	const STATUS_BADGES: Record<string, { label: string, classes: string }> = {
		pending: { label: "Chờ duyệt", classes: "bg-amber-50 text-amber-600 border-amber-100" },
		approved: { label: "Đã duyệt", classes: "bg-emerald-50 text-emerald-600 border-emerald-100" },
		rejected: { label: "Từ chối", classes: "bg-rose-50 text-rose-600 border-rose-100" }
	};

	return (
		<div className="flex-1 flex flex-col h-full bg-[#f8f9fa] relative overflow-hidden">
			{/* Header */}
			<div className="bg-white border-b border-slate-200">
				<div className="px-6 py-4 flex items-center justify-between">
					<h1 className="text-[20px] font-bold text-slate-900 tracking-tight flex items-center gap-2">
						Minh chứng thanh toán
					</h1>
					<button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors shadow-sm cursor-pointer">
						<Download className="w-4 h-4" />
						<span className="hidden sm:inline">Xuất báo cáo</span>
					</button>
				</div>

				{/* Toolbar */}
				<div className="px-6 pb-4 flex flex-col sm:flex-row items-center gap-3">
					<div className="relative w-full sm:w-[320px] shrink-0">
						<Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
						<input
							type="text"
							placeholder="Tìm theo khách hàng..."
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-white focus:outline-none focus:border-amber-400 hover:border-slate-300 transition-all font-medium shadow-sm"
						/>
					</div>

					<div className="w-full sm:w-40 shrink-0">
						<select
							value={status}
							onChange={(e) => setStatus(e.target.value)}
							className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 font-medium bg-white focus:outline-none focus:border-amber-400 hover:border-slate-300 transition-all cursor-pointer shadow-sm appearance-none"
						>
							<option value="">Tất cả trạng thái</option>
							<option value="pending">Chờ duyệt</option>
							<option value="approved">Đã duyệt</option>
							<option value="rejected">Từ chối</option>
						</select>
					</div>
				</div>
			</div>

			{/* Table Area */}
			<div className="flex-1 overflow-auto bg-[#f8f9fa] p-5 lg:p-6 text-sm">
				<div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col h-full min-h-[400px]">
					<div className="overflow-x-auto flex-1">
						<table className="w-full text-left">
							<thead className="bg-[#EDEDED] border-b border-slate-200 sticky top-0 z-10 font-bold uppercase tracking-widest text-[10px] text-slate-500">
								<tr>
									<th className="px-5 py-4 w-12 text-center"><input type="checkbox" className="rounded" /></th>
									<th className="px-5 py-4">Khách hàng</th>
									<th className="px-5 py-4">Số tiền (VNĐ)</th>
									<th className="px-5 py-4">Hoá đơn</th>
									<th className="px-5 py-4 text-center">Minh chứng</th>
									<th className="px-5 py-4">Ngày gửi</th>
									<th className="px-5 py-4">Trạng thái</th>
									<th className="px-5 py-4 w-12"><Settings className="w-4 h-4 text-slate-400" /></th>
								</tr>
							</thead>
							<tbody className="divide-y divide-slate-100 font-medium text-[13px]">
								{loading ? (
									<tr><td colSpan={8} className="px-6 py-28 text-center text-slate-400 font-bold tracking-widest uppercase text-xs">Đang tải biểu mẫu...</td></tr>
								) : proofs.length === 0 ? (
									<tr>
										<td colSpan={8} className="px-6 py-28 text-center bg-white cursor-default">
											<div className="flex flex-col items-center justify-center text-slate-400">
												<ImageIcon className="w-12 h-12 mb-3 text-slate-200" />
												<p className="text-sm font-bold text-slate-500">Không có dữ liệu</p>
											</div>
										</td>
									</tr>
								) : (
									proofs.map(p => (
										<tr key={p.id} className="hover:bg-amber-50/20 group transition-colors">
											<td className="px-5 py-4 text-center"><input type="checkbox" className="rounded border-slate-300" /></td>
											<td className="px-5 py-4 font-bold text-slate-900">{p.customer_name}</td>
											<td className="px-5 py-4 text-emerald-600 font-bold">{p.amount.toLocaleString()} ₫</td>
											<td className="px-5 py-4 text-slate-600 uppercase text-xs font-mono">{p.invoice?.invoice_code || "KHÔNG RÕ"}</td>
											<td className="px-5 py-4 text-center">
												<a href={p.image_url} target="_blank" rel="noreferrer" className="inline-flex w-8 h-8 rounded bg-slate-100 items-center justify-center text-slate-400 hover:text-amber-500 hover:bg-amber-50 transition-colors">
													<ImageIcon className="w-4 h-4" />
												</a>
											</td>
											<td className="px-5 py-4 text-slate-500 text-xs">{new Date(p.created_at).toLocaleDateString('vi-VN')}</td>
											<td className="px-5 py-4">
												<span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border tracking-widest ${STATUS_BADGES[p.status].classes}`}>
													{STATUS_BADGES[p.status].label}
												</span>
											</td>
											<td className="px-5 py-4 relative group/menu">
												<button className="p-1 hover:bg-slate-200 rounded-lg text-slate-400 transition-colors cursor-pointer">
													<Settings className="w-4 h-4" />
												</button>
												<div className="absolute right-10 top-5 w-40 bg-white rounded-lg shadow-xl border border-slate-100 py-1.5 opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible z-50 transition-all">
													<button onClick={() => updateStatus(p.id, 'approved')} className="w-full text-left px-4 py-2 hover:bg-slate-50 text-[13px] font-bold text-emerald-600 cursor-pointer">Duyệt minh chứng</button>
													<button onClick={() => updateStatus(p.id, 'rejected')} className="w-full text-left px-4 py-2 hover:bg-rose-50 text-[13px] font-bold text-rose-600 cursor-pointer">Từ chối</button>
													<div className="border-t border-slate-100 my-1"></div>
													<button onClick={() => updateStatus(p.id, 'pending')} className="w-full text-left px-4 py-2 hover:bg-slate-50 text-[13px] font-bold text-slate-600 cursor-pointer">Chờ duyệt lại</button>
												</div>
											</td>
										</tr>
									))
								)}
							</tbody>
						</table>
					</div>

					{/* Pagination Footer */}
					<div className="mt-auto px-5 py-3 border-t border-slate-200 bg-white flex items-center justify-end gap-4 text-sm text-slate-600">
						<span className="font-bold">{total === 0 ? "0-0/0" : `${(page - 1) * 20 + 1}-${Math.min(page * 20, total)}/${total}`}</span>
						<div className="flex items-center gap-1">
							<button onClick={() => setPage(p => p - 1)} disabled={page === 1} className="p-1 hover:bg-slate-100 rounded disabled:opacity-50 text-slate-400 cursor-pointer">
								<ChevronLeft className="w-4 h-4" />
							</button>
							<button onClick={() => setPage(p => p + 1)} disabled={page * 20 >= total} className="p-1 hover:bg-slate-100 rounded disabled:opacity-50 text-slate-400 cursor-pointer">
								<ChevronRight className="w-4 h-4" />
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

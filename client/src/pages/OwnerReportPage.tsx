import { useState, useEffect } from "react";
import { RefreshCw, FileSpreadsheet } from "lucide-react";

// Generate mock data rows based on P101 to P118 as seen in screenshot
const MOCK_ROWS = Array.from({ length: 18 }, (_, i) => {
	const roomNum = 101 + i;
	return {
		id: `P${roomNum}`,
		room: `P${roomNum}`,
		roomFee: 0,
		oldDebt: 0,
		elecNew: 0,
		elecOld: 0,
		elecFee: 0,
		waterNew: 0,
		waterOld: 0,
		waterFee: 0,
		tdf: 0,
		deposit: roomNum <= 105 && roomNum !== 103 ? 2500000 : 0 // Some mock deposits
	};
});

const formatCurrency = (val: number) => {
	if (val === 0) return "₫ 0";
	return `₫ ${val.toLocaleString()}`;
};

const OwnerReportPage = () => {
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const timer = setTimeout(() => setLoading(false), 800);
		return () => clearTimeout(timer);
	}, []);

	// Calculate totals
	const totals = MOCK_ROWS.reduce((acc, row) => {
		acc.deposit += row.deposit;
		return acc;
	}, { roomFee: 0, oldDebt: 0, elecFee: 0, waterFee: 0, tdf: 0, deposit: 0 });

	return (
		<div className="flex-1 flex flex-col h-full bg-[#f4f5f7] relative overflow-hidden font-sans">
			{/* Header */}
			<div className="bg-[#f4f5f7] px-6 py-4 shrink-0 z-10 border-b border-slate-200 shadow-sm">
				<h1 className="text-[20px] font-bold text-slate-800 tracking-tight mb-2">Theo dõi thu tiền tháng</h1>
				
				<div className="flex items-center justify-between">
					<div className="text-[13px] text-slate-500 font-medium flex items-center gap-2 mt-4">
						Cập nhật lần cuối lúc: 17/04/2026 - 09:56
						<RefreshCw className={`w-3.5 h-3.5 cursor-pointer hover:text-slate-800 ${loading ? "animate-spin" : ""}`} />
					</div>
					<div className="flex items-center gap-3">
						<input type="month" defaultValue="2026-04" className="px-3 py-1.5 border border-slate-300 rounded-lg text-[13px] text-slate-600 bg-[#f8f9fa] focus:outline-none focus:border-amber-500 transition-all cursor-pointer" />
						<select className="w-[180px] px-3 py-1.5 border border-slate-300 rounded-lg text-[13px] text-slate-600 bg-[#f8f9fa] focus:outline-none focus:border-amber-500 transition-all font-medium appearance-none cursor-pointer">
							<option>Trà My</option>
						</select>
						<button className="p-1.5 border border-slate-300 hover:border-slate-400 bg-[#f8f9fa] rounded-lg text-green-600 transition-colors shadow-sm">
							<FileSpreadsheet className="w-5 h-5" />
						</button>
					</div>
				</div>
			</div>

			{/* Main Content Area - Full Bleed Table */}
			<div className="flex-1 overflow-hidden p-6 flex flex-col">
				<div className="bg-white rounded-md border border-slate-300 shadow-sm flex flex-col h-full overflow-hidden">
					{/* Table Wrapper */}
					<div className="flex-1 overflow-auto">
						<table className="w-full text-left border-collapse text-[12px] min-w-[1200px]">
							<thead className="sticky top-0 z-20 bg-[#f1f3f5] shadow-[0_1px_0_0_#cbd5e1]">
								<tr>
									<th rowSpan={2} className="py-2.5 px-4 font-bold text-slate-600 border-r border-[#cbd5e1] border-b border-[#cbd5e1] bg-[#f1f3f5]">Phòng</th>
									<th rowSpan={2} className="py-2.5 px-3 font-bold text-slate-600 text-right border-r border-[#cbd5e1] border-b border-[#cbd5e1] bg-[#f1f3f5]">Tiền phòng</th>
									<th rowSpan={2} className="py-2.5 px-3 font-bold text-slate-600 text-right border-r border-[#cbd5e1] border-b border-[#cbd5e1] bg-[#f1f3f5]">Nợ cũ</th>
									<th colSpan={3} className="py-2 px-3 font-bold text-slate-600 text-center border-r border-[#cbd5e1] border-b border-[#cbd5e1] bg-[#f1f3f5]">Điện</th>
									<th colSpan={3} className="py-2 px-3 font-bold text-slate-600 text-center border-r border-[#cbd5e1] border-b border-[#cbd5e1] bg-[#f1f3f5]">Nước</th>
									<th rowSpan={2} className="py-2.5 px-3 font-bold text-slate-600 text-right border-r border-[#cbd5e1] border-b border-[#cbd5e1] bg-[#f1f3f5]">tdf</th>
									<th rowSpan={2} className="py-2.5 px-4 font-bold text-slate-600 text-right border-b border-[#cbd5e1] bg-[#f1f3f5]">Đã cọc</th>
								</tr>
								<tr>
									<th className="py-2 px-3 font-bold text-slate-500 text-center border-r border-[#cbd5e1] border-b border-[#cbd5e1] bg-[#f1f3f5] text-[11px]">Chỉ số mới</th>
									<th className="py-2 px-3 font-bold text-slate-500 text-center border-r border-[#cbd5e1] border-b border-[#cbd5e1] bg-[#f1f3f5] text-[11px]">Chỉ số cũ</th>
									<th className="py-2 px-3 font-bold text-slate-500 text-right border-r border-[#cbd5e1] border-b border-[#cbd5e1] bg-[#f1f3f5] text-[11px]">Số tiền</th>
									<th className="py-2 px-3 font-bold text-slate-500 text-center border-r border-[#cbd5e1] border-b border-[#cbd5e1] bg-[#f1f3f5] text-[11px]">Chỉ số mới</th>
									<th className="py-2 px-3 font-bold text-slate-500 text-center border-r border-[#cbd5e1] border-b border-[#cbd5e1] bg-[#f1f3f5] text-[11px]">Chỉ số cũ</th>
									<th className="py-2 px-3 font-bold text-slate-500 text-right border-r border-[#cbd5e1] border-b border-[#cbd5e1] bg-[#f1f3f5] text-[11px]">Số tiền</th>
								</tr>
							</thead>
							<tbody>
								{MOCK_ROWS.map((row) => (
									<tr key={row.id} className="border-b border-[#e2e8f0] hover:bg-slate-50 transition-colors">
										<td className="py-2.5 px-4 text-slate-700 font-medium">{row.room}</td>
										<td className="py-2.5 px-3 text-slate-600 text-right">{formatCurrency(row.roomFee)}</td>
										<td className="py-2.5 px-3 text-slate-600 text-right">{formatCurrency(row.oldDebt)}</td>
										<td className="py-2.5 px-3 text-slate-600 text-center">{row.elecNew}</td>
										<td className="py-2.5 px-3 text-slate-600 text-center">{row.elecOld}</td>
										<td className="py-2.5 px-3 text-slate-600 text-right">{formatCurrency(row.elecFee)}</td>
										<td className="py-2.5 px-3 text-slate-600 text-center">{row.waterNew}</td>
										<td className="py-2.5 px-3 text-slate-600 text-center">{row.waterOld}</td>
										<td className="py-2.5 px-3 text-slate-600 text-right">{formatCurrency(row.waterFee)}</td>
										<td className="py-2.5 px-3 text-slate-600 text-right">{formatCurrency(row.tdf)}</td>
										<td className="py-2.5 px-4 text-slate-600 text-right">{formatCurrency(row.deposit)}</td>
									</tr>
								))}
							</tbody>
							<tfoot className="sticky bottom-0 z-20 bg-[#f1f3f5] shadow-[0_-1px_0_0_#cbd5e1]">
								<tr>
									<td className="py-3 px-4 font-bold text-slate-800 border-r border-[#cbd5e1]">Tổng</td>
									<td className="py-3 px-3 font-bold text-slate-800 text-right border-r border-[#cbd5e1]">₫ 0</td>
									<td className="py-3 px-3 font-bold text-slate-800 text-right border-r border-[#cbd5e1]">₫ 0</td>
									<td colSpan={2} className="py-3 px-3 font-bold text-slate-800 text-right border-r border-[#cbd5e1]"></td>
									<td className="py-3 px-3 font-bold text-slate-800 text-right border-r border-[#cbd5e1]">₫ 0</td>
									<td colSpan={2} className="py-3 px-3 font-bold text-slate-800 text-right border-r border-[#cbd5e1]"></td>
									<td className="py-3 px-3 font-bold text-slate-800 text-right border-r border-[#cbd5e1]">₫ 0</td>
									<td className="py-3 px-3 font-bold text-slate-800 text-right border-r border-[#cbd5e1]">₫ 0</td>
									<td className="py-3 px-4 font-bold text-slate-800 text-right">₫ 10,000,000</td>
								</tr>
							</tfoot>
						</table>
					</div>

					{/* Pagination Footer */}
					<div className="p-3 border-t border-slate-200 flex items-center justify-end text-[12px] text-slate-600 bg-white shadow-[0_-1px_3px_rgba(0,0,0,0.02)] relative z-30">
						<div className="flex items-center gap-4">
							<span>1-18/18</span>
							<div className="flex gap-2">
								<button className="text-slate-400 cursor-not-allowed hover:bg-slate-50 px-1 rounded transition-colors">{'<'}</button>
								<button className="text-slate-400 cursor-not-allowed hover:bg-slate-50 px-1 rounded transition-colors">{'>'}</button>
							</div>
							<select className="px-2 py-1 border border-slate-300 rounded focus:outline-none focus:border-amber-500 cursor-pointer text-slate-600 bg-white">
								<option>20/trang</option>
							</select>
						</div>
					</div>

				</div>
			</div>
		</div>
	);
};

export default OwnerReportPage;

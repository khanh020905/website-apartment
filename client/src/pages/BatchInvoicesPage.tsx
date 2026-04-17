import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Calendar, Edit2, Plus, Trash2, Eye, MoreVertical, Check, MinusSquare, Loader2 } from "lucide-react";
import { useBuilding } from "../contexts/BuildingContext";
import { api } from "../lib/api";

export default function BatchInvoicesPage() {
	const navigate = useNavigate();
	const { buildings, selectedBuildingId } = useBuilding();
	const selectedBuilding = buildings.find(b => b.id === selectedBuildingId);
	
	const [period, setPeriod] = useState<string>("");
	const [tempPeriod, setTempPeriod] = useState("04/2026");
	const [isPeriodModalOpen, setIsPeriodModalOpen] = useState(true);

	const [batchData, setBatchData] = useState<any[]>([]);
	const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
	const [loading, setLoading] = useState(false);
	const [saving, setSaving] = useState(false);

	const [debugText, setDebugText] = useState("");

	const fetchBatchPrepare = async (p: string) => {
		if (!selectedBuilding) {
			setDebugText("Wait! selectedBuilding is NULL in fetchBatchPrepare");
			return;
		}
		setLoading(true);
		setDebugText(`Fetching... building: ${selectedBuilding.id}, period: ${p}`);
		try {
			console.log("Bat dau fetch", p, selectedBuilding.id);
			const res = await api.get<{ batchData: any[] }>(`/api/invoices/batch-prepare?building_id=${selectedBuilding.id}&period=${p}`);
			
			setDebugText(`Fetch done! Error: ${res.error || 'No'}. Data len: ${res.data?.batchData?.length || 0}`);
			if (res.error) {
				throw new Error(res.error);
			}
			const data = res.data;
			console.log("BATCH DATA RAW RESPONSE:", data);
			setBatchData(data?.batchData || []);
			
			// Auto expand all fetch rows
			const expanded: Record<string, boolean> = {};
			(data?.batchData || []).forEach((r: any) => expanded[r.id] = true);
			setExpandedRows(expanded);
		} catch (error: any) {
			setDebugText(`Fetch crashed! ${error.message}`);
			console.error("Lỗi lấy dữ liệu:", error);
			alert("API Error: " + (error?.error || error?.message || JSON.stringify(error)));
		} finally {
			setLoading(false);
		}
	};

	const toggleRow = (id: string) => {
		setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
	};

	const updateServiceMeta = (roomId: string, serviceId: string, field: string, value: any) => {
		setBatchData(prev => prev.map(room => {
			if (room.id !== roomId) return room;
			
			const newServices = room.services.map((svc: any) => {
				if (svc.id !== serviceId) return svc;
				const updated = { ...svc, [field]: value };
				
				// Auto calc line total
				let qt = Number(updated.qty) || 0;
				if (updated.type === 'metered') {
					const curr = Number(updated.curr) || 0;
					const prev = Number(updated.prev) || 0;
					qt = Math.max(0, curr - prev);
					updated.qty = qt;
				} else if (field === 'qty') {
					qt = Math.max(0, Number(value) || 0);
				}
				
				updated.lineTotal = (qt * (Number(updated.unitPrice) || 0)) - (Number(updated.dsco) || 0);
				return updated;
			});

			const newTotal = newServices.reduce((acc: number, curr: any) => acc + curr.lineTotal, 0);
			return { ...room, services: newServices, total: newTotal };
		}));
	};

	const handleSaveBatch = async () => {
		if (batchData.length === 0) {
			alert("Không có hóa đơn nào để tạo");
			return;
		}
		
		setSaving(true);
		try {
			const res = await api.post("/api/invoices/batch", {
				building_id: selectedBuilding?.id,
				period: period,
				invoices: batchData
			});
			if (res.error) throw new Error(res.error);
			navigate("/invoices");
		} catch (error: any) {
			console.error("Lỗi:", error);
			alert("API Error: " + (error?.error || error?.message || JSON.stringify(error)));
		} finally {
			setSaving(false);
		}
	};

	const formatCurrency = (val: number) => `đ ${new Intl.NumberFormat("vi-VN").format(val)}`;

	const handleConfirmPeriod = () => {
		setPeriod(tempPeriod);
		setIsPeriodModalOpen(false);
		fetchBatchPrepare(tempPeriod);
	};

	React.useEffect(() => {
		if (period && selectedBuilding?.id) {
			fetchBatchPrepare(period);
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectedBuilding?.id, period]);

	return (
		<div className="flex-1 flex flex-col h-full bg-[#f4f5f6] relative overflow-hidden font-['Plus_Jakarta_Sans',sans-serif]">
			
			{/* Breadcrumbs */}
			<div className="px-6 py-3.5 bg-white flex items-center gap-2 text-[13px] font-bold text-slate-400 shrink-0 border-b border-slate-100">
				<span className="hover:text-slate-700 cursor-pointer">{selectedBuilding?.name || "Toà nhà"}</span>
				<ChevronRight className="w-3.5 h-3.5" />
				<Link to="/invoices" className="hover:text-slate-700 cursor-pointer">Hóa đơn</Link>
				<ChevronRight className="w-3.5 h-3.5" />
				<span className="text-slate-900">Tạo hóa đơn hàng loạt</span>
			</div>

			<div className="bg-white px-6 py-5 shrink-0 flex flex-col gap-5 border-b border-slate-200">
				{/* Title */}
				{/* Title */}
				<div className="flex items-center">
					<h1 className="text-2xl font-bold text-[#1a1a1a]">
						Tạo hóa đơn hàng loạt {period && <span className="text-[#3b82f6]">— {period}</span>}
					</h1>
				</div>

				{/* Period Controls & Buttons */}
				<div className="flex flex-wrap items-end justify-between gap-4">
					<div className="flex flex-wrap items-center gap-5">
						<div className="space-y-1.5">
							<label className="text-[12px] font-bold text-slate-600">Ngày phát hành</label>
							<div className="relative w-[180px]">
								<input type="text" readOnly placeholder={period ? "14/04/2026" : "Ngày khác nhau"} className="w-full pl-3 pr-10 h-10 border border-slate-200 rounded-lg text-[13px] font-bold text-slate-700 bg-white focus:outline-none focus:border-brand-primary shadow-sm" />
								<Calendar className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
							</div>
						</div>
						<div className="space-y-1.5">
							<label className="text-[12px] font-bold text-slate-600">Hạn thanh toán</label>
							<div className="relative w-[180px]">
								<input type="text" readOnly placeholder={period ? "14/04/2026" : "Ngày khác nhau"} className="w-full pl-3 pr-10 h-10 border border-slate-200 rounded-lg text-[13px] font-bold text-slate-700 bg-white focus:outline-none focus:border-brand-primary shadow-sm" />
								<Calendar className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
							</div>
						</div>
						
						<div className="flex items-center gap-6 mt-6">
							<label className="flex items-center gap-2 cursor-pointer group">
								<input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-brand-primary focus:ring-brand-primary" />
								<span className="text-[13px] font-bold text-slate-600 group-hover:text-slate-900 transition-colors">Nợ cũ</span>
							</label>
							<label className="flex items-center gap-2 cursor-pointer group">
								<input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-brand-primary focus:ring-brand-primary" />
								<span className="text-[13px] font-bold text-slate-600 group-hover:text-slate-900 transition-colors">Cấn trừ tiền trả trước</span>
							</label>
							<label className="flex items-center gap-2 cursor-pointer group">
								<input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-brand-primary focus:ring-brand-primary" />
								<span className="text-[13px] font-bold text-slate-600 group-hover:text-slate-900 transition-colors">Đã cọc</span>
							</label>
						</div>
					</div>

					<div className="flex items-center gap-3">
						<button className="h-10 px-5 bg-white border border-slate-200 text-slate-700 rounded-lg text-[13px] font-bold hover:bg-slate-50 transition-colors shadow-sm">
							Tạo bản nháp
						</button>
						<button onClick={handleSaveBatch} disabled={saving || batchData.length === 0} className="h-10 px-6 bg-[#fbb016] text-white rounded-lg text-[13px] font-black hover:bg-[#e09d13] shadow-[0_2px_10px_rgba(251,176,22,0.2)] transition-colors flex items-center gap-2 disabled:opacity-50">
							{saving && <Loader2 className="w-4 h-4 animate-spin" />}
							Xác nhận
						</button>
					</div>
				</div>
			</div>

			<div className="flex-1 overflow-auto bg-white m-5 rounded-xl border border-slate-200 shadow-sm relative">
				<div className="overflow-x-auto">
					<table className="w-full text-left border-collapse">
						<thead className="bg-[#f8f9fa] border-b border-slate-200 text-[11px] font-black text-slate-500 uppercase tracking-widest sticky top-0 z-10">
							<tr>
								<th className="px-4 py-4 w-12 text-center"><input type="checkbox" className="rounded border-slate-300 text-brand-primary" /></th>
								<th className="px-4 py-4 text-center w-12"></th>
								<th className="px-4 py-4 truncate max-w-[100px]">Phòng</th>
								<th className="px-4 py-4">Tên Khách Hàng</th>
								<th className="px-4 py-4 text-center">Ngày Sử Dụng</th>
								<th className="px-4 py-4 text-center">Khách</th>
								<th className="px-4 py-4 text-right">Đã Cọc</th>
								<th className="px-4 py-4 text-right">Cấn Cọc Thêm</th>
								<th className="px-4 py-4 text-right">Phụ Thu</th>
								<th className="px-4 py-4 text-right">Giảm Trừ</th>
								<th className="px-4 py-4 text-right">Tổng Cộng</th>
								<th className="px-4 py-4 text-center w-24"></th>
							</tr>
						</thead>
						
						{loading ? (
							<tbody>
								<tr>
									<td colSpan={12} className="py-24 text-center">
										<div className="flex flex-col items-center justify-center text-slate-400">
											<Loader2 className="w-10 h-10 animate-spin mb-4 text-[#fbb016]" />
											<span className="text-[13px] font-black uppercase tracking-widest text-slate-400">Đang khởi tạo danh sách...</span>
										</div>
									</td>
								</tr>
							</tbody>
						) : period && batchData.length > 0 ? (
							<tbody className="divide-y divide-slate-200 bg-white">
								{batchData.map(room => (
									<React.Fragment key={room.id}>
										{/* Master Row */}
										<tr className={`hover:bg-slate-50 transition-colors text-[13px] font-bold text-slate-700 ${expandedRows[room.id] ? "bg-slate-50" : ""}`}>
											<td className="px-4 py-5 text-center"><input type="checkbox" className="rounded border-slate-300 text-brand-primary" /></td>
											<td className="px-4 py-5 text-center cursor-pointer" onClick={() => toggleRow(room.id)}>
												<MinusSquare className="w-5 h-5 text-slate-400 hover:text-slate-600 transition-colors inline-block" />
											</td>
											<td className="px-4 py-5 text-slate-900">{room.roomNumber}</td>
											<td className="px-4 py-5 text-slate-600">{room.customerName}</td>
											<td className="px-4 py-5 text-center text-slate-500">{room.usageDate}</td>
											<td className="px-4 py-5 text-center text-slate-500">{room.guestCount}</td>
											<td className="px-4 py-5 text-right">{formatCurrency(room.deposit)}</td>
											<td className="px-4 py-5 text-right">{formatCurrency(room.extraDeposit)}</td>
											<td className="px-4 py-5 text-right">{formatCurrency(room.extraCharge)}</td>
											<td className="px-4 py-5 text-right">{formatCurrency(room.discount)}</td>
											<td className="px-4 py-5 text-right text-slate-900 font-black">{formatCurrency(room.total)}</td>
											<td className="px-4 py-5 text-center">
												<div className="flex items-center justify-center gap-2">
													<button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded transition-colors"><Eye className="w-4 h-4" /></button>
													<button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded transition-colors"><MoreVertical className="w-4 h-4" /></button>
												</div>
											</td>
										</tr>
										
										{/* Expanded Detail Row */}
										{expandedRows[room.id] && (
											<tr>
												<td colSpan={12} className="p-0 border-t-0">
													<div className="pl-24 pr-4 py-4 bg-slate-50/50 inner-shadow-sm box-border">
														<table className="w-full text-left bg-white border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)] rounded-lg overflow-hidden">
															<thead className="bg-[#fcfdfd] border-b border-slate-100 text-[11px] font-black text-slate-500">
																<tr>
																	<th className="px-4 py-3">Dịch Vụ</th>
																	<th className="px-4 py-3 text-center">Chỉ Số Trước</th>
																	<th className="px-4 py-3 text-center">Chỉ Số Hiện Tại</th>
																	<th className="px-4 py-3 text-center">Số Lượng</th>
																	<th className="px-4 py-3 text-center">Ngày Sử Dụng</th>
																	<th className="px-4 py-3"></th>
																	<th className="px-4 py-3 min-w-[200px]">Đơn Giá</th>
																	<th className="px-4 py-3 min-w-[120px]">Giảm Giá</th>
																	<th className="px-4 py-3 text-right">Tổng Cộng</th>
																	<th className="px-4 py-3 text-center">Hình Ảnh</th>
																	<th className="px-4 py-3 text-center w-12"></th>
																</tr>
															</thead>
															<tbody className="divide-y divide-slate-100 text-[13px] font-bold text-slate-600">
																{room.services.map(svc => (
																	<tr key={svc.id} className="hover:bg-slate-50">
																		<td className="px-4 py-3.5"><div className="flex items-center gap-2">{svc.name}</div></td>
																		<td className="px-4 py-3.5 text-center">
																			{svc.type === 'metered' ? (
																				<input 
																					type="text" 
																					value={svc.prev} 
																					onChange={(e) => updateServiceMeta(room.id, svc.id, 'prev', e.target.value)}
																					className="w-16 h-8 text-center border border-slate-200 rounded bg-white text-[13px] font-bold focus:border-brand-primary outline-none" 
																				/>
																			) : svc.prev}
																		</td>
																		<td className="px-4 py-3.5 text-center">
																			{svc.type === 'metered' ? (
																				<input 
																					type="text" 
																					value={svc.curr} 
																					onChange={(e) => updateServiceMeta(room.id, svc.id, 'curr', e.target.value)}
																					className="w-16 h-8 text-center border border-slate-200 rounded bg-white text-[13px] font-bold focus:border-brand-primary outline-none" 
																				/>
																			) : svc.curr}
																		</td>
																		<td className="px-4 py-3.5 text-center">
																			{svc.editableQty ? (
																				<div className="relative inline-block group">
																					<input type="text" value={svc.qty} onChange={(e) => updateServiceMeta(room.id, svc.id, 'qty', e.target.value)} className="w-16 h-8 text-center border border-slate-200 rounded bg-white text-[13px] font-bold focus:border-brand-primary outline-none" />
																					{/* Tooltip 'Số lượng' (mocked via generic input for demo) */}
																				</div>
																			) : (
																				svc.qty
																			)}
																		</td>
																		<td className="px-4 py-3.5 text-center">{svc.usage}</td>
																		<td className="px-2 py-3.5"><Edit2 className="w-3.5 h-3.5 text-slate-400 cursor-pointer hover:text-slate-600" /></td>
																		<td className="px-4 py-3.5">
																			{svc.editablePrice ? (
																				<div className="flex items-center gap-1">
																					<div className="relative">
																						<span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs">đ</span>
																						<input type="text" value={svc.unitPrice} onChange={(e) => updateServiceMeta(room.id, svc.id, 'unitPrice', e.target.value)} className="w-24 h-8 pl-6 pr-2 border border-slate-200 rounded bg-white text-[13px] font-bold focus:border-brand-primary outline-none" />
																					</div>
																				</div>
																			) : (
																				<span className="text-slate-500 font-medium">đ {svc.unitPrice}</span>
																			)}
																		</td>
																		<td className="px-4 py-3.5">
																			<div className="relative">
																				<span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs">đ</span>
																				<input type="text" value={svc.dsco} onChange={(e) => updateServiceMeta(room.id, svc.id, 'dsco', e.target.value)} className="w-20 h-8 pl-6 pr-2 border border-slate-200 rounded bg-white text-[13px] font-bold focus:border-brand-primary outline-none text-right" />
																			</div>
																		</td>
																		<td className="px-4 py-3.5 text-right font-black text-slate-800">{formatCurrency(svc.lineTotal)}</td>
																		<td className="px-4 py-3.5 text-center">
																			{svc.hasImage ? (
																				<button className="w-6 h-6 inline-flex items-center justify-center rounded border border-slate-200 text-slate-400 hover:text-brand-primary hover:border-brand-primary transition-colors"><Plus className="w-4 h-4" /></button>
																			) : (
																				"-"
																			)}
																		</td>
																		<td className="px-4 py-3.5 text-center">
																			<button className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded transition-colors"><Trash2 className="w-4 h-4" /></button>
																		</td>
																	</tr>
																))}
															</tbody>
														</table>
													</div>
												</td>
											</tr>
										)}
									</React.Fragment>
								))}
							</tbody>
						) : (
							<tbody>
								<tr>
									<td colSpan={12} className="py-24 text-center">
										<div className="flex flex-col items-center justify-center text-slate-300">
											<div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-3">
												<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
											</div>
											<span className="text-[13px] font-black uppercase tracking-widest text-slate-400">Trống</span>
										</div>
									</td>
								</tr>
							</tbody>
						)}
					</table>
				</div>
			</div>

			{/* Period Selection Modal Overlay */}
			<AnimatePresence>
				{isPeriodModalOpen && (
					<>
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							className="absolute inset-0 bg-slate-900/30 backdrop-blur-[2px] z-[200] flex items-center justify-center"
						>
							<motion.div
								initial={{ opacity: 0, scale: 0.95, y: 20 }}
								animate={{ opacity: 1, scale: 1, y: 0 }}
								exit={{ opacity: 0, scale: 0.95, y: 20 }}
								className="w-full max-w-[480px] bg-white rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] overflow-hidden"
							>
								<div className="p-6">
									<h2 className="text-[18px] font-black text-slate-800 mb-4">Chọn kỳ hóa đơn</h2>
									<p className="text-[13px] font-medium text-slate-600 mb-2">Vui lòng chọn kỳ hoá đơn để tạo.</p>
									<p className="text-[13px] font-medium text-slate-600 mb-6">Sau khi lựa chọn, hệ thống sẽ liệt kê các đơn đặt phòng chưa được lập hoá đơn trong khoảng thời gian đã chọn.</p>
									
									<div className="flex items-center justify-center py-4 text-center">
										<button className="text-[20px] font-black text-blue-500 hover:text-blue-600 bg-blue-50 px-6 py-2 rounded-lg transition-colors border border-blue-100">
											{tempPeriod}
										</button>
									</div>
								</div>
								
								<div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end">
									<button 
										onClick={handleConfirmPeriod}
										className="px-8 h-10 bg-[#fbb016] text-white rounded-lg text-sm font-black hover:bg-[#e09d13] shadow-[0_2px_10px_rgba(251,176,22,0.2)] transition-colors"
									>
										OK
									</button>
								</div>
							</motion.div>
						</motion.div>
					</>
				)}
			</AnimatePresence>

		</div>
	);
}

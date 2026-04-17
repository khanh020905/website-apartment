import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
	FileText,
	Plus,
	ChevronLeft,
	ChevronRight,
	Calendar,
	Search,
	Download,
	Home,
	User,
	CheckCircle2,
	Clock,
	LogOut,
	Settings,
	Settings2,
	MoreHorizontal,
	X,
} from "lucide-react";
import Modal from "../components/modals/Modal";
import ContractForm from "../components/modals/ContractForm";
import { api } from "../lib/api";
import * as XLSX from 'xlsx';

const ALL_COLUMNS = [
  { id: 'contract_number', label: 'Mã hợp đồng' },
  { id: 'contract_name', label: 'Tên hợp đồng' },
  { id: 'room_number', label: 'Phòng' },
  { id: 'tenant_name', label: 'Khách ở' },
  { id: 'start_date', label: 'Ngày bắt đầu' },
  { id: 'end_date', label: 'Ngày kết thúc' },
  { id: 'attachments', label: 'Phụ lục/biên bản đính kèm' },
  { id: 'booking_code', label: 'Mã đặt phòng' },
  { id: 'actions', label: 'Thao tác' }
];

interface Contract {
	id: string;
	contract_number: string;
	contract_name: string;
	room_number: string;
	tenant_name: string;
	start_date: string;
	end_date: string;
	status: "active" | "expired" | "terminated" | "pending";
	booking_code: string;
	attachments: string[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const STATUS_MAP: Record<Contract["status"], { label: string; color: string; icon: any }> = {
	active: { label: "Đang hiệu lực", color: "bg-emerald-100 text-emerald-700", icon: CheckCircle2 },
	expired: { label: "Đã hết hạn", color: "bg-rose-100 text-rose-700", icon: Clock },
	terminated: { label: "Đã thanh lý", color: "bg-slate-100 text-slate-500", icon: LogOut },
	pending: { label: "Chờ xác nhận", color: "bg-brand-bg text-brand-ink", icon: Clock },
};

export default function ContractsPage() {
	const [loading, setLoading] = useState(true);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isFilterOpen, setIsFilterOpen] = useState(false);
	const [contracts, setContracts] = useState<Contract[]>([]);
	const [customersForContract, setCustomersForContract] = useState<any[]>([]);
	const [search, setSearch] = useState("");
	const [filterStatus, setFilterStatus] = useState("");

	const [visibleColumns, setVisibleColumns] = useState<string[]>([
		'contract_number', 'contract_name', 'room_number', 'tenant_name', 'start_date', 'end_date', 'attachments', 'booking_code', 'actions'
	]);
	const [isColumnConfigOpen, setIsColumnConfigOpen] = useState(false);

	const fetchContracts = async () => {
		setLoading(true);
		const [{ data: contractData }, { data: customerData }] = await Promise.all([
			api.get<{ contracts: any[] }>("/api/contracts"),
			api.get<{ customers: any[] }>("/api/customers")
		]);

		if (contractData) {
			const formatted: Contract[] = contractData.contracts.map(c => ({
				id: c.id,
				contract_number: c.contract_number || `HD-${c.id.substring(0, 4)}`,
				contract_name: c.contract_name || `HĐ Thuê phòng ${c.rooms?.room_number}`,
				room_number: c.rooms?.room_number || "N/A",
				tenant_name: c.tenant_name,
				start_date: new Date(c.start_date).toLocaleDateString("vi-VN"),
				end_date: c.end_date ? new Date(c.end_date).toLocaleDateString("vi-VN") : "Bền vững",
				status: c.status,
				booking_code: c.booking_code || "---",
				attachments: c.attachments || []
			}));
			setContracts(formatted);
		}
		if (customerData) {
			setCustomersForContract(customerData.customers);
		}
		setLoading(false);
	};

	useEffect(() => {
		fetchContracts();
	}, []);

	const handleCreateContract = async (formData: any) => {
		setLoading(true);
		
		// If a customer was selected, we should ideally use their details.
		// For now, if the form didn't capture name/phone/email separately, 
		// we'll use defaults or the ones from the selected customer.
		const selectedCustomer = customersForContract.find(c => c.id === formData.customer_id);

		const { error } = await api.post("/api/contracts", {
			room_id: formData.room_id,
			tenant_name: selectedCustomer?.tenant_name || formData.contractName.split(' - ')[1] || "Khách mới", 
			tenant_phone: selectedCustomer?.tenant_phone || "",
			tenant_email: selectedCustomer?.tenant_email || "",
			start_date: formData.startDate,
			end_date: formData.endDate,
			rent_amount: formData.rent_amount || 0,
			deposit_amount: formData.deposit_amount || 0,
			notes: formData.notes,
			contract_number: formData.contractNumber,
			contract_name: formData.contractName,
			booking_code: formData.bookingCode || null,
			attachments: formData.attachments || []
		});

		if (error) {
			alert("Lỗi: " + error);
			setLoading(false);
			return;
		}

		setIsModalOpen(false);
		fetchContracts();
	};

	const handleExportExcel = () => {
		const excelData = contracts.map((c, index) => ({
			"STT": index + 1,
			"Mã hợp đồng": c.contract_number,
			"Tên hợp đồng": c.contract_name,
			"Phòng": c.room_number,
			"Khách ở": c.tenant_name,
			"Ngày bắt đầu": c.start_date,
			"Ngày kết thúc": c.end_date,
			"Trạng thái": STATUS_MAP[c.status].label,
		}));

		const worksheet = XLSX.utils.json_to_sheet(excelData, { origin: "A4" } as any);
		
		XLSX.utils.sheet_add_aoa(worksheet, [
			["Danh sách Hợp đồng"],
			[`Thời gian xuất: ${new Date().toLocaleDateString('vi-VN')}`]
		], { origin: "A1" } as any);

		worksheet['!merges'] = [
			{ s: { r: 0, c: 0 }, e: { r: 0, c: 7 } },
			{ s: { r: 1, c: 0 }, e: { r: 1, c: 7 } }
		];

		const workbook = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(workbook, worksheet, "Contracts");

		worksheet['!cols'] = [
			{ wch: 6 }, { wch: 20 }, { wch: 30 }, { wch: 15 },
			{ wch: 25 }, { wch: 15 }, { wch: 15 }, { wch: 20 }
		];

		XLSX.writeFile(workbook, `Danh_sach_hop_dong_${new Date().getTime()}.xlsx`);
	};

	const STATS = [
		{
			label: "Đang hiệu lực",
			value: contracts.filter(c => c.status === "active").length,
			icon: CheckCircle2,
			color: "text-emerald-500",
			bg: "bg-emerald-50",
		},
		{ 
			label: "Chờ xác nhận", 
			value: contracts.filter(c => c.status === "pending").length, 
			icon: Clock, 
			color: "text-brand-primary", 
			bg: "bg-brand-bg" 
		},
		{ 
			label: "Đã thanh lý", 
			value: contracts.filter(c => c.status === "terminated").length, 
			icon: LogOut, 
			color: "text-slate-400", 
			bg: "bg-slate-50" 
		},
	];

	return (
		<div className="flex-1 flex flex-col h-full bg-[#f8f9fa] relative overflow-hidden">
			{/* Header */}
			<div className="bg-white border-b border-slate-200">
				<div className="px-6 py-4 flex items-center justify-between">
					<h1 className="text-[20px] font-bold text-slate-900 tracking-tight">Hợp đồng</h1>
				</div>

				{/* Toolbar */}
				<div className="px-6 pb-4 flex flex-col sm:flex-row items-center gap-3">
					<div className="relative w-full sm:w-[320px] shrink-0">
						<Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
						<input
							type="text"
							placeholder="Tìm kiếm số hợp đồng, khách hàng theo tên, điện thoại..."
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-[13px] text-slate-700 bg-white focus:outline-none focus:border-brand-primary hover:border-slate-300 transition-all font-medium"
						/>
					</div>

					<div className="flex items-center gap-2">
						<input
							type="date"
							className="w-31.25 px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 bg-white focus:outline-none focus:border-brand-primary hover:border-slate-300 transition-all font-medium text-[13px] "
						/>
						<span className="text-slate-400">-</span>
						<input
							type="date"
							className="w-31.25 px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 bg-white focus:outline-none focus:border-brand-primary hover:border-slate-300 transition-all font-medium text-[13px] "
						/>
					</div>

					<div className="w-full sm:w-44 shrink-0">
						<select
							value={filterStatus}
							onChange={(e) => setFilterStatus(e.target.value)}
							className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 bg-white focus:outline-none focus:border-brand-primary hover:border-slate-300 transition-all cursor-pointer appearance-none font-medium text-[13px]"
						>
							<option value="">Giai đoạn hợp đồng</option>
							<option value="active">Hiệu lực</option>
							<option value="expired">Hết hiệu lực</option>
							<option value="pending">Chờ tái ký</option>
							<option value="cancelled">Đã thanh lý</option>
							<option value="draft">Bản thảo</option>
						</select>
					</div>

					<button
						onClick={() => setIsFilterOpen(true)}
						className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg text-[13px] font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm cursor-pointer"
					>
						<Settings2 className="w-4 h-4" />
						Bộ lọc
					</button>

					<div className="flex items-center gap-2 ml-auto">
						<button 
							onClick={handleExportExcel}
							className="flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 text-emerald-600 rounded-lg text-[13px] font-bold transition-colors hover:bg-emerald-50 shadow-sm cursor-pointer"
						>
							<Download className="w-4 h-4" /> Xuất Excel
						</button>
						<button
							onClick={() => setIsModalOpen(true)}
							className="flex items-center gap-1.5 px-4 py-2 bg-brand-primary text-white rounded-lg text-[13px] font-bold transition-colors hover:bg-brand-dark shadow-sm cursor-pointer"
						>
							<Plus className="w-4 h-4 font-bold" /> Tạo
						</button>
					</div>
				</div>
			</div>

			{/* Main Content Area */}
			<div className="flex-1 overflow-auto bg-[#f8f9fa] p-5 lg:p-6 flex flex-col gap-6">
				{/* Stats Cards (Optional for layout) */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6 shrink-0">
					{STATS.map((stat, i) => (
						<div
							key={i}
							className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 group hover:shadow-md hover:border-slate-300 transition-all cursor-pointer"
						>
							<div
								className={`w-12 h-12 ${stat.bg} rounded-xl flex items-center justify-center transition-transform group-hover:scale-110`}
							>
								<stat.icon className={`w-6 h-6 ${stat.color}`} />
							</div>
							<div>
								<p className="text-[13px] font-medium text-slate-500">{stat.label}</p>
								<h3 className="text-[20px] font-bold text-slate-900 mt-0.5">{stat.value}</h3>
							</div>
						</div>
					))}
				</div>

				{/* Table Area */}
				<div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm h-full flex flex-col min-h-100">
					<div className="overflow-x-auto flex-1">
						<table className="w-full h-full text-left">
							<thead className="bg-[#f8f9fa] border-b border-slate-200 sticky top-0 z-10">
								<tr>
									{ALL_COLUMNS.filter(col => visibleColumns.includes(col.id)).map((col) => (
										<th
											key={col.id}
											className={`px-5 py-3.5 text-[12px] font-bold text-slate-600 tracking-wide whitespace-nowrap ${col.id === 'actions' ? 'w-10 text-center' : ''}`}
										>
											{col.id === 'actions' ? (
												<div className="relative inline-block">
													<button 
														onClick={() => setIsColumnConfigOpen(!isColumnConfigOpen)}
														className="p-1 hover:bg-slate-200 rounded transition-colors cursor-pointer"
													>
														<Settings className="w-4 h-4 text-slate-400" />
													</button>
													
													<AnimatePresence>
														{isColumnConfigOpen && (
															<>
																<div className="fixed inset-0 z-[60]" onClick={() => setIsColumnConfigOpen(false)} />
																<motion.div
																	initial={{ opacity: 0, y: 10, scale: 0.95 }}
																	animate={{ opacity: 1, y: 0, scale: 1 }}
																	exit={{ opacity: 0, y: 10, scale: 0.95 }}
																	className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-2xl z-[70] p-4 text-left font-sans"
																>
																	<h3 className="text-[15px] font-bold text-slate-800 mb-4">Tuỳ chỉnh cột</h3>
																	<div className="space-y-3 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
																		{ALL_COLUMNS.map(column => (
																			<label key={column.id} className="flex items-center gap-3 cursor-pointer group">
																				<input 
																					type="checkbox" 
																					disabled={column.id === 'contract_number' || column.id === 'actions'}
																					checked={visibleColumns.includes(column.id)}
																					onChange={() => {
																						setVisibleColumns(prev => 
																							prev.includes(column.id) 
																								? prev.filter(id => id !== column.id)
																								: [...prev, column.id]
																						);
																					}}
																					className="w-4.5 h-4.5 rounded border-slate-300 text-brand-primary focus:ring-brand-primary cursor-pointer disabled:opacity-30" 
																				/>
																				<span className={`text-[14px] font-medium transition-colors ${visibleColumns.includes(column.id) ? 'text-slate-900' : 'text-slate-400'} group-hover:text-slate-900`}>
																					{column.label}
																				</span>
																			</label>
																		))}
																	</div>
																</motion.div>
															</>
														)}
													</AnimatePresence>
												</div>
											) : (
												<div className="flex items-center gap-1">
													{col.label}
													<span className="inline-block opacity-50 text-[10px]">↕</span>
												</div>
											)}
										</th>
									))}
								</tr>
							</thead>
							<tbody className="divide-y divide-slate-100">
								{loading ?
									<tr>
										<td
											colSpan={7}
											className="px-6 py-28 text-center bg-white cursor-default"
										>
											<div className="w-8 h-8 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin mx-auto mb-3" />
											<p className="text-sm font-medium text-slate-500 uppercase tracking-widest">
												Đang tải...
											</p>
										</td>
									</tr>
								:	contracts.map((c) => (
										<tr
											key={c.id}
											className="hover:bg-brand-bg/20 transition-colors group"
										>
											{visibleColumns.includes('contract_number') && (
												<td className="px-5 py-4 whitespace-nowrap">
													<span className="text-[13px] font-bold text-blue-600 uppercase">
														{c.contract_number}
													</span>
												</td>
											)}
											{visibleColumns.includes('contract_name') && (
												<td className="px-5 py-4">
													<div className="flex items-center gap-2">
														<FileText className="w-4 h-4 text-slate-400" />
														<span className="text-[13px] font-bold text-slate-900 truncate max-w-50">
															{c.contract_name}
														</span>
													</div>
												</td>
											)}
											{visibleColumns.includes('room_number') && (
												<td className="px-5 py-4 whitespace-nowrap">
													<div className="flex items-center gap-2 text-[13px] font-bold text-slate-700">
														<Home className="w-4 h-4 text-slate-400" />
														{c.room_number}
													</div>
												</td>
											)}
											{visibleColumns.includes('tenant_name') && (
												<td className="px-5 py-4 whitespace-nowrap">
													<div className="flex items-center gap-2 text-[13px] font-medium text-slate-600">
														<User className="w-4 h-4 text-slate-400" />
														{c.tenant_name}
													</div>
												</td>
											)}
											{visibleColumns.includes('start_date') && (
												<td className="px-5 py-4 whitespace-nowrap text-[13px] font-medium text-slate-600">
													<span className="flex items-center gap-1">
														<Calendar className="w-3.5 h-3.5 text-slate-400" /> {c.start_date}
													</span>
												</td>
											)}
											{visibleColumns.includes('end_date') && (
												<td className="px-5 py-4 whitespace-nowrap text-[13px] font-medium text-slate-600">
													<span className="flex items-center gap-1">
														<Calendar className="w-3.5 h-3.5 text-slate-400" /> {c.end_date}
													</span>
												</td>
											)}
											{visibleColumns.includes('attachments') && (
												<td className="px-5 py-4 whitespace-nowrap text-[13px] font-medium text-slate-600">
													{c.attachments.length > 0 ? `${c.attachments.length} tệp` : '-'}
												</td>
											)}
											{visibleColumns.includes('booking_code') && (
												<td className="px-5 py-4 whitespace-nowrap text-[13px] font-medium text-brand-primary">
													{c.booking_code}
												</td>
											)}
											{visibleColumns.includes('actions') && (
												<td className="px-5 py-4 text-right">
													<button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-brand-dark transition-all">
														<MoreHorizontal className="w-4 h-4" />
													</button>
												</td>
											)}
										</tr>
									))
								}
							</tbody>
						</table>
					</div>

					{/* Pagination Footer */}
					<div className="mt-auto px-5 py-3 border-t border-slate-200 bg-white flex items-center justify-end gap-4 text-[13px] text-slate-600">
						<span>
							{contracts.length === 0 ? "0-0/0" : `1-${contracts.length}/${contracts.length}`} kết
							quả
						</span>
						<div className="flex items-center gap-1">
							<button
								disabled
								className="p-1 hover:bg-slate-100 rounded disabled:opacity-50 text-slate-400 transition-colors"
							>
								<ChevronLeft className="w-4 h-4" />
							</button>
							<button
								disabled
								className="p-1 hover:bg-slate-100 rounded disabled:opacity-50 text-slate-400 transition-colors"
							>
								<ChevronRight className="w-4 h-4" />
							</button>
						</div>
						<select className="px-2 py-1 outline-none border border-slate-200 rounded cursor-pointer text-slate-600 bg-white hover:border-slate-300 appearance-none font-medium text-[13px]">
							<option>20 / trang</option>
							<option>50 / trang</option>
						</select>
					</div>
				</div>
			</div>

			{/* Advanced Filter Sidebar */}
			<AnimatePresence>
				{isFilterOpen && (
					<>
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							onClick={() => setIsFilterOpen(false)}
							className="absolute inset-0 bg-slate-900/20 z-40 transition-opacity"
						/>
						<motion.div
							initial={{ x: "100%" }}
							animate={{ x: 0 }}
							exit={{ x: "100%" }}
							transition={{ type: "spring", damping: 25, stiffness: 200 }}
							className="absolute top-0 right-0 w-100 h-full bg-white shadow-2xl z-50 flex flex-col border-l border-slate-200"
						>
							<div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
								<h2 className="text-lg font-bold text-slate-900">Bộ lọc nâng cao</h2>
								<button
									onClick={() => setIsFilterOpen(false)}
									className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
								>
									<X className="w-5 h-5" />
								</button>
							</div>

							<div className="flex-1 overflow-y-auto p-5 space-y-6">
								{/* Mẫu hợp đồng */}
								<div>
									<h3 className="text-[13px] font-bold text-slate-900 mb-3">Mẫu hợp đồng</h3>
									<select className="w-full px-3 py-2 border border-slate-200 rounded-lg text-[13px] font-medium text-slate-900 focus:outline-none focus:border-brand-primary appearance-none">
										<option value="">Tất cả mẫu</option>
										<option value="1">Hợp đồng thuê căn hộ</option>
										<option value="2">Hợp đồng thuê mặt bằng</option>
									</select>
								</div>

								<hr className="border-slate-100" />

								{/* Người đảm nhận */}
								<div>
									<h3 className="text-[13px] font-bold text-slate-900 mb-3">Người đảm nhận</h3>
									<select className="w-full px-3 py-2 border border-slate-200 rounded-lg text-[13px] font-medium text-slate-900 focus:outline-none focus:border-brand-primary appearance-none">
										<option value="">Tất cả nhân viên</option>
										<option value="1">Admin</option>
										<option value="2">Nhân viên sale 1</option>
									</select>
								</div>

								<hr className="border-slate-100" />

								{/* Trạng thái ký */}
								<div>
									<h3 className="text-[13px] font-bold text-slate-900 mb-3">Trạng thái ký</h3>
									<div className="grid grid-cols-2 gap-3">
										{["Đã ký", "Chưa ký", "Đã hủy"].map((st) => (
											<label
												key={st}
												className="flex items-center gap-2 cursor-pointer"
											>
												<input
													type="checkbox"
													className="rounded border-slate-300 text-brand-primary focus:ring-brand-primary/20 w-4 h-4 cursor-pointer"
												/>
												<span className="text-[13px] font-medium text-slate-700">{st}</span>
											</label>
										))}
									</div>
								</div>

								<hr className="border-slate-100" />

								{/* Giai đoạn hợp đồng */}
								<div>
									<h3 className="text-[13px] font-bold text-slate-900 mb-3">Giai đoạn hợp đồng</h3>
									<div className="grid grid-cols-2 gap-3">
										{[
											"Hết hiệu lực",
											"Hiệu lực",
											"Chờ tái ký",
											"Không tái ký",
											"Đã thanh lý",
											"Bản thảo",
										].map((st) => (
											<label
												key={st}
												className="flex items-center gap-2 cursor-pointer"
											>
												<input
													type="checkbox"
													className="rounded border-slate-300 text-brand-primary focus:ring-brand-primary/20 w-4 h-4 cursor-pointer"
												/>
												<span className="text-[13px] font-medium text-slate-700">{st}</span>
											</label>
										))}
									</div>
								</div>
							</div>

							{/* Slider Footer */}
							<div className="p-5 border-t border-slate-100 bg-white flex items-center justify-end gap-3 shrink-0">
								<button
									onClick={() => {
										setSearch("");
										setFilterStatus("");
									}}
									className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
								>
									Đặt lại
								</button>
								<button
									onClick={() => setIsFilterOpen(false)}
									className="px-6 py-2.5 text-sm font-bold bg-brand-primary hover:bg-brand-dark text-white rounded-lg transition-colors shadow-sm cursor-pointer"
								>
									Áp dụng
								</button>
							</div>
						</motion.div>
					</>
				)}
			</AnimatePresence>

			<Modal
				isOpen={isModalOpen}
				onClose={() => setIsModalOpen(false)}
				title="Tạo hợp đồng mới"
				size="lg"
			>
				<ContractForm
					onSubmit={handleCreateContract}
					onCancel={() => setIsModalOpen(false)}
				/>
			</Modal>
		</div>
	);
}

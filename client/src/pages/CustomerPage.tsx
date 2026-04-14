import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
	Search,
	Settings2,
	X,
	ChevronLeft,
	ChevronRight,
	Home,
	Building2,
	Settings,
	Download,
	Upload,
	FileSpreadsheet,
	Users,
	CheckCircle2,
	UserCheck,
	UserX,
	ChevronDown,
	Trash2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useBuilding } from "../contexts/BuildingContext";
import { api } from "../lib/api";
import * as XLSX from "xlsx";
import Modal from "../components/modals/Modal";
import CustomerForm from "../components/modals/CustomerForm";
import { CUSTOMER_SYNC_FIELDS, type CustomerSyncFieldKey } from "../../../shared/customerSyncFields";

interface CustomerRoom {
	id: string;
	room_number: string;
	floor: number;
	building_id: string;
	building: {
		id: string;
		name: string;
	};
}

interface Customer {
	id: string;
	tenant_name: string;
	tenant_phone: string | null;
	tenant_email: string | null;
	tenant_gender: "male" | "female" | "other" | null;
	tenant_id_number: string | null;
	residence_status: "pending" | "completed" | "not_registered" | null;
	start_date: string;
	end_date: string | null;
	rent_amount: number;
	deposit_amount: number;
	status: string;
	created_at: string;
	tenant_avatar?: string | null;
	room: CustomerRoom;
}

interface CustomerStats {
	total: number;
	active: number;
	terminated: number;
    transient: number;
}

interface CustomerResponse {
	customers: Customer[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
	stats: CustomerStats;
}

interface ManagedRoom {
	id: string;
	room_number: string;
	floor: number;
	status: string;
	building_id: string;
	buildings: {
		id: string;
		name: string;
		owner_id: string;
	};
}

type CustomerImportPayloadRow = Partial<Record<CustomerSyncFieldKey, string>>;

interface CustomerImportResponse {
	imported: number;
	failed: number;
	total: number;
	results: Array<{
		row: number;
		status: "success" | "error";
		message: string;
		contract_id?: string;
	}>;
}

const normalizeHeader = (value: string) =>
	value
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.toLowerCase()
		.replace(/[^\w/]+/g, " ")
		.trim();

const EXCEL_HEADER_FIELD_MAP: Record<string, CustomerSyncFieldKey> = {
	...Object.fromEntries(
		CUSTOMER_SYNC_FIELDS.map((field) => [normalizeHeader(field.label), field.key]),
	),
	"toa nha": "building_name",
	"ho ten khach": "tenant_name",
	"quan huyen": "tenant_district",
	"phuong xa": "tenant_ward",
	"tinh trang tam tru": "residence_status",
	"anh dai dien": "tenant_avatar",
};

export default function CustomerPage() {
	const { selectedBuildingId } = useBuilding();
	const [loading, setLoading] = useState(true);
	const [customers, setCustomers] = useState<Customer[]>([]);
	const [rooms, setRooms] = useState<ManagedRoom[]>([]);
	const [search, setSearch] = useState("");
	const [debouncedSearch, setDebouncedSearch] = useState("");
	const [isFilterOpen, setIsFilterOpen] = useState(false);
	const [isAddModalOpen, setIsAddModalOpen] = useState(false);
	const [exporting, setExporting] = useState(false);
	const [importing, setImporting] = useState(false);
	const [lastImportSummary, setLastImportSummary] = useState<string>("");
	const importFileRef = useRef<HTMLInputElement | null>(null);

	// Pagination
	const [page, setPage] = useState(1);
	const [limit, setLimit] = useState(20);
	const [total, setTotal] = useState(0);

	// Filter States
	const [filterRoom, setFilterRoom] = useState("");
	const [filterStatus, setFilterStatus] = useState("");
	const [filterResidency, setFilterResidency] = useState("");
	const [filterGender, setFilterGender] = useState("");
	const [stats, setStats] = useState<CustomerStats>({ total: 0, active: 0, terminated: 0, transient: 0 });

	const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
	const [editingResidenceId, setEditingResidenceId] = useState<string | null>(null);

	useEffect(() => {
		const query = selectedBuildingId ? `?building_id=${selectedBuildingId}` : "";
		api.get<{ rooms: ManagedRoom[] }>(`/api/customers/rooms${query}`)
			.then((res) => setRooms(res.data?.rooms || []))
			.catch(console.error);
	}, [selectedBuildingId]);

	useEffect(() => {
		const timer = setTimeout(() => setDebouncedSearch(search), 300);
		return () => clearTimeout(timer);
	}, [search]);

	useEffect(() => {
		// eslint-disable-next-line react-hooks/set-state-in-effect
		setPage(1);
	}, [
		debouncedSearch,
		filterStatus,
		filterGender,
		filterResidency,
		filterRoom,
		selectedBuildingId,
	]);

	const navigate = useNavigate();

	const handleResidenceUpdate = async (customerId: string, status: string) => {
		try {
			const normalizedStatus = status === "none" ? "not_registered" : status;
			const { error } = await api.put(`/api/customers/${customerId}`, { residence_status: normalizedStatus });
			if (!error) {
				setCustomers((prev) => prev.map((c) => (c.id === customerId ? { ...c, residence_status: normalizedStatus as any } : c)));
			}
		} catch (err) {
			console.error(err);
		}
	};

	const fetchCustomers = useCallback(async () => {
		setLoading(true);
		const params = new URLSearchParams({
			page: page.toString(),
			limit: limit.toString(),
		});

		if (debouncedSearch) params.append("search", debouncedSearch);
		if (filterStatus) params.append("status", filterStatus);
		if (filterGender) params.append("gender", filterGender);
		if (filterResidency) params.append("residence_status", filterResidency);
		if (filterRoom) params.append("room_id", filterRoom);
		if (selectedBuildingId) params.append("building_id", selectedBuildingId);

		try {
			const { data } = await api.get<CustomerResponse>(`/api/customers?${params}`);
			if (data) {
				setCustomers(data.customers);
				setTotal(data.total);
				setStats(data.stats);
			}
		} catch (err) {
			console.error(err);
		}
		setLoading(false);
	}, [
		page,
		limit,
		debouncedSearch,
		filterStatus,
		filterGender,
		filterResidency,
		filterRoom,
		selectedBuildingId,
	]);

	useEffect(() => {
		// eslint-disable-next-line react-hooks/set-state-in-effect
		fetchCustomers();
	}, [fetchCustomers]);

	const handleExportExcel = async () => {
		setExporting(true);
		try {
			const { data } = await api.get<{ data: Record<string, unknown>[] }>("/api/customers/export");
			if (data?.data) {
				const ws = XLSX.utils.json_to_sheet(data.data);
				const wb = XLSX.utils.book_new();
				XLSX.utils.book_append_sheet(wb, ws, "Khách hàng");
				XLSX.writeFile(wb, `khach-hang-${new Date().toISOString().split("T")[0]}.xlsx`);
			}
		} catch (err) {
			console.error("Export error:", err);
		}
		setExporting(false);
	};

	const handleDownloadTemplate = () => {
		const templateRowValues: CustomerImportPayloadRow = {
			building_name: rooms[0]?.buildings?.name || "",
			room_number: rooms[0]?.room_number || "",
			tenant_name: "Nguyễn Văn A",
			tenant_phone: "0900000000",
			tenant_email: "example@gmail.com",
			tenant_gender: "male",
			tenant_dob: "1998-05-12",
			tenant_id_number: "0123456789",
			tenant_job: "Nhân viên văn phòng",
			tenant_nationality: "Việt Nam",
			tenant_city: "Đà Nẵng",
			tenant_district: "Ngũ Hành Sơn",
			tenant_ward: "Hòa Hải",
			tenant_address: "Số 1 Trần Đại Nghĩa",
			residence_status: "not_registered",
			start_date: "2026-04-12",
			end_date: "2027-04-11",
			rent_amount: "3500000",
			deposit_amount: "3500000",
			tenant_notes: "Khách nhập từ file mẫu",
			tenant_avatar: "",
		};
		const templateData = [
			CUSTOMER_SYNC_FIELDS.reduce(
				(acc, field) => {
					acc[field.label] = templateRowValues[field.key] || "";
					return acc;
				},
				{} as Record<string, string>,
			),
		];

		const roomReference = rooms.map((room) => ({
			"Tên tòa nhà": room.buildings?.name || "",
			"Số phòng": room.room_number,
			Tầng: room.floor,
			"Trạng thái phòng": room.status,
			"Room ID (tham chiếu kỹ thuật)": room.id,
		}));

		const guideData = [
			{
				"Hướng dẫn": "Điền đúng Tên tòa nhà + Số phòng theo sheet DanhSachPhong.",
			},
			{
				"Hướng dẫn": "Cột bắt buộc: Tên khách hàng, Số điện thoại, Ngày bắt đầu (YYYY-MM-DD), Tiền thuê.",
			},
			{
				"Hướng dẫn": "Giới tính dùng giá trị DB: male / female / other.",
			},
			{
				"Hướng dẫn": "Trạng thái tạm trú dùng giá trị DB: not_registered / pending / completed.",
			},
			{
				"Hướng dẫn": "Sau khi import thành công, hệ thống sẽ tự tạo hợp đồng và cập nhật phòng sang Đang sử dụng.",
			},
		];

		const workbook = XLSX.utils.book_new();
		const templateSheet = XLSX.utils.json_to_sheet(templateData);
		const roomSheet = XLSX.utils.json_to_sheet(roomReference);
		const guideSheet = XLSX.utils.json_to_sheet(guideData);

		XLSX.utils.book_append_sheet(workbook, templateSheet, "MauNhap");
		XLSX.utils.book_append_sheet(workbook, roomSheet, "DanhSachPhong");
		XLSX.utils.book_append_sheet(workbook, guideSheet, "HuongDan");
		XLSX.writeFile(workbook, `mau-khach-hang-${new Date().toISOString().split("T")[0]}.xlsx`);
	};

	const mapExcelRowToPayload = (row: Record<string, unknown>): CustomerImportPayloadRow => {
		const payload: CustomerImportPayloadRow = {};
		for (const [rawKey, rawValue] of Object.entries(row)) {
			const key = EXCEL_HEADER_FIELD_MAP[normalizeHeader(rawKey)];
			if (!key) continue;
			if (rawValue === null || rawValue === undefined) continue;
			payload[key] = String(rawValue).trim();
		}
		return payload;
	};

	const handleImportExcel = async (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (!file) return;

		setImporting(true);
		setLastImportSummary("");
		try {
			const buffer = await file.arrayBuffer();
			const workbook = XLSX.read(buffer, { type: "array", raw: false, cellDates: true });
			const firstSheetName = workbook.SheetNames[0];
			if (!firstSheetName) {
				alert("File Excel không hợp lệ");
				return;
			}

			const sheet = workbook.Sheets[firstSheetName];
			const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
				defval: "",
				raw: false,
			});
			const rows = rawRows
				.map(mapExcelRowToPayload)
				.filter((row) => Object.values(row).some((value) => String(value || "").trim().length > 0));

			if (rows.length === 0) {
				alert("Không tìm thấy dữ liệu để import trong sheet đầu tiên.");
				return;
			}

			const { data, error } = await api.post<CustomerImportResponse>("/api/customers/import", { rows });
			if (error || !data) {
				alert(error || "Import thất bại.");
				return;
			}

			const summary = `Đã nhập ${data.imported}/${data.total} khách hàng.`;
			setLastImportSummary(summary);
			alert(summary + (data.failed > 0 ? ` Có ${data.failed} dòng lỗi, vui lòng kiểm tra file và import lại.` : ""));
			await fetchCustomers();
		} catch (err) {
			console.error("Import error:", err);
			alert("Không thể đọc file Excel. Vui lòng kiểm tra định dạng file.");
		} finally {
			event.target.value = "";
			setImporting(false);
		}
	};

	const handleSaveCustomer = async (formData: any) => {
		try {
			if (editingCustomer) {
				const result = await api.put(`/api/customers/${editingCustomer.id}`, formData);
				if (result.error) {
					alert(result.error);
					return;
				}
			} else {
				const result = await api.post("/api/customers", formData);
				if (result.error) {
					alert(result.error);
					return;
				}
			}
			setIsAddModalOpen(false);
			setEditingCustomer(null);
			fetchCustomers();
		} catch {
			alert("Lỗi khi lưu thông tin");
		}
	};

	const clearFilters = () => {
		setFilterStatus("");
		setFilterResidency("");
		setFilterGender("");
		setFilterRoom("");
	};

	return (
		<div className="flex-1 flex flex-col h-full bg-[#f8f9fa] relative overflow-hidden">
			{/* Header */}
			<div className="bg-white border-b border-slate-200">
				<div className="px-6 py-4 flex items-center justify-between">
					<h1 className="text-[20px] font-bold text-slate-900 tracking-tight">Khách hàng</h1>
					<div className="flex items-center gap-2">
						<button
							onClick={handleDownloadTemplate}
							className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
						>
							<FileSpreadsheet className="w-4 h-4" />
							<span className="hidden sm:inline">Xuất mẫu Excel</span>
						</button>
						<button
							onClick={() => importFileRef.current?.click()}
							disabled={importing}
							className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-50"
						>
							{importing ?
								<div className="w-4 h-4 border-2 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin" />
							:	<Upload className="w-4 h-4" />}
							<span className="hidden sm:inline">Nhập Excel</span>
						</button>
						<button
							onClick={handleExportExcel}
							disabled={exporting}
							className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-50"
						>
							{exporting ?
								<div className="w-4 h-4 border-2 border-emerald-600/20 border-t-emerald-600 rounded-full animate-spin" />
							:	<Download className="w-4 h-4" />}
							<span className="hidden sm:inline">Xuất danh sách</span>
						</button>
					</div>
					<input
						ref={importFileRef}
						type="file"
						accept=".xlsx,.xls"
						onChange={handleImportExcel}
						className="hidden"
					/>
				</div>

				{/* Summary Cards */}
				<div className="px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
					<div className="bg-[#fcfdfe] border border-slate-200 p-4 rounded-xl shadow-sm flex items-center gap-4">
						<div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
							<Users className="w-6 h-6 text-blue-600" />
						</div>
						<div>
							<p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tổng khách hàng</p>
							<p className="text-2xl font-black text-slate-900">{stats.total}</p>
						</div>
					</div>

					<div className="bg-[#fcfdfe] border border-slate-200 p-4 rounded-xl shadow-sm flex items-center gap-4">
						<div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
							<CheckCircle2 className="w-6 h-6 text-emerald-600" />
						</div>
						<div>
							<p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Đang ở</p>
							<p className="text-2xl font-black text-slate-900">{stats.active}</p>
						</div>
					</div>

					<div className="bg-[#fcfdfe] border border-slate-200 p-4 rounded-xl shadow-sm flex items-center gap-4">
						<div className="w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center">
							<UserX className="w-6 h-6 text-rose-600" />
						</div>
						<div>
							<p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Đã dời đi</p>
							<p className="text-2xl font-black text-slate-900">{stats.terminated}</p>
						</div>
					</div>

					<div className="bg-[#fcfdfe] border border-slate-200 p-4 rounded-xl shadow-sm flex items-center gap-4">
						<div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center">
							<UserCheck className="w-6 h-6 text-amber-600" />
						</div>
						<div>
							<p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Khách vãng lai</p>
							<p className="text-2xl font-black text-slate-900">{stats.transient}</p>
						</div>
					</div>
				</div>

				{/* Toolbar */}
				<div className="px-6 pb-4 flex flex-col sm:flex-row items-center gap-3">
					<div className="relative w-full sm:w-70 shrink-0">
						<Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
						<input
							type="text"
							placeholder="Tìm kiếm bằng tên khách, số điện thoại..."
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-white focus:outline-none focus:border-brand-primary hover:border-slate-300 transition-all"
						/>
					</div>

					<button
						onClick={() => setIsFilterOpen(true)}
						className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm cursor-pointer relative"
					>
						<Settings2 className="w-4 h-4" />
						Bộ lọc
						{(filterGender || filterResidency || filterRoom || filterStatus) && (
							<span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-primary rounded-full shadow-sm" />
						)}
					</button>

					<button
						onClick={() => setIsAddModalOpen(true)}
						className="flex items-center gap-2 px-5 py-2 bg-brand-primary text-white rounded-lg text-sm font-bold transition-colors hover:bg-brand-dark shadow-sm ml-auto cursor-pointer"
					>
						+ Khách hàng
					</button>
				</div>
				<div className="px-6 pb-4">
					<p className="text-xs font-medium text-slate-500">
						Bạn có thể nhập thông tin khách hàng bằng form tay hoặc dùng file mẫu Excel để import nhanh sau khi tạo phòng/hợp đồng.
					</p>
					{lastImportSummary && <p className="text-xs font-semibold text-emerald-600 mt-1">{lastImportSummary}</p>}
				</div>
			</div>

			{/* Table Area */}
			<div className="flex-1 bg-[#f8f9fa] p-6">
				<div className="bg-white border border-slate-200 rounded-xl shadow-sm h-fit flex flex-col">
					<div>
						<table className="w-full">
							<thead className="bg-[#f8f9fa] border-b border-slate-200">
								<tr>
									<th className="px-5 py-3.5 w-10">
										<input
											type="checkbox"
											className="rounded border-slate-300 text-brand-primary focus:ring-brand-primary/20 w-4 h-4"
										/>
									</th>
									{[
										"Khách hàng",
										"Phòng",
										"Trạng thái khách hàng",
										"Toà nhà",
										"Trạng thái tạm trú",
										"Giới tính",
										"Số CCCD/Hộ chiếu",
									].map((h, i) => (
										<th
											key={i}
											className="px-5 py-3.5 text-left text-[12px] font-bold text-slate-600 tracking-wide whitespace-nowrap"
										>
											{h} <span className="inline-block ml-1 opacity-50">↕</span>
										</th>
									))}
									<th className="px-5 py-3.5 w-10 text-center">
										<Settings className="w-4 h-4 text-slate-400 inline-block" />
									</th>
								</tr>
							</thead>
							<tbody>
								{loading ?
									<tr>
										<td
											colSpan={9}
											className="px-6 py-28 text-center bg-white"
										>
											<div className="w-10 h-10 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin mx-auto mb-3" />
											<p className="text-sm font-bold text-slate-400">Đang tải dữ liệu...</p>
										</td>
									</tr>
								: customers.length === 0 ?
									<tr>
										<td
											colSpan={9}
											className="px-6 py-28 text-center bg-white cursor-default"
										>
											<div className="flex flex-col items-center justify-center">
												<div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-4 relative overflow-hidden">
													<svg
														className="w-12 h-12 text-slate-300"
														viewBox="0 0 24 24"
														fill="currentColor"
													>
														<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-2-5.5c-.83 0-1.5-.67-1.5-1.5S9.17 11.5 10 11.5s1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm4 0c-.83 0-1.5-.67-1.5-1.5S13.17 11.5 14 11.5s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
													</svg>
												</div>
												<p className="text-base font-bold text-slate-700">Không có dữ liệu</p>
											</div>
										</td>
									</tr>
								:	customers.map((c, idx) => (
										<motion.tr
											key={c.id}
											initial={{ opacity: 0, y: 8 }}
											animate={{ opacity: 1, y: 0 }}
											transition={{ delay: idx * 0.04 }}
											className="hover:bg-brand-bg/30 transition-colors group border-b border-slate-50 last:border-0"
										>
											<td className="px-5 py-3">
												<input
													type="checkbox"
													className="rounded border-slate-300 text-brand-primary focus:ring-brand-primary/20 w-4 h-4"
												/>
											</td>
											<td 
                                                className="px-5 py-3 cursor-pointer group"
                                                onClick={() => navigate(`/customers/${c.id}/show`)}
                                            >
												<div className="flex items-center gap-3">
													<div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 overflow-hidden shrink-0">
														{c.tenant_avatar ? (
                                                            <img src={c.tenant_avatar} alt={c.tenant_name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <img
                                                                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(c.tenant_name)}&background=random`}
                                                                alt={c.tenant_name}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        )}
													</div>
													<div className="flex flex-col">
														<p className="text-sm font-bold text-slate-700 group-hover:text-brand-primary transition-colors truncate max-w-37.5">
															{c.tenant_name}
														</p>
														<p className="text-[11px] text-slate-500 font-medium">
															{c.tenant_phone}
														</p>
													</div>
												</div>
											</td>
											<td className="px-5 py-3 cursor-pointer" onClick={() => navigate(`/customers/${c.id}/show`)}>
												<div className="flex items-center gap-2 text-sm font-bold text-slate-700">
													{c.room?.room_number && (
                                                        <>
                                                            <Home className="w-4 h-4 text-slate-400" />
                                                            {c.room.room_number}
                                                        </>
                                                    )}
												</div>
											</td>
											<td className="px-5 py-3 cursor-pointer" onClick={() => navigate(`/customers/${c.id}/show`)}>
												<span
													className={`inline-flex px-2 py-1 rounded-md text-[11px] font-bold whitespace-nowrap ${
														!c.room?.room_number ?
															"bg-slate-100 text-slate-600"
														: c.status === "active" ?
															"bg-emerald-100 text-emerald-700"
														:	"bg-slate-100 text-slate-600"
													}`}
												>
													{!c.room?.room_number ?
														"Vãng lai"
													: c.status === "active" ? 
														"Đang ở" 
													: "Đã dời đi"}
												</span>
											</td>
											<td className="px-5 py-3 cursor-pointer" onClick={() => navigate(`/customers/${c.id}/show`)}>
												<div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
													<Building2 className="w-4 h-4 text-slate-400" />
													<span className="truncate max-w-30">{c.room?.building?.name || "-"}</span>
												</div>
											</td>
											<td className="px-5 py-3 relative group/res">
												<div 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setEditingResidenceId(editingResidenceId === c.id ? null : c.id);
                                                    }}
                                                    className="flex items-center gap-1.5 cursor-pointer hover:bg-slate-100 px-2 py-1 rounded-md transition-colors w-fit"
                                                >
													<span
														className={`w-2 h-2 rounded-full ${
															c.residence_status === "completed" ? "bg-emerald-500"
															: c.residence_status === "pending" ? "bg-brand-bg0"
															: "bg-slate-300"
														}`}
													/>
													<span className="text-[11px] font-bold text-slate-600 whitespace-nowrap">
														{c.residence_status === "completed" ?
															"Đã đăng ký"
														: c.residence_status === "pending" ?
															"Đang chờ"
														:	"Chưa đăng ký"}
													</span>
                                                    <ChevronDown className="w-3 h-3 text-slate-400 opacity-0 group-hover/res:opacity-100 transition-opacity" />
												</div>

                                                <AnimatePresence>
                                                    {editingResidenceId === c.id && (
                                                        <>
                                                            <div className="fixed inset-0 z-[60]" onClick={() => setEditingResidenceId(null)} />
                                                            <motion.div 
                                                                initial={{ opacity: 0, y: 5 }}
                                                                animate={{ opacity: 1, y: 0 }}
                                                                exit={{ opacity: 0, y: 5 }}
                                                                className="absolute left-0 mt-2 w-48 bg-white rounded-xl shadow-2xl border border-slate-100 p-2.5 z-[70]"
                                                            >
                                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 mb-2.5">Chọn trạng thái</p>
                                                                <div className="space-y-1.5">
                                                                    {[
                                                                        { id: "completed", label: "Đã đăng ký", bg: "bg-emerald-50", text: "text-emerald-600" },
                                                                        { id: "pending", label: "Đang chờ duyệt", bg: "bg-amber-50", text: "text-amber-600" },
                                                                        { id: "none", label: "Chưa đăng ký", bg: "bg-slate-50", text: "text-slate-600" }
                                                                    ].map(opt => (
                                                                        <button 
                                                                            key={opt.id}
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                handleResidenceUpdate(c.id, opt.id);
                                                                                setEditingResidenceId(null);
                                                                            }}
                                                                            className={`w-full text-left px-4 py-2 ${opt.bg} ${opt.text} rounded-lg text-xs font-bold hover:brightness-95 transition-all outline-none`}
                                                                        >
                                                                            {opt.label}
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            </motion.div>
                                                        </>
                                                    )}
                                                </AnimatePresence>
											</td>
											<td className="px-5 py-3 text-sm text-slate-600 font-medium whitespace-nowrap cursor-pointer" onClick={() => navigate(`/customers/${c.id}/show`)}>
												{c.tenant_gender === "male" ?
													"Nam"
												: c.tenant_gender === "female" ?
													"Nữ"
												: c.tenant_gender === "other" ?
													"Khác"
												:	"-"}
											</td>
											<td className="px-5 py-3 text-sm text-slate-600 font-medium whitespace-nowrap cursor-pointer" onClick={() => navigate(`/customers/${c.id}/show`)}>
												{c.tenant_id_number || "-"}
											</td>
											<td className="px-5 py-3 text-right">
												<div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
													<button 
														onClick={async (e) => {
                                                            e.stopPropagation();
                                                            if (window.confirm("Bạn có chắc chắn muốn xóa khách hàng này?")) {
                                                                const { error } = await api.delete(`/api/customers/${c.id}`);
                                                                if (!error) {
                                                                    fetchCustomers();
                                                                } else {
                                                                    alert("Lỗi khi xóa: " + JSON.stringify(error));
                                                                }
                                                            }
														}}
														className="p-1.5 hover:bg-white rounded-lg text-slate-400 hover:text-rose-600 transition-colors shadow-sm"
													>
														<Trash2 className="w-4 h-4" />
													</button>
												</div>
											</td>
										</motion.tr>
									))
								}
							</tbody>
						</table>
					</div>

					{/* Pagination Footer */}
					<div className="mt-auto px-5 py-3 border-t border-slate-200 bg-white flex items-center justify-end gap-4 text-sm text-slate-600">
						<span>
							{total === 0 ?
								"0-0/0"
							:	`${(page - 1) * limit + 1}-${Math.min(page * limit, total)}/${total}`}
						</span>
						<div className="flex items-center gap-1">
							<button
								onClick={() => setPage((p) => Math.max(1, p - 1))}
								disabled={page === 1}
								className="p-1 hover:bg-slate-100 rounded disabled:opacity-50 text-slate-400"
							>
								<ChevronLeft className="w-4 h-4" />
							</button>
							<button
								onClick={() => setPage((p) => p + 1)}
								disabled={page * limit >= total}
								className="p-1 hover:bg-slate-100 rounded disabled:opacity-50 text-slate-400"
							>
								<ChevronRight className="w-4 h-4" />
							</button>
						</div>
						<select
							value={limit}
							onChange={(e) => {
								setLimit(parseInt(e.target.value));
								setPage(1);
							}}
							className="px-2 py-1 outline-none border border-slate-200 rounded cursor-pointer text-slate-600 bg-white hover:border-slate-300 appearance-none"
						>
							<option value={10}>10 / trang</option>
							<option value={20}>20 / trang</option>
							<option value={50}>50 / trang</option>
							<option value={100}>100 / trang</option>
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
								<h2 className="text-xl font-bold text-slate-900">Lọc</h2>
								<button
									onClick={() => setIsFilterOpen(false)}
									className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
								>
									<X className="w-5 h-5" />
								</button>
							</div>

							<div className="flex-1 overflow-y-auto p-5">
								<div className="grid grid-cols-2 gap-4">
                                    {/* Phòng */}
                                    <div className="space-y-1.5">
                                        <select
                                            value={filterRoom}
                                            onChange={(e) => setFilterRoom(e.target.value)}
                                            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 focus:border-brand-primary outline-none transition-all appearance-none"
                                        >
                                            <option value="">Phòng</option>
                                            {rooms.map(r => (
                                                <option key={r.id} value={r.id}>{r.room_number}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Trạng thái khách */}
                                    <div className="space-y-1.5">
                                        <select
                                            value={filterStatus}
                                            onChange={(e) => setFilterStatus(e.target.value)}
                                            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 focus:border-brand-primary outline-none transition-all appearance-none"
                                        >
                                            <option value="">Trạng thái khách</option>
                                            <option value="active">Đang ở</option>
                                            <option value="terminated">Đã chuyển đi</option>
                                            <option value="transient">Khách vãng lai</option>
                                        </select>
                                    </div>

                                    {/* Trạng thái tạm trú */}
                                    <div className="space-y-1.5">
                                        <select
                                            value={filterResidency}
                                            onChange={(e) => setFilterResidency(e.target.value)}
                                            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 focus:border-brand-primary outline-none transition-all appearance-none"
                                        >
                                            <option value="">Trạng thái tạm trú</option>
                                            <option value="completed">Đã đăng ký</option>
                                            <option value="pending">Đang chờ</option>
                                            <option value="not_registered">Chưa đăng ký</option>
                                        </select>
                                    </div>

                                    {/* Giới tính */}
                                    <div className="space-y-1.5">
                                        <select
                                            value={filterGender}
                                            onChange={(e) => setFilterGender(e.target.value)}
                                            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 focus:border-brand-primary outline-none transition-all appearance-none"
                                        >
                                            <option value="">Giới tính</option>
                                            <option value="male">Nam</option>
                                            <option value="female">Nữ</option>
                                            <option value="other">Khác</option>
                                        </select>
                                    </div>
								</div>
							</div>

							{/* Slider Footer */}
							<div className="p-5 border-t border-slate-100 bg-white flex items-center justify-end gap-3 shrink-0">
								<button
									onClick={clearFilters}
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

			{/* Add Customer Modal */}
			<Modal
				isOpen={isAddModalOpen}
				onClose={() => {
					setIsAddModalOpen(false);
					setEditingCustomer(null);
				}}
				title={editingCustomer ? "Chỉnh sửa thông tin chung" : "Nhập tay thông tin khách hàng"}
				size="xl"
			>
				<CustomerForm
					onSubmit={handleSaveCustomer}
					onCancel={() => {
						setIsAddModalOpen(false);
						setEditingCustomer(null);
					}}
					initialData={editingCustomer}
				/>
			</Modal>
		</div>
	);
}

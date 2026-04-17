import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, Building2, MapPin, Search, Plus, ExternalLink, Box, Zap, Edit2, X, Image as ImageIcon, ChevronDown, CheckCircle2 } from "lucide-react";
import { api } from "../lib/api";
import Modal from "../components/modals/Modal";

interface Room {
	id: string;
	room_number: string;
	floor: number;
	floor_name: string;
	status: string;
	price?: number;
	max_occupants?: number;
}

interface Service {
	id: string;
	name: string;
	price: number;
	unit: string;
}

interface BankAccount {
	id: string;
	bank_name: string;
	account_name: string;
	account_number: string;
	branch: string;
	is_default: boolean;
	status: string;
}

interface Building {
	id: string;
	name: string;
	address: string;
	ward?: string | null;
	district?: string | null;
	city?: string | null;
	phone?: string;
	rental_type?: string;
	status: string;
	images?: string[];
	rooms: Room[];
	fixed_services: Service[];
	metered_services: Service[];
}

const TABS = [
	{ id: "tang", label: "Tầng" },
	{ id: "phong", label: "Phòng" },
	{ id: "thanh-toan", label: "Thông tin thanh toán" },
	{ id: "dich-vu", label: "Dịch vụ bổ sung" },
	{ id: "chinh-sach", label: "Chính sách đặt phòng" },
];

export default function BuildingDetailPage() {
	const { id } = useParams();
	const navigate = useNavigate();
	const [activeTab, setActiveTab] = useState("phong");
	const [building, setBuilding] = useState<Building | null>(null);
	const [loading, setLoading] = useState(true);

	const [isAddRoomOpen, setIsAddRoomOpen] = useState(false);
	const [draftRooms, setDraftRooms] = useState<{id: string, room_number: string, floor_name: string, isNew?: boolean}[]>([]);
	const [isSubmittingRooms, setIsSubmittingRooms] = useState(false);

	useEffect(() => {
		if (isAddRoomOpen && building?.rooms) {
			setDraftRooms(building.rooms.map(r => ({
				id: r.id,
				room_number: r.room_number,
				floor_name: r.floor_name || "Trệt",
				isNew: false
			})));
		}
	}, [isAddRoomOpen, building?.rooms]);

	const [isEditBuildingOpen, setIsEditBuildingOpen] = useState(false);
	const [editBuildingData, setEditBuildingData] = useState<Partial<Building>>({});
	const [imageInput, setImageInput] = useState('');
	const [isUploading, setIsUploading] = useState(false);

	const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
	const [serviceType, setServiceType] = useState<"fixed" | "metered">("fixed");
	const [editingServiceIndex, setEditingServiceIndex] = useState<number | null>(null);
	const [serviceData, setServiceData] = useState<Service>({ id: '', name: '', price: 0, unit: 'Tháng' });
	const [servicePriceInput, setServicePriceInput] = useState<string>('');

	const [banks, setBanks] = useState<BankAccount[]>([]);
	const [isBanksLoaded, setIsBanksLoaded] = useState(false);

	const fetchBanks = async () => {
		try {
			const { data } = await api.get<BankAccount[]>("/api/bank-accounts");
			if (data) setBanks(data);
		} catch (error) {
			console.error("Error fetching banks", error);
		} finally {
			setIsBanksLoaded(true);
		}
	};

	useEffect(() => {
		if (activeTab === "thanh-toan" && !isBanksLoaded) {
			fetchBanks();
		}
	}, [activeTab, isBanksLoaded]);

	const fetchBuilding = async () => {
		try {
			const res = await api.get<{ building: Building }>(`/api/buildings/${id}`);
			if (res.data?.building) {
				setBuilding(res.data.building);
			}
		} catch (error) {
			console.error("Error fetching building", error);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (id) fetchBuilding();
	}, [id]);

	const handleAddRoomsMulti = async () => {
		const newOnes = draftRooms.filter(r => r.isNew && r.room_number.trim() !== "");
		if (newOnes.length === 0) {
			setIsAddRoomOpen(false);
			return;
		}
		setIsSubmittingRooms(true);
		try {
			await Promise.all(newOnes.map(nr => api.post('/api/rooms', {
				building_id: building!.id,
				room_number: nr.room_number,
				floor_name: nr.floor_name,
				floor: 1,
				price: 0,
				status: 'available'
			})));
			setIsAddRoomOpen(false);
			await fetchBuilding();
		} catch (error: any) {
			console.error(error);
			alert(error.response?.data?.error || 'Lỗi thêm phòng');
		} finally {
			setIsSubmittingRooms(false);
		}
	};

	const openEditModal = () => {
		if (!building) return;
		setEditBuildingData({
			name: building.name,
			address: building.address,
			phone: building.phone || "",
			rental_type: building.rental_type || "",
			images: building.images || []
		});
		setImageInput(building.images?.[0] || "");
		setIsEditBuildingOpen(true);
	};

	const openAddServiceModal = (type: "fixed" | "metered") => {
		setServiceType(type);
		setEditingServiceIndex(null);
		setServiceData({ id: '', name: '', price: 0, unit: type === 'fixed' ? 'Tháng' : 'Kw' });
		setServicePriceInput('');
		setIsServiceModalOpen(true);
	};

	const openEditServiceModal = (type: "fixed" | "metered", index: number, svc: Service) => {
		setServiceType(type);
		setEditingServiceIndex(index);
		setServiceData(svc);
		setServicePriceInput(new Intl.NumberFormat('vi-VN').format(svc.price));
		setIsServiceModalOpen(true);
	};

	const handleSaveService = async () => {
		if (!serviceData.name || !servicePriceInput || !serviceData.unit) return alert('Vui lòng điền đủ thông tin');
		try {
			const priceNum = parseInt(servicePriceInput.replace(/\D/g, '')) || 0;
			const newService = { ...serviceData, price: priceNum };
			
			const payload: any = { 
				...building,
				fixed_services: building?.fixed_services || [], 
				metered_services: building?.metered_services || [] 
			};
			
			const arr = serviceType === 'fixed' ? [...payload.fixed_services] : [...payload.metered_services];
			if (editingServiceIndex !== null) arr[editingServiceIndex] = newService;
			else arr.push(newService);

			if (serviceType === 'fixed') payload.fixed_services = arr;
			else payload.metered_services = arr;

			await api.put(`/api/buildings/${building!.id}`, payload);
			setIsServiceModalOpen(false);
			await fetchBuilding();
		} catch (error: any) {
			console.error(error);
			alert(error.response?.data?.error || 'Lỗi lưu dịch vụ');
		}
	};

	const handleEditBuilding = async () => {
		if (!editBuildingData.name || !editBuildingData.address) return alert('Thiếu tên hoặc địa chỉ');
		try {
			const payload = { ...editBuildingData };
			if (imageInput) {
				payload.images = [imageInput];
			}
			await api.put(`/api/buildings/${building!.id}`, payload);
			setIsEditBuildingOpen(false);
			await fetchBuilding();
		} catch (error: any) {
			console.error(error);
			alert(error.response?.data?.error || 'Lỗi cập nhật tòa nhà');
		}
	};

	const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;
		setIsUploading(true);
		const formData = new FormData();
		// API expect 'images' field as array, we just send one file
		formData.append("images", file);
		try {
			const res = await api.upload<{ images: { url: string }[] }>('/api/listings/upload-images', formData);
			if (res.data?.images?.[0]?.url) {
				setImageInput(res.data.images[0].url);
			}
		} catch (err: any) {
			console.error(err);
			alert(err.response?.data?.error || 'Lỗi tải ảnh');
		} finally {
			setIsUploading(false);
		}
	};

	if (loading) {
		return (
			<div className="flex h-full items-center justify-center p-6">
				<div className="w-8 h-8 border-2 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin" />
			</div>
		);
	}

	if (!building) {
		return (
			<div className="flex h-full flex-col items-center justify-center p-6">
				<p className="text-slate-500 font-medium">Không tìm thấy tòa nhà</p>
				<button onClick={() => navigate(-1)} className="mt-4 text-brand-primary font-bold hover:underline">Quay lại</button>
			</div>
		);
	}

	const uniqueFloors = Array.from(new Set(building.rooms?.map(r => r.floor_name || "Trệt")));
	const roomsData = building.rooms || [];
	// const availableRooms = roomsData.filter(r => r.status === 'available').length;

	return (
		<div className="flex-1 overflow-auto bg-slate-50 relative pb-20">
			{/* Breadcrumb / Top Bar */}
			<div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
				<div className="flex items-center gap-3">
					<button onClick={() => navigate("/locations")} className="text-slate-400 hover:text-slate-700 transition">
						<ChevronLeft className="w-5 h-5" />
					</button>
					<span className="text-slate-400 font-medium text-[13px]">Cơ sở / Toà nhà</span>
					<span className="text-slate-300">/</span>
					<span className="text-slate-900 font-bold text-[13px]">{building.name}</span>
				</div>
                <button onClick={openEditModal} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-700 text-[12px] font-bold rounded-lg hover:bg-slate-200 transition-colors">
                    <Edit2 className="w-4 h-4" /> Cập nhật
                </button>
			</div>

			<div className="max-w-6xl mx-auto p-6 space-y-6">
				{/* Header Card */}
				<div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
					{/* Image Placeholder */}
					<div className="md:col-span-4 lg:col-span-3 w-full aspect-video bg-slate-100 rounded-xl flex flex-col items-center justify-center border border-slate-100 shadow-inner overflow-hidden relative">
						{building.images && building.images.length > 0 ? (
                            <img src={building.images[0]} alt={building.name} className="w-full h-full object-cover" />
                        ) : (
                            <>
                                <Building2 className="w-12 h-12 text-slate-300 mb-2" />
                                <span className="text-xs font-bold text-slate-400">Chưa cập nhật ảnh</span>
                            </>
                        )}
					</div>

					{/* Info */}
					<div className="md:col-span-8 lg:col-span-9 space-y-5 min-w-0">
						<div className="flex items-start justify-between">
                            <div>
                                <h1 className="text-2xl font-black text-slate-900">{building.name}</h1>
                                <p className="text-brand-primary font-bold text-[13px] uppercase tracking-wider mt-1">{building.rental_type || "Tòa nhà"}</p>
                            </div>
						</div>

						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
							<div className="space-y-3 min-w-0">
								<div className="flex items-center gap-2.5">
									<div className="w-2 h-2 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20" />
									<div className="text-sm font-semibold text-emerald-700">Đang hoạt động</div>
								</div>
								<div className="flex items-start gap-2 text-slate-600">
									<MapPin className="w-4 h-4 shrink-0 mt-0.5" />
									<span className="text-sm font-medium leading-relaxed truncate whitespace-normal break-words">{building.address} {building.ward ? `, ${building.ward}` : ''} {building.district ? `, ${building.district}` : ''} {building.city ? `, ${building.city}` : ''}</span>
								</div>
								<div className="flex items-center gap-4 text-sm font-semibold text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100 w-fit">
									<div className="flex items-center gap-1.5"><Box className="w-4 h-4" /> {uniqueFloors.length} tầng</div>
									<div className="w-px h-4 bg-slate-300" />
									<div className="flex items-center gap-1.5"><Building2 className="w-4 h-4" /> {roomsData.length} phòng</div>
								</div>
							</div>

							<div className="bg-slate-50 rounded-xl p-4 border border-slate-100 h-full">
								<div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Người đại diện</div>
								<div className="flex items-center gap-3">
									<div className="w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary font-black shrink-0">
										{building.name.charAt(0)}
									</div>
									<div className="min-w-0">
										<div className="font-bold text-slate-900 text-[15px] truncate">{building.name}</div>
										<div className="text-[13px] text-slate-500 font-medium truncate">SĐT: {building.phone || "Chưa cập nhật"}</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Tabs Navigation */}
				<div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
					<div className="flex overflow-x-auto border-b border-slate-200 hide-scrollbar">
						{TABS.map(tab => (
							<button
								key={tab.id}
								onClick={() => setActiveTab(tab.id)}
								className={`px-5 py-3.5 text-[14px] font-bold whitespace-nowrap border-b-2 transition-colors ${
									activeTab === tab.id ? 'border-brand-primary text-brand-primary' : 'border-transparent text-slate-500 hover:text-slate-800'
								}`}
							>
								{tab.label} {tab.id === 'phong' && <span className="ml-1.5 px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[11px]">{roomsData.length}</span>}
							</button>
						))}
					</div>

					<div className="p-6">
						{/* Tab: Phòng */}
						{activeTab === "phong" && (
							<div className="space-y-4">
								<div className="flex items-center justify-between">
									<div className="relative w-64">
										<Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
										<input type="text" placeholder="Tìm tên phòng" className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-slate-50 focus:bg-white focus:outline-none focus:border-brand-primary transition-colors font-medium" />
									</div>
									<button onClick={() => setIsAddRoomOpen(true)} className="flex items-center gap-1.5 px-4 py-2 bg-brand-primary text-white text-[13px] font-bold rounded-lg hover:bg-brand-dark transition-colors shadow-sm">
										<Plus className="w-4 h-4" /> Thêm phòng
									</button>
								</div>

								{roomsData.length === 0 ? (
									<div className="text-center py-16 px-4 bg-slate-50 rounded-xl border border-dashed border-slate-200">
										<Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
										<p className="text-sm font-bold text-slate-600">Chưa có dữ liệu phòng</p>
										<p className="text-[13px] text-slate-400 mt-1 mb-4">Bạn có thể bấm "Thêm phòng" để bổ sung ngay!</p>
									</div>
								) : (
									<div className="border border-slate-200 rounded-xl overflow-hidden">
										<table className="w-full text-left">
											<thead className="bg-[#f8f9fa] border-b border-slate-200">
												<tr>
													<th className="px-5 py-3 text-[12px] font-bold text-slate-700">Tên phòng</th>
													<th className="px-5 py-3 text-[12px] font-bold text-slate-700 text-center">Tầng</th>
													<th className="px-5 py-3 text-[12px] font-bold text-slate-700">Trạng thái</th>
													<th className="px-5 py-3 text-[12px] font-bold text-slate-700">Giá phòng / tháng</th>
													<th className="px-5 py-3 text-[12px] font-bold text-slate-700 text-right">Khách hàng</th>
													<th className="px-5 py-3 text-[12px] font-bold text-slate-700 text-center">Tùy chọn</th>
												</tr>
											</thead>
											<tbody className="divide-y divide-slate-100">
												{roomsData.map(r => (
													<tr key={r.id} className="hover:bg-slate-50 transition-colors">
														<td className="px-5 py-4 font-bold text-slate-900 text-[14px]">Phòng {r.room_number}</td>
														<td className="px-5 py-4 text-center font-semibold text-slate-600 text-[13px]">{r.floor_name || `Lầu ${r.floor}`}</td>
														<td className="px-5 py-4">
															<span className={`inline-flex px-2 py-1 rounded text-[11px] font-bold ${r.status === 'available' ? 'bg-indigo-50 text-indigo-600' : r.status === 'rented' ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-600'}`}>
																{r.status === 'available' ? 'Trống' : r.status === 'rented' ? 'Đã cho thuê' : r.status}
															</span>
														</td>
														<td className="px-5 py-4 font-semibold text-slate-700 text-[13px]">
															{r.price ? new Intl.NumberFormat('vi-VN').format(r.price) + ' đ' : 'Chưa cập nhật'}
														</td>
														<td className="px-5 py-4 text-right">
															<span className="text-[13px] font-semibold text-brand-primary cursor-pointer hover:underline">Chưa có</span>
														</td>
														<td className="px-5 py-4">
															<div className="flex justify-center gap-2">
																<button className="text-brand-primary p-1.5 hover:bg-brand-primary/10 rounded transition-colors" title="Cấu hình / Ký gửi tin đăng" onClick={() => navigate(`/create-listing?building_id=${building.id}&room_id=${r.id}`)}>
																	<ExternalLink className="w-4 h-4" />
																</button>
															</div>
														</td>
													</tr>
												))}
											</tbody>
										</table>
									</div>
								)}
							</div>
						)}


                        {activeTab === "tang" && (
                            <div className="space-y-4">
                                <div className="border border-slate-200 rounded-xl overflow-hidden mt-4">
                                    <table className="w-full text-left">
                                        <thead className="bg-[#f8f9fa] border-b border-slate-200">
                                            <tr>
                                                <th className="px-5 py-3 text-[12px] font-bold text-slate-700">Tên tầng</th>
                                                <th className="px-5 py-3 text-[12px] font-bold text-slate-700">Mô tả</th>
                                                <th className="px-5 py-3 text-[12px] font-bold text-slate-700 text-center">Số phòng</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {uniqueFloors.length === 0 ? (
                                                <tr><td colSpan={3} className="text-center py-6 text-sm font-medium text-slate-500">Chưa có tầng</td></tr>
                                            ) : uniqueFloors.map((fn, idx) => (
                                                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                                    <td className="px-5 py-4 font-bold text-slate-900 text-[14px]">{fn}</td>
                                                    <td className="px-5 py-4 text-slate-500 text-[13px] font-medium">-</td>
                                                    <td className="px-5 py-4 text-center font-bold text-brand-primary text-[14px]">
                                                        {roomsData.filter(r => (r.floor_name || "Trệt") === fn).length}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

						{/* Tab: Dịch vụ bổ sung */}
						{activeTab === "dich-vu" && (
							<div className="space-y-6">
								<div>
									<div className="flex items-center justify-between mb-4">
										<h3 className="text-base font-bold text-slate-800">Dịch vụ cố định</h3>
										<button onClick={() => openAddServiceModal('fixed')} className="text-brand-primary text-[13px] font-bold hover:underline">+ Thêm dịch vụ</button>
									</div>
									<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
										{building.fixed_services?.map((svc, i) => (
											<div key={i} onClick={() => openEditServiceModal('fixed', i, svc)} className="flex flex-col gap-1.5 p-4 rounded-xl border border-slate-200 bg-white shadow-sm hover:border-brand-primary transition-colors cursor-pointer group">
												<div className="font-bold text-slate-800 text-[14px] flex justify-between items-start">
													{svc.name}
													<Edit2 className="w-3.5 h-3.5 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
												</div>
												<div className="font-semibold text-brand-primary text-[13px]">
													{new Intl.NumberFormat('vi-VN').format(svc.price)} đ <span className="text-slate-400 font-medium">/ {svc.unit}</span>
												</div>
											</div>
										))}
										{(!building.fixed_services || building.fixed_services.length === 0) && (
											<div className="col-span-full py-6 text-center text-sm font-medium text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">Không có dịch vụ cố định</div>
										)}
									</div>
								</div>
								
								<div>
									<div className="flex items-center justify-between mb-4">
										<h3 className="text-base font-bold text-slate-800">Dịch vụ theo đồng hồ</h3>
										<button onClick={() => openAddServiceModal('metered')} className="text-brand-primary text-[13px] font-bold hover:underline">+ Thêm dịch vụ</button>
									</div>
									<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
										{building.metered_services?.map((svc, i) => (
											<div key={i} onClick={() => openEditServiceModal('metered', i, svc)} className="flex flex-col gap-1.5 p-4 rounded-xl border border-slate-200 bg-white shadow-sm hover:border-orange-400 transition-colors cursor-pointer group shadow-orange-100/50">
												<div className="font-bold text-slate-800 text-[14px] flex items-center justify-between">
													<div className="flex items-center gap-2">
														{svc.name.toLowerCase().includes('điện') && <Zap className="w-4 h-4 text-orange-500" />} 
														{svc.name}
													</div>
													<Edit2 className="w-3.5 h-3.5 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
												</div>
												<div className="font-semibold text-orange-600 text-[13px]">
													{new Intl.NumberFormat('vi-VN').format(svc.price)} đ <span className="text-slate-400 font-medium">/ {svc.unit}</span>
												</div>
											</div>
										))}
										{(!building.metered_services || building.metered_services.length === 0) && (
											<div className="col-span-full py-6 text-center text-sm font-medium text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">Không có dịch vụ đồng hồ</div>
										)}
									</div>
								</div>
							</div>
						)}

						{/* Tab: Thông tin thanh toán */}
						{activeTab === "thanh-toan" && (
							<div className="space-y-6">
								<div className="flex items-center justify-between">
									<h3 className="text-base font-bold text-slate-800">Tài khoản nhận thanh toán</h3>
									<button onClick={() => navigate('/transaction-config')} className="text-brand-primary text-[13px] font-bold hover:underline">Quản lý tài khoản</button>
								</div>
								
								{!isBanksLoaded ? (
									<div className="py-20 text-center text-slate-400 font-bold">Đang tải cấu hình...</div>
								) : banks.length === 0 ? (
									<div className="max-w-2xl mx-auto w-full border border-slate-200 rounded-xl p-6 bg-slate-50">
										<h3 className="font-bold text-slate-900 text-lg mb-4 text-center">Chưa cấu hình tài khoản ngân hàng</h3>
										<p className="text-sm text-slate-500 text-center mb-6">Thêm thông tin tài khoản ngân hàng để thuận tiện cho khách thuê thanh toán online qua mã QR</p>
										<div className="flex justify-center">
											<button onClick={() => navigate('/transaction-config')} className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-[13px] font-bold hover:bg-slate-800 transition-colors shadow-sm">
												+ Thêm tài khoản
											</button>
										</div>
									</div>
								) : (
									<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
										{banks.map((bank) => (
											<div key={bank.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm transition-all group relative overflow-hidden">
												<div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-full -mr-10 -mt-10 group-hover:scale-110 transition-transform duration-500" />
												<div className="relative z-10 flex flex-col h-full">
													<div className="flex items-start justify-between mb-4">
														<span className="px-2.5 py-1 bg-blue-50 text-blue-600 rounded-lg text-[11px] font-black uppercase tracking-widest border border-blue-100">{bank.bank_name}</span>
													</div>
													<div className="space-y-4 flex-1">
														<div className="flex flex-col">
															<span className="text-[11px] uppercase font-black text-slate-400 tracking-widest">Số tài khoản</span>
															<span className="text-lg font-black text-slate-900 font-mono tracking-tighter">{bank.account_number}</span>
														</div>
														<div className="flex flex-col">
															<span className="text-[11px] uppercase font-black text-slate-400 tracking-widest">Chủ tài khoản</span>
															<span className="text-[13px] font-black text-slate-700 uppercase">{bank.account_name}</span>
														</div>
													</div>
													<div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
														{bank.is_default ? (
															<span className="text-[13px] text-emerald-600 font-black flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> Mặc định</span>
														) : (
															<span className="text-[12px] text-slate-300 font-bold">Tài khoản phụ</span>
														)}
														<span className="text-[12px] font-bold text-slate-400">{bank.branch}</span>
													</div>
												</div>
											</div>
										))}
									</div>
								)}
							</div>
						)}

						{/* Tab: Chính sách đặt phòng */}
						{activeTab === "chinh-sach" && (
							<div className="space-y-4">
								<textarea 
									placeholder="Nhập chính sách đặt phòng, quy định giữ cọc, hủy cọc..."
									className="w-full h-40 p-4 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:border-brand-primary bg-slate-50 focus:bg-white transition-colors"
								/>
								<button className="px-6 py-2.5 bg-brand-primary text-white rounded-xl text-[13px] font-bold hover:bg-brand-dark transition-colors shadow-sm">
									Lưu thay đổi
								</button>
							</div>
						)}
					</div>
				</div>
			</div>

            {/* Modal: Thêm Phòng Nhanh */}
            <Modal isOpen={isAddRoomOpen} onClose={() => setIsAddRoomOpen(false)} title="Thêm phòng nhanh" size="lg">
                <div className="flex flex-col h-full bg-white max-h-[85vh]">
                    <div className="flex-1 overflow-y-auto p-6 space-y-8">
                        {(uniqueFloors.length > 0 ? uniqueFloors : ["Trệt"]).map((floorName) => (
                            <div key={floorName} className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="h-6 w-1 rounded-full bg-brand-primary" />
                                        <h3 className="text-[16px] font-black text-slate-900">{floorName}</h3>
                                    </div>
                                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{draftRooms.filter(r => r.floor_name === floorName).length} phòng</span>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                                    {draftRooms.filter(r => r.floor_name === floorName).map((room) => (
                                        <div key={room.id} className="relative group">
                                            <input 
                                                type="text" 
                                                value={room.room_number}
                                                readOnly={!room.isNew}
                                                onChange={(e) => {
                                                    if (!room.isNew) return;
                                                    const newDrafts = [...draftRooms];
                                                    const idx = newDrafts.findIndex(r => r.id === room.id);
                                                    if (idx !== -1) {
                                                        newDrafts[idx].room_number = e.target.value;
                                                        setDraftRooms(newDrafts);
                                                    }
                                                }}
                                                className={`w-full px-3 py-3 border border-slate-200 rounded-xl text-center text-sm font-bold text-slate-700 focus:outline-none transition-all shadow-sm ${!room.isNew ? 'bg-slate-50 cursor-default text-slate-500' : 'bg-white hover:border-brand-primary focus:border-brand-primary pr-8'}`}
                                            />
                                            {room.isNew && (
                                                <button 
                                                    onClick={() => setDraftRooms(draftRooms.filter(r => r.id !== room.id))}
                                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all bg-white rounded-full shadow-sm border border-slate-100"
                                                >
                                                    <X className="w-3.5 h-3.5" />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    <button 
                                        type="button"
                                        onClick={() => {
                                            const roomsInThisFloor = draftRooms.filter(r => r.floor_name === floorName);
                                            const lastRoom = roomsInThisFloor[roomsInThisFloor.length - 1];
                                            let nextName = `P${roomsInThisFloor.length + 1}`;
                                            if (lastRoom) {
                                                const match = lastRoom.room_number.match(/\d+/);
                                                if (match) {
                                                    const lastNum = parseInt(match[0], 10);
                                                    nextName = lastRoom.room_number.replace(match[0], (lastNum + 1).toString());
                                                } else {
                                                    nextName = `${lastRoom.room_number} (copy)`;
                                                }
                                            }
                                            setDraftRooms([...draftRooms, { id: `new_${Date.now()}`, room_number: nextName, floor_name: floorName, isNew: true }]);
                                        }}
                                        className="w-full h-full min-h-[46px] border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center text-slate-400 hover:border-brand-primary hover:text-brand-primary transition-colors bg-slate-50/50"
                                    >
                                        <Plus className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="flex gap-3 pt-4 border-t border-slate-100 p-6">
                        <button onClick={() => setIsAddRoomOpen(false)} className="flex-1 py-3.5 text-slate-600 bg-[#f4f6f8] rounded-xl text-[14px] font-bold hover:bg-[#ebedf0] transition-colors" disabled={isSubmittingRooms}>Hủy</button>
                        <button 
                            onClick={handleAddRoomsMulti}
                            disabled={isSubmittingRooms}
                            className="flex-[2] py-3.5 bg-brand-primary text-white rounded-xl text-[14px] font-bold hover:bg-brand-dark transition-all shadow-md active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2"
                        >
                            {isSubmittingRooms && <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>}
                            Xác nhận thêm
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Modal: Cập nhật Tòa Nhà */}
            <Modal isOpen={isEditBuildingOpen} onClose={() => setIsEditBuildingOpen(false)} title="Thông tin tòa nhà">
                <div className="space-y-6 pt-2 pb-1">
                    <div className="relative pt-1">
                        <label className="absolute -top-2 left-4 px-1 bg-white text-[11px] font-bold text-slate-400 z-10">Tên tòa nhà/Cơ sở *</label>
                        <input type="text" value={editBuildingData.name || ''} onChange={e => setEditBuildingData({ ...editBuildingData, name: e.target.value })} className="w-full px-4 py-3.5 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-primary text-sm font-bold text-slate-800 bg-white" />
                    </div>
                    <div className="relative pt-1">
                        <label className="absolute -top-2 left-4 px-1 bg-white text-[11px] font-bold text-slate-400 z-10">Loại hình</label>
                        <select 
                            value={editBuildingData.rental_type || ''} 
                            onChange={e => setEditBuildingData({ ...editBuildingData, rental_type: e.target.value })} 
                            className="w-full px-4 py-3.5 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-primary text-sm font-bold text-slate-800 bg-white appearance-none cursor-pointer"
                        >
                            <option value="">Chọn loại hình</option>
                            <option value="Nhà trọ">Nhà trọ</option>
                            <option value="Căn hộ dịch vụ (CHDV)">Căn hộ dịch vụ (CHDV)</option>
                            <option value="Chung cư">Chung cư</option>
                            <option value="Homestay">Homestay</option>
                            <option value="Ký túc xá">Ký túc xá</option>
                            <option value="Mặt bằng kinh doanh">Mặt bằng kinh doanh</option>
                        </select>
                        <ChevronDown className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none mt-0.5" />
                    </div>
                    <div className="relative pt-1">
                        <label className="absolute -top-2 left-4 px-1 bg-white text-[11px] font-bold text-slate-400 z-10">Địa chỉ *</label>
                        <input type="text" value={editBuildingData.address || ''} onChange={e => setEditBuildingData({ ...editBuildingData, address: e.target.value })} className="w-full px-4 py-3.5 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-primary text-sm font-bold text-slate-800 bg-white" />
                    </div>
                    <div className="relative pt-1">
                        <label className="absolute -top-2 left-4 px-1 bg-white text-[11px] font-bold text-slate-400 z-10">Số điện thoại liên hệ</label>
                        <input type="text" value={editBuildingData.phone || ''} onChange={e => setEditBuildingData({ ...editBuildingData, phone: e.target.value })} className="w-full px-4 py-3.5 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-primary text-sm font-bold text-slate-800 bg-white" />
                    </div>
                    <div className="relative bg-[#f4f6f8] p-4 rounded-xl border border-slate-100">
                        <label className="block text-[13px] font-bold text-slate-700 mb-3">Hình ảnh bìa</label>
                        <div className="flex flex-col gap-3">
							<div className="flex items-center gap-4">
								<label className="cursor-pointer flex-1 flex items-center justify-center gap-2 px-4 py-3.5 bg-brand-primary/10 text-brand-primary text-[14px] font-bold rounded-xl hover:bg-brand-primary/20 transition-all border border-brand-primary/20 hover:border-brand-primary/30 shadow-sm">
									<ImageIcon className="w-5 h-5" />
									{isUploading ? 'Đang tải lên...' : 'Chọn ảnh từ thiết bị'}
									<input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" disabled={isUploading} />
								</label>
								{isUploading && <div className="w-5 h-5 border-2 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin shrink-0" />}
							</div>
                            <div className="relative">
                                <input type="text" value={imageInput} onChange={e => setImageInput(e.target.value)} className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm bg-white focus:border-brand-primary focus:outline-none font-medium text-slate-600 placeholder:text-slate-400" placeholder="Hoặc dán URL ảnh trực tiếp (https://...)" autoComplete="off" />
                            </div>
                        </div>
                        {imageInput && (
                            <div className="mt-4 w-full h-44 rounded-xl border-4 border-white shadow-sm overflow-hidden relative group">
                                <img src={imageInput} alt="Preview" className="w-full h-full object-cover" />
                                <button onClick={() => setImageInput('')} className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 backdrop-blur-sm">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button onClick={() => setIsEditBuildingOpen(false)} className="flex-1 py-3.5 text-slate-600 bg-[#eef1f4] rounded-xl text-[14px] font-bold hover:bg-[#e4e7eb] transition-colors">Hủy</button>
                        <button onClick={handleEditBuilding} className="flex-1 py-3.5 bg-brand-primary text-white rounded-xl text-[14px] font-bold hover:bg-brand-dark transition-all shadow-md active:scale-[0.98]">Lưu thay đổi</button>
                    </div>
                </div>
            </Modal>
            
            {/* Modal: Thêm/Sửa Dịch vụ */}
            <Modal isOpen={isServiceModalOpen} onClose={() => setIsServiceModalOpen(false)} title={editingServiceIndex !== null ? "Sửa dịch vụ" : "Thêm dịch vụ"}>
                <div className="space-y-6 pt-2 pb-1">
                    <div className="relative pt-1">
                        <label className="absolute -top-2 left-4 px-1 bg-white text-[11px] font-bold text-slate-400 z-10">Tên dịch vụ *</label>
                        <input type="text" value={serviceData.name} onChange={e => setServiceData({ ...serviceData, name: e.target.value })} className="w-full px-4 py-3.5 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-primary text-sm font-bold text-slate-800 bg-white" placeholder="VD: Điện, Nước, Wifi..." />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="relative pt-1">
                            <label className="absolute -top-2 left-4 px-1 bg-white text-[11px] font-bold text-slate-400 z-10">Đơn giá *</label>
                            <input type="text" value={servicePriceInput} onChange={e => {
                                const val = e.target.value.replace(/\D/g, '');
                                setServicePriceInput(val ? new Intl.NumberFormat('vi-VN').format(parseInt(val)) : '');
                            }} className="w-full px-4 py-3.5 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-primary text-sm font-bold text-slate-800 bg-white" placeholder="VD: 100,000" />
                        </div>
                        <div className="relative pt-1">
                            <label className="absolute -top-2 left-4 px-1 bg-white text-[11px] font-bold text-slate-400 z-10">Đơn vị *</label>
                            <input type="text" value={serviceData.unit} onChange={e => setServiceData({ ...serviceData, unit: e.target.value })} className="w-full px-4 py-3.5 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-primary text-sm font-bold text-slate-800 bg-white" placeholder="VD: KW, Tháng, Khối..." />
                        </div>
                    </div>
                    {editingServiceIndex !== null && (
                        <div className="flex justify-end pt-2">
                             <button onClick={async () => {
                                 if(!confirm('Chắc chắn muốn xóa dịch vụ này?')) return;
                                 try {
                                     const payload: any = { ...building, fixed_services: building?.fixed_services || [], metered_services: building?.metered_services || [] };
                                     const arr = serviceType === 'fixed' ? [...payload.fixed_services] : [...payload.metered_services];
                                     arr.splice(editingServiceIndex, 1);
                                     if (serviceType === 'fixed') payload.fixed_services = arr;
                                     else payload.metered_services = arr;
                                     await api.put(`/api/buildings/${building!.id}`, payload);
                                     setIsServiceModalOpen(false);
                                     await fetchBuilding();
                                 } catch(e: any) { alert('Lỗi xóa dịch vụ'); }
                             }} className="text-red-500 text-[13px] font-bold hover:underline transition-all">Xóa dịch vụ này</button>
                        </div>
                    )}
                    <div className="flex gap-3 pt-4 border-t border-slate-100">
                        <button onClick={() => setIsServiceModalOpen(false)} className="flex-1 py-3.5 text-slate-600 bg-[#f4f6f8] rounded-xl text-[14px] font-bold hover:bg-[#ebedf0] transition-colors">Hủy</button>
                        <button onClick={handleSaveService} className="flex-1 py-3.5 bg-brand-primary text-white rounded-xl text-[14px] font-bold hover:bg-brand-dark transition-all shadow-md active:scale-[0.98]">Lưu thay đổi</button>
                    </div>
                </div>
            </Modal>
		</div>
	);
}

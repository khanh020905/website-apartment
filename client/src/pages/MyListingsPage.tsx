import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Home, MapPin, Plus, Search } from "lucide-react";
import Modal from "../components/modals/Modal";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../lib/api";
import type { BuildingWithRooms, Listing, ListingStatus, Room } from "../../../shared/types";

interface ListingWithReviews extends Listing {
	listing_reviews?: {
		action: "approved" | "rejected";
		notes: string | null;
		reviewed_at: string;
	}[];
}

interface AddRoomState {
	building: BuildingWithRooms;
	targetStatus: "available" | "reserved";
}

interface ListingFlowNavigationState {
	openPostRoomPicker?: boolean;
	notice?: string;
}

const LISTING_STATUS_LABELS: Record<ListingStatus, string> = {
	draft: "Bản nháp",
	pending: "Chờ duyệt",
	approved: "Đã duyệt",
	rejected: "Từ chối",
};

const LISTING_STATUS_CLASS: Record<ListingStatus, string> = {
	draft: "bg-slate-100 text-slate-700",
	pending: "bg-brand-bg text-brand-primary",
	approved: "bg-emerald-100 text-emerald-700",
	rejected: "bg-rose-100 text-rose-700",
};

const formatCurrency = (value: number) =>
	value.toLocaleString("vi-VN", { maximumFractionDigits: 0 });

export default function MyListingsPage() {
	const navigate = useNavigate();
	const location = useLocation();
	const [searchParams] = useSearchParams();
	const { canPost, role, user } = useAuth();

	const [loading, setLoading] = useState(true);
	const [buildings, setBuildings] = useState<BuildingWithRooms[]>([]);
	const [listings, setListings] = useState<ListingWithReviews[]>([]);
	const [search, setSearch] = useState("");
	const [statusFilter, setStatusFilter] = useState<"all" | ListingStatus>("all");
	const [notice, setNotice] = useState("");
	const [error, setError] = useState("");
	const [savingListingId, setSavingListingId] = useState<string | null>(null);

	const [postRoomPickerOpen, setPostRoomPickerOpen] = useState(false);
	const [addRoomState, setAddRoomState] = useState<AddRoomState | null>(null);
	const [newRoomCode, setNewRoomCode] = useState("");
	const [selectedFloor, setSelectedFloor] = useState("");
	const [customFloor, setCustomFloor] = useState("");
	const [useCustomFloor, setUseCustomFloor] = useState(false);
	const [availableFrom, setAvailableFrom] = useState("");
	const [savingRoom, setSavingRoom] = useState(false);

	const fetchData = async () => {
		setLoading(true);
		const [buildingsRes, listingsRes] = await Promise.all([
			api.get<{ buildings: BuildingWithRooms[] }>("/api/buildings"),
			api.get<{ listings: ListingWithReviews[] }>("/api/listings/my"),
		]);

		if (buildingsRes.data?.buildings) setBuildings(buildingsRes.data.buildings);
		if (listingsRes.data?.listings) setListings(listingsRes.data.listings);
		setLoading(false);
	};

	useEffect(() => {
		fetchData();
	}, []);

	useEffect(() => {
		const navState = location.state as ListingFlowNavigationState | null;
		if (!navState) return;
		if (navState.notice) setNotice(navState.notice);
		if (navState.openPostRoomPicker) setPostRoomPickerOpen(true);
		navigate(location.pathname, { replace: true, state: null });
	}, [location.pathname, location.state, navigate]);

	useEffect(() => {
		if (searchParams.get("action") !== "create") return;
		setPostRoomPickerOpen(true);
		navigate(location.pathname, { replace: true });
	}, [location.pathname, navigate, searchParams]);

	const roomMetaById = useMemo(() => {
		const map = new Map<string, { room: Room; building: BuildingWithRooms }>();
		for (const building of buildings) {
			for (const room of building.rooms || []) {
				map.set(room.id, { room, building });
			}
		}
		return map;
	}, [buildings]);

	const listingByRoomId = useMemo(() => {
		const map = new Map<string, ListingWithReviews>();
		for (const listing of listings) {
			if (listing.room_id && !map.has(listing.room_id)) {
				map.set(listing.room_id, listing);
			}
		}
		return map;
	}, [listings]);

	const filteredListings = useMemo(() => {
		const keyword = search.trim().toLowerCase();
		return listings.filter((listing) => {
			if (statusFilter !== "all" && listing.status !== statusFilter) return false;
			if (!keyword) return true;

			const roomMeta = listing.room_id ? roomMetaById.get(listing.room_id) : null;
			const roomText = roomMeta ? `${roomMeta.room.room_number} ${roomMeta.building.name}`.toLowerCase() : "";
			return (
				listing.title.toLowerCase().includes(keyword) ||
				(listing.address || "").toLowerCase().includes(keyword) ||
				roomText.includes(keyword)
			);
		});
	}, [listings, roomMetaById, search, statusFilter]);

	const listingStats = useMemo(() => {
		return {
			total: listings.length,
			pending: listings.filter((item) => item.status === "pending").length,
			approved: listings.filter((item) => item.status === "approved").length,
			draft: listings.filter((item) => item.status === "draft").length,
		};
	}, [listings]);

	const openAddRoom = (building: BuildingWithRooms, targetStatus: "available" | "reserved") => {
		const floors = Array.from(new Set((building.rooms || []).map((room) => room.floor || 1))).sort(
			(a, b) => a - b,
		);
		setAddRoomState({ building, targetStatus });
		setNewRoomCode("");
		setUseCustomFloor(false);
		setSelectedFloor(floors[0] ? String(floors[0]) : "1");
		setCustomFloor("");
		setAvailableFrom("");
		setError("");
	};

	const handleCreateRoom = async () => {
		if (!addRoomState) return;

		const roomCode = newRoomCode.trim();
		const floorValue = useCustomFloor ? customFloor : selectedFloor;
		const floor = Number(floorValue);
		if (!roomCode) {
			setError("Vui lòng nhập mã phòng");
			return;
		}
		if (!Number.isFinite(floor) || floor <= 0) {
			setError("Vui lòng chọn tầng hợp lệ");
			return;
		}
		if (addRoomState.targetStatus === "reserved" && !availableFrom) {
			setError("Phòng sắp trống cần ngày trống dự kiến");
			return;
		}

		setSavingRoom(true);
		setError("");
		const { error: createError } = await api.post("/api/rooms", {
			building_id: addRoomState.building.id,
			room_number: roomCode,
			floor,
			status: addRoomState.targetStatus,
			available_from: addRoomState.targetStatus === "reserved" ? availableFrom : null,
			max_occupants: 1,
			current_occupants: 0,
			amenity_ids: [],
			images: [],
		});
		setSavingRoom(false);

		if (createError) {
			setError(createError);
			return;
		}

		setAddRoomState(null);
		setNotice("Đã thêm mã phòng thành công");
		await fetchData();
		setPostRoomPickerOpen(true);
	};

	const navigateToCreateListing = (options: {
		buildingId?: string;
		roomId?: string;
		listingId?: string;
	}) => {
		const params = new URLSearchParams();
		if (options.buildingId) params.set("building_id", options.buildingId);
		if (options.roomId) params.set("room_id", options.roomId);
		if (options.listingId) params.set("listing_id", options.listingId);
		navigate(`/create-listing?${params.toString()}`);
	};

	const handleListingStatusChange = async (listing: ListingWithReviews, status: "draft" | "pending") => {
		setSavingListingId(listing.id);
		setError("");
		const { error: statusError } = await api.put(`/api/listings/${listing.id}/status`, { status });
		setSavingListingId(null);

		if (statusError) {
			setError(statusError);
			return;
		}

		setNotice(status === "pending" ? "Đã gửi tin cho admin duyệt" : "Đã ẩn tin về bản nháp");
		await fetchData();
	};

	const getPostableRooms = (building: BuildingWithRooms) =>
		(building.rooms || []).filter((room) => room.status === "available" || room.status === "reserved");

	if (!canPost) {
		return (
			<div className="flex-1 overflow-y-auto bg-slate-50">
				<div className="max-w-3xl mx-auto p-6">
					<div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8">
						<h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-2">Tin đã đăng</h1>
						<p className="text-slate-500 mb-6">Để đăng và quản lý tin, bạn cần mua gói Chủ trọ/Môi giới.</p>
						<div className="flex flex-wrap gap-3">
							<button
								onClick={() => navigate(user && role === "user" ? "/pricing" : "/register")}
								className="px-5 py-2.5 bg-brand-primary text-white rounded-xl font-semibold cursor-pointer hover:bg-brand-dark transition-colors"
							>
								Mua ngay
							</button>
							<Link
								to="/"
								className="px-5 py-2.5 border border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-colors"
							>
								Xem danh sách phòng
							</Link>
						</div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="flex-1 flex flex-col h-full bg-[#f8f9fa] overflow-hidden">
			<div className="bg-white border-b border-slate-200">
				<div className="px-6 py-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
					<div>
						<h1 className="text-[20px] font-bold text-slate-900 tracking-tight">Tin đã đăng</h1>
						<p className="text-sm text-slate-500 mt-1">Quản lý toàn bộ tin đã/đang hiển thị của bạn</p>
					</div>
					<button
						onClick={() => setPostRoomPickerOpen(true)}
						className="flex items-center gap-2 px-5 py-2.5 bg-brand-primary text-white rounded-lg text-sm font-bold transition-colors hover:bg-brand-dark shadow-sm cursor-pointer"
					>
						<Plus className="w-4.5 h-4.5" />
						Tạo tin mới
					</button>
				</div>

				<div className="px-6 pb-4 grid gap-3 lg:grid-cols-[1fr_220px_auto] items-center">
					<div className="relative">
						<Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
						<input
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							placeholder="Tìm theo tiêu đề, mã phòng, tòa nhà..."
							className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-700 bg-white focus:outline-none focus:border-brand-primary hover:border-slate-300 transition-all"
						/>
					</div>
					<select
						value={statusFilter}
						onChange={(e) => setStatusFilter(e.target.value as "all" | ListingStatus)}
						className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-600 bg-white focus:outline-none focus:border-brand-primary hover:border-slate-300 transition-all cursor-pointer"
					>
						<option value="all">Tất cả trạng thái</option>
						<option value="draft">Bản nháp</option>
						<option value="pending">Chờ duyệt</option>
						<option value="approved">Đã duyệt</option>
						<option value="rejected">Từ chối</option>
					</select>
					<div className="hidden lg:flex items-center gap-2 text-xs font-bold text-slate-600">
						<span className="px-2.5 py-2 rounded-lg bg-slate-100">Tổng: {listingStats.total}</span>
						<span className="px-2.5 py-2 rounded-lg bg-brand-bg text-brand-primary">
							Chờ: {listingStats.pending}
						</span>
						<span className="px-2.5 py-2 rounded-lg bg-emerald-100 text-emerald-700">
							Duyệt: {listingStats.approved}
						</span>
						<span className="px-2.5 py-2 rounded-lg bg-slate-100 text-slate-700">
							Nháp: {listingStats.draft}
						</span>
					</div>
				</div>
				{notice && <p className="px-6 pb-2 text-emerald-600 text-sm font-semibold">{notice}</p>}
				{error && <p className="px-6 pb-2 text-rose-600 text-sm font-semibold">{error}</p>}
			</div>

			<div className="flex-1 overflow-y-auto p-4 md:p-6">
				{loading ?
					<div className="bg-white rounded-2xl border border-slate-200 p-10 text-center text-slate-400 font-semibold">
						Đang tải dữ liệu...
					</div>
				: filteredListings.length === 0 ?
					<div className="bg-white rounded-2xl border border-slate-200 p-10 text-center">
						<p className="text-slate-500 font-semibold">Chưa có tin đăng phù hợp bộ lọc.</p>
						<button
							onClick={() => setPostRoomPickerOpen(true)}
							className="mt-4 h-10 px-5 rounded-lg bg-brand-primary text-white text-sm font-bold hover:bg-brand-dark transition-colors cursor-pointer"
						>
							Tạo tin mới
						</button>
					</div>
				:	<div className="grid xl:grid-cols-2 gap-4">
						{filteredListings.map((listing) => {
							const roomMeta = listing.room_id ? roomMetaById.get(listing.room_id) : null;
							const rejectedNote =
								listing.status === "rejected" ? listing.listing_reviews?.[0]?.notes || null : null;

							return (
								<div
									key={listing.id}
									className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 hover:shadow-md transition-all"
								>
									<div className="grid grid-cols-[112px_minmax(0,1fr)] gap-4">
										<Link to={`/listings/${listing.id}`} className="w-full h-26 rounded-xl bg-slate-100 overflow-hidden flex items-center justify-center text-slate-400 hover:opacity-80 transition-opacity">
											{listing.images?.[0]?.url ?
												<img
													src={listing.images[0].url}
													alt={listing.title}
													className="w-full h-full object-cover"
												/>
											:	<Home className="w-7 h-7" />}
										</Link>
										<div>
											<Link to={`/listings/${listing.id}`} className="text-lg font-bold text-slate-900 line-clamp-2 leading-tight hover:text-brand-primary transition-colors">
												{listing.title}
											</Link>
											<div className="mt-1.5 flex flex-wrap items-center gap-2">
												<span
													className={`px-2.5 py-1 rounded-lg text-[11px] font-black ${LISTING_STATUS_CLASS[listing.status]}`}
												>
													{LISTING_STATUS_LABELS[listing.status]}
												</span>
												{roomMeta && (
													<span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-100 text-slate-700">
														{roomMeta.building.name} - {roomMeta.room.room_number}
													</span>
												)}
											</div>
											<p className="mt-2 text-base font-black text-brand-primary">
												{formatCurrency(listing.price)} VNĐ/tháng
											</p>
											<p className="text-xs text-slate-500">
												Cập nhật: {new Date(listing.updated_at).toLocaleDateString("vi-VN")}
											</p>
											{listing.address && (
												<p className="mt-1 text-xs text-slate-500 flex items-center gap-1">
													<MapPin className="w-3.5 h-3.5" /> {listing.address}
												</p>
											)}
										</div>
									</div>

									{rejectedNote && (
										<div className="mt-3 p-3 rounded-xl border border-rose-200 bg-rose-50 text-sm text-rose-700">
											<p className="font-bold">Lý do từ chối</p>
											<p className="mt-1">{rejectedNote}</p>
										</div>
									)}

									<div className="mt-4 flex flex-wrap gap-2">
										<button
											onClick={() =>
												navigateToCreateListing({
													buildingId: roomMeta?.building.id,
													roomId: roomMeta?.room.id,
													listingId: listing.id,
												})
											}
											className="h-10 px-4 rounded-lg border border-slate-300 bg-white text-slate-700 text-sm font-bold cursor-pointer hover:bg-slate-50"
										>
											Sửa tin
										</button>
										{(listing.status === "draft" || listing.status === "rejected") && (
											<button
												onClick={() => handleListingStatusChange(listing, "pending")}
												disabled={savingListingId === listing.id}
												className="h-10 px-4 rounded-lg bg-brand-primary text-white text-sm font-bold disabled:opacity-50 cursor-pointer hover:bg-brand-dark"
											>
												Gửi admin duyệt
											</button>
										)}
										{listing.status !== "draft" && (
											<button
												onClick={() => handleListingStatusChange(listing, "draft")}
												disabled={savingListingId === listing.id}
												className="h-10 px-4 rounded-lg bg-slate-100 text-slate-700 text-sm font-bold disabled:opacity-50 cursor-pointer hover:bg-slate-200"
											>
												Ẩn tin
											</button>
										)}
									</div>
								</div>
							);
						})}
					</div>
				}
			</div>

			<Modal
				isOpen={postRoomPickerOpen}
				onClose={() => setPostRoomPickerOpen(false)}
				title="Chọn phòng để tạo tin"
				size="xl"
			>
				<div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
					{buildings.map((building) => {
						const rooms = getPostableRooms(building);
						return (
							<div key={building.id} className="rounded-2xl border border-slate-200 p-4">
								<div className="flex items-center justify-between gap-3">
									<div>
										<p className="text-lg font-black text-slate-900">{building.name}</p>
										<p className="text-xs text-slate-500">{building.address || "Chưa có địa chỉ"}</p>
									</div>
									<button
										onClick={() => openAddRoom(building, "available")}
										className="h-10 px-4 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 font-bold cursor-pointer"
									>
										Tạo mã phòng
									</button>
								</div>

								<div className="mt-3 flex flex-wrap gap-2">
									{rooms.map((room) => {
										const existingListing = listingByRoomId.get(room.id);
										return (
											<button
												key={room.id}
												onClick={() => {
													setPostRoomPickerOpen(false);
													navigateToCreateListing({
														buildingId: building.id,
														roomId: room.id,
														listingId: existingListing?.id,
													});
												}}
												className={`px-4 py-2 rounded-xl border font-black cursor-pointer ${
													existingListing ?
														"border-brand-primary/40 bg-brand-bg text-brand-primary"
													: room.status === "reserved" ?
														"border-brand-light bg-brand-bg text-brand-primary"
													:	"border-slate-300 bg-slate-50 text-slate-800"
												}`}
											>
												{room.room_number}
											</button>
										);
									})}
									{rooms.length === 0 && (
										<p className="text-sm font-semibold text-rose-500">
											Nhà chưa có mã phòng. Hãy tạo mã phòng trước khi đăng tin.
										</p>
									)}
								</div>
							</div>
						);
					})}
				</div>
			</Modal>

			<Modal
				isOpen={!!addRoomState}
				onClose={() => setAddRoomState(null)}
				title="Thêm mã phòng"
				size="md"
			>
				<div className="space-y-4">
					<div className="grid gap-3 sm:grid-cols-[1fr_auto]">
						<input
							value={newRoomCode}
							onChange={(e) => setNewRoomCode(e.target.value)}
							placeholder="Nhập mã phòng (VD: P100)"
							className="h-13 rounded-xl border border-slate-300 px-4 text-lg font-semibold"
						/>
						<button
							onClick={() => setUseCustomFloor((prev) => !prev)}
							className="h-13 px-4 rounded-xl bg-slate-100 font-semibold cursor-pointer"
						>
							{useCustomFloor ? "Chọn tầng có sẵn" : "Tầng khác"}
						</button>
					</div>

					{useCustomFloor ?
						<input
							value={customFloor}
							onChange={(e) => setCustomFloor(e.target.value)}
							placeholder="Nhập mã tầng"
							className="h-13 rounded-xl border border-brand-primary/50 px-4 text-lg font-semibold"
						/>
					:	<div className="flex flex-wrap gap-2">
							{Array.from(new Set((addRoomState?.building.rooms || []).map((room) => room.floor || 1)))
								.sort((a, b) => a - b)
								.map((floor) => (
									<button
										key={floor}
										onClick={() => setSelectedFloor(String(floor))}
										className={`px-4 py-2 rounded-xl border font-bold cursor-pointer ${
											selectedFloor === String(floor) ?
												"bg-brand-primary text-white border-brand-primary"
											:	"bg-slate-50 border-slate-300 text-slate-700"
										}`}
									>
										Tầng {floor}
									</button>
								))}
						</div>
					}

					{addRoomState?.targetStatus === "reserved" && (
						<div>
							<label className="text-sm font-semibold text-slate-600">Ngày trống dự kiến</label>
							<input
								type="date"
								value={availableFrom}
								onChange={(e) => setAvailableFrom(e.target.value)}
								className="mt-1 h-13 w-full rounded-xl border border-slate-300 px-4 font-semibold"
							/>
						</div>
					)}

					<div className="flex justify-between items-center pt-2">
						<div>
							<p className="text-sm text-brand-primary font-semibold">Đang chọn</p>
							<p className="text-3xl font-black text-slate-900">
								{newRoomCode || "Mã phòng"} - {useCustomFloor ? customFloor || "?" : selectedFloor || "?"}
							</p>
						</div>
						<button
							onClick={handleCreateRoom}
							disabled={savingRoom}
							className="h-13 px-6 rounded-xl bg-brand-primary text-white text-lg font-bold disabled:opacity-60 cursor-pointer hover:bg-brand-dark"
						>
							Xác nhận
						</button>
					</div>
				</div>
			</Modal>
		</div>
	);
}

